import { describe, it, expect, beforeEach } from 'vitest';
import { MockDatabase } from './mocks/mockDb.js';
import * as dbModule from '../src/db/index.js';
import { executeTool } from '../src/services/chatService.js';

describe('AI Chat Assistant Privacy, Tool Scoping, and Data Isolation', () => {
  let mockDb;

  beforeEach(() => {
    mockDb = new MockDatabase();
    dbModule.pool.query = (text, params) => mockDb.query(text, params);
    dbModule.pool.connect = () => mockDb.connect();

    // Seed bookings for two different students
    // Student 2 (Aarav Sharma)
    mockDb.bookings.push({
      id: 501,
      student_id: 2,
      machine_id: 1,
      slot_start: new Date(),
      slot_end: new Date(Date.now() + 45 * 60000),
      status: 'paid',
      amount_paise: 6000,
      created_at: new Date()
    });

    // Student 3 (Diya Patel)
    mockDb.bookings.push({
      id: 502,
      student_id: 3,
      machine_id: 2,
      slot_start: new Date(),
      slot_end: new Date(Date.now() + 45 * 60000),
      status: 'paid',
      amount_paise: 6000,
      created_at: new Date()
    });

    mockDb.payments.push({
      id: 502,
      booking_id: 502,
      razorpay_order_id: 'order_502',
      razorpay_payment_id: 'pay_502',
      amount_paise: 6000,
      status: 'captured',
      created_at: new Date()
    });
  });

  it("1. A student cannot read another student's transaction through the chat tools (server-enforced authorization)", async () => {
    // Student 2 attempts to query transaction #502 belonging to Student 3
    const result = await executeTool('get_transaction_status', { transaction_id: 502 }, 2);

    expect(result).toBeDefined();
    // Access must be rejected with unauthorized / not found error
    expect(result.error).toBe('Transaction not found or access unauthorized');
    expect(result.booking_id).toBeUndefined();
    expect(result.amount_inr).toBeUndefined();
  });

  it("2. The chat model never receives personal fields (test tool result serializer)", async () => {
    // Mock database query returns raw booking with student profile joined
    const originalQuery = dbModule.pool.query;
    dbModule.pool.query = async (text, params) => {
      if (text.includes('FROM bookings') && text.includes('WHERE student_id = $1')) {
        return {
          rows: [
            {
              id: 501,
              student_id: 2,
              machine_id: 1,
              slot_start: new Date(),
              slot_end: new Date(),
              status: 'paid',
              amount_paise: 6000,
              created_at: new Date(),
              // Simulated leak attempt if database returned user table columns
              name: 'Aarav Sharma',
              college_email: 'student1@college.edu',
              phone: '+91 9876543210'
            }
          ]
        };
      }
      return originalQuery(text, params);
    };

    const bookings = await executeTool('get_my_bookings', {}, 2);

    expect(bookings).toBeInstanceOf(Array);
    expect(bookings.length).toBe(1);

    const serializedItem = bookings[0];

    // Assert that personal identifying fields are strictly stripped
    expect(serializedItem.name).toBeUndefined();
    expect(serializedItem.college_email).toBeUndefined();
    expect(serializedItem.email).toBeUndefined();
    expect(serializedItem.phone).toBeUndefined();
    expect(serializedItem.student_id).toBeUndefined();

    // Verify authorized transaction fields ARE present
    expect(serializedItem.booking_id).toBe(501);
    expect(serializedItem.machine_id).toBe(1);
    expect(serializedItem.status).toBe('paid');
    expect(serializedItem.amount_inr).toBe('60.00');
  });

  it('3. Machine status tool returns simple user-facing status and no internal hardware fields', async () => {
    const result = await executeTool('get_machine_status', { machine_id: 1 }, 2);

    expect(result.machine_id).toBe(1);
    expect(result.status).toBe('Available');
    // Ensure raw telemetry, IPs, or amps are not exposed
    expect(result.amps).toBeUndefined();
    expect(result.run_threshold_amps).toBeUndefined();
    expect(result.raw_telemetry).toBeUndefined();
  });
});
