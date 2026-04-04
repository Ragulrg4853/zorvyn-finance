"""
Error taxonomy — typed error codes and AppError exception.
Constitution: CLAUDE.md #19 (errors are first-class), #20 (fail fast, fail clearly)
All error codes match the registry in README.md exactly.
"""
from enum import Enum
from fastapi import HTTPException


class ErrorCode(str, Enum):
    AUTH_001       = "AUTH_001"        # Username already taken
    AUTH_002       = "AUTH_002"        # Email already registered
    AUTH_003       = "AUTH_003"        # Invalid credentials or expired token
    AUTH_004       = "AUTH_004"        # Account is inactive
    RBAC_001       = "RBAC_001"        # Insufficient permissions
    RBAC_002       = "RBAC_002"        # Cannot demote own admin role
    USER_001       = "USER_001"        # User not found
    FINANCE_001    = "FINANCE_001"     # Transaction not found
    FINANCE_002    = "FINANCE_002"     # Amount must be > 0
    FINANCE_003    = "FINANCE_003"     # Invalid transaction type
    VALIDATION_001 = "VALIDATION_001"  # Field validation failed
    SYSTEM_001     = "SYSTEM_001"      # Unexpected server error


_MESSAGES = {
    ErrorCode.AUTH_001:       "Username is already taken",
    ErrorCode.AUTH_002:       "Email is already registered",
    ErrorCode.AUTH_003:       "Invalid credentials or token has expired",
    ErrorCode.AUTH_004:       "Account is inactive",
    ErrorCode.RBAC_001:       "You do not have permission to perform this action",
    ErrorCode.RBAC_002:       "You cannot change your own admin role",
    ErrorCode.USER_001:       "User not found",
    ErrorCode.FINANCE_001:    "Transaction not found",
    ErrorCode.FINANCE_002:    "Amount must be greater than zero",
    ErrorCode.FINANCE_003:    "Transaction type must be income or expense",
    ErrorCode.VALIDATION_001: "Input validation failed",
    ErrorCode.SYSTEM_001:     "An unexpected error occurred",
}


class AppError(HTTPException):
    """
    Typed application exception with error code.
    Usage: raise AppError(code=ErrorCode.AUTH_003, http_status=401)
    Constitution: CLAUDE.md #19 (typed), #20 (explicit message)
    """
    def __init__(self, code: ErrorCode, http_status: int, field: str | None = None):
        super().__init__(
            status_code=http_status,
            detail={
                "code":    code.value,
                "message": _MESSAGES.get(code, "Unknown error"),
                "field":   field,
            },
        )
