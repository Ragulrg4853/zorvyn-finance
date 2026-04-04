/**
 * Transactions page — all authenticated roles (viewers see read-only table).
 * Copilot Session 13: Implement per COPILOT_GUIDE.md Session 13 direction.
 *
 * Layout: Navbar + toolbar (filters left, export+new buttons right) + TransactionTable + pagination
 * Conditional: "New Transaction" button only for admin, Export only for analyst+admin
 * Data: useTransactions() hook
 */
'use client';
export default function TransactionsPage() {
  return (
    <main style={{ padding: '2rem', background: 'var(--color-bg)', minHeight: '100vh' }}>
      <h1 style={{ fontFamily: 'Syne', color: 'var(--color-gold)' }}>Transactions</h1>
      <p style={{ color: 'var(--color-text-2)', marginTop: '0.5rem' }}>
        Implement per COPILOT_GUIDE.md Session 13
      </p>
    </main>
  );
}
