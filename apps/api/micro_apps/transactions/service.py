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
from shared.utils.logger import get_logger
from micro_apps.transactions import repository as txn_repo
from micro_apps.transactions.schemas import (
    TransactionCreate, TransactionUpdate, TransactionRead,
)

logger = get_logger(__name__)

def create_transaction(db: Session, payload: TransactionCreate,
                       created_by: UUID) -> TransactionRead:
    """Creates a financial record."""
    record = txn_repo.create(
        db=db, amount=payload.amount, txn_type=payload.type,
        category=payload.category, txn_date=payload.date,
        notes=payload.notes, created_by=created_by,
    )
    logger.info(f"Transaction created: {record.id}", extra={"action": "transaction_created", "transaction_id": str(record.id), "amount": record.amount, "type": record.type.value})
    return TransactionRead.model_validate(record)


def get_transaction(db: Session, transaction_id: UUID) -> TransactionRead:
    """Fetches one transaction. Raises FINANCE_001 if not found or deleted."""
    record = txn_repo.get_by_id(db, transaction_id)
    if not record:
        logger.warning(f"Transaction fetch failed: {transaction_id} not found.", extra={"action": "transaction_fetch_failed", "transaction_id": str(transaction_id)})
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
        logger.warning(f"Transaction update failed: {transaction_id} not found.", extra={"action": "transaction_update_failed", "transaction_id": str(transaction_id)})
        raise AppError(code=ErrorCode.FINANCE_001, http_status=404)
    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(record, field, value)
    db.commit()
    db.refresh(record)
    logger.info(f"Transaction updated: {transaction_id}", extra={"action": "transaction_updated", "transaction_id": str(transaction_id), "updated_fields": list(updates.keys())})
    return TransactionRead.model_validate(record)


def delete_transaction(db: Session, transaction_id: UUID) -> None:
    """Soft-deletes a transaction. Constitution: CLAUDE.md #9."""
    record = txn_repo.get_by_id(db, transaction_id)
    if not record:
        logger.warning(f"Transaction deletion failed: {transaction_id} not found.", extra={"action": "transaction_deletion_failed", "transaction_id": str(transaction_id)})
        raise AppError(code=ErrorCode.FINANCE_001, http_status=404)
    txn_repo.soft_delete(db, record)
    logger.info(f"Transaction deleted: {transaction_id}", extra={"action": "transaction_deleted", "transaction_id": str(transaction_id)})


def stream_transactions_csv(db: Session, **filters):
    """Generator: yields CSV rows one at a time. O(1) space — never loads all rows."""
    yield "id,date,type,category,amount,notes\n"
    q = txn_repo.stream_filtered(db=db, **filters)
    for row in q.enable_eagerloads(False):
        notes = (row.notes or "").replace(",", ";")
        yield f"{row.id},{row.date},{row.type.value},{row.category},{row.amount},{notes}\n"
