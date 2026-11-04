import express from 'express';
import { z } from 'zod';
import { pool } from '../db/index.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { reserveSlot, cancelBooking, addToWaitingList } from '../services/bookingService.js';
import { config } from '../config.js';

const router = express.Router();

const reserveSchema = z.object({
  machine_id: z.number().int().positive(),
  slot_start: z.string().datetime(),
  slot_end: z.string().datetime(),
});

const waitingListSchema = z.object({
  machine_id: z.number().int().positive(),
  slot_start: z.string().datetime(),
});

// Reserve a slot (creates pending_payment booking + 5-minute hold)
router.post('/reserve', authenticate, validateBody(reserveSchema), async (req, res, next) => {
  const { machine_id, slot_start, slot_end } = req.body;
  try {
    const result = await reserveSlot({
      studentId: req.user.id,
      machineId: machine_id,
      slotStart: new Date(slot_start),
      slotEnd: new Date(slot_end)
    });

    res.status(201).json({
      message: 'Slot reserved. Please complete payment within 5 minutes.',
      booking: result.booking,
      order: result.order,
      holdExpiresAt: result.booking.hold_expires_at
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    next(err);
  }
});

// Student cancels an upcoming booking (full refund issued automatically)
router.post('/:id/cancel', authenticate, async (req, res, next) => {
  const bookingId = parseInt(req.params.id, 10);
  try {
    const cancelledBooking = await cancelBooking(bookingId, req.user.id);
    res.json({
      message: 'Booking cancelled successfully. A full refund has been issued.',
      booking: cancelledBooking
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    next(err);
  }
});

// Get student's personal bookings & transactions with timeline and refund explanations
router.get('/my', authenticate, async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT 
        b.id, b.student_id, b.machine_id, b.slot_start, b.slot_end, b.hold_expires_at,
        b.amount_paise, b.status, b.razorpay_order_id, b.razorpay_payment_id, b.razorpay_refund_id,
        b.created_at, b.updated_at,
        m.label as machine_label, m.type as machine_type,
        l.id as laundry_id, l.name as laundry_name,
        p.id as payment_id, p.status as payment_status,
        r.id as refund_id, r.amount_paise as refund_amount_paise, r.reason_code, r.status as refund_status,
        r.created_at as refunded_at
      FROM bookings b
      JOIN machines m ON b.machine_id = m.id
      JOIN laundries l ON m.laundry_id = l.id
      LEFT JOIN payments p ON b.id = p.booking_id
      LEFT JOIN refunds r ON b.id = r.booking_id
      WHERE b.student_id = $1
      ORDER BY b.created_at DESC
    `, [req.user.id]);

    const formatted = result.rows.map(b => ({
      ...b,
      amount_inr: (b.amount_paise / 100).toFixed(2),
      refund_amount_inr: b.refund_amount_paise ? (b.refund_amount_paise / 100).toFixed(2) : null,
      refund_reason_text: b.reason_code ? (config.reasonCodes[b.reason_code] || 'Full refund processed.') : null
    }));

    res.json({ bookings: formatted });
  } catch (err) {
    next(err);
  }
});

// Join waiting list for a slot
router.post('/waiting-list', authenticate, validateBody(waitingListSchema), async (req, res, next) => {
  const { machine_id, slot_start } = req.body;
  try {
    const item = await addToWaitingList({
      studentId: req.user.id,
      machineId: machine_id,
      slotStart: new Date(slot_start)
    });
    res.status(201).json({
      message: 'Added to waiting list. You will receive an in-app offer if this slot becomes available.',
      item
    });
  } catch (err) {
    next(err);
  }
});

export default router;
