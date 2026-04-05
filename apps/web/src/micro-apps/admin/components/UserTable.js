import React from 'react';
import { Pencil, UserX, Search, Shield, User, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export function UserTable({ users, loading, onEdit, onDeactivate, filters, onFilterChange, meta }) {
  if (loading && (!users || users.length === 0)) {
    return (
      <div className="h-full flex flex-col w-full overflow-hidden">
        <div className="p-4 border-b border-[var(--color-border)] sticky top-0 bg-[rgba(12,18,34,0.95)] z-20 backdrop-blur-xl">
          <div className="h-9 w-64 bg-white/5 rounded-lg skeleton"></div>
        </div>
        <table className="w-full text-left whitespace-nowrap min-w-[700px]">
          <thead className="bg-[#0c1222] border-b border-[var(--color-border)] text-xs text-gray-400 uppercase font-bold tracking-widest">
            <tr>
              {['Name', 'Email', 'Role', 'Status', 'Actions'].map(heading => (
                <th key={heading} className="px-6 py-4">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {[1, 2, 3, 4, 5].map(i => (
              <tr key={i} className="animate-pulse">
                <td className="px-6 py-4"><div className="h-4 bg-white/5 rounded w-32"></div></td>
                <td className="px-6 py-4"><div className="h-4 bg-white/5 rounded w-40"></div></td>
                <td className="px-6 py-4"><div className="h-6 bg-white/5 rounded-full w-20"></div></td>
                <td className="px-6 py-4"><div className="h-6 bg-white/5 rounded-full w-16"></div></td>
                <td className="px-6 py-4"><div className="h-8 bg-white/5 rounded w-24"></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col w-full overflow-hidden animate-in fade-in duration-500">
      
      {/* Search Toolbar */}
      <div className="px-6 py-4 border-b border-[var(--color-border)] bg-[rgba(12,18,34,0.95)] sticky top-0 z-20 backdrop-blur-xl flex items-center justify-between shrink-0">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input 
            type="text" 
            placeholder="Search users by name or email..." 
            value={filters?.search || ''}
            onChange={e => onFilterChange({ ...filters, search: e.target.value, page: 1 })}
            className="w-full h-9 pl-9 pr-4 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
          />
        </div>
      </div>

      {(!loading && (!users || users.length === 0)) ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 w-full animate-in fade-in duration-500 min-h-[300px]">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <Users size={28} className="text-gray-400 opacity-50" />
          </div>
          <p className="text-lg font-syne font-semibold text-gray-300">No users found</p>
          <p className="text-sm mt-1">Try adjusting your search criteria.</p>
        </div>
      ) : (
        <div className="overflow-auto flex-1 relative hide-scrollbars-on-mobile custom-scrollbar">
          <table className="w-full text-left whitespace-nowrap min-w-[800px] border-collapse">
            <thead className="sticky top-0 z-10 bg-[rgba(12,18,34,0.95)] backdrop-blur-xl border-b border-[var(--color-border)] text-[11px] text-gray-400 uppercase tracking-[0.1em] font-syne font-semibold shadow-sm after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-white/10">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm text-gray-300">
              {users?.map((usr, idx) => (
                <tr 
                  key={usr.id} 
                  className="group hover:bg-white/5 transition-all duration-200"
                  style={{ animationDelay: `${idx * 30}ms`, animationFillMode: 'both' }}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center shrink-0">
                        <User size={16} className="text-indigo-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-200">{usr.full_name || 'N/A'}</span>
                        <span className="text-xs text-gray-500">{usr.email}</span>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-semibold capitalize text-gray-300">
                      {usr.role === 'admin' ? <Shield size={12} className="text-emerald-400" /> : <User size={12} className="text-blue-400" />}
                      {usr.role}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center justify-center text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full border ${
                      usr.is_active 
                        ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {usr.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => onEdit(usr)} 
                        className="h-8 px-3 rounded-md flex items-center justify-center gap-2 bg-white/5 hover:bg-[var(--color-primary)] hover:text-white text-gray-400 transition-all text-xs font-semibold tracking-wide uppercase" 
                      >
                        <Pencil size={12} /> Edit
                      </button>
                      {usr.is_active && (
                        <button 
                          onClick={() => onDeactivate(usr.id)} 
                          className="h-8 px-3 rounded-md flex items-center justify-center gap-2 bg-white/5 hover:bg-red-500/80 hover:text-white text-gray-400 transition-all text-xs font-semibold tracking-wide uppercase" 
                        >
                          <UserX size={12} /> Deactivate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {meta && meta.total_pages > 1 && (
        <div className="px-6 py-4 bg-[rgba(12,18,34,0.95)] backdrop-blur-md border-t border-[var(--color-border)] flex items-center justify-between text-sm shadow-[0_-10px_20px_rgba(0,0,0,0.2)] shrink-0 z-20 relative">
          <span className="text-gray-400 font-mono text-xs">
            Page <span className="text-white font-bold">{meta.page || meta.current_page || 1}</span> of <span className="text-white font-bold">{meta.total_pages}</span>
          </span>
          <div className="flex items-center gap-2">
            <button 
              className="h-8 px-4 rounded-lg bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all text-xs font-semibold tracking-wider uppercase"
              disabled={(meta.page || meta.current_page || 1) === 1}
              onClick={() => onFilterChange({ ...filters, page: (meta.page || meta.current_page || 1) - 1 })}
            >
              Prev
            </button>
            <button 
              className="h-8 px-4 rounded-lg bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all text-xs font-semibold tracking-wider uppercase"
              disabled={(meta.page || meta.current_page || 1) === meta.total_pages}
              onClick={() => onFilterChange({ ...filters, page: (meta.page || meta.current_page || 1) + 1 })}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
