import { Lock, PieChart as PieChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency } from '@/shared/utils/formatters';
import { motion } from 'framer-motion';
import { MouseGlowCard } from '@/shared/components/ui/MouseGlowCard';

const INCOME_COLORS = ['#00d4aa', '#00a885', '#008066', '#005e4a', '#004033'];
const EXPENSE_COLORS = ['#ef4444', '#b91c1c', '#991b1b', '#7f1d1d', '#450a0a'];

export default function CategoryBreakdown({ data, loading, locked }) {
  if (locked) {
    return (
      <div className="card relative flex flex-col items-center justify-center p-12 bg-gradient-to-br from-surface/80 to-surface/40 backdrop-blur-xl border border-white/5 rounded-2xl h-full min-h-[300px] overflow-hidden group">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none mix-blend-overlay"></div>
        <div className="w-20 h-20 bg-surface border border-border rounded-full flex items-center justify-center mb-6 shadow-2xl relative z-10 group-hover:scale-105 transition-transform duration-500">
           <Lock className="w-8 h-8 text-primary group-hover:text-white transition-colors duration-300 drop-shadow-[0_0_8px_rgba(0,212,170,0.5)]" />
        </div>
        <h3 className="text-2xl font-syne font-bold text-white mb-2 z-10 drop-shadow-md tracking-tight">Insights Locked</h3>
        <p className="text-gray-400 text-sm mt-2 text-center max-w-sm z-10 font-medium">
          Unlock the true potential of your data. Analyst access is required to view advanced category breakdowns.
        </p>
        <button className="mt-8 px-6 py-2 rounded-full border border-primary/30 text-primary text-sm font-semibold uppercase tracking-wider hover:bg-primary/10 transition-colors z-10">Request Access</button>
      </div>
    );
  }

  if (loading || !data) {
    return <div className="card skeleton h-[400px] rounded-[var(--radius-card)] animate-pulse bg-[var(--color-surface)]/50 border border-white/5" />;
  }

  const { income_by_category = [], expense_by_category = [] } = data;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface/90 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl text-sm text-white">
          <p className="font-semibold text-gray-400 capitalize text-xs tracking-widest mb-1">{payload[0].name}</p>
          <p className="font-syne font-bold text-lg">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="h-full w-full min-h-[300px]"
    >
      <MouseGlowCard className="grid grid-cols-1 md:grid-cols-2 gap-8 py-0 px-6 rounded-[var(--radius-card)] bg-gradient-to-br from-[#0c1222]/90 to-[#131a2f]/40 w-full h-full min-h-[300px] overflow-hidden cursor-default ring-1 ring-white/5 hover:ring-[var(--color-primary)]/30 hover:shadow-[0_12px_48px_rgba(0,212,170,0.15)]">
      <div className="relative flex flex-col h-full pt-6">
        <div className="flex items-center gap-3 mb-4 shrink-0 transition-opacity">
           <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
             <PieChartIcon className="w-4 h-4 text-primary" />
           </div>
           <h3 className="text-white font-syne font-bold text-lg drop-shadow-sm tracking-tight">Income Distribution</h3>
        </div>
        
        {income_by_category.length > 0 ? (
          <div className="flex-1 min-h-0 w-full flex items-center justify-center -translate-y-4">
            <ResponsiveContainer width="100%" height="100%" minHeight={200}>
              <PieChart>
                <Pie
                  data={income_by_category}
                  dataKey="total"
                  nameKey="category"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  stroke="none"
                >
                  {income_by_category.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={INCOME_COLORS[index % INCOME_COLORS.length]} style={{ filter: `drop-shadow(0px 4px 6px ${INCOME_COLORS[index % INCOME_COLORS.length]}40)` }} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#8b9dc3' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center flex-col text-gray-500 border border-white/5 rounded-xl border-dashed mb-6 min-h-[200px]">
            <p>No income data</p>
          </div>
        )}
      </div>

      <div className="relative flex flex-col h-full pt-6">
        <div className="flex items-center gap-3 mb-4 shrink-0 transition-opacity">
           <div className="w-8 h-8 rounded-lg bg-expense/10 border border-expense/20 flex items-center justify-center">
             <PieChartIcon className="w-4 h-4 text-expense" />
           </div>
           <h3 className="font-syne font-bold text-lg drop-shadow-sm tracking-tight text-white">Expense Distribution</h3>
        </div>
        
        {expense_by_category.length > 0 ? (
          <div className="flex-1 min-h-0 w-full flex items-center justify-center -translate-y-4">
            <ResponsiveContainer width="100%" height="100%" minHeight={200}>
              <PieChart>
                <Pie
                  data={expense_by_category}
                  dataKey="total"
                  nameKey="category"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  stroke="none"
                >
                  {expense_by_category.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} style={{ filter: `drop-shadow(0px 4px 6px ${EXPENSE_COLORS[index % EXPENSE_COLORS.length]}40)` }} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#8b9dc3' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center flex-col text-gray-500 border border-white/5 rounded-xl border-dashed mb-6 min-h-[200px]">
            <p>No expense data</p>
          </div>
        )}
      </div>
      </MouseGlowCard>
    </motion.div>
  );
}
