const fs = require('fs');
let code = fs.readFileSync('apps/web/src/micro-apps/dashboard/components/TrendChart.js', 'utf8');
code = code.replace(/import \{ motion \} from 'framer-motion';/, "import { motion } from 'framer-motion';\nimport { MouseGlowCard } from '@/shared/components/ui/MouseGlowCard';");
code = code.replace(/<div className="card w-full h-full min-h-\[300px\] skeleton rounded-2xl animate-pulse bg-surface\/50 border border-border\/50"><\/div>/g, '<div className="card w-full h-full min-h-[300px] skeleton rounded-2xl animate-pulse bg-[var(--color-surface)]/50 border border-white/5"></div>');
code = code.replace(/className="card p-6 rounded-2xl w-full h-full flex flex-col border border-white\/5 shadow-xl bg-gradient-to-br from-surface\/80 to-surface\/40 backdrop-blur-xl"/g, 'className="h-full w-full"');
code = code.replace(/<div className="flex items-center justify-between mb-4 shrink-0 z-10 relative">/g, '<MouseGlowCard className="p-6 rounded-[var(--radius-card)] w-full h-full flex flex-col bg-gradient-to-br from-[#0c1222]/90 to-[#131a2f]/40 cursor-default ring-1 ring-white/5 hover:ring-[var(--color-primary)]/30 hover:shadow-[0_12px_48px_rgba(0,212,170,0.15)]">\n      <div className="flex items-center justify-between mb-4 shrink-0 z-10 relative">');
code = code.replace(/<\/ResponsiveContainer>\n      <\/div>\n    <\/motion.div>/g, '</ResponsiveContainer>\n      </div>\n      </MouseGlowCard>\n    </motion.div>');
fs.writeFileSync('apps/web/src/micro-apps/dashboard/components/TrendChart.js', code);
