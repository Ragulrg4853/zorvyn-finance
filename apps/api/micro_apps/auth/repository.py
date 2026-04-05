"""
Auth repository — DB queries only. No business logic here.
Constitution: CLAUDE.md #26 (module boundaries), #17 (no hidden side effects)
"""
from sqlalchemy.orm import Session
from shared.models.user import User, UserRole


def find_by_username_or_email(db: Session, identifier: str) -> User | None:
    """Finds user by username or email. Returns None if not found."""
    return db.query(User).filter((User.username == identifier) | (User.email == identifier)).first()

def find_by_username(db: Session, username: str) -> User | None:
    """Finds user by username. Returns None if not found."""
    return db.query(User).filter(User.username == username).first()


def find_by_email(db: Session, email: str) -> User | None:
    """Finds user by email. Returns None if not found."""
    return db.query(User).filter(User.email == email).first()


def find_by_id(db: Session, user_id) -> User | None:
    """Finds user by UUID primary key."""
    return db.query(User).filter(User.id == user_id).first()


def create_user(db: Session, username: str, email: str,
                hashed_password: str) -> User:
    """Persists new user with viewer role (default). Pure DB operation."""
    user = User(
        username=username,
        email=email,
        hashed_password=hashed_password,
        role=UserRole.viewer,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
