"""
Transaction ORM model.
Constitution: CLAUDE.md #9 (data lifecycle, soft delete), #12 (UTC timestamps)
Soft delete: is_deleted=True replaces hard DELETE everywhere — never use db.delete().
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Numeric, Boolean, DateTime, Date, Text, CheckConstraint
from sqlalchemy import Enum as SAEnum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from shared.database import Base
import enum


class TransactionType(str, enum.Enum):
    income  = "income"
    expense = "expense"


class Transaction(Base):
    __tablename__ = "transactions"
    __table_args__ = (
        CheckConstraint("amount > 0", name="chk_amount_positive"),
    )

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    amount     = Column(Numeric(12, 2), nullable=False)
    type       = Column(SAEnum(TransactionType), nullable=False)
    category   = Column(String(100), nullable=False, index=True)
    date       = Column(Date, nullable=False, index=True)
    notes      = Column(Text, nullable=True)
    is_deleted = Column(Boolean, default=False, nullable=False, index=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    creator = relationship("User", back_populates="transactions", foreign_keys=[created_by])
