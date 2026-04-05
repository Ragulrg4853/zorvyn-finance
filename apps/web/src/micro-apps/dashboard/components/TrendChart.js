import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { format } from 'date-fns';
import { formatCurrency } from '@/shared/utils/formatters';
import { motion } from 'framer-motion';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface/90 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl">
        <p className="text-gray-400 text-xs tracking-widest uppercase mb-3">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-3 mb-1">
             <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
             <p style={{ color: entry.color }} className="font-semibold text-sm flex-1">
               {entry.name}
             </p>
             <p className="text-white font-syne font-bold">
               {formatCurrency(entry.value)}
             </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function TrendChart({ data, loading }) {
  if (loading) {
    return <div className="card w-full h-80 skeleton rounded-2xl animate-pulse bg-surface/50 border border-border/50"></div>;
  }

  if (!data || data.length === 0) {
    return (
      <div className="card w-full h-80 rounded-2xl flex items-center justify-center text-gray-500 border border-white/5 bg-gradient-to-br from-surface/80 to-surface/40 backdrop-blur-xl">
        <div className="text-center">
           <div className="w-12 h-12 rounded-full bg-border inline-flex items-center justify-center mb-3 text-gray-400">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18" /><path d="M18 9l-5 5-4-4-4 4" /></svg>
           </div>
           <p>No transaction data available</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="card p-6 rounded-2xl w-full border border-white/5 shadow-xl bg-gradient-to-br from-surface/80 to-surface/40 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between mb-8 z-10 relative">
        <h3 className="text-xl font-syne font-bold tracking-tight text-white drop-shadow-sm">Cash Flow Overview</h3>
        <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider">
           Growth Indicator
        </div>
      </div>
      <div style={{ width: '100%', height: 320 }} className="z-10 relative">
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-income)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--color-income)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-expense)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--color-expense)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="month" stroke="#718096" tick={{ fill: '#718096', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(dateStr) => {
              try {
                return format(new Date(dateStr + '-01'), "MMM ''yy");
              } catch {
                return dateStr;
              }
            }} />
            <YAxis stroke="#718096" tick={{ fill: '#718096', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val/1000}k`} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
            <Area type="monotone" dataKey="income" name="Income" stroke="var(--color-income)" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
            <Area type="monotone" dataKey="expense" name="Expense" stroke="var(--color-expense)" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
