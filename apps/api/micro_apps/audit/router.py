"""
Audit router — read-only. Requires audit:read (admin only).
"""
from uuid import UUID
from datetime import date, datetime
from typing import Optional, Any
from pydantic import BaseModel, ConfigDict
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from shared.database import get_db
from shared.middleware.rbac import require_permission
from shared.middleware.correlation_id import get_correlation_id
from shared.models.audit_log import AuditLog

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
    q = db.query(AuditLog)
    if user_id: 
        q = q.filter(AuditLog.user_id == user_id)
    if action: 
        q = q.filter(AuditLog.action == action)
    if resource: 
        q = q.filter(AuditLog.resource_type == resource)
    if date_from: 
        q = q.filter(AuditLog.created_at >= date_from)
    if date_to: 
        q = q.filter(AuditLog.created_at <= date_to)

    total = q.count()
    total_pages = -(-total // page_size)
    
    q = q.order_by(AuditLog.created_at.desc())
    if cursor:
        q = q.filter(AuditLog.created_at < datetime.fromisoformat(cursor))
        page = None
        total_pages = None
    else:
        q = q.offset((page - 1) * page_size)
        
    q = q.limit(page_size + 1)
    items = q.all()
    
    has_more = len(items) > page_size
    next_cursor = items[-2].created_at.isoformat() if has_more else None
    items = items[:page_size]
    
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
