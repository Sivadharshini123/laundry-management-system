-- Migration 001: Initial Schema
-- Enables btree_gist extension and creates core tables

CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- Students and Staff table
CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  college_email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'student',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Laundries
CREATE TABLE IF NOT EXISTS laundries (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  opening_hours VARCHAR(100) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true
);

-- Machines
CREATE TABLE IF NOT EXISTS machines (
  id SERIAL PRIMARY KEY,
  laundry_id INTEGER NOT NULL REFERENCES laundries(id) ON DELETE CASCADE,
  label VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('washer', 'dryer')),
  price_paise INTEGER NOT NULL,
  slot_minutes INTEGER NOT NULL DEFAULT 45,
  active BOOLEAN NOT NULL DEFAULT true,
  out_of_service BOOLEAN NOT NULL DEFAULT false,
  run_threshold_amps NUMERIC(4,2) NOT NULL DEFAULT 0.50
);

-- Machine Current State
CREATE TABLE IF NOT EXISTS machine_state (
  machine_id INTEGER PRIMARY KEY REFERENCES machines(id) ON DELETE CASCADE,
  state VARCHAR(50) NOT NULL CHECK (state IN ('idle', 'running', 'done', 'offline')),
  last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bookings with slot timing check and overlap EXCLUDE constraint
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  machine_id INTEGER NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
  slot_start TIMESTAMPTZ NOT NULL,
  slot_end TIMESTAMPTZ NOT NULL,
  hold_expires_at TIMESTAMPTZ,
  amount_paise INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('pending_payment', 'paid', 'running', 'completed', 'failed', 'cancelled', 'expired', 'refunded')),
  razorpay_order_id VARCHAR(255) UNIQUE,
  razorpay_payment_id VARCHAR(255),
  razorpay_refund_id VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT check_slot_order CHECK (slot_end > slot_start),
  CONSTRAINT exclude_overlapping_slots EXCLUDE USING gist (
    machine_id WITH =,
    tstzrange(slot_start, slot_end) WITH &&
  ) WHERE (status IN ('pending_payment', 'paid', 'running'))
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
  razorpay_order_id VARCHAR(255) UNIQUE,
  razorpay_payment_id VARCHAR(255) UNIQUE,
  amount_paise INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL,
  raw_webhook_id VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Refunds table
CREATE TABLE IF NOT EXISTS refunds (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
  payment_id INTEGER REFERENCES payments(id) ON DELETE SET NULL,
  amount_paise INTEGER NOT NULL,
  reason_code VARCHAR(100) NOT NULL,
  razorpay_refund_id VARCHAR(255),
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Machine telemetry events
CREATE TABLE IF NOT EXISTS machine_events (
  id BIGSERIAL PRIMARY KEY,
  machine_id INTEGER NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
  state VARCHAR(50) NOT NULL,
  amps NUMERIC(5,2) NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_machine_events_machine_recorded ON machine_events(machine_id, recorded_at DESC);

-- Waiting List
CREATE TABLE IF NOT EXISTS waiting_list (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  machine_id INTEGER NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
  slot_start TIMESTAMPTZ NOT NULL,
  offered_at TIMESTAMPTZ,
  offer_expires_at TIMESTAMPTZ,
  status VARCHAR(50) NOT NULL DEFAULT 'waiting'
);

-- In-app notifications
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit log
CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  actor_id INTEGER REFERENCES students(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity VARCHAR(100) NOT NULL,
  entity_id INTEGER,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  user_text TEXT NOT NULL,
  bot_text TEXT NOT NULL,
  tools_used JSONB,
  docs_used JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
