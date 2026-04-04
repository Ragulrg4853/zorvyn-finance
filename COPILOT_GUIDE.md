# COPILOT_GUIDE.md — Session-by-Session Development Guide

## First Prompt (paste this into Copilot Chat before anything else)

```
I am building Zorvyn Finance — a full-stack finance dashboard with RBAC and JWT auth.
Please read these files in order before we write any code:
1. README.md
2. CLAUDE.md
3. AGENTS.md

Confirm you understand:
- The 3-layer architecture: Router -> Service -> Repository (backend)
- The 3-layer architecture: Service -> Hook -> Component (frontend)
- The unified response envelope format
- Permission string format ("transactions:write" not role name checks)
- Soft delete behaviour (is_deleted=True, never db.delete())

Do not write any code yet. Just confirm understanding.
```

---

## Session 1 — Shared Models + Database (apps/api/shared/)

**Files to work on:**
- shared/database.py (already written — review only)
- shared/models/user.py (already written — review only)
- shared/models/transaction.py (already written — review only)
- shared/models/audit_log.py (already written — review only)
- shared/models/__init__.py (already written — review only)

**Copilot Prompt:**
```
Context: apps/api/shared/ — database and ORM models
Constitutions: CLAUDE.md #55 (resource lifetime), #61 (correct-by-construction),
               #12 (UTC timestamps), #9 (soft delete), #69 (migration immutability)

Task: Review shared/database.py and all files in shared/models/.
      Verify these exact things:
      1. database.py uses try/finally in get_db() for session cleanup
      2. User model has UUID primary key, correct role enum, UTC timestamps
      3. Transaction model has Decimal(12,2) amount, soft delete is_deleted field
      4. AuditLog model is append-only (no updated_at column)
      5. shared/models/__init__.py imports all three models
      6. No business logic anywhere in model files

Fix any issues found. Do not add new fields not in README.md schema.
```

---

## Session 2 — Shared Middleware + Utils (apps/api/shared/)

**Files to work on:**
- shared/utils/security.py (already written — review)
- shared/utils/logger.py (already written — review)
- shared/utils/error_taxonomy.py (already written — review)
- shared/middleware/correlation_id.py (already written — review)
- shared/middleware/rate_limiter.py (already written — review)
- shared/middleware/rbac.py (already written — review + complete TODO)
- shared/middleware/audit_logger.py (already written — review)

**Copilot Prompt:**
```
Context: apps/api/shared/middleware/ and apps/api/shared/utils/
Constitutions: CLAUDE.md #19 (typed errors), #22 (tracing), #36 (logging),
               #37 (no sensitive data), #42 (boundary validation)

Task: Review all middleware and utility files.
      Then complete this TODO in shared/middleware/rbac.py:
      The require_permission() function has a comment:
        "TODO(session-5): Load permissions from DB role_permissions table"
      For now, implement a DB-backed version that:
        1. Queries role_permissions JOIN permissions WHERE role_id matches current user role
        2. Falls back to DEFAULT_PERMISSIONS dict if DB query fails
        3. Caches nothing (real-time permission check every request)
      
      This makes RBAC dynamic — admin can change permissions at runtime.
      Keep the function signature identical: require_permission(permission: str)
```

---

## Session 3 — Auth Micro App (apps/api/micro_apps/auth/)

**Files to work on:** All files already written. Review and verify.

**Copilot Prompt:**
```
Context: apps/api/micro_apps/auth/
Constitutions: CLAUDE.md #8, #16, #19, #20, #26, #42

Task: Review all four files (schemas.py, repository.py, service.py, router.py).
      Verify these exact things:
      1. schemas.py: username min 3 chars, alphanumeric+underscore, password min 8 chars
      2. repository.py: pure DB queries only, no business logic
      3. service.py:
         - register_user raises AUTH_001 for duplicate username
         - register_user raises AUTH_002 for duplicate email
         - authenticate_user raises AUTH_003 for wrong credentials
         - authenticate_user raises AUTH_004 for inactive account
         - NO DB queries in service (all DB work delegated to repository)
      4. router.py:
         - Every response uses the envelope: {data, meta:{correlation_id}, error:null}
         - NO business logic (only calls service functions)
         - /logout returns 204 No Content

Then run: pytest micro_apps/auth/tests/test_service.py -v
All 7 tests must pass before moving to Session 4.
```

