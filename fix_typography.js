const fs = require('fs');

try {
  // 1. Update tailwind.config.js font families
  const twConfigPath = 'apps/web/tailwind.config.js';
  if (fs.existsSync(twConfigPath)) {
    let twConfig = fs.readFileSync(twConfigPath, 'utf8');
    twConfig = twConfig.replace(/sans:\s*\[\s*'Inter',\s*'sans-serif'\s*\]/g, "sans: ['var(--font-inter)', 'sans-serif']");
    twConfig = twConfig.replace(/heading:\s*\[\s*'Syne',\s*'sans-serif'\s*\]/g, "heading: ['var(--font-syne)', 'sans-serif']");
    fs.writeFileSync(twConfigPath, twConfig);
    console.log('tailwind.config.js updated');
  }

  // 2. Layout font-sans
  const layoutPath = 'apps/web/src/app/layout.js';
  if (fs.existsSync(layoutPath)) {
    let layout = fs.readFileSync(layoutPath, 'utf8');
    if (!layout.includes('font-sans') && layout.includes('antialiased')) {
      layout = layout.replace(/className="antialiased/g, 'className="font-sans antialiased');
      fs.writeFileSync(layoutPath, layout);
      console.log('layout.js updated');
    }
  }

  // 3. SummaryCard typography
  const summaryPath = 'apps/web/src/micro-apps/dashboard/components/SummaryCard.js';
  if (fs.existsSync(summaryPath)) {
    let summary = fs.readFileSync(summaryPath, 'utf8');
    summary = summary.replace(/className="text-2xl font-bold mt-2"/g, 'className="text-3xl font-heading font-extrabold mt-3 tabular-nums tracking-tight text-white mb-1"');
    summary = summary.replace(/className="text-sm font-medium"/g, 'className="text-[11px] font-bold tracking-widest uppercase text-gray-400"');
    fs.writeFileSync(summaryPath, summary);
    console.log('SummaryCard updated');
  }

  // 4. TransactionTable typography
  const tablePath = 'apps/web/src/micro-apps/transactions/components/TransactionTable.js';
  if (fs.existsSync(tablePath)) {
    let table = fs.readFileSync(tablePath, 'utf8');
    table = table.replace(/className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"/g, 'className="px-6 py-4 text-left text-[11px] font-extrabold text-gray-400 uppercase tracking-widest font-heading border-b border-border shadow-[0_1px_0_var(--color-primary-dim)\/10]"');
    table = table.replace(/className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium"/g, 'className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold tabular-nums tracking-tight font-mono text-gray-100"');
    table = table.replace(/className="text-sm font-medium text-white"/g, 'className="text-[15px] font-bold text-white font-heading tracking-tight"');
    table = table.replace(/<div className="text-xs text-gray-500">\{tx.id\}<\/div>/g, '<div className="text-[10px] text-gray-400 font-mono tracking-widest uppercase mt-0.5">{tx.id}</div>');
    fs.writeFileSync(tablePath, table);
    console.log('TransactionTable updated');
  }

  // 5. Dashboard page title
  const dashPath = 'apps/web/src/app/(auth)/dashboard/page.js';
  if (fs.existsSync(dashPath)) {
      let dash = fs.readFileSync(dashPath, 'utf8');
      dash = dash.replace(/<h1 className="text-2xl font-bold text-white mb-2">/g, '<h1 className="text-3xl font-heading font-black tracking-tight text-white mb-1">');
      fs.writeFileSync(dashPath, dash);
      console.log('Dashboard page updated');
  }

  const txPagePath = 'apps/web/src/app/(auth)/transactions/page.js';
  if (fs.existsSync(txPagePath)) {
      let dash = fs.readFileSync(txPagePath, 'utf8');
      dash = dash.replace(/<h1 className="text-2xl font-bold text-white">/g, '<h1 className="text-3xl font-heading font-black tracking-tight text-white">');
      fs.writeFileSync(txPagePath, dash);
      console.log('Transaction page updated');
  }

  const adminPath = 'apps/web/src/app/(auth)/admin/page.js';
  if (fs.existsSync(adminPath)) {
      let dash = fs.readFileSync(adminPath, 'utf8');
      dash = dash.replace(/<h1 className="text-2xl font-bold text-white mb-2">/g, '<h1 className="text-3xl font-heading font-black tracking-tight text-white mb-1">');
      fs.writeFileSync(adminPath, dash);
      console.log('Admin page updated');
  }

} catch(e) { console.error(e) }
