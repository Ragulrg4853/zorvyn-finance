/**
 * Navbar — top navigation, all protected pages.
 * Copilot Session 9: implement full body per COPILOT_GUIDE.md Session 9.
 *
 * Fixed top, glass blur, 64px height, border-bottom
 * Left: logo  |  Center: nav links with active indicator  |  Right: user + logout
 * Mobile: hamburger -> framer-motion slide drawer
 */
'use client';
export default function Navbar({ user, onLogout }) {
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: '64px',
      background: 'rgba(10,15,30,0.8)', backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--color-border)', display: 'flex',
      alignItems: 'center', padding: '0 1.5rem', zIndex: 50,
    }}>
      <span style={{ fontFamily: 'Syne', color: 'var(--color-primary)', fontWeight: 700 }}>
        Zorvyn Finance
      </span>
      <span style={{ color: 'var(--color-text-3)', marginLeft: 'auto', fontSize: '0.875rem' }}>
        Navbar — implement per COPILOT_GUIDE.md Session 9
      </span>
    </nav>
  );
}
