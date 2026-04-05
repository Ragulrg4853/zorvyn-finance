"""
Transactions router — HTTP contract only.
Constitution: CLAUDE.md #26, API_CONSTITUTIONS.md #4 (IDs in path, filters in query)
NOTE: /export declared BEFORE /{transaction_id} to avoid routing conflict.
"""
from uuid import UUID
from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from shared.database import get_db
from shared.middleware.rbac import require_permission, get_current_user
from shared.middleware.correlation_id import get_correlation_id
from shared.models.user import User
from shared.models.transaction import TransactionType
from shared.utils.error_taxonomy import AppError, ErrorCode
from shared.utils.validators import validate_date_range, calculate_total_pages
from micro_apps.transactions import service as txn_service
from micro_apps.transactions.schemas import TransactionCreate, TransactionUpdate

router = APIRouter()

@router.get("/export", summary="Export transactions as CSV [transactions:export]")
def export_transactions(
    txn_type:  Optional[TransactionType] = Query(None, alias="type"),
    category:  Optional[str]  = None,
    date_from: Optional[date] = None,
    date_to:   Optional[date] = None,
    search:    Optional[str]  = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("transactions:export")),
):
    """Streams CSV download. Analyst and admin only."""
    validate_date_range(date_from, date_to)
    return StreamingResponse(
        txn_service.stream_transactions_csv(
            db=db, txn_type=txn_type, category=category,
            date_from=date_from, date_to=date_to, search=search,
        ),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=transactions.csv"}
    )


@router.get("/", summary="List transactions [transactions:read]")
def list_transactions(
    txn_type:  Optional[TransactionType] = Query(None, alias="type"),
    category:  Optional[str]  = None,
    date_from: Optional[date] = None,
    date_to:   Optional[date] = None,
    search:    Optional[str]  = None,
    sort:      str  = Query("date", pattern="^(date|amount|category)$"),
    order:     str  = Query("desc", pattern="^(asc|desc)$"),
    page:      int  = Query(1, ge=1),
    page_size: int  = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("transactions:read")),
    correlation_id: str = Depends(get_correlation_id),
):
    validate_date_range(date_from, date_to)
    items, total = txn_service.list_transactions(
        db=db, txn_type=txn_type, category=category,
        date_from=date_from, date_to=date_to, search=search,
        sort=sort, order=order, page=page, page_size=page_size,
    )
    total_pages = calculate_total_pages(total, page_size)
    return {
        "data":  [i.model_dump() for i in items],
        "meta":  {"total": total, "page": page, "page_size": page_size,
                  "total_pages": total_pages, "correlation_id": correlation_id},
        "error": None,
    }


@router.post("/", status_code=status.HTTP_201_CREATED,
             summary="Create transaction [transactions:write]")
def create_transaction(
    payload: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("transactions:write")),
    correlation_id: str = Depends(get_correlation_id),
):
    result = txn_service.create_transaction(db=db, payload=payload,
                                            created_by=current_user.id)
    return {"data": result.model_dump(), "meta": {"correlation_id": correlation_id},
            "error": None}


@router.get("/{transaction_id}", summary="Get transaction [transactions:read]")
def get_transaction(
    transaction_id: UUID,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("transactions:read")),
    correlation_id: str = Depends(get_correlation_id),
):
    result = txn_service.get_transaction(db=db, transaction_id=transaction_id)
    return {"data": result.model_dump(), "meta": {"correlation_id": correlation_id},
            "error": None}


@router.patch("/{transaction_id}", summary="Update transaction [transactions:write]")
def update_transaction(
    transaction_id: UUID,
    payload: TransactionUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("transactions:write")),
    correlation_id: str = Depends(get_correlation_id),
):
    result = txn_service.update_transaction(db=db, transaction_id=transaction_id,
                                            payload=payload)
    return {"data": result.model_dump(), "meta": {"correlation_id": correlation_id},
            "error": None}


@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT,
               summary="Soft-delete transaction [transactions:delete]")
def delete_transaction(
    transaction_id: UUID,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("transactions:delete")),
):
    txn_service.delete_transaction(db=db, transaction_id=transaction_id)
    return None
