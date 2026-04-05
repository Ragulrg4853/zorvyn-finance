"""
Dashboard service tests.
Edge cases covered:
  - should return all zeros when no transactions exist
  - should correctly filter by date_from and date_to
  - should return only last 12 months in monthly_trends
  - should return only last 10 in recent_transactions
Edge cases intentionally skipped:
  - none
Constitution: CLAUDE.md #72, #73, #74
"""
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
        mock_q = MagicMock()
        db.query.return_value = mock_q
        mock_q.filter.return_value = mock_q
        
        date_from = date(2023, 1, 1)
        date_to = date(2023, 1, 31)
        
        dashboard_service.compute_summary(db, date_from=date_from, date_to=date_to)
        
        assert mock_q.filter.call_count == 3

    def test_should_return_only_last_12_months_in_monthly_trends(self):
        db = MagicMock()
        mock_q = MagicMock()
        db.query.return_value = mock_q
        mock_q.filter.return_value = mock_q
        
        records = []
        for i in range(15):
            txn = MagicMock()
            txn.amount = 100.0
            txn.date = date(2020 + i//12, (i%12)+1, 1)
            txn.type = TransactionType.income
            records.append(txn)
            
        mock_q.all.return_value = records
        
        res = dashboard_service.compute_summary(db)
        
        assert len(res["monthly_trends"]) == 12

    def test_should_return_only_last_10_in_recent_transactions(self):
        db = MagicMock()
        mock_q = MagicMock()
        db.query.return_value = mock_q
        mock_q.filter.return_value = mock_q
        
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
            
        mock_q.all.return_value = records
        
        res = dashboard_service.compute_summary(db)
        
        assert len(res["recent_transactions"]) == 10
