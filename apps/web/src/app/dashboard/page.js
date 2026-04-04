/**
 * Dashboard page — all authenticated roles.
 * Copilot Session 12: Implement per COPILOT_GUIDE.md Session 12 direction.
 *
 * Layout: Navbar + date range filter + 4 SummaryCards (2-col mobile, 4-col desktop)
 *         + TrendChart (full width) + CategoryBreakdown + RecentActivity
 * Data: useDashboard() hook
 * Conditional: CategoryBreakdown locked for viewers (show overlay, not hidden)
 */
'use client';
export default function DashboardPage() {
  return (
    <main style={{ padding: '2rem', background: 'var(--color-bg)', minHeight: '100vh' }}>
      <h1 style={{ fontFamily: 'Syne', color: 'var(--color-gold)' }}>Dashboard</h1>
      <p style={{ color: 'var(--color-text-2)', marginTop: '0.5rem' }}>
        Implement per COPILOT_GUIDE.md Session 12
      </p>
    </main>
  );
}
