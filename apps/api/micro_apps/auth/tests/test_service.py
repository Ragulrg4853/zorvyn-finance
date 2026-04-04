"""
Auth service tests.
Edge cases covered:
  - Successful registration with unique username and email
  - Duplicate username raises AUTH_001
  - Duplicate email raises AUTH_002
  - Correct credentials return token
  - Wrong username raises AUTH_003
  - Wrong password raises AUTH_003
  - Inactive account raises AUTH_004
Edge cases intentionally skipped:
  - Token expiry (tested at integration level)
  - bcrypt timing attacks (library responsibility)
Constitution: CLAUDE.md #72, #73, #74
"""
import pytest
from unittest.mock import MagicMock, patch
from micro_apps.auth import service as auth_service
from shared.utils.error_taxonomy import AppError, ErrorCode


class TestRegisterUser:

    def test_should_register_successfully_when_username_and_email_are_unique(self):
        # Arrange
        db       = MagicMock()
        mock_user = MagicMock(id="uuid-1", role=MagicMock(value="viewer"))
        with patch("micro_apps.auth.service.auth_repo.find_by_username", return_value=None), \
             patch("micro_apps.auth.service.auth_repo.find_by_email",    return_value=None), \
             patch("micro_apps.auth.service.auth_repo.create_user",      return_value=mock_user), \
             patch("micro_apps.auth.service.create_access_token",        return_value="tok"):
            # Act
            user, token = auth_service.register_user(db, "ragul", "r@test.com", "pass1234")
        # Assert
        assert token == "tok"
        assert user  == mock_user

    def test_should_raise_auth001_when_username_is_already_taken(self):
        # Arrange
        db = MagicMock()
        with patch("micro_apps.auth.service.auth_repo.find_by_username", return_value=MagicMock()):
            # Act + Assert
            with pytest.raises(AppError) as exc:
                auth_service.register_user(db, "ragul", "r@test.com", "pass1234")
        assert exc.value.detail["code"] == ErrorCode.AUTH_001.value

    def test_should_raise_auth002_when_email_is_already_registered(self):
        # Arrange
        db = MagicMock()
        with patch("micro_apps.auth.service.auth_repo.find_by_username", return_value=None), \
             patch("micro_apps.auth.service.auth_repo.find_by_email",    return_value=MagicMock()):
            # Act + Assert
            with pytest.raises(AppError) as exc:
                auth_service.register_user(db, "ragul2", "r@test.com", "pass1234")
        assert exc.value.detail["code"] == ErrorCode.AUTH_002.value


class TestAuthenticateUser:

    def test_should_return_token_when_credentials_are_valid(self):
        # Arrange
        db        = MagicMock()
        mock_user = MagicMock(is_active=True, role=MagicMock(value="viewer"))
        with patch("micro_apps.auth.service.auth_repo.find_by_username", return_value=mock_user), \
             patch("micro_apps.auth.service.verify_password",             return_value=True), \
             patch("micro_apps.auth.service.create_access_token",         return_value="valid"):
            # Act
            user, token = auth_service.authenticate_user(db, "ragul", "pass1234")
        # Assert
        assert token == "valid"

    def test_should_raise_auth003_when_user_not_found(self):
        # Arrange
        db = MagicMock()
        with patch("micro_apps.auth.service.auth_repo.find_by_username", return_value=None):
            # Act + Assert
            with pytest.raises(AppError) as exc:
                auth_service.authenticate_user(db, "nobody", "pass1234")
        assert exc.value.detail["code"] == ErrorCode.AUTH_003.value

    def test_should_raise_auth003_when_password_is_wrong(self):
        # Arrange
        db = MagicMock()
        with patch("micro_apps.auth.service.auth_repo.find_by_username", return_value=MagicMock()), \
             patch("micro_apps.auth.service.verify_password",             return_value=False):
            # Act + Assert
            with pytest.raises(AppError) as exc:
                auth_service.authenticate_user(db, "ragul", "wrongpass")
        assert exc.value.detail["code"] == ErrorCode.AUTH_003.value

    def test_should_raise_auth004_when_account_is_inactive(self):
        # Arrange
        db            = MagicMock()
        inactive_user = MagicMock(is_active=False)
        with patch("micro_apps.auth.service.auth_repo.find_by_username", return_value=inactive_user), \
             patch("micro_apps.auth.service.verify_password",             return_value=True):
            # Act + Assert
            with pytest.raises(AppError) as exc:
                auth_service.authenticate_user(db, "ragul", "pass1234")
        assert exc.value.detail["code"] == ErrorCode.AUTH_004.value
