import fs from 'fs';
let content = fs.readFileSync('./components/AdminPerformanceView.tsx', 'utf8');

const target = `  const handleApplyTemplateToEmployees = () => {
    if (!applyingTemplate) return;

    let count = 0;
    const updated = employees.map((emp) => {
      let shouldApply = false;

      if (applyIndividualId) {
        shouldApply = emp.id === applyIndividualId;
      } else {
        const isManager =
          emp.role.toLowerCase().includes("manager") ||
          emp.role.toLowerCase().includes("lead") ||
          emp.role.toLowerCase().includes("director") ||
          emp.role.toLowerCase().includes("admin") ||
          emp.is_team_lead === true;

        if (applyTargetType === "manager") {
          shouldApply = isManager;
        } else if (applyTargetType === "members") {
          shouldApply = !isManager;
        }
      }

      if (shouldApply) {`;

const replacement = `  const handleApplyTemplateToEmployees = () => {
    if (!applyingTemplate) return;

    if (applySelectedEmpIds.length === 0) {
      showError("Please select at least one employee.");
      return;
    }

    let count = 0;
    const updated = employees.map((emp) => {
      let shouldApply = applySelectedEmpIds.includes(emp.id);

      if (shouldApply) {`;

content = content.replace(target, replacement);

// And wait, we also need to change the width of the modal so it fits the new larger table, and make the header text bolder as requested.
// We have: className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
// Change it to max-w-5xl (like the bulk assigner).
// And the text: <span className="font-extrabold text-xs uppercase tracking-wider text-[#02275A] font-mono">
// Let's make it text-sm to make it stand out more ("a little bit bolder").

content = content.replace(
  'className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"',
  'className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]"'
);

content = content.replace(
  '<span className="font-extrabold text-xs uppercase tracking-wider text-[#02275A] font-mono">\n                  assign to performance\n                </span>',
  '<span className="font-black text-sm uppercase tracking-wider text-[#02275A] font-sans">\n                  Assign to Staff\n                </span>'
);

fs.writeFileSync('./components/AdminPerformanceView.tsx', content);
console.log("Replaced handleApplyTemplateToEmployees");
