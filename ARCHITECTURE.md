# ARCHITECTURE.md — FAANG-Grade Enterprise Architecture Constitutions (54 Rules)
# GitHub Copilot: Apply these when making system-level decisions.
# These govern HOW the system is built, not just how the code looks.

---

## SECTION 1 — Foundational Architecture

### 1. Thin-First Development
Clients contain UI only. All intelligence lives server-side.
Application: Mobile/web apps only call APIs. No business logic, rules, or calculations in client.

### 2. Launch-Friendly Releases
Releases must not require synchronized client updates.
Application: Backend changes never break existing clients. Add fields; never remove in-place.

### 3. Versioning and Backward Compatibility
APIs evolve without breaking existing consumers.
Application: Add fields or endpoints freely. Never remove or rename without a new version.

### 4. Statelessness
Services do not depend on in-memory state between requests.
Application: All state stored in DB or cache. Instances can restart at any time safely.

### 5. Observability-First
Every action is measurable, traceable, and debuggable.
Application: Structured logs, correlation IDs, and health endpoints designed before business logic.

### 6. Security-by-Design
Security is enforced by architecture, not developer discipline.
Application: Server-side auth, least privilege, deny-by-default. RBAC middleware runs before service.

### 7. Cost Awareness
Every operation has a known cost ceiling.
Application: Rate limits (100 req/min), pagination limits (max 100), async for expensive exports.

### 8. Replaceability
Components can be swapped without system rewrite.
Application: SQLAlchemy abstracts the DB. Switch Supabase to any Postgres with one env var change.

### 9. Data Lifecycle
Data has creation, retention, archival, and deletion rules.
Application: Soft deletes everywhere (is_deleted=True). Audit logs are append-only, never purged.

### 10. Idempotency and Retries
Repeated requests produce the same result.
Application: UUIDs as primary keys prevent duplicate inserts. Safe to retry failed requests.

### 11. Failure Semantics
Failures are expected and classified.
Application: Retryable errors (500, timeout) vs fatal errors (400, 422) vs user errors (401, 403).

### 12. Time Consistency
Time is unambiguous across the entire system.
Application: UTC everywhere. All timestamps stored and returned as ISO 8601 with Z suffix.

### 13. Human Override Paths
Humans can safely override automation at any point.
Application: Admin can modify permissions at runtime via PATCH /v1/roles/{id}/permissions.

### 14. Testability by Design
Systems must be testable by construction.
Application: Dependency injection throughout. SQLite in-memory for test isolation. Mock repositories.

### 15. Exit Strategies
Every major dependency has an exit path.
Application: SQLAlchemy ORM means DB is swappable. FastAPI means framework is swappable.

---

## SECTION 2 — Domain and Data Governance

### 16. Domain Boundaries (DDD)
Clear ownership of business domains.
Application: Each micro app owns its data and logic. auth/ owns users. transactions/ owns records.

### 17. Consistency Model
Explicit guarantees about data freshness.
Application: Strong consistency for financial writes. Dashboard reads can tolerate 10s SSE lag.

### 18. API Contract Governance
APIs are formal, versioned contracts.
Application: All routes prefixed /v1. OpenAPI auto-generated at /docs. Breaking changes need /v2.

### 19. Schema Evolution Rules
Database schemas change safely over time.
Application: Migrations are append-only (001→002→003). Never edit a committed migration file.

### 20. Secrets and Key Management
Secrets are never embedded or static.
Application: SECRET_KEY, DATABASE_URL from environment variables only. .env never committed.

### 21. Zero Trust Identity
No request is trusted by default.
Application: Every protected endpoint validates JWT. Inactive users rejected before permission check.

### 22. Distributed Tracing Model
Requests are traceable across the entire system.
Application: X-Correlation-ID injected on every request, propagated through all logs and responses.

### 23. Rollback and Kill-Switch Strategy
Any change can be instantly disabled.
Application: Dynamic RBAC — admin can revoke permissions at runtime without code deployment.

### 24. Error Taxonomy
Errors follow a strict classification.
Application: Error codes namespaced by domain: AUTH_*, FINANCE_*, RBAC_*, USER_*, SYSTEM_*.

### 25. AI Observability and Eval Pipeline
AI behavior is measurable and auditable.
Application: Audit trail logs every mutation. Correlation IDs link Copilot-generated code to actions.

### 26. Eventing Model (Events-First)
State changes emit events.
Application: SSE stream on /v1/dashboard/live emits summary_updated on every transaction change.

