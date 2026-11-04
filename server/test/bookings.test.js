import { describe, it, expect, beforeEach } from 'vitest';
import { MockDatabase } from './mocks/mockDb.js';
import * as dbModule from '../src/db/index.js';
import { reserveSlot, cleanupExpiredHolds, cancelBooking } from '../src/services/bookingService.js';

describe('Core Booking Rules and Overlap Prevention', () => {
  let mockDb;

  beforeEach(() => {
    mockDb = new MockDatabase();
    // Redirect db pool to mockDb
    dbModule.pool.query = (text, params) => mockDb.query(text, params);
    dbModule.pool.connect = () => mockDb.connect();
  });

  it('1. Two students cannot book overlapping slots on the same machine (EXCLUDE constraint 23P01)', async () => {
    const slotStart = new Date(Date.now() + 3600 * 1000); // 1 hour from now
    const slotEnd = new Date(Date.now() + (3600 + 45 * 60) * 1000); // 45 min slot

    // Student 1 reserves slot
    const res1 = await reserveSlot({
      studentId: 2,
      machineId: 1,
      slotStart,
      slotEnd
    });

    expect(res1.booking).toBeDefined();
    expect(res1.booking.status).toBe('pending_payment');
    expect(res1.booking.machine_id).toBe(1);

    // Student 2 attempts to reserve overlapping slot on the same machine
    let conflictError = null;
    try {
      await reserveSlot({
        studentId: 3,
        machineId: 1,
        slotStart,
        slotEnd
      });
    } catch (err) {
      conflictError = err;
    }

    expect(conflictError).toBeDefined();
    expect(conflictError.statusCode).toBe(409);
    expect(conflictError.message).toBe('This slot was just taken.');
  });

  it('2. An unpaid hold expires and releases the slot', async () => {
    const slotStart = new Date(Date.now() + 3600 * 1000);
    const slotEnd = new Date(Date.now() + (3600 + 45 * 60) * 1000);

    // Reserve a slot
    const res1 = await reserveSlot({
      studentId: 2,
      machineId: 2,
      slotStart,
      slotEnd
    });

    const bookingId = res1.booking.id;

    // Simulate hold expiration (set hold_expires_at to past)
    const bookingInDb = mockDb.bookings.find(b => b.id === bookingId);
    bookingInDb.hold_expires_at = new Date(Date.now() - 10000); // 10s ago

    // Run cleanup job
    const cleanedCount = await cleanupExpiredHolds();
    expect(cleanedCount).toBe(1);

    expect(bookingInDb.status).toBe('expired');

    // Slot is now released: Student 2 should now be able to reserve it without 409
    const res2 = await reserveSlot({
      studentId: 3,
      machineId: 2,
      slotStart,
      slotEnd
    });

    expect(res2.booking).toBeDefined();
    expect(res2.booking.status).toBe('pending_payment');
    expect(res2.booking.student_id).toBe(3);
  });

  it('3. A student cancellation refunds in full and releases the slot immediately', async () => {
    const slotStart = new Date(Date.now() + 7200 * 1000); // 2 hours from now
    const slotEnd = new Date(Date.now() + (7200 + 45 * 60) * 1000);

    // Reserve and mark paid
    const res = await reserveSlot({
      studentId: 2,
      machineId: 3,
      slotStart,
      slotEnd
    });

    const bookingInDb = mockDb.bookings.find(b => b.id === res.booking.id);
    bookingInDb.status = 'paid';
    bookingInDb.razorpay_payment_id = 'pay_test_abc123';

    // Student cancels booking
    const cancelled = await cancelBooking(res.booking.id, 2);
    expect(cancelled.status).toBe('cancelled');
    expect(cancelled.razorpay_refund_id).toBeDefined();

    // Verify refund record created
    const refundRecord = mockDb.refunds.find(r => r.booking_id === res.booking.id);
    expect(refundRecord).toBeDefined();
    expect(refundRecord.amount_paise).toBe(bookingInDb.amount_paise);
    expect(refundRecord.reason_code).toBe('STUDENT_CANCELLED');
    expect(refundRecord.status).toBe('processed');

    // Slot is immediately free for another student
    const newReservation = await reserveSlot({
      studentId: 4,
      machineId: 3,
      slotStart,
      slotEnd
    });
    expect(newReservation.booking.status).toBe('pending_payment');
    expect(newReservation.booking.student_id).toBe(4);
  });
});
