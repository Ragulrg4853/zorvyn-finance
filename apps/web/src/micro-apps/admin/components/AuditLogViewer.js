import React from 'react';
import { format } from 'date-fns';
import { Activity, ShieldAlert, Monitor, Globe, Search, User, Filter, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export const AuditLogViewer = React.memo(function AuditLogViewer({ logs, loading, meta, filters, onFilterChange, users }) {
  
  const handleFilterUpdate = (key, value) => {
    onFilterChange({ ...filters, [key]: value, cursor: null });
  };

  const handleNextPage = () => {
    if (meta?.next_cursor) {
      onFilterChange({ ...filters, cursor: meta.next_cursor });
    }
  };

  const handleClearFilters = () => {
    onFilterChange({ page_size: 50 });
  };

  const getUsername = (userId) => {
    if (!users || !userId) return userId?.substring(0, 8) + '...';
    const user = users.find(u => u.id === userId);
    return user ? (user.username || user.full_name || user.email) : userId.substring(0, 8) + '...';
  };

  return (
    <div className="h-full flex flex-col w-full overflow-hidden animate-in fade-in duration-500">
      
      {/* Header & Filter */}
      <div className="px-6 py-5 border-b border-[var(--color-border)] bg-[rgba(12,18,34,0.95)] sticky top-0 z-20 backdrop-blur-xl shrink-0 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-syne font-bold text-gray-100 flex items-center gap-3 tracking-wide">
            <Activity className="text-[var(--color-primary)]" size={22} />
            System Audit Logs
          </h3>
          <p className="text-sm text-gray-400 mt-1">Immutable ledger of platform activities, access events, and modifications.</p>
        </div>
        
        <div className="flex flex-wrap gap-3 items-center">
            <div className="relative group w-full sm:w-64 shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--color-primary)] transition-colors" size={16} />
                <input
                  type="text"
                  placeholder="Filter by Action..."
                  className="w-full bg-black/40 border border-white/10 text-white placeholder-gray-500 rounded-lg pl-9 pr-4 h-9 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-all"
                  value={filters.action || ''}
                  onChange={(e) => handleFilterUpdate('action', e.target.value)}
                />
            </div>
            
            <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-lg px-3 h-9">
              <Calendar size={14} className="text-gray-500 shrink-0" />
              <input
                type="date"
                className="bg-transparent border-none text-gray-300 text-xs focus:outline-none w-[110px]"
                value={filters.date_from || ''}
                onChange={(e) => handleFilterUpdate('date_from', e.target.value)}
              />
              <span className="text-gray-600 text-xs">to</span>
              <input
                type="date"
                className="bg-transparent border-none text-gray-300 text-xs focus:outline-none w-[110px]"
                value={filters.date_to || ''}
                onChange={(e) => handleFilterUpdate('date_to', e.target.value)}
              />
            </div>
            
            {(filters.action || filters.date_from || filters.date_to) && (
              <button 
                onClick={handleClearFilters}
                className="text-xs text-gray-400 hover:text-white px-2 py-1 transition-colors"
              >
                Clear
              </button>
            )}
        </div>
      </div>
      
      {/* Table Area */}
      <div className="flex-1 overflow-auto relative custom-scrollbar">
        <div className="w-full border-collapse text-left text-sm text-gray-300">
          
          {/* Table Header */}
          <div className="sticky top-0 z-10 bg-[rgba(15,20,35,0.95)] backdrop-blur-xl border-b border-white/10 uppercase font-mono text-[11px] tracking-widest text-gray-400 grid grid-cols-12 gap-4 px-6 py-4">
            <div className="col-span-3">Timestamp</div>
            <div className="col-span-2">User</div>
            <div className="col-span-2">Action</div>
            <div className="col-span-2">Resource</div>
            <div className="col-span-1 border-gray-100">Resource ID</div>
            <div className="col-span-2 text-right">Correlation ID</div>
          </div>
          
          {/* Table Body */}
          <div className="divide-y divide-white/5 min-w-[900px]">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="grid grid-cols-12 gap-4 px-6 py-4 animate-pulse bg-white/[0.02]">
                  <div className="col-span-3"><div className="h-4 w-32 bg-white/10 rounded"></div></div>
                  <div className="col-span-2"><div className="h-4 w-24 bg-white/10 rounded"></div></div>
                  <div className="col-span-2"><div className="h-6 w-28 bg-white/10 rounded-md"></div></div>
                  <div className="col-span-2"><div className="h-4 w-20 bg-white/10 rounded"></div></div>
                  <div className="col-span-1"><div className="h-4 w-16 bg-white/10 rounded"></div></div>
                  <div className="col-span-2 flex justify-end"><div className="h-4 w-16 bg-white/10 rounded"></div></div>
                </div>
              ))
            ) : (!logs || logs.length === 0) ? (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <Activity className="text-gray-500" size={32} />
                </div>
                <h4 className="text-lg font-bold text-gray-200 mb-2">No Audit Trails Found</h4>
                <p className="text-sm text-gray-500 max-w-sm">No activity logs match your current filter criteria or the ledger is empty.</p>
              </div>
            ) : (
              logs.map((log, idx) => (
                <motion.div 
                  key={log.id} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/5 transition-colors group cursor-default"
                >
                  <div className="col-span-3 font-mono text-xs text-gray-400">
                    {format(new Date(log.created_at || log.timestamp), 'dd MMM yyyy HH:mm:ss')}
                  </div>
                  
                  <div className="col-span-2 text-gray-300 font-medium flex items-center gap-2">
                    <User size={14} className="text-gray-500 shrink-0" />
                    <span className="truncate" title={getUsername(log.user_id)}>{getUsername(log.user_id)}</span>
                  </div>
                  
                  <div className="col-span-2">
                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border bg-black/40 text-white border-white/20">
                      {log.action}
                    </span>
                  </div>
                  
                  <div className="col-span-2 text-sm text-gray-300">
                    <span className="truncate capitalize">{log.resource_type}</span>
                  </div>

                  <div className="col-span-1 font-mono text-xs text-gray-500">
                    {log.resource_id ? log.resource_id.substring(0, 8) : '-'}
                  </div>
                  
                  <div className="col-span-2 flex justify-end font-mono text-xs text-gray-500">
                    {log.correlation_id ? log.correlation_id.substring(0, 8) : '-'}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Pagination Footer */}
      {meta && (
        <div className="px-6 py-4 bg-[rgba(12,18,34,0.95)] backdrop-blur-md border-t border-[var(--color-border)] flex flex-col md:flex-row items-center justify-between text-sm gap-4 relative z-20 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-gray-400 font-mono text-xs hidden sm:inline-block">Show per page:</span>
            <select 
              value={meta.page_size || 50}
              onChange={(e) => onFilterChange({ ...filters, page_size: Number(e.target.value), page: 1, cursor: null })}
              className="bg-white/5 border border-white/10 text-white rounded text-xs px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer hover:bg-white/10 transition-colors"
            >
              {[10, 25, 50, 100].map(size => <option key={size} value={size} className="bg-[#0c1222] text-white">Show {size}</option>)}
            </select>
          </div>
          
          <span className="text-gray-400 font-mono text-xs text-center flex-1">
            Showing <span className="text-white font-bold">{Math.min(((meta.page || meta.current_page || 1) - 1) * (meta.page_size || 50) + 1, meta.total || 0)}</span> - <span className="text-white font-bold">{Math.min((meta.page || meta.current_page || 1) * (meta.page_size || 50), meta.total || 0)}</span> of <span className="text-white font-bold">{meta.total || 0}</span> records
          </span>

          <div className="flex items-center gap-2 font-mono text-xs text-gray-400 mr-2">
            Page <span className="text-white font-bold">{meta.page || meta.current_page || 1}</span> of <span className="text-white font-bold">{meta.total_pages || 1}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              className="h-8 px-4 rounded-lg bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all text-xs font-semibold tracking-wider uppercase border border-transparent disabled:border-white/5"
              disabled={(meta.page || meta.current_page || 1) <= 1}
              onClick={() => onFilterChange({ ...filters, page: (meta.page || meta.current_page || 1) - 1, cursor: null })}
            >
              Prev
            </button>
            <button 
              className="h-8 px-4 rounded-lg bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all text-xs font-semibold tracking-wider uppercase border border-transparent disabled:border-white/5"
              disabled={(meta.page || meta.current_page || 1) >= (meta.total_pages || 1)}
              onClick={() => onFilterChange({ ...filters, page: (meta.page || meta.current_page || 1) + 1, cursor: null })}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
});
