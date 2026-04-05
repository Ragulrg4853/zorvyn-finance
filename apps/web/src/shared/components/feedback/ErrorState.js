'use client';

import { AlertCircle } from 'lucide-react';

export default function ErrorState({ title = "Something went wrong", message, onRetry }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem', width: '100%' }}>
      <div className="card" style={{ padding: '2rem', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem' }}>
        <AlertCircle size={48} color="var(--color-error)" />
        <h2 style={{ fontFamily: '"Syne", sans-serif', margin: 0, color: 'var(--color-text-1)' }}>
          {title}
        </h2>
        <p style={{ color: 'var(--color-text-2)', margin: 0, lineHeight: 1.5 }}>
          {message || "We encountered an unexpected error while processing your request."}
        </p>
        
        {onRetry && (
          <button onClick={onRetry} className="btn-ghost" style={{ marginTop: '0.5rem' }}>
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