---

## Session 4 — Users Micro App (apps/api/micro_apps/users/)

**Files to work on:**
- users/schemas.py (already written — review only)
- users/repository.py (has TODOs — implement)
- users/service.py (has TODOs — implement)
- users/router.py (has TODO — implement)

**Copilot Prompt:**
```
Context: apps/api/micro_apps/users/
Constitutions: CLAUDE.md #8, #16, #19, #26, #42, #59

Task: Implement users/repository.py, users/service.py, users/router.py.
      Follow AGENTS.md templates exactly.

repository.py — implement these 5 functions:
  list_users(db, role?, is_active?, page, page_size) -> (List[User], int total)
    Use .filter() for optional params. ORDER BY created_at DESC.
    Use .offset((page-1)*page_size).limit(page_size) for pagination.

  get_by_id(db, user_id: UUID) -> User | None
    db.query(User).filter(User.id == user_id).first()

  create_user(db, username, email, hashed_password, role) -> User
    Instantiate User, db.add, db.commit, db.refresh, return.

  update_user(db, user: User, updates: dict) -> User
    for k,v in updates.items(): setattr(user, k, v)
    db.commit(); db.refresh(user); return user

  deactivate_user(db, user: User) -> User
    user.is_active = False; db.commit(); return user
    NEVER call db.delete() — Constitution #9.

service.py — implement these 5 functions per AGENTS.md service template:
  list_users: pass-through to repository, return List[UserRead]
  create_user: check username unique (AUTH_001), email unique (AUTH_002), hash password
  get_user: fetch by ID, raise USER_001 if not found
  update_user: guard self-demotion (RBAC_002), apply updates
  deactivate_user: guard self-deactivation, call repository

router.py — implement 5 endpoints:
  GET / POST / GET /{id} / PATCH /{id} / DELETE /{id}
  All require: require_permission("users:manage")
  All use: correlation_id = Depends(get_correlation_id)
  All return: {data:..., meta:{correlation_id:...}, error:null}
  DELETE returns 204 No Content.

Security: Every endpoint has require_permission("users:manage") — no exceptions.
```

---

## Session 5 — Roles Micro App (apps/api/micro_apps/roles/)

**Files to work on:**
- roles/schemas.py (already written — review only)
- roles/repository.py (empty — implement)
- roles/service.py (empty — implement)
- roles/router.py (has TODO — implement)

**Copilot Prompt:**
```
Context: apps/api/micro_apps/roles/
Constitutions: CLAUDE.md #26, #60, ARCHITECTURE.md #6, #21

Create ORM models for roles, permissions, role_permissions first.
Add to shared/models/ as role.py and permission.py.

Role model:    id, name, description, created_at
Permission:    id, name, description, created_at
RolePermission: role_id (FK), permission_id (FK), composite PK

repository.py — implement:
  list_roles(db) -> List[Role]
    Use joinedload(Role.permissions) to avoid N+1. ORDER BY name ASC.

  get_role_by_id(db, role_id) -> Role | None
    With joinedload(Role.permissions).

  list_permissions(db) -> List[Permission]
    All permissions, ORDER BY name ASC.

  assign_permissions(db, role_id, grant_ids, revoke_ids) -> Role
    For each grant_id: add RolePermission row if not exists.
    For each revoke_id: delete RolePermission row if exists.
    Return refreshed role with permissions.

service.py — implement:
  list_roles, get_role, list_permissions: pass-through to repository
  update_role_permissions(db, role_id, payload: PermissionAssign) -> RoleRead
    Guard: cannot revoke roles:manage from admin role (would lock everyone out)
    Raise 400 if attempted.

router.py — implement 4 endpoints:
  GET  /roles
  GET  /roles/{role_id}
  PATCH /roles/{role_id}/permissions
  GET  /permissions
  All require: require_permission("roles:manage")
```

---

## Session 6 — Transactions Micro App (apps/api/micro_apps/transactions/)

**Files to work on:** All files already written. Review and verify.

