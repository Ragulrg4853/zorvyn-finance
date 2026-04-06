import { useState, useEffect } from 'react';
import { createTransaction, updateTransaction } from '../services/TransactionService';
import { getErrorMessage } from '@/shared/lib/errorHandler';
import { X, AlertCircle, DollarSign, Calendar, Tag, FileText } from 'lucide-react';
import LoadingSpinner from '../../../shared/components/feedback/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';

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

  const handleTypeChange = (type) => {
    setFormData({ ...formData, type });
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
      
      const toAPIDate = (ddmmyyyy) => {
        if (!ddmmyyyy || !ddmmyyyy.includes('-')) return null;
        const parts = ddmmyyyy.split('-');
        if (parts.length !== 3) return null;
        if (parts[0].length === 4) return ddmmyyyy;
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      };

      const payload = {
        amount: parseFloat(formData.amount),
        type: formData.type.toLowerCase(),
        category: formData.category.trim(),
        date: toAPIDate(formData.date),
        notes: formData.notes?.trim() || null
      };

      let resultTx;
      if (transaction?.id) {
        resultTx = await updateTransaction(transaction.id, payload);
      } else {
        resultTx = await createTransaction(payload);
        resultTx._isNew = true; // For animation targeting later
      }
      onSuccess(
        transaction ? 'Transaction updated successfully' : 'Transaction created successfully',
        resultTx
      );
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050811]/80 backdrop-blur-md">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-lg bg-[rgba(10,15,30,0.85)] border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] p-8 relative overflow-hidden"
        >
          {/* Subtle background glow */}
          <div className={`absolute -top-32 -left-32 w-64 h-64 rounded-full blur-[100px] opacity-20 pointer-events-none transition-colors duration-500 ${formData.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`} />

          <button 
            onClick={onCancel}
            className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all z-10"
          >
            <X size={18} />
          </button>

          <h2 className="text-2xl font-syne font-bold text-white mb-6 tracking-wide">
            {transaction ? 'Edit Transaction' : 'New Transaction'}
          </h2>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3"
            >
              <AlertCircle className="text-red-400 mt-0.5 shrink-0" size={18} />
              <p className="text-sm font-medium text-red-200">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            
            {/* Type Toggle Slider */}
            <div className="flex p-1 bg-white/5 border border-white/10 rounded-xl relative h-12">
              <div 
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg transition-transform duration-300 ease-out shadow-sm ${
                  formData.type === 'expense' 
                    ? 'translate-x-0 bg-[rgba(10,15,30,0.9)] border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.15)]' 
                    : 'translate-x-[calc(100%+8px)] bg-[rgba(10,15,30,0.9)] border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.15)]'
                }`}
              />
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`flex-1 flex items-center justify-center text-sm font-semibold tracking-wider uppercase z-10 transition-colors ${
                  formData.type === 'expense' ? 'text-red-400' : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`flex-1 flex items-center justify-center text-sm font-semibold tracking-wider uppercase z-10 transition-colors ${
                  formData.type === 'income' ? 'text-green-400' : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Income
              </button>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Amount</label>
                <div className="relative">
                  <DollarSign className={`absolute left-3 top-1/2 -translate-y-1/2 ${formData.type === 'income' ? 'text-green-500/50' : 'text-red-500/50'}`} size={18} />
                  <input 
                    type="number" 
                    step="0.01"
                    min="0.01"
                    name="amount" 
                    value={formData.amount} 
                    onChange={handleChange} 
                    className="w-full h-11 pl-10 pr-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all font-mono text-lg"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
                  <input 
                    type="date" 
                    name="date" 
                    value={formData.date} 
                    onChange={handleChange} 
                    className="w-full h-11 pl-10 pr-4 bg-white/5 border border-white/10 rounded-xl text-gray-200 focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all cursor-text [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Category</label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
                <select 
                  name="category" 
                  value={formData.category} 
                  onChange={handleChange} 
                  className="w-full h-11 pl-10 pr-4 bg-white/5 border border-white/10 rounded-xl text-gray-200 focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all capitalize appearance-none cursor-pointer" 
                  required
                >
                  <option value="" className="bg-[#12182b] text-gray-500">Select category...</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat} className="bg-[#12182b]">{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Notes <span className="text-gray-600 normal-case tracking-normal">(Optional)</span></label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-gray-500 pointer-events-none" size={18} />
                <textarea 
                  name="notes" 
                  value={formData.notes} 
                  onChange={handleChange} 
                  className="w-full h-24 pl-10 pr-4 pt-3 bg-white/5 border border-white/10 rounded-xl text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all resize-none"
                  placeholder="Add details about this transaction..."
                />
              </div>
            </div>

            <div className="pt-6 flex items-center justify-end gap-4 border-t border-white/5 mt-4">
              <button 
                type="button" 
                onClick={onCancel}
                className="px-6 py-2.5 rounded-xl font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm uppercase tracking-wider"
                disabled={submitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-primary min-w-[140px] px-6 py-2.5 rounded-xl transition-all shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.3)] hover:shadow-[0_0_30px_rgba(var(--color-primary-rgb),0.5)] flex items-center justify-center hover:-translate-y-0.5 text-sm uppercase tracking-wider font-bold"
                disabled={submitting}
              >
                {submitting ? <LoadingSpinner /> : (transaction ? 'Update' : 'Confirm')}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
