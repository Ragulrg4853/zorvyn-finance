import { format } from 'date-fns';
import { Pencil, Trash2, ArrowUp, ArrowDown, Search } from 'lucide-react';
import { formatCurrency } from '@/shared/utils/formatters';

export default function TransactionTable({ 
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
  onPageChange
}) {
  if (loading && transactions.length === 0) {
    return (
      <div className="card bg-[rgba(10,15,30,0.5)] border border-[var(--color-border)] rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#12182b] border-b border-[var(--color-border)] text-xs text-gray-400 uppercase">
            <tr>
              {['Date', 'Category', 'Type', 'Amount', 'Notes', ...(canWrite ? ['Actions'] : [])].map(heading => (
                <th key={heading} className="p-4">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map(i => (
              <tr key={i} className="border-b border-[var(--color-border)]">
                <td className="p-4"><div className="skeleton h-4 w-20 rounded" /></td>
                <td className="p-4"><div className="skeleton h-4 w-24 rounded" /></td>
                <td className="p-4"><div className="skeleton h-6 w-16 rounded-full" /></td>
                <td className="p-4"><div className="skeleton h-4 w-20 rounded" /></td>
                <td className="p-4"><div className="skeleton h-4 w-32 rounded" /></td>
                {canWrite && <td className="p-4"><div className="skeleton h-6 w-12 rounded" /></td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (error) {
    return null; // Top level handles error
  }

  if (!loading && (!transactions || transactions.length === 0)) {
    return (
      <div className="card h-64 flex flex-col items-center justify-center bg-[rgba(10,15,30,0.5)] border border-[var(--color-border)] rounded-xl text-gray-500">
        <Search className="mb-4" size={32} />
        <p>No transactions found</p>
      </div>
    );
  }

  const SortableHeader = ({ field, label }) => {
    return (
      <th 
        className="p-4 cursor-pointer hover:bg-white/5 transition-colors select-none"
        onClick={() => onSort(field)}
      >
        <div className="flex items-center gap-1">
          {label}
          {sortField === field && (
            sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
          )}
        </div>
      </th>
    );
  };

  return (
    <div className="card bg-[rgba(10,15,30,0.5)] border border-[var(--color-border)] rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="bg-[#12182b] border-b border-[var(--color-border)] text-xs text-gray-400 uppercase tracking-widest font-syne">
            <tr>
              <SortableHeader field="date" label="Date" />
              <SortableHeader field="category" label="Category" />
              <th className="p-4">Type</th>
              <SortableHeader field="amount" label="Amount" />
              <th className="p-4">Notes</th>
              {canWrite && <th className="p-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)] text-sm">
            {transactions.map(tx => (
              <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4 text-gray-300 font-mono">
                  {format(new Date(tx.date), 'MMM dd, yyyy')}
                </td>
                <td className="p-4 text-gray-200 capitalize">{tx.category}</td>
                <td className="p-4">
                  <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded-full ${tx.type === 'income' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {tx.type}
                  </span>
                </td>
                <td className={`p-4 font-semibold font-syne ${tx.type === 'income' ? 'text-[var(--color-income)]' : 'text-[var(--color-expense)]'}`}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                </td>
                <td className="p-4 text-gray-400 max-w-[200px] truncate" title={tx.notes}>
                  {tx.notes || '-'}
                </td>
                {canWrite && (
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => onEdit(tx)} className="p-1 hover:text-[var(--color-primary)] text-gray-500 transition-colors" title="Edit">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => onDelete(tx.id)} className="p-1 hover:text-red-400 text-gray-500 transition-colors" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {meta && meta.total_pages > 1 && (
        <div className="p-4 border-t border-[var(--color-border)] flex items-center justify-between text-sm">
          <span className="text-gray-400 font-mono">
            Page {meta.current_page} of {meta.total_pages}
          </span>
          <div className="flex items-center gap-2">
            <button 
              className="btn-ghost py-1 px-3 text-sm disabled:opacity-50"
              disabled={meta.current_page === 1}
              onClick={() => onPageChange(meta.current_page - 1)}
            >
              Prev
            </button>
            <button 
              className="btn-ghost py-1 px-3 text-sm disabled:opacity-50"
              disabled={meta.current_page === meta.total_pages}
              onClick={() => onPageChange(meta.current_page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
