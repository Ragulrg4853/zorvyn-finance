from typing import List
from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import status

from shared.models.role import Role
from shared.models.permission import Permission
from shared.utils.error_taxonomy import AppError, ErrorCode
from shared.middleware.rbac import _PERMISSIONS_CACHE
from shared.utils.logger import get_logger

logger = get_logger(__name__)

def invalidate_permission_cache(user_id: str):
    _PERMISSIONS_CACHE.pop(user_id, None)

from shared.middleware.audit_logger import log_audit_event
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

def update_role_permissions(db: Session, role_id: UUID, payload: PermissionAssign, current_user, correlation_id: str) -> RoleRead:
    role = roles_repo.get_role_by_id(db, role_id)
    if not role:
        raise AppError(code=ErrorCode.VALIDATION_001, http_status=status.HTTP_404_NOT_FOUND, field="role")
        
    old_value = {"permissions": [p.id for p in role.permissions]}
    
    if role.name == "admin" and payload.revoke:
        revoking_perms = db.query(Permission.name).filter(Permission.id.in_(payload.revoke)).all()
        for (p_name,) in revoking_perms:
            if p_name == "roles:manage":
                logger.warning(f"Prevented removing roles:manage from admin role", extra={"action": "role_update_failed", "reason": "admin_cannot_lose_manage_roles"})
                raise AppError(code=ErrorCode.RBAC_002, http_status=status.HTTP_400_BAD_REQUEST, field="revoke")
                
    updated_role = roles_repo.assign_permissions(db, role_id, payload.grant, payload.revoke)
    _PERMISSIONS_CACHE.clear()  # Clear cache for all users when a role's permissions change
    logger.info(f"Role {role_id} permissions updated", extra={"action": "role_permissions_updated", "role_id": str(role_id), "granted": payload.grant, "revoked": payload.revoke})
    
    new_value = {"permissions": [p.id for p in updated_role.permissions]}
    log_audit_event(
        db=db,
        user_id=current_user.id,
        action="role.update_permissions",
        resource_type="roles",
        resource_id=str(role_id),
        old_value=old_value,
        new_value=new_value,
        correlation_id=correlation_id,
    )
    
    return RoleRead.model_validate(updated_role)
