"""
Users router — HTTP contract only. All endpoints require users:manage.
Constitution: CLAUDE.md #26, API_CONSTITUTIONS.md #7

Copilot direction — implement in Session 4:
  GET    /            Query: role, is_active, page, page_size
  POST   /            Body: UserCreate -> 201 UserRead
  GET    /{user_id}   -> UserRead or 404
  PATCH  /{user_id}   Body: UserUpdate -> UserRead
  DELETE /{user_id}   Effect: is_active=False -> 204

Every endpoint: correlation_id = Depends(get_correlation_id)
Response shape: {"data":..., "meta":{"correlation_id":...}, "error": null}
"""
from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session

from shared.database import get_db
from shared.middleware.rbac import require_permission
from shared.middleware.correlation_id import get_correlation_id
from shared.models.user import User, UserRole
from shared.utils.validators import calculate_total_pages

from micro_apps.users import service as users_service
from micro_apps.users.schemas import UserCreate, UserUpdate, UserRead

router = APIRouter(dependencies=[Depends(require_permission("users:manage"))])

@router.get("")
def list_users(
    role: Optional[UserRole] = Query(None),
    is_active: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    correlation_id: str = Depends(get_correlation_id),
):
    items, total = users_service.list_users(db, role=role, is_active=is_active, page=page, page_size=page_size)
    total_pages = calculate_total_pages(total, page_size)
    return {
        "data": [item.model_dump() for item in items],
        "meta": {
            "correlation_id": correlation_id,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
        },
        "error": None
    }

@router.post("", status_code=status.HTTP_201_CREATED)
def create_user(
    payload: UserCreate,
    db: Session = Depends(get_db),
    correlation_id: str = Depends(get_correlation_id),
):
    user = users_service.create_user(db, payload)
    return {
        "data": user.model_dump(),
        "meta": {"correlation_id": correlation_id},
        "error": None
    }

@router.get("/{user_id}")
def get_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    correlation_id: str = Depends(get_correlation_id),
):
    user = users_service.get_user(db, user_id)
    return {
        "data": user.model_dump(),
        "meta": {"correlation_id": correlation_id},
        "error": None
    }

@router.patch("/{user_id}")
def update_user(
    user_id: UUID,
    payload: UserUpdate,
    current_user: User = Depends(require_permission("users:manage")),
    db: Session = Depends(get_db),
    correlation_id: str = Depends(get_correlation_id),
):
    user = users_service.update_user(db, user_id, payload, current_user)
    return {
        "data": user.model_dump(),
        "meta": {"correlation_id": correlation_id},
        "error": None
    }

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def deactivate_user(
    user_id: UUID,
    current_user: User = Depends(require_permission("users:manage")),
    db: Session = Depends(get_db),
):
    users_service.deactivate_user(db, user_id, current_user)
    return None
