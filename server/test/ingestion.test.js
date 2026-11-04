import { describe, it, expect, beforeEach } from 'vitest';
import { MockDatabase } from './mocks/mockDb.js';
import * as dbModule from '../src/db/index.js';
import { mapStudentMachineStatus, runCheckerJob } from '../src/services/ingestion.js';
import { failAndRefundBooking } from '../src/services/bookingService.js';

describe('IoT Telemetry, Grace Period Refund, and Heartbeat Watchdog', () => {
  let mockDb;

  beforeEach(() => {
    mockDb = new MockDatabase();
    dbModule.pool.query = (text, params) => mockDb.query(text, params);
    dbModule.pool.connect = () => mockDb.connect();
  });

  it('1. Paid booking whose machine never starts is marked failed and refunded in full (5-minute grace period)', async () => {
    // Booking whose slot started 6 minutes ago (past 5-minute grace period)
    const slotStart = new Date(Date.now() - 6 * 60 * 1000);
    const slotEnd = new Date(Date.now() + 39 * 60 * 1000);

    const booking = {
      id: 301,
      student_id: 2,
      machine_id: 4,
      slot_start: slotStart,
      slot_end: slotEnd,
      hold_expires_at: null,
      amount_paise: 6000,
      status: 'paid',
      razorpay_order_id: 'order_grace_fail',
      razorpay_payment_id: 'pay_grace_fail',
      created_at: new Date(Date.now() - 10 * 60 * 1000),
      updated_at: new Date()
    };
    mockDb.bookings.push(booking);

    // Run 30-second watchdog checker job
    await runCheckerJob();

    // Verify booking is marked failed
    expect(booking.status).toBe('failed');
    expect(booking.razorpay_refund_id).toBeDefined();

    // Verify automatic full refund was recorded
    const refund = mockDb.refunds.find(r => r.booking_id === 301);
    expect(refund).toBeDefined();
    expect(refund.amount_paise).toBe(6000);
    expect(refund.reason_code).toBe('MACHINE_NOT_STARTED');
    expect(refund.status).toBe('processed');

    // Verify in-app notification delivered to student
    const notification = mockDb.notifications.find(n => n.student_id === 2 && n.type === 'booking:failed');
    expect(notification).toBeDefined();
    expect(notification.message).toContain('failed because the machine did not start');
  });

  it('2. Stale heartbeat shows "Status unknown," never "Available"', () => {
    // Normal fresh machine (last_seen 10s ago)
    const freshMachine = {
      id: 1,
      state: 'idle',
      last_seen: new Date(Date.now() - 10000),
      out_of_service: false
    };
    expect(mapStudentMachineStatus(freshMachine)).toBe('Available');

    // Stale machine (last_seen 95 seconds ago > 90s threshold)
    const staleMachine = {
      id: 2,
      state: 'idle',
      last_seen: new Date(Date.now() - 95000),
      out_of_service: false
    };
    // Must NEVER show as Available
    expect(mapStudentMachineStatus(staleMachine)).toBe('Status unknown');

    // Missing last_seen
    const nullSeenMachine = {
      id: 3,
      state: 'idle',
      last_seen: null,
      out_of_service: false
    };
    expect(mapStudentMachineStatus(nullSeenMachine)).toBe('Status unknown');

    // Offline state
    const offlineMachine = {
      id: 4,
      state: 'offline',
      last_seen: new Date(),
      out_of_service: false
    };
    expect(mapStudentMachineStatus(offlineMachine)).toBe('Status unknown');

    // Running state
    const runningMachine = {
      id: 5,
      state: 'running',
      last_seen: new Date(),
      out_of_service: false
    };
    expect(mapStudentMachineStatus(runningMachine)).toBe('In use');

    // Done state
    const doneMachine = {
      id: 6,
      state: 'done',
      last_seen: new Date(),
      out_of_service: false
    };
    expect(mapStudentMachineStatus(doneMachine)).toBe('Finished');
  });
});
