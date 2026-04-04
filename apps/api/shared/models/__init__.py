# Register all ORM models before Base.metadata.create_all() is called in main.py
from shared.models.user import User, UserRole
from shared.models.transaction import Transaction, TransactionType
from shared.models.audit_log import AuditLog

__all__ = ["User", "UserRole", "Transaction", "TransactionType", "AuditLog"]
