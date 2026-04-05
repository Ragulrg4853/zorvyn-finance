import { Search, X } from 'lucide-react';

export default function TransactionFilters({ filters, onChange }) {
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

  return (
    <div className="card p-4 bg-[rgba(10,15,30,0.4)] border border-[var(--color-border)] rounded-xl flex flex-wrap items-end gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">Type</label>
        <select 
          name="type" 
          value={filters.type} 
          onChange={handleChange}
          className="input h-10 w-32 bg-[#12182b] border-[var(--color-border)] text-sm rounded-lg"
        >
          <option value="">All</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">Category</label>
        <input 
          type="text" 
          name="category" 
          placeholder="e.g. salary"
          value={filters.category} 
          onChange={handleChange}
          className="input h-10 w-36 bg-[#12182b] border-[var(--color-border)] text-sm rounded-lg"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">Date Range</label>
        <div className="flex items-center gap-2 h-10">
          <input 
            type="date" 
            name="date_from" 
            value={filters.date_from} 
            onChange={handleChange}
            className="input bg-[#12182b] border-[var(--color-border)] text-sm rounded-lg"
          />
          <span className="text-gray-500">-</span>
          <input 
            type="date" 
            name="date_to" 
            value={filters.date_to} 
            onChange={handleChange}
            className="input bg-[#12182b] border-[var(--color-border)] text-sm rounded-lg"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
        <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
          <input 
            type="text" 
            name="search" 
            value={filters.search} 
            onChange={handleChange}
            placeholder="Search notes or category..."
            className="input pl-10 h-10 w-full bg-[#12182b] border-[var(--color-border)] text-sm rounded-lg focus:ring-[var(--color-primary)]"
          />
        </div>
      </div>

      <button 
        onClick={handleClear}
        className="btn-ghost flex items-center h-10 gap-2 border border-[var(--color-border)] hover:bg-white/5 rounded-lg px-4"
        title="Clear Filters"
      >
        <X size={16} />
        Clear
      </button>
    </div>
  );
}
