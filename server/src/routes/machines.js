import express from 'express';
import { pool } from '../db/index.js';
import { mapStudentMachineStatus, getEstimatedMinutesLeft } from '../services/ingestion.js';
import { cleanupExpiredHolds } from '../services/bookingService.js';

const router = express.Router();

// List machines for a laundry with student-facing status
router.get('/', async (req, res, next) => {
  const laundryId = req.query.laundry_id ? parseInt(req.query.laundry_id, 10) : null;
  try {
    let queryText = `
      SELECT m.*, s.state, s.last_seen
      FROM machines m
      LEFT JOIN machine_state s ON m.id = s.machine_id
      WHERE m.active = true
    `;
    const params = [];
    if (laundryId) {
      params.push(laundryId);
      queryText += ` AND m.laundry_id = $1`;
    }
    queryText += ` ORDER BY m.id ASC`;

    const result = await pool.query(queryText, params);

    const machines = await Promise.all(result.rows.map(async (m) => {
      const studentStatus = mapStudentMachineStatus(m);
      const estMinutes = m.state === 'running' ? await getEstimatedMinutesLeft(m.id) : 0;
      return {
        id: m.id,
        laundry_id: m.laundry_id,
        label: m.label,
        type: m.type,
        price_paise: m.price_paise,
        slot_minutes: m.slot_minutes,
        out_of_service: m.out_of_service,
        status: studentStatus,
        estimated_minutes_left: estMinutes,
        last_seen: m.last_seen
      };
    }));

    res.json({ machines });
  } catch (err) {
    next(err);
  }
});

// Get machine details by ID
router.get('/:id', async (req, res, next) => {
  const machineId = parseInt(req.params.id, 10);
  try {
    const result = await pool.query(`
      SELECT m.*, s.state, s.last_seen
      FROM machines m
      LEFT JOIN machine_state s ON m.id = s.machine_id
      WHERE m.id = $1 AND m.active = true
    `, [machineId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Machine not found' });
    }

    const m = result.rows[0];
    const studentStatus = mapStudentMachineStatus(m);
    const estMinutes = m.state === 'running' ? await getEstimatedMinutesLeft(m.id) : 0;

    res.json({
      machine: {
        id: m.id,
        laundry_id: m.laundry_id,
        label: m.label,
        type: m.type,
        price_paise: m.price_paise,
        slot_minutes: m.slot_minutes,
        out_of_service: m.out_of_service,
        status: studentStatus,
        estimated_minutes_left: estMinutes,
        last_seen: m.last_seen
      }
    });
  } catch (err) {
    next(err);
  }
});

// Generate and query slots for a machine on a given date (default today)
router.get('/:id/slots', async (req, res, next) => {
  const machineId = parseInt(req.params.id, 10);
  const dateStr = req.query.date || new Date().toISOString().split('T')[0];

  try {
    // 1. Cleanup expired holds first
    await cleanupExpiredHolds();

    // 2. Fetch machine and status
    const machineRes = await pool.query(`
      SELECT m.*, s.state, s.last_seen, l.opening_hours
      FROM machines m
      JOIN laundries l ON m.laundry_id = l.id
      LEFT JOIN machine_state s ON m.id = s.machine_id
      WHERE m.id = $1 AND m.active = true
    `, [machineId]);

    if (machineRes.rows.length === 0) {
      return res.status(404).json({ error: 'Machine not found' });
    }

    const machine = machineRes.rows[0];
    const isStale = !machine.last_seen || (Date.now() - new Date(machine.last_seen).getTime() > 90000);
    const isOffline = machine.state === 'offline' || machine.out_of_service;

    // 3. Fetch active bookings for this machine covering this date
    const dayStart = new Date(`${dateStr}T00:00:00`);
    const dayEnd = new Date(`${dateStr}T23:59:59`);

    const bookingsRes = await pool.query(`
      SELECT id, student_id, slot_start, slot_end, status, hold_expires_at
      FROM bookings
      WHERE machine_id = $1
        AND slot_end >= $2
        AND slot_start <= $3
        AND status IN ('pending_payment', 'paid', 'running')
    `, [machineId, dayStart, dayEnd]);

    const activeBookings = bookingsRes.rows;

    // 4. Generate standard slots between 06:00 and 23:00
    const slotMinutes = machine.slot_minutes || 45;
    const slots = [];
    const now = new Date();

    const startHour = 6;
    const endHour = 23;
    let slotCurrent = new Date(`${dateStr}T06:00:00`);
    const dayLimit = new Date(`${dateStr}T23:00:00`);

    while (slotCurrent.getTime() + slotMinutes * 60 * 1000 <= dayLimit.getTime()) {
      const slotStart = new Date(slotCurrent);
      const slotEnd = new Date(slotStart.getTime() + slotMinutes * 60 * 1000);

      // Determine slot state
      let state = 'Available';
      let bookingInfo = null;

      if (isStale || isOffline) {
        // Section 3: Status unknown: heartbeat is stale. Never show as Available.
        state = 'Status unknown';
      } else {
        // Check for covering booking
        const match = activeBookings.find(b => {
          const bStart = new Date(b.slot_start).getTime();
          const bEnd = new Date(b.slot_end).getTime();
          const sStart = slotStart.getTime();
          const sEnd = slotEnd.getTime();
          return (sStart < bEnd && sEnd > bStart);
        });

        if (match) {
          if (match.status === 'paid' || match.status === 'running') {
            state = 'Booked';
            bookingInfo = { bookingId: match.id, status: match.status };
          } else if (match.status === 'pending_payment') {
            if (new Date(match.hold_expires_at) > now) {
              state = 'Reserved';
              bookingInfo = { bookingId: match.id, holdExpiresAt: match.hold_expires_at };
            }
          }
        } else if (slotEnd <= now) {
          state = 'Passed';
        }
      }

      slots.push({
        slotStart: slotStart.toISOString(),
        slotEnd: slotEnd.toISOString(),
        state,
        pricePaise: machine.price_paise,
        booking: bookingInfo
      });

      slotCurrent = slotEnd;
    }

    res.json({
      machine: {
        id: machine.id,
        label: machine.label,
        price_paise: machine.price_paise,
        slot_minutes: slotMinutes,
        status: mapStudentMachineStatus(machine)
      },
      date: dateStr,
      slots
    });
  } catch (err) {
    next(err);
  }
});

export default router;
