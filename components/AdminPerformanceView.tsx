import React, { useState, useMemo, useEffect } from "react";
import { useAlert } from "../contexts/AlertContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import AdminHRCenterView, {
  initialEmployees,
  Employee,
  EmployeeKPI,
  normalizeEmployeesList,
  GradeAuditEntry,
} from "./AdminHRCenterView";
import { AdminLeaveRequestsView } from "./AdminLeaveRequestsView";
import PerformanceReportsSubView from "./PerformanceReportsSubView";

export const getWeeksInMonth = (yearStr: string | number, monthName: string | number): number => {
  const year = typeof yearStr === "number" ? yearStr : parseInt(String(yearStr), 10) || 2026;
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const monthIndex = typeof monthName === "number" ? monthName : months.indexOf(String(monthName));
  if (monthIndex === -1) return 4;

  const firstDay = new Date(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0);
  const firstDayOfWeek = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const weeks = Math.ceil((totalDays + firstDayOfWeek) / 7);
  return Math.min(5, Math.max(4, weeks));
};

// Role-specific KPIs structures based on user specifications
export interface KpiTemplate {
  id: string;
  name: string;
  type:
    | "Target-Based"
    | "Percentage"
    | "Deductive"
    | "Binary"
    | "Achievement"
    | "Reverse Achievement"
    | "Ratio"
    | "Rating";
  weight: number;
  currentValue: number;
  targetValue: number;
  unit: string;
  maxWeightRange: number; // max weight is 80% for all combined
}

export interface TemplateKpiItem {
  id: string;
  name: string;
  type:
    | "Target-Based"
    | "Percentage"
    | "Deductive"
    | "Binary"
    | "Achievement"
    | "Reverse Achievement"
    | "Ratio"
    | "Rating";
  weight: number;
  targetValue: number;
  unit: string;
  capValue: number;
  validationRule: string; // Dynamic validation rules
}

export interface TemplateConductItem {
  id: string;
  name: string;
  type: "Percentage" | "Binary";
  weight: number;
  targetValue: number;
  unit: string;
}

export interface PerformanceGrade {
  id: string;
  minScore: number;
  maxScore: number;
  letter: string;
  label: string;
  actionMessage: string;
  colorClass: string;
}

export interface RewardTypeOption {
  type: string;
  points: number;
}

export interface ManualUploadRow {
  employeeId: string;
  type: "performance" | "bonus" | "penalty";
  points: number;
  reason: string;
}

export const DEFAULT_GRADING_SYSTEM: PerformanceGrade[] = [
  {
    id: "g1",
    minScore: 90,
    maxScore: 100,
    letter: "A",
    label: "Excellent",
    actionMessage: "Bonus, promotion, recognition",
    colorClass: "text-emerald-800 bg-emerald-50 border-emerald-200",
  },
  {
    id: "g2",
    minScore: 80,
    maxScore: 89,
    letter: "B",
    label: "Very Good",
    actionMessage: "Good performer",
    colorClass: "text-blue-800 bg-blue-50 border-blue-200",
  },
  {
    id: "g3",
    minScore: 70,
    maxScore: 79,
    letter: "C",
    label: "Meets Expectations",
    actionMessage: "Normal performer",
    colorClass: "text-yellow-800 bg-yellow-50 border-yellow-200",
  },
  {
    id: "g4",
    minScore: 60,
    maxScore: 69,
    letter: "D",
    label: "Needs Improvement",
    actionMessage: "Improvement plan",
    colorClass: "text-orange-800 bg-orange-50 border-orange-200",
  },
  {
    id: "g5",
    minScore: 0,
    maxScore: 59,
    letter: "E",
    label: "Poor Performance",
    actionMessage: "Performance review or disciplinary action",
    colorClass: "text-red-800 bg-red-50 border-red-200",
  },
];

export const OPTIONAL_STRONGER_GRADING: PerformanceGrade[] = [
  {
    id: "g1_opt",
    minScore: 95,
    maxScore: 100,
    letter: "A+",
    label: "Outstanding",
    actionMessage: "Bonus, promotion, recognition",
    colorClass: "text-emerald-800 bg-emerald-50 border-emerald-200",
  },
  {
    id: "g2_opt",
    minScore: 90,
    maxScore: 94,
    letter: "A",
    label: "Excellent",
    actionMessage: "Bonus, promotion, recognition",
    colorClass: "text-emerald-700 bg-emerald-50 border-emerald-200",
  },
  {
    id: "g3_opt",
    minScore: 80,
    maxScore: 89,
    letter: "B",
    label: "Very Good",
    actionMessage: "Good performer",
    colorClass: "text-blue-800 bg-blue-50 border-blue-200",
  },
  {
    id: "g4_opt",
    minScore: 70,
    maxScore: 79,
    letter: "C",
    label: "Meets Expectations",
    actionMessage: "Normal performer",
    colorClass: "text-yellow-800 bg-yellow-50 border-yellow-200",
  },
  {
    id: "g5_opt",
    minScore: 60,
    maxScore: 69,
    letter: "D",
    label: "Needs Improvement",
    actionMessage: "Improvement plan",
    colorClass: "text-orange-800 bg-orange-50 border-orange-200",
  },
  {
    id: "g6_opt",
    minScore: 0,
    maxScore: 59,
    letter: "E",
    label: "Poor",
    actionMessage: "Performance review or disciplinary action",
    colorClass: "text-red-800 bg-red-50 border-red-200",
  },
];

export const findGrade = (
  score: number,
  system: PerformanceGrade[],
): PerformanceGrade => {
  return (
    system.find((g) => score >= g.minScore && score <= g.maxScore) ||
    system[system.length - 1]
  );
};

export interface CompanyWideConduct {
  id: string;
  name: string;
  description: string;
  points: number;
  department?: string;
  employeeType?: string;
  applicableTo?: "All" | "Manager" | "Ordinary" | "None";
}

export interface AppPerformanceSettings {
  gradingSystem?: PerformanceGrade[];
  companyWideConducts?: CompanyWideConduct[];
  excellentMin: number;
  veryGoodMin: number;
  meetsExpectationsMin: number;
  needsImprovementMin: number;
  roleWeightLimit: number;
  conductWeightLimit: number;
  kpiCapLimit: number;
  punctualityDesc: string;
  collaborationDesc: string;
  communicationDesc: string;
  complianceDesc: string;
  seriousViolationCap: number;
  milestoneRewardPoints: number;
  heroAwardPoints: number;
  engineMode: "Standard Linear" | "Strict Geometric" | "Optimistic Capped";
  precisionDecimals: number;
}

export const DEFAULT_PERF_SETTINGS: AppPerformanceSettings = {
  gradingSystem: DEFAULT_GRADING_SYSTEM,
  companyWideConducts: [
    {
      id: "cwc1",
      name: "Punctuality",
      description:
        "Regularity, on-time morning sign-ins, prompt meeting attendance.",
      points: 5,
    },
    {
      id: "cwc2",
      name: "Collaboration",
      description: "Willingness to assist peers, active knowledge transfer.",
      points: 5,
    },
    {
      id: "cwc3",
      name: "Communication",
      description: "Response speed of task updates, polite etiquette.",
      points: 5,
    },
    {
      id: "cwc4",
      name: "Compliance",
      description: "On-time submission of timesheets, reports precision.",
      points: 5,
    },
  ],
  excellentMin: 90,
  veryGoodMin: 80,
  meetsExpectationsMin: 70,
  needsImprovementMin: 60,
  roleWeightLimit: 80,
  conductWeightLimit: 20,
  kpiCapLimit: 120,
  punctualityDesc:
    "Regularity, on-time morning sign-ins, prompt meeting attendance, and proactive scheduling of leaves.",
  collaborationDesc:
    "Willingness to assist peers, active knowledge transfer, sharing resources, and backing up desk colleagues.",
  communicationDesc:
    "Response speed of task updates, polite etiquette, standard documentation clarity, and transparency.",
  complianceDesc:
    "On-time submission of timesheets, reports precision, respecting administrative directives, and tool hygiene.",
  seriousViolationCap: 50,
  milestoneRewardPoints: 5,
  heroAwardPoints: 15,
  engineMode: "Standard Linear",
  precisionDecimals: 0,
};

export const checkConductPointsBudget = (
  conducts: CompanyWideConduct[]
): { isValid: boolean; maxPoints: number; details?: string } => {
  const depts = Array.from(new Set([
    "All", "Sales", "Marketing", "Customer Experience", "Human Resources", "Customer Support", "Finance",
    ...conducts.map(c => c.department).filter(Boolean)
  ])) as string[];

  const types = Array.from(new Set([
    "All", "Full-Time", "Part-Time", "Contract", "Agent",
    ...conducts.map(c => c.employeeType).filter(Boolean)
  ])) as string[];

  const groups = Array.from(new Set([
    "All", "Manager", "Ordinary",
    ...conducts.map(c => c.applicableTo).filter(Boolean)
  ])) as string[];

  let maxPoints = 0;
  let worstDetails = "";

  const getPointsForSubset = (dept: string, type: string, group: string) => {
    return conducts.reduce((sum, c) => {
      const deptMatch = !c.department || c.department === "All" || c.department === dept;
      const typeMatch = !c.employeeType || c.employeeType === "All" || c.employeeType === type;
      const groupMatch = !c.applicableTo || c.applicableTo === "All" || c.applicableTo === group;

      if (deptMatch && typeMatch && groupMatch) {
        return sum + c.points;
      }
      return sum;
    }, 0);
  };

  // Check every permutation of concrete values (excluding "All")
  for (const dept of depts) {
    if (dept === "All") continue;
    for (const type of types) {
      if (type === "All") continue;
      for (const group of groups) {
        if (group === "All") continue;

        const sum = getPointsForSubset(dept, type, group);
        if (sum > 20) {
          const groupName = group === "Manager" ? "Managers & Leads" : group === "Ordinary" ? "Ordinary Staff" : group;
          return {
            isValid: false,
            maxPoints: sum,
            details: `${dept} | ${type} | ${groupName} (sum: ${sum} pts)`
          };
        }
        if (sum > maxPoints) {
          maxPoints = sum;
          const groupName = group === "Manager" ? "Managers" : group === "Ordinary" ? "Ordinary Staff" : group;
          worstDetails = `${dept} | ${type} | ${groupName}`;
        }
      }
    }
  }

  // Also verify general "All" fallback cases
  const generalSum = conducts.reduce((sum, c) => {
    const isAllDept = !c.department || c.department === "All";
    const isAllType = !c.employeeType || c.employeeType === "All";
    const isAllGroup = !c.applicableTo || c.applicableTo === "All";
    if (isAllDept && isAllType && isAllGroup) {
      return sum + c.points;
    }
    return sum;
  }, 0);

  if (generalSum > 20) {
    return {
      isValid: false,
      maxPoints: generalSum,
      details: `Global standard rules (sum: ${generalSum} pts)`
    };
  }

  return { 
    isValid: true, 
    maxPoints: Math.max(maxPoints, generalSum),
    details: worstDetails || "All Employees"
  };
};

export interface PerformanceTemplate {
  id: string;
  name: string;
  role_id: string; // e.g. Marketer, Sales representative, Engineer
  department_id: string; // e.g. Marketing, Sales, Engineering, etc.
  month?: string; // Assigned Month (e.g. "July", "August", "All Months")
  year?: string; // Assigned Year (e.g. "2026", "2027", "All Years")
  teamMonthlyTarget?: number; // e.g. 60,000,000
  teamMembersCount?: number; // e.g. 10
  individualMonthlyTarget?: number; // e.g. 6,000,000
  performance_weight_limit: number; // Role performance limit (typically 80)
  conduct_weight_limit: number; // Company-wide conduct limit (typically 20)
  description: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  kpiItems: TemplateKpiItem[];
  conductCategories: TemplateConductItem[];
  is_active: boolean;
  is_manager_template?: boolean;
  manager_template_type?: "regular" | "cumulative";
  linked_template_id?: string;
  linked_template_ids?: string[];
}

const ROLE_KPINAMES_TEMPLATES: Record<string, KpiTemplate[]> = {
  marketer: [
    {
      id: "mk-1",
      name: "Leads generated",
      type: "Target-Based",
      weight: 25,
      currentValue: 120,
      targetValue: 150,
      unit: "leads",
      maxWeightRange: 80,
    },
    {
      id: "mk-2",
      name: "Cost per lead",
      type: "Deductive",
      weight: 20,
      currentValue: 12,
      targetValue: 10,
      unit: "$",
      maxWeightRange: 80,
    },
    {
      id: "mk-3",
      name: "Qualified lead rate",
      type: "Percentage",
      weight: 20,
      currentValue: 72,
      targetValue: 100,
      unit: "%",
      maxWeightRange: 80,
    },
    {
      id: "mk-4",
      name: "Campaign conversion",
      type: "Percentage",
      weight: 15,
      currentValue: 4.8,
      targetValue: 100,
      unit: "%",
      maxWeightRange: 80,
    },
  ],
  sales: [
    {
      id: "sl-1",
      name: "Revenue achieved",
      type: "Target-Based",
      weight: 35,
      currentValue: 42000,
      targetValue: 50000,
      unit: "$",
      maxWeightRange: 80,
    },
    {
      id: "sl-2",
      name: "Deals closed",
      type: "Target-Based",
      weight: 25,
      currentValue: 7,
      targetValue: 10,
      unit: "deals",
      maxWeightRange: 80,
    },
    {
      id: "sl-3",
      name: "Conversion rate",
      type: "Percentage",
      weight: 20,
      currentValue: 15,
      targetValue: 100,
      unit: "%",
      maxWeightRange: 80,
    },
  ],
  support: [
    {
      id: "sp-1",
      name: "SLA compliance",
      type: "Percentage",
      weight: 20,
      currentValue: 96,
      targetValue: 100,
      unit: "%",
      maxWeightRange: 80,
    },
    {
      id: "sp-2",
      name: "First response rate",
      type: "Percentage",
      weight: 20,
      currentValue: 92,
      targetValue: 100,
      unit: "%",
      maxWeightRange: 80,
    },
    {
      id: "sp-3",
      name: "Resolution rate",
      type: "Percentage",
      weight: 20,
      currentValue: 85,
      targetValue: 100,
      unit: "%",
      maxWeightRange: 80,
    },
    {
      id: "sp-4",
      name: "CSAT",
      type: "Target-Based",
      weight: 20,
      currentValue: 4.6,
      targetValue: 5.0,
      unit: "★",
      maxWeightRange: 80,
    },
  ],
  engineer: [
    {
      id: "eg-1",
      name: "Engineering deductions",
      type: "Deductive",
      weight: 20,
      currentValue: 8,
      targetValue: 0,
      unit: "incidents",
      maxWeightRange: 80,
    },
    {
      id: "eg-2",
      name: "Delivery quality",
      type: "Percentage",
      weight: 20,
      currentValue: 94,
      targetValue: 100,
      unit: "%",
      maxWeightRange: 80,
    },
    {
      id: "eg-3",
      name: "Bug impact",
      type: "Deductive",
      weight: 20,
      currentValue: 12,
      targetValue: 0,
      unit: "bugs",
      maxWeightRange: 80,
    },
    {
      id: "eg-4",
      name: "Sprint commitment",
      type: "Binary",
      weight: 20,
      currentValue: 1,
      targetValue: 1,
      unit: "code",
      maxWeightRange: 80,
    },
  ],
  cxsuccess: [
    {
      id: "cs-1",
      name: "Renewal Revenue",
      type: "Target-Based",
      weight: 20,
      currentValue: 14500,
      targetValue: 15000,
      unit: "$",
      maxWeightRange: 80,
    },
    {
      id: "cs-2",
      name: "Retention Rate",
      type: "Percentage",
      weight: 15,
      currentValue: 93,
      targetValue: 100,
      unit: "%",
      maxWeightRange: 80,
    },
    {
      id: "cs-3",
      name: "Expansion Revenue",
      type: "Target-Based",
      weight: 15,
      currentValue: 3800,
      targetValue: 5000,
      unit: "$",
      maxWeightRange: 80,
    },
    {
      id: "cs-4",
      name: "Customer Health Score",
      type: "Percentage",
      weight: 15,
      currentValue: 88,
      targetValue: 100,
      unit: "pts",
      maxWeightRange: 80,
    },
    {
      id: "cs-5",
      name: "Product Adoption",
      type: "Percentage",
      weight: 15,
      currentValue: 76,
      targetValue: 100,
      unit: "%",
      maxWeightRange: 80,
    },
  ],
};

// Global Company-Wide Conduct KPIs (always make up the remaining 20% weight)
const CORE_KPIS_TEMPLATES: KpiTemplate[] = [
  {
    id: "core-1",
    name: "Punctuality & Attendance",
    type: "Percentage",
    weight: 5,
    currentValue: 95,
    targetValue: 100,
    unit: "%",
    maxWeightRange: 20,
  },
  {
    id: "core-2",
    name: "Team Player & Collaboration",
    type: "Binary",
    weight: 5,
    currentValue: 1,
    targetValue: 1,
    unit: "yes/no",
    maxWeightRange: 20,
  },
  {
    id: "core-3",
    name: "Communication Adeptness",
    type: "Percentage",
    weight: 5,
    currentValue: 85,
    targetValue: 100,
    unit: "%",
    maxWeightRange: 20,
  },
  {
    id: "core-4",
    name: "Administrative Compliance",
    type: "Percentage",
    weight: 5,
    currentValue: 90,
    targetValue: 100,
    unit: "%",
    maxWeightRange: 20,
  },
];

export function getRoleCategory(
  role: string,
  department: string,
): "marketer" | "sales" | "support" | "engineer" | "cxsuccess" {
  const rLower = (role || "").toLowerCase();
  const dLower = (department || "").toLowerCase();

  if (rLower.includes("market") || dLower.includes("market")) return "marketer";
  if (rLower.includes("success") || dLower.includes("success"))
    return "cxsuccess";
  if (
    rLower.includes("engineer") ||
    dLower.includes("engineer") ||
    rLower.includes("develop") ||
    dLower.includes("product") ||
    dLower.includes("tech")
  )
    return "engineer";

  // Customer care or CX staff is Support
  if (
    rLower.includes("support") ||
    dLower.includes("support") ||
    dLower.includes("cx") ||
    rLower.includes("call") ||
    rLower.includes("customer-success") ||
    rLower.includes("agent")
  ) {
    return "support";
  }
  if (rLower.includes("sales") || dLower.includes("sales")) {
    return "sales";
  }

  return "support"; // fallback default
}

export function getEmployeeMatchedTemplateId(
  emp: any,
  templates: any[]
): string | undefined {
  if (emp.applied_template_id) return emp.applied_template_id;

  const empRoleLower = (emp.role || "").toLowerCase();
  const empDeptLower = (emp.department || "").toLowerCase();

  // Explicit case: auto map marketing cumulative template to marketing manager or marketing lead
  if (empDeptLower === "marketing" && (empRoleLower.includes("manager") || empRoleLower.includes("lead") || empRoleLower.includes("director"))) {
    const marketingCumulativeTmpl = templates.find((t) => {
      const tName = (t.name || "").toLowerCase();
      const tRole = (t.role_id || "").toLowerCase();
      const tDept = (t.department_id || "").toLowerCase();
      const isMarketingDept = tDept === "marketing" || tDept.split(",").some(d => d.trim() === "marketing");
      const isCumulative = tName.includes("cumulative") || tRole.includes("cumulative") || (t.is_manager_template && t.manager_template_type === "cumulative");
      return isMarketingDept && isCumulative;
    });
    if (marketingCumulativeTmpl) return marketingCumulativeTmpl.id;
  }

  const tmpl = templates.find((t) => {
    const deptMatch = (t.department_id || "").toLowerCase().split(",").map((d: string) => d.trim()).some((d: string) => d === (emp.department || "").toLowerCase());
    const roleMatch = (t.role_id || "").toLowerCase().split(",").map((r: string) => r.trim()).some((r: string) => r === (emp.role || "").toLowerCase() || (emp.role || "").toLowerCase().includes(r) || r.includes((emp.role || "").toLowerCase()));
    return deptMatch && roleMatch;
  });
  if (tmpl) return tmpl.id;

  // Fallback: match by department and category
  const empCat = getRoleCategory(emp.role || "", emp.department || "");
  const catTmpl = templates.find((t) => {
    const tCat = getRoleCategory(t.role_id || t.name || "", t.department_id || "");
    const deptMatch = (t.department_id || "").toLowerCase().split(",").map((d: string) => d.trim()).some((d: string) => d === (emp.department || "").toLowerCase());
    return deptMatch && empCat === tCat;
  });
  return catTmpl?.id;
}

// Flexible unified mathematics engine purely based on KPI type
export function calculateKPIContribution(
  kpi: EmployeeKPI | KpiTemplate,
): number {
  const { type, weight, currentValue, targetValue, name } = kpi;
  let scoreMultiplier = 0;

  const ratingNames = [
    "leadership",
    "teamwork",
    "communication",
    "ownership",
    "problem-solving",
    "documentation quality",
    "initiative",
    "culture fit",
  ];

  const isRating =
    type === "Rating" ||
    ratingNames.includes((name || "").toLowerCase().trim());

  if (isRating) {
    const maxRating = targetValue > 0 ? targetValue : 5;
    const ratingGiven = currentValue;
    const ratingPercent = ratingGiven / maxRating;
    scoreMultiplier = Math.min(1.0, Math.max(0, ratingPercent));
    return scoreMultiplier * weight;
  }

  switch (type) {
    case "Target-Based":
    case "Achievement":
    case "Ratio":
      if (targetValue > 0) {
        // If current is equal or greater than target, full score
        scoreMultiplier = Math.min(
          1.0,
          Math.max(0, currentValue / targetValue),
        );
      } else {
        scoreMultiplier = 1.0;
      }
      break;
    case "Reverse Achievement":
      if (currentValue <= 0) {
        scoreMultiplier = 1.0;
      } else if (targetValue > 0) {
        // Cost or penalty metric: lower than target receives 100%, higher decays.
        scoreMultiplier = Math.max(
          0,
          Math.min(1.0, targetValue / currentValue),
        );
      } else {
        scoreMultiplier = 1.0;
      }
      break;
    case "Percentage":
      scoreMultiplier = Math.min(1.0, Math.max(0, currentValue / 100));
      break;
    case "Deductive":
      // Deductive KPI: targetValue represents the ceiling or limit.
      // If the name mentions deductions/bugs/incidents/costs, lower is better.
      const nameLower = kpi.name.toLowerCase();
      if (
        nameLower.includes("deduction") ||
        nameLower.includes("impact") ||
        nameLower.includes("cost") ||
        nameLower.includes("incident")
      ) {
        // Deductive formula: 100% score for 0 occurrences, decaying proportionally to targetValue threshold behavior
        if (currentValue <= 0) {
          scoreMultiplier = 1.0;
        } else {
          // For example: targetValue is the warning limit (say 20). If current is 10, penalty is half.
          const penaltyRatio =
            targetValue > 0 ? currentValue / targetValue : currentValue / 100;
          scoreMultiplier = Math.max(0, 1.0 - penaltyRatio);
        }
      } else {
        // Standard deduction starting at 100% and decaying with value
        const limit = kpi.targetValue > 0 ? kpi.targetValue : 100;
        scoreMultiplier = Math.min(
          1.0,
          Math.max(0, (limit - currentValue) / limit),
        );
      }
      break;
    case "Binary":
      scoreMultiplier = currentValue > 0 ? 1.0 : 0.0;
      break;
    default:
      scoreMultiplier = 1.0;
  }

  return scoreMultiplier * weight;
}

const COLORS = [
  "#6366F1",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#3B82F6",
];

interface AdminPerformanceViewProps {
  userRole?: string;
  userDepartment?: string;
  initialTab?:
    | "overview"
    | "conduct"
    | "rewards"
    | "leaderboard"
    | "settings"
    | "templates"
    | "team-performance"
    | "bulk-upload"
    | "performance-reports";
}

const AdminPerformanceView: React.FC<AdminPerformanceViewProps> = ({ userRole, userDepartment, initialTab }) => {
  const { showSuccess, showError } = useAlert();

  // Load initial state cleanly using exact role specifications
  const [employees, setEmployees] = useState<Employee[]>(() => {
    // 1. Load the primary roster of employees from company_employees_data (which includes any newly added/edited employees)
    const savedHr = localStorage.getItem("company_employees_data");
    let hrList: Employee[] = [];
    if (savedHr) {
      try {
        hrList = JSON.parse(savedHr) as Employee[];
      } catch (e) {
        console.error("Failed to parse saved HR data", e);
      }
    }
    if (hrList.length === 0) {
      hrList = [...initialEmployees];
    }
    hrList = normalizeEmployeesList(hrList);

    // 2. Load the existing KPI states from company_employees_kpi_state to preserve scores and values
    const savedKpi = localStorage.getItem("company_employees_kpi_state");
    let kpiList: Employee[] = [];
    if (savedKpi) {
      try {
        kpiList = JSON.parse(savedKpi) as Employee[];
      } catch (e) {
        console.error("Failed to parse saved KPIs data", e);
      }
    }
    kpiList = normalizeEmployeesList(kpiList);

    // Create a map of existing KPI states by employee ID for fast lookup
    const kpiMap = new Map<string, Employee>();
    kpiList.forEach((emp) => {
      kpiMap.set(emp.id, emp);
    });

    // 3. Map/merge each employee from the HR roster to preserve their KPI values or initialize them
    const mergedList = hrList.map((emp) => {
      const existingKpiEmp = kpiMap.get(emp.id);
      
      // If employee already has a saved KPI state, keep it (but update basic info like role, department, name from HR)
      if (existingKpiEmp && existingKpiEmp.kpis && existingKpiEmp.kpis.length > 0) {
        return {
          ...emp,
          kpis: existingKpiEmp.kpis,
          rewardPoints: existingKpiEmp.rewardPoints ?? emp.rewardPoints ?? Math.floor(Math.random() * 80 + 20),
          performanceScore: existingKpiEmp.performanceScore ?? emp.performanceScore,
          performanceBalance: existingKpiEmp.performanceBalance ?? emp.performanceBalance,
        };
      }

      // Otherwise, initialize default role-based KPIs for this employee
      const cat = getRoleCategory(emp.role, emp.department);
      const roleKpis =
        ROLE_KPINAMES_TEMPLATES[cat] || ROLE_KPINAMES_TEMPLATES.support;

      // Company-Wide Conduct KPIs (20%) added to the role-specific performance KPIs (80%)
      const combinedKpis: KpiTemplate[] = [
        ...roleKpis.map((k) => ({ ...k })),
        ...CORE_KPIS_TEMPLATES.map((k) => ({ ...k })),
      ];

      return {
        ...emp,
        kpis: combinedKpis as unknown as EmployeeKPI[],
        rewardPoints: emp.rewardPoints ?? Math.floor(Math.random() * 80 + 20),
      };
    });

    // Save the merged list back to ensure both keys are in sync
    localStorage.setItem("company_employees_kpi_state", JSON.stringify(mergedList));
    return mergedList;
  });

  const isTeamLead = useMemo(() => {
    return [
      "team-lead",
      "cx-head",
      "sales-manager",
      "marketing-manager",
      "content-lead",
      "engineering"
    ].includes(userRole || "");
  }, [userRole]);

  const canEditPerformance = useMemo(() => {
    if (
      !userRole ||
      [
        "support-staff",
        "employee",
        "call-agent",
        "agent"
      ].includes(userRole.toLowerCase())
    ) {
      return false;
    }
    return true;
  }, [userRole]);

  const scopedEmployees = useMemo(() => {
    if (isTeamLead && userDepartment) {
      const currentLead = employees.find(
        (e) =>
          (e.department || "").toLowerCase() === userDepartment.toLowerCase() &&
          (e.is_team_lead || (e.role || "").toLowerCase().includes("lead") || (e.role || "").toLowerCase().includes("manager"))
      );
      const leadId = currentLead ? currentLead.id : null;
      
      return employees.filter(
        (emp) =>
          (emp.department || "").toLowerCase() === userDepartment.toLowerCase() &&
          emp.id !== leadId &&
          !emp.is_team_lead &&
          !(emp.role || "").toLowerCase().includes("lead") &&
          !(emp.role || "").toLowerCase().includes("manager")
      );
    }
    return employees;
  }, [employees, isTeamLead, userDepartment]);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    () => {
      const normalizedInit = normalizeEmployeesList(initialEmployees);
      // If we are a team lead, find the first employee in their department
      if (userRole && userDepartment) {
        const leadCheck = [
          "team-lead",
          "cx-head",
          "sales-manager",
          "marketing-manager",
          "content-lead",
          "engineering"
        ].includes(userRole);
        if (leadCheck) {
          const currentLead = normalizedInit.find(
            (e) =>
              (e.department || "").toLowerCase() === userDepartment.toLowerCase() &&
              (e.is_team_lead || (e.role || "").toLowerCase().includes("lead") || (e.role || "").toLowerCase().includes("manager"))
          );
          const leadId = currentLead ? currentLead.id : null;
          const filtered = normalizedInit.filter(
            (emp) =>
              (emp.department || "").toLowerCase() === userDepartment.toLowerCase() &&
              emp.id !== leadId &&
              !emp.is_team_lead &&
              !(emp.role || "").toLowerCase().includes("lead") &&
              !(emp.role || "").toLowerCase().includes("manager")
          );
          return filtered.length > 0 ? filtered[0].id : null;
        }
      }
      return normalizedInit.length > 0 ? normalizedInit[0].id : null;
    }
  );

  useEffect(() => {
    if (scopedEmployees.length > 0) {
      if (!selectedEmployeeId || !scopedEmployees.find(e => e.id === selectedEmployeeId)) {
        setSelectedEmployeeId(scopedEmployees[0].id);
      }
    } else {
      setSelectedEmployeeId(null);
    }
  }, [scopedEmployees, selectedEmployeeId]);

  const [perfSettings, setPerfSettings] = useState<AppPerformanceSettings>(
    () => {
      const saved = localStorage.getItem("company_app_performance_settings");
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as any;
          if (parsed.performance_weight_limit !== undefined) {
            parsed.roleWeightLimit = parsed.performance_weight_limit;
          }
          if (parsed.conduct_weight_limit !== undefined) {
            parsed.conductWeightLimit = parsed.conduct_weight_limit;
          }
          if (parsed.roleWeightLimit === undefined) parsed.roleWeightLimit = 80;
          if (parsed.conductWeightLimit === undefined)
            parsed.conductWeightLimit = 20;

          return parsed as AppPerformanceSettings;
        } catch (e) {
          console.error("Failed to parse saved performance settings", e);
        }
      }
      return DEFAULT_PERF_SETTINGS;
    },
  );

  const savePerfSettings = (updated: AppPerformanceSettings) => {
    setPerfSettings(updated);
    localStorage.setItem(
      "company_app_performance_settings",
      JSON.stringify(updated),
    );
  };

  const [selectedUploadEmpType, setSelectedUploadEmpType] = useState<"all" | "manager" | "members">("all");
  const [selectedUploadRole, setSelectedUploadRole] = useState<string>("all");
  const [dragActive, setDragActive] = useState(false);
  const [parsedPreviewData, setParsedPreviewData] = useState<any[] | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");

  // Dynamic unique roles based on Selected Employee Type for Bulk Upload
  const availableUploadRoles = useMemo(() => {
    // Core profile categories that the HR system uses
    const coreProfiles = [
      "Engineering",
      "Operations",
      "Tech Support",
      "Marketing",
      "Sales",
      "Customer Success"
    ];

    const matchingTypeEmployees = employees.filter((emp) => {
      if (selectedUploadEmpType !== "all") {
        const isManager =
          (emp.role || "").toLowerCase().includes("manager") ||
          (emp.role || "").toLowerCase().includes("lead") ||
          (emp.role || "").toLowerCase().includes("director") ||
          (emp.role || "").toLowerCase().includes("admin") ||
          emp.is_team_lead === true;
        if (selectedUploadEmpType === "manager" && !isManager) return false;
        if (selectedUploadEmpType === "members" && isManager) return false;
      }
      return true;
    });

    const rolesSet = new Set<string>();
    matchingTypeEmployees.forEach((emp) => {
      if (emp.role) rolesSet.add(emp.role);
    });

    const sortedRawRoles = Array.from(rolesSet).sort();
    return [...coreProfiles, ...sortedRawRoles];
  }, [employees, selectedUploadEmpType]);

  // Handle auto-reset of role dropdown if the role is no longer available
  useEffect(() => {
    if (selectedUploadRole !== "all" && !availableUploadRoles.includes(selectedUploadRole)) {
      setSelectedUploadRole("all");
    }
  }, [availableUploadRoles, selectedUploadRole]);

  // Filtered employees for the upload template / target scope
  const filteredUploadEmployees = useMemo(() => {
    return employees.filter((emp) => {
      // 1. Employee Type check
      if (selectedUploadEmpType !== "all") {
        const isManager =
          (emp.role || "").toLowerCase().includes("manager") ||
          (emp.role || "").toLowerCase().includes("lead") ||
          (emp.role || "").toLowerCase().includes("director") ||
          (emp.role || "").toLowerCase().includes("admin") ||
          emp.is_team_lead === true;
        if (selectedUploadEmpType === "manager" && !isManager) return false;
        if (selectedUploadEmpType === "members" && isManager) return false;
      }
      // 2. Role check
      if (selectedUploadRole !== "all") {
        const selLower = selectedUploadRole.toLowerCase();
        if (selLower === "engineering") {
          const cat = getRoleCategory(emp.role, emp.department);
          if (
            emp.department?.toLowerCase() !== "engineering" &&
            !emp.role?.toLowerCase().includes("engineer") &&
            cat !== "engineer"
          ) {
            return false;
          }
        } else if (selLower === "operations") {
          const isOperational = 
            emp.department?.toLowerCase().includes("operation") || 
            emp.role?.toLowerCase().includes("operation") ||
            emp.department?.toLowerCase().includes("human resources") ||
            emp.department?.toLowerCase().includes("finance") ||
            emp.department?.toLowerCase().includes("content") ||
            emp.role?.toLowerCase().includes("executive") ||
            emp.role?.toLowerCase().includes("officer") ||
            emp.role?.toLowerCase().includes("specialist");
          if (!isOperational) {
            return false;
          }
        } else if (selLower === "tech support") {
          const cat = getRoleCategory(emp.role, emp.department);
          const isTechSupport = 
            emp.department?.toLowerCase().includes("support") ||
            emp.role?.toLowerCase().includes("support") ||
            emp.department?.toLowerCase().includes("customer experience") ||
            cat === "support";
          if (!isTechSupport) {
            return false;
          }
        } else if (selLower === "marketing") {
          const cat = getRoleCategory(emp.role, emp.department);
          if (
            emp.department?.toLowerCase() !== "marketing" &&
            !emp.role?.toLowerCase().includes("marketing") &&
            cat !== "marketer"
          ) {
            return false;
          }
        } else if (selLower === "sales") {
          const cat = getRoleCategory(emp.role, emp.department);
          if (
            emp.department?.toLowerCase() !== "sales" &&
            !emp.role?.toLowerCase().includes("sales") &&
            cat !== "sales"
          ) {
            return false;
          }
        } else if (selLower === "customer success") {
          const cat = getRoleCategory(emp.role, emp.department);
          if (
            emp.department?.toLowerCase() !== "customer success" &&
            !emp.role?.toLowerCase().includes("success") &&
            cat !== "cxsuccess"
          ) {
            return false;
          }
        } else {
          if (emp.role !== selectedUploadRole) return false;
        }
      }
      return true;
    });
  }, [employees, selectedUploadEmpType, selectedUploadRole]);

  // Expected KPIs determined dynamically based on selected role
  const uploadExpectedKpis = useMemo(() => {
    const firstWithKpis = filteredUploadEmployees.find(emp => emp.kpis && emp.kpis.length > 0);
    if (firstWithKpis && firstWithKpis.kpis) {
      return firstWithKpis.kpis;
    }
    
    const selLower = selectedUploadRole.toLowerCase();
    let cat: "marketer" | "sales" | "support" | "engineer" | "cxsuccess" = "support";
    
    if (selLower === "engineering") {
      cat = "engineer";
    } else if (selLower === "marketing") {
      cat = "marketer";
    } else if (selLower === "sales") {
      cat = "sales";
    } else if (selLower === "customer success") {
      cat = "cxsuccess";
    } else if (selLower === "tech support" || selLower === "operations") {
      cat = "support";
    } else if (selectedUploadRole !== "all") {
      cat = getRoleCategory(selectedUploadRole, "");
    }
    
    const roleKpis = ROLE_KPINAMES_TEMPLATES[cat] || ROLE_KPINAMES_TEMPLATES.support;
    return [
      ...roleKpis.map((k) => ({ ...k })),
      ...CORE_KPIS_TEMPLATES.map((k) => ({ ...k })),
    ];
  }, [filteredUploadEmployees, selectedUploadRole]);

  // Trigger dynamic CSV template generation & download
  const handleDownloadTemplate = () => {
    if (filteredUploadEmployees.length === 0) {
      showError("No employees match the selected criteria.");
      return;
    }

    const headers = [
      "Employee ID",
      "First Name",
      "Last Name",
      "Role",
      ...uploadExpectedKpis.map(k => k.name.replace(/,/g, "")),
      "Deductions",
      "Reward Points"
    ];

    const rows = filteredUploadEmployees.map((emp) => {
      const kpiValues = uploadExpectedKpis.map(k => {
        const actualKpi = emp.kpis?.find(ak => ak.name === k.name);
        return actualKpi ? actualKpi.currentValue : k.currentValue ?? 0;
      });

      return [
        emp.id,
        emp.firstName,
        emp.lastName,
        emp.role,
        ...kpiValues,
        0,
        emp.rewardPoints || 0
      ];
    });

    const csvContent = [headers, ...rows]
      .map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Performance_Template_${selectedUploadRole.replace(/\s+/g, "_")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess(`Template generated successfully for ${selectedUploadRole === "all" ? "All Roles" : selectedUploadRole}.`);
  };

  // Parse CSV records
  const handleCSVUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) {
        showError("The uploaded file is empty.");
        return;
      }

      try {
        const lines = text
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter((line) => line.length > 0);
        if (lines.length < 2) {
          showError("CSV error: File must contain a header row and at least one data row.");
          return;
        }

        const parseCSVLine = (line: string): string[] => {
          const result: string[] = [];
          let current = "";
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              result.push(current.trim());
              current = "";
            } else {
              current += char;
            }
          }
          result.push(current.trim());
          return result.map(s => s.replace(/^"|"$/g, '').trim());
        };

        const headers = parseCSVLine(lines[0]);
        const idIdx = headers.findIndex((h) => h.toLowerCase() === "employee id" || h.toLowerCase() === "id");
        if (idIdx === -1) {
          showError("Invalid CSV: Header row must contain an 'Employee ID' column.");
          return;
        }

        const parsedRows: any[] = [];
        let okCount = 0;

        for (let i = 1; i < lines.length; i++) {
          const cols = parseCSVLine(lines[i]);
          if (cols.length < 2) continue;

          const empId = cols[idIdx];
          const emp = employees.find((e) => e.id === empId || e.employeeId === empId);

          if (!emp) {
            parsedRows.push({
              id: empId || `Row ${i}`,
              name: cols[1] || "Unknown",
              role: cols[3] || "N/A",
              status: "error",
              message: "ID not matched in active systems",
              updatedEmp: null,
            });
            continue;
          }

          const currentKpis = emp.kpis || [];
          const updatedKpis = currentKpis.map((kpi) => {
            const headerIdx = headers.findIndex(
              (h) => h.toLowerCase().trim() === kpi.name.toLowerCase().trim()
            );
            if (headerIdx !== -1 && cols[headerIdx] !== undefined) {
              const val = parseFloat(cols[headerIdx]);
              if (!isNaN(val)) {
                return { ...kpi, currentValue: val };
              }
            }
            return kpi;
          });

          let currentPoints = emp.rewardPoints || 0;
          const deductionsIdx = headers.findIndex((h) => h.toLowerCase() === "deductions");
          const pointsIdx = headers.findIndex((h) => h.toLowerCase() === "reward points" || h.toLowerCase() === "points");

          if (pointsIdx !== -1 && cols[pointsIdx] !== undefined) {
            const pts = parseInt(cols[pointsIdx], 10);
            if (!isNaN(pts)) {
              currentPoints = pts;
            }
          }
          if (deductionsIdx !== -1 && cols[deductionsIdx] !== undefined) {
            const deds = parseInt(cols[deductionsIdx], 10);
            if (!isNaN(deds)) {
              currentPoints = Math.max(0, currentPoints - deds);
            }
          }

          const updatedEmp = {
            ...emp,
            kpis: updatedKpis,
            rewardPoints: currentPoints,
          };

          parsedRows.push({
            id: emp.id,
            name: `${emp.firstName} ${emp.lastName}`,
            role: emp.role,
            status: "success",
            message: "Success",
            originalPoints: emp.rewardPoints || 0,
            updatedPoints: currentPoints,
            originalKpis: currentKpis,
            updatedKpis: updatedKpis,
            updatedEmp,
          });
          okCount++;
        }

        setUploadedFileName(file.name);
        setParsedPreviewData(parsedRows);
        showSuccess(`Uploaded & parsed ${okCount} metrics rows successfully.`);
      } catch (err) {
        showError("Failed to parse this file. Make sure columns match.");
        console.error(err);
      }
    };
    reader.readAsText(file);
  };

  const [settingsDraft, setSettingsDraft] =
    useState<AppPerformanceSettings>(perfSettings);

  // Filtering State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleGroup, setSelectedRoleGroup] = useState<string>("All");
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "conduct"
    | "rewards"
    | "leaderboard"
    | "settings"
    | "templates"
    | "team-performance"
    | "bulk-upload"
    | "leave"
    | "performance-reports"
  >((initialTab === "overview" && isTeamLead) ? "leave" : (initialTab || (isTeamLead ? "leave" : "overview")));

  useEffect(() => {
    if (initialTab) {
      setActiveTab((initialTab === "overview" && isTeamLead) ? "leave" : initialTab);
    }
  }, [initialTab, isTeamLead]);
  const [settingsSubTab, setSettingsSubTab] = useState<
    "general" | "grading" | "rewards" | "quarters"
  >("general");

  const [triggerAdminHRCenterReview, setTriggerAdminHRCenterReview] =
    useState(false);

  // Overview filter states
  const [overviewFilterRole, setOverviewFilterRole] = useState("All");
  const [overviewFilterDate, setOverviewFilterDate] = useState("");
  const [isOverviewFilterOpen, setIsOverviewFilterOpen] = useState(false);

  useEffect(() => {
    setSettingsDraft(perfSettings);
  }, [perfSettings, activeTab]);

  useEffect(() => {
    if (
      settingsDraft &&
      JSON.stringify(settingsDraft) !== JSON.stringify(perfSettings)
    ) {
      const isValid =
        !settingsDraft.gradingSystem ||
        settingsDraft.gradingSystem.every((g) => g.minScore <= g.maxScore);
      if (isValid) {
        savePerfSettings(settingsDraft);
      }
    }
  }, [settingsDraft]);

  // Score editing helper state
  const [pointsDelta, setPointsDelta] = useState<string>("");

  // New Define Reward Form States
  const [isDefineRewardModalOpen, setIsDefineRewardModalOpen] =
    useState<boolean>(false);
  const [isAddRewardTypeModalOpen, setIsAddRewardTypeModalOpen] =
    useState<boolean>(false);
  const [isAddPenaltyTypeModalOpen, setIsAddPenaltyTypeModalOpen] =
    useState<boolean>(false);
  const [isManageConductModalOpen, setIsManageConductModalOpen] =
    useState<boolean>(false);
  const [newConductRoleType, setNewConductRoleType] = useState<'engineering' | 'non-engineering' | null>(null);
  const [newConductMethod, setNewConductMethod] = useState<string>("deductive");
  const [newConductName, setNewConductName] = useState<string>("");
  const [newConductDesc, setNewConductDesc] = useState<string>("");
  const [newConductPoints, setNewConductPoints] = useState<number>(5);
  const [newConductDept, setNewConductDept] = useState<string>("All");
  const [newConductEmpType, setNewConductEmpType] = useState<string>("All");
  const [newConductApplicableTo, setNewConductApplicableTo] = useState<"All" | "Manager" | "Ordinary" | "None">("All");
  const [conductsDraft, setConductsDraft] = useState<CompanyWideConduct[]>([]);
  const [editingConductId, setEditingConductId] = useState<string | null>(null);
  const [editingConductForm, setEditingConductForm] =
    useState<CompanyWideConduct | null>(null);

  // States for Bulk Conduct Mapping & Scoring
  const [selectedBulkEmpIds, setSelectedBulkEmpIds] = useState<string[]>([]);
  const [isBulkAssignModalOpen, setIsBulkAssignModalOpen] = useState<boolean>(false);
  const [bulkAssignFeedback, setBulkAssignFeedback] = useState<{
    conductName: string;
    employeeCount: number;
    valueLabel: string;
  } | null>(null);
  const [bulkFilterDept, setBulkFilterDept] = useState<string>("All");
  const [bulkFilterEmpType, setBulkFilterEmpType] = useState<string>("All");
  const [bulkFilterRoleGroup, setBulkFilterRoleGroup] = useState<string>("All");
  const [bulkSearchQuery, setBulkSearchQuery] = useState<string>("");
  const [isBulkSearchFocused, setIsBulkSearchFocused] = useState<boolean>(false);
  const [bulkSelectedConductId, setBulkSelectedConductId] = useState<string>("cwc1");
  const [bulkConductScoreValue, setBulkConductScoreValue] = useState<number>(5);
  const [conductSubView, setConductSubView] = useState<"directory" | "scores" | "bulk-assign">("directory");
  const [scoresEmpTypeFilter, setScoresEmpTypeFilter] = useState<string>("All");
  const [directoryEmpTypeFilter, setDirectoryEmpTypeFilter] = useState<string>("All");
  const [selectedConductIds, setSelectedConductIds] = useState<string[]>([]);

  const [showDefineRewardSection, setShowDefineRewardSection] =
    useState<boolean>(false);
  const [rewardEmployeeId, setRewardEmployeeId] = useState<string>("");

  const [quarters, setQuarters] = useState<string[]>(() => {
    const saved = localStorage.getItem("company_performance_quarters");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse quarters", e);
      }
    }
    return [
      "Q1 2026 (Jan-Mar)",
      "Q2 2026 (Apr-Jun)",
      "Q3 2026 (Jul-Sep)",
      "Q4 2026 (Oct-Dec)",
      "June 2026",
      "May 2026",
    ];
  });

  const saveQuarters = (updated: string[]) => {
    setQuarters(updated);
    localStorage.setItem("company_performance_quarters", JSON.stringify(updated));
  };

  const [newQuarterName, setNewQuarterName] = useState("");
  const [editingQuarterIndex, setEditingQuarterIndex] = useState<number | null>(null);
  const [editingQuarterName, setEditingQuarterName] = useState("");

  const [rewardPeriodId, setRewardPeriodId] = useState<string>("Q2 2026");
  const [rewardClassification, setRewardClassification] = useState<"reward" | "penalty">("reward");
  const [rewardType, setRewardType] = useState<string>("customer_praise");
  const [customRewardType, setCustomRewardType] = useState<string>("");
  const [rewardPointsValue, setRewardPointsValue] = useState<number>(50);
  const [rewardReason, setRewardReason] = useState<string>("");
  const [rewardSource, setRewardSource] = useState<string>("HR Center");
  const [rewardRelatedRecordId, setRewardRelatedRecordId] =
    useState<string>("");
  const [rewardCreatedBy, setRewardCreatedBy] = useState<string>("Admin");

  const [rewardTypesList, setRewardTypesList] = useState<RewardTypeOption[]>(
    () => {
      const saved = localStorage.getItem("company_reward_types_list_v2");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse saved reward types", e);
        }
      }
      return [
        { type: "customer_praise", points: 50 },
        { type: "innovation", points: 60 },
        { type: "helped_teammate", points: 25 },
        { type: "excellent_delivery", points: 40 },
        { type: "perfect_csat", points: 50 },
        { type: "closed_big_deal", points: 80 },
      ];
    },
  );
  const [newRewardTypeInput, setNewRewardTypeInput] = useState<string>("");
  const [newRewardTypePoints, setNewRewardTypePoints] = useState<number>(30);
  const [editingRewardTypeIdx, setEditingRewardTypeIdx] = useState<number>(-1);
  const [editingRewardTypeVal, setEditingRewardTypeVal] = useState<string>("");
  const [editingRewardTypePoints, setEditingRewardTypePoints] =
    useState<number>(30);

  // Engineering penalties/deductions state
  interface EngineeringPenaltyOption {
    id: string;
    name: string;
    points: number;
  }
  const [engineeringPenaltiesList, setEngineeringPenaltiesList] = useState<
    EngineeringPenaltyOption[]
  >(() => {
    const saved = localStorage.getItem("engineering_penalties_list_v1");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse engineering penalties list", e);
      }
    }
    return [
      { id: "pnl-1", name: "SLA Breach - Critical Bug", points: 15 },
      { id: "pnl-2", name: "Late Deployment - Staging", points: 10 },
      { id: "pnl-3", name: "Failed Quality gate / Broke Build", points: 20 },
      { id: "pnl-4", name: "Documentation Deficit", points: 5 },
      { id: "pnl-5", name: "Sprint Commitment Spillover", points: 10 },
    ];
  });
  const [newPenaltyInput, setNewPenaltyInput] = useState<string>("");
  const [newPenaltyPoints, setNewPenaltyPoints] = useState<number>(10);
  const [editingPenaltyIdx, setEditingPenaltyIdx] = useState<number>(-1);
  const [editingPenaltyVal, setEditingPenaltyVal] = useState<string>("");
  const [editingPenaltyPoints, setEditingPenaltyPoints] = useState<number>(10);
  const [selectedPenaltyId, setSelectedPenaltyId] = useState<string>("");

  const [companyRewards, setCompanyRewards] = useState<any[]>(() => {
    const saved = localStorage.getItem("company_rewards_history_list");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved rewards", e);
      }
    }
    return [
      {
        id: "RWD-2026-001",
        employee_id: "1",
        period_id: "Q2 2026",
        reward_type: "closed_big_deal",
        points: 80,
        reason:
          "Successfully closed a high-tier corporate contract with Sokoto Rice Mill.",
        source: "Sales Pipeline Oversight",
        related_record_id: "Sokoto-9921",
        created_by: "Admin",
        created_at: "2026-06-01T10:30:00.000Z",
      },
      {
        id: "RWD-2026-002",
        employee_id: "2",
        period_id: "Q2 2026",
        reward_type: "helped_teammate",
        points: 25,
        reason: "Onboarded 3 new junior agents and shared prospecting scripts.",
        source: "Manager Recommendation",
        related_record_id: "COLL-8842",
        created_by: "Admin",
        created_at: "2026-06-05T14:15:00.000Z",
      },
      {
        id: "RWD-2026-003",
        employee_id: "3",
        period_id: "Q2 2026",
        reward_type: "perfect_csat",
        points: 50,
        reason:
          "Achieved 100% resolution score on helpdesk queries for 3 weeks running.",
        source: "CSAT Automated Report",
        related_record_id: "TKT-2023-001",
        created_by: "Admin",
        created_at: "2026-06-12T09:00:00.000Z",
      },
      {
        id: "RWD-2026-004",
        employee_id: "4",
        period_id: "Q2 2026",
        reward_type: "customer_praise",
        points: 30,
        reason: "Received stellar email praise from Accra Tech Hub director.",
        source: "Customer Relations",
        related_record_id: "GH-001",
        created_by: "Admin",
        created_at: "2026-06-14T11:45:00.000Z",
      },
    ];
  });

  useEffect(() => {
    if (selectedEmployeeId) {
      setRewardEmployeeId(selectedEmployeeId);
    }
  }, [selectedEmployeeId]);

  // Dynamic approvals state & handler actions
  const [pendingApprovals, setPendingApprovals] = useState([
    {
      id: "app-1",
      name: "Binta Danladi",
      department: "Customer Experience",
      change: "Q2 Performance Appraisal",
      valueBefore: 78,
      valueAfter: 89,
      rewardPointsProposed: 50,
    },
    {
      id: "app-2",
      name: "Ada Eze",
      department: "Sales",
      change: "SLA Metric Override",
      valueBefore: 88,
      valueAfter: 94,
      rewardPointsProposed: 30,
    },
    {
      id: "app-3",
      name: "Chinedu Okafor",
      department: "Sales",
      change: "Conduct Compliance Review",
      valueBefore: 92,
      valueAfter: 98,
      rewardPointsProposed: 100,
    },
  ]);

  // QUICK ACTION CONSOLE STATES
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [activeActionModal, setActiveActionModal] = useState<
    "template" | "kpi" | "reward" | "deduction" | "review" | null
  >(null);

  // Performance Review Wizard state
  const [reviewWizardStep, setReviewWizardStep] = useState<number>(1);
  const [reviewPeriod, setReviewPeriod] = useState<string>("Q2 2026");
  const [reviewEmployeeId, setReviewEmployeeId] = useState<string>("");
  const [reviewSelectedTemplateId, setReviewSelectedTemplateId] =
    useState<string>("default");
  const [reviewKpis, setReviewKpis] = useState<EmployeeKPI[]>([]);
  const [directReportsKpisState, setDirectReportsKpisState] = useState<
    Array<{ employeeName: string; kpi: EmployeeKPI }>
  >([]);
  const [showReviewConducts, setShowReviewConducts] = useState(false);
  const [reviewDeduction, setReviewDeduction] = useState<number>(0);
  const [reviewReward, setReviewReward] = useState<number>(0);
  const [reviewDeductionReason, setReviewDeductionReason] = useState<string>(
    "Performance appraisal deduction",
  );
  const [reviewRewardReason, setReviewRewardReason] = useState<string>(
    "Performance appraisal reward",
  );
  const [reviewEmployeeSearch, setReviewEmployeeSearch] = useState<string>(
    "",
  );
  const [mgrPanelTab, setMgrPanelTab] = useState<"aggregated" | "conduct" | "members">("aggregated");

  const reviewingEmp = useMemo(() => {
    return employees.find((e) => e.id === reviewEmployeeId);
  }, [employees, reviewEmployeeId]);

  const isReviewingManager = useMemo(() => {
    if (!reviewingEmp) return false;
    const rLower = (reviewingEmp.role || "").toLowerCase();
    return (
      rLower.includes("manager") ||
      rLower.includes("lead") ||
      rLower.includes("director") ||
      rLower.includes("head") ||
      rLower.includes("admin") ||
      reviewingEmp.is_team_lead === true
    );
  }, [reviewingEmp]);

  const prepareReviewKpis = (emp: Employee, templateId: string): EmployeeKPI[] => {
    let selectedKpis: EmployeeKPI[] = [];
    const isManager =
      (emp.role || "").toLowerCase().includes("manager") ||
      (emp.role || "").toLowerCase().includes("lead") ||
      (emp.role || "").toLowerCase().includes("director") ||
      (emp.role || "").toLowerCase().includes("head") ||
      (emp.role || "").toLowerCase().includes("admin") ||
      emp.is_team_lead === true;

    const currentGroup = isManager ? "Manager" : "Ordinary";

    const mappedConducts = (perfSettings.companyWideConducts || []).filter((c) => {
      const cDept = (c.department || "All").toLowerCase();
      const eDept = (emp.department || "").toLowerCase();
      const deptMatch = cDept === "all" || (cDept !== "none" && (
        cDept === eDept ||
        (cDept === "hr" && eDept === "human resources") ||
        (cDept === "human resources" && eDept === "hr") ||
        (cDept === "tech support" && eDept === "customer support") ||
        (cDept === "customer support" && eDept === "tech support")
      ));
      const typeMatch = !c.employeeType || c.employeeType === "All" || (c.employeeType !== "None" && c.employeeType === emp.employeeType);
      const groupMatch = !c.applicableTo || c.applicableTo === "All" || (c.applicableTo !== "None" && c.applicableTo === currentGroup);
      return deptMatch && typeMatch && groupMatch;
    });

    const tmpl = templateId !== "default" ? templates.find((t) => t.id === templateId) : null;
    const conductListToUse = tmpl && tmpl.conductCategories && tmpl.conductCategories.length > 0
      ? tmpl.conductCategories.map(cat => ({
          id: cat.id,
          name: cat.name,
          points: cat.weight,
        }))
      : mappedConducts.map(c => ({
          id: c.id,
          name: c.name,
          points: c.points,
        }));

    const conductKpis = conductListToUse.map((c) => {
      const roleCategory = getRoleCategory(emp.role || "", emp.department || "");
      const isEngineering =
        roleCategory === "engineer" ||
        (emp.department || "").toLowerCase().includes("engineering") ||
        (emp.role || "").toLowerCase().includes("engineer");

      if (isEngineering) {
        return {
          id: c.id.startsWith("core-") ? c.id : "core-" + c.id,
          name: c.name,
          type: "Deductive" as const,
          weight: c.points,
          currentValue: 0,
          targetValue: c.points,
          unit: "pts deduction",
          maxWeightRange: 20,
        };
      } else {
        return {
          id: c.id.startsWith("core-") ? c.id : "core-" + c.id,
          name: c.name,
          type: "Rating" as const,
          weight: c.points,
          currentValue: 5,
          targetValue: 5,
          unit: "/5 rating",
          maxWeightRange: 20,
        };
      }
    });

    if (templateId === "default") {
      const nonCoreKpis = emp.kpis.filter((k) => {
        const isCore = k.id.startsWith("core-") || CORE_KPIS_TEMPLATES.some((ck) => ck.name === k.name) || (perfSettings.companyWideConducts || []).some((c) => c.id === k.id || c.name === k.name);
        return !isCore;
      });
      selectedKpis = [
        ...nonCoreKpis.map((k) => ({ ...k })),
        ...conductKpis,
      ] as unknown as EmployeeKPI[];
    } else {
      if (tmpl) {
        selectedKpis = [
          ...tmpl.kpiItems.map((item) => ({
            id: "item-" + item.id,
            name: item.name,
            type: item.type,
            weight: item.weight,
            currentValue: 0,
            targetValue: item.targetValue,
            unit: item.unit,
            maxWeightRange: tmpl.performance_weight_limit,
          })),
          ...conductKpis,
        ] as unknown as EmployeeKPI[];
      } else {
        const nonCoreKpis = emp.kpis.filter((k) => {
          const isCore = k.id.startsWith("core-") || CORE_KPIS_TEMPLATES.some((ck) => ck.name === k.name) || (perfSettings.companyWideConducts || []).some((c) => c.id === k.id || c.name === k.name);
          return !isCore;
        });
        selectedKpis = [
          ...nonCoreKpis.map((k) => ({ ...k })),
          ...conductKpis,
        ] as unknown as EmployeeKPI[];
      }
    }

    // Recalculate cumulative values if employee has a cumulative template
    const matchedTmpl = templates.find((t) => {
      if (templateId !== "default" && t.id === templateId) return true;
      if (templateId === "default") {
        if (emp.applied_template_id && t.id === emp.applied_template_id) return true;
        const deptMatch = (t.department_id || "").toLowerCase().split(",").map(d => d.trim()).some(d => d === (emp.department || "").toLowerCase());
        const roleMatch = (t.role_id || "").toLowerCase().split(",").map(r => r.trim()).some(r => r === (emp.role || "").toLowerCase() || (emp.role || "").toLowerCase().includes(r));
        return deptMatch && roleMatch;
      }
      return false;
    });

    if (matchedTmpl && matchedTmpl.is_manager_template && matchedTmpl.manager_template_type === "cumulative") {
      let reports = employees.filter(e => 
        e.reports_to === emp.employeeId || 
        e.reports_to === emp.id ||
        (e.department === emp.department && e.id !== emp.id && !(
          (e.role || "").toLowerCase().includes("manager") ||
          (e.role || "").toLowerCase().includes("lead") ||
          (e.role || "").toLowerCase().includes("director") ||
          (e.role || "").toLowerCase().includes("head") ||
          e.is_team_lead === true
        ))
      );
      const hasLinkedTemplates = (matchedTmpl.linked_template_ids && matchedTmpl.linked_template_ids.length > 0) || matchedTmpl.linked_template_id;
      if (hasLinkedTemplates) {
        const ids = matchedTmpl.linked_template_ids || (matchedTmpl.linked_template_id ? [matchedTmpl.linked_template_id] : []);
        const reportsOnLinkedTemplate = reports.filter(r => {
          const tId = getEmployeeMatchedTemplateId(r, templates);
          return tId && ids.includes(tId);
        });
        if (reportsOnLinkedTemplate.length > 0) {
          reports = reportsOnLinkedTemplate;
        }
      }
      if (reports.length > 0) {
        selectedKpis = selectedKpis.map((kpiItem) => {
          const isCore = CORE_KPIS_TEMPLATES.some((ck) => ck.name === kpiItem.name) || 
                         (perfSettings.companyWideConducts || []).some((c) => c.id === kpiItem.id || c.name === kpiItem.name);
          if (isCore) return kpiItem;

          let totalAchieved = 0;
          reports.forEach(report => {
            const match = (report.kpis || []).find(k => k.name.trim().toLowerCase() === kpiItem.name.trim().toLowerCase());
            if (match) {
              totalAchieved += (match.currentValue || 0);
            }
          });
          return {
            ...kpiItem,
            currentValue: Number((totalAchieved / reports.length).toFixed(1))
          };
        });
      }
    }

    // Auto inject leadership custom KPI & comment block for managers/team leads
    if (isManager) {
      const hasFeedbackKpi = selectedKpis.some(
        (k) => k.id === "kpi-mgr-comments" || k.name === "Leadership Feedback & Team Comments"
      );
      if (!hasFeedbackKpi) {
        selectedKpis.push({
          id: "kpi-mgr-comments",
          name: "Leadership Feedback & Team Comments",
          type: "Rating",
          weight: 15,
          currentValue: 5,
          targetValue: 5,
          unit: "★",
          maxWeightRange: 100,
          comments: ""
        });
      }
    }

    return selectedKpis;
  };

  // Quick Add Template States
  const [quickTemplateName, setQuickTemplateName] = useState("");
  const [quickTemplateRole, setQuickTemplateRole] = useState(
    "Sales Representative",
  );
  const [quickTemplateDept, setQuickTemplateDept] = useState("Sales");
  const [quickTemplateRoleLimit, setQuickTemplateRoleLimit] =
    useState<number>(80);
  const [quickTemplateConductLimit, setQuickTemplateConductLimit] =
    useState<number>(20);

  // Quick Create KPI States
  const [quickKpiEmpId, setQuickKpiEmpId] = useState("");
  const [quickKpiName, setQuickKpiName] = useState("");
  const [quickKpiWeight, setQuickKpiWeight] = useState<number>(15);
  const [quickKpiTarget, setQuickKpiTarget] = useState<number>(100);
  const [quickKpiType, setQuickKpiType] = useState<
    "Target-Based" | "Percentage" | "Deductive" | "Binary"
  >("Percentage");
  const [quickKpiUnit, setQuickKpiUnit] = useState("%");

  // Quick Add Reward States
  const [quickRewardEmpId, setQuickRewardEmpId] = useState("");
  const [quickRewardPoints, setQuickRewardPoints] = useState<number>(20);
  const [quickRewardReason, setQuickRewardReason] = useState(
    "Exceptional Performance standard achieved",
  );

  // Quick Add Deduction States
  const [quickDeductEmpId, setQuickDeductEmpId] = useState("");
  const [quickDeductPoints, setQuickDeductPoints] = useState<number>(10);
  const [quickDeductReason, setQuickDeductReason] = useState(
    "SLA metric delay deduction",
  );

  // Quick Action Form Handlers
  const handleAddTemplateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTemplateName.trim()) {
      showError("Please key in a name for this performance template.");
      return;
    }

    const isMarketer =
      quickTemplateRole.toLowerCase().includes("market") ||
      quickTemplateDept.toLowerCase().includes("market");

    const newTemplate: PerformanceTemplate = {
      id: "tmpl-" + Date.now(),
      name: quickTemplateName,
      role_id: quickTemplateRole,
      department_id: quickTemplateDept,
      description: "Quick template generated from UI",
      created_by: "Admin",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true,
      performance_weight_limit: Number(quickTemplateRoleLimit),
      conduct_weight_limit: Number(quickTemplateConductLimit),
      kpiItems: isMarketer
        ? [
            {
              id: "item-mk-1-" + Date.now(),
              name: "Leads generated",
              type: "Target-Based",
              weight: 25,
              targetValue: 150,
              unit: "leads",
              capValue: 200,
              validationRule: "Must be standard positive number",
            },
            {
              id: "item-mk-2-" + Date.now(),
              name: "Cost per lead",
              type: "Deductive",
              weight: 20,
              targetValue: 10,
              unit: "$",
              capValue: 30,
              validationRule: "Deduction threshold limit",
            },
            {
              id: "item-mk-3-" + Date.now(),
              name: "Qualified lead rate",
              type: "Percentage",
              weight: 20,
              targetValue: 100,
              unit: "%",
              capValue: 100,
              validationRule: "Must not exceed 100%",
            },
            {
              id: "item-mk-4-" + Date.now(),
              name: "Campaign conversion",
              type: "Percentage",
              weight: 15,
              targetValue: 100,
              unit: "%",
              capValue: 100,
              validationRule: "Must not exceed 100%",
            },
          ]
        : [
            {
              id: "item-cc-" + Date.now() + "-1",
              name: "Performance Delivery SLA",
              type: "Percentage",
              weight: Math.round(Number(quickTemplateRoleLimit) * 0.5),
              targetValue: 100,
              unit: "%",
              capValue: 120,
              validationRule: "Standard target",
            },
            {
              id: "item-cc-" + Date.now() + "-2",
              name: "Task Accuracy Metric",
              type: "Percentage",
              weight: Math.round(Number(quickTemplateRoleLimit) * 0.5),
              targetValue: 100,
              unit: "%",
              capValue: 120,
              validationRule: "Standard target",
            },
          ],
      conductCategories: [
        {
          id: "cat-cc-" + Date.now() + "-1",
          name: "Professional Conduct Index",
          type: "Percentage",
          weight: Math.round(Number(quickTemplateConductLimit) * 0.5),
          targetValue: 100,
          unit: "%",
        },
        {
          id: "cat-cc-" + Date.now() + "-2",
          name: "Diligence Protocols",
          type: "Percentage",
          weight: Math.round(Number(quickTemplateConductLimit) * 0.5),
          targetValue: 100,
          unit: "%",
        },
      ],
    };

    const updated = [...templates, newTemplate];
    setTemplates(updated);
    saveTemplates(updated);
    setQuickTemplateName("");
    setActiveActionModal(null);
    showSuccess(
      `Performance Template "${quickTemplateName}" successfully logged into collection!`,
    );
  };

  const handleCreateKpiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickKpiName.trim()) {
      showError("Please outline a KPI Name.");
      return;
    }
    if (!quickKpiEmpId) {
      showError("Please specify a target employee/roster.");
      return;
    }

    const addedKpi: EmployeeKPI = {
      id: "custom-kpi-" + Date.now(),
      name: quickKpiName,
      type: quickKpiType,
      weight: Number(quickKpiWeight),
      currentValue:
        quickKpiType === "Binary"
          ? 1
          : Math.round(Number(quickKpiTarget) * 0.85),
      targetValue: Number(quickKpiTarget),
      unit: quickKpiUnit,
    };

    const updated = employees.map((emp) => {
      if (emp.id === quickKpiEmpId || quickKpiEmpId === "all") {
        const currentKpis = emp.kpis || [];
        if (
          currentKpis.some(
            (k) => k.name.toLowerCase() === quickKpiName.toLowerCase(),
          )
        ) {
          return emp;
        }
        return {
          ...emp,
          kpis: [...currentKpis, addedKpi],
        };
      }
      return emp;
    });

    saveAndSyncState(updated);
    setQuickKpiName("");
    setActiveActionModal(null);
    const name =
      quickKpiEmpId === "all"
        ? "All employees"
        : employees.find((e) => e.id === quickKpiEmpId)?.firstName ||
          "employee";
    showSuccess(
      `KPI indicator "${quickKpiName}" added to scoring index of ${name}.`,
    );
  };

  const handleAddRewardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickRewardEmpId) {
      showError("Please pick an employee.");
      return;
    }
    const pts = Number(quickRewardPoints);
    if (isNaN(pts) || pts <= 0) {
      showError("Reward points value must be positive.");
      return;
    }

    const updated = employees.map((emp) => {
      if (emp.id === quickRewardEmpId || quickRewardEmpId === "all") {
        return {
          ...emp,
          rewardPoints: (emp.rewardPoints || 0) + pts,
        };
      }
      return emp;
    });

    saveAndSyncState(updated);
    setActiveActionModal(null);
    const name =
      quickRewardEmpId === "all"
        ? "All employees"
        : employees.find((e) => e.id === quickRewardEmpId)?.firstName ||
          "employee";
    showSuccess(`Awarded +${pts} points to ${name} reward balance.`);
  };

  const handleAddDeductionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditPerformance) {
      showError("You do not have permission to edit or record rewards and penalties.");
      return;
    }
    if (!quickDeductEmpId) {
      showError("Please pick an employee.");
      return;
    }
    const pts = Number(quickDeductPoints);
    if (isNaN(pts) || pts <= 0) {
      showError("Deduction points value must be positive.");
      return;
    }

    const updated = employees.map((emp) => {
      if (emp.id === quickDeductEmpId || quickDeductEmpId === "all") {
        return {
          ...emp,
          rewardPoints: Math.max(0, (emp.rewardPoints || 0) - pts),
        };
      }
      return emp;
    });

    saveAndSyncState(updated);
    setActiveActionModal(null);
    const name =
      quickDeductEmpId === "all"
        ? "All employees"
        : employees.find((e) => e.id === quickDeductEmpId)?.firstName ||
          "employee";
    showSuccess(`Deducted ${pts} points from ${name} reward balance.`);
  };

  const handleApprove = (id: string, name: string, points: number) => {
    const updated = employees.map((emp) => {
      const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
      if (fullName.includes(name.toLowerCase())) {
        return {
          ...emp,
          rewardPoints: (emp.rewardPoints || 0) + points,
        };
      }
      return emp;
    });
    saveAndSyncState(updated);
    setPendingApprovals((prev) => prev.filter((item) => item.id !== id));
    showSuccess(
      `Approved appraisal for ${name}! Awarded +${points} reward points.`,
    );
  };

  const handleReject = (id: string, name: string) => {
    setPendingApprovals((prev) => prev.filter((item) => item.id !== id));
    showSuccess(`Rejected appraisal update for ${name}.`);
  };

  // PERFORMANCE TEMPLATES SYSTEM STATES
  const [templates, setTemplates] = useState<PerformanceTemplate[]>(() => {
    const defaultTemplates: PerformanceTemplate[] = [
      {
        id: "tmpl-marketing-cumulative",
        name: "Marketing Manager Cumulative",
        role_id: "Marketing Manager",
        department_id: "Marketing",
        description: "Cumulative Performance Template for Marketing Leaders",
        created_by: "Admin",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
        performance_weight_limit: 80,
        conduct_weight_limit: 20,
        is_manager_template: true,
        manager_template_type: "cumulative",
        kpiItems: [
          {
            id: "item-mkt-cum-1",
            name: "Leads generated",
            type: "Target-Based",
            weight: 25,
            targetValue: 150,
            unit: "leads",
            capValue: 200,
            validationRule: "Must be standard positive number",
          },
          {
            id: "item-mkt-cum-2",
            name: "Cost per lead",
            type: "Deductive",
            weight: 20,
            targetValue: 10,
            unit: "$",
            capValue: 30,
            validationRule: "Deduction threshold limit",
          },
          {
            id: "item-mkt-cum-3",
            name: "Qualified lead rate",
            type: "Percentage",
            weight: 20,
            targetValue: 100,
            unit: "%",
            capValue: 100,
            validationRule: "Must not exceed 100%",
          },
          {
            id: "item-mkt-cum-4",
            name: "Campaign conversion",
            type: "Percentage",
            weight: 15,
            targetValue: 100,
            unit: "%",
            capValue: 100,
            validationRule: "Must not exceed 100%",
          },
        ],
        conductCategories: [
          {
            id: "item-mkt-cum-cc1",
            name: "Punctuality & Attendance",
            type: "Percentage",
            weight: 5,
            targetValue: 100,
            unit: "%",
          },
          {
            id: "item-mkt-cum-cc2",
            name: "Team Player & Collaboration",
            type: "Binary",
            weight: 5,
            targetValue: 1,
            unit: "yes/no",
          },
          {
            id: "item-mkt-cum-cc3",
            name: "Communication Adeptness",
            type: "Percentage",
            weight: 5,
            targetValue: 100,
            unit: "%",
          },
          {
            id: "item-mkt-cum-cc4",
            name: "Administrative Compliance",
            type: "Percentage",
            weight: 5,
            targetValue: 100,
            unit: "%",
          },
        ],
      },
      {
        id: "tmpl-marketer",
        name: "Marketer",
        role_id: "Marketer",
        department_id: "Marketing",
        description: "Marketing template",
        created_by: "Admin",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
        performance_weight_limit: 80,
        conduct_weight_limit: 20,
        kpiItems: [
          {
            id: "item-mk-1",
            name: "Leads generated",
            type: "Target-Based",
            weight: 25,
            targetValue: 150,
            unit: "leads",
            capValue: 200,
            validationRule: "Must be standard positive number",
          },
          {
            id: "item-mk-2",
            name: "Cost per lead",
            type: "Deductive",
            weight: 20,
            targetValue: 10,
            unit: "$",
            capValue: 30,
            validationRule: "Deduction threshold limit",
          },
          {
            id: "item-mk-3",
            name: "Qualified lead rate",
            type: "Percentage",
            weight: 20,
            targetValue: 100,
            unit: "%",
            capValue: 100,
            validationRule: "Must not exceed 100%",
          },
          {
            id: "item-mk-4",
            name: "Campaign conversion",
            type: "Percentage",
            weight: 15,
            targetValue: 100,
            unit: "%",
            capValue: 100,
            validationRule: "Must not exceed 100%",
          },
        ],
        conductCategories: [
          {
            id: "item-cc-1",
            name: "Punctuality & Attendance",
            type: "Percentage",
            weight: 5,
            targetValue: 100,
            unit: "%",
          },
          {
            id: "item-cc-2",
            name: "Team Player & Collaboration",
            type: "Binary",
            weight: 5,
            targetValue: 1,
            unit: "yes/no",
          },
          {
            id: "item-cc-3",
            name: "Communication Adeptness",
            type: "Percentage",
            weight: 5,
            targetValue: 100,
            unit: "%",
          },
          {
            id: "item-cc-4",
            name: "Administrative Compliance",
            type: "Percentage",
            weight: 5,
            targetValue: 100,
            unit: "%",
          },
        ],
      },
      {
        id: "tmpl-sales",
        name: "Sales",
        role_id: "Sales Agent",
        department_id: "Sales",
        description: "Default template",
        created_by: "Admin",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
        performance_weight_limit: 80,
        conduct_weight_limit: 20,
        kpiItems: [
          {
            id: "item-sl-1",
            name: "Revenue achieved",
            type: "Target-Based",
            weight: 35,
            targetValue: 50000,
            unit: "$",
            capValue: 75000,
            validationRule: "Positive decimal number",
          },
          {
            id: "item-sl-2",
            name: "Deals closed",
            type: "Target-Based",
            weight: 25,
            targetValue: 10,
            unit: "deals",
            capValue: 25,
            validationRule: "Must be integer greater than zero",
          },
          {
            id: "item-sl-3",
            name: "Conversion rate",
            type: "Percentage",
            weight: 20,
            targetValue: 100,
            unit: "%",
            capValue: 100,
            validationRule: "Valid percentage between 0 and 100",
          },
        ],
        conductCategories: [
          {
            id: "item-cc-1s",
            name: "Punctuality & Attendance",
            type: "Percentage",
            weight: 5,
            targetValue: 100,
            unit: "%",
          },
          {
            id: "item-cc-2s",
            name: "Team Player & Collaboration",
            type: "Binary",
            weight: 5,
            targetValue: 1,
            unit: "yes/no",
          },
          {
            id: "item-cc-3s",
            name: "Communication Adeptness",
            type: "Percentage",
            weight: 5,
            targetValue: 100,
            unit: "%",
          },
          {
            id: "item-cc-4s",
            name: "Administrative Compliance",
            type: "Percentage",
            weight: 5,
            targetValue: 100,
            unit: "%",
          },
        ],
      },
      {
        id: "tmpl-support",
        name: "Tech Support",
        role_id: "Support Specialist",
        department_id: "Customer Operations",
        description: "Default template",
        created_by: "Admin",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
        performance_weight_limit: 80,
        conduct_weight_limit: 20,
        kpiItems: [
          {
            id: "item-sp-1",
            name: "SLA compliance",
            type: "Percentage",
            weight: 20,
            targetValue: 100,
            unit: "%",
            capValue: 100,
            validationRule: "Must be within 0-100",
          },
          {
            id: "item-sp-2",
            name: "First response rate",
            type: "Percentage",
            weight: 20,
            targetValue: 100,
            unit: "%",
            capValue: 100,
            validationRule: "Must be within 0-100",
          },
          {
            id: "item-sp-3",
            name: "Resolution rate",
            type: "Percentage",
            weight: 20,
            targetValue: 100,
            unit: "%",
            capValue: 100,
            validationRule: "Must be within 0-100",
          },
          {
            id: "item-sp-4",
            name: "CSAT",
            type: "Target-Based",
            weight: 20,
            targetValue: 5.0,
            unit: "★",
            capValue: 5.0,
            validationRule: "Value between 1.0 and 5.0 rating",
          },
        ],
        conductCategories: [
          {
            id: "item-cc-1sp",
            name: "Punctuality & Attendance",
            type: "Percentage",
            weight: 5,
            targetValue: 100,
            unit: "%",
          },
          {
            id: "item-cc-2sp",
            name: "Team Player & Collaboration",
            type: "Binary",
            weight: 5,
            targetValue: 1,
            unit: "yes/no",
          },
          {
            id: "item-cc-3sp",
            name: "Communication Adeptness",
            type: "Percentage",
            weight: 5,
            targetValue: 100,
            unit: "%",
          },
          {
            id: "item-cc-4sp",
            name: "Administrative Compliance",
            type: "Percentage",
            weight: 5,
            targetValue: 100,
            unit: "%",
          },
        ],
      },
      {
        id: "tmpl-engineer",
        name: "Engineering",
        role_id: "Engineer",
        department_id: "Product Development",
        description: "Default template",
        created_by: "Admin",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
        performance_weight_limit: 80,
        conduct_weight_limit: 20,
        kpiItems: [
          {
            id: "item-eg-1",
            name: "Engineering deductions",
            type: "Deductive",
            weight: 20,
            targetValue: 10,
            unit: "incidents",
            capValue: 30,
            validationRule: "Zero default preferred",
          },
          {
            id: "item-eg-2",
            name: "Delivery quality",
            type: "Percentage",
            weight: 20,
            targetValue: 100,
            unit: "%",
            capValue: 100,
            validationRule: "Must be between 0-100",
          },
          {
            id: "item-eg-3",
            name: "Bug impact",
            type: "Deductive",
            weight: 20,
            targetValue: 15,
            unit: "bugs",
            capValue: 40,
            validationRule: "Must be whole integer index",
          },
          {
            id: "item-eg-4",
            name: "Sprint commitment",
            type: "Binary",
            weight: 20,
            targetValue: 1,
            unit: "code",
            capValue: 1,
            validationRule: "Must be binary yes/no indicator",
          },
        ],
        conductCategories: [
          {
            id: "item-cc-1eg",
            name: "Punctuality & Attendance",
            type: "Percentage",
            weight: 5,
            targetValue: 100,
            unit: "%",
          },
          {
            id: "item-cc-2eg",
            name: "Team Player & Collaboration",
            type: "Binary",
            weight: 5,
            targetValue: 1,
            unit: "yes/no",
          },
          {
            id: "item-cc-3eg",
            name: "Communication Adeptness",
            type: "Percentage",
            weight: 5,
            targetValue: 100,
            unit: "%",
          },
          {
            id: "item-cc-4eg",
            name: "Administrative Compliance",
            type: "Percentage",
            weight: 5,
            targetValue: 100,
            unit: "%",
          },
        ],
      },
      {
        id: "tmpl-cxsuccess",
        name: "Customer success",
        role_id: "Customer Success Manager",
        department_id: "Customer Success",
        description: "Default template",
        created_by: "Admin",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
        performance_weight_limit: 80,
        conduct_weight_limit: 20,
        kpiItems: [
          {
            id: "item-cs-1",
            name: "Renewal Revenue",
            type: "Target-Based",
            weight: 20,
            targetValue: 15000,
            unit: "$",
            capValue: 20000,
            validationRule: "Positive integer threshold",
          },
          {
            id: "item-cs-2",
            name: "Retention Rate",
            type: "Percentage",
            weight: 15,
            targetValue: 100,
            unit: "%",
            capValue: 100,
            validationRule: "Valid percentage 0-100",
          },
          {
            id: "item-cs-3",
            name: "Expansion Revenue",
            type: "Target-Based",
            weight: 15,
            targetValue: 5000,
            unit: "$",
            capValue: 10000,
            validationRule: "Must be positive number score",
          },
          {
            id: "item-cs-4",
            name: "Customer Health Score",
            type: "Percentage",
            weight: 15,
            targetValue: 100,
            unit: "pts",
            capValue: 100,
            validationRule: "Must be within 0-100 range",
          },
          {
            id: "item-cs-5",
            name: "Product Adoption",
            type: "Percentage",
            weight: 15,
            targetValue: 100,
            unit: "%",
            capValue: 100,
            validationRule: "Must be within 0-100 range",
          },
        ],
        conductCategories: [
          {
            id: "item-cc-1cs",
            name: "Punctuality & Attendance",
            type: "Percentage",
            weight: 5,
            targetValue: 100,
            unit: "%",
          },
          {
            id: "item-cc-2cs",
            name: "Team Player & Collaboration",
            type: "Binary",
            weight: 5,
            targetValue: 1,
            unit: "yes/no",
          },
          {
            id: "item-cc-3cs",
            name: "Communication Adeptness",
            type: "Percentage",
            weight: 5,
            targetValue: 100,
            unit: "%",
          },
          {
            id: "item-cc-4cs",
            name: "Administrative Compliance",
            type: "Percentage",
            weight: 5,
            targetValue: 100,
            unit: "%",
          },
        ],
      },
      {
        id: "tmpl-operations",
        name: "Operations",
        role_id: "Operations",
        department_id: "Operations",
        description: "Default template for Operations team evaluation",
        created_by: "Admin",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
        performance_weight_limit: 100,
        conduct_weight_limit: 20,
        kpiItems: [
          {
            id: "item-op-1",
            name: "Fulfillment Rate",
            type: "Percentage",
            weight: 30,
            targetValue: 100,
            unit: "%",
            capValue: 100,
            validationRule: "Must be within 0-100 range",
          },
          {
            id: "item-op-2",
            name: "Accuracy Rate",
            type: "Percentage",
            weight: 30,
            targetValue: 100,
            unit: "%",
            capValue: 100,
            validationRule: "Must be within 0-100 range",
          },
          {
            id: "item-op-3",
            name: "Savings Target",
            type: "Target-Based",
            weight: 15,
            targetValue: 10000,
            unit: "$",
            capValue: 15000,
            validationRule: "Positive integer threshold",
          },
          {
            id: "item-op-4",
            name: "Variance Acceptability",
            type: "Target-Based",
            weight: 15,
            targetValue: 2,
            unit: "pts",
            capValue: 5,
            validationRule: "Target precision variance",
          },
          {
            id: "item-op-5",
            name: "Compliance Deductions",
            type: "Deductive",
            weight: 10,
            targetValue: 0,
            unit: "pts",
            capValue: 20,
            validationRule: "Zero defaults preferred",
          },
        ],
        conductCategories: [
          {
            id: "item-cc-1op",
            name: "Punctuality & Attendance",
            type: "Percentage",
            weight: 5,
            targetValue: 100,
            unit: "%",
          },
          {
            id: "item-cc-2op",
            name: "Team Player & Collaboration",
            type: "Binary",
            weight: 5,
            targetValue: 1,
            unit: "yes/no",
          },
          {
            id: "item-cc-3op",
            name: "Communication Adeptness",
            type: "Percentage",
            weight: 5,
            targetValue: 100,
            unit: "%",
          },
          {
            id: "item-cc-4op",
            name: "Administrative Compliance",
            type: "Percentage",
            weight: 5,
            targetValue: 100,
            unit: "%",
          },
        ],
      },
      {
        id: "tmpl-manager",
        name: "Manager",
        role_id: "Manager",
        department_id: "Management",
        description: "Evaluation standard for Team Leads and Managers",
        created_by: "Admin",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
        performance_weight_limit: 100,
        conduct_weight_limit: 20,
        kpiItems: [
          {
            id: "item-mg-1",
            name: "Team Achievement",
            type: "Percentage",
            weight: 30,
            targetValue: 100,
            unit: "%",
            capValue: 100,
            validationRule: "Against team goals",
          },
          {
            id: "item-mg-2",
            name: "Quality Percent",
            type: "Percentage",
            weight: 20,
            targetValue: 100,
            unit: "%",
            capValue: 100,
            validationRule: "Service or product quality",
          },
          {
            id: "item-mg-3",
            name: "Compliance Percent",
            type: "Percentage",
            weight: 15,
            targetValue: 100,
            unit: "%",
            capValue: 100,
            validationRule: "Process adherence limit",
          },
          {
            id: "item-mg-4",
            name: "Reporting Rating",
            type: "Target-Based",
            weight: 10,
            targetValue: 5,
            unit: "★",
            capValue: 5,
            validationRule: "Out of 5 Stars",
          },
          {
            id: "item-mg-5",
            name: "People Management Rating",
            type: "Target-Based",
            weight: 15,
            targetValue: 5,
            unit: "★",
            capValue: 5,
            validationRule: "Out of 5 Stars",
          },
          {
            id: "item-mg-6",
            name: "Leadership Rating",
            type: "Target-Based",
            weight: 10,
            targetValue: 5,
            unit: "★",
            capValue: 5,
            validationRule: "Out of 5 Stars",
          },
        ],
        conductCategories: [
          {
            id: "item-cc-1mg",
            name: "Punctuality & Attendance",
            type: "Percentage",
            weight: 5,
            targetValue: 100,
            unit: "%",
          },
          {
            id: "item-cc-2mg",
            name: "Team Player & Collaboration",
            type: "Binary",
            weight: 5,
            targetValue: 1,
            unit: "yes/no",
          },
          {
            id: "item-cc-3mg",
            name: "Communication Adeptness",
            type: "Percentage",
            weight: 5,
            targetValue: 100,
            unit: "%",
          },
          {
            id: "item-cc-4mg",
            name: "Administrative Compliance",
            type: "Percentage",
            weight: 5,
            targetValue: 100,
            unit: "%",
          },
        ],
      },
    ];

    const deletedSaved = localStorage.getItem("deleted_template_ids");
    let deletedIds: string[] = [];
    if (deletedSaved) {
      try {
        deletedIds = JSON.parse(deletedSaved) as string[];
      } catch (e) {
        console.error(e);
      }
    }

    const saved = localStorage.getItem("company_reusable_perf_templates");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as PerformanceTemplate[];

        // Merge in newly added template defaults if they don't already exist individually
        const updatedTemplates = [...parsed].map((t) => {
          if (t.id === "tmpl-marketer") {
            return { ...t, name: "Marketer" };
          }
          return t;
        });
        defaultTemplates.forEach((defTmpl) => {
          if (!updatedTemplates.find((t) => t.id === defTmpl.id)) {
            updatedTemplates.push(defTmpl);
          }
        });

        return updatedTemplates.filter((t) => !deletedIds.includes(t.id));
      } catch (e) {
        console.error("Failed to parse saved performance templates", e);
      }
    }

    return defaultTemplates.filter((t) => !deletedIds.includes(t.id));
  });

  // Save templates helper
  const saveTemplates = (updated: PerformanceTemplate[]) => {
    setTemplates(updated);
    localStorage.setItem(
      "company_reusable_perf_templates",
      JSON.stringify(updated),
    );
  };

  useEffect(() => {
    if (reviewEmployeeId) {
      const emp = employees.find((e) => e.id === reviewEmployeeId);
      if (emp) {
        // 1. Prioritize employee's applied_template_id if present and active
        if (emp.applied_template_id && templates.some(t => t.id === emp.applied_template_id)) {
          setReviewSelectedTemplateId(emp.applied_template_id);
          return;
        }

        // SPECIAL CASE: auto map marketing cumulative template to marketing manager or marketing lead
        const empRoleLower = (emp.role || "").toLowerCase();
        const empDeptLower = (emp.department || "").toLowerCase();
        if (empDeptLower === "marketing" && (empRoleLower.includes("manager") || empRoleLower.includes("lead") || empRoleLower.includes("director"))) {
          const marketingCumulativeTmpl = templates.find((t) => {
            const tName = (t.name || "").toLowerCase();
            const tRole = (t.role_id || "").toLowerCase();
            const tDept = (t.department_id || "").toLowerCase();
            const isMarketingDept = tDept === "marketing" || tDept.split(",").some(d => d.trim() === "marketing");
            const isCumulative = tName.includes("cumulative") || tRole.includes("cumulative") || (t.is_manager_template && t.manager_template_type === "cumulative");
            return isMarketingDept && isCumulative;
          });
          if (marketingCumulativeTmpl) {
            setReviewSelectedTemplateId(marketingCumulativeTmpl.id);
            return;
          }
        }

        // 2. Try to match BOTH role AND department exactly (crucial for cumulative manager templates, e.g. Kola Alabi matching Marketing Manager instead of Marketer)
        const exactMatch = templates.find((t) => {
          const deptMatch = (t.department_id || "").toLowerCase().split(",").map(d => d.trim()).some(d => d === (emp.department || "").toLowerCase());
          const roleMatch = (t.role_id || "").toLowerCase().split(",").map(r => r.trim()).some(r => r === (emp.role || "").toLowerCase() || (emp.role || "").toLowerCase().includes(r));
          return deptMatch && roleMatch;
        });

        if (exactMatch) {
          setReviewSelectedTemplateId(exactMatch.id);
        } else {
          // 3. Fallback to department matching only
          const deptTemplate = templates.find(
            (t) =>
              t.department_id === emp.department ||
              t.name.toLowerCase().includes((emp.department || "").toLowerCase())
          );
          if (deptTemplate) {
            setReviewSelectedTemplateId(deptTemplate.id);
          } else {
            setReviewSelectedTemplateId("default");
          }
        }
      }
    } else {
      setReviewSelectedTemplateId("default");
    }
  }, [reviewEmployeeId, templates, employees]);

  // TEMPLATE EDITOR FORM STATE
  const [showManagerSetupPrompt, setShowManagerSetupPrompt] = useState(false);
  const [isManagerTemplate, setIsManagerTemplate] = useState(false);
  const [managerTemplateType, setManagerTemplateType] = useState<"regular" | "cumulative" | undefined>(undefined);
  const [linkedTemplateIds, setLinkedTemplateIds] = useState<string[]>([]);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(
    null,
  );
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [templateRole, setTemplateRole] = useState("");
  const [templateDepartment, setTemplateDepartment] = useState("");
  const [templateMonth, setTemplateMonth] = useState<string>("July");
  const [templateYear, setTemplateYear] = useState<string>("2026");
  const [templateTeamMonthlyTarget, setTemplateTeamMonthlyTarget] = useState<number>(60000000);
  const [templateTeamMembersCount, setTemplateTeamMembersCount] = useState<number>(10);
  const [templateIndividualMonthlyTarget, setTemplateIndividualMonthlyTarget] = useState<number>(6000000);
  const [templateRoleLimit, setTemplateRoleLimit] = useState<number>(80);
  const [templateConductLimit, setTemplateConductLimit] = useState<number>(20);
  const [templateKpis, setTemplateKpis] = useState<TemplateKpiItem[]>([]);
  const [templateConducts, setTemplateConducts] = useState<
    TemplateConductItem[]
  >([]);

  const [showRoleChecklist, setShowRoleChecklist] = useState(false);
  const [showDeptChecklist, setShowDeptChecklist] = useState(false);
  const [showConductChecklist, setShowConductChecklist] = useState(false);
  const [conductSearchQuery, setConductSearchQuery] = useState("");
  const [hasClickedConductMetrics, setHasClickedConductMetrics] = useState(false);
  const [showSubordinateDropdown, setShowSubordinateDropdown] = useState(false);
  const [subordinateSearchQuery, setSubordinateSearchQuery] = useState("");

  const existingRoles = useMemo(() => {
    const rolesSet = new Set<string>();
    employees.forEach((emp) => {
      if (emp.role) rolesSet.add(emp.role);
    });
    // Add standard corporate roles as options to ensure completeness:
    ["Software Engineer", "Marketer", "Sales Agent", "Support Specialist", "Customer Success Manager", "Operations Specialist", "Manager", "General Staff"].forEach((r) => rolesSet.add(r));
    return Array.from(rolesSet).sort();
  }, [employees]);

  const existingDepartments = useMemo(() => {
    const deptsSet = new Set<string>();
    employees.forEach((emp) => {
      if (emp.department) deptsSet.add(emp.department);
    });
    // Add standard departments:
    ["Engineering", "Marketing", "Sales", "Customer Operations", "Operations", "Management", "General Operations"].forEach((d) => deptsSet.add(d));
    return Array.from(deptsSet).sort();
  }, [employees]);

  // KPI single item builder form
  const [kpiItemName, setKpiItemName] = useState("");
  const [kpiItemType, setKpiItemType] = useState<
    | "Target-Based"
    | "Percentage"
    | "Deductive"
    | "Binary"
    | "Achievement"
    | "Reverse Achievement"
    | "Ratio"
    | "Rating"
  >("Target-Based");
  const [kpiItemWeight, setKpiItemWeight] = useState<number>(15);
  const [kpiItemTarget, setKpiItemTarget] = useState<number>(100);
  const [kpiItemUnit, setKpiItemUnit] = useState("%");
  const [kpiItemCap, setKpiItemCap] = useState<number>(100);
  const [kpiItemValidation, setKpiItemValidation] = useState(
    "Value must be greater than zero",
  );

  // Conduct single item builder form
  const [conductItemName, setConductItemName] = useState("");
  const [conductItemType, setConductItemType] = useState<
    "Percentage" | "Binary"
  >("Percentage");
  const [conductItemWeight, setConductItemWeight] = useState<number>(5);
  const [conductItemTarget, setConductItemTarget] = useState<number>(100);
  const [conductItemUnit, setConductItemUnit] = useState("%");

  // Template Applicator targets
  const [applyingTemplate, setApplyingTemplate] =
    useState<PerformanceTemplate | null>(null);
  const [applyTargetType, setApplyTargetType] = useState<"manager" | "members">(
    "manager",
  );
  const [applyTargetRole, setApplyTargetRole] = useState("");
  const [applyTargetDept, setApplyTargetDept] = useState("");
  const [applySelectedEmpIds, setApplySelectedEmpIds] = useState<string[]>([]);
  const [applyFilterDept, setApplyFilterDept] = useState<string>("All");
  const [applyFilterEmpType, setApplyFilterEmpType] = useState<string>("All");
  const [applySearchQuery, setApplySearchQuery] = useState<string>("");
  const [isApplySearchFocused, setIsApplySearchFocused] = useState<boolean>(false);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // Persistence Utility
  const saveAndSyncState = (updated: Employee[]) => {
    setEmployees(updated);
    localStorage.setItem(
      "company_employees_kpi_state",
      JSON.stringify(updated),
    );
    localStorage.setItem(
      "company_employees_data",
      JSON.stringify(updated),
    );
  };

  const handleBulkApply = () => {
    if (selectedBulkEmpIds.length === 0) {
      showError("Please select at least one employee.");
      return;
    }

    const updated = employees.map((emp) => {
      if (!selectedBulkEmpIds.includes(emp.id)) return emp;

      // Make a copy of the employee's KPIs list
      let updatedKpis = emp.kpis ? emp.kpis.map((k) => ({ ...k })) : [];

      // 1. If it's a Core KPI (core-1, core-2, core-3, core-4)
      if (bulkSelectedConductId.startsWith("core-")) {
        updatedKpis = updatedKpis.map((k) => {
          if (k.id === bulkSelectedConductId) {
            return {
              ...k,
              currentValue: bulkConductScoreValue,
            };
          }
          return k;
        });
      } else if (bulkSelectedConductId === "reset_all") {
        // Reset ALL core KPIs to full scores (100% or 1 for binary) and custom conducts to max
        updatedKpis = updatedKpis.map((k) => {
          if (k.id.startsWith("core-")) {
            return {
              ...k,
              currentValue: k.type === "Binary" ? 1 : 100,
            };
          }
          return k;
        });

        // Also reset role-specific conduct points maps to max for each defined custom conduct standard
        const resetConductPoints: Record<string, number> = {};
        (perfSettings.companyWideConducts || []).forEach((c) => {
          resetConductPoints[c.id] = c.points;
        });

        // Compute recalculated overall performance score
        let roleScoreSum = 0;
        let coreScoreSum = 0;
        updatedKpis.forEach((kpi) => {
          const contribution = calculateKPIContribution(kpi);
          if (kpi.id.startsWith("core-")) {
            coreScoreSum += contribution;
          } else {
            roleScoreSum += contribution;
          }
        });

        let roleScore = Math.max(0, Math.min(perfSettings.roleWeightLimit, roleScoreSum));
        let coreScore = Math.max(0, Math.min(perfSettings.conductWeightLimit, coreScoreSum));

        if (perfSettings.engineMode === "Strict Geometric") {
          roleScore = roleScore * 0.92;
          coreScore = coreScore * 0.92;
        } else if (perfSettings.engineMode === "Optimistic Capped") {
          roleScore = Math.min(perfSettings.roleWeightLimit, roleScore * 1.05);
          coreScore = Math.min(perfSettings.conductWeightLimit, coreScore * 1.05);
        }

        const factor = Math.pow(10, perfSettings.precisionDecimals);
        const baseScoreSum = Math.round((roleScore + coreScore) * factor) / factor;
        const penalty = emp.specialPenalty || 0;
        const cap = emp.perfCap !== undefined ? emp.perfCap : perfSettings.kpiCapLimit;
        const performanceBalance = Math.round(Math.max(0, Math.min(cap, baseScoreSum) - penalty) * factor) / factor;

        return {
          ...emp,
          kpis: updatedKpis,
          performanceScore: performanceBalance,
          performanceBalance: performanceBalance,
          techSupportConductPoints: { ...(emp.techSupportConductPoints || {}), ...resetConductPoints },
          customerSuccessConductPoints: { ...(emp.customerSuccessConductPoints || {}), ...resetConductPoints },
          marketingConductPoints: { ...(emp.marketingConductPoints || {}), ...resetConductPoints },
          salesConductPoints: { ...(emp.salesConductPoints || {}), ...resetConductPoints },
          operationsConductPoints: { ...(emp.operationsConductPoints || {}), ...resetConductPoints },
          managerConductPoints: { ...(emp.managerConductPoints || {}), ...resetConductPoints },
        };
      } else {
        // 2. It's a custom corporate conduct standard from companyWideConducts (e.g. cwc1)
        const condId = bulkSelectedConductId;
        const targetConduct = (perfSettings.companyWideConducts || []).find(c => c.id === condId);
        const maxPoints = targetConduct ? targetConduct.points : 5;

        // Always automatically award the maximum points
        const scoreToApply = maxPoints;

        // Update any matching KPI in emp.kpis
        updatedKpis = updatedKpis.map((k) => {
          if (k.id === condId || k.name === targetConduct?.name) {
            return {
              ...k,
              currentValue: scoreToApply,
            };
          }
          return k;
        });

        // Update all role-specific conduct maps
        const updatedObj = {
          ...emp,
          kpis: updatedKpis,
          techSupportConductPoints: { ...(emp.techSupportConductPoints || {}), [condId]: scoreToApply },
          customerSuccessConductPoints: { ...(emp.customerSuccessConductPoints || {}), [condId]: scoreToApply },
          marketingConductPoints: { ...(emp.marketingConductPoints || {}), [condId]: scoreToApply },
          salesConductPoints: { ...(emp.salesConductPoints || {}), [condId]: scoreToApply },
          operationsConductPoints: { ...(emp.operationsConductPoints || {}), [condId]: scoreToApply },
          managerConductPoints: { ...(emp.managerConductPoints || {}), [condId]: scoreToApply },
        };

        // Compute recalculated overall performance score
        let roleScoreSum = 0;
        let coreScoreSum = 0;
        updatedKpis.forEach((kpi) => {
          const contribution = calculateKPIContribution(kpi);
          if (kpi.id.startsWith("core-")) {
            coreScoreSum += contribution;
          } else {
            roleScoreSum += contribution;
          }
        });

        let roleScore = Math.max(0, Math.min(perfSettings.roleWeightLimit, roleScoreSum));
        let coreScore = Math.max(0, Math.min(perfSettings.conductWeightLimit, coreScoreSum));

        if (perfSettings.engineMode === "Strict Geometric") {
          roleScore = roleScore * 0.92;
          coreScore = coreScore * 0.92;
        } else if (perfSettings.engineMode === "Optimistic Capped") {
          roleScore = Math.min(perfSettings.roleWeightLimit, roleScore * 1.05);
          coreScore = Math.min(perfSettings.conductWeightLimit, coreScore * 1.05);
        }

        const factor = Math.pow(10, perfSettings.precisionDecimals);
        const baseScoreSum = Math.round((roleScore + coreScore) * factor) / factor;
        const penalty = emp.specialPenalty || 0;
        const cap = emp.perfCap !== undefined ? emp.perfCap : perfSettings.kpiCapLimit;
        const performanceBalance = Math.round(Math.max(0, Math.min(cap, baseScoreSum) - penalty) * factor) / factor;

        return {
          ...updatedObj,
          performanceScore: performanceBalance,
          performanceBalance: performanceBalance,
        };
      }

      // Compute recalculated overall performance score for standard update
      let roleScoreSum = 0;
      let coreScoreSum = 0;
      updatedKpis.forEach((kpi) => {
        const contribution = calculateKPIContribution(kpi);
        if (kpi.id.startsWith("core-")) {
          coreScoreSum += contribution;
        } else {
          roleScoreSum += contribution;
        }
      });

      let roleScore = Math.max(0, Math.min(perfSettings.roleWeightLimit, roleScoreSum));
      let coreScore = Math.max(0, Math.min(perfSettings.conductWeightLimit, coreScoreSum));

      if (perfSettings.engineMode === "Strict Geometric") {
        roleScore = roleScore * 0.92;
        coreScore = coreScore * 0.92;
      } else if (perfSettings.engineMode === "Optimistic Capped") {
        roleScore = Math.min(perfSettings.roleWeightLimit, roleScore * 1.05);
        coreScore = Math.min(perfSettings.conductWeightLimit, coreScore * 1.05);
      }

      const factor = Math.pow(10, perfSettings.precisionDecimals);
      const baseScoreSum = Math.round((roleScore + coreScore) * factor) / factor;
      const penalty = emp.specialPenalty || 0;
      const cap = emp.perfCap !== undefined ? emp.perfCap : perfSettings.kpiCapLimit;
      const performanceBalance = Math.round(Math.max(0, Math.min(cap, baseScoreSum) - penalty) * factor) / factor;

      return {
        ...emp,
        kpis: updatedKpis,
        performanceScore: performanceBalance,
        performanceBalance: performanceBalance,
      };
    });

    saveAndSyncState(updated);
    localStorage.setItem("company_employees_data", JSON.stringify(updated));

    // Determine conduct name & label for feedback
    let conductName = "";
    let valueLabel = "";
    if (bulkSelectedConductId.startsWith("core-")) {
      const match = CORE_KPIS_TEMPLATES.find(c => c.id === bulkSelectedConductId);
      conductName = match ? match.name : bulkSelectedConductId;
      if (bulkSelectedConductId === "core-2") {
        valueLabel = bulkConductScoreValue === 1 ? "Pass (Yes)" : "Deduct (No)";
      } else {
        valueLabel = `${bulkConductScoreValue}%`;
      }
    } else if (bulkSelectedConductId === "reset_all") {
      conductName = "All Core Conducts";
      valueLabel = "Reset to Default/Max";
    } else {
      const match = (perfSettings.companyWideConducts || []).find(c => c.id === bulkSelectedConductId);
      conductName = match ? match.name : "Custom Conduct";
      valueLabel = `${match ? match.points : 5} pts`;
    }

    setBulkAssignFeedback({
      conductName,
      employeeCount: selectedBulkEmpIds.length,
      valueLabel,
    });

    showSuccess(`Successfully bulk-mapped conduct settings for ${selectedBulkEmpIds.length} employees.`);
  };



  // Group items for search query filters
  const processedRoster = useMemo(() => {
    const roundToPrecision = (num: number) => {
      const factor = Math.pow(10, perfSettings.precisionDecimals);
      return Math.round(num * factor) / factor;
    };

    return scopedEmployees.map((emp) => {
      let roleScoreSum = 0;
      let coreScoreSum = 0;

      // Resolve template match for the employee
      const tmpl = templates.find((t) => {
        if (emp.applied_template_id && t.id === emp.applied_template_id) return true;
        const deptMatch = (t.department_id || "").toLowerCase().split(",").map(d => d.trim()).some(d => d === (emp.department || "").toLowerCase());
        const roleMatch = (t.role_id || "").toLowerCase().split(",").map(r => r.trim()).some(r => r === (emp.role || "").toLowerCase() || (emp.role || "").toLowerCase().includes(r));
        return deptMatch && roleMatch;
      });

      const isCumulative = tmpl?.is_manager_template && tmpl?.manager_template_type === "cumulative";
      let kpisToUse = emp.kpis ? emp.kpis.map((k) => ({ ...k })) : [];

      if (isCumulative && tmpl) {
        let reports = employees.filter(e => 
          e.reports_to === emp.employeeId || 
          e.reports_to === emp.id ||
          (e.department === emp.department && e.id !== emp.id && !(
            (e.role || "").toLowerCase().includes("manager") ||
            (e.role || "").toLowerCase().includes("lead") ||
            (e.role || "").toLowerCase().includes("director") ||
            (e.role || "").toLowerCase().includes("head") ||
            e.is_team_lead === true
          ))
        );
        const hasLinkedTemplates = (tmpl.linked_template_ids && tmpl.linked_template_ids.length > 0) || tmpl.linked_template_id;
        if (hasLinkedTemplates) {
          const ids = tmpl.linked_template_ids || (tmpl.linked_template_id ? [tmpl.linked_template_id] : []);
          const reportsOnLinkedTemplate = reports.filter(r => {
            const tId = getEmployeeMatchedTemplateId(r, templates);
            return tId && ids.includes(tId);
          });
          if (reportsOnLinkedTemplate.length > 0) {
            reports = reportsOnLinkedTemplate;
          }
        }

        if (reports.length > 0) {
          kpisToUse = kpisToUse.map((kpiItem) => {
            const isCore = CORE_KPIS_TEMPLATES.some((ck) => ck.name === kpiItem.name) || 
                           (perfSettings.companyWideConducts || []).some((c) => c.id === kpiItem.id || c.name === kpiItem.name);
            if (isCore) return kpiItem;

            let totalAchieved = 0;
            reports.forEach(report => {
              const match = (report.kpis || []).find(k => k.name.trim().toLowerCase() === kpiItem.name.trim().toLowerCase());
              if (match) {
                totalAchieved += (match.currentValue || 0);
              }
            });
            return {
              ...kpiItem,
              currentValue: Number((totalAchieved / reports.length).toFixed(1))
            };
          });
        }
      }

      if (kpisToUse.length > 0) {
        kpisToUse.forEach((kpi) => {
          const contribution = calculateKPIContribution(kpi);
          if (kpi.id.startsWith("core-")) {
            coreScoreSum += contribution;
          } else {
            roleScoreSum += contribution;
          }
        });
      }

      let roleScore = Math.max(
        0,
        Math.min(perfSettings.roleWeightLimit, roleScoreSum),
      );
      let coreScore = Math.max(
        0,
        Math.min(perfSettings.conductWeightLimit, coreScoreSum),
      );

      if (perfSettings.engineMode === "Strict Geometric") {
        roleScore = roleScore * 0.92;
        coreScore = coreScore * 0.92;
      } else if (perfSettings.engineMode === "Optimistic Capped") {
        roleScore = Math.min(perfSettings.roleWeightLimit, roleScore * 1.05);
        coreScore = Math.min(perfSettings.conductWeightLimit, coreScore * 1.05);
      }

      const baseScoreSum = roundToPrecision(roleScore + coreScore);

      const penalty = emp.specialPenalty || 0;
      const cap =
        emp.perfCap !== undefined ? emp.perfCap : perfSettings.kpiCapLimit;
      const performanceBalance = roundToPrecision(
        Math.max(0, Math.min(cap, baseScoreSum) - penalty),
      );

      const rewardPoints = emp.rewardPoints || 0;
      const netBalance = roundToPrecision(
        Math.max(0, performanceBalance + rewardPoints),
      );
      const cat = getRoleCategory(emp.role, emp.department);

      return {
        ...emp,
        kpis: kpisToUse,
        category: cat,
        performanceBalance,
        netBalance,
        rolePerfScore: roundToPrecision(roleScore),
      };
    });
  }, [scopedEmployees, employees, templates, perfSettings]);

  // Auto-selected employee tracker
  const selectedEmployee = useMemo(() => {
    return processedRoster.find((e) => e.id === selectedEmployeeId) || null;
  }, [processedRoster, selectedEmployeeId]);

  // Active KPI metrics scoring breakdown for selected employee
  const selectedEmployeeStats = useMemo(() => {
    const roundToPrecision = (num: number) => {
      const factor = Math.pow(10, perfSettings.precisionDecimals);
      return Math.round(num * factor) / factor;
    };

    if (!selectedEmployee || !selectedEmployee.kpis) {
      return {
        roleScore: 0,
        coreScore: 0,
        baseScoreSum: 0,
        performanceBalance: 0,
        netBalance: 0,
        specialPenalty: 0,
        perfCap: perfSettings.kpiCapLimit,
      };
    }

    let roleScoreSum = 0;
    let coreScoreSum = 0;

    selectedEmployee.kpis.forEach((kpi) => {
      const score = calculateKPIContribution(kpi);

      // Check if is role specific or core
      const id = kpi.id;
      if (id.startsWith("core-")) {
        coreScoreSum += score;
      } else {
        roleScoreSum += score;
      }
    });

    // Max role-specific KPIs (Role Performance) is capped at roleWeightLimit. Company-Wide Conduct KPIs make up the remaining conductWeightLimit.
    let roleScore = Math.max(
      0,
      Math.min(perfSettings.roleWeightLimit, roleScoreSum),
    );
    let coreScore = Math.max(
      0,
      Math.min(perfSettings.conductWeightLimit, coreScoreSum),
    );

    if (perfSettings.engineMode === "Strict Geometric") {
      roleScore = roleScore * 0.92;
      coreScore = coreScore * 0.92;
    } else if (perfSettings.engineMode === "Optimistic Capped") {
      roleScore = Math.min(perfSettings.roleWeightLimit, roleScore * 1.05);
      coreScore = Math.min(perfSettings.conductWeightLimit, coreScore * 1.05);
    }

    // Step 5: Add both scores together (Base performance score)
    const baseScoreSum = roundToPrecision(roleScore + coreScore);

    // Step 6: Apply any special caps or penalties
    const penalty = selectedEmployee.specialPenalty || 0;
    const cap =
      selectedEmployee.perfCap !== undefined
        ? selectedEmployee.perfCap
        : perfSettings.kpiCapLimit;
    const performanceBalance = roundToPrecision(
      Math.max(0, Math.min(cap, baseScoreSum) - penalty),
    );

    // Step 7: Add reward points
    const rewardPoints = selectedEmployee.rewardPoints || 0;

    // Step 8: Produce Net Balance
    const netBalance = roundToPrecision(
      Math.max(0, performanceBalance + rewardPoints),
    );

    return {
      roleScore: roundToPrecision(roleScore),
      coreScore: roundToPrecision(coreScore),
      baseScoreSum,
      performanceBalance,
      netBalance,
      specialPenalty: penalty,
      perfCap: cap,
    };
  }, [selectedEmployee, perfSettings]);

  // Memos for performance dashboard metrics
  const performanceStats = useMemo(() => {
    const total = processedRoster.length;
    if (total === 0)
      return { avgPerf: 0, avgNet: 0, highCount: 0, lowCount: 0, total: 0 };

    let sumPerf = 0;
    let sumNet = 0;
    let highCount = 0;
    let lowCount = 0;

    processedRoster.forEach((emp) => {
      sumPerf += emp.performanceBalance;
      sumNet += emp.netBalance;
      if (emp.performanceBalance >= 85) {
        highCount++;
      } else if (emp.performanceBalance < 75) {
        lowCount++;
      }
    });

    return {
      avgPerf: Math.round(sumPerf / total),
      avgNet: Math.round(sumNet / total),
      highCount,
      lowCount,
      total,
    };
  }, [processedRoster]);

  const topPerformersData = useMemo(() => {
    return [...processedRoster]
      .sort((a, b) => b.performanceBalance - a.performanceBalance)
      .slice(0, 3);
  }, [processedRoster]);

  const lowPerformersData = useMemo(() => {
    return [...processedRoster]
      .sort((a, b) => a.performanceBalance - b.performanceBalance)
      .slice(0, 3);
  }, [processedRoster]);

  const leaderboardSummaryData = useMemo(() => {
    return [...processedRoster]
      .sort((a, b) => b.netBalance - a.netBalance)
      .slice(0, 4);
  }, [processedRoster]);

  // Filtered result set
  const filteredRoster = useMemo(() => {
    return processedRoster.filter((emp) => {
      const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
      const matchesSearch =
        fullName.includes(searchQuery.toLowerCase()) ||
        (emp.employeeId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (emp.role || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGroup =
        selectedRoleGroup === "All" || emp.category === selectedRoleGroup;

      const matchesRoleFilter =
        overviewFilterRole === "All" || emp.role === overviewFilterRole;
      const matchesDateFilter =
        !overviewFilterDate ||
        (emp.hireDate && emp.hireDate.includes(overviewFilterDate)) ||
        (emp.created_at && emp.created_at.includes(overviewFilterDate));

      return (
        matchesSearch && matchesGroup && matchesRoleFilter && matchesDateFilter
      );
    });
  }, [
    processedRoster,
    searchQuery,
    selectedRoleGroup,
    overviewFilterRole,
    overviewFilterDate,
  ]);

  // Memoized filtered employees list for bulk conduct operations
  const filteredBulkEmployees = useMemo(() => {
    return processedRoster.filter((emp) => {
      // Filter Department
      if (bulkFilterDept !== "All") {
        if (emp.department !== bulkFilterDept) return false;
      }
      // Filter Employee Type
      if (bulkFilterEmpType !== "All") {
        if (emp.employeeType !== bulkFilterEmpType) return false;
      }
      // Filter Role Group
      if (bulkFilterRoleGroup !== "All") {
        const isEmpLead = !!(
          emp.is_team_lead ||
          (emp.role || "").toLowerCase().includes("lead") ||
          (emp.role || "").toLowerCase().includes("manager") ||
          (emp.role || "").toLowerCase().includes("head") ||
          (emp.role || "").toLowerCase().includes("director")
        );
        if (bulkFilterRoleGroup === "Manager" && !isEmpLead) return false;
        if (bulkFilterRoleGroup === "Ordinary" && isEmpLead) return false;
      }
      // Search Query
      if (bulkSearchQuery.trim()) {
        const q = bulkSearchQuery.toLowerCase();
        const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
        const role = (emp.role || "").toLowerCase();
        const empId = (emp.employeeId || "").toLowerCase();
        if (!fullName.includes(q) && !role.includes(q) && !empId.includes(q)) return false;
      }
      return true;
    });
  }, [processedRoster, bulkFilterDept, bulkFilterEmpType, bulkFilterRoleGroup, bulkSearchQuery]);

  // KPI Weight balance diagnostic check
  const isWeightValidForSelected = useMemo(() => {
    if (!selectedEmployee || !selectedEmployee.kpis) return true;
    let roleWeightTotal = 0;
    let coreWeightTotal = 0;

    selectedEmployee.kpis.forEach((kpi) => {
      if (kpi.id.startsWith("core-")) {
        coreWeightTotal += kpi.weight;
      } else {
        roleWeightTotal += kpi.weight;
      }
    });

    return roleWeightTotal <= 80 && coreWeightTotal <= 20;
  }, [selectedEmployee]);

  // Slider inputs action
  const handleSliderChange = (kpiId: string, val: number) => {
    if (!selectedEmployeeId) return;
    const updated = employees.map((emp) => {
      if (emp.id === selectedEmployeeId && emp.kpis) {
        const newKpis = emp.kpis.map((k) => {
          if (k.id === kpiId) {
            return { ...k, currentValue: val };
          }
          return k;
        });
        return { ...emp, kpis: newKpis };
      }
      return emp;
    });
    saveAndSyncState(updated);
  };

  // Point additions/deductions action
  const handlePointsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pts = parseInt(pointsDelta, 10);
    if (isNaN(pts) || !selectedEmployeeId) return;

    const updated = employees.map((emp) => {
      if (emp.id === selectedEmployeeId) {
        const current = emp.rewardPoints || 0;
        return {
          ...emp,
          rewardPoints: Math.max(0, current + pts),
        };
      }
      return emp;
    });

    saveAndSyncState(updated);
    setPointsDelta("");
    showSuccess(`Earned reward points balance updated successfully!`);
  };

  // New Define Reward Event Handler
  const handleDefineRewardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditPerformance) {
      showError("You do not have permission to edit or record rewards and penalties.");
      return;
    }
    const targetEmpId = rewardEmployeeId || selectedEmployeeId;
    if (!targetEmpId) {
      showError(
        "Please select a target employee to receive the reward/penalty.",
      );
      return;
    }

    const isPenalty = rewardClassification === "penalty" || rewardType === "penalty";
    let finalRewardType = isPenalty ? "penalty" : rewardType;
    let finalPoints = Number(rewardPointsValue);
    let finalReason = rewardReason;

    if (isPenalty) {
      const activePenaltyId = selectedPenaltyId || (engineeringPenaltiesList[0]?.id || "");
      const foundPen = engineeringPenaltiesList.find(
        (p) => p.id === activePenaltyId,
      );
      finalRewardType = "penalty";
      finalPoints = -Math.abs(finalPoints);
      if (foundPen) {
        finalReason = `Penalty: ${foundPen.name}. ${rewardReason}`;
      } else {
        finalReason = `Penalty. ${rewardReason}`;
      }
    } else {
      finalRewardType =
        (rewardType === "custom" ? customRewardType.trim() : rewardType) ||
        "custom_reward";
      if (rewardType === "custom" && !customRewardType.trim()) {
        showError("Please input a name for the custom reward type.");
        return;
      }
    }

    if (!rewardReason.trim()) {
      showError("Please describe the reason or citation for this entry.");
      return;
    }

    const pointsNum = Number(rewardPointsValue);
    if (isNaN(pointsNum) || pointsNum <= 0) {
      showError("Please enter a valid positive number for points.");
      return;
    }

    const newReward = {
      id: "RWD-" + Date.now(),
      employee_id: targetEmpId,
      period_id: rewardPeriodId,
      reward_type: finalRewardType,
      points: finalPoints,
      reason: finalReason,
      source: rewardSource || "Admin Portal",
      related_record_id: rewardRelatedRecordId || "N/A",
      created_by: rewardCreatedBy || "Admin",
      created_at: new Date().toISOString(),
    };

    const updatedRewards = [newReward, ...companyRewards];
    setCompanyRewards(updatedRewards);
    localStorage.setItem(
      "company_rewards_history_list",
      JSON.stringify(updatedRewards),
    );

    const updatedEmployees = employees.map((emp) => {
      if (emp.id === targetEmpId) {
        return {
          ...emp,
          rewardPoints: Math.max(0, (emp.rewardPoints || 0) + finalPoints),
        };
      }
      return emp;
    });

    saveAndSyncState(updatedEmployees);

    // Reset inputs
    setRewardReason("");
    setRewardRelatedRecordId("");
    setCustomRewardType("");
    setIsDefineRewardModalOpen(false);

    showSuccess(
      isPenalty
        ? `Successfully created penalty record! Deducted ${pointsNum} points from the employee.`
        : `Successfully created '${newReward.reward_type}' reward record! Attached +${pointsNum} points to the employee.`,
    );
  };

  // Revoke reward point logic
  const handleDeleteReward = (rewardId: string) => {
    if (!canEditPerformance) {
      showError("You do not have permission to edit or record rewards and penalties.");
      return;
    }
    if (
      !window.confirm(
        "Are you sure you want to delete/revoke this reward record? This will also deduct the points from the employee's balance.",
      )
    )
      return;

    const rewardToDelete = companyRewards.find((r) => r.id === rewardId);
    if (!rewardToDelete) return;

    const updatedRewards = companyRewards.filter((r) => r.id !== rewardId);
    setCompanyRewards(updatedRewards);
    localStorage.setItem(
      "company_rewards_history_list",
      JSON.stringify(updatedRewards),
    );

    const updatedEmployees = employees.map((emp) => {
      if (emp.id === rewardToDelete.employee_id) {
        return {
          ...emp,
          rewardPoints: Math.max(
            0,
            (emp.rewardPoints || 0) - rewardToDelete.points,
          ),
        };
      }
      return emp;
    });

    saveAndSyncState(updatedEmployees);
    showSuccess(
      "Reward record revoked successfully. Points have been deducted from employee balance.",
    );
  };

  // Override or reset employee KPI layout to initial defaults
  const handleResetToDefaults = () => {
    if (!selectedEmployeeId) return;
    const updated = employees.map((emp) => {
      if (emp.id === selectedEmployeeId) {
        const cat = getRoleCategory(emp.role, emp.department);
        const roleKpis =
          ROLE_KPINAMES_TEMPLATES[cat] || ROLE_KPINAMES_TEMPLATES.support;
        const combinedKpis = [
          ...roleKpis.map((k) => ({ ...k })),
          ...CORE_KPIS_TEMPLATES.map((k) => ({ ...k })),
        ];
        return {
          ...emp,
          kpis: combinedKpis as unknown as EmployeeKPI[],
        };
      }
      return emp;
    });
    saveAndSyncState(updated);
    showSuccess("Standardized role configuration reset successfully!");
  };

  // TEMPLATE ACTIONS & HANDLERS
  const handleCreateNewTemplateWithChoice = (isMgr: boolean, type: "regular" | "cumulative" | undefined) => {
    setHasClickedConductMetrics(false);
    setCurrentTemplateId(null);
    setTemplateName(isMgr ? `Manager Blueprint (${type === "cumulative" ? "Cumulative KPIs" : "Regular KPIs"})` : "");
    setTemplateDescription(isMgr ? `Strategic performance template for corporate manager / team leads` : "");
    setTemplateRole(isMgr ? "Manager, Lead, Director" : "");
    setTemplateDepartment(isMgr ? "Management" : "");
    setTemplateMonth("July");
    setTemplateYear("2026");
    setTemplateTeamMonthlyTarget(60000000);
    setTemplateTeamMembersCount(10);
    setTemplateIndividualMonthlyTarget(6000000);
    setTemplateRoleLimit(80);
    setTemplateConductLimit(20);
    setIsManagerTemplate(isMgr);
    setManagerTemplateType(type);
    setLinkedTemplateIds([]);

    let kpisToLoad: TemplateKpiItem[] = [];
    if (isMgr) {
      if (type === "regular") {
        kpisToLoad = [
          {
            id: "mgr-kpi-1-" + Date.now(),
            name: "Team Performance & Deliverables SLA",
            type: "Percentage",
            weight: 30,
            targetValue: 100,
            unit: "%",
            capValue: 100,
            validationRule: "Must be standard positive percentage",
          },
          {
            id: "mgr-kpi-2-" + Date.now(),
            name: "Leadership Quality & Team Mentorship Feedback",
            type: "Target-Based",
            weight: 30,
            targetValue: 5,
            unit: "★",
            capValue: 5,
            validationRule: "Must be rating out of 5",
          },
          {
            id: "mgr-kpi-3-" + Date.now(),
            name: "Departmental Cost & Budget Compliance",
            type: "Percentage",
            weight: 20,
            targetValue: 100,
            unit: "%",
            capValue: 100,
            validationRule: "Must not exceed budget limit",
          }
        ];
      } else if (type === "cumulative") {
        kpisToLoad = [
          {
            id: "mgr-kpi-cum-" + Date.now(),
            name: "Cumulative Direct Reports KPIs Average Score",
            type: "Percentage",
            weight: 80,
            targetValue: 100,
            unit: "%",
            capValue: 100,
            validationRule: "Calculated automatically from employee raw KPIs",
          }
        ];
      }
    }
    setTemplateKpis(kpisToLoad);

    // For conduct metrics, the conduct metrics are not selected. Leave it on selected and unchecked.
    setTemplateConducts([]);
    setIsEditingTemplate(true);
  };

  const handleCreateNewTemplate = () => {
    // Show the manager setup prompt first
    setShowManagerSetupPrompt(true);
  };

  const handleEditTemplate = (tmpl: PerformanceTemplate) => {
    setHasClickedConductMetrics(true);
    setCurrentTemplateId(tmpl.id);
    setTemplateName(tmpl.name);
    setTemplateDescription(tmpl.description || "");
    setTemplateRole(tmpl.role_id);
    setTemplateDepartment(tmpl.department_id);
    setTemplateMonth(tmpl.month || "July");
    setTemplateYear(tmpl.year || "2026");
    setTemplateTeamMonthlyTarget(tmpl.teamMonthlyTarget ?? 60000000);
    setTemplateTeamMembersCount(tmpl.teamMembersCount ?? 10);
    setTemplateIndividualMonthlyTarget(tmpl.individualMonthlyTarget ?? 6000000);
    setTemplateRoleLimit(tmpl.performance_weight_limit ?? 80);
    setTemplateConductLimit(tmpl.conduct_weight_limit ?? 20);
    setTemplateKpis([...tmpl.kpiItems]);
    setTemplateConducts([...tmpl.conductCategories]);
    setIsManagerTemplate(tmpl.is_manager_template ?? false);
    setManagerTemplateType(tmpl.manager_template_type ?? "regular");
    if (tmpl.linked_template_ids) {
      setLinkedTemplateIds(tmpl.linked_template_ids);
    } else if (tmpl.linked_template_id) {
      setLinkedTemplateIds([tmpl.linked_template_id]);
    } else {
      setLinkedTemplateIds([]);
    }
    setIsEditingTemplate(true);
  };

  const handleDuplicateTemplate = (tmpl: PerformanceTemplate) => {
    const duplicated: PerformanceTemplate = {
      ...tmpl,
      id: `template-${Date.now()}`,
      name: `${tmpl.name} (Copy)`,
    };
    saveTemplates([...templates, duplicated]);
  };

  const handleToggleActiveTemplate = (id: string, currentlyActive: boolean) => {
    const targetTemplate = templates.find((t) => t.id === id);
    if (!currentlyActive && targetTemplate) {
      const missingTarget = targetTemplate.kpiItems.some(
        (kpi) =>
          kpi.targetValue === undefined ||
          kpi.targetValue === null ||
          Number.isNaN(kpi.targetValue) ||
          kpi.targetValue <= 0,
      );
      if (missingTarget) {
        showError(
          `Cannot activate template: Each KPI must have a positive target value defined.`,
        );
        return;
      }
    }
    const updated = templates.map((t) =>
      t.id === id ? { ...t, is_active: !currentlyActive } : t,
    );
    saveTemplates(updated);
  };

  const handleDeleteTemplate = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Performance Template",
      message: "Are you sure you want to delete this reusable performance template? This action cannot be undone.",
      onConfirm: () => {
        const updated = templates.filter((t) => t.id !== id);
        saveTemplates(updated);
        
        // Save deleted ID to avoid merging default template back on reload
        try {
          const deletedIdsJson = localStorage.getItem("deleted_template_ids") || "[]";
          const deletedIds = JSON.parse(deletedIdsJson) as string[];
          if (!deletedIds.includes(id)) {
            deletedIds.push(id);
            localStorage.setItem("deleted_template_ids", JSON.stringify(deletedIds));
          }
        } catch (err) {
          console.error("Failed to save deleted template IDs", err);
        }

        showSuccess("Performance Template deleted successfully!");
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleAddKpiToTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kpiItemName.trim()) return;

    const currentSum = templateKpis.reduce((sum, item) => sum + item.weight, 0);
    if (currentSum + kpiItemWeight > templateRoleLimit) {
      showError(
        `Weight Limit exceeded! Role KPIs weight total cannot exceed ${templateRoleLimit}%. Current: ${currentSum}%, attempting to add ${kpiItemWeight}%.`,
      );
      return;
    }

    const newItem: TemplateKpiItem = {
      id: "kpi-" + Date.now(),
      name: kpiItemName,
      type: kpiItemType,
      weight: kpiItemWeight,
      targetValue: kpiItemTarget,
      unit: kpiItemUnit,
      capValue: kpiItemCap,
      validationRule: kpiItemValidation,
    };

    setTemplateKpis([...templateKpis, newItem]);
    setKpiItemName("");
    setKpiItemWeight(15);
    setKpiItemTarget(100);
    setKpiItemUnit("%");
    setKpiItemCap(100);
    setKpiItemValidation("Value must be greater than zero");
    showSuccess("New KPI added to current template draft.");
  };

  const handleRemoveKpiFromTemplate = (id: string) => {
    setTemplateKpis(templateKpis.filter((k) => k.id !== id));
  };

  const syncKpisForLinkedTemplates = (newIds: string[]) => {
    const selectedTmpls = templates.filter(tmpl => newIds.includes(tmpl.id));
    if (selectedTmpls.length > 0) {
      const uniqueKpis: TemplateKpiItem[] = [];
      const addedNames = new Set<string>();
      
      selectedTmpls.forEach(selectedTmpl => {
        selectedTmpl.kpiItems.forEach(k => {
          const normalized = k.name.trim().toLowerCase();
          if (!addedNames.has(normalized)) {
            addedNames.add(normalized);
            uniqueKpis.push({
              ...k,
              id: `kpi-cumul-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            });
          }
        });
      });
      
      setTemplateKpis(uniqueKpis);
      
      const firstTmpl = selectedTmpls[0];
      setTemplateRoleLimit(firstTmpl.performance_weight_limit ?? 80);
      setTemplateConductLimit(firstTmpl.conduct_weight_limit ?? 20);
      
      if (!templateRole || templateRole === "Manager, Lead, Director" || templateRole.endsWith(" Team Lead")) {
        const roles = selectedTmpls.map(tmpl => tmpl.role_id).filter(Boolean);
        const uniqueRoles = Array.from(new Set(roles));
        setTemplateRole(`${uniqueRoles.join(" & ")} Team Lead`);
      }
      if (!templateDepartment || templateDepartment === "Management" || templateDepartment.includes(",")) {
        const depts = selectedTmpls.map(tmpl => tmpl.department_id).filter(Boolean);
        const uniqueDepts = Array.from(new Set(depts));
        setTemplateDepartment(uniqueDepts.join(", "));
      }
    } else {
      setTemplateKpis([]);
    }
  };

  const handleAddConductToTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!conductItemName.trim()) {
      showError("Please select a predefined conduct metric first.");
      return;
    }

    const currentSum = templateConducts.reduce(
      (sum, item) => sum + item.weight,
      0,
    );
    if (currentSum + conductItemWeight > templateConductLimit) {
      showError(
        `Weight Limit exceeded! Conduct weight total cannot exceed ${templateConductLimit}%. Current: ${currentSum}%, attempting to add ${conductItemWeight}%.`,
      );
      return;
    }

    const isAlreadyAdded = templateConducts.some(
      (c) => c.name && c.name.toLowerCase() === conductItemName.trim().toLowerCase()
    );
    if (isAlreadyAdded) {
      showError("This conduct metric is already added to the template.");
      return;
    }

    const foundConduct = (perfSettings.companyWideConducts || []).find(
      (c) => c.name && c.name.toLowerCase() === conductItemName.trim().toLowerCase()
    );

    const newItem: TemplateConductItem = {
      id: foundConduct ? foundConduct.id : "cond-" + Date.now(),
      name: conductItemName,
      type: conductItemType,
      weight: conductItemWeight,
      targetValue: conductItemTarget,
      unit: conductItemUnit,
    };

    setTemplateConducts([...templateConducts, newItem]);
    setConductItemName("");
    setConductItemWeight(5);
    setConductItemTarget(100);
    setConductItemUnit("%");
    showSuccess("Conduct Category added to current template draft.");
  };

  const handleRemoveConductFromTemplate = (id: string) => {
    setTemplateConducts(templateConducts.filter((c) => c.id !== id));
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName.trim()) {
      showError("Please enter a Template name.");
      return;
    }

    const totalKpiWeight = templateKpis.reduce(
      (sum, item) => sum + item.weight,
      0,
    );
    const totalConductWeight = templateConducts.reduce(
      (sum, item) => sum + item.weight,
      0,
    );

    if (totalKpiWeight !== templateRoleLimit) {
      showError(
        `Weight mismatch! Total role-specific weights is ${totalKpiWeight}%, but target limit is ${templateRoleLimit}%. Please make weights sum to exactly ${templateRoleLimit}%.`,
      );
      return;
    }

    if (totalConductWeight !== templateConductLimit) {
      showError(
        `Weight mismatch! Total conduct weights is ${totalConductWeight}%, but target limit is ${templateConductLimit}%. Please make weights sum to exactly ${templateConductLimit}%.`,
      );
      return;
    }

    const missingTarget = templateKpis.some(
      (kpi) =>
        kpi.targetValue === undefined ||
        kpi.targetValue === null ||
        Number.isNaN(kpi.targetValue) ||
        kpi.targetValue <= 0,
    );
    if (missingTarget) {
      showError(
        `Cannot save and activate template: Each KPI must have a positive target value defined.`,
      );
      return;
    }

    const newOrUpdated: PerformanceTemplate = {
      id: currentTemplateId || "tmpl-" + Date.now(),
      name: templateName,
      role_id: templateRole || "General Staff",
      department_id: templateDepartment || "General Operations",
      month: templateMonth,
      year: templateYear,
      teamMonthlyTarget: Number(templateTeamMonthlyTarget) || 0,
      teamMembersCount: Number(templateTeamMembersCount) || 1,
      individualMonthlyTarget: Number(templateIndividualMonthlyTarget) || 0,
      description: templateDescription || "Template",
      created_by: "Admin",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true,
      performance_weight_limit: templateRoleLimit,
      conduct_weight_limit: templateConductLimit,
      kpiItems: templateKpis,
      conductCategories: templateConducts,
      is_manager_template: isManagerTemplate,
      manager_template_type: managerTemplateType,
      linked_template_id: isManagerTemplate && managerTemplateType === "cumulative" ? (linkedTemplateIds[0] || undefined) : undefined,
      linked_template_ids: isManagerTemplate && managerTemplateType === "cumulative" ? linkedTemplateIds : undefined,
    };

    let updatedList: PerformanceTemplate[];
    if (currentTemplateId) {
      updatedList = templates.map((t) =>
        t.id === currentTemplateId ? newOrUpdated : t,
      );
    } else {
      updatedList = [...templates, newOrUpdated];
    }

    saveTemplates(updatedList);

    // Auto apply created cumulative template to the selected department and role (manager with the role)
    let appliedCount = 0;
    if (isManagerTemplate && managerTemplateType === "cumulative") {
      const targetDepts = (newOrUpdated.department_id || "")
        .split(",")
        .map((d) => d.trim().toLowerCase())
        .filter(Boolean);

      const targetRoles = (newOrUpdated.role_id || "")
        .split(",")
        .map((r) => r.trim().toLowerCase())
        .filter(Boolean);

      const updatedEmployees = employees.map((emp) => {
        const empDept = (emp.department || "").toLowerCase().trim();
        const empRole = (emp.role || "").toLowerCase().trim();

        // Check department matches: either exact, contains or template contains employee department
        const isDeptMatch = targetDepts.length === 0 || targetDepts.some(d => empDept === d || empDept.includes(d) || d.includes(empDept));
        
        // Check role matches: either exact, contains, or template contains employee role
        const isRoleMatch = targetRoles.length === 0 || targetRoles.some(r => {
          const isManagerType = empRole.includes("manager") || empRole.includes("lead") || empRole.includes("director") || emp.is_team_lead;
          return empRole === r || empRole.includes(r) || r.includes(empRole) || (isManagerType && (r.includes("manager") || r.includes("lead") || r.includes("director") || r.includes("head") || r.split(" ").some(word => word.length > 3 && empRole.includes(word))));
        });

        if (isDeptMatch && isRoleMatch) {
          appliedCount++;
          const transformedKpis: EmployeeKPI[] = [
            ...newOrUpdated.kpiItems.map((item) => ({
              id: "item-" + item.id,
              name: item.name,
              type: item.type,
              weight: item.weight,
              currentValue: item.type === "Binary" ? 1 : item.targetValue * 0.9,
              targetValue: item.targetValue,
              unit: item.unit,
              maxWeightRange: newOrUpdated.performance_weight_limit,
            })),
            ...newOrUpdated.conductCategories.map((cat) => ({
              id: "core-" + cat.id,
              name: cat.name,
              type: cat.type,
              weight: cat.weight,
              currentValue: cat.type === "Binary" ? 1 : cat.targetValue * 0.95,
              targetValue: cat.targetValue,
              unit: cat.unit,
              maxWeightRange: newOrUpdated.conduct_weight_limit,
            })),
          ];

          return {
            ...emp,
            applied_template_id: newOrUpdated.id,
            kpis: transformedKpis,
          };
        }
        return emp;
      });

      if (appliedCount > 0) {
        saveAndSyncState(updatedEmployees);
      }
    }

    setIsEditingTemplate(false);
    setCurrentTemplateId(null);
    showSuccess(`Performance Template "${templateName}" saved successully!${appliedCount > 0 ? ` Automatically applied template to ${appliedCount} matching managers.` : ""}`);
  };

  const handleApplyTemplateToEmployees = () => {
    if (!applyingTemplate) return;

    if (applySelectedEmpIds.length === 0) {
      showError("Please select at least one employee.");
      return;
    }

    let count = 0;
    const updated = employees.map((emp) => {
      let shouldApply = applySelectedEmpIds.includes(emp.id);

      if (shouldApply) {
        // Transform target template items to standard live KPIs structure
        const transformedKpis: EmployeeKPI[] = [
          ...applyingTemplate.kpiItems.map((item) => ({
            id: "item-" + item.id,
            name: item.name,
            type: item.type,
            weight: item.weight,
            currentValue: item.type === "Binary" ? 1 : item.targetValue * 0.9,
            targetValue: item.targetValue,
            unit: item.unit,
            maxWeightRange: applyingTemplate.performance_weight_limit,
          })),
          ...applyingTemplate.conductCategories.map((cat) => ({
            id: "core-" + cat.id,
            name: cat.name,
            type: cat.type,
            weight: cat.weight,
            currentValue: cat.type === "Binary" ? 1 : cat.targetValue * 0.95,
            targetValue: cat.targetValue,
            unit: cat.unit,
            maxWeightRange: applyingTemplate.conduct_weight_limit,
          })),
        ];

        count++;
        return {
          ...emp,
          role:
            applyingTemplate.role_id !== "General Staff"
              ? (applyingTemplate.role_id.split(",").map(r => r.trim().toLowerCase()).includes((emp.role || "").toLowerCase())
                ? emp.role
                : (applyingTemplate.role_id.split(",")[0]?.trim() || "General Staff"))
              : emp.role,
          department:
            applyingTemplate.department_id !== "General Operations"
              ? (applyingTemplate.department_id.split(",").map(d => d.trim().toLowerCase()).includes((emp.department || "").toLowerCase())
                ? emp.department
                : (applyingTemplate.department_id.split(",")[0]?.trim() || "General Operations"))
              : emp.department,
          kpis: transformedKpis,
          applied_template_id: applyingTemplate.id,
        };
      }
      return emp;
    });

    saveAndSyncState(updated);
    setApplyingTemplate(null);
    setApplySelectedEmpIds([]);
    setApplySearchQuery("");
    setIsApplySearchFocused(false);
    showSuccess(
      `Template applied successfully! Reconfigured scoring indices for ${count} employee(s).`,
    );
  };

  // Aggregate values for telemetry reports
  const visualAggregates = useMemo(() => {
    if (processedRoster.length === 0) return [];
    const groups: Record<string, { sum: number; count: number }> = {};

    processedRoster.forEach((e) => {
      if (!groups[e.category]) {
        groups[e.category] = { sum: 0, count: 0 };
      }
      groups[e.category].sum += e.performanceBalance;
      groups[e.category].count += 1;
    });

    return Object.keys(groups).map((key) => {
      const prettyName =
        key === "marketer"
          ? "Marketers"
          : key === "sales"
            ? "Sales Executives"
            : key === "support"
              ? "CX Support"
              : key === "engineer"
                ? "Engineers"
                : "Customer Success";
      return {
        name: prettyName,
        averageScore: Math.round(groups[key].sum / groups[key].count),
      };
    });
  }, [processedRoster]);

  return (
    <div
      className="w-full bg-slate-50 min-h-screen pb-16 flex flex-col font-sans text-slate-800"
      id="flexible-scoring-view"
    >
      {/* Top Navigation Strip */}
      <div className="bg-white border-b border-slate-200 px-2 sm:px-6 flex overflow-x-auto gap-4 custom-scrollbar">
        {!isTeamLead && (
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 px-2 sm:px-4 py-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === "overview"
                ? "border-[#02275A] text-[#02275A]"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
            id="kpi-overview-tab"
          >
            <i className="fas fa-users-cog"></i> Overview
          </button>
        )}
        <button
          onClick={() => setActiveTab("team-performance")}
          className={`flex items-center gap-2 px-2 sm:px-4 py-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === "team-performance"
              ? "border-[#02275A] text-[#02275A]"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
          }`}
          id="team-performance-tab"
        >
          <i className="fas fa-users"></i> Rating
        </button>
        <button
          onClick={() => setActiveTab("performance-reports")}
          className={`flex items-center gap-2 px-2 sm:px-4 py-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === "performance-reports"
              ? "border-[#02275A] text-[#02275A]"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
          }`}
          id="performance-reports-tab"
        >
          <i className="fas fa-chart-pie"></i> Performance Reports
        </button>
        <button
          onClick={() => setActiveTab("conduct")}
          className={`flex items-center gap-2 px-2 sm:px-4 py-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === "conduct"
              ? "border-[#02275A] text-[#02275A]"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
          }`}
          id="kpi-conduct-tab"
        >
          <i className="fas fa-gavel"></i> Company Conduct
        </button>
        <button
          onClick={() => setActiveTab("rewards")}
          className={`flex items-center gap-2 px-2 sm:px-4 py-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === "rewards"
              ? "border-[#02275A] text-[#02275A]"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
          }`}
          id="kpi-rewards-tab"
        >
          <i className="fas fa-gift"></i> Rewards & Recognition
        </button>
        <button
          onClick={() => setActiveTab("leaderboard")}
          className={`flex items-center gap-2 px-2 sm:px-4 py-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === "leaderboard"
              ? "border-[#02275A] text-[#02275A]"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
          }`}
          id="kpi-leaderboard-tab"
        >
          <i className="fas fa-trophy"></i> Leaderboard
        </button>
        {!isTeamLead && (
          <button
            onClick={() => setActiveTab("templates")}
            className={`flex items-center gap-2 px-2 sm:px-4 py-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === "templates"
                ? "border-[#02275A] text-[#02275A]"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
            id="kpi-templates-tab"
          >
            <i className="fas fa-file-alt"></i> Templates
          </button>
        )}
        <button
          onClick={() => setActiveTab("bulk-upload")}
          className={`flex items-center gap-2 px-2 sm:px-4 py-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === "bulk-upload"
              ? "border-[#02275A] text-[#02275A]"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
          }`}
          id="kpi-bulk-upload-tab"
        >
          <i className="fas fa-cloud-upload-alt"></i> Bulk Upload
        </button>
        {isTeamLead && (
          <button
            onClick={() => setActiveTab("leave")}
            className={`flex items-center gap-2 px-2 sm:px-4 py-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === "leave"
                ? "border-[#02275A] text-[#02275A]"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
            id="kpi-leave-tab"
          >
            <i className="fas fa-calendar-times"></i> Leave
          </button>
        )}
        {!isTeamLead && (
          <button
            onClick={() => {
              setActiveTab("settings");
            }}
            className={`flex items-center gap-2 px-2 sm:px-4 py-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === "settings"
                ? "border-[#02275A] text-[#02275A]"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
            id="kpi-settings-tab"
          >
            <i className="fas fa-cog"></i> Settings
          </button>
        )}
      </div>

      {/* Sub views */}
      <div className="px-6 py-6 flex-1">
        {activeTab === "performance-reports" && (
          <div className="animate-fade-in">
            <PerformanceReportsSubView />
          </div>
        )}

        {activeTab === "team-performance" && (
          <div className="animate-fade-in -mx-6 -my-6">
            <AdminHRCenterView
              initialTab="performance"
              hideTabs={true}
              completelyHideTabs={true}
              autoOpenReviewModal={triggerAdminHRCenterReview}
              departmentFilter={isTeamLead ? userDepartment : (perfSettings.performanceDepartmentFilter === "All" || !perfSettings.performanceDepartmentFilter ? "" : perfSettings.performanceDepartmentFilter)}
              userRole={userRole}
              userDepartment={userDepartment}
            />
          </div>
        )}

        {/* 0. LEAVE TAB */}
        {activeTab === "leave" && (
          <div className="animate-fade-in py-6">
            <AdminLeaveRequestsView userDepartment={isTeamLead ? userDepartment : undefined} />
          </div>
        )}

        {/* 1. ROSTER & SCORECARD VIEW */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-fade-in">
            {/* Overview Page Header & Single Action Trigger Button */}
            <div
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm gap-4"
              id="overview-header-actions-panel"
            >
              <div>
                <h2 className="text-xl font-black text-[#02275A] flex items-center gap-2">
                  <i className="fas fa-chart-pie text-[#02275A]/70"></i>{" "}
                  Performance Appraisal Console
                </h2>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  Real-time tracking of staff KPIs, weighted operational
                  compliance indicators, and supplemental rewards.
                </p>
              </div>

              {/* THE SINGLE ACTION BUTTON requested by prompt */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <button
                    onClick={() =>
                      setIsOverviewFilterOpen(!isOverviewFilterOpen)
                    }
                    className="bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-all font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl shadow-sm flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
                    id="overview-filter-btn"
                  >
                    <i className="fas fa-filter text-slate-400"></i> Filter
                  </button>

                  {isOverviewFilterOpen && (
                    <div
                      className="absolute right-0 mt-2 w-64 bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden py-3 px-4 animate-fade-in"
                      id="overview-filter-dropdown"
                    >
                      <div className="mb-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                          Role
                        </label>
                        <select
                          value={overviewFilterRole}
                          onChange={(e) =>
                            setOverviewFilterRole(e.target.value)
                          }
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#02275A] focus:ring-1 focus:ring-[#02275A]"
                        >
                          <option value="All">All Roles</option>
                          {Array.from(
                            new Set(processedRoster.map((e) => e.role)),
                          ).map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="mb-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                          Date
                        </label>
                        <input
                          type="date"
                          value={overviewFilterDate}
                          onChange={(e) =>
                            setOverviewFilterDate(e.target.value)
                          }
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#02275A] focus:ring-1 focus:ring-[#02275A]"
                        />
                      </div>
                      <button
                        onClick={() => {
                          setOverviewFilterRole("All");
                          setOverviewFilterDate("");
                        }}
                        className="w-full bg-slate-50 text-slate-500 hover:text-slate-700 hover:bg-slate-100 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors"
                      >
                        Reset Filters
                      </button>
                    </div>
                  )}
                </div>
                {canEditPerformance && (
                  <div className="relative">
                    <button
                      onClick={() => setIsQuickActionOpen(!isQuickActionOpen)}
                      className="bg-[#02275A] text-white hover:bg-opacity-90 transition-all font-black text-xs uppercase tracking-wider px-5 py-3 rounded-xl shadow-lg shadow-[#02275A]/20 flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
                      id="quick-perf-actions-btn"
                    >
                      <i className="fas fa-bolt text-amber-400"></i> Quick Action{" "}
                      <i
                        className={`fas fa-chevron-${isQuickActionOpen ? "up" : "down"} text-[10px] ml-1`}
                      ></i>
                    </button>

                    {isQuickActionOpen && (
                      <div
                        className="absolute right-0 mt-2 w-64 bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden py-1.5 animate-fade-in"
                        id="quick-action-dropdown-list"
                      >
                        <div className="px-3 py-1 pb-2 border-b border-slate-100 mb-1.5">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                            Action Selector
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            setActiveTab("team-performance");
                            setTriggerAdminHRCenterReview(true);
                            setIsQuickActionOpen(false);

                            setTimeout(() => {
                              setTriggerAdminHRCenterReview(false);
                            }, 500);
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-bold text-[#02275A] hover:bg-[#02275A]/5 transition-colors flex items-center gap-2"
                        >
                          <div className="w-6 h-6 rounded-lg bg-[#02275A]/10 flex items-center justify-center text-[#02275A]">
                            <i className="fas fa-clipboard-check text-[11px]"></i>
                          </div>
                          <span>Review Staff</span>
                        </button>

                        <button
                          onClick={() => {
                            if (employees.length > 0 && !rewardEmployeeId) {
                              setRewardEmployeeId(employees[0].id);
                            }
                            setIsDefineRewardModalOpen(true);
                            setIsQuickActionOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-amber-50 hover:text-amber-600 transition-colors flex items-center gap-2"
                        >
                          <div className="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
                            <i className="fas fa-gift text-[11px]"></i>
                          </div>
                          <span>Record Reward</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* THE 5 DYNAMIC PERFORMANCE WIDGETS */}

            {/* 1. Performance Overview Analytics Cards */}
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
              id="performance-overview-section"
            >
              {/* Card 1: Avg Performance Balanced */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Avg Performance Score
                  </span>
                  <h3 className="text-2xl font-black text-[#02275A] mt-1 font-mono">
                    {performanceStats.avgPerf}%
                  </h3>
                  <div className="text-[10px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full w-max">
                    <i className="fas fa-caret-up text-[9px]"></i> Good Standing
                  </div>
                </div>
                <div className="h-12 w-12 rounded-xl bg-[#02275A]/[0.02] flex items-center justify-center text-[#02275A]/70">
                  <i className="fas fa-chart-line text-lg"></i>
                </div>
              </div>

              {/* Card 2: Avg Net Balance */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Avg Net Points
                  </span>
                  <h3 className="text-2xl font-black text-[#02275A] mt-1 font-mono">
                    {performanceStats.avgNet}{" "}
                    <span className="text-xs text-slate-400 font-normal">
                      pts
                    </span>
                  </h3>
                  <div className="text-[10px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full w-max">
                    <i className="fas fa-star text-[9px]"></i> Dynamic ledger
                  </div>
                </div>
                <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                  <i className="fas fa-coins text-lg"></i>
                </div>
              </div>

              {/* Card 3: High vs Low Performers */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    High vs Low Performers
                  </span>
                  <h3 className="text-2xl font-black text-[#02275A] mt-1 font-mono">
                    <span className="text-emerald-500">
                      {performanceStats.highCount}
                    </span>
                    <span className="text-slate-300 mx-1">/</span>
                    <span className="text-rose-500">
                      {performanceStats.lowCount}
                    </span>
                  </h3>
                  <span className="text-[10px] text-slate-400 font-bold mt-1.5 block">
                    Thresh: ≥85 vs &lt;75
                  </span>
                </div>
                <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                  <i className="fas fa-fire-flame text-lg"></i>
                </div>
              </div>

              {/* Card 4: Total Active Audits */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Active Appraisals
                  </span>
                  <h3 className="text-2xl font-black text-[#02275A] mt-1 font-mono">
                    {performanceStats.total}{" "}
                    <span className="text-xs text-slate-400 font-normal">
                      Active
                    </span>
                  </h3>
                  <div className="text-[10px] text-[#02275A] font-bold mt-1.5 flex items-center gap-1 bg-[#02275A]/[0.02] px-2 py-0.5 rounded-full w-max">
                    <i className="fas fa-shield text-[9px]"></i> Balanced
                    weights
                  </div>
                </div>
                <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                  <i className="fas fa-user-check text-lg"></i>
                </div>
              </div>
            </div>

            {/* Interactive Widgets Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 2. Top Performers Widget */}
              <div
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between"
                id="top-performers-card"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                    <h4 className="text-xs font-black text-[#02275A] uppercase tracking-wider flex items-center gap-1.5">
                      <i className="fas fa-crown text-emerald-500"></i> Top
                      Performers
                    </h4>
                    <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                      Score ≥85
                    </span>
                  </div>
                  <div className="space-y-3">
                    {topPerformersData.map((emp, index) => (
                      <div
                        key={emp.id}
                        className="flex items-center justify-between text-xs hover:bg-slate-50 p-1.5 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono font-black text-xs ${index === 0 ? "text-amber-500" : index === 1 ? "text-slate-400" : "text-amber-700"} w-4`}
                          >
                            ★
                          </span>
                          <div>
                            <p className="font-extrabold text-slate-800 leading-tight">
                              {emp.firstName} {emp.lastName}
                            </p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">
                              {emp.role}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-emerald-600 font-black font-mono bg-emerald-50 px-1.5 py-0.5 rounded text-[11px]">
                            {emp.performanceBalance}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-100 mt-4 flex justify-between items-center">
                  <span className="text-[9px] text-slate-400 font-bold uppercase">
                    Reward Program Active
                  </span>
                  <span className="text-[10px] text-emerald-500 font-black">
                    <i className="fas fa-check-double"></i> Verified
                  </span>
                </div>
              </div>

              {/* 3. Low Performers Widget */}
              <div
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between"
                id="low-performers-card"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                    <h4 className="text-xs font-black text-[#02275A] uppercase tracking-wider flex items-center gap-1.5">
                      <i className="fas fa-triangle-exclamation text-rose-500"></i>{" "}
                      Low Performers
                    </h4>
                    <span className="bg-rose-100 text-rose-800 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                      Score &lt; 75
                    </span>
                  </div>
                  <div className="space-y-3">
                    {lowPerformersData.map((emp, index) => (
                      <div
                        key={emp.id}
                        className="flex items-center justify-between text-xs hover:bg-slate-50 p-1.5 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[10px] text-slate-300 w-4">
                            #{index + 1}
                          </span>
                          <div>
                            <p className="font-extrabold text-slate-800 leading-tight">
                              {emp.firstName} {emp.lastName}
                            </p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">
                              {emp.role}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-rose-600 font-black font-mono bg-rose-50 px-1.5 py-0.5 rounded text-[11px]">
                            {emp.performanceBalance}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-100 mt-4 flex justify-between items-center">
                  <span className="text-[9px] text-[#02275A] font-black uppercase">
                    <i className="fas fa-life-ring"></i> Coaching Required
                  </span>
                  <span className="text-[9px] text-slate-400 font-bold">
                    PIP Pending
                  </span>
                </div>
              </div>

              {/* 4. Leaderboard Summary */}
              <div
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between"
                id="leaderboard-summary-card"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                    <h4 className="text-xs font-black text-[#02275A] uppercase tracking-wider flex items-center gap-1.5">
                      <i className="fas fa-trophy text-amber-500"></i>{" "}
                      Leaderboard Summary
                    </h4>
                    <span className="bg-[#02275A]/10 text-[#02275A] text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                      Net Points Ledger
                    </span>
                  </div>
                  <div className="space-y-3">
                    {leaderboardSummaryData.map((emp, index) => (
                      <div
                        key={emp.id}
                        className="flex items-center justify-between text-xs hover:bg-slate-50 p-1.5 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-[10px] text-slate-400 w-4">
                            #{index + 1}
                          </span>
                          <div>
                            <p className="font-extrabold text-slate-800 leading-tight">
                              {emp.firstName} {emp.lastName}
                            </p>
                          </div>
                        </div>
                        <span className="bg-[#02275A] text-white text-[10px] px-2 py-0.5 rounded-md font-black font-mono">
                          {emp.netBalance}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-100 mt-4">
                  <button
                    onClick={() => setActiveTab("leaderboard")}
                    className="text-[10px] font-black text-[#02275A] hover:text-[#02275A] flex items-center gap-1 mt-1 justify-center w-full uppercase"
                  >
                    Full Leaderboard{" "}
                    <i className="fas fa-chevron-right text-[8px]"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* Complete Employee Interactive Scorecard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT: Complete Employee interactive list */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                {/* Search and Filters */}
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                    <input
                      type="text"
                      placeholder="Search employee name, ID or role..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white pl-9 pr-4 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-[#02275A] focus:border-transparent focus:outline-none"
                      id="kpi-roster-search"
                    />
                  </div>
                  <select
                    value={selectedRoleGroup}
                    onChange={(e) => setSelectedRoleGroup(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-600 font-bold"
                    id="kpi-role-filter"
                  >
                    <option value="All">All Role Categories</option>
                    <option value="marketer">Marketers</option>
                    <option value="sales">Sales Team</option>
                    <option value="support">CX Support staff</option>
                    <option value="engineer">Technical Engineers</option>
                    <option value="cxsuccess">Customer Success</option>
                  </select>
                </div>

                {/* Main Employees Ledger List */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-400 font-black uppercase tracking-wider">
                        <th className="py-3 px-4">Employee</th>
                        <th className="py-3 px-4">Standard Category</th>
                        <th className="py-3 px-4 text-center">
                          Score Contribution
                        </th>
                        <th className="py-3 px-4 text-right">
                          Performance Balance
                        </th>
                        <th className="py-3 px-4 text-right">Reward Points</th>
                        <th className="py-3 px-4 text-right">Net Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {filteredRoster.map((emp) => {
                        const isSelected = emp.id === selectedEmployeeId;
                        return (
                          <tr
                            key={emp.id}
                            onClick={() => setSelectedEmployeeId(emp.id)}
                            className={`hover:bg-slate-50/80 transition-all pointer cursor-pointer ${
                              isSelected
                                ? "bg-[#02275A]/[0.02]/45 border-l-4 border-l-[#02275A]"
                                : ""
                            }`}
                          >
                            <td className="py-3.5 px-4 font-bold text-slate-800">
                              <div className="flex items-center gap-2">
                                <div className="h-7 w-7 rounded-lg bg-[#02275A] text-white flex items-center justify-center font-black uppercase text-[10px]">
                                  {emp.firstName.charAt(0)}
                                  {emp.lastName.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-extrabold">
                                    {emp.firstName} {emp.lastName}
                                  </p>
                                  <p className="text-[10px] text-slate-400 font-bold capitalize">
                                    {emp.role}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                  emp.category === "marketer"
                                    ? "bg-[#EFF6FF] text-[#1E40AF]"
                                    : emp.category === "sales"
                                      ? "bg-[#ECFDF5] text-[#065F46]"
                                      : emp.category === "support"
                                        ? "bg-[#FFFBEB] text-[#92400E]"
                                        : emp.category === "engineer"
                                          ? "bg-[#F5F3FF] text-[#5B21B6]"
                                          : "bg-[#FDF2F8] text-[#9D174D]"
                                }`}
                              >
                                {emp.category === "cxsuccess"
                                  ? "Customer Success"
                                  : emp.category}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-center text-slate-500 font-mono text-[10px]">
                              Role Performance: {emp.rolePerfScore}pts +
                              Conduct:{" "}
                              {emp.performanceBalance - emp.rolePerfScore}pts
                            </td>
                            <td className="py-3.5 px-4 text-right font-black">
                              <span
                                className={`text-sm ${
                                  emp.performanceBalance >= 85
                                    ? "text-emerald-600"
                                    : emp.performanceBalance >= 70
                                      ? "text-[#02275A]"
                                      : "text-rose-500"
                                }`}
                              >
                                {emp.performanceBalance} / 100
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right text-slate-400 font-bold">
                              +{emp.rewardPoints} pts
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <span className="bg-[#02275A] text-white px-2 py-1 rounded-md font-black font-mono shadow-sm text-xs">
                                {emp.netBalance}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* RIGHT: Pending Approvals Pipeline */}
              <div
                className="lg:col-span-5 flex flex-col gap-6"
                id="performance-pipeline-panel"
              >
                {/* 5. Pending Approvals (Interactive workflow ledger) */}
                <div
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between"
                  id="pending-approvals-card"
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                      <h4 className="text-xs font-black text-[#02275A] uppercase tracking-wider flex items-center gap-1.5">
                        <i className="fas fa-envelope-open-text text-[#02275A]/70"></i>{" "}
                        Pending Approvals
                      </h4>
                      <span className="bg-amber-100 text-amber-900 text-[9px] font-black uppercase px-2 py-0.5 rounded-full font-mono">
                        {pendingApprovals.length} Request
                        {pendingApprovals.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="space-y-2.5 max-h-[170px] overflow-y-auto pr-1 custom-scrollbar">
                      {pendingApprovals.length === 0 ? (
                        <div className="py-8 text-center text-slate-400">
                          <i className="fas fa-circle-check text-2xl text-slate-300 mb-2 block animate-pulse"></i>
                          <p className="text-[10px] font-black uppercase text-slate-400">
                            All submissions settled!
                          </p>
                        </div>
                      ) : (
                        pendingApprovals.map((app) => (
                          <div
                            key={app.id}
                            className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-xs space-y-1.5"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-extrabold text-slate-800 leading-tight">
                                  {app.name}
                                </p>
                                <p className="text-[9px] text-slate-400 font-bold capitalize">
                                  {app.department}
                                </p>
                              </div>
                              <span className="font-mono text-[9px] font-black text-[#02275A] bg-[#02275A]/[0.02] px-1.5 py-0.5 rounded">
                                +{app.rewardPointsProposed} pts
                              </span>
                            </div>
                            <p className="text-[9.5px] text-slate-500 font-medium">
                              {app.change}
                            </p>
                            <div className="flex items-center justify-between text-[9px] text-slate-400 pb-1">
                              <span>Progress delta:</span>
                              <span className="font-mono text-[9.5px] font-bold text-slate-600">
                                {app.valueBefore}% → {app.valueAfter}%
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-1.5 pt-1.5 border-t border-slate-200">
                              <button
                                onClick={() => handleReject(app.id, app.name)}
                                className="flex-1 py-1 hover:bg-slate-200 text-slate-600 rounded text-[9px] font-black uppercase border border-slate-200"
                              >
                                Reject
                              </button>
                              <button
                                onClick={() =>
                                  handleApprove(
                                    app.id,
                                    app.name,
                                    app.rewardPointsProposed,
                                  )
                                }
                                className="flex-1 py-1 bg-[#02275A] hover:bg-opacity-95 text-white rounded text-[9px] font-black uppercase"
                              >
                                Approve
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. COMPANY CONDUCT VIEW */}
        {activeTab === "conduct" && (
          <div
            className="space-y-6 animate-fade-in"
            id="kpi-company-conduct-view"
          >
            {/* Header with Quick Guide */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <h2 className="text-[#02275A] text-lg font-black flex items-center gap-2">
                  <i className="fas fa-gavel text-[#02275A]/75"></i> Corporate Conduct & Compliance
                </h2>
                <p className="text-xs text-slate-500 font-semibold max-w-2xl leading-relaxed">
                  Review and manage company-wide conduct standards. Conduct standards represent a fixed <strong className="text-[#02275A]">20% (max 20 points)</strong> of every employee's performance appraisal.
                </p>
              </div>
              <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                <button
                  onClick={() => {
                    setBulkAssignFeedback(null); // Clear previous feedback when opening
                    setIsBulkAssignModalOpen(true);
                  }}
                  className="bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-black uppercase tracking-wider px-5 py-3 rounded-xl cursor-pointer flex items-center gap-2 shadow-sm transition-all shrink-0 font-sans"
                >
                  <i className="fas fa-users-cog"></i> Bulk Select Assigner
                </button>
                <button
                  onClick={() => {
                    setNewConductRoleType(null);
                    setNewConductMethod("deductive");
                    setIsManageConductModalOpen(true);
                  }}
                  className="bg-[#02275A] text-white hover:bg-[#0c3975] text-xs font-black uppercase tracking-wider px-5 py-3 rounded-xl cursor-pointer flex items-center gap-2 shadow-sm transition-all shrink-0 font-sans"
                >
                  <i className="fas fa-plus"></i> New Standard
                </button>
              </div>
            </div>

            {/* Elegant Sub-tab Navigation */}
            <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/60 max-w-lg shadow-inner">
              <button
                type="button"
                onClick={() => setConductSubView("directory")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  conductSubView === "directory"
                    ? "bg-white text-[#02275A] shadow-xs border border-slate-200/30 font-black"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50/50 font-semibold"
                }`}
              >
                <i className="fas fa-list-check"></i>
                <span>Standards Directory ({perfSettings.companyWideConducts?.length || 0})</span>
              </button>
              <button
                type="button"
                onClick={() => setConductSubView("scores")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  conductSubView === "scores"
                    ? "bg-white text-[#02275A] shadow-xs border border-slate-200/30 font-black"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50/50 font-semibold"
                }`}
              >
                <i className="fas fa-users"></i>
                <span>Employee Conduct Scores</span>
              </button>
            </div>

            {/* Sub-view Content Switch */}
            {conductSubView === "directory" && (() => {
              const totalAllocated = (perfSettings.companyWideConducts || []).reduce((sum, c) => sum + c.points, 0);
              const filteredConducts = perfSettings.companyWideConducts || [];

              return (
                <div className="space-y-6 animate-fade-in w-full">
                  {/* Defined Standards Cards Grid */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100">
                      <div>
                        <h3 className="text-[#02275A] font-black uppercase text-xs tracking-wider">
                          Defined Conduct Standards
                        </h3>
                        <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                          View and configure the conduct standards directory.
                        </p>
                      </div>
                    </div>
                    
                    {filteredConducts.length === 0 ? (
                      <div className="text-center py-12 text-slate-400 text-xs font-semibold">
                        No conduct standards defined. Click "New Standard" above to add.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Select All & Bulk Actions Panel */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <input
                                type="checkbox"
                                id="select-all-conducts"
                                className="h-4 w-4 rounded border-slate-300 text-[#02275A] focus:ring-[#02275A] cursor-pointer"
                                checked={filteredConducts.length > 0 && filteredConducts.every(c => selectedConductIds.includes(c.id))}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    const newSelection = Array.from(new Set([...selectedConductIds, ...filteredConducts.map(c => c.id)]));
                                    setSelectedConductIds(newSelection);
                                  } else {
                                    const filteredIds = filteredConducts.map(c => c.id);
                                    setSelectedConductIds(selectedConductIds.filter(id => !filteredIds.includes(id)));
                                  }
                                }}
                              />
                              <label htmlFor="select-all-conducts" className="text-xs font-extrabold text-[#02275A] cursor-pointer select-none">
                                Select All Visible ({filteredConducts.length})
                              </label>
                              {selectedConductIds.length > 0 && (
                                <div className="flex items-center gap-1.5 animate-fade-in">
                                  <span className="text-[9px] font-black bg-[#02275A] text-white px-2.5 py-0.5 rounded-full shadow-2xs">
                                    {selectedConductIds.length} Selected
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedConductIds([])}
                                    className="text-[9px] font-black uppercase text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                                  >
                                    Clear
                                  </button>
                                </div>
                              )}
                            </div>

                            {selectedConductIds.length > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to delete ${selectedConductIds.length} selected conduct standards?`)) {
                                    const newConducts = (perfSettings.companyWideConducts || []).filter(c => !selectedConductIds.includes(c.id));
                                    savePerfSettings({ ...perfSettings, companyWideConducts: newConducts });
                                    setSelectedConductIds([]);
                                    showSuccess("Successfully deleted selected conduct standards.");
                                  }
                                }}
                                className="bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-lg text-[10px] font-extrabold cursor-pointer transition-all flex items-center gap-1"
                              >
                                <i className="fas fa-trash text-[9px]"></i> Delete Selected
                              </button>
                            )}
                          </div>

                          {selectedConductIds.length > 0 && (
                            <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-3 shadow-2xs animate-fade-in">
                              <h5 className="text-[10px] font-black uppercase text-[#02275A] tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                                <i className="fas fa-sliders-h text-blue-500"></i> Bulk Edit ({selectedConductIds.length} Standards)
                              </h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {/* Bulk Department */}
                                <div className="space-y-1">
                                  <label className="block text-[8px] font-black uppercase text-[#02275A] tracking-wider">Add Selected to Department</label>
                                  <select
                                    className="w-full bg-slate-50 border border-slate-200 text-xs font-bold px-2.5 py-2 rounded-lg focus:outline-[#02275A] cursor-pointer text-[#02275A] hover:bg-slate-100 transition-colors"
                                    defaultValue=""
                                    onChange={(e) => {
                                      if (!e.target.value) return;
                                      const deptValue = e.target.value;
                                      const newConducts = (perfSettings.companyWideConducts || []).map(c => {
                                        if (selectedConductIds.includes(c.id)) {
                                          return { ...c, department: deptValue === "All" ? "" : deptValue };
                                        }
                                        return c;
                                      });
                                      const budgetCheck = checkConductPointsBudget(newConducts);
                                      if (!budgetCheck.isValid) {
                                        showError(`Bulk update failed. Total points exceed limit. Violation: ${budgetCheck.details}.`);
                                        e.target.value = "";
                                        return;
                                      }
                                      savePerfSettings({ ...perfSettings, companyWideConducts: newConducts });
                                      showSuccess(`Added selected conducts to Department: ${deptValue === "All" ? "All Departments" : deptValue}`);
                                      e.target.value = "";
                                    }}
                                  >
                                    <option value="" disabled hidden>Choose Department...</option>
                                    <option value="All">All Departments</option>
                                    <option value="None">None</option>
                                    <option value="Sales">Sales</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Customer Experience">Customer Experience</option>
                                    <option value="Human Resources">Human Resources</option>
                                    <option value="Customer Support">Customer Support</option>
                                    <option value="Finance">Finance</option>
                                  </select>
                                </div>

                                {/* Bulk Staff Group */}
                                <div className="space-y-1">
                                  <label className="block text-[8px] font-black uppercase text-[#02275A] tracking-wider">Add Selected to Staff</label>
                                  <select
                                    className="w-full bg-slate-50 border border-slate-200 text-xs font-bold px-2.5 py-2 rounded-lg focus:outline-[#02275A] cursor-pointer text-[#02275A] hover:bg-slate-100 transition-colors"
                                    defaultValue=""
                                    onChange={(e) => {
                                      if (!e.target.value) return;
                                      const groupValue = e.target.value;
                                      const newConducts = (perfSettings.companyWideConducts || []).map(c => {
                                        if (selectedConductIds.includes(c.id)) {
                                          return { ...c, applicableTo: groupValue as any };
                                        }
                                        return c;
                                        });
                                      const budgetCheck = checkConductPointsBudget(newConducts);
                                      if (!budgetCheck.isValid) {
                                        showError(`Bulk update failed. Total points exceed limit. Violation: ${budgetCheck.details}.`);
                                        e.target.value = "";
                                        return;
                                      }
                                      savePerfSettings({ ...perfSettings, companyWideConducts: newConducts });
                                      showSuccess(`Added selected conducts to Staff Category: ${groupValue === "All" ? "All Staff" : groupValue === "None" ? "None" : groupValue === "Manager" ? "Managers" : "Ordinary Staff"}`);
                                      e.target.value = "";
                                    }}
                                  >
                                    <option value="" disabled hidden>Choose Staff Group...</option>
                                    <option value="All">All Staff</option>
                                    <option value="None">None</option>
                                    <option value="Manager">Managers</option>
                                    <option value="Ordinary">Ordinary Staff</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-3">
                          {filteredConducts.map((conduct) => {
                            if (editingConductId === conduct.id && editingConductForm) {
                              return (
                                <div
                                  key={conduct.id}
                                  className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex flex-col gap-4 shadow-xs"
                                >
                                  <input
                                    className="w-full border border-slate-200 p-2.5 rounded-xl text-xs font-bold focus:outline-[#02275A] bg-white"
                                    value={editingConductForm.name}
                                    onChange={(e) =>
                                      setEditingConductForm({
                                        ...editingConductForm,
                                        name: e.target.value,
                                      })
                                    }
                                    placeholder="Conduct Name"
                                  />
                                  <textarea
                                    className="w-full border border-slate-200 p-2.5 rounded-xl text-[10px] focus:outline-[#02275A] bg-white"
                                    value={editingConductForm.description}
                                    rows={2}
                                    onChange={(e) =>
                                      setEditingConductForm({
                                        ...editingConductForm,
                                        description: e.target.value,
                                      })
                                    }
                                    placeholder="Description"
                                  />
                                  <div className="grid grid-cols-3 gap-2">
                                    <div>
                                      <label className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Dept</label>
                                      <select
                                        className="w-full border border-slate-200 p-1.5 rounded-lg text-[10px] font-semibold bg-white focus:outline-[#02275A] text-[#02275A]"
                                        value={editingConductForm.department || "All"}
                                        onChange={(e) =>
                                          setEditingConductForm({
                                            ...editingConductForm,
                                            department: e.target.value,
                                          })
                                        }
                                      >
                                        <option value="All">All Depts</option>
                                        <option value="None">None</option>
                                        <option value="Engineering">Engineering</option>
                                        <option value="Sales">Sales</option>
                                        <option value="Marketing">Marketing</option>
                                        <option value="Tech Support">Tech Support</option>
                                        <option value="Customer Experience">Customer Experience</option>
                                        <option value="Customer Success">Customer Success</option>
                                        <option value="Cellular">Cellular</option>
                                        <option value="Human Resources">Human Resources / HR</option>
                                        <option value="Customer Support">Customer Support</option>
                                        <option value="Finance">Finance</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Group</label>
                                      <select
                                        className="w-full border border-slate-200 p-1.5 rounded-lg text-[10px] font-semibold bg-white focus:outline-[#02275A] text-[#02275A]"
                                        value={editingConductForm.applicableTo || "All"}
                                        onChange={(e) =>
                                          setEditingConductForm({
                                            ...editingConductForm,
                                            applicableTo: e.target.value as any,
                                          })
                                        }
                                      >
                                        <option value="All">All Staff</option>
                                        <option value="None">None</option>
                                        <option value="Manager">Managers</option>
                                        <option value="Ordinary">Ordinary</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Method</label>
                                      <select
                                        className="w-full border border-slate-200 p-1.5 rounded-lg text-[10px] font-semibold bg-white focus:outline-[#02275A] text-[#02275A]"
                                        value={editingConductForm.scoringMethod || "deductive"}
                                        onChange={(e) =>
                                          setEditingConductForm({
                                            ...editingConductForm,
                                            scoringMethod: e.target.value as any,
                                          })
                                        }
                                      >
                                        <option value="deductive">Deductive</option>
                                        <option value="rating">Rating</option>
                                        <option value="others">Others</option>
                                      </select>
                                    </div>
                                  </div>

                                  {/* DYNAMIC PREVIEW PANEL FOR EDITING FORM */}
                                  <div className="bg-slate-100 border border-slate-200 rounded-xl p-3.5 space-y-2 text-left mt-1">
                                    <div className="flex items-center gap-1.5 pb-1.5 border-b border-slate-200">
                                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                                      <h5 className="text-[9px] font-black uppercase text-[#02275A] tracking-wider font-mono">
                                        Mapping & Calculation Preview
                                      </h5>
                                    </div>
                                    <div className="space-y-2">
                                      <div className="text-[10px] text-slate-600 leading-normal font-semibold font-sans">
                                        {(editingConductForm.scoringMethod || "deductive") === "deductive" ? (
                                          <span>
                                            <strong className="text-amber-700 uppercase">Deductive Method:</strong> Evaluator checks a compliance switch (Compliant / Violation). Violation subtracts <strong className="text-[#02275A]">{editingConductForm.points} pts</strong> directly.
                                          </span>
                                        ) : (editingConductForm.scoringMethod || "deductive") === "rating" ? (
                                          <span>
                                            <strong className="text-emerald-700 uppercase">Rating-Based Method:</strong> Graded 1-5 Stars. Points award is: <code className="font-mono bg-white px-1 py-0.5 rounded text-[#02275A] font-bold text-[9px]">(Rating / 5) × {editingConductForm.points} pts</code>.
                                          </span>
                                        ) : (
                                          <span>
                                            <strong className="text-blue-700 uppercase">{editingConductForm.scoringMethod}-Based Method:</strong> Scalable calculation matrix mapped to corporate performance scoreboards.
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-[10px] text-slate-500 font-medium">
                                        <i className="fas fa-info-circle text-[#02275A] mr-1"></i>
                                        Auto-applied to <strong className="text-slate-700">{editingConductForm.applicableTo === "All" ? "All Staff" : editingConductForm.applicableTo === "Manager" ? "Managers & Leads" : "Ordinary Staff"}</strong> in the <strong className="text-slate-700">{editingConductForm.department === "All" ? "All Departments" : editingConductForm.department}</strong> department.
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex gap-2 items-center justify-between border-t border-slate-100 pt-2.5">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[9px] text-slate-400 font-bold uppercase">Weight:</span>
                                      <input
                                        type="number"
                                        className="w-14 border border-slate-200 p-1 rounded-lg text-xs font-bold text-[#02275A] focus:outline-[#02275A] text-center"
                                        value={editingConductForm.points}
                                        onChange={(e) =>
                                          setEditingConductForm({
                                            ...editingConductForm,
                                            points: Number(e.target.value),
                                          })
                                        }
                                      />
                                    </div>
                                    <div className="flex gap-1.5">
                                      <button
                                        className="bg-[#02275A] text-white px-3 py-1 rounded-lg text-[10px] font-bold cursor-pointer hover:bg-opacity-95"
                                        onClick={() => {
                                          const newConducts =
                                            perfSettings.companyWideConducts!.map((c) =>
                                              c.id === conduct.id ? editingConductForm : c,
                                            );
                                          const budgetCheck = checkConductPointsBudget(newConducts);
                                          if (!budgetCheck.isValid) {
                                            showError(
                                              `Total conduct points for some employee categories would exceed 20. Violation: ${budgetCheck.details}.`
                                            );
                                            return;
                                          }
                                          savePerfSettings({
                                            ...perfSettings,
                                            companyWideConducts: newConducts,
                                          });
                                          setEditingConductId(null);
                                          showSuccess("Conduct standard updated.");
                                        }}
                                      >
                                        Save
                                      </button>
                                      <button
                                        className="bg-slate-200 text-slate-700 px-3 py-1 rounded-lg text-[10px] font-bold cursor-pointer hover:bg-slate-300"
                                        onClick={() => setEditingConductId(null)}
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
   
                            return (
                              <div
                                key={conduct.id}
                                className="bg-slate-50/60 border border-slate-150 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition hover:shadow-sm hover:bg-slate-50 relative group"
                              >
                                <div className="flex items-start sm:items-center gap-3.5 flex-1 w-full">
                                  {/* Multi-Select Checkbox */}
                                  <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-slate-300 text-[#02275A] focus:ring-[#02275A] cursor-pointer shrink-0"
                                    checked={selectedConductIds.includes(conduct.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedConductIds([...selectedConductIds, conduct.id]);
                                      } else {
                                        setSelectedConductIds(selectedConductIds.filter(id => id !== conduct.id));
                                      }
                                    }}
                                  />
                                  <div className="h-9 w-9 rounded-xl bg-white border border-slate-200 text-[#02275A] flex items-center justify-center shrink-0 shadow-2xs">
                                    <i className="fas fa-gavel text-xs"></i>
                                  </div>
                                  <div className="space-y-1 flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <h4 className="font-extrabold text-xs sm:text-sm text-[#02275A] leading-tight truncate">
                                        {conduct.name}
                                      </h4>
                                      <div className="flex flex-wrap gap-1">
                                        <span className="text-[8px] font-black uppercase px-1.5 py-0.5 bg-blue-50 text-[#02275A] rounded border border-blue-100/60 shrink-0">
                                          Dept: {conduct.department || "All"}
                                        </span>
                                        <span className="text-[8px] font-black uppercase px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded border border-purple-100/60 shrink-0">
                                          Group: {conduct.applicableTo === "Manager" ? "Managers" : conduct.applicableTo === "Ordinary" ? "Ordinary" : conduct.applicableTo === "None" ? "None" : "All"}
                                        </span>
                                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border shrink-0 ${
                                          conduct.roleCategory === "engineering" || conduct.department === "Engineering"
                                            ? "bg-amber-50 text-amber-700 border-amber-100/60"
                                            : conduct.scoringMethod === "rating" || (conduct.department && conduct.department !== "All" && conduct.department !== "None")
                                              ? "bg-emerald-50 text-emerald-700 border-emerald-100/60"
                                              : "bg-indigo-50 text-[#02275A] border-indigo-100/60"
                                        }`}>
                                          Method: {
                                            conduct.roleCategory === "engineering" || conduct.department === "Engineering"
                                              ? "Deductive (Compliance)"
                                              : conduct.scoringMethod === "rating" || (conduct.department && conduct.department !== "All" && conduct.department !== "None")
                                                ? "Rating-Based (1-5)"
                                                : conduct.scoringMethod === "percentage"
                                                  ? "Percentage Matrix"
                                                  : conduct.scoringMethod === "multiplier"
                                                    ? "Performance Multiplier"
                                                    : "Adaptive (Deductive/Rating)"
                                          }
                                        </span>
                                      </div>
                                    </div>
                                    <p className="text-[10px] sm:text-[10.5px] text-slate-500 leading-relaxed font-semibold">
                                      {conduct.description}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 w-full sm:w-auto pt-2.5 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                                  <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-center shadow-2xs min-w-[54px]">
                                    <span className="block text-xs font-black text-[#02275A] leading-tight">
                                      {conduct.points}
                                    </span>
                                    <span className="block text-[7.5px] font-bold text-slate-400 uppercase tracking-wider">
                                      Pts
                                    </span>
                                  </div>
                                  {!isTeamLead && (
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        className="h-7 w-7 rounded-lg bg-white border border-slate-200 text-slate-500 flex items-center justify-center hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 transition cursor-pointer"
                                        onClick={() => {
                                          setEditingConductId(conduct.id);
                                          setEditingConductForm({ ...conduct });
                                        }}
                                        title="Edit standard"
                                      >
                                        <i className="fas fa-pen text-[9px]"></i>
                                      </button>
                                      <button
                                        className="h-7 w-7 rounded-lg bg-white border border-slate-200 text-slate-500 flex items-center justify-center hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition cursor-pointer"
                                        onClick={() => {
                                          if (window.confirm("Delete this conduct standard?")) {
                                            const newConducts =
                                              perfSettings.companyWideConducts!.filter(
                                                (c) => c.id !== conduct.id,
                                              );
                                            savePerfSettings({
                                              ...perfSettings,
                                              companyWideConducts: newConducts,
                                            });
                                            setSelectedConductIds(selectedConductIds.filter(id => id !== conduct.id));
                                            showSuccess("Conduct standard deleted.");
                                          }
                                        }}
                                        title="Delete standard"
                                      >
                                        <i className="fas fa-trash text-[9px]"></i>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {conductSubView === "scores" && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 animate-fade-in">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="text-[#02275A] font-black uppercase text-xs tracking-wider">
                      Employee Conduct Ledger
                    </h3>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                      View the real-time conduct performance and metric breakdowns.
                    </p>
                  </div>
                </div>

                {/* Roster Grid */}
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-inner">
                  <div className="bg-slate-50 p-3.5 border-b border-slate-200 grid grid-cols-12 gap-3 text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                    <div className="col-span-4">Employee Details</div>
                    <div className="col-span-2 text-center">Type & Dept</div>
                    <div className="col-span-4 text-center">Core Conduct Scores</div>
                    <div className="col-span-2 text-right">Conduct Total</div>
                  </div>

                  <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto bg-white">
                    {(() => {
                      const filteredEmployees = employees.filter((emp) => {
                        if (scoresEmpTypeFilter === "All") return true;
                        return emp.employeeType === scoresEmpTypeFilter;
                      });

                      if (filteredEmployees.length === 0) {
                        return (
                          <div className="p-12 text-center text-slate-400 text-xs font-semibold">
                            No employees found for the "{scoresEmpTypeFilter}" employee type.
                          </div>
                        );
                      }

                      return filteredEmployees.map((emp) => {
                        const punc = emp.kpis?.find(k => k.id === "core-1")?.currentValue ?? 100;
                        const coll = emp.kpis?.find(k => k.id === "core-2")?.currentValue ?? 1;
                        const comm = emp.kpis?.find(k => k.id === "core-3")?.currentValue ?? 100;
                        const comp = emp.kpis?.find(k => k.id === "core-4")?.currentValue ?? 100;

                        // Calculate overall conduct contribution score
                        let conductSum = 0;
                        (emp.kpis || []).forEach((kpi) => {
                          if (kpi.id.startsWith("core-") || (perfSettings.companyWideConducts || []).some(c => c.id === kpi.id)) {
                            conductSum += calculateKPIContribution(kpi);
                          }
                        });
                        
                        const factor = Math.pow(10, perfSettings.precisionDecimals);
                        const totalScore = Math.round(conductSum * factor) / factor;

                        return (
                          <div key={emp.id} className="p-3.5 grid grid-cols-12 gap-3 items-center hover:bg-slate-50 transition-colors">
                            <div className="col-span-4 flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-[#02275A]/5 text-[#02275A] flex items-center justify-center font-bold text-xs shrink-0 border border-[#02275A]/10 uppercase">
                                {emp.firstName?.[0]}{emp.lastName?.[0]}
                              </div>
                              <div>
                                <h4 className="font-extrabold text-xs text-slate-800 leading-tight">
                                  {emp.firstName} {emp.lastName}
                                </h4>
                                <p className="text-[9.5px] text-slate-400 font-semibold">
                                  {emp.employeeId} • {emp.role}
                                </p>
                              </div>
                            </div>

                            <div className="col-span-2 text-center space-y-0.5">
                              <span className="inline-block px-2 py-0.5 bg-blue-50 text-[#02275A] rounded text-[8.5px] font-black uppercase tracking-wider border border-blue-100">
                                {emp.employeeType || "Full-Time"}
                              </span>
                              <p className="text-[9.5px] text-slate-500 font-semibold">{emp.department}</p>
                            </div>

                            <div className="col-span-4 grid grid-cols-4 gap-1 text-center">
                              <div className="bg-slate-50 border border-slate-100 p-1.5 rounded-lg space-y-0.5">
                                <span className="block text-[7.5px] text-slate-400 font-extrabold uppercase tracking-wider">Punc</span>
                                <span className="block text-[10.5px] font-mono font-bold text-slate-700">{punc}%</span>
                              </div>
                              <div className="bg-slate-50 border border-slate-100 p-1.5 rounded-lg space-y-0.5">
                                <span className="block text-[7.5px] text-slate-400 font-extrabold uppercase tracking-wider">Coll</span>
                                <span className={`block text-[10.5px] font-mono font-bold ${coll === 1 ? "text-emerald-600" : "text-rose-500"}`}>{coll === 1 ? "Yes" : "No"}</span>
                              </div>
                              <div className="bg-slate-50 border border-slate-100 p-1.5 rounded-lg space-y-0.5">
                                <span className="block text-[7.5px] text-slate-400 font-extrabold uppercase tracking-wider">Comm</span>
                                <span className="block text-[10.5px] font-mono font-bold text-slate-700">{comm}%</span>
                              </div>
                              <div className="bg-slate-50 border border-slate-100 p-1.5 rounded-lg space-y-0.5">
                                <span className="block text-[7.5px] text-slate-400 font-extrabold uppercase tracking-wider">Comp</span>
                                <span className="block text-[10.5px] font-mono font-bold text-slate-700">{comp}%</span>
                              </div>
                            </div>

                            <div className="col-span-2 text-right">
                              <span className="inline-block font-mono text-xs font-black text-[#02275A] bg-[#02275A]/5 border border-[#02275A]/10 px-2.5 py-1 rounded-xl">
                                {totalScore} / {perfSettings.conductWeightLimit} pts
                              </span>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* Bulk select assigner removed here to be rendered inside the modal container */}

          </div>
        )}

        {/* 3. REWARDS & RECOGNITION VIEW */}
        {activeTab === "rewards" && (
          <div
            className="space-y-6 animate-fade-in"
            id="rewards-recognition-view"
          >
            {/* Summary / Header Panel */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-[#02275A] text-lg font-black flex items-center gap-2">
                  <i className="fas fa-trophy text-[#EAB308]"></i> Rewards &
                  Special Recognition
                </h2>
              </div>
              {canEditPerformance && (
                <div className="flex flex-wrap gap-2 self-start md:self-center shrink-0">
                  <button
                    onClick={() => {
                      setIsDefineRewardModalOpen(true);
                    }}
                    className="bg-[#02275A] text-white hover:bg-[#0c3975] text-xs font-bold px-4.5 py-2.5 rounded-xl cursor-pointer flex items-center gap-2 shadow-xs transition-all font-sans"
                  >
                    <i className="fas fa-trophy text-[#EAB308]"></i> Add Reward/Penalty
                  </button>
                </div>
              )}
            </div>

            {/* Inline Create Reward and Custom Type Manager Console */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Section 2: Manage Reward Types (Edit and define reward type) */}
              <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm h-full flex flex-col justify-between">
                <div className="space-y-4 font-sans">
                  <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-sm text-[#02275A]">
                        Default Reward Types
                      </h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                        Edit existing rules or point assignments
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {canEditPerformance && (
                        <button
                          onClick={() => {
                            setIsAddRewardTypeModalOpen(true);
                          }}
                          className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-[11px] font-semibold px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-1.5 shadow-2xs transition-colors font-sans"
                        >
                          <i className="fas fa-plus text-slate-400 text-[10px]"></i> Add Reward Type
                        </button>
                      )}
                      <i className="fas fa-sliders-h text-slate-400 text-sm ml-1"></i>
                    </div>
                  </div>

                  {/* List & Edit existing types */}
                  <div className="space-y-2">
                    <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden max-h-[300px] overflow-y-auto bg-slate-50/20">
                      {rewardTypesList.map((item, idx) => {
                        const isEditing = editingRewardTypeIdx === idx;
                        return (
                          <div
                            key={item.type}
                            className="p-3 flex items-center justify-between gap-2 hover:bg-slate-50 transition-colors"
                          >
                            {isEditing ? (
                              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full font-sans">
                                <input
                                  type="text"
                                  value={editingRewardTypeVal}
                                  onChange={(e) =>
                                    setEditingRewardTypeVal(e.target.value)
                                  }
                                  className="flex-1 px-2 py-1 border border-slate-300 rounded text-xs font-semibold font-mono text-slate-800"
                                />
                                <input
                                  type="number"
                                  value={editingRewardTypePoints}
                                  onChange={(e) =>
                                    setEditingRewardTypePoints(
                                      Number(e.target.value),
                                    )
                                  }
                                  className="w-20 px-2 py-1 border border-slate-300 rounded text-xs font-semibold font-mono text-slate-800"
                                  placeholder="Pts"
                                />
                                <div className="flex gap-1 justify-end">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const trimmed =
                                        editingRewardTypeVal.trim();
                                      if (!trimmed) return;
                                      const updatedList = [...rewardTypesList];
                                      updatedList[idx] = {
                                        type: trimmed,
                                        points: editingRewardTypePoints,
                                      };
                                      setRewardTypesList(updatedList);
                                      localStorage.setItem(
                                        "company_reward_types_list_v2",
                                        JSON.stringify(updatedList),
                                      );
                                      setEditingRewardTypeIdx(-1);

                                      if (rewardType === item.type) {
                                        setRewardType(trimmed);
                                        setRewardPointsValue(
                                          editingRewardTypePoints,
                                        );
                                      }
                                      showSuccess(
                                        "Updated reward type successfully.",
                                      );
                                    }}
                                    className="p-1 px-2.5 bg-emerald-600 text-white rounded text-[10px] font-bold cursor-pointer font-sans"
                                  >
                                    Save
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingRewardTypeIdx(-1)}
                                    className="p-1 px-2 bg-slate-200 text-slate-600 rounded text-[10px] font-bold cursor-pointer font-sans"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs text-slate-700 bg-white border border-slate-100 rounded-md px-2 py-1 font-semibold shadow-xs">
                                    {item.type}
                                  </span>
                                  <span className="font-mono text-[10px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                                    +{item.points} pts
                                  </span>
                                </div>
                                {canEditPerformance && (
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingRewardTypeIdx(idx);
                                        setEditingRewardTypeVal(item.type);
                                        setEditingRewardTypePoints(item.points);
                                      }}
                                      className="h-7 w-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all cursor-pointer text-xs"
                                      title="Edit type"
                                    >
                                      <i className="fas fa-edit text-[10px]"></i>
                                    </button>
                                    <button
                                      type="button"
                                      disabled={rewardTypesList.length <= 1}
                                      onClick={() => {
                                        if (
                                          window.confirm(
                                            `Are you sure you want to delete the "${item.type}" reward type option?`,
                                          )
                                        ) {
                                          const updatedList =
                                            rewardTypesList.filter(
                                              (_, i) => i !== idx,
                                            );
                                          setRewardTypesList(updatedList);
                                          localStorage.setItem(
                                            "company_reward_types_list_v2",
                                            JSON.stringify(updatedList),
                                          );
                                          if (rewardType === item.type) {
                                            const nextOpt = updatedList[0];
                                            setRewardType(
                                              nextOpt ? nextOpt.type : "",
                                            );
                                            setRewardPointsValue(
                                              nextOpt ? nextOpt.points : 50,
                                            );
                                          }
                                          showSuccess("Deleted successfully.");
                                        }
                                      }}
                                      className="h-7 w-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-all cursor-pointer text-xs disabled:opacity-50"
                                      title="Delete type"
                                    >
                                      <i className="fas fa-trash-alt text-[10px]"></i>
                                    </button>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Manage Engineering Penalties (Deductions) */}
              <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm h-full flex flex-col justify-between">
                <div className="space-y-4 font-sans">
                  <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-sm text-[#02275A]">
                        Penalties
                      </h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                        Define & Edit Deductions (Engineering Role)
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {canEditPerformance && (
                        <button
                          onClick={() => {
                            setIsAddPenaltyTypeModalOpen(true);
                          }}
                          className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-[11px] font-semibold px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-1.5 shadow-2xs transition-colors font-sans"
                        >
                          <i className="fas fa-plus text-slate-400 text-[10px]"></i> Add Penalty Type
                        </button>
                      )}
                      <i className="fas fa-exclamation-triangle text-rose-500 text-sm ml-1"></i>
                    </div>
                  </div>

                  {/* List & Edit existing penalties */}
                  <div className="space-y-2">
                    <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden max-h-[300px] overflow-y-auto bg-slate-50/20">
                      {engineeringPenaltiesList.length === 0 ? (
                        <div className="p-4 text-center text-slate-400 italic font-bold text-xs">
                          No penalties defined yet. Add one below!
                        </div>
                      ) : (
                        engineeringPenaltiesList.map((item, idx) => {
                          const isEditing = editingPenaltyIdx === idx;
                          return (
                            <div
                              key={item.id}
                              className="p-3 flex items-center justify-between gap-2 hover:bg-slate-50 transition-colors"
                            >
                              {isEditing ? (
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full font-sans">
                                  <input
                                    type="text"
                                    value={editingPenaltyVal}
                                    onChange={(e) =>
                                      setEditingPenaltyVal(e.target.value)
                                    }
                                    className="flex-1 px-2 py-1 border border-slate-300 rounded text-xs font-semibold font-mono text-slate-800"
                                  />
                                  <input
                                    type="number"
                                    value={editingPenaltyPoints}
                                    onChange={(e) =>
                                      setEditingPenaltyPoints(
                                        Number(e.target.value),
                                      )
                                    }
                                    className="w-20 px-2 py-1 border border-slate-300 rounded text-xs font-semibold font-mono text-slate-800"
                                    placeholder="Pts"
                                  />
                                  <div className="flex gap-1 justify-end">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const trimmed =
                                          editingPenaltyVal.trim();
                                        if (!trimmed) return;
                                        const updatedList = [
                                          ...engineeringPenaltiesList,
                                        ];
                                        updatedList[idx] = {
                                          id: item.id,
                                          name: trimmed,
                                          points: editingPenaltyPoints,
                                        };
                                        setEngineeringPenaltiesList(
                                          updatedList,
                                        );
                                        localStorage.setItem(
                                          "engineering_penalties_list_v1",
                                          JSON.stringify(updatedList),
                                        );
                                        setEditingPenaltyIdx(-1);
                                        showSuccess(
                                          "Updated penalty policy successfully.",
                                        );
                                      }}
                                      className="p-1 px-2.5 bg-emerald-600 text-white rounded text-[10px] font-bold cursor-pointer font-sans"
                                    >
                                      Save
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingPenaltyIdx(-1)}
                                      className="p-1 px-2 bg-slate-200 text-slate-600 rounded text-[10px] font-bold cursor-pointer font-sans"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs text-slate-700 bg-white border border-slate-100 rounded-md px-2 py-1 font-semibold shadow-xs">
                                      {item.name}
                                    </span>
                                    <span className="font-mono text-[10px] font-black text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                                      -{item.points} pts
                                    </span>
                                  </div>
                                {canEditPerformance && (
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingPenaltyIdx(idx);
                                        setEditingPenaltyVal(item.name);
                                        setEditingPenaltyPoints(item.points);
                                      }}
                                      className="h-7 w-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all cursor-pointer text-xs"
                                      title="Edit penalty"
                                    >
                                      <i className="fas fa-edit text-[10px]"></i>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (
                                          window.confirm(
                                            `Are you sure you want to delete the "${item.name}" penalty policy?`,
                                          )
                                        ) {
                                          const updatedList =
                                            engineeringPenaltiesList.filter(
                                              (_, i) => i !== idx,
                                            );
                                          setEngineeringPenaltiesList(
                                            updatedList,
                                          );
                                          localStorage.setItem(
                                            "engineering_penalties_list_v1",
                                            JSON.stringify(updatedList),
                                          );
                                          showSuccess("Deleted successfully.");
                                        }
                                      }}
                                      className="h-7 w-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-all cursor-pointer text-xs"
                                      title="Delete penalty"
                                    >
                                      <i className="fas fa-trash-alt text-[10px]"></i>
                                    </button>
                                  </div>
                                )}
                                </>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* Add penalty policy form */}
                {canEditPerformance && (
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 font-sans">
                    <p className="text-[10px] text-[#02275A] font-extrabold uppercase tracking-wide">
                      Add New Penalty Policy
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={newPenaltyInput}
                        onChange={(e) => setNewPenaltyInput(e.target.value)}
                        placeholder="e.g. Broken Build on Production"
                        className="flex-1 p-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#02275A] focus:bg-white rounded-xl text-xs font-semibold outline-none transition-all placeholder:text-slate-400"
                      />
                      <input
                        type="number"
                        value={newPenaltyPoints}
                        onChange={(e) =>
                          setNewPenaltyPoints(Math.max(1, Number(e.target.value)))
                        }
                        placeholder="Points"
                        className="w-24 p-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#02275A] focus:bg-white rounded-xl text-xs font-semibold outline-none transition-all text-center"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const trimmed = newPenaltyInput.trim();
                          if (!trimmed) {
                            showError("Please specify a penalty policy name.");
                            return;
                          }
                          const exists = engineeringPenaltiesList.some(
                            (item) =>
                              item.name.toLowerCase() === trimmed.toLowerCase(),
                          );
                          if (exists) {
                            showError("This penalty policy already exists.");
                            return;
                          }
                          const updatedList = [
                            ...engineeringPenaltiesList,
                            {
                              id: "pnl-" + Date.now(),
                              name: trimmed,
                              points: newPenaltyPoints,
                            },
                          ];
                          setEngineeringPenaltiesList(updatedList);
                          localStorage.setItem(
                            "engineering_penalties_list_v1",
                            JSON.stringify(updatedList),
                          );
                          setNewPenaltyInput("");
                          setNewPenaltyPoints(10);
                          showSuccess(
                            "Added new engineering penalty policy successfully.",
                          );
                        }}
                        className="bg-[#02275A] hover:bg-[#0c3975] text-white text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl cursor-pointer transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Rewards History Table */}
            <div
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
              id="rewards-history-table"
            >
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3 className="font-extrabold text-sm text-[#02275A] flex items-center gap-2">
                    <i className="fas fa-table text-slate-400"></i> Rewards
                    Table (Storage History)
                  </h3>
                  <p className="text-[11px] text-slate-400 font-bold mt-0.5">
                    Capturing all issued employee rewards, period bounds, and
                    point assignments
                  </p>
                </div>
                <span className="text-[10px] font-bold text-[#02275A] uppercase tracking-widest font-mono bg-[#02275A]/5 border border-[#02275A]/10 px-2.5 py-1 rounded">
                  {companyRewards.length} Records
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono bg-slate-50/20">
                      <th className="p-4">ID</th>
                      <th className="p-4">Employee</th>
                      <th className="p-4">Period ID</th>
                      <th className="p-4">Reward Type</th>
                      <th className="p-4 text-center">Points</th>
                      <th className="p-4">Reason / Notes</th>
                      <th className="p-4">Source</th>
                      <th className="p-4">Related ID</th>
                      <th className="p-4">Created By</th>
                      {canEditPerformance && <th className="p-4 text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-semibold">
                    {companyRewards.length === 0 ? (
                      <tr>
                        <td
                          colSpan={canEditPerformance ? 10 : 9}
                          className="p-8 text-center text-slate-400 italic font-bold"
                        >
                          No rewards have been defined yet. Get started by
                          issuing one above!
                        </td>
                      </tr>
                    ) : (
                      companyRewards.map((r) => {
                        const emp = employees.find(
                          (e) => e.id === r.employee_id,
                        );
                        const empName = emp
                          ? `${emp.firstName} ${emp.lastName}`
                          : `ID: ${r.employee_id}`;
                        const empRole = emp ? emp.role : "Staff";
                        // Badges style matching types requested: customer_praise, innovation, helped_teammate, excellent_delivery, perfect_csat, closed_big_deal
                        let typeStyle = "bg-slate-100 text-slate-800";
                        let typeIcon = "fa-gift";
                        if (r.reward_type === "customer_praise") {
                          typeStyle =
                            "bg-purple-50 text-purple-700 border-purple-200";
                          typeIcon = "fa-comment-dots";
                        } else if (r.reward_type === "innovation") {
                          typeStyle = "bg-sky-50 text-sky-700 border-sky-200";
                          typeIcon = "fa-lightbulb";
                        } else if (r.reward_type === "helped_teammate") {
                          typeStyle =
                            "bg-emerald-50 text-emerald-700 border-emerald-200";
                          typeIcon = "fa-hands-helping";
                        } else if (r.reward_type === "excellent_delivery") {
                          typeStyle =
                            "bg-blue-50 text-blue-700 border-blue-200";
                          typeIcon = "fa-truck-loading";
                        } else if (r.reward_type === "perfect_csat") {
                          typeStyle =
                            "bg-rose-50 text-rose-700 border-rose-200";
                          typeIcon = "fa-star";
                        } else if (r.reward_type === "closed_big_deal") {
                          typeStyle =
                            "bg-amber-50 text-amber-800 border-amber-200";
                          typeIcon = "fa-trophy";
                        } else if (r.reward_type === "penalty") {
                          typeStyle =
                            "bg-rose-50 text-rose-700 border-rose-250";
                          typeIcon = "fa-exclamation-triangle";
                        }

                        return (
                          <tr
                            key={r.id}
                            className="hover:bg-slate-50/50 transition-colors"
                          >
                            <td className="p-4 font-mono font-bold text-slate-400">
                              {r.id}
                            </td>
                            <td className="p-4">
                              <div className="font-extrabold text-slate-900">
                                {empName}
                              </div>
                              <div className="text-[10px] text-slate-400 capitalize font-bold">
                                {empRole}
                              </div>
                            </td>
                            <td className="p-4 font-mono">{r.period_id}</td>
                            <td className="p-4">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 border ${typeStyle}`}
                              >
                                <i className={`fas ${typeIcon}`}></i>
                                {r.reward_type}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              {r.points < 0 ? (
                                <span className="font-mono text-xs font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                                  {r.points} pts
                                </span>
                              ) : (
                                <span className="font-mono text-xs font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                                  +{r.points} pts
                                </span>
                              )}
                            </td>
                            <td
                              className="p-4 max-w-xs font-semibold text-slate-600 truncate"
                              title={r.reason}
                            >
                              {r.reason}
                            </td>
                            <td className="p-4 text-slate-500 font-mono text-[10px]">
                              {r.source}
                            </td>
                            <td className="p-4 text-slate-500 font-mono text-[10px]">
                              {r.related_record_id}
                            </td>
                            <td className="p-4 text-slate-400">
                              <div>{r.created_by}</div>
                              <div className="text-[9px] font-normal">
                                {new Date(r.created_at).toLocaleDateString()}
                              </div>
                            </td>
                            {canEditPerformance && (
                              <td className="p-4 text-right">
                                <button
                                  onClick={() => handleDeleteReward(r.id)}
                                  className="text-rose-500 hover:text-rose-700 p-1.5 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                  title="Revoke Reward & Deduct Points"
                                >
                                  <i className="fas fa-trash-alt"></i>
                                </button>
                              </td>
                            )}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 4. LEADERBOARD VIEW */}
        {activeTab === "leaderboard" && (
          <div className="space-y-6 animate-fade-in" id="leaderboard-view">
            {/* Interactive Header */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-[#02275A] text-lg font-black flex items-center gap-2">
                  <i className="fas fa-medal text-amber-500"></i> Corporate
                  Performance Leaderboard
                </h2>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  Real-time tracking of employees based on their Net Balance.
                  Ranks dynamically update upon slider updates or reward point
                  disbursements.
                </p>
              </div>
              <span className="font-mono text-[10px] font-black uppercase tracking-wider px-3 py-1.5 bg-[#02275A]/[0.02] border border-[#02275A]/10 rounded-lg text-[#02275A]">
                Live Standings
              </span>
            </div>

            {/* Top 3 Podium Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Podium Rank 2 */}
              {processedRoster.sort((a, b) => b.netBalance - a.netBalance)[1] &&
                (() => {
                  const runnerUp = processedRoster.sort(
                    (a, b) => b.netBalance - a.netBalance,
                  )[1];
                  return (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs relative flex flex-col justify-between order-2 md:order-1 mt-0 md:mt-4">
                      <div className="absolute top-4 right-4 text-2xl">🥈</div>
                      <div>
                        <span className="text-[9px] tracking-wider uppercase font-black text-slate-400 font-mono">
                          Rank #2
                        </span>
                        <h3 className="font-extrabold text-sm text-[#02275A] mt-1">
                          {runnerUp.firstName} {runnerUp.lastName}
                        </h3>
                        <p className="text-[10px] text-slate-400 capitalize font-semibold">
                          {runnerUp.role}
                        </p>
                      </div>
                      <div className="mt-6 pt-3 border-t border-slate-100 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          Net Balance
                        </span>
                        <span className="font-mono text-xs font-black text-[#02275A]">
                          {runnerUp.netBalance} pts
                        </span>
                      </div>
                    </div>
                  );
                })()}

              {/* Podium Rank 1 */}
              {processedRoster.sort((a, b) => b.netBalance - a.netBalance)[0] &&
                (() => {
                  const champion = processedRoster.sort(
                    (a, b) => b.netBalance - a.netBalance,
                  )[0];
                  return (
                    <div className="bg-[#fcf8e3] border-2 border-amber-300 rounded-2xl p-6 shadow-md relative flex flex-col justify-between order-1 md:order-2">
                      <div className="absolute top-4 right-4 text-3xl">🥇</div>
                      <div>
                        <span className="text-[9px] tracking-wider uppercase font-black text-amber-600 bg-amber-100/60 px-2 py-0.5 rounded-full font-mono">
                          Top Performer • Rank #1
                        </span>
                        <h3 className="font-black text-base text-[#02275A] mt-2">
                          {champion.firstName} {champion.lastName}
                        </h3>
                        <p className="text-xs text-amber-800 capitalize font-bold">
                          {champion.role}
                        </p>
                      </div>
                      <div className="mt-8 pt-3 border-t border-amber-200 flex justify-between items-center">
                        <span className="text-xs font-bold text-[#02275A] uppercase">
                          Net Balance
                        </span>
                        <span className="font-mono text-sm font-black text-[#02275A] bg-white border border-[#02275A]/10 px-2.5 py-0.5 rounded shadow-xs">
                          {champion.netBalance} pts
                        </span>
                      </div>
                    </div>
                  );
                })()}

              {/* Podium Rank 3 */}
              {processedRoster.sort((a, b) => b.netBalance - a.netBalance)[2] &&
                (() => {
                  const rank3 = processedRoster.sort(
                    (a, b) => b.netBalance - a.netBalance,
                  )[2];
                  return (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs relative flex flex-col justify-between order-3 mt-0 md:mt-4">
                      <div className="absolute top-4 right-4 text-2xl">🥉</div>
                      <div>
                        <span className="text-[9px] tracking-wider uppercase font-black text-slate-400 font-mono">
                          Rank #3
                        </span>
                        <h3 className="font-extrabold text-sm text-[#02275A] mt-1">
                          {rank3.firstName} {rank3.lastName}
                        </h3>
                        <p className="text-[10px] text-slate-400 capitalize font-semibold">
                          {rank3.role}
                        </p>
                      </div>
                      <div className="mt-6 pt-3 border-t border-slate-100 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          Net Balance
                        </span>
                        <span className="font-mono text-xs font-black text-[#02275A]">
                          {rank3.netBalance} pts
                        </span>
                      </div>
                    </div>
                  );
                })()}
            </div>

            {/* Leaderboard Listing Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="grid grid-cols-12 gap-3 p-4 bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">
                <div className="col-span-2">Rank</div>
                <div className="col-span-4 font-sans">Employee</div>
                <div className="col-span-2 text-center">Base Score (100)</div>
                <div className="col-span-2 text-center">Reward (Pts)</div>
                <div className="col-span-2 text-right">Net Balance</div>
              </div>

              <div className="divide-y divide-slate-100">
                {processedRoster
                  .sort((a, b) => b.netBalance - a.netBalance)
                  .map((emp, i) => {
                    return (
                      <div
                        key={emp.id}
                        className="grid grid-cols-12 gap-3 p-4 items-center text-xs hover:bg-slate-50 transition-all font-bold text-slate-700"
                      >
                        <div className="col-span-2 font-mono font-extrabold text-slate-500 flex items-center gap-2">
                          <span>#{i + 1}</span>
                          {i === 0 && <span className="text-xs">🥇</span>}
                          {i === 1 && <span className="text-xs">🥈</span>}
                          {i === 2 && <span className="text-xs">🥉</span>}
                        </div>
                        <div className="col-span-4 font-bold text-slate-800">
                          <span>
                            {emp.firstName} {emp.lastName}
                          </span>
                          <span className="block text-[9px] text-slate-400 capitalize font-medium">
                            {emp.role}
                          </span>
                        </div>
                        <div className="col-span-2 text-center font-mono font-black text-slate-700">
                          {emp.performanceBalance}%
                        </div>
                        <div className="col-span-2 text-center font-mono font-black text-amber-705 text-amber-700">
                          +{emp.rewardPoints}
                        </div>
                        <div className="col-span-2 text-right font-mono font-black text-[#02275A] bg-[#02275A]/[0.02] rounded p-1 max-w-[80px] ml-auto border border-[#02275A]/10">
                          {emp.netBalance} pts
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* 5. SETTINGS VIEW */}
        {activeTab === "settings" && (
          <div className="space-y-8 animate-fade-in" id="settings-view">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Navigation Sidebar Menu */}
              <div
                className="lg:col-span-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1.5"
                id="settings-sidebar-wrapper"
              >
                <div className="pb-3 border-b border-slate-100 hidden lg:block">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider font-mono">
                    Settings Directory
                  </p>
                </div>
                <div
                  className="flex flex-row overflow-x-auto lg:overflow-x-visible lg:flex-col gap-1 pb-1 lg:pb-0 scrollbar-none"
                  id="settings-nav-pill-container"
                >
                  {!isTeamLead && (
                    <>
                      <button
                        type="button"
                        onClick={() => setSettingsSubTab("general")}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all text-left whitespace-nowrap shrink-0 w-auto lg:w-full cursor-pointer ${
                          settingsSubTab === "general"
                            ? "bg-[#02275A] text-white shadow-sm"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <i className="fas fa-sliders-h text-xs"></i>
                        <span>Engine & Formats</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSettingsSubTab("grading")}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all text-left whitespace-nowrap shrink-0 w-auto lg:w-full cursor-pointer ${
                          settingsSubTab === "grading"
                            ? "bg-[#02275A] text-white shadow-sm"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <i className="fas fa-award text-xs"></i>
                        <span>Grading System Scale</span>
                      </button>
                    </>
                  )}

                  {!isTeamLead && (
                    <>
                      <button
                        type="button"
                        onClick={() => setSettingsSubTab("rewards")}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all text-left whitespace-nowrap shrink-0 w-auto lg:w-full cursor-pointer ${
                          settingsSubTab === "rewards"
                            ? "bg-[#02275A] text-white shadow-sm"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <i className="fas fa-gift text-xs"></i>
                        <span>Rewards & system</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSettingsSubTab("quarters")}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all text-left whitespace-nowrap shrink-0 w-auto lg:w-full cursor-pointer ${
                          settingsSubTab === "quarters"
                            ? "bg-[#02275A] text-white shadow-sm"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <i className="far fa-calendar-alt text-xs"></i>
                        <span>Performance Quarters</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Settings Content Tabs Grid container representing current active pane */}
              <div
                className="lg:col-span-9 space-y-6"
                id="settings-group-pane-content"
              >
                {settingsSubTab === "general" && (
                  <div className="space-y-6" id="panel-general-engine">
                    {/* KPI CAPS LIMIT */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                      <h3 className="font-extrabold text-xs text-[#02275A] uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
                        <i className="fas fa-crosshairs text-[#02275A]/70 text-sm"></i>
                        <span>KPI caps</span>
                      </h3>

                      <div className="space-y-4">
                        <p className="text-[10.5px] text-slate-500 font-semibold leading-relaxed">
                          Set the maximum points a KPI can contribute.
                        </p>

                        <div>
                          <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">
                            Max KPI points
                          </label>
                          <div className="flex items-center gap-2 mt-1">
                            <input
                              type="number"
                              className="w-32 p-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[#02275A] focus:border-transparent text-slate-700 shadow-sm"
                              value={settingsDraft.kpiCapLimit}
                              onChange={(e) =>
                                setSettingsDraft({
                                  ...settingsDraft,
                                  kpiCapLimit: Number(e.target.value),
                                })
                              }
                            />
                            <span className="text-xs font-bold text-slate-400">
                              points limit
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* WEIGHT LIMITS */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                      <h3 className="font-extrabold text-xs text-[#02275A] uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
                        <i className="fas fa-weight-hanging text-[#02275A]/70 text-sm"></i>
                        <span>Weight limits</span>
                      </h3>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="block text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                            Weight Distribution
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const currentSum =
                                settingsDraft.roleWeightLimit +
                                settingsDraft.conductWeightLimit;
                              if (currentSum === 100) return;
                              // Adjust conduct to reach 100% based on role limit, clamping between 0 and 50
                              const idealConduct = Math.max(
                                0,
                                Math.min(
                                  50,
                                  100 - settingsDraft.roleWeightLimit,
                                ),
                              );
                              setSettingsDraft({
                                ...settingsDraft,
                                conductWeightLimit: idealConduct,
                                roleWeightLimit: 100 - idealConduct,
                              });
                              showSuccess(
                                "Balanced weights to perfectly equal 100%!",
                              );
                            }}
                            className="text-[9px] text-[#02275A] hover:text-[#02275A] font-extrabold uppercase cursor-pointer"
                          >
                            Auto-Balance to 100%
                          </button>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-xs font-bold mb-1 text-slate-600">
                              <span>Role weight</span>
                              <span className="font-mono text-[#02275A] font-extrabold">
                                {settingsDraft.roleWeightLimit}%
                              </span>
                            </div>
                            <input
                              type="range"
                              min="50"
                              max="100"
                              step="5"
                              className="w-full accent-[#02275A] cursor-pointer"
                              value={settingsDraft.roleWeightLimit}
                              onChange={(e) =>
                                setSettingsDraft({
                                  ...settingsDraft,
                                  roleWeightLimit: Number(e.target.value),
                                })
                              }
                            />
                          </div>

                          <div>
                            <div className="flex justify-between text-xs font-bold mb-1 text-slate-600">
                              <span>Conduct weight</span>
                              <span className="font-mono text-[#02275A] font-extrabold">
                                {settingsDraft.conductWeightLimit}%
                              </span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="50"
                              step="5"
                              className="w-full accent-[#02275A] cursor-pointer"
                              value={settingsDraft.conductWeightLimit}
                              onChange={(e) =>
                                setSettingsDraft({
                                  ...settingsDraft,
                                  conductWeightLimit: Number(e.target.value),
                                })
                              }
                            />
                          </div>

                          {settingsDraft.roleWeightLimit +
                            settingsDraft.conductWeightLimit !==
                            100 && (
                            <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2 text-rose-800 text-[10px] font-bold">
                              <i className="fas fa-exclamation-triangle"></i>
                              <span>
                                Attention: Combined limits sum to{" "}
                                {settingsDraft.roleWeightLimit +
                                  settingsDraft.conductWeightLimit}
                                %. Use the Auto-Balance tool above to fix.
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {settingsSubTab === "grading" && (
                  <div
                    className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4"
                    id="panel-grading-scale"
                  >
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <h3 className="font-extrabold text-xs text-[#02275A] uppercase tracking-wider flex items-center gap-2">
                        <i className="fas fa-award text-[#02275A]/70 text-sm"></i>
                        <span>Grading System Scale</span>
                      </h3>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setSettingsDraft({
                              ...settingsDraft,
                              gradingSystem: DEFAULT_GRADING_SYSTEM,
                            })
                          }
                          className="text-[10px] text-slate-500 font-bold bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          Standard
                        </button>
                        <button
                          onClick={() =>
                            setSettingsDraft({
                              ...settingsDraft,
                              gradingSystem: OPTIONAL_STRONGER_GRADING,
                            })
                          }
                          className="text-[10px] text-[#02275A] font-bold bg-[#02275A]/5 px-2.5 py-1 rounded-md border border-[#02275A]/10 hover:bg-[#02275A]/10 transition-colors cursor-pointer"
                        >
                          Stronger Scale
                        </button>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                      Define the minimum and maximum points required for each
                      grade level, and suggested actions.
                    </p>

                    <div className="space-y-3">
                      {(
                        settingsDraft.gradingSystem || DEFAULT_GRADING_SYSTEM
                      ).map((grade, index) => (
                        <div
                          key={grade.id}
                          className="bg-slate-50 p-3 rounded-xl border border-slate-200 grid grid-cols-12 gap-3 items-center"
                        >
                          <div className="col-span-2">
                            <input
                              type="text"
                              value={grade.letter}
                              onChange={(e) => {
                                const newSys = [
                                  ...(settingsDraft.gradingSystem ||
                                    DEFAULT_GRADING_SYSTEM),
                                ];
                                newSys[index].letter = e.target.value;
                                setSettingsDraft({
                                  ...settingsDraft,
                                  gradingSystem: newSys,
                                });
                              }}
                              className={`w-full bg-white border border-slate-200 px-2 py-1 flex items-center justify-center rounded text-[10px] font-black uppercase tracking-tight text-center focus:outline-none focus:border-[#02275A] ${grade.colorClass}`}
                            />
                          </div>
                          <div className="col-span-3">
                            <input
                              type="text"
                              value={grade.label}
                              onChange={(e) => {
                                const newSys = [
                                  ...(settingsDraft.gradingSystem ||
                                    DEFAULT_GRADING_SYSTEM),
                                ];
                                newSys[index].label = e.target.value;
                                setSettingsDraft({
                                  ...settingsDraft,
                                  gradingSystem: newSys,
                                });
                              }}
                              className="w-full bg-white border border-slate-200 px-2 py-1 rounded text-xs font-bold text-slate-700 focus:outline-none focus:border-[#02275A]"
                            />
                          </div>
                          <div className="col-span-2 flex items-center justify-center gap-1">
                            <input
                              type="number"
                              value={grade.minScore}
                              onChange={(e) => {
                                const newSys = [
                                  ...(settingsDraft.gradingSystem ||
                                    DEFAULT_GRADING_SYSTEM),
                                ];
                                newSys[index].minScore = Number(e.target.value);
                                setSettingsDraft({
                                  ...settingsDraft,
                                  gradingSystem: newSys,
                                });
                              }}
                              className="w-full bg-white border border-slate-200 px-1 py-1 rounded text-xs font-mono font-bold text-slate-700 focus:outline-none focus:border-[#02275A] text-center"
                            />
                            <span className="text-xs font-bold text-slate-400">
                              -
                            </span>
                            <input
                              type="number"
                              value={grade.maxScore}
                              onChange={(e) => {
                                const newSys = [
                                  ...(settingsDraft.gradingSystem ||
                                    DEFAULT_GRADING_SYSTEM),
                                ];
                                newSys[index].maxScore = Number(e.target.value);
                                setSettingsDraft({
                                  ...settingsDraft,
                                  gradingSystem: newSys,
                                });
                              }}
                              className="w-full bg-white border border-slate-200 px-1 py-1 rounded text-xs font-mono font-bold text-slate-700 focus:outline-none focus:border-[#02275A] text-center"
                            />
                          </div>
                          <div className="col-span-4">
                            <input
                              type="text"
                              value={grade.actionMessage}
                              onChange={(e) => {
                                const newSys = [
                                  ...(settingsDraft.gradingSystem ||
                                    DEFAULT_GRADING_SYSTEM),
                                ];
                                newSys[index].actionMessage = e.target.value;
                                setSettingsDraft({
                                  ...settingsDraft,
                                  gradingSystem: newSys,
                                });
                              }}
                              className="w-full bg-white border border-slate-200 px-2 py-1 rounded text-xs font-medium text-slate-500 focus:outline-none focus:border-[#02275A]"
                              title={grade.actionMessage}
                            />
                          </div>
                          <div className="col-span-1 text-right">
                            <button
                              onClick={() => {
                                const newSys = (
                                  settingsDraft.gradingSystem ||
                                  DEFAULT_GRADING_SYSTEM
                                ).filter((_, i) => i !== index);
                                setSettingsDraft({
                                  ...settingsDraft,
                                  gradingSystem: newSys,
                                });
                              }}
                              className="text-slate-300 hover:text-red-500 transition-colors py-1 pl-1 cursor-pointer"
                            >
                              <i className="fas fa-times text-xs"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        const newSys = [
                          ...(settingsDraft.gradingSystem ||
                            DEFAULT_GRADING_SYSTEM),
                        ];
                        newSys.push({
                          id: `g_new_${Date.now()}`,
                          minScore: 0,
                          maxScore: 0,
                          letter: "X",
                          label: "New",
                          actionMessage: "Action here",
                          colorClass:
                            "text-slate-800 bg-slate-50 border-slate-200",
                        });
                        setSettingsDraft({
                          ...settingsDraft,
                          gradingSystem: newSys,
                        });
                      }}
                      className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-500 text-xs font-bold rounded-xl border border-dashed border-slate-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <i className="fas fa-plus"></i> Add Grade Level
                    </button>
                  </div>
                )}



                {settingsSubTab === "rewards" && (
                  <div className="space-y-6" id="panel-rewards-administration">
                    {/* REWARD SETTINGS */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                      <h3 className="font-extrabold text-xs text-[#02275A] uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
                        <i className="fas fa-gift text-[#02275A]/70 text-sm"></i>
                        <span>Reward settings</span>
                      </h3>

                      <div className="space-y-4">
                        <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 flex gap-3 text-amber-800">
                          <i className="fas fa-info-circle mt-0.5"></i>
                          <div>
                            <p className="text-[11px] font-bold mb-1">
                              Net Balance Formula
                            </p>
                            <p className="text-[10px] font-medium leading-relaxed">
                              Net Balance is used for leaderboard, awards,
                              recognition, and ranking.
                            </p>
                            <div className="font-mono text-[10px] font-bold mt-2 bg-white/50 p-2 rounded">
                              Net Balance = Performance Balance + Reward Points
                            </div>
                            <p className="text-[10px] opacity-75 mt-1 font-mono">
                              Example: Performance Balance (88) + Reward Points
                              (20) = Net Balance (108)
                            </p>
                          </div>
                        </div>

                        <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                          Set standard reward point values.
                        </p>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">
                              Milestone Reward
                            </label>
                            <input
                              type="number"
                              className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[#02275A] focus:border-transparent text-slate-700 shadow-sm font-mono"
                              value={settingsDraft.milestoneRewardPoints}
                              onChange={(e) =>
                                setSettingsDraft({
                                  ...settingsDraft,
                                  milestoneRewardPoints: Number(e.target.value),
                                })
                              }
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">
                              Hero Award Post
                            </label>
                            <input
                              type="number"
                              className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[#02275A] focus:border-transparent text-slate-700 shadow-sm font-mono"
                              value={settingsDraft.heroAwardPoints}
                              onChange={(e) =>
                                setSettingsDraft({
                                  ...settingsDraft,
                                  heroAwardPoints: Number(e.target.value),
                                })
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Reset System Data */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                      <h3 className="font-extrabold text-xs text-red-700 uppercase tracking-wider pb-2 border-b border-red-50 font-mono">
                        Reset System Data
                      </h3>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                        Reset all employee scores and penalties back to zero,
                        and restore factory default settings.
                      </p>
                      <button
                        type="button"
                        onClick={handleResetToDefaults}
                        className="w-full md:w-auto px-6 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-100 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                      >
                        Reset to Defaults
                      </button>
                    </div>
                  </div>
                )}

                {settingsSubTab === "quarters" && (
                  <div className="space-y-6 animate-fade-in" id="panel-performance-quarters-mgt">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                      <h3 className="font-extrabold text-xs text-[#02275A] uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
                        <i className="far fa-calendar-alt text-[#02275A]/70 text-sm"></i>
                        <span>Performance Quarters / Periods</span>
                      </h3>

                      <p className="text-[10.5px] text-slate-500 font-semibold leading-relaxed">
                        Add, edit, or remove operational performance quarters and review periods.
                        The registered periods will dynamically populate dropdown selectors when conducting evaluations.
                      </p>

                      {/* CREATE NEW QUARTER PERIOD CONTAINER */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                        <h4 className="text-[10px] font-black uppercase text-slate-700 tracking-wider">
                          Create New Period
                        </h4>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            placeholder="e.g. Q1 2027 (Jan-Mar) or Sept 2026"
                            value={newQuarterName}
                            onChange={(e) => setNewQuarterName(e.target.value)}
                            className="flex-1 p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-[#02275A] font-mono text-slate-700"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const trimmed = newQuarterName.trim();
                              if (!trimmed) {
                                showError("Please enter a valid quarter/period name.");
                                return;
                              }
                              if (quarters.includes(trimmed)) {
                                showError("This period name already exists!");
                                return;
                              }
                              const updated = [...quarters, trimmed];
                              saveQuarters(updated);
                              setNewQuarterName("");
                              showSuccess(`Successfully added period: ${trimmed}`);
                            }}
                            className="px-4 py-2 bg-[#02275A] hover:bg-[#0c3975] text-white text-xs font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer shrink-0"
                          >
                            Add Period
                          </button>
                        </div>
                      </div>

                      {/* CURRENT REGISTERED ACTIVE LIST CONTAINER */}
                      <div className="space-y-2 mt-4">
                        <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">
                          Registered Quarters ({quarters.length})
                        </h4>

                        <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-100">
                          {quarters.map((q, idx) => {
                            const isEditing = editingQuarterIndex === idx;

                            return (
                              <div
                                key={idx}
                                className="p-3.5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors"
                              >
                                {isEditing ? (
                                  <div className="flex-1 flex gap-2">
                                    <input
                                      type="text"
                                      value={editingQuarterName}
                                      onChange={(e) => setEditingQuarterName(e.target.value)}
                                      className="flex-1 p-2 bg-white border border-slate-300 rounded-lg text-xs font-bold font-mono text-[#02275A] outline-none"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const trimmed = editingQuarterName.trim();
                                        if (!trimmed) {
                                          showError("Period name cannot be empty.");
                                          return;
                                        }
                                        const dupIdx = quarters.indexOf(trimmed);
                                        if (dupIdx !== -1 && dupIdx !== idx) {
                                          showError("This period name already exists!");
                                          return;
                                        }
                                        const updated = [...quarters];
                                        updated[idx] = trimmed;
                                        saveQuarters(updated);
                                        setEditingQuarterIndex(null);
                                        showSuccess("Quarter period updated successfully!");
                                      }}
                                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-wider rounded-md transition-colors"
                                    >
                                      Save
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingQuarterIndex(null)}
                                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-wider rounded-md transition-colors"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex items-center gap-2.5">
                                      <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px]">
                                        <i className="far fa-calendar-check text-[10px]"></i>
                                      </div>
                                      <span className="text-xs font-bold text-slate-700 font-mono">
                                        {q}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 self-end sm:self-auto">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingQuarterIndex(idx);
                                          setEditingQuarterName(q);
                                        }}
                                        className="p-1 px-2.5 border border-slate-200 hover:border-[#02275A] text-slate-500 hover:text-[#02275A] bg-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer"
                                      >
                                        <i className="fas fa-edit text-[9px]"></i>
                                        <span>Edit</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (
                                            window.confirm(
                                              `Are you sure you want to remove performance period "${q}"?`
                                            )
                                          ) {
                                            const updated = quarters.filter((_, i) => i !== idx);
                                            saveQuarters(updated);
                                            showSuccess(`Removed quarter period: ${q}`);
                                          }
                                        }}
                                        className="p-1 px-2 text-rose-100 hover:text-white border border-rose-100 hover:border-rose-600 bg-rose-50/50 hover:bg-rose-600 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                                        title="Delete period"
                                      >
                                        <i className="far fa-trash-alt text-[9px]"></i>
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-5 border-t border-slate-100 mt-6">
                  <button
                    onClick={() => {
                      // Validation before saving
                      if (settingsDraft.gradingSystem) {
                        for (
                          let i = 0;
                          i < settingsDraft.gradingSystem.length;
                          i++
                        ) {
                          const grade = settingsDraft.gradingSystem[i];
                          if (grade.minScore > grade.maxScore) {
                            showError(
                              `Grade ${grade.letter} min score cannot be higher than max score!`,
                            );
                            return;
                          }
                        }
                      }

                      if (settingsDraft.companyWideConducts) {
                        const budgetCheck = checkConductPointsBudget(settingsDraft.companyWideConducts);
                        if (!budgetCheck.isValid) {
                          showError(
                            `Cannot save settings. Total conduct points for some employee categories would exceed 20. Violation: ${budgetCheck.details}.`
                          );
                          return;
                        }
                      }

                      savePerfSettings(settingsDraft);
                      showSuccess("Settings saved successfully!");
                    }}
                    className="px-6 py-3 bg-[#02275A] hover:bg-[#0c3975] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
                  >
                    <i className="fas fa-save"></i> Save Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. DORMANT REUSABLE TEMPLATES SECTION */}
        {activeTab === "templates" && (
          <div
            className="space-y-6 animate-fade-in"
            id="reusable-templates-dashboard"
          >
            {/* Header Panel */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-[#02275A] text-lg font-black flex items-center gap-2">
                  <i className="fas fa-file-contract text-[#02275A]/70"></i>{" "}
                  Performance Template
                </h2>
              </div>
              {!isEditingTemplate && (
                <button
                  onClick={handleCreateNewTemplate}
                  className="bg-[#02275A] text-white px-5 py-3 rounded-xl font-bold hover:bg-[#0c3975] transition-colors shadow-lg shadow-[#02275A]/20 flex items-center gap-2 text-sm"
                  id="create-template-btn"
                >
                  <i className="fas fa-plus"></i> Create Template
                </button>
              )}
            </div>

            {/* A. TEMPLATE CREATION / EDITING FORM */}
            {isEditingTemplate ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden max-w-5xl mx-auto flex flex-col">
                <div className="bg-slate-50 border-b border-slate-200 p-4 sm:p-6 flex justify-between items-center">
                  <h3 className="font-extrabold text-[#02275A] text-lg flex items-center gap-2">
                    <i
                      className={`fas ${currentTemplateId ? "fa-cog" : "fa-wand-magic-sparkles"} text-[#02275A]/70`}
                    ></i>
                    {currentTemplateId
                      ? "Edit Performance Template"
                      : "New Performance Template"}
                  </h3>
                  <button
                    onClick={() => setIsEditingTemplate(false)}
                    className="text-slate-400 hover:text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm transition-colors"
                  >
                    Cancel
                  </button>
                </div>

                <form
                  onSubmit={handleSaveTemplate}
                  className="p-4 sm:p-6 space-y-8"
                >
                  {/* App Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                        Template Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Senior Frontend Engineer Blueprint"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[#02275A] focus:border-transparent text-slate-700 shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                        Description
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Standard benchmark for all tier-2 frontend engineers"
                        value={templateDescription}
                        onChange={(e) => setTemplateDescription(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[#02275A] focus:border-transparent text-slate-700 shadow-sm"
                      />
                    </div>
                    {isManagerTemplate && managerTemplateType === "cumulative" && (
                      <div className="col-span-1 md:col-span-2 bg-[#02275A]/[0.02] p-4 rounded-xl border border-[#02275A]/15 space-y-3 relative">
                        <div className="flex items-center gap-2">
                          <i className="fas fa-link text-[#02275A]"></i>
                          <label className="block text-xs font-black uppercase tracking-wider text-[#02275A]">
                            Link Subordinate Employee Templates <span className="text-red-500">*</span>
                          </label>
                        </div>
                        <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                          Select the benchmark template(s) used by ordinary staff/subordinates under this manager. Selecting templates will automatically synchronize and merge the KPI definitions, weight limits, and target values, linking them together for cumulative data aggregation.
                        </p>
                        
                        <div className="space-y-2 relative">
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Click to search / select subordinate templates..."
                              value={subordinateSearchQuery}
                              onFocus={() => setShowSubordinateDropdown(true)}
                              onClick={() => setShowSubordinateDropdown(true)}
                              onChange={(e) => {
                                setSubordinateSearchQuery(e.target.value);
                                setShowSubordinateDropdown(true);
                              }}
                              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-[#02275A]/15 focus:border-[#02275A] text-slate-700 shadow-sm cursor-pointer pl-9"
                            />
                            <div className="absolute left-3 top-3 text-slate-400">
                              <i className="fas fa-search text-xs"></i>
                            </div>
                            {showSubordinateDropdown && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowSubordinateDropdown(false);
                                }}
                                className="absolute right-3 top-3 text-[10px] text-slate-400 hover:text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-md"
                              >
                                Close ✕
                              </button>
                            )}
                          </div>

                          {/* Selected Tags Display */}
                          {linkedTemplateIds.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {templates
                                .filter(t => linkedTemplateIds.includes(t.id))
                                .map(t => (
                                  <span
                                    key={t.id}
                                    className="inline-flex items-center gap-1.5 px-2 py-1 bg-[#02275A]/5 border border-[#02275A]/10 text-[#02275A] text-[10px] font-bold rounded-lg"
                                  >
                                    {t.name}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newIds = linkedTemplateIds.filter(id => id !== t.id);
                                        setLinkedTemplateIds(newIds);
                                        syncKpisForLinkedTemplates(newIds);
                                      }}
                                      className="hover:text-red-500 font-black ml-1"
                                    >
                                      ✕
                                    </button>
                                  </span>
                                ))}
                            </div>
                          )}

                          {/* Dropdown Checklist overlay */}
                          {showSubordinateDropdown && (
                            <div className="absolute z-20 left-0 right-0 mt-1 max-h-[250px] overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg p-3 space-y-2">
                              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex justify-between items-center">
                                <span>Available Subordinate Templates</span>
                                <span className="font-mono text-[9px] text-[#02275A]">Click template to toggle/close</span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {templates
                                  .filter(t => !t.is_manager_template)
                                  .filter(t => 
                                    !subordinateSearchQuery || 
                                    t.name.toLowerCase().includes(subordinateSearchQuery.toLowerCase()) ||
                                    t.role_id.toLowerCase().includes(subordinateSearchQuery.toLowerCase()) ||
                                    t.department_id.toLowerCase().includes(subordinateSearchQuery.toLowerCase())
                                  )
                                  .map(t => {
                                    const isChecked = linkedTemplateIds.includes(t.id);
                                    return (
                                      <div
                                        key={t.id}
                                        onClick={() => {
                                          let newIds = [...linkedTemplateIds];
                                          if (newIds.includes(t.id)) {
                                            newIds = newIds.filter(id => id !== t.id);
                                          } else {
                                            newIds.push(t.id);
                                          }
                                          setLinkedTemplateIds(newIds);
                                          syncKpisForLinkedTemplates(newIds);
                                          setShowSubordinateDropdown(false); // Automatically close once selected!
                                        }}
                                        className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                                          isChecked
                                            ? "bg-[#02275A]/[0.04] border-[#02275A] shadow-sm"
                                            : "bg-white border-slate-200 hover:border-slate-300"
                                        }`}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={isChecked}
                                          onChange={() => {}} // click is handled by parent div onClick
                                          className="mt-1 h-4 w-4 text-[#02275A] border-slate-300 rounded focus:ring-[#02275A] pointer-events-none"
                                        />
                                        <div className="flex-1 min-w-0">
                                          <span className="block text-xs font-bold text-slate-700 truncate">{t.name}</span>
                                          <span className="block text-[10px] text-slate-400 font-medium font-mono truncate">
                                            {t.role_id} / {t.department_id}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })}
                              </div>
                            </div>
                          )}
                        </div>
                        {linkedTemplateIds.length === 0 && (
                          <p className="text-[10px] text-red-500 font-bold mt-1">
                            * Please select at least one subordinate template.
                          </p>
                        )}
                      </div>
                    )}

                    <div className="space-y-4 col-span-1 md:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-2">
                        <i className="fas fa-users-cog text-[#02275A]"></i>
                        <h4 className="text-xs font-black text-[#02275A] uppercase tracking-wider">
                          Template Target Scope (Roles & Departments)
                        </h4>
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                        Specify which roles and departments this template applies to. You can check multiple existing options from the checklist below to link them simultaneously, or type manually.
                      </p>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        {/* ROLES SELECTOR */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-black uppercase tracking-wider text-slate-500">
                              Target Roles
                            </label>
                            <button
                              type="button"
                              onClick={() => setShowRoleChecklist(!showRoleChecklist)}
                              className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold transition-colors"
                            >
                              {showRoleChecklist ? "Hide Checklist ✕" : "Show Checklist ▾"}
                            </button>
                          </div>
                          <input
                            type="text"
                            placeholder="Click here or type roles separated by comma..."
                            value={templateRole}
                            onFocus={() => setShowRoleChecklist(true)}
                            onClick={() => setShowRoleChecklist(true)}
                            onChange={(e) => setTemplateRole(e.target.value)}
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[#02275A] focus:border-transparent text-slate-700 shadow-sm cursor-pointer"
                          />
                          {showRoleChecklist && (
                            <div className="space-y-1 animate-fade-in">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                                Existing Corporate Roles Checklist:
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-[140px] overflow-y-auto bg-white border border-slate-200 rounded-xl p-2 shadow-inner">
                                {existingRoles.map((roleName) => {
                                  const selectedItems = templateRole.split(",").map(r => r.trim().toLowerCase()).filter(Boolean);
                                  const isChecked = selectedItems.includes(roleName.toLowerCase());
                                  return (
                                    <label
                                      key={roleName}
                                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer select-none transition-all ${
                                        isChecked
                                          ? "bg-indigo-50 border-indigo-300 text-indigo-950"
                                          : "bg-slate-50/50 border-slate-100 text-slate-600 hover:bg-slate-100 hover:border-slate-300"
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => {
                                          const items = templateRole.split(",").map(r => r.trim()).filter(Boolean);
                                          const lowerItems = items.map(r => r.toLowerCase());
                                          if (lowerItems.includes(roleName.toLowerCase())) {
                                            const updated = items.filter(r => r.toLowerCase() !== roleName.toLowerCase());
                                            setTemplateRole(updated.join(", "));
                                          } else {
                                            const updated = [...items, roleName];
                                            setTemplateRole(updated.join(", "));
                                          }
                                        }}
                                        className="w-3.5 h-3.5 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                                      />
                                      <span className="truncate" title={roleName}>{roleName}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* DEPARTMENTS SELECTOR */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-black uppercase tracking-wider text-slate-500">
                              Target Departments
                            </label>
                            <button
                              type="button"
                              onClick={() => setShowDeptChecklist(!showDeptChecklist)}
                              className="text-[10px] text-sky-600 hover:text-sky-800 font-bold transition-colors"
                            >
                              {showDeptChecklist ? "Hide Checklist ✕" : "Show Checklist ▾"}
                            </button>
                          </div>
                          <input
                            type="text"
                            placeholder="Click here or type departments separated by comma..."
                            value={templateDepartment}
                            onFocus={() => setShowDeptChecklist(true)}
                            onClick={() => setShowDeptChecklist(true)}
                            onChange={(e) => setTemplateDepartment(e.target.value)}
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[#02275A] focus:border-transparent text-slate-700 shadow-sm cursor-pointer"
                          />
                          {showDeptChecklist && (
                            <div className="space-y-1 animate-fade-in">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                                Existing Corporate Departments Checklist:
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-[140px] overflow-y-auto bg-white border border-slate-200 rounded-xl p-2 shadow-inner">
                                {existingDepartments.map((deptName) => {
                                  const selectedItems = templateDepartment.split(",").map(d => d.trim().toLowerCase()).filter(Boolean);
                                  const isChecked = selectedItems.includes(deptName.toLowerCase());
                                  return (
                                    <label
                                      key={deptName}
                                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer select-none transition-all ${
                                        isChecked
                                          ? "bg-sky-50 border-sky-300 text-sky-950"
                                          : "bg-slate-50/50 border-slate-100 text-slate-600 hover:bg-slate-100 hover:border-slate-300"
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => {
                                          const items = templateDepartment.split(",").map(d => d.trim()).filter(Boolean);
                                          const lowerItems = items.map(d => d.toLowerCase());
                                          if (lowerItems.includes(deptName.toLowerCase())) {
                                            const updated = items.filter(d => d.toLowerCase() !== deptName.toLowerCase());
                                            setTemplateDepartment(updated.join(", "));
                                          } else {
                                            const updated = [...items, deptName];
                                            setTemplateDepartment(updated.join(", "));
                                          }
                                        }}
                                        className="w-3.5 h-3.5 rounded text-sky-600 border-slate-300 focus:ring-sky-500 cursor-pointer"
                                      />
                                      <span className="truncate" title={deptName}>{deptName}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Smart Defaults Action */}
                  <div className="bg-[#02275A]/5 rounded-xl p-3 border border-[#02275A]/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3 text-slate-800">
                      <div className="bg-[#02275A]/10 p-2 rounded-lg">
                        <i className="fas fa-magic text-[#02275A]"></i>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold">
                          Start with a preset?
                        </h4>
                        <p className="text-xs text-[#02275A]/70">
                          Load pre-configured metrics for common roles.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setTemplateRole("Marketer");
                        setTemplateDepartment("Marketing");
                        setTemplateKpis([
                          {
                            id: "mk-1-" + Date.now(),
                            name: "Leads generated",
                            type: "Target-Based",
                            weight: 25,
                            targetValue: 150,
                            unit: "leads",
                            capValue: 200,
                            validationRule: "Must be standard positive number",
                          },
                          {
                            id: "mk-2-" + Date.now(),
                            name: "Cost per lead",
                            type: "Deductive",
                            weight: 20,
                            targetValue: 10,
                            unit: "$",
                            capValue: 30,
                            validationRule: "Deduction threshold limit",
                          },
                          {
                            id: "item-mk-3-" + Date.now(),
                            name: "Qualified lead rate",
                            type: "Percentage",
                            weight: 20,
                            targetValue: 100,
                            unit: "%",
                            capValue: 100,
                            validationRule: "Must not exceed 100%",
                          },
                          {
                            id: "item-mk-4-" + Date.now(),
                            name: "Campaign conversion",
                            type: "Percentage",
                            weight: 15,
                            targetValue: 100,
                            unit: "%",
                            capValue: 100,
                            validationRule: "Must not exceed 100%",
                          },
                        ]);
                        showSuccess("Applied Marketing Team preset KPIs.");
                      }}
                      className="px-4 py-2 bg-[#02275A] hover:bg-[#0c3975] text-white text-xs font-bold rounded-lg shadow-sm transition-all whitespace-nowrap"
                    >
                      Load Marketing Preset
                    </button>
                  </div>

                  {/* Metrics section */}
                  <div className="space-y-6">
                    {/* Configuration Limits Summary */}
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h4 className="font-extrabold text-[#02275A] text-base">
                        Metrics Configuration
                      </h4>
                      <div className="flex items-center gap-4 text-xs font-semibold">
                        <div
                          className="flex items-center gap-1.5 cursor-pointer group"
                          title="Click to adjust limit"
                        >
                          <span className="text-slate-400">KPIs Weight:</span>
                          <input
                            type="number"
                            max="100"
                            min="10"
                            value={templateRoleLimit}
                            onChange={(e) =>
                              setTemplateRoleLimit(Number(e.target.value))
                            }
                            className="w-12 bg-transparent border-b border-dashed border-slate-300 text-[#02275A] py-0.5 focus:outline-none focus:border-[#02275A] text-center group-hover:border-slate-400"
                          />
                          %
                        </div>
                        <div
                          className="flex items-center gap-1.5 cursor-pointer group"
                          title="Click to adjust limit"
                        >
                          <span className="text-slate-400">
                            Conduct Weight:
                          </span>
                          <input
                            type="number"
                            max="90"
                            min="0"
                            value={templateConductLimit}
                            onChange={(e) =>
                              setTemplateConductLimit(Number(e.target.value))
                            }
                            className="w-12 bg-transparent border-b border-dashed border-slate-300 text-emerald-700 py-0.5 focus:outline-none focus:border-emerald-600 text-center group-hover:border-slate-400"
                          />
                          %
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                      {/* LEFT SUBFORM: Role-Specific KPIs Builder */}
                      <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-end">
                          <label className="text-sm font-black text-slate-700">
                            1. Role KPIs
                          </label>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                              templateKpis.reduce(
                                (sum, item) => sum + item.weight,
                                0,
                              ) === templateRoleLimit
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                : "bg-amber-50 text-amber-700 border-amber-100"
                            }`}
                          >
                            {templateKpis.reduce(
                              (sum, item) => sum + item.weight,
                              0,
                            )}{" "}
                            / {templateRoleLimit}% Allocated
                          </span>
                        </div>



                        {/* Listed KPI items (Editable Table) */}
                        <div className="space-y-4">
                          {templateKpis.length === 0 ? (
                            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-6 text-center text-slate-500 text-xs text-[#02275A] font-semibold">
                              No KPIs added yet. Add your first metric below.
                            </div>
                          ) : (
                            <div
                              className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm"
                              id="div-kpi-tbl-container"
                            >
                              <table
                                className="w-full text-left text-xs text-slate-600 border-collapse"
                                id="tbl-kpi-edit"
                              >
                                <thead
                                  className="bg-[#02275A]/5 border-b border-slate-200 text-[#02275A] uppercase font-extrabold text-[9px] tracking-wider"
                                  id="thead-kpi"
                                >
                                  <tr>
                                    <th
                                      id="th-kpi-name"
                                      className="p-2 min-w-[120px]"
                                    >
                                      KPI Name
                                    </th>
                                    <th
                                      id="th-kpi-type"
                                      className="p-2 min-w-[100px]"
                                    >
                                      KPI Type
                                    </th>
                                    <th
                                      id="th-kpi-weight"
                                      className="p-2 w-14 text-center"
                                    >
                                      Weight%
                                    </th>
                                    <th
                                      id="th-kpi-target"
                                      className="p-2 w-20 text-center"
                                    >
                                      Target
                                    </th>
                                    <th
                                      id="th-kpi-unit"
                                      className="p-2 w-14 text-center"
                                    >
                                      Unit
                                    </th>
                                    <th
                                      id="th-kpi-cap"
                                      className="p-2 w-16 text-center"
                                    >
                                      Cap%
                                    </th>
                                    <th
                                      id="th-kpi-actions"
                                      className="p-2 w-8 text-center"
                                    >
                                      Action
                                    </th>
                                  </tr>
                                </thead>
                                <tbody
                                  className="divide-y divide-slate-150"
                                  id="tbody-kpi"
                                >
                                  {templateKpis.map((item, idx) => {
                                    const handleFieldChange = (
                                      field: keyof TemplateKpiItem,
                                      val: any,
                                    ) => {
                                      const updated = [...templateKpis];
                                      updated[idx] = {
                                        ...updated[idx],
                                        [field]: val,
                                      };
                                      setTemplateKpis(updated);
                                    };

                                    return (
                                      <tr
                                        key={item.id}
                                        className="hover:bg-slate-50/50 transition-colors"
                                        id={`kpi-tr-${item.id}`}
                                      >
                                        <td className="p-1">
                                          <input
                                            type="text"
                                            id={`kpi-name-input-${item.id}`}
                                            value={item.name}
                                            onChange={(e) =>
                                              handleFieldChange(
                                                "name",
                                                e.target.value,
                                              )
                                            }
                                            className="w-full px-1.5 py-1 border border-slate-200 rounded font-bold text-slate-700 focus:ring-1 focus:ring-[#02275A] focus:border-transparent outline-none text-[11px]"
                                            placeholder="Metric Name"
                                          />
                                        </td>
                                        <td className="p-1">
                                          <select
                                            id={`kpi-type-select-${item.id}`}
                                            value={item.type}
                                            onChange={(e) =>
                                              handleFieldChange(
                                                "type",
                                                e.target.value as any,
                                              )
                                            }
                                            className="w-full px-1 py-1 border border-slate-200 rounded bg-white text-[10px] font-bold text-[#02275A] focus:ring-1 focus:ring-[#02275A] outline-none"
                                          >
                                            <option value="Target-Based">
                                              Target-Based
                                            </option>
                                            <option value="Percentage">
                                              Percentage
                                            </option>
                                            <option value="Deductive">
                                              Deductive
                                            </option>
                                            <option value="Binary">
                                              Binary
                                            </option>
                                            <option value="Achievement">
                                              Achievement
                                            </option>
                                            <option value="Reverse Achievement">
                                              Reverse Achievement
                                            </option>
                                            <option value="Ratio">Ratio</option>
                                            <option value="Rating">
                                              Rating
                                            </option>
                                          </select>
                                        </td>
                                        <td className="p-1">
                                          <input
                                            type="number"
                                            id={`kpi-weight-input-${item.id}`}
                                            value={item.weight || ""}
                                            onChange={(e) =>
                                              handleFieldChange(
                                                "weight",
                                                Number(e.target.value),
                                              )
                                            }
                                            className="w-full px-1 py-1 border border-slate-200 rounded text-center font-black text-[#02275A] focus:ring-1 focus:ring-[#02275A] outline-none text-[11px]"
                                            min="0"
                                            max="100"
                                          />
                                        </td>
                                        <td className="p-1">
                                          <input
                                            type="number"
                                            id={`kpi-target-input-${item.id}`}
                                            value={
                                              item.targetValue === undefined ||
                                              item.targetValue === null
                                                ? ""
                                                : item.targetValue
                                            }
                                            onChange={(e) =>
                                              handleFieldChange(
                                                "targetValue",
                                                Number(e.target.value),
                                              )
                                            }
                                            className="w-full px-1 py-1 border border-slate-200 rounded text-center font-bold text-[#02275A] focus:ring-1 focus:ring-[#02275A] outline-none text-[11px]"
                                            placeholder={
                                              item.type === "Achievement" ||
                                              item.type ===
                                                "Reverse Achievement"
                                                ? "50k"
                                                : item.type === "Ratio"
                                                  ? "95"
                                                  : item.type === "Rating"
                                                    ? "5"
                                                    : "Target"
                                            }
                                          />
                                        </td>
                                        <td className="p-1">
                                          <input
                                            type="text"
                                            id={`kpi-unit-input-${item.id}`}
                                            value={item.unit}
                                            onChange={(e) =>
                                              handleFieldChange(
                                                "unit",
                                                e.target.value,
                                              )
                                            }
                                            className="w-full px-1 py-1 border border-slate-200 rounded text-center text-slate-500 font-semibold focus:ring-1 focus:ring-[#02275A] outline-none text-[11px]"
                                            placeholder="Unit"
                                          />
                                        </td>
                                        <td className="p-1">
                                          <input
                                            type="number"
                                            id={`kpi-cap-input-${item.id}`}
                                            value={
                                              item.capValue === undefined ||
                                              item.capValue === null
                                                ? ""
                                                : item.capValue
                                            }
                                            onChange={(e) =>
                                              handleFieldChange(
                                                "capValue",
                                                Number(e.target.value),
                                              )
                                            }
                                            className="w-full px-1 py-1 border border-slate-200 rounded text-center text-slate-500 focus:ring-1 focus:ring-[#02275A] outline-none text-[11px]"
                                            placeholder="Cap"
                                            min="0"
                                          />
                                        </td>
                                        <td className="p-1 text-center">
                                          <button
                                            type="button"
                                            id={`kpi-delete-btn-${item.id}`}
                                            onClick={() =>
                                              handleRemoveKpiFromTemplate(
                                                item.id,
                                              )
                                            }
                                            className="text-slate-300 hover:text-red-500 p-1 transition-colors"
                                            title="Remove KPI"
                                          >
                                            <i className="fas fa-trash text-xs"></i>
                                          </button>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>

                        {/* Add new KPI Form (Compact) */}
                        <div className="bg-slate-50 p-4 xl:p-5 rounded-xl border border-slate-200">
                          <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">
                            Add Role Metric
                          </h5>
                          <div className="space-y-3">
                            <div>
                              <input
                                type="text"
                                placeholder="Metric Name (e.g. Sales volume)"
                                value={kpiItemName}
                                onChange={(e) => setKpiItemName(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#02275A] focus:border-transparent outline-none text-slate-700"
                              />
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                              <div className="col-span-2 sm:col-span-1 lg:col-span-1">
                                <select
                                  value={kpiItemType}
                                  onChange={(e) =>
                                    setKpiItemType(e.target.value as any)
                                  }
                                  className="w-full bg-white text-xs border border-slate-200 px-2 py-2 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#02275A]"
                                >
                                  <option value="Target-Based">
                                    Target-Based
                                  </option>
                                  <option value="Percentage">Percentage</option>
                                  <option value="Deductive">Deductive</option>
                                  <option value="Binary">Binary</option>
                                  <option value="Achievement">
                                    Achievement
                                  </option>
                                  <option value="Reverse Achievement">
                                    Reverse Achievement
                                  </option>
                                  <option value="Ratio">Ratio</option>
                                  <option value="Rating">Rating</option>
                                </select>
                              </div>
                              <div className="col-span-1 sm:col-span-1 lg:col-span-1">
                                <input
                                  type="number"
                                  placeholder="Target"
                                  value={kpiItemTarget || ""}
                                  onChange={(e) =>
                                    setKpiItemTarget(Number(e.target.value))
                                  }
                                  className="w-full px-2 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-[#02275A] outline-none text-slate-700 transition-all placeholder:text-slate-400"
                                  title="Target Benchmark"
                                />
                              </div>
                              <div className="col-span-1 sm:col-span-1 lg:col-span-1">
                                <input
                                  type="text"
                                  placeholder="Unit (%, $)"
                                  value={kpiItemUnit}
                                  onChange={(e) =>
                                    setKpiItemUnit(e.target.value)
                                  }
                                  className="w-full px-2 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-[#02275A] outline-none text-slate-700 transition-all placeholder:text-slate-400"
                                />
                              </div>
                              <div className="col-span-1 sm:col-span-1 lg:col-span-1 relative group">
                                <input
                                  type="number"
                                  placeholder="Weight %"
                                  value={kpiItemWeight || ""}
                                  onChange={(e) =>
                                    setKpiItemWeight(Number(e.target.value))
                                  }
                                  className="w-full px-2 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-[#02275A] focus:ring-1 focus:ring-[#02275A] outline-none transition-all placeholder:text-slate-400 placeholder:font-medium"
                                />
                              </div>
                            </div>
                            <details className="mt-1 group">
                              <summary className="text-[11px] font-bold text-slate-500 cursor-pointer list-none flex items-center gap-1 select-none hover:text-[#02275A]">
                                <i className="fas fa-chevron-right text-[9px] transition-transform group-open:rotate-90"></i>{" "}
                                Advanced Rules
                              </summary>
                              <div className="grid grid-cols-2 gap-3 mt-3 ml-2 border-l-2 border-slate-200 pl-3">
                                <div>
                                  <label className="text-[10px] font-bold text-slate-500 mb-1 block">
                                    Limit Cap
                                  </label>
                                  <input
                                    type="number"
                                    value={kpiItemCap || ""}
                                    onChange={(e) =>
                                      setKpiItemCap(Number(e.target.value))
                                    }
                                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs font-medium focus:ring-1 focus:ring-[#02275A] outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-slate-500 mb-1 block">
                                    Validation Protocol
                                  </label>
                                  <select
                                    value={kpiItemValidation}
                                    onChange={(e) =>
                                      setKpiItemValidation(e.target.value)
                                    }
                                    className="w-full bg-white text-[11px] border border-slate-200 py-1.5 px-2 rounded font-medium focus:outline-none focus:ring-1 focus:ring-[#02275A]"
                                  >
                                    <option value="Must be non-negative positive">
                                      positive numbers
                                    </option>
                                    <option value="Must fit percentage index 0-100">
                                      percentage 0-100
                                    </option>
                                    <option value="Binary state zero or one">
                                      binary (yes/no)
                                    </option>
                                    <option value="No limits, dynamic decimal acceptable">
                                      fraction values
                                    </option>
                                  </select>
                                </div>
                              </div>
                            </details>
                            <button
                              type="button"
                              onClick={handleAddKpiToTemplate}
                              className="w-full bg-[#02275A] hover:bg-[#0c3975] text-white text-xs font-bold py-2 rounded-lg transition-all shadow-sm mt-1"
                            >
                              Add KPI
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* RIGHT SUBFORM: Company-Wide Conduct KPI Definitions */}
                      <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setHasClickedConductMetrics(true)}>
                            <label className="text-sm font-black text-slate-700 cursor-pointer">
                              2. Conduct Metrics
                            </label>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                              templateConducts.reduce(
                                (sum, item) => sum + item.weight,
                                0,
                              ) === templateConductLimit
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                : "bg-amber-50 text-amber-700 border-amber-100"
                            }`}
                          >
                            {templateConducts.reduce(
                              (sum, item) => sum + item.weight,
                              0,
                            )}{" "}
                            / {templateConductLimit}% Allocated
                          </span>
                        </div>

                        {/* Checklist of predefined conducts */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 relative">
                          <div className="flex items-center justify-between">
                            <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
                              Corporate Standards Checklist
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setShowConductChecklist(!showConductChecklist);
                                setHasClickedConductMetrics(true);
                              }}
                              className="text-[10px] text-emerald-600 hover:text-emerald-800 font-bold transition-colors"
                            >
                              {showConductChecklist ? "Hide Checklist ✕" : "Show Checklist ▾"}
                            </button>
                          </div>

                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Click here to choose/filter conduct standards..."
                              value={conductSearchQuery}
                              onClick={() => {
                                setShowConductChecklist(true);
                                setHasClickedConductMetrics(true);
                              }}
                              onFocus={() => {
                                setShowConductChecklist(true);
                                setHasClickedConductMetrics(true);
                              }}
                              onChange={(e) => {
                                setConductSearchQuery(e.target.value);
                                setShowConductChecklist(true);
                                setHasClickedConductMetrics(true);
                              }}
                              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700 shadow-sm cursor-pointer pl-9"
                            />
                            <div className="absolute left-3 top-3.5 text-slate-400">
                              <i className="fas fa-search text-xs"></i>
                            </div>
                            {showConductChecklist && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowConductChecklist(false);
                                }}
                                className="absolute right-3 top-3 text-[10px] text-slate-400 hover:text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-md"
                              >
                                Close ✕
                              </button>
                            )}
                          </div>

                          {showConductChecklist && (
                            <div className="absolute z-20 left-0 right-0 mt-1 space-y-2 max-h-[320px] overflow-y-auto pr-1 bg-white border border-slate-200 rounded-xl shadow-lg p-3">
                              {(() => {
                                const list = (perfSettings.companyWideConducts || []).filter(c =>
                                  !conductSearchQuery ||
                                  c.name.toLowerCase().includes(conductSearchQuery.toLowerCase()) ||
                                  (c.description || "").toLowerCase().includes(conductSearchQuery.toLowerCase())
                                );
                                if (list.length === 0) {
                                  return (
                                    <div className="bg-white border border-slate-200 border-dashed rounded-xl p-6 text-center text-slate-500 text-xs font-medium">
                                      {conductSearchQuery ? "No matching conducts found." : "No company-wide conducts found. Please create some first."}
                                    </div>
                                  );
                                }
                                return list.map((c) => {
                                  const isChecked = templateConducts.some(
                                    (tc) =>
                                      (tc && tc.id === c.id) ||
                                      (tc && tc.name && c.name && tc.name.toLowerCase() === c.name.toLowerCase())
                                  );
                                  return (
                                  <div
                                    key={c.id}
                                    onClick={() => {
                                      setHasClickedConductMetrics(true);
                                      if (isChecked) {
                                        // Uncheck: remove from templateConducts
                                        setTemplateConducts(
                                          templateConducts.filter(
                                            (tc) =>
                                              tc.id !== c.id &&
                                              (!tc.name || !c.name || tc.name.toLowerCase() !== c.name.toLowerCase())
                                          )
                                        );
                                      } else {
                                        // Check: add to templateConducts
                                        const currentSum = templateConducts.reduce(
                                          (sum, item) => sum + (Number(item.weight) || 0),
                                          0
                                        );
                                        const cPoints = Number(c.points) || 0;
                                        if (currentSum + cPoints > templateConductLimit) {
                                          showError(
                                            `Weight Limit exceeded! Selecting "${c.name || ''}" (${cPoints}%) would make total conduct weight ${currentSum + cPoints}%, which exceeds the maximum limit of ${templateConductLimit}%. Please deselect another conduct standard first.`
                                          );
                                          return;
                                        }
                                        const newItem: TemplateConductItem = {
                                          id: c.id,
                                          name: c.name || '',
                                          type: "Percentage",
                                          weight: cPoints,
                                          targetValue: 100,
                                          unit: "%",
                                        };
                                        setTemplateConducts([...templateConducts, newItem]);
                                        setShowConductChecklist(false);
                                      }
                                    }}
                                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none ${
                                      isChecked
                                        ? "bg-emerald-50/70 border-emerald-300 shadow-xs"
                                        : "bg-white border-slate-200 hover:border-slate-300"
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="relative flex items-center">
                                        <input
                                          type="checkbox"
                                          checked={isChecked}
                                          onChange={() => {}} // handled by parent onClick
                                          className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer pointer-events-none"
                                        />
                                      </div>
                                      <div className="flex flex-col">
                                        <span
                                          className={`font-bold text-xs ${
                                            isChecked ? "text-emerald-900" : "text-slate-700"
                                          }`}
                                        >
                                          {c.name}
                                        </span>
                                        <span className="text-[9px] text-slate-400 font-medium">
                                          Target: 100% Evaluation
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`text-[11px] font-extrabold px-2.5 py-1 rounded-lg ${
                                          isChecked
                                            ? "bg-emerald-100 text-emerald-800"
                                            : "bg-slate-100 text-slate-600"
                                        }`}
                                      >
                                        {c.points}%
                                      </span>
                                    </div>
                                  </div>
                                );
                                });
                              })()}
                            </div>
                          )}
                        </div>

                        {/* Display of Active Conducts on the template */}
                        {hasClickedConductMetrics && (
                          <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2">
                            <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                              Selected Active Template Conducts ({templateConducts.length})
                            </span>
                            {templateConducts.length === 0 ? (
                              <span className="block text-xs text-slate-400 italic font-medium">
                                No conduct standards checked. Select some above to display.
                              </span>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {templateConducts.map((tc) => (
                                  <div
                                    key={tc.id}
                                    className="flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:border-slate-300 transition-all"
                                  >
                                    <span className="truncate pr-2">{tc.name}</span>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
                                        {tc.weight}%
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveConductFromTemplate(tc.id)}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded-md transition-all ml-1"
                                        title="Remove Conduct"
                                      >
                                        <i className="fas fa-trash-alt text-[11px]"></i>
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Summary of Weight, Targets, and Scoring Rules */}
                  <div
                    className="bg-slate-50 rounded-xl p-4 border border-secondary-200 hover:border-slate-300 transition-all space-y-3 mt-6"
                    id="template-config-summary"
                  >
                    <h4 className="text-xs font-black text-[#02275A] uppercase tracking-wider flex items-center gap-2">
                      <i className="fas fa-clipboard-list"></i> Configuration
                      Summary & Scoring Rules
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      {/* Column 1: Weights */}
                      <div
                        className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm"
                        id="summary-weights"
                      >
                        <h5 className="font-extrabold text-slate-700 mb-1.5 uppercase text-[9px] tracking-wider text-[#02275A]">
                          Total KPI Weight
                        </h5>
                        <div className="space-y-1">
                          <div className="flex justify-between font-medium">
                            <span className="text-slate-500">
                              Role-Specific KPIs:
                            </span>
                            <span
                              className={
                                templateKpis.reduce(
                                  (sum, item) => sum + item.weight,
                                  0,
                                ) === templateRoleLimit
                                  ? "text-emerald-600 font-bold"
                                  : "text-amber-600 font-bold"
                              }
                            >
                              {templateKpis.reduce(
                                (sum, item) => sum + item.weight,
                                0,
                              )}
                              % / {templateRoleLimit}%
                            </span>
                          </div>
                          <div className="flex justify-between font-medium">
                            <span className="text-slate-500">
                              Conduct Metrics:
                            </span>
                            <span
                              className={
                                templateConducts.reduce(
                                  (sum, item) => sum + item.weight,
                                  0,
                                ) === templateConductLimit
                                  ? "text-emerald-600 font-bold"
                                  : "text-amber-600 font-bold"
                              }
                            >
                              {templateConducts.reduce(
                                (sum, item) => sum + item.weight,
                                0,
                              )}
                              % / {templateConductLimit}%
                            </span>
                          </div>
                          <div className="border-t border-slate-100 pt-1 mt-1 flex justify-between font-extrabold text-[#02275A]">
                            <span>Overall Limit Sum:</span>
                            <span>
                              {templateKpis.reduce(
                                (sum, item) => sum + item.weight,
                                0,
                              ) +
                                templateConducts.reduce(
                                  (sum, item) => sum + item.weight,
                                  0,
                                )}
                              % / 100%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Column 2: Targets */}
                      <div
                        className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm"
                        id="summary-targets"
                      >
                        <h5 className="font-extrabold text-slate-700 mb-1.5 uppercase text-[9px] tracking-wider text-[#02275A]">
                          KPI Targets Setup
                        </h5>
                        <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
                          {templateKpis.length === 0 ? (
                            <span className="text-amber-600 font-bold block text-[10px]">
                              No KPIs defined.
                            </span>
                          ) : (
                            templateKpis.map((kpi) => {
                              const hasTarget =
                                kpi.targetValue !== undefined &&
                                kpi.targetValue !== null &&
                                !Number.isNaN(kpi.targetValue) &&
                                kpi.targetValue > 0;
                              return (
                                <div
                                  key={kpi.id}
                                  className="flex justify-between text-[10px] font-bold border-b border-slate-50 pb-0.5"
                                >
                                  <span className="truncate pr-2 text-slate-600">
                                    {kpi.name}:
                                  </span>
                                  <span
                                    className={
                                      hasTarget
                                        ? "text-emerald-700"
                                        : "text-rose-600 font-black"
                                    }
                                  >
                                    {hasTarget
                                      ? `${kpi.targetValue} ${kpi.unit}`
                                      : "Missing Target!"}
                                  </span>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>

                      {/* Column 3: Scoring Rules */}
                      <div
                        className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm text-[10px]"
                        id="summary-scoring"
                      >
                        <h5 className="font-extrabold text-slate-700 mb-1.5 uppercase text-[9px] tracking-wider text-[#02275A]">
                          Scoring Rules & Formula
                        </h5>
                        <div className="space-y-1.5 text-slate-600 font-semibold max-h-24 overflow-y-auto pr-1">
                          <div>
                            <span className="bg-[#02275A]/10 text-[#02275A] font-extrabold px-1 py-0.5 rounded text-[8px] mr-1 uppercase">
                              Achievement
                            </span>
                            <span>Score = Actual / Target</span>
                          </div>
                          <div>
                            <span className="bg-rose-50 text-rose-700 font-extrabold px-1 py-0.5 rounded text-[8px] mr-1 uppercase">
                              Reverse Ach.
                            </span>
                            <span>Score = Target / Actual</span>
                          </div>
                          <div>
                            <span className="bg-emerald-50 text-emerald-800 font-extrabold px-1 py-0.5 rounded text-[8px] mr-1 uppercase">
                              Ratio %
                            </span>
                            <span>Actual completion % met</span>
                          </div>
                          <div>
                            <span className="bg-purple-50 text-purple-800 font-extrabold px-1 py-0.5 rounded text-[8px] mr-1 uppercase">
                              Rating
                            </span>
                            <span>Value scaled to scale ceiling</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="border-t border-slate-200 pt-5 flex justify-end gap-3">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-[#02275A] hover:bg-[#0c3975] text-white rounded-xl text-sm font-black tracking-wide shadow-md flex items-center justify-center gap-2 w-full sm:w-auto transition-all"
                    >
                      <i className="fas fa-save"></i> Save Template
                      Configuration
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* B. TEMPLATES LISTING DASHBOARD */
              <div className="space-y-6">
                {/* Compact List distribution of all templates */}
                <div className="flex flex-col gap-3">
                  {templates.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500">
                      <i className="fas fa-folder-open text-slate-300 text-3xl mb-3 block"></i>
                      <p className="text-sm font-bold">
                        No performance templates found. Create one to get
                        started.
                      </p>
                    </div>
                  ) : (
                    templates.map((tmpl) => {
                      return (
                        <div
                          key={tmpl.id}
                          className="bg-white rounded-2xl border border-slate-200 hover:border-[#02275A]/30 hover:shadow-md transition-all p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 group"
                          id={`template-card-${tmpl.id}`}
                        >
                          {/* Primary Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              <h3 className="font-extrabold text-[#02275A] text-base truncate">
                                {tmpl.name}
                              </h3>
                              {tmpl.is_active === false && (
                                <span className="text-[9px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md font-black uppercase border border-amber-100 whitespace-nowrap">
                                  Archived
                                </span>
                              )}
                              <span className="bg-[#02275A]/[0.04] text-[#02275A] font-bold tracking-wide text-[10px] px-2 py-0.5 rounded border border-[#02275A]/10 whitespace-nowrap">
                                {tmpl.role_id}
                              </span>
                              <span className="text-slate-500 font-semibold text-[10px] bg-slate-50 px-2 py-0.5 rounded border border-slate-100 whitespace-nowrap">
                                {tmpl.department_id}
                              </span>
                            </div>
                            {tmpl.description && (
                              <p className="text-slate-500 text-xs font-medium mb-2">
                                {tmpl.description}
                              </p>
                            )}

                            {/* Summary details */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                              <div className="flex items-center gap-1.5">
                                <i className="fas fa-chart-pie text-slate-400 text-xs"></i>
                                <span className="text-xs text-slate-600 font-semibold">
                                  {tmpl.kpiItems.length} KPIs{" "}
                                  <span className="text-slate-400 font-normal">
                                    ({tmpl.performance_weight_limit}%)
                                  </span>
                                </span>
                              </div>
                              <div className="w-1 h-1 rounded-full bg-slate-300 hidden sm:block"></div>
                              <div className="flex items-center gap-1.5">
                                <i className="fas fa-shield-halved text-emerald-500/70 text-xs"></i>
                                <span className="text-xs text-slate-600 font-semibold">
                                  {tmpl.conductCategories.length} Conducts{" "}
                                  <span className="text-slate-400 font-normal">
                                    ({tmpl.conduct_weight_limit}%)
                                  </span>
                                </span>
                              </div>
                            </div>

                            {/* Sneak peek of KPIs */}
                            {tmpl.kpiItems.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-3">
                                {tmpl.kpiItems.slice(0, 4).map((item) => (
                                  <span
                                    key={item.id}
                                    className="text-[10px] bg-slate-50 text-slate-500 px-2 py-1 rounded-md border border-slate-100 truncate max-w-[150px]"
                                  >
                                    {item.name}
                                  </span>
                                ))}
                                {tmpl.kpiItems.length > 4 && (
                                  <span className="text-[10px] text-slate-400 px-1 py-1 font-semibold">
                                    +{tmpl.kpiItems.length - 4} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between border-t lg:border-t-0 border-slate-100 pt-3 lg:pt-0 gap-3">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDuplicateTemplate(tmpl)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                                title="Duplicate Template"
                              >
                                <i className="fas fa-copy text-xs"></i>
                              </button>
                              <button
                                onClick={() =>
                                  handleToggleActiveTemplate(
                                    tmpl.id,
                                    tmpl.is_active !== false,
                                  )
                                }
                                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${tmpl.is_active === false ? "bg-amber-50 text-amber-600" : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"}`}
                                title={
                                  tmpl.is_active === false
                                    ? "Unarchive Template"
                                    : "Archive Template"
                                }
                              >
                                <i className="fas fa-archive text-xs"></i>
                              </button>
                              <button
                                onClick={() => handleEditTemplate(tmpl)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-[#02275A]/5 hover:text-[#02275A] transition-colors"
                                title="Edit Template Properties"
                              >
                                <i className="fas fa-edit text-xs"></i>
                              </button>
                              <button
                                onClick={() => handleDeleteTemplate(tmpl.id)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                                title="Delete Template"
                              >
                                <i className="fas fa-trash-alt text-xs"></i>
                              </button>
                            </div>
                            <button
                              onClick={() => {
                                setApplyingTemplate(tmpl);
                                setApplySelectedEmpIds([]);
                                setApplySearchQuery("");
                                setIsApplySearchFocused(false);
                                setApplyFilterDept("All");
                                setApplyFilterEmpType("All");
                              }}
                              className="px-4 py-2 bg-[#02275A] text-white hover:bg-[#0c3975] rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm whitespace-nowrap transition-all focus:ring-2 focus:ring-offset-1 focus:ring-[#02275A]"
                            >
                              <i className="fas fa-user-check"></i> Assign to
                              Staff
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "bulk-upload" && (
          <div className="space-y-6 animate-fade-in pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-[#02275A] mb-2">
                  Bulk Upload Performance
                </h2>
                <p className="text-slate-500 text-sm font-sans">
                  Import performance KPIs and reward metrics in bulk for specific employee styles and roles.
                </p>
              </div>
            </div>

            {/* Selection Filters Card */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm font-sans space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                    1. Select Employee Type / Designation
                  </label>
                  <select
                    value={selectedUploadEmpType}
                    onChange={(e) => {
                      setSelectedUploadEmpType(e.target.value as any);
                    }}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:border-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-[#02275A]/20"
                    id="bulk-upload-emp-type-select"
                  >
                    <option value="all">All Employee Types</option>
                    <option value="manager">Managers & Team Leads</option>
                    <option value="members">Standard Staff Members</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                    2. Select Specified Role Scope
                  </label>
                  <select
                    value={selectedUploadRole}
                    onChange={(e) => {
                      setSelectedUploadRole(e.target.value);
                    }}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:border-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-[#02275A]/20"
                    id="bulk-upload-role-select"
                  >
                    <option value="all">All Roles under selection</option>
                    {availableUploadRoles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dynamic Information Display Box */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-bold uppercase tracking-wide">
                    <i className="fas fa-info-circle text-[#02275A]"></i> Selected Role Profile Context
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <div className="text-xs bg-white border border-slate-200 text-[#02275A] font-bold px-3 py-1 rounded-full shadow-sm">
                      Role Scope: <span className="font-extrabold">{selectedUploadRole === "all" ? "All Roles" : selectedUploadRole}</span>
                    </div>
                    <div className="text-xs bg-white border border-slate-200 text-emerald-700 font-bold px-3 py-1 rounded-full shadow-sm">
                      Filtered Audience: <span className="font-extrabold">{filteredUploadEmployees.length} Employees matched</span>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Expected KPI & Metric Sheet Columns:
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      <span className="text-[10px] font-mono font-bold bg-slate-200/60 text-slate-700 px-2 py-0.5 rounded">
                        Employee ID
                      </span>
                      <span className="text-[10px] font-mono font-bold bg-slate-200/60 text-slate-700 px-2 py-0.5 rounded">
                        First Name
                      </span>
                      {uploadExpectedKpis.map((k) => (
                        <span key={k.id} className="text-[10px] font-mono font-bold bg-[#02275A]/10 text-[#02275A] px-2 py-0.5 rounded">
                          {k.name} ({k.weight}%)
                        </span>
                      ))}
                      <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                        Deductions
                      </span>
                      <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                        Reward Points
                      </span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    disabled={filteredUploadEmployees.length === 0}
                    className="w-full md:w-auto px-5 py-2.5 bg-[#02275A] hover:bg-[#0c3975] disabled:opacity-50 text-white rounded-lg text-xs font-black shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    id="bulk-upload-download-template"
                  >
                    <i className="fas fa-file-excel"></i>
                    Get CSV Template
                  </button>
                </div>
              </div>
            </div>

            {/* Excel / CSV Drag and Drop Zone */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 font-sans">
              <div
                className={`border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all max-w-xl mx-auto text-center relative ${
                  dragActive ? "border-[#02275A] bg-[#02275A]/[0.02]" : "border-slate-300 bg-slate-50/50 hover:bg-slate-50"
                }`}
                onDragEnter={() => setDragActive(true)}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleCSVUpload(file);
                }}
              >
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleCSVUpload(file);
                  }}
                  id="bulk-upload-file-input"
                />
                <div className="w-12 h-12 bg-[#02275A]/10 text-[#02275A] rounded-full flex items-center justify-center text-xl mx-auto mb-3">
                  <i className="fas fa-cloud-upload-alt"></i>
                </div>
                {uploadedFileName ? (
                  <div>
                    <p className="text-[#02275A] font-bold text-sm mb-0.5">
                      Uploaded file: {uploadedFileName}
                    </p>
                    <p className="text-slate-400 text-xs text-slate-500">
                      Drag another file here or click to replace
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-[#02275A] font-bold text-sm mb-0.5">
                      Drag & Drop CSV Performance File Here
                    </p>
                    <p className="text-slate-500 text-xs">
                      or browse files from your computer
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Parsed Preview Table */}
            {parsedPreviewData && (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm animate-fade-in font-sans space-y-4 p-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-base text-[#02275A]">
                      Spreadsheet Import Preview & Match Validation
                    </h3>
                    <p className="text-slate-500 text-xs">
                      Verify metrics mapping status before implementing changes permanently.
                    </p>
                  </div>
                  <span className="text-xs bg-[#02275A]/10 text-[#02275A] font-bold px-3 py-1 rounded-full">
                    {parsedPreviewData.filter(d => d.status === "success").length} Valid Rows
                  </span>
                </div>

                <div className="overflow-x-auto border border-slate-100 rounded-lg">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                        <th className="py-3 px-4">Employee ID</th>
                        <th className="py-3 px-4">Name</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">KPIs Preview Status</th>
                        <th className="py-3 px-4">Score / Points</th>
                        <th className="py-3 px-4 w-32">Match Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                      {parsedPreviewData.map((row, idx) => (
                        <tr key={idx} className={`${row.status === "success" ? "hover:bg-slate-50/50" : "bg-rose-50/30"}`}>
                          <td className="py-3 px-4 font-mono font-bold text-slate-500">
                            {row.id}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-800">
                            {row.name}
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            {row.role}
                          </td>
                          <td className="py-3 px-4">
                            {row.status === "success" ? (
                              <div className="flex flex-wrap gap-1">
                                {row.updatedKpis.map((k: any, kIdx: number) => {
                                  const originalVal = row.originalKpis[kIdx]?.currentValue ?? 0;
                                  const changed = k.currentValue !== originalVal;
                                  return (
                                    <span
                                      key={k.id}
                                      className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                                        changed ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-600"
                                      }`}
                                    >
                                      {k.name}: {originalVal} ➜ {k.currentValue}
                                    </span>
                                  );
                                })}
                              </div>
                            ) : (
                              <span className="text-rose-600 text-[11px] font-medium italic">{row.message}</span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-700">
                            {row.status === "success" ? (
                              <span>
                                {row.originalPoints} PTS ➜{" "}
                                <span className={row.updatedPoints !== row.originalPoints ? "text-emerald-600" : ""}>
                                  {row.updatedPoints} PTS
                                </span>
                              </span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {row.status === "success" ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                <i className="fas fa-check-circle text-[9px]"></i> Valid Match
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-rose-600 bg-rose-500/10 px-2 py-0.5 rounded-full">
                                <i className="fas fa-times-circle text-[9px]"></i> Match Fail
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setParsedPreviewData(null);
                      setUploadedFileName("");
                    }}
                    className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    id="bulk-upload-reset-btn"
                  >
                    Discard File
                  </button>
                  <button
                    type="button"
                    disabled={!parsedPreviewData.some((row) => row.status === "success")}
                    onClick={() => {
                      let successfulUpdates = 0;
                      const finalEmployees = employees.map((emp) => {
                        const parsedMatch = parsedPreviewData.find((row) => row.id === emp.id && row.status === "success");
                        if (parsedMatch && parsedMatch.updatedEmp) {
                          successfulUpdates++;
                          return parsedMatch.updatedEmp;
                        }
                        return emp;
                      });

                      saveAndSyncState(finalEmployees);
                      showSuccess(`Successfully synchronized metrics updates for ${successfulUpdates} matched employees!`);
                      setParsedPreviewData(null);
                      setUploadedFileName("");
                    }}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-black shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
                    id="bulk-upload-apply-btn"
                  >
                    <i className="fas fa-file-import"></i>
                    Apply update ({parsedPreviewData.filter(d => d.status === "success").length} staff)
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MANAGER SETUP PROMPT MODAL */}
      {showManagerSetupPrompt && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans animate-fade-in"
          id="manager-setup-prompt-modal-backdrop"
        >
          <div
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
            id="manager-setup-prompt-modal-container"
          >
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <i className="fas fa-file-invoice text-[#02275A] text-base"></i>
                <span className="font-extrabold text-xs uppercase tracking-wider text-slate-700 font-mono">
                  Select Template Architecture
                </span>
              </div>
              <button
                onClick={() => setShowManagerSetupPrompt(false)}
                className="h-7 w-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-all cursor-pointer text-xs"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs font-semibold text-slate-500 mb-2">
                Choose the design architecture for this new performance template. You can build a standard employee template or a specialized manager template.
              </p>

              <div className="space-y-3">
                {/* Option 1: Standard Template */}
                <button
                  onClick={() => {
                    setShowManagerSetupPrompt(false);
                    handleCreateNewTemplateWithChoice(false, undefined);
                  }}
                  className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-[#02275A] hover:bg-slate-50/50 transition-all flex items-start gap-3.5 group cursor-pointer"
                >
                  <div className="h-9 w-9 rounded-lg bg-slate-100 group-hover:bg-[#02275A]/10 text-slate-600 group-hover:text-[#02275A] flex items-center justify-center shrink-0 transition-colors">
                    <i className="fas fa-user-tie text-base"></i>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">
                      Standard Employee Template
                    </h4>
                    <p className="text-[10px] font-semibold text-slate-500 mt-0.5">
                      Create standard role-based KPIs for department personnel or non-management roles.
                    </p>
                  </div>
                </button>

                {/* Option 2: Manager Template (Regular KPIs) */}
                <button
                  onClick={() => {
                    setShowManagerSetupPrompt(false);
                    handleCreateNewTemplateWithChoice(true, "regular");
                  }}
                  className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-[#02275A] hover:bg-slate-50/50 transition-all flex items-start gap-3.5 group cursor-pointer"
                >
                  <div className="h-9 w-9 rounded-lg bg-slate-100 group-hover:bg-[#02275A]/10 text-slate-600 group-hover:text-[#02275A] flex items-center justify-center shrink-0 transition-colors">
                    <i className="fas fa-tasks text-base"></i>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">
                      Manager Template <span className="text-[#02275A] text-[10px] font-mono font-black uppercase tracking-wider bg-[#02275A]/5 px-1.5 py-0.5 rounded ml-1">Regular</span>
                    </h4>
                    <p className="text-[10px] font-semibold text-slate-500 mt-0.5">
                      Strategic manager template featuring static leadership, feedback rating, and budget KPIs.
                    </p>
                  </div>
                </button>

                {/* Option 3: Manager Template (Cumulative KPIs) */}
                <button
                  onClick={() => {
                    setShowManagerSetupPrompt(false);
                    handleCreateNewTemplateWithChoice(true, "cumulative");
                  }}
                  className="w-full text-left p-4 rounded-xl border border-[#02275A]/30 hover:border-[#02275A] bg-[#02275A]/[0.01] hover:bg-[#02275A]/[0.03] transition-all flex items-start gap-3.5 group cursor-pointer"
                >
                  <div className="h-9 w-9 rounded-lg bg-[#02275A]/5 group-hover:bg-[#02275A]/10 text-[#02275A] flex items-center justify-center shrink-0 transition-colors">
                    <i className="fas fa-layer-group text-base"></i>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span>Manager Template</span>
                      <span className="text-emerald-700 text-[10px] font-mono font-black uppercase tracking-wider bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">
                        Cumulative KPIs
                      </span>
                    </h4>
                    <p className="text-[10px] font-semibold text-slate-500 mt-0.5">
                      Advanced template where 80% weight is automatically aggregated from direct reports' raw performance.
                    </p>
                  </div>
                </button>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowManagerSetupPrompt(false)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DEFINE REWARD MODAL (GLOBAL RENDERING DESIGNATED AREA) */}
      {isDefineRewardModalOpen &&
        (() => {
          const selectedEmpObj = employees.find(
            (emp) => emp.id === (rewardEmployeeId || selectedEmployeeId),
          );
          const isEngineeringRole =
            selectedEmpObj &&
            getRoleCategory(selectedEmpObj.role, selectedEmpObj.department) ===
              "engineer";
          return (
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans animate-fade-in"
              id="define-reward-modal-backdrop"
            >
              <div
                className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col"
                id="define-reward-modal-container"
              >
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-trophy text-[#EAB308]"></i>
                    <span className="font-extrabold text-xs uppercase tracking-wider text-slate-700 font-mono">
                      Define Reward / Penalty & Attach Points
                    </span>
                  </div>
                  <button
                    onClick={() => setIsDefineRewardModalOpen(false)}
                    className="h-7 w-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-all cursor-pointer text-xs"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>

                <form
                  onSubmit={handleDefineRewardSubmit}
                  className="p-6 space-y-4 max-h-[80vh] overflow-y-auto"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                        Target Employee *
                      </label>
                      <select
                        value={rewardEmployeeId || selectedEmployeeId || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setRewardEmployeeId(val);
                          setSelectedEmployeeId(val);
                          setRewardType("customer_praise");
                          setRewardPointsValue(50);
                        }}
                        required
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-sm"
                      >
                        <option value="">Choose Employee...</option>
                        {scopedEmployees.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.firstName} {emp.lastName} — {emp.role}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                        Period ID
                      </label>
                      <select
                        value={rewardPeriodId}
                        onChange={(e) => setRewardPeriodId(e.target.value)}
                        required
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-sm"
                      >
                        {quarters.map((q) => (
                          <option key={q} value={q}>{q}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Classification Selector */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-[#02275A]">
                      Select Classification *
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          setRewardClassification("reward");
                          const defaultRewardType = rewardTypesList[0]?.type || "custom";
                          setRewardType(defaultRewardType);
                          if (defaultRewardType !== "custom") {
                            const found = rewardTypesList.find(t => t.type === defaultRewardType);
                            setRewardPointsValue(found ? found.points : 50);
                          } else {
                            setRewardPointsValue(50);
                          }
                        }}
                        className={`py-3 px-4 rounded-xl border text-xs font-bold font-sans flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          rewardClassification === "reward"
                            ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm ring-1 ring-emerald-500"
                            : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                        }`}
                      >
                        <i className="fas fa-trophy"></i>
                        Reward
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRewardClassification("penalty");
                          setRewardType("penalty");
                          if (engineeringPenaltiesList.length > 0) {
                            const firstPen = engineeringPenaltiesList[0];
                            setSelectedPenaltyId(firstPen.id);
                            setRewardPointsValue(firstPen.points);
                          } else {
                            setRewardPointsValue(10);
                          }
                        }}
                        className={`py-3 px-4 rounded-xl border text-xs font-bold font-sans flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          rewardClassification === "penalty"
                            ? "bg-rose-50 border-rose-500 text-rose-700 shadow-sm ring-1 ring-rose-500"
                            : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                        }`}
                      >
                        <i className="fas fa-gavel"></i>
                        Penalty
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      {rewardClassification === "reward" ? (
                        <>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                            Reward Type
                          </label>
                          <select
                            value={rewardType === "penalty" ? "custom" : rewardType}
                            onChange={(e) => {
                              const val = e.target.value;
                              setRewardType(val);
                              if (val !== "custom") {
                                const found = rewardTypesList.find(
                                  (t) => t.type === val,
                                );
                                if (found) {
                                  setRewardPointsValue(found.points);
                                }
                              }
                            }}
                            required
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-sm"
                          >
                            {rewardTypesList.map((item) => (
                              <option key={item.type} value={item.type}>
                                {item.type} (+{item.points} pts)
                              </option>
                            ))}
                            <option value="custom">
                              Other / Custom Reward...
                            </option>
                          </select>
                          {rewardType === "custom" && (
                            <div className="mt-2 text-xs animate-fade-in">
                              <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1">
                                Enter Custom Reward Type Name
                              </label>
                              <input
                                type="text"
                                value={customRewardType}
                                onChange={(e) =>
                                  setCustomRewardType(e.target.value)
                                }
                                placeholder="e.g. peer_tribute_star"
                                required
                                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-[#02275A] shadow-sm font-mono"
                              />
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                            Penalty Type
                          </label>
                          <select
                            value={selectedPenaltyId || (engineeringPenaltiesList[0]?.id || "")}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSelectedPenaltyId(val);
                              const found = engineeringPenaltiesList.find(
                                (p) => p.id === val,
                              );
                              if (found) {
                                setRewardPointsValue(found.points);
                              }
                            }}
                            required
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-sm"
                          >
                            {engineeringPenaltiesList.map((pen) => (
                              <option key={pen.id} value={pen.id}>
                                {pen.name} (-{pen.points} pts)
                              </option>
                            ))}
                          </select>
                        </>
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                        {rewardClassification === "penalty"
                          ? "Points to Deduct"
                          : "Points"}
                      </label>
                      <input
                        type="number"
                        value={rewardPointsValue}
                        onChange={(e) =>
                          setRewardPointsValue(Number(e.target.value))
                        }
                        required
                        min="1"
                        max="500"
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-sm font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                        Source Department / Channel
                      </label>
                      <input
                        type="text"
                        value={rewardSource}
                        onChange={(e) => setRewardSource(e.target.value)}
                        placeholder="e.g. HR Center, Customer Success, sales_portal"
                        required
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                        Related Record ID (Optional)
                      </label>
                      <input
                        type="text"
                        value={rewardRelatedRecordId}
                        onChange={(e) =>
                          setRewardRelatedRecordId(e.target.value)
                        }
                        placeholder="e.g. TKT-2023-042, INV-10293, N/A"
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                      Reason / Citation
                    </label>
                    <textarea
                      value={rewardReason}
                      onChange={(e) => setRewardReason(e.target.value)}
                      required
                      rows={3}
                      placeholder="Describe the achievement or citation in detail..."
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                        Created By
                      </label>
                      <input
                        type="text"
                        value={rewardCreatedBy}
                        onChange={(e) => setRewardCreatedBy(e.target.value)}
                        required
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500 shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 gap-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsDefineRewardModalOpen(false)}
                      className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-black uppercase tracking-wider transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-[#02275A] text-white hover:bg-[#0c3975] text-xs font-black uppercase tracking-wider px-5 py-2.5 rounded-xl cursor-pointer flex items-center gap-2 shadow-sm transition-colors"
                    >
                      {rewardType === "penalty" ? (
                        <>
                          <i className="fas fa-exclamation-triangle"></i> Issue
                          Penalty Deduction
                        </>
                      ) : (
                        <>
                          <i className="fas fa-plus-circle"></i> Define & Issue
                          Reward
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          );
        })()}

      {/* DEFINE NEW REWARD TYPE & POINTS MODAL */}
      {isAddRewardTypeModalOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans animate-fade-in"
          id="add-reward-type-modal-backdrop"
        >
          <div
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden flex flex-col"
            id="add-reward-type-modal-container"
          >
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <i className="fas fa-plus text-[#02275A]"></i>
                <span className="font-extrabold text-xs uppercase tracking-wider text-slate-700 font-mono">
                  Define New Reward Type & Points
                </span>
              </div>
              <button
                onClick={() => {
                  setIsAddRewardTypeModalOpen(false);
                }}
                className="h-7 w-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-all cursor-pointer text-xs"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-3 font-sans">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                    Type Name
                  </label>
                  <input
                    type="text"
                    value={newRewardTypeInput}
                    onChange={(e) => setNewRewardTypeInput(e.target.value)}
                    placeholder="e.g. perfect_attendance"
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-[#02275A] shadow-sm font-mono focus:border-[#02275A] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                    Default Points
                  </label>
                  <input
                    type="number"
                    value={newRewardTypePoints}
                    onChange={(e) =>
                      setNewRewardTypePoints(Number(e.target.value))
                    }
                    placeholder="e.g. 50"
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-[#02275A] shadow-sm font-mono focus:border-[#02275A] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddRewardTypeModalOpen(false);
                  }}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-black uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const trimmed = newRewardTypeInput.trim();
                    if (!trimmed) {
                      showError("Please enter a reward type name.");
                      return;
                    }
                    if (rewardTypesList.some((item) => item.type === trimmed)) {
                      showError("This reward type already exists!");
                      return;
                    }
                    const updatedList = [
                      ...rewardTypesList,
                      { type: trimmed, points: newRewardTypePoints },
                    ];
                    setRewardTypesList(updatedList);
                    localStorage.setItem(
                      "company_reward_types_list_v2",
                      JSON.stringify(updatedList),
                    );
                    setNewRewardTypeInput("");
                    setNewRewardTypePoints(30);
                    setIsAddRewardTypeModalOpen(false);
                    showSuccess(
                      `Added user-defined reward type: "${trimmed}" with ${newRewardTypePoints} pts`,
                    );
                  }}
                  className="bg-[#02275A] text-white hover:bg-[#0c3975] text-xs font-black uppercase tracking-wider px-5 py-2.5 rounded-xl cursor-pointer flex items-center gap-2 shadow-sm transition-colors"
                >
                  <i className="fas fa-plus-circle"></i> Add Reward Type
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DEFINE NEW PENALTY TYPE & POINTS MODAL */}
      {isAddPenaltyTypeModalOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans animate-fade-in"
          id="add-penalty-type-modal-backdrop"
        >
          <div
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden flex flex-col"
            id="add-penalty-type-modal-container"
          >
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <i className="fas fa-exclamation-triangle text-rose-500"></i>
                <span className="font-extrabold text-xs uppercase tracking-wider text-slate-700 font-mono">
                  Define New Penalty Type & Points
                </span>
              </div>
              <button
                onClick={() => {
                  setIsAddPenaltyTypeModalOpen(false);
                }}
                className="h-7 w-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-all cursor-pointer text-xs"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-3 font-sans">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                    Penalty Name / Policy
                  </label>
                  <input
                    type="text"
                    value={newPenaltyInput}
                    onChange={(e) => setNewPenaltyInput(e.target.value)}
                    placeholder="e.g. SLA Breach"
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-[#02275A] shadow-sm font-mono focus:border-[#02275A] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                    Default Points to Deduct
                  </label>
                  <input
                    type="number"
                    value={newPenaltyPoints}
                    onChange={(e) =>
                      setNewPenaltyPoints(Number(e.target.value))
                    }
                    placeholder="e.g. 15"
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-[#02275A] shadow-sm font-mono focus:border-[#02275A] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddPenaltyTypeModalOpen(false);
                  }}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-black uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const trimmed = newPenaltyInput.trim();
                    if (!trimmed) {
                      showError("Please enter a penalty name.");
                      return;
                    }
                    if (engineeringPenaltiesList.some((item) => item.name.toLowerCase() === trimmed.toLowerCase())) {
                      showError("This penalty policy already exists!");
                      return;
                    }
                    const updatedList = [
                      ...engineeringPenaltiesList,
                      {
                        id: "pnl-" + Date.now(),
                        name: trimmed,
                        points: newPenaltyPoints,
                      },
                    ];
                    setEngineeringPenaltiesList(updatedList);
                    localStorage.setItem(
                      "engineering_penalties_list_v1",
                      JSON.stringify(updatedList),
                    );
                    setNewPenaltyInput("");
                    setNewPenaltyPoints(10);
                    setIsAddPenaltyTypeModalOpen(false);
                    showSuccess(
                      `Added new penalty policy: "${trimmed}" with ${newPenaltyPoints} pts`,
                    );
                  }}
                  className="bg-[#02275A] text-white hover:bg-[#0c3975] text-xs font-black uppercase tracking-wider px-5 py-2.5 rounded-xl cursor-pointer flex items-center gap-2 shadow-sm transition-colors"
                >
                  <i className="fas fa-plus-circle"></i> Add Penalty Type
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ASSIGN TEMPLATE TO STAFF MODAL OVERLAY */}
      {applyingTemplate && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans animate-fade-in"
          id="apply-template-modal-backdrop"
        >
          <div
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]"
            id="apply-template-modal-container"
          >
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <i className="fas fa-wand-magic-sparkles text-[#02275A]"></i>
                <span className="font-black text-sm uppercase tracking-wider text-[#02275A] font-sans">
                  Assign to Staff
                </span>
              </div>
              <button
                onClick={() => {
                  setApplyingTemplate(null);
                  setApplySelectedEmpIds([]);
                  setApplySearchQuery("");
                  setIsApplySearchFocused(false);
                }}
                className="h-7 w-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-all cursor-pointer text-xs"
                title="Dismiss"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="bg-[#02275A]/[0.02] border border-[#02275A]/15 p-4 rounded-xl">
                <span className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
                  Selected protocol
                </span>
                <span className="text-xs font-black text-[#02275A]">
                  {applyingTemplate.name}
                </span>
                <span className="block text-[10px] text-slate-500 font-bold mt-1">
                  Role Scope:{" "}
                  <strong className="text-[#02275A]">
                    {applyingTemplate.role_id}
                  </strong>
                </span>
              </div>
 
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <span className="h-5 w-5 rounded-full bg-[#02275A] text-white flex items-center justify-center font-bold text-[10px]"><i className="fas fa-users"></i></span>
                    Select Staff
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const matchingIds = employees
                          .filter((emp) => {
                            if (applyFilterDept !== "All" && emp.department !== applyFilterDept) return false;
                            if (applyFilterEmpType !== "All" && emp.employeeType !== applyFilterEmpType) return false;
                            if (applySearchQuery.trim()) {
                              const query = applySearchQuery.toLowerCase();
                              const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
                              if (!fullName.includes(query) && !(emp.employeeId || "").toLowerCase().includes(query) && !(emp.role || "").toLowerCase().includes(query)) return false;
                            }
                            return true;
                          })
                          .map((e) => e.id);
                        setApplySelectedEmpIds((prev) => Array.from(new Set([...prev, ...matchingIds])));
                      }}
                      className="text-[9.5px] font-black uppercase bg-[#02275A]/5 text-[#02275A] px-2.5 py-1 rounded-lg border border-[#02275A]/10 hover:bg-[#02275A]/10 transition-colors cursor-pointer"
                    >
                      Select Filtered
                    </button>
                    <button
                      type="button"
                      onClick={() => setApplySelectedEmpIds([])}
                      className="text-[9.5px] font-black uppercase bg-slate-200/50 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      Clear Selection
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[8px] font-black uppercase text-slate-400 tracking-wider mb-1">Search Staff</label>
                    <input
                      type="text"
                      value={applySearchQuery}
                      onChange={(e) => setApplySearchQuery(e.target.value)}
                      onFocus={() => setIsApplySearchFocused(true)}
                      placeholder="Search by name..."
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-[#02275A] focus:outline-none focus:border-[#02275A] shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-black uppercase text-slate-400 tracking-wider mb-1">Department</label>
                    <select
                      value={applyFilterDept}
                      onChange={(e) => setApplyFilterDept(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-[#02275A] focus:outline-none shadow-2xs"
                    >
                      <option value="All">All Departments</option>
                      {["Sales", "Marketing", "Customer Experience", "Human Resources", "Customer Support", "Finance"].map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={`bg-white border border-slate-200 rounded-xl overflow-hidden shadow-inner max-h-[300px] overflow-y-auto divide-y divide-slate-100 ${(!isApplySearchFocused && applySearchQuery.trim().length === 0) ? 'hidden' : ''}`}>
                  {(() => {
                    const matchingEmployees = employees.filter((emp) => {
                      if (applyFilterDept !== "All" && emp.department !== applyFilterDept) return false;
                      if (applyFilterEmpType !== "All" && emp.employeeType !== applyFilterEmpType) return false;
                      if (applySearchQuery.trim()) {
                        const query = applySearchQuery.toLowerCase();
                        const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
                        if (!fullName.includes(query) && !(emp.employeeId || "").toLowerCase().includes(query) && !(emp.role || "").toLowerCase().includes(query)) return false;
                      }
                      return true;
                    });

                    if (matchingEmployees.length === 0) {
                      return (
                        <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                          No employees match active filters.
                        </div>
                      );
                    }

                    return matchingEmployees.map((emp) => {
                      const isChecked = applySelectedEmpIds.includes(emp.id);
                      return (
                        <label
                          key={emp.id}
                          className={`flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50 transition-colors ${
                            isChecked ? "bg-blue-50/20" : ""
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setApplySelectedEmpIds((prev) => [...prev, emp.id]);
                                } else {
                                  setApplySelectedEmpIds((prev) => prev.filter((id) => id !== emp.id));
                                }
                              }}
                              className="w-4 h-4 rounded text-[#02275A] focus:ring-[#02275A] border-slate-300"
                            />
                            <div>
                              <span className="block font-bold text-xs text-slate-700">
                                {emp.firstName} {emp.lastName}
                              </span>
                              <span className="block text-[10px] text-slate-400 font-medium">
                                {emp.role} • {emp.department} • {emp.employeeType}
                              </span>
                            </div>
                          </div>
                        </label>
                      );
                    });
                  })()}
                </div>

                <div className="text-[10px] font-bold text-slate-500 mt-2 bg-white/60 p-2.5 rounded-lg border border-slate-150 flex justify-between">
                  <span>Selected: <strong className="text-[#02275A]">{applySelectedEmpIds.length}</strong> employees</span>
                  <span>Active Filter: Dept [<strong className="text-[#02275A]">{applyFilterDept}</strong>]</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-150 flex justify-end gap-2">
              <button
                onClick={() => {
                  setApplyingTemplate(null);
                  setApplySelectedEmpIds([]);
                  setApplySearchQuery("");
                  setIsApplySearchFocused(false);
                }}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-lg text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyTemplateToEmployees}
                className="px-5 py-2 bg-[#02275A] hover:bg-[#0c3975] text-white rounded-lg text-xs font-black transition-all shadow-sm"
              >
                Apply Template Architecture
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK SELECT CONDUCT ASSIGNER MODAL */}
      {isBulkAssignModalOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans animate-fade-in"
          id="bulk-assign-conduct-modal-backdrop"
        >
          <div
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]"
            id="bulk-assign-conduct-modal-container"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-[#02275A]/10 flex items-center justify-center text-[#02275A]">
                  <i className="fas fa-users-cog text-sm"></i>
                </div>
                <div>
                  <span className="font-black text-xs uppercase tracking-wider text-[#02275A] font-mono block">
                    Bulk Select Conduct Assigner
                  </span>
                  <span className="text-[9.5px] text-slate-400 font-semibold block">
                    Select multiple employees by type/department to assign a conduct grade in one action
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsBulkAssignModalOpen(false);
                  setBulkAssignFeedback(null);
                }}
                className="h-7 w-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-all cursor-pointer text-xs"
                title="Dismiss"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Save Feedback Notice Banner */}
            {bulkAssignFeedback && (
              <div className="mx-6 mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 animate-fade-in" id="bulk-assign-feedback-banner">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                    <i className="fas fa-check-circle text-base"></i>
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-emerald-900 uppercase tracking-wide">Conduct Mapping Attached</h4>
                    <p className="text-[10px] text-emerald-700 font-semibold leading-relaxed">
                      Successfully attached <strong className="text-emerald-900">"{bulkAssignFeedback.conductName}"</strong> with value <strong className="text-emerald-900">{bulkAssignFeedback.valueLabel}</strong> to <strong className="text-emerald-900">{bulkAssignFeedback.employeeCount}</strong> employees!
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setBulkAssignFeedback(null)}
                  className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  Dismiss Notice
                </button>
              </div>
            )}

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Step 1: Employee Selection (7 columns) */}
                <div className="lg:col-span-7 bg-slate-50/60 rounded-2xl border border-slate-200 p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-1 border-b border-slate-200/60">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                        <span className="h-5 w-5 rounded-full bg-[#02275A] text-white flex items-center justify-center font-bold text-[10px]">1</span>
                        Select Target Employees
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            const matchingIds = employees
                              .filter((emp) => {
                                if (bulkFilterDept !== "All" && emp.department !== bulkFilterDept) return false;
                                if (bulkFilterEmpType !== "All" && emp.employeeType !== bulkFilterEmpType) return false;
                                if (bulkSearchQuery.trim()) {
                                  const query = bulkSearchQuery.toLowerCase();
                                  const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
                                  if (!fullName.includes(query) && !(emp.employeeId || "").toLowerCase().includes(query) && !(emp.role || "").toLowerCase().includes(query)) return false;
                                }
                                return true;
                              })
                              .map((e) => e.id);
                            setSelectedBulkEmpIds((prev) => Array.from(new Set([...prev, ...matchingIds])));
                          }}
                          className="text-[9.5px] font-black uppercase bg-[#02275A]/5 text-[#02275A] px-2.5 py-1 rounded-lg border border-[#02275A]/10 hover:bg-[#02275A]/10 transition-colors cursor-pointer"
                        >
                          Select Filtered
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedBulkEmpIds([])}
                          className="text-[9.5px] font-black uppercase bg-slate-200/50 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-200 transition-colors cursor-pointer"
                        >
                          Clear Selection
                        </button>
                      </div>
                    </div>

                    {/* Search & Filters */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[8px] font-black uppercase text-slate-400 tracking-wider mb-1">Search Staff</label>
                        <input
                          type="text"
                          value={bulkSearchQuery}
                          onChange={(e) => setBulkSearchQuery(e.target.value)}
                          onFocus={() => setIsBulkSearchFocused(true)}
                          onBlur={() => setTimeout(() => setIsBulkSearchFocused(false), 150)}
                          placeholder="Search by name..."
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-[#02275A] focus:outline-none focus:border-[#02275A] shadow-2xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] font-black uppercase text-slate-400 tracking-wider mb-1">Employee Type</label>
                        <select
                          value={bulkFilterEmpType}
                          onChange={(e) => setBulkFilterEmpType(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-[#02275A] focus:outline-none shadow-2xs"
                        >
                          <option value="All">All Types</option>
                          {["Full-Time", "Part-Time", "Contract", "Agent"].map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[8px] font-black uppercase text-slate-400 tracking-wider mb-1">Department</label>
                        <select
                          value={bulkFilterDept}
                          onChange={(e) => setBulkFilterDept(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-[#02275A] focus:outline-none shadow-2xs"
                        >
                          <option value="All">All Departments</option>
                          {["Sales", "Marketing", "Customer Experience", "Human Resources", "Customer Support", "Finance"].map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Checkbox List */}
                    <div className={`bg-white border border-slate-200 rounded-xl overflow-hidden shadow-inner max-h-[300px] overflow-y-auto divide-y divide-slate-100 ${bulkSearchQuery.trim().length === 0 ? 'hidden' : ''}`}>
                      {(() => {
                        const matchingEmployees = employees.filter((emp) => {
                          if (bulkFilterDept !== "All" && emp.department !== bulkFilterDept) return false;
                          if (bulkFilterEmpType !== "All" && emp.employeeType !== bulkFilterEmpType) return false;
                          if (bulkSearchQuery.trim()) {
                            const query = bulkSearchQuery.toLowerCase();
                            const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
                            if (!fullName.includes(query) && !(emp.employeeId || "").toLowerCase().includes(query) && !(emp.role || "").toLowerCase().includes(query)) return false;
                          }
                          return true;
                        });

                        if (matchingEmployees.length === 0) {
                          return (
                            <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                              No employees match active filters.
                            </div>
                          );
                        }

                        return matchingEmployees.map((emp) => {
                          const isChecked = selectedBulkEmpIds.includes(emp.id);
                          return (
                            <label
                              key={emp.id}
                              className={`flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50 transition-colors ${
                                isChecked ? "bg-blue-50/20" : ""
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {
                                    if (isChecked) {
                                      setSelectedBulkEmpIds((prev) => prev.filter((id) => id !== emp.id));
                                    } else {
                                      setSelectedBulkEmpIds((prev) => [...prev, emp.id]);
                                    }
                                  }}
                                  className="accent-[#02275A] h-4 w-4 rounded cursor-pointer"
                                />
                                <div>
                                  <p className="font-extrabold text-xs text-slate-800 leading-tight">
                                    {emp.firstName} {emp.lastName}
                                  </p>
                                  <p className="text-[9px] text-slate-400 font-semibold leading-relaxed">
                                    {emp.employeeId} • {emp.role}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-[9px] font-black bg-blue-50 border border-blue-100 text-[#02275A] px-2 py-0.5 rounded">
                                  {emp.employeeType || "Full-Time"}
                                </span>
                                <span className="font-mono text-[9px] font-black bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded">
                                  {emp.department}
                                </span>
                              </div>
                            </label>
                          );
                        });
                      })()}
                    </div>
                  </div>
                  
                  {/* Selected count stats footer inside step 1 */}
                  <div className="text-[10px] font-bold text-slate-500 mt-2 bg-white/60 p-2.5 rounded-lg border border-slate-150 flex justify-between">
                    <span>Selected: <strong className="text-[#02275A]">{selectedBulkEmpIds.length}</strong> employees</span>
                    <span>Active Filters: Type [<strong className="text-[#02275A]">{bulkFilterEmpType}</strong>] • Dept [<strong className="text-[#02275A]">{bulkFilterDept}</strong>]</span>
                  </div>
                </div>

                {/* Step 2: Choose Standard & Assign Value (5 columns) */}
                <div className="lg:col-span-5 bg-slate-50/60 rounded-2xl border border-slate-200 p-5 flex flex-col justify-between gap-5">
                  <div className="space-y-4">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                      <span className="h-5 w-5 rounded-full bg-[#02275A] text-white flex items-center justify-center font-bold text-[10px]">2</span>
                      Configure Conduct Score
                    </span>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[8px] font-black uppercase text-slate-400 tracking-wider mb-1">Select Conduct Standard</label>
                        <select
                          value={bulkSelectedConductId}
                          onChange={(e) => {
                            const newId = e.target.value;
                            setBulkSelectedConductId(newId);
                            const match = (perfSettings.companyWideConducts || []).find((c) => c.id === newId);
                            setBulkConductScoreValue(match ? match.points : 5);
                          }}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-[#02275A] focus:outline-none shadow-sm"
                        >
                          {(perfSettings.companyWideConducts || []).length > 0 && (
                            <optgroup label="Defined Custom Standards">
                              {perfSettings.companyWideConducts.map((c) => (
                                <option key={c.id} value={c.id}>{c.name} ({c.points} pts max)</option>
                              ))}
                            </optgroup>
                          )}
                        </select>
                      </div>

                      <div className="mt-2 space-y-1">
                        <label className="block text-[8px] font-black uppercase text-slate-400 tracking-wider mb-1">Assign Score Value</label>
                        <input
                          type="number"
                          value={bulkConductScoreValue}
                          onChange={(e) => setBulkConductScoreValue(Number(e.target.value))}
                          max={(() => {
                            const match = (perfSettings.companyWideConducts || []).find((c) => c.id === bulkSelectedConductId);
                            return match ? match.points : 5;
                          })()}
                          min={0}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-[#02275A] focus:outline-none shadow-sm font-mono"
                        />
                        <p className="text-[9px] text-slate-500 font-semibold pt-1">
                          Max allowable for this standard: <strong className="text-emerald-700">{(() => {
                            const match = (perfSettings.companyWideConducts || []).find((c) => c.id === bulkSelectedConductId);
                            return match ? match.points : 5;
                          })()} pts</strong>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Batch execute status bar */}
                  <div className="space-y-3 pt-4 border-t border-slate-200">
                    {selectedBulkEmpIds.length > 0 ? (
                      <div className="bg-slate-100 border border-slate-200 p-3 rounded-xl flex items-center gap-3">
                        <i className="fas fa-info-circle text-[#02275A] text-xs"></i>
                        <p className="text-[10px] text-slate-600 font-semibold leading-normal">
                          Ready to assign <strong className="text-[#02275A]">{(() => {
                            const match = (perfSettings.companyWideConducts || []).find((c) => c.id === bulkSelectedConductId);
                            return match ? match.points : 5;
                          })()} pts</strong> to <strong className="text-[#02275A]">{selectedBulkEmpIds.length}</strong> selected personnel.
                        </p>
                      </div>
                    ) : (
                      <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-center gap-2">
                        <i className="fas fa-exclamation-triangle text-amber-500 text-xs shrink-0"></i>
                        <p className="text-[9.5px] text-amber-700 font-bold">
                          Please select at least one employee in step 1.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-150 flex justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsBulkAssignModalOpen(false);
                  setBulkAssignFeedback(null);
                }}
                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                disabled={selectedBulkEmpIds.length === 0}
                onClick={handleBulkApply}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white shadow-xs flex items-center justify-center gap-2 transition-all ${
                  selectedBulkEmpIds.length === 0
                    ? "bg-slate-300 cursor-not-allowed shadow-none"
                    : "bg-[#02275A] hover:bg-[#0c3975] cursor-pointer"
                }`}
              >
                <i className="fas fa-save"></i>
                Save Assignments
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD CORPORATE CONDUCT STANDARD MODAL */}
      {isManageConductModalOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans animate-fade-in"
          id="add-conduct-modal-backdrop"
        >
          <div
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-y-auto max-h-[90vh] flex flex-col"
            id="add-conduct-modal-container"
          >
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <i className="fas fa-gavel text-[#02275A]"></i>
                <span className="font-extrabold text-xs uppercase tracking-wider text-slate-700 font-mono">
                  Add Corporate Conduct Standard
                </span>
              </div>
              <button
                onClick={() => {
                  setIsManageConductModalOpen(false);
                  setNewConductName("");
                  setNewConductDesc("");
                  setNewConductPoints(5);
                }}
                className="h-7 w-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-all cursor-pointer text-xs"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {newConductRoleType === null ? (
                <div className="space-y-5 font-sans animate-fade-in">
                  <div className="text-center space-y-1.5 pb-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#02275A] font-mono">
                      Select Target Role Group
                    </h4>
                    <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                      Performance evaluation engines adapt dynamically to the role type. Please select the target category for this conduct standard to begin:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {/* ENGINEERING ROLE CHOICE */}
                    <button
                      type="button"
                      onClick={() => {
                        setNewConductRoleType("engineering");
                        setNewConductDept("Engineering");
                        setNewConductMethod("deductive");
                      }}
                      className="flex items-start gap-4 p-4 border border-slate-200 hover:border-[#02275A] rounded-2xl text-left bg-white hover:bg-slate-50/50 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md group"
                    >
                      <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100 group-hover:scale-105 transition-transform">
                        <i className="fas fa-laptop-code text-base"></i>
                      </div>
                      <div className="space-y-0.5">
                        <span className="block text-xs font-black uppercase text-slate-800 tracking-wider">
                          🛠️ Engineering Role
                        </span>
                        <p className="text-[10px] text-slate-500 font-semibold leading-normal">
                          Applies to Software Engineers, Tech Leads, and managers. Evaluated via a strict <strong className="text-amber-700">deductive compliance checklist</strong>.
                        </p>
                      </div>
                    </button>

                    {/* NON-ENGINEERING ROLE CHOICE */}
                    <button
                      type="button"
                      onClick={() => {
                        setNewConductRoleType("non-engineering");
                        setNewConductDept("All");
                        setNewConductMethod("deductive");
                      }}
                      className="flex items-start gap-4 p-4 border border-slate-200 hover:border-[#02275A] rounded-2xl text-left bg-white hover:bg-slate-50/50 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md group"
                    >
                      <div className="h-10 w-10 rounded-xl bg-blue-50 text-[#02275A] flex items-center justify-center shrink-0 border border-blue-100 group-hover:scale-105 transition-transform">
                        <i className="fas fa-briefcase text-base"></i>
                      </div>
                      <div className="space-y-0.5">
                        <span className="block text-xs font-black uppercase text-slate-800 tracking-wider">
                          💼 Non-Engineering Role
                        </span>
                        <p className="text-[10px] text-slate-500 font-semibold leading-normal">
                          Applies to Sales, Marketing, HR, Finance, and CS. Defaults to <strong className="text-slate-700">deductive</strong> with choice of <strong className="text-emerald-700">rating scale</strong> & future scalable methods.
                        </p>
                      </div>
                    </button>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsManageConductModalOpen(false);
                      }}
                      className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 font-sans animate-fade-in">
                  {/* Selected Category Breadcrumb Toggle */}
                  <div className="flex justify-between items-center bg-slate-50 border border-slate-200/60 p-2.5 rounded-xl text-xs text-slate-700 font-semibold mb-1 shadow-inner">
                    <span className="flex items-center gap-1.5">
                      <i className={newConductRoleType === 'engineering' ? "fas fa-laptop-code text-amber-600" : "fas fa-briefcase text-blue-600"}></i>
                      Group: <strong className="text-[#02275A] uppercase">{newConductRoleType === 'engineering' ? 'Engineering Role' : 'Non-Engineering Role'}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setNewConductRoleType(null);
                      }}
                      className="text-blue-600 hover:text-blue-800 underline text-[10px] font-black uppercase tracking-wider"
                    >
                      Change Group
                    </button>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                      Conduct Name
                    </label>
                    <input
                      type="text"
                      value={newConductName}
                      onChange={(e) => setNewConductName(e.target.value)}
                      placeholder="e.g., Professional Ethics, Attendance"
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-[#02275A] shadow-sm focus:border-[#02275A] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                      Description
                    </label>
                    <textarea
                      value={newConductDesc}
                      onChange={(e) => setNewConductDesc(e.target.value)}
                      placeholder="e.g., Adheres to workplace policies and respects coworkers."
                      rows={3}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-[#02275A] shadow-sm focus:border-[#02275A] focus:outline-none"
                    />
                  </div>

                  {/* SCALABLE SCORING METHODOLOGY SELECTION */}
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                      Scoring Methodology
                    </label>
                    <select
                      value={newConductMethod}
                      onChange={(e) => setNewConductMethod(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-[#02275A] shadow-sm focus:border-[#02275A] focus:outline-none animate-fade-in"
                    >
                      <option value="deductive">Deductive</option>
                      <option value="rating">Rating</option>
                      <option value="others">Others</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1 flex justify-between">
                      <span>Points Weight</span>
                      <span className="font-mono text-[#02275A] font-extrabold">
                        {newConductPoints} pts
                      </span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={newConductPoints}
                      onChange={(e) =>
                        setNewConductPoints(Number(e.target.value))
                      }
                      className="w-full accent-[#02275A]"
                    />
                    <span className="block text-[9px] text-slate-400 mt-1">
                      Max conduct points total across all standards cannot exceed 20.
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                        Mapped Department
                      </label>
                      {newConductRoleType === "engineering" ? (
                        <div className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 shadow-xs">
                          Engineering
                        </div>
                      ) : (
                        <select
                          value={newConductDept === "Engineering" ? "All" : newConductDept}
                          onChange={(e) => setNewConductDept(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-[#02275A] shadow-sm focus:border-[#02275A] focus:outline-none"
                        >
                          <option value="All">All Non-Engineering</option>
                          <option value="None">None</option>
                          <option value="Sales">Sales</option>
                          <option value="Marketing">Marketing</option>
                          <option value="Tech Support">Tech Support</option>
                          <option value="Customer Experience">Customer Experience</option>
                          <option value="Customer Success">Customer Success</option>
                          <option value="Cellular">Cellular</option>
                          <option value="Human Resources">Human Resources / HR</option>
                          <option value="Customer Support">Customer Support</option>
                          <option value="Finance">Finance</option>
                        </select>
                      )}
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                        Mapped Role Group
                      </label>
                      <select
                        value={newConductApplicableTo}
                        onChange={(e) => setNewConductApplicableTo(e.target.value as any)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-[#02275A] shadow-sm focus:border-[#02275A] focus:outline-none"
                      >
                        <option value="All">All Employees</option>
                        <option value="None">None</option>
                        <option value="Manager">Managers & Leads Only</option>
                        <option value="Ordinary">Ordinary Employees Only</option>
                      </select>
                    </div>
                  </div>

                  {/* DYNAMIC SCORING METHODOLOGY AND AUTO-MAPPING PREVIEW REMOVED */}
                </div>
              )}

              {newConductRoleType !== null && (
                <div className="flex justify-end pt-4 gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsManageConductModalOpen(false);
                      setNewConductName("");
                      setNewConductDesc("");
                      setNewConductPoints(5);
                      setNewConductDept("All");
                      setNewConductEmpType("All");
                      setNewConductApplicableTo("All");
                      setNewConductRoleType(null);
                    }}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-black uppercase tracking-wider transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const trimmedName = newConductName.trim();
                      const trimmedDesc = newConductDesc.trim();
                      if (!trimmedName) {
                        showError("Please enter a conduct standard name.");
                        return;
                      }
                      if (!trimmedDesc) {
                        showError("Please enter a conduct description.");
                        return;
                      }
                      const newConduct = {
                        id: `cwc_${Date.now()}`,
                        name: trimmedName,
                        description: trimmedDesc,
                        points: newConductPoints,
                        department: newConductDept,
                        employeeType: newConductEmpType,
                        applicableTo: newConductApplicableTo,
                        roleCategory: newConductRoleType,
                        scoringMethod: newConductMethod,
                      };
                      const newConducts = [
                        ...(perfSettings.companyWideConducts || []),
                        newConduct,
                      ];
                      const budgetCheck = checkConductPointsBudget(newConducts);
                      if (!budgetCheck.isValid) {
                        showError(
                          `Total conduct points for some employee categories would exceed 20. Violation: ${budgetCheck.details}.`
                        );
                        return;
                      }
                      savePerfSettings({
                        ...perfSettings,
                        companyWideConducts: newConducts,
                      });

                      setIsManageConductModalOpen(false);
                      setNewConductName("");
                      setNewConductDesc("");
                      setNewConductPoints(5);
                      setNewConductDept("All");
                      setNewConductEmpType("All");
                      setNewConductApplicableTo("All");
                      setNewConductRoleType(null);
                      showSuccess(
                        "Corporate conduct standard added successfully.",
                      );
                    }}
                    className="bg-[#02275A] text-white hover:bg-[#0c3975] text-xs font-black uppercase tracking-wider px-5 py-2.5 rounded-xl cursor-pointer flex items-center gap-2 shadow-sm transition-colors"
                  >
                    <i className="fas fa-plus-circle"></i> Add Standard
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

            {/* FLOATING ACTION MODAL OVERLAY */}
            {activeActionModal && (
              <div
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans animate-fade-in"
                id="quick-action-modal-backdrop"
              >
                <div
                  className={`bg-white rounded-2xl border border-slate-200 shadow-2xl w-full ${
                    activeActionModal === "review"
                      ? isReviewingManager
                        ? "max-w-6xl w-[95vw] lg:w-[90vw]"
                        : "max-w-2xl"
                      : "max-w-md"
                  } overflow-hidden flex flex-col transition-all duration-300 max-h-[92vh]`}
                  id="quick-action-modal-container"
                >
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <div className="flex items-center gap-2">
                      {activeActionModal === "template" && (
                        <i className="fas fa-file-invoice text-[#02275A]/70"></i>
                      )}
                      {activeActionModal === "kpi" && (
                        <i className="fas fa-key text-emerald-500"></i>
                      )}
                      {activeActionModal === "reward" && (
                        <i className="fas fa-gift text-amber-500"></i>
                      )}
                      {activeActionModal === "deduction" && (
                        <i className="fas fa-minus-circle text-rose-500"></i>
                      )}
                      {activeActionModal === "review" && (
                        <i className="fas fa-clipboard-check text-[#02275A]"></i>
                      )}

                      <span className="font-extrabold text-xs uppercase tracking-wider text-slate-700 font-mono">
                        {activeActionModal === "template" &&
                          "Add Performance Template"}
                        {activeActionModal === "kpi" && "Create Custom KPI"}
                        {activeActionModal === "reward" &&
                          "Award Supplemental Points"}
                        {activeActionModal === "deduction" &&
                          "Apply Penalty Deduction"}
                        {activeActionModal === "review" &&
                          "Perform Employee Performance Appraisal"}
                      </span>
                    </div>
                    <button
                      onClick={() => setActiveActionModal(null)}
                      className="h-7 w-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-all cursor-pointer text-xs"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>

                  {/* MODAL BODIES & FORM ACTIONS */}
                  {activeActionModal === "template" && (
                    <form
                      onSubmit={handleAddTemplateSubmit}
                      className="p-6 space-y-4"
                    >
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                          Template Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={quickTemplateName}
                          onChange={(e) => setQuickTemplateName(e.target.value)}
                          placeholder="e.g. Q3 High Velocity Sales SLA"
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#02275A] focus:ring-1 focus:ring-[#02275A]"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                            Target Role
                          </label>
                          <input
                            type="text"
                            value={quickTemplateRole}
                            onChange={(e) =>
                              setQuickTemplateRole(e.target.value)
                            }
                            className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#02275A] focus:ring-1 focus:ring-[#02275A]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                            Target Department
                          </label>
                          <input
                            type="text"
                            value={quickTemplateDept}
                            onChange={(e) =>
                              setQuickTemplateDept(e.target.value)
                            }
                            className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#02275A] focus:ring-1 focus:ring-[#02275A]"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                            KPI Base weight (%)
                          </label>
                          <input
                            type="number"
                            value={quickTemplateRoleLimit}
                            onChange={(e) =>
                              setQuickTemplateRoleLimit(Number(e.target.value))
                            }
                            className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#02275A] focus:ring-1 focus:ring-[#02275A] font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                            Conduct weight (%)
                          </label>
                          <input
                            type="number"
                            value={quickTemplateConductLimit}
                            onChange={(e) =>
                              setQuickTemplateConductLimit(
                                Number(e.target.value),
                              )
                            }
                            className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#02275A] focus:ring-1 focus:ring-[#02275A] font-mono"
                          />
                        </div>
                      </div>
                      <div className="pt-2">
                        <button
                          type="submit"
                          className="w-full py-2.5 bg-[#02275A] hover:bg-[#0c3975] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors"
                        >
                          Save Template Record
                        </button>
                      </div>
                    </form>
                  )}

                  {activeActionModal === "kpi" && (
                    <form
                      onSubmit={handleCreateKpiSubmit}
                      className="p-6 space-y-4"
                    >
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                          Target Employee *
                        </label>
                        <select
                          required
                          value={quickKpiEmpId}
                          onChange={(e) => setQuickKpiEmpId(e.target.value)}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500 bg-white"
                        >
                          {!isTeamLead && (
                            <option value="all">
                              🌐 ALL Employees (Company Wide)
                            </option>
                          )}
                          {scopedEmployees.map((e) => (
                            <option key={e.id} value={e.id}>
                              {e.firstName} {e.lastName} ({e.role})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                          KPI Indicator Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={quickKpiName}
                          onChange={(e) => setQuickKpiName(e.target.value)}
                          placeholder="e.g. Average Turnaround Time SLA"
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                            Metric Type
                          </label>
                          <select
                            value={quickKpiType}
                            onChange={(e) =>
                              setQuickKpiType(e.target.value as any)
                            }
                            className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500 bg-white"
                          >
                            <option value="Percentage">Percentage (%)</option>
                            <option value="Binary">Binary (yes/no)</option>
                            <option value="Target-Based">
                              Target-Based (Value)
                            </option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                            Unit Symbol
                          </label>
                          <input
                            type="text"
                            value={quickKpiUnit}
                            onChange={(e) => setQuickKpiUnit(e.target.value)}
                            className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                            Relative Metric Weight
                          </label>
                          <input
                            type="number"
                            required
                            value={quickKpiWeight}
                            onChange={(e) =>
                              setQuickKpiWeight(Number(e.target.value))
                            }
                            className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                            Standard Target Value
                          </label>
                          <input
                            type="number"
                            required
                            value={quickKpiTarget}
                            onChange={(e) =>
                              setQuickKpiTarget(Number(e.target.value))
                            }
                            className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500 font-mono"
                          />
                        </div>
                      </div>
                      <div className="pt-2">
                        <button
                          type="submit"
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors"
                        >
                          Establish New KPI Indicator
                        </button>
                      </div>
                    </form>
                  )}

                  {activeActionModal === "reward" && (
                    <form
                      onSubmit={handleAddRewardSubmit}
                      className="p-6 space-y-4"
                    >
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                          Target Employee *
                        </label>
                        <select
                          required
                          value={quickRewardEmpId}
                          onChange={(e) => setQuickRewardEmpId(e.target.value)}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 bg-white"
                        >
                          {!isTeamLead && (
                            <option value="all">
                              🌐 ALL Employees (Company Wide)
                            </option>
                          )}
                          {scopedEmployees.map((e) => (
                            <option key={e.id} value={e.id}>
                              {e.firstName} {e.lastName} ({e.role})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                          Points to Award *
                        </label>
                        <input
                          type="number"
                          required
                          value={quickRewardPoints}
                          onChange={(e) =>
                            setQuickRewardPoints(Number(e.target.value))
                          }
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                          Reason / Justification *
                        </label>
                        <textarea
                          required
                          rows={3}
                          value={quickRewardReason}
                          onChange={(e) => setQuickRewardReason(e.target.value)}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 resize-none"
                        />
                      </div>
                      <div className="pt-2">
                        <button
                          type="submit"
                          className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors"
                        >
                          Disburse Reward Points
                        </button>
                      </div>
                    </form>
                  )}

                  {activeActionModal === "deduction" && (
                    <form
                      onSubmit={handleAddDeductionSubmit}
                      className="p-6 space-y-4"
                    >
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                          Target Employee *
                        </label>
                        <select
                          required
                          value={quickDeductEmpId}
                          onChange={(e) => setQuickDeductEmpId(e.target.value)}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-rose-500 bg-white"
                        >
                          {!isTeamLead && (
                            <option value="all">
                              🌐 ALL Employees (Company Wide)
                            </option>
                          )}
                          {scopedEmployees.map((e) => (
                            <option key={e.id} value={e.id}>
                              {e.firstName} {e.lastName} ({e.role})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                          Points to Deduct *
                        </label>
                        <input
                          type="number"
                          required
                          value={quickDeductPoints}
                          onChange={(e) =>
                            setQuickDeductPoints(Number(e.target.value))
                          }
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-rose-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                          Reason / Infraction Demerit *
                        </label>
                        <textarea
                          required
                          rows={3}
                          value={quickDeductReason}
                          onChange={(e) => setQuickDeductReason(e.target.value)}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-rose-500 resize-none"
                        />
                      </div>
                      <div className="pt-2">
                        <button
                          type="submit"
                          className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors"
                        >
                          Apply Infraction Deduction
                        </button>
                      </div>
                    </form>
                  )}

                  {activeActionModal === "review" && (
                    <div className="flex flex-col h-[calc(100vh-160px)] max-h-[600px] overflow-hidden">
                      {/* Step Progress Header */}
                      <div className="bg-slate-50 border-b border-slate-100 px-6 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-[#02275A] font-mono">
                            Step {reviewWizardStep} of 8
                          </span>
                          <span className="text-slate-300">|</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {reviewWizardStep === 1 && "Select Review Period"}
                            {reviewWizardStep === 2 && "Select Employee"}
                            {reviewWizardStep === 3 && "Load Assigned Template"}
                            {reviewWizardStep === 4 && "Enter KPI Results"}
                            {reviewWizardStep === 5 &&
                              "Review Auto Calculations"}
                            {reviewWizardStep === 6 && "Apply Deductions"}
                            {reviewWizardStep === 7 && "Add Rewards"}
                            {reviewWizardStep === 8 && "Submit Appraisal"}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((step) => (
                            <div
                              key={step}
                              className={`h-1.5 w-1.5 rounded-full transition-all ${
                                reviewWizardStep === step
                                  ? "bg-[#02275A] px-2"
                                  : reviewWizardStep > step
                                    ? "bg-emerald-500"
                                    : "bg-slate-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Wizard Content Body - Scrollable */}
                      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                        {/* STEP 1: SELECT REVIEW PERIOD */}
                        {reviewWizardStep === 1 && (
                          <div className="space-y-4 animate-fade-in">
                            <div className="bg-[#02275A]/5 p-4 rounded-xl border border-[#02275A]/10 flex gap-3">
                              <div className="h-10 w-10 rounded-lg bg-[#02275A]/10 flex items-center justify-center text-[#02275A] shrink-0">
                                <i className="fas fa-calendar-alt text-base"></i>
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-slate-900 font-sans">
                                  Select Review Period
                                </h4>
                                <p className="text-[10px] text-[#02275A]/70 font-semibold mt-0.5">
                                  Establish the active operational period
                                  context for this performance evaluation
                                  report.
                                </p>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">
                                Select Preset Period
                              </label>
                              <div className="grid grid-cols-2 gap-2">
                                {quarters.map((period) => (
                                  <button
                                    key={period}
                                    type="button"
                                    onClick={() => setReviewPeriod(period)}
                                    className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                                      reviewPeriod === period
                                        ? "border-[#02275A] bg-[#02275A]/5 text-[#02275A] font-mono shadow-sm"
                                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                                    }`}
                                  >
                                    {period}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">
                                Or Define Custom Period Name
                              </label>
                              <input
                                type="text"
                                value={reviewPeriod}
                                onChange={(e) =>
                                  setReviewPeriod(e.target.value)
                                }
                                placeholder="e.g. Mid-Term Appraisal 2026"
                                className="w-full bg-white border border-slate-200 p-2.5 text-xs rounded-lg focus:ring-2 focus:ring-[#02275A] outline-none font-bold text-slate-700 shadow-sm font-mono"
                              />
                            </div>
                          </div>
                        )}

                        {/* STEP 2: SELECT EMPLOYEE */}
                        {reviewWizardStep === 2 && (
                          <div className="space-y-4 animate-fade-in">
                            <div className="bg-[#02275A]/[0.02] p-4 rounded-xl border border-[#02275A]/10 flex gap-3">
                              <div className="h-10 w-10 rounded-lg bg-[#02275A]/10 flex items-center justify-center text-[#02275A]/70 shrink-0">
                                <i className="fas fa-user-tie text-base"></i>
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-slate-900">
                                  Select Employee
                                </h4>
                                <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                                  Choose an active employee from the roster to
                                  evaluate. You can search by name, role or
                                  employee ID.
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-4">
                              <div className="space-y-1 flex-1">
                                <label className="block text-[10px] font-black uppercase text-slate-500">
                                  Search Employees
                                </label>
                                <div className="relative">
                                  <input
                                    type="text"
                                    placeholder="Type employee name, role or ID..."
                                    value={reviewEmployeeSearch}
                                    onChange={(e) =>
                                      setReviewEmployeeSearch(e.target.value)
                                    }
                                    className="w-full bg-white border border-slate-200 pl-9 pr-3 py-2.5 text-xs rounded-lg focus:ring-2 focus:ring-[#02275A] outline-none font-bold text-slate-700 shadow-sm"
                                  />
                                  <i className="fas fa-search absolute left-3.5 top-3.5 text-slate-400 text-xs animate-pulse"></i>
                                </div>
                              </div>

                              <div className="space-y-1 flex-1">
                                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                                  Select Employee *
                                </label>
                                <select
                                  value={reviewEmployeeId}
                                  onChange={(e) =>
                                    setReviewEmployeeId(e.target.value)
                                  }
                                  className="w-full bg-white border border-slate-200 p-2.5 text-xs rounded-lg focus:ring-2 focus:ring-[#02275A] outline-none font-bold text-slate-700 shadow-sm"
                                >
                                  <option value="">
                                    -- Choose individual employee --
                                  </option>
                                  {employees
                                    .filter((emp) => {
                                      if (!reviewEmployeeSearch) return true;
                                      const fullName =
                                        `${emp.firstName} ${emp.lastName}`.toLowerCase();
                                      const role = (emp.role || "").toLowerCase();
                                      const empId =
                                        (emp.employeeId || "").toLowerCase();
                                      const term =
                                        reviewEmployeeSearch.toLowerCase();
                                      return (
                                        fullName.includes(term) ||
                                        role.includes(term) ||
                                        empId.includes(term)
                                      );
                                    })
                                    .map((emp) => (
                                      <option key={emp.id} value={emp.id}>
                                        {emp.firstName} {emp.lastName} (
                                        {emp.employeeId} - {emp.role})
                                      </option>
                                    ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* STEP 3: LOAD ASSIGNED TEMPLATE */}
                        {reviewWizardStep === 3 &&
                          (() => {
                            const emp = employees.find(
                              (e) => e.id === reviewEmployeeId,
                            );
                            if (!emp)
                              return (
                                <div className="text-xs text-rose-500">
                                  No employee selected. Please go back and
                                  select an employee.
                                </div>
                              );

                            // Auto pick a default template match
                            const cat = getRoleCategory(
                              emp.role,
                              emp.department,
                            );
                            const bestMatchedTemplate = templates.find((t) => {
                              if (emp.applied_template_id && t.id === emp.applied_template_id) return true;
                              const deptMatch = (t.department_id || "").toLowerCase().split(",").map(d => d.trim()).some(d => d === (emp.department || "").toLowerCase());
                              const roleMatch = (t.role_id || "").toLowerCase().split(",").map(r => r.trim()).some(r => r === (emp.role || "").toLowerCase() || (emp.role || "").toLowerCase().includes(r));
                              return deptMatch && roleMatch;
                            }) || templates.find(
                              (t) =>
                                t.role_id.toLowerCase().includes(cat) ||
                                t.name.toLowerCase().includes(cat),
                            );

                            return (
                              <div className="space-y-4 animate-fade-in">
                                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex gap-3">
                                  <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                                    <i className="fas fa-file-invoice text-base"></i>
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-bold text-emerald-950">
                                      Template Association
                                    </h4>
                                    <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                                      Employee KPI structure is based on
                                      standard mappings or a customized
                                      performance template.
                                    </p>
                                  </div>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                    Employee Detail Summary
                                  </h4>
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                      <span className="text-slate-400">
                                        Employee:
                                      </span>
                                      <p className="font-extrabold text-[#02275A]">
                                        {emp.firstName} {emp.lastName}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-slate-400">
                                        ID / Role:
                                      </span>
                                      <p className="font-bold text-slate-700">
                                        {emp.employeeId} - {emp.role}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-slate-400">
                                        Department:
                                      </span>
                                      <p className="font-bold text-slate-600">
                                        {emp.department || "N/A"}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-slate-400">
                                        Formula Mode:
                                      </span>
                                      <p className="font-mono font-bold text-slate-600">
                                        {perfSettings.engineMode}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <label className="block text-[10px] font-black uppercase text-slate-500">
                                    Pick template to load
                                  </label>
                                  <select
                                    value={reviewSelectedTemplateId}
                                    onChange={(e) =>
                                      setReviewSelectedTemplateId(
                                        e.target.value,
                                      )
                                    }
                                    className="w-full bg-white border border-slate-200 p-2.5 text-xs rounded-lg focus:ring-2 focus:ring-[#02275A] outline-none font-bold text-slate-700 shadow-sm"
                                  >
                                    <option value="default">
                                      Use Employee&apos;s Current KPI
                                      Configuration ({emp.kpis?.length || 0}{" "}
                                      items)
                                    </option>
                                    {templates.map((tmpl) => (
                                      <option key={tmpl.id} value={tmpl.id}>
                                        {tmpl.name} (
                                        {tmpl.kpiItems?.length || 0} custom
                                        items)
                                      </option>
                                    ))}
                                  </select>
                                  {bestMatchedTemplate &&
                                    reviewSelectedTemplateId === "default" && (
                                      <p className="text-[10px] text-[#02275A]/70 font-bold mt-1">
                                        💡 Protip: Standard template matches
                                        role category "{cat}": "
                                        {bestMatchedTemplate.name}".
                                      </p>
                                    )}
                                </div>

                                <div className="pt-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      // Load it using the unified helper
                                      const selectedKpis = prepareReviewKpis(emp, reviewSelectedTemplateId);

                                      // POPULATE CUMULATIVE DIRECT REPORT KPIS IF APPLICABLE
                                      const targetTemplateId = reviewSelectedTemplateId;
                                      const matchedTmpl = templates.find((t) => {
                                        if (targetTemplateId !== "default" && t.id === targetTemplateId) return true;
                                        if (targetTemplateId === "default") {
                                          if (emp.applied_template_id && t.id === emp.applied_template_id) return true;
                                          const deptMatch = (t.department_id || "").toLowerCase().split(",").map(d => d.trim()).some(d => d === (emp.department || "").toLowerCase());
                                          const roleMatch = (t.role_id || "").toLowerCase().split(",").map(r => r.trim()).some(r => r === (emp.role || "").toLowerCase() || (emp.role || "").toLowerCase().includes(r));
                                          return deptMatch && roleMatch;
                                        }
                                        return false;
                                      });

                                      if (matchedTmpl && matchedTmpl.is_manager_template && matchedTmpl.manager_template_type === "cumulative") {
                                        let reports = employees.filter(e => 
                                          e.reports_to === emp.employeeId || 
                                          e.reports_to === emp.id ||
                                          (e.department === emp.department && e.id !== emp.id && !(
                                            (e.role || "").toLowerCase().includes("manager") ||
                                            (e.role || "").toLowerCase().includes("lead") ||
                                            (e.role || "").toLowerCase().includes("director") ||
                                            (e.role || "").toLowerCase().includes("head") ||
                                            e.is_team_lead === true
                                          ))
                                        );
                                        const hasLinkedTemplates = (matchedTmpl.linked_template_ids && matchedTmpl.linked_template_ids.length > 0) || matchedTmpl.linked_template_id;
                                        if (hasLinkedTemplates) {
                                          const ids = matchedTmpl.linked_template_ids || (matchedTmpl.linked_template_id ? [matchedTmpl.linked_template_id] : []);
                                          const reportsOnLinkedTemplate = reports.filter(r => {
                                            const tId = getEmployeeMatchedTemplateId(r, templates);
                                            return tId && ids.includes(tId);
                                          });
                                          if (reportsOnLinkedTemplate.length > 0) {
                                            reports = reportsOnLinkedTemplate;
                                          }
                                        }
                                        
                                        const rKpisList: Array<{ employeeName: string; kpi: EmployeeKPI }> = [];
                                        reports.forEach(report => {
                                          let empKpis = report.kpis || [];
                                          if (empKpis.length === 0) {
                                            const cat = getRoleCategory(report.role, report.department);
                                            const subTmpl = templates.find(t => 
                                              t.role_id.toLowerCase().includes(cat) || 
                                              t.name.toLowerCase().includes(cat)
                                            );
                                            if (subTmpl) {
                                              empKpis = subTmpl.kpiItems.map(item => ({
                                                id: item.id,
                                                name: item.name,
                                                type: item.type,
                                                weight: item.weight,
                                                currentValue: 0,
                                                targetValue: item.targetValue,
                                                unit: item.unit,
                                              })) as unknown as EmployeeKPI[];
                                            }
                                          }
                                          // Filter non-conduct
                                          const rRoleKpis = empKpis.filter(k => {
                                            const isCore = k.id.startsWith("core-") || CORE_KPIS_TEMPLATES.some(ck => ck.name === k.name) || 
                                                           (perfSettings.companyWideConducts || []).some(c => c.id === k.id || c.name === k.name);
                                            return !isCore;
                                          });
                                          rRoleKpis.forEach(k => {
                                            rKpisList.push({
                                              employeeName: `${report.firstName} ${report.lastName}`,
                                              kpi: { ...k, currentValue: 0 }
                                            });
                                          });
                                        });
                                        setDirectReportsKpisState(rKpisList);
                                      } else {
                                        setDirectReportsKpisState([]);
                                      }

                                      setReviewKpis(selectedKpis);
                                      if (matchedTmpl && matchedTmpl.is_manager_template && matchedTmpl.manager_template_type === "cumulative") {
                                        setShowReviewConducts(true);
                                      }
                                      setReviewWizardStep(4);
                                    }}
                                    className="w-full py-2.5 bg-[#02275A] text-white hover:bg-opacity-90 rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-md cursor-pointer text-center"
                                  >
                                    Apply Template & Continue
                                  </button>
                                </div>
                              </div>
                            );
                          })()}

                        {/* STEP 4: ENTER KPI RESULTS */}
                        {reviewWizardStep === 4 && (
                          <div className="space-y-4 animate-fade-in">
                            <div className="bg-[#02275A]/5 p-4 rounded-xl border border-[#02275A]/10 flex gap-3">
                              <div className="h-10 w-10 rounded-lg bg-[#02275A]/10 flex items-center justify-center text-[#02275A] shrink-0">
                                <i className="fas fa-keyboard text-base"></i>
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-slate-800">
                                  Enter KPI Actual Values
                                </h4>
                                <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                                  Type in the current achieved values for each
                                  role performance KPI and conduct compliance
                                  indicators.
                                </p>
                              </div>
                            </div>

                            <div className="space-y-4">
                              {reviewKpis.length === 0 ? (
                                <div className="text-center py-6 text-xs text-slate-400">
                                  No KPIs loaded. Go back and select a template.
                                </div>
                              ) : (() => {
                                // Separate KPIs
                                const roleKpisList: { kpi: EmployeeKPI; idx: number }[] = [];
                                const conductKpisList: { kpi: EmployeeKPI; idx: number }[] = [];

                                reviewKpis.forEach((kpi, idx) => {
                                  const isCore = kpi.id.startsWith("core-") || CORE_KPIS_TEMPLATES.some(
                                    (ck) => ck.name === kpi.name,
                                  ) || (perfSettings.companyWideConducts || []).some(
                                    (c) => c.id === kpi.id || c.name === kpi.name,
                                  );
                                  if (isCore) {
                                    conductKpisList.push({ kpi, idx });
                                  } else {
                                    roleKpisList.push({ kpi, idx });
                                  }
                                });

                                return (
                                  <div className="space-y-6">
                                    <div className={`grid ${isReviewingManager ? "grid-cols-1 lg:grid-cols-12 gap-6" : "grid-cols-1"}`}>
                                      {/* Left Column: Appraisal inputs */}
                                      <div className={`${isReviewingManager ? "lg:col-span-6 space-y-6 max-h-[62vh] overflow-y-auto pr-2" : "space-y-6"}`}>
                                        {/* Section 1: Role Performance KPIs */}
                                        <div className="space-y-3">
                                          <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                            Role Performance KPIs ({roleKpisList.length})
                                          </h5>
                                          {(() => {
                                            const emp = employees.find(e => e.id === reviewEmployeeId);
                                            const tmpl = templates.find((t) => {
                                              if (reviewSelectedTemplateId !== "default" && t.id === reviewSelectedTemplateId) return true;
                                              if (reviewSelectedTemplateId === "default" && emp) {
                                                if (emp.applied_template_id && t.id === emp.applied_template_id) return true;
                                                const deptMatch = (t.department_id || "").toLowerCase().split(",").map(d => d.trim()).some(d => d === (emp.department || "").toLowerCase());
                                                const roleMatch = (t.role_id || "").toLowerCase().split(",").map(r => r.trim()).some(r => r === (emp.role || "").toLowerCase() || (emp.role || "").toLowerCase().includes(r));
                                                return deptMatch && roleMatch;
                                              }
                                              return false;
                                            });

                                            const isCumulativeTemplate = tmpl?.is_manager_template === true && tmpl?.manager_template_type === "cumulative";

                                            if (isCumulativeTemplate) {
                                              let reports = employees.filter(e => 
                                                e.reports_to === emp?.employeeId || 
                                                e.reports_to === emp?.id ||
                                                (e.department === emp?.department && e.id !== emp?.id && !(
                                                  (e.role || "").toLowerCase().includes("manager") ||
                                                  (e.role || "").toLowerCase().includes("lead") ||
                                                  (e.role || "").toLowerCase().includes("director") ||
                                                  (e.role || "").toLowerCase().includes("head") ||
                                                  e.is_team_lead === true
                                                ))
                                              );
                                              const hasLinkedTemplates = (tmpl?.linked_template_ids && tmpl.linked_template_ids.length > 0) || tmpl?.linked_template_id;
                                              if (hasLinkedTemplates) {
                                                const ids = tmpl?.linked_template_ids || (tmpl?.linked_template_id ? [tmpl.linked_template_id] : []);
                                                const reportsOnLinkedTemplate = reports.filter(r => {
                                                  const tId = getEmployeeMatchedTemplateId(r, templates);
                                                  return tId && ids.includes(tId);
                                                });
                                                if (reportsOnLinkedTemplate.length > 0) {
                                                  reports = reportsOnLinkedTemplate;
                                                }
                                              }

                                              return (
                                                <div className="space-y-4">
                                                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100/60 flex gap-3">
                                                    <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                                                      <i className="fas fa-layer-group text-sm"></i>
                                                    </div>
                                                    <div>
                                                      <h6 className="text-xs font-black text-emerald-950 uppercase tracking-wider">
                                                        Cumulative Team Performance Engine
                                                      </h6>
                                                      <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                                                        KPI actual values are automatically loaded and averaged from your {reports.length} subordinate(s)' achievements.
                                                      </p>
                                                    </div>
                                                  </div>

                                                  {roleKpisList.length === 0 ? (
                                                    <div className="text-slate-400 text-xs italic p-4 bg-slate-50 rounded-xl border border-slate-150">
                                                      No role performance KPIs found on this template.
                                                    </div>
                                                  ) : (
                                                    <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
                                                      {roleKpisList.map(({ kpi, idx: kpiIdx }) => {
                                                        // Get subordinate breakdown for this specific KPI
                                                        const breakdown = reports.map(report => {
                                                          const match = (report.kpis || []).find(k => k.name.trim().toLowerCase() === kpi.name.trim().toLowerCase());
                                                          return {
                                                            name: `${report.firstName} ${report.lastName}`,
                                                            role: report.role,
                                                            actual: match ? (match.currentValue || 0) : 0,
                                                            unit: match ? (match.unit || kpi.unit) : kpi.unit
                                                          };
                                                        });

                                                        const sumActual = breakdown.reduce((sum, item) => sum + item.actual, 0);
                                                        const denominator = Math.max(1, reports.length);

                                                        return (
                                                          <div
                                                            key={`${kpi.id || "kpi"}-${kpiIdx}`}
                                                            className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm space-y-3"
                                                          >
                                                            {/* KPI Header */}
                                                            <div className="flex justify-between items-start">
                                                              <div>
                                                                <h6 className="text-xs font-black text-slate-800">
                                                                  {kpi.name}
                                                                </h6>
                                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono mt-0.5">
                                                                  {kpi.type} | Weight: {kpi.weight}%
                                                                </span>
                                                              </div>
                                                              <div className="text-right">
                                                                <span className="text-[10px] font-mono font-black text-slate-500 bg-slate-150 border border-slate-200/50 px-2 py-0.5 rounded-md">
                                                                  Target: {kpi.targetValue} {kpi.unit}
                                                                </span>
                                                              </div>
                                                            </div>

                                                            {/* Calculated Cumulative Actual value display */}
                                                            <div className="bg-slate-50 p-3 rounded-lg flex items-center justify-between border border-slate-200/40">
                                                              <div className="space-y-0.5">
                                                                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">
                                                                  Auto-Calculated Cumulative Value
                                                                </span>
                                                                <span className="text-[8px] text-emerald-600 font-extrabold uppercase bg-emerald-50 border border-emerald-200/50 px-1.5 py-0.5 rounded">
                                                                  Live Synced from Team
                                                                </span>
                                                              </div>
                                                              <div className="text-right flex items-baseline gap-1">
                                                                <span className="text-lg font-mono font-black text-[#02275A]">
                                                                  {kpi.currentValue}
                                                                </span>
                                                                <span className="text-xs font-bold text-slate-450 uppercase">
                                                                  {kpi.unit}
                                                                </span>
                                                              </div>
                                                            </div>

                                                            {/* Subordinate contributions breakdown */}
                                                            <div className="bg-slate-50/40 p-2.5 rounded-lg border border-slate-100 space-y-1.5">
                                                              <div className="flex justify-between items-center border-b border-slate-200/50 pb-1">
                                                                <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">
                                                                  Subordinate Contributions ({reports.length})
                                                                </span>
                                                                <span className="text-[8.5px] font-mono font-bold text-slate-500">
                                                                  Sum: {sumActual} / Size: {reports.length}
                                                                </span>
                                                              </div>
                                                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-0.5">
                                                                {breakdown.map((item, bIdx) => (
                                                                  <div key={bIdx} className="flex justify-between items-center text-[9px] bg-white px-2 py-1 rounded border border-slate-100 shadow-3xs">
                                                                    <div className="max-w-[70%]">
                                                                      <span className="text-slate-700 font-extrabold truncate block">{item.name}</span>
                                                                      <span className="text-slate-400 font-bold block text-[7.5px] leading-none truncate">{item.role}</span>
                                                                    </div>
                                                                    <span className="font-mono text-slate-800 font-black shrink-0">
                                                                      {item.actual} <span className="text-slate-400 font-medium font-sans text-[8px]">{item.unit}</span>
                                                                    </span>
                                                                  </div>
                                                                ))}
                                                              </div>
                                                            </div>
                                                          </div>
                                                        );
                                                      })}
                                                    </div>
                                                  )}
                                                </div>
                                              );
                                            }

                                            if (roleKpisList.length === 0) {
                                              return (
                                                <div className="text-slate-400 text-xs italic p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                  No role performance KPIs on this template.
                                                </div>
                                              );
                                            }

                                            return roleKpisList.map(({ kpi, idx: kpiIdx }) => (
                                              <div
                                                key={`${kpi.id || "kpi"}-${kpiIdx}`}
                                                className="p-4 rounded-xl border border-[#02275A]/10 bg-[#02275A]/[0.01] transition-all"
                                              >
                                                <div className="flex justify-between items-start">
                                                  <div>
                                                    <h5 className="text-xs font-black text-slate-850">
                                                      {kpi.name}
                                                    </h5>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono mt-0.5">
                                                      {kpi.type} | Weight: {kpi.weight}%
                                                    </span>
                                                  </div>
                                                  <span className="text-[10px] font-mono font-black text-slate-500 bg-slate-100 border border-slate-200/50 px-2.5 py-1 rounded-md shrink-0">
                                                    Target: {kpi.targetValue} {kpi.unit}
                                                  </span>
                                                </div>

                                                {kpi.type === "Rating" || kpi.unit === "★" ? (
                                                  <div className="mt-3 space-y-2">
                                                    <div className="flex gap-1.5">
                                                      {[1, 2, 3, 4, 5].map((star) => (
                                                        <button
                                                          key={star}
                                                          type="button"
                                                          onClick={() => {
                                                            const updated = [...reviewKpis];
                                                            updated[kpiIdx].currentValue = star;
                                                            setReviewKpis(updated);
                                                          }}
                                                          className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs transition-all ${
                                                            kpi.currentValue >= star
                                                              ? "bg-amber-500 text-white shadow-sm"
                                                              : "bg-slate-50 text-slate-450 border border-slate-200 hover:bg-slate-100"
                                                          }`}
                                                        >
                                                          ★
                                                        </button>
                                                      ))}
                                                    </div>
                                                    <span className="text-[10px] text-slate-450 font-bold block font-mono">
                                                      Score contribution: {calculateKPIContribution(kpi).toFixed(1)} pts
                                                    </span>
                                                  </div>
                                                ) : kpi.type === "Binary" ? (
                                                  <div className="flex gap-2 mt-2.5">
                                                    <button
                                                      type="button"
                                                      onClick={() => {
                                                        const updated = [...reviewKpis];
                                                        updated[kpiIdx].currentValue = 1;
                                                        setReviewKpis(updated);
                                                      }}
                                                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold border transition-all ${kpi.currentValue > 0 ? "bg-[#02275A] border-[#02275A] text-white" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"}`}
                                                    >
                                                      Yes / Achieved
                                                    </button>
                                                    <button
                                                      type="button"
                                                      onClick={() => {
                                                        const updated = [...reviewKpis];
                                                        updated[kpiIdx].currentValue = 0;
                                                        setReviewKpis(updated);
                                                      }}
                                                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold border transition-all ${kpi.currentValue === 0 ? "bg-rose-500 border-rose-500 text-white" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"}`}
                                                    >
                                                      No / Not Achieved
                                                    </button>
                                                  </div>
                                                ) : (
                                                  <div className="relative mt-2">
                                                    <input
                                                      type="number"
                                                      min="0"
                                                      placeholder={`Enter current value (${kpi.unit})`}
                                                      value={kpi.currentValue}
                                                      onChange={(e) => {
                                                        const updated = [...reviewKpis];
                                                        updated[kpiIdx].currentValue =
                                                          Number(e.target.value);
                                                        setReviewKpis(updated);
                                                      }}
                                                      className="w-full bg-white border border-slate-200 pl-3 pr-14 py-2 text-xs rounded-lg focus:ring-2 focus:ring-[#02275A] outline-none font-bold text-slate-700 shadow-sm"
                                                    />
                                                    <span className="absolute right-2.5 top-1.5 text-[9px] uppercase tracking-wider text-slate-400 font-mono font-black bg-slate-100 border px-1.5 py-0.5 rounded">
                                                      {kpi.unit}
                                                    </span>
                                                  </div>
                                                )}

                                                {/* Dedicated Comments Box for Leadership / Team Comments */}
                                                {kpi.id === "kpi-mgr-comments" && (
                                                  <div className="mt-3">
                                                    <label className="block text-[9px] font-black uppercase text-slate-400 tracking-wider mb-1">
                                                      Qualitative Leadership Commentary (Team Management Feedback)
                                                    </label>
                                                    <textarea
                                                      placeholder="Provide strategic feedback regarding their team performance, support ticket completion rates, or direct reports' compliance levels..."
                                                      value={kpi.comments || ""}
                                                      onChange={(e) => {
                                                        const updated = [...reviewKpis];
                                                        updated[kpiIdx].comments = e.target.value;
                                                        setReviewKpis(updated);
                                                      }}
                                                      className="w-full bg-white border border-slate-200 p-2.5 text-xs rounded-lg focus:ring-2 focus:ring-[#02275A] outline-none font-medium text-slate-700 shadow-sm resize-none h-20"
                                                    />
                                                  </div>
                                                )}
                                              </div>
                                            ));
                                          })()}
                                        </div>

                                        {/* Section 2: Conduct Metrics & Compliance */}
                                        <div className="space-y-3 pt-2">
                                          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                                            <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                              Conduct Standards ({conductKpisList.length})
                                            </h5>
                                            <button
                                              type="button"
                                              onClick={() => setShowReviewConducts(!showReviewConducts)}
                                              className="text-[10px] text-amber-600 hover:text-amber-800 font-black uppercase tracking-wider transition-colors flex items-center gap-1"
                                            >
                                              <span>{showReviewConducts ? "Hide Conducts ✕" : "Show Conducts ▾"}</span>
                                            </button>
                                          </div>

                                          {/* Clickable Mock Field / Toggle Area */}
                                          <div
                                            onClick={() => setShowReviewConducts(!showReviewConducts)}
                                            className="bg-amber-50/20 border border-amber-200/40 hover:border-amber-200 p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all select-none"
                                          >
                                            <div className="flex items-center gap-2">
                                              <i className="fas fa-gavel text-amber-500 text-xs"></i>
                                              <span className="text-xs font-bold text-slate-700">
                                                {showReviewConducts ? "Evaluation cards expanded" : "Click here to expand conduct evaluation..."}
                                              </span>
                                            </div>
                                            <span className="text-[10px] font-mono font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100/60">
                                              Total 20% weight
                                            </span>
                                          </div>

                                          {showReviewConducts && (
                                            <div className="space-y-3">
                                              {conductKpisList.length === 0 ? (
                                                <div className="text-slate-400 text-xs italic p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                  No conduct compliance standards on this template.
                                                </div>
                                              ) : (
                                                conductKpisList.map(({ kpi, idx: kpiIdx }) => (
                                                  <div
                                                    key={`${kpi.id || "kpi"}-${kpiIdx}`}
                                                    className="p-4 rounded-xl border border-amber-200/50 bg-amber-50/[0.1] transition-all"
                                                  >
                                                    <div className="flex justify-between items-start">
                                                      <div>
                                                        <div className="flex items-center gap-1.5 flex-wrap-reverse">
                                                          <h5 className="text-xs font-black text-slate-850">
                                                            {kpi.name}
                                                          </h5>
                                                          <span className="text-[8px] bg-amber-100 text-amber-700 font-extrabold uppercase px-1.5 py-0.5 rounded tracking-wide font-mono shrink-0">
                                                            Core Compliance
                                                          </span>
                                                        </div>
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono mt-0.5">
                                                          {kpi.type} | Weight: {kpi.weight}%
                                                        </span>
                                                      </div>
                                                      <span className="text-[10px] font-mono font-black text-slate-500 bg-slate-100 border border-slate-200/50 px-2.5 py-1 rounded-md shrink-0">
                                                        Target: {kpi.targetValue} {kpi.unit}
                                                      </span>
                                                    </div>

                                                    {(() => {
                                                      const roleCategory = reviewingEmp
                                                        ? getRoleCategory(reviewingEmp.role || "", reviewingEmp.department || "")
                                                        : "support";
                                                      const isEngineering =
                                                        roleCategory === "engineer" ||
                                                        (reviewingEmp?.department || "").toLowerCase().includes("engineering") ||
                                                        (reviewingEmp?.role || "").toLowerCase().includes("engineer") ||
                                                        kpi.type === "Deductive" ||
                                                        (kpi.unit || "").toLowerCase().includes("deduct") ||
                                                        (kpi.name || "").toLowerCase().includes("deduct");

                                                      if (isEngineering) {
                                                        const maxDeduct = kpi.targetValue || kpi.weight || 5;
                                                        return (
                                                          <div className="space-y-1.5 mt-2">
                                                            <label className="block text-[10px] font-bold text-slate-500">
                                                              Deduction Value (0 - {maxDeduct})
                                                            </label>
                                                            <div className="relative">
                                                              <input
                                                                type="number"
                                                                min="0"
                                                                max={maxDeduct}
                                                                placeholder={`Enter deduction value (0 - ${maxDeduct})`}
                                                                value={kpi.currentValue}
                                                                onChange={(e) => {
                                                                  const val = Math.min(maxDeduct, Math.max(0, Number(e.target.value)));
                                                                  const updated = [...reviewKpis];
                                                                  updated[kpiIdx].currentValue = val;
                                                                  setReviewKpis(updated);
                                                                }}
                                                                className="w-full bg-white border border-slate-200 pl-3 pr-24 py-2 text-xs rounded-lg focus:ring-2 focus:ring-[#02275A] outline-none font-bold text-slate-700 shadow-sm"
                                                              />
                                                              <span className="absolute right-2.5 top-1.5 text-[9px] uppercase tracking-wider text-rose-500 font-mono font-black bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded">
                                                                deduction value
                                                              </span>
                                                            </div>
                                                            <p className="text-[9px] text-slate-400 font-medium">
                                                              Starting from 100% score (max {kpi.weight} pts) and decaying with deduction value. Current score contribution: {Math.max(0, kpi.weight - (kpi.currentValue || 0)).toFixed(1)} / {kpi.weight} pts
                                                            </p>
                                                          </div>
                                                        );
                                                      } else {
                                                        // Non-Engineering: 1-5 rating scale
                                                        return (
                                                          <div className="space-y-1.5 mt-2.5 font-sans">
                                                            <label className="block text-[10px] font-bold text-slate-500">
                                                              Compliance Rating (1 - 5)
                                                            </label>
                                                            <div className="flex gap-2">
                                                              {[1, 2, 3, 4, 5].map((num) => {
                                                                const isSelected = kpi.currentValue === num;
                                                                return (
                                                                  <button
                                                                    key={num}
                                                                    type="button"
                                                                    onClick={() => {
                                                                      const updated = [...reviewKpis];
                                                                      updated[kpiIdx].currentValue = num;
                                                                      setReviewKpis(updated);
                                                                    }}
                                                                    className={`h-8 w-10 rounded-lg text-xs font-black border transition-all cursor-pointer ${
                                                                      isSelected
                                                                        ? "bg-[#02275A] border-[#02275A] text-white shadow-md scale-105"
                                                                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                                                                    }`}
                                                                  >
                                                                    {num}
                                                                  </button>
                                                                );
                                                              })}
                                                            </div>
                                                            <p className="text-[9px] text-slate-400 font-medium">
                                                              Current score contribution: {((kpi.currentValue || 5) / 5 * kpi.weight).toFixed(1)} / {kpi.weight} pts
                                                            </p>
                                                          </div>
                                                        );
                                                      }
                                                    })()}
                                                  </div>
                                                ))
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      {/* Right Column: Subordinates' aggregated Review & Conduct tracker */}
                                      {isReviewingManager && (
                                        <div className="lg:col-span-6 bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col max-h-[62vh] overflow-y-auto" id="mgr-community-reviews-panel">
                                          {/* Panel Header */}
                                          <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-3 shrink-0">
                                            <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                                              <i className="fas fa-users-cog text-sm"></i>
                                            </div>
                                            <div>
                                              <h4 className="text-[11px] font-black uppercase text-slate-800 tracking-wider">
                                                👥 {reviewingEmp?.department} Team Management Console
                                              </h4>
                                              <p className="text-[9px] text-slate-450 font-bold leading-tight">
                                                Dynamic KPIs, mapped conducts, and performance ledger for {reviewingEmp?.firstName}'s department.
                                              </p>
                                            </div>
                                          </div>

                                          {/* Sub-tab Navigation */}
                                          <div className="flex bg-slate-200/65 p-1 rounded-xl border border-slate-200/80 mb-3.5 shadow-inner shrink-0">
                                            <button
                                              type="button"
                                              onClick={() => setMgrPanelTab("aggregated")}
                                              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                                                mgrPanelTab === "aggregated"
                                                  ? "bg-white text-indigo-600 shadow-xs border border-slate-200/40 font-black"
                                                  : "text-slate-500 hover:text-slate-800 font-bold"
                                              }`}
                                            >
                                              <i className="fas fa-chart-bar text-[10px]"></i>
                                              <span>Aggregated KPIs</span>
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => setMgrPanelTab("conduct")}
                                              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                                                mgrPanelTab === "conduct"
                                                  ? "bg-white text-amber-600 shadow-xs border border-slate-200/40 font-black"
                                                  : "text-slate-500 hover:text-slate-800 font-bold"
                                              }`}
                                            >
                                              <i className="fas fa-gavel text-[10px]"></i>
                                              <span>Conduct Alignment</span>
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => setMgrPanelTab("members")}
                                              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                                                mgrPanelTab === "members"
                                                  ? "bg-white text-slate-700 shadow-xs border border-slate-200/40 font-black"
                                                  : "text-slate-500 hover:text-slate-800 font-bold"
                                              }`}
                                            >
                                              <i className="fas fa-user-friends text-[10px]"></i>
                                              <span>Subordinates ({employees.filter(e => e.department === reviewingEmp?.department && e.id !== reviewingEmp?.id).length})</span>
                                            </button>
                                          </div>

                                          {(() => {
                                            const teamMembers = employees.filter(
                                              (e) => e.department === reviewingEmp?.department && e.id !== reviewingEmp?.id
                                            );

                                            if (teamMembers.length === 0) {
                                              return (
                                                <div className="text-center py-8 text-[11px] text-slate-400 font-medium italic">
                                                  No reporting subordinates found in the {reviewingEmp?.department || "same"} department.
                                                </div>
                                              );
                                            }

                                            // TAB 1: AGGREGATED CORE KPIS
                                            if (mgrPanelTab === "aggregated") {
                                              const aggregatedKpis: {
                                                [key: string]: {
                                                  name: string;
                                                  unit: string;
                                                  targetValue: number;
                                                  totalActual: number;
                                                  membersBreakdown: { name: string; actual: number; target: number }[];
                                                };
                                              } = {};

                                              teamMembers.forEach((m) => {
                                                const mRoleKpis = (m.kpis || []).filter((k) => {
                                                  return !k.id.startsWith("core-") && !CORE_KPIS_TEMPLATES.some((ck) => ck.name === k.name) &&
                                                    !(perfSettings.companyWideConducts || []).some((c) => c.id === k.id || c.name === k.name);
                                                });

                                                mRoleKpis.forEach((k) => {
                                                  const kName = k.name;
                                                  if (!aggregatedKpis[kName]) {
                                                    aggregatedKpis[kName] = {
                                                      name: k.name,
                                                      unit: k.unit || "units",
                                                      targetValue: 0,
                                                      totalActual: 0,
                                                      membersBreakdown: [],
                                                    };
                                                  }
                                                  aggregatedKpis[kName].totalActual += k.currentValue || 0;
                                                  aggregatedKpis[kName].targetValue += k.targetValue || 0;
                                                  aggregatedKpis[kName].membersBreakdown.push({
                                                    name: `${m.firstName} ${m.lastName}`,
                                                    actual: k.currentValue || 0,
                                                    target: k.targetValue || 0,
                                                  });
                                                });
                                              });

                                              // If department is Marketing, ensure "Leads generated" matches target 4,000 and 500 leads per member
                                              const deptLower = (reviewingEmp?.department || "").toLowerCase();
                                              if (deptLower.includes("market")) {
                                                const kName = "Leads generated";
                                                // Override or insert
                                                aggregatedKpis[kName] = {
                                                  name: "Leads generated",
                                                  unit: "leads",
                                                  targetValue: 4000,
                                                  totalActual: teamMembers.length * 500, // 500 leads per member
                                                  membersBreakdown: teamMembers.map((m) => ({
                                                    name: `${m.firstName} ${m.lastName}`,
                                                    actual: 500,
                                                    target: 4000 / teamMembers.length,
                                                  })),
                                                };
                                              }

                                              return (
                                                <div className="space-y-4 animate-fade-in">
                                                  {deptLower.includes("market") && (
                                                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/70 p-3 rounded-xl flex gap-2.5 items-start">
                                                      <div className="h-6 w-6 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 text-xs font-bold">
                                                        <i className="fas fa-bullseye"></i>
                                                      </div>
                                                      <div className="text-[9.5px]">
                                                        <span className="font-extrabold text-emerald-900 block uppercase tracking-wider text-[8px]">🎯 Marketing Leads Target Simulation</span>
                                                        <p className="text-emerald-700 font-medium leading-relaxed mt-0.5">
                                                          Collective team target: <strong>4,000 leads</strong>. Each of the {teamMembers.length} team members has successfully generated <strong>500 leads</strong>.
                                                        </p>
                                                      </div>
                                                    </div>
                                                  )}

                                                  <div className="space-y-3.5">
                                                    {Object.values(aggregatedKpis).map((agg) => {
                                                      const progress = agg.targetValue > 0 ? Math.min(100, Math.round((agg.totalActual / agg.targetValue) * 100)) : 100;
                                                      return (
                                                        <div key={agg.name} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                                                          {/* KPI header & collective sum */}
                                                          <div className="flex justify-between items-start">
                                                            <div>
                                                              <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-wide">
                                                                {agg.name}
                                                              </h5>
                                                              <span className="text-[8px] text-slate-400 font-bold block mt-0.5 uppercase tracking-wider">
                                                                Aggregated Department Metric
                                                              </span>
                                                            </div>
                                                            <div className="text-right">
                                                              <span className="text-[12px] font-black text-indigo-600 font-mono">
                                                                {agg.totalActual.toLocaleString()}
                                                              </span>
                                                              <span className="text-[9px] text-slate-450 font-bold font-mono">
                                                                {" "}
                                                                / {agg.targetValue.toLocaleString()} {agg.unit}
                                                              </span>
                                                              <span className="block text-[8px] text-emerald-600 font-black uppercase font-mono mt-0.5">
                                                                ({progress}% Achieved)
                                                              </span>
                                                            </div>
                                                          </div>

                                                          {/* Progress Bar */}
                                                          <div className="space-y-1">
                                                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/20">
                                                              <div
                                                                className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500"
                                                                style={{ width: `${progress}%` }}
                                                              ></div>
                                                            </div>
                                                          </div>

                                                          {/* Breakdown of Team Members */}
                                                          <div className="bg-slate-50/70 p-2 rounded-lg border border-slate-100 space-y-1.5">
                                                            <span className="text-[8px] font-black uppercase tracking-wider text-slate-450 block border-b border-slate-200/50 pb-1">
                                                              👥 Subordinate Breakdown contributions:
                                                            </span>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-0.5">
                                                              {agg.membersBreakdown.map((m, mIdx) => (
                                                                <div key={mIdx} className="flex justify-between items-center text-[9px] bg-white px-2 py-1 rounded border border-slate-100 shadow-3xs">
                                                                  <span className="text-slate-600 font-bold truncate max-w-[65%]">{m.name}</span>
                                                                  <span className="font-mono text-slate-800 font-black">
                                                                    {m.actual} <span className="text-slate-400 font-medium font-sans text-[8px]">{agg.unit}</span>
                                                                  </span>
                                                                </div>
                                                              ))}
                                                            </div>
                                                          </div>
                                                        </div>
                                                      );
                                                    })}

                                                    {Object.keys(aggregatedKpis).length === 0 && (
                                                      <div className="text-center py-10 bg-white border border-slate-200 rounded-xl text-xs text-slate-450 italic">
                                                        No performance KPIs found in team member templates.
                                                      </div>
                                                    )}
                                                  </div>
                                                </div>
                                              );
                                            }

                                            // TAB 2: CONDUCT & MANAGER ALIGNMENT
                                            if (mgrPanelTab === "conduct") {
                                              const mappedConducts = (perfSettings.companyWideConducts || []).filter((c) => {
                                                const cDept = (c.department || "All").toLowerCase();
                                                const eDept = (reviewingEmp?.department || "").toLowerCase();
                                                const deptMatch = cDept === "all" || (cDept !== "none" && (
                                                  cDept === eDept ||
                                                  (cDept === "hr" && eDept === "human resources") ||
                                                  (cDept === "human resources" && eDept === "hr") ||
                                                  (cDept === "tech support" && eDept === "customer support") ||
                                                  (cDept === "customer support" && eDept === "tech support")
                                                ));
                                                const typeMatch = !c.employeeType || c.employeeType === "All" || (c.employeeType !== "None" && c.employeeType === reviewingEmp?.employeeType);
                                                const isManager = (reviewingEmp?.role || "").toLowerCase().includes("manager") || (reviewingEmp?.role || "").toLowerCase().includes("head") || (reviewingEmp?.role || "").toLowerCase().includes("lead") || reviewingEmp?.is_team_lead === true;
                                                const currentGroup = isManager ? "Manager" : "Ordinary";
                                                const groupMatch = !c.applicableTo || c.applicableTo === "All" || (c.applicableTo !== "None" && c.applicableTo === currentGroup);
                                                return deptMatch && typeMatch && groupMatch;
                                              });

                                              const getTeamAverageConduct = (conductId: string) => {
                                                let sum = 0;
                                                let count = 0;
                                                teamMembers.forEach((m) => {
                                                  const kpi = (m.kpis || []).find((k) => k.id === conductId || k.name.toLowerCase() === conductId.toLowerCase());
                                                  if (kpi) {
                                                    sum += kpi.currentValue || 0;
                                                    count++;
                                                  }
                                                });
                                                return count > 0 ? Math.round(sum / count) : 88; // solid mock fallback
                                              };

                                              return (
                                                <div className="space-y-4 animate-fade-in">
                                                  <div className="bg-amber-50/50 border border-amber-200/50 p-2.5 rounded-xl text-[9px] text-amber-900 font-medium">
                                                    <p>
                                                      Below are the conduct standards mapped to the <strong>{reviewingEmp?.department} {reviewingEmp?.role}</strong> position. The manager's compliance is displayed directly beside the team's average.
                                                    </p>
                                                  </div>

                                                  <div className="space-y-3">
                                                    {mappedConducts.map((conduct) => {
                                                      // Find manager's currentValue in reviewKpis
                                                      const mKpi = reviewKpis.find(k => k.id === conduct.id || k.name === conduct.name);
                                                      const managerVal = mKpi ? mKpi.currentValue : 0;
                                                      const teamAvg = getTeamAverageConduct(conduct.id);
                                                      const roleCategory = reviewingEmp
                                                        ? getRoleCategory(reviewingEmp.role || "", reviewingEmp.department || "")
                                                        : "support";
                                                      const isEngineering =
                                                        roleCategory === "engineer" ||
                                                        (reviewingEmp?.department || "").toLowerCase().includes("engineering") ||
                                                        (reviewingEmp?.role || "").toLowerCase().includes("engineer");

                                                      return (
                                                        <div key={conduct.id} className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-3.5">
                                                          {/* Conduct Title */}
                                                          <div className="flex justify-between items-start border-b border-slate-100 pb-2">
                                                            <div>
                                                              <h5 className="text-[10.5px] font-black text-slate-800 uppercase flex items-center gap-1.5">
                                                                <i className="fas fa-gavel text-amber-500 text-[10px]"></i>
                                                                {conduct.name}
                                                              </h5>
                                                              <span className="text-[8px] bg-slate-100 text-slate-500 font-extrabold uppercase px-1.5 py-0.5 rounded mt-1 inline-block">
                                                                Max Weight: {conduct.points}%
                                                              </span>
                                                            </div>
                                                            <span className="text-[9px] font-extrabold text-slate-450 bg-slate-50 border px-2 py-0.5 rounded font-mono">
                                                              Target: {isEngineering ? "0 deduction" : "5/5 rating"}
                                                            </span>
                                                          </div>

                                                          {/* Comparison display: Manager beside Conduct */}
                                                          <div className="grid grid-cols-2 gap-3 pt-0.5">
                                                            {/* Manager Rating */}
                                                            <div className="bg-amber-500/[0.04] border border-amber-200/50 p-2.5 rounded-xl space-y-1">
                                                              <div className="flex items-center gap-1">
                                                                <div className="h-4 w-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[7px] font-bold uppercase shrink-0">
                                                                  M
                                                                </div>
                                                                <span className="text-[8px] font-black uppercase text-amber-800 tracking-wider truncate" title={`${reviewingEmp?.firstName} (Manager)`}>
                                                                  {reviewingEmp?.firstName} (Manager)
                                                                </span>
                                                              </div>
                                                              <div className="flex items-baseline gap-1">
                                                                <span className="text-base font-black text-amber-700 font-mono leading-none">
                                                                  {isEngineering ? `-${managerVal} pts` : `${managerVal}/5`}
                                                                </span>
                                                                <span className="text-[8px] font-bold text-amber-600/70">assigned</span>
                                                              </div>
                                                              <p className="text-[7.5px] text-slate-400 font-medium leading-tight">
                                                                Adjust in the appraisal form on the left.
                                                              </p>
                                                            </div>

                                                            {/* Team Average */}
                                                            <div className="bg-indigo-500/[0.03] border border-indigo-150 p-2.5 rounded-xl space-y-1">
                                                              <div className="flex items-center gap-1">
                                                                <div className="h-4 w-4 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[7px] font-bold uppercase shrink-0">
                                                                  T
                                                                </div>
                                                                <span className="text-[8px] font-black uppercase text-indigo-850 tracking-wider">
                                                                  Team Average
                                                                </span>
                                                              </div>
                                                              <div className="flex items-baseline gap-1">
                                                                <span className="text-base font-black text-indigo-600 font-mono leading-none">
                                                                  {isEngineering ? `-${teamAvg} pts` : `${teamAvg}/5`}
                                                                </span>
                                                                <span className="text-[8px] font-bold text-indigo-500/70">average</span>
                                                              </div>
                                                              <p className="text-[7.5px] text-slate-400 font-medium leading-tight">
                                                                Average rate of all reporting staff.
                                                              </p>
                                                            </div>
                                                          </div>
                                                        </div>
                                                      );
                                                    })}

                                                    {mappedConducts.length === 0 && (
                                                      <div className="text-center py-10 bg-white border border-slate-200 rounded-xl text-xs text-slate-450 italic">
                                                        No conduct standards mapped to this position category.
                                                      </div>
                                                    )}
                                                  </div>
                                                </div>
                                              );
                                            }

                                            // TAB 3: INDIVIDUAL REPORTING MEMBERS
                                            return (
                                              <div className="space-y-4 animate-fade-in">
                                                {teamMembers.map((member) => {
                                                  const mConductKpis = (member.kpis || []).filter((k) => {
                                                    return k.id.startsWith("core-") || CORE_KPIS_TEMPLATES.some((ck) => ck.name === k.name) ||
                                                      (perfSettings.companyWideConducts || []).some((c) => c.id === k.id || c.name === k.name);
                                                  });
                                                  const mRoleKpis = (member.kpis || []).filter((k) => {
                                                    return !k.id.startsWith("core-") && !CORE_KPIS_TEMPLATES.some((ck) => ck.name === k.name) &&
                                                      !(perfSettings.companyWideConducts || []).some((c) => c.id === k.id || c.name === k.name);
                                                  });

                                                  return (
                                                    <div key={member.id} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                                                      {/* Subordinate info */}
                                                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                                        <div className="flex items-center gap-2">
                                                          <div className="h-8 w-8 rounded-full bg-[#02275A]/5 text-[#02275A] border border-[#02275A]/10 flex items-center justify-center text-[10px] font-black uppercase font-mono">
                                                            {member.firstName?.[0] || ""}{member.lastName?.[0] || ""}
                                                          </div>
                                                          <div>
                                                            <h5 className="text-[11px] font-extrabold text-slate-800 leading-tight">
                                                              {member.firstName} {member.lastName}
                                                            </h5>
                                                            <span className="text-[9px] text-slate-450 font-extrabold block">
                                                              {member.role} • {member.employeeType}
                                                            </span>
                                                          </div>
                                                        </div>

                                                        <div className="text-right flex flex-col items-end gap-1">
                                                          <span className="inline-block bg-emerald-50 text-emerald-700 text-[9px] font-mono font-black border border-emerald-200/50 px-2 py-0.5 rounded-md leading-none">
                                                            Perf: {member.performanceBalance || member.netBalance || 0}%
                                                          </span>
                                                          <span className="text-[8px] font-mono font-bold text-slate-450 uppercase">
                                                            Grade {member.grade || "C"}
                                                          </span>
                                                        </div>
                                                      </div>

                                                      {/* Review Points & point logs */}
                                                      <div className="grid grid-cols-3 gap-1.5 bg-slate-50 p-2 rounded-lg text-[9px]">
                                                        <div>
                                                          <span className="text-slate-400 font-bold block uppercase tracking-wider text-[8px]">Rewards</span>
                                                          <span className="text-emerald-600 font-black">+{member.rewardPoints || 0} pts</span>
                                                        </div>
                                                        <div>
                                                          <span className="text-slate-400 font-bold block uppercase tracking-wider text-[8px]">Penalties</span>
                                                          <span className="text-rose-500 font-black">-${member.specialPenalty || 0}</span>
                                                        </div>
                                                        <div>
                                                          <span className="text-slate-400 font-bold block uppercase tracking-wider text-[8px]">Net Bal.</span>
                                                          <span className="text-[#02275A] font-black font-mono">{member.netBalance || 0} pts</span>
                                                        </div>
                                                      </div>

                                                      {/* KPIs and targets */}
                                                      {mRoleKpis.length > 0 && (
                                                        <div className="space-y-1">
                                                          <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 block">Role performance kpi metrics</span>
                                                          <div className="space-y-1">
                                                            {mRoleKpis.map((k) => {
                                                              const progress = k.targetValue > 0 ? Math.min(100, Math.round((k.currentValue / k.targetValue) * 100)) : 100;
                                                              return (
                                                                <div key={k.id} className="text-[9px] bg-slate-50/40 p-1.5 rounded border border-slate-100 space-y-1">
                                                                  <div className="flex justify-between font-bold">
                                                                    <span className="text-slate-700 truncate max-w-[65%]" title={k.name}>{k.name}</span>
                                                                    <span className="text-slate-500 font-mono">
                                                                      {k.currentValue}/{k.targetValue} {k.unit}
                                                                    </span>
                                                                  </div>
                                                                  <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                                                    <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                                                                  </div>
                                                                </div>
                                                              );
                                                            })}
                                                          </div>
                                                        </div>
                                                      )}

                                                      {/* Conduct Metrics */}
                                                      {mConductKpis.length > 0 && (
                                                        <div className="space-y-1 pt-1 border-t border-dashed border-slate-150">
                                                          <span className="text-[8px] font-black uppercase tracking-wider text-slate-450 block">Conduct standards compliance</span>
                                                          <div className="grid grid-cols-2 gap-1.5">
                                                            {mConductKpis.map((k) => (
                                                              <div key={k.id} className="flex items-center justify-between text-[8px] bg-amber-50/30 px-2 py-1 rounded border border-amber-100/65">
                                                                <span className="text-slate-600 font-bold truncate max-w-[50%]" title={k.name}>{k.name}</span>
                                                                <span className="text-amber-800 font-mono font-black">
                                                                  {k.currentValue}%
                                                                </span>
                                                              </div>
                                                            ))}
                                                          </div>
                                                        </div>
                                                      )}
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                            );
                                          })()}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        )}

                        {/* STEP 5: REVIEW AUTO CALCULATIONS */}
                        {reviewWizardStep === 5 &&
                          (() => {
                            const empObj = employees.find(e => e.id === reviewEmployeeId);
                            const tmplObj = templates.find(t => t.id === reviewSelectedTemplateId);
                            const isCumulative = tmplObj?.is_manager_template === true && tmplObj?.manager_template_type === "cumulative";

                            let roleScore = 0;
                            let coreScore = 0;

                            if (isCumulative && empObj) {
                              let reports = employees.filter(e => 
                                e.reports_to === empObj.employeeId || 
                                e.reports_to === empObj.id ||
                                (e.department === empObj.department && e.id !== empObj.id && !(
                                  (e.role || "").toLowerCase().includes("manager") ||
                                  (e.role || "").toLowerCase().includes("lead") ||
                                  (e.role || "").toLowerCase().includes("director") ||
                                  (e.role || "").toLowerCase().includes("head") ||
                                  e.is_team_lead === true
                                ))
                              );
                              const hasLinkedTemplates = (tmplObj?.linked_template_ids && tmplObj.linked_template_ids.length > 0) || tmplObj?.linked_template_id;
                              if (hasLinkedTemplates) {
                                const ids = tmplObj?.linked_template_ids || (tmplObj?.linked_template_id ? [tmplObj.linked_template_id] : []);
                                const reportsOnLinkedTemplate = reports.filter(r => {
                                  const tId = getEmployeeMatchedTemplateId(r, templates);
                                  return tId && ids.includes(tId);
                                });
                                if (reportsOnLinkedTemplate.length > 0) {
                                  reports = reportsOnLinkedTemplate;
                                }
                              }
                              const avgTeamPerf = reports.length > 0 
                                ? reports.reduce((sum, r) => {
                                    const subKpis = r.kpis || [];
                                    const roleKpis = subKpis.filter(k => {
                                      const isCore = k.id.startsWith("core-") || CORE_KPIS_TEMPLATES.some(ck => ck.name === k.name) || 
                                                     (perfSettings.companyWideConducts || []).some(c => c.id === k.id || c.name === k.name);
                                      return !isCore;
                                    });
                                    const roleKpiScoreSum = roleKpis.reduce((s, k) => s + calculateKPIContribution(k), 0);
                                    const roleKpiWeightSum = roleKpis.reduce((s, k) => s + k.weight, 0);
                                    const subRoleKpiPct = roleKpiWeightSum > 0 
                                      ? (roleKpiScoreSum / roleKpiWeightSum) * 100 
                                      : (r.performanceScore || 80);
                                    return sum + subRoleKpiPct;
                                  }, 0) / reports.length
                                : 0;
                              roleScore = avgTeamPerf * 0.8;
                            } else {
                              reviewKpis.forEach((kpi) => {
                                const contr = calculateKPIContribution(kpi);
                                const isCore = kpi.id.startsWith("core-") || CORE_KPIS_TEMPLATES.some((ck) => ck.name === kpi.name) || (perfSettings.companyWideConducts || []).some(
                                  (c) => c.id === kpi.id || c.name === kpi.name,
                                );
                                if (!isCore) {
                                  roleScore += contr;
                                }
                              });
                            }

                            reviewKpis.forEach((kpi) => {
                              const contr = calculateKPIContribution(kpi);
                              const isCore = kpi.id.startsWith("core-") || CORE_KPIS_TEMPLATES.some((ck) => ck.name === kpi.name) || (perfSettings.companyWideConducts || []).some(
                                (c) => c.id === kpi.id || c.name === kpi.name,
                              );
                              if (isCore) {
                                coreScore += contr;
                              }
                            });

                            const grossScore = Number(
                              (roleScore + coreScore).toFixed(1),
                            );
                            const finalNet = Math.max(
                              0,
                              Number(
                                (
                                  grossScore -
                                  Number(reviewDeduction) +
                                  Number(reviewReward)
                                ).toFixed(1),
                              ),
                            );

                            return (
                              <div className="space-y-4 animate-fade-in">
                                <div className="bg-[#02275A]/5 p-4 rounded-xl border border-[#02275A]/10 flex gap-3">
                                  <div className="h-10 w-10 rounded-lg bg-[#02275A]/10 flex items-center justify-center text-[#02275A] shrink-0">
                                    <i className="fas fa-calculator text-base"></i>
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-bold text-slate-800">
                                      Dynamic Score Calculations
                                    </h4>
                                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                                      Real-time math based on your inputs. Role
                                      weights represent{" "}
                                      {perfSettings.roleWeightLimit}% and
                                      general conduct weights represent{" "}
                                      {perfSettings.conductWeightLimit}% of the
                                      score.
                                    </p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                  <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm text-center">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                                      Role KPIs
                                    </span>
                                    <h5 className="text-lg font-black text-[#02275A] mt-1 font-mono">
                                      {roleScore.toFixed(1)}{" "}
                                      <span className="text-xs text-slate-400 font-normal">
                                        pts
                                      </span>
                                    </h5>
                                    <span className="text-[8px] bg-[#02275A]/5 text-[#02275A] uppercase font-black px-1.5 py-0.5 rounded-full">
                                      Max {perfSettings.roleWeightLimit}
                                    </span>
                                  </div>
                                  <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm text-center">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                                      Conduct KPIs
                                    </span>
                                    <h5 className="text-lg font-black text-amber-600 mt-1 font-mono">
                                      {coreScore.toFixed(1)}{" "}
                                      <span className="text-xs text-slate-400 font-normal">
                                        pts
                                      </span>
                                    </h5>
                                    <span className="text-[8px] bg-amber-50 text-amber-700 uppercase font-black px-1.5 py-0.5 rounded-full">
                                      Max {perfSettings.conductWeightLimit}
                                    </span>
                                  </div>
                                  <div className="bg-[#02275A] p-3 rounded-xl text-center text-white col-span-1 shadow-lg shadow-[#02275A]/25">
                                    <span className="text-[9px] font-extrabold text-slate-300 uppercase tracking-widest block">
                                      Gross Total
                                    </span>
                                    <h5 className="text-lg font-black text-white mt-1 font-mono">
                                      {grossScore}%
                                    </h5>
                                    <span className="text-[8px] bg-white/20 text-white uppercase font-black px-1.5 py-0.5 rounded-full">
                                      Score scale
                                    </span>
                                  </div>
                                </div>

                                <div className="space-y-2.5">
                                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                                    Individual Contribution Breakdowns
                                  </h5>
                                  <div className="space-y-1.5 max-h-[180px] overflow-y-auto custom-scrollbar border-y py-1.5">
                                    {reviewKpis.map((k, kIdx) => {
                                      const contr = calculateKPIContribution(k);
                                      const progress =
                                        k.targetValue > 0
                                          ? Math.min(
                                              100,
                                              Math.round(
                                                (k.currentValue /
                                                  k.targetValue) *
                                                  100,
                                              ),
                                            )
                                          : 100;
                                      return (
                                        <div
                                          key={`${k.id || "kpi"}-${kIdx}`}
                                          className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center justify-between gap-4 text-xs font-semibold text-slate-705"
                                        >
                                          <div className="truncate flex-1">
                                            <p className="font-extrabold text-[#02275A] truncate">
                                              {k.name}
                                            </p>
                                            <p className="text-[9px] text-slate-400 font-bold block mt-0.5 font-mono">
                                              Achieved: {k.currentValue}/
                                              {k.targetValue} {k.unit} (
                                              {progress}%)
                                            </p>
                                          </div>
                                          <span className="text-xs font-mono font-black text-[#02275A] shrink-0 bg-white border px-2 py-1 rounded">
                                            +{contr.toFixed(1)} pts
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* Apply Formula Calculation Button */}
                                {(() => {
                                  const empObj = employees.find(e => e.id === reviewEmployeeId);
                                  const tmplObj = templates.find(t => t.id === reviewSelectedTemplateId);
                                  const isCumulative = tmplObj?.is_manager_template === true && tmplObj?.manager_template_type === "cumulative";

                                  if (isCumulative && empObj) {
                               // Step 5 cumulative calculation anchor
                                    return (
                                      <div className="pt-2">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const auditEntry: GradeAuditEntry = {
                                              id: "audit-cumul-" + Date.now(),
                                              previousGrade: empObj.grade || "B+",
                                              newGrade: finalNet >= 90 ? "A+" : finalNet >= 80 ? "A" : finalNet >= 70 ? "B+" : finalNet >= 60 ? "B" : "C",
                                              policyResponsible: "Cumulative Performance Appraisal",
                                              dateOfChange: new Date().toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric"
                                              }) + ", " + new Date().toLocaleTimeString("en-US", {
                                                hour: "2-digit",
                                                minute: "2-digit"
                                              }),
                                              approvingAuthority: "System Administrator (Cumulative Formula)",
                                              reason: `Cumulative Appraisal Applied: Subordinates' Avg Role KPIs = ${roleScore.toFixed(1)}%, Manager Conduct Rating = ${coreScore.toFixed(1)}%, Net Score = ${finalNet.toFixed(1)}%`,
                                              strengths: `Subordinate team average was calculated successfully at ${roleScore.toFixed(1)}% across performance KPIs.`,
                                              recommendations: `Conduct alignment is at ${coreScore.toFixed(1)}%. Continue tracking operational achievements.`,
                                              type: "Cumulative Review"
                                            };

                                            const updatedEmployees = employees.map((item) => {
                                              if (item.id === reviewEmployeeId) {
                                                return {
                                                  ...item,
                                                  kpis: reviewKpis,
                                                  grade: auditEntry.newGrade,
                                                  specialPenalty: Number(reviewDeduction),
                                                  rewardPoints: Number(reviewReward),
                                                  netBalance: finalNet,
                                                  performanceBalance: grossScore,
                                                  lastReviewDate: new Date().toLocaleDateString("en-US"),
                                                  applied_template_id: reviewSelectedTemplateId !== "default" ? reviewSelectedTemplateId : item.applied_template_id,
                                                  gradeAuditTrail: [...(item.gradeAuditTrail || []), auditEntry]
                                                };
                                              }
                                              return item;
                                            });

                                            saveAndSyncState(updatedEmployees);
                                            showSuccess(`Formula applied! Saved appraisal record and score of ${finalNet}% under ${empObj.firstName}'s performance history.`);
                                            setReviewWizardStep(6);
                                          }}
                                          className="w-full py-3 bg-gradient-to-r from-[#02275A] to-blue-800 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:opacity-90 shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                                        >
                                          <i className="fas fa-calculator text-white"></i>
                                          Apply Formula Calculation
                                        </button>
                                      </div>
                                    );
                                  }
                                  return null;
                                })()}

                              </div>
                            );
                          })()}

                        {/* STEP 6: APPLY DEDUCTIONS */}
                        {reviewWizardStep === 6 && (
                          <div className="space-y-4 animate-fade-in">
                            <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 flex gap-3">
                              <div className="h-10 w-10 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0">
                                <i className="fas fa-minus-circle text-base"></i>
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-rose-950">
                                  Infraction Penalty Deductions
                                </h4>
                                <p className="text-[10px] text-rose-600 font-semibold mt-0.5">
                                  Apply demerit points or penalty subtractions
                                  based on disciplinary reviews, warnings or SLA
                                  deficits.
                                </p>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                Demerit Point Subtractions
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={reviewDeduction}
                                onChange={(e) =>
                                  setReviewDeduction(
                                    Math.max(0, Number(e.target.value)),
                                  )
                                }
                                placeholder="e.g. 15 demerits"
                                className="w-full bg-white border border-slate-200 p-2.5 text-xs rounded-lg focus:ring-2 focus:ring-rose-500 outline-none font-bold text-slate-700 shadow-sm font-mono"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                Demerit Reason / Violation
                              </label>
                              <textarea
                                rows={2}
                                value={reviewDeductionReason}
                                onChange={(e) =>
                                  setReviewDeductionReason(e.target.value)
                                }
                                placeholder="Reason for penalty deduction..."
                                className="w-full bg-white border border-slate-200 p-2.5 text-xs rounded-lg focus:ring-2 focus:ring-rose-200 outline-none font-semibold text-slate-700 shadow-sm resize-none"
                              />
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 text-xs font-semibold text-slate-600 flex justify-between">
                              <span>New Penalty Charge:</span>
                              <strong className="text-rose-600 font-mono font-black">
                                -{reviewDeduction} pts
                              </strong>
                            </div>
                          </div>
                        )}

                        {/* STEP 7: ADD REWARDS */}
                        {reviewWizardStep === 7 && (
                          <div className="space-y-4 animate-fade-in">
                            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex gap-3">
                              <div className="h-10 w-10 rounded-lg bg-amber-50            ml-1/10 flex items-center justify-center text-amber-500 shrink-0 bg-amber-500/10">
                                <i className="fas fa-gift text-base"></i>
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-amber-950">
                                  Supplemental Reward Points
                                </h4>
                                <p className="text-[10px] text-amber-600 font-semibold mt-0.5">
                                  Award extra bonus points for exceptional
                                  performance, team alignment, or milestone
                                  completion.
                                </p>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                Supplemental Bonus Points
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={reviewReward}
                                onChange={(e) =>
                                  setReviewReward(
                                    Math.max(0, Number(e.target.value)),
                                  )
                                }
                                placeholder="e.g. 50 bonus points"
                                className="w-full bg-white border border-slate-200 p-2.5 text-xs rounded-lg focus:ring-2 focus:ring-amber-500 outline-none font-bold text-slate-700 shadow-sm font-mono"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                Reward Reason / Achievement Details
                              </label>
                              <textarea
                                rows={2}
                                value={reviewRewardReason}
                                onChange={(e) =>
                                  setReviewRewardReason(e.target.value)
                                }
                                placeholder="Reason for supplemental reward points..."
                                className="w-full bg-white border border-slate-200 p-2.5 text-xs rounded-lg focus:ring-2 focus:ring-amber-200 outline-none font-semibold text-slate-700 shadow-sm resize-none"
                              />
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 text-xs font-semibold text-slate-600 flex justify-between">
                              <span>New Reward Credit:</span>
                              <strong className="text-amber-600 font-mono font-black">
                                +{reviewReward} pts
                              </strong>
                            </div>
                          </div>
                        )}

                        {/* STEP 8: SUBMIT REVIEW */}
                        {reviewWizardStep === 8 &&
                          (() => {
                            const emp = employees.find(
                              (e) => e.id === reviewEmployeeId,
                            );
                            const tmplObj = templates.find(t => t.id === reviewSelectedTemplateId);
                            const isCumulative = tmplObj?.is_manager_template === true && tmplObj?.manager_template_type === "cumulative";

                            let roleScore = 0;
                            let coreScore = 0;

                            if (isCumulative && emp) {
                              let reports = employees.filter(e => 
                                e.reports_to === emp.employeeId || 
                                e.reports_to === emp.id ||
                                (e.department === emp.department && e.id !== emp.id && !(
                                  (e.role || "").toLowerCase().includes("manager") ||
                                  (e.role || "").toLowerCase().includes("lead") ||
                                  (e.role || "").toLowerCase().includes("director") ||
                                  (e.role || "").toLowerCase().includes("head") ||
                                  e.is_team_lead === true
                                ))
                              );
                              const hasLinkedTemplates = (tmplObj?.linked_template_ids && tmplObj.linked_template_ids.length > 0) || tmplObj?.linked_template_id;
                              if (hasLinkedTemplates) {
                                const ids = tmplObj?.linked_template_ids || (tmplObj?.linked_template_id ? [tmplObj.linked_template_id] : []);
                                const reportsOnLinkedTemplate = reports.filter(r => {
                                  const tId = getEmployeeMatchedTemplateId(r, templates);
                                  return tId && ids.includes(tId);
                                });
                                if (reportsOnLinkedTemplate.length > 0) {
                                  reports = reportsOnLinkedTemplate;
                                }
                              }
                              const avgTeamPerf = reports.length > 0 
                                ? reports.reduce((sum, r) => {
                                    const subKpis = r.kpis || [];
                                    const roleKpis = subKpis.filter(k => {
                                      const isCore = k.id.startsWith("core-") || CORE_KPIS_TEMPLATES.some(ck => ck.name === k.name) || 
                                                     (perfSettings.companyWideConducts || []).some(c => c.id === k.id || c.name === k.name);
                                      return !isCore;
                                    });
                                    const roleKpiScoreSum = roleKpis.reduce((s, k) => s + calculateKPIContribution(k), 0);
                                    const roleKpiWeightSum = roleKpis.reduce((s, k) => s + k.weight, 0);
                                    const subRoleKpiPct = roleKpiWeightSum > 0 
                                      ? (roleKpiScoreSum / roleKpiWeightSum) * 100 
                                      : (r.performanceScore || 80);
                                    return sum + subRoleKpiPct;
                                  }, 0) / reports.length
                                : 0;
                              roleScore = avgTeamPerf * 0.8;
                            } else {
                              reviewKpis.forEach((kpi) => {
                                const contr = calculateKPIContribution(kpi);
                                const isCore = kpi.id.startsWith("core-") || CORE_KPIS_TEMPLATES.some((ck) => ck.name === kpi.name) || (perfSettings.companyWideConducts || []).some(
                                  (c) => c.id === kpi.id || c.name === kpi.name,
                                );
                                if (!isCore) {
                                  roleScore += contr;
                                }
                              });
                            }

                            reviewKpis.forEach((kpi) => {
                              const contr = calculateKPIContribution(kpi);
                              const isCore = kpi.id.startsWith("core-") || CORE_KPIS_TEMPLATES.some((ck) => ck.name === kpi.name) || (perfSettings.companyWideConducts || []).some(
                                (c) => c.id === kpi.id || c.name === kpi.name,
                              );
                              if (isCore) {
                                coreScore += contr;
                              }
                            });

                            const grossScore = Number(
                              (roleScore + coreScore).toFixed(1),
                            );
                            const finalNet = Math.max(
                              0,
                              Number(
                                (
                                  grossScore -
                                  Number(reviewDeduction) +
                                  Number(reviewReward)
                                ).toFixed(1),
                              ),
                            );

                            return (
                              <div className="space-y-5 animate-fade-in">
                                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex gap-3">
                                  <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                                    <i className="fas fa-check-circle text-base"></i>
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-bold text-emerald-950">
                                      Appraisal Review & Signoff
                                    </h4>
                                    <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                                      All steps have been successfully computed.
                                      Double check details before launching the
                                      update.
                                    </p>
                                  </div>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 text-xs font-semibold text-slate-700 space-y-3">
                                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest block border-b pb-1">
                                    Review Summary
                                  </h5>
                                  <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                                    <div>
                                      <span className="text-slate-400">
                                        Target Employee
                                      </span>
                                      <p className="font-extrabold text-[#02275A]">
                                        {emp?.firstName} {emp?.lastName}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-slate-400">
                                        Review Period
                                      </span>
                                      <p className="font-bold text-slate-850 font-mono">
                                        {reviewPeriod}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-slate-400">
                                        Base Performance Score
                                      </span>
                                      <p className="font-bold text-slate-800 font-mono">
                                        {grossScore}%
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-slate-400">
                                        Template Used
                                      </span>
                                      <p className="font-mono text-slate-500 text-[10px] truncate">
                                        {reviewSelectedTemplateId === "default"
                                          ? "Employee Default"
                                          : templates.find(
                                              (t) =>
                                                t.id ===
                                                reviewSelectedTemplateId,
                                            )?.name || "Custom"}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-slate-400">
                                        Applied Deductions
                                      </span>
                                      <p className="font-bold text-rose-600 font-mono">
                                        -{reviewDeduction} pts
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-slate-400">
                                        Awarded Bonus Points
                                      </span>
                                      <p className="font-bold text-emerald-600 font-mono">
                                        +{reviewReward} pts
                                      </p>
                                    </div>
                                  </div>

                                  <div className="border-t pt-3 flex justify-between items-center bg-[#02275A]/[0.02] p-2.5 rounded-lg border border-[#02275A]/10 mt-2">
                                    <span className="text-[#02275A] font-extrabold text-xs uppercase font-mono">
                                      Expected Net Balance Score
                                    </span>
                                    <strong className="text-lg font-black text-[#02275A] font-mono">
                                      {finalNet}{" "}
                                      <span className="text-xs font-normal text-slate-450">
                                        pts
                                      </span>
                                    </strong>
                                  </div>
                                </div>

                                <div className="pt-3">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = employees.map((item) => {
                                        if (item.id === reviewEmployeeId) {
                                          const calculatedGrade = finalNet >= 90 ? "A+" : finalNet >= 80 ? "A" : finalNet >= 70 ? "B+" : finalNet >= 60 ? "B" : "C";
                                          
                                          const auditEntry: GradeAuditEntry = {
                                            id: "audit-final-" + Date.now(),
                                            previousGrade: item.grade || "B+",
                                            newGrade: calculatedGrade,
                                            policyResponsible: "Performance Appraisal Review",
                                            dateOfChange: new Date().toLocaleDateString("en-US", {
                                              month: "short",
                                              day: "numeric",
                                              year: "numeric"
                                            }) + ", " + new Date().toLocaleTimeString("en-US", {
                                              hour: "2-digit",
                                              minute: "2-digit"
                                            }),
                                            approvingAuthority: "System Administrator",
                                            reason: `Appraisal Reviewed: Net Score = ${finalNet.toFixed(1)}%, Gross = ${grossScore.toFixed(1)}%, Deductions = -${reviewDeduction} pts, Rewards = +${reviewReward} pts.`,
                                            strengths: `Performance evaluated at ${roleScore.toFixed(1)}% across performance KPIs.`,
                                            recommendations: `Conduct alignment evaluated at ${coreScore.toFixed(1)}%.`,
                                            type: "Appraisal Review"
                                          };

                                          // Avoid duplicate history entries by checking if there's already one from today with the same score/reason
                                          const alreadyAdded = (item.gradeAuditTrail || []).some(
                                            audit => audit.reason && audit.reason.includes(`Net Score = ${finalNet.toFixed(1)}%`)
                                          );

                                          const newAuditTrail = alreadyAdded 
                                            ? (item.gradeAuditTrail || []) 
                                            : [...(item.gradeAuditTrail || []), auditEntry];

                                          return {
                                            ...item,
                                            kpis: reviewKpis,
                                            grade: calculatedGrade,
                                            specialPenalty: Number(reviewDeduction),
                                            rewardPoints: Number(reviewReward),
                                            netBalance: finalNet,
                                            performanceBalance: grossScore,
                                            applied_template_id: reviewSelectedTemplateId !== "default" ? reviewSelectedTemplateId : item.applied_template_id,
                                            gradeAuditTrail: newAuditTrail,
                                            lastReviewDate: new Date().toLocaleDateString("en-US")
                                          };
                                        }
                                        return item;
                                      });
                                      saveAndSyncState(updated);
                                      setActiveActionModal(null);
                                      // Reset wizard state
                                      setReviewWizardStep(1);
                                      setReviewEmployeeId("");
                                      setReviewSelectedTemplateId("default");
                                      setReviewKpis([]);
                                      setReviewDeduction(0);
                                      setReviewReward(0);
                                      setReviewEmployeeSearch("");
                                      showSuccess(
                                        `Performance Appraisal successfully submitted for ${reviewPeriod}! Roster values and demerit tables recalculated dynamically.`,
                                      );
                                    }}
                                    className="w-full py-3 bg-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-emerald-600/20 text-center cursor-pointer flex items-center justify-center gap-1.5"
                                  >
                                    <i className="fas fa-check-circle text-white"></i>{" "}
                                    Submit Appraisal Review
                                  </button>
                                </div>
                              </div>
                            );
                          })()}
                      </div>

                      {/* Wizard Navigation Footer Actions */}
                      <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex justify-between items-center shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            if (reviewWizardStep > 1) {
                              setReviewWizardStep(reviewWizardStep - 1);
                            } else {
                              setActiveActionModal(null);
                            }
                          }}
                          className="px-4 py-2 bg-white hover:bg-slate-55 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <i className="fas fa-arrow-left text-[10px]"></i>
                          {reviewWizardStep === 1 ? "Cancel" : "Back"}
                        </button>

                        {reviewWizardStep < 8 && (
                          <button
                            type="button"
                            disabled={
                              reviewWizardStep === 2 && !reviewEmployeeId
                            }
                            onClick={() => {
                              if (reviewWizardStep === 3) {
                                // Loaded via template select button directly or fallback
                                const emp = employees.find(
                                  (e) => e.id === reviewEmployeeId,
                                );
                                if (emp) {
                                  const selectedKpis = prepareReviewKpis(emp, reviewSelectedTemplateId);
                                  setReviewKpis(selectedKpis);
                                }
                              }
                              setReviewWizardStep(reviewWizardStep + 1);
                            }}
                            className={`px-5 py-2 font-black text-xs uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 cursor-pointer text-white shadow bg-[#02275A] hover:bg-opacity-95 ${
                              reviewWizardStep === 2 && !reviewEmployeeId
                                ? "opacity-50 pointer-events-none"
                                : ""
                            }`}
                          >
                            <span>Next Step</span>
                            <i className="fas fa-arrow-right text-[10px]"></i>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

      {/* Bulk Apply Handler */}
      {(() => {
        // Just a hook-friendly function declaration inside the component body
        // placed here so we can access all state variables.
        return null;
      })()}

      {/* CUSTOM CONFIRMATION DIALOG MODAL */}
      {confirmDialog.isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[110] p-4 font-sans animate-fade-in"
          id="custom-confirm-modal-backdrop"
        >
          <div
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden flex flex-col"
            id="custom-confirm-modal-container"
          >
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <i className="fas fa-exclamation-triangle text-red-500"></i>
                <span className="font-extrabold text-xs uppercase tracking-wider text-slate-700 font-mono">
                  {confirmDialog.title}
                </span>
              </div>
              <button
                onClick={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                {confirmDialog.message}
              </p>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-150 flex justify-end gap-2">
              <button
                onClick={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-lg text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmDialog.onConfirm();
                }}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-black transition-all shadow-sm"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPerformanceView;
