# Zorvyn Finance — Finance Data Processing & Access Control Platform

> An enterprise-grade financial ledger and insight dashboard built with a 
security-first, permission-driven architecture. Designed for organizations 
that require strict separation of concerns across employee access tiers.

This submission covers all 6 core requirements and all 7 optional enhancements 
from the assignment brief — including a working deployment, a complete Next.js 
frontend, and a dynamic database-backed RBAC system with runtime permission 
management. No local setup is required to evaluate the full application.
---

## Live Demo

| Service | URL |
|---|---|
| **Frontend** | https://zorvyn-finance-seven.vercel.app |
| **API Docs** | https://zorvyn-finance-production.up.railway.app/docs |

**Test credentials:**

| Role | Username | Password | Access Level |
|---|---|---|---|
| Admin | `admin_user` | `admin123` | Full system access |
| Analyst | `analyst_user` | `analyst123` | Read + export + insights |
| Viewer | `viewer_user` | `viewer123` | Dashboard read-only |

---

## What This Project Covers

This submission addresses every core requirement and all optional enhancements from the assignment brief:

| Requirement | Status | Notes |
|---|---|---|
| User & Role Management | ✅ Exceeded | Dynamic DB-backed RBAC, not hardcoded logic |
| Financial Records Management | ✅ Exceeded | Full CRUD + streaming O(1) CSV export |
| Dashboard Summary APIs | ✅ Exceeded | 7 KPIs, trends, SSE live updates |
| Access Control Logic | ✅ Exceeded | Middleware-enforced permissions + TTL cache |
| Validation & Error Handling | ✅ Exceeded | Custom error taxonomy, typed codes |
| Data Persistence | ✅ Exceeded | PostgreSQL, migrations, indexed queries |
| Authentication | ✅ Optional — Done | JWT, bcrypt, token blocklist on logout |
| Pagination | ✅ Optional — Done | Offset + cursor-based for audit logs |
| Search | ✅ Optional — Done | ILIKE across category + notes |
| Soft Delete | ✅ Optional — Done | `is_deleted` flag, never hard deletes |
| Rate Limiting | ✅ Optional — Done | 100 req/min sliding window |
| Tests | ✅ Optional — Done | 24 unit tests across all micro-apps |
| API Documentation | ✅ Optional — Done | Auto-generated Swagger UI + ReDoc |

---

## Tech Stack

**Backend**
- Python 3.11, FastAPI, SQLAlchemy 2.0, Pydantic v2
- PostgreSQL via Supabase, psycopg2-binary
- python-jose (JWT), passlib[bcrypt] (password hashing)
- Uvicorn (ASGI server)

**Frontend**
- Next.js 14 (App Router), React 18
- Tailwind CSS, Framer Motion
- Recharts (data visualisation), Axios, lucide-react
- Progressive Web App (PWA) support

**Infrastructure**
- Database: Supabase (PostgreSQL)
- Backend deployment: Railway
- Frontend deployment: Vercel
- Migrations: SQL-based, sequential

---

## Architecture

The project uses a **modular monolith** (micro-app) pattern — a pragmatic approach that gives domain isolation without distributed system overhead.

```
zorvyn-finance/
├── apps/
│   ├── api/                    # FastAPI backend
│   │   ├── main.py             # App entry point, router mounting, middleware
│   │   ├── micro_apps/         # Domain-isolated feature modules
│   │   │   ├── auth/           # Login, logout, JWT issuance
│   │   │   ├── transactions/   # CRUD, filtering, CSV export
│   │   │   ├── dashboard/      # Aggregations, insights, SSE
│   │   │   ├── users/          # User lifecycle management
│   │   │   ├── roles/          # Permission assignment
│   │   │   └── audit/          # Immutable activity log
│   │   └── shared/
│   │       ├── middleware/     # RBAC, rate limiter, correlation ID, audit logger
│   │       ├── models/         # SQLAlchemy ORM definitions
│   │       └── utils/          # Error taxonomy, security, logger
│   └── web/                    # Next.js frontend
│       └── src/
│           ├── app/            # Next.js App Router pages
│           ├── micro-apps/     # Feature-scoped components + hooks + services
│           └── shared/         # Global layout, API client, utilities
├── infra/
│   └── supabase/
│       ├── migrations/         # 007 sequential SQL migrations
│       └── seed.sql            # Development seed data
└── packages/
    ├── shared-types/           # TypeScript interfaces
    └── shared-validators/      # Shared validation schemas
```

