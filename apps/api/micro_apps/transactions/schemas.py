"""
Transaction schemas. Constitution: CLAUDE.md #42, #61
"""
from uuid import UUID
from datetime import date, datetime
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, field_validator, Field
from shared.models.transaction import TransactionType


class TransactionCreate(BaseModel):
    amount:   Decimal
    type:     TransactionType
    category: str = Field(..., max_length=100)
    date:     date
    notes:    Optional[str] = Field(None, max_length=1000)

    @field_validator("amount")
    @classmethod
    def amount_must_be_positive(cls, v: Decimal) -> Decimal:
        if v <= 0:
            raise ValueError("Amount must be greater than zero")
        return round(v, 2)

    @field_validator("category")
    @classmethod
    def category_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Category cannot be empty")
        return v


class TransactionUpdate(BaseModel):
    amount:   Optional[Decimal] = None
    type:     Optional[TransactionType] = None
    category: Optional[str] = Field(None, max_length=100)
    date:     Optional[date] = None
    notes:    Optional[str] = Field(None, max_length=1000)

    @field_validator("amount")
    @classmethod
    def amount_positive_if_set(cls, v):
        if v is not None and v <= 0:
            raise ValueError("Amount must be greater than zero")
        return round(v, 2) if v is not None else v

    @field_validator("category")
    @classmethod
    def category_not_empty_if_set(cls, v):
        if v is not None:
            v = v.strip()
            if not v:
                raise ValueError("Category cannot be empty")
        return v



class TransactionRead(BaseModel):
    id:         UUID
    amount:     Decimal
    type:       TransactionType
    category:   str
    date:       date
    notes:      Optional[str]
    created_by: UUID
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}
