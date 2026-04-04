"""
Roles schemas. Constitution: CLAUDE.md #42, #61
"""
from uuid import UUID
from typing import List
from pydantic import BaseModel, model_validator


class PermissionRead(BaseModel):
    id:          UUID
    name:        str
    description: str
    model_config = {"from_attributes": True}


class RoleRead(BaseModel):
    id:          UUID
    name:        str
    description: str
    permissions: List[PermissionRead] = []
    model_config = {"from_attributes": True}


class PermissionAssign(BaseModel):
    grant:  List[UUID] = []
    revoke: List[UUID] = []

    @model_validator(mode="after")
    def no_overlap(self) -> "PermissionAssign":
        overlap = set(self.grant) & set(self.revoke)
        if overlap:
            raise ValueError(f"IDs cannot appear in both grant and revoke: {overlap}")
        return self
