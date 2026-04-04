"""
Database configuration and session management.
Constitution: CLAUDE.md #55 (resource lifetime), #57 (dependency isolation)
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./finance.db")
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
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
