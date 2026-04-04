"""
AuditLog ORM model — append-only, never updated or deleted.
Constitution: CLAUDE.md #9 (data lifecycle), ARCHITECTURE.md #38 (admin authority)
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from shared.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id             = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id        = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    action         = Column(String(100), nullable=False, index=True)
    resource_type  = Column(String(100), nullable=False)
    resource_id    = Column(String,  nullable=True)
    old_value      = Column(Text,    nullable=True)  # JSON snapshot before change
    new_value      = Column(Text,    nullable=True)  # JSON snapshot after change
    ip_address     = Column(String(45),  nullable=True)
    user_agent     = Column(String(500), nullable=True)
    correlation_id = Column(String,  nullable=True, index=True)
    created_at     = Column(DateTime(timezone=True),
                            default=lambda: datetime.now(timezone.utc), index=True)

    actor = relationship("User", back_populates="audit_logs", foreign_keys=[user_id])
