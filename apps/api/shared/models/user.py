"""
User ORM model.
Constitution: CLAUDE.md #61 (correct-by-construction), #12 (UTC timestamps)
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from shared.database import Base
import enum


class UserRole(str, enum.Enum):
    viewer  = "viewer"
    analyst = "analyst"
    admin   = "admin"


class User(Base):
    __tablename__ = "users"

    id              = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username        = Column(String(50),  unique=True, nullable=False, index=True)
    email           = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String,      nullable=False)
    role            = Column(SAEnum(UserRole), default=UserRole.viewer, nullable=False)
    is_active       = Column(Boolean, default=True, nullable=False)
    created_at      = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at      = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    transactions = relationship(
        "Transaction", back_populates="creator", foreign_keys="Transaction.created_by"
    )
    audit_logs = relationship("AuditLog", back_populates="actor")
