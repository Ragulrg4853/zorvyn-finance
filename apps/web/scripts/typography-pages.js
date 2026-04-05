const fs = require('fs');
['dashboard', 'transactions', 'admin'].forEach(dir => {
  const p = 'apps/web/src/app/' + dir + '/page.js';
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    content = content.replace(/<h1 className="text-2xl font-bold text-white.*">/g, '<h1 className="text-3xl font-heading font-black tracking-tight text-white mb-2 leading-none">');
    fs.writeFileSync(p, content);
    console.log(p + ' updated');
  }
});
