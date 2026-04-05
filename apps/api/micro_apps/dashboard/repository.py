from datetime import date
from typing import Optional, List, Tuple, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from shared.models.transaction import Transaction

def query_totals(db: Session, date_from: Optional[date] = None, date_to: Optional[date] = None) -> List[Tuple[Any, Any, Any]]:
    q = db.query(
        Transaction.type,
        func.sum(Transaction.amount).label("total_sum"),
        func.count(Transaction.id).label("txn_count")
    ).filter(Transaction.is_deleted == False)

    if date_from: q = q.filter(Transaction.date >= date_from)
    if date_to:   q = q.filter(Transaction.date <= date_to)
    return q.group_by(Transaction.type).all()


def query_monthly_trends(db: Session, date_from: Optional[date] = None, date_to: Optional[date] = None) -> List[Tuple[Any, Any, Any, Any]]:
    q = db.query(
        func.extract('year', Transaction.date).label('year'),
        func.extract('month', Transaction.date).label('month'),
        Transaction.type,
        func.sum(Transaction.amount).label('total')
    ).filter(Transaction.is_deleted == False)
    
    if date_from: q = q.filter(Transaction.date >= date_from)
    if date_to:   q = q.filter(Transaction.date <= date_to)

    return q.group_by(
        func.extract('year', Transaction.date),
        func.extract('month', Transaction.date),
        Transaction.type
    ).all()


def query_recent_transactions(db: Session, date_from: Optional[date] = None, date_to: Optional[date] = None, limit: int = 10) -> List[Transaction]:
    q = db.query(Transaction).filter(Transaction.is_deleted == False)
    if date_from: q = q.filter(Transaction.date >= date_from)
    if date_to:   q = q.filter(Transaction.date <= date_to)
    return q.order_by(Transaction.date.desc(), Transaction.id.asc()).limit(limit).all()


def query_insights(db: Session, date_from: Optional[date] = None, date_to: Optional[date] = None) -> List[Tuple[Any, Any, Any]]:
    q = db.query(
        Transaction.type,
        Transaction.category,
        func.sum(Transaction.amount).label("total")
    ).filter(Transaction.is_deleted == False)

    if date_from: q = q.filter(Transaction.date >= date_from)
    if date_to:   q = q.filter(Transaction.date <= date_to)

    return q.group_by(Transaction.type, Transaction.category).all()
