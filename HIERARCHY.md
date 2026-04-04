# HIERARCHY.md — Layer Hierarchy Constitutions (20 Rules)
# GitHub Copilot: These define the boundaries between every layer in the system.
# Violating these rules is the most common source of unmaintainable code.

---

## APPLICATION HIERARCHY

### 1. The Four-Layer Application Model
All code belongs to exactly one layer. No layer may be skipped.
Application (entry point) -> Micro App -> Service -> Microservice (repository/external)

### 2. Application Layer Responsibility
main.py and App Router pages are the only entry points.
Responsibility: mount routers, register middleware, export layout.
Contains: zero business logic, zero DB queries, zero API calls.

### 3. Micro App Layer Responsibility
Each micro app is a self-contained vertical slice of the system.
Backend: auth/, users/, roles/, transactions/, dashboard/, audit/
Frontend: micro-apps/auth/, dashboard/, transactions/, admin/
Each owns its own schemas, router, service, repository, and tests.
No micro app imports from another micro app. They share only through shared/.

### 4. Service Layer Responsibility
service.py files contain business logic only.
Allowed in service: validate business rules, call repository, raise AppError, return schemas.
Forbidden in service: DB queries, HTTP calls, importing from other micro app services.

### 5. Repository Layer Responsibility
repository.py files contain DB queries only.
Allowed in repository: SQLAlchemy queries, db.add, db.commit, db.refresh, db.delete (never used).
Forbidden in repository: business rules, AppError raises, schema conversions.

---

## BACKEND LAYER RULES

### 6. Router Never Calls Repository
router.py -> service.py -> repository.py is the only allowed call direction.
router.py calling repository.py directly is a hard violation.

### 7. Service Never Imports Router
Services never import from routers. Direction is one-way downward.

### 8. Shared Layer Is Infrastructure Only
shared/ contains: database, models, middleware, utils.
shared/ never contains business logic.
No micro app puts business logic into shared/.

### 9. Middleware Runs Before Business Logic
Middleware order in main.py: CorrelationID -> RateLimiter -> CORS
Auth and RBAC run as FastAPI dependencies (Depends), not middleware.
require_permission() executes before any service function is called.

### 10. Models Are Passive Data Structures
ORM models (shared/models/) contain only column definitions and relationships.
Models never contain business methods, validation logic, or service calls.

---

## FRONTEND LAYER RULES

### 11. The Three-Layer Frontend Model
Service -> Hook -> Component is the only allowed call direction.
Component -> Hook -> Service is how data flows downward as props.

### 12. Service Layer Owns All API Calls
Every API call lives in a service file (e.g. AuthService.js, TransactionService.js).
Zero API calls in hooks. Zero API calls in components. No exceptions.

### 13. Hook Layer Owns All State
useState, useEffect, useReducer live in hook files (e.g. useAuth.js, useTransactions.js).
Hooks call service functions. Hooks never render JSX. Hooks never import components.

### 14. Component Layer Renders Only
Components receive data via props from hooks. Components call no services directly.
Components contain: JSX, event handlers that call prop functions, local UI state (e.g. modal open/closed).
Components never contain: fetch calls, useState for server data, business logic.

### 15. Page Files Are Assemblers
Next.js page.js files assemble micro-app components and connect them to hooks.
A page file should read like a layout description, not business logic.
Pages wrap with ProtectedRoute. Pages pass hook data to components as props.

---

## CROSS-CUTTING RULES

### 16. Shared Types Flow Downward
TypeScript types and Pydantic schemas define contracts at the top.
Frontend consumes types from packages/shared-types/.
Backend consumes Pydantic schemas from each micro app's schemas.py.
Neither layer defines ad-hoc types inline in business logic files.

### 17. Errors Propagate Upward
repository.py raises raw SQLAlchemy exceptions (or returns None for not-found).
service.py catches repository exceptions and converts to AppError with typed ErrorCode.
router.py catches AppError and serializes to the unified error envelope.
Component receives error from hook prop. Component renders ErrorState component.

### 18. Logging Happens at the Service Layer
Structured log entries are written in service.py after successful operations.
router.py never logs (correlation ID is in middleware).
repository.py never logs (it is a pure data layer).
Component never logs (use browser devtools for UI debugging).

### 19. Configuration Flows Inward
Environment variables are read at the outermost layer (database.py, security.py, main.py).
They are passed inward as parameters or used as module-level constants.
Business logic files (service.py) never read from os.environ directly.

### 20. Tests Mirror the Hierarchy
Each layer has its own test file:
  test_repository.py: tests DB queries with real SQLite session
  test_service.py:    tests business logic with mocked repository
  test_router.py:     tests HTTP contract with TestClient
Frontend:
  Service.test.js:    tests API call construction with mocked axios
  useHook.test.js:    tests state management with mocked service
  Component.test.js:  tests render output with mocked hook props
Never test a service by calling the router. Never test a repository through the service.
Each layer is tested in isolation.
