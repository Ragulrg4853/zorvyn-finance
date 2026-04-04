# Zorvyn Finance
## Production-Grade Finance Data Processing & Access Control Platform

> **GitHub Copilot:** Read this entire file before writing any code.
> Then read CLAUDE.md, AGENTS.md, and COPILOT_GUIDE.md in that order.

---

## Stack

| Layer       | Technology                                        |
|-------------|---------------------------------------------------|
| Frontend    | Next.js 14 (App Router), Tailwind CSS, Recharts, Framer Motion |
| Backend     | FastAPI (Python 3.11+)                            |
| Database    | Supabase (PostgreSQL) via SQLAlchemy 2.0          |
| Auth        | JWT (python-jose) + bcrypt (passlib)              |
| Validation  | Pydantic v2 (API) + Zod (Frontend)                |
| Testing     | Pytest + HTTPX (API), Jest + RTL (Web)            |
| Deployment  | Vercel (web) + Railway (api)                      |
| Platform    | PWA — works on Android, iOS, Windows, macOS       |

---

## Design Tokens (Use these in ALL components — never hardcode hex)

```
--color-bg:           #0a0f1e   deep navy background
--color-surface:      #111827   card background
--color-surface-2:    #1a2235   elevated surface
--color-border:       #1e2d45   subtle borders
--color-primary:      #00d4aa   teal — primary action
--color-primary-dim:  #00a885   teal hover
--color-gold:         #d4af37   headings, premium accent
--color-gold-dim:     #b8962e   gold hover
--color-text-1:       #f0f4ff   primary text
--color-text-2:       #8b9dc3   secondary text
--color-text-3:       #4a5568   placeholder text
--color-error:        #ef4444
--color-warning:      #f59e0b
--color-success:      #10b981
--color-income:       #22c55e
--color-expense:      #ef4444
```

Typography: Syne (headings) + Inter (body) — both from Google Fonts.

Component style:
- Cards: backdrop-filter blur(16px), bg rgba(17,24,39,0.8), border 1px solid rgba(0,212,170,0.1)
- Shadow: 0 8px 32px rgba(0,212,170,0.08)
- Radius: 12px cards, 8px inputs, 6px buttons
- Hover: translateY(-2px) + increased shadow
- Transitions: all 200ms ease-out

---

## Architecture

```
zorvyn-finance/
├── apps/api/           FastAPI backend
│   ├── micro_apps/     Six micro apps (auth, users, roles, transactions, dashboard, audit)
│   │   └── */          router.py | service.py | repository.py | schemas.py | tests/
│   └── shared/         database, models, middleware, utils
├── apps/web/           Next.js 14 frontend (PWA)
│   └── src/
│       ├── app/        Next.js App Router pages
│       ├── micro-apps/ Client micro apps (auth, dashboard, transactions, admin)
│       └── shared/     apiClient, constants, errorHandler, UI components
├── packages/           shared-types, shared-validators
└── infra/supabase/     migrations (001-007) + seed.sql
```

Layer rules (NEVER violate):
- Backend:  Router -> Service -> Repository (no cross-layer calls)
- Frontend: Service -> Hook -> Component (no API calls in components)

---

## User Roles and Permissions

| Permission           | Viewer | Analyst | Admin |
|----------------------|:------:|:-------:|:-----:|
| dashboard:read       | YES    | YES     | YES   |
| dashboard:insights   | NO     | YES     | YES   |
| transactions:read    | YES    | YES     | YES   |
| transactions:write   | NO     | NO      | YES   |
| transactions:delete  | NO     | NO      | YES   |
| transactions:export  | NO     | YES     | YES   |
| users:read           | NO     | NO      | YES   |
| users:manage         | NO     | NO      | YES   |
| roles:manage         | NO     | NO      | YES   |
| audit:read           | NO     | NO      | YES   |

RBAC rules:
1. Default role for new accounts = viewer
2. Permissions stored in DB — admin can modify at runtime via PATCH /v1/roles/{id}/permissions
3. Middleware checks permission strings, never role names
4. Deactivated users cannot authenticate
5. Admin cannot demote or deactivate themselves
6. 403 RBAC_001 for denied requests — never a redirect at API level

---

## Transaction Schema

```
id          UUID           primary key
amount      Decimal(12,2)  must be > 0 (enforced at schema + DB level)
type        ENUM           income | expense
category    VARCHAR(100)   required, trimmed, non-empty
date        DATE           transaction date (not created_at)
notes       TEXT           nullable
is_deleted  BOOLEAN        default false — soft delete only, never hard delete
created_by  UUID           FK to users.id
created_at  TIMESTAMPTZ    UTC, auto-set
updated_at  TIMESTAMPTZ    UTC, auto-updated
```

---

## API Reference

### Auth — /v1/auth (public)
```
POST /v1/auth/register   Body: {username, email, password}           -> 201
POST /v1/auth/login      Body: form-data username+password (OAuth2)  -> 200 token
GET  /v1/auth/me         Header: Bearer token                        -> 200 user
POST /v1/auth/logout     Header: Bearer token                        -> 204
```

