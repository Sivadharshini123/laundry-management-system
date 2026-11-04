import express from 'express';
import { verifyWebhookSignature } from '../services/paymentService.js';
import { confirmCapturedPayment } from '../services/bookingService.js';
import { logAudit } from '../services/auditService.js';

const router = express.Router();

// Razorpay Webhook endpoint
// Uses express.raw() to guarantee byte-for-byte HMAC signature verification
router.post('/razorpay', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const rawBody = req.body; // Buffer from express.raw()

  // Verify HMAC signature against exact bytes
  const isValid = verifyWebhookSignature(rawBody, signature);
  if (!isValid) {
    console.warn('Rejected webhook: invalid Razorpay HMAC signature');
    return res.status(400).json({ error: 'Invalid webhook signature' });
  }

  let event;
  try {
    event = JSON.parse(rawBody.toString('utf8'));
  } catch (err) {
    return res.status(400).json({ error: 'Malformed JSON payload' });
  }

  const eventType = event.event;
  const eventId = event.event_id || event.id || `evt_${Date.now()}`;
  console.log(`Received verified Razorpay webhook: ${eventType} (ID: ${eventId})`);

  try {
    if (eventType === 'payment.captured') {
      const paymentEntity = event.payload?.payment?.entity;
      if (!paymentEntity) {
        return res.status(400).json({ error: 'Missing payment entity in payload' });
      }

      const razorpayOrderId = paymentEntity.order_id;
      const razorpayPaymentId = paymentEntity.id;
      const amountPaise = paymentEntity.amount;

      const result = await confirmCapturedPayment({
        razorpayOrderId,
        razorpayPaymentId,
        rawWebhookId: eventId,
        amountPaise
      });

      await logAudit({
        actorId: null,
        action: 'WEBHOOK_PAYMENT_CAPTURED',
        entity: 'payments',
        details: { eventId, razorpayOrderId, razorpayPaymentId, result }
      });

      return res.status(200).json({ status: 'ok', result });
    }

    if (eventType === 'refund.processed') {
      const refundEntity = event.payload?.refund?.entity;
      console.log('Razorpay refund processed event received:', refundEntity?.id);
      return res.status(200).json({ status: 'ok' });
    }

    // Acknowledge other events gracefully
    res.status(200).json({ status: 'ignored' });
  } catch (err) {
    console.error('Error processing webhook event:', err);
    res.status(500).json({ error: 'Internal processing error' });
  }
});

export default router;
