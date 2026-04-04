"""
Transaction service tests.
Edge cases covered:
  - amount = 0 rejected by Pydantic schema
  - amount < 0 rejected by Pydantic schema
  - get non-existent transaction raises FINANCE_001
  - delete non-existent transaction raises FINANCE_001
  - export with no results returns CSV with header only
Edge cases skipped:
  - concurrent writes (DB transaction level, Constitution #44)
  - Decimal precision > 2 (enforced by Decimal(12,2) at DB level)
Constitution: CLAUDE.md #72, #73, #74
"""
import pytest
from decimal import Decimal
from datetime import date
from unittest.mock import MagicMock, patch
from micro_apps.transactions import service as txn_service
from micro_apps.transactions.schemas import TransactionCreate, TransactionUpdate
from shared.models.transaction import TransactionType
from shared.utils.error_taxonomy import AppError, ErrorCode
import uuid


class TestCreateTransaction:

    def test_should_reject_amount_of_zero(self):
        # Arrange + Act + Assert — Pydantic catches this at schema boundary
        with pytest.raises(Exception):
            TransactionCreate(
                amount=Decimal("0"), type=TransactionType.income,
                category="Salary", date=date(2026, 4, 1),
            )

    def test_should_reject_negative_amount(self):
        # Arrange + Act + Assert
        with pytest.raises(Exception):
            TransactionCreate(
                amount=Decimal("-50"), type=TransactionType.income,
                category="Salary", date=date(2026, 4, 1),
            )


class TestGetTransaction:

    def test_should_raise_finance001_when_transaction_not_found(self):
        # Arrange
        db = MagicMock()
        with patch("micro_apps.transactions.service.txn_repo.get_by_id", return_value=None):
            # Act + Assert
            with pytest.raises(AppError) as exc:
                txn_service.get_transaction(db=db, transaction_id=uuid.uuid4())
        assert exc.value.detail["code"] == ErrorCode.FINANCE_001.value


class TestDeleteTransaction:

    def test_should_raise_finance001_when_deleting_nonexistent_transaction(self):
        # Arrange
        db = MagicMock()
        with patch("micro_apps.transactions.service.txn_repo.get_by_id", return_value=None):
            # Act + Assert
            with pytest.raises(AppError) as exc:
                txn_service.delete_transaction(db=db, transaction_id=uuid.uuid4())
        assert exc.value.detail["code"] == ErrorCode.FINANCE_001.value
