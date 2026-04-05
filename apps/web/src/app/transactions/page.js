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
import AppShell from '../../shared/components/layout/AppShell';
import ErrorState from '../../shared/components/feedback/ErrorState';
import { useTransactions } from '../../micro-apps/transactions/hooks/useTransactions';
import { deleteTransaction } from '../../micro-apps/transactions/services/TransactionService';
import TransactionTable from '../../micro-apps/transactions/components/TransactionTable';
import TransactionFilters from '../../micro-apps/transactions/components/TransactionFilters';
import TransactionForm from '../../micro-apps/transactions/components/TransactionForm';
import ExportButton from '../../micro-apps/transactions/components/ExportButton';
import SuccessToast from '../../shared/components/ui/SuccessToast';
import { Plus } from 'lucide-react';
import { getErrorMessage } from '@/shared/lib/errorHandler';

export default function TransactionsPage() {
  const { user, hasPermission, logout } = useAuth();
  const { transactions, loading, error, meta, filters, setFilters, refetch } = useTransactions();
  
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

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

  const handleSuccess = (msg) => {
    setShowForm(false);
    setToastMessage(msg || 'Transaction mapped successfully');
    refetch();
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    
    try {
      await deleteTransaction(id);
      setToastMessage('Transaction deleted');
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
      <AppShell user={user} onLogout={logout} hasPermission={hasPermission} pageTitle="Transactions">
        <div className="flex flex-col h-full min-h-0 w-full animate-in fade-in duration-500">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-6 shrink-0">
            <h1 className="text-3xl font-syne font-bold text-gray-100 hidden md:block tracking-wide">
              Transactions
            </h1>
            
            <div className="flex flex-col xl:flex-row flex-wrap items-end gap-3 w-full md:w-auto">
              <TransactionFilters 
                filters={filters} 
                onChange={setFilters} 
                transactions={transactions} 
              />
              
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0 justify-end h-10 shrink-0">
                {canExport && <ExportButton filters={filters} />}
                
                {canWrite && (
                  <button 
                    onClick={handleCreate}
                    className="btn-primary flex shrink-0 items-center justify-center gap-2 h-10 px-5 border border-[var(--color-primary)] rounded-lg whitespace-nowrap shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.3)] hover:shadow-[0_0_25px_rgba(var(--color-primary-rgb),0.5)] transition-all duration-300 font-medium bg-[var(--color-primary)] text-white"
                  >
                    <Plus size={18} />
                    New
                  </button>
                )}
              </div>
            </div>
          </div>

          {error && <ErrorState message={error} onRetry={refetch} />}

          <div className="flex-1 min-h-0 w-full rounded-2xl border border-[var(--color-border)] bg-[rgba(10,15,30,0.4)] backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col relative">
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
          </div>
        </div>

        {showForm && (
          <TransactionForm 
            transaction={editingTransaction}
            onSuccess={handleSuccess}
            onCancel={() => setShowForm(false)}
          />
        )}

        <SuccessToast 
          show={!!toastMessage} 
          message={toastMessage} 
          onClose={() => setToastMessage('')} 
        />
      </AppShell>
    </ProtectedRoute>
  );
}
