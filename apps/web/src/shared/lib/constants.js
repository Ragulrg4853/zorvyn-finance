/**
 * Application-wide constants.
 * Constitution: CLAUDE.md #3 (explicit), #38 (configuration over hardcoding)
 */
export const ROLES = Object.freeze({
  VIEWER: 'viewer', ANALYST: 'analyst', ADMIN: 'admin',
});

export const PERMISSIONS = Object.freeze({
  DASHBOARD_READ:      'dashboard:read',
  DASHBOARD_INSIGHTS:  'dashboard:insights',
  TRANSACTIONS_READ:   'transactions:read',
  TRANSACTIONS_WRITE:  'transactions:write',
  TRANSACTIONS_DELETE: 'transactions:delete',
  TRANSACTIONS_EXPORT: 'transactions:export',
  USERS_READ:          'users:read',
  USERS_MANAGE:        'users:manage',
  ROLES_MANAGE:        'roles:manage',
  AUDIT_READ:          'audit:read',
});

export const TRANSACTION_TYPES = Object.freeze({ INCOME: 'income', EXPENSE: 'expense' });

export const INCOME_CATEGORIES  = Object.freeze(['Salary', 'Freelance', 'Sales', 'Investments', 'Other']);
export const EXPENSE_CATEGORIES = Object.freeze(['Subscriptions', 'Rent', 'Groceries', 'Dining', 'Transport', 'Utilities', 'Entertainment', 'Healthcare', 'Education', 'Other']);
export const ALL_CATEGORIES = Object.freeze([...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES]);

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE     = 100;

export const ROUTES = Object.freeze({
  LOGIN: '/login', DASHBOARD: '/dashboard',
  TRANSACTIONS: '/transactions', ADMIN: '/admin', ADMIN_ROLES: '/admin/roles',
});

export const ROLE_PERMISSIONS = Object.freeze({
  viewer:  ['dashboard:read', 'transactions:read'],
  analyst: ['dashboard:read','dashboard:insights','transactions:read','transactions:export'],
  admin:   Object.values(PERMISSIONS),
});
