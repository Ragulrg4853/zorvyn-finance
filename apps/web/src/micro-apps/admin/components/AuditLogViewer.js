import React from 'react';
import { format } from 'date-fns';
import { Activity, ShieldAlert, Monitor, Globe, Search, ArrowRight, User } from 'lucide-react';
import { motion } from 'framer-motion';

const StatusBadge = ({ status }) => {
  const isSuccess = status === 'success';
  return (
    <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md border backdrop-blur-md flex items-center gap-1.5 w-max ${
      isSuccess 
        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
        : 'bg-red-500/10 text-red-400 border-red-500/20'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isSuccess ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.5)]'}`}></span>
      {status}
    </span>
  );
};

const ActionBadge = ({ action }) => {
  const isDelete = action.includes('DELETE');
  const isCreate = action.includes('CREATE');
  const isUpdate = action.includes('UPDATE');
  const isLogin = action.includes('LOGIN');

  let colorClass = 'text-blue-400 bg-blue-500/10 border-blue-500/20';
  let icon = <Activity size={12} />;

  if (isDelete) { colorClass = 'text-rose-400 bg-rose-500/10 border-rose-500/20'; icon = <ShieldAlert size={12} />; }
  if (isCreate) { colorClass = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'; icon = <Activity size={12} />; }
  if (isUpdate) { colorClass = 'text-amber-400 bg-amber-500/10 border-amber-500/20'; icon = <Activity size={12} />; }
  if (isLogin) { colorClass = 'text-purple-400 bg-purple-500/10 border-purple-500/20'; icon = <User size={12} />; }

  return (
    <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md border flex items-center gap-1.5 w-max ${colorClass}`}>
      {icon}
      {action.replace('_', ' ')}
    </span>
  );
};

export function AuditLogViewer({ logs, loading, meta, filters, onFilterChange }) {
  const handlePageChange = (page) => {
    onFilterChange({ ...filters, page });
  };

  return (
    <div className="h-full flex flex-col w-full overflow-hidden animate-in fade-in duration-500">
      
      {/* Header & Filter */}
      <div className="px-6 py-5 border-b border-[var(--color-border)] bg-[rgba(12,18,34,0.95)] sticky top-0 z-20 backdrop-blur-xl shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-syne font-bold text-gray-100 flex items-center gap-3 tracking-wide">
            <Activity className="text-[var(--color-primary)]" size={22} />
            System Audit Logs
          </h3>
          <p className="text-sm text-gray-400 mt-1">Immutable ledger of platform activities, access events, and modifications.</p>
        </div>
        
        <div className="relative group w-full sm:w-64 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--color-primary)] transition-colors" size={18} />
            <input
              type="text"
              placeholder="Filter by action..."
              className="w-full bg-black/40 border border-white/10 text-white placeholder-gray-500 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-all"
              value={filters.action || ''}
              onChange={(e) => onFilterChange({ ...filters, action: e.target.value, page: 1 })}
            />
        </div>
      </div>
      
      {/* Table Area */}
      <div className="flex-1 overflow-auto relative custom-scrollbar">
        <div className="min-w-[1000px] w-full border-collapse text-left text-sm text-gray-300">
          
          {/* Table Header */}
          <div className="sticky top-0 z-10 bg-[rgba(15,20,35,0.95)] backdrop-blur-xl border-b border-white/10 uppercase font-mono text-xs tracking-widest text-gray-400 grid grid-cols-12 gap-4 px-6 py-4">
            <div className="col-span-2">Timestamp</div>
            <div className="col-span-2">User / Actor</div>
            <div className="col-span-2">Event Action</div>
            <div className="col-span-3">Target Resource</div>
            <div className="col-span-2">Network Data</div>
            <div className="col-span-1 text-right">Status</div>
          </div>
          
          {/* Table Body */}
          <div className="divide-y divide-white/5">
            {loading ? (
              // Loading State
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="grid grid-cols-12 gap-4 px-6 py-4 animate-pulse bg-white/[0.02]">
                  <div className="col-span-2"><div className="h-4 w-32 bg-white/10 rounded"></div></div>
                  <div className="col-span-2"><div className="h-4 w-24 bg-white/10 rounded"></div></div>
                  <div className="col-span-2"><div className="h-6 w-28 bg-white/10 rounded-md"></div></div>
                  <div className="col-span-3"><div className="h-4 w-40 bg-white/10 rounded"></div></div>
                  <div className="col-span-2"><div className="h-4 w-28 bg-white/10 rounded"></div></div>
                  <div className="col-span-1 flex justify-end"><div className="h-6 w-20 bg-white/10 rounded-md"></div></div>
                </div>
              ))
            ) : (!logs || logs.length === 0) ? (
              // Empty State
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <Activity className="text-gray-500" size={32} />
                </div>
                <h4 className="text-lg font-bold text-gray-200 mb-2">No Audit Trails Found</h4>
                <p className="text-sm text-gray-500 max-w-sm">No activity logs match your current filter criteria or the ledger is empty.</p>
              </div>
            ) : (
              // Data Rows
              logs.map((log, idx) => (
                <motion.div 
                  key={log.id} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/5 transition-colors group cursor-default"
                >
                  <div className="col-span-2 font-mono text-xs text-gray-400">
                    {format(new Date(log.timestamp), 'MMM dd, yyyy')}<br/>
                    <span className="text-gray-500">{format(new Date(log.timestamp), 'HH:mm:ss.SSS')}</span>
                  </div>
                  
                  <div className="col-span-2 flex items-center gap-2">
                    <div className="w-7 h-7 rounded bg-white/10 flex items-center justify-center text-gray-400 border border-white/5">
                      <User size={14} />
                    </div>
                    <span className="truncate text-gray-300 font-medium" title={log.user_id}>{log.user_id?.split('-')[0]}...</span>
                  </div>
                  
                  <div className="col-span-2">
                    <ActionBadge action={log.action} />
                  </div>
                  
                  <div className="col-span-3 flex items-center gap-2 text-sm text-gray-300">
                    <Monitor size={14} className="text-gray-500" />
                    <span className="truncate" title={log.resource_type}>{log.resource_type}</span>
                    {log.resource_id && (
                      <>
                        <ArrowRight size={12} className="text-gray-600" />
                        <span className="font-mono text-xs text-gray-500 truncate bg-white/5 px-2 py-0.5 rounded" title={log.resource_id}>
                          {log.resource_id.substring(0, 8)}
                        </span>
                      </>
                    )}
                  </div>
                  
                  <div className="col-span-2 flex items-center gap-2 font-mono text-xs text-gray-400">
                    <Globe size={14} className="text-gray-600" />
                    {log.ip_address || '---.---.---.---'}
                  </div>
                  
                  <div className="col-span-1 flex justify-end">
                    <StatusBadge status={log.status} />
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Pagination Footer */}
      {(meta?.total_pages > 1 || !loading) && (
        <div className="px-6 py-4 border-t border-[var(--color-border)] bg-[rgba(10,15,30,0.95)] shrink-0 flex items-center justify-between">
          <p className="text-sm text-gray-500 font-mono">
             {loading ? 'Initializing ledger...' : `Showing page ${meta?.current_page || 1} of ${meta?.total_pages || 1}`}
          </p>
          
          <div className="flex gap-2">
             <button
                disabled={loading || (meta?.current_page || 1) <= 1}
                onClick={() => handlePageChange((meta?.current_page || 1) - 1)}
                className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-gray-300 text-sm font-medium hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
             >
               Previous
             </button>
             <button
                disabled={loading || (meta?.current_page || 1) >= (meta?.total_pages || 1)}
                onClick={() => handlePageChange((meta?.current_page || 1) + 1)}
                className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-gray-300 text-sm font-medium hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
             >
               Next
             </button>
          </div>
        </div>
      )}
    </div>
  );
}
