import os

content = '''\"\"\"
Dashboard service — aggregation logic.
Constitution: CLAUDE.md #48 (read-path optimization)

Algorithm: Database-level aggregations to maintain O(1) memory footprint.
Avoids pulling all raw transactions into memory.
\"\"\"
from collections import defaultdict
from datetime import date
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from shared.models.transaction import Transaction, TransactionType


def compute_summary(db: Session, date_from: Optional[date] = None,
                    date_to: Optional[date] = None) -> dict:
    \"\"\"
    Returns full dashboard summary using database aggregations.
    O(1) memory space, prevents crashes on large transaction datasets.
    \"\"\"
    base_q = db.query(Transaction).filter(Transaction.is_deleted == False)
    if date_from: base_q = base_q.filter(Transaction.date >= date_from)
    if date_to:   base_q = base_q.filter(Transaction.date <= date_to)

    total_transactions = base_q.count()

    # 1. Totals grouped by type
    type_totals_q = db.query(
        Transaction.type, func.sum(Transaction.amount).label("total")
    ).filter(Transaction.is_deleted == False)
    if date_from: type_totals_q = type_totals_q.filter(Transaction.date >= date_from)
    if date_to:   type_totals_q = type_totals_q.filter(Transaction.date <= date_to)
    type_totals = type_totals_q.group_by(Transaction.type).all()

    total_income  = 0.0
    total_expense = 0.0
    for t_type, t_val in type_totals:
        val = float(t_val) if t_val else 0.0
        if t_type == TransactionType.income: total_income = val
        elif t_type == TransactionType.expense: total_expense = val

    # 2. Monthly grouped by year, month, type
    monthly_trend_q = db.query(
        func.extract('year', Transaction.date).label("year"),
        func.extract('month', Transaction.date).label("month"),
        Transaction.type,
        func.sum(Transaction.amount).label("total")
    ).filter(Transaction.is_deleted == False)
    
    if date_from: monthly_trend_q = monthly_trend_q.filter(Transaction.date >= date_from)
    if date_to:   monthly_trend_q = monthly_trend_q.filter(Transaction.date <= date_to)
    
    monthly_trends_data = monthly_trend_q.group_by(
        func.extract('year', Transaction.date),
        func.extract('month', Transaction.date),
        Transaction.type
    ).all()

    monthly: dict = defaultdict(lambda: {"income": 0.0, "expense": 0.0})
    for year, month, t_type, t_val in monthly_trends_data:
        key = f"{int(year):04d}-{int(month):02d}"
        val = float(t_val) if t_val else 0.0
        if t_type == TransactionType.income:
            monthly[key]["income"] += val
        else:
            monthly[key]["expense"] += val

    monthly_trends = [
        {
            "month":   k,
            "income":  round(v["income"],  2),
            "expense": round(v["expense"], 2),
            "net":     round(v["income"] - v["expense"], 2),
        }
        for k, v in sorted(monthly.items())
    ][-12:]

    # 3. Top 10 recent transactions
    recent = base_q.order_by(Transaction.date.desc()).limit(10).all()

    return {
        "total_income":        round(total_income,  2),
        "total_expense":       round(total_expense, 2),
        "net_balance":         round(total_income - total_expense, 2),
        "total_transactions":  total_transactions,
        "monthly_trends":      monthly_trends,
        "recent_transactions": [
            {"id": str(r.id), "amount": float(r.amount), "type": r.type.value,
             "category": r.category, "date": str(r.date), "notes": r.notes}
            for r in recent
        ],
    }


def compute_insights(db: Session, date_from: Optional[date] = None,
                     date_to: Optional[date] = None) -> dict:
    \"\"\"
    Returns category-level breakdown using DB aggregations.
    \"\"\"
    cat_q = db.query(
        Transaction.type,
        Transaction.category,
        func.sum(Transaction.amount).label("total")
    ).filter(Transaction.is_deleted == False)
    
    if date_from: cat_q = cat_q.filter(Transaction.date >= date_from)
    if date_to:   cat_q = cat_q.filter(Transaction.date <= date_to)
    
    cat_data = cat_q.group_by(Transaction.type, Transaction.category).all()
    
    income_cats:  dict = defaultdict(float)
    expense_cats: dict = defaultdict(float)

    for t_type, cat, t_val in cat_data:
        val = float(t_val) if t_val else 0.0
        if t_type == TransactionType.income:
            income_cats[cat] += val
        else:
            expense_cats[cat] += val

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
'''

with open('apps/api/micro_apps/dashboard/service.py', 'w', encoding='utf-8') as f:
    f.write(content)
