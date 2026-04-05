const fs = require('fs');
let code = fs.readFileSync('apps/web/src/micro-apps/dashboard/components/CategoryBreakdown.js', 'utf8');

code = code.replace(/import \{ motion \} from 'framer-motion';/, "import { motion } from 'framer-motion';\nimport { MouseGlowCard } from '@/shared/components/ui/MouseGlowCard';");

code = code.replace(/<div className="card skeleton h-\[400px\] rounded-2xl animate-pulse bg-surface\/50 border border-border\/50" \/>/g, '<div className="card skeleton h-[400px] rounded-[var(--radius-card)] animate-pulse bg-[var(--color-surface)]/50 border border-white/5" />');

code = code.replace(/className="card grid grid-cols-1 md:grid-cols-2 gap-8 py-0 px-6 rounded-2xl border border-white\/5 bg-gradient-to-br from-surface\/80 to-surface\/40 backdrop-blur-xl shadow-xl w-full h-full min-h-\[300px\] overflow-hidden"/g, 'className="h-full w-full min-h-[300px]"');

code = code.replace(/<div className="relative flex flex-col h-full pt-6">/, '<MouseGlowCard className="grid grid-cols-1 md:grid-cols-2 gap-8 py-0 px-6 rounded-[var(--radius-card)] bg-gradient-to-br from-[#0c1222]/90 to-[#131a2f]/40 w-full h-full min-h-[300px] overflow-hidden cursor-default ring-1 ring-white/5 hover:ring-[var(--color-primary)]/30 hover:shadow-[0_12px_48px_rgba(0,212,170,0.15)]">\n      <div className="relative flex flex-col h-full pt-6">');

code = code.replace(/<\/div>\n    <\/motion.div>/, '</div>\n      </MouseGlowCard>\n    </motion.div>');

fs.writeFileSync('apps/web/src/micro-apps/dashboard/components/CategoryBreakdown.js', code);
