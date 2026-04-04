"""
Audit logger — appends to audit_logs on every mutation.
Constitution: CLAUDE.md #58 (side-effect visibility), ARCHITECTURE.md #38
Call from service layer AFTER successful DB commit.
Never raises — audit failure must not break the primary operation.
"""
import json
from uuid import UUID
from sqlalchemy.orm import Session
from shared.models.audit_log import AuditLog
from shared.utils.logger import get_logger

logger = get_logger(__name__)


def log_audit_event(
    db: Session,
    user_id: UUID | None,
    action: str,
    resource_type: str,
    resource_id: str | None = None,
    old_value: dict | None = None,
    new_value: dict | None = None,
    correlation_id: str | None = None,
    ip_address: str | None = None,
) -> None:
    """
    Appends an immutable audit record.
    Assumption: called after successful commit in service layer.
    """
    try:
        entry = AuditLog(
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=str(resource_id) if resource_id else None,
            old_value=json.dumps(old_value,  default=str) if old_value  else None,
            new_value=json.dumps(new_value, default=str) if new_value else None,
            correlation_id=correlation_id,
            ip_address=ip_address,
        )
        db.add(entry)
        db.commit()
    except Exception as exc:
        # Constitution #21: never swallow — log and continue. Audit failure is non-fatal.
        logger.error(f"action=audit.write status=error error={exc}")
