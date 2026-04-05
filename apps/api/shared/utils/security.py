"""
JWT and password security utilities.
Constitution: CLAUDE.md #37 (no sensitive data in code), #20 (fail fast)
SECRET_KEY loaded from environment — never hardcoded.
"""
import os
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY               = os.getenv("SECRET_KEY", "change-this-in-production-min-32-chars")
if os.getenv("ENVIRONMENT") == "production" and SECRET_KEY == "change-this-in-production-min-32-chars":
    raise RuntimeError("SECRET_KEY environment variable is missing or insecure in production.")

ALGORITHM                = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINS = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain_password: str) -> str:
    """Hashes plain-text password using bcrypt."""
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies plain-text password against bcrypt hash."""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(user_id: str, role: str,
                        expires_delta: Optional[timedelta] = None) -> str:
    """
    Creates a signed JWT. Payload: sub (user_id), role, exp.
    Constitution #37: role embedded in token to avoid DB lookup on every request.
    """
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINS)
    )
    payload = {"sub": str(user_id), "role": role, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> Optional[dict]:
    """
    Decodes and validates JWT. Returns payload dict or None if invalid/expired.
    Never raises — callers treat None as auth failure.
    """
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None
