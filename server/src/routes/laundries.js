import express from 'express';
import { pool } from '../db/index.js';

const router = express.Router();

// List all active laundries with machine counts
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT l.*,
        COUNT(m.id) FILTER (WHERE m.active = true) as total_machines,
        COUNT(m.id) FILTER (WHERE m.active = true AND m.type = 'washer') as total_washers,
        COUNT(m.id) FILTER (WHERE m.active = true AND m.type = 'dryer') as total_dryers
      FROM laundries l
      LEFT JOIN machines m ON l.id = m.laundry_id
      WHERE l.active = true
      GROUP BY l.id
      ORDER BY l.id ASC
    `);

    res.json({ laundries: result.rows });
  } catch (err) {
    next(err);
  }
});

// Get laundry details by ID
router.get('/:id', async (req, res, next) => {
  const laundryId = parseInt(req.params.id, 10);
  try {
    const result = await pool.query(`
      SELECT * FROM laundries
      WHERE id = $1 AND active = true
    `, [laundryId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Laundry not found' });
    }

    res.json({ laundry: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

export default router;
