'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, Activity } from 'lucide-react';
import { useAuth } from '../../../micro-apps/auth/hooks/useAuth';
import apiClient from '../../lib/apiClient';
import { formatDistanceToNow } from 'date-fns';

export default function Topbar({ title, user }) {
  const { hasPermission } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const canReadAudit = hasPermission('audit:read');

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (canReadAudit) {
      setLoading(true);
      apiClient.get('/v1/audit/logs', { params: { page_size: 5 } })
        .then((res) => {
          setNotifications(res.data?.data || []);
        })
        .catch(err => console.error("Error fetching notifications", err))
        .finally(() => setLoading(false));
    }
  }, [canReadAudit]);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  return (
    <header className="h-20 w-full flex items-center justify-between px-6 md:px-8 border-b border-[var(--color-border)] bg-[rgba(10,15,30,0.8)] backdrop-blur-xl shrink-0 z-40 shadow-md">
      
      {/* Left section: Dynamic Page Title */}
      <div className="flex items-center gap-4 flex-1">
        <motion.h2 
          key={title}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="text-2xl font-syne font-bold text-white tracking-wide"
        >
          {title || "Dashboard"}
        </motion.h2>
      </div>

      {/* Right Section: Utilities */}
      <div className="flex items-center gap-6">
        
        {/* Subtle Global Search Placeholder */}
        <div className="hidden lg:flex items-center bg-[#111827] border border-white/5 rounded-full px-4 py-2 hover:border-[var(--color-primary)]/50 transition-colors group cursor-text">
          <Search className="w-4 h-4 text-gray-500 mr-2 group-hover:text-[var(--color-primary)] transition-colors" />
          <span className="text-sm text-gray-500 group-hover:text-gray-300 font-inter">Search everywhere...</span>
          <div className="ml-4 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-white/5 text-gray-400">⌘K</div>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            className="relative p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            onClick={toggleDropdown}
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 text-[9px] font-bold flex items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow-[0_0_10px_rgba(var(--color-primary-rgb),0.5)]">
                 {notifications.length}
              </span>
            )}
          </button>
          
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-4 w-80 bg-[rgba(15,20,35,0.95)] backdrop-blur-2xl border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden z-50 transform origin-top-right"
              >
                <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-black/20">
                  <h3 className="text-sm font-syne font-bold text-gray-100 flex items-center gap-2">
                    <Activity size={16} className="text-[var(--color-primary)]" />
                    Notifications
                  </h3>
                  {notifications.length > 0 && (
                    <span className="text-[10px] uppercase tracking-wider text-[var(--color-primary)] font-bold bg-[var(--color-primary)]/10 px-2 py-0.5 rounded">
                      {notifications.length} New
                    </span>
                  )}
                </div>
                
                <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                  {loading ? (
                    <div className="p-6 flex justify-center">
                       <div className="w-5 h-5 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin"></div>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-8 flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                        <Bell className="text-gray-500 opacity-50" size={24} />
                      </div>
                      <p className="text-sm font-medium text-gray-300">No new notifications</p>
                      <p className="text-xs text-gray-500 mt-1">You're all caught up!</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-white/5">
                      {notifications.map((notif) => {
                        const dateVal = notif.created_at || notif.timestamp;
                        const timeAgo = dateVal ? formatDistanceToNow(new Date(dateVal), { addSuffix: true }) : 'Just now';
                        return (
                          <li key={notif.id} className="p-4 hover:bg-white/5 transition-colors cursor-default group">
                             <p className="text-xs text-gray-300 font-medium flex items-center flex-wrap gap-1.5">
                               <span className="text-white font-mono bg-white/10 px-1.5 py-0.5 rounded text-[10px] tracking-wider">{notif.action}</span>
                               <span className="text-gray-500 font-bold">•</span>
                               <span className="capitalize text-gray-400">{notif.resource_type || 'System'}</span>
                               <span className="text-gray-500 font-bold">•</span>
                               <span className="text-gray-400">{timeAgo}</span>
                             </p>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </header>
  );
}
