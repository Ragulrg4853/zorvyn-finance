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
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from shared.database import get_db
from shared.models.user import User
from shared.utils.security import decode_token
from shared.utils.error_taxonomy import AppError, ErrorCode

from datetime import datetime, timedelta
from time import time

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/v1/auth/login")

_TOKEN_BLOCKLIST: set[str] = set()

def block_token(token: str):
    """"Adds token to a simple in-memory blocklist on logout."""
    _TOKEN_BLOCKLIST.add(token)

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

_PERMISSIONS_CACHE: dict[str, tuple[set[str], float]] = {}
_CACHE_TTL_SECONDS = 300  # 5 minutes

def invalidate_permission_cache(user_id: str = None):
    if user_id:
        _PERMISSIONS_CACHE.pop(user_id, None)
    else:
        _PERMISSIONS_CACHE.clear()

def fetch_permissions_from_db(db: Session, role_name: str) -> set[str]:
    try:
        query = text("""
            SELECT p.name 
            FROM permissions p
            JOIN role_permissions rp ON p.id = rp.permission_id
            JOIN roles r ON r.id = rp.role_id
            WHERE r.name = :role_name
        """)
        result = db.execute(query, {"role_name": role_name}).fetchall()
        if result:
            return {row[0] for row in result}
        return DEFAULT_PERMISSIONS.get(role_name, set())
    except SQLAlchemyError:
        db.rollback()
        return DEFAULT_PERMISSIONS.get(role_name, set())

def get_cached_permissions(user_id: str, role: str, db: Session) -> set[str]:
    """Returns cached permissions or fetches from DB. TTL = 5 minutes.
    Assumption: admin permission changes take up to 5min to propagate.
    """
    now = time()
    cache_key = str(user_id)
    if cache_key in _PERMISSIONS_CACHE:
        perms, expires_at = _PERMISSIONS_CACHE[cache_key]
        if now < expires_at:
            return perms
    # Cache miss or expired — query DB
    perms = fetch_permissions_from_db(db, role)
    _PERMISSIONS_CACHE[cache_key] = (perms, now + _CACHE_TTL_SECONDS)
    return perms

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Validates JWT and returns authenticated User.
    Assumption: Token issued by /v1/auth/login only.
    Raises AUTH_003 for invalid/expired token, AUTH_004 for inactive account.
    """
    if token in _TOKEN_BLOCKLIST:
        raise AppError(code=ErrorCode.AUTH_003, http_status=status.HTTP_401_UNAUTHORIZED)

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
    """
    def _check(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
    ) -> User:
        role_name = current_user.role.value if hasattr(current_user.role, "value") else current_user.role
        
        allowed = get_cached_permissions(str(current_user.id), role_name, db)

        if permission not in allowed:
            raise AppError(code=ErrorCode.RBAC_001, http_status=status.HTTP_403_FORBIDDEN)
        return current_user

    return _check