### Users — /v1/users [users:manage]
```
GET    /v1/users           Query: role, is_active, page, page_size   -> paginated list
POST   /v1/users           Body: {username, email, password, role}   -> 201
GET    /v1/users/{id}                                                 -> UserRead
PATCH  /v1/users/{id}      Body: {email?, role?, is_active?}         -> UserRead
DELETE /v1/users/{id}      Effect: is_active=false (soft)            -> 204
```

### Roles — /v1 [roles:manage]
```
GET   /v1/roles                                                   -> List<RoleRead>
GET   /v1/roles/{id}                                              -> RoleRead
PATCH /v1/roles/{id}/permissions  Body: {grant:[uuid], revoke:[uuid]} -> RoleRead
GET   /v1/permissions                                             -> List<PermissionRead>
```

### Transactions — /v1/transactions
```
GET    /v1/transactions        [transactions:read]    Query: type,category,date_from,
                                                             date_to,search,sort,order,
                                                             page,page_size
POST   /v1/transactions        [transactions:write]   Body: {amount,type,category,date,notes?}
GET    /v1/transactions/{id}   [transactions:read]
PATCH  /v1/transactions/{id}   [transactions:write]   Body: partial
DELETE /v1/transactions/{id}   [transactions:delete]  Effect: is_deleted=true -> 204
GET    /v1/transactions/export [transactions:export]  -> CSV download
```

### Dashboard — /v1/dashboard
```
GET /v1/dashboard/summary   [dashboard:read]     Query: date_from?, date_to?
GET /v1/dashboard/insights  [dashboard:insights] Query: date_from?, date_to?
GET /v1/dashboard/live      [dashboard:read]     -> SSE stream (10s interval)
```

### Audit — /v1/audit
```
GET /v1/audit/logs  [audit:read]  Query: user_id?,action?,resource?,date_from?,date_to?,page
```

### System
```
GET /health  -> {status:ok, timestamp:UTC}
GET /ready   -> {status:ok, db:connected} or 503
GET /docs    -> Swagger UI (auto-generated by FastAPI)
GET /redoc   -> ReDoc
```

---

## Response Envelope (ALL endpoints use this shape)

Success:
```json
{"data": {}, "meta": {"correlation_id": "uuid"}, "error": null}
```

Paginated:
```json
{"data": [], "meta": {"total":100,"page":1,"page_size":20,"total_pages":5,"correlation_id":"uuid"}, "error": null}
```

Error:
```json
{"data": null, "meta": {"correlation_id":"uuid"}, "error": {"code":"AUTH_003","message":"...","field":null}}
```

---

## Error Code Registry

| Code            | HTTP | Meaning                         |
|-----------------|------|---------------------------------|
| AUTH_001        | 400  | Username already taken          |
| AUTH_002        | 400  | Email already registered        |
| AUTH_003        | 401  | Invalid credentials / expired   |
| AUTH_004        | 403  | Account inactive                |
| RBAC_001        | 403  | Insufficient permissions        |
| RBAC_002        | 400  | Cannot demote own admin role    |
| USER_001        | 404  | User not found                  |
| FINANCE_001     | 404  | Transaction not found           |
| FINANCE_002     | 422  | Amount must be > 0              |
| FINANCE_003     | 422  | Invalid transaction type        |
| VALIDATION_001  | 422  | Field validation failed         |
| SYSTEM_001      | 500  | Unexpected server error         |

---

## Logging Format (every log entry)

```json
{
  "timestamp": "2026-04-06T10:00:00Z",
  "level": "INFO",
  "correlation_id": "uuid",
  "user_id": "uuid or null",
  "action": "transaction.create",
  "resource": "transactions",
  "duration_ms": 45,
  "message": "Transaction created"
}
```
Never log: passwords, tokens, raw PII.

---

## Quick Start

```bash
# Backend
cd apps/api
python -m venv venv
source venv/bin/activate   # Windows: .\venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # fill in DATABASE_URL and SECRET_KEY
uvicorn main:app --reload --port 8000

# Frontend (new terminal)
cd apps/web
npm install
cp .env.example .env.local
npm run dev

# App:  http://localhost:3000
# Docs: http://localhost:8000/docs
```

---

## Assumptions and Tradeoffs

1. SQLite for tests — same ORM, no Supabase cost, deterministic test isolation
2. Supabase as PostgreSQL host only — no Supabase Auth/RLS (RBAC visible to evaluator)
3. PWA covers all platforms — Android, iOS, Windows, macOS via one codebase
4. Soft deletes everywhere — no hard deletes (audit compliance, Constitution #9)
5. UTC timestamps everywhere — ISO 8601 with Z suffix
6. Viewer reads transactions — "view dashboard data" includes transaction list (read-only)
7. Rate limit 100 req/min per user via sliding window
8. SSE for live dashboard — simpler than WebSocket, sufficient for use case
9. Correlation IDs propagated end-to-end through logs and response headers
