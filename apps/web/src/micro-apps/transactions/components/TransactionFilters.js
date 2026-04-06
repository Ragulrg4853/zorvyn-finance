import { Search, X, Filter, Calendar, ChevronDown, Check } from 'lucide-react';
import { useMemo, useState, useEffect, useRef } from 'react';
// Constitution: HIERARCHY.md #X (No components fetching data directly)
import apiClient from '../../../shared/lib/apiClient';
import { ALL_CATEGORIES } from '../../../shared/lib/constants';

export default function TransactionFilters({ filters, onChange }) {
  const categories = ALL_CATEGORIES;
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Debounced search state
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (filters.search !== searchTerm) {
        onChange({ ...filters, search: searchTerm, page: 1 });
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm, filters, onChange]);

  // Click outside for category dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFilterChange = (updates) => {
    onChange({ ...filters, ...updates, page: 1 });
  };

  const handleClear = () => {
    setSearchTerm('');
    onChange({
      type: '',
      category: '',
      date_from: '',
      date_to: '',
      search: '',
      sort: filters.sort || 'date',
      order: filters.order || 'desc',
      page: 1,
      page_size: filters.page_size || 10,
    });
  };

  const removeFilter = (key) => {
    if (key === 'search') setSearchTerm('');
    handleFilterChange({ [key]: '' });
  };

  const setDateRange = (days) => {
    const today = new Date();
    const from = new Date();
    from.setDate(today.getDate() - days);
    handleFilterChange({
      date_from: from.toISOString().split('T')[0],
      date_to: today.toISOString().split('T')[0]
    });
  };

  const dateError = filters.date_from && filters.date_to && new Date(filters.date_from) > new Date(filters.date_to) 
    ? "Invalid date range" : null;

  const hasActiveFilters = !!(filters.type || filters.category || filters.date_from || filters.date_to || filters.search);

  return (
    <div className="flex flex-col gap-3 w-full mb-6">
      <div className="flex flex-col lg:flex-row flex-wrap items-center gap-3 p-3 bg-[#0c1222]/80 border border-white/5 rounded-[var(--radius-input)] backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.4)] w-full ring-1 ring-white/5 relative z-10 transition-all hover:ring-[var(--color-primary)]/20">
        
        {/* Type Pills */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/5 shrink-0">
          {[
            { label: 'ALL', value: '' },
            { label: 'INCOME', value: 'income' },
            { label: 'EXPENSE', value: 'expense' }
          ].map(opt => (
            <button
              key={opt.label}
              onClick={() => handleFilterChange({ type: opt.value })}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${
                (filters.type || '') === opt.value
                  ? 'bg-[var(--color-primary)] text-white shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-[150px] flex items-center bg-white/5 rounded-md border border-white/5 focus-within:border-[var(--color-primary)]/50 focus-within:bg-black/40 transition-colors h-10 overflow-hidden">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input 
            type="text" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search transactions..."
            className="w-full h-10 pl-9 pr-3 bg-transparent border-none text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-0 transition-all font-medium"
          />
        </div>

        {/* Category Dropdown */}
        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            className="flex items-center justify-between gap-2 h-10 px-3 min-w-[140px] bg-white/5 border border-white/5 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:border-[var(--color-primary)]/50 transition-all"
          >
            <span className="truncate max-w-[100px]">{filters.category || 'Category...'}</span>
            <ChevronDown size={14} className={`transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isCategoryOpen && (
            <div className="absolute top-full mt-1 right-0 w-48 max-h-60 overflow-y-auto bg-[#12182b] border border-white/10 rounded-md shadow-xl z-50 py-1">
              <button
                onClick={() => { handleFilterChange({ category: '' }); setIsCategoryOpen(false); }}
                className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white"
              >
                All Categories
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => { handleFilterChange({ category: cat }); setIsCategoryOpen(false); }}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white group"
                >
                  <span className="capitalize">{cat}</span>
                  {filters.category === cat && <Check size={14} className="text-[var(--color-primary)]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Date Pickers */}
        <div className="flex flex-col items-end gap-1 relative shrink-0">
          <div className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-md px-3 h-10 shadow-inner focus-within:border-[var(--color-primary)]/50 focus-within:ring-1 focus-within:ring-[var(--color-primary)]">
            <Calendar size={14} className="text-[var(--color-primary)]" />
            <input 
              type="date" 
              value={filters.date_from || ''} 
              onChange={(e) => handleFilterChange({ date_from: e.target.value })}
              className="w-[110px] bg-transparent text-sm text-gray-300 focus:outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
            />
            <span className="text-gray-500 text-sm">to</span>
            <input 
              type="date" 
              value={filters.date_to || ''} 
              onChange={(e) => handleFilterChange({ date_to: e.target.value })}
              className="w-[110px] bg-transparent text-sm text-gray-300 focus:outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
            />
          </div>
          {dateError && <span className="absolute top-full right-0 text-[10px] text-red-500 mt-1 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">{dateError}</span>}
        </div>
      </div>

      {/* Active Filters Summary Bar */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 px-1">
          <span className="text-xs font-semibold text-gray-500 uppercase mr-1">Filtered:</span>
          
          {filters.type && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[#12182b] border border-white/10 rounded-full text-xs text-gray-300">
              <span className="capitalize">{filters.type}</span>
              <button onClick={() => removeFilter('type')} className="text-gray-500 hover:text-white"><X size={12} /></button>
            </span>
          )}
          
          {filters.category && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[#12182b] border border-white/10 rounded-full text-xs text-gray-300">
              <span className="text-gray-500">Cat:</span> <span className="capitalize">{filters.category}</span>
              <button onClick={() => removeFilter('category')} className="text-gray-500 hover:text-white"><X size={12} /></button>
            </span>
          )}
          
          {(filters.date_from || filters.date_to) && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[#12182b] border border-white/10 rounded-full text-xs text-gray-300">
              <Calendar size={12} className="text-gray-500" />
              {filters.date_from || 'Any'} - {filters.date_to || 'Any'}
              <button onClick={() => { handleFilterChange({ date_from: '', date_to: '' }); }} className="text-gray-500 hover:text-white"><X size={12} /></button>
            </span>
          )}

          {filters.search && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[#12182b] border border-white/10 rounded-full text-xs text-gray-300 relative group">
              <Search size={12} className="text-gray-500" />
              <span className="max-w-[100px] truncate">"{filters.search}"</span>
              <button onClick={() => removeFilter('search')} className="text-gray-500 hover:text-white"><X size={12} /></button>
            </span>
          )}

          {/* Quick Dates */}
          <div className="flex items-center gap-2 ml-auto">
            <button onClick={() => setDateRange(7)} className="text-[10px] uppercase font-bold text-[var(--color-primary)] hover:text-white bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20 px-2 py-1 rounded transition-colors">This Week</button>
            <button onClick={() => setDateRange(30)} className="text-[10px] uppercase font-bold text-[var(--color-primary)] hover:text-white bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20 px-2 py-1 rounded transition-colors">This Month</button>
            <button onClick={() => setDateRange(90)} className="text-[10px] uppercase font-bold text-[var(--color-primary)] hover:text-white bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20 px-2 py-1 rounded transition-colors">Last 3 Months</button>

            <div className="w-[1px] h-3 bg-white/10 mx-1"></div>
            
            <button 
              onClick={handleClear}
              className="text-xs text-gray-400 hover:text-white hover:underline transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
