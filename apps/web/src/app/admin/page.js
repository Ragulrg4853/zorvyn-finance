/**
 * Admin page — user management, admin only.
 * Copilot Session 14: Implement per COPILOT_GUIDE.md Session 14 direction.
 *
 * Layout: Navbar + "User Management" heading + "Invite User" button
 *         + UserTable with role badges, status badges, action column
 * Guards: disable own row's action buttons, "Manage Permissions" link to /admin/roles
 * Data: useUsers() hook
 */
'use client';
export default function AdminPage() {
  return (
    <main style={{ padding: '2rem', background: 'var(--color-bg)', minHeight: '100vh' }}>
      <h1 style={{ fontFamily: 'Syne', color: 'var(--color-gold)' }}>User Management</h1>
      <p style={{ color: 'var(--color-text-2)', marginTop: '0.5rem' }}>
        Implement per COPILOT_GUIDE.md Session 14
      </p>
    </main>
  );
}
