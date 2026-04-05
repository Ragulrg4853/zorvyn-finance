'use client';

import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import { useEffect } from 'react';

export default function ProtectedRoute({ children, requiredPermission }) {
  const { user, loading, hasPermission } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '2rem' }}>
        <div className="skeleton" style={{ height: '100px', width: '100%' }}></div>
        <div className="skeleton" style={{ height: '100px', width: '100%' }}></div>
        <div className="skeleton" style={{ height: '100px', width: '100%' }}></div>
      </div>
    );
  }

  if (!user) return null;

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', width: '100%' }}>
        <div className="card" style={{ padding: '2rem', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem' }}>
          <Lock size={48} color="var(--color-error)" />
          <h2 style={{ fontFamily: '"Syne", sans-serif', color: 'var(--color-text-1)', margin: 0 }}>
            Access Restricted
          </h2>
          <p style={{ color: 'var(--color-text-2)', margin: 0, lineHeight: 1.5 }}>
            You need higher access level to view this page.
          </p>
          <button onClick={() => router.back()} className="btn-ghost" style={{ marginTop: '0.5rem' }}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
