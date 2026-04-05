'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Shield, Activity, Users, Home, Settings, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar({ user, onLogout }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getIcon = (href) => {
    switch (href) {
      case '/dashboard': return <Home className="w-4 h-4" />;
      case '/transactions': return <Activity className="w-4 h-4" />;
      case '/admin': return <Shield className="w-4 h-4" />;
      default: return null;
    }
  }

  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/transactions', label: 'Transactions' },
  ];
  if (user?.role === 'admin') {
    links.push({ href: '/admin', label: 'Admin' });
  }

  return (
    <>
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 w-full h-[72px] z-50 transition-all duration-300 ${scrolled ? 'bg-surface/80 backdrop-blur-xl border-b border-white/10 shadow-xl' : 'bg-transparent border-transparent'}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex justify-between items-center">
        
        {/* Brand */}
        <Link href="/dashboard" className="flex items-center gap-2 group cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30 group-hover:bg-primary/30 transition-colors">
            <span className="text-primary font-syne font-bold text-xl drop-shadow-[0_0_8px_rgba(0,212,170,0.5)]">Z</span>
          </div>
          <div className="font-syne text-white text-lg font-bold tracking-tight">
            Zorvyn <span className="text-primary">Finance</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex h-full items-center gap-1">
          {links.map(link => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.href} 
                href={link.href}
                className="relative h-full flex items-center px-4 group"
              >
                <div className={`flex items-center gap-2 font-medium text-sm transition-colors duration-300 ${isActive ? 'text-primary' : 'text-gray-400 group-hover:text-gray-200'}`}>
                  {getIcon(link.href)}
                  {link.label}
                </div>
                {isActive && (
                  <motion.div 
                    layoutId="navbar-indicator"
                    className="absolute bottom-0 left-4 right-4 h-[3px] bg-primary rounded-t-full shadow-[0_-2px_10px_rgba(0,212,170,0.5)]"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Desktop User Section */}
        <div className="hidden md:flex items-center gap-4 pl-4 border-l border-white/10">
          <div className="flex flex-col items-end">
            <span className="text-white text-sm font-medium leading-tight">{user?.username}</span>
            <span className="text-primary text-[10px] uppercase tracking-widest font-bold font-syne">{user?.role}</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-surface-2 to-surface border border-white/10 flex items-center justify-center shadow-inner cursor-pointer hover:border-white/30 transition-colors">
             <Users className="w-5 h-5 text-gray-300" />
          </div>
          <button onClick={onLogout} className="ml-2 p-2 rounded-lg text-gray-500 hover:text-expense hover:bg-expense/10 transition-colors" title="Logout">
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="p-2 rounded-lg bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>
    </motion.nav>

    {/* Mobile Menu Overlay */}
    <AnimatePresence>
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="fixed top-[72px] left-0 w-full bg-surface/95 backdrop-blur-2xl border-b border-white/10 shadow-2xl z-40 md:hidden overflow-hidden"
        >
          <div className="px-4 py-4 flex flex-col gap-2">
            {links.map(link => {
               const isActive = pathname === link.href;
               return (
                 <Link 
                   key={link.href} 
                   href={link.href}
                   onClick={() => setMobileMenuOpen(false)}
                   className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}
                 >
                   {getIcon(link.href)}
                   <span className="font-medium">{link.label}</span>
                 </Link>
               );
            })}
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between px-4">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-surface-2 to-surface border border-white/10 flex items-center justify-center shadow-inner">
                   <Users className="w-5 h-5 text-gray-300" />
                 </div>
                 <div className="flex flex-col">
                   <span className="text-white text-sm font-medium leading-none">{user?.username}</span>
                   <span className="text-primary text-[10px] uppercase tracking-widest font-bold mt-1 font-syne">{user?.role}</span>
                 </div>
              </div>
              <button onClick={() => { onLogout?.(); setMobileMenuOpen(false); }} className="p-2 rounded-lg text-expense bg-expense/10 hover:bg-expense/20 transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
