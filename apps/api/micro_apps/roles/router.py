"""
Roles router — Dynamic RBAC. All endpoints require roles:manage.
TODO(session-5): Implement per direction below.

  GET  /roles                 -> List[RoleRead]
  GET  /roles/{role_id}       -> RoleRead or 404
  PATCH /roles/{role_id}/permissions  Body: PermissionAssign -> RoleRead
  GET  /permissions           -> List[PermissionRead]
"""
from fastapi import APIRouter
router = APIRouter()
