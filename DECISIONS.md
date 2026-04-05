## ADR-001: O(1) Streaming CSV over Bulk Load
Status: Accepted
Context: Analysts can export 100,000+ transactions. Loading all into memory causes OOM.
Decision: Use SQLAlchemy yield_per(100) + FastAPI StreamingResponse generator.
Consequence: O(1) space complexity. Tradeoff: cannot calculate total row count before streaming starts.

## ADR-002: Cursor vs Offset Pagination for Audit Logs
Status: Accepted
Context: Audit logs create high-volume time-series data. High offset queries (e.g. OFFSET 100000) perform poorly in PostgreSQL as the DB still fetches and discards records sequentially.
Decision: Adopt cursor-based pagination (WHERE created_at < cursor ORDER BY created_at DESC) for the audit log endpoint to guarantee consistent performance.
Consequence: O(log N) lookup time using indexes, preventing query degradation on deep pages. Tradeoff: Clients can primarily only navigate forward/backward through pages, losing the ability to jump directly to a specific distant page number.

## ADR-003: 5-Minute TTL Permission Cache
Status: Accepted
Context: Every authenticated API request invokes the RBAC middleware, leading to repetitive 4-table SQL JOIN queries to verify permissions, increasing DB load continuously with traffic.
Decision: Implement an in-memory cache mapping user IDs to evaluated permissions with a 5-minute Time-To-Live (TTL), alongside explicit cache invalidation when a role is updated.
Consequence: Drastically minimizes read-path database latency. Tradeoff: Introduces potential state inconsistency (if explicit invalidation fails, permissions are stale for up to 5 minutes) and a tiny memory overhead per active user.

## ADR-004: SSE over WebSocket for Live Dashboard
Status: Accepted
Context: The dashboard needs live metric push updates. Maintaining full bidirectional WebSockets is complex, stateful, and overkill when data only flows outwards from the server.
Decision: Use Server-Sent Events (SSE) to push structured updates asynchronously from the backend over standard HTTP.
Consequence: Lowers infrastructure management overhead, keeps connections lightweight, and benefits from native browser reconnection support. Tradeoff: SSE is strictly unidirectional; any client-to-server operations must happen via separate standard REST endpoints.

## ADR-005: Soft Delete over Hard Delete
Status: Accepted
Context: Financial and system data demand strict auditing and compliance. Physically deleting records breaks relational foreign keys and permanently destroys historical context.
Decision: Implement Soft Delete logic by using an `is_deleted = True` boolean flag on core models (Transactions, Users, etc.) instead of hard deleting rows from the database.
Consequence: Ensures historical referential integrity and enables data recovery and audibility. Tradeoff: Storage volume grows perpetually; requires engineering vigilance to ensure `is_deleted == False` filters are manually applied to active read queries.
