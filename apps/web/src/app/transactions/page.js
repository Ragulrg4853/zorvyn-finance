/**
 * Transactions page — all authenticated roles (viewers see read-only table).
 * Copilot Session 12: Implement per COPILOT_GUIDE.md Session 12 direction.
 *
 * Layout: Navbar + toolbar (filters left, export+new buttons right) + TransactionTable + pagination
 * Conditional: "New Transaction" button only for admin, Export only for analyst+admin
 * Data: useTransactions() hook
 */
'use client';
import { useState } from 'react';
import ProtectedRoute from '../../micro-apps/auth/components/ProtectedRoute';
import { useAuth } from '../../micro-apps/auth/hooks/useAuth';
import Navbar from '../../shared/components/layout/Navbar';
import ErrorState from '../../shared/components/feedback/ErrorState';
import { useTransactions } from '../../micro-apps/transactions/hooks/useTransactions';
import { deleteTransaction } from '../../micro-apps/transactions/services/TransactionService';
import TransactionTable from '../../micro-apps/transactions/components/TransactionTable';
import TransactionFilters from '../../micro-apps/transactions/components/TransactionFilters';
import TransactionForm from '../../micro-apps/transactions/components/TransactionForm';
import ExportButton from '../../micro-apps/transactions/components/ExportButton';
import { Plus } from 'lucide-react';
import { getErrorMessage } from '@/shared/lib/errorHandler';

export default function TransactionsPage() {
  const { user, hasPermission, logout } = useAuth();
  const { transactions, loading, error, meta, filters, setFilters, refetch } = useTransactions();
  
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const canWrite = hasPermission('transactions:write');
  const canExport = user?.role === 'admin' || user?.role === 'analyst';

  const handleEdit = (tx) => {
    setEditingTransaction(tx);
    setShowForm(true);
  };

  const handleCreate = () => {
    setEditingTransaction(null);
    setShowForm(true);
  };

  const handleSuccess = () => {
    setShowForm(false);
    refetch();
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    
    try {
      await deleteTransaction(id);
      refetch();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  const handleSort = (field) => {
    setFilters(prev => ({
      ...prev,
      sort: field,
      order: prev.sort === field && prev.order === 'desc' ? 'asc' : 'desc',
      page: 1,
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  return (
    <ProtectedRoute requiredPermission="transactions:read">
      <div className="min-h-screen">
        <Navbar user={user} onLogout={logout} />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-8">
            <h1 className="text-3xl font-syne font-bold text-gray-100 hidden md:block">Transactions</h1>
            
            <div className="flex flex-col xl:flex-row items-end gap-3 w-full md:w-auto">
              <TransactionFilters filters={filters} onChange={setFilters} />
              
              <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0 justify-end h-10">
                {canExport && <ExportButton filters={filters} />}
                
                {canWrite && (
                  <button 
                    onClick={handleCreate}
                    className="btn-primary flex items-center justify-center gap-2 h-10 px-5 border border-[var(--color-primary)] rounded-lg whitespace-nowrap"
                  >
                    <Plus size={18} />
                    New
                  </button>
                )}
              </div>
            </div>
          </div>

          {error && <ErrorState message={error} onRetry={refetch} />}

          <TransactionTable 
            transactions={transactions}
            loading={loading}
            error={error}
            meta={meta}
            canWrite={canWrite}
            sortField={filters.sort}
            sortOrder={filters.order}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSort={handleSort}
            onPageChange={handlePageChange}
          />
        </main>

        {showForm && (
          <TransactionForm 
            transaction={editingTransaction}
            onSuccess={handleSuccess}
            onCancel={() => setShowForm(false)}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
