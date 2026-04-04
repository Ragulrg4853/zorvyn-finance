/**
 * ErrorState — standardised error display with retry.
 * Constitution: CLAUDE.md #67 (every async component handles error state)
 */
'use client';
export default function ErrorState({ message, onRetry, title = 'Something went wrong' }) {
  return (
    <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
      <p style={{ color: 'var(--color-error)', marginBottom: '0.5rem' }}>{title}</p>
      <p style={{ color: 'var(--color-text-2)', fontSize: '0.875rem' }}>{message}</p>
      {onRetry && (
        <button className="btn-ghost" onClick={onRetry}
                style={{ marginTop: '1rem' }}>Try again</button>
      )}
    </div>
  );
}
