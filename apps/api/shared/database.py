"""
Database configuration and session management.
Constitution: CLAUDE.md #55 (resource lifetime), #57 (dependency isolation)
"""
import os
import ssl
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./finance.db")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Handle SSL context for production databases (e.g., Supabase/Railway)
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False
# If you are connecting to some hosted postgres, often you might need sslmode=require.
# We will just rely on sqlalchemy defaults unless ?sslmode=require is in URL.

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy ORM models."""
    pass


def get_db():
    """
    FastAPI dependency: one DB session per request.
    Constitution #55: deterministic lifetime via try/finally.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
