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
    amount:   Decimal = Field(gt=0, le=999999999.99)
    type:     TransactionType
    category: str = Field(..., min_length=1, max_length=100)
    date:     date
    notes:    Optional[str] = Field(None, max_length=500)

    @field_validator("type", mode="before")
    @classmethod
    def type_normalize(cls, v):
        if isinstance(v, str):
            v_low = v.lower()
            if v_low in ("income", "expense"):
                return v_low
        return v

    @field_validator("date")
    @classmethod
    def check_date_bounds(cls, v: date) -> date:
        today = date.today()
        if today.year - v.year > 10:
            raise ValueError("Date cannot be more than 10 years in the past.")
        return v

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
    amount:   Optional[Decimal] = Field(None, gt=0, le=999999999.99)
    type:     Optional[TransactionType] = None
    category: Optional[str] = Field(None, min_length=1, max_length=100)
    date:     Optional[date] = None
    notes:    Optional[str] = Field(None, max_length=500)

    @field_validator("date", mode="before")
    @classmethod
    def normalize_date(cls, v):
        if v is None: return v
        if isinstance(v, str) and len(v) == 10:
            if v[2] == '-' and v[5] == '-':  # DD-MM-YYYY
                parts = v.split('-')
                return f"{parts[2]}-{parts[1]}-{parts[0]}"
        return v

    @field_validator("type", mode="before")
    @classmethod
    def type_normalize(cls, v):
        if isinstance(v, str):
            v_low = v.lower()
            if v_low in ("income", "expense"):
                return v_low
        return v

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
