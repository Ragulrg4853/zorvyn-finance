"""
Users service tests.
Edge cases covered:
  - should raise AUTH_001 when username already taken
  - should raise AUTH_002 when email already registered
  - should raise RBAC_002 when admin demotes own role
  - should raise 400 when admin deactivates themselves
  - should raise USER_001 when user not found
Edge cases intentionally skipped:
  - DB transaction rollbacks (handled by middleware)
Constitution: CLAUDE.md #72, #73, #74
"""
import pytest
from unittest.mock import MagicMock, patch
from uuid import uuid4
from fastapi import status

from micro_apps.users import service as users_service
from micro_apps.users.schemas import UserCreate, UserUpdate
from shared.models.user import UserRole
from shared.utils.error_taxonomy import AppError, ErrorCode

class TestCreateUser:
    def test_should_raise_auth001_when_username_already_taken(self):
        db = MagicMock()
        payload = UserCreate(username="taken", email="new@test.com", password="password", role=UserRole.viewer)
        with patch("micro_apps.users.service.auth_repo.find_by_username", return_value=MagicMock()):
            with pytest.raises(AppError) as exc:
                users_service.create_user(db, payload)
        assert exc.value.detail["code"] == ErrorCode.AUTH_001.value

    def test_should_raise_auth002_when_email_already_registered(self):
        db = MagicMock()
        payload = UserCreate(username="new", email="taken@test.com", password="password", role=UserRole.viewer)
        with patch("micro_apps.users.service.auth_repo.find_by_username", return_value=None), \
             patch("micro_apps.users.service.auth_repo.find_by_email", return_value=MagicMock()):
            with pytest.raises(AppError) as exc:
                users_service.create_user(db, payload)
        assert exc.value.detail["code"] == ErrorCode.AUTH_002.value

class TestUpdateUser:
    def test_should_raise_rbac002_when_admin_demotes_own_role(self):
        db = MagicMock()
        user_id = uuid4()
        admin_user = MagicMock(id=user_id, role=UserRole.admin)
        payload = UserUpdate(role=UserRole.viewer)
        with patch("micro_apps.users.service.users_repo.get_by_id", return_value=admin_user):
            with pytest.raises(AppError) as exc:
                users_service.update_user(db, user_id, payload, requesting_user=admin_user)
        assert exc.value.detail["code"] == ErrorCode.RBAC_002.value

class TestDeactivateUser:
    def test_should_raise_400_when_admin_deactivates_themselves(self):
        db = MagicMock()
        user_id = uuid4()
        admin_user = MagicMock(id=user_id)
        with pytest.raises(AppError) as exc:
            users_service.deactivate_user(db, user_id, requesting_user=admin_user)
        assert exc.value.detail["code"] == ErrorCode.USER_001.value
        assert exc.value.status_code == status.HTTP_400_BAD_REQUEST

class TestGetUser:
    def test_should_raise_user001_when_user_not_found(self):
        db = MagicMock()
        user_id = uuid4()
        with patch("micro_apps.users.service.users_repo.get_by_id", return_value=None):
            with pytest.raises(AppError) as exc:
                users_service.get_user(db, user_id)
        assert exc.value.detail["code"] == ErrorCode.USER_001.value
