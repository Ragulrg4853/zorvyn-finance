"""
Audit service tests.
Edge cases covered:
  - logged events queryable, pagination works
Edge cases intentionally skipped:
  - heavy data load testing
Constitution: CLAUDE.md #72, #73, #74
"""
import pytest
from unittest.mock import MagicMock
from datetime import datetime
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
        item.created_at = datetime.utcnow()
        
        q_mock.order_by.return_value.offset.return_value.limit.return_value.all.return_value = [item]
        
        res = get_logs(page=1, page_size=20, db=db, correlation_id="test")
        
        assert res["meta"]["total"] == 1
        assert len(res["data"]) == 1
