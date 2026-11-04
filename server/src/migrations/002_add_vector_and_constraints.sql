-- Migration 002: Vector Extension and Knowledge Chunks
DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS "vector";
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'vector extension is not installed in the database; creating table with fallback vector/text type';
END
$$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vector') THEN
    CREATE TABLE IF NOT EXISTS knowledge_chunks (
      id SERIAL PRIMARY KEY,
      doc_slug VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      section_heading VARCHAR(255),
      audience VARCHAR(50) NOT NULL CHECK (audience IN ('public', 'staff')),
      version INTEGER NOT NULL DEFAULT 1,
      content TEXT NOT NULL,
      embedding VECTOR(1024),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  ELSE
    CREATE TABLE IF NOT EXISTS knowledge_chunks (
      id SERIAL PRIMARY KEY,
      doc_slug VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      section_heading VARCHAR(255),
      audience VARCHAR(50) NOT NULL CHECK (audience IN ('public', 'staff')),
      version INTEGER NOT NULL DEFAULT 1,
      content TEXT NOT NULL,
      embedding JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  END IF;
END
$$;

-- Create index on knowledge_chunks
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_doc_audience ON knowledge_chunks(doc_slug, audience);
