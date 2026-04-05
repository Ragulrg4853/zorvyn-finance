from typing import List
from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import status

from shared.models.role import Role
from shared.models.permission import Permission
from shared.utils.error_taxonomy import AppError, ErrorCode
from shared.middleware.rbac import _PERMISSIONS_CACHE

def invalidate_permission_cache(user_id: str):
    _PERMISSIONS_CACHE.pop(user_id, None)

from micro_apps.roles import repository as roles_repo
from micro_apps.roles.schemas import RoleRead, PermissionAssign, PermissionRead

def list_roles(db: Session) -> List[RoleRead]:
    roles = roles_repo.list_roles(db)
    return [RoleRead.model_validate(r) for r in roles]

def get_role(db: Session, role_id: UUID) -> RoleRead:
    role = roles_repo.get_role_by_id(db, role_id)
    if not role:
        raise AppError(code=ErrorCode.VALIDATION_001, http_status=status.HTTP_404_NOT_FOUND, field="role")
    return RoleRead.model_validate(role)

def list_permissions(db: Session) -> List[PermissionRead]:
    perms = roles_repo.list_permissions(db)
    return [PermissionRead.model_validate(p) for p in perms]

def update_role_permissions(db: Session, role_id: UUID, payload: PermissionAssign) -> RoleRead:
    role = roles_repo.get_role_by_id(db, role_id)
    if not role:
        raise AppError(code=ErrorCode.VALIDATION_001, http_status=status.HTTP_404_NOT_FOUND, field="role")
        
    if role.name == "admin":
        for r_id in payload.revoke:
            p = db.query(Permission).filter(Permission.id == r_id).first()
            if p and p.name == "roles:manage":
                raise AppError(code=ErrorCode.RBAC_002, http_status=status.HTTP_400_BAD_REQUEST, field="revoke")
                
    updated_role = roles_repo.assign_permissions(db, role_id, payload.grant, payload.revoke)
    _PERMISSIONS_CACHE.clear()  # Clear cache for all users when a role's permissions change
    return RoleRead.model_validate(updated_role)
