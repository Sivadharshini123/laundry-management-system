import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { pool } from '../db/index.js';
import { config } from '../config.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { loginLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  college_email: z.string().email().refine(val => val.includes('@'), {
    message: 'Must be a valid college email address'
  }),
  password: z.string().min(6).max(100),
});

const loginSchema = z.object({
  college_email: z.string().email(),
  password: z.string().min(1),
});

// Student registration
router.post('/register', validateBody(registerSchema), async (req, res, next) => {
  const { name, college_email, password } = req.body;
  try {
    const existing = await pool.query('SELECT id FROM students WHERE college_email = $1', [college_email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(`
      INSERT INTO students (name, college_email, password_hash, role)
      VALUES ($1, $2, $3, 'student')
      RETURNING id, name, college_email, role, created_at
    `, [name, college_email, passwordHash]);

    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, email: user.college_email, role: user.role, name: user.name },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user
    });
  } catch (err) {
    next(err);
  }
});

// Login (Students & Staff) with rate limiting
router.post('/login', loginLimiter, validateBody(loginSchema), async (req, res, next) => {
  const { college_email, password } = req.body;
  try {
    const result = await pool.query(`
      SELECT id, name, college_email, password_hash, role
      FROM students
      WHERE college_email = $1
    `, [college_email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.college_email, role: user.role, name: user.name },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.college_email,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
});

// Get current user profile
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT id, name, college_email, role, created_at
      FROM students
      WHERE id = $1
    `, [req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

export default router;
