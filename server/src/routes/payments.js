import express from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { confirmCapturedPayment } from '../services/bookingService.js';
import { pool } from '../db/index.js';

const router = express.Router();

const simulateSchema = z.object({
  order_id: z.string().min(1),
  payment_id: z.string().optional()
});

// Simulate Razorpay capture in test/demo mode
router.post('/simulate-capture', authenticate, validateBody(simulateSchema), async (req, res, next) => {
  const { order_id, payment_id } = req.body;
  const payId = payment_id || `pay_test_${Date.now()}`;

  try {
    const bookingRes = await pool.query(
      'SELECT id, amount_paise FROM bookings WHERE razorpay_order_id = $1',
      [order_id]
    );

    const amountPaise = bookingRes.rows[0]?.amount_paise || 6000;

    const result = await confirmCapturedPayment({
      razorpayOrderId: order_id,
      razorpayPaymentId: payId,
      rawWebhookId: `sim_evt_${Date.now()}`,
      amountPaise
    });

    res.json({
      message: 'Simulated payment capture processed',
      result
    });
  } catch (err) {
    next(err);
  }
});

export default router;
