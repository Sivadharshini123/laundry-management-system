import bcrypt from 'bcryptjs';
import { pool } from '../db/index.js';

export async function seedDatabase() {
  const client = await pool.connect();
  try {
    console.log('Seeding database with initial data...');
    await client.query('BEGIN');

    // 1. Seed Staff and Students
    const passwordHash = await bcrypt.hash('Password123!', 10);

    const users = [
      { name: 'Campus Facilities Staff', email: 'staff@college.edu', role: 'staff' },
      { name: 'Aarav Sharma', email: 'student1@college.edu', role: 'student' },
      { name: 'Diya Patel', email: 'student2@college.edu', role: 'student' },
      { name: 'Rohan Verma', email: 'student3@college.edu', role: 'student' },
    ];

    for (const u of users) {
      await client.query(`
        INSERT INTO students (name, college_email, password_hash, role)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (college_email) DO UPDATE 
        SET name = EXCLUDED.name, role = EXCLUDED.role, password_hash = EXCLUDED.password_hash
      `, [u.name, u.email, passwordHash, u.role]);
    }

    // 2. Seed Laundries
    const laundries = [
      { id: 1, name: 'Laundry A (North Residence)', address: 'North Campus Residence Hall, Ground Floor, Room 102', opening_hours: '06:00 - 23:00' },
      { id: 2, name: 'Laundry B (South Commons)', address: 'South Campus Student Commons, Basement Level B-14', opening_hours: '06:00 - 23:00' },
    ];

    for (const l of laundries) {
      await client.query(`
        INSERT INTO laundries (id, name, address, opening_hours, active)
        VALUES ($1, $2, $3, $4, true)
        ON CONFLICT (id) DO UPDATE
        SET name = EXCLUDED.name, address = EXCLUDED.address, opening_hours = EXCLUDED.opening_hours
      `, [l.id, l.name, l.address, l.opening_hours]);
    }

    // 3. Seed Machines (7 machines per laundry = 14 total)
    const machineList = [
      // Laundry A (IDs 1 to 7)
      { id: 1, laundry_id: 1, label: 'Laundry A – Washer 1', type: 'washer', price_paise: 6000, slot_minutes: 45, amps: 0.50 },
      { id: 2, laundry_id: 1, label: 'Laundry A – Washer 2', type: 'washer', price_paise: 6000, slot_minutes: 45, amps: 0.50 },
      { id: 3, laundry_id: 1, label: 'Laundry A – Washer 3', type: 'washer', price_paise: 6000, slot_minutes: 45, amps: 0.50 },
      { id: 4, laundry_id: 1, label: 'Laundry A – Washer 4', type: 'washer', price_paise: 6000, slot_minutes: 45, amps: 0.50 },
      { id: 5, laundry_id: 1, label: 'Laundry A – Dryer 1', type: 'dryer', price_paise: 4000, slot_minutes: 45, amps: 0.50 },
      { id: 6, laundry_id: 1, label: 'Laundry A – Dryer 2', type: 'dryer', price_paise: 4000, slot_minutes: 45, amps: 0.50 },
      { id: 7, laundry_id: 1, label: 'Laundry A – Dryer 3', type: 'dryer', price_paise: 4000, slot_minutes: 45, amps: 0.50 },
      // Laundry B (IDs 8 to 14)
      { id: 8, laundry_id: 2, label: 'Laundry B – Washer 1', type: 'washer', price_paise: 6000, slot_minutes: 45, amps: 0.50 },
      { id: 9, laundry_id: 2, label: 'Laundry B – Washer 2', type: 'washer', price_paise: 6000, slot_minutes: 45, amps: 0.50 },
      { id: 10, laundry_id: 2, label: 'Laundry B – Washer 3', type: 'washer', price_paise: 6000, slot_minutes: 45, amps: 0.50 },
      { id: 11, laundry_id: 2, label: 'Laundry B – Washer 4', type: 'washer', price_paise: 6000, slot_minutes: 45, amps: 0.50 },
      { id: 12, laundry_id: 2, label: 'Laundry B – Dryer 1', type: 'dryer', price_paise: 4000, slot_minutes: 45, amps: 0.50 },
      { id: 13, laundry_id: 2, label: 'Laundry B – Dryer 2', type: 'dryer', price_paise: 4000, slot_minutes: 45, amps: 0.50 },
      { id: 14, laundry_id: 2, label: 'Laundry B – Dryer 3', type: 'dryer', price_paise: 4000, slot_minutes: 45, amps: 0.50 },
    ];

    for (const m of machineList) {
      await client.query(`
        INSERT INTO machines (id, laundry_id, label, type, price_paise, slot_minutes, active, out_of_service, run_threshold_amps)
        VALUES ($1, $2, $3, $4, $5, $6, true, false, $7)
        ON CONFLICT (id) DO UPDATE
        SET label = EXCLUDED.label, type = EXCLUDED.type, price_paise = EXCLUDED.price_paise, slot_minutes = EXCLUDED.slot_minutes
      `, [m.id, m.laundry_id, m.label, m.type, m.price_paise, m.slot_minutes, m.amps]);

      // Seed machine_state
      await client.query(`
        INSERT INTO machine_state (machine_id, state, last_seen, updated_at)
        VALUES ($1, 'idle', NOW(), NOW())
        ON CONFLICT (machine_id) DO NOTHING
      `, [m.id]);
    }

    // Reset sequences to prevent duplicate key errors on future inserts
    await client.query(`SELECT setval('students_id_seq', (SELECT MAX(id) FROM students));`);
    await client.query(`SELECT setval('laundries_id_seq', (SELECT MAX(id) FROM laundries));`);
    await client.query(`SELECT setval('machines_id_seq', (SELECT MAX(id) FROM machines));`);

    await client.query('COMMIT');
    console.log('Database seeded successfully: 1 staff, 3 students, 2 laundries, 14 machines.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error seeding database:', err);
    throw err;
  } finally {
    client.release();
  }
}

if (process.argv[1] === (import.meta.url ? new URL(import.meta.url).pathname : '')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
