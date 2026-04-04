-- Migration 007: seed default roles and permissions
INSERT INTO roles (name, description) VALUES
  ('viewer',  'Read-only access to dashboard and transactions'),
  ('analyst', 'Read access, export, and category insights'),
  ('admin',   'Full system access including user and role management')
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (name, description) VALUES
  ('dashboard:read',       'View dashboard summary'),
  ('dashboard:insights',   'View category breakdowns and trend insights'),
  ('transactions:read',    'View transactions list and detail'),
  ('transactions:write',   'Create and update transactions'),
  ('transactions:delete',  'Soft-delete transactions'),
  ('transactions:export',  'Export transactions as CSV'),
  ('users:read',           'View user list and profiles'),
  ('users:manage',         'Create, update, and deactivate users'),
  ('roles:manage',         'Assign and revoke permissions from roles'),
  ('audit:read',           'View audit trail logs')
ON CONFLICT (name) DO NOTHING;

-- Viewer permissions
INSERT INTO role_permissions (role_id, permission_id)
  SELECT r.id, p.id FROM roles r, permissions p
  WHERE r.name = 'viewer'
    AND p.name IN ('dashboard:read', 'transactions:read')
ON CONFLICT DO NOTHING;

-- Analyst permissions
INSERT INTO role_permissions (role_id, permission_id)
  SELECT r.id, p.id FROM roles r, permissions p
  WHERE r.name = 'analyst'
    AND p.name IN ('dashboard:read','dashboard:insights',
                   'transactions:read','transactions:export')
ON CONFLICT DO NOTHING;

-- Admin gets all permissions
INSERT INTO role_permissions (role_id, permission_id)
  SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'admin'
ON CONFLICT DO NOTHING;
