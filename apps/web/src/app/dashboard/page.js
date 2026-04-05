/**
 * Dashboard page — all authenticated roles.
 * Copilot Session 11: Implement per COPILOT_GUIDE.md Session 11 direction.
 *
 * Layout: Navbar + date range filter + 4 SummaryCards (2-col mobile, 4-col desktop)
 *         + TrendChart (full width) + CategoryBreakdown + RecentActivity
 * Data: useDashboard() hook
 * Conditional: CategoryBreakdown locked for viewers (show overlay, not hidden)
 */
'use client';
import { useState } from 'react';
import { useAuth } from '../../micro-apps/auth/hooks/useAuth';
import ProtectedRoute from '../../micro-apps/auth/components/ProtectedRoute';
import AppShell from '../../shared/components/layout/AppShell';
import ErrorState from '../../shared/components/feedback/ErrorState';
import { useDashboard } from '../../micro-apps/dashboard/hooks/useDashboard';
import SummaryCard from '../../micro-apps/dashboard/components/SummaryCard';
import TrendChart from '../../micro-apps/dashboard/components/TrendChart';
import CategoryBreakdown from '../../micro-apps/dashboard/components/CategoryBreakdown';
import RecentActivity from '../../micro-apps/dashboard/components/RecentActivity';
import { endOfMonth, startOfMonth, format } from 'date-fns';

export default function DashboardPage() {
  const { user, hasPermission, logout } = useAuth();
  const [dateFrom, setDateFrom] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));

  const { summary, insights, loading, error, refetch } = useDashboard({
    dateFrom,
    dateTo,
    hasInsightsPermission: hasPermission('dashboard:insights'),
  });

  return (
    <ProtectedRoute>
      <AppShell user={user} onLogout={logout} hasPermission={hasPermission} pageTitle="Dashboard">
        <div className="h-full flex flex-col w-full gap-4 overflow-hidden">
          {/* Header Row */}
          <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-2xl font-syne font-bold text-gray-100 tracking-tight">Financial Insights</h1>
            
            <div className="flex flex-row items-center gap-2 bg-[#111827]/80 backdrop-blur-md p-1.5 rounded-lg border border-white/5 shadow-sm">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="input bg-transparent border-none text-sm py-1.5 px-2 focus:outline-none focus:ring-1 focus:ring-primary/50 rounded text-gray-300 w-full sm:w-auto"
              />
              <span className="text-gray-600 font-bold px-1 text-xs uppercase tracking-widest">to</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="input bg-transparent border-none text-sm py-1.5 px-2 focus:outline-none focus:ring-1 focus:ring-primary/50 rounded text-gray-300 w-full sm:w-auto"
              />
            </div>
          </div>

          {error && <ErrorState message={error} onRetry={refetch} />}

          {/* Metrics Row */}
          <div className="shrink-0 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard title="Total Income" value={summary?.total_income} type="income" trend={5.2} delay={0} loading={loading} />
            <SummaryCard title="Total Expense" value={summary?.total_expense} type="expense" trend={-2.1} delay={0.1} loading={loading} />
            <SummaryCard title="Net Balance" value={summary?.net_balance} type="net" trend={3.4} delay={0.2} loading={loading} />
            <SummaryCard title="Transactions" value={summary?.transaction_count} type="activity" delay={0.3} loading={loading} />
          </div>

          {/* Main Body Grid */}
          <div className="flex-1 min-h-0 flex flex-col xl:flex-row gap-4 pb-2">
            
            {/* Left Content (Charts) */}
              <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto pr-1 xl:pr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                 <div className="min-h-[300px]">
                   <TrendChart data={summary?.monthly_trends} loading={loading} />
                 </div>
                 <div className="min-h-[300px]">
                    <CategoryBreakdown 
                      data={insights} 
                      loading={loading} 
                      locked={!hasPermission('dashboard:insights')} 
                    />
                 </div>
              </div>

            {/* Right Content (Activity) */}
            <div className="w-full xl:w-[380px] 2xl:w-[420px] shrink-0 h-[400px] xl:h-full flex flex-col min-h-0">
               <RecentActivity transactions={summary?.recent_transactions} loading={loading} />
            </div>

          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
