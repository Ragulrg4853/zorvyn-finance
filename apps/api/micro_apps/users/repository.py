"""
Users repository — DB queries only.
Constitution: CLAUDE.md #26, #71

Copilot direction — implement these functions in Session 4:

list_users(db, role?, is_active?, page, page_size) -> (List[User], int)
  Filter by role and/or is_active if provided. ORDER BY created_at DESC.
  Return (items, total). Use .offset/.limit for pagination.

get_by_id(db, user_id: UUID) -> User | None
  Simple PK lookup. Return None if not found.

create_user(db, username, email, hashed_password, role) -> User
  INSERT only. No business logic.

update_user(db, user: User, updates: dict) -> User
  Apply dict of field->value. db.commit(). db.refresh(). Return user.

deactivate_user(db, user: User) -> User
  Set user.is_active = False. NEVER hard delete. Constitution #9.
"""
from uuid import UUID
from typing import Optional
from sqlalchemy.orm import Session
from shared.models.user import User, UserRole


def list_users(db: Session, role: Optional[UserRole] = None,
               is_active: Optional[bool] = None,
               page: int = 1, page_size: int = 20) -> tuple[list, int]:
    # TODO(session-4): implement per docstring above
    raise NotImplementedError


def get_by_id(db: Session, user_id: UUID) -> Optional[User]:
    # TODO(session-4): db.query(User).filter(User.id == user_id).first()
    raise NotImplementedError


def create_user(db: Session, username: str, email: str,
                hashed_password: str, role: UserRole) -> User:
    # TODO(session-4): Instantiate User, db.add, db.commit, db.refresh, return
    raise NotImplementedError


def update_user(db: Session, user: User, updates: dict) -> User:
    # TODO(session-4): for k,v in updates.items(): setattr(user,k,v); commit; refresh
    raise NotImplementedError


def deactivate_user(db: Session, user: User) -> User:
    # TODO(session-4): user.is_active = False; db.commit(); return user
    raise NotImplementedError