**Copilot Prompt:**
```
Context: apps/api/micro_apps/transactions/
Constitutions: CLAUDE.md #8, #13, #48, #71

Task: Review all files. Verify:
  1. /export route declared BEFORE /{transaction_id} to avoid routing conflict
  2. Pagination formula: total_pages = -(-total // page_size)  (ceiling division)
  3. soft_delete in repository sets is_deleted=True, never calls db.delete()
  4. CSV export header: id, date, type, category, amount, notes
  5. All 5 endpoints use correct permission strings
  6. repository list_filtered filters are all additive AND logic
  7. schemas.py validates amount > 0 at Pydantic level

Run: pytest micro_apps/transactions/tests/test_service.py -v
All tests must pass.
```

---

## Session 7 — Dashboard Micro App (apps/api/micro_apps/dashboard/)

**Files to work on:** Already written. Review and verify.

**Copilot Prompt:**
```
Context: apps/api/micro_apps/dashboard/
Constitutions: CLAUDE.md #48 (read-path optimization), #13 (O(n) single pass)

Task: Review dashboard/service.py compute_summary() and compute_insights().
      Verify the algorithm:
      1. Single DB fetch (one query, no second query)
      2. Single O(n) pass builds total_income, total_expense, AND monthly dict simultaneously
      3. Recent 10 transactions: sorted in Python, NOT a second DB query
      4. monthly_trends: last 12 months only (slice [-12:] after sort)
      5. compute_insights: single pass builds income_by_category AND expense_by_category
      6. Both return top 10 categories max (slice [:10] after sort by -total)

      Review dashboard/router.py:
      1. /summary endpoint has date_from and date_to query params
      2. /insights requires dashboard:insights permission (not dashboard:read)
      3. /live returns StreamingResponse with media_type="text/event-stream"
      4. SSE stream sends "event: summary_updated" every 10 seconds
```

---

## Session 8 — Audit Micro App + All Backend Tests

**Files to work on:**
- audit/router.py (has TODO — implement)
- All tests/ folders

**Copilot Prompt:**
```
Context: apps/api/micro_apps/audit/ and all micro_apps/*/tests/
Constitutions: CLAUDE.md #29, #30, #72, #73, #74

Task 1 — implement audit/router.py:
  GET /logs  [audit:read]
  Query params: user_id?, action?, resource?, date_from?, date_to?, page(default 1), page_size(default 20, max 100)
  Returns PaginatedResponse with AuditLogRead items, ORDER BY created_at DESC.
  AuditLogRead schema fields: id, user_id, action, resource_type, resource_id,
                               old_value, new_value, ip_address, correlation_id, created_at

Task 2 — write missing tests:
  For each micro app that lacks tests, create test_service.py following this pattern:
  
  File header: docstring listing edge cases covered and intentionally skipped
  Test classes: one class per service function
  Test names: "should_[expected]_when_[condition]"
  Structure: Arrange (blank line) Act (blank line) Assert

  Minimum tests per micro app:
  Users:        duplicate username, self-demotion guard, deactivate self guard, not found
  Roles:        revoke roles:manage from admin (should be blocked)
  Dashboard:    empty dataset returns zeros, date filter works
  Audit:        logged events queryable, pagination works

Run: pytest -v from apps/api/
All tests must pass before moving to frontend sessions.
```

---

## Session 9 — Web Design Tokens + Layout (apps/web/src/shared/)

**Files to work on:**
- src/app/globals.css (already written — verify)
- src/shared/components/layout/Navbar.js (stub — implement)
- src/shared/components/feedback/ErrorState.js (stub — implement)
- src/shared/components/feedback/LoadingSpinner.js (already written — review)

