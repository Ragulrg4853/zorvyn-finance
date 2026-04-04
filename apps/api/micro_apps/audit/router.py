"""
Audit router — read-only. Requires audit:read (admin only).
TODO(session-7): Implement per direction below.

  GET /logs
    Query: user_id?, action?, resource?, date_from?, date_to?, page, page_size
    Returns: PaginatedResponse<AuditLogRead>
    ORDER BY: created_at DESC

AuditLogRead fields:
  id, user_id, action, resource_type, resource_id,
  old_value, new_value, ip_address, correlation_id, created_at

IMPORTANT: Read-only endpoint. No POST/PATCH/DELETE ever on audit logs.
"""
from fastapi import APIRouter
router = APIRouter()
