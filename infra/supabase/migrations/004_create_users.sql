-- Migration 004: users table
-- Fixed: CREATE TYPE does not support IF NOT EXISTS in PostgreSQL
-- Use DO block with exception handling instead

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('viewer', 'analyst', 'admin');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS users (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  username        VARCHAR(50)  NOT NULL UNIQUE,
  email           VARCHAR(100) NOT NULL UNIQUE,
  hashed_password TEXT         NOT NULL,
  role            user_role    NOT NULL DEFAULT 'viewer',
  is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_role_active ON users(role, is_active);