**Copilot Prompt:**
```
Context: apps/web/src/shared/
Constitutions: CLAUDE.md #65 (API contract first), #66 (component responsibility),
               #67 (loading/error/empty), #68 (use client)

Task 1 — verify globals.css:
  All CSS variables from README.md design tokens section are defined.
  .card, .btn-primary, .btn-ghost, .input, .badge-*, .skeleton, .fade-in classes exist.

Task 2 — implement Navbar.js:
  'use client' at top.
  Props: { user, onLogout }
  Layout:
    - Fixed top, width 100%, height 64px
    - background: rgba(10,15,30,0.8), backdropFilter: blur(16px)
    - borderBottom: 1px solid var(--color-border), zIndex: 50
  Left: "Zorvyn Finance" in Syne font, color var(--color-primary)
  Center: nav links /dashboard /transactions /admin
    - Each link: style active with color var(--color-primary) and border-bottom teal
    - Use usePathname() from next/navigation to detect active
    - /admin link: only render if user.role === 'admin'
  Right: username text (color t2) + logout button (.btn-ghost, small)
  Mobile (max-width 768px): hide center links, show hamburger icon
    - hamburger opens a drawer using framer-motion AnimatePresence

Task 3 — implement ErrorState.js:
  Props: { message, onRetry, title }
  Glass card, centered, AlertCircle icon from lucide-react (red color)
  Title in Syne font, message in text-2 color
  Retry button only if onRetry prop provided
  
Run: npm run dev — app must load at localhost:3000 without console errors.
```

---

## Session 10 — Auth Frontend

**Files to work on:**
- src/micro-apps/auth/hooks/useAuth.js (stub — implement)
- src/micro-apps/auth/components/ProtectedRoute.js (stub — implement)
- src/app/(auth)/login/page.js (stub — implement)

**Copilot Prompt:**
```
Context: apps/web/src/micro-apps/auth/ and apps/web/src/app/(auth)/login/
Constitutions: CLAUDE.md #66, #67, #68

Task 1 — complete useAuth.js:
  The hook skeleton exists. Implement:
  - On mount: call AuthService.getCurrentUser() to restore session
    If 401: setUser(null). If success: setUser(data). Always: setLoading(false).
  - login(username, password): calls AuthService.login(), then getCurrentUser()
    On success: setUser(user), router.push('/dashboard')
    On error: setError(getErrorMessage(err))
  - logout(): calls AuthService.logout(), setUser(null), router.push('/login')
  - hasPermission(permission): return ROLE_PERMISSIONS[user.role].includes(permission)
  Return: { user, loading, error, login, logout, hasPermission, isAuthenticated }

Task 2 — implement ProtectedRoute.js:
  'use client'
  Props: { children, requiredPermission }
  const { user, loading, hasPermission } = useAuth();
  if (loading): return full-page skeleton (3 .skeleton divs stacked)
  if (!user): router.push('/login'); return null
  if (requiredPermission && !hasPermission(requiredPermission)):
    return overlay card with Lock icon, "Access Restricted" heading,
    "You need higher access level to view this page." text, back button

Task 3 — implement login/page.js:
  'use client'
  const { login, loading, error } = useAuth();
  Layout: full-page dark bg, centered glass card (max-width 400px, padding 2rem)
  Inside card:
    - "Zorvyn Finance" heading in Syne font, color gold
    - "Welcome back" sub-heading, color text-2
    - username input (.input class), label above
    - password input (.input class) + Eye/EyeOff toggle (lucide-react)
    - Error banner: red bg, shows error message if error exists
    - Submit button (.btn-primary, full width):
        shows LoadingSpinner while loading
        disabled when loading
    - framer-motion fadeIn on card mount (initial opacity:0, animate opacity:1)
  On submit: call login(username, password)
  Security: clear password field on error, never log credentials

Manual test: npm run dev -> /login -> wrong creds -> error banner appears
             correct creds -> redirect to /dashboard
```

---

## Session 11 — Dashboard Frontend

**Files to work on:**
- src/micro-apps/dashboard/hooks/useDashboard.js (stub — implement)
- src/micro-apps/dashboard/components/SummaryCard.js (stub — implement)
- src/micro-apps/dashboard/components/TrendChart.js (stub — implement)
- Create: CategoryBreakdown.js and RecentActivity.js
- src/app/dashboard/page.js (stub — implement)

