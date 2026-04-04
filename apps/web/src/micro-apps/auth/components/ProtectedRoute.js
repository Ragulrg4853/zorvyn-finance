/**
 * ProtectedRoute — wraps all protected pages.
 * Copilot Session 10: implement full body per COPILOT_GUIDE.md Session 10.
 * Three states: loading skeleton | unauthenticated (redirect) | permission denied (overlay)
 */
'use client';
export default function ProtectedRoute({ children, requiredPermission }) {
  // TODO(session-10): implement loading/auth/permission checks
  return <>{children}</>;
}
