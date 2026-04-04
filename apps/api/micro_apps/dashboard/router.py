"""
Dashboard router — HTTP contract only.
Constitution: CLAUDE.md #26 (boundaries), API_CONSTITUTIONS.md #7
"""
import asyncio
import json
from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from shared.database import get_db
from shared.middleware.rbac import require_permission
from shared.middleware.correlation_id import get_correlation_id
from shared.models.user import User
from micro_apps.dashboard import service as dashboard_service

router = APIRouter()


@router.get("/summary", summary="Full dashboard summary [dashboard:read]")
def get_summary(
    date_from: Optional[date] = None,
    date_to:   Optional[date] = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("dashboard:read")),
    correlation_id: str = Depends(get_correlation_id),
):
    """Returns totals, net balance, recent transactions, and monthly trends."""
    data = dashboard_service.compute_summary(db=db, date_from=date_from, date_to=date_to)
    return {"data": data, "meta": {"correlation_id": correlation_id}, "error": None}


@router.get("/insights", summary="Category insights [dashboard:insights]")
def get_insights(
    date_from: Optional[date] = None,
    date_to:   Optional[date] = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("dashboard:insights")),
    correlation_id: str = Depends(get_correlation_id),
):
    """Returns income and expense breakdowns by category. Analyst and admin only."""
    data = dashboard_service.compute_insights(db=db, date_from=date_from, date_to=date_to)
    return {"data": data, "meta": {"correlation_id": correlation_id}, "error": None}


async def _sse_stream(db: Session):
    """SSE generator — pushes dashboard summary every 10 seconds."""
    while True:
        summary = dashboard_service.compute_summary(db=db)
        yield f"event: summary_updated\ndata: {json.dumps(summary)}\n\n"
        await asyncio.sleep(10)


@router.get("/live", summary="Real-time SSE stream [dashboard:read]")
def live_dashboard(
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("dashboard:read")),
):
    """Server-Sent Events stream. Pushes summary every 10 seconds."""
    return StreamingResponse(
        _sse_stream(db=db),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
