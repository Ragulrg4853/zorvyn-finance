import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X } from 'lucide-react';
import { useEffect } from 'react';

export default function SuccessToast({ message, show, onClose, duration = 3000 }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', bounce: 0.4, duration: 0.5 }}
          className="fixed bottom-8 right-8 z-[100] flex items-center gap-3 px-4 py-3 min-w-[280px] bg-[rgba(10,15,30,0.8)] backdrop-blur-xl border border-green-500/30 rounded-xl shadow-[0_8px_30px_rgba(34,197,94,0.15)] ring-1 ring-white/5"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500/10 shrink-0">
            <CheckCircle className="text-green-400" size={18} />
          </div>
          
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-200 mt-0.5">{message}</p>
          </div>
          
          <button 
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-300 transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}