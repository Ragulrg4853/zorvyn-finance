import typing
from uuid import UUID
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from shared.database import get_db
from shared.middleware.rbac import require_permission
from shared.middleware.correlation_id import get_correlation_id

from micro_apps.roles import service as roles_service
from micro_apps.roles.schemas import RoleRead, PermissionAssign, PermissionRead

router = APIRouter(dependencies=[Depends(require_permission("roles:manage"))])

@router.get("/roles")
def list_roles(
    db: Session = Depends(get_db),
    correlation_id: str = Depends(get_correlation_id),
):
    items = roles_service.list_roles(db)
    return {
        "data": [item.model_dump() for item in items],
        "meta": {"correlation_id": correlation_id},
        "error": None
    }

@router.get("/roles/{role_id}")
def get_role(
    role_id: UUID,
    db: Session = Depends(get_db),
    correlation_id: str = Depends(get_correlation_id),
):
    role = roles_service.get_role(db, role_id)
    return {
        "data": role.model_dump(),
        "meta": {"correlation_id": correlation_id},
        "error": None
    }

@router.patch("/roles/{role_id}/permissions")
def update_role_permissions(
    role_id: UUID,
    payload: PermissionAssign,
    db: Session = Depends(get_db),
    correlation_id: str = Depends(get_correlation_id),
):
    role = roles_service.update_role_permissions(db, role_id, payload)
    return {
        "data": role.model_dump(),
        "meta": {"correlation_id": correlation_id},
        "error": None
    }

@router.get("/permissions")
def list_permissions(
    db: Session = Depends(get_db),
    correlation_id: str = Depends(get_correlation_id),
):
    perms = roles_service.list_permissions(db)
    return {
        "data": [p.model_dump() for p in perms],
        "meta": {"correlation_id": correlation_id},
        "error": None
    }
