import { formatCurrency } from '@/shared/utils/formatters';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

export default function RecentActivity({ transactions, loading }) {
  if (loading) {
    return <div className="card skeleton h-[400px] rounded-2xl animate-pulse bg-surface/50 border border-border/50" />;
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="card bg-gradient-to-br from-surface/80 to-surface/40 backdrop-blur-xl border border-white/5 p-6 rounded-2xl flex items-center justify-center text-gray-500 h-[400px] shadow-xl">
        <div className="text-center">
           <div className="w-12 h-12 rounded-full bg-border inline-flex items-center justify-center mb-3 text-gray-400">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
           </div>
           <p>No recent activity</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
      className="card p-6 bg-gradient-to-br from-surface/80 to-surface/40 backdrop-blur-xl border border-white/5 rounded-2xl h-[420px] shadow-xl relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-6 z-10 relative">
        <h3 className="font-syne text-xl text-white font-bold drop-shadow-sm tracking-tight">Recent Activity</h3>
        <button className="text-xs text-primary/80 hover:text-primary transition-colors font-medium cursor-pointer">View All</button>
      </div>

      {/* Fade Top/Bottom for Scroll */}
      <div className="absolute top-[80px] left-0 right-0 h-8 bg-gradient-to-b from-surface/90 to-transparent z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-surface/90 to-transparent z-10 pointer-events-none rounded-b-2xl" />

      <div className="h-[300px] overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        {transactions.map((tx, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + (i * 0.05) }}
            key={tx.id} 
            className="flex flex-row gap-4 items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all group"
          >
            <div className="flex flex-row items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-surface border ${tx.type === 'income' ? 'border-income/20 text-income' : 'border-expense/20 text-expense'} group-hover:scale-110 shadow-inner transition-transform`}>
                {tx.type === 'income' ? 'â†“' : 'â†‘'}
              </div>
              <div className="flex flex-col">
                <span className="text-gray-200 font-medium capitalize text-sm">
                   {tx.category}
                </span>
                <span className="text-xs text-gray-500 font-sans mt-0.5 tracking-wide">
                   {format(new Date(tx.date), 'MMM dd')}
                </span>
              </div>
            </div>
             <div className="flex flex-col items-end">
                <span className={`font-bold font-syne text-md tracking-tight ${tx.type === 'income' ? 'text-income' : 'text-expense'}`}>
                   {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                </span>
             </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
