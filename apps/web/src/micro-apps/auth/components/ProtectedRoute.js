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
      <div className="flex justify-center items-center h-full w-full p-6 animate-in fade-in duration-500">
        <div className="card glass-effect flex flex-col items-center text-center gap-4 max-w-md w-full p-8 border border-[var(--color-border)] shadow-2xl relative overflow-hidden backdrop-blur-xl bg-[rgba(10,15,30,0.5)]">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50"></div>
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 mb-2">
            <Lock size={32} className="text-red-400" />
          </div>
          <h2 className="font-syne text-2xl font-bold text-gray-100 m-0">
            Access Restricted
          </h2>
          <p className="text-gray-400 text-sm m-0 leading-relaxed max-w-[280px]">
            This section requires <strong className="text-gray-200">`{requiredPermission}`</strong> access.
          </p>
          <p className="text-gray-500 text-xs m-0 mt-2">
            Contact your administrator to request access
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
