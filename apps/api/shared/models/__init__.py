# Register all ORM models before Base.metadata.create_all() is called in main.py
from shared.models.user import User, UserRole
from shared.models.transaction import Transaction, TransactionType
from shared.models.audit_log import AuditLog
from shared.models.role import Role, RolePermission
from shared.models.permission import Permission

__all__ = [
    "User", "UserRole", 
    "Transaction", "TransactionType", 
    "AuditLog", 
    "Role", "RolePermission", "Permission"
]
