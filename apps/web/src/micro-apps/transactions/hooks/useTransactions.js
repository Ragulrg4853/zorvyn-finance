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
      const data = await fetchTransactions(filters);
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