**Copilot Prompt:**
```
Context: apps/web/src/micro-apps/dashboard/
Constitutions: CLAUDE.md #48, #66, #67

Task 1 — implement useDashboard.js:
  Props/params: { dateFrom, dateTo, hasInsightsPermission }
  State: { summary, insights, loading, error }
  On mount and when date params change:
    setLoading(true)
    await DashboardService.fetchSummary(dateFrom, dateTo) -> setSummary
    if hasInsightsPermission: await DashboardService.fetchInsights() -> setInsights
    setLoading(false)
    On error: setError(getErrorMessage(err))
  Live: connect SSE on mount, update summary on "summary_updated" event, cleanup on unmount
  Return: { summary, insights, loading, error, refetch }

Task 2 — implement SummaryCard.js:
  Props: { title, value, trend, type, loading }
  If loading: return .card with .skeleton placeholder
  Visual: glass .card, icon (TrendingUp/TrendingDown/Scale/Activity from lucide-react)
  Value: large text (2rem), color matches type (income=green, expense=red, net=conditional)
  Trend: small badge with arrow, green if positive, red if negative
  framer-motion: fadeIn with delay prop for stagger effect

Task 3 — implement TrendChart.js:
  Props: { data, loading }
  If loading: .card with .skeleton h-80
  If empty: centered "No transaction data yet" text
  Recharts ResponsiveContainer height=320
  Three lines: income (--color-income), expense (--color-expense), net (--color-primary)
  Custom dark tooltip: bg #1a2235, border 1px solid teal, shows all three values
  XAxis: month labels formatted "Mar '26"

Task 4 — create CategoryBreakdown.js:
  Props: { data, loading, locked }
  If locked: show .card with Lock icon overlay, "Analyst access required" text
  Recharts PieChart/Donut for income_by_category and expense_by_category
  Side by side layout (or stacked on mobile)

Task 5 — create RecentActivity.js:
  Props: { transactions, loading }
  List of last 10 transactions, each row:
    date | category | .badge-income or .badge-expense | amount (colored)

Task 6 — implement dashboard/page.js:
  'use client'
  const { user, hasPermission } = useAuth();
  Wrap with ProtectedRoute (no requiredPermission — all roles)
  Date range: two date inputs, controlled state, passed to useDashboard
  Layout: Navbar -> date filter -> 4 SummaryCards grid -> TrendChart -> (CategoryBreakdown + RecentActivity)
  CategoryBreakdown: locked prop = !hasPermission('dashboard:insights')
```

---

## Session 12 — Transactions Frontend

**Copilot Prompt:**
```
Context: apps/web/src/micro-apps/transactions/
Constitutions: CLAUDE.md #66, #67

Create these files:

hooks/useTransactions.js:
  State: { transactions, loading, error, meta }
  Filters state: type, category, date_from, date_to, search, sort, order, page, page_size
  useEffect: refetch when any filter changes
  Return: { transactions, loading, error, meta, filters, setFilters, refetch }

components/TransactionTable.js:
  Props: { transactions, loading, error, meta, canWrite, onEdit, onDelete, onPageChange }
  Loading: show skeleton rows (same height as real rows, 5 rows)
  Empty: "No transactions found" with search icon
  Columns: date | category | type badge | amount (colored) | notes (truncated) | actions
  Actions column: only render if canWrite prop is true
  Sort on column header click (toggle asc/desc, show arrow indicator)

components/TransactionFilters.js:
  Props: { filters, onChange }
  Type dropdown: All / Income / Expense
  Category text input (partial match)
  Date range: two date inputs (date_from, date_to)
  Search input (searches notes + category)
  "Clear" button: resets all filters to default

components/TransactionForm.js:
  Props: { transaction?, onSuccess, onCancel }
  Modal form for create and edit
  Fields: amount (number, required), type (select), category (select from CATEGORIES constant),
          date (date picker, required), notes (textarea, optional)
  Client-side validation before submit: amount > 0, type required, category required
  On submit: createTransaction or updateTransaction, then call onSuccess
  On error: show inline error banner with message from getErrorMessage()

components/ExportButton.js:
  Props: { filters }
  Button (.btn-ghost): "Export CSV"
  On click: call TransactionService.exportTransactions(filters)
  Show LoadingSpinner while exporting, re-enable after done

transactions/page.js:
  Wrap: ProtectedRoute requiredPermission="transactions:read"
  { user, hasPermission } = useAuth()
  Toolbar: TransactionFilters (left) + ExportButton (analyst+, right) + New button (admin, right)
  Table: TransactionTable with canWrite={hasPermission('transactions:write')}
  Modal: TransactionForm when New or Edit clicked
  Pagination: prev/next buttons, page counter
```

