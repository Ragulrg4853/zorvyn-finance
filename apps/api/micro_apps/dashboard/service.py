"""
Dashboard service — aggregation logic.
Constitution: CLAUDE.md #48 (read-path optimization), #13 (O(n) single pass)

Algorithm: Single DB fetch, single O(n) pass builds ALL metrics simultaneously.
  Time:  O(n) where n = transactions in date range
  Space: O(m) where m = unique months (max 12 returned)
"""
from collections import defaultdict
from datetime import date
from typing import Optional
from sqlalchemy.orm import Session
from shared.models.transaction import Transaction, TransactionType


def compute_summary(db: Session, date_from: Optional[date] = None,
                    date_to: Optional[date] = None) -> dict:
    """
    Returns full dashboard summary in one DB fetch.
    Metrics computed: total_income, total_expense, net_balance,
                      total_transactions, monthly_trends (last 12), recent_transactions (last 10).
    """
    q = db.query(Transaction).filter(Transaction.is_deleted == False)
    if date_from: q = q.filter(Transaction.date >= date_from)
    if date_to:   q = q.filter(Transaction.date <= date_to)
    records = q.all()

    total_income  = 0.0
    total_expense = 0.0
    monthly: dict = defaultdict(lambda: {"income": 0.0, "expense": 0.0})

    # Single O(n) pass — builds totals and monthly breakdown simultaneously
    for r in records:
        amount = float(r.amount)
        key    = r.date.strftime("%Y-%m")
        if r.type == TransactionType.income:
            total_income           += amount
            monthly[key]["income"] += amount
        else:
            total_expense           += amount
            monthly[key]["expense"] += amount

    monthly_trends = [
        {
            "month":   k,
            "income":  round(v["income"],  2),
            "expense": round(v["expense"], 2),
            "net":     round(v["income"] - v["expense"], 2),
        }
        for k, v in sorted(monthly.items())
    ][-12:]  # last 12 months only

    # Recent 10: sort in Python — avoids second DB call
    recent = sorted(records, key=lambda r: r.date, reverse=True)[:10]

    return {
        "total_income":        round(total_income,  2),
        "total_expense":       round(total_expense, 2),
        "net_balance":         round(total_income - total_expense, 2),
        "total_transactions":  len(records),
        "monthly_trends":      monthly_trends,
        "recent_transactions": [
            {"id": str(r.id), "amount": float(r.amount), "type": r.type.value,
             "category": r.category, "date": str(r.date), "notes": r.notes}
            for r in recent
        ],
    }


def compute_insights(db: Session, date_from: Optional[date] = None,
                     date_to: Optional[date] = None) -> dict:
    """
    Returns category-level breakdown for analyst + admin.
    Single O(n) pass builds income_by_category and expense_by_category simultaneously.
    Returns top 10 categories per type to avoid overwhelming chart.
    """
    q = db.query(Transaction).filter(Transaction.is_deleted == False)
    if date_from: q = q.filter(Transaction.date >= date_from)
    if date_to:   q = q.filter(Transaction.date <= date_to)
    records = q.all()

    income_cats:  dict = defaultdict(float)
    expense_cats: dict = defaultdict(float)

    for r in records:
        if r.type == TransactionType.income:
            income_cats[r.category]  += float(r.amount)
        else:
            expense_cats[r.category] += float(r.amount)

    return {
        "income_by_category": [
            {"category": k, "total": round(v, 2)}
            for k, v in sorted(income_cats.items(), key=lambda x: -x[1])[:10]
        ],
        "expense_by_category": [
            {"category": k, "total": round(v, 2)}
            for k, v in sorted(expense_cats.items(), key=lambda x: -x[1])[:10]
        ],
    }
