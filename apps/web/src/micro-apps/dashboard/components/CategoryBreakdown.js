import React from 'react';
import { Lock, PieChart as PieChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/shared/utils/formatters';
import { motion } from 'framer-motion';
import { MouseGlowCard } from '@/shared/components/ui/MouseGlowCard';

const INCOME_COLOR = '#22c55e'; // var(--color-income)
const EXPENSE_COLOR = '#ef4444'; // var(--color-expense)

const CategoryBreakdown = ({ summary, loading, locked }) => {
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

  if (loading || !summary) {
    return <div className="card skeleton h-[400px] rounded-[var(--radius-card)] animate-pulse bg-[var(--color-surface)]/50 border border-white/5" />;
  }

  const { total_income = 0, total_expense = 0 } = summary;
  const total = total_income + total_expense;
  
  const data = [
    { name: 'Total Income', value: total_income, color: INCOME_COLOR },
    { name: 'Total Expense', value: total_expense, color: EXPENSE_COLOR }
  ];

  const savingsRate = total > 0 ? Math.round((total_income / total) * 100) : 0;
  const incomePercent = total > 0 ? ((total_income / total) * 100).toFixed(1) : 0;
  const expensePercent = total > 0 ? ((total_expense / total) * 100).toFixed(1) : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="h-full w-full min-h-[300px]"
    >
      <MouseGlowCard className="flex flex-col py-0 px-6 rounded-[var(--radius-card)] bg-gradient-to-br from-[#0c1222]/90 to-[#131a2f]/40 w-full h-full min-h-[300px] overflow-hidden cursor-default ring-1 ring-white/5 hover:ring-[var(--color-primary)]/30 hover:shadow-[0_12px_48px_rgba(0,212,170,0.15)]">
      <div className="relative flex flex-col h-full pt-6 w-full items-center justify-center">
        <div className="flex items-center gap-3 mb-2 w-full shrink-0">
           <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
             <PieChartIcon className="w-4 h-4 text-primary" />
           </div>
           <h3 className="text-white font-syne font-bold text-lg drop-shadow-sm tracking-tight w-full text-left">Expense vs Income Distribution</h3>
        </div>
        
        {total > 0 ? (
          <>
            <div className="flex-1 w-full flex items-center justify-center relative min-h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    stroke="none"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} style={{ filter: `drop-shadow(0px 4px 6px ${entry.color}40)` }} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
                <span className="text-3xl font-syne font-bold text-white tracking-tighter">{savingsRate}%</span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold mt-1">Savings Rate</span>
              </div>
            </div>
            
            <div className="w-full flex justify-center gap-6 mt-4 mb-6 pt-4 border-t border-white/5">
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: INCOME_COLOR }} />
                  <span className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Income</span>
                </div>
                <span className="text-white font-syne font-bold">{formatCurrency(total_income)} <span className="text-gray-500 text-xs font-mono ml-1">({incomePercent}%)</span></span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: EXPENSE_COLOR }} />
                  <span className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Expense</span>
                </div>
                <span className="text-white font-syne font-bold">{formatCurrency(total_expense)} <span className="text-gray-500 text-xs font-mono ml-1">({expensePercent}%)</span></span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 w-full flex items-center justify-center flex-col text-gray-500 border border-white/5 rounded-xl border-dashed mb-6 py-12">
            <p>No transaction data</p>
          </div>
        )}
      </div>
      </MouseGlowCard>
    </motion.div>
  );
}

export default React.memo(CategoryBreakdown);
