"""
Dashboard service — aggregation logic.
Constitution: CLAUDE.md #48 (read-path optimization), #13 (O(n) single pass)

Algorithm: Single DB fetch, single O(n) pass builds ALL metrics simultaneously.
  Time:  O(n) where n = transactions in date range
  Space: O(m) where m = unique months (max 12 returned)
"""
from collections import defaultdict
from datetime import date, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from shared.models.transaction import TransactionType
from micro_apps.dashboard import repository as dashboard_repo


def compute_summary(db: Session, date_from: Optional[date] = None,
                    date_to: Optional[date] = None) -> dict:
    """
    Returns full dashboard summary efficiently.
    Calculates totals and monthly trends using DB grouping and aggregations.
    """
    # 1. Calculate overall totals and net balance using DB sum
    totals_results = dashboard_repo.query_totals(db, date_from, date_to)
    
    total_income = 0.0
    total_expense = 0.0
    total_transactions = 0
    
    for t_type, t_sum, t_count in totals_results:
        amount = float(t_sum or 0)
        total_transactions += (t_count or 0)
        if t_type == TransactionType.income:
            total_income += amount
        else:
            total_expense += amount

    # 2. Calculate monthly trends using DB extract and grouping
    monthly_results = dashboard_repo.query_monthly_trends(db, date_from, date_to)

    monthly: dict = defaultdict(lambda: {"income": 0.0, "expense": 0.0})
    for year, month, t_type, t_sum in monthly_results:
        key = f"{int(year):04d}-{int(month):02d}"
        monthly[key][t_type.value] += float(t_sum or 0)

    monthly_trends = [
        {
            "month":   k,
            "income":  round(v["income"],  2),
            "expense": round(v["expense"], 2),
            "net":     round(v["income"] - v["expense"], 2),
        }
        for k, v in sorted(monthly.items())
    ][-12:]

    # 3. Fetch ONLY the top 10 recent transactions
    recent = dashboard_repo.query_recent_transactions(db, date_from, date_to, limit=10)

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
    """
    Returns category-level breakdown using DB aggregations.
    """
    results = dashboard_repo.query_insights(db, date_from, date_to)

    income_cats = []
    expense_cats = []

    for t_type, cat, t_sum in results:
        if t_type == TransactionType.income:
            income_cats.append({"category": cat, "total": float(t_sum or 0)})
        else:
            expense_cats.append({"category": cat, "total": float(t_sum or 0)})

    return {
        "income_by_category": sorted(income_cats, key=lambda x: -x["total"])[:10],
        "expense_by_category": sorted(expense_cats, key=lambda x: -x["total"])[:10],
    }
