import React from 'react';
import { MouseGlowCard } from '@/shared/components/ui/MouseGlowCard';
import { formatCurrency } from '@/shared/utils/formatters';
import { Activity, PieChart, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SecondaryMetricsRow({ summary, insights, loading }) {
  if (loading) {
    return (
      <div className="shrink-0 grid gap-4 w-full max-w-full" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="card skeleton h-[120px] rounded-2xl animate-pulse bg-surface/50 border border-border/50"></div>
        <div className="card skeleton h-[120px] rounded-2xl animate-pulse bg-surface/50 border border-border/50"></div>
        <div className="card skeleton h-[120px] rounded-2xl animate-pulse bg-surface/50 border border-border/50"></div>
      </div>
    );
  }

  // 1. Category Totals: top 3 expense categories
  const topExpenses = (insights?.expense_by_category || []).slice(0, 3);
  
  // 2. Monthly Trend: current vs last month income
  let monthlyChange = 0;
  let currentMonthIncome = 0;
  if (summary?.monthly_trends && summary.monthly_trends.length >= 2) {
    const arr = summary.monthly_trends;
    const current = arr[arr.length - 1].income;
    const previous = arr[arr.length - 2].income;
    currentMonthIncome = current;
    if (previous > 0) {
      monthlyChange = ((current - previous) / previous) * 100;
    }
  } else if (summary?.monthly_trends && summary.monthly_trends.length === 1) {
    currentMonthIncome = summary.monthly_trends[0].income;
  }

  // 3. Weekly Trend (from backend)
  const weeklyChange = summary?.weekly_change_pct || 0;
  const thisWeek = summary?.this_week_total || 0;

  return (
    <div className="shrink-0 grid gap-4 w-full max-w-full" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card flex flex-col p-4 rounded-2xl border border-white/5 bg-gradient-to-br from-surface/80 to-surface/40 backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-2 text-gray-400">
          <PieChart size={16} className="text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider">Top 3 Expenses</span>
        </div>
        <div className="flex flex-col gap-1.5 flex-1 justify-center">
          {topExpenses.length > 0 ? topExpenses.map((exp, i) => (
            <div key={i} className="flex justify-between items-center text-sm">
              <span className="text-gray-300 truncate pr-2">{exp.category}</span>
              <span className="text-red-400 font-bold">{formatCurrency(exp.total)}</span>
            </div>
          )) : <span className="text-gray-500 text-sm">No expenses</span>}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="card flex flex-col p-4 rounded-2xl border border-white/5 bg-gradient-to-br from-surface/80 to-surface/40 backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-2 text-gray-400">
          <Calendar size={16} className="text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider">Monthly Income Trend</span>
        </div>
        <div className="flex items-end gap-3 flex-1 pb-1">
          <span className="text-2xl font-syne font-bold text-white">{formatCurrency(currentMonthIncome)}</span>
          <span className={\	ext-sm font-semibold mb-1 \\}>
            {monthlyChange >= 0 ? '+' : ''}{monthlyChange.toFixed(1)}% mo/mo
          </span>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="card flex flex-col p-4 rounded-2xl border border-white/5 bg-gradient-to-br from-surface/80 to-surface/40 backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-2 text-gray-400">
          <Activity size={16} className="text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider">Weekly Volume Trend</span>
        </div>
        <div className="flex items-end gap-3 flex-1 pb-1">
          <span className="text-2xl font-syne font-bold text-white">{formatCurrency(thisWeek)}</span>
          <span className={\	ext-sm font-semibold mb-1 \\}>
            {weeklyChange >= 0 ? '+' : ''}{weeklyChange.toFixed(1)}% wk/wk
          </span>
        </div>
      </motion.div>
      
    </div>
  );
}
