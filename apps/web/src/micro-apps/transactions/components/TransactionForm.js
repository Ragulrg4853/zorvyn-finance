import { useState, useEffect } from 'react';
import { createTransaction, updateTransaction } from '../services/TransactionService';
import { getErrorMessage } from '@/shared/lib/errorHandler';
import { X, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../../../shared/components/feedback/LoadingSpinner';

const CATEGORIES = [
  'salary', 'freelance', 'sales', 'subscriptions', 'rent', 'groceries', 
  'dining', 'transport', 'utilities', 'entertainment', 'healthcare', 
  'education', 'investments', 'other'
];

export default function TransactionForm({ transaction, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    category: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (transaction) {
      setFormData({
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        date: transaction.date.split('T')[0],
        notes: transaction.notes || '',
      });
    }
  }, [transaction]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    const amountNum = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amountNum) || amountNum <= 0) {
      setError('Amount must be a positive number.');
      return;
    }
    if (!formData.type) {
      setError('Type is required.');
      return;
    }
    if (!formData.category) {
      setError('Category is required.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        amount: amountNum,
      };

      if (transaction?.id) {
        await updateTransaction(transaction.id, payload);
      } else {
        await createTransaction(payload);
      }
      onSuccess();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="card w-full max-w-md bg-[#0a0f1e] border border-[var(--color-border)] rounded-2xl shadow-2xl p-6 relative">
        <button 
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-syne font-bold text-gray-100 mb-6">
          {transaction ? 'Edit Transaction' : 'New Transaction'}
        </h2>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-red-400 mt-0.5" size={18} />
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm text-gray-400 font-medium">Type</label>
              <select name="type" value={formData.type} onChange={handleChange} className="input w-full bg-[#12182b] border-[var(--color-border)] rounded-xl py-2 px-3 focus:ring-[var(--color-primary)]">
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="text-sm text-gray-400 font-medium">Amount ($)</label>
              <input 
                type="number" 
                step="0.01"
                min="0.01"
                name="amount" 
                value={formData.amount} 
                onChange={handleChange} 
                className="input w-full bg-[#12182b] border-[var(--color-border)] rounded-xl py-2 px-3 focus:ring-[var(--color-primary)]"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm text-gray-400 font-medium">Category</label>
              <select name="category" value={formData.category} onChange={handleChange} className="input w-full bg-[#12182b] border-[var(--color-border)] rounded-xl py-2 px-3 focus:ring-[var(--color-primary)] capitalize" required>
                <option value="">Select...</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="text-sm text-gray-400 font-medium">Date</label>
              <input 
                type="date" 
                name="date" 
                value={formData.date} 
                onChange={handleChange} 
                className="input w-full bg-[#12182b] border-[var(--color-border)] rounded-xl py-2 px-3 focus:ring-[var(--color-primary)]"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm text-gray-400 font-medium">Notes (Optional)</label>
            <textarea 
              name="notes" 
              value={formData.notes} 
              onChange={handleChange} 
              className="input w-full h-24 bg-[#12182b] border-[var(--color-border)] rounded-xl py-2 px-3 focus:ring-[var(--color-primary)] resize-none"
              placeholder="Add details about this transaction..."
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <button 
              type="button" 
              onClick={onCancel}
              className="btn-ghost px-5 py-2 rounded-xl border border-[var(--color-border)] hover:bg-white/5 transition-colors"
              disabled={submitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary min-w-[120px] px-5 py-2 rounded-xl transition-all shadow-[var(--color-primary)] shadow-sm hover:shadow-md hover:-translate-y-0.5"
              disabled={submitting}
            >
              {submitting ? <LoadingSpinner /> : (transaction ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