**Layer boundary (never violated):**
- Backend: `Router → Service → Repository`
- Frontend: `Service → Hook → Component`

---

## Key Design Decisions

### 1. Database-Backed Dynamic RBAC (Not Hardcoded Roles)
Permissions are stored in a relational junction table (`role_permissions`) and loaded at runtime. Admins can grant or revoke individual permissions (e.g. `dashboard:insights`, `transactions:export`) for any role through the UI. Changes propagate within 2 minutes via TTL cache invalidation — no redeploy required.

```
roles ──< role_permissions >── permissions
```

This means the access control is a *data concern*, not a *code concern*.

### 2. O(1) Memory CSV Export via Streaming Generator
For large datasets, loading all rows into memory before streaming causes OOM errors. The export endpoint uses `SQLAlchemy.yield_per(100)` with `FastAPI.StreamingResponse` to pipe rows directly from the database cursor to the HTTP response — memory usage stays constant regardless of row count.

### 3. Cursor-Based Pagination for Audit Logs
Standard offset pagination degrades to O(n) at high page numbers. Audit logs use `WHERE created_at < cursor` with `LIMIT`, giving consistent O(log n) performance regardless of log volume.

### 4. SSE Over WebSocket for Live Dashboard
Server-Sent Events are unidirectional (server → client), require no handshake protocol, and work transparently through HTTP/2 proxies. For a read-only live dashboard feed, SSE gives the same real-time capability with far less infrastructure complexity than WebSocket.

### 5. Soft Delete Everywhere
Financial records are never physically removed. `DELETE /transactions/{id}` sets `is_deleted = True`. This preserves audit trails, supports point-in-time reporting, and prevents accidental data loss. All queries filter `WHERE is_deleted = FALSE` at the repository layer.

---

## API Reference

All endpoints follow a consistent response envelope:

```json
{
  "data": {},
  "meta": { "correlation_id": "uuid" },
  "error": null
}
```

Every error response carries a machine-readable code:

