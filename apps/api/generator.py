import os

base = "c:/Users/girit/OneDrive/Documents/zorvyn-fintech/zorvyn-finance/zorvyn-finance/apps/api/micro_apps/"

users_code = """\"\"\"
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
\"\"\"
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
        with patch("micro_apps.users.service.auth_repo.find_by_username", return_value=None), \\
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
"""

roles_code = """\"\"\"
Roles service tests.
Edge cases covered:
  - should block revoking roles:manage from admin role
  - should raise VALIDATION_001 when grant and revoke overlap
  - should return updated permissions after successful grant
Edge cases intentionally skipped:
  - none
Constitution: CLAUDE.md #72, #73, #74
\"\"\"
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
        
        with patch("micro_apps.roles.service.roles_repo.get_role_by_id", return_value=mock_role), \\
             patch("micro_apps.roles.service.roles_repo.assign_permissions", return_value=updated_role):
             
             res = roles_service.update_role_permissions(db, role_id, payload)
             
        assert str(res.id) == str(role_id)
        assert res.name == "viewer"
"""

dashboard_code = """\"\"\"
Dashboard service tests.
Edge cases covered:
  - should return all zeros when no transactions exist
  - should correctly filter by date_from and date_to
  - should return only last 12 months in monthly_trends
  - should return only last 10 in recent_transactions
Edge cases intentionally skipped:
  - none
Constitution: CLAUDE.md #72, #73, #74
\"\"\"
import pytest
from unittest.mock import MagicMock
from datetime import date, timedelta
from uuid import uuid4

from micro_apps.dashboard import service as dashboard_service
from shared.models.transaction import TransactionType

class TestComputeSummary:
    def test_should_return_all_zeros_when_no_transactions_exist(self):
        db = MagicMock()
        db.query.return_value.filter.return_value.all.return_value = []
        
        res = dashboard_service.compute_summary(db)
        
        assert res["total_income"] == 0.0
        assert res["total_expense"] == 0.0
        assert res["net_balance"] == 0.0
        assert res["total_transactions"] == 0
        assert len(res["monthly_trends"]) == 0
        assert len(res["recent_transactions"]) == 0

    def test_should_correctly_filter_by_date_from_and_date_to(self):
        db = MagicMock()
        date_from = date(2023, 1, 1)
        date_to = date(2023, 1, 31)
        
        dashboard_service.compute_summary(db, date_from=date_from, date_to=date_to)
        
        query_mock = db.query.return_value.filter.return_value
        assert query_mock.filter.call_count == 2 

    def test_should_return_only_last_12_months_in_monthly_trends(self):
        db = MagicMock()
        query_mock = db.query.return_value.filter.return_value
        
        records = []
        for i in range(15):
            txn = MagicMock()
            txn.amount = 100.0
            txn.date = date(2020 + i//12, (i%12)+1, 1)
            txn.type = TransactionType.income
            records.append(txn)
            
        query_mock.all.return_value = records
        
        res = dashboard_service.compute_summary(db)
        
        assert len(res["monthly_trends"]) == 12

    def test_should_return_only_last_10_in_recent_transactions(self):
        db = MagicMock()
        query_mock = db.query.return_value.filter.return_value
        
        records = []
        for i in range(15):
            txn = MagicMock()
            txn.id = uuid4()
            txn.amount = 100.0
            txn.date = date.today() - timedelta(days=i)
            txn.type = TransactionType.income
            txn.category = "salary"
            txn.notes = ""
            records.append(txn)
            
        query_mock.all.return_value = records
        
        res = dashboard_service.compute_summary(db)
        
        assert len(res["recent_transactions"]) == 10
"""

audit_code = """\"\"\"
Audit service tests.
Edge cases covered:
  - logged events queryable, pagination works
Edge cases intentionally skipped:
  - heavy data load testing
Constitution: CLAUDE.md #72, #73, #74
\"\"\"
import pytest
from unittest.mock import MagicMock
from datetime import datetime, timezone
from uuid import uuid4

from micro_apps.audit.router import get_logs

class TestGetLogs:
    def test_should_return_paginated_response_when_events_queryable(self):
        db = MagicMock()
        q_mock = db.query.return_value
        q_mock.count.return_value = 1
        
        item = MagicMock()
        item.id = uuid4()
        item.user_id = uuid4()
        item.action = "create"
        item.resource_type = "user"
        item.resource_id = "123"
        item.old_value = None
        item.new_value = None
        item.ip_address = "1.1.1.1"
        item.correlation_id = "corr_123"
        item.created_at = datetime.now(timezone.utc)
        
        q_mock.order_by.return_value.offset.return_value.limit.return_value.all.return_value = [item]
        
        res = get_logs(page=1, page_size=20, db=db, correlation_id="test")
        
        assert res["meta"]["total"] == 1
        assert len(res["data"]) == 1
"""

with open(os.path.join(base, "users/tests/test_service.py"), "w") as f:
    f.write(users_code)
with open(os.path.join(base, "roles/tests/test_service.py"), "w") as f:
    f.write(roles_code)
with open(os.path.join(base, "dashboard/tests/test_service.py"), "w") as f:
    f.write(dashboard_code)
with open(os.path.join(base, "audit/tests/test_service.py"), "w") as f:
    f.write(audit_code)

print("Files written.")
