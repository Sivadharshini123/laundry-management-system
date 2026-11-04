import { pool } from '../db/index.js';
import { createRazorpayOrder, issueRazorpayRefund } from './paymentService.js';
import { createNotification } from './notificationService.js';
import { logAudit } from './auditService.js';
import { emitToLaundry, emitToStaff } from '../socket/socketHandler.js';

// Helper to cleanup expired holds
export async function cleanupExpiredHolds() {
  const client = await pool.connect();
  try {
    const expiredRes = await client.query(`
      SELECT b.id, b.student_id, b.machine_id, b.slot_start, m.laundry_id
      FROM bookings b
      JOIN machines m ON b.machine_id = m.id
      WHERE b.status = 'pending_payment' AND b.hold_expires_at <= NOW()
    `);

    for (const row of expiredRes.rows) {
      await client.query(`
        UPDATE bookings
        SET status = 'expired', updated_at = NOW()
        WHERE id = $1 AND status = 'pending_payment'
      `, [row.id]);

      emitToLaundry(row.laundry_id, 'slot:released', {
        machineId: row.machine_id,
        slotStart: row.slot_start
      });

      // Offer released slot to waiting list
      await checkAndOfferWaitingList(row.machine_id, row.slot_start, client);
    }
    return expiredRes.rows.length;
  } finally {
    client.release();
  }
}

