import os

navbar_content = """'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar({ user, onLogout }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/transactions', label: 'Transactions' },
  ];
  if (user?.role === 'admin') {
    links.push({ href: '/admin', label: 'Admin' });
  }

  return (
    <>
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '64px',
      background: 'rgba(10,15,30,0.8)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--color-border)',
      zIndex: 50,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 2rem'
    }}>
      {/* Left */}
      <div style={{ fontFamily: 'Syne, sans-serif', color: 'var(--color-primary)', fontSize: '1.25rem', fontWeight: 'bold' }}>
        Zorvyn Finance
      </div>

      {/* Center Links (Desktop only) */}
      <div className="hidden md:flex gap-6 h-full items-center" style={{ display: 'none', height: '100%', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem', height: '100%' }} className="md-flex-force">
          {links.map(link => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.href} 
                href={link.href}
                style={{
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text-2)',
                  borderBottom: isActive ? '2px solid teal' : '2px solid transparent',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  textDecoration: 'none',
                  transition: 'var(--transition-base)'
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Right */}
      <div className="hidden md:flex items-center gap-4" style={{ display: 'none', alignItems: 'center', gap: '1rem' }} className="md-flex-force">
        <span style={{ color: 'var(--color-text-2)' }}>{user?.username}</span>
        <button onClick={onLogout} className="btn-ghost" style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}>
          Logout
        </button>
      </div>

      {/* Mobile Toggle */}
      <div className="md:hidden flex items-center md-hidden-force">
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ background: 'none', border: 'none', color: 'var(--color-text-1)', cursor: 'pointer' }}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>
    </nav>

    {/* Mobile Menu Drawer */}
    <AnimatePresence>
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          style={{
            position: 'fixed',
            top: '64px',
            left: 0,
            width: '100%',
            background: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-border)',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            zIndex: 40,
            overflow: 'hidden'
          }}
          className="md:hidden md-hidden-force"
        >
          {links.map(link => {
             const isActive = pathname === link.href;
             return (
               <Link 
                 key={link.href} 
                 href={link.href}
                 onClick={() => setMobileMenuOpen(false)}
                 style={{
                   color: isActive ? 'var(--color-primary)' : 'var(--color-text-2)',
                   textDecoration: 'none',
                   padding: '0.5rem 0'
                 }}
               >
                 {link.label}
               </Link>
             );
          })}
          <hr style={{ borderColor: 'var(--color-border)', margin: '0.5rem 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--color-text-2)' }}>{user?.username}</span>
            <button onClick={() => { onLogout?.(); setMobileMenuOpen(false); }} className="btn-ghost" style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}>
              Logout
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    <style jsx>{`
      @media (min-width: 768px) {
        .md-flex-force { display: flex !important; }
        .md-hidden-force { display: none !important; }
      }
    `}</style>
    </>
  );
}
"""

error_content = """'use client';

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
"""

with open('c:/Users/girit/OneDrive/Documents/zorvyn-fintech/zorvyn-finance/zorvyn-finance/apps/web/src/shared/components/layout/Navbar.js', 'w', encoding='utf-8') as f:
    f.write(navbar_content)
    
with open('c:/Users/girit/OneDrive/Documents/zorvyn-fintech/zorvyn-finance/zorvyn-finance/apps/web/src/shared/components/feedback/ErrorState.js', 'w', encoding='utf-8') as f:
    f.write(error_content)

