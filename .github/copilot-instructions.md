# GitHub Copilot Instructions — Zorvyn Finance
# Auto-injected into every session in this repository.

## Read These Files First (in order)
1. README.md         — requirements, API contracts, role matrix, response envelope
2. CLAUDE.md         — 74 code quality rules
3. ARCHITECTURE.md   — 54 system architecture rules
4. API_CONSTITUTIONS.md — 54 API design rules
5. HIERARCHY.md      — 20 layer boundary rules
6. AGENTS.md         — code generation templates and anti-patterns

## Layer Rules (never violate)
Backend:  Router -> Service -> Repository
Frontend: Service -> Hook -> Component

## Response shape (every endpoint)
{"data": ..., "meta": {"correlation_id": "uuid"}, "error": null}

## Permissions
Always: require_permission("resource:action")
Never:  if user.role == "admin"

## Soft delete
Always: record.is_deleted = True
Never:  db.delete(record)

## Design tokens
Always: CSS variables like var(--color-primary)
Never:  hardcoded hex values in components

## Logging
Every entry needs correlation_id. Never log passwords, tokens, PII.
