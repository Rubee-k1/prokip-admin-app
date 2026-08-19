import fs from 'fs';
let content = fs.readFileSync('./components/AdminPerformanceView.tsx', 'utf8');

// Replace left over applyIndividualId and setApplyIndividualId etc.
content = content.replace(/setApplyIndividualId\((.*?)\);/g, '');
content = content.replace(/setEmployeeSearchQuery\((.*?)\);/g, '');
content = content.replace(/setIsEmployeeDropdownOpen\((.*?)\);/g, '');

fs.writeFileSync('./components/AdminPerformanceView.tsx', content);
