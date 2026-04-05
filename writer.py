code = '''
"""
Dashboard service tests.
Edge cases covered:
  - should return all zeros when no transactions exist
  - should correctly filter by date_from and date_to
  - should return only last 12 months in monthly_trends
  - should return only last 10 in recent_transactions
Ideally, we also need to mock sub-queries now.
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
        mock_q = MagicMock()
        db.query.return_value = mock_q
        mock_q.filter.return_value = mock_q
        mock_q.group_by.return_value = mock_q
        mock_q.order_by.return_value = mock_q
        mock_q.limit.return_value = mock_q
        mock_q.all.side_effect = [[], [], []]
        
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
        mock_q.group_by.return_value = mock_q
        mock_q.order_by.return_value = mock_q
        mock_q.limit.return_value = mock_q
        mock_q.all.side_effect = [[(TransactionType.income, 0.0, 0)], [], []]
        
        date_from = date(2023, 1, 1)
        date_to = date(2023, 1, 31)
        
        dashboard_service.compute_summary(db, date_from=date_from, date_to=date_to)
        
        assert mock_q.filter.call_count >= 3

    def test_should_return_only_last_12_months_in_monthly_trends(self):
        db = MagicMock()
        mock_q = MagicMock()
        db.query.return_value = mock_q
        mock_q.filter.return_value = mock_q
        mock_q.group_by.return_value = mock_q
        mock_q.order_by.return_value = mock_q
        mock_q.limit.return_value = mock_q
        
        totals = [(TransactionType.income, 0.0, 0)]
        trends = [(2020 + i//12, (i%12)+1, TransactionType.income, 0.0) for i in range(15)]
        
        mock_q.all.side_effect = [totals, trends, []]
        
        res = dashboard_service.compute_summary(db)
        assert len(res["monthly_trends"]) == 12

    def test_should_return_only_last_10_in_recent_transactions(self):
        db = MagicMock()
        mock_q = MagicMock()
        db.query.return_value = mock_q
        mock_q.filter.return_value = mock_q
        mock_q.group_by.return_value = mock_q
        mock_q.order_by.return_value = mock_q
        mock_q.limit.return_value = mock_q
        
        recent = []
        for i in range(10):
            txn = MagicMock()
            txn.id = uuid4()
            txn.amount = 100.0
            txn.date = date.today() - timedelta(days=i)
            txn.type = TransactionType.income
            txn.category = "salary"
            txn.notes = ""
            recent.append(txn)
            
        mock_q.all.side_effect = [[(TransactionType.income, 0.0, 0)], [], recent]
        
        res = dashboard_service.compute_summary(db)
        assert len(res["recent_transactions"]) == 10
        mock_q.limit.assert_called_with(10)
'''
with open('apps/api/micro_apps/dashboard/tests/test_service.py', 'w', encoding='utf-8') as f:
    f.write(code.strip())
