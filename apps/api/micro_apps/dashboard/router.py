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

from shared.utils.error_taxonomy import AppError, ErrorCode
from shared.utils.validators import validate_date_range
from shared.utils.logger import get_logger

logger = get_logger(__name__)
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
    logger.info("Computing dashboard summary", extra={"action": "dashboard.summary.started", "date_from": str(date_from), "date_to": str(date_to), "correlation_id": correlation_id})
    try:
        validate_date_range(date_from, date_to)
        data = dashboard_service.compute_summary(db=db, date_from=date_from, date_to=date_to)
        return {"data": data, "meta": {"correlation_id": correlation_id}, "error": None}
    except Exception as e:
        logger.error(f"Failed to compute dashboard summary: {str(e)}", exc_info=True, extra={"action": "dashboard.summary.failed", "correlation_id": correlation_id})
        raise


@router.get("/insights", summary="Category insights [dashboard:insights]")
def get_insights(
    date_from: Optional[date] = None,
    date_to:   Optional[date] = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("dashboard:insights")),
    correlation_id: str = Depends(get_correlation_id),
):
    """Returns income and expense breakdowns by category. Analyst and admin only."""
    validate_date_range(date_from, date_to)
    data = dashboard_service.compute_insights(db=db, date_from=date_from, date_to=date_to)
    return {"data": data, "meta": {"correlation_id": correlation_id}, "error": None}


async def _sse_stream():
    """SSE generator — safely polls without holding DB connections open."""
    from shared.database import SessionLocal
    while True:
        db_session = SessionLocal()
        try:
            summary = await asyncio.to_thread(dashboard_service.compute_summary, db_session)
            yield f"event: summary_updated\ndata: {json.dumps(summary)}\n\n"
        finally:
            db_session.close()
        await asyncio.sleep(10)


@router.get("/live", summary="Real-time SSE stream [dashboard:read]")
def live_dashboard(
    _: User = Depends(require_permission("dashboard:read")),
):
    """Server-Sent Events stream. Pushes summary every 10 seconds."""
    return StreamingResponse(
        _sse_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
