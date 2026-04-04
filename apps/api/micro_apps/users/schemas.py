"""
Users schemas. Constitution: CLAUDE.md #42, #61
"""
from uuid import UUID
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, field_validator
from shared.models.user import UserRole


class UserCreate(BaseModel):
    username: str
    email:    EmailStr
    password: str
    role:     UserRole = UserRole.viewer

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 3 or len(v) > 50:
            raise ValueError("Username must be 3-50 characters")
        if not v.replace("_", "").isalnum():
            raise ValueError("Username: letters, digits, underscores only")
        return v

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class UserUpdate(BaseModel):
    """All fields optional — only provided fields are changed."""
    email:     Optional[EmailStr] = None
    role:      Optional[UserRole] = None
    is_active: Optional[bool]     = None


class UserRead(BaseModel):
    id:         UUID
    username:   str
    email:      str
    role:       UserRole
    is_active:  bool
    created_at: datetime
    model_config = {"from_attributes": True}
