/**
 * TransactionService — all transaction API calls.
 * Constitution: CLAUDE.md #66
 */
import apiClient from '@/shared/lib/apiClient';

export async function fetchTransactions(filters = {}) {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== null && v !== undefined && v !== ''),
  );
  const response = await apiClient.get('/v1/transactions', { params });
  return response.data;
}

export async function createTransaction(payload) {
  const response = await apiClient.post('/v1/transactions', payload);
  return response.data.data;
}

export async function updateTransaction(id, payload) {
  const response = await apiClient.patch(`/v1/transactions/${id}`, payload);
  return response.data.data;
}

export async function deleteTransaction(id) {
  await apiClient.delete(`/v1/transactions/${id}`);
}

export async function exportTransactions(filters = {}) {
  const params = new URLSearchParams(
    Object.fromEntries(Object.entries(filters).filter(([, v]) => v != null && v !== '')),
  );
  const response = await apiClient.get(`/v1/transactions/export?${params}`,
    { responseType: 'blob' });
  const url = URL.createObjectURL(response.data);
  const a = document.createElement('a');
  a.href = url; a.download = 'transactions.csv'; a.click();
  URL.revokeObjectURL(url);
}
