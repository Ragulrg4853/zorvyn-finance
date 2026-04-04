# API_CONSTITUTIONS.md — API Texture Constitutions (54 Rules)
# GitHub Copilot: Apply these to every router, endpoint, and response you generate.
# These govern HOW APIs are designed, shaped, and communicated.

---

## SECTION 1 — URL and Resource Design

### 1. Resources Are Nouns, Never Verbs
URLs identify things. HTTP methods carry the verb.
GOOD: POST /transactions    BAD: POST /createTransaction

### 2. Plural Nouns for Collections
GOOD: /users  /transactions  /roles    BAD: /user  /transaction

### 3. Hierarchy Reflects Ownership Only
Nested routes express containment. Never nest more than 2 levels deep.
GOOD: /users/{id}/roles    BAD: /users/{id}/roles/{id}/permissions/{id}

### 4. IDs Are Path Segments, Filters Are Query Params
GOOD: GET /transactions/{id}    GET /transactions?type=income&category=Salary
BAD:  GET /transactions?id=123  GET /transactions/{id}?type=income

### 5. No Verbs in URLs Except Non-CRUD Actions
When action cannot map to HTTP method, use a sub-resource verb.
GOOD: GET /transactions/export    POST /auth/refresh
BAD:  GET /getTransactions        POST /createTransaction

### 6. Lowercase Kebab-Case URLs Only
GOOD: /audit-logs  /role-permissions    BAD: /auditLogs  /RolePermissions

### 7. Version Prefix on All Routes
Every production route starts with version segment.
GOOD: /v1/transactions    BAD: /transactions (unversioned)

### 8. Stable Resource Identifiers
Resource IDs never change after creation.
Use UUIDs. Never use email, username, or mutable fields as IDs.

---

## SECTION 2 — HTTP Method Semantics

### 9. GET Is Always Safe and Idempotent
GET never mutates state. No side effects. Safe to cache.
BAD: GET /transactions/delete/{id}

### 10. POST Creates, Never Upserts
POST creates a new resource and returns 201.
Do not use POST for updates. Use PUT or PATCH.

### 11. PUT Replaces Entirely
PUT sends the full resource representation. Missing fields treated as deletions.
Only use when full replacement is intended.

### 12. PATCH Updates Partially
PATCH sends only the fields to change.
Always preferred over PUT for partial updates.
Implementation: use payload.model_dump(exclude_unset=True) in Pydantic.

### 13. DELETE Is Idempotent
Deleting a non-existent resource returns 204, not 404.
Callers must not need to check existence before deletion.
In Zorvyn: DELETE sets is_deleted=True (soft delete). Returns 204 always.

### 14. OPTIONS for CORS Preflight Only
Never implement custom OPTIONS handlers. Configure CORS at the app level in main.py.

---

## SECTION 3 — Request Contract

### 15. Content-Type Is Always Declared
Every request with a body declares Content-Type: application/json.
Exception: /v1/auth/login uses application/x-www-form-urlencoded (OAuth2 spec).

### 16. Input Validated at the Boundary Only
Validation happens once — at the router/schema (Pydantic) layer.
Service layer trusts validated input. Never re-validate inside business logic.

### 17. No Implicit Defaults in Request Bodies
Every default value is documented in the schema and OpenAPI spec.
Never silently fill in fields the client did not provide.

### 18. Idempotency Keys on Mutations
POST and PATCH support optional Idempotency-Key header.
Same key + same payload = same response, no duplicate write.

### 19. Correlation ID Injected on Every Request
Every inbound request receives or generates an X-Correlation-ID header.
Propagate through all logs, downstream calls, and the response header.
Implementation: CorrelationIdMiddleware in shared/middleware/correlation_id.py

### 20. Request Size Limits Are Enforced
Unbounded request bodies rejected.
Max body size enforced by uvicorn. Return 413 if exceeded.

---

## SECTION 4 — Response Contract

### 21. Response Shape Is Consistent Across All Endpoints
Every response uses the unified envelope. No exceptions.
Success:   {"data": {}, "meta": {"correlation_id": "uuid"}, "error": null}
Error:     {"data": null, "meta": {"correlation_id": "uuid"}, "error": {"code":...}}
Paginated: {"data": [], "meta": {"total":100, "page":1, "page_size":20, "total_pages":5, ...}}

### 22. HTTP Status Code Is the Primary Signal
Status code must match the semantic outcome. Body elaborates.
NEVER return 200 with {"success": false}. Use 4xx or 5xx.

### 23. Timestamps Are Always UTC ISO 8601
No local time. No Unix epoch in responses.
GOOD: "created_at": "2026-04-06T10:00:00Z"    BAD: "created_at": 1712397600

### 24. Nullable Fields Are Explicit
Fields that can be absent are always present with null value.
GOOD: {"notes": null}    BAD: {} (missing notes key entirely)

### 25. Paginated Responses Include Full Meta
Every list response includes pagination context.
meta must contain: total, page, page_size, total_pages, correlation_id

### 26. Empty Collections Return 200, Not 404
An empty list is a valid result, not an error.
GET /transactions with no matches -> 200 {"data": [], "meta": {...}}

### 27. Created Resources Return Full Representation
POST responses include the newly created object.
GOOD: 201 + full TransactionRead    BAD: 201 + {"id": "uuid"} only

