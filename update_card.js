const fs = require('fs');
let text = fs.readFileSync('apps/web/src/micro-apps/dashboard/components/SummaryCard.js', 'utf8');

text = text.replace(/const icons = \{[\s\S]*?};/, \const icons = {
  income: <TrendingUp className="text-[var(--color-income)]" size={28} />,
  expense: <TrendingDown className="text-[var(--color-expense)]" size={28} />,
  net: <Scale className="text-[var(--color-primary)]" size={28} />,
  activity: <Activity className="text-gray-400" size={28} />
};\);

text = text.replace(/import \{ useCountUp \}.*;/, \import { useCountUp } from '../../../shared/lib/useCountUp';\nimport { MouseGlowCard } from '@/shared/components/ui/MouseGlowCard';\);

text = text.replace(/export default function SummaryCard[\s\S]*/, \export default function SummaryCard({ title, value, type, trend, delay, loading }) {
  if (loading) {
    return <div className="card skeleton h-[140px] rounded-2xl animate-pulse border border-white/5 bg-surface/50"></div>;
  }

  const numericValue = typeof value === 'string' ? parseFloat(value) : (value || 0);
  const displayValue = useCountUp(numericValue, { duration: 1200, easing: 'easeOut' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <MouseGlowCard className="group h-full flex flex-col p-6 bg-gradient-to-br from-[#0c1222]/90 to-[#131a2f]/40 transition-all duration-500 cursor-default hover:shadow-[0_12px_48px_rgba(0,212,170,0.15)] ring-1 ring-white/5 hover:ring-[var(--color-primary)]/30">
        <div className="flex flex-row justify-between items-center mb-4 z-10">
          <h3 className="text-gray-500 font-inter font-medium text-xs tracking-[0.2em] uppercase">{title}</h3>
          <div className="p-2.5 rounded-xl bg-black/40 ring-1 ring-white/5 shadow-inner group-hover:bg-black/60 group-hover:scale-110 group-hover:ring-[var(--color-primary)]/30 transition-all duration-500">
             {icons[type] || icons.activity}
          </div>
        </div>
        <div className="flex flex-col items-start justify-end flex-1 z-10">
           <span className={\\\	ext-3xl md:text-[2.2rem] leading-none font-extrabold font-syne tracking-tight drop-shadow-md transition-colors duration-500 \\\\}>
              {type !== 'activity' ? formatCurrency(displayValue) : Math.round(displayValue)}
           </span>
           {trend !== undefined && (
              <div className="mt-3 flex items-center gap-2 z-10 cursor-default">
                <span className={\\\inline-flex items-center text-[11px] py-1 px-2.5 rounded-md font-bold uppercase tracking-wider shadow-sm border \\\\}>
                    <span className="mr-1">{trend >= 0 ? '+' : ''}{trend}%</span>
                </span>
                <span className="text-[11px] text-gray-500 font-medium tracking-wide">vs last month</span>
              </div>
           )}
        </div>
      </MouseGlowCard>
    </motion.div>
  );
}\);

fs.writeFileSync('apps/web/src/micro-apps/dashboard/components/SummaryCard.js', text);