// 1. Reserve a slot (creates pending_payment with 5-minute hold)
export async function reserveSlot({ studentId, machineId, slotStart, slotEnd }) {
  // Always run hold cleanup first
  await cleanupExpiredHolds();

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Fetch machine details and current price from database (rule 11)
    const machineRes = await client.query(`
      SELECT m.*, s.state as current_state, s.last_seen
      FROM machines m
      LEFT JOIN machine_state s ON m.id = s.machine_id
      WHERE m.id = $1 AND m.active = true AND m.out_of_service = false
    `, [machineId]);

    if (machineRes.rows.length === 0) {
      const err = new Error('Machine not found, inactive, or out of service');
      err.statusCode = 404;
      throw err;
    }

    const machine = machineRes.rows[0];

    // Check if machine heartbeat is stale (>90s)
    const isStale = machine.last_seen && (Date.now() - new Date(machine.last_seen).getTime() > 90000);
    if (isStale || machine.current_state === 'offline') {
      const err = new Error('Machine status is currently unknown or offline; reservations are unavailable');
      err.statusCode = 400;
      throw err;
    }

    // Amount snapshot in paise
    const amountPaise = machine.price_paise;
    const holdExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    let booking;
    try {
      const insertRes = await client.query(`
        INSERT INTO bookings (student_id, machine_id, slot_start, slot_end, hold_expires_at, amount_paise, status)
        VALUES ($1, $2, $3, $4, $5, $6, 'pending_payment')
        RETURNING *
      `, [studentId, machineId, slotStart, slotEnd, holdExpiresAt, amountPaise]);

      booking = insertRes.rows[0];
    } catch (dbErr) {
      // Catch PostgreSQL EXCLUDE constraint error (SQLSTATE 23P01)
      if (dbErr.code === '23P01') {
        const err = new Error('This slot was just taken.');
        err.statusCode = 409;
        throw err;
      }
      throw dbErr;
    }

    // Create Razorpay order
    const order = await createRazorpayOrder({
      bookingId: booking.id,
      amountPaise
    });

    // Update booking with razorpay_order_id
    const updatedRes = await client.query(`
      UPDATE bookings
      SET razorpay_order_id = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `, [order.orderId, booking.id]);

    await client.query('COMMIT');

    // Notify laundry room that slot is now reserved
    emitToLaundry(machine.laundry_id, 'slot:reserved', {
      machineId,
      slotStart,
      slotEnd,
      holdExpiresAt
    });

    return {
      booking: updatedRes.rows[0],
      order
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// 3. Confirm captured payment (Idempotent update)
export async function confirmCapturedPayment({ razorpayOrderId, razorpayPaymentId, rawWebhookId, amountPaise }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Idempotent search for pending_payment booking
    const bookingRes = await client.query(`
      SELECT b.*, m.laundry_id
      FROM bookings b
      JOIN machines m ON b.machine_id = m.id
      WHERE b.razorpay_order_id = $1
    `, [razorpayOrderId]);

    if (bookingRes.rows.length === 0) {
      // Payment without valid booking (Rule 8): refund immediately
      await client.query('ROLLBACK');
      console.warn(`Payment captured without booking for order ${razorpayOrderId}. Issuing full refund.`);
      const refundResult = await issueRazorpayRefund({
        razorpayPaymentId,
        amountPaise,
        reasonCode: 'PAYMENT_WITHOUT_BOOKING',
        bookingId: null
      });

      await pool.query(`
        INSERT INTO payments (razorpay_order_id, razorpay_payment_id, amount_paise, status, raw_webhook_id)
        VALUES ($1, $2, $3, 'refunded', $4)
      `, [razorpayOrderId, razorpayPaymentId, amountPaise, rawWebhookId]);

      await pool.query(`
        INSERT INTO refunds (booking_id, payment_id, amount_paise, reason_code, razorpay_refund_id, status)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [null, null, amountPaise, 'PAYMENT_WITHOUT_BOOKING', refundResult.refundId, 'processed']);

      await logAudit({
        actorId: null,
        action: 'AUTO_REFUND_ORPHANED_PAYMENT',
        entity: 'payments',
        details: { razorpayOrderId, razorpayPaymentId, reason: 'PAYMENT_WITHOUT_BOOKING' }
      });
      return { success: false, refunded: true, reason: 'PAYMENT_WITHOUT_BOOKING' };
    }

    const booking = bookingRes.rows[0];

    // Check if already paid (idempotency check)
    if (booking.status === 'paid') {
      await client.query('COMMIT');
      return { success: true, booking, duplicate: true };
    }

    // Check if booking was expired or cancelled while payment was processing
    if (booking.status !== 'pending_payment') {
      await client.query('ROLLBACK');
      console.warn(`Captured payment for non-pending booking #${booking.id} (status: ${booking.status}). Refunding.`);
      const refundResult = await issueRazorpayRefund({
        razorpayPaymentId,
        amountPaise: booking.amount_paise,
        reasonCode: 'SLOT_TAKEN',
        bookingId: booking.id
      });

      await pool.query(`
        INSERT INTO payments (booking_id, razorpay_order_id, razorpay_payment_id, amount_paise, status, raw_webhook_id)
        VALUES ($1, $2, $3, $4, 'refunded', $5)
      `, [booking.id, razorpayOrderId, razorpayPaymentId, booking.amount_paise, rawWebhookId]);

      await pool.query(`
        INSERT INTO refunds (booking_id, payment_id, amount_paise, reason_code, razorpay_refund_id, status)
        VALUES ($1, NULL, $2, $3, $4, $5)
      `, [booking.id, booking.amount_paise, 'SLOT_TAKEN', refundResult.refundId, 'processed']);

      await createNotification(
        booking.student_id,
        'booking:refunded',
        `Your payment for booking #${booking.id} was refunded because the 5-minute reservation window expired.`
      );
      return { success: false, refunded: true, reason: 'BOOKING_EXPIRED' };
    }

    // Rule 3: Idempotent UPDATE where status = 'pending_payment'
    const updateRes = await client.query(`
      UPDATE bookings
      SET status = 'paid', razorpay_payment_id = $1, updated_at = NOW()
      WHERE id = $2 AND status = 'pending_payment'
      RETURNING *
    `, [razorpayPaymentId, booking.id]);

    if (updateRes.rows.length === 0) {
      await client.query('COMMIT');
      return { success: true, duplicate: true };
    }

    const confirmedBooking = updateRes.rows[0];

    // Insert payment record
    const paymentRes = await client.query(`
      INSERT INTO payments (booking_id, razorpay_order_id, razorpay_payment_id, amount_paise, status, raw_webhook_id)
      VALUES ($1, $2, $3, $4, 'captured', $5)
      RETURNING *
    `, [booking.id, razorpayOrderId, razorpayPaymentId, booking.amount_paise, rawWebhookId]);

    await client.query('COMMIT');

    // Send in-app notification
    await createNotification(
      confirmedBooking.student_id,
      'booking:paid',
      `Booking confirmed for machine #${confirmedBooking.machine_id}. Slot starts at ${new Date(confirmedBooking.slot_start).toLocaleTimeString()}.`
    );

    emitToLaundry(booking.laundry_id, 'slot:booked', {
      machineId: confirmedBooking.machine_id,
      slotStart: confirmedBooking.slot_start,
      slotEnd: confirmedBooking.slot_end
    });

    return { success: true, booking: confirmedBooking, payment: paymentRes.rows[0] };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// 6. Student cancellation (Full refund, immediate slot release)
export async function cancelBooking(bookingId, studentId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const res = await client.query(`
      SELECT b.*, m.laundry_id, p.id as payment_id, p.razorpay_payment_id
      FROM bookings b
      JOIN machines m ON b.machine_id = m.id
      LEFT JOIN payments p ON b.id = p.booking_id
      WHERE b.id = $1 AND b.student_id = $2
    `, [bookingId, studentId]);

    if (res.rows.length === 0) {
      const err = new Error('Booking not found');
      err.statusCode = 404;
      throw err;
    }

    const booking = res.rows[0];

    // Rule 6: A student may cancel a booking that has not started
    if (new Date(booking.slot_start) <= new Date()) {
      const err = new Error('Cannot cancel a booking that has already started');
      err.statusCode = 400;
      throw err;
    }

    if (booking.status !== 'paid' && booking.status !== 'pending_payment') {
      const err = new Error(`Cannot cancel booking with status '${booking.status}'`);
      err.statusCode = 400;
      throw err;
    }

    let refundId = null;

    // If paid, issue full automatic refund through Razorpay
    if (booking.status === 'paid' && booking.razorpay_payment_id) {
      const refundResult = await issueRazorpayRefund({
        razorpayPaymentId: booking.razorpay_payment_id,
        amountPaise: booking.amount_paise,
        reasonCode: 'STUDENT_CANCELLED',
        bookingId: booking.id
      });

      refundId = refundResult.refundId;

      await client.query(`
        INSERT INTO refunds (booking_id, payment_id, amount_paise, reason_code, razorpay_refund_id, status)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [booking.id, booking.payment_id, booking.amount_paise, 'STUDENT_CANCELLED', refundId, 'processed']);
    }

    // Update booking status to cancelled
    const updateRes = await client.query(`
      UPDATE bookings
      SET status = 'cancelled', razorpay_refund_id = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `, [refundId, booking.id]);

    await client.query('COMMIT');

    // Notify student
    await createNotification(
      studentId,
      'booking:cancelled',
      `Booking #${booking.id} was successfully cancelled. A full refund of ₹${(booking.amount_paise / 100).toFixed(2)} has been issued.`
    );

    // Notify laundry
    emitToLaundry(booking.laundry_id, 'slot:released', {
      machineId: booking.machine_id,
      slotStart: booking.slot_start
    });

    // Rule 7: Offer to waiting list
    await checkAndOfferWaitingList(booking.machine_id, booking.slot_start);

    return updateRes.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// 5. Fail booking and issue full refund (e.g. grace period expired)
export async function failAndRefundBooking(bookingId, reasonCode = 'MACHINE_NOT_STARTED') {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const res = await client.query(`
      SELECT b.*, m.laundry_id, p.id as payment_id, p.razorpay_payment_id
      FROM bookings b
      JOIN machines m ON b.machine_id = m.id
      LEFT JOIN payments p ON b.id = p.booking_id
      WHERE b.id = $1 AND b.status = 'paid'
    `, [bookingId]);

    if (res.rows.length === 0) {
      await client.query('ROLLBACK');
      return null;
    }

    const booking = res.rows[0];

    // Issue full refund through Razorpay
    const refundResult = await issueRazorpayRefund({
      razorpayPaymentId: booking.razorpay_payment_id,
      amountPaise: booking.amount_paise,
      reasonCode,
      bookingId: booking.id
    });

    await client.query(`
      INSERT INTO refunds (booking_id, payment_id, amount_paise, reason_code, razorpay_refund_id, status)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [booking.id, booking.payment_id, booking.amount_paise, reasonCode, refundResult.refundId, 'processed']);

    const updatedBooking = await client.query(`
      UPDATE bookings
      SET status = 'failed', razorpay_refund_id = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `, [refundResult.refundId, booking.id]);

    await client.query('COMMIT');

    await createNotification(
      booking.student_id,
      'booking:failed',
      `Booking #${booking.id} was marked as failed because the machine did not start within the 5-minute grace period. A full refund of ₹${(booking.amount_paise / 100).toFixed(2)} has been issued.`
    );

    emitToLaundry(booking.laundry_id, 'slot:released', {
      machineId: booking.machine_id,
      slotStart: booking.slot_start
    });

    emitToStaff('booking:failed', {
      bookingId: booking.id,
      machineId: booking.machine_id,
      reason: reasonCode
    });

    // Offer released slot to waiting list
    await checkAndOfferWaitingList(booking.machine_id, booking.slot_start);

    return updatedBooking.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`Error failing booking #${bookingId}:`, err);
    throw err;
  } finally {
    client.release();
  }
}

// 7. Waiting list management
export async function addToWaitingList({ studentId, machineId, slotStart }) {
  const res = await pool.query(`
    INSERT INTO waiting_list (student_id, machine_id, slot_start, status)
    VALUES ($1, $2, $3, 'waiting')
    RETURNING *
  `, [studentId, machineId, slotStart]);
  return res.rows[0];
}

export async function checkAndOfferWaitingList(machineId, slotStart, dbClient = null) {
  const runner = dbClient || pool;
  try {
    // Expire any past offers
    await runner.query(`
      UPDATE waiting_list
      SET status = 'expired'
      WHERE machine_id = $1 AND slot_start = $2 AND status = 'offered' AND offer_expires_at <= NOW()
    `, [machineId, slotStart]);

    // Check if an offer is currently active
    const activeOffer = await runner.query(`
      SELECT * FROM waiting_list
      WHERE machine_id = $1 AND slot_start = $2 AND status = 'offered' AND offer_expires_at > NOW()
    `, [machineId, slotStart]);

    if (activeOffer.rows.length > 0) {
      return activeOffer.rows[0];
    }

    // Get next student in queue
    const nextWait = await runner.query(`
      SELECT * FROM waiting_list
      WHERE machine_id = $1 AND slot_start = $2 AND status = 'waiting'
      ORDER BY id ASC
      LIMIT 1
    `, [machineId, slotStart]);

    if (nextWait.rows.length === 0) {
      return null;
    }

    const item = nextWait.rows[0];
    const offerExpiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes

    const updated = await runner.query(`
      UPDATE waiting_list
      SET status = 'offered', offered_at = NOW(), offer_expires_at = $1
      WHERE id = $2
      RETURNING *
    `, [offerExpiresAt, item.id]);

    await createNotification(
      item.student_id,
      'waiting_list:offer',
      `A slot on machine #${machineId} starting at ${new Date(slotStart).toLocaleTimeString()} is now available! You have 3 minutes to claim it.`
    );

    return updated.rows[0];
  } catch (err) {
    console.error('Error in waiting list dispatch:', err);
    return null;
  }
}
