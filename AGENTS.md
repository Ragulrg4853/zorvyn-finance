# AGENTS.md — GitHub Copilot Agent Rules
# Read this before EVERY code generation session.

## Who You Are
Senior full-stack engineer on Zorvyn Finance. FAANG-grade standards.
Source of truth: README.md. All 74 rules in CLAUDE.md are mandatory.

## Absolute Layer Rules
Backend:  Router -> Service -> Repository
Frontend: Service -> Hook -> Component
NEVER skip or cross layers. No exceptions.

## Never Generate These
- Business logic inside router functions
- DB queries inside service functions
- API calls inside React components
- Hardcoded hex colors, URLs, or secrets
- catch blocks with no log or re-throw
- Functions doing more than one thing
- Missing error code on raised exceptions
- Missing correlation_id on log entries
- if user.role == "admin"  (use permission strings always)
- db.delete(record)        (use record.is_deleted = True always)
- useState without loading/error/empty handling

## Python Router Template
```python
@router.post("/", status_code=201, summary="Description [Permission: resource:write]")
async def create_resource(
    payload: SchemaCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("resource:write")),
    correlation_id: str = Depends(get_correlation_id),
):
    """Creates resource. Assumption: auth verified by require_permission middleware."""
    result = resource_service.create_resource(db=db, payload=payload, created_by=current_user.id)
    return {"data": result.model_dump(), "meta": {"correlation_id": correlation_id}, "error": None}
```

## Python Service Template
```python
def create_resource(db: Session, payload: SchemaCreate, created_by: UUID) -> SchemaRead:
    """Business logic. Raises AppError on rule violations.
    Assumption: payload validated at router boundary (CLAUDE.md #42)."""
    if payload.amount <= 0:
        raise AppError(code=ErrorCode.FINANCE_002, http_status=422)
    created = resource_repository.create(db=db, payload=payload, created_by=created_by)
    return SchemaRead.model_validate(created)
```

## Python Repository Template
```python
def create(db: Session, payload: SchemaCreate, created_by: UUID) -> ModelClass:
    """Persists record. Pure DB operation — zero business logic."""
    record = ModelClass(**payload.model_dump(), created_by=created_by)
    db.add(record); db.commit(); db.refresh(record)
    return record
```

## JavaScript Service Template
```javascript
// Constitution 66: all API calls in services — never in components
export async function fetchItems(filters) {
  const response = await apiClient.get('/v1/items', { params: filters });
  return response.data; // Full envelope: {data, meta, error}
}
```

## JavaScript Hook Template
```javascript
'use client';
// Constitution 66: state management only — no rendering, no direct API calls
// Constitution 67: loading, error, empty states explicitly managed
export function useItems() {
  const [state, setState] = useState({ data: [], loading: true, error: null, meta: null });
  // fetch on mount, update state, expose refetch
}
```

## JavaScript Component Template
```javascript
'use client';
// Constitution 66: renders only — receives data via props from hook
// Constitution 67: all three async states handled explicitly
export default function ItemTable({ items, loading, error, meta }) {
  if (loading) return <ItemTableSkeleton />;
  if (error)   return <ErrorState message={error.message} onRetry={error.retry} />;
  if (!items.length) return <EmptyState resource="items" />;
  return ( /* table JSX */ );
}
```

## Response Envelope (use on every endpoint)
```json
{"data": {}, "meta": {"correlation_id": "uuid"}, "error": null}
```

## Error Format
```json
{"data": null, "meta": {}, "error": {"code": "AUTH_003", "message": "...", "field": null}}
```
