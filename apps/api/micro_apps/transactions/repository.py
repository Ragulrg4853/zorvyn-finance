"""
Transactions repository — DB queries only.
Constitution: CLAUDE.md #26 (boundaries), #71 (index intentionality)
Index: (date, type) on transactions supports dashboard GROUP BY queries.
Index: category supports category filter in GET /transactions.
"""
from uuid import UUID
from datetime import date
from typing import Optional
from sqlalchemy.orm import Session
from shared.models.transaction import Transaction, TransactionType


def create(db: Session, amount, txn_type: TransactionType, category: str,
           txn_date: date, notes: Optional[str], created_by: UUID) -> Transaction:
    """Persists a new transaction. Pure DB operation — no business logic."""
    record = Transaction(
        amount=amount, type=txn_type, category=category,
        date=txn_date, notes=notes, created_by=created_by,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def get_by_id(db: Session, transaction_id: UUID) -> Optional[Transaction]:
    """Fetches active (not soft-deleted) transaction by ID."""
    return db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.is_deleted == False,
    ).first()


def list_filtered(db: Session, txn_type=None, category=None, date_from=None,
                  date_to=None, search=None, sort="date", order="desc",
                  page=1, page_size=20) -> tuple[list, int]:
    """
    Returns (items, total) for paginated filtered transaction list.
    All filters are additive AND logic.
    """
    q = db.query(Transaction).filter(Transaction.is_deleted == False)
    if txn_type:    q = q.filter(Transaction.type == txn_type)
    if category:    q = q.filter(Transaction.category.ilike(f"%{category}%"))
    if date_from:   q = q.filter(Transaction.date >= date_from)
    if date_to:     q = q.filter(Transaction.date <= date_to)
    if search:
        q = q.filter(
            Transaction.notes.ilike(f"%{search}%") |
            Transaction.category.ilike(f"%{search}%")
        )
    total    = q.count()
    sort_col = getattr(Transaction, sort, Transaction.date)
    q = q.order_by(sort_col.desc() if order == "desc" else sort_col.asc())
    items = q.offset((page - 1) * page_size).limit(page_size).all()
    return items, total


def soft_delete(db: Session, transaction: Transaction) -> Transaction:
    """Sets is_deleted=True. NEVER hard-deletes. Constitution: CLAUDE.md #9."""
    transaction.is_deleted = True
    db.commit()
    return transaction
