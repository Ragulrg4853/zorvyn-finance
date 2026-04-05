from typing import Optional, Any, Dict, Tuple, List
from uuid import UUID
from datetime import date
from sqlalchemy.orm import Session
from micro_apps.audit import repository as audit_repo
from shared.models.audit_log import AuditLog
from shared.utils.validators import calculate_total_pages

def list_logs(db: Session, user_id: Optional[UUID] = None, action: Optional[str] = None, resource: Optional[str] = None, date_from: Optional[date] = None, date_to: Optional[date] = None, cursor: Optional[str] = None, page: int = 1, page_size: int = 20) -> Tuple[List[AuditLog], Optional[int], Optional[int], Optional[str], bool]:
    total = audit_repo.count_logs(db, user_id, action, resource, date_from, date_to) if not cursor else None
    total_pages = calculate_total_pages(total, page_size) if total is not None else None
    
    items = audit_repo.query_logs(
        db=db, user_id=user_id, action=action, resource=resource, 
        date_from=date_from, date_to=date_to, cursor=cursor, 
        page=page, page_size=page_size
    )
    
    has_more = len(items) > page_size
    next_cursor = items[-2].created_at.isoformat() if has_more else None
    items = items[:page_size]
    
    # Let router determine how page variables behave when cursor is sent
    return items, total, total_pages, next_cursor, has_more