| Code | HTTP | Meaning |
|---|---|---|
| `AUTH_001` | 400 | Username already taken |
| `AUTH_002` | 400 | Email already registered |
| `AUTH_003` | 401 | Invalid token or expired |
| `AUTH_004` | 403 | Account deactivated |
| `RBAC_001` | 403 | Insufficient permissions |
| `RBAC_002` | 403 | Privilege escalation blocked |
| `FINANCE_001` | 404 | Transaction not found |
| `FINANCE_002` | 422 | Invalid transaction data |
| `USER_001` | 404 | User not found |
| `VALIDATION_001` | 422 | Input validation failed |
| `SYSTEM_001` | 500 | Unexpected server error |

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/v1/auth/login` | None | Obtain JWT access token |
| `GET` | `/v1/auth/me` | Bearer | Get current user profile |
| `POST` | `/v1/auth/logout` | Bearer | Blocklist token server-side |

### Transactions

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| `GET` | `/v1/transactions` | `transactions:read` | List with filters + pagination |
| `POST` | `/v1/transactions` | `transactions:write` | Create new record |
| `GET` | `/v1/transactions/{id}` | `transactions:read` | Get single record |
| `PATCH` | `/v1/transactions/{id}` | `transactions:write` | Partial update |
| `DELETE` | `/v1/transactions/{id}` | `transactions:delete` | Soft delete |
| `GET` | `/v1/transactions/export` | `transactions:export` | Stream CSV download |

**Query parameters:** `type`, `category`, `date_from`, `date_to`, `search`, `page`, `page_size`, `sort`, `order`

### Dashboard

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| `GET` | `/v1/dashboard/summary` | `dashboard:read` | KPIs, trends, recent activity |
| `GET` | `/v1/dashboard/insights` | `dashboard:insights` | Category breakdown, analytics |
| `GET` | `/v1/dashboard/live` | `dashboard:read` | SSE stream for live updates |

### Users (Admin)

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| `GET` | `/v1/users` | `users:read` | List all users |
| `POST` | `/v1/users` | `users:manage` | Create new user |
| `PATCH` | `/v1/users/{id}` | `users:manage` | Update role or active status |

### Roles (Admin)

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| `GET` | `/v1/roles` | `roles:manage` | List roles with permissions |
| `PATCH` | `/v1/roles/{id}/permissions` | `roles:manage` | Grant or revoke permissions |

### Audit

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| `GET` | `/v1/audit/logs` | `audit:read` | Paginated immutable activity log |

---

## Role Permission Matrix

| Permission | Viewer | Analyst | Admin |
|---|---|---|---|
| `dashboard:read` | ✅ | ✅ | ✅ |
| `dashboard:insights` | ❌ | ✅ | ✅ |
| `transactions:read` | ❌ | ✅ | ✅ |
| `transactions:write` | ❌ | ❌ | ✅ |
| `transactions:delete` | ❌ | ❌ | ✅ |
| `transactions:export` | ❌ | ✅ | ✅ |
| `users:read` | ❌ | ❌ | ✅ |
| `roles:manage` | ❌ | ❌ | ✅ |
| `audit:read` | ❌ | ❌ | ✅ |
| `user:delete` | ❌ | ❌ | ✅ |
| `user:create` | ❌ | ❌ | ✅ |
| `user:update` | ❌ | ❌ | ✅ |


> Permissions are stored in the database and can be dynamically adjusted by an admin at runtime through the Roles & Permissions panel. Changes take effect within 2 minutes without a redeploy.

---

## Features Walkthrough

### Dashboard
- **4 primary KPIs:** Total Income, Total Expense, Net Balance, Transaction Count — all with month-over-month percentage change
- **3 secondary KPIs:** Top 3 expense categories, Monthly income trend, Weekly volume trend
- **Cash Flow Overview:** Recharts AreaChart showing income vs expense by month over the last 12 months
- **Expense vs Income Distribution:** Donut chart with real savings rate in the centre
- **Recent Activity:** Last 10 transactions with direct "View All" navigation to the full ledger
- **Date Range Filter:** From/To date inputs with persistent state — clears only on explicit "Clear" click
- **Access-gated Insights:** Viewers see a frosted glass "Access Restricted" overlay on the insights section

### Transactions
- **Full CRUD:** Create, read, update, and soft-delete financial records
- **Advanced Filters:** Type pills (ALL / INCOME / EXPENSE), dynamic category dropdown, date range picker, free-text search
- **Pagination:** Configurable records per page (10 / 25 / 50 / 100) with page navigation and record count display
- **CSV Export:** Streams directly from database cursor — O(1) memory, handles millions of records
- **Role-gated UI:** Create/Edit/Delete buttons only render for admin; Export button only renders for analyst+

### Administration
- **User Management:** Full user table with UUID, role badge, active/inactive status, and created date. Admin can create users, toggle active status, and change roles in real time
- **Roles & Permissions:** Interactive permission matrix with pending change tracking, "Commit Changes" button, and 2-minute cache propagation
- **System Audit Logs:** Immutable ledger of all platform mutations — who did what, when, and to which resource — with action filter and date range

### Security
- Passwords hashed with bcrypt (cost factor 12)
- JWT tokens signed with HS256, 8-hour expiry
- Logout adds token to server-side blocklist — replay impossible
- Every protected endpoint checks `require_permission("resource:action")` before any business logic
- Inactive user accounts rejected at authentication, not just at the permission layer
- Rate limiting: 100 requests per minute per token, with `X-RateLimit-*` headers on every response
- Correlation ID injected on every request for end-to-end traceability

---

## Database Schema

```
roles                    permissions              role_permissions
─────────────────        ──────────────────       ────────────────────
id (UUID PK)             id (UUID PK)             role_id (FK → roles)
name (VARCHAR)           name (VARCHAR)           permission_id (FK → permissions)
description (TEXT)       description (TEXT)
created_at (TIMESTAMPTZ) created_at (TIMESTAMPTZ)

