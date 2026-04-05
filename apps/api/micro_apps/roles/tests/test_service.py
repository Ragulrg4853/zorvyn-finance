"""
Roles service tests.
Edge cases covered:
  - should block revoking roles:manage from admin role
  - should raise VALIDATION_001 when grant and revoke overlap
  - should return updated permissions after successful grant
Edge cases intentionally skipped:
  - none
Constitution: CLAUDE.md #72, #73, #74
"""
import pytest
from unittest.mock import MagicMock, patch
from uuid import uuid4
from pydantic import ValidationError

from micro_apps.roles import service as roles_service
from micro_apps.roles.schemas import PermissionAssign
from shared.utils.error_taxonomy import AppError, ErrorCode

class DummyRole:
    def __init__(self, id, name, description, permissions=None):
        self.id = id
        self.name = name
        self.description = description
        self.permissions = permissions or []

class DummyPerm:
    def __init__(self, id, name, description):
        self.id = id
        self.name = name
        self.description = description

class TestUpdateRolePermissions:
    def test_should_block_revoking_roles_manage_from_admin_role(self):
        db = MagicMock()
        role_id = uuid4()
        perm_id = uuid4()

        mock_role = DummyRole(id=role_id, name="admin", description="desc")
        mock_perm = DummyPerm(id=perm_id, name="roles:manage", description="manage")
        
        db.query.return_value.filter.return_value.first.return_value = mock_perm
        
        payload = PermissionAssign.model_construct(grant=[], revoke=[perm_id])
        
        with patch("micro_apps.roles.service.roles_repo.get_role_by_id", return_value=mock_role):
            with pytest.raises(AppError) as exc:
                roles_service.update_role_permissions(db, role_id, payload)
        assert exc.value.detail["code"] == ErrorCode.RBAC_002.value

    def test_should_raise_validation001_when_grant_and_revoke_overlap(self):
        perm_id = uuid4()
        with pytest.raises(ValidationError):
            PermissionAssign(grant=[perm_id], revoke=[perm_id])

    def test_should_return_updated_permissions_after_successful_grant(self):
        db = MagicMock()
        role_id = uuid4()
        perm_id = uuid4()
        
        mock_role = DummyRole(id=role_id, name="viewer", description="viewer desc")
        mock_perm = DummyPerm(id=perm_id, name="new_perm", description="new perm desc")
        updated_role = DummyRole(id=role_id, name="viewer", description="viewer desc", permissions=[mock_perm])
        
        payload = PermissionAssign.model_construct(grant=[perm_id], revoke=[])
        
        with patch("micro_apps.roles.service.roles_repo.get_role_by_id", return_value=mock_role), \
             patch("micro_apps.roles.service.roles_repo.assign_permissions", return_value=updated_role):
             
             res = roles_service.update_role_permissions(db, role_id, payload)
             
        assert str(res.id) == str(role_id)
        assert res.name == "viewer"
