"""
Auth service — business logic only.
Constitution: CLAUDE.md #8 (one thing), #16 (command flow), #19 (typed errors)
Assumption: Payloads validated at router boundary before reaching this layer.
"""
from sqlalchemy.orm import Session
from fastapi import status
from shared.models.user import User
from shared.utils.security import hash_password, verify_password, create_access_token
from shared.utils.error_taxonomy import AppError, ErrorCode
from micro_apps.auth import repository as auth_repo


def register_user(db: Session, username: str, email: str,
                  password: str) -> tuple[User, str]:
    """
    Registers a new user account.
    Business rules:
      1. Username must be unique -> AUTH_001
      2. Email must be unique    -> AUTH_002
      3. Password hashed before persist
    Returns: (User, access_token)
    """
    if auth_repo.find_by_username(db, username):
        raise AppError(code=ErrorCode.AUTH_001, http_status=status.HTTP_400_BAD_REQUEST)
    if auth_repo.find_by_email(db, email):
        raise AppError(code=ErrorCode.AUTH_002, http_status=status.HTTP_400_BAD_REQUEST)

    hashed = hash_password(password)
    user   = auth_repo.create_user(db=db, username=username,
                                   email=email, hashed_password=hashed)
    token  = create_access_token(user_id=str(user.id), role=user.role.value)
    return user, token


def authenticate_user(db: Session, username: str,
                      password: str) -> tuple[User, str]:
    """
    Authenticates credentials and returns JWT.
    Business rules:
      1. User must exist and password must match -> AUTH_003
      2. Account must be active                 -> AUTH_004
    Returns: (User, access_token)
    """
    user = auth_repo.find_by_username_or_email(db, username)
    if not user or not verify_password(password, user.hashed_password):
        raise AppError(code=ErrorCode.AUTH_003, http_status=status.HTTP_401_UNAUTHORIZED)
    if not user.is_active:
        raise AppError(code=ErrorCode.AUTH_004, http_status=status.HTTP_403_FORBIDDEN)

    token = create_access_token(user_id=str(user.id), role=user.role.value)
    return user, token
