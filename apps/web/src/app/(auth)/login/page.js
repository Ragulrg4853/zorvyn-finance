/**
 * Login page — public route, no auth required.
 * Copilot Session 10: Implement per COPILOT_GUIDE.md Session 10 direction.
 *
 * Layout: full-page centered dark bg
 * Left (desktop): Zorvyn logo + "Secure Financial Systems" tagline in gold
 * Right (desktop): glass card (.card), max-w-md
 * Mobile: single column, card fills width
 *
 * Card: Heading "Welcome back" (Syne), username input, password input (show/hide toggle),
 *       error banner, submit button (spinner while loading), register link
 *
 * Behaviour: useAuth().login(username, password) on submit
 *            framer-motion fadeIn on card mount
 *            Clear password field on error
 */
'use client';
export default function LoginPage() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center',
                   justifyContent: 'center', background: 'var(--color-bg)' }}>
      <div className="card" style={{ padding: '2rem', width: '100%', maxWidth: '400px' }}>
        <h1 style={{ fontFamily: 'Syne', color: 'var(--color-gold)', marginBottom: '1rem' }}>
          Zorvyn Finance
        </h1>
        <p style={{ color: 'var(--color-text-2)' }}>
          Login page — implement per COPILOT_GUIDE.md Session 10
        </p>
      </div>
    </main>
  );
}
