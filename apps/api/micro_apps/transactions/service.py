"""
Transactions service — business logic only.
Constitution: CLAUDE.md #8 (one thing), #16 (command flow)
Assumption: All payloads validated at router boundary before reaching here.
"""
import csv
import io
from uuid import UUID
from typing import Optional
from sqlalchemy.orm import Session
from shared.utils.error_taxonomy import AppError, ErrorCode
from shared.models.transaction import TransactionType
from micro_apps.transactions import repository as txn_repo
from micro_apps.transactions.schemas import (
    TransactionCreate, TransactionUpdate, TransactionRead,
)


def create_transaction(db: Session, payload: TransactionCreate,
                       created_by: UUID) -> TransactionRead:
    """Creates a financial record."""
    record = txn_repo.create(
        db=db, amount=payload.amount, txn_type=payload.type,
        category=payload.category, txn_date=payload.date,
        notes=payload.notes, created_by=created_by,
    )
    return TransactionRead.model_validate(record)


def get_transaction(db: Session, transaction_id: UUID) -> TransactionRead:
    """Fetches one transaction. Raises FINANCE_001 if not found or deleted."""
    record = txn_repo.get_by_id(db, transaction_id)
    if not record:
        raise AppError(code=ErrorCode.FINANCE_001, http_status=404)
    return TransactionRead.model_validate(record)


def list_transactions(db: Session, **filters):
    """Returns (List[TransactionRead], total) for paginated filtered list."""
    items, total = txn_repo.list_filtered(db=db, **filters)
    return [TransactionRead.model_validate(i) for i in items], total


def update_transaction(db: Session, transaction_id: UUID,
                       payload: TransactionUpdate) -> TransactionRead:
    """Partially updates a transaction. Raises FINANCE_001 if not found."""
    record = txn_repo.get_by_id(db, transaction_id)
    if not record:
        raise AppError(code=ErrorCode.FINANCE_001, http_status=404)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(record, field, value)
    db.commit()
    db.refresh(record)
    return TransactionRead.model_validate(record)


def delete_transaction(db: Session, transaction_id: UUID) -> None:
    """Soft-deletes a transaction. Constitution: CLAUDE.md #9."""
    record = txn_repo.get_by_id(db, transaction_id)
    if not record:
        raise AppError(code=ErrorCode.FINANCE_001, http_status=404)
    txn_repo.soft_delete(db, record)


def export_transactions_csv(db: Session, **filters) -> str:
    """Exports filtered transactions as CSV string (no pagination — full export)."""
    items, _ = txn_repo.list_filtered(db=db, page=1, page_size=10000, **filters)
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["id", "date", "type", "category", "amount", "notes"])
    for item in items:
        writer.writerow([
            item.id, item.date, item.type.value,
            item.category, item.amount, item.notes or "",
        ])
    return output.getvalue()
