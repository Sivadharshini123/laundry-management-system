import { describe, it, expect, beforeEach } from 'vitest';
import crypto from 'crypto';
import { MockDatabase } from './mocks/mockDb.js';
import * as dbModule from '../src/db/index.js';
import { confirmCapturedPayment } from '../src/services/bookingService.js';
import { verifyWebhookSignature } from '../src/services/paymentService.js';
import { config } from '../src/config.js';

describe('Payment Webhooks, Idempotency, and Signature Verification', () => {
  let mockDb;

  beforeEach(() => {
    mockDb = new MockDatabase();
    dbModule.pool.query = (text, params) => mockDb.query(text, params);
    dbModule.pool.connect = () => mockDb.connect();
  });

  it('1. A duplicate Razorpay webhook does not change a booking twice (idempotent)', async () => {
    // Seed a pending booking
    const booking = {
      id: 201,
      student_id: 2,
      machine_id: 1,
      slot_start: new Date(Date.now() + 3600 * 1000),
      slot_end: new Date(Date.now() + 6300 * 1000),
      hold_expires_at: new Date(Date.now() + 300000),
      amount_paise: 6000,
      status: 'pending_payment',
      razorpay_order_id: 'order_test_dup_123',
      razorpay_payment_id: null,
      created_at: new Date(),
      updated_at: new Date()
    };
    mockDb.bookings.push(booking);

    // First webhook delivery
    const result1 = await confirmCapturedPayment({
      razorpayOrderId: 'order_test_dup_123',
      razorpayPaymentId: 'pay_test_001',
      rawWebhookId: 'evt_001',
      amountPaise: 6000
    });

    expect(result1.success).toBe(true);
    expect(result1.duplicate).toBeUndefined();
    expect(booking.status).toBe('paid');
    expect(booking.razorpay_payment_id).toBe('pay_test_001');

    // Duplicate webhook delivery with same order
    const result2 = await confirmCapturedPayment({
      razorpayOrderId: 'order_test_dup_123',
      razorpayPaymentId: 'pay_test_001',
      rawWebhookId: 'evt_002',
      amountPaise: 6000
    });

    expect(result2.success).toBe(true);
    expect(result2.duplicate).toBe(true);
    // Booking remains paid and unchanged
    expect(booking.status).toBe('paid');
  });

  it('2. A webhook with an invalid signature is rejected', () => {
    const payload = JSON.stringify({ event: 'payment.captured' });
    const buffer = Buffer.from(payload, 'utf8');

    // Valid HMAC SHA256 signature
    const validSignature = crypto
      .createHmac('sha256', config.razorpay.webhookSecret)
      .update(buffer)
      .digest('hex');

    expect(verifyWebhookSignature(buffer, validSignature)).toBe(true);

    // Invalid signature
    const tamperedSignature = validSignature.slice(0, -4) + '0000';
    expect(verifyWebhookSignature(buffer, tamperedSignature)).toBe(false);
    expect(verifyWebhookSignature(buffer, 'totally_wrong_signature')).toBe(false);
    expect(verifyWebhookSignature(buffer, null)).toBe(false);
  });

  it('3. A payment without a valid booking is refunded in full automatically', async () => {
    // Attempt payment for an order ID that has no matching booking
    const result = await confirmCapturedPayment({
      razorpayOrderId: 'order_non_existent_999',
      razorpayPaymentId: 'pay_orphan_777',
      rawWebhookId: 'evt_orphan',
      amountPaise: 6000
    });

    expect(result.success).toBe(false);
    expect(result.refunded).toBe(true);
    expect(result.reason).toBe('PAYMENT_WITHOUT_BOOKING');

    // Check that a refund was recorded
    const refund = mockDb.refunds.find(r => r.reason_code === 'PAYMENT_WITHOUT_BOOKING');
    expect(refund).toBeDefined();
    expect(refund.amount_paise).toBe(6000);
    expect(refund.status).toBe('processed');
  });
});
