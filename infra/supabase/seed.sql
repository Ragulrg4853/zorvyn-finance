-- Dev seed data — run AFTER all 7 migrations
-- Passwords hashed from: admin123, analyst123, viewer123
-- Generate fresh: python -c "from passlib.context import CryptContext; print(CryptContext(['bcrypt']).hash('admin123'))"

INSERT INTO users (username, email, hashed_password, role) VALUES
  ('admin_user',   'admin@zorvyn.dev',   '$2b$12$4KIkubeECPaBOamTZ0HlA.7f56EkTp6RixvAqWr58zajEpypYC0VK',   'admin'::user_role),
  ('analyst_user', 'analyst@zorvyn.dev', '$2b$12$yDnDRvO9ne/1OszgRlrUMebfX9NZJTy.WJVfJBqsP7uMmIdWyMHtu', 'analyst'::user_role),
  ('viewer_user',  'viewer@zorvyn.dev',  '$2b$12$GVqRWFOwtuAoBRlTFMztPeaZqlxaBcPXGAhYrvPRJrb9FDiWAmjDm',  'viewer'::user_role)
ON CONFLICT (username) DO NOTHING;

INSERT INTO transactions (amount, type, category, date, notes, created_by)
SELECT * FROM (VALUES
  (95000.00, 'income'::transaction_type,  'Salary',        '2026-01-01'::date, 'January salary',    (SELECT id FROM users WHERE username='admin_user')),
  (15000.00, 'income'::transaction_type,  'Freelance',     '2026-01-15'::date, 'Design work',       (SELECT id FROM users WHERE username='admin_user')),
  (28000.00, 'expense'::transaction_type, 'Rent',          '2026-01-05'::date, 'Office rent Jan',   (SELECT id FROM users WHERE username='admin_user')),
  (9200.00,  'expense'::transaction_type, 'Utilities',     '2026-01-08'::date, 'Electricity Jan',   (SELECT id FROM users WHERE username='admin_user')),
  (95000.00, 'income'::transaction_type,  'Salary',        '2026-02-01'::date, 'February salary',   (SELECT id FROM users WHERE username='admin_user')),
  (18000.00, 'income'::transaction_type,  'Investment',    '2026-02-10'::date, 'Dividend payout',   (SELECT id FROM users WHERE username='admin_user')),
  (28000.00, 'expense'::transaction_type, 'Rent',          '2026-02-05'::date, 'Office rent Feb',   (SELECT id FROM users WHERE username='admin_user')),
  (5500.00,  'expense'::transaction_type, 'Food',          '2026-02-20'::date, 'Team lunch',        (SELECT id FROM users WHERE username='admin_user')),
  (95000.00, 'income'::transaction_type,  'Salary',        '2026-03-01'::date, 'March salary',      (SELECT id FROM users WHERE username='admin_user')),
  (22000.00, 'income'::transaction_type,  'Freelance',     '2026-03-12'::date, 'Consulting project',(SELECT id FROM users WHERE username='admin_user')),
  (28000.00, 'expense'::transaction_type, 'Rent',          '2026-03-05'::date, 'Office rent Mar',   (SELECT id FROM users WHERE username='admin_user')),
  (11000.00, 'expense'::transaction_type, 'Healthcare',    '2026-03-18'::date, 'Insurance premium', (SELECT id FROM users WHERE username='admin_user')),
  (95000.00, 'income'::transaction_type,  'Salary',        '2026-04-01'::date, 'April salary',      (SELECT id FROM users WHERE username='admin_user')),
  (30000.00, 'income'::transaction_type,  'Dividend',      '2026-04-03'::date, 'Q1 dividend',       (SELECT id FROM users WHERE username='admin_user')),
  (28000.00, 'expense'::transaction_type, 'Rent',          '2026-04-05'::date, 'Office rent Apr',   (SELECT id FROM users WHERE username='admin_user')),
  (15000.00, 'expense'::transaction_type, 'Entertainment', '2026-04-02'::date, NULL,                (SELECT id FROM users WHERE username='admin_user')),
  (3200.00,  'expense'::transaction_type, 'Food',          '2026-04-06'::date, 'Team event',        (SELECT id FROM users WHERE username='admin_user')),
  (8500.00,  'expense'::transaction_type, 'Utilities',     '2026-03-08'::date, 'Electricity Mar',   (SELECT id FROM users WHERE username='admin_user')),
  (12000.00, 'income'::transaction_type,  'Rental',        '2026-02-28'::date, 'Property rental',   (SELECT id FROM users WHERE username='admin_user')),
  (4500.00,  'expense'::transaction_type, 'Transport',     '2026-03-25'::date, 'Monthly travel',    (SELECT id FROM users WHERE username='admin_user'))
) AS t(amount, type, category, date, notes, created_by);