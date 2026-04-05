import { useState, useEffect, useCallback } from 'react';
import { fetchTransactions } from '../services/TransactionService';
import { getErrorMessage } from '@/shared/lib/errorHandler';

export function useTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
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

  const fetchTransactionsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const toISO = (val) => val && !/^\\d{4}-\\d{2}-\\d{2}$/.test(val) ? val.split('-').reverse().join('-') : val;
      
      const formattedFilters = { ...filters };
      if (formattedFilters.date_from) formattedFilters.date_from = toISO(formattedFilters.date_from);
      if (formattedFilters.date_to) formattedFilters.date_to = toISO(formattedFilters.date_to);

      const data = await fetchTransactions(formattedFilters);
      setTransactions(data.data || []);
      setMeta(data.meta || { total: 0, current_page: 1, total_pages: 1 });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTransactionsData();
  }, [fetchTransactionsData]);

  return { transactions, loading, error, meta, filters, setFilters, refetch: fetchTransactionsData };
}