users                    transactions             audit_logs
──────────────────────   ──────────────────────   ──────────────────────
id (UUID PK)             id (UUID PK)             id (UUID PK)
username (VARCHAR UNIQ)  amount (NUMERIC 12,2)    user_id (FK → users)
email (VARCHAR UNIQ)     type (ENUM)              action (VARCHAR)
hashed_password (TEXT)   category (VARCHAR)       resource_type (VARCHAR)
role (user_role ENUM)    date (DATE)              resource_id (UUID)
is_active (BOOLEAN)      notes (TEXT)             old_value (JSONB)
created_at (TIMESTAMPTZ) is_deleted (BOOLEAN)     new_value (JSONB)
updated_at (TIMESTAMPTZ) created_by (FK → users)  correlation_id (UUID)
                         created_at (TIMESTAMPTZ) created_at (TIMESTAMPTZ)
                         updated_at (TIMESTAMPTZ)
```

**Indexes:**
- `idx_txn_date_type` on `transactions(date, type)` WHERE `is_deleted = FALSE`
- `idx_txn_category` on `transactions(category)` WHERE `is_deleted = FALSE`
- `idx_users_role_active` on `users(role, is_active)`
- `idx_audit_correlation` on `audit_logs(correlation_id)`

---

## Screenshots

### Login
<img width="1908" height="972" alt="image" src="https://github.com/user-attachments/assets/c014e4f9-0964-4ccf-abe7-31087dfe1f14" />


### Dashboard — Financial Insights with Real-Time KPIs
<img width="1915" height="979" alt="image" src="https://github.com/user-attachments/assets/70b73794-8f88-4ae1-9bcb-156b57581210" />


### Transactions — Advanced Filtering and Pagination
<img width="1915" height="979" alt="image" src="https://github.com/user-attachments/assets/1c9e0d3a-46b4-473e-a545-20dbd85c5b70" />


### New Transaction Form
<img width="1903" height="976" alt="image" src="https://github.com/user-attachments/assets/b041d2d6-c44b-4034-8a9a-42a56e99dc09" />


### Edit Transaction Form
<img width="1913" height="977" alt="image" src="https://github.com/user-attachments/assets/b185e2e7-e759-4f99-b0f5-333b854d500e" />


### Administration — User Management
<img width="1916" height="974" alt="image" src="https://github.com/user-attachments/assets/6cf42967-7d55-48ea-b61b-52962d17c9ed" />


### Create New User
<img width="1902" height="976" alt="image" src="https://github.com/user-attachments/assets/121485aa-57d7-4291-a22e-334a6f1da50b" />


### Roles & Permissions — Dynamic RBAC Matrix
<img width="1918" height="984" alt="image" src="https://github.com/user-attachments/assets/1cc47a9d-2d6f-4724-b79a-c77669aef163" />


### Permission Commit — Changes Take Effect in Real Time
<img width="1910" height="976" alt="image" src="https://github.com/user-attachments/assets/e12a5c1c-72ec-4cd5-aea7-000329c74c3a" />


### System Audit Logs — Immutable Activity Ledger
<img width="1916" height="983" alt="image" src="https://github.com/user-attachments/assets/81630f77-4330-404b-8cf0-810a00a13e8f" />



### Real-Time Notifications
<img width="1919" height="974" alt="image" src="https://github.com/user-attachments/assets/352b25f0-e98f-4cde-b55a-57545bfd7a53" />

### Logout Window
<img width="1892" height="981" alt="image" src="https://github.com/user-attachments/assets/353a84cf-2dd5-45a8-b81c-6fbb60bd8d31" />


### API Documentation — Swagger UI
<img width="1893" height="976" alt="image" src="https://github.com/user-attachments/assets/8bdf92e0-11ae-439f-832b-1c4de4bfc525" />


---

## Local Setup

**Prerequisites:** Python 3.11+, Node.js 18+, a Supabase project

### 1. Clone the repository

```bash
git clone https://github.com/Ragulrg4853/zorvyn-finance.git
cd zorvyn-finance
```

### 2. Backend setup

```bash
cd apps/api

