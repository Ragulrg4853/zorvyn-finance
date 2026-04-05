"""
Users service — business logic only.
Constitution: CLAUDE.md #8, #16, #19

Copilot direction — implement all functions in Session 4:

list_users(db, role?, is_active?, page, page_size) -> (List[UserRead], int)
  Pure pass-through to repository + schema conversion.

create_user(db, payload: UserCreate) -> UserRead
  Rule 1: username unique -> AUTH_001
  Rule 2: email unique -> AUTH_002
  Rule 3: hash password before persisting
  Flow: check_unique -> hash -> create -> return UserRead

get_user(db, user_id: UUID) -> UserRead
  Fetch by ID. Raise USER_001 (404) if not found.

update_user(db, user_id, payload: UserUpdate, requesting_user: User) -> UserRead
  Guard: admin cannot demote own role -> RBAC_002 (400)
  Apply only fields present in payload (exclude_unset=True)

deactivate_user(db, user_id, requesting_user: User) -> None
  Guard: admin cannot deactivate themselves -> 400
  Flow: fetch -> self-guard -> deactivate
"""
# Imports needed: users.repository, auth.repository (for uniqueness check),
#                 security.hash_password, UserRead schema, AppError, ErrorCode

from uuid import UUID
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import status

from shared.models.user import User, UserRole
from shared.utils.error_taxonomy import AppError, ErrorCode
from shared.utils.security import hash_password

from micro_apps.users import repository as users_repo
from micro_apps.auth import repository as auth_repo
from micro_apps.users.schemas import UserRead, UserCreate, UserUpdate

def list_users(db: Session, role: Optional[UserRole] = None, 
               is_active: Optional[bool] = None, 
               page: int = 1, page_size: int = 20) -> tuple[list[UserRead], int]:
    items, total = users_repo.list_users(db, role=role, is_active=is_active, page=page, page_size=page_size)
    return [UserRead.model_validate(user) for user in items], total

def create_user(db: Session, payload: UserCreate) -> UserRead:
    if auth_repo.find_by_username(db, payload.username):
        raise AppError(code=ErrorCode.AUTH_001, http_status=status.HTTP_400_BAD_REQUEST)
    if auth_repo.find_by_email(db, payload.email):
        raise AppError(code=ErrorCode.AUTH_002, http_status=status.HTTP_400_BAD_REQUEST)
    
    hashed = hash_password(payload.password)
    user = users_repo.create_user(
        db=db, 
        username=payload.username, 
        email=payload.email, 
        hashed_password=hashed, 
        role=payload.role
    )
    return UserRead.model_validate(user)

def get_user(db: Session, user_id: UUID) -> UserRead:
    user = users_repo.get_by_id(db, user_id)
    if not user:
        raise AppError(code=ErrorCode.USER_001, http_status=status.HTTP_404_NOT_FOUND)
    return UserRead.model_validate(user)

def update_user(db: Session, user_id: UUID, payload: UserUpdate, requesting_user: User) -> UserRead:
    user = users_repo.get_by_id(db, user_id)
    if not user:
        raise AppError(code=ErrorCode.USER_001, http_status=status.HTTP_404_NOT_FOUND)
    
    updates = payload.model_dump(exclude_unset=True)
    if "role" in updates:
        if user.id == requesting_user.id and requesting_user.role == UserRole.admin and updates["role"] != UserRole.admin:
            raise AppError(code=ErrorCode.RBAC_002, http_status=status.HTTP_400_BAD_REQUEST)

    updated_user = users_repo.update_user(db, user, updates)
    return UserRead.model_validate(updated_user)

def deactivate_user(db: Session, user_id: UUID, requesting_user: User) -> None:
    if str(user_id) == str(requesting_user.id):
        raise AppError(code=ErrorCode.USER_001, http_status=status.HTTP_400_BAD_REQUEST, field="user_id") # generic 400 for self-deactivation per rules
    
    user = users_repo.get_by_id(db, user_id)
    if not user:
        raise AppError(code=ErrorCode.USER_001, http_status=status.HTTP_404_NOT_FOUND)
    
    users_repo.deactivate_user(db, user)
