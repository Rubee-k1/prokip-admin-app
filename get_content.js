const fs = require('fs');
let content = fs.readFileSync('./components/AdminPerformanceView.tsx', 'utf8');

const lines = content.split('\n');
const start = lines.findIndex(l => l.includes('<div className="space-y-4">') && l.includes('10299') === false);
// Wait, to find it reliably:
const snippet = lines.slice(10298, 10444).join('\n');
fs.writeFileSync('snippet.txt', snippet);
