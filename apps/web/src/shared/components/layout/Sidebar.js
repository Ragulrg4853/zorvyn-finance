'use client';
import { createPortal } from 'react-dom';
import { useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Wallet, LogOut, CodeSquare, Users, Shield, FileText, Menu } from 'lucide-react';
import Link from 'next/link';

export default function Sidebar({ user, onLogout, hasPermission }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showLogoutModal) setShowLogoutModal(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showLogoutModal]);

  // Condition links
  const checkPerm = (perm) => hasPermission ? hasPermission(perm) : (user?.role === 'admin');

  const NAV_ITEMS = [
    checkPerm('dashboard:read') && { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, exact: false },
    checkPerm('transactions:read') && { name: 'Transactions', path: '/transactions', icon: Wallet, exact: false },
  ].filter(Boolean);

  const ADMIN_ITEMS = [
    checkPerm('users:read') && { name: 'User Management', path: '/admin?tab=users', act: 'users', icon: Users },
    checkPerm('roles:manage') && { name: 'Roles & Permissions', path: '/admin?tab=roles', act: 'roles', icon: Shield },
    checkPerm('audit:read') && { name: 'Audit Logs', path: '/admin?tab=audit', act: 'audit', icon: FileText },
  ].filter(Boolean);

  const isAdmin = ADMIN_ITEMS.length > 0;

  const renderNavItem = (item) => {
    // If it's an admin tab link, we need to check the query param
    const isTabItem = !!item.act;
    const currentTab = searchParams ? (searchParams.get('tab') || 'users') : (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('tab') || 'users' : 'users');
    
    let isActive;
    if (isTabItem) {
      isActive = pathname === '/admin' && currentTab === item.act;
    } else {
      isActive = item.exact ? pathname === item.path : pathname.startsWith(item.path);
    }

    return (
      <Link key={item.path} href={item.path} passHref>
        <div 
          className={`relative group flex items-center px-4 py-3 rounded-lg overflow-hidden transition-all duration-300 font-inter ${
            isActive 
              ? 'text-white bg-primary/10 font-semibold' 
              : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
          }`}
        >
          {isActive && (
            <motion.div 
              layoutId="active-nav-bg"
              className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent pointer-events-none"
              initial={false}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          {/* Active left border indicator */}
          {isActive && (
            <motion.div 
              layoutId="active-nav-indicator"
              className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-md shadow-[0_0_8px_rgba(var(--color-primary),0.8)]" 
              initial={false}
            />
          )}
          <item.icon 
            className={`w-5 h-5 mr-3 shrink-0 transition-transform duration-300 ${
              isActive ? 'text-primary' : 'text-gray-500 group-hover:text-primary/70 group-hover:scale-110'
            }`} 
          />
          <span className="z-10 text-[0.875rem]">{item.name}</span>
        </div>
      </Link>
    );
  };

  return (
    <>
      <button 
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-[#111827] rounded-md text-white shadow-lg border border-white/10"
      >
        <Menu className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <aside className={`fixed md:relative inset-y-0 left-0 z-40 w-[220px] h-full flex flex-col bg-[#111827]/95 backdrop-blur-xl border-r border-primary/20 shrink-0 transition-transform duration-300 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        {/* Brand Header */}
      <div className="h-20 flex items-center px-6 border-b border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none" />
        <CodeSquare className="text-primary w-7 h-7 mr-3 shrink-0" />
        <h1 className="font-syne font-bold text-xl tracking-tight text-white drop-shadow-md">
          Zorvyn<span className="text-primary">Finance</span>
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-8 px-4 flex flex-col gap-2 relative">
        {NAV_ITEMS.map(renderNavItem)}

        {isAdmin && (
          <div className="mt-6 mb-2 flex flex-col gap-2 relative">
            <h3 className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Administration
            </h3>
            {ADMIN_ITEMS.map(renderNavItem)}
          </div>
        )}
      </nav>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-white/5 bg-[#111827]/90 relative z-10">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 mb-3 group hover:bg-white/10 transition-colors">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-tr from-primary to-blue-600 text-white shrink-0 shadow-[0_0_12px_rgba(var(--color-primary),0.4)]">
            <span className="font-semibold text-lg">{user?.username?.[0]?.toUpperCase() || 'U'}</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-white truncate max-w-full block">
              {user?.username || 'User'}
            </span>
            <span className="text-xs text-gray-400 capitalize flex items-center gap-1 font-medium bg-primary/15 text-primary w-max px-2 rounded-md mt-0.5">
              {user?.role || 'Viewer'}
            </span>
          </div>
        </div>

        <button 
          onClick={() => setShowLogoutModal(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold rounded-lg text-gray-400 hover:text-white hover:bg-expense/10 hover:shadow-[0_0_12px_var(--color-expense-transparent)] transition-all duration-300 group"
        >
          <LogOut className="w-4 h-4 group-hover:text-expense transition-colors" />
          Logout
        </button>
      </div>

      <AnimatePresence>
        {showLogoutModal && typeof document !== 'undefined' && createPortal(
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
            }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowLogoutModal(false); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                background: '#111827',
                border: '1px solid rgba(0,212,170,0.2)',
                borderRadius: '16px',
                padding: '2rem',
                width: '360px',
                maxWidth: '90vw',
                textAlign: 'center',
                boxShadow: '0 8px 32px rgba(0,212,170,0.15)',
              }}
            >
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4 mx-auto">
                <LogOut className="w-6 h-6 text-[#ef4444]" />
              </div>
              <h2 className="font-syne text-xl font-bold text-white mb-2">Sign Out</h2>
              <p className="text-sm text-gray-400 mb-6">Are you sure you want to sign out of Zorvyn Finance?</p>
              
              <div className="flex w-full gap-3">
                <button 
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-lg font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-colors btn-ghost"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setShowLogoutModal(false);
                    onLogout();
                  }}
                  className="flex-1 py-2.5 px-4 rounded-lg font-semibold text-white bg-[#ef4444] hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          </div>,
          document.body
        )}
      </AnimatePresence>
    </aside>
  </>
  );
}