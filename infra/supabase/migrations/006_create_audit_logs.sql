-- Migration 006: audit_logs — append-only, never updated or deleted.
CREATE TABLE IF NOT EXISTS audit_logs (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID         REFERENCES users(id),
  action         VARCHAR(100) NOT NULL,
  resource_type  VARCHAR(100) NOT NULL,
  resource_id    TEXT,
  old_value      TEXT,
  new_value      TEXT,
  ip_address     VARCHAR(45),
  user_agent     VARCHAR(500),
  correlation_id TEXT,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_user_id    ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action     ON audit_logs(action);