### 27. SLO and Performance Budgets
Reliability targets are explicit.
Application: /health and /ready probes. DB query >200ms logged as warning. Rate limiter enforced.

### 28. Component Reuse
Shared logic lives in shared components.
Application: shared/ layer: one database.py, one rbac.py, one logger.py used by all micro apps.

### 29. Naming and Design Conventions
Consistency over personal preference.
Application: snake_case Python. camelCase JavaScript. kebab-case URLs. Plural nouns for collections.

### 30. Redaction and Privacy Rules
Sensitive data is never exposed unnecessarily.
Application: hashed_password never in responses. Tokens never in logs. PII masked in audit logs.

### 31. Code Generation Templates (AI)
AI produces code that follows standards by default.
Application: AGENTS.md defines exact templates for router, service, repository, hook, component.

### 32. Caching Tiers
Data cached at appropriate layers.
Application: Rate limiter uses in-memory sliding window. Future: Redis for session/summary cache.

### 33. Multi-Region Architecture Strategy
System tolerates regional failures.
Application: Supabase handles replication. Stateless API instances can run in any region.

---

## SECTION 3 — Distributed Systems and Operations

### 34. Data Ownership and Stewardship
One domain owns data mutations.
Application: Only transactions/ micro app writes to transactions table. Dashboard only reads.

### 35. Idempotency and Deduplication Strategy
Duplicate messages are harmless.
Application: UUID primary keys. Soft deletes prevent re-delete errors (404 on already-deleted).

### 36. Backpressure and Load Shedding
System degrades gracefully under load.
Application: Rate limiter returns 429 instead of crashing. Pagination prevents unbounded queries.

### 37. Clock, Ordering, and Time Semantics
Ordering guarantees are explicit.
Application: Audit logs sorted by created_at DESC. Transactions sorted by date DESC by default.

### 38. Human-in-the-Loop and Admin Authority
Admins have controlled elevated powers.
Application: Admin can manage users, change permissions, view audit logs. All actions are logged.

### 39. Decommissioning and Sunsetting
Features and APIs have an end-of-life.
Application: CHANGELOG.md tracks all route changes. Deprecation announced via response headers.

### 40. Concurrency Model
Concurrent access rules are explicit.
Application: SQLAlchemy sessions are per-request (not shared). DB-level constraints prevent races.

### 41. Network Partition Strategy (CAP)
Trade-offs during partitions are known.
Application: Choose consistency for financial writes. Dashboard summary tolerates eventual consistency.

### 42. Retry Storm Prevention
Retries must not amplify failures.
Application: Rate limiter prevents thundering herd. 429 response tells client when to retry (Reset header).

### 43. Data Contract Governance
Data formats are contracts.
Application: Pydantic schemas define request/response contracts. Changing field names is a breaking change.

### 44. Multi-Region Data Strategy (DR)
Data survives region loss.
Application: Supabase manages automated backups and point-in-time recovery.

### 45. Incident Response Playbook
Failures have predefined responses.
Application: /health → process alive. /ready → DB connected. Logs structured for rapid triage.

### 46. Privacy Engineering
Privacy is enforced technically.
Application: Passwords hashed at creation. Tokens never stored. Audit logs can be filtered by user.

### 47. Error Budget Policy
Reliability is a resource.
Application: Rate limit headers (X-RateLimit-Remaining) communicate budget to clients in real-time.

### 48. Model Registry and Versioning
AI models are versioned artifacts.
Application: API at /v1. All prompts in COPILOT_GUIDE.md are versioned by session number.

### 49. AI Drift Detection
AI quality degradation is detected early.
Application: Tests in every micro app catch regressions introduced by Copilot code generation.

### 50. Multi-Environment Release Taxonomy
Environments have strict roles.
Application: .env (dev) vs .env.example (template) vs Railway env vars (prod). Never mix.

### 51. Ownership Model (RACI)
Every component has an owner.
Application: Each micro app is self-contained. router.py owns HTTP. service.py owns business logic.

---

## SECTION 4 — Meta-Constitutions (Governance)

### 52. Decision Authority and Change Control
Rules for changing the rules.
Application: New constitutions added to this file via explicit session in COPILOT_GUIDE.md.

### 53. Enforcement and Automation
Rules are enforced by systems, not memory.
Application: AGENTS.md anti-patterns enforced by Copilot. Tests enforce correctness. Ruff/Biome enforce style.

### 54. Evolution and Drift Control
Architecture decay is actively prevented.
Application: CLAUDE.md, AGENTS.md, ARCHITECTURE.md reviewed and updated each development session.
