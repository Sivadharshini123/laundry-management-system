import express from 'express';
import { z } from 'zod';
import { pool } from '../db/index.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { validateBody } from '../middleware/validate.js';
import { logAudit } from '../services/auditService.js';
import { emitToLaundry, emitToStaff } from '../socket/socketHandler.js';
import { issueRazorpayRefund } from '../services/paymentService.js';

const router = express.Router();

// Enforce staff authentication and role strictly on the server (Section 2)
router.use(authenticate);
router.use(requireRole('staff'));

// 1. Staff Machine Grid with telemetry & active booking IDs (no student names)
router.get('/machines', async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT 
        m.id, m.laundry_id, m.label, m.type, m.price_paise, m.slot_minutes,
        m.active, m.out_of_service, m.run_threshold_amps,
        l.name as laundry_name,
        s.state, s.last_seen, s.updated_at as state_updated_at,
        b.id as active_booking_id, b.status as active_booking_status,
        b.slot_start as active_slot_start, b.slot_end as active_slot_end
      FROM machines m
      JOIN laundries l ON m.laundry_id = l.id
      LEFT JOIN machine_state s ON m.id = s.machine_id
      LEFT JOIN bookings b ON m.id = b.machine_id 
        AND b.status IN ('running', 'paid')
        AND b.slot_start <= NOW() + INTERVAL '5 minutes'
        AND b.slot_end >= NOW()
      ORDER BY m.id ASC
    `);

    // Flag machines with stale heartbeat (>90s)
    const now = Date.now();
    const machines = result.rows.map(m => {
      const isStale = !m.last_seen || (now - new Date(m.last_seen).getTime() > 90000);
      return {
        ...m,
        is_stale: isStale,
        display_status: isStale ? 'Status unknown' : m.state
      };
    });

    res.json({ machines });
  } catch (err) {
    next(err);
  }
});

// 2. Staff Dashboard Metrics & Alerts
router.get('/dashboard', async (req, res, next) => {
  try {
    // Today's bookings
    const todayBookingsRes = await pool.query(`
      SELECT b.id, b.machine_id, b.slot_start, b.slot_end, b.amount_paise, b.status, b.created_at,
             m.label as machine_label, l.name as laundry_name
      FROM bookings b
      JOIN machines m ON b.machine_id = m.id
      JOIN laundries l ON m.laundry_id = l.id
      WHERE b.created_at >= CURRENT_DATE
      ORDER BY b.created_at DESC
    `);

    // Failed bookings with automatic refunds
    const failedBookingsRes = await pool.query(`
      SELECT b.id, b.machine_id, b.amount_paise, b.status, b.razorpay_refund_id, b.updated_at,
             r.reason_code, r.status as refund_status,
             m.label as machine_label
      FROM bookings b
      JOIN refunds r ON b.id = r.booking_id
      JOIN machines m ON b.machine_id = m.id
      WHERE b.status = 'failed'
      ORDER BY b.updated_at DESC
      LIMIT 20
    `);

    // Uncollected clothes: machines in 'done' state for > 15 minutes
    const uncollectedRes = await pool.query(`
      SELECT m.id as machine_id, m.label as machine_label, m.laundry_id,
             s.updated_at as finished_at,
             EXTRACT(EPOCH FROM (NOW() - s.updated_at)) / 60 as minutes_waiting,
             b.id as booking_id
      FROM machine_state s
      JOIN machines m ON s.machine_id = m.id
      LEFT JOIN bookings b ON m.id = b.machine_id AND b.status = 'completed'
      WHERE s.state = 'done'
      ORDER BY s.updated_at ASC
    `);

    // Unassigned running machines: machine state is running with no current running booking
    const unassignedRunningRes = await pool.query(`
      SELECT m.id as machine_id, m.label as machine_label, m.laundry_id, s.last_seen
      FROM machine_state s
      JOIN machines m ON s.machine_id = m.id
      WHERE s.state = 'running'
        AND NOT EXISTS (
          SELECT 1 FROM bookings b
          WHERE b.machine_id = m.id AND b.status = 'running'
        )
    `);

    res.json({
      today_bookings_count: todayBookingsRes.rows.length,
      today_bookings: todayBookingsRes.rows,
      failed_bookings: failedBookingsRes.rows,
      uncollected_clothes: uncollectedRes.rows,
      unassigned_running_machines: unassignedRunningRes.rows
    });
  } catch (err) {
    next(err);
  }
});

const updateMachineSchema = z.object({
  price_paise: z.number().int().min(0).optional(),
  slot_minutes: z.number().int().min(15).max(180).optional(),
  out_of_service: z.boolean().optional(),
  reason: z.string().optional()
});

// 3. Edit price, slot duration, out_of_service flag (writes to audit_log)
router.put('/machines/:id', validateBody(updateMachineSchema), async (req, res, next) => {
  const machineId = parseInt(req.params.id, 10);
  const { price_paise, slot_minutes, out_of_service, reason } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get current machine values
    const currentRes = await client.query('SELECT * FROM machines WHERE id = $1', [machineId]);
    if (currentRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Machine not found' });
    }
    const current = currentRes.rows[0];

    // Build update query
    const updates = [];
    const values = [machineId];
    let idx = 2;

    if (price_paise !== undefined) {
      updates.push(`price_paise = $${idx++}`);
      values.push(price_paise);
    }
    if (slot_minutes !== undefined) {
      updates.push(`slot_minutes = $${idx++}`);
      values.push(slot_minutes);
    }
    if (out_of_service !== undefined) {
      updates.push(`out_of_service = $${idx++}`);
      values.push(out_of_service);
    }

    if (updates.length === 0) {
      await client.query('ROLLBACK');
      return res.json({ machine: current });
    }

    const updateQuery = `
      UPDATE machines 
      SET ${updates.join(', ')}
      WHERE id = $1
      RETURNING *
    `;

    const result = await client.query(updateQuery, values);
    const updated = result.rows[0];

    // If marked out of service, cancel and refund any pending holds or future unstarted bookings
    if (out_of_service === true && current.out_of_service === false) {
      const affectedBookings = await client.query(`
        SELECT b.*, p.razorpay_payment_id, p.id as payment_id
        FROM bookings b
        LEFT JOIN payments p ON b.id = p.booking_id
        WHERE b.machine_id = $1 AND b.status = 'paid' AND b.slot_start > NOW()
      `, [machineId]);

      for (const b of affectedBookings.rows) {
        if (b.razorpay_payment_id) {
          const refundRes = await issueRazorpayRefund({
            razorpayPaymentId: b.razorpay_payment_id,
            amountPaise: b.amount_paise,
            reasonCode: 'MACHINE_OUT_OF_SERVICE',
            bookingId: b.id
          });

          await client.query(`
            INSERT INTO refunds (booking_id, payment_id, amount_paise, reason_code, razorpay_refund_id, status)
            VALUES ($1, $2, $3, 'MACHINE_OUT_OF_SERVICE', $4, 'processed')
          `, [b.id, b.payment_id, b.amount_paise, refundRes.refundId]);
        }

        await client.query(`
          UPDATE bookings
          SET status = 'cancelled', updated_at = NOW()
          WHERE id = $1
        `, [b.id]);
      }
    }

    // Write audit log (Section 2: Every staff change is written to an audit log)
    await logAudit({
      actorId: req.user.id,
      action: 'UPDATE_MACHINE_CONFIG',
      entity: 'machines',
      entityId: machineId,
      details: {
        previous: {
          price_paise: current.price_paise,
          slot_minutes: current.slot_minutes,
          out_of_service: current.out_of_service
        },
        new: {
          price_paise: updated.price_paise,
          slot_minutes: updated.slot_minutes,
          out_of_service: updated.out_of_service
        },
        reason: reason || 'Staff configuration update'
      }
    }, client);

    await client.query('COMMIT');

    emitToLaundry(updated.laundry_id, 'machine:config_changed', updated);
    emitToStaff('machine:config_changed', updated);

    res.json({ message: 'Machine updated successfully', machine: updated });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// 4. Staff clears uncollected clothes from machine
router.post('/machines/:id/clear-clothes', async (req, res, next) => {
  const machineId = parseInt(req.params.id, 10);
  try {
    await pool.query(`
      UPDATE machine_state
      SET state = 'idle', updated_at = NOW()
      WHERE machine_id = $1
    `, [machineId]);

    await logAudit({
      actorId: req.user.id,
      action: 'CLEAR_UNCOLLECTED_CLOTHES',
      entity: 'machines',
      entityId: machineId,
      details: { action: 'Staff physically emptied and cleared drum' }
    });

    res.json({ message: 'Machine state reset to idle.' });
  } catch (err) {
    next(err);
  }
});

// 5. Audit logs view
router.get('/audit-logs', async (req, res, next) => {
  const limit = Math.min(100, parseInt(req.query.limit || '50', 10));
  try {
    const result = await pool.query(`
      SELECT a.*, s.name as actor_name, s.college_email as actor_email
      FROM audit_log a
      LEFT JOIN students s ON a.actor_id = s.id
      ORDER BY a.created_at DESC
      LIMIT $1
    `, [limit]);

    res.json({ logs: result.rows });
  } catch (err) {
    next(err);
  }
});

export default router;
