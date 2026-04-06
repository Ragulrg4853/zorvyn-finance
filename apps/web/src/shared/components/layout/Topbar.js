'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, Activity, Wallet, Plus, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../../../micro-apps/auth/hooks/useAuth';
import apiClient from '../../lib/apiClient';
import { formatDistanceToNow, format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/shared/utils/formatters';

export default function Topbar({ title, user }) {
  const { hasPermission } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef(null);
  const router = useRouter();

  const canReadAudit = hasPermission('audit:read');

  const fetchNotifications = async () => {
    if (!canReadAudit) return;
    setLoading(true);
    try {
      const res = await apiClient.get('/v1/audit/logs', { params: { page_size: 10 } });
      setNotifications(res.data?.data || []);
    } catch (err) {
      console.error("Error fetching notifications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canReadAudit) {
      // Auto-refresh every 30 seconds
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [canReadAudit]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    };
    
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setShowSearchDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsSearching(true);
      apiClient.get('/v1/transactions', { params: { search: searchQuery, page_size: 5 } })
        .then((res) => {
          setSearchResults(res.data?.data || []);
          setShowSearchDropdown(true);
        })
        .catch(err => console.error("Search error:", err))
        .finally(() => setIsSearching(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const toggleDropdown = () => {
    if (!isDropdownOpen && canReadAudit) fetchNotifications();
    setIsDropdownOpen((prev) => !prev);
  };

  const handleSearchResultClick = (query) => {
    setShowSearchDropdown(false);
    setSearchQuery('');
    router.push(`/transactions?search=${encodeURIComponent(query)}`);
  };

  return (
    <header className="h-20 w-full flex items-center justify-between pl-[4.5rem] pr-6 md:px-8 border-b border-[var(--color-border)] bg-[rgba(10,15,30,0.8)] backdrop-blur-xl shrink-0 z-40 shadow-md">
      
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
        
        {/* Global Search functionality */}
        <div className="hidden lg:flex items-center relative z-50 shrink-0" ref={searchRef}>
          <div className={`flex flex-row items-center bg-[#111827] border rounded-full px-4 py-2 transition-colors ${showSearchDropdown ? 'border-[var(--color-primary)]/50 box-shadow-[0_0_15px_rgba(0,212,170,0.1)]' : 'border-white/5 hover:border-white/10'}`}>
            <Search className={`w-4 h-4 mr-2 shrink-0 transition-colors ${showSearchDropdown ? 'text-[var(--color-primary)]' : 'text-gray-500'}`} />
            <input 
              type="text"
              placeholder="Search everywhere..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => { if (searchQuery.trim()) setShowSearchDropdown(true); }}
              className="bg-transparent border-none text-sm text-white placeholder-gray-500 focus:outline-none w-48 transition-all"
            />
            {isSearching && (
               <div className="ml-2 shrink-0 w-3 h-3 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin"></div>
            )}
          </div>

          <AnimatePresence>
            {showSearchDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute top-12 right-0 w-80 bg-[rgba(15,20,35,0.98)] backdrop-blur-2xl border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden mt-2 z-50"
              >
                <div className="px-4 py-2 bg-black/20 border-b border-white/5 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Transactions</span>
                  {searchResults.length > 0 && (
                    <span className="text-[10px] text-gray-500">{searchResults.length} results</span>
                  )}
                </div>
                
                <ul className="max-h-[300px] overflow-y-auto custom-scrollbar">
                  {searchResults.length > 0 ? (
                    searchResults.map((tx) => (
                      <li key={tx.id}>
                        <button 
                          onClick={() => handleSearchResultClick(searchQuery)}
                          className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors flex items-center justify-between group border-b border-white/5 last:border-b-0"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${tx.type === 'income' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                              <Wallet size={14} />
                            </div>
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-sm font-bold text-gray-200 capitalize truncate">{tx.category}</span>
                              <span className="text-[10px] text-gray-500 font-mono mt-0.5">{format(new Date(tx.date), 'MMM dd, yyyy')}</span>
                            </div>
                          </div>
                            <span className="font-bold font-syne text-sm shrink-0 pl-2 text-teal-400">
                             {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                          </span>
                        </button>
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-8 text-center flex flex-col items-center">
                       <Search className="text-gray-600 mb-2" size={24} />
                       <span className="text-sm text-gray-400 font-medium">No results found for "{searchQuery}"</span>
                    </li>
                  )}
                </ul>
                
                {searchResults.length > 0 && (
                  <div className="p-2 border-t border-white/5 bg-black/20 text-center shrink-0">
                     <button onClick={() => handleSearchResultClick(searchQuery)} className="text-xs text-[var(--color-primary)] hover:text-white font-semibold uppercase tracking-wider transition-colors py-1 px-4 w-full">
                       View all results
                     </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            className="relative p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            onClick={toggleDropdown}
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 text-[9px] font-bold flex items-center justify-center rounded-full bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]">
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
                    Recent Activity
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
                  ) : (!canReadAudit || notifications.length === 0) ? (
                    <div className="p-8 flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                        <Activity className="text-gray-500 opacity-50" size={24} />
                      </div>
                      <p className="text-sm font-medium text-gray-300">No recent activity</p>
                      <p className="text-xs text-gray-500 mt-1">You're all caught up!</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-white/5">
                      {notifications.map((notif) => {
                        const dateVal = notif.created_at || notif.timestamp;
                        const timeAgo = dateVal ? formatDistanceToNow(new Date(dateVal), { addSuffix: true }) : 'Just now';
                        const ActionIcon = notif.action === 'delete' ? Trash2 : notif.action === 'update' ? Edit2 : Plus;
                        const iconColor = notif.action === 'delete' ? 'text-red-400' : notif.action === 'update' ? 'text-blue-400' : 'text-green-400';
                        return (
                          <li key={notif.id} className="p-4 hover:bg-white/5 transition-colors cursor-default border-b border-white/5 last:border-0 group flex items-start gap-3">
                             <div className={`mt-0.5 shrink-0 ${iconColor} bg-white/5 p-1.5 rounded-md`}>
                               <ActionIcon size={14} />
                             </div>
                             <div className="flex flex-col gap-1">
                               <p className="text-sm text-gray-200">
                                 <span className="font-semibold">{notif.username || 'System'}</span>{' '}
                                 <span className="text-gray-400">{notif.action}</span>{' '}
                                 <span className="font-semibold capitalize text-primary">{notif.resource_type || 'resource'}</span>
                               </p>
                               <span className="text-xs text-gray-500">{timeAgo}</span>
                             </div>
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
