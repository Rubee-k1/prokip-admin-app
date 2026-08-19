import fs from 'fs';
let content = fs.readFileSync('./components/AdminPerformanceView.tsx', 'utf8');

const lines = content.split('\n');

// find "const handleApplyTemplateToEmployees = () => {"
const startIndex = lines.findIndex(l => l.includes('const handleApplyTemplateToEmployees = () => {'));
// find "if (shouldApply) {" after that
const endIndex = lines.findIndex((l, i) => i > startIndex && l.includes('      if (shouldApply) {'));

console.log('Start', startIndex, 'End', endIndex);

const newLines = [
  '  const handleApplyTemplateToEmployees = () => {',
  '    if (!applyingTemplate) return;',
  '',
  '    if (applySelectedEmpIds.length === 0) {',
  '      showError("Please select at least one employee.");',
  '      return;',
  '    }',
  '',
  '    let count = 0;',
  '    const updated = employees.map((emp) => {',
  '      let shouldApply = applySelectedEmpIds.includes(emp.id);',
  '',
  '      if (shouldApply) {'
];

lines.splice(startIndex, endIndex - startIndex + 1, ...newLines);
fs.writeFileSync('./components/AdminPerformanceView.tsx', lines.join('\n'));
