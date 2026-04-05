const fs = require('fs');

// 1. Update tailwind.config.js font families
const twConfigPath = 'apps/web/tailwind.config.js';
if (fs.existsSync(twConfigPath)) {
  let twConfig = fs.readFileSync(twConfigPath, 'utf8');
  twConfig = twConfig.replace(/sans:\s*\[\s*'Inter',\s*'sans-serif'\s*\]/g, "sans: ['var(--font-inter)', 'sans-serif']");
  twConfig = twConfig.replace(/heading:\s*\[\s*'Syne',\s*'sans-serif'\s*\]/g, "heading: ['var(--font-syne)', 'sans-serif']");
  fs.writeFileSync(twConfigPath, twConfig);
  console.log('tailwind updated');
}

// 2. Layout font-sans
const layoutPath = 'apps/web/src/app/layout.js';
if (fs.existsSync(layoutPath)) {
  let layout = fs.readFileSync(layoutPath, 'utf8');
  layout = layout.replace(/className="antialiased bg-\[#0a0f1e\]/g, 'className="font-sans antialiased bg-[#0a0f1e]');
  fs.writeFileSync(layoutPath, layout);
  console.log('layout updated');
}

// 3. Stats / Data typography
const summaryPath = 'apps/web/src/micro-apps/dashboard/components/SummaryCard.js';
if (fs.existsSync(summaryPath)) {
  let summary = fs.readFileSync(summaryPath, 'utf8');
  summary = summary.replace(/className="text-2xl font-bold mt-2"/g, 'className="text-3xl font-heading mt-3 tabular-nums tracking-tight font-black text-white"');
  summary = summary.replace(/className="text-sm font-medium"/g, 'className="text-[11px] font-bold tracking-widest uppercase text-gray-400"');
  fs.writeFileSync(summaryPath, summary);
  console.log('SummaryCard updated');
}

// 4. TransactionTable typography
const tablePath = 'apps/web/src/micro-apps/transactions/components/TransactionTable.js';
if (fs.existsSync(tablePath)) {
  let table = fs.readFileSync(tablePath, 'utf8');
  table = table.replace(/className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"/g, 'className="px-6 py-4 text-left text-[11px] font-extrabold text-gray-400 uppercase tracking-widest font-heading"');
  table = table.replace(/<td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">/g, '<td className="px-6 py-4 whitespace-nowrap text-[15px] text-right font-semibold tabular-nums tracking-tight font-mono text-gray-100">');
  table = table.replace(/className="text-sm font-medium text-white"/g, 'className="text-[15px] font-bold text-white font-heading tracking-tight"');
  table = table.replace(/<div className="text-xs text-gray-500">\{tx.id\}<\/div>/g, '<div className="text-[10px] text-gray-400 font-mono tracking-widest uppercase mt-0.5">{tx.id}</div>');
  fs.writeFileSync(tablePath, table);
  console.log('TransactionTable updated');
}

// 5. UserTable typography
const userTablePath = 'apps/web/src/micro-apps/admin/components/UserTable.js';
if (fs.existsSync(userTablePath)) {
    let uTable = fs.readFileSync(userTablePath, 'utf8');
    uTable = uTable.replace(/className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"/g, 'className="px-6 py-4 text-left text-[11px] font-extrabold text-gray-400 uppercase tracking-widest font-heading"');
    uTable = uTable.replace(/className="text-sm font-medium text-white"/g, 'className="text-[15px] font-bold text-white font-heading tracking-tight"');
    fs.writeFileSync(userTablePath, uTable);
    console.log('UserTable updated');
}

// 6. Page Headings
const pagePaths = [
    'apps/web/src/app/(auth)/dashboard/page.js',
    'apps/web/src/app/(auth)/transactions/page.js',
    'apps/web/src/app/(auth)/admin/page.js',
];
pagePaths.forEach(p => {
    if (fs.existsSync(p)) {
        let pContent = fs.readFileSync(p, 'utf8');
        pContent = pContent.replace(/<h1 className="text-2xl font-bold text-white( mb-2)?"/g, '<h1 className="text-3xl font-heading font-black tracking-tight text-white mb-1"');
        fs.writeFileSync(p, pContent);
        console.log(p + ' updated');
    }
});