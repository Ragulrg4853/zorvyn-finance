"""
Auth schemas — request/response contracts.

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
        if len(v) < 3 or len(v) > 50:
            raise ValueError("Username must be between 3 and 50 characters")
        if not v.replace("_", "").isalnum():
            raise ValueError("Username: letters, digits, underscores only")
        return v

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8 or len(v) > 100:
            raise ValueError("Password must be between 8 and 100 characters")
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
    permissions: Optional[list[str]] = None
    model_config = {"from_attributes": True}
