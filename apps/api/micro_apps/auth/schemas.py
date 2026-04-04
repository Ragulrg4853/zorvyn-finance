"""
Auth schemas — request/response contracts.
Constitution: CLAUDE.md #42 (boundary validation), #61 (correct-by-construction)
"""
from uuid import UUID
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, field_validator
from shared.models.user import UserRole


class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 3:
            raise ValueError("Username must be at least 3 characters")
        if not v.replace("_", "").isalnum():
            raise ValueError("Username: letters, digits, underscores only")
        return v

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserReadPublic(BaseModel):
    id: UUID
    username: str
    email: str
    role: UserRole
    is_active: bool
    created_at: datetime
    model_config = {"from_attributes": True}
