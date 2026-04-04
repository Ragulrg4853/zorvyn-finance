-- Dev seed data — run AFTER all 7 migrations
-- Passwords hashed from: admin123, analyst123, viewer123
-- Generate fresh: python -c "from passlib.context import CryptContext; print(CryptContext(['bcrypt']).hash('admin123'))"

INSERT INTO users (username, email, hashed_password, role) VALUES
  ('admin_user',   'admin@zorvyn.dev',   '$2b$12$REPLACE_WITH_REAL_ADMIN_HASH',   'admin'),
  ('analyst_user', 'analyst@zorvyn.dev', '$2b$12$REPLACE_WITH_REAL_ANALYST_HASH', 'analyst'),
  ('viewer_user',  'viewer@zorvyn.dev',  '$2b$12$REPLACE_WITH_REAL_VIEWER_HASH',  'viewer')
ON CONFLICT (username) DO NOTHING;

INSERT INTO transactions (amount, type, category, date, notes, created_by)
  SELECT 85000.00, 'income',  'Salary',        '2026-03-01', 'March salary',     id FROM users WHERE username='admin_user' UNION ALL
  SELECT 12000.00, 'income',  'Freelance',     '2026-03-10', 'Design project',   id FROM users WHERE username='admin_user' UNION ALL
  SELECT 25000.00, 'expense', 'Rent',          '2026-03-05', 'Office rent',      id FROM users WHERE username='admin_user' UNION ALL
  SELECT  8500.00, 'expense', 'Utilities',     '2026-03-08', 'Electricity bill', id FROM users WHERE username='admin_user' UNION ALL
  SELECT  3200.00, 'expense', 'Food',          '2026-03-15', 'Team lunch',       id FROM users WHERE username='admin_user' UNION ALL
  SELECT 90000.00, 'income',  'Salary',        '2026-04-01', 'April salary',     id FROM users WHERE username='admin_user' UNION ALL
  SELECT 15000.00, 'expense', 'Entertainment', '2026-04-02', NULL,               id FROM users WHERE username='admin_user';
