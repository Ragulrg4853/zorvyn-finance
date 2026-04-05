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
import Navbar from '../../shared/components/layout/Navbar';
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
      <div className="min-h-screen">
        <Navbar user={user} onLogout={logout} />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-3xl font-syne font-bold text-gray-100">Financial Insights</h1>
            
            <div className="flex flex-row items-center gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="input bg-[rgba(10,15,30,0.5)] border border-[var(--color-border)] rounded-md text-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-gray-200 w-full sm:w-auto"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="input bg-[rgba(10,15,30,0.5)] border border-[var(--color-border)] rounded-md text-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-gray-200 w-full sm:w-auto"
              />
            </div>
          </div>

          {error && <ErrorState message={error} onRetry={refetch} />}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <SummaryCard 
              title="Total Income" 
              value={summary?.total_income} 
              type="income" 
              trend={5.2} 
              delay={0} 
              loading={loading} 
            />
            <SummaryCard 
              title="Total Expense" 
              value={summary?.total_expense} 
              type="expense" 
              trend={-2.1} 
              delay={0.1} 
              loading={loading} 
            />
            <SummaryCard 
              title="Net Balance" 
              value={summary?.net_balance} 
              type="net" 
              trend={3.4} 
              delay={0.2} 
              loading={loading} 
            />
            <SummaryCard 
              title="Transactions" 
              value={summary?.transaction_count} 
              type="activity" 
              delay={0.3} 
              loading={loading} 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
             <div className="col-span-1 lg:col-span-2">
                <TrendChart data={summary?.monthly_trends} loading={loading} />
             </div>
             <div className="col-span-1 lg:col-span-1">
                <RecentActivity transactions={summary?.recent_transactions} loading={loading} />
             </div>
          </div>

          <div className="mb-12 border border-[var(--color-border)] rounded-xl bg-[rgba(10,15,30,0.3)]">
            <CategoryBreakdown 
              data={insights} 
              loading={loading} 
              locked={!hasPermission('dashboard:insights')} 
            />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
