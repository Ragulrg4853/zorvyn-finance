-- Migration 005: transactions table
-- Fixed: same DO block pattern for CREATE TYPE

DO $$ BEGIN
    CREATE TYPE transaction_type AS ENUM ('income', 'expense');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS transactions (
  id          UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
  amount      NUMERIC(12, 2)   NOT NULL CHECK (amount > 0),
  type        transaction_type NOT NULL,
  category    VARCHAR(100)     NOT NULL,
  date        DATE             NOT NULL,
  notes       TEXT,
  is_deleted  BOOLEAN          NOT NULL DEFAULT FALSE,
  created_by  UUID             NOT NULL REFERENCES users(id),
  created_at  TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_txn_date_type ON transactions(date, type) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_txn_category  ON transactions(category)   WHERE is_deleted = FALSE;