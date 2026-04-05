import { useState } from 'react';
import { Download } from 'lucide-react';
import { exportTransactions } from '../services/TransactionService';
import LoadingSpinner from '../../../shared/components/feedback/LoadingSpinner';
import { getErrorMessage } from '@/shared/lib/errorHandler';

export default function ExportButton({ filters }) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    try {
      setExporting(true);
      const csvData = await exportTransactions(filters);
      
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setExporting(false);
    }
  };

  return (
    <button 
      onClick={handleExport}
      disabled={exporting}
      className="btn-ghost flex items-center justify-center gap-2 h-10 px-4 rounded-lg border border-[var(--color-border)] hover:bg-white/5 transition-colors whitespace-nowrap min-w-[120px]"
    >
      {exporting ? <LoadingSpinner /> : <Download size={18} />}
      Export CSV
    </button>
  );
}
