"""
Audit router — read-only. Requires audit:read (admin only).
"""
from uuid import UUID
from datetime import date, datetime
from typing import Optional, Any
from pydantic import BaseModel, ConfigDict
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from shared.database import get_db
from shared.middleware.rbac import require_permission
from shared.middleware.correlation_id import get_correlation_id
from micro_apps.audit import service as audit_service
from shared.models.audit_log import AuditLog
from shared.utils.error_taxonomy import AppError, ErrorCode
from shared.utils.validators import validate_date_range
from fastapi import status

router = APIRouter()

class dictType(BaseModel):
    model_config = ConfigDict(extra="allow")

class AuditLogRead(BaseModel):
    id: UUID
    user_id: UUID
    action: str
    resource_type: str
    resource_id: str
    old_value: Optional[dict] = None
    new_value: Optional[dict] = None
    ip_address: Optional[str] = None
    correlation_id: Optional[str] = None
    created_at: datetime
    
    model_config = {"from_attributes": True}


@router.get("/logs", summary="Get audit logs [audit:read]")
def get_logs(
    user_id: Optional[UUID] = None,
    action: Optional[str] = None,
    resource: Optional[str] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    cursor: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _ = Depends(require_permission("audit:read")),
    correlation_id: str = Depends(get_correlation_id)
):
    validate_date_range(date_from, date_to)

    items, total, total_pages, next_cursor, has_more = audit_service.list_logs(
        db=db, user_id=user_id, action=action, resource=resource, 
        date_from=date_from, date_to=date_to, cursor=cursor, 
        page=page, page_size=page_size
    )

    if cursor:
        page = None
    
    data = [AuditLogRead.model_validate(item).model_dump(mode="json") for item in items]

    return {
        "data": data,
        "meta": {
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
            "next_cursor": next_cursor,
            "has_more": has_more,
            "correlation_id": correlation_id
        },
        "error": None
    }
