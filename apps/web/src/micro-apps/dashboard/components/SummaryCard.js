import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Scale, Activity } from 'lucide-react';
import { formatCurrency } from '@/shared/utils/formatters';
import { useCountUp } from '../../../shared/lib/useCountUp';

const icons = {
  income: <TrendingUp className="text-[var(--color-income)]" size={32} />,
  expense: <TrendingDown className="text-[var(--color-expense)]" size={32} />,
  net: <Scale className="text-[var(--color-net)]" size={32} />,
  activity: <Activity className="text-gray-400" size={32} />
};

export default function SummaryCard({ title, value, type, trend, delay, loading }) {
  if (loading) {
    return <div className="card skeleton h-[120px] rounded-2xl animate-pulse bg-surface/50 border border-border/50"></div>;
  }

  const numericValue = typeof value === 'string' ? parseFloat(value) : (value || 0);
  const displayValue = useCountUp(numericValue, { duration: 1200, easing: 'easeOut' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      whileHover={{ scale: 1.02, translateY: -5 }}
      className="card group relative flex flex-col p-6 rounded-2xl border border-white/5 shadow-xl bg-gradient-to-br from-surface/80 to-surface/40 backdrop-blur-xl overflow-hidden cursor-default transition-all duration-300 hover:shadow-primary/10 hover:border-primary/30"
    >
      {/* Glossy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/[0.03] to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

      <div className="flex flex-row justify-between items-center mb-4 z-10">
        <h3 className="text-gray-400 font-sans font-medium text-xs tracking-[0.2em] uppercase">{title}</h3>
        <div className="p-2 rounded-lg bg-[rgba(10,15,30,0.5)] shadow-inner group-hover:scale-110 transition-transform duration-300">
           {icons[type] || icons.activity}
        </div>
      </div>
      <div className="flex flex-col items-start justify-between mb-1 z-10">
         <span className={`text-[2rem] font-bold font-syne tracking-tight drop-shadow-md ${type === 'income' ? 'text-income' : type === 'expense' ? 'text-expense' : numericValue < 0 ? 'text-expense' : 'text-primary'}`}>
            {formatCurrency(displayValue)}
         </span>
         {trend !== undefined && (
            <div className="mt-2 z-10">
              <span className={`inline-flex items-center text-xs py-1 px-2.5 rounded-full font-semibold border ${trend >= 0 ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                  {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% <span className="text-gray-500 ml-2 font-normal">vs last month</span>
              </span>
            </div>
         )}
      </div>
    </motion.div>
  );
}
