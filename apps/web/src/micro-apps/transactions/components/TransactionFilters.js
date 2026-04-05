import { Search, X, Filter } from 'lucide-react';
import { useMemo } from 'react';

export default function TransactionFilters({ filters, onChange, transactions = [] }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...filters, [name]: value, page: 1 });
  };

  const handleClear = () => {
    onChange({
      type: '',
      category: '',
      date_from: '',
      date_to: '',
      search: '',
      sort: 'date',
      order: 'desc',
      page: 1,
      page_size: 10,
    });
  };

  // Dynamically extract categories from currently loaded transactions
  const dynamicCategories = useMemo(() => {
    if (!transactions || !transactions.length) return [];
    const cats = new Set(transactions.map((t) => t.category?.toLowerCase()?.trim()).filter(Boolean));
    return Array.from(cats).sort();
  }, [transactions]);

  return (
    <div className="flex flex-col sm:flex-row flex-wrap items-center justify-between gap-3 p-2 bg-[#0c1222]/80 border border-white/5 rounded-[var(--radius-input)] backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.4)] w-full ring-1 ring-white/5 relative z-10 transition-all hover:ring-[var(--color-primary)]/20">
      <div className="flex items-center gap-2 px-3 text-[var(--color-primary)]">
        <Filter size={18} />
        <span className="text-sm font-semibold tracking-wider uppercase hidden sm:inline-block">Filters</span>
      </div>

      <div className="h-5 w-[1px] bg-white/10 hidden sm:block mx-1"></div>

      <div className="flex flex-1 flex-wrap sm:flex-nowrap items-center gap-3 w-full sm:w-auto">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] flex items-center bg-white/5 rounded-md border border-white/5 focus-within:border-[var(--color-primary)]/50 focus-within:bg-black/40 transition-colors h-10 overflow-hidden">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input 
            type="text" 
            name="search" 
            value={filters.search || ''} 
            onChange={handleChange}
            placeholder="Search transactions..."
            className="w-full h-10 pl-9 pr-3 bg-transparent border-none text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-0 transition-all font-medium"
          />
        </div>

        {/* Type */}
        <select 
          name="type" 
          value={filters.type || ''} 
          onChange={handleChange}
          className="h-10 w-[110px] bg-white/5 border border-white/5 rounded-md text-sm font-medium text-gray-300 focus:outline-none focus:border-[var(--color-primary)]/50 transition-all cursor-pointer appearance-none px-3 hover:text-white"
        >
          <option value="" className="bg-[#12182b]">All Types</option>
          <option value="income" className="bg-[#12182b] text-[var(--color-income)]">Income</option>
          <option value="expense" className="bg-[#12182b] text-[var(--color-expense)]">Expense</option>
        </select>

        {/* Category (Dynamic Datalist) */}
        <div className="relative w-[140px] bg-white/5 rounded-md border border-white/5 focus-within:border-[var(--color-primary)]/50 h-10 overflow-hidden">
          <input 
            type="text" 
            name="category" 
            list="txn-categories"
            placeholder="Category..."
            value={filters.category || ''} 
            onChange={handleChange}
            className="w-full h-10 px-3 bg-transparent border-none text-sm font-medium text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-0 transition-all"
          />
          <datalist id="txn-categories">
            {dynamicCategories.map((cat, i) => (
              <option key={i} value={cat} />
            ))}
          </datalist>
        </div>

        {/* Date Range */}
        <div className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-md px-3 h-8 shadow-inner">
          <input 
            type="date" 
            name="date_from" 
            value={filters.date_from || ''} 
            onChange={handleChange}
            className="w-[110px] bg-transparent text-xs text-gray-300 focus:outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
          />
          <span className="text-gray-500 text-xs">-</span>
          <input 
            type="date" 
            name="date_to" 
            value={filters.date_to || ''} 
            onChange={handleChange}
            className="w-[110px] bg-transparent text-xs text-gray-300 focus:outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
          />
        </div>

        {/* Clear */}
        <button 
          onClick={handleClear}
          className="flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors border border-transparent hover:border-white/10"
          title="Clear Filters"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
