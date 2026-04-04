"""
RBAC middleware — permission-based access control.
Constitution: CLAUDE.md #6 (security-by-design), AGENTS.md (permission strings)

Usage in routers:
    current_user: User = Depends(require_permission("transactions:write"))

Security rules:
  1. Token validated before any permission check
  2. Inactive users rejected before permission check
  3. Permission strings used exclusively — never compare role names
"""
from uuid import UUID
from fastapi import Depends, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from shared.database import get_db
from shared.models.user import User
from shared.utils.security import decode_token
from shared.utils.error_taxonomy import AppError, ErrorCode

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/v1/auth/login")

# Default permissions per role — runtime DB override loaded in Session 5
DEFAULT_PERMISSIONS: dict[str, set[str]] = {
    "viewer": {
        "dashboard:read",
        "transactions:read",
    },
    "analyst": {
        "dashboard:read",
        "dashboard:insights",
        "transactions:read",
        "transactions:export",
    },
    "admin": {
        "dashboard:read",
        "dashboard:insights",
        "transactions:read",
        "transactions:write",
        "transactions:delete",
        "transactions:export",
        "users:read",
        "users:manage",
        "roles:manage",
        "audit:read",
    },
}


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Validates JWT and returns authenticated User.
    Assumption: Token issued by /v1/auth/login only.
    Raises AUTH_003 for invalid/expired token, AUTH_004 for inactive account.
    """
    payload = decode_token(token)
    if not payload:
        raise AppError(code=ErrorCode.AUTH_003, http_status=status.HTTP_401_UNAUTHORIZED)

    user = db.query(User).filter(User.id == UUID(payload["sub"])).first()
    if not user:
        raise AppError(code=ErrorCode.AUTH_003, http_status=status.HTTP_401_UNAUTHORIZED)
    if not user.is_active:
        raise AppError(code=ErrorCode.AUTH_004, http_status=status.HTTP_403_FORBIDDEN)
    return user


def require_permission(permission: str):
    """
    Dependency factory: enforces a specific permission string.
    Convention: always "resource:action" format.
    Never checks role name — checks permission string only.

    TODO(session-5): Load permissions from DB role_permissions table.
    Currently falls back to DEFAULT_PERMISSIONS dict.
    """
    def _check(current_user: User = Depends(get_current_user)) -> User:
        allowed = DEFAULT_PERMISSIONS.get(current_user.role.value, set())
        if permission not in allowed:
            raise AppError(code=ErrorCode.RBAC_001, http_status=status.HTTP_403_FORBIDDEN)
        return current_user
    return _check
