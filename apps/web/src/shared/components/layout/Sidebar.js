'use client';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, Wallet, LogOut, CodeSquare, Users, Shield, FileText } from 'lucide-react';
import Link from 'next/link';

export default function Sidebar({ user, onLogout, hasPermission }) {
  const pathname = usePathname();
  const router = useRouter();

  // Condition links
  const NAV_ITEMS = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, exact: false },
    { name: 'Transactions', path: '/transactions', icon: Wallet, exact: false },
  ];

  const isAdmin = hasPermission ? hasPermission('users:manage') : (user?.role === 'admin');

  const ADMIN_ITEMS = isAdmin ? [
    { name: 'User Management', path: '/admin', icon: Users, exact: true },
    { name: 'Roles & Permissions', path: '/admin/roles', icon: Shield, exact: false },
    { name: 'Audit Logs', path: '/admin/audit', icon: FileText, exact: false },
  ] : [];

  const renderNavItem = (item) => {
    const isActive = item.exact ? pathname === item.path : pathname.startsWith(item.path);
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
          <span className="z-10">{item.name}</span>
        </div>
      </Link>
    );
  };

  return (
    <aside className="w-64 max-w-[16rem] h-full flex flex-col bg-[#111827]/80 backdrop-blur-xl border-r border-primary/20 shrink-0 transition-all z-40 relative">
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
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold rounded-lg text-gray-400 hover:text-white hover:bg-expense/10 hover:shadow-[0_0_12px_var(--color-expense-transparent)] transition-all duration-300 group"
        >
          <LogOut className="w-4 h-4 group-hover:text-expense transition-colors" />
          Logout
        </button>
      </div>
    </aside>
  );
}