import React from 'react';
import { format } from 'date-fns';
import { Pencil, Trash2, ArrowUp, ArrowDown, Search } from 'lucide-react';
import { formatCurrency } from '@/shared/utils/formatters';

const TransactionTable = ({ 
  transactions, 
  loading, 
  error, 
  meta, 
  canWrite, 
  onEdit, 
  onDelete, 
  onSort, 
  sortField, 
  sortOrder,
  onPageChange,
  onClearFilters
}) {
  if (loading && transactions.length === 0) {
    return (
      <div className="h-full flex flex-col w-full overflow-hidden relative">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left whitespace-nowrap min-w-[700px]">
            <thead className="sticky top-0 z-10 bg-[#0c1222] border-b border-[var(--color-border)] text-xs text-gray-400 uppercase font-bold tracking-widest backdrop-blur-md">
              <tr>
                {['ID', 'Date', 'Type', 'Category', 'Amount', 'Notes', ...(canWrite ? ['Actions'] : [])].map(heading => (
                  <th key={heading} className="px-6 py-4">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {[1, 2, 3, 4, 5, 6, 7].map(i => (
                <tr key={i} className="animate-pulse transition-colors">
                  <td className="px-6 py-4"><div className="h-4 bg-white/5 rounded w-16"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-white/5 rounded w-24"></div></td>
                  <td className="px-6 py-4"><div className="h-6 bg-white/5 rounded-full w-16"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-white/5 rounded w-20"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-white/5 rounded w-20"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-white/5 rounded w-32"></div></td>
                  {canWrite && <td className="px-6 py-4"><div className="h-6 bg-white/5 rounded w-12 ml-auto"></div></td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (error) {
    return null; // Top level handles error
  }

  if (!loading && (!transactions || transactions.length === 0)) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500 w-full animate-in fade-in duration-500">
        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <Search size={32} className="text-gray-400 opacity-50" />
        </div>
        <p className="text-lg font-syne font-semibold text-gray-300">No transactions found for the selected date range</p>
        <p className="text-sm mt-1 mb-4">Try adjusting your filters or date range.</p>
        <button 
          onClick={onClearFilters}
          className="px-4 py-2 border border-white/20 text-white rounded hover:bg-white/10 transition-colors text-sm"
        >
          Clear Filters
        </button>
      </div>
    );
  }

  const SortableHeader = ({ field, label }) => {
    const isActive = sortField === field;
    return (
      <th 
        className="px-6 py-4 cursor-pointer hover:bg-white/5 transition-colors select-none group"
        onClick={() => onSort(field)}
      >
        <div className="flex items-center gap-1 group-hover:text-gray-200">
          {label}
          <div className="w-4 flex justify-center ml-1">
            {isActive ? (
              sortOrder === 'asc' ? <ArrowUp size={14} className="text-[var(--color-primary)]" /> : <ArrowDown size={14} className="text-[var(--color-primary)]" />
            ) : (
              <ArrowUp size={14} className="opacity-0 group-hover:opacity-30 transition-opacity" />
            )}
          </div>
        </div>
      </th>
    );
  };

  return (
    <div className="h-full flex flex-col w-full max-w-full animate-in fade-in duration-500 overflow-x-hidden">
      <div className="overflow-x-auto overflow-y-auto flex-1 relative hide-scrollbars-on-mobile custom-scrollbar w-full max-w-full">
        <table className="w-full text-left whitespace-nowrap min-w-[800px] border-collapse">
          <thead className="sticky top-0 z-20 bg-[rgba(12,18,34,0.95)] backdrop-blur-xl border-b border-[var(--color-border)] text-[11px] text-gray-400 uppercase tracking-[0.1em] font-syne font-semibold shadow-sm after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-white/10">
            <tr>
              <th className="px-6 py-4">ID</th>
              <SortableHeader field="date" label="Date" />
              <th className="px-6 py-4">Type</th>
              <SortableHeader field="category" label="Category" />
              <SortableHeader field="amount" label="Amount" />
              <th className="px-6 py-4">Notes</th>
              {canWrite && <th className="px-6 py-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm text-gray-300">
            <style>{`
              @keyframes highlight-income {
                0% { background-color: rgba(34, 197, 94, 0.4); border-color: rgba(34, 197, 94, 1); box-shadow: inset 0 0 10px rgba(34, 197, 94, 0.5); }
                100% { background-color: transparent; border-color: transparent; box-shadow: none; }
              }
              @keyframes highlight-expense {
                0% { background-color: rgba(239, 68, 68, 0.4); border-color: rgba(239, 68, 68, 1); box-shadow: inset 0 0 10px rgba(239, 68, 68, 0.5); }
                100% { background-color: transparent; border-color: transparent; box-shadow: none; }
              }
            `}</style>
            {transactions.map((tx, idx) => (
              <tr 
                key={tx.id} 
                className="group hover:bg-white/5 transition-all duration-200"
                style={{ 
                  animationDelay: tx._isNew ? '0ms' : `${idx * 30}ms`, 
                  animationFillMode: 'both',
                  animationName: tx._isNew ? (tx.type === 'income' ? 'highlight-income' : 'highlight-expense') : 'none',
                  animationDuration: tx._isNew ? '3s' : '0s'
                }}
              >
                {/* using native CSS animation class if added globally, or simple inline map for stagger */}
                <td className="px-6 py-4 font-mono text-gray-500 group-hover:text-gray-300 transition-colors cursor-help" title={tx.id}>
                  {tx.id?.slice(0, 8)}
                </td>
                <td className="px-6 py-4 font-mono text-gray-400 group-hover:text-gray-200 transition-colors">
                  {format(new Date(tx.date), 'MMM dd, yyyy')}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center justify-center text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full border ${
                    tx.type === 'income' 
                      ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                      : 'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                    {tx.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm capitalize font-medium text-gray-300">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full border border-white/20" />
                    {tx.category}
                  </div>
                </td>
                <td className={`px-6 py-4 font-semibold font-syne text-[15px] ${
                  tx.type === 'income' ? 'text-[var(--color-income)]' : 'text-[var(--color-expense)]'
                }`}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                </td>
                <td className="px-6 py-4 max-w-[200px] truncate text-gray-500 group-hover:text-gray-300 transition-colors" title={tx.notes}>
                  {tx.notes || '-'}
                </td>
                {canWrite && (
                  <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={() => onEdit(tx)} 
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 hover:bg-[var(--color-primary)] hover:text-white text-gray-400 transition-all" 
                        title="Edit Transaction"
                      >
                        <Pencil size={14} />
                      </button>
                      <button 
                        onClick={() => onDelete(tx.id)} 
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 hover:bg-red-500/80 hover:text-white text-gray-400 transition-all" 
                        title="Delete Transaction"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Absolute top/bottom gradients for scroll indication */}
      <div className="pointer-events-none absolute top-[52px] left-0 w-full h-8 bg-gradient-to-b from-[#0c1222] to-transparent z-10 hidden" />
      <div className="pointer-events-none absolute bottom-[60px] left-0 w-full h-12 bg-gradient-to-t from-[rgba(10,15,30,0.8)] to-transparent z-10" />

      {meta && meta.total_pages > 1 && (
        <div className="px-6 py-4 bg-[rgba(12,18,34,0.95)] backdrop-blur-md border-t border-[var(--color-border)] flex flex-wrap items-center justify-between text-sm gap-4 relative z-20 shrink-0">
          <span className="text-gray-400 font-mono text-xs">
            Showing Page <span className="text-white font-bold">{meta.page || meta.current_page || 1}</span> of <span className="text-white font-bold">{meta.total_pages}</span>
          </span>
          <div className="flex items-center gap-2">
            <button 
              className="h-8 px-4 rounded-lg bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all text-xs font-semibold tracking-wider uppercase"
              disabled={(meta.page || meta.current_page || 1) === 1}
              onClick={() => onPageChange((meta.page || meta.current_page || 1) - 1)}
            >
              Prev
            </button>
            <button 
              className="h-8 px-4 rounded-lg bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all text-xs font-semibold tracking-wider uppercase"
              disabled={(meta.page || meta.current_page || 1) === meta.total_pages}
              onClick={() => onPageChange((meta.page || meta.current_page || 1) + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default React.memo(TransactionTable);