# Windows
python -m venv venv
.\venv\Scripts\Activate.ps1

# macOS / Linux
python -m venv venv
source venv/bin/activate

pip install -r requirements.txt
```

Create `apps/api/.env`:

```env
DATABASE_URL=postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres
SECRET_KEY=your-32-character-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480
RATE_LIMIT_PER_MINUTE=100
```

### 3. Database setup

Run migrations in order in Supabase SQL Editor:

```
infra/supabase/migrations/001_create_roles.sql
infra/supabase/migrations/002_create_permissions.sql
infra/supabase/migrations/003_create_role_permissions.sql
infra/supabase/migrations/004_create_users.sql
infra/supabase/migrations/005_create_transactions.sql
infra/supabase/migrations/006_create_audit_logs.sql
infra/supabase/migrations/007_seed_roles_permissions.sql
```

Then run `infra/supabase/seed.sql` to create the three default users.

### 4. Frontend setup

```bash
cd apps/web
npm install
```

Create `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 5. Run the application

Terminal 1 — Backend:
```bash
cd apps/api
uvicorn main:app --reload --port 8000
```

Terminal 2 — Frontend:
```bash
cd apps/web
npm run dev
```

Open http://localhost:3000

**Verify backend:** http://localhost:8000/ready → `{"status":"ok","db":"connected"}`  
**API documentation:** http://localhost:8000/docs

---

## Running Tests

```bash
cd apps/api
pytest -v
```

24 unit tests covering authentication, transaction validation, dashboard aggregation, and RBAC enforcement. Tests use SQLite in-memory and mocked repositories for complete isolation from the production database.

---

## Deployment

| Service | Platform | Configuration |
|---|---|---|
| Backend | Railway | Root: `apps/api`, start: `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| Frontend | Vercel | Root: `apps/web`, framework: Next.js |

**Railway environment variables required:**
```
DATABASE_URL, SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, RATE_LIMIT_PER_MINUTE
```

**Vercel environment variable required:**
```
NEXT_PUBLIC_API_URL=https://zorvyn-finance-production.up.railway.app
```

---

## Assumptions & Tradeoffs

| Decision | Assumption | Tradeoff |
|---|---|---|
| Synchronous SQLAlchemy | Single Railway instance for evaluation | Switch to async SQLAlchemy + asyncpg for horizontal scale |
| In-memory rate limiter | Single process deployment | Replace with Redis for multi-instance deployments |
| Permission TTL cache (2 min) | Slight delay in propagation is acceptable | Lower TTL increases DB load; higher TTL delays permission changes |
| sessionStorage for tokens | Tab-close logout is desired behaviour | localStorage would persist across browser restarts |
| Offset pagination for transactions | Dataset is evaluation-scale | Switch to cursor-based at >50k rows |

---

## Project Highlights

- **Zero hardcoded role checks** anywhere in the codebase — all access decisions go through `require_permission("resource:action")`
- **Single-pass O(n) dashboard aggregation** — income totals, expense totals, monthly buckets, and category breakdowns computed in one database round-trip
- **Streaming CSV export** — server memory usage is O(1) regardless of how many rows are exported
- **Machine-readable error codes** on every failure — clients can programmatically handle `AUTH_003` vs `RBAC_001` vs `FINANCE_001`
- **Correlation ID on every request** — every log entry, response header, and error body carries the same UUID for complete end-to-end traceability
- **Fully deployed and accessible** — live demo available above, no local setup required to evaluate

---

## API Health Endpoints

```
GET /health  →  {"status": "ok", "timestamp": "..."}
GET /ready   →  {"status": "ok", "db": "connected"}
```

---

---

*Submitted for the Backend Developer Internship assessment at Zorvyn FinTech.*  
*Live demo: https://zorvyn-finance-seven.vercel.app — credentials above.*