---

## Session 13 — Admin Frontend

**Copilot Prompt:**
```
Context: apps/web/src/micro-apps/admin/ and apps/web/src/app/admin/
Constitutions: CLAUDE.md #66, #67

Create these files:

services/UserService.js:
  fetchUsers(filters), createUser(payload), updateUser(id, payload), deactivateUser(id)
  All follow AGENTS.md service template.

services/RoleService.js:
  fetchRoles(), fetchPermissions(), assignPermissions(roleId, {grant, revoke})

hooks/useUsers.js:
  State: { users, loading, error, meta }
  Filters: role, is_active, page, page_size
  Return: { users, loading, error, meta, filters, setFilters, refetch, createUser, updateUser, deactivateUser }

hooks/useRoles.js:
  State: { roles, permissions, loading, error }
  Return: { roles, permissions, loading, error, updatePermissions }

components/UserTable.js:
  Columns: username | email | role (badge) | status (badge) | created_at | actions
  Action column: RoleSelector dropdown + Deactivate button
  Current user's own row: disable action buttons, tooltip "Cannot modify your own account"
  Deactivated users: opacity 0.5, "Inactive" badge

components/RoleSelector.js:
  Props: { userId, currentRole, onRoleChange, disabled }
  Inline dropdown showing current role
  On change: call UserService.updateUser(userId, {role: newRole})
  Disable if disabled prop true

components/PermissionMatrix.js:
  Props: { roles, permissions, onUpdate }
  Grid: rows=roles, columns=permissions
  Cell: checkbox (checked if role has permission)
  On toggle: call RoleService.assignPermissions()
  Admin's roles:manage permission: always checked, not toggleable (guard)

components/AuditLogViewer.js:
  Paginated table of audit logs
  Columns: timestamp | user | action | resource | resource_id | correlation_id
  Filter: action input, date_from, date_to

admin/page.js:
  ProtectedRoute requiredPermission="users:manage"
  "User Management" heading + "Invite User" button + "Manage Permissions" link
  UserTable from useUsers() hook

admin/roles/page.js:
  ProtectedRoute requiredPermission="roles:manage"
  PermissionMatrix from useRoles() hook
  Below: AuditLogViewer (recent audit trail)
```

---

## Session 14 — Tests + Deploy

**Copilot Prompt:**
```
Context: apps/web/tests/ and deployment
Constitutions: CLAUDE.md #72, #73, #74

Task 1 — write frontend tests:
  tests/unit/AuthService.test.js:
    "should call login endpoint with form-data format"
    "should set auth token after successful login"
    "should clear token on logout"

  tests/unit/useAuth.test.js:
    "should set loading false after session check"
    "should redirect to login when unauthenticated"
    "should return correct hasPermission for viewer role"

  tests/unit/SummaryCard.test.js:
    "should render skeleton when loading is true"
    "should display income value in green"
    "should display negative net balance in red"

Task 2 — deploy backend to Railway:
  1. Push code to GitHub
  2. Go to railway.app -> New Project -> Deploy from GitHub
  3. Select zorvyn-finance repo -> select apps/api as root
  4. Add environment variables:
     DATABASE_URL (from Supabase)
     SECRET_KEY
     ALGORITHM=HS256
     ACCESS_TOKEN_EXPIRE_MINUTES=480
  5. Railway auto-detects requirements.txt and deploys
  6. Copy the Railway URL

Task 3 — deploy frontend to Vercel:
  1. Go to vercel.com -> New Project -> import from GitHub
  2. Framework: Next.js
  3. Root Directory: apps/web
  4. Add environment variable:
     NEXT_PUBLIC_API_URL = your Railway URL from Task 2
  5. Deploy
  6. Test: visit Vercel URL -> login -> dashboard loads

Task 4 — update README.md:
  Add "Live Demo" section at top with both URLs.
  Update CORS in apps/api/main.py to allow the Vercel domain.
```