### 28. Sensitive Fields Never Appear in Responses
hashed_password never returned. Tokens never logged. PII masked.
UserRead schema must not include hashed_password field.

---

## SECTION 5 — Error Taxonomy and Format

### 29. Every Error Has a Machine-Readable Code
Errors carry a code consumers can programmatically handle.
Format: {"error": {"code": "AUTH_003", "message": "...", "field": null}}

### 30. Error Code Namespace Convention
Codes prefixed by domain: AUTH_, FINANCE_, RBAC_, USER_, VALIDATION_, SYSTEM_
Full registry in README.md error code table.

### 31. Validation Errors List All Failures at Once
Never return one validation error at a time.
422 response includes array of all field-level errors in one shot (Pydantic handles this).

### 32. 401 vs 403 Are Never Confused
401 = not authenticated (missing or invalid token)
403 = authenticated but not authorized (valid token, wrong permission)
Implementation: decode_token fails -> 401. require_permission fails -> 403.

### 33. 500 Errors Never Leak Internals
System errors return safe generic message to client.
Log full trace server-side. Return only: {"code": "SYSTEM_001", "message": "An unexpected error occurred"}

### 34. Error Responses Include Correlation ID
Every error response echoes the correlation ID for traceability.
{"error": {"code": "...", "message": "...", "field": null}, "meta": {"correlation_id": "uuid"}}

---

## SECTION 6 — Authentication and Authorization

### 35. Bearer Token on Every Protected Endpoint
Authorization header carries JWT on every protected call.
Format: Authorization: Bearer <token>
Never use cookies for API-to-API auth.

### 36. Token Expiry Is Short and Explicit
Access tokens expire in hours, not days.
Default: 8 hours (ACCESS_TOKEN_EXPIRE_MINUTES=480 in .env)

### 37. Permission Strings Are Structured
Permissions follow resource:action format.
GOOD: transactions:write  dashboard:insights  users:manage
BAD:  write_transactions   canViewDashboard    ADMIN

### 38. Role Check Happens Before Business Logic
Authorization is the first thing that runs in any protected handler.
require_permission() middleware runs before service is invoked.
Service layer never checks roles or permissions.

### 39. Least Privilege by Default
New users get the most restrictive role.
Default role = viewer. Explicit upgrade required to analyst or admin.

---

## SECTION 7 — Pagination, Filtering, and Sorting

### 40. Pagination Is Mandatory on All Collection Endpoints
Unbounded list queries are rejected.
page and page_size required or defaulted. Max page_size = 100.

### 41. Filters Are Additive and Optional
Each filter narrows results independently. All filters are AND logic.
?type=income&category=Salary&date_from=2026-01-01 -> all three conditions applied.

### 42. Sorting Is Explicit
Default sort order is documented and consistent.
?sort=date&order=desc. Never rely on DB insertion order.
Valid sort fields: date, amount, category. Validated with Pydantic pattern="^(date|amount|category)$"

### 43. Filter Parameters Are Validated
Invalid filter values return 422, not silently ignored.
?type=invalid -> 422 VALIDATION_001: type must be income or expense

### 44. Cursor-Based Pagination for High-Volume Data
Offset pagination breaks beyond 10,000 rows.
For audit logs: support cursor-based pagination via ?cursor=<last_id>
TODO(session-8): Implement cursor pagination in audit router.

---

## SECTION 8 — Versioning and Evolution

### 45. New Fields Are Additive Only
Adding a field is safe. Removing or renaming is a breaking change.
Deprecate fields with a deprecated: true marker in OpenAPI before removing.

### 46. Breaking Changes Require a New Version
/v1 consumers must never be broken by /v2 work.
Run old and new versions in parallel during migration window.

### 47. Deprecation Announced in Response Headers
Deprecated endpoints signal their status on every response.
Headers: Deprecation: true, Sunset: 2026-12-01

### 48. Changelog Is Part of the API Contract
API changes documented in CHANGELOG.md with every PR.
CHANGELOG.md is append-only. Never edit existing entries.

---

## SECTION 9 — Performance and Reliability

### 49. Rate Limit Headers Always Present
Every response communicates rate limit status.
Headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
Implementation: RateLimiterMiddleware in shared/middleware/rate_limiter.py

### 50. Slow Queries Logged with Thresholds
Any DB query exceeding 200ms logged as warning.
Structured log entry includes: query name, duration_ms, correlation_id

### 51. Health and Readiness Endpoints Are Standard
GET /health -> {"status": "ok", "timestamp": "UTC ISO"}
GET /ready  -> {"status": "ok", "db": "connected"} or 503 if DB unreachable

---

## SECTION 10 — Documentation and Discoverability

### 52. OpenAPI Spec Is the Source of Truth
Spec generated from code, never written by hand.
FastAPI auto-generates /docs (Swagger UI) and /redoc. Both always accurate.

### 53. Every Endpoint Has Summary, Description, and Example
Every route has summary= parameter in the decorator.
Request body examples and all possible response codes documented via Pydantic schemas.

### 54. API Constitutions Are Enforced by CI
API shape rules checked automatically on every commit.
Tests verify: response envelope shape, error code format, pagination meta presence,
              permission strings used (not role names), soft delete behaviour.
TODO(session-8): Add API contract tests to conftest.py
