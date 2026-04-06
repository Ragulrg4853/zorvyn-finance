'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/micro-apps/auth/hooks/useAuth';
import { Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import LoadingSpinner from '@/shared/components/feedback/LoadingSpinner';

export default function LoginPage() {
  const { login, loading, error } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authToast, setAuthToast] = useState('');

  useEffect(() => {
    const toast = sessionStorage.getItem('auth_toast');
    if (toast) {
      setAuthToast(toast);
      sessionStorage.removeItem('auth_toast');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
    } catch {
      setPassword('');
    }
  };

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="card" 
        style={{ padding: '2rem', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
      >
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontFamily: '"Syne", sans-serif', color: 'var(--color-gold)', margin: '0 0 0.5rem 0' }}>
            Zorvyn Finance
          </h1>
          <p style={{ color: 'var(--color-text-2)', margin: 0 }}>
            Welcome back
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-1)' }}>Username</label>
            <input 
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="input"
              placeholder="Enter your username"
              required
              disabled={loading}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-1)' }}>Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input"
                placeholder="Enter your password"
                required
                style={{ paddingRight: '2.5rem' }}
                disabled={loading}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ 
                  position: 'absolute', right: '0.5rem', background: 'none', 
                  border: 'none', color: 'var(--color-text-3)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center'
                }}
                disabled={loading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          {authToast && !error && (
            <div style={{ background: '#0c1222', border: '1px solid var(--color-primary)', color: 'var(--color-primary)', padding: '0.75rem', borderRadius: 'var(--radius-btn)', fontSize: '0.875rem', textAlign: 'center' }}>
              {authToast}
            </div>
          )}          {error && (
            <div style={{ background: 'var(--color-error)', color: '#fff', padding: '0.75rem', borderRadius: 'var(--radius-btn)', fontSize: '0.875rem', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <button 
            type="submit"
            className="btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '2.5rem' }}
            disabled={loading}
          >
            {loading ? <LoadingSpinner size="sm" /> : "Sign In"}
          </button>
        </form>
      </motion.div>
    </main>
  );
}
