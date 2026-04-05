from typing import Optional, List, Tuple
from uuid import UUID
from datetime import date, datetime
from sqlalchemy.orm import Session
from shared.models.audit_log import AuditLog

def count_logs(db: Session, user_id: Optional[UUID] = None, action: Optional[str] = None, resource: Optional[str] = None, date_from: Optional[date] = None, date_to: Optional[date] = None) -> int:
    q = _build_filter(db, user_id, action, resource, date_from, date_to)
    return q.count()

def _build_filter(db: Session, user_id: Optional[UUID], action: Optional[str], resource: Optional[str], date_from: Optional[date], date_to: Optional[date]):
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
    return q

def query_logs(db: Session, user_id: Optional[UUID] = None, action: Optional[str] = None, resource: Optional[str] = None, date_from: Optional[date] = None, date_to: Optional[date] = None, cursor: Optional[str] = None, page: int = 1, page_size: int = 20) -> List[AuditLog]:
    q = _build_filter(db, user_id, action, resource, date_from, date_to)
    q = q.order_by(AuditLog.created_at.desc(), AuditLog.id.asc())
    if cursor:
        q = q.filter(AuditLog.created_at < datetime.fromisoformat(cursor))
    else:
        q = q.offset((page - 1) * page_size)
    q = q.limit(page_size + 1)
    return q.all()