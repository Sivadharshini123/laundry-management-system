import mqtt from 'mqtt';
import { createServer } from 'net';
import aedes from 'aedes';
import { pool } from '../db/index.js';
import { config } from '../config.js';
import { emitToLaundry, emitToStaff } from '../socket/socketHandler.js';
import { failAndRefundBooking } from './bookingService.js';
import { createNotification } from './notificationService.js';

let mqttClient = null;
let aedesServer = null;
let checkerInterval = null;

// Helper to compute average cycle length in minutes for a machine
export async function getEstimatedMinutesLeft(machineId) {
  try {
    // Check current running event start time
    const currentRun = await pool.query(`
      SELECT recorded_at FROM machine_events
      WHERE machine_id = $1 AND state = 'running'
      ORDER BY recorded_at DESC
      LIMIT 1
    `, [machineId]);

    if (currentRun.rows.length === 0) {
      return 45;
    }

    const runStartTime = new Date(currentRun.rows[0].recorded_at).getTime();
    const elapsedMinutes = Math.floor((Date.now() - runStartTime) / (60 * 1000));

    // Calculate historical average duration between running and done
    const avgRes = await pool.query(`
      WITH paired_events AS (
        SELECT 
          state, 
          recorded_at,
          LEAD(state) OVER (PARTITION BY machine_id ORDER BY recorded_at) as next_state,
          LEAD(recorded_at) OVER (PARTITION BY machine_id ORDER BY recorded_at) as next_time
        FROM machine_events
        WHERE machine_id = $1 AND state IN ('running', 'done')
      )
      SELECT AVG(EXTRACT(EPOCH FROM (next_time - recorded_at)) / 60) as avg_duration
      FROM paired_events
      WHERE state = 'running' AND next_state = 'done'
    `, [machineId]);

    const avgMinutes = avgRes.rows[0]?.avg_duration ? Math.round(avgRes.rows[0].avg_duration) : 45;
    const remaining = Math.max(1, avgMinutes - elapsedMinutes);
    return remaining;
  } catch (err) {
    return 45;
  }
}

// Map machine state for student presentation
export function mapStudentMachineStatus(dbMachine) {
  const isStale = !dbMachine.last_seen || (Date.now() - new Date(dbMachine.last_seen).getTime() > 90000);
  if (isStale || dbMachine.state === 'offline' || dbMachine.out_of_service) {
    return 'Status unknown';
  }
  if (dbMachine.state === 'running') {
    return 'In use';
  }
  if (dbMachine.state === 'done') {
    return 'Finished';
  }
  return 'Available';
}

// Ingestion message handlers
export async function handleHeartbeat(laundryId, machineId, payload) {
  try {
    await pool.query(`
      INSERT INTO machine_state (machine_id, state, last_seen, updated_at)
      VALUES ($1, 'idle', NOW(), NOW())
      ON CONFLICT (machine_id) DO UPDATE
      SET last_seen = NOW(), updated_at = NOW()
    `, [machineId]);

    emitToLaundry(laundryId, 'machine:heartbeat', {
      machineId: parseInt(machineId, 10),
      laundryId: parseInt(laundryId, 10),
      lastSeen: new Date().toISOString()
    });
  } catch (err) {
    console.error(`Error handling heartbeat for machine ${machineId}:`, err);
  }
}

export async function handleStateMessage(laundryId, machineId, payload) {
  const mId = parseInt(machineId, 10);
  const lId = parseInt(laundryId, 10);
  const state = payload.state; // 'idle' | 'running' | 'done' | 'offline'
  const amps = typeof payload.amps === 'number' ? payload.amps : (state === 'running' ? 0.95 : 0.03);

  try {
    // 1. Update machine_state
    await pool.query(`
      INSERT INTO machine_state (machine_id, state, last_seen, updated_at)
      VALUES ($1, $2, NOW(), NOW())
      ON CONFLICT (machine_id) DO UPDATE
      SET state = EXCLUDED.state, last_seen = NOW(), updated_at = NOW()
    `, [mId, state]);

    // 2. Insert into machine_events
    await pool.query(`
      INSERT INTO machine_events (machine_id, state, amps, recorded_at)
      VALUES ($1, $2, $3, NOW())
    `, [mId, state, amps]);

    // 3. Apply booking rules
    const now = new Date();

    if (state === 'running') {
      // Find active paid booking covering now or within start grace window
      const bookingRes = await pool.query(`
        SELECT * FROM bookings
        WHERE machine_id = $1 
          AND status = 'paid'
          AND slot_start <= NOW() + INTERVAL '5 minutes'
          AND slot_end >= NOW()
        ORDER BY slot_start ASC
        LIMIT 1
      `, [mId]);

      if (bookingRes.rows.length > 0) {
        const booking = bookingRes.rows[0];
        await pool.query(`
          UPDATE bookings
          SET status = 'running', updated_at = NOW()
          WHERE id = $1
        `, [booking.id]);

        emitToLaundry(lId, 'booking:running', {
          bookingId: booking.id,
          machineId: mId
        });
      } else {
        // Section 5: running with no booking -> emit an alert to staff. Do not change any booking.
        emitToStaff('machine:unassigned_running', {
          machineId: mId,
          laundryId: lId,
          amps,
          timestamp: now.toISOString(),
          message: `Machine #${mId} is running with no scheduled booking!`
        });
      }
    } else if (state === 'done') {
      // Find running booking on this machine
      const bookingRes = await pool.query(`
        SELECT * FROM bookings
        WHERE machine_id = $1 AND status = 'running'
        ORDER BY slot_start DESC
        LIMIT 1
      `, [mId]);

      if (bookingRes.rows.length > 0) {
        const booking = bookingRes.rows[0];
        await pool.query(`
          UPDATE bookings
          SET status = 'completed', updated_at = NOW()
          WHERE id = $1
        `, [booking.id]);

        // Send clothes ready in-app notification
        await createNotification(
          booking.student_id,
          'clothes:ready',
          `Your cycle on machine #${mId} has finished! Please collect your clothes promptly.`
        );

        emitToLaundry(lId, 'booking:completed', {
          bookingId: booking.id,
          machineId: mId
        });
      }
    }

    // 4. Broadcast machine update over Socket.IO
    const estMinutes = state === 'running' ? await getEstimatedMinutesLeft(mId) : 0;
    emitToLaundry(lId, 'machine:update', {
      machineId: mId,
      laundryId: lId,
      state,
      amps,
      estimatedMinutesLeft: estMinutes,
      lastSeen: now.toISOString()
    });

    emitToStaff('machine:update', {
      machineId: mId,
      laundryId: lId,
      state,
      amps,
      lastSeen: now.toISOString()
    });
  } catch (err) {
    console.error(`Error handling state message for machine ${machineId}:`, err);
  }
}

