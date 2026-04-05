const fs = require('fs');
let code = fs.readFileSync('apps/web/src/micro-apps/transactions/components/TransactionFilters.js', 'utf8');

code = code.replace(/<div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 p-3 bg-\[rgba\(10,15,30,0\.6\)\] border border-\[var\(--color-border\)\] rounded-xl backdrop-blur-md shadow-lg w-full">/g, 
  '<div className="flex flex-col sm:flex-row flex-wrap items-center justify-between gap-3 p-2 bg-[#0c1222]/80 border border-white/5 rounded-[var(--radius-input)] backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.4)] w-full ring-1 ring-white/5 relative z-10 transition-all hover:ring-[var(--color-primary)]/20">');

code = code.replace(/<div className="flex items-center gap-2 px-2 text-\[var\(--color-primary\)\]">/g, '<div className="flex items-center gap-2 px-3 text-[var(--color-primary)]">');

code = code.replace(/className="w-full h-9 pl-9 pr-3 bg-white\/5 border border-white\/10 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-\[var\(--color-primary\)\] focus:ring-1 focus:ring-\[var\(--color-primary\)\] transition-all"/g,
  'className="w-full h-10 pl-9 pr-3 bg-transparent border-none text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-0 transition-all font-medium"');

code = code.replace(/className="h-9 w-\[110px\] bg-white\/5 border border-white\/10 rounded-lg text-sm text-gray-200 focus:outline-none focus:border-\[var\(--color-primary\)\] focus:ring-1 focus:ring-\[var\(--color-primary\)\] transition-all cursor-pointer appearance-none px-3"/g,
  'className="h-10 w-[110px] bg-transparent border-none text-sm font-medium text-gray-300 focus:outline-none focus:ring-0 transition-all cursor-pointer appearance-none px-3 hover:text-white"');

code = code.replace(/className="w-full h-9 px-3 bg-white\/5 border border-white\/10 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-\[var\(--color-primary\)\] focus:ring-1 focus:ring-\[var\(--color-primary\)\] transition-all"/g,
  'className="w-full h-10 px-3 bg-transparent border-none text-sm font-medium text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-0 transition-all"');

code = code.replace(/className="flex items-center gap-2 bg-white\/5 border border-white\/10 rounded-lg px-2 h-9"/g,
  'className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-md px-3 h-8 shadow-inner"');

code = code.replace(/<div className="h-6 w-\[1px\] bg-\[var\(--color-border\)\] hidden sm:block mx-1"><\/div>/g,
  '<div className="h-5 w-[1px] bg-white/10 hidden sm:block mx-1"></div>');

code = code.replace(/<div className="relative flex-1 min-w-\[150px\]">/g,
  '<div className="relative flex-1 min-w-[200px] flex items-center bg-white/5 rounded-md border border-white/5 focus-within:border-[var(--color-primary)]/50 focus-within:bg-black/40 transition-colors h-10 overflow-hidden">');

code = code.replace(/<Search className="absolute left-3 top-1\/2 -translate-y-1\/2 text-gray-500" size={16} \/>/g,
  '<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--color-primary)] transition-colors" size={18} />');

code = code.replace(/<div className="relative w-\[130px\]">/g, 
  '<div className="relative w-[140px] bg-white/5 rounded-md border border-white/5 focus-within:border-[var(--color-primary)]/50 h-10 overflow-hidden">');

code = code.replace(/<select\n/g, '<select\n');

code = code.replace(/className="h-10 w-\[110px\] bg-transparent border-none text-sm font-medium text-gray-300 focus:outline-none focus:ring-0 transition-all cursor-pointer appearance-none px-3 hover:text-white"/g,
  'className="h-10 w-[110px] bg-white/5 border border-white/5 rounded-md text-sm font-medium text-gray-300 focus:outline-none focus:border-[var(--color-primary)]/50 transition-all cursor-pointer appearance-none px-3 hover:text-white"');

fs.writeFileSync('apps/web/src/micro-apps/transactions/components/TransactionFilters.js', code);
