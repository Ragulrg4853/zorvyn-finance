-- Dev seed data — run AFTER all 7 migrations
-- Passwords hashed from: admin123, analyst123, viewer123
-- Generate fresh: python -c "from passlib.context import CryptContext; print(CryptContext(['bcrypt']).hash('admin123'))"

INSERT INTO users (username, email, hashed_password, role) VALUES
  ('admin_user',   'admin@zorvyn.dev',   '$2b$12$4KIkubeECPaBOamTZ0HlA.7f56EkTp6RixvAqWr58zajEpypYC0VK',   'admin'::user_role),
  ('analyst_user', 'analyst@zorvyn.dev', '$2b$12$yDnDRvO9ne/1OszgRlrUMebfX9NZJTy.WJVfJBqsP7uMmIdWyMHtu', 'analyst'::user_role),
  ('viewer_user',  'viewer@zorvyn.dev',  '$2b$12$GVqRWFOwtuAoBRlTFMztPeaZqlxaBcPXGAhYrvPRJrb9FDiWAmjDm',  'viewer'::user_role)
ON CONFLICT (username) DO NOTHING;

INSERT INTO transactions (amount, type, category, date, notes, created_by)
  SELECT 85000.00, 'income'::transaction_type,  'Salary',        '2026-03-01'::date, 'March salary',     id FROM users WHERE username='admin_user' UNION ALL
  SELECT 12000.00, 'income'::transaction_type,  'Freelance',     '2026-03-10'::date, 'Design project',   id FROM users WHERE username='admin_user' UNION ALL
  SELECT 25000.00, 'expense'::transaction_type, 'Rent',          '2026-03-05'::date, 'Office rent',      id FROM users WHERE username='admin_user' UNION ALL
  SELECT  8500.00, 'expense'::transaction_type, 'Utilities',     '2026-03-08'::date, 'Electricity bill', id FROM users WHERE username='admin_user' UNION ALL
  SELECT  3200.00, 'expense'::transaction_type, 'Food',          '2026-03-15'::date, 'Team lunch',       id FROM users WHERE username='admin_user' UNION ALL
  SELECT 90000.00, 'income'::transaction_type,  'Salary',        '2026-04-01'::date, 'April salary',     id FROM users WHERE username='admin_user' UNION ALL
  SELECT 15000.00, 'expense'::transaction_type, 'Entertainment', '2026-04-02'::date, NULL,               id FROM users WHERE username='admin_user';