// Periodic 30-second checker job
export async function runCheckerJob() {
  try {
    // 1. Check for stale heartbeats (>90 seconds)
    const staleMachines = await pool.query(`
      SELECT m.id, m.label, m.laundry_id, s.state, s.last_seen
      FROM machines m
      LEFT JOIN machine_state s ON m.id = s.machine_id
      WHERE s.last_seen < NOW() - INTERVAL '90 seconds' OR s.last_seen IS NULL
    `);

    for (const m of staleMachines.rows) {
      emitToStaff('machine:stale_heartbeat', {
        machineId: m.id,
        laundryId: m.laundry_id,
        label: m.label,
        lastSeen: m.last_seen,
        message: `Machine ${m.label} heartbeat is stale (>90s). Status unknown.`
      });
    }

    // 2. Paid booking whose 5-minute grace period has passed without running -> mark failed and refund
    const failedBookings = await pool.query(`
      SELECT id FROM bookings
      WHERE status = 'paid'
        AND slot_start + INTERVAL '5 minutes' < NOW()
    `);

    for (const b of failedBookings.rows) {
      console.log(`Booking #${b.id} passed 5-minute grace period without starting. Marking failed and refunding.`);
      await failAndRefundBooking(b.id, 'MACHINE_NOT_STARTED');
    }
  } catch (err) {
    console.error('Error during 30s checker job:', err);
  }
}

export function startCheckerJob() {
  if (!checkerInterval) {
    checkerInterval = setInterval(runCheckerJob, 30000);
  }
}

export function stopCheckerJob() {
  if (checkerInterval) {
    clearInterval(checkerInterval);
    checkerInterval = null;
  }
}

// Ingestion Service Startup
export async function startIngestionService() {
  startCheckerJob();

  // If configured to run embedded MQTT broker
  if (config.mqtt.useEmbeddedBroker) {
    try {
      const aedesInstance = aedes();
      aedesServer = createServer(aedesInstance.handle);
      aedesServer.listen(1883, () => {
        console.log('Embedded Aedes MQTT broker listening on port 1883');
      });
      aedesServer.on('error', (err) => {
        console.warn('Embedded MQTT broker port 1883 already in use or error:', err.message);
      });
    } catch (e) {
      console.warn('Could not launch embedded MQTT broker:', e.message);
    }
  }

  // Connect backend MQTT subscriber
  mqttClient = mqtt.connect(config.mqtt.brokerUrl, {
    reconnectPeriod: 3000,
    connectTimeout: 5000,
  });

  mqttClient.on('connect', () => {
    console.log(`Connected to MQTT broker at ${config.mqtt.brokerUrl}`);
    mqttClient.subscribe('laundry/+/machine/+/state', (err) => {
      if (err) console.error('Subscription error for state topic:', err);
    });
    mqttClient.subscribe('laundry/+/machine/+/heartbeat', (err) => {
      if (err) console.error('Subscription error for heartbeat topic:', err);
    });
  });

  mqttClient.on('message', async (topic, message) => {
    try {
      const parts = topic.split('/');
      // Expected topic structure: laundry/{laundryId}/machine/{machineId}/{type}
      if (parts[0] !== 'laundry' || parts[2] !== 'machine') return;

      const laundryId = parts[1];
      const machineId = parts[3];
      const msgType = parts[4]; // 'state' | 'heartbeat'
      const payload = JSON.parse(message.toString());

      if (msgType === 'heartbeat') {
        await handleHeartbeat(laundryId, machineId, payload);
      } else if (msgType === 'state') {
        await handleStateMessage(laundryId, machineId, payload);
      }
    } catch (err) {
      console.error(`Error processing MQTT message on ${topic}:`, err);
    }
  });

  mqttClient.on('error', (err) => {
    console.warn('MQTT client error:', err.message);
  });
}

export function stopIngestionService() {
  stopCheckerJob();
  if (mqttClient) {
    mqttClient.end();
  }
  if (aedesServer) {
    aedesServer.close();
  }
}
