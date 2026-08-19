import React, { useState, useMemo, useEffect, useCallback } from "react";
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
} from "recharts";
import AddGradeModal from "./AddGradeModal";
import SetQuarterModal from "./SetQuarterModal";
import { AdminLeaveRequestsView } from "./AdminLeaveRequestsView";

export interface EmployeeDocument {
  id: string;
  type: "ID Card" | "Degree Certificate" | "Resume" | "Offer Letter" | "Other";
  name: string;
  status: "Verified" | "Pending" | "Rejected";
  uploadDate: string;
}

export interface Guarantor {
  name: string;
  phone: string;
  email?: string;
  relationship: string;
  address: string;
  verified: boolean;
}

export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  country: "Nigeria" | "Ghana" | "Kenya" | string;
  state: string;
  city: string;
  gender: "Male" | "Female" | "Other";
  maritalStatus: "Single" | "Married" | "Divorced" | "Widowed" | "Other";
  dateOfBirth: string;
  hireDate: string;
  status: "Active" | "On Leave" | "Terminated";
  salary: number;
  currency: string;
  performanceScore: number;
  employeeType?: string;

  // Advanced Localized Records
  nin?: string; // National Identity Number
  bvn?: string; // Bank Verification Number (Nigeria)
  taxId?: string; // TIN
  pfaName?: string; // Pension Fund Administrator
  pensionNumber?: string;
  bankName?: string;
  accountNumber?: string;

  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  guarantors?: Guarantor[];
  documents?: EmployeeDocument[];

  // Performance Review
  lastReviewDate?: string;
  coreGoalsCompleted?: number;
  totalGoals?: number;
  managerFeedback?: string;

  // Authorization & Hierarchy
  is_user_account?: boolean;
  is_team_lead?: boolean;
  reports_to?: string; // Employee ID this person reports to
  department_id?: string;
  role_id?: string;
  applied_template_id?: string;

  // Separate Independent Metrics
  grade?: "A+" | "A" | "B+" | "B" | "C" | "D" | "F";
  rewardPoints?: number;
  leaderboardRank?: string;
  gradeAuditTrail?: GradeAuditEntry[];
  kpis?: EmployeeKPI[];
  specialPenalty?: number;
  perfCap?: number;
  performanceBalance?: number;
  techSupportInputs?: {
    slaTickets: number;
    totalTickets: number;
    targetResponseTime: number;
    actualResponseTime: number;
    resolvedTickets: number;
    assignedTickets: number;
    customerSatisfaction: number;
    targetReopenRate: number;
    actualReopenRate: number;
    slaWeight: number;
    firstResponseWeight: number;
    resolutionWeight: number;
    csatWeight: number;
    reopenWeight: number;
    // Compatibility fields
    slaCompliance?: number;
    firstResponseTime?: number;
    firstResponseTarget?: number;
    resolutionTime?: number;
    resolutionTarget?: number;
    reopenRate?: number;
  };
  techSupportConductPoints?: Record<string, number>;
  marketingInputs?: {
    leadsGeneratedTarget: number;
    leadsGeneratedActual: number;
    leadsGeneratedWeight: number;
    costPerLeadTarget: number;
    costPerLeadActual: number;
    costPerLeadWeight: number;
    qualifiedLeadRateTarget: number;
    qualifiedLeadRateActual: number;
    qualifiedLeadRateWeight: number;
    campaignConversionTarget: number;
    campaignConversionActual: number;
    campaignConversionWeight: number;
  };
  marketingConductPoints?: Record<string, number>;
  salesInputs?: {
    revenueTarget: number;
    revenueActual: number;
    revenueWeight: number;
    dealsTarget: number;
    dealsActual: number;
    dealsWeight: number;
    conversionTarget: number;
    conversionActual: number;
    conversionWeight: number;
    collectionsTarget: number;
    collectionsActual: number;
    collectionsWeight: number;
  };
  salesConductPoints?: Record<string, number>;
  customerSuccessInputs?: {
    renewalTarget: number;
    renewalActual: number;
    renewalWeight: number;
    retentionActual: number;
    retentionWeight: number;
    expansionTarget: number;
    expansionActual: number;
    expansionWeight: number;
    healthActual: number;
    healthWeight: number;
    adoptionActual: number;
    adoptionWeight: number;
  };
  customerSuccessConductPoints?: Record<string, number>;
  operationsInputs?: {
    fulfillmentRate: number;
    fulfillmentWeight: number;
    accuracyRate: number;
    accuracyWeight: number;
    actualSavings: number;
    targetSavings: number;
    savingsWeight: number;
    targetVariance: number;
    actualVariance: number;
    varianceWeight: number;
    complianceDeductions: number;
    complianceWeight: number;
  };
  operationsConductPoints?: Record<string, number>;
  managerInputs?: {
    teamTarget: number;
    actualTeamResult: number;
    qualityPercent: number;
    compliancePercent: number;
    reportingRating: number;
    peopleManagementRating: number;
    leadershipRating: number;
  };
  managerConductPoints?: Record<string, number>;
  weeklyReviews?: any[];
  monthlyReviews?: any[];
}

export interface EmployeeKPI {
  id: string;
  name: string;
  type: "Target-Based" | "Percentage" | "Deductive" | "Binary" | "Rating" | "Achievement" | "Reverse Achievement" | "Ratio" | string;
  weight: number;
  currentValue: number;
  targetValue: number;
  unit?: string;
  maxWeightRange?: number;
  comments?: string;
}

export function getDefaultKPIs(
  department: string,
  role: string,
): EmployeeKPI[] {
  const deptLower = (department || "").toLowerCase();
  const roleLower = (role || "").toLowerCase();
  const isSales = deptLower === "sales" || roleLower.includes("sales");
  const isCX =
    deptLower.includes("customer") ||
    deptLower === "cx" ||
    roleLower.includes("support") ||
    roleLower.includes("customer") ||
    roleLower.includes("experience");

  if (isSales) {
    return [
      {
        id: "sales-rev",
        name: "Sales Revenue Volume",
        type: "Target-Based",
        weight: 40,
        currentValue: 850000,
        targetValue: 1000000,
        unit: "₦",
      },
      {
        id: "sales-count",
        name: "Deals Closed Count",
        type: "Target-Based",
        weight: 30,
        currentValue: 6,
        targetValue: 8,
        unit: "deals",
      },
      {
        id: "retention",
        name: "Customer Retention Rate",
        type: "Percentage",
        weight: 20,
        currentValue: 92,
        targetValue: 100,
        unit: "%",
      },
      {
        id: "compliance",
        name: "Compliance Penalties",
        type: "Deductive",
        weight: 10,
        currentValue: 0,
        targetValue: 100,
        unit: "penalties",
      },
    ];
  } else if (isCX) {
    return [
      {
        id: "sla-resp",
        name: "SLA Response Rate",
        type: "Percentage",
        weight: 40,
        currentValue: 95,
        targetValue: 100,
        unit: "%",
      },
      {
        id: "csat",
        name: "CSAT Customer Rating",
        type: "Target-Based",
        weight: 30,
        currentValue: 4.8,
        targetValue: 5.0,
        unit: "★",
      },
      {
        id: "tkts",
        name: "Tickets Resolved",
        type: "Target-Based",
        weight: 20,
        currentValue: 180,
        targetValue: 200,
        unit: "tickets",
      },
      {
        id: "directives",
        name: "Disciplinary Adherence",
        type: "Deductive",
        weight: 10,
        currentValue: 5,
        targetValue: 100,
        unit: "deductions",
      },
    ];
  } else {
    return [
      {
        id: "core-deliv",
        name: "Core Deliverables Completed",
        type: "Target-Based",
        weight: 50,
        currentValue: 4,
        targetValue: 5,
        unit: "tasks",
      },
      {
        id: "proc-adh",
        name: "Process Adherence",
        type: "Percentage",
        weight: 30,
        currentValue: 85,
        targetValue: 100,
        unit: "%",
      },
      {
        id: "team-contrib",
        name: "Team Value Contribution",
        type: "Binary",
        weight: 20,
        currentValue: 1,
        targetValue: 1,
        unit: "achieved",
      },
    ];
  }
}

export function calculateKPIContribution(kpi: EmployeeKPI): number {
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
    "culture fit"
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
      if (targetValue > 0) {
        scoreMultiplier = Math.min(1.0, currentValue / targetValue);
      } else {
        scoreMultiplier = 1.0;
      }
      break;
    case "Percentage":
      scoreMultiplier = Math.min(1.0, Math.max(0, currentValue / 100));
      break;
    case "Deductive":
      scoreMultiplier = Math.min(1.0, Math.max(0, (100 - currentValue) / 100));
      break;
    case "Binary":
      scoreMultiplier = currentValue > 0 ? 1.0 : 0.0;
      break;
    default:
      scoreMultiplier = 1.0;
  }

  return scoreMultiplier * weight;
}

export function calculateEmployeePerformanceBalance(
  kpis: EmployeeKPI[],
): number {
  if (!kpis || kpis.length === 0) return 70;

  let totalScore = 0;
  let totalWeight = 0;

  kpis.forEach((kpi) => {
    totalScore += calculateKPIContribution(kpi);
    totalWeight += kpi.weight;
  });

  if (totalWeight > 0) {
    return Math.round((totalScore / totalWeight) * 100);
  }
  return 0;
}

export function getSubordinateRoleKpiPercentage(sub: Employee): number {
  const subKpis = sub.kpis || [];
  const roleKpis = subKpis.filter(k => {
    const kName = (k.name || "").toLowerCase();
    const coreNames = [
      "punctuality & attendance",
      "punctuality and attendance",
      "team player & collaboration",
      "team player and collaboration",
      "communication adeptness",
      "administrative compliance",
      "punctuality",
      "collaboration",
      "communication",
      "compliance",
      "attendance",
      "team player"
    ];
    const isCore = coreNames.some(cn => kName.includes(cn) || cn.includes(kName));
    return !isCore;
  });
  const roleKpiScoreSum = roleKpis.reduce((s, k) => s + calculateKPIContribution(k), 0);
  const roleKpiWeightSum = roleKpis.reduce((s, k) => s + k.weight, 0);

  if (roleKpiWeightSum > 0) {
    return (roleKpiScoreSum / roleKpiWeightSum) * 100;
  }

  // If they are formula-based (like Marketing, Sales, CS, Operations, Tech Support)
  const roll = (sub.role || "").toLowerCase();
  const dept = (sub.department || "").toLowerCase();
  const isCs = roll.includes("success") || dept.includes("success");
  const isEng = roll.includes("engineer") || dept.includes("engineer") || roll.includes("develop") || dept.includes("tech");
  const isSupp = roll.includes("support") || dept.includes("support") || dept.includes("experience") || roll.includes("cx");
  const isMark = roll.includes("marketing") || dept.includes("marketing") || roll.includes("growth") || dept.includes("growth") || roll.includes("brand") || dept.includes("brand");
  const isSales = roll.includes("sales") || dept.includes("sales");
  const isOp = !isCs && !isEng && !isSupp && !isMark && !isSales && (roll.includes("operation") || dept.includes("operation") || roll.includes("logistic") || dept.includes("logistic") || roll.includes("inventory") || dept.includes("inventory") || roll.includes("warehouse") || dept.includes("warehouse"));

  if (isMark) {
    const inputs = sub.marketingInputs || {
      leadsGeneratedTarget: 500,
      leadsGeneratedActual: 500,
      leadsGeneratedWeight: 25,
      costPerLeadTarget: 5.0,
      costPerLeadActual: 5.0,
      costPerLeadWeight: 20,
      qualifiedLeadRateTarget: 40,
      qualifiedLeadRateActual: 40,
      qualifiedLeadRateWeight: 20,
      campaignConversionTarget: 5.0,
      campaignConversionActual: 5.0,
      campaignConversionWeight: 15
    };
    const computedLeads = inputs.leadsGeneratedTarget > 0 ? (inputs.leadsGeneratedActual / inputs.leadsGeneratedTarget) * inputs.leadsGeneratedWeight : 0;
    const computedCost = inputs.costPerLeadActual > 0 ? (inputs.costPerLeadTarget / inputs.costPerLeadActual) * inputs.costPerLeadWeight : 0;
    const computedQual = inputs.qualifiedLeadRateTarget > 0 ? (inputs.qualifiedLeadRateActual / inputs.qualifiedLeadRateTarget) * inputs.qualifiedLeadRateWeight : 0;
    const computedConv = inputs.campaignConversionTarget > 0 ? (inputs.campaignConversionActual / inputs.campaignConversionTarget) * inputs.campaignConversionWeight : 0;
    const roleScore = Math.min(80, computedLeads + computedCost + computedQual + computedConv);
    return (roleScore / 80) * 100;
  }

  if (isSales) {
    const inputs = sub.salesInputs || {
      revenueTarget: 1000000,
      revenueActual: 1000000,
      revenueWeight: 40,
      dealsTarget: 10,
      dealsActual: 10,
      dealsWeight: 15,
      conversionTarget: 5.0,
      conversionActual: 5.0,
      conversionWeight: 15,
      collectionsTarget: 90,
      collectionsActual: 90,
      collectionsWeight: 10
    };
    const computedRevenue = inputs.revenueTarget > 0 ? (inputs.revenueActual / inputs.revenueTarget) * inputs.revenueWeight : 0;
    const computedDeals = inputs.dealsTarget > 0 ? (inputs.dealsActual / inputs.dealsTarget) * inputs.dealsWeight : 0;
    const computedConversion = inputs.conversionTarget > 0 ? (inputs.conversionActual / inputs.conversionTarget) * inputs.conversionWeight : 0;
    const computedCollections = inputs.collectionsTarget > 0 ? (inputs.collectionsActual / inputs.collectionsTarget) * inputs.collectionsWeight : 0;
    const roleScore = Math.min(80, computedRevenue + computedDeals + computedConversion + computedCollections);
    return (roleScore / 80) * 100;
  }

  if (isCs) {
    const inputs = sub.customerSuccessInputs || {
      renewalTarget: 100,
      renewalActual: 100,
      renewalWeight: 30,
      retentionActual: 100,
      retentionWeight: 20,
      expansionTarget: 100,
      expansionActual: 100,
      expansionWeight: 10,
      healthActual: 100,
      healthWeight: 10,
      adoptionActual: 100,
      adoptionWeight: 10
    };
    const computedRenewal = inputs.renewalTarget > 0 ? (inputs.renewalActual / inputs.renewalTarget) * inputs.renewalWeight : 0;
    const computedRetention = (inputs.retentionActual / 100) * inputs.retentionWeight;
    const computedExpansion = inputs.expansionTarget > 0 ? (inputs.expansionActual / inputs.expansionTarget) * inputs.expansionWeight : 0;
    const computedHealth = (inputs.healthActual / 100) * inputs.healthWeight;
    const computedAdoption = (inputs.adoptionActual / 100) * inputs.adoptionWeight;
    const roleScore = Math.min(80, computedRenewal + computedRetention + computedExpansion + computedHealth + computedAdoption);
    return (roleScore / 80) * 100;
  }

  if (isOp) {
    const inputs = sub.operationsInputs || {
      fulfillmentRate: 100,
      fulfillmentWeight: 20,
      accuracyRate: 100,
      accuracyWeight: 20,
      actualSavings: 100,
      targetSavings: 100,
      savingsWeight: 15,
      targetVariance: 100,
      actualVariance: 100,
      varianceWeight: 15,
      complianceDeductions: 0,
      complianceWeight: 10
    };
    const computedFulfillment = (inputs.fulfillmentRate / 100) * inputs.fulfillmentWeight;
    const computedAccuracy = (inputs.accuracyRate / 100) * inputs.accuracyWeight;
    const computedSavings = inputs.targetSavings > 0 ? (inputs.actualSavings / inputs.targetSavings) * inputs.savingsWeight : 0;
    const computedVariance = inputs.actualVariance <= 0 ? inputs.varianceWeight : inputs.targetVariance > 0 ? Math.max(0, Math.min(inputs.varianceWeight, (inputs.targetVariance / inputs.actualVariance) * inputs.varianceWeight)) : inputs.varianceWeight;
    const computedCompliance = Math.max(0, inputs.complianceWeight - inputs.complianceDeductions);
    const roleScore = Math.min(80, computedFulfillment + computedAccuracy + computedSavings + computedVariance + computedCompliance);
    return (roleScore / 80) * 100;
  }

  if (isSupp) {
    const inputs = sub.techSupportInputs || {
      slaCompliance: 100,
      slaWeight: 20,
      firstResponseTime: 10,
      firstResponseTarget: 15,
      firstResponseWeight: 15,
      resolutionTime: 20,
      resolutionTarget: 30,
      resolutionWeight: 15,
      customerSatisfaction: 5,
      csatWeight: 20,
      reopenRate: 0,
      targetReopenRate: 5,
      reopenWeight: 10
    };
    const computedSla = (inputs.slaCompliance / 100) * inputs.slaWeight;
    const computedResp = inputs.firstResponseTime <= inputs.firstResponseTarget ? inputs.firstResponseWeight : inputs.firstResponseTime > 0 ? (inputs.firstResponseTarget / inputs.firstResponseTime) * inputs.firstResponseWeight : 0;
    const computedRes = inputs.resolutionTime <= inputs.resolutionTarget ? inputs.resolutionWeight : inputs.resolutionTime > 0 ? (inputs.resolutionTarget / inputs.resolutionTime) * inputs.resolutionWeight : 0;
    const computedCsat = (inputs.customerSatisfaction / 5) * inputs.csatWeight;
    const computedReopen = inputs.reopenRate <= inputs.targetReopenRate ? inputs.reopenWeight : 0;
    const roleScore = Math.min(80, computedSla + computedResp + computedRes + computedCsat + computedReopen);
    return (roleScore / 80) * 100;
  }

  // Fallback
  const rawScore = sub.performanceScore || 80;
  const estRoleScore = rawScore > 80 ? Math.min(80, rawScore - 20) : rawScore;
  return (estRoleScore / 80) * 100;
}

export function calculateGradeFromPerformance(
  performanceScore: number,
): "A+" | "A" | "B+" | "B" | "C" | "D" | "F" {
  if (performanceScore >= 95) return "A+";
  if (performanceScore >= 90) return "A";
  if (performanceScore >= 80) return "B+";
  if (performanceScore >= 70) return "B";
  if (performanceScore >= 60) return "C";
  if (performanceScore >= 50) return "D";
  return "F";
}

export interface GradeAuditEntry {
  id: string;
  previousGrade: string;
  newGrade: string;
  policyResponsible: string;
  dateOfChange: string;
  approvingAuthority: string;
  reason: string;
  strengths?: string;
  recommendations?: string;
  type?: string;
  score?: number;
  rewardPoints?: number;
  ratingYear?: string;
  ratingMonth?: string;
  ratingPoints?: number;
}

export function normalizeEmployeesList(list: Employee[]): Employee[] {
  if (!list || !Array.isArray(list)) return [];
  
  let hasMarketingLead = false;
  let hasSupport = false;

  const mapped = list.map((emp) => {
    if (emp.email === "marketing@gmail.com") {
      hasMarketingLead = true;
    }
    if (emp.email === "support@gmail.com") {
      hasSupport = true;
    }

    if (emp.email === "f.yusuf@company.com" || emp.email === "marketer@gmail.com" || emp.id === "8" || emp.employeeId === "EMP-MKT-001") {
      const marketingInputs = emp.marketingInputs || {
        leadsGeneratedTarget: 500,
        leadsGeneratedActual: 500,
        leadsGeneratedWeight: 25,
        costPerLeadTarget: 5.0,
        costPerLeadActual: 5.0,
        costPerLeadWeight: 20,
        qualifiedLeadRateTarget: 40,
        qualifiedLeadRateActual: 40,
        qualifiedLeadRateWeight: 20,
        campaignConversionTarget: 5.0,
        campaignConversionActual: 5.0,
        campaignConversionWeight: 15
      };
      const marketingConductPoints = emp.marketingConductPoints || {
        cwc1: 5,
        cwc2: 5,
        cwc3: 5,
        cwc4: 5
      };

      const computedLeads = marketingInputs.leadsGeneratedTarget > 0 ? (marketingInputs.leadsGeneratedActual / marketingInputs.leadsGeneratedTarget) * marketingInputs.leadsGeneratedWeight : 0;
      const computedCost = marketingInputs.costPerLeadActual > 0 ? (marketingInputs.costPerLeadTarget / marketingInputs.costPerLeadActual) * marketingInputs.costPerLeadWeight : 0;
      const computedQual = marketingInputs.qualifiedLeadRateTarget > 0 ? (marketingInputs.qualifiedLeadRateActual / marketingInputs.qualifiedLeadRateTarget) * marketingInputs.qualifiedLeadRateWeight : 0;
      const computedConv = marketingInputs.campaignConversionTarget > 0 ? (marketingInputs.campaignConversionActual / marketingInputs.campaignConversionTarget) * marketingInputs.campaignConversionWeight : 0;
      const roleScore = Math.min(80, computedLeads + computedCost + computedQual + computedConv);
      
      const c1 = marketingConductPoints.cwc1 !== undefined ? marketingConductPoints.cwc1 : 5;
      const c2 = marketingConductPoints.cwc2 !== undefined ? marketingConductPoints.cwc2 : 5;
      const c3 = marketingConductPoints.cwc3 !== undefined ? marketingConductPoints.cwc3 : 5;
      const c4 = marketingConductPoints.cwc4 !== undefined ? marketingConductPoints.cwc4 : 5;
      const conductScore = (c1 + c2 + c3 + c4); // max 20
      const overallScore = Math.min(100, Math.round(roleScore + conductScore));

      return {
        ...emp,
        email: "marketer@gmail.com",
        role: "Marketing Associate",
        department: "Marketing",
        is_team_lead: false,
        marketingInputs,
        marketingConductPoints,
        performanceScore: overallScore,
      };
    }
    if (emp.email === "t.bakari@company.com") {
      return {
        ...emp,
        email: "customersuccess@gmail.com",
        role: "Customer Success Executive",
      };
    }
    return emp;
  });

  if (!hasMarketingLead) {
    mapped.push({
      id: "marketing-lead-id",
      employeeId: "EMP-MKT-000",
      firstName: "Amara",
      lastName: "Sule",
      email: "marketing@gmail.com",
      phone: "+234 809 111 2222",
      role: "Marketing Lead",
      department: "Marketing",
      country: "Nigeria",
      state: "Lagos",
      city: "Ikeja",
      gender: "Female",
      maritalStatus: "Married",
      dateOfBirth: "1990-04-15",
      hireDate: "2021-02-10",
      status: "Active",
      salary: 850000,
      currency: "NGN",
      performanceScore: 94,
      nin: "11223344565",
      taxId: "TIN-492-938-11",
      bankName: "Zenith Bank",
      accountNumber: "0233445577",
      emergencyContact: {
        name: "Yusuf Sule",
        phone: "+234 809 111 3333",
        relationship: "Spouse",
      },
      guarantors: [],
      documents: [],
      lastReviewDate: "2026-03-20",
      coreGoalsCompleted: 4,
      totalGoals: 5,
      managerFeedback: "Exceptional team leadership and marketing strategy execution.",
      is_user_account: true,
      is_team_lead: true,
      department_id: "dept-marketing",
      role_id: "role-marketing-lead",
      grade: "A",
      rewardPoints: 210,
      leaderboardRank: "1st (Marketing)",
      gradeAuditTrail: [],
    } as any);
  }

  if (!hasSupport) {
    mapped.push({
      id: "support-specialist-id",
      employeeId: "EMP-TECH-001",
      firstName: "Ade",
      lastName: "Ayodele",
      email: "support@gmail.com",
      phone: "+234 815 678 9012",
      role: "Technical Support Specialist",
      department: "Technical Support",
      country: "Nigeria",
      state: "Lagos",
      city: "Ikeja",
      gender: "Male",
      maritalStatus: "Single",
      dateOfBirth: "1995-08-12",
      hireDate: "2023-06-01",
      status: "Active",
      salary: 320000,
      currency: "NGN",
      performanceScore: 92,
      nin: "11223344561",
      taxId: "TIN-492-938-7",
      bankName: "Access Bank",
      accountNumber: "0712345678",
      emergencyContact: {
        name: "Funmi Ayodele",
        phone: "+234 815 123 4567",
        relationship: "Sister",
      },
      guarantors: [],
      documents: [],
      lastReviewDate: "2026-04-10",
      coreGoalsCompleted: 4,
      totalGoals: 5,
      managerFeedback: "Excellent customer service and issue resolution.",
      is_user_account: true,
      is_team_lead: false,
      department_id: "dept-cx",
      role_id: "role-employee",
      grade: "B+",
      rewardPoints: 150,
      leaderboardRank: "3rd",
      gradeAuditTrail: [],
    } as any);
  }

  return mapped;
}

export const initialEmployees: Employee[] = [
  {
    id: "1",
    employeeId: "EMP-NG-001",
    firstName: "Chinedu",
    lastName: "Okafor",
    email: "c.okafor@company.com",
    phone: "+234 801 234 5678",
    role: "Sales Manager",
    department: "Sales",
    country: "Nigeria",
    state: "Lagos",
    city: "Ikeja",
    gender: "Male",
    maritalStatus: "Married",
    dateOfBirth: "1985-05-14",
    hireDate: "2019-03-01",
    status: "Active",
    salary: 1500000,
    currency: "NGN",
    performanceScore: 92,
    bvn: "22334455667",
    nin: "12345678901",
    taxId: "TIN-492-938-1",
    pfaName: "Stanbic IBTC Pension Managers",
    pensionNumber: "PEN100349200",
    bankName: "GTBank",
    accountNumber: "0123456789",
    emergencyContact: {
      name: "Nkechi Okafor",
      phone: "+234 802 345 6789",
      relationship: "Spouse",
    },
    guarantors: [
      {
        name: "Dr. Samuel Obi",
        phone: "+234 803 111 2222",
        relationship: "Former Manager",
        address: "14 Victoria Island, Lagos",
        verified: true,
      },
      {
        name: "Emeka Nwosu",
        phone: "+234 805 222 3333",
        email: "emeka.n@example.com",
        relationship: "Uncle",
        address: "8 Yaba, Lagos",
        verified: true,
      },
    ],
    documents: [
      {
        id: "d1",
        type: "ID Card",
        name: "NIN Slip",
        status: "Verified",
        uploadDate: "2019-02-25",
      },
      {
        id: "d2",
        type: "Offer Letter",
        name: "Signed Offer",
        status: "Verified",
        uploadDate: "2019-02-28",
      },
      {
        id: "d3",
        type: "Degree Certificate",
        name: "BSc Computer Science",
        status: "Verified",
        uploadDate: "2019-03-05",
      },
    ],
    lastReviewDate: "2026-03-10",
    coreGoalsCompleted: 4,
    totalGoals: 5,
    managerFeedback: "Exceptional sales performance this quarter.",
    is_user_account: true,
    is_team_lead: true,
    department_id: "dept-sales",
    role_id: "role-sales-manager",
    grade: "A",
    rewardPoints: 230,
    leaderboardRank: "2nd",
    gradeAuditTrail: [],
  },
  {
    id: "2",
    employeeId: "EMP-NG-002",
    firstName: "Ada",
    lastName: "Eze",
    email: "employee@gmail.com",
    phone: "+234 802 345 6789",
    role: "Sales Representative",
    department: "Sales",
    country: "Nigeria",
    state: "Lagos",
    city: "Ikeja",
    gender: "Female",
    maritalStatus: "Single",
    dateOfBirth: "1998-09-22",
    hireDate: "2022-01-15",
    status: "Active",
    salary: 300000,
    currency: "NGN",
    performanceScore: 88,
    nin: "11223344556",
    taxId: "TIN-492-938-2",
    bankName: "Zenith",
    accountNumber: "0987654321",
    emergencyContact: {
      name: "Obinna Eze",
      phone: "+234 803 456 7890",
      relationship: "Brother",
    },
    guarantors: [],
    documents: [],
    lastReviewDate: "2026-03-10",
    coreGoalsCompleted: 3,
    totalGoals: 4,
    managerFeedback: "Solid performance, room for growth.",
    is_user_account: true,
    is_team_lead: false,
    reports_to: "EMP-NG-001",
    department_id: "dept-sales",
    role_id: "role-employee",
    grade: "B+",
    rewardPoints: 85,
    leaderboardRank: "4th",
    gradeAuditTrail: [],
  },
  {
    id: "3",
    employeeId: "EMP-NG-003",
    firstName: "Samuel",
    lastName: "Ojo",
    email: "s.ojo@company.com",
    phone: "+234 803 456 7890",
    role: "Customer Experience Lead",
    department: "Customer Experience",
    country: "Nigeria",
    state: "Lagos",
    city: "Ikeja",
    gender: "Male",
    maritalStatus: "Married",
    dateOfBirth: "1992-11-05",
    hireDate: "2021-06-10",
    status: "Active",
    salary: 800000,
    currency: "NGN",
    performanceScore: 95,
    nin: "11223344557",
    taxId: "TIN-492-938-3",
    bankName: "Access Bank",
    accountNumber: "0987654322",
    emergencyContact: {
      name: "Grace Ojo",
      phone: "+234 804 567 8901",
      relationship: "Spouse",
    },
    guarantors: [],
    documents: [],
    lastReviewDate: "2026-04-10",
    coreGoalsCompleted: 4,
    totalGoals: 4,
    managerFeedback: "Excellent team leadership.",
    is_user_account: true,
    is_team_lead: true,
    department_id: "dept-cx",
    role_id: "role-cx-lead",
    grade: "A+",
    rewardPoints: 310,
    leaderboardRank: "1st",
    gradeAuditTrail: [],
  },
  {
    id: "4",
    employeeId: "EMP-NG-004",
    firstName: "Binta",
    lastName: "Danladi",
    email: "b.danladi@company.com",
    phone: "+234 805 678 9012",
    role: "Customer Support Representative",
    department: "Customer Experience",
    country: "Nigeria",
    state: "Abuja",
    city: "Abuja",
    gender: "Female",
    maritalStatus: "Single",
    dateOfBirth: "1996-02-14",
    hireDate: "2023-02-01",
    status: "Active",
    salary: 250000,
    currency: "NGN",
    performanceScore: 78,
    nin: "11223344558",
    taxId: "TIN-492-938-4",
    bankName: "UBA",
    accountNumber: "0987654323",
    emergencyContact: {
      name: "Aliyu Danladi",
      phone: "+234 806 789 0123",
      relationship: "Father",
    },
    guarantors: [],
    documents: [],
    lastReviewDate: "2026-04-12",
    coreGoalsCompleted: 3,
    totalGoals: 4,
    managerFeedback: "Good communication skills, sometimes misses SLA.",
    is_user_account: true,
    is_team_lead: false,
    reports_to: "EMP-NG-003",
    department_id: "dept-cx",
    role_id: "role-cx-rep",
    grade: "C",
    rewardPoints: 40,
    leaderboardRank: "6th",
    gradeAuditTrail: [],
  },
  {
    id: "5",
    employeeId: "EMP-GH-002",
    firstName: "Kwame",
    lastName: "Osei",
    email: "k.osei@company.com",
    phone: "+233 24 987 6543",
    role: "Software Engineer",
    department: "Engineering",
    country: "Ghana",
    state: "Ashanti",
    city: "Kumasi",
    gender: "Male",
    maritalStatus: "Single",
    dateOfBirth: "1995-03-12",
    hireDate: "2023-08-01",
    status: "Active",
    salary: 15000,
    currency: "GHS",
    performanceScore: 90,
    nin: "GHA-1234567-8",
    taxId: "GH-TIN-89302",
    bankName: "Ecobank Ghana",
    accountNumber: "12398700993",
    emergencyContact: {
      name: "Akua Osei",
      phone: "+233 20 555 4444",
      relationship: "Mother",
    },
    guarantors: [
      {
        name: "Mr. John Appiah",
        phone: "+233 24 111 2222",
        relationship: "Family Friend",
        address: "East Legon, Accra",
        verified: true,
      },
    ],
    documents: [
      {
        id: "d4",
        type: "ID Card",
        name: "Ghana Card",
        status: "Verified",
        uploadDate: "2023-07-15",
      },
      {
        id: "d5",
        type: "Resume",
        name: "Resume_Updated.pdf",
        status: "Pending",
        uploadDate: "2023-07-10",
      },
    ],
    lastReviewDate: "2026-04-05",
    coreGoalsCompleted: 3,
    totalGoals: 3,
    managerFeedback:
      "Consistent delivery of high-quality code. Great team player.",
    is_user_account: true,
    is_team_lead: false,
    department_id: "dept-engineering",
    role_id: "role-ordinary-engineer",
    grade: "B",
    rewardPoints: 175,
    leaderboardRank: "3rd",
    gradeAuditTrail: [],
  },
  {
    id: "101",
    employeeId: "EMP-NG-101",
    firstName: "Tunde",
    lastName: "Bakare",
    email: "t.bakare@company.com",
    phone: "+234 809 111 2222",
    role: "Engineering Manager",
    department: "Engineering",
    country: "Nigeria",
    state: "Lagos",
    city: "Lekki",
    gender: "Male",
    maritalStatus: "Married",
    dateOfBirth: "1987-10-10",
    hireDate: "2021-06-01",
    status: "Active",
    salary: 2800000,
    currency: "NGN",
    performanceScore: 95,
    bankName: "Zenith Bank",
    accountNumber: "1029384756",
    is_user_account: true,
    is_team_lead: true,
    department_id: "dept-engineering",
    role_id: "role-engineering-manager",
    grade: "A",
    rewardPoints: 240,
    leaderboardRank: "2nd",
    gradeAuditTrail: [],
  },
  {
    id: "102",
    employeeId: "EMP-NG-102",
    firstName: "Ngozi",
    lastName: "Okoye",
    email: "n.okoye@company.com",
    phone: "+234 812 333 4444",
    role: "Engineer",
    department: "Engineering",
    country: "Nigeria",
    state: "Enugu",
    city: "Enugu",
    gender: "Female",
    maritalStatus: "Single",
    dateOfBirth: "1997-04-15",
    hireDate: "2024-01-15",
    status: "Active",
    salary: 1200000,
    currency: "NGN",
    performanceScore: 88,
    bankName: "Access Bank",
    accountNumber: "9081726354",
    is_user_account: true,
    is_team_lead: false,
    department_id: "dept-engineering",
    role_id: "role-engineering",
    grade: "B",
    rewardPoints: 120,
    leaderboardRank: "8th",
    gradeAuditTrail: [],
  },
  {
    id: "6",
    employeeId: "EMP-KE-002",
    firstName: "Aisha",
    lastName: "Omondi",
    email: "a.omondi@company.com",
    phone: "+254 733 456 789",
    role: "HR Manager",
    department: "Human Resources",
    country: "Kenya",
    state: "Mombasa",
    city: "Mombasa",
    gender: "Female",
    maritalStatus: "Married",
    dateOfBirth: "1988-07-19",
    hireDate: "2020-04-12",
    status: "Active",
    salary: 250000,
    currency: "KES",
    performanceScore: 96,
    nin: "23948502",
    taxId: "KRA-938472948",
    bankName: "KCB Bank",
    accountNumber: "9988776655",
    emergencyContact: {
      name: "Peter Omondi",
      phone: "+254 711 222 333",
      relationship: "Spouse",
    },
    guarantors: [
      {
        name: "Jane Wanjiku",
        phone: "+254 722 333 444",
        relationship: "Former Colleague",
        address: "Westlands, Nairobi",
        verified: true,
      },
    ],
    documents: [
      {
        id: "d6",
        type: "ID Card",
        name: "National ID",
        status: "Verified",
        uploadDate: "2020-04-01",
      },
    ],
    lastReviewDate: "2026-01-20",
    coreGoalsCompleted: 5,
    totalGoals: 5,
    managerFeedback:
      "Outstanding leadership in restructuring the East African branch policies.",
    is_user_account: true,
    is_team_lead: true,
    department_id: "dept-hr",
    role_id: "role-admin",
    grade: "A+",
    rewardPoints: 290,
    leaderboardRank: "1st (HR)",
    gradeAuditTrail: [],
  },
  {
    id: "7",
    employeeId: "EMP-CS-001",
    firstName: "Tunde",
    lastName: "Bakari",
    email: "customersuccess@gmail.com",
    phone: "+234 812 345 6789",
    role: "Customer Success Executive",
    department: "Customer Success",
    country: "Nigeria",
    state: "Lagos",
    city: "Ikeja",
    gender: "Male",
    maritalStatus: "Single",
    dateOfBirth: "1994-06-25",
    hireDate: "2022-04-10",
    status: "Active",
    salary: 350000,
    currency: "NGN",
    performanceScore: 85,
    nin: "11223344559",
    taxId: "TIN-492-938-5",
    bankName: "GTBank",
    accountNumber: "0122334455",
    emergencyContact: {
      name: "Mofe Bakari",
      phone: "+234 813 456 7890",
      relationship: "Brother",
    },
    guarantors: [],
    documents: [],
    lastReviewDate: "2026-03-12",
    coreGoalsCompleted: 4,
    totalGoals: 5,
    managerFeedback: "Excellent response time.",
    is_user_account: true,
    is_team_lead: false,
    reports_to: "EMP-NG-003",
    department_id: "dept-cs",
    role_id: "role-employee",
    grade: "B+",
    rewardPoints: 90,
    leaderboardRank: "5th",
    gradeAuditTrail: [],
  },
  {
    id: "8",
    employeeId: "EMP-MKT-001",
    firstName: "Fatima",
    lastName: "Yusuf",
    email: "marketer@gmail.com",
    phone: "+234 809 345 6789",
    role: "Marketing Associate",
    department: "Marketing",
    country: "Nigeria",
    state: "Lagos",
    city: "Lekki",
    gender: "Female",
    maritalStatus: "Married",
    dateOfBirth: "1996-10-14",
    hireDate: "2023-01-15",
    status: "Active",
    salary: 400000,
    currency: "NGN",
    performanceScore: 100,
    marketingInputs: {
      leadsGeneratedTarget: 500,
      leadsGeneratedActual: 500,
      leadsGeneratedWeight: 25,
      costPerLeadTarget: 5.0,
      costPerLeadActual: 5.0,
      costPerLeadWeight: 20,
      qualifiedLeadRateTarget: 40,
      qualifiedLeadRateActual: 40,
      qualifiedLeadRateWeight: 20,
      campaignConversionTarget: 5.0,
      campaignConversionActual: 5.0,
      campaignConversionWeight: 15
    },
    marketingConductPoints: {
      cwc1: 5,
      cwc2: 5,
      cwc3: 5,
      cwc4: 5
    },
    nin: "11223344560",
    taxId: "TIN-492-938-6",
    bankName: "Zenith Bank",
    accountNumber: "0233445566",
    emergencyContact: {
      name: "Ibrahim Yusuf",
      phone: "+234 809 456 7890",
      relationship: "Spouse",
    },
    guarantors: [],
    documents: [],
    lastReviewDate: "2026-02-18",
    coreGoalsCompleted: 3,
    totalGoals: 4,
    managerFeedback: "Creative ideas, solid execution.",
    is_user_account: true,
    is_team_lead: false,
    department_id: "dept-marketing",
    role_id: "role-employee",
    grade: "A",
    rewardPoints: 75,
    leaderboardRank: "7th",
    gradeAuditTrail: [],
  },
  {
    id: "9",
    employeeId: "EMP-FIN-001",
    firstName: "Emmanuel",
    lastName: "Appiah",
    email: "e.appiah@company.com",
    phone: "+233 24 555 1234",
    role: "Accounts Officer",
    department: "Finance",
    country: "Ghana",
    state: "Greater Accra",
    city: "Accra",
    gender: "Male",
    maritalStatus: "Single",
    dateOfBirth: "1991-12-05",
    hireDate: "2021-11-01",
    status: "Active",
    salary: 18000,
    currency: "GHS",
    performanceScore: 89,
    nin: "GHA-7654321-0",
    taxId: "GH-TIN-89305",
    bankName: "Standard Chartered",
    accountNumber: "2345678901",
    emergencyContact: {
      name: "Kofi Appiah",
      phone: "+233 20 555 6789",
      relationship: "Uncle",
    },
    guarantors: [],
    documents: [],
    lastReviewDate: "2026-04-02",
    coreGoalsCompleted: 4,
    totalGoals: 4,
    managerFeedback: "Very detailed and meticulous balance reconciliation.",
    is_user_account: true,
    is_team_lead: false,
    department_id: "dept-finance",
    role_id: "role-employee",
    grade: "B+",
    rewardPoints: 120,
    leaderboardRank: "4th",
    gradeAuditTrail: [],
  },
  {
    id: "10",
    employeeId: "EMP-CNT-001",
    firstName: "Grace",
    lastName: "Koffi",
    email: "g.koffi@company.com",
    phone: "+233 27 555 9876",
    role: "Content Specialist",
    department: "Content",
    country: "Ghana",
    state: "Greater Accra",
    city: "Accra",
    gender: "Female",
    maritalStatus: "Single",
    dateOfBirth: "1997-04-20",
    hireDate: "2023-05-10",
    status: "Active",
    salary: 14000,
    currency: "GHS",
    performanceScore: 91,
    nin: "GHA-8822334-1",
    taxId: "GH-TIN-89306",
    bankName: "Fidelity Bank Ghana",
    accountNumber: "3456789012",
    emergencyContact: {
      name: "Ama Koffi",
      phone: "+233 20 555 2211",
      relationship: "Sister",
    },
    guarantors: [],
    documents: [],
    lastReviewDate: "2026-03-25",
    coreGoalsCompleted: 4,
    totalGoals: 5,
    managerFeedback:
      "Excellent copy writing quality and social media engagement.",
    is_user_account: true,
    is_team_lead: false,
    department_id: "dept-content",
    role_id: "role-employee",
    grade: "A",
    rewardPoints: 195,
    leaderboardRank: "3rd",
    gradeAuditTrail: [],
  },
  {
    id: "11",
    employeeId: "EMP-MKT-002",
    firstName: "Kola",
    lastName: "Alabi",
    email: "k.alabi@company.com",
    phone: "+234 809 999 8888",
    role: "Marketing Manager",
    department: "Marketing",
    country: "Nigeria",
    state: "Lagos",
    city: "Lekki",
    gender: "Male",
    maritalStatus: "Married",
    dateOfBirth: "1988-08-18",
    hireDate: "2021-02-15",
    status: "Active",
    salary: 1200000,
    currency: "NGN",
    performanceScore: 90,
    nin: "11223344561",
    taxId: "TIN-492-938-7",
    bankName: "GTBank",
    accountNumber: "0112233445",
    emergencyContact: {
      name: "Tola Alabi",
      phone: "+234 810 111 2222",
      relationship: "Spouse",
    },
    guarantors: [],
    documents: [],
    lastReviewDate: "2026-03-20",
    coreGoalsCompleted: 4,
    totalGoals: 5,
    managerFeedback: "Excellent marketing team leadership and campaign execution.",
    is_user_account: true,
    is_team_lead: true,
    department_id: "dept-marketing",
    role_id: "role-marketing-manager",
    grade: "A",
    rewardPoints: 180,
    leaderboardRank: "4th",
    gradeAuditTrail: [],
  },
  {
    id: "12",
    employeeId: "EMP-CX-002",
    firstName: "Yemi",
    lastName: "Johnson",
    email: "y.johnson@company.com",
    phone: "+234 802 333 4444",
    role: "Head of Customer Experience",
    department: "Customer Experience",
    country: "Nigeria",
    state: "Lagos",
    city: "Ikeja",
    gender: "Female",
    maritalStatus: "Single",
    dateOfBirth: "1986-04-12",
    hireDate: "2020-05-10",
    status: "Active",
    salary: 1400000,
    currency: "NGN",
    performanceScore: 93,
    nin: "11223344562",
    taxId: "TIN-492-938-8",
    bankName: "Zenith Bank",
    accountNumber: "0112233446",
    emergencyContact: {
      name: "Kemi Johnson",
      phone: "+234 803 222 1111",
      relationship: "Sister",
    },
    guarantors: [],
    documents: [],
    lastReviewDate: "2026-03-15",
    coreGoalsCompleted: 4,
    totalGoals: 4,
    managerFeedback: "Outstanding dedication to customer satisfaction metrics.",
    is_user_account: true,
    is_team_lead: true,
    department_id: "dept-cx",
    role_id: "role-head-cx",
    grade: "A",
    rewardPoints: 210,
    leaderboardRank: "3rd",
    gradeAuditTrail: [],
  },
  {
    id: "13",
    employeeId: "EMP-ENG-103",
    firstName: "Nnaemeka",
    lastName: "Egwu",
    email: "n.egwu@company.com",
    phone: "+234 813 555 6666",
    role: "Head of Engineering",
    department: "Engineering",
    country: "Nigeria",
    state: "Lagos",
    city: "Lekki",
    gender: "Male",
    maritalStatus: "Married",
    dateOfBirth: "1984-11-22",
    hireDate: "2019-10-01",
    status: "Active",
    salary: 3200000,
    currency: "NGN",
    performanceScore: 96,
    nin: "11223344563",
    taxId: "TIN-492-938-9",
    bankName: "Access Bank",
    accountNumber: "0112233447",
    emergencyContact: {
      name: "Chika Egwu",
      phone: "+234 814 666 7777",
      relationship: "Spouse",
    },
    guarantors: [],
    documents: [],
    lastReviewDate: "2026-04-01",
    coreGoalsCompleted: 5,
    totalGoals: 5,
    managerFeedback: "Superb architectural oversight and leadership of senior tech leads.",
    is_user_account: true,
    is_team_lead: true,
    department_id: "dept-engineering",
    role_id: "role-head-engineering",
    grade: "A+",
    rewardPoints: 280,
    leaderboardRank: "1st",
    gradeAuditTrail: [],
  },
];

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

interface AdminHRCenterViewProps {
  initialTab?:
    | "dashboard"
    | "directory"
    | "performance"
    | "policies"
    | "rewards"
    | "leaderboard"
    | "upload";
  hideTabs?: boolean;
  completelyHideTabs?: boolean;
  departmentFilter?: string;
  userRole?: string;
  userDepartment?: string;
  autoOpenReviewModal?: boolean;
  onOpenAppraisalWizard?: () => void;
}

const getWeeksInMonth = (yearStr: string, monthName: string): number => {
  const year = parseInt(yearStr, 10) || 2026;
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const monthIndex = months.indexOf(monthName);
  if (monthIndex === -1) return 4;
  
  const firstDay = new Date(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0);
  const firstDayOfWeek = firstDay.getDay(); // 0-6
  const totalDays = lastDay.getDate();
  
  const weeks = Math.ceil((totalDays + firstDayOfWeek) / 7);
  return Math.min(5, Math.max(4, weeks));
};

const AdminHRCenterView: React.FC<AdminHRCenterViewProps> = ({
  initialTab = "dashboard",
  hideTabs = false,
  completelyHideTabs = false,
  departmentFilter,
  userRole = "admin",
  userDepartment = "",
  autoOpenReviewModal = false,
  onOpenAppraisalWizard,
}) => {
  const { showSuccess } = useAlert();

  // Load and persist employees in localStorage so rated/modified employees persist across role shifts
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem("company_employees_data");
    let loadedList: Employee[] = [];
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Employee[];
        loadedList = parsed.map((emp) => {
          if (!emp.kpis || emp.kpis.length === 0) {
            return { ...emp, kpis: getDefaultKPIs(emp.department, emp.role) };
          }
          return emp;
        });
      } catch (e) {
        console.error(
          "Error parsing company_employees_data from localStorage:",
          e,
        );
      }
    }
    
    if (loadedList.length === 0) {
      loadedList = initialEmployees.map((emp) => {
        if (!emp.kpis || emp.kpis.length === 0) {
          return { ...emp, kpis: getDefaultKPIs(emp.department, emp.role) };
        }
        return emp;
      });
    }

    return normalizeEmployeesList(loadedList);
  });

  useEffect(() => {
    localStorage.setItem("company_employees_data", JSON.stringify(employees));
    localStorage.setItem("company_employees_kpi_state", JSON.stringify(employees));
  }, [employees]);

  // Active Tab State
  const [activeTab, setActiveTab] = useState<
    | "dashboard"
    | "directory"
    | "performance"
    | "policies"
    | "rewards"
    | "leaderboard"
    | "upload"
  >(initialTab);

  const isTeamLeadRole = [
    "team-lead",
    "cx-head",
    "sales-manager",
    "marketing-manager",
    "content-lead",
    "engineering",
    "engineer"
  ].includes(userRole || "");

  // New Rating States
  const [ratingEmployee, setRatingEmployee] = useState<Employee | null>(null);
  const [ratingGrade, setRatingGrade] = useState<
    "A+" | "A" | "B+" | "B" | "C" | "D"
  >("B+");
  const [reviewComments, setReviewComments] = useState("");
  const [strengths, setStrengths] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [activeQuarter, setActiveQuarter] = useState<string>(() => {
    return localStorage.getItem("company_active_quarter") || "Q2 2026";
  });
  const [reviewDateType, setReviewDateType] = useState<"daily" | "weekly" | "monthly">("monthly");
  const [ratingYear, setRatingYear] = useState<string>("2026");
  const [ratingMonth, setRatingMonth] = useState<string>("July");

  // KPI Editor States
  const [localKPIs, setLocalKPIs] = useState<EmployeeKPI[]>([]);
  const [newKpiName, setNewKpiName] = useState("");
  const [newKpiType, setNewKpiType] = useState<
    "Target-Based" | "Percentage" | "Deductive" | "Binary" | "Rating"
  >("Target-Based");
  const [newKpiWeight, setNewKpiWeight] = useState(20);
  const [newKpiTarget, setNewKpiTarget] = useState(100);
  const [newKpiUnit, setNewKpiUnit] = useState("");
  const [localRewardPoints, setLocalRewardPoints] = useState(100);
  const [ratingPoints, setRatingPoints] = useState<number>(0);
  const [editingWeeklyReview, setEditingWeeklyReview] = useState<any>(null);
  const [editingWeeklyScore, setEditingWeeklyScore] = useState<number>(80);
  const [editingWeeklyComments, setEditingWeeklyComments] = useState<string>("");

  useEffect(() => {
    if (ratingEmployee) {
      const defaultManagerJudgmentKPIs: EmployeeKPI[] = [
        { id: "mj-leadership", name: "Leadership", type: "Rating", weight: 10, currentValue: 3, targetValue: 5, unit: "out of 5" },
        { id: "mj-teamwork", name: "Teamwork", type: "Rating", weight: 15, currentValue: 3, targetValue: 5, unit: "out of 5" },
        { id: "mj-communication", name: "Communication", type: "Rating", weight: 15, currentValue: 3, targetValue: 5, unit: "out of 5" },
        { id: "mj-ownership", name: "Ownership", type: "Rating", weight: 15, currentValue: 3, targetValue: 5, unit: "out of 5" },
        { id: "mj-problem-solving", name: "Problem-solving", type: "Rating", weight: 15, currentValue: 3, targetValue: 5, unit: "out of 5" },
        { id: "mj-documentation", name: "Documentation quality", type: "Rating", weight: 10, currentValue: 3, targetValue: 5, unit: "out of 5" },
        { id: "mj-initiative", name: "Initiative", type: "Rating", weight: 10, currentValue: 3, targetValue: 5, unit: "out of 5" },
        { id: "mj-culture-fit", name: "Culture fit", type: "Rating", weight: 10, currentValue: 3, targetValue: 5, unit: "out of 5" },
      ];

      const existingKPIs = ratingEmployee.kpis || [];
      const initializedKPIs = defaultManagerJudgmentKPIs.map(defKpi => {
        const matching = existingKPIs.find(k => k.name.toLowerCase().trim() === defKpi.name.toLowerCase().trim());
        if (matching) {
          return {
            ...defKpi,
            currentValue: typeof matching.currentValue === 'number' ? matching.currentValue : 3,
            targetValue: matching.targetValue || 5,
          };
        }
        return defKpi;
      });

      setLocalKPIs(initializedKPIs);
      setLocalRewardPoints(
        ratingEmployee.rewardPoints !== undefined
          ? ratingEmployee.rewardPoints
          : 100,
      );
      setRatingGrade(ratingEmployee.grade || "B+");
      setReviewDateType((ratingEmployee as any).reviewDateType || "monthly");
      setRatingPoints(0);
    }
  }, [ratingEmployee]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("All");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("All");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>("All");

  const recalculateEmployeeMonthlyAverages = (employee: any) => {
    if (!employee.weeklyReviews || employee.weeklyReviews.length === 0) {
      return employee;
    }

    // Group weekly reviews by year and month
    const groups: Record<string, { year: string; month: string; reviews: any[] }> = {};
    employee.weeklyReviews.forEach((rev: any) => {
      const key = `${rev.year}-${rev.month}`;
      if (!groups[key]) {
        groups[key] = { year: String(rev.year), month: String(rev.month), reviews: [] };
      }
      groups[key].reviews.push(rev);
    });

    const updatedMonthlyReviews = Array.isArray(employee.monthlyReviews) ? [...employee.monthlyReviews] : [];
    let latestMonthlyScore = employee.performanceScore;
    let latestGrade = employee.grade;

    // Process each year-month group
    Object.keys(groups).forEach((key) => {
      const group = groups[key];
      const requiredWeeks = getWeeksInMonth(group.year, group.month);
      
      // Check if all weeks (e.g. 4 or 5) have been entered
      const uniqueWeeks = new Set(group.reviews.map((r: any) => String(r.week).toLowerCase().trim()));
      const isFinalWeekEntered = uniqueWeeks.size >= requiredWeeks || group.reviews.some((r: any) => {
        const wkStr = String(r.week).toLowerCase();
        return wkStr.includes(`week ${requiredWeeks}`) || wkStr.includes(`week${requiredWeeks}`);
      });

      if (isFinalWeekEntered) {
        // Cumulate all weekly scores for this month
        const totalMonthlyScore = group.reviews.reduce((sum, r) => sum + (r.performanceScore || 0), 0);
        const averageMonthlyScore = Math.round(totalMonthlyScore / group.reviews.length);

        // Retrieve rating points assigned for this month from gradeAuditTrail
        const ratingLogForMonth = employee.gradeAuditTrail?.find((log: any) => 
          log.type === "rating" && String(log.ratingYear) === String(group.year) && String(log.ratingMonth) === String(group.month)
        );
        const points = ratingLogForMonth ? (ratingLogForMonth.ratingPoints || 0) : 0;

        const appliedPerformanceScore = Math.min(100, averageMonthlyScore + points);
        const finalGrade = calculateGradeFromPerformance(appliedPerformanceScore);

        const existingIdx = updatedMonthlyReviews.findIndex(
          (m: any) => String(m.year) === String(group.year) && String(m.month) === String(group.month)
        );

        const monthlyRecord = {
          id: existingIdx >= 0 ? updatedMonthlyReviews[existingIdx].id : `monthly-${group.year}-${group.month}`,
          year: group.year,
          month: group.month,
          performanceScore: appliedPerformanceScore,
          grade: finalGrade,
          comments: `Cumulated monthly performance result across all ${group.reviews.length} weekly records for ${group.month} ${group.year}.`,
          dateCreated: new Date().toISOString().split("T")[0],
          roleType: group.reviews[0]?.roleType || "Standard",
          isCalculated: true,
          weeklyCount: group.reviews.length,
          totalWeeksInMonth: requiredWeeks
        };

        if (existingIdx >= 0) {
          updatedMonthlyReviews[existingIdx] = monthlyRecord;
        } else {
          updatedMonthlyReviews.push(monthlyRecord);
        }

        latestMonthlyScore = appliedPerformanceScore;
        latestGrade = finalGrade;
      }
    });

    return {
      ...employee,
      monthlyReviews: updatedMonthlyReviews,
      performanceScore: latestMonthlyScore,
      grade: latestGrade,
    };
  };

  const handleDeleteWeeklyReview = (employeeId: string, reviewIdOrIdx: any) => {
    if (!window.confirm("Are you sure you want to delete this weekly review?")) {
      return;
    }

    setEmployees((prevList) => {
      const updated = prevList.map((emp) => {
        if (emp.id !== employeeId) return emp;

        let updatedWeeklyReviews = emp.weeklyReviews || [];
        if (typeof reviewIdOrIdx === "string") {
          updatedWeeklyReviews = updatedWeeklyReviews.filter((r) => r.id !== reviewIdOrIdx);
        } else {
          updatedWeeklyReviews = updatedWeeklyReviews.filter((_, idx) => idx !== reviewIdOrIdx);
        }

        let updatedEmp = {
          ...emp,
          weeklyReviews: updatedWeeklyReviews,
        };

        // Recalculate monthly calculations
        updatedEmp = recalculateEmployeeMonthlyAverages(updatedEmp);

        if (viewEmployee && viewEmployee.id === emp.id) {
          setViewEmployee(updatedEmp);
        }
        return updatedEmp;
      });

      localStorage.setItem("company_employees_data", JSON.stringify(updated));
      localStorage.setItem("company_employees_kpi_state", JSON.stringify(updated));
      return updated;
    });

    showSuccess("Weekly review deleted successfully and monthly calculations recalculated.");
  };

  const handleEditWeeklyReview = (emp: any, rev: any) => {
    setEditingWeeklyReview({
      employeeId: emp.id,
      reviewId: rev.id,
      reviewIdx: emp.weeklyReviews.indexOf(rev),
    });
    setEditingWeeklyScore(rev.performanceScore || 80);
    setEditingWeeklyComments(rev.comments || "");
  };

  const handleSaveEditedWeeklyReview = () => {
    if (!editingWeeklyReview) return;

    setEmployees((prevList) => {
      const updated = prevList.map((emp) => {
        if (emp.id !== editingWeeklyReview.employeeId) return emp;

        const updatedWeeklyReviews = (emp.weeklyReviews || []).map((rev, idx) => {
          const isMatch = editingWeeklyReview.reviewId !== undefined 
            ? rev.id === editingWeeklyReview.reviewId 
            : idx === editingWeeklyReview.reviewIdx;

          if (isMatch) {
            return {
              ...rev,
              performanceScore: editingWeeklyScore,
              comments: editingWeeklyComments,
            };
          }
          return rev;
        });

        let updatedEmp = {
          ...emp,
          weeklyReviews: updatedWeeklyReviews,
        };

        // Recalculate monthly calculations
        updatedEmp = recalculateEmployeeMonthlyAverages(updatedEmp);

        if (viewEmployee && viewEmployee.id === emp.id) {
          setViewEmployee(updatedEmp);
        }
        return updatedEmp;
      });

      localStorage.setItem("company_employees_data", JSON.stringify(updated));
      localStorage.setItem("company_employees_kpi_state", JSON.stringify(updated));
      return updated;
    });

    showSuccess("Weekly review updated successfully and monthly calculations recalculated.");
    setEditingWeeklyReview(null);
  };

  // View Modal State
  const [viewEmployee, setViewEmployee] = useState<Employee | null>(null);
  const [adminExpandedPeriodKey, setAdminExpandedPeriodKey] = useState<string | null>("July 2026");

  // Admin / Team Lead Filter States for Employee History Page
  const [adminFilterPeriod, setAdminFilterPeriod] = useState<string>("All");
  const [adminFilterDateType, setAdminFilterDateType] = useState<"All" | "weekly" | "monthly">("All");
  const [adminFilterYear, setAdminFilterYear] = useState<string>("All");

  // Filter States for Rating (Performance) page
  const [ratingFilterYear, setRatingFilterYear] = useState<string>("All");
  const [ratingFilterMonth, setRatingFilterMonth] = useState<string>("All");
  const [ratingFilterQuarter, setRatingFilterQuarter] = useState<string>("All");
  const [ratingFilterWeek, setRatingFilterWeek] = useState<string>("All");

  const adminHistoricalPeriods = useMemo(() => {
    if (!viewEmployee) return [];
    const periods: Record<string, { year: string, month: string, weeks: any[], monthlyReview?: any }> = {};

    // Add weekly reviews
    if (Array.isArray(viewEmployee.weeklyReviews)) {
      viewEmployee.weeklyReviews.forEach((rev) => {
        const key = `${rev.month} ${rev.year}`;
        if (!periods[key]) {
          periods[key] = { year: String(rev.year), month: String(rev.month), weeks: [] };
        }
        periods[key].weeks.push(rev);
      });
    }

    // Add monthly reviews
    if (Array.isArray(viewEmployee.monthlyReviews)) {
      viewEmployee.monthlyReviews.forEach((rev) => {
        const key = `${rev.month} ${rev.year}`;
        if (!periods[key]) {
          periods[key] = { year: String(rev.year), month: String(rev.month), weeks: [] };
        }
        periods[key].monthlyReview = rev;
      });
    }

    // Add rating audits
    if (Array.isArray(viewEmployee.gradeAuditTrail)) {
      viewEmployee.gradeAuditTrail.forEach((audit: any) => {
        if (audit.type === "rating") {
          let year = audit.ratingYear;
          let month = audit.ratingMonth;
          if (!year || !month) {
            if (audit.dateOfChange) {
              const [y, m] = audit.dateOfChange.split("-");
              const months = [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
              ];
              year = y;
              month = months[parseInt(m, 10) - 1];
            }
          }
          if (year && month) {
            const key = `${month} ${year}`;
            if (!periods[key]) {
              periods[key] = { year: String(year), month: String(month), weeks: [] };
            }
          }
        }
      });
    }

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    if (Object.keys(periods).length === 0) {
      // Fallback mock history for demo
      return [
        {
          key: "July 2026",
          year: "2026",
          month: "July",
          weeks: [
            { id: "w1", week: "Week 1", performanceScore: 95, comments: "Outstanding SLA speed and high CSAT score.", dateCreated: "2026-07-05", roleType: "Standard", reviewer: "Admin" },
            { id: "w2", week: "Week 2", performanceScore: 90, comments: "Consistently met team goal targets.", dateCreated: "2026-07-12", roleType: "Standard", reviewer: "Admin" },
          ],
          monthlyReview: null
        },
        {
          key: "June 2026",
          year: "2026",
          month: "June",
          weeks: [],
          monthlyReview: { id: "m1", year: "2026", month: "June", performanceScore: 88, comments: "Solid overall monthly standing. Keep it up!", dateCreated: "2026-06-30", roleType: "Standard", reviewer: "Admin" }
        }
      ];
    }

    return Object.keys(periods).map((key) => {
      const p = periods[key];
      p.weeks.sort((a, b) => {
        const wa = String(a.week).toLowerCase();
        const wb = String(b.week).toLowerCase();
        return wa.localeCompare(wb);
      });
      return {
        key,
        year: p.year,
        month: p.month,
        weeks: p.weeks,
        monthlyReview: p.monthlyReview,
      };
    }).sort((a, b) => {
      if (a.year !== b.year) {
        return b.year.localeCompare(a.year);
      }
      const ma = monthNames.indexOf(a.month);
      const mb = monthNames.indexOf(b.month);
      return mb - ma;
    });
  }, [viewEmployee]);

  const availableYears = useMemo(() => {
    const years = adminHistoricalPeriods.map((p) => p.year);
    return [...new Set(years)].sort((a, b) => b.localeCompare(a));
  }, [adminHistoricalPeriods]);

  const filteredAdminHistoricalPeriods = useMemo(() => {
    let result = adminHistoricalPeriods;

    if (adminFilterPeriod !== "All") {
      result = result.filter((p) => p.key === adminFilterPeriod);
    }

    if (adminFilterYear !== "All") {
      result = result.filter((p) => String(p.year) === adminFilterYear);
    }

    if (adminFilterDateType === "weekly") {
      // Keep periods that have weeks
      result = result.filter((p) => p.weeks.length > 0);
    } else if (adminFilterDateType === "monthly") {
      // Keep periods that have monthly review OR matching rating audit
      result = result.filter((p) => {
        const hasMonthly = !!p.monthlyReview;
        const hasRating = !!viewEmployee?.gradeAuditTrail?.some((audit: any) => {
          if (audit.type !== "rating") return false;
          let year = audit.ratingYear;
          let month = audit.ratingMonth;
          if (!year || !month) {
            if (audit.dateOfChange) {
              const [y, m] = audit.dateOfChange.split("-");
              const months = [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
              ];
              year = y;
              month = months[parseInt(m, 10) - 1];
            }
          }
          return String(year) === String(p.year) && String(month).toLowerCase() === String(p.month).toLowerCase();
        });
        return hasMonthly || hasRating;
      });
    }

    return result;
  }, [adminHistoricalPeriods, adminFilterPeriod, adminFilterYear, adminFilterDateType, viewEmployee]);

  const filteredMetricsForViewEmployee = useMemo(() => {
    if (!viewEmployee) return { score: 80, avgScore: 80, grade: "B+" as const, rewardPoints: 0, netPoints: 0 };

    let totalScoreSum = 0;
    let totalScoreCount = 0;

    filteredAdminHistoricalPeriods.forEach((p) => {
      p.weeks.forEach((w) => {
        totalScoreSum += (w.performanceScore || 0);
        totalScoreCount++;
      });
      if (p.monthlyReview) {
        totalScoreSum += (p.monthlyReview.performanceScore || 0);
        totalScoreCount++;
      }
    });

    const finalScore = totalScoreCount > 0 ? Math.round(totalScoreSum / totalScoreCount) : (viewEmployee.performanceScore || 80);

    let finalGrade: "A+" | "A" | "B+" | "B" | "C" | "D" | "F" = "B";
    if (finalScore >= 95) finalGrade = "A+";
    else if (finalScore >= 90) finalGrade = "A";
    else if (finalScore >= 80) finalGrade = "B+";
    else if (finalScore >= 70) finalGrade = "B";
    else if (finalScore >= 60) finalGrade = "C";
    else if (finalScore >= 50) finalGrade = "D";
    else finalGrade = "F";

    let filteredRewardPoints = 0;
    const savedRewards = localStorage.getItem('company_rewards_history_list');
    if (savedRewards) {
      try {
        const list = JSON.parse(savedRewards) as any[];
        list.forEach((r) => {
          if (String(r.employee_id) !== String(viewEmployee.id)) return;

          let isPeriodMatch = true;
          if (adminFilterPeriod !== "All" && r.period_id) {
            const pid = r.period_id.toLowerCase();
            if (!pid.includes(adminFilterPeriod.toLowerCase())) {
              isPeriodMatch = false;
            }
          }
          if (adminFilterYear !== "All" && r.created_at) {
            const date = new Date(r.created_at);
            if (!isNaN(date.getTime()) && String(date.getFullYear()) !== adminFilterYear) {
              isPeriodMatch = false;
            }
          }
          if (isPeriodMatch) {
            const pointsVal = Number(r.points || 0);
            filteredRewardPoints += pointsVal;
          }
        });
      } catch (e) {
        console.error(e);
      }
    } else {
      filteredRewardPoints = viewEmployee.rewardPoints || 0;
    }

    const netPoints = finalScore + filteredRewardPoints;

    return {
      score: viewEmployee.performanceScore || 80,
      avgScore: finalScore,
      grade: finalGrade,
      rewardPoints: filteredRewardPoints,
      netPoints: netPoints,
    };
  }, [viewEmployee, filteredAdminHistoricalPeriods, adminFilterPeriod, adminFilterYear]);

  const getAdminPeriodSummary = useCallback((period: { year: string, month: string, weeks: any[], monthlyReview?: any }) => {
    let baseTotalScore = 0;
    let baseAvgScore = 0;

    const weeksToUse = adminFilterDateType === "monthly" ? [] : period.weeks;
    const monthlyReviewToUse = adminFilterDateType === "weekly" ? undefined : period.monthlyReview;

    if (weeksToUse.length > 0) {
      baseTotalScore = weeksToUse.reduce((sum, w) => sum + (w.performanceScore || 0), 0);
      baseAvgScore = Math.round(baseTotalScore / weeksToUse.length);
    } else if (monthlyReviewToUse) {
      baseAvgScore = monthlyReviewToUse.performanceScore || 0;
      baseTotalScore = baseAvgScore;
    }

    let rewards = 0;
    let penalties = 0;
    
    const savedRewards = localStorage.getItem('company_rewards_history_list');
    if (savedRewards && viewEmployee) {
      try {
        const list = JSON.parse(savedRewards) as any[];
        const empRecords = list.filter(r => String(r.employee_id) === String(viewEmployee.id));
        
        empRecords.forEach(rec => {
          let isMatch = false;
          
          if (rec.period_id) {
            const pid = rec.period_id.toLowerCase();
            if (pid.includes(period.month.toLowerCase()) && pid.includes(period.year)) {
              isMatch = true;
            }
          }
          
          if (rec.created_at) {
            const date = new Date(rec.created_at);
            if (!isNaN(date.getTime())) {
              const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
              if (String(date.getFullYear()) === period.year && months[date.getMonth()].toLowerCase() === period.month.toLowerCase()) {
                isMatch = true;
              }
            }
          }

          if (isMatch) {
            const typeLower = String(rec.type || rec.reward_type || "").toLowerCase();
            const points = Math.abs(Number(rec.points || 0));
            if (typeLower.includes("penalty") || typeLower.includes("demerit") || typeLower.includes("deduction") || Number(rec.points || 0) < 0) {
              penalties += points;
            } else {
              rewards += points;
            }
          }
        });
      } catch (e) {
        console.error(e);
      }
    }

    // When penalties are added, the net point or total score must be reduced.
    // When reward is added, only the net point increases.
    let monthlyRatingPoints = 0;
    if (viewEmployee && Array.isArray(viewEmployee.gradeAuditTrail)) {
      const match = viewEmployee.gradeAuditTrail.find((audit: any) => {
        if (audit.type !== "rating") return false;
        let year = audit.ratingYear;
        let month = audit.ratingMonth;
        if (!year || !month) {
          if (audit.dateOfChange) {
            const [y, m] = audit.dateOfChange.split("-");
            const months = [
              "January", "February", "March", "April", "May", "June",
              "July", "August", "September", "October", "November", "December"
            ];
            year = y;
            month = months[parseInt(m, 10) - 1];
          }
        }
        return String(year) === String(period.year) && String(month).toLowerCase() === String(period.month).toLowerCase();
      });
      if (match) {
        monthlyRatingPoints = Number(match.ratingPoints || 0);
      }
    }

    const totalScore = Math.min(100, Math.max(0, baseTotalScore - penalties + monthlyRatingPoints));
    const avgScore = Math.min(100, Math.max(0, baseAvgScore - penalties + monthlyRatingPoints));

    let grade: "A+" | "A" | "B+" | "B" | "C" | "D" | "F" = "B";
    if (avgScore >= 95) grade = "A+";
    else if (avgScore >= 90) grade = "A";
    else if (avgScore >= 80) grade = "B+";
    else if (avgScore >= 70) grade = "B";
    else if (avgScore >= 60) grade = "C";
    else if (avgScore >= 50) grade = "D";
    else grade = "F";

    const netPoints = rewards - penalties + monthlyRatingPoints;

    return {
      totalScore,
      avgScore,
      grade,
      rewards,
      penalties,
      netPoints
    };
  }, [viewEmployee, adminFilterDateType]);

  const [modalTab, setModalTab] = useState<
    "biodata" | "guarantors" | "leave" | "documents" | "payroll" | "grades_audit"
  >("biodata");
  const [openedFromPerformance, setOpenedFromPerformance] = useState(false);
  const [auditTrailFilter, setAuditTrailFilter] = useState<"score" | "points">("score");

  const filteredAuditTrail = useMemo(() => {
    if (!viewEmployee || !viewEmployee.gradeAuditTrail) return [];
    return viewEmployee.gradeAuditTrail.filter((entry) => {
      const isPointsOnly = (entry.newGrade || "").toLowerCase().includes("points:") || 
                           (entry.previousGrade || "").toLowerCase().includes("points:") ||
                           entry.policyResponsible === "Reward Achievement";
      const isPerformanceReview = entry.policyResponsible === "Performance Review" || 
                                  entry.type === "rating" ||
                                  (entry as any).ratingPoints > 0 ||
                                  (entry as any).rewardPoints > 0;

      if (auditTrailFilter === "points") {
        return isPointsOnly || isPerformanceReview;
      } else {
        return !isPointsOnly || isPerformanceReview;
      }
    });
  }, [viewEmployee, auditTrailFilter]);

  const [selectedViolationCategory, setSelectedViolationCategory] =
    useState<string>("Repeated Lateness");
  const [policyApprover, setPolicyApprover] = useState<string>("HR Manager");
  const [violationNotes, setViolationNotes] = useState<string>("");

  const [gradesActionTab, setGradesActionTab] = useState<"penalty" | "reward">("penalty");
  const [selectedRewardCategory, setSelectedRewardCategory] = useState<string>("Performance Excellence");
  const [rewardApprover, setRewardApprover] = useState<string>("HR Manager");
  const [rewardPointsToAward, setRewardPointsToAward] = useState<number>(20);
  const [rewardNotes, setRewardNotes] = useState<string>("");

  const [leaderboardScope, setLeaderboardScope] = useState<
    "company" | "department"
  >("company");
  const [leaderboardSearch, setLeaderboardSearch] = useState("");
  const [leaderboardDeptFilterState, setLeaderboardDeptFilterState] =
    useState<string>("All");

  // Update Points Modal State
  const [isUpdatePointsModalOpen, setIsUpdatePointsModalOpen] = useState(false);
  const [updatePointsFormUser, setUpdatePointsFormUser] = useState<string>("");
  const [updatePointsFormType, setUpdatePointsFormType] =
    useState<string>("performance");
  const [updatePointsFormVal, setUpdatePointsFormVal] = useState<string>("");
  const [updatePointsFormReason, setUpdatePointsFormReason] =
    useState<string>("");
  const [updatePointsFormScreenshot, setUpdatePointsFormScreenshot] = useState<
    string | null
  >(null);
  const [selectedDefinedPolicy, setSelectedDefinedPolicy] =
    useState<string>("custom");
  const [conductActualPoints, setConductActualPoints] = useState<
    Record<string, number>
  >({});

  const [selectedRoleType, setSelectedRoleType] =
    useState<string>("Engineering");

  // Staff Performance Engine workspace navigation & UI decluttering state
  const [engineTab, setEngineTab] = useState<"weekly" | "kpis" | "conduct">("weekly");
  const [expandedWeeklyId, setExpandedWeeklyId] = useState<string | null>(null);

  // Weekly review state variables
  const [reviewType, setReviewType] = useState<"weekly" | "monthly">("weekly");
  const [weeklyYear, setWeeklyYear] = useState<string>(new Date().getFullYear().toString());
  const [weeklyMonth, setWeeklyMonth] = useState<string>("July");
  const [weeklyWeek, setWeeklyWeek] = useState<string>("Week 1");
  const [weeklyComments, setWeeklyComments] = useState<string>("");
  const [editingWeeklyRecordId, setEditingWeeklyRecordId] = useState<string | null>(null);

  const handleLoadWeeklyRecordForEdit = (rev: any) => {
    setEditingWeeklyRecordId(rev.id || null);
    if (rev.year) setWeeklyYear(String(rev.year));
    if (rev.month) setWeeklyMonth(String(rev.month));
    if (rev.week) setWeeklyWeek(String(rev.week));
    if (rev.comments) setWeeklyComments(rev.comments);
    if (rev.conductPoints) setConductActualPoints(rev.conductPoints);

    if (rev.inputs) {
      const inp = rev.inputs;
      if (selectedRoleType === "Tech Support") {
        if (inp.slaTickets !== undefined) setSlaTickets(Number(inp.slaTickets));
        if (inp.totalTickets !== undefined) setTotalTickets(Number(inp.totalTickets));
        if (inp.targetResponseTime !== undefined) setTargetResponseTime(Number(inp.targetResponseTime));
        if (inp.actualResponseTime !== undefined) setActualResponseTime(Number(inp.actualResponseTime));
        if (inp.resolvedTickets !== undefined) setResolvedTickets(Number(inp.resolvedTickets));
        if (inp.assignedTickets !== undefined) setAssignedTickets(Number(inp.assignedTickets));
        if (inp.customerSatisfaction !== undefined) setCustomerSatisfaction(Number(inp.customerSatisfaction));
        if (inp.targetReopenRate !== undefined) setTargetReopenRate(Number(inp.targetReopenRate));
        if (inp.actualReopenRate !== undefined) setActualReopenRate(Number(inp.actualReopenRate));
      } else if (selectedRoleType === "Marketing") {
        if (inp.leadsGeneratedTarget !== undefined) setLeadsGeneratedTarget(Number(inp.leadsGeneratedTarget));
        if (inp.leadsGeneratedActual !== undefined) setLeadsGeneratedActual(Number(inp.leadsGeneratedActual));
        if (inp.costPerLeadTarget !== undefined) setCostPerLeadTarget(Number(inp.costPerLeadTarget));
        if (inp.costPerLeadActual !== undefined) setCostPerLeadActual(Number(inp.costPerLeadActual));
        if (inp.qualifiedLeadRateTarget !== undefined) setQualifiedLeadRateTarget(Number(inp.qualifiedLeadRateTarget));
        if (inp.qualifiedLeadRateActual !== undefined) setQualifiedLeadRateActual(Number(inp.qualifiedLeadRateActual));
        if (inp.campaignConversionTarget !== undefined) setCampaignConversionTarget(Number(inp.campaignConversionTarget));
        if (inp.campaignConversionActual !== undefined) setCampaignConversionActual(Number(inp.campaignConversionActual));
      } else if (selectedRoleType === "Sales") {
        if (inp.revenueTarget !== undefined) setRevenueTarget(Number(inp.revenueTarget));
        if (inp.revenueActual !== undefined) setRevenueActual(Number(inp.revenueActual));
        if (inp.dealsTarget !== undefined) setDealsTarget(Number(inp.dealsTarget));
        if (inp.dealsActual !== undefined) setDealsActual(Number(inp.dealsActual));
        if (inp.conversionTarget !== undefined) setConversionTarget(Number(inp.conversionTarget));
        if (inp.conversionActual !== undefined) setConversionActual(Number(inp.conversionActual));
        if (inp.collectionsTarget !== undefined) setCollectionsTarget(Number(inp.collectionsTarget));
        if (inp.collectionsActual !== undefined) setCollectionsActual(Number(inp.collectionsActual));
      } else if (selectedRoleType === "Customer Success") {
        if (inp.renewalTarget !== undefined) setRenewalTarget(Number(inp.renewalTarget));
        if (inp.renewalActual !== undefined) setRenewalActual(Number(inp.renewalActual));
        if (inp.retentionActual !== undefined) setRetentionActual(Number(inp.retentionActual));
        if (inp.expansionTarget !== undefined) setExpansionTarget(Number(inp.expansionTarget));
        if (inp.expansionActual !== undefined) setExpansionActual(Number(inp.expansionActual));
        if (inp.healthActual !== undefined) setHealthActual(Number(inp.healthActual));
        if (inp.adoptionActual !== undefined) setAdoptionActual(Number(inp.adoptionActual));
      } else if (selectedRoleType === "Operations") {
        if (inp.fulfillmentRate !== undefined) setFulfillmentRate(Number(inp.fulfillmentRate));
        if (inp.accuracyRate !== undefined) setAccuracyRate(Number(inp.accuracyRate));
        if (inp.actualSavings !== undefined) setActualSavings(Number(inp.actualSavings));
        if (inp.targetSavings !== undefined) setTargetSavings(Number(inp.targetSavings));
        if (inp.targetVariance !== undefined) setTargetVariance(Number(inp.targetVariance));
        if (inp.actualVariance !== undefined) setActualVariance(Number(inp.actualVariance));
        if (inp.complianceDeductions !== undefined) setComplianceDeductions(Number(inp.complianceDeductions));
      } else if (selectedRoleType === "Manager") {
        if (inp.teamTarget !== undefined) setManagerTeamTarget(Number(inp.teamTarget));
        if (inp.actualTeamResult !== undefined) setManagerActualTeamResult(Number(inp.actualTeamResult));
        if (inp.qualityPercent !== undefined) setManagerQualityPercent(Number(inp.qualityPercent));
        if (inp.compliancePercent !== undefined) setManagerCompliancePercent(Number(inp.compliancePercent));
        if (inp.reportingRating !== undefined) setManagerReportingRating(Number(inp.reportingRating));
        if (inp.peopleManagementRating !== undefined) setManagerPeopleManagementRating(Number(inp.peopleManagementRating));
        if (inp.leadershipRating !== undefined) setManagerLeadershipRating(Number(inp.leadershipRating));
      }
    }
  };

  useEffect(() => {
    const numWeeks = getWeeksInMonth(weeklyYear, weeklyMonth);
    const currentWeekNum = parseInt(weeklyWeek.replace("Week ", ""), 10) || 1;
    if (currentWeekNum > numWeeks) {
      setWeeklyWeek(`Week ${numWeeks}`);
    }
  }, [weeklyYear, weeklyMonth]);

  useEffect(() => {
    if (autoOpenReviewModal && employees.length > 0) {
      setUpdatePointsFormUser("");
      setUpdatePointsFormType("performance");
      setUpdatePointsFormVal("");
      setUpdatePointsFormReason("");
      setUpdatePointsFormScreenshot(null);
      setSelectedDefinedPolicy("custom");
      setReviewType("weekly");
      setEngineTab("kpis");
      setIsUpdatePointsModalOpen(true);
    }
  }, [autoOpenReviewModal, employees]);

  // Tech Support states and default scores
  const [slaTickets, setSlaTickets] = useState<number>(0);
  const [totalTickets, setTotalTickets] = useState<number>(0);
  const [targetResponseTime, setTargetResponseTime] = useState<number>(0);
  const [actualResponseTime, setActualResponseTime] = useState<number>(0);
  const [resolvedTickets, setResolvedTickets] = useState<number>(0);
  const [assignedTickets, setAssignedTickets] = useState<number>(0);
  const [customerSatisfaction, setCustomerSatisfaction] = useState<number>(0);
  const [targetReopenRate, setTargetReopenRate] = useState<number>(0);
  const [actualReopenRate, setActualReopenRate] = useState<number>(0);

  const [slaWeight, setSlaWeight] = useState<number>(20);
  const [firstResponseWeight, setFirstResponseWeight] = useState<number>(15);
  const [resolutionWeight, setResolutionWeight] = useState<number>(15);
  const [csatWeight, setCsatWeight] = useState<number>(20);
  const [reopenWeight, setReopenWeight] = useState<number>(10);

  // Marketing states and default scores
  const [leadsGeneratedTarget, setLeadsGeneratedTarget] =
    useState<number>(0);
  const [leadsGeneratedActual, setLeadsGeneratedActual] = useState<number>(0);
  const [leadsGeneratedWeight, setLeadsGeneratedWeight] = useState<number>(25);

  const [costPerLeadTarget, setCostPerLeadTarget] = useState<number>(0);
  const [costPerLeadActual, setCostPerLeadActual] = useState<number>(0);
  const [costPerLeadWeight, setCostPerLeadWeight] = useState<number>(20);

  const [qualifiedLeadRateTarget, setQualifiedLeadRateTarget] =
    useState<number>(0);
  const [qualifiedLeadRateActual, setQualifiedLeadRateActual] =
    useState<number>(0);
  const [qualifiedLeadRateWeight, setQualifiedLeadRateWeight] =
    useState<number>(20);

  const [campaignConversionTarget, setCampaignConversionTarget] =
    useState<number>(0);
  const [campaignConversionActual, setCampaignConversionActual] =
    useState<number>(0);
  const [campaignConversionWeight, setCampaignConversionWeight] =
    useState<number>(15);

  // Sales states and default scores
  const [revenueTarget, setRevenueTarget] = useState<number>(0);
  const [revenueActual, setRevenueActual] = useState<number>(0);
  const [revenueWeight, setRevenueWeight] = useState<number>(35);

  const [dealsTarget, setDealsTarget] = useState<number>(0);
  const [dealsActual, setDealsActual] = useState<number>(0);
  const [dealsWeight, setDealsWeight] = useState<number>(15);

  const [conversionTarget, setConversionTarget] = useState<number>(0);
  const [conversionActual, setConversionActual] = useState<number>(0);
  const [conversionWeight, setConversionWeight] = useState<number>(15);

  const [collectionsTarget, setCollectionsTarget] = useState<number>(0);
  const [collectionsActual, setCollectionsActual] = useState<number>(0);
  const [collectionsWeight, setCollectionsWeight] = useState<number>(15);

  // Customer Success states and default scores
  const [renewalTarget, setRenewalTarget] = useState<number>(0);
  const [renewalActual, setRenewalActual] = useState<number>(0);
  const [renewalWeight, setRenewalWeight] = useState<number>(25);

  const [retentionActual, setRetentionActual] = useState<number>(0);
  const [retentionWeight, setRetentionWeight] = useState<number>(20);

  const [expansionTarget, setExpansionTarget] = useState<number>(0);
  const [expansionActual, setExpansionActual] = useState<number>(0);
  const [expansionWeight, setExpansionWeight] = useState<number>(15);

  const [healthActual, setHealthActual] = useState<number>(0);
  const [healthWeight, setHealthWeight] = useState<number>(10);

  const [adoptionActual, setAdoptionActual] = useState<number>(0);
  const [adoptionWeight, setAdoptionWeight] = useState<number>(10);

  // Operations states and default scores
  const [fulfillmentRate, setFulfillmentRate] = useState<number>(0);
  const [fulfillmentWeight, setFulfillmentWeight] = useState<number>(20);

  const [accuracyRate, setAccuracyRate] = useState<number>(0);
  const [accuracyWeight, setAccuracyWeight] = useState<number>(20);

  const [actualSavings, setActualSavings] = useState<number>(0);
  const [targetSavings, setTargetSavings] = useState<number>(0);
  const [savingsWeight, setSavingsWeight] = useState<number>(15);

  const [targetVariance, setTargetVariance] = useState<number>(0);
  const [actualVariance, setActualVariance] = useState<number>(0);
  const [varianceWeight, setVarianceWeight] = useState<number>(15);

  const [complianceDeductions, setComplianceDeductions] = useState<number>(0);
  const [complianceWeight, setComplianceWeight] = useState<number>(10);

  // Manager / Team Lead scoring inputs
  const [managerTeamTarget, setManagerTeamTarget] = useState<number>(0);
  const [managerActualTeamResult, setManagerActualTeamResult] = useState<number>(0);
  const [managerQualityPercent, setManagerQualityPercent] = useState<number>(0);
  const [managerCompliancePercent, setManagerCompliancePercent] = useState<number>(0);
  const [managerReportingRating, setManagerReportingRating] = useState<number>(0);
  const [managerPeopleManagementRating, setManagerPeopleManagementRating] = useState<number>(0);
  const [managerLeadershipRating, setManagerLeadershipRating] = useState<number>(0);

  const [scorecardEmployee, setScorecardEmployee] = useState<Employee | null>(
    null,
  );

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddPolicyModalOpen, setIsAddPolicyModalOpen] = useState(false);
  const [isAddGradeModalOpen, setIsAddGradeModalOpen] = useState(false);
  const [isSetQuarterModalOpen, setIsSetQuarterModalOpen] = useState(false);
  const [isUploadPolicyOpen, setIsUploadPolicyOpen] = useState(false);
  const [uploadPolicyTab, setUploadPolicyTab] = useState<"manual" | "file">(
    "manual",
  );
  const [uploadPolicyRows, setUploadPolicyRows] = useState<number[]>([1]);
  const [newPolicy, setNewPolicy] = useState({
    name: "",
    description: "",
    impact: "",
  });
  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    department: "Sales",
    country: "Nigeria",
    state: "",
    city: "",
    gender: "Male",
    maritalStatus: "Single",
    dateOfBirth: "",
    hireDate: new Date().toISOString().split("T")[0],
    status: "Active",
    salary: 0,
    currency: "NGN",
    performanceScore: 100,
    employeeType: "Full-Time",
  });

  const [departments, setDepartments] = useState<string[]>([
    "Sales",
    "Engineering",
    "Customer Experience",
    "Human Resources",
    "HR",
    "Customer Support",
    "Finance",
  ]);
  const [isAddDeptModalOpen, setIsAddDeptModalOpen] = useState(false);
  const [newDeptFormName, setNewDeptFormName] = useState("");
  const [isAddingNewDept, setIsAddingNewDept] = useState(false);
  const [newDeptName, setNewDeptName] = useState("");

  const [isAddingGuarantor, setIsAddingGuarantor] = useState(false);
  const [guarantorForm, setGuarantorForm] = useState<Guarantor>({
    name: "",
    phone: "",
    email: "",
    relationship: "Uncle",
    address: "",
    verified: false,
  });

  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [docForm, setDocForm] = useState<{
    type:
      | "ID Card"
      | "Degree Certificate"
      | "Resume"
      | "Offer Letter"
      | "Other";
    name: string;
  }>({
    type: "ID Card",
    name: "",
  });

  const [isEditingBank, setIsEditingBank] = useState(false);

  const resetWeeklyInputsAndLogs = () => {
    setSlaTickets(0);
    setTotalTickets(0);
    setTargetResponseTime(0);
    setActualResponseTime(0);
    setResolvedTickets(0);
    setAssignedTickets(0);
    setCustomerSatisfaction(0);
    setTargetReopenRate(0);
    setActualReopenRate(0);

    setLeadsGeneratedTarget(0);
    setLeadsGeneratedActual(0);
    setCostPerLeadTarget(0);
    setCostPerLeadActual(0);
    setQualifiedLeadRateTarget(0);
    setQualifiedLeadRateActual(0);
    setCampaignConversionTarget(0);
    setCampaignConversionActual(0);

    setRevenueTarget(0);
    setRevenueActual(0);
    setDealsTarget(0);
    setDealsActual(0);
    setConversionTarget(0);
    setConversionActual(0);
    setCollectionsTarget(0);
    setCollectionsActual(0);

    setRenewalTarget(0);
    setRenewalActual(0);
    setRetentionActual(0);
    setExpansionTarget(0);
    setExpansionActual(0);
    setHealthActual(0);
    setAdoptionActual(0);

    setFulfillmentRate(0);
    setAccuracyRate(0);
    setActualSavings(0);
    setTargetSavings(0);
    setTargetVariance(0);
    setActualVariance(0);
    setComplianceDeductions(0);

    setManagerTeamTarget(0);
    setManagerActualTeamResult(0);
    setManagerQualityPercent(0);
    setManagerCompliancePercent(0);
    setManagerReportingRating(0);
    setManagerPeopleManagementRating(0);
    setManagerLeadershipRating(0);

    setWeeklyComments("");
    setConductActualPoints({});
    setEditingWeeklyRecordId(null);
    setExpandedWeeklyId(null);
  };
  const [bankForm, setBankForm] = useState({
    bankName: "",
    accountNumber: "",
    bvn: "",
    taxId: "",
    pfaName: "",
    pensionNumber: "",
    salary: 0,
    currency: "NGN",
  });

  const handleAddEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = Date.now().toString();
    const employeeId = `EMP-${newEmployee.country?.substring(0, 2).toUpperCase() || "XX"}-${Math.floor(
      Math.random() * 1000,
    )
      .toString()
      .padStart(3, "0")}`;
    const employeeToAdd: Employee = {
      id,
      employeeId,
      ...(newEmployee as any),
      guarantors: [],
      documents: [],
      grade: "B+",
      rewardPoints: 100,
      leaderboardRank: "5th",
      gradeAuditTrail: [],
    };
    setEmployees((prev) => [...prev, employeeToAdd]);
    showSuccess(
      `Employee ${employeeToAdd.firstName} ${employeeToAdd.lastName} added successfully.`,
    );
    setIsAddModalOpen(false);
    setNewEmployee({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "",
      department: "Sales",
      country: "Nigeria",
      state: "",
      city: "",
      gender: "Male",
      maritalStatus: "Single",
      dateOfBirth: "",
      hireDate: new Date().toISOString().split("T")[0],
      status: "Active",
      salary: 0,
      currency: "NGN",
      performanceScore: 100,
    });
  };

  // Simulation State
  const simulatorRole = "admin";

  // Scoped Employees
  const scopedEmployees = useMemo(() => {
    let filtered = employees;

    // HR Managers and Admins can see employees across all departments.
    // Team Leads and designated managers can ONLY view and rate employees within their assigned department.
    const isAdminOrHr = userRole === "admin" || userRole === "hr";
    if (!isAdminOrHr) {
      const targetDept = departmentFilter || userDepartment;
      if (targetDept) {
        filtered = filtered.filter(
          (e) => e.department.toLowerCase() === targetDept.toLowerCase(),
        );
      } else {
        // Return empty if somehow no department is associated to a team lead, to fulfill safety constraint
        filtered = [];
      }
    } else if (departmentFilter && departmentFilter !== "All") {
      // Admin or HR choosing to filter by a specific department in their global view
      filtered = filtered.filter(
        (e) => e.department.toLowerCase() === departmentFilter.toLowerCase(),
      );
    }
    return filtered;
  }, [employees, departmentFilter, userDepartment, userRole]);

  // Derived Metrics
  const headCount = scopedEmployees.length;
  const activeCount = scopedEmployees.filter(
    (e) => e.status === "Active",
  ).length;
  const onLeaveCount = scopedEmployees.filter(
    (e) => e.status === "On Leave",
  ).length;

  // Gender Distribution
  const genderData = useMemo(() => {
    const counts = { Male: 0, Female: 0, Other: 0 };
    scopedEmployees.forEach((e) => {
      if (counts[e.gender] !== undefined) counts[e.gender]++;
    });
    return Object.entries(counts)
      .filter(([_, count]) => count > 0)
      .map(([name, value]) => ({ name, value }));
  }, [scopedEmployees]);

  // Country Distribution
  const countryData = useMemo(() => {
    const counts: Record<string, number> = {};
    scopedEmployees.forEach((e) => {
      counts[e.country] = (counts[e.country] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [scopedEmployees]);

  // Department Distribution
  const departmentData = useMemo(() => {
    const counts: Record<string, number> = {};
    scopedEmployees.forEach((e) => {
      counts[e.department] = (counts[e.department] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [scopedEmployees]);

  // Work Anniversaries (in the upcoming month - simplified)
  const upcomingAnniversaries = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    return scopedEmployees
      .filter((e) => {
        const hireDate = new Date(e.hireDate);
        return hireDate.getMonth() === currentMonth;
      })
      .sort(
        (a, b) =>
          new Date(a.hireDate).getDate() - new Date(b.hireDate).getDate(),
      );
  }, [scopedEmployees]);

  // Birthdays (in the upcoming month - simplified)
  const upcomingBirthdays = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    return scopedEmployees
      .filter((e) => {
        const dob = new Date(e.dateOfBirth);
        return dob.getMonth() === currentMonth;
      })
      .sort(
        (a, b) =>
          new Date(a.dateOfBirth).getDate() - new Date(b.dateOfBirth).getDate(),
      );
  }, [scopedEmployees]);

  const topEmployees = useMemo(() => {
    return [...scopedEmployees]
      .sort((a, b) => b.performanceScore - a.performanceScore)
      .slice(0, 5);
  }, [scopedEmployees]);

  const getEmployeeFilteredMetrics = useCallback((emp: Employee) => {
    let baseScores: number[] = [];
    
    if (emp.weeklyReviews && Array.isArray(emp.weeklyReviews)) {
      emp.weeklyReviews.forEach((rev: any) => {
        let matches = true;
        if (ratingFilterYear !== "All" && String(rev.year) !== ratingFilterYear) {
          matches = false;
        }
        if (ratingFilterMonth !== "All" && String(rev.month).toLowerCase() !== ratingFilterMonth.toLowerCase()) {
          matches = false;
        }
        if (ratingFilterQuarter !== "All") {
          const qMonths: Record<string, string[]> = {
            "q1": ["january", "february", "march"],
            "q2": ["april", "may", "june"],
            "q3": ["july", "august", "september"],
            "q4": ["october", "november", "december"]
          };
          const targetMonths = qMonths[ratingFilterQuarter.toLowerCase()] || [];
          if (!targetMonths.includes(String(rev.month).toLowerCase())) {
            matches = false;
          }
        }
        if (ratingFilterWeek !== "All" && String(rev.week).toLowerCase() !== ratingFilterWeek.toLowerCase()) {
          matches = false;
        }
        
        if (matches && rev.performanceScore !== undefined) {
          baseScores.push(rev.performanceScore);
        }
      });
    }

    let perfBalance = emp.performanceScore !== undefined ? emp.performanceScore : 80;
    if (baseScores.length > 0) {
      const sum = baseScores.reduce((s, val) => s + val, 0);
      perfBalance = Math.round(sum / baseScores.length);
    } else if (
      ratingFilterYear !== "All" ||
      ratingFilterMonth !== "All" ||
      ratingFilterQuarter !== "All" ||
      ratingFilterWeek !== "All"
    ) {
      if (emp.monthlyReviews && Array.isArray(emp.monthlyReviews)) {
        const match = emp.monthlyReviews.find((rev: any) => {
          let matches = true;
          if (ratingFilterYear !== "All" && String(rev.year) !== ratingFilterYear) {
            matches = false;
          }
          if (ratingFilterMonth !== "All" && String(rev.month).toLowerCase() !== ratingFilterMonth.toLowerCase()) {
            matches = false;
          }
          if (ratingFilterQuarter !== "All") {
            const qMonths: Record<string, string[]> = {
              "q1": ["january", "february", "march"],
              "q2": ["april", "may", "june"],
              "q3": ["july", "august", "september"],
              "q4": ["october", "november", "december"]
            };
            const targetMonths = qMonths[ratingFilterQuarter.toLowerCase()] || [];
            if (!targetMonths.includes(String(rev.month).toLowerCase())) {
              matches = false;
            }
          }
          return matches;
        });
        if (match && match.performanceScore !== undefined) {
          perfBalance = match.performanceScore;
        }
      }
    }

    let periodRatingPoints = 0;
    if (emp.gradeAuditTrail && Array.isArray(emp.gradeAuditTrail)) {
      emp.gradeAuditTrail.forEach((entry: any) => {
        if (entry.type !== "rating") return;
        
        let matches = true;
        if (ratingFilterYear !== "All" && entry.ratingYear && String(entry.ratingYear) !== ratingFilterYear) {
          matches = false;
        }
        if (ratingFilterMonth !== "All" && entry.ratingMonth && String(entry.ratingMonth).toLowerCase() !== ratingFilterMonth.toLowerCase()) {
          matches = false;
        }
        if (ratingFilterQuarter !== "All") {
          const qMonths: Record<string, string[]> = {
            "q1": ["january", "february", "march"],
            "q2": ["april", "may", "june"],
            "q3": ["july", "august", "september"],
            "q4": ["october", "november", "december"]
          };
          const targetMonths = qMonths[ratingFilterQuarter.toLowerCase()] || [];
          if (entry.ratingMonth && !targetMonths.includes(String(entry.ratingMonth).toLowerCase())) {
            matches = false;
          }
        }
        
        if (matches && entry.ratingPoints !== undefined) {
          periodRatingPoints += Number(entry.ratingPoints);
        }
      });
    }
    
    perfBalance = Math.min(100, perfBalance + periodRatingPoints);

    let empPoints = emp.rewardPoints !== undefined ? emp.rewardPoints : 100;
    if (
      ratingFilterYear !== "All" ||
      ratingFilterMonth !== "All" ||
      ratingFilterQuarter !== "All" ||
      ratingFilterWeek !== "All"
    ) {
      let periodRewardPoints = 0;
      let hasAuditRewards = false;
      
      if (emp.gradeAuditTrail && Array.isArray(emp.gradeAuditTrail)) {
        emp.gradeAuditTrail.forEach((entry: any) => {
          if (!entry.rewardPoints) return;
          
          let matches = true;
          if (ratingFilterYear !== "All") {
            if (entry.ratingYear) {
              if (String(entry.ratingYear) !== ratingFilterYear) matches = false;
            } else if (entry.dateOfChange) {
              const yr = new Date(entry.dateOfChange).getFullYear();
              if (String(yr) !== ratingFilterYear) matches = false;
            } else {
              matches = false;
            }
          }
          if (ratingFilterMonth !== "All") {
            if (entry.ratingMonth) {
              if (String(entry.ratingMonth).toLowerCase() !== ratingFilterMonth.toLowerCase()) matches = false;
            } else if (entry.dateOfChange) {
              const date = new Date(entry.dateOfChange);
              const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
              if (months[date.getMonth()].toLowerCase() !== ratingFilterMonth.toLowerCase()) matches = false;
            } else {
              matches = false;
            }
          }
          if (ratingFilterQuarter !== "All") {
            const qMonths: Record<string, string[]> = {
              "q1": ["january", "february", "march"],
              "q2": ["april", "may", "june"],
              "q3": ["july", "august", "september"],
              "q4": ["october", "november", "december"]
            };
            const targetMonths = qMonths[ratingFilterQuarter.toLowerCase()] || [];
            if (entry.ratingMonth) {
              if (!targetMonths.includes(String(entry.ratingMonth).toLowerCase())) matches = false;
            } else if (entry.dateOfChange) {
              const date = new Date(entry.dateOfChange);
              const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
              if (!targetMonths.includes(months[date.getMonth()].toLowerCase())) matches = false;
            } else {
              matches = false;
            }
          }
          
          if (matches) {
            periodRewardPoints += entry.rewardPoints;
            hasAuditRewards = true;
          }
        });
      }
      
      if (hasAuditRewards) {
        empPoints = periodRewardPoints;
      } else {
        empPoints = 0;
      }
    }

    const netBalance = perfBalance + empPoints;
    const empGrade = calculateGradeFromPerformance(perfBalance);

    return {
      perfBalance,
      empPoints,
      netBalance,
      empGrade
    };
  }, [ratingFilterYear, ratingFilterMonth, ratingFilterQuarter, ratingFilterWeek]);

  const filteredEmployees = useMemo(() => {
    return scopedEmployees.filter((e) => {
      const matchesSearch =
        (e.firstName + " " + e.lastName)
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        e.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCountry =
        selectedCountry === "All" || e.country === selectedCountry;
      const matchesRole =
        selectedRoleFilter === "All" ||
        (e.role || "").toLowerCase() === selectedRoleFilter.toLowerCase() ||
        (e.department || "").toLowerCase() === selectedRoleFilter.toLowerCase();
      const matchesDept =
        selectedDeptFilter === "All" ||
        (e.department || "").toLowerCase() === selectedDeptFilter.toLowerCase();
      return matchesSearch && matchesCountry && matchesRole && matchesDept;
    });
  }, [scopedEmployees, searchTerm, selectedCountry, selectedRoleFilter, selectedDeptFilter]);

  const netPointsForViewEmployee = useMemo(() => {
    if (!viewEmployee) return 0;
    const roleLower = (viewEmployee.role || "").toLowerCase();
    const deptLower = (viewEmployee.department || "").toLowerCase();
    const isEngineer = roleLower.includes("engineer") || deptLower.includes("engineering");
    const isCallAgent = roleLower.includes("support representative") || roleLower.includes("call agent");

    let perfScore = 80;
    if (isCallAgent) {
      perfScore = 83.1;
    } else if (roleLower.includes("support") || deptLower.includes("support") || roleLower.includes("tech")) {
      const inputs = viewEmployee.techSupportInputs || {
        slaTickets: 142,
        totalTickets: 150,
        targetResponseTime: 15,
        actualResponseTime: 12,
        resolvedTickets: 140,
        assignedTickets: 150,
        customerSatisfaction: 94,
        targetReopenRate: 2.0,
        actualReopenRate: 1.8,
        slaWeight: 20,
        firstResponseWeight: 15,
        resolutionWeight: 15,
        csatWeight: 20,
        reopenWeight: 10
      };
      const computedSla = inputs.totalTickets > 0 ? (inputs.slaTickets / inputs.totalTickets) * inputs.slaWeight : 0;
      const computedResp = inputs.actualResponseTime > 0 ? (inputs.targetResponseTime / inputs.actualResponseTime) * inputs.firstResponseWeight : 0;
      const computedRes = inputs.assignedTickets > 0 ? (inputs.resolvedTickets / inputs.assignedTickets) * inputs.resolutionWeight : 0;
      const computedCsat = (inputs.customerSatisfaction / 100) * inputs.csatWeight;
      const computedReopen = inputs.actualReopenRate > 0 ? (inputs.targetReopenRate / inputs.actualReopenRate) * inputs.reopenWeight : 0;
      const roleScore = Math.min(80, computedSla + computedResp + computedRes + computedCsat + computedReopen);
      const cp = viewEmployee.techSupportConductPoints || {};
      const c1 = cp.cwc1 !== undefined ? cp.cwc1 : 4.5;
      const c2 = cp.cwc2 !== undefined ? cp.cwc2 : 4.8;
      const c3 = cp.cwc3 !== undefined ? cp.cwc3 : 4.9;
      const c4 = cp.cwc4 !== undefined ? cp.cwc4 : 4.6;
      perfScore = Math.min(100, Math.max(0, Math.round((roleScore + c1 + c2 + c3 + c4) * 10) / 10));
    } else if (deptLower.includes("success") || roleLower.includes("success")) {
      const inputs = viewEmployee.customerSuccessInputs || {
        renewalTarget: 50000,
        renewalActual: 48000,
        renewalWeight: 25,
        retentionActual: 92,
        retentionWeight: 20,
        expansionTarget: 100000,
        expansionActual: 85000,
        expansionWeight: 15,
        healthActual: 88,
        healthWeight: 10,
        adoptionActual: 85,
        adoptionWeight: 10
      };
      const expTarget = inputs.expansionTarget || 100000;
      const expActual = inputs.expansionActual || 85000;
      const computedRenewal = inputs.renewalTarget > 0 ? (inputs.renewalActual / inputs.renewalTarget) * inputs.renewalWeight : 0;
      const computedRetention = (inputs.retentionActual / 100) * inputs.retentionWeight;
      const computedExpansion = expTarget > 0 ? (expActual / expTarget) * inputs.expansionWeight : 0;
      const computedHealth = (inputs.healthActual / 100) * inputs.healthWeight;
      const computedAdoption = (inputs.adoptionActual / 100) * inputs.adoptionWeight;
      const roleScore = Math.min(80, computedRenewal + computedRetention + computedExpansion + computedHealth + computedAdoption);
      const cp = viewEmployee.customerSuccessConductPoints || {};
      const c1 = cp.cwc1 !== undefined ? cp.cwc1 : 4.5;
      const c2 = cp.cwc2 !== undefined ? cp.cwc2 : 4.8;
      const c3 = cp.cwc3 !== undefined ? cp.cwc3 : 4.9;
      const c4 = cp.cwc4 !== undefined ? cp.cwc4 : 4.6;
      perfScore = Math.min(100, Math.max(0, Math.round((roleScore + c1 + c2 + c3 + c4) * 10) / 10));
    } else if (deptLower.includes("marketing") || roleLower.includes("marketing") || deptLower.includes("growth") || roleLower.includes("growth") || roleLower.includes("brand") || roleLower.includes("content")) {
      const inputs = viewEmployee.marketingInputs || {
        leadsGeneratedTarget: 500,
        leadsGeneratedActual: 500,
        leadsGeneratedWeight: 25,
        costPerLeadTarget: 5.0,
        costPerLeadActual: 5.0,
        costPerLeadWeight: 20,
        qualifiedLeadRateTarget: 40,
        qualifiedLeadRateActual: 40,
        qualifiedLeadRateWeight: 20,
        campaignConversionTarget: 5.0,
        campaignConversionActual: 5.0,
        campaignConversionWeight: 15
      };
      const computedLeads = inputs.leadsGeneratedTarget > 0 ? (inputs.leadsGeneratedActual / inputs.leadsGeneratedTarget) * inputs.leadsGeneratedWeight : 0;
      const computedCost = inputs.costPerLeadActual > 0 ? (inputs.costPerLeadTarget / inputs.costPerLeadActual) * inputs.costPerLeadWeight : 0;
      const computedQual = inputs.qualifiedLeadRateTarget > 0 ? (inputs.qualifiedLeadRateActual / inputs.qualifiedLeadRateTarget) * inputs.qualifiedLeadRateWeight : 0;
      const computedConv = inputs.campaignConversionTarget > 0 ? (inputs.campaignConversionActual / inputs.campaignConversionTarget) * inputs.campaignConversionWeight : 0;
      const roleScore = Math.min(80, computedLeads + computedCost + computedQual + computedConv);
      const cp = viewEmployee.marketingConductPoints || {};
      const c1 = cp.cwc1 !== undefined ? cp.cwc1 : 4.5;
      const c2 = cp.cwc2 !== undefined ? cp.cwc2 : 4.8;
      const c3 = cp.cwc3 !== undefined ? cp.cwc3 : 4.9;
      const c4 = cp.cwc4 !== undefined ? cp.cwc4 : 4.6;
      perfScore = Math.min(100, Math.max(0, Math.round((roleScore + c1 + c2 + c3 + c4) * 10) / 10));
    } else if (viewEmployee.is_team_lead === true || roleLower.includes("manager") || roleLower.includes("lead") || roleLower.includes("head") || roleLower.includes("hr") || roleLower.includes("director")) {
      const inputs = viewEmployee.managerInputs || {
        teamTarget: 5000000,
        actualTeamResult: 4800000,
        qualityPercent: 96,
        compliancePercent: 98,
        reportingRating: 4.8,
        peopleManagementRating: 4.7,
        leadershipRating: 4.9
      };
      const computedTeamAchievement = inputs.teamTarget > 0 ? (inputs.actualTeamResult / inputs.teamTarget) * 30 : 0;
      const computedTeamQuality = (inputs.qualityPercent / 100) * 15;
      const computedTeamCompliance = (inputs.compliancePercent / 100) * 10;
      const computedReporting = (inputs.reportingRating / 5) * 10;
      const computedPeopleMgmt = (inputs.peopleManagementRating / 5) * 10;
      const computedLeadership = (inputs.leadershipRating / 5) * 5;
      const roleScore = Math.min(80, computedTeamAchievement + computedTeamQuality + computedTeamCompliance + computedReporting + computedPeopleMgmt + computedLeadership);
      const cp = viewEmployee.managerConductPoints || {};
      const c1 = cp.cwc1 !== undefined ? cp.cwc1 : 4.5;
      const c2 = cp.cwc2 !== undefined ? cp.cwc2 : 4.8;
      const c3 = cp.cwc3 !== undefined ? cp.cwc3 : 4.9;
      const c4 = cp.cwc4 !== undefined ? cp.cwc4 : 4.6;
      perfScore = Math.min(100, Math.max(0, Math.round((roleScore + c1 + c2 + c3 + c4) * 10) / 10));
    } else {
      perfScore = viewEmployee.kpis ? calculateEmployeePerformanceBalance(viewEmployee.kpis) : (viewEmployee.performanceScore !== undefined ? viewEmployee.performanceScore : 80);
    }

    const rewardScore = viewEmployee.rewardPoints !== undefined ? viewEmployee.rewardPoints : 100;
    const perfVal = isEngineer ? -20 : isCallAgent ? 94.2 : perfScore;
    const rewardVal = isEngineer ? 10 : rewardScore;
    return Math.round((perfVal + rewardVal) * 10) / 10;
  }, [viewEmployee]);

  return (
    <div className="p-6 animate-fade-in space-y-6 pb-20">
      {!viewEmployee ? (
        <>
          {/* Header section */}
      {!completelyHideTabs && (
        <div className="flex flex-col md:flex-row justify-start items-start md:items-center gap-4 border-b border-slate-200 pb-4">
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 shadow-inner overflow-x-auto w-full md:w-auto">
            {isTeamLeadRole ? (
              <>
                <button
                  onClick={() => setActiveTab("performance")}
                  className={`py-2 px-4 rounded-md text-sm font-bold transition-all whitespace-nowrap ${activeTab === "performance" ? "bg-white text-[#02275A]" : "text-slate-500 hover:text-slate-800"}`}
                >
                  <i className="fas fa-users mr-1"></i> Rating
                </button>
                <button
                  onClick={() => setActiveTab("policies")}
                  className={`py-2 px-4 rounded-md text-sm font-bold transition-all whitespace-nowrap ${activeTab === "policies" ? "bg-white text-[#02275A]" : "text-slate-500 hover:text-slate-800"}`}
                >
                  <i className="fas fa-file-contract mr-1"></i> Company Conduct
                </button>
                <button
                  onClick={() => setActiveTab("rewards")}
                  className={`py-2 px-4 rounded-md text-sm font-bold transition-all whitespace-nowrap ${activeTab === "rewards" ? "bg-white text-[#02275A]" : "text-slate-500 hover:text-slate-800"}`}
                >
                  <i className="fas fa-gift mr-1"></i> Reward & Recognition
                </button>
                <button
                  onClick={() => setActiveTab("leaderboard")}
                  className={`py-2 px-4 rounded-md text-sm font-bold transition-all whitespace-nowrap ${activeTab === "leaderboard" ? "bg-white text-[#02275A]" : "text-slate-500 hover:text-slate-800"}`}
                >
                  <i className="fas fa-trophy mr-1"></i> Leaderboard
                </button>
                <button
                  onClick={() => setActiveTab("upload")}
                  className={`py-2 px-4 rounded-md text-sm font-bold transition-all whitespace-nowrap ${activeTab === "upload" ? "bg-white text-[#02275A]" : "text-slate-500 hover:text-slate-800"}`}
                >
                  <i className="fas fa-cloud-upload-alt mr-1"></i> Bulk Upload
                </button>
              </>
            ) : (
              <>
                {!hideTabs && (
                  <>
                    <button
                      onClick={() => setActiveTab("dashboard")}
                      className={`py-2 px-4 rounded-md text-sm font-bold transition-all whitespace-nowrap ${activeTab === "dashboard" ? "bg-white text-[#02275A] shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                    >
                      <i className="fas fa-chart-pie mr-1"></i> Dashboard
                    </button>
                    <button
                      onClick={() => setActiveTab("directory")}
                      className={`py-2 px-4 rounded-md text-sm font-bold transition-all whitespace-nowrap ${activeTab === "directory" ? "bg-white text-[#02275A] shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                    >
                      <i className="fas fa-address-book mr-1"></i> Directory
                    </button>
                    <button
                      onClick={() => setActiveTab("leave_requests")}
                      className={`py-2 px-4 rounded-md text-sm font-bold transition-all whitespace-nowrap ${activeTab === "leave_requests" ? "bg-white text-[#02275A] shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                    >
                      <i className="fas fa-umbrella-beach mr-1"></i> Leave Requests
                    </button>
                  </>
                )}
                {hideTabs && (
                  <button
                    onClick={() => setActiveTab("performance")}
                    className={`py-2 px-4 rounded-md text-sm font-bold transition-all whitespace-nowrap ${activeTab === "performance" ? "bg-white text-[#02275A] shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                  >
                    <i className="fas fa-users mr-1"></i> Team Members
                  </button>
                )}
                {userRole !== 'admin' && (
                  <button
                    onClick={() => setActiveTab("leaderboard")}
                    className={`py-2 px-4 rounded-md text-sm font-bold transition-all whitespace-nowrap ${activeTab === "leaderboard" ? "bg-white text-[#02275A] shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                  >
                    <i className="fas fa-trophy mr-1"></i> Leaderboard
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === "dashboard" && (
        <div className="space-y-6 animate-fade-in">
          <h2 className="text-2xl font-bold text-[#02275A] mb-4">Overview</h2>
          {/* Top KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col items-start gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center text-xl">
                <i className="fas fa-users"></i>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Total Headcount
                </p>
                <h3 className="text-3xl font-bold text-slate-800">
                  {headCount}
                </h3>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col items-start gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center text-xl">
                <i className="fas fa-user-check"></i>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Active Employees
                </p>
                <h3 className="text-3xl font-bold text-slate-800">
                  {activeCount}
                </h3>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col items-start gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center text-xl">
                <i className="fas fa-user-clock"></i>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  On Leave
                </p>
                <h3 className="text-3xl font-bold text-slate-800">
                  {onLeaveCount}
                </h3>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col items-start gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center text-xl">
                <i className="fas fa-star"></i>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Avg Performance
                </p>
                <h3 className="text-3xl font-bold text-slate-800">
                  {Math.round(
                    scopedEmployees.reduce(
                      (sum, e) => sum + e.performanceScore,
                      0,
                    ) / (headCount || 1),
                  )}
                  %
                </h3>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Gender Distribution */}
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col">
              <h3 className="text-lg font-bold text-slate-800 mb-6">
                Gender Distribution
              </h3>
              <div className="flex-1 min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {genderData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      cursor={{ fill: "#f8fafc" }}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Country Distribution */}
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col">
              <h3 className="text-lg font-bold text-slate-800 mb-6">
                Workforce by Country
              </h3>
              <div className="flex-1 min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={countryData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#E2E8F0"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#64748b" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#64748b" }}
                    />
                    <Tooltip
                      cursor={{ fill: "#f8fafc" }}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Bar
                      dataKey="value"
                      fill="#02275A"
                      radius={[4, 4, 0, 0]}
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Department Distribution */}
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col">
              <h3 className="text-lg font-bold text-slate-800 mb-6">
                Department Headcount
              </h3>
              <div className="flex-1 min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={departmentData}
                    layout="vertical"
                    margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      stroke="#E2E8F0"
                    />
                    <XAxis
                      type="number"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#64748b" }}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#64748b" }}
                      width={80}
                    />
                    <Tooltip
                      cursor={{ fill: "#f8fafc" }}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Bar
                      dataKey="value"
                      fill="#0ea5e9"
                      radius={[0, 4, 4, 0]}
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Lists Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Performers */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                <h3 className="font-bold text-lg text-slate-800">
                  Top Performers
                </h3>
              </div>
              <div className="p-6 flex-1 flex flex-col gap-3">
                {topEmployees.map((emp, idx) => (
                  <div
                    key={emp.id}
                    className="flex justify-between items-center p-4 bg-slate-50/50 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#02275A] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                        {emp.firstName[0]}
                        {emp.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          {emp.firstName} {emp.lastName}
                        </p>
                        <p className="text-xs text-slate-500">{emp.role}</p>
                      </div>
                    </div>
                    <span className="font-bold text-emerald-500 text-sm">
                      {emp.performanceScore}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Anniversaries */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                <h3 className="font-bold text-lg text-slate-800">
                  Anniversaries
                </h3>
              </div>
              <div className="p-6 flex-1 flex flex-col gap-3">
                {upcomingAnniversaries.length > 0 ? (
                  upcomingAnniversaries.map((emp) => {
                    const years =
                      new Date().getFullYear() -
                      new Date(emp.hireDate).getFullYear();
                    return (
                      <div
                        key={emp.id}
                        className="flex justify-between items-center p-4 bg-indigo-50/50 rounded-lg border border-indigo-100 hover:bg-indigo-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs shadow-sm">
                            <i className="fas fa-gift"></i>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">
                              {emp.firstName} {emp.lastName}
                            </p>
                            <p className="text-xs text-slate-500">
                              Joined{" "}
                              {new Date(emp.hireDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-indigo-500 text-sm">
                          {years} {years === 1 ? "Yr" : "Yrs"}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex-1 flex items-center justify-center text-slate-400 text-sm py-8">
                    No anniversaries this month
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Birthdays */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                <h3 className="font-bold text-lg text-slate-800">Birthdays</h3>
              </div>
              <div className="p-6 flex-1 flex flex-col gap-3">
                {upcomingBirthdays.length > 0 ? (
                  upcomingBirthdays.map((emp) => (
                    <div
                      key={emp.id}
                      className="flex justify-between items-center p-4 bg-rose-50/50 rounded-lg border border-rose-100 hover:bg-rose-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs shadow-sm">
                          <i className="fas fa-cake-candles"></i>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            {emp.firstName} {emp.lastName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {emp.department}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-rose-500 text-sm">
                        {new Date(emp.dateOfBirth).getDate()}{" "}
                        {new Date(emp.dateOfBirth).toLocaleString("default", {
                          month: "short",
                        })}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="flex-1 flex items-center justify-center text-slate-400 text-sm py-8">
                    No birthdays this month
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Recent Activity and At Risk */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10 mt-6 bg-slate-50">
            {/* At Risk Members */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-100">
                <h3 className="font-bold text-lg text-slate-800">
                  At Risk Members
                </h3>
              </div>
              <div className="p-6 flex-1 flex flex-col gap-3">
                {scopedEmployees.filter((e) => e.performanceScore < 60)
                  .length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-slate-400 text-sm py-8">
                    No at-risk members currently
                  </div>
                ) : (
                  scopedEmployees
                    .filter((e) => e.performanceScore < 60)
                    .map((emp) => (
                      <div
                        key={emp.id}
                        className="flex justify-between items-center p-4 bg-rose-50/50 rounded-lg border border-rose-100 hover:bg-rose-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                            F
                          </div>
                          <span className="font-bold text-slate-800 text-sm">
                            {emp.firstName} {emp.lastName}
                          </span>
                        </div>
                        <span className="font-bold text-rose-500 text-sm">
                          {emp.performanceScore}%
                        </span>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-100">
                <h3 className="font-bold text-lg text-slate-800">
                  Recent Activity
                </h3>
              </div>
              <div className="p-6 flex-1 flex flex-col gap-3">
                <div className="flex gap-4 p-4 rounded-xl border border-slate-100">
                  <div className="mt-1 text-slate-400 text-lg">
                    <i className="far fa-clock"></i>
                  </div>
                  <div className="flex-1 flex flex-col md:flex-row justify-between gap-2 md:items-start">
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        <span className="font-bold">Super Admin</span> gave{" "}
                        <span className="font-bold text-rose-500">
                          -5 points
                        </span>{" "}
                        to <span className="font-bold">Test Member</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        when there is no reaction to messages posted
                      </p>
                    </div>
                    <span className="text-xs text-slate-500 whitespace-nowrap">
                      5/13/2026
                    </span>
                  </div>
                </div>
                <div className="flex gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/30">
                  <div className="mt-1 text-slate-400 text-lg">
                    <i className="far fa-clock"></i>
                  </div>
                  <div className="flex-1 flex flex-col md:flex-row justify-between gap-2 md:items-start">
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        <span className="font-bold">Super Admin</span> gave{" "}
                        <span className="font-bold text-emerald-500">
                          +10 points
                        </span>{" "}
                        to <span className="font-bold">Test Member</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        +10 awarded after 48hrs in production with no bugs
                      </p>
                    </div>
                    <span className="text-xs text-slate-500 whitespace-nowrap">
                      5/12/2026
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "leave_requests" && (
        <AdminLeaveRequestsView />
      )}

      {activeTab === "directory" && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto flex-1">
              <div className="relative w-full max-w-md">
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input
                  type="text"
                  placeholder="Search employees by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#02275A]"
                />
              </div>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#02275A] bg-slate-50"
              >
                <option value="All">All Countries</option>
                <option value="Nigeria">Nigeria</option>
                <option value="Ghana">Ghana</option>
                <option value="Kenya">Kenya</option>
              </select>
              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#02275A] bg-slate-50"
              >
                <option value="All">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <button
                onClick={() => setIsAddDeptModalOpen(true)}
                className="bg-white border border-slate-200 text-[#02275A] px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <i className="fas fa-plus"></i> Create Department
              </button>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-[#02275A] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-[#02275A]/90 transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <i className="fas fa-user-plus"></i> Add Employee
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500 font-bold tracking-wider">
                    <th className="p-4">Employee</th>
                    <th className="p-4">Contact</th>
                    <th className="p-4">Role & Dept</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredEmployees.map((emp) => (
                    <tr
                      key={emp.id}
                      className="hover:bg-slate-50 transition-colors group"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm">
                            {emp.firstName[0]}
                            {emp.lastName[0]}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800">
                              {emp.firstName} {emp.lastName}
                            </div>
                            <div className="text-xs text-slate-400 font-mono">
                              {emp.employeeId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-slate-700">
                          {emp.email}
                        </div>
                        <div className="text-xs text-slate-500">
                          {emp.phone}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-bold text-slate-700">
                          {emp.role}
                        </div>
                        <div className="text-xs text-slate-500">
                          {emp.department}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-bold text-slate-700">
                          {emp.country === "Nigeria" && (
                            <span className="mr-1">🇳🇬</span>
                          )}
                          {emp.country === "Ghana" && (
                            <span className="mr-1">🇬🇭</span>
                          )}
                          {emp.country === "Kenya" && (
                            <span className="mr-1">🇰🇪</span>
                          )}
                          {emp.country}
                        </div>
                        <div className="text-xs text-slate-500">
                          {emp.city}, {emp.state}
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                            emp.status === "Active"
                              ? "bg-emerald-50 text-emerald-600"
                              : emp.status === "On Leave"
                                ? "bg-amber-50 text-amber-600"
                                : "bg-rose-50 text-rose-600"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              emp.status === "Active"
                                ? "bg-emerald-500"
                                : emp.status === "On Leave"
                                  ? "bg-amber-500"
                                  : "bg-rose-500"
                            }`}
                          ></span>
                          {emp.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => {
                            setViewEmployee(emp);
                            setModalTab("biodata");
                            setOpenedFromPerformance(false);
                          }}
                          className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:text-[#02275A] hover:border-[#02275A] rounded-lg transition-colors text-xs font-bold shadow-sm inline-flex items-center gap-1"
                        >
                          <i className="fas fa-eye"></i> View
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredEmployees.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="p-8 text-center text-slate-500"
                      >
                        No employees found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {activeTab === "performance" && (
        <div className="space-y-6 animate-fade-in pb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-[#02275A]">
              {hideTabs ? "Team Members" : "Performance & Rankings"}
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              {onOpenAppraisalWizard && (
                <button
                  onClick={onOpenAppraisalWizard}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-lg text-sm font-bold shadow-md shadow-amber-500/10 transition-all flex items-center gap-2 cursor-pointer animate-pulse-slow"
                  title="Launch the modern 8-Step Dynamic Appraisal Review Wizard with custom templates, automated formulas, and community data."
                >
                  <i className="fas fa-magic text-white"></i> 8-Step Appraisal Wizard
                  <span className="text-[9px] bg-white text-amber-600 font-extrabold px-1.5 py-0.5 rounded uppercase leading-none tracking-wide">New</span>
                </button>
              )}
              <button
                onClick={() => {
                  setUpdatePointsFormUser("");
                  setUpdatePointsFormType("performance");
                  setUpdatePointsFormVal("");
                  setUpdatePointsFormReason("");
                  setUpdatePointsFormScreenshot(null);
                  setSelectedDefinedPolicy("custom");
                  setReviewType("weekly");
                  setEngineTab("kpis");
                  setIsUpdatePointsModalOpen(true);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300/60 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 cursor-pointer"
                title="Simple Point/Conduct Adjustment"
              >
                Review Staff
              </button>
              <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input
                  type="text"
                  placeholder="Search team members..."
                  className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-[#02275A] transition-colors w-64 shadow-sm font-sans"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Rating Filters Panel */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-3xs flex flex-col gap-4 text-left animate-fade-in" id="rating-filters-panel">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 animate-pulse-slow">
                  <i className="fas fa-filter text-xs"></i>
                </div>
                <div>
                  <h4 className="font-extrabold text-[#02275A] text-xs uppercase tracking-wider">Rating Period Filter</h4>
                  <p className="text-[10px] text-slate-400">Filter performance score, reward points & grades by custom periods</p>
                </div>
              </div>
              
              {/* Clear Filters Button */}
              {(ratingFilterYear !== "All" || ratingFilterMonth !== "All" || ratingFilterQuarter !== "All" || ratingFilterWeek !== "All") && (
                <button
                  type="button"
                  onClick={() => {
                    setRatingFilterYear("All");
                    setRatingFilterMonth("All");
                    setRatingFilterQuarter("All");
                    setRatingFilterWeek("All");
                  }}
                  className="text-[11px] text-rose-600 hover:text-rose-800 font-bold transition-colors cursor-pointer flex items-center gap-1.5 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100 shadow-2xs"
                >
                  <i className="fas fa-undo text-[9px]"></i> Clear Filters
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Year Select */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Year</span>
                <select
                  value={ratingFilterYear}
                  onChange={(e) => setRatingFilterYear(e.target.value)}
                  className="w-full bg-white border border-slate-200 hover:border-indigo-300 text-xs rounded-lg px-3 py-2 outline-none focus:border-[#02275A] font-semibold text-slate-700 shadow-3xs transition-colors"
                >
                  <option value="All">All Years</option>
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                </select>
              </div>

              {/* Month Select */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Month</span>
                <select
                  value={ratingFilterMonth}
                  onChange={(e) => setRatingFilterMonth(e.target.value)}
                  className="w-full bg-white border border-slate-200 hover:border-indigo-300 text-xs rounded-lg px-3 py-2 outline-none focus:border-[#02275A] font-semibold text-slate-700 shadow-3xs transition-colors"
                >
                  <option value="All">All Months</option>
                  <option value="January">January</option>
                  <option value="February">February</option>
                  <option value="March">March</option>
                  <option value="April">April</option>
                  <option value="May">May</option>
                  <option value="June">June</option>
                  <option value="July">July</option>
                  <option value="August">August</option>
                  <option value="September">September</option>
                  <option value="October">October</option>
                  <option value="November">November</option>
                  <option value="December">December</option>
                </select>
              </div>

              {/* Quarter Select */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Quarter</span>
                <select
                  value={ratingFilterQuarter}
                  onChange={(e) => setRatingFilterQuarter(e.target.value)}
                  className="w-full bg-white border border-slate-200 hover:border-indigo-300 text-xs rounded-lg px-3 py-2 outline-none focus:border-[#02275A] font-semibold text-slate-700 shadow-3xs transition-colors"
                >
                  <option value="All">All Quarters</option>
                  <option value="Q1">Q1 (Jan - Mar)</option>
                  <option value="Q2">Q2 (Apr - Jun)</option>
                  <option value="Q3">Q3 (Jul - Sep)</option>
                  <option value="Q4">Q4 (Oct - Dec)</option>
                </select>
              </div>

              {/* Week Select */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Week</span>
                <select
                  value={ratingFilterWeek}
                  onChange={(e) => setRatingFilterWeek(e.target.value)}
                  className="w-full bg-white border border-slate-200 hover:border-indigo-300 text-xs rounded-lg px-3 py-2 outline-none focus:border-[#02275A] font-semibold text-slate-700 shadow-3xs transition-colors"
                >
                  <option value="All">All Weeks</option>
                  <option value="Week 1">Week 1</option>
                  <option value="Week 2">Week 2</option>
                  <option value="Week 3">Week 3</option>
                  <option value="Week 4">Week 4</option>
                  <option value="Week 5">Week 5</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-semibold text-xs border-b border-slate-200 uppercase tracking-wider">
                    <th className="px-4 py-3.5 font-bold">Employee & Role</th>
                    <th className="px-4 py-3.5 font-bold text-center">
                      Performance Balance (0-100)
                    </th>
                    <th className="px-4 py-3.5 font-bold text-center">
                      Reward Points
                    </th>
                    <th className="px-4 py-3.5 font-bold text-center">
                      Net Balance
                    </th>
                    <th className="px-4 py-3.5 font-bold text-center">
                      Leaderboard Rank
                    </th>
                    <th className="px-4 py-3.5 font-bold text-center">
                      Overall Grade
                    </th>
                    <th className="px-4 py-3.5 font-bold text-right pr-6">
                      Evaluate
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((emp) => {
                    // Dynamically retrieve metrics based on selected period filters (Year, Month, Quarter, Week)
                    const { perfBalance, empPoints, netBalance, empGrade } = getEmployeeFilteredMetrics(emp);
                    const empRank = emp.leaderboardRank || "N/A";

                    const hasMonthlyReview = (() => {
                      if (!emp.monthlyReviews || !Array.isArray(emp.monthlyReviews) || emp.monthlyReviews.length === 0) {
                        return false;
                      }
                      if (ratingFilterYear !== "All" || ratingFilterMonth !== "All" || ratingFilterQuarter !== "All") {
                        return emp.monthlyReviews.some((rev: any) => {
                          let matches = true;
                          if (ratingFilterYear !== "All" && String(rev.year) !== ratingFilterYear) matches = false;
                          if (ratingFilterMonth !== "All" && String(rev.month).toLowerCase() !== ratingFilterMonth.toLowerCase()) matches = false;
                          if (ratingFilterQuarter !== "All") {
                            const qMonths: Record<string, string[]> = {
                              "q1": ["january", "february", "march"],
                              "q2": ["april", "may", "june"],
                              "q3": ["july", "august", "september"],
                              "q4": ["october", "november", "december"]
                            };
                            const targetMonths = qMonths[ratingFilterQuarter.toLowerCase()] || [];
                            if (!targetMonths.includes(String(rev.month).toLowerCase())) matches = false;
                          }
                          return matches;
                        });
                      }
                      return true;
                    })();

                    const hasWeeklyReview = (() => {
                      if (!emp.weeklyReviews || !Array.isArray(emp.weeklyReviews) || emp.weeklyReviews.length === 0) {
                        return false;
                      }
                      if (ratingFilterYear !== "All" || ratingFilterMonth !== "All" || ratingFilterQuarter !== "All" || ratingFilterWeek !== "All") {
                        return emp.weeklyReviews.some((rev: any) => {
                          let matches = true;
                          if (ratingFilterYear !== "All" && String(rev.year) !== ratingFilterYear) matches = false;
                          if (ratingFilterMonth !== "All" && String(rev.month).toLowerCase() !== ratingFilterMonth.toLowerCase()) matches = false;
                          if (ratingFilterQuarter !== "All") {
                            const qMonths: Record<string, string[]> = {
                              "q1": ["january", "february", "march"],
                              "q2": ["april", "may", "june"],
                              "q3": ["july", "august", "september"],
                              "q4": ["october", "november", "december"]
                            };
                            const targetMonths = qMonths[ratingFilterQuarter.toLowerCase()] || [];
                            if (!targetMonths.includes(String(rev.month).toLowerCase())) matches = false;
                          }
                          if (ratingFilterWeek !== "All" && String(rev.week).toLowerCase() !== ratingFilterWeek.toLowerCase()) matches = false;
                          return matches;
                        });
                      }
                      return true;
                    })();

                    let gradeClass =
                      "bg-rose-100 text-rose-700 border-rose-200";

                    if (empGrade === "A+" || empGrade === "A") {
                      gradeClass =
                        "bg-emerald-100 text-emerald-850 border-emerald-200 border";
                    } else if (empGrade === "B+" || empGrade === "B") {
                      gradeClass =
                        "bg-blue-100 text-blue-800 border-blue-200 border";
                    } else if (empGrade === "C") {
                      gradeClass =
                        "bg-amber-100 text-amber-800 border-amber-200 border";
                    } else if (empGrade === "D") {
                      gradeClass =
                        "bg-orange-100 text-orange-800 border-orange-200 border";
                    }

                    let pointsClass = "text-slate-700 font-semibold";
                    if (perfBalance >= 90) {
                      pointsClass = "text-emerald-600 font-bold";
                    } else if (perfBalance < 60) {
                      pointsClass = "text-rose-600 font-bold";
                    }

                    return (
                      <tr
                        key={emp.id}
                        className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-100 text-[#02275A] flex items-center justify-center font-bold text-xs ring-1 ring-slate-200 shadow-inner shrink-0">
                              {emp.firstName[0]}
                              {emp.lastName[0]}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-[#02275A] text-sm truncate">
                                {emp.firstName} {emp.lastName}
                              </div>
                              <div className="text-xs text-slate-500 truncate mt-0.5">
                                <span className="font-medium text-slate-600">
                                  {emp.role}
                                </span>
                                <span className="text-slate-300 mx-1">•</span>
                                <span className="text-slate-400">
                                  {emp.department}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {hasWeeklyReview && !hasMonthlyReview ? (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/80 inline-flex items-center gap-1">
                              In Review
                            </span>
                          ) : (
                            <span className={`${pointsClass} text-sm font-mono`}>
                              {perfBalance}%
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {hasWeeklyReview && !hasMonthlyReview ? (
                            <span className="text-amber-600 font-bold text-xs font-mono">
                              In Review
                            </span>
                          ) : (
                            <span className="text-amber-500 font-bold flex items-center justify-center gap-1 text-sm font-mono">
                              <i className="fas fa-star text-[10px]"></i>{" "}
                              {empPoints}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {hasWeeklyReview && !hasMonthlyReview ? (
                            <span className="text-amber-600 font-bold text-xs font-mono">
                              In Review
                            </span>
                          ) : (
                            <span className="text-teal-600 font-bold flex items-center justify-center gap-1 text-sm font-mono">
                              <i className="fas fa-wallet text-[10px] text-teal-400"></i>{" "}
                              {netBalance}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {hasWeeklyReview && !hasMonthlyReview ? (
                            <span className="text-slate-400 font-bold text-xs font-mono">
                              In Review
                            </span>
                          ) : (
                            <span className="text-indigo-600 font-bold flex items-center justify-center gap-1 text-sm font-mono">
                              <i className="fas fa-trophy text-[10px] text-yellow-500"></i>{" "}
                              {empRank}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {hasWeeklyReview && !hasMonthlyReview ? (
                            <div className="mx-auto w-fit px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                              In Review
                            </div>
                          ) : (
                            <div
                              className={`mx-auto w-fit px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${gradeClass}`}
                            >
                              Grade {empGrade}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right pr-6">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setViewEmployee(emp);
                                setModalTab("grades_audit");
                                setOpenedFromPerformance(true);
                              }}
                              className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 hover:text-[#02275A] hover:border-[#02275A] hover:bg-slate-50/50 rounded-lg transition-colors text-xs font-bold shadow-xs inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                              title="View Performance History Logs"
                            >
                              <i className="fas fa-clock-rotate-left text-[11px]"></i>{" "}
                              History
                            </button>
                            {(userRole === "admin" ||
                              userRole === "hr" ||
                              [
                                "team-lead",
                                "cx-head",
                                "customer-success",
                                "sales-manager",
                                "marketing-manager",
                                "finance",
                                "content-lead",
                                "engineering",
                                "engineer",
                              ].includes(userRole)) && (
                              <button
                                onClick={() => {
                                  setRatingEmployee(emp);
                                  setRatingGrade(emp.grade || "B+");
                                  setReviewComments("");
                                  setStrengths("");
                                  setRecommendations("");
                                  setReviewDateType((emp as any).reviewDateType || "monthly");
                                  setRatingYear("2026");
                                  setRatingMonth("July");
                                }}
                                className="px-2.5 py-1 bg-[#02275A] hover:bg-[#0b3b82] hover:shadow text-white rounded-lg transition-all text-xs font-bold shadow-xs inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                                title="Rate Performance"
                              >
                                <i className="fas fa-star-half-stroke text-[11px]"></i>{" "}
                                Rate
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}



      {activeTab === "policies" && (
        <div className="space-y-6 animate-fade-in pb-10">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-[#02275A] mb-2">
                  {isTeamLeadRole ? "Company Conduct" : "Policies"}
                </h2>
                <p className="text-slate-500 text-sm">
                  {isTeamLeadRole
                    ? "Manage point policies for automated and manual point application as a team lead."
                    : "Manage point policies for automated and manual point application."}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsUploadPolicyOpen(true)}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  <i className="fas fa-upload"></i> Upload
                </button>
                <button
                  onClick={() => setIsAddPolicyModalOpen(true)}
                  className="px-4 py-2 bg-[#02275A] text-white rounded-lg text-sm font-bold shadow-md hover:bg-[#02275A]/90 transition-colors flex items-center gap-2"
                >
                  <i className="fas fa-plus"></i> Add Policy
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-lg shadow-sm text-slate-400">
                  <i className="fas fa-search relative top-[1px]"></i>
                </div>
              </div>
              <div className="relative flex-1">
                <select className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-[#02275A] shadow-sm appearance-none">
                  <option>All Scopes</option>
                  <option>Global</option>
                  <option>Engineering</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500">
                  <i className="fas fa-chevron-down text-xs"></i>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 border-b border-transparent">
              <button className="px-5 py-2.5 bg-[#02275A] text-white rounded-lg text-sm font-bold shadow-sm">
                Rewards (6)
              </button>
              <button className="px-5 py-2.5 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg text-sm font-medium transition-colors">
                Penalties (10)
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  title: "Documentation Hero",
                  desc: "+5 for creating technical guides for features",
                  pts: "+5 points",
                  scope: "Global",
                },
                {
                  title: "Early Delivery",
                  desc: "+5 per 24 hours ahead of schedule",
                  pts: "+5 points",
                  scope: "Global",
                },
                {
                  title: "Proactive Warning",
                  desc: "+5 for flagging a delay >72 hours in advance",
                  pts: "+5 points",
                  scope: "Global",
                },
                {
                  title: "Product addition",
                  desc: "Production addition",
                  pts: "+10 points",
                  scope: "Engineering",
                },
                {
                  title: "Urgent Review SLA Met",
                  desc: "+5 for meeting urgent review SLA (Reviewer)",
                  pts: "+5 points",
                  scope: "Global",
                },
                {
                  title: "Zero-Bug Release",
                  desc: "+10 awarded after 48hrs in production with no bugs",
                  pts: "+10 points",
                  scope: "Global",
                },
              ].map((policy, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative group"
                >
                  <div className="absolute top-5 right-5 text-slate-300 hover:text-slate-500 cursor-pointer transition-colors">
                    <i className="fas fa-pencil-alt text-[13px] transform -scale-x-100"></i>
                  </div>
                  <h4 className="font-bold text-[#02275A] text-[15px] mb-1.5 pr-6">
                    {policy.title}
                  </h4>
                  <p className="text-slate-600 text-[13px] mb-5">
                    {policy.desc}
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-600 font-bold text-[13px]">
                      {policy.pts}
                    </span>
                    <span className="text-slate-500 text-[13px]">
                      {policy.scope}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "rewards" && (
        <div className="space-y-6 animate-fade-in pb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-[#02275A] mb-2">
                {isTeamLeadRole ? "Reward & Recognition" : "Grade System"}
              </h2>
              <p className="text-slate-500 text-sm">
                {isTeamLeadRole
                  ? "Track points, thresholds, and reward achievements for team members."
                  : "Define grades, point thresholds, and rewards."}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsAddGradeModalOpen(true)}
                className="px-4 py-2 bg-[#02275A] text-white rounded-lg text-sm font-bold shadow-md hover:bg-[#02275A]/90 transition-colors flex items-center gap-2"
              >
                <i className="fas fa-plus"></i> Add Grade Definition
              </button>
              <button
                onClick={() => setIsSetQuarterModalOpen(true)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <i className="far fa-calendar-alt"></i> Set Quarter
              </button>
            </div>
          </div>

          <div className="bg-slate-100 rounded-xl border border-slate-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 items-start">
            <div className="flex items-center gap-4">
              <div className="text-slate-500 text-xl">
                <i className="far fa-calendar-alt"></i>
              </div>
              <div>
                <h4 className="font-bold text-[#02275A] text-sm">Q2 2026</h4>
                <p className="text-slate-500 text-xs mt-0.5">
                  Apr 1, 2026 &rarr; Jul 1, 2026
                </p>
              </div>
            </div>
            <div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-md text-xs font-bold">
                Active
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <span className="text-sm text-slate-700 font-medium">View:</span>
            <div className="relative">
              <select className="px-4 py-2 pr-8 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-[#02275A] shadow-sm appearance-none min-w-[200px]">
                <option>All Departments</option>
                <option>Engineering</option>
                <option>Sales</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500">
                <i className="fas fa-chevron-down text-xs"></i>
              </div>
            </div>
          </div>

          {/* Global Grade Definitions */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-4">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-bold text-[#02275A] text-lg">
                Global Grade Definitions
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-700 text-sm font-bold">
                    <th className="px-6 py-4">Grade</th>
                    <th className="px-6 py-4">Min Points</th>
                    <th className="px-6 py-4">Max Points</th>
                    <th className="px-6 py-4">Consequence</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                        A
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-600">
                      90
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-600">
                      100
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      &mdash;
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3 text-slate-400">
                        <i className="fas fa-pencil-alt hover:text-slate-600 cursor-pointer transition-colors text-[13px] transform -scale-x-100"></i>
                        <i className="far fa-trash-alt hover:text-rose-500 cursor-pointer transition-colors text-[13px]"></i>
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                        B
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-600">
                      75
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-600">
                      89
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      &mdash;
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3 text-slate-400">
                        <i className="fas fa-pencil-alt hover:text-slate-600 cursor-pointer transition-colors text-[13px] transform -scale-x-100"></i>
                        <i className="far fa-trash-alt hover:text-rose-500 cursor-pointer transition-colors text-[13px]"></i>
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <div className="w-6 h-6 rounded-full bg-amber-400 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                        C
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-600">
                      60
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-600">
                      74
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      Mandatory Estimation Training & peer review
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3 text-slate-400">
                        <i className="fas fa-pencil-alt hover:text-slate-600 cursor-pointer transition-colors text-[13px] transform -scale-x-100"></i>
                        <i className="far fa-trash-alt hover:text-rose-500 cursor-pointer transition-colors text-[13px]"></i>
                      </div>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <div className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                        F
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-600">
                      0
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-600">
                      59
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      Loss of remote work + Daily EOD micromanagement
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3 text-slate-400">
                        <i className="fas fa-pencil-alt hover:text-slate-600 cursor-pointer transition-colors text-[13px] transform -scale-x-100"></i>
                        <i className="far fa-trash-alt hover:text-rose-500 cursor-pointer transition-colors text-[13px]"></i>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Rewards */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-6">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-[#02275A] text-lg flex items-center gap-2">
                <i className="fas fa-gift text-amber-500"></i> Rewards
              </h3>
              <button className="px-4 py-2 bg-[#02275A] text-white rounded-lg text-sm font-bold shadow-md hover:bg-[#02275A]/90 transition-colors flex items-center gap-2">
                <i className="fas fa-plus relative top-0.5 text-xs"></i> Add
                Reward
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-700 text-sm font-bold">
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Point Range</th>
                    <th className="px-6 py-4">Reward</th>
                    <th className="px-6 py-4">Department</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                        A
                      </div>
                      <span className="text-sm font-bold text-[#02275A]">
                        High Performer
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-600">
                      90 - 100
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400 italic">
                      Not defined
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold">
                        Global
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                        B
                      </div>
                      <span className="text-sm font-bold text-[#02275A]">
                        Reliable
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-600">
                      75 - 89
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400 italic">
                      Not defined
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold">
                        Global
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-amber-400 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                        C
                      </div>
                      <span className="text-sm font-bold text-[#02275A]">
                        Warning
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-600">
                      60 - 74
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400 italic">
                      Not defined
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold">
                        Global
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                        F
                      </div>
                      <span className="text-sm font-bold text-[#02275A]">
                        Probation
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-600">
                      0 - 59
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400 italic">
                      Not defined
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold">
                        Global
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Quarter History */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-6 flex flex-col">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-bold text-[#02275A] text-lg">
                Quarter History
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-700 text-sm font-bold">
                    <th className="px-6 py-4">Quarter</th>
                    <th className="px-6 py-4">Start</th>
                    <th className="px-6 py-4">End</th>
                    <th className="px-6 py-4">Scope</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <span className="font-bold text-[#02275A] text-sm">
                        Q2 2026
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      4/1/2026
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      7/1/2026
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">Global</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-600 rounded-md text-[11px] font-bold">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end text-slate-400">
                        <i className="far fa-trash-alt hover:text-rose-500 cursor-pointer transition-colors text-[13px]"></i>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "upload" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col p-6 animate-fade-in space-y-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-[#02275A]">
              Bulk Upload
            </h2>
            <p className="text-slate-500 text-sm">
              Upload policies or employee performance data in bulk via CSV or manual entries.
            </p>
          </div>

          <div className="flex bg-slate-50 border border-slate-100 rounded-lg p-1 w-fit mb-6 shadow-sm">
            <button
              onClick={() => setUploadPolicyTab("manual")}
              className={`px-5 py-2 text-sm transition-colors ${uploadPolicyTab === "manual" ? "font-bold bg-white text-[#02275A] rounded-md shadow-sm" : "font-medium text-slate-500 hover:text-slate-800"}`}
            >
              Manual Add
            </button>
            <button
              onClick={() => setUploadPolicyTab("file")}
              className={`px-5 py-2 text-sm transition-colors ${uploadPolicyTab === "file" ? "font-bold bg-white text-[#02275A] rounded-md shadow-sm" : "font-medium text-slate-500 hover:text-slate-800"}`}
            >
              File Import
            </button>
          </div>

          {uploadPolicyTab === "manual" ? (
            <div className="border border-slate-100 rounded-xl overflow-hidden bg-white shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/55">
                    <th className="py-4 px-4 w-[35%]">NAME</th>
                    <th className="py-4 px-4">DESCRIPTION</th>
                    <th className="py-4 px-4 w-32">POINTS</th>
                  </tr>
                </thead>
                <tbody>
                  {uploadPolicyRows.map((rowId) => (
                    <tr key={rowId} className="border-b border-slate-50">
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          placeholder="Policy name"
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#02275A] font-medium"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          placeholder="Description..."
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#02275A]"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          placeholder="0"
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#02275A] font-bold text-[#02275A]"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                <button
                  className="flex items-center gap-2 text-sm font-bold text-[#02275A] hover:text-[#0b3b82] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  onClick={() => {
                    if (uploadPolicyRows.length < 20) {
                      setUploadPolicyRows([
                        ...uploadPolicyRows,
                        Math.max(0, ...uploadPolicyRows) + 1,
                      ]);
                    }
                  }}
                  disabled={uploadPolicyRows.length >= 20}
                >
                  <i className="fas fa-plus"></i>
                  Add Row
                  <span className="text-slate-400 font-medium ml-1">
                    ({uploadPolicyRows.length}/20)
                  </span>
                </button>
                <button
                  className="px-6 py-2.5 bg-[#02275A] text-white rounded-lg text-sm font-bold shadow-md hover:bg-[#02275A]/90 transition-colors cursor-pointer"
                  onClick={() => {
                    showSuccess("Performance policy data imported successfully.");
                    setUploadPolicyRows([1]);
                  }}
                >
                  Save and Apply Data
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-4 text-[#02275A] text-2xl">
                <i className="fas fa-file-excel"></i>
              </div>
              <h3 className="font-bold text-slate-800 text-lg mb-1">
                Import Data via Template
              </h3>
              <p className="text-slate-500 text-sm mb-6 text-center max-w-md">
                Download our standard CSV template, fill in your policy or performance
                records, and upload it here to import data in bulk.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => showSuccess("Template download started.")}
                  className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <i className="fas fa-download"></i> Download Template
                </button>
                <button 
                  onClick={() => showSuccess("Select CSV file to import.")}
                  className="px-5 py-2.5 bg-[#02275A] text-white rounded-lg text-sm font-bold shadow-md hover:bg-[#02275A]/90 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <i className="fas fa-upload"></i> Browse Files
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "leaderboard" &&
        (() => {
          const getInitials = (firstName?: string, lastName?: string) => {
            return `${(firstName || "")[0] || ""}${(lastName || "")[0] || ""}`.toUpperCase();
          };

          const uniqueDepartments = Array.from(
            new Set(employees.map((e) => e.department).filter(Boolean)),
          );

          const filteredLeaderboardFilteredEmployees = employees.filter(
            (emp) => {
              // Department Filter - if departmentFilter prop is present (TL / user view)
              if (departmentFilter) {
                if (emp.department !== departmentFilter) {
                  return false;
                }
              } else if (leaderboardDeptFilterState !== "All") {
                // Admin/HR choosing a specific department view
                if (emp.department !== leaderboardDeptFilterState) {
                  return false;
                }
              }

              // Search Term Filter
              if (leaderboardSearch.trim()) {
                const query = leaderboardSearch.toLowerCase();
                const fullName =
                  `${emp.firstName || ""} ${emp.lastName || ""}`.toLowerCase();
                if (
                  !fullName.includes(query) &&
                  !(emp.role || "").toLowerCase().includes(query) &&
                  !(emp.employeeId || "").toLowerCase().includes(query)
                ) {
                  return false;
                }
              }

              return true;
            },
          );

          const sortedLeaderboardEmployees = [
            ...filteredLeaderboardFilteredEmployees,
          ].sort((a, b) => {
            const pointsA = a.rewardPoints !== undefined ? a.rewardPoints : 100;
            const pointsB = b.rewardPoints !== undefined ? b.rewardPoints : 100;
            if (pointsB !== pointsA) {
              return pointsB - pointsA;
            }
            const perfA =
              a.performanceScore !== undefined ? a.performanceScore : 0;
            const perfB =
              b.performanceScore !== undefined ? b.performanceScore : 0;
            if (perfB !== perfA) {
              return perfB - perfA;
            }
            return `${a.firstName} ${a.lastName}`.localeCompare(
              `${b.firstName} ${b.lastName}`,
            );
          });

          const firstPlace = sortedLeaderboardEmployees[0];
          const secondPlace = sortedLeaderboardEmployees[1];
          const thirdPlace = sortedLeaderboardEmployees[2];

          return (
            <div className="space-y-6 animate-fade-in pb-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#02275A] mb-6">
                    Leaderboard
                  </h2>
                  <div className="flex items-center gap-3 mb-1">
                    <i className="fas fa-trophy text-amber-500 text-2xl"></i>
                    <h3 className="text-xl font-bold text-[#02275A]">
                      Top Performers
                    </h3>
                  </div>
                  <p className="text-slate-500 text-sm mt-1">
                    Ranked by Reward Points — celebrating extra-mile
                    achievements
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 mt-2 mb-6 font-sans">
                <div className="flex bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm shrink-0">
                  {!departmentFilter && (
                    <button
                      onClick={() => {
                        setLeaderboardScope("company");
                        setLeaderboardDeptFilterState("All");
                      }}
                      className={`px-5 py-2.5 text-sm transition-colors ${leaderboardDeptFilterState === "All" ? "font-bold bg-[#02275A] text-white" : "font-medium text-slate-500 hover:bg-slate-50 border-r border-slate-200"}`}
                    >
                      Whole Company
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setLeaderboardScope("department");
                      if (departmentFilter) {
                        setLeaderboardDeptFilterState(departmentFilter);
                      } else {
                        if (leaderboardDeptFilterState === "All") {
                          setLeaderboardDeptFilterState(
                            uniqueDepartments[0] || "Sales",
                          );
                        }
                      }
                    }}
                    className={`px-5 py-2.5 text-sm transition-colors ${leaderboardDeptFilterState !== "All" ? "font-bold bg-[#02275A] text-white" : "font-medium text-slate-500 hover:bg-slate-50"}`}
                  >
                    {departmentFilter
                      ? "My Department"
                      : "Filter by Department"}
                  </button>
                </div>

                {/* Dropdown to switch department filters dynamically (for Admin/HR only) */}
                {!departmentFilter && (
                  <div className="relative">
                    <select
                      value={leaderboardDeptFilterState}
                      onChange={(e) => {
                        setLeaderboardDeptFilterState(e.target.value);
                        if (e.target.value === "All") {
                          setLeaderboardScope("company");
                        } else {
                          setLeaderboardScope("department");
                        }
                      }}
                      className="w-full md:w-56 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:outline-none focus:ring-2 focus:ring-[#02275A]/20 shadow-sm"
                    >
                      <option value="All">All Departments</option>
                      {uniqueDepartments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="relative flex-1 max-w-sm">
                  <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                  <input
                    type="text"
                    placeholder="Search member..."
                    value={leaderboardSearch}
                    onChange={(e) => setLeaderboardSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-[#02275A] shadow-sm font-sans"
                  />
                </div>
              </div>

              <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-8 flex flex-col md:flex-row items-end justify-center gap-6 shadow-sm min-h-[400px]">
                {/* 2nd Place */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col items-center w-full md:w-64 shadow-sm relative pt-12 transform hover:-translate-y-1 transition-transform">
                  <div className="absolute -top-7">
                    <div className="relative">
                      <i className="fas fa-medal text-[3.5rem] text-slate-300 drop-shadow-md"></i>
                      <span className="absolute top-[25px] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[13px] font-bold text-slate-600">
                        2
                      </span>
                    </div>
                  </div>
                  <div className="w-20 h-20 bg-slate-200 text-slate-700 rounded-full flex items-center justify-center text-2xl font-bold shadow-inner mb-4">
                    {secondPlace
                      ? getInitials(secondPlace.firstName, secondPlace.lastName)
                      : "—"}
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-[#02275A] text-center text-sm">
                      {secondPlace
                        ? `${secondPlace.firstName} ${secondPlace.lastName}`
                        : "Empty Rank"}
                    </h4>
                    {secondPlace && secondPlace.is_user_account && (
                      <span className="px-1.5 py-0.5 bg-[#02275A]/10 text-[#02275A] text-[9px] font-bold rounded">
                        YOU
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 text-[11px] mb-4">
                    {secondPlace ? secondPlace.department : "No record"}
                  </p>
                  <div className="px-4 py-1.5 bg-slate-50 rounded-md border border-slate-100 text-sm font-bold text-slate-700 mb-2 font-mono">
                    {secondPlace
                      ? secondPlace.rewardPoints !== undefined
                        ? secondPlace.rewardPoints
                        : 100
                      : 0}{" "}
                    <span className="text-slate-400 font-normal">pts</span>
                  </div>
                </div>

                {/* 1st Place */}
                <div className="bg-[#FFFDF5] border border-amber-200 rounded-xl p-6 flex flex-col items-center w-full md:w-[17rem] shadow-md relative pt-14 mb-4 transform hover:-translate-y-1 transition-transform">
                  <div className="absolute -top-9">
                    <div className="relative">
                      <i className="fas fa-medal text-[4.5rem] text-amber-500 drop-shadow-md"></i>
                      <span className="absolute top-[34px] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sm font-bold text-amber-900 drop-shadow-sm">
                        1
                      </span>
                    </div>
                  </div>
                  <div className="w-24 h-24 bg-amber-500 text-amber-900 rounded-full flex items-center justify-center text-3xl font-bold shadow-inner mb-4 font-mono">
                    {firstPlace
                      ? getInitials(firstPlace.firstName, firstPlace.lastName)
                      : "—"}
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-[#02275A] text-base text-center">
                      {firstPlace
                        ? `${firstPlace.firstName} ${firstPlace.lastName}`
                        : "Empty Rank"}
                    </h4>
                    {firstPlace && firstPlace.is_user_account && (
                      <span className="px-1.5 py-0.5 bg-[#02275A]/10 text-[#02275A] text-[9px] font-bold rounded">
                        YOU
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 text-xs mb-5">
                    {firstPlace ? firstPlace.department : "No record"}
                  </p>
                  <div className="px-5 py-2 bg-white rounded-md border border-amber-100 text-base font-bold text-slate-700 shadow-sm text-center mb-2 font-mono">
                    {firstPlace
                      ? firstPlace.rewardPoints !== undefined
                        ? firstPlace.rewardPoints
                        : 100
                      : 0}{" "}
                    <span className="text-slate-400 font-normal">pts</span>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="bg-[#FFFDF5] border border-amber-100 rounded-xl p-6 flex flex-col items-center w-full md:w-64 shadow-sm relative pt-12 transform hover:-translate-y-1 transition-transform">
                  <div className="absolute -top-7">
                    <div className="relative">
                      <i className="fas fa-medal text-[3.5rem] text-[#CD7F32] drop-shadow-md"></i>
                      <span className="absolute top-[25px] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[13px] font-bold text-white">
                        3
                      </span>
                    </div>
                  </div>
                  <div className="w-20 h-20 bg-[#CD7F32] text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-inner mb-4 border-2 border-white">
                    {thirdPlace
                      ? getInitials(thirdPlace.firstName, thirdPlace.lastName)
                      : "—"}
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-[#02275A] text-center text-sm">
                      {thirdPlace
                        ? `${thirdPlace.firstName} ${thirdPlace.lastName}`
                        : "Empty Rank"}
                    </h4>
                    {thirdPlace && thirdPlace.is_user_account && (
                      <span className="px-1.5 py-0.5 bg-[#02275A]/10 text-[#02275A] text-[9px] font-bold rounded">
                        YOU
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 text-[11px] mb-4">
                    {thirdPlace ? thirdPlace.department : "No record"}
                  </p>
                  <div className="px-4 py-1.5 bg-white rounded-md border border-slate-100 text-sm font-bold text-slate-700 shadow-sm text-center mb-2 font-mono">
                    {thirdPlace
                      ? thirdPlace.rewardPoints !== undefined
                        ? thirdPlace.rewardPoints
                        : 100
                      : 0}{" "}
                    <span className="text-slate-400 font-normal">pts</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm mt-8">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <th className="p-4">Rank</th>
                        <th className="p-4">Member</th>
                        <th className="p-4">Department</th>
                        <th className="p-4 text-right">Reward Pts</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm animate-fade-in">
                      {sortedLeaderboardEmployees.map((emp, index) => {
                        const pts =
                          emp.rewardPoints !== undefined
                            ? emp.rewardPoints
                            : 100;
                        const initials = getInitials(
                          emp.firstName,
                          emp.lastName,
                        );
                        let bgClass = "bg-slate-200 text-slate-700";
                        if (index === 0)
                          bgClass = "bg-amber-500 text-amber-950 font-bold";
                        else if (index === 1)
                          bgClass = "bg-slate-300 text-slate-800 font-bold";
                        else if (index === 2)
                          bgClass = "bg-[#CD7F32] text-white font-bold";

                        return (
                          <tr
                            key={emp.id}
                            className="hover:bg-slate-50/50 transition-colors"
                          >
                            <td className="p-4">
                              <div className="w-8 h-8 rounded-full border border-slate-200 bg-white text-slate-600 flex items-center justify-center font-bold text-sm">
                                {index + 1}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-9 h-9 rounded-full ${bgClass} flex items-center justify-center font-bold text-sm shrink-0`}
                                >
                                  {initials}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-bold text-[#02275A]">
                                      {emp.firstName} {emp.lastName}
                                    </p>
                                    {emp.is_user_account && (
                                      <span className="px-1.5 py-0.5 bg-[#02275A]/10 text-[#02275A] text-[9px] font-bold rounded">
                                        YOU
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-500">
                                    {emp.role}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-slate-700 font-medium">
                              {emp.department}
                            </td>
                            <td className="p-4 text-right">
                              <span className="font-bold text-[#02275A] font-mono">
                                {pts}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                      {sortedLeaderboardEmployees.length === 0 && (
                        <tr>
                          <td
                            colSpan={4}
                            className="p-8 text-center text-slate-400 font-medium"
                          >
                            No members found matching the criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })()}
        </>
      ) : (
        /* Render Employee Subpage */
        <div className="space-y-6 animate-fade-in" id="employee-detail-subpage">
          {/* Subpage Back Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setViewEmployee(null);
                  setIsAddingGuarantor(false);
                  setIsUploadingDoc(false);
                  setIsEditingBank(false);
                  setOpenedFromPerformance(false);
                }}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#02275A] font-bold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-2 cursor-pointer border border-slate-200"
              >
                <i className="fas fa-arrow-left"></i> Back to Employee List
              </button>
              <h2 className="text-xl font-extrabold text-[#02275A]">Employee Profile & Performance</h2>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide border ${
                  viewEmployee.status === "Active"
                    ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                    : "bg-rose-100 text-rose-800 border-rose-200"
                }`}
              >
                {viewEmployee.status}
              </span>
            </div>
          </div>

          {/* Profile Card Header */}
          <div className="bg-gradient-to-r from-[#02275A] to-[#09357a] text-white p-6 rounded-2xl shadow-xs flex flex-col md:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-white text-[#02275A] flex items-center justify-center font-bold text-3xl shadow-lg border-2 border-white shrink-0">
              {viewEmployee.firstName[0]}
              {viewEmployee.lastName[0]}
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-3 justify-center md:justify-start">
                <h2 className="text-2xl font-bold">
                  {viewEmployee.firstName} {viewEmployee.lastName}
                </h2>
                {viewEmployee.is_user_account && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border bg-blue-500/20 text-blue-300 border-blue-500/50 inline-flex items-center gap-1 w-max mx-auto md:mx-0">
                    <i className="fas fa-desktop text-[10px]"></i> User Account
                  </span>
                )}
                {viewEmployee.is_team_lead && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border bg-amber-500/20 text-amber-300 border-amber-500/50 inline-flex items-center gap-1 w-max mx-auto md:mx-0">
                    <i className="fas fa-users-cog text-[10px]"></i> Team Lead
                  </span>
                )}
              </div>
              <p className="text-blue-100 mt-1 font-semibold text-sm">
                {viewEmployee.role} &bull; {viewEmployee.department}
              </p>
              <p className="text-xs text-blue-200 mt-1 font-mono tracking-wide">
                {viewEmployee.employeeId} &bull; {viewEmployee.country}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white border border-slate-200 rounded-xl p-1 shadow-xs flex gap-1 overflow-x-auto no-scrollbar">
            {[
              "biodata",
              "guarantors",
              "leave",
              "documents",
              "payroll",
              "grades_audit",
            ]
              .filter(
                (tab) => !openedFromPerformance || tab === "grades_audit",
              )
              .map((tab) => (
                <button
                  key={tab}
                  onClick={() => setModalTab(tab as any)}
                  className={`px-5 py-2.5 rounded-lg text-xs font-black transition-all whitespace-nowrap capitalize cursor-pointer ${
                    modalTab === tab
                      ? "bg-[#02275A] text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {tab === "grades_audit" ? "Grades & Penalties" : tab === "leave" ? "Leave History" : tab}
                </button>
              ))}
          </div>

          {/* Tab Body Content */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-6">
              {/* BIODATA TAB */}
              {modalTab === "biodata" && (
                <div className="space-y-6">
                  <div className="bg-white p-5 space-y-4 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">
                      <i className="fas fa-address-card text-blue-500 mr-2"></i>{" "}
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div>
                        <p className="text-xs font-bold text-slate-400 mb-1">
                          Date of Birth
                        </p>
                        <p className="text-sm font-bold text-slate-800">
                          {new Date(
                            viewEmployee.dateOfBirth,
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 mb-1">
                          Gender
                        </p>
                        <p className="text-sm font-bold text-slate-800">
                          {viewEmployee.gender}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 mb-1">
                          Marital Status
                        </p>
                        <p className="text-sm font-bold text-slate-800">
                          {viewEmployee.maritalStatus || "N/A"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-bold text-slate-400 mb-1">
                          Email
                        </p>
                        <p className="text-sm font-bold text-slate-800">
                          {viewEmployee.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 mb-1">
                          Phone
                        </p>
                        <p className="text-sm font-bold text-slate-800">
                          {viewEmployee.phone}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 mb-1">
                          National Identity No. (NIN)
                        </p>
                        <p className="text-sm font-bold text-slate-800 tracking-wide font-mono">
                          {viewEmployee.nin || "Not Provided"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-5 space-y-4 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">
                      <i className="fas fa-briefcase text-emerald-500 mr-2"></i>{" "}
                      Employment Context
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div>
                        <p className="text-xs font-bold text-slate-400 mb-1">
                          Hire Date
                        </p>
                        <p className="text-sm font-bold text-slate-800">
                          {new Date(viewEmployee.hireDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 mb-1">
                          Branch / Location
                        </p>
                        <p className="text-sm font-bold text-slate-800">
                          {viewEmployee.city}, {viewEmployee.state},{" "}
                          {viewEmployee.country}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 mb-1">
                          Employee Type
                        </p>
                        <select
                          className="text-sm font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#02275A] focus:bg-white transition-colors"
                          value={viewEmployee.employeeType || "Full-Time"}
                          onChange={(e) => {
                            const newType = e.target.value;
                            setViewEmployee({
                              ...viewEmployee,
                              employeeType: newType,
                            });
                            setEmployees((prev) =>
                              prev.map((emp) =>
                                emp.id === viewEmployee.id
                                  ? { ...emp, employeeType: newType }
                                  : emp
                              )
                            );
                            showSuccess(`Employee type updated to ${newType}.`);
                          }}
                        >
                          <option value="Full-Time">Full-Time</option>
                          <option value="Part-Time">Part-Time</option>
                          <option value="Contract">Contract</option>
                          <option value="Agent">Agent</option>
                        </select>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 mb-1">
                          Emergency Contact
                        </p>
                        {viewEmployee.emergencyContact ? (
                          <div>
                            <p className="text-sm font-bold text-slate-800">
                              {viewEmployee.emergencyContact.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {viewEmployee.emergencyContact.relationship} •{" "}
                              {viewEmployee.emergencyContact.phone}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500 italic">
                            Not provided
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* GUARANTORS TAB */}
              {modalTab === "guarantors" && (
                <div className="space-y-4 text-left">
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg text-sm flex items-start gap-3">
                    <i className="fas fa-info-circle mt-0.5"></i>
                    <p>
                      Guarantor verification is critical for roles handling
                      finances or customer data. Ensure background checks are
                      completed before changing status.
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <h3 className="font-bold text-slate-800">
                      <i className="fas fa-user-shield text-[#02275A] mr-2"></i>{" "}
                      Guarantors Information
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingGuarantor(!isAddingGuarantor);
                        setGuarantorForm({
                          name: "",
                          phone: "",
                          email: "",
                          relationship: "Uncle",
                          address: "",
                          verified: false,
                        });
                      }}
                      className="bg-[#02275A] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#02275A]/90 transition-colors flex items-center gap-1"
                    >
                      <i
                        className={`fas ${isAddingGuarantor ? "fa-times" : "fa-plus"}`}
                      ></i>{" "}
                      {isAddingGuarantor ? "Cancel" : "Add Guarantor"}
                    </button>
                  </div>

                  {isAddingGuarantor && (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (
                          !guarantorForm.name ||
                          !guarantorForm.phone ||
                          !guarantorForm.relationship ||
                          !guarantorForm.address
                        ) {
                          return;
                        }
                        const updatedEmployee = {
                          ...viewEmployee,
                          guarantors: [
                            ...(viewEmployee.guarantors || []),
                            guarantorForm,
                          ],
                        };
                        setViewEmployee(updatedEmployee);
                        setEmployees((prev) =>
                          prev.map((emp) =>
                            emp.id === viewEmployee.id ? updatedEmployee : emp,
                          ),
                        );
                        setIsAddingGuarantor(false);
                        showSuccess(
                          `Guarantor "${guarantorForm.name}" added successfully.`,
                        );
                      }}
                      className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 animate-fade-in text-slate-700"
                    >
                      <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2">
                        New Guarantor
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">
                            Full Name *
                          </label>
                          <input
                            required
                            type="text"
                            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-[#02275A]"
                            value={guarantorForm.name}
                            onChange={(v) =>
                              setGuarantorForm({
                                ...guarantorForm,
                                name: v.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">
                            Phone Number *
                          </label>
                          <input
                            required
                            type="text"
                            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-[#02275A]"
                            value={guarantorForm.phone}
                            onChange={(v) =>
                              setGuarantorForm({
                                ...guarantorForm,
                                phone: v.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-[#02275A]"
                            value={guarantorForm.email || ""}
                            onChange={(v) =>
                              setGuarantorForm({
                                ...guarantorForm,
                                email: v.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">
                            Relationship *
                          </label>
                          <select
                            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:border-[#02275A] focus:outline-none"
                            value={guarantorForm.relationship}
                            onChange={(v) =>
                              setGuarantorForm({
                                ...guarantorForm,
                                relationship: v.target.value,
                              })
                            }
                          >
                            <option value="Uncle">Uncle</option>
                            <option value="Aunt">Aunt</option>
                            <option value="Father">Father</option>
                            <option value="Mother">Mother</option>
                            <option value="Spouse">Spouse</option>
                            <option value="Former Manager">
                              Former Manager
                            </option>
                            <option value="Former Colleague">
                              Former Colleague
                            </option>
                            <option value="Professional Reference">
                              Professional Reference
                            </option>
                            <option value="Family Friend">Family Friend</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">
                          Home/Office Address *
                        </label>
                        <textarea
                          required
                          rows={2}
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-[#02275A]"
                          value={guarantorForm.address}
                          onChange={(v) =>
                            setGuarantorForm({
                              ...guarantorForm,
                              address: v.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          id="guarantor_verified"
                          type="checkbox"
                          className="w-4 h-4 text-[#02275A] rounded border-slate-300 focus:ring-0"
                          checked={guarantorForm.verified}
                          onChange={(v) =>
                            setGuarantorForm({
                              ...guarantorForm,
                              verified: v.target.checked,
                            })
                          }
                        />
                        <label
                          htmlFor="guarantor_verified"
                          className="text-xs text-slate-600"
                        >
                          Mark as verified (Background check passed)
                        </label>
                      </div>
                      <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setIsAddingGuarantor(false)}
                          className="px-4 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-[#02275A] text-white rounded-lg text-xs font-bold hover:bg-[#02275A]/90 transition-colors shadow-sm"
                        >
                          Save Guarantor
                        </button>
                      </div>
                    </form>
                  )}

                  {viewEmployee.guarantors &&
                  viewEmployee.guarantors.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {viewEmployee.guarantors.map((guarantor, i) => (
                        <div
                          key={i}
                          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative text-left"
                        >
                          {guarantor.verified && (
                            <span className="absolute top-4 right-4 bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                              <i className="fas fa-check-circle"></i> Verified
                            </span>
                          )}
                          {!guarantor.verified && (
                            <span className="absolute top-4 right-4 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                              <i className="fas fa-clock"></i> Pending
                            </span>
                          )}

                          <h4 className="font-bold text-slate-800 text-lg mb-1">
                            {guarantor.name}
                          </h4>
                          <p className="text-xs text-indigo-600 font-bold uppercase tracking-wide mb-4">
                            {guarantor.relationship}
                          </p>

                          <div className="space-y-2 mt-4 text-sm text-slate-600">
                            <div className="flex gap-3">
                              <i className="fas fa-phone mt-1 text-slate-400 w-4"></i>{" "}
                              <span>{guarantor.phone}</span>
                            </div>
                            {guarantor.email && (
                              <div className="flex gap-3">
                                <i className="fas fa-envelope mt-1 text-slate-400 w-4"></i>{" "}
                                <span>{guarantor.email}</span>
                              </div>
                            )}
                            <div className="flex gap-3">
                              <i className="fas fa-map-marker-alt mt-1 text-slate-400 w-4"></i>{" "}
                              <span>{guarantor.address}</span>
                            </div>
                          </div>

                          {!guarantor.verified && (
                            <button
                              onClick={() => {
                                const updatedGuarantors = [
                                  ...viewEmployee.guarantors,
                                ];
                                updatedGuarantors[i] = {
                                  ...guarantor,
                                  verified: true,
                                };
                                const updatedEmployee = {
                                  ...viewEmployee,
                                  guarantors: updatedGuarantors,
                                };
                                setViewEmployee(updatedEmployee);
                                setEmployees((prev) =>
                                  prev.map((emp) =>
                                    emp.id === viewEmployee.id
                                      ? updatedEmployee
                                      : emp,
                                  ),
                                );
                                showSuccess(
                                  `Verification started for ${guarantor.name}. Mark as verified.`,
                                );
                              }}
                              className="mt-5 w-full bg-slate-50 border border-slate-200 text-slate-700 py-2 rounded-lg text-sm font-bold hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                            >
                              Mark as Verified
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 text-2xl mx-auto mb-3">
                        <i className="fas fa-user-shield"></i>
                      </div>
                      <h4 className="font-bold text-slate-700">
                        No Guarantors Recorded
                      </h4>
                      <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                        This employee has not provided guarantor information
                        yet.
                      </p>
                      <button
                        onClick={() => {
                          setIsAddingGuarantor(true);
                          setGuarantorForm({
                            name: "",
                            phone: "",
                            email: "",
                            relationship: "Uncle",
                            address: "",
                            verified: false,
                          });
                        }}
                        className="mt-4 text-[#02275A] font-bold text-sm bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        Add Guarantor Details
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* LEAVE TAB */}
              {modalTab === "leave" && (
                <div className="space-y-4 text-left">
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm animate-fade-in">
                    <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                      <i className="fas fa-umbrella-beach text-[#02275A]"></i>
                      <span>Leave History & Requests</span>
                    </h3>
                    
                    {(() => {
                      const allSaved = localStorage.getItem("company_leave_requests");
                      const parsed = allSaved ? JSON.parse(allSaved) : [];
                      const employeeLeaves = parsed.filter((r: any) => r.employeeEmail === viewEmployee.email);
                      
                      if (employeeLeaves.length === 0) {
                        return (
                          <div className="p-8 text-center text-slate-400 font-medium text-xs">
                            No leave requests recorded for this employee.
                          </div>
                        );
                      }
                      
                      return (
                        <div className="overflow-x-auto mt-4">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                <th className="py-3 px-2">Type</th>
                                <th className="py-3 px-2">Dates</th>
                                <th className="py-3 px-2">Reason</th>
                                <th className="py-3 px-2">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100/60">
                              {employeeLeaves.map((req: any) => {
                                const statusClass = 
                                  req.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                  req.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                  'bg-amber-50 text-amber-700 border-amber-100';
                                  
                                return (
                                  <tr key={req.id} className="text-xs hover:bg-slate-50/50">
                                    <td className="py-3 px-2 font-bold text-[#02275A]">{req.type}</td>
                                    <td className="py-3 px-2 text-slate-600 font-medium whitespace-nowrap">
                                      {req.startDate} to {req.endDate}
                                    </td>
                                    <td className="py-3 px-2 text-slate-500 max-w-xs">
                                      <div className="truncate" title={req.reason}>{req.reason}</div>
                                      {req.status === 'Rejected' && req.rejectionComment && (
                                        <div className="text-[10px] text-rose-600 font-bold bg-rose-50/70 p-1 px-1.5 rounded border border-rose-100/60 mt-1 max-w-xs break-words">
                                          Comment: {req.rejectionComment}
                                        </div>
                                      )}
                                    </td>
                                    <td className="py-3 px-2">
                                      <span className={`inline-block px-2 py-0.5 text-[9px] font-bold border rounded-full uppercase ${statusClass}`}>
                                        {req.status}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* DOCUMENTS TAB */}
              {modalTab === "documents" && (
                <div className="space-y-4 text-left">
                  <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800">
                      <i className="fas fa-folder-open text-amber-500 mr-2"></i>{" "}
                      Employee Folder
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setIsUploadingDoc(!isUploadingDoc);
                        setDocForm({
                          type: "ID Card",
                          name: "",
                        });
                      }}
                      className="bg-[#02275A] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#02275A]/90 transition-colors flex items-center gap-1"
                    >
                      <i
                        className={`fas ${isUploadingDoc ? "fa-times" : "fa-cloud-upload-alt"}`}
                      ></i>{" "}
                      {isUploadingDoc ? "Cancel" : "Upload New"}
                    </button>
                  </div>

                  {isUploadingDoc && (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!docForm.name) return;
                        const docToAdd: EmployeeDocument = {
                          id: `doc-${Date.now()}`,
                          type: docForm.type,
                          name: docForm.name,
                          status: "Verified",
                          uploadDate: new Date().toISOString().split("T")[0],
                        };
                        const updatedEmployee = {
                          ...viewEmployee,
                          documents: [
                            ...(viewEmployee.documents || []),
                            docToAdd,
                          ],
                        };
                        setViewEmployee(updatedEmployee);
                        setEmployees((prev) =>
                          prev.map((emp) =>
                            emp.id === viewEmployee.id ? updatedEmployee : emp,
                          ),
                        );
                        setIsUploadingDoc(false);
                        showSuccess(
                          `Document "${docForm.name}" has been uploaded.`,
                        );
                      }}
                      className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 animate-fade-in text-slate-700"
                    >
                      <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2">
                        Upload Employee Document
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">
                            Document Type *
                          </label>
                          <select
                            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:border-[#02275A] focus:outline-none"
                            value={docForm.type}
                            onChange={(v) =>
                              setDocForm({
                                ...docForm,
                                type: v.target.value as any,
                              })
                            }
                          >
                            <option value="ID Card">
                              ID Card (National ID, Passport, Driver's License)
                            </option>
                            <option value="Degree Certificate">
                              Degree & Academy Certificate
                            </option>
                            <option value="Resume">
                              Resume / Curriculum Vitae
                            </option>
                            <option value="Offer Letter">
                              Signed Offer Letter
                            </option>
                            <option value="Other">Other Document</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">
                            Document File Name *
                          </label>
                          <input
                            required
                            type="text"
                            placeholder="e.g. Passport_Copy.pdf or BSc_Degree.pdf"
                            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-[#02275A]"
                            value={docForm.name}
                            onChange={(v) =>
                              setDocForm({ ...docForm, name: v.target.value })
                            }
                          />
                        </div>
                      </div>

                      {/* File dropzone mockup since we are frontend local state */}
                      <div className="border-2 border-dashed border-slate-200 hover:border-[#02275A] rounded-xl p-6 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-50">
                        <i className="fas fa-file-upload text-3xl text-slate-300"></i>
                        <span className="text-xs text-slate-600 font-bold">
                          Drag and drop file here, or click to browse
                        </span>
                        <span className="text-[10px] text-slate-400">
                          PDF, JPG, PNG or DOCX up to 10MB
                        </span>
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setIsUploadingDoc(false)}
                          className="px-4 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-[#02275A] text-white rounded-lg text-xs font-bold hover:bg-[#02275A]/90 transition-colors shadow-sm"
                        >
                          Upload & Verify
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                          <th className="p-4">Document Type</th>
                          <th className="p-4">Name</th>
                          <th className="p-4">Date Uploaded</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {viewEmployee.documents &&
                        viewEmployee.documents.length > 0 ? (
                          viewEmployee.documents.map((doc) => (
                            <tr
                              key={doc.id}
                              className="hover:bg-slate-50 transition-colors"
                            >
                              <td className="p-4 text-sm font-bold text-slate-700">
                                {doc.type}
                              </td>
                              <td className="p-4 text-sm text-[#02275A] font-medium flex items-center gap-2">
                                <i className="fas fa-file-pdf text-rose-400"></i>{" "}
                                {doc.name}
                              </td>
                              <td className="p-4 text-sm text-slate-500">
                                {new Date(doc.uploadDate).toLocaleDateString()}
                              </td>
                              <td className="p-4">
                                <span
                                  className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                                    doc.status === "Verified"
                                      ? "bg-emerald-100 text-emerald-700"
                                      : doc.status === "Pending"
                                        ? "bg-amber-100 text-amber-700"
                                        : "bg-rose-100 text-rose-700"
                                  }`}
                                >
                                  {doc.status}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <button className="text-slate-400 hover:text-[#02275A] transition-colors">
                                  <i className="fas fa-download"></i>
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={5}
                              className="p-8 text-center text-slate-500"
                            >
                              No documents have been uploaded for this employee.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* GRADES & PENALTIES AUDIT TAB */}
              {modalTab === "grades_audit" && (
                <div className="space-y-6">
                  {/* Compact Stacked Filter Panel */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-2xs mb-4 space-y-4" id="admin-unified-filter-panel">
                    {/* Header Row */}
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                          <i className="fas fa-filter text-xs"></i>
                        </div>
                        <div className="text-left">
                          <h4 className="font-extrabold text-[#02275A] text-sm">Filter History</h4>
                          <p className="text-[11px] text-slate-400">Affects cards, logs & metrics</p>
                        </div>
                      </div>
                      
                      {/* Reset Link */}
                      {(adminFilterPeriod !== "All" || adminFilterDateType !== "All" || adminFilterYear !== "All") && (
                        <button
                          type="button"
                          onClick={() => {
                            setAdminFilterPeriod("All");
                            setAdminFilterDateType("All");
                            setAdminFilterYear("All");
                          }}
                          className="text-[11px] text-rose-600 hover:text-rose-800 font-bold transition-colors cursor-pointer flex items-center gap-1.5 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100"
                        >
                          <i className="fas fa-undo text-[9px]"></i> Clear Filters
                        </button>
                      )}
                    </div>

                    {/* Filter Inputs Area */}
                    <div className="space-y-4">
                      {/* Grid containing Period, Date Type, and Year filters together on the same line */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Field: Period */}
                        <div className="flex flex-col gap-1.5 text-left">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Period</span>
                          <select
                            className="w-full bg-white border border-slate-200 hover:border-indigo-300 text-xs rounded-lg px-3 py-2 outline-none focus:border-[#02275A] font-semibold text-slate-700 shadow-3xs"
                            value={adminFilterPeriod}
                            onChange={(e) => setAdminFilterPeriod(e.target.value)}
                          >
                            <option value="All">All Periods</option>
                            {adminHistoricalPeriods.map((p) => (
                              <option key={p.key} value={p.key}>{p.month} {p.year}</option>
                            ))}
                          </select>
                        </div>

                        {/* Field: Date Type */}
                        <div className="flex flex-col gap-1.5 text-left">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date Type</span>
                          <select
                            className="w-full bg-white border border-slate-200 hover:border-indigo-300 text-xs rounded-lg px-3 py-2 outline-none focus:border-[#02275A] font-semibold text-slate-700 shadow-3xs"
                            value={adminFilterDateType}
                            onChange={(e) => setAdminFilterDateType(e.target.value as any)}
                          >
                            <option value="All">All Types</option>
                            <option value="weekly">Weekly Only</option>
                            <option value="monthly">Monthly Only</option>
                          </select>
                        </div>

                        {/* Field: Year */}
                        <div className="flex flex-col gap-1.5 text-left">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Year</span>
                          <select
                            className="w-full bg-white border border-slate-200 hover:border-indigo-300 text-xs rounded-lg px-3 py-2 outline-none focus:border-[#02275A] font-semibold text-slate-700 shadow-3xs"
                            value={adminFilterYear}
                            onChange={(e) => setAdminFilterYear(e.target.value)}
                          >
                            <option value="All">All Years</option>
                            {availableYears.map((yr) => (
                              <option key={yr} value={yr}>{yr}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* KPI Section */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 animate-fade-in text-left">
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-center">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Current Academic Grade
                      </p>
                      <div
                        className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black shadow-inner border border-slate-200 ${
                          filteredMetricsForViewEmployee.grade === "A+" ||
                          filteredMetricsForViewEmployee.grade === "A"
                            ? "bg-emerald-100 text-emerald-800"
                            : filteredMetricsForViewEmployee.grade === "B+" ||
                                filteredMetricsForViewEmployee.grade === "B"
                              ? "bg-blue-100 text-blue-800"
                              : filteredMetricsForViewEmployee.grade === "C"
                                ? "bg-amber-100 text-amber-800"
                                : filteredMetricsForViewEmployee.grade === "D"
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {filteredMetricsForViewEmployee.grade || "B+"}
                      </div>
                      <p className="text-xs text-slate-400 mt-2">
                        Overall Quality Rating
                      </p>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-center">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Reward Points
                      </p>
                      <div className="mx-auto w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-xl font-black border border-amber-100 font-mono">
                        {filteredMetricsForViewEmployee.rewardPoints}
                      </div>
                      <p className="text-xs text-slate-400 mt-2">
                        Separate Redeemable Metric
                      </p>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-center">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Performance Score
                      </p>
                      <div className="mx-auto w-16 h-16 rounded-full bg-indigo-50 text-indigo-650 flex items-center justify-center text-xl font-black border border-indigo-100 font-mono">
                        {filteredMetricsForViewEmployee.score}%
                      </div>
                      <p className="text-xs text-slate-400 mt-2">
                        Current Performance Rating
                      </p>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-center">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Average Score
                      </p>
                      <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-black border border-emerald-100 font-mono">
                        {filteredMetricsForViewEmployee.avgScore}%
                      </div>
                      <p className="text-xs text-slate-400 mt-2">
                        Historical Cycles Average
                      </p>
                    </div>

                    {/* Net Points Card */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-center" id="admin-net-points-card">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-center gap-1.5">
                        <i className="fas fa-scale-balanced text-emerald-500"></i> Net Points Balance
                      </p>
                      <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-black border border-emerald-100 font-mono" id="admin-net-points-value">
                        {(() => {
                          const roleLower = (viewEmployee.role || "").toLowerCase();
                          const isCallAgent = roleLower.includes("support representative") || roleLower.includes("call agent");
                          const value = filteredMetricsForViewEmployee.netPoints;
                          return isCallAgent ? `${value}%` : `${value}`;
                        })()}
                      </div>
                      <p className="text-xs text-slate-400 mt-2">
                        Aggregate Rating Score
                      </p>
                    </div>
                  </div>

                  {(() => {
                    const totalAssignedRatingPoints = viewEmployee.gradeAuditTrail?.reduce((sum: number, entry: any) => sum + (entry.ratingPoints || 0), 0) || 0;
                    if (totalAssignedRatingPoints > 0) {
                      return (
                        <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-sans text-left animate-fade-in shadow-2xs">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                              <i className="fas fa-star text-base text-amber-500 animate-pulse"></i>
                            </div>
                            <div>
                              <h4 className="font-bold text-emerald-900 text-sm md:text-base">
                                Active Monthly Rating Points Reward
                              </h4>
                              <p className="text-emerald-800 text-xs mt-1 md:max-w-xl leading-relaxed font-medium">
                                This employee has been awarded a cumulative total of <strong className="font-extrabold text-emerald-950">+{totalAssignedRatingPoints} Rating Points</strong> from their performance evaluations. These points directly boost their calculated monthly averages and final academic grades!
                              </p>
                            </div>
                          </div>
                          <span className="inline-block px-3 py-1.5 bg-emerald-100 border border-emerald-300 text-emerald-900 font-black text-xs rounded-lg shadow-sm whitespace-nowrap uppercase tracking-wider">
                            ★ +{totalAssignedRatingPoints} Rating Points
                          </span>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* Action Box: Separate Penalty & Reward Forms */}
                  {!openedFromPerformance &&
                    (userRole === "admin" || userRole === "hr") && (
                      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-left mb-6">
                        {/* Sub-tabs header to ensure rewards and penalties are added on separate sub-views */}
                        <div className="flex border-b border-slate-200 bg-slate-50/70 p-1.5 gap-1">
                          <button
                            type="button"
                            onClick={() => setGradesActionTab("penalty")}
                            className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                              gradesActionTab === "penalty"
                                ? "bg-rose-600 text-white shadow-xs"
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            }`}
                          >
                            <i className="fas fa-gavel"></i>
                            <span>Log Penalty / Disciplinary Action</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setGradesActionTab("reward")}
                            className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                              gradesActionTab === "reward"
                                ? "bg-emerald-600 text-white shadow-xs"
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            }`}
                          >
                            <i className="fas fa-gift"></i>
                            <span>Award Reward / Citation Points</span>
                          </button>
                        </div>

                        {/* Penalty Sub-view */}
                        {gradesActionTab === "penalty" ? (
                          <div className="p-6 space-y-4 font-sans text-slate-705 text-left animate-fade-in">
                            <div>
                              <h3 className="font-extrabold text-[#02275A] text-base flex items-center gap-1.5">
                                <i className="fas fa-shield-halved text-rose-500"></i> Record Disciplinary Infraction & Penalty
                              </h3>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Log formal policy breaches. Penalties deduct rewards points from their ledger, reduce their net points, and lower monthly performance scores.
                              </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                                  Approved Policy Infraction
                                </label>
                                <select
                                  value={selectedViolationCategory}
                                  onChange={(e) =>
                                    setSelectedViolationCategory(e.target.value)
                                  }
                                  className="w-full px-4 py-2 bg-white border border-slate-200 text-slate-705 text-sm rounded-lg hover:border-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-[#02275A]/20 font-medium"
                                >
                                  <option value="Repeated Lateness">
                                    Repeated Lateness (Penalty: 10 pts & 1 Tier Downgrade)
                                  </option>
                                  <option value="Attendance Violations">
                                    Attendance Violations (Penalty: 15 pts & 1 Tier Downgrade)
                                  </option>
                                  <option value="Disciplinary Actions">
                                    Disciplinary Actions (Penalty: 30 pts & 2 Tiers Downgrade)
                                  </option>
                                  <option value="Customer Complaints">
                                    Customer Complaints (Penalty: 15 pts & 1 Tier Downgrade)
                                  </option>
                                  <option value="Performance Misconduct">
                                    Performance Misconduct (Penalty: 25 pts & 2 Tiers Downgrade)
                                  </option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                                  Approving Authority Title / Name
                                </label>
                                <input
                                  type="text"
                                  value={policyApprover}
                                  onChange={(e) =>
                                    setPolicyApprover(e.target.value)
                                  }
                                  className="w-full px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm rounded-lg hover:border-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-[#02275A]/20 font-medium"
                                  placeholder="e.g. Head of Customer Success"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                                Audit Brief & Incident Details
                              </label>
                              <textarea
                                value={violationNotes}
                                onChange={(e) => setViolationNotes(e.target.value)}
                                rows={2}
                                placeholder="Write a clear statement of context justifying the policy enforcement and audit trail..."
                                className="w-full px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:outline-none focus:border-[#02275A] transition-colors"
                              />
                            </div>

                            {(() => {
                              const currentGrade = viewEmployee.grade || "B+";
                              const tierLevels =
                                selectedViolationCategory === "Disciplinary Actions" ||
                                selectedViolationCategory === "Performance Misconduct"
                                  ? 2
                                  : 1;

                              const gradesList: ("A+" | "A" | "B+" | "B" | "C" | "D" | "F")[] = ["A+", "A", "B+", "B", "C", "D", "F"];
                              const cg = (currentGrade || "B+") as any;
                              const currentIndex = gradesList.indexOf(cg);
                              const nextIndex =
                                currentIndex === -1
                                  ? gradesList.length - 1
                                  : Math.min(gradesList.length - 1, currentIndex + tierLevels);
                              const nextGrade = gradesList[nextIndex];

                              const demeritPointsMap: Record<string, number> = {
                                "Repeated Lateness": 10,
                                "Attendance Violations": 15,
                                "Disciplinary Actions": 30,
                                "Customer Complaints": 15,
                                "Performance Misconduct": 25,
                              };
                              const demeritPoints = demeritPointsMap[selectedViolationCategory] || 10;

                              return (
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                  <div className="flex items-start gap-2.5">
                                    <i className="fas fa-exclamation-triangle mt-1 text-amber-600 text-sm"></i>
                                    <div>
                                      <h5 className="font-bold text-amber-800 text-sm">
                                        Disciplinary Penalty Impact
                                      </h5>
                                      <p className="text-xs text-amber-700 mt-0.5">
                                        This will deduct <span className="font-bold text-rose-700 font-mono">-{demeritPoints} points</span> from their rewards ledger, lower current month net points, and automatically drop their grade from <span className="font-semibold">{currentGrade}</span> to <span className="font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">{nextGrade}</span>.
                                      </p>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (!policyApprover.trim()) {
                                        alert("Please specify the Approving Authority.");
                                        return;
                                      }
                                      const prev = currentGrade;
                                      const updatedGrade = nextGrade;
                                      const pointsToDeduct = demeritPoints;

                                      const updatedRewardPoints = Math.max(0, (viewEmployee.rewardPoints !== undefined ? viewEmployee.rewardPoints : 100) - pointsToDeduct);

                                      // Create audit trail entry
                                      const auditEntry: GradeAuditEntry = {
                                        id: Date.now().toString(),
                                        previousGrade: prev as any,
                                        newGrade: updatedGrade as any,
                                        policyResponsible: selectedViolationCategory,
                                        dateOfChange: new Date().toISOString().split("T")[0],
                                        approvingAuthority: policyApprover,
                                        reason: `${violationNotes.trim() || "No notes specified."} (Demerit Applied: -${pointsToDeduct} pts)`,
                                      };

                                      // Create localStorage penalty record mapped to the current month
                                      const penaltyRecord = {
                                        id: "PEN-" + Date.now(),
                                        employee_id: String(viewEmployee.id),
                                        period_id: `${new Date().toLocaleString('en-US', { month: 'long' })} ${new Date().getFullYear()}`,
                                        reward_type: `Penalty - ${selectedViolationCategory}`,
                                        points: -pointsToDeduct,
                                        reason: violationNotes.trim() || `Policy breach: ${selectedViolationCategory}`,
                                        source: "HR Center (Policy Enforcement)",
                                        related_record_id: "N/A",
                                        created_by: policyApprover,
                                        created_at: new Date().toISOString(),
                                        type: "penalty"
                                      };

                                      const savedRewards = localStorage.getItem('company_rewards_history_list');
                                      let list: any[] = [];
                                      if (savedRewards) {
                                        try { list = JSON.parse(savedRewards); } catch(e) {}
                                      }
                                      list.unshift(penaltyRecord);
                                      localStorage.setItem('company_rewards_history_list', JSON.stringify(list));

                                      const updatedEmployee: Employee = {
                                        ...viewEmployee,
                                        grade: updatedGrade as any,
                                        rewardPoints: updatedRewardPoints,
                                        gradeAuditTrail: [
                                          auditEntry,
                                          ...(viewEmployee.gradeAuditTrail || []),
                                        ],
                                      };

                                      // Propagate to main React state
                                      setEmployees((prevList) =>
                                        prevList.map((e) =>
                                          e.id === viewEmployee.id ? updatedEmployee : e,
                                        ),
                                      );
                                      // Update current view pointer
                                      setViewEmployee(updatedEmployee);
                                      // Clear notes
                                      setViolationNotes("");

                                      showSuccess(`Grade reduced and -${pointsToDeduct} penalty points applied successfully!`);
                                    }}
                                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-black shadow-sm transition-colors cursor-pointer flex items-center gap-1 self-end md:self-auto uppercase tracking-wider"
                                  >
                                    <i className="fas fa-caret-down"></i> Apply Grade Penalty
                                  </button>
                                </div>
                              );
                            })()}
                          </div>
                        ) : (
                          /* Reward Sub-view */
                          <div className="p-6 space-y-4 font-sans text-slate-705 text-left animate-fade-in">
                            <div>
                              <h3 className="font-extrabold text-[#02275A] text-base flex items-center gap-1.5">
                                <i className="fas fa-award text-emerald-500"></i> Award Reward & Recognition Points
                              </h3>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Acknowledge outstanding performance, leadership, or customer satisfaction accomplishments. Rewards increase the employee's Net Points balance without altering base grades.
                              </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                                  Reward Category
                                </label>
                                <select
                                  value={selectedRewardCategory}
                                  onChange={(e) => setSelectedRewardCategory(e.target.value)}
                                  className="w-full px-4 py-2 bg-white border border-slate-200 text-slate-705 text-sm rounded-lg hover:border-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-[#02275A]/20 font-medium"
                                >
                                  <option value="Performance Excellence">Performance Excellence</option>
                                  <option value="Innovation Award">Innovation Award</option>
                                  <option value="Client Satisfaction Champ">Client Satisfaction Champ</option>
                                  <option value="SLA Speed Master">SLA Speed Master</option>
                                  <option value="Team Collaboration">Team Collaboration</option>
                                  <option value="Overtime Support">Overtime Support</option>
                                  <option value="Customer Feedback Praise">Customer Feedback Praise</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                                  Points to Award
                                </label>
                                <input
                                  type="number"
                                  min={1}
                                  max={200}
                                  value={rewardPointsToAward}
                                  onChange={(e) => setRewardPointsToAward(Math.max(1, Number(e.target.value)))}
                                  className="w-full px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm rounded-lg hover:border-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-[#02275A]/20 font-mono font-bold"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                                  Approving Authority
                                </label>
                                <input
                                  type="text"
                                  value={rewardApprover}
                                  onChange={(e) => setRewardApprover(e.target.value)}
                                  className="w-full px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm rounded-lg hover:border-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-[#02275A]/20 font-medium"
                                  placeholder="e.g. HR Director"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                                Award Citation & Achievement Details
                              </label>
                              <textarea
                                value={rewardNotes}
                                onChange={(e) => setRewardNotes(e.target.value)}
                                rows={2}
                                placeholder="Write a citation detailing the specific achievement justifying this reward..."
                                className="w-full px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:outline-none focus:border-[#02275A] transition-colors"
                              />
                            </div>

                            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex items-start gap-2.5">
                                <i className="fas fa-gift mt-1 text-emerald-600 text-sm"></i>
                                <div>
                                  <h5 className="font-bold text-emerald-800 text-sm">
                                    Reward Ledger Impact
                                  </h5>
                                  <p className="text-xs text-emerald-700 mt-0.5">
                                    This will add <span className="font-bold text-emerald-700 font-mono">+{rewardPointsToAward} points</span> to the employee's rewards balance for the current month. Their grade and performance rating scores will remain secure and unchanged.
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  if (!rewardApprover.trim()) {
                                    alert("Please specify the Approving Authority.");
                                    return;
                                  }
                                  const pointsToAward = Number(rewardPointsToAward) || 20;
                                  const updatedRewardPoints = (viewEmployee.rewardPoints !== undefined ? viewEmployee.rewardPoints : 100) + pointsToAward;

                                  // Create audit trail entry
                                  const auditEntry: GradeAuditEntry = {
                                    id: Date.now().toString(),
                                    previousGrade: (viewEmployee.grade || "B+") as any,
                                    newGrade: `Points: ${updatedRewardPoints}` as any,
                                    policyResponsible: "Reward Achievement",
                                    dateOfChange: new Date().toISOString().split("T")[0],
                                    approvingAuthority: rewardApprover,
                                    reason: `${rewardNotes.trim() || "Awarded for excellence."} (Category: ${selectedRewardCategory}, Awarded: +${pointsToAward} pts)`,
                                  };

                                  // Create localStorage reward record mapped to the current month
                                  const rewardRecord = {
                                    id: "RWD-" + Date.now(),
                                    employee_id: String(viewEmployee.id),
                                    period_id: `${new Date().toLocaleString('en-US', { month: 'long' })} ${new Date().getFullYear()}`,
                                    reward_type: selectedRewardCategory,
                                    points: pointsToAward,
                                    reason: rewardNotes.trim() || `Achievement praise: ${selectedRewardCategory}`,
                                    source: "HR Center (Reward & Recognition)",
                                    related_record_id: "N/A",
                                    created_by: rewardApprover,
                                    created_at: new Date().toISOString(),
                                    type: "reward"
                                  };

                                  const savedRewards = localStorage.getItem('company_rewards_history_list');
                                  let list: any[] = [];
                                  if (savedRewards) {
                                    try { list = JSON.parse(savedRewards); } catch(e) {}
                                  }
                                  list.unshift(rewardRecord);
                                  localStorage.setItem('company_rewards_history_list', JSON.stringify(list));

                                  const updatedEmployee: Employee = {
                                    ...viewEmployee,
                                    rewardPoints: updatedRewardPoints,
                                    gradeAuditTrail: [
                                      auditEntry,
                                      ...(viewEmployee.gradeAuditTrail || []),
                                    ],
                                  };

                                  // Propagate to main React state
                                  setEmployees((prevList) =>
                                    prevList.map((e) =>
                                      e.id === viewEmployee.id ? updatedEmployee : e,
                                    ),
                                  );
                                  // Update current view pointer
                                  setViewEmployee(updatedEmployee);
                                  // Clear inputs
                                  setRewardNotes("");
                                  setRewardPointsToAward(20);

                                  showSuccess(`Reward points (+${pointsToAward} pts) granted successfully!`);
                                }}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black shadow-sm transition-colors cursor-pointer flex items-center gap-1 self-end md:self-auto uppercase tracking-wider"
                              >
                                <i className="fas fa-check"></i> Grant Reward Points
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                  {/* Monthly Summary & History Accordion Section */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mt-6 text-left" id="admin-monthly-history-summary-section">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-4">
                      <div>
                        <h3 className="font-extrabold text-[#02275A] text-base flex items-center gap-2">
                          <i className="fas fa-clock-rotate-left text-[#02275A]"></i>
                          <span>Monthly Performance Summary & History</span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          Comprehensive visual archive of historical performance metrics, grades, and week-by-week evaluations.
                        </p>
                      </div>
                      <span className="bg-[#02275A] text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full text-center">
                        Interactive View
                      </span>
                    </div>

                    {filteredAdminHistoricalPeriods.length === 0 ? (
                      <div className="text-center p-8 text-slate-400 italic font-medium text-xs border border-dashed border-slate-200 rounded-xl bg-white">
                        No historical performance cycles found matching the active filters.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredAdminHistoricalPeriods.map((period) => {
                          const summary = getAdminPeriodSummary(period);
                          const isExpanded = adminExpandedPeriodKey === period.key;

                          return (
                            <div
                              key={period.key}
                              className="bg-white border border-slate-200 rounded-xl overflow-hidden transition-all duration-300 shadow-xs hover:border-[#02275A]/30"
                            >
                              {/* Accordion Trigger Header */}
                              <button
                                type="button"
                                onClick={() => setAdminExpandedPeriodKey(isExpanded ? null : period.key)}
                                className="w-full px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 hover:bg-slate-50 transition-colors text-left"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-[#02275A]/5 text-[#02275A] flex items-center justify-center font-bold text-sm">
                                    <i className="far fa-calendar-alt"></i>
                                  </div>
                                  <div>
                                    <h4 className="font-black text-[#02275A] text-sm md:text-base flex items-center gap-2">
                                      {period.month} {period.year}
                                      {isExpanded ? (
                                        <i className="fas fa-chevron-up text-xs text-slate-400"></i>
                                      ) : (
                                        <i className="fas fa-chevron-down text-xs text-slate-400"></i>
                                      )}
                                    </h4>
                                    <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mt-0.5">
                                      {period.weeks.length} Weeks Evaluated
                                    </p>
                                  </div>
                                </div>

                                {/* Quick Metrics Grid inside Header */}
                                <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-6 shrink-0 bg-white md:bg-transparent p-3 md:p-0 rounded-lg border border-slate-100 md:border-0">
                                  <div className="text-center md:text-right">
                                    <span className="block text-[9px] font-black uppercase text-slate-400 tracking-wider">Total Score</span>
                                    <span className="text-xs md:text-sm font-extrabold text-[#02275A] font-mono">{summary.totalScore}</span>
                                  </div>
                                  <div className="text-center md:text-right">
                                    <span className="block text-[9px] font-black uppercase text-slate-400 tracking-wider">Avg Score</span>
                                    <span className="text-xs md:text-sm font-extrabold text-emerald-600 font-mono">{summary.avgScore}%</span>
                                  </div>
                                  <div className="text-center md:text-right">
                                    <span className="block text-[9px] font-black uppercase text-slate-400 tracking-wider">Grade</span>
                                    <span className="text-xs md:text-sm font-black text-indigo-600">{summary.grade}</span>
                                  </div>
                                  <div className="text-center md:text-right">
                                    <span className="block text-[9px] font-black uppercase text-emerald-500 tracking-wider">Rewards</span>
                                    <span className="text-xs md:text-sm font-extrabold text-emerald-600 font-mono">+{summary.rewards}</span>
                                  </div>
                                  <div className="text-center md:text-right">
                                    <span className="block text-[9px] font-black uppercase text-rose-500 tracking-wider">Penalties</span>
                                    <span className="text-xs md:text-sm font-extrabold text-rose-600 font-mono">-{summary.penalties}</span>
                                  </div>
                                  <div className="text-center md:text-right">
                                    <span className="block text-[9px] font-black uppercase text-slate-400 tracking-wider">Net Points</span>
                                    <span className={`text-xs md:text-sm font-extrabold font-mono ${summary.netPoints >= 0 ? 'text-teal-600' : 'text-rose-600'}`}>
                                      {summary.netPoints >= 0 ? `+${summary.netPoints}` : summary.netPoints}
                                    </span>
                                  </div>
                                </div>
                              </button>

                              {/* Accordion Content */}
                              {isExpanded && (
                                <div className="px-5 py-4 border-t border-slate-100 space-y-4 bg-white divide-y divide-slate-100 animate-fade-in">
                                  {/* Performance Rating evaluation details if present */}
                                  {adminFilterDateType !== "weekly" && (() => {
                                    const matchRatingAudit = viewEmployee.gradeAuditTrail?.find((audit: any) => {
                                      if (audit.type !== "rating") return false;
                                      let year = audit.ratingYear;
                                      let month = audit.ratingMonth;
                                      if (!year || !month) {
                                        if (audit.dateOfChange) {
                                          const [y, m] = audit.dateOfChange.split("-");
                                          const months = [
                                            "January", "February", "March", "April", "May", "June",
                                            "July", "August", "September", "October", "November", "December"
                                          ];
                                          year = y;
                                          month = months[parseInt(m, 10) - 1];
                                        }
                                      }
                                      return String(year) === String(period.year) && String(month).toLowerCase() === String(period.month).toLowerCase();
                                    });

                                    if (!matchRatingAudit) return null;

                                    return (
                                      <div className="pb-4" id={`monthly-rating-details-${period.key}`}>
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-indigo-50/40 p-4 rounded-xl border border-indigo-100 text-left animate-fade-in">
                                          <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                              <span className="px-2.5 py-0.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider rounded-md shadow-xs">
                                                ★ Performance Rating
                                              </span>
                                              <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                                                <i className="far fa-calendar-check text-indigo-400"></i> {matchRatingAudit.dateOfChange}
                                              </span>
                                            </div>
                                            <h4 className="font-extrabold text-slate-900 text-sm mt-2 flex items-center gap-1.5">
                                              <i className="fas fa-medal text-amber-500"></i> Performance Rated Point
                                            </h4>
                                            <p className="text-xs text-slate-600 mt-1 max-w-xl">
                                              {matchRatingAudit.reason || "Monthly appraisal with performance rating points."}
                                            </p>
                                            {matchRatingAudit.strengths && matchRatingAudit.strengths !== "No strengths specified." && (
                                              <p className="text-xs text-slate-500 mt-1">
                                                <strong>Strengths:</strong> {matchRatingAudit.strengths}
                                              </p>
                                            )}
                                            {matchRatingAudit.recommendations && matchRatingAudit.recommendations !== "No recommendations specified." && (
                                              <p className="text-xs text-slate-500 mt-0.5">
                                                <strong>Recommendations:</strong> {matchRatingAudit.recommendations}
                                              </p>
                                            )}
                                            <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
                                              <i className="far fa-user text-[9px]"></i>
                                              <span>Rater: <strong className="font-bold text-slate-600">{matchRatingAudit.approvingAuthority || "Admin / HR"}</strong></span>
                                            </div>
                                          </div>
                                          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 border-slate-200/50 pt-2 sm:pt-0 shrink-0">
                                            <div className="text-center sm:text-right">
                                              <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">Performance Score</span>
                                              <span className="text-sm font-black text-indigo-650 font-mono bg-indigo-50/50 border border-indigo-100 px-2 py-0.5 rounded-md">
                                                {matchRatingAudit.score !== undefined ? `${matchRatingAudit.score}%` : `${summary.totalScore}%`}
                                              </span>
                                            </div>
                                            <div className="text-center sm:text-right">
                                              <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">Average Score</span>
                                              <span className="text-sm font-black text-emerald-600 font-mono bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                                                {summary.avgScore}%
                                              </span>
                                            </div>
                                            <div className="text-center sm:text-right">
                                              <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">Rating Point</span>
                                              <span className="text-sm font-black text-rose-600 font-mono bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-md">
                                                {matchRatingAudit.ratingPoints !== undefined ? `+${matchRatingAudit.ratingPoints}` : "+0"} Pts
                                              </span>
                                            </div>
                                            <div className="text-center sm:text-right">
                                              <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">Grade Change</span>
                                              <span className="text-[11px] font-black text-indigo-700 bg-indigo-50 border border-indigo-150 px-2 py-0.5 rounded-md">
                                                {matchRatingAudit.previousGrade || "—"} → {matchRatingAudit.newGrade || "—"}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })()}

                                  {/* Monthly Review Status if present */}
                                  {adminFilterDateType !== "weekly" && period.monthlyReview && (
                                    <div className="pb-4">
                                      <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-center gap-2">
                                          <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-150 text-[#02275A] text-[9px] font-black uppercase tracking-wider rounded">
                                            Monthly Overview
                                          </span>
                                          <span className="text-xs text-slate-400 font-mono">{period.monthlyReview.dateCreated || "N/A"}</span>
                                        </div>
                                        <span className="text-xs font-black text-indigo-900 font-mono bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
                                          Score: {period.monthlyReview.performanceScore}%
                                        </span>
                                      </div>
                                      <p className="text-xs text-slate-600 italic mt-2 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                                        "{period.monthlyReview.comments}"
                                      </p>
                                      <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
                                        <i className="far fa-user"></i>
                                        <span>Reviewer: <strong className="font-bold text-slate-600">{period.monthlyReview.reviewer || "HR Committee"}</strong></span>
                                      </div>
                                    </div>
                                  )}

                                  {/* Week-by-Week breakdown */}
                                  {adminFilterDateType !== "monthly" && (
                                    <div className={period.monthlyReview ? "pt-4 space-y-4" : "space-y-4"}>
                                      <h5 className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                                        <i className="fas fa-list-ol text-[10px]"></i> Week-by-Week Performance Log
                                      </h5>
                                      
                                      {period.weeks.length === 0 ? (
                                        <p className="text-xs text-slate-400 italic py-2">No weekly logs entered for this month.</p>
                                      ) : (
                                        <div className="space-y-3">
                                          {period.weeks.map((weekItem: any) => (
                                            <div
                                              key={weekItem.id}
                                              className="bg-slate-50 hover:bg-slate-100/50 border border-slate-200/60 rounded-xl p-4 transition-colors text-left"
                                            >
                                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2 mb-2">
                                                <div className="flex items-center gap-2">
                                                  <i className="far fa-calendar-check text-[#02275A] text-xs"></i>
                                                  <span className="font-bold text-slate-800 text-xs sm:text-sm">{weekItem.week}</span>
                                                  <span className="text-[10px] text-slate-400 font-mono">({weekItem.dateCreated || "N/A"})</span>
                                                </div>
                                                <div className="flex items-center gap-2 self-end sm:self-auto">
                                                  <span className="text-[10px] px-1.5 py-0.5 bg-slate-200 text-slate-600 font-black rounded uppercase tracking-wider">
                                                    {weekItem.roleType || "Standard"}
                                                  </span>
                                                  <span className="px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 font-black font-mono text-xs rounded-full shadow-2xs">
                                                    Score: {weekItem.performanceScore}%
                                                  </span>
                                                </div>
                                              </div>
                                              <p className="text-xs text-slate-600 leading-relaxed italic bg-white p-2.5 rounded border border-slate-150">
                                                "{weekItem.comments}"
                                              </p>
                                              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                                                <span className="flex items-center gap-1">
                                                  <i className="far fa-user text-[9px]"></i>
                                                  <span>Reviewer: <strong className="font-semibold text-slate-600">{weekItem.reviewer || "System Administrator"}</strong></span>
                                                </span>
                                                <span className="text-slate-350">ID: {weekItem.id}</span>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* Rewards & Penalties Ledger */}
                                  <div className="pt-4">
                                    <h5 className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-3">
                                      <i className="fas fa-scale-balanced text-[10px]"></i> Logged Rewards & Penalties Ledger
                                    </h5>
                                    {(() => {
                                      let periodLogs: any[] = [];
                                      const savedRewards = localStorage.getItem('company_rewards_history_list');
                                      if (savedRewards && viewEmployee) {
                                        try {
                                          const list = JSON.parse(savedRewards) as any[];
                                          periodLogs = list.filter(r => {
                                            if (String(r.employee_id) !== String(viewEmployee.id)) return false;
                                            
                                            let isMatch = false;
                                            if (r.period_id) {
                                              const pid = r.period_id.toLowerCase();
                                              if (pid.includes(period.month.toLowerCase()) && pid.includes(period.year)) {
                                                isMatch = true;
                                              }
                                            }
                                            if (r.created_at) {
                                              const date = new Date(r.created_at);
                                              if (!isNaN(date.getTime())) {
                                                const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                                                if (String(date.getFullYear()) === period.year && months[date.getMonth()].toLowerCase() === period.month.toLowerCase()) {
                                                  isMatch = true;
                                                }
                                              }
                                            }

                                            // Apply Rating/Points Filter to Ledger Logs

                                            return isMatch;
                                          }).sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
                                        } catch (e) {
                                          console.error(e);
                                        }
                                      }

                                      if (periodLogs.length === 0) {
                                        return (
                                          <p className="text-xs text-slate-400 italic py-2">
                                            No manual rewards or penalties logged for this period.
                                          </p>
                                        );
                                      }

                                      return (
                                        <div className="space-y-2">
                                          {periodLogs.map((log: any) => {
                                            const isPen = String(log.type || log.reward_type || "").toLowerCase().includes("penalty") || 
                                                          String(log.type || "").toLowerCase().includes("demerit") || 
                                                          Number(log.points || 0) < 0;
                                            const pts = Math.abs(Number(log.points || 0));
                                            const formattedDate = log.created_at 
                                              ? new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                              : "N/A";

                                            return (
                                              <div 
                                                key={log.id} 
                                                className={`flex items-start justify-between gap-4 p-3 rounded-lg border text-left ${
                                                  isPen 
                                                    ? "bg-rose-50/50 border-rose-100" 
                                                    : "bg-emerald-50/50 border-emerald-100"
                                                }`}
                                              >
                                                <div className="flex items-start gap-2.5">
                                                  <div className={`mt-0.5 rounded-full p-1.5 flex items-center justify-center ${
                                                    isPen ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"
                                                  }`}>
                                                    <i className={`fas text-xs ${isPen ? "fa-circle-minus" : "fa-circle-plus"}`}></i>
                                                  </div>
                                                  <div>
                                                    <div className="flex items-center gap-2">
                                                      <span className="font-bold text-slate-800 text-xs">
                                                        {log.reward_type || (isPen ? "Penalty Record" : "Reward Achievement")}
                                                      </span>
                                                      <span className="text-[10px] text-slate-400 font-mono">
                                                        ({formattedDate})
                                                      </span>
                                                    </div>
                                                    <p className="text-xs text-slate-600 mt-1">
                                                      {log.reason || "No description provided."}
                                                    </p>
                                                    <span className="text-[10px] text-slate-400 block mt-1">
                                                      Approver: <strong className="font-semibold text-slate-600">{log.created_by || log.source || "HR Manager"}</strong>
                                                    </span>
                                                  </div>
                                                </div>
                                                <span className={`px-2 py-0.5 font-bold font-mono text-xs rounded-full whitespace-nowrap shadow-3xs ${
                                                  isPen 
                                                    ? "bg-rose-100 text-rose-800 border border-rose-200" 
                                                    : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                                }`}>
                                                  {isPen ? `-${pts} pts` : `+${pts} pts`}
                                                </span>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      );
                                    })()}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* PAYROLL TAB */}
              {modalTab === "payroll" && (
                <div className="space-y-6 text-left">
                  <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800">
                      <i className="fas fa-file-invoice-dollar text-[#02275A] mr-2"></i>{" "}
                      Payroll & Bank Settings
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        if (!isEditingBank) {
                          // Populate state
                          setBankForm({
                            bankName: viewEmployee.bankName || "",
                            accountNumber: viewEmployee.accountNumber || "",
                            bvn: viewEmployee.bvn || "",
                            taxId: viewEmployee.taxId || "",
                            pfaName: viewEmployee.pfaName || "",
                            pensionNumber: viewEmployee.pensionNumber || "",
                            salary: viewEmployee.salary || 0,
                            currency: viewEmployee.currency || "NGN",
                          });
                        }
                        setIsEditingBank(!isEditingBank);
                      }}
                      className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors flex items-center gap-1"
                    >
                      <i
                        className={`fas ${isEditingBank ? "fa-times" : "fa-edit"}`}
                      ></i>{" "}
                      {isEditingBank ? "Cancel" : "Edit Bank/Payroll Details"}
                    </button>
                  </div>

                  {isEditingBank ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const updatedEmployee = {
                          ...viewEmployee,
                          bankName: bankForm.bankName,
                          accountNumber: bankForm.accountNumber,
                          bvn: bankForm.bvn,
                          taxId: bankForm.taxId,
                          pfaName: bankForm.pfaName,
                          pensionNumber: bankForm.pensionNumber,
                          salary: Number(bankForm.salary),
                          currency: bankForm.currency,
                        };
                        setViewEmployee(updatedEmployee);
                        setEmployees((prev) =>
                          prev.map((emp) =>
                            emp.id === viewEmployee.id ? updatedEmployee : emp,
                          ),
                        );
                        setIsEditingBank(false);
                        showSuccess(
                          `Payroll and banking details updated successfully.`,
                        );
                      }}
                      className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6 animate-fade-in text-slate-700"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4 border-b border-slate-100">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">
                            Gross Base Salary *
                          </label>
                          <input
                            required
                            type="number"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-[#02275A]"
                            value={bankForm.salary}
                            onChange={(v) =>
                              setBankForm({
                                ...bankForm,
                                salary: Number(v.target.value),
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">
                            Currency *
                          </label>
                          <select
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-[#02275A] focus:outline-none"
                            value={bankForm.currency}
                            onChange={(v) =>
                              setBankForm({
                                ...bankForm,
                                currency: v.target.value,
                              })
                            }
                          >
                            <option value="NGN">Nigerian Naira (NGN)</option>
                            <option value="GHS">Ghanaian Cedi (GHS)</option>
                            <option value="KES">Kenyan Shilling (KES)</option>
                            <option value="USD">US Dollar (USD)</option>
                            <option value="GBP">British Pound (GBP)</option>
                            <option value="EUR">Euro (EUR)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column: Bank Details */}
                        <div className="space-y-4">
                          <h4 className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-1">
                            <i className="fas fa-university text-indigo-500 mr-2"></i>{" "}
                            Bank Details
                          </h4>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">
                              Bank Name
                            </label>
                            <input
                              type="text"
                              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-[#02275A]"
                              value={bankForm.bankName}
                              onChange={(v) =>
                                setBankForm({
                                  ...bankForm,
                                  bankName: v.target.value,
                                })
                              }
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">
                              Account Number
                            </label>
                            <input
                              type="text"
                              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-[#02275A]"
                              value={bankForm.accountNumber}
                              onChange={(v) =>
                                setBankForm({
                                  ...bankForm,
                                  accountNumber: v.target.value,
                                })
                              }
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">
                              Bank Verification Number (BVN)
                            </label>
                            <input
                              type="text"
                              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-[#02275A]"
                              value={bankForm.bvn}
                              onChange={(v) =>
                                setBankForm({
                                  ...bankForm,
                                  bvn: v.target.value,
                                })
                              }
                            />
                          </div>
                        </div>

                        {/* Right Column: Tax & Pension Details */}
                        <div className="space-y-4">
                          <h4 className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-1">
                            <i className="fas fa-file-invoice-dollar text-emerald-500 mr-2"></i>{" "}
                            Tax & Pension
                          </h4>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">
                              Tax ID Number (TIN)
                            </label>
                            <input
                              type="text"
                              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-[#02275A]"
                              value={bankForm.taxId}
                              onChange={(v) =>
                                setBankForm({
                                  ...bankForm,
                                  taxId: v.target.value,
                                })
                              }
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">
                              Pension Fund Administrator (PFA)
                            </label>
                            <input
                              type="text"
                              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-[#02275A]"
                              value={bankForm.pfaName}
                              onChange={(v) =>
                                setBankForm({
                                  ...bankForm,
                                  pfaName: v.target.value,
                                })
                              }
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">
                              Pension Number (PENCOM)
                            </label>
                            <input
                              type="text"
                              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-[#02275A]"
                              value={bankForm.pensionNumber}
                              onChange={(v) =>
                                setBankForm({
                                  ...bankForm,
                                  pensionNumber: v.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setIsEditingBank(false)}
                          className="px-5 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-[#02275A] text-white rounded-lg text-xs font-bold hover:bg-[#02275A]/90 transition-colors shadow-sm"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                            Gross Base Pay
                          </p>
                          <h3 className="text-2xl font-black text-slate-800">
                            {viewEmployee.currency}{" "}
                            {viewEmployee.salary.toLocaleString()}
                          </h3>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-xl">
                          <i className="fas fa-money-bill-wave"></i>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                          <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">
                            <i className="fas fa-university text-indigo-500 mr-2"></i>{" "}
                            Bank Details
                          </h4>
                          <div className="space-y-4">
                            <div>
                              <p className="text-xs font-bold text-slate-400 mb-1">
                                Bank Name
                              </p>
                              <p className="text-sm font-bold text-slate-800">
                                {viewEmployee.bankName || "Not Set"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-400 mb-1">
                                Account Number
                              </p>
                              <p className="text-sm font-bold text-slate-800 font-mono tracking-wider">
                                {viewEmployee.accountNumber || "Not Set"}
                              </p>
                            </div>
                            {viewEmployee.country === "Nigeria" && (
                              <div>
                                <p className="text-xs font-bold text-slate-400 mb-1">
                                  Bank Verification Num (BVN)
                                </p>
                                <p className="text-sm font-bold text-slate-800 font-mono tracking-wider">
                                  {viewEmployee.bvn || "Not Set"}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                          <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">
                            <i className="fas fa-file-invoice-dollar text-emerald-500 mr-2"></i>{" "}
                            Tax & Pension
                          </h4>
                          <div className="space-y-4">
                            <div>
                              <p className="text-xs font-bold text-slate-400 mb-1">
                                Tax ID Number (TIN)
                              </p>
                              <p className="text-sm font-bold text-slate-800 font-mono tracking-wider">
                                {viewEmployee.taxId || "Not Set"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-400 mb-1">
                                Pension Fund Administrator (PFA)
                              </p>
                              <p className="text-sm font-bold text-slate-800">
                                {viewEmployee.pfaName || "Not Set"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-400 mb-1">
                                Pension Number (PENCOM)
                              </p>
                              <p className="text-sm font-bold text-slate-800 font-mono tracking-wider">
                                {viewEmployee.pensionNumber || "Not Set"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
          </div>
        </div>
      )}

      {/* Dedicated Rating Modal */}
      {ratingEmployee && (
        <div className="fixed inset-0 z-[75] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in text-left">
          <div className="bg-white rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden border border-slate-105">
            {/* Modal Header */}
            <div className="bg-[#02275A] text-white p-6 relative">
              <button
                type="button"
                onClick={() => setRatingEmployee(null)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
              >
                <i className="fas fa-times text-white"></i>
              </button>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-bold text-md text-white shrink-0">
                  {ratingEmployee.firstName[0]}
                  {ratingEmployee.lastName[0]}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-lg text-white truncate">
                    Rate Performance: {ratingEmployee.firstName}{" "}
                    {ratingEmployee.lastName}
                  </h3>
                  <p className="text-xs text-blue-200 mt-0.5 truncate">
                    {ratingEmployee.role} &bull; {ratingEmployee.department}{" "}
                    Team
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!reviewComments.trim()) {
                  alert("Please add review comments.");
                  return;
                }

                if (reviewDateType === "monthly" || reviewDateType === "weekly" || reviewDateType === "daily") {
                  // Check if a Monthly rating already exists
                  const duplicateRatingExists = ratingEmployee.gradeAuditTrail?.some((log) => {
                    if (log.type !== "rating") return false;
                    if (log.ratingYear === ratingYear && log.ratingMonth === ratingMonth) {
                      return true;
                    }
                    if (log.dateOfChange) {
                      const [y, m, d] = log.dateOfChange.split("-");
                      const months = [
                        "January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"
                      ];
                      const monthName = months[parseInt(m, 10) - 1];
                      if (y === ratingYear && monthName === ratingMonth) {
                        return true;
                      }
                    }
                    return false;
                  });

                  if (duplicateRatingExists) {
                    alert("A Monthly rating already exists for this employee for the selected month.");
                    alert("A monthly performance rating already exists for this employee for the selected month.");
                    return;
                  }

                  // Retrieve weeks and monthly reviews check
                  const numWeeks = getWeeksInMonth(ratingYear, ratingMonth);
                  let allWeeksExist = true;
                  for (let i = 1; i <= numWeeks; i++) {
                    const weekLabel = `Week ${i}`;
                    const exists = ratingEmployee.weeklyReviews?.some(
                      (rev) =>
                        rev.year === ratingYear &&
                        rev.month === ratingMonth &&
                        rev.week === weekLabel
                    );
                    if (!exists) {
                      allWeeksExist = false;
                      break;
                    }
                  }

                  const monthlyReviewExists = ratingEmployee.monthlyReviews?.some(
                    (rev) => rev.year === ratingYear && rev.month === ratingMonth
                  );

                  // 1. A Monthly Rating cannot be submitted until all weeks or Monthly Review exists.
                  // Display: Complete the Monthly Performance Review before assigning a Monthly Rating.
                  if (!allWeeksExist && !monthlyReviewExists) {
                    alert("Complete the Monthly Performance Review before assigning a Monthly Rating.");
                    return;
                  }

                  // 2. Weekly Review Rating Restriction: If an employee is reviewed Weekly: Verify every scheduled week has been reviewed.
                  // If any week is missing display: This employee has incomplete weekly performance reviews for the selected month. Complete all weekly reviews before assigning a Monthly rating.
                  const isWeeklyEmployee = ratingEmployee.reviewDateType === "weekly" || (ratingEmployee.weeklyReviews && ratingEmployee.weeklyReviews.some(r => r.year === ratingYear && r.month === ratingMonth));
                  if (isWeeklyEmployee && !allWeeksExist) {
                    alert("This employee has incomplete weekly performance reviews for the selected month. Complete all weekly reviews before assigning a Monthly rating.");
                    return;
                  }
                }

                if (ratingPoints < 0 || ratingPoints > 10) {
                  alert("Rating points must be between 0 and 10.");
                  return;
                }

                const currentYearToCheck = ratingYear;
                const currentMonthToCheck = ratingMonth;

                if (ratingPoints > 0) {
                  const ratingPointsAlreadyAssigned = ratingEmployee.gradeAuditTrail?.some((log) => {
                    if (log.type !== "rating") return false;
                    const matchesMonth = log.ratingYear === currentYearToCheck && log.ratingMonth === currentMonthToCheck;
                    return matchesMonth && (log as any).ratingPoints > 0;
                  });
                  if (ratingPointsAlreadyAssigned) {
                    alert("Rating Points can only be assigned once per employee each month.");
                    return;
                  }
                }

                const prev = ratingEmployee.grade || "B+";
                const computedScore =
                  calculateEmployeePerformanceBalance(localKPIs);

                // Helper parsers to read historical entries if raw values aren't populated
                const parseScoreFromReason = (reasonStr: string): number | null => {
                  const match = reasonStr.match(/Performance Score:\s*([\d.]+)/i);
                  return match ? parseFloat(match[1]) : null;
                };

                const parseRewardFromReason = (reasonStr: string): number | null => {
                  const match = reasonStr.match(/Reward Points:\s*([\d.]+)/i);
                  return match ? parseFloat(match[1]) : null;
                };

                // Compile all rating logs scores and rewards including the current submission
                const ratingScores: number[] = [computedScore];
                const ratingRewards: number[] = [localRewardPoints];

                (ratingEmployee.gradeAuditTrail || []).forEach((log) => {
                  if (log.type === "rating") {
                    const s = log.score !== undefined ? log.score : parseScoreFromReason(log.reason);
                    if (s !== null && !isNaN(s)) {
                      ratingScores.push(s);
                    }
                    const r = log.rewardPoints !== undefined ? log.rewardPoints : parseRewardFromReason(log.reason);
                    if (r !== null && !isNaN(r)) {
                      ratingRewards.push(r);
                    }
                  }
                });

                // Compute overall average performance score across all logs (add first to second, third, etc. and divide by entry count)
                const averagedScore = ratingScores.reduce((sum, s) => sum + s, 0) / ratingScores.length;
                const finalPerformanceScore = Math.max(0, Math.min(100, Math.round(averagedScore)));

                // Calculate base reward points (current reward points minus previous rating rewards to preserve initial base)
                const existingRatingRewardsSum = (ratingEmployee.gradeAuditTrail || [])
                  .filter((log) => log.type === "rating")
                  .map((log) => log.rewardPoints !== undefined ? log.rewardPoints : (parseRewardFromReason(log.reason) || 0))
                  .reduce((sum, r) => sum + r, 0);

                const baseRewardPoints = Math.max(0, (ratingEmployee.rewardPoints ?? 0) - existingRatingRewardsSum);
                const finalRewardPoints = baseRewardPoints + ratingRewards.reduce((sum, r) => sum + r, 0);

                // Apply Rating Points to: Performance Score, Net Points
                const appliedPerformanceScore = Math.min(100, finalPerformanceScore + ratingPoints);
                const appliedRewardPoints = finalRewardPoints + ratingPoints;

                // Derive the correct grade for the applied score
                const finalGrade = calculateGradeFromPerformance(appliedPerformanceScore);

                let raterTitle = "Team Lead";
                if (userRole === "admin") raterTitle = "Admin";
                if (userRole === "hr") raterTitle = "HR Manager";
                if (userRole === "customer-success" || userRole === "cx-head")
                  raterTitle = "Head of Customer Success";
                if (userRole === "sales-manager") raterTitle = "Sales Manager";
                if (userRole === "marketing-manager")
                  raterTitle = "Marketing Manager";
                if (userRole === "content-lead") raterTitle = "Content Lead";
                if (userRole === "finance") raterTitle = "Finance Manager";
                if (userRole === "engineering" || userRole === "engineer")
                  raterTitle = "Engineering Lead";

                const auditEntry: GradeAuditEntry = {
                  id: Date.now().toString(),
                  previousGrade: prev as any,
                  newGrade: finalGrade as any,
                  policyResponsible: "Performance Review",
                  dateOfChange: new Date().toISOString().split("T")[0],
                  approvingAuthority: `${raterTitle} (${ratingEmployee.department})`,
                  reason: `${reviewComments.trim()} (Date Type: ${reviewDateType}, Quarter: ${activeQuarter}, Performance Score: ${computedScore}%; Reward Points: ${localRewardPoints}${ratingPoints > 0 ? `; Rating Points: ${ratingPoints}` : ""})`,
                  strengths: strengths.trim() || "No strengths specified.",
                  recommendations:
                    recommendations.trim() || "No recommendations specified.",
                  type: "rating",
                  score: computedScore,
                  rewardPoints: localRewardPoints,
                  ratingYear: currentYearToCheck,
                  ratingMonth: currentMonthToCheck,
                  ratingPoints: ratingPoints,
                } as any;

                const updatedEmployee: Employee = {
                  ...ratingEmployee,
                  grade: finalGrade as any,
                  rewardPoints: appliedRewardPoints,
                  performanceScore: appliedPerformanceScore,
                  kpis: localKPIs,
                  gradeAuditTrail: [
                    auditEntry,
                    ...(ratingEmployee.gradeAuditTrail || []),
                  ],
                  lastReviewDate: new Date().toISOString().split("T")[0],
                  managerFeedback: reviewComments.trim(),
                  reviewDateType: reviewDateType,
                  activeQuarter: activeQuarter,
                };

                setEmployees((prevList) =>
                  prevList.map((e) =>
                    e.id === ratingEmployee.id ? updatedEmployee : e,
                  ),
                );
                setRatingEmployee(null);

                // Reset state
                setReviewComments("");
                setStrengths("");
                setRecommendations("");
                setRatingPoints(0);

                showSuccess(
                  `Performance rated successfully! Cumulative Average Score is ${appliedPerformanceScore}% (Grade ${finalGrade}) with ${appliedRewardPoints} total Net Points (newly added: ${localRewardPoints} Bonus Points, ${ratingPoints} Rating Points).`,
                );
              }}
              className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar"
            >
              {/* PERFORMANCE OVERVIEW SCORES (JARGON REMOVED) */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
                    Performance Score %
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-indigo-700">
                      {calculateEmployeePerformanceBalance(localKPIs)}
                    </span>
                    <span className="text-xs text-indigo-500 font-medium">
                      % / 100%
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">
                    Rating Points (Max 10)
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={ratingPoints}
                    onChange={(e) =>
                      setRatingPoints(Number(e.target.value))
                    }
                    className="mt-1 w-full bg-transparent text-xl font-bold text-rose-700 outline-none p-0 border-b border-dashed border-rose-300 focus:border-rose-600 focus:ring-0"
                  />
                </div>
                <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                    Bonus Points
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={localRewardPoints}
                    onChange={(e) =>
                      setLocalRewardPoints(Number(e.target.value))
                    }
                    className="mt-1 w-full bg-transparent text-xl font-bold text-amber-700 outline-none p-0 border-b border-dashed border-amber-300 focus:border-amber-600 focus:ring-0"
                  />
                </div>
                <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">
                    Total Points Balance
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-teal-700">
                      {calculateEmployeePerformanceBalance(localKPIs) +
                        localRewardPoints + ratingPoints}
                    </span>
                    <span className="text-xs text-teal-500 font-medium">
                      pts
                    </span>
                  </div>
                </div>
              </div>

              {/* PROFESSIONAL CAPABILITIES EVALUATION */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <div>
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <i className="fas fa-star text-indigo-500"></i>{" "}
                      Leadership & Capability Evaluation
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
                      Provide manager ratings from 1 to 5 for each key professional behavior area.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {localKPIs.map((kpi, idx) => {
                    const ratingVal = kpi.currentValue || 3;
                    const targetVal = 5;
                    const weightVal = kpi.weight || 10;
                    const percentRating = (ratingVal / targetVal) * 100;
                    const weightedScore = (ratingVal / targetVal) * weightVal;

                    return (
                      <div
                        key={kpi.id || idx}
                        className="bg-white p-3.5 rounded-xl border border-slate-200/70 shadow-xs flex flex-col gap-3"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <span className="text-xs font-black text-[#02275A]">
                              {kpi.name}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-slate-400 font-bold font-sans">
                                Weight: {weightVal}% of overall evaluation
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <div>
                            <label className="block text-[10px] text-slate-500 font-bold mb-1">
                              Actual Rate (Rating Given)
                            </label>
                            <select
                              value={ratingVal}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 3;
                                setLocalKPIs((prev) =>
                                  prev.map((k, i) =>
                                    i === idx
                                      ? { ...k, currentValue: val }
                                      : k,
                                  ),
                                );
                              }}
                              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded text-xs focus:ring-1 focus:ring-indigo-500/20 focus:outline-none font-sans font-medium text-slate-700"
                            >
                              <option value={1}>1 = Poor</option>
                              <option value={2}>2 = Below expectation</option>
                              <option value={3}>3 = Meets expectation</option>
                              <option value={4}>4 = Good</option>
                              <option value={5}>5 = Excellent</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-500 font-bold mb-1">
                              Target Rate
                            </label>
                            <input
                              type="text"
                              disabled
                              value="5 (Maximum)"
                              className="w-full px-2.5 py-1.5 bg-slate-150 border border-slate-200 text-slate-500 rounded text-xs font-sans font-medium cursor-not-allowed"
                            />
                          </div>
                        </div>

                        {/* Live Scoring Formula Review Process */}
                        <div className="mt-1 p-2 bg-slate-50 rounded-lg text-[10px] text-slate-600 font-semibold flex flex-wrap gap-x-4 gap-y-1.5 items-center border border-slate-150">
                          <div>
                            <span className="text-slate-400">Target:</span> <span className="font-extrabold text-slate-700">5</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Actual:</span> <span className="font-extrabold text-slate-700">{ratingVal}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Rating %:</span> <span className="font-black text-emerald-600">{percentRating}%</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Weight:</span> <span className="font-extrabold text-slate-700">{weightVal}</span>
                          </div>
                          <div className="ml-auto bg-slate-200/50 text-[#02275A] px-2 py-0.5 rounded font-black font-mono">
                            Score: {weightedScore.toFixed(1)} pts
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5 flex items-center gap-1.5">
                  <i className="far fa-calendar-alt text-indigo-500"></i>
                  <span>Review Quarter / Period</span>
                </label>
                <div className="w-full px-3.5 py-2.5 bg-indigo-50/50 border border-indigo-100 text-[#02275A] text-sm font-bold rounded-lg flex items-center justify-between">
                  <span>{activeQuarter}</span>
                  <span className="bg-indigo-100 text-indigo-700 text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                  Rater Authority / Scope
                </label>
                <input
                  type="text"
                  disabled
                  value={(() => {
                    let prefix = "Team Lead";
                    if (userRole === "admin") prefix = "Administrator";
                    if (userRole === "hr") prefix = "HR Manager";
                    if (
                      userRole === "customer-success" ||
                      userRole === "cx-head"
                    )
                      prefix = "Head of Customer Success";
                    if (userRole === "sales-manager")
                      prefix = "Sales Manager";
                    if (userRole === "marketing-manager")
                      prefix = "Marketing Manager";
                    if (userRole === "content-lead") prefix = "Content Lead";
                    if (userRole === "finance") prefix = "Finance Manager";
                    if (userRole === "engineering" || userRole === "engineer")
                      prefix = "Engineering Lead";
                    return `${prefix} (Scoped: ${ratingEmployee.department} Team)`;
                  })()}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 text-slate-500 text-sm rounded-lg cursor-not-allowed font-medium font-sans"
                />
              </div>

              {(reviewDateType === "monthly" || reviewDateType === "weekly" || reviewDateType === "daily") && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-indigo-50/30 border border-indigo-100 rounded-xl p-4 animate-fade-in">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5 flex items-center gap-1.5">
                      <i className="far fa-calendar text-indigo-500"></i>
                      <span>Rating Year *</span>
                    </label>
                    <select
                      value={ratingYear}
                      onChange={(e) => setRatingYear(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 text-slate-750 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-[#02275A]/20 font-semibold cursor-pointer"
                    >
                      <option value="2024">2024</option>
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                      <option value="2027">2027</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5 flex items-center gap-1.5">
                      <i className="far fa-calendar-check text-indigo-500"></i>
                      <span>Rating Month *</span>
                    </label>
                    <select
                      value={ratingMonth}
                      onChange={(e) => setRatingMonth(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 text-slate-755 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-[#02275A]/20 font-semibold cursor-pointer"
                    >
                      {[
                        "January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"
                      ].map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                  Review Summary / Evaluation comments *
                </label>
                <textarea
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  rows={3}
                  required
                  placeholder="Provide comprehensive review comments justifying the rating..."
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-[#02275A]/20 transition-all font-sans"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                    Key Strengths
                  </label>
                  <textarea
                    value={strengths}
                    onChange={(e) => setStrengths(e.target.value)}
                    rows={2}
                    placeholder="List key professional strengths..."
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-[#02275A]/20 transition-all font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                    Improvement Recommendations
                  </label>
                  <textarea
                    value={recommendations}
                    onChange={(e) => setRecommendations(e.target.value)}
                    rows={2}
                    placeholder="Suggest action items or training for future growth..."
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-[#02275A]/20 transition-all font-sans"
                  />
                </div>
              </div>

              {/* Modal Footer actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRatingEmployee(null)}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#02275A] hover:bg-[#0b3b82] text-white rounded-lg text-xs font-bold shadow-sm transition-colors cursor-pointer flex items-center gap-1.5 uppercase tracking-wider"
                >
                  <i className="fas fa-check-double text-[10px]"></i> Submit
                  Rating
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Weekly Review Modal */}
      {editingWeeklyReview && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md flex flex-col shadow-2xl overflow-hidden border border-slate-100 text-left">
            <div className="bg-[#02275A] text-white p-5 flex justify-between items-center">
              <h3 className="font-bold text-sm tracking-wide uppercase">
                Edit Weekly Review
              </h3>
              <button
                type="button"
                onClick={() => setEditingWeeklyReview(null)}
                className="w-6 h-6 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <i className="fas fa-times text-white text-xs"></i>
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveEditedWeeklyReview();
              }}
              className="p-5 space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Weekly Score (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={editingWeeklyScore}
                  onChange={(e) => setEditingWeeklyScore(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Evaluation Comments *
                </label>
                <textarea
                  required
                  rows={4}
                  value={editingWeeklyComments}
                  onChange={(e) => setEditingWeeklyComments(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded focus:outline-none focus:ring-1 focus:ring-indigo-500/20 leading-relaxed"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingWeeklyReview(null)}
                  className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#02275A] text-white rounded text-xs font-bold shadow-sm hover:bg-[#0b3b82] transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-[#02275A] text-white p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Add New Employee</h2>
                <p className="text-blue-200 text-sm">Create a new HR record</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleAddEmployeeSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">
                      First Name
                    </label>
                    <input
                      required
                      type="text"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#02275A]"
                      value={newEmployee.firstName}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          firstName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">
                      Last Name
                    </label>
                    <input
                      required
                      type="text"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#02275A]"
                      value={newEmployee.lastName}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          lastName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">
                      Email
                    </label>
                    <input
                      required
                      type="email"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#02275A]"
                      value={newEmployee.email}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">
                      Phone
                    </label>
                    <input
                      required
                      type="text"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#02275A]"
                      value={newEmployee.phone}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          phone: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">
                      Role/Job Title
                    </label>
                    <input
                      required
                      type="text"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#02275A]"
                      value={newEmployee.role}
                      onChange={(e) =>
                        setNewEmployee({ ...newEmployee, role: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-bold text-slate-700">
                        Department
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsAddingNewDept(!isAddingNewDept)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-bold"
                      >
                        {isAddingNewDept
                          ? "Select Existing"
                          : "+ Add Department"}
                      </button>
                    </div>
                    {isAddingNewDept ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Type new department"
                          className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#02275A]"
                          value={newDeptName}
                          onChange={(e) => setNewDeptName(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const cleanDept = newDeptName.trim();
                            if (cleanDept) {
                              if (!departments.includes(cleanDept)) {
                                setDepartments((prev) => [...prev, cleanDept]);
                              }
                              setNewEmployee({
                                ...newEmployee,
                                department: cleanDept,
                              });
                              setIsAddingNewDept(false);
                              setNewDeptName("");
                              showSuccess(`Department "${cleanDept}" added.`);
                            }
                          }}
                          className="bg-blue-50 text-blue-600 border border-blue-200 px-3 py-2 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    ) : (
                      <select
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#02275A]"
                        value={newEmployee.department}
                        onChange={(e) =>
                          setNewEmployee({
                            ...newEmployee,
                            department: e.target.value,
                          })
                        }
                      >
                        {departments.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">
                      Employee Type
                    </label>
                    <select
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#02275A]"
                      value={newEmployee.employeeType || "Full-Time"}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          employeeType: e.target.value,
                        })
                      }
                    >
                      <option value="Full-Time">Full-Time</option>
                      <option value="Part-Time">Part-Time</option>
                      <option value="Contract">Contract</option>
                      <option value="Agent">Agent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">
                      Country
                    </label>
                    <select
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#02275A]"
                      value={newEmployee.country}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          country: e.target.value,
                        })
                      }
                    >
                      <option value="Nigeria">Nigeria</option>
                      <option value="Ghana">Ghana</option>
                      <option value="Kenya">Kenya</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">
                      City
                    </label>
                    <input
                      required
                      type="text"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#02275A]"
                      value={newEmployee.city}
                      onChange={(e) =>
                        setNewEmployee({ ...newEmployee, city: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#02275A]"
                      value={newEmployee.dateOfBirth}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          dateOfBirth: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">
                      Hire Date
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#02275A]"
                      value={newEmployee.hireDate}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          hireDate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">
                      Salary
                    </label>
                    <input
                      required
                      type="number"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#02275A]"
                      value={newEmployee.salary}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          salary: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-5 py-2 rounded-lg font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-slate-900 text-white px-5 py-2 rounded-lg font-bold shadow-md hover:bg-slate-800 transition-colors"
                  >
                    Save Employee
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Department Modal */}
      {isAddDeptModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Create Department</h2>
                <p className="text-slate-300 text-sm">
                  Add a new department for employee allocation
                </p>
              </div>
              <button
                onClick={() => {
                  setIsAddDeptModalOpen(false);
                  setNewDeptFormName("");
                }}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="p-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const cleanDept = newDeptFormName.trim();
                  if (cleanDept) {
                    if (!departments.includes(cleanDept)) {
                      setDepartments((prev) => [...prev, cleanDept]);
                      showSuccess(
                        `Department "${cleanDept}" created successfully.`,
                      );
                    } else {
                      showSuccess(`Department "${cleanDept}" already exists.`);
                    }
                    setIsAddDeptModalOpen(false);
                    setNewDeptFormName("");
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    Department Name *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g., Marketing, QA, Security"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
                    value={newDeptFormName}
                    onChange={(e) => setNewDeptFormName(e.target.value)}
                  />
                </div>
                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddDeptModalOpen(false);
                      setNewDeptFormName("");
                    }}
                    className="px-5 py-2 rounded-lg font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-slate-900 text-white px-5 py-2 rounded-lg font-bold shadow-md hover:bg-slate-800 transition-colors"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <AddGradeModal
        isOpen={isAddGradeModalOpen}
        onClose={() => setIsAddGradeModalOpen(false)}
        onSuccess={(data) => {
          console.log("Grade saved:", data);
          setIsAddGradeModalOpen(false);
        }}
      />

      <SetQuarterModal
        isOpen={isSetQuarterModalOpen}
        onClose={() => setIsSetQuarterModalOpen(false)}
        onSuccess={(data) => {
          console.log("Quarter saved:", data);
          setIsSetQuarterModalOpen(false);
          if (data && data.quarterName) {
            setActiveQuarter(data.quarterName);
            localStorage.setItem("company_active_quarter", data.quarterName);
          }
        }}
      />

      {/* Add Policy Modal */}
      {isAddPolicyModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Add Policy</h2>
                <p className="text-slate-300 text-sm">
                  Create a new point policy
                </p>
              </div>
              <button
                onClick={() => setIsAddPolicyModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setIsAddPolicyModalOpen(false); /* Normally save logic here */
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    Policy Name *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g., Code Review Completion"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
                    value={newPolicy.name}
                    onChange={(e) =>
                      setNewPolicy({ ...newPolicy, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Detailed description of when this policy applies..."
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
                    value={newPolicy.description}
                    onChange={(e) =>
                      setNewPolicy({
                        ...newPolicy,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    Point Impact *
                  </label>
                  <input
                    required
                    type="number"
                    placeholder="e.g., 10 for rewards, -5 for penalties"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
                    value={newPolicy.impact}
                    onChange={(e) =>
                      setNewPolicy({ ...newPolicy, impact: e.target.value })
                    }
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Positive numbers for rewards, negative for penalties
                  </p>
                </div>
                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddPolicyModalOpen(false)}
                    className="px-5 py-2 rounded-lg font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-slate-900 text-white px-5 py-2 rounded-lg font-bold shadow-md hover:bg-slate-800 transition-colors"
                  >
                    Save Policy
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Upload Policies Modal */}
      {isUploadPolicyOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 flex items-center justify-between border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Upload Policies
                </h2>
              </div>
              <button
                onClick={() => setIsUploadPolicyOpen(false)}
                className="w-8 h-8 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 flex items-center justify-center transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-white">
              <div className="flex bg-slate-50 border border-slate-100 rounded-lg p-1 w-fit mb-6 shadow-sm">
                <button
                  onClick={() => setUploadPolicyTab("manual")}
                  className={`px-5 py-2 text-sm transition-colors ${uploadPolicyTab === "manual" ? "font-bold bg-white text-slate-900 rounded-md shadow-sm" : "font-medium text-slate-500 hover:text-slate-800"}`}
                >
                  Manual Add
                </button>
                <button
                  onClick={() => setUploadPolicyTab("file")}
                  className={`px-5 py-2 text-sm transition-colors ${uploadPolicyTab === "file" ? "font-bold bg-white text-slate-900 rounded-md shadow-sm" : "font-medium text-slate-500 hover:text-slate-800"}`}
                >
                  File Import
                </button>
              </div>

              {uploadPolicyTab === "manual" ? (
                <div className="border-t border-slate-100">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-4 px-2 w-[35%]">NAME</th>
                        <th className="py-4 px-2">DESCRIPTION</th>
                        <th className="py-4 px-2 w-32">POINTS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {uploadPolicyRows.map((rowId) => (
                        <tr key={rowId}>
                          <td className="py-3 px-2">
                            <input
                              type="text"
                              placeholder="Policy name"
                              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-800"
                            />
                          </td>
                          <td className="py-3 px-2">
                            <input
                              type="text"
                              placeholder="Description..."
                              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-800"
                            />
                          </td>
                          <td className="py-3 px-2">
                            <input
                              type="number"
                              placeholder="0"
                              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-800"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-4 text-slate-800 text-2xl">
                    <i className="fas fa-file-excel"></i>
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg mb-1">
                    Import Data via Template
                  </h3>
                  <p className="text-slate-500 text-sm mb-6 text-center max-w-md">
                    Download our standard CSV template, fill in your policy
                    records, and upload it here to import data in bulk.
                  </p>
                  <div className="flex gap-4">
                    <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2">
                      <i className="fas fa-download"></i> Download Template
                    </button>
                    <button className="px-5 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-bold shadow-md hover:bg-slate-800 transition-colors flex items-center gap-2">
                      <i className="fas fa-upload"></i> Browse Files
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 bg-white flex items-center justify-between">
              {uploadPolicyTab === "manual" ? (
                <button
                  className="flex items-center gap-2 text-sm font-bold text-slate-900 hover:text-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => {
                    if (uploadPolicyRows.length < 20) {
                      setUploadPolicyRows([
                        ...uploadPolicyRows,
                        Math.max(0, ...uploadPolicyRows) + 1,
                      ]);
                    }
                  }}
                  disabled={uploadPolicyRows.length >= 20}
                >
                  <i className="fas fa-plus"></i>
                  Add Row
                  <span className="text-slate-400 font-medium ml-1">
                    ({uploadPolicyRows.length}/20)
                  </span>
                </button>
              ) : (
                <div></div>
              )}
              <button
                className="px-6 py-2.5 bg-[#0b132b] text-white rounded-lg text-sm font-bold shadow-md hover:bg-[#1a2b54] transition-colors"
                onClick={() => {
                  setIsUploadPolicyOpen(false);
                  setUploadPolicyRows([1]);
                }}
              >
                Save All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Points Modal */}
      {isUpdatePointsModalOpen &&
        (() => {
          const isTeamLeadRole = [
            "team-lead",
            "cx-head",
            "sales-manager",
            "marketing-manager",
            "content-lead",
            "engineering"
          ].includes(userRole);

          const eligibleEmployees = (() => {
            if (isTeamLeadRole && userDepartment) {
              const currentLead = employees.find(
                (e) =>
                  e.department.toLowerCase() === userDepartment.toLowerCase() &&
                  (e.is_team_lead || e.role.toLowerCase().includes("lead") || e.role.toLowerCase().includes("manager"))
              );
              const leadId = currentLead ? currentLead.id : null;
              
              return employees.filter(
                (emp) =>
                  emp.department.toLowerCase() === userDepartment.toLowerCase() &&
                  emp.id !== leadId &&
                  !emp.is_team_lead &&
                  !emp.role.toLowerCase().includes("lead") &&
                  !emp.role.toLowerCase().includes("manager")
              );
            }
            return employees;
          })();

          const selectedEmp = employees.find(
            (e) => e.id === updatePointsFormUser || e.employeeId === updatePointsFormUser,
          );
          const isCumulativeManager = !!(
            selectedEmp && (
              selectedEmp.applied_template_id === "tmpl-marketing-cumulative" ||
              ((selectedEmp.department || "").toLowerCase() === "marketing" &&
               ((selectedEmp.role || "").toLowerCase().includes("manager") || (selectedEmp.role || "").toLowerCase().includes("lead")))
            )
          );
          const selectedEmpIdForReports = selectedEmp ? (selectedEmp.employeeId || selectedEmp.id) : "";
          const selectedEmpDeptForReports = selectedEmp ? (selectedEmp.department || "") : "";
          const reportsForCumulative = selectedEmp ? employees.filter(e => 
            (e.reports_to === selectedEmpIdForReports || e.reports_to === selectedEmp.id ||
            (e.department && selectedEmpDeptForReports && e.department.toLowerCase() === selectedEmpDeptForReports.toLowerCase() && e.id !== selectedEmp.id)) &&
            !(
              (e.role || "").toLowerCase().includes("manager") ||
              (e.role || "").toLowerCase().includes("lead") ||
              (e.role || "").toLowerCase().includes("director") ||
              (e.role || "").toLowerCase().includes("head") ||
              e.is_team_lead === true
            )
          ) : [];
          const avgTeamPerf = reportsForCumulative.length > 0 
            ? reportsForCumulative.reduce((sum, r) => {
                const subKpis = r.kpis || [];
                const roleKpis = subKpis.filter(k => {
                  const kName = (k.name || "").toLowerCase();
                  const coreNames = [
                    "punctuality & attendance",
                    "punctuality and attendance",
                    "team player & collaboration",
                    "team player and collaboration",
                    "communication adeptness",
                    "administrative compliance",
                    "punctuality",
                    "collaboration",
                    "communication",
                    "compliance",
                    "attendance",
                    "team player"
                  ];
                  const isCore = coreNames.some(cn => kName.includes(cn) || cn.includes(kName));
                  return !isCore;
                });
                const roleKpiScoreSum = roleKpis.reduce((s, k) => s + calculateKPIContribution(k), 0);
                const roleKpiWeightSum = roleKpis.reduce((s, k) => s + k.weight, 0);
                const subRoleKpiPct = getSubordinateRoleKpiPercentage(r);
                return sum + subRoleKpiPct;
              }, 0) / reportsForCumulative.length
            : 0;

          const rLower = (selectedEmp?.role || "").toLowerCase();
          const dLower = (selectedEmp?.department || "").toLowerCase();
          const isEngineer =
            rLower.includes("engineer") ||
            dLower.includes("engineer") ||
            rLower.includes("develop") ||
            dLower.includes("tech");

          const companyWideConducts = (() => {
            if (selectedEmp) {
              const savedTemplates = localStorage.getItem("company_reusable_perf_templates");
              if (savedTemplates) {
                try {
                  const templates = JSON.parse(savedTemplates);
                  let appliedTemplate = selectedEmp.applied_template_id
                    ? templates.find((t: any) => t.id === selectedEmp.applied_template_id)
                    : null;

                  if (!appliedTemplate) {
                    const empDept = (selectedEmp.department || "").toLowerCase();
                    const empRole = (selectedEmp.role || "").toLowerCase();
                    
                    // Match by exact department and role
                    appliedTemplate = templates.find((t: any) => {
                      const deptMatch = (t.department_id || "").toLowerCase().split(",").map((d: any) => d.trim()).some((d: any) => d === empDept);
                      const roleMatch = (t.role_id || "").toLowerCase().split(",").map((r: any) => r.trim()).some((r: any) => r === empRole || empRole.includes(r));
                      return deptMatch && roleMatch;
                    });
                    
                    if (!appliedTemplate) {
                      // Sub-fallback: match by role/dept keywords or category
                      let cat = "";
                      if (empRole.includes("market") || empDept.includes("market")) cat = "marketer";
                      else if (empRole.includes("success") || empDept.includes("success")) cat = "cxsuccess";
                      else if (empRole.includes("engineer") || empDept.includes("engineer") || empRole.includes("develop") || empDept.includes("product") || empDept.includes("tech")) cat = "engineer";
                      else if (empRole.includes("support") || empDept.includes("support") || empDept.includes("cx") || empRole.includes("call")) cat = "support";
                      
                      if (cat) {
                        appliedTemplate = templates.find((t: any) =>
                          t.id === "tmpl-" + cat ||
                          t.role_id.toLowerCase().includes(cat) ||
                          t.name.toLowerCase().includes(cat)
                        );
                      }
                    }
                  }

                  if (appliedTemplate && Array.isArray(appliedTemplate.conductCategories) && appliedTemplate.conductCategories.length > 0) {
                    const savedSettings = localStorage.getItem("company_app_performance_settings");
                    let rawGlobalConducts: any[] = [];
                    if (savedSettings) {
                      try {
                        const parsed = JSON.parse(savedSettings);
                        if (parsed && Array.isArray(parsed.companyWideConducts)) {
                          rawGlobalConducts = parsed.companyWideConducts;
                        }
                      } catch (e) {
                        console.error(e);
                      }
                    }

                    return appliedTemplate.conductCategories.map((item: any) => {
                      const globalMatch = rawGlobalConducts.find((gc: any) => gc.id === item.id || (gc.name && item.name && gc.name.toLowerCase() === item.name.toLowerCase()));
                      return {
                        id: item.id || globalMatch?.id || Math.random().toString(),
                        name: item.name,
                        description: item.description || globalMatch?.description || "Corporate standard compliance",
                        points: item.weight ?? item.points ?? 5
                      };
                    });
                  }
                } catch (e) {
                  console.error("Failed to parse templates / load template conducts for employee:", e);
                }
              }
            }

            // Fallback for Customer Success hardcoded conducts when CS staff is selected but no template is applied yet
            const isCs = selectedRoleType === "Customer Success" ||
              (selectedEmp && (
                (selectedEmp.role || "").toLowerCase().includes("success") ||
                (selectedEmp.department || "").toLowerCase().includes("success")
              ));

            if (isCs) {
              return [
                {
                  id: "item-cc-1cs",
                  name: "Punctuality & Attendance",
                  description: "Regularity, on-time morning sign-ins, prompt meeting attendance.",
                  points: 5,
                },
                {
                  id: "item-cc-2cs",
                  name: "Team Player & Collaboration",
                  description: "Willingness to assist peers, active knowledge transfer.",
                  points: 5,
                },
                {
                  id: "item-cc-3cs",
                  name: "Communication Adeptness",
                  description: "Response speed of task updates, polite etiquette.",
                  points: 5,
                },
                {
                  id: "item-cc-4cs",
                  name: "Administrative Compliance",
                  description: "On-time submission of timesheets, reports precision.",
                  points: 5,
                },
              ];
            }

            const saved = localStorage.getItem(
              "company_app_performance_settings",
            );
            let rawList: any[] = [];
            if (saved) {
              try {
                const parsed = JSON.parse(saved);
                if (parsed && Array.isArray(parsed.companyWideConducts)) {
                  rawList = parsed.companyWideConducts;
                }
              } catch (e) {
                console.error(e);
              }
            }
            if (rawList.length === 0) {
              rawList = [
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
                  description:
                    "Willingness to assist peers, active knowledge transfer.",
                  points: 5,
                },
                {
                  id: "cwc3",
                  name: "Communication",
                  description:
                    "Response speed of task updates, polite etiquette.",
                  points: 5,
                },
                {
                  id: "cwc4",
                  name: "Compliance",
                  description:
                    "On-time submission of timesheets, reports precision.",
                  points: 5,
                },
              ];
            }

            // Apply department, employee type, and role group mapping filters
            return rawList.filter((conduct: any) => {
              if (!selectedEmp) return true;

              const cDept = (conduct.department || conduct.department_id || "All").toLowerCase();
              const eDept = (selectedEmp.department || "").toLowerCase();
              const deptMatch = cDept === "all" || (cDept !== "none" && (
                cDept === eDept ||
                (cDept === "hr" && eDept === "human resources") ||
                (cDept === "human resources" && eDept === "hr") ||
                (cDept === "tech support" && eDept === "customer support") ||
                (cDept === "customer support" && eDept === "tech support")
              ));
              if (!deptMatch) {
                return false;
              }

              const conductEmpType = conduct.employeeType || "";
              const empType = selectedEmp.employeeType || "Full-Time";
              if (conductEmpType && conductEmpType !== "All" && conductEmpType.toLowerCase() !== empType.toLowerCase()) {
                return false;
              }

              const conductApplicable = conduct.applicableTo || "All";
              if (conductApplicable !== "All") {
                const isEmpLead = !!(
                  selectedEmp.is_team_lead ||
                  (selectedEmp.role || "").toLowerCase().includes("lead") ||
                  (selectedEmp.role || "").toLowerCase().includes("manager") ||
                  (selectedEmp.role || "").toLowerCase().includes("head") ||
                  (selectedEmp.role || "").toLowerCase().includes("director")
                );
                if (conductApplicable === "Manager" && !isEmpLead) {
                  return false;
                }
                if (conductApplicable === "Ordinary" && isEmpLead) {
                  return false;
                }
              }

              return true;
            });
          })();

          const conductsTotalPoints = companyWideConducts.reduce(
            (sum, item) => sum + item.points,
            0,
          );

          const updateConductPoint = (cId: string, val: number) => {
            const updated = { ...conductActualPoints, [cId]: val };
            setConductActualPoints(updated);

            const isEng = selectedRoleType === "Engineering";

            const sumTarget = companyWideConducts.reduce(
              (sum, item) => sum + item.points,
              0,
            );
            const sumActual = companyWideConducts.reduce((sum, item) => {
              const actVal = updated[item.id] !== undefined ? updated[item.id] : (isEng ? item.points : 5);
              return sum + (isEng ? actVal : (actVal / 5) * item.points);
            }, 0);

            const diff = Math.round(sumActual - sumTarget);

            if (isEng) {
              setUpdatePointsFormVal(String(diff));

              const summaryParts = companyWideConducts.map((item) => {
                const actVal =
                  updated[item.id] !== undefined
                    ? updated[item.id]
                    : item.points;
                const isViolated = actVal === 0;
                return `${item.name}: ${isViolated ? "Violated" : "Compliant"} (-${isViolated ? item.points : 0} pts)`;
              });
              setUpdatePointsFormReason(
                `Company Conduct Assessment: ${summaryParts.join(", ")}. Net adjustment: ${diff > 0 ? "+" : ""}${diff} pts.`,
              );
            } else {
              const summaryParts = companyWideConducts.map((item) => {
                const rating =
                  updated[item.id] !== undefined
                    ? updated[item.id]
                    : 5;
                const awarded = (rating / 5) * item.points;
                return `${item.name}: ${rating}/5 rating (${awarded.toFixed(1)}/${item.points} pts)`;
              });
              const totalActual = companyWideConducts.reduce((sum, item) => {
                const rating = updated[item.id] !== undefined ? updated[item.id] : 5;
                return sum + (rating / 5) * item.points;
              }, 0);
              setUpdatePointsFormReason(
                `Company Conduct Assessment: ${summaryParts.join(", ")}. Total Conduct Score: ${totalActual.toFixed(1)}/20 pts.`,
              );
            }
          };

          // Real-time Support calculations
          const parsedSlaTickets = parseFloat(String(slaTickets)) || 0;
          const parsedTotalTickets = parseFloat(String(totalTickets)) || 0;
          const parsedTargetResp = parseFloat(String(targetResponseTime)) || 0;
          const parsedActualResp = parseFloat(String(actualResponseTime)) || 0;
          const parsedResolvedTkt = parseFloat(String(resolvedTickets)) || 0;
          const parsedAssignedTkt = parseFloat(String(assignedTickets)) || 0;
          const parsedCsatPercent =
            parseFloat(String(customerSatisfaction)) || 0;
          const parsedTargetReopen = parseFloat(String(targetReopenRate)) || 0;
          const parsedActualReopen = parseFloat(String(actualReopenRate)) || 0;

          const computedSla =
            parsedTotalTickets > 0
              ? (parsedSlaTickets / parsedTotalTickets) * slaWeight
              : 0;
          const computedResp =
            parsedActualResp > 0
              ? (parsedTargetResp / parsedActualResp) * firstResponseWeight
              : 0;
          const computedRes =
            parsedAssignedTkt > 0
              ? (parsedResolvedTkt / parsedAssignedTkt) * resolutionWeight
              : 0;
          const computedCsat = (parsedCsatPercent / 100) * csatWeight;
          const computedReopen =
            parsedActualReopen > 0
              ? (parsedTargetReopen / parsedActualReopen) * reopenWeight
              : 0;

          const sumOfSupportWeights =
            slaWeight +
            firstResponseWeight +
            resolutionWeight +
            csatWeight +
            reopenWeight;
          const supportRoleScore = Math.min(
            80,
            computedSla +
              computedResp +
              computedRes +
              computedCsat +
              computedReopen,
          );

          const supportConductScore = companyWideConducts.reduce(
            (sum, item) => {
              const rating =
                conductActualPoints[item.id] !== undefined
                  ? conductActualPoints[item.id]
                  : 5;
              const val = (rating / 5) * item.points;
              return sum + val;
            },
            0,
          );

          const isWeightSumInvalid =
            selectedRoleType === "Tech Support" && sumOfSupportWeights > 80;
          const computedTechSupportOverallScore = Math.max(
            0,
            Math.min(100, Math.round(supportRoleScore + supportConductScore)),
          );

          // Real-time Marketing calculations
          const parsedLeadsTarget =
            parseFloat(String(leadsGeneratedTarget)) || 1;
          const parsedLeadsActual =
            parseFloat(String(leadsGeneratedActual)) || 0;
          const parsedLeadsWeight =
            parseFloat(String(leadsGeneratedWeight)) || 0;

          const parsedCostTarget = parseFloat(String(costPerLeadTarget)) || 1;
          const parsedCostActual = parseFloat(String(costPerLeadActual)) || 1;
          const parsedCostWeight = parseFloat(String(costPerLeadWeight)) || 0;

          const parsedQualTarget =
            parseFloat(String(qualifiedLeadRateTarget)) || 1;
          const parsedQualActual =
            parseFloat(String(qualifiedLeadRateActual)) || 0;
          const parsedQualWeight =
            parseFloat(String(qualifiedLeadRateWeight)) || 0;

          const parsedConvTarget =
            parseFloat(String(campaignConversionTarget)) || 1;
          const parsedConvActual =
            parseFloat(String(campaignConversionActual)) || 0;
          const parsedConvWeight =
            parseFloat(String(campaignConversionWeight)) || 0;

          const computedLeads =
            parsedLeadsTarget > 0
              ? (parsedLeadsActual / parsedLeadsTarget) * parsedLeadsWeight
              : 0;
          const computedCost =
            parsedCostActual > 0
              ? (parsedCostTarget / parsedCostActual) * parsedCostWeight
              : 0;
          const computedQual =
            parsedQualTarget > 0
              ? (parsedQualActual / parsedQualTarget) * parsedQualWeight
              : 0;
          const computedConv =
            parsedConvTarget > 0
              ? (parsedConvActual / parsedConvTarget) * parsedConvWeight
              : 0;

          const sumOfMarketingWeights =
            parsedLeadsWeight +
            parsedCostWeight +
            parsedQualWeight +
            parsedConvWeight;
          const marketingRoleScore = Math.min(
            80,
            computedLeads + computedCost + computedQual + computedConv,
          );

          const marketingConductScore = companyWideConducts.reduce(
            (sum, item) => {
              const rating =
                conductActualPoints[item.id] !== undefined
                  ? conductActualPoints[item.id]
                  : 5;
              const val = (rating / 5) * item.points;
              return sum + val;
            },
            0,
          );

          const isMarketingWeightSumInvalid =
            selectedRoleType === "Marketing" && sumOfMarketingWeights > 80;
          const computedMarketingOverallScore = Math.max(
            0,
            Math.min(
              100,
              Math.round(marketingRoleScore + marketingConductScore),
            ),
          );

          // Real-time Sales calculations
          const parsedRevenueTarget = parseFloat(String(revenueTarget)) || 1;
          const parsedRevenueActual = parseFloat(String(revenueActual)) || 0;
          const parsedRevenueWeight = parseFloat(String(revenueWeight)) || 0;

          const parsedDealsTarget = parseFloat(String(dealsTarget)) || 1;
          const parsedDealsActual = parseFloat(String(dealsActual)) || 0;
          const parsedDealsWeight = parseFloat(String(dealsWeight)) || 0;

          const parsedConversionTarget =
            parseFloat(String(conversionTarget)) || 1;
          const parsedConversionActual =
            parseFloat(String(conversionActual)) || 0;
          const parsedConversionWeight =
            parseFloat(String(conversionWeight)) || 0;

          const parsedCollectionsTarget =
            parseFloat(String(collectionsTarget)) || 1;
          const parsedCollectionsActual =
            parseFloat(String(collectionsActual)) || 0;
          const parsedCollectionsWeight =
            parseFloat(String(collectionsWeight)) || 0;

          const computedRevenue =
            parsedRevenueTarget > 0
              ? (parsedRevenueActual / parsedRevenueTarget) *
                parsedRevenueWeight
              : 0;
          const computedDeals =
            parsedDealsTarget > 0
              ? (parsedDealsActual / parsedDealsTarget) * parsedDealsWeight
              : 0;
          const computedConversion =
            parsedConversionTarget > 0
              ? (parsedConversionActual / parsedConversionTarget) *
                parsedConversionWeight
              : 0;
          const computedCollections =
            parsedCollectionsTarget > 0
              ? (parsedCollectionsActual / parsedCollectionsTarget) *
                parsedCollectionsWeight
              : 0;

          const sumOfSalesWeights =
            parsedRevenueWeight +
            parsedDealsWeight +
            parsedConversionWeight +
            parsedCollectionsWeight;
          const salesRoleScore = Math.min(
            80,
            computedRevenue +
              computedDeals +
              computedConversion +
              computedCollections,
          );

          const salesConductScore = companyWideConducts.reduce((sum, item) => {
            const rating =
              conductActualPoints[item.id] !== undefined
                ? conductActualPoints[item.id]
                : 5;
            const val = (rating / 5) * item.points;
            return sum + val;
          }, 0);

          const isSalesWeightSumInvalid =
            selectedRoleType === "Sales" && sumOfSalesWeights > 80;
          const computedSalesOverallScore = Math.max(
            0,
            Math.min(100, Math.round(salesRoleScore + salesConductScore)),
          );

          // Real-time Customer Success calculations
          const parsedRenewalTarget = parseFloat(String(renewalTarget)) || 1;
          const parsedRenewalActual = parseFloat(String(renewalActual)) || 0;
          const parsedRenewalWeight = parseFloat(String(renewalWeight)) || 0;

          const parsedRetentionActual =
            parseFloat(String(retentionActual)) || 0;
          const parsedRetentionWeight =
            parseFloat(String(retentionWeight)) || 0;

          const parsedExpansionTarget =
            parseFloat(String(expansionTarget)) || 1;
          const parsedExpansionActual =
            parseFloat(String(expansionActual)) || 0;
          const parsedExpansionWeight =
            parseFloat(String(expansionWeight)) || 0;

          const parsedHealthActual = parseFloat(String(healthActual)) || 0;
          const parsedHealthWeight = parseFloat(String(healthWeight)) || 0;

          const parsedAdoptionActual = parseFloat(String(adoptionActual)) || 0;
          const parsedAdoptionWeight = parseFloat(String(adoptionWeight)) || 0;

          const computedRenewal =
            parsedRenewalTarget > 0
              ? (parsedRenewalActual / parsedRenewalTarget) *
                parsedRenewalWeight
              : 0;
          const computedRetention =
            (parsedRetentionActual / 100) * parsedRetentionWeight;
          const computedExpansion =
            parsedExpansionTarget > 0
              ? (parsedExpansionActual / parsedExpansionTarget) *
                parsedExpansionWeight
              : 0;
          const computedHealth =
            (parsedHealthActual / 100) * parsedHealthWeight;
          const computedAdoption =
            (parsedAdoptionActual / 100) * parsedAdoptionWeight;

          const sumOfCustomerSuccessWeights =
            parsedRenewalWeight +
            parsedRetentionWeight +
            parsedExpansionWeight +
            parsedHealthWeight +
            parsedAdoptionWeight;
          const csRoleScore = Math.min(
            80,
            computedRenewal +
              computedRetention +
              computedExpansion +
              computedHealth +
              computedAdoption,
          );

          const csConductScore = companyWideConducts.reduce((sum, item) => {
            const rating =
              conductActualPoints[item.id] !== undefined
                ? conductActualPoints[item.id]
                : 5;
            const val = (rating / 5) * item.points;
            return sum + val;
          }, 0);

          const isCustomerSuccessWeightSumInvalid =
            selectedRoleType === "Customer Success" &&
            sumOfCustomerSuccessWeights > 80;
          const computedCustomerSuccessOverallScore = Math.max(
            0,
            Math.min(100, Math.round(csRoleScore + csConductScore)),
          );

          // Real-time Operations calculations
          const parsedFulfillmentRate = parseFloat(String(fulfillmentRate)) || 0;
          const parsedFulfillmentWeight = parseFloat(String(fulfillmentWeight)) || 0;

          const parsedAccuracyRate = parseFloat(String(accuracyRate)) || 0;
          const parsedAccuracyWeight = parseFloat(String(accuracyWeight)) || 0;

          const parsedActualSavings = parseFloat(String(actualSavings)) || 0;
          const parsedTargetSavings = parseFloat(String(targetSavings)) || 1;
          const parsedSavingsWeight = parseFloat(String(savingsWeight)) || 0;

          const parsedTargetVariance = parseFloat(String(targetVariance)) || 1;
          const parsedActualVariance = parseFloat(String(actualVariance)) || 1;
          const parsedVarianceWeight = parseFloat(String(varianceWeight)) || 0;

          const parsedComplianceDeductions = parseFloat(String(complianceDeductions)) || 0;
          const parsedComplianceWeight = parseFloat(String(complianceWeight)) || 0;

          const computedFulfillment = (parsedFulfillmentRate / 100) * parsedFulfillmentWeight;
          const computedAccuracy = (parsedAccuracyRate / 100) * parsedAccuracyWeight;
          const computedSavings = parsedTargetSavings > 0 ? (parsedActualSavings / parsedTargetSavings) * parsedSavingsWeight : 0;
          const computedVariance = parsedActualVariance > 0 ? (parsedTargetVariance / parsedActualVariance) * parsedVarianceWeight : 0;
          const computedCompliance = Math.max(0, ((10 - parsedComplianceDeductions) / 10) * parsedComplianceWeight);

          const sumOfOperationsWeights =
            parsedFulfillmentWeight +
            parsedAccuracyWeight +
            parsedSavingsWeight +
            parsedVarianceWeight +
            parsedComplianceWeight;

          const operationsRoleScore = Math.min(
            80,
            computedFulfillment +
              computedAccuracy +
              computedSavings +
              computedVariance +
              computedCompliance,
          );

          const operationsConductScore = companyWideConducts.reduce((sum, item) => {
            const rating =
              conductActualPoints[item.id] !== undefined
                ? conductActualPoints[item.id]
                : 5;
            const val = (rating / 5) * item.points;
            return sum + val;
          }, 0);

          const isOperationsWeightSumInvalid =
            selectedRoleType === "Operations" && sumOfOperationsWeights > 80;

          const computedOperationsOverallScore = Math.max(
            0,
            Math.min(100, Math.round(operationsRoleScore + operationsConductScore)),
          );

          // Real-time Manager calculations
          const parsedTeamTarget = parseFloat(String(managerTeamTarget)) || 1;
          const parsedActualTeam = parseFloat(String(managerActualTeamResult)) || 0;
          const parsedQuality = parseFloat(String(managerQualityPercent)) || 0;
          const parsedCompliance = parseFloat(String(managerCompliancePercent)) || 0;
          const parsedReporting = parseFloat(String(managerReportingRating)) || 0;
          const parsedPeopleMgmt = parseFloat(String(managerPeopleManagementRating)) || 0;
          const parsedLeadership = parseFloat(String(managerLeadershipRating)) || 0;

          const computedTeamAchievement = parsedTeamTarget > 0 ? (parsedActualTeam / parsedTeamTarget) * 30 : 0;
          const computedTeamQuality = (parsedQuality / 100) * 15;
          const computedTeamCompliance = (parsedCompliance / 100) * 10;
          const computedReporting = (parsedReporting / 5) * 10;
          const computedPeopleMgmt = (parsedPeopleMgmt / 5) * 10;
          const computedLeadership = (parsedLeadership / 5) * 5;

          const managerRoleScore = Math.min(
            80,
            isCumulativeManager
              ? (avgTeamPerf * 0.8)
              : (computedTeamAchievement +
                 computedTeamQuality +
                 computedTeamCompliance +
                 computedReporting +
                 computedPeopleMgmt +
                 computedLeadership)
          );

          const managerConductScore = companyWideConducts.reduce((sum, item) => {
            const rating =
              conductActualPoints[item.id] !== undefined
                ? conductActualPoints[item.id]
                : 5;
            const val = (rating / 5) * item.points;
            return sum + val;
          }, 0);

          const computedManagerOverallScore = Math.max(
            0,
            Math.min(100, Math.round(managerRoleScore + managerConductScore)),
          );

          const isSubmitDisabled =
            !updatePointsFormUser ||
            (selectedRoleType === "Engineering" &&
              updatePointsFormType === "company conduct" &&
              conductsTotalPoints > 20) ||
            (selectedRoleType === "Tech Support" && isWeightSumInvalid) ||
            (selectedRoleType === "Marketing" && isMarketingWeightSumInvalid) ||
            (selectedRoleType === "Sales" && isSalesWeightSumInvalid) ||
            (selectedRoleType === "Customer Success" &&
              isCustomerSuccessWeightSumInvalid) ||
            (selectedRoleType === "Operations" &&
              isOperationsWeightSumInvalid);

          return (
            <div
              role="region"
              aria-label="Staff Performance & Review Engine Workspace"
              className="fixed inset-0 bg-slate-100 z-50 flex flex-col font-sans overflow-hidden animate-fade-in"
            >
              <div className="w-full h-full flex flex-col bg-slate-50 overflow-hidden">
                {/* Executive Full-Page Workspace Header - Light Clean Theme */}
                <div className="bg-white text-slate-900 px-6 sm:px-8 py-4 flex items-center justify-between border-b border-slate-200 shrink-0 relative overflow-hidden shadow-xs">
                  <div className="flex items-center gap-4 relative z-10">
                    <button
                      onClick={() => setIsUpdatePointsModalOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-all border border-slate-200/80 cursor-pointer shadow-xs active:scale-98 font-sans"
                      title="Back to HR Center Dashboard"
                    >
                      <i className="fas fa-arrow-left text-slate-600"></i>
                      <span className="hidden sm:inline">Back</span>
                    </button>

                    <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

                    <div className="flex items-center gap-3">
                      <div>
                        <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                          Add Review
                        </h2>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 relative z-10">
                    {onOpenAppraisalWizard && (
                      <button
                        onClick={() => {
                          setIsUpdatePointsModalOpen(false);
                          onOpenAppraisalWizard();
                        }}
                        className="px-4 py-2 bg-[#02275A] hover:bg-[#0b3b82] text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-sm cursor-pointer font-sans"
                      >
                        <i className="fas fa-wand-magic-sparkles text-white"></i>
                        <span>Launch Appraisal Wizard</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto bg-slate-50/70 p-4 sm:p-8 space-y-6">
                  <div className="max-w-7xl mx-auto space-y-6">
                  {/* Dual Inputs: Select User & Employee Role */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">
                        Select User *
                      </label>
                      <select
                        required
                        value={updatePointsFormUser}
                        onChange={(e) => {
                          const val = e.target.value;
                          setUpdatePointsFormUser(val);
                          const emp = employees.find((emp) => emp.id === val);
                          if (emp) {
                            setReviewDateType((emp as any).reviewDateType || "monthly");
                            const roll = (emp.role || "").toLowerCase();
                            const dept = (emp.department || "").toLowerCase();
                            const isManager =
                              roll.includes("manager") ||
                              roll.includes("lead") ||
                              emp.is_team_lead === true;
                            const isCs =
                              !isManager && (
                              roll.includes("success") ||
                              dept.includes("success"));
                            const isEng =
                              !isCs &&
                              (roll.includes("engineer") ||
                                dept.includes("engineer") ||
                                roll.includes("develop") ||
                                dept.includes("tech"));
                            const isSupp =
                              !isCs &&
                              (roll.includes("support") ||
                                dept.includes("support") ||
                                dept.includes("experience") ||
                                roll.includes("cx"));
                            const isMark =
                              !isCs &&
                              (roll.includes("marketing") ||
                                dept.includes("marketing") ||
                                roll.includes("growth") ||
                                dept.includes("growth") ||
                                roll.includes("brand") ||
                                dept.includes("brand"));
                            const isSales =
                              !isCs &&
                              (roll.includes("sales") ||
                                dept.includes("sales"));
                            const isOp =
                              !isCs && !isEng && !isSupp && !isMark && !isSales &&
                              (roll.includes("operation") ||
                                dept.includes("operation") ||
                                roll.includes("logistic") ||
                                dept.includes("logistic") ||
                                roll.includes("inventory") ||
                                dept.includes("inventory") ||
                                roll.includes("warehouse") ||
                                dept.includes("warehouse"));

                            if (isManager) {
                              setSelectedRoleType("Manager");
                              setUpdatePointsFormType("performance");
                              if (emp.managerInputs) {
                                const inputs = emp.managerInputs;
                                setManagerTeamTarget(inputs.teamTarget);
                                setManagerActualTeamResult(inputs.actualTeamResult);
                                setManagerQualityPercent(inputs.qualityPercent);
                                setManagerCompliancePercent(inputs.compliancePercent);
                                setManagerReportingRating(inputs.reportingRating);
                                setManagerPeopleManagementRating(inputs.peopleManagementRating);
                                setManagerLeadershipRating(inputs.leadershipRating);
                              } else {
                                setManagerTeamTarget(0);
                                setManagerActualTeamResult(0);
                                setManagerQualityPercent(0);
                                setManagerCompliancePercent(0);
                                setManagerReportingRating(0);
                                setManagerPeopleManagementRating(0);
                                setManagerLeadershipRating(0);
                              }

                              if (emp.managerConductPoints) {
                                setConductActualPoints(emp.managerConductPoints);
                              } else {
                                setConductActualPoints({});
                              }

                              setUpdatePointsFormVal("0");
                              setUpdatePointsFormReason("");
                            } else if (isCs) {
                              setSelectedRoleType("Customer Success");
                              setUpdatePointsFormType("performance");
                              if (emp.customerSuccessInputs) {
                                const inputs = emp.customerSuccessInputs;
                                setRenewalTarget(inputs.renewalTarget);
                                setRenewalActual(inputs.renewalActual);
                                setRenewalWeight(inputs.renewalWeight);
                                setRetentionActual(inputs.retentionActual);
                                setRetentionWeight(inputs.retentionWeight);
                                setExpansionTarget(inputs.expansionTarget);
                                setExpansionActual(inputs.expansionActual);
                                setExpansionWeight(inputs.expansionWeight);
                                setHealthActual(inputs.healthActual);
                                setHealthWeight(inputs.healthWeight);
                                setAdoptionActual(inputs.adoptionActual);
                                setAdoptionWeight(inputs.adoptionWeight);
                              } else {
                                setRenewalTarget(0);
                                setRenewalActual(0);
                                setRenewalWeight(25);
                                setRetentionActual(0);
                                setRetentionWeight(20);
                                setExpansionTarget(0);
                                setExpansionActual(0);
                                setExpansionWeight(15);
                                setHealthActual(0);
                                setHealthWeight(10);
                                setAdoptionActual(0);
                                setAdoptionWeight(10);
                              }

                              if (emp.customerSuccessConductPoints) {
                                setConductActualPoints(
                                  emp.customerSuccessConductPoints,
                                );
                              } else {
                                setConductActualPoints({});
                              }

                              setUpdatePointsFormVal("0");
                              setUpdatePointsFormReason("");
                            } else if (isEng) {
                              setSelectedRoleType("Engineering");
                              setUpdatePointsFormType("company conduct");
                              setConductActualPoints({});
                              setUpdatePointsFormVal("0");
                              const defaultReason = `Company Conduct Evaluation: ${companyWideConducts.map((item) => `${item.name}: ${item.points}/${item.points}`).join(", ")}. Net adjustment: 0 pts.`;
                              setUpdatePointsFormReason(defaultReason);
                            } else if (isSupp) {
                              setSelectedRoleType("Tech Support");
                              setUpdatePointsFormType("performance");
                              if (emp.techSupportInputs) {
                                const inputs = emp.techSupportInputs;
                                setSlaTickets(inputs.slaTickets);
                                setTotalTickets(inputs.totalTickets);
                                setTargetResponseTime(
                                  inputs.targetResponseTime,
                                );
                                setActualResponseTime(
                                  inputs.actualResponseTime,
                                );
                                setResolvedTickets(inputs.resolvedTickets);
                                setAssignedTickets(inputs.assignedTickets);
                                setCustomerSatisfaction(
                                  inputs.customerSatisfaction,
                                );
                                setTargetReopenRate(inputs.targetReopenRate);
                                setActualReopenRate(inputs.actualReopenRate);

                                setSlaWeight(inputs.slaWeight ?? 20);
                                setFirstResponseWeight(
                                  inputs.firstResponseWeight ?? 15,
                                );
                                setResolutionWeight(
                                  inputs.resolutionWeight ?? 15,
                                );
                                setCsatWeight(inputs.csatWeight ?? 20);
                                setReopenWeight(inputs.reopenWeight ?? 10);
                              } else {
                                setSlaTickets(0);
                                setTotalTickets(0);
                                setTargetResponseTime(0);
                                setActualResponseTime(0);
                                setResolvedTickets(0);
                                setAssignedTickets(0);
                                setCustomerSatisfaction(0);
                                setTargetReopenRate(0);
                                setActualReopenRate(0);

                                setSlaWeight(20);
                                setFirstResponseWeight(15);
                                setResolutionWeight(15);
                                setCsatWeight(20);
                                setReopenWeight(10);
                              }

                              if (emp.techSupportConductPoints) {
                                setConductActualPoints(
                                  emp.techSupportConductPoints,
                                );
                              } else {
                                setConductActualPoints({});
                              }

                              setUpdatePointsFormVal("0");
                              setUpdatePointsFormReason("");
                            } else if (isMark) {
                              setSelectedRoleType("Marketing");
                              setUpdatePointsFormType("performance");
                              if (emp.marketingInputs) {
                                const inputs = emp.marketingInputs;
                                setLeadsGeneratedTarget(
                                  inputs.leadsGeneratedTarget,
                                );
                                setLeadsGeneratedActual(
                                  inputs.leadsGeneratedActual,
                                );
                                setLeadsGeneratedWeight(
                                  inputs.leadsGeneratedWeight,
                                );

                                setCostPerLeadTarget(inputs.costPerLeadTarget);
                                setCostPerLeadActual(inputs.costPerLeadActual);
                                setCostPerLeadWeight(inputs.costPerLeadWeight);

                                setQualifiedLeadRateTarget(
                                  inputs.qualifiedLeadRateTarget,
                                );
                                setQualifiedLeadRateActual(
                                  inputs.qualifiedLeadRateActual,
                                );
                                setQualifiedLeadRateWeight(
                                  inputs.qualifiedLeadRateWeight,
                                );

                                setCampaignConversionTarget(
                                  inputs.campaignConversionTarget,
                                );
                                setCampaignConversionActual(
                                  inputs.campaignConversionActual,
                                );
                                setCampaignConversionWeight(
                                  inputs.campaignConversionWeight,
                                );
                              } else {
                                setLeadsGeneratedTarget(500);
                                setLeadsGeneratedActual(500);
                                setLeadsGeneratedWeight(25);

                                setCostPerLeadTarget(5.0);
                                setCostPerLeadActual(5.0);
                                setCostPerLeadWeight(20);

                                setQualifiedLeadRateTarget(40);
                                setQualifiedLeadRateActual(40);
                                setQualifiedLeadRateWeight(20);

                                setCampaignConversionTarget(5.0);
                                setCampaignConversionActual(5.0);
                                setCampaignConversionWeight(15);
                              }

                              if (emp.marketingConductPoints) {
                                setConductActualPoints(
                                  emp.marketingConductPoints,
                                );
                              } else {
                                setConductActualPoints({});
                              }

                              setUpdatePointsFormVal("0");
                              setUpdatePointsFormReason("");
                            } else if (isSales) {
                              setSelectedRoleType("Sales");
                              setUpdatePointsFormType("performance");
                              if (emp.salesInputs) {
                                const inputs = emp.salesInputs;
                                setRevenueTarget(inputs.revenueTarget);
                                setRevenueActual(inputs.revenueActual);
                                setRevenueWeight(inputs.revenueWeight);

                                setDealsTarget(inputs.dealsTarget);
                                setDealsActual(inputs.dealsActual);
                                setDealsWeight(inputs.dealsWeight);

                                setConversionTarget(inputs.conversionTarget);
                                setConversionActual(inputs.conversionActual);
                                setConversionWeight(inputs.conversionWeight);

                                setCollectionsTarget(inputs.collectionsTarget);
                                setCollectionsActual(inputs.collectionsActual);
                                setCollectionsWeight(inputs.collectionsWeight);
                              } else {
                                setRevenueTarget(0);
                                setRevenueActual(0);
                                setRevenueWeight(35);

                                setDealsTarget(0);
                                setDealsActual(0);
                                setDealsWeight(15);

                                setConversionTarget(0);
                                setConversionActual(0);
                                setConversionWeight(15);

                                setCollectionsTarget(0);
                                setCollectionsActual(0);
                                setCollectionsWeight(15);
                              }

                              if (emp.salesConductPoints) {
                                setConductActualPoints(emp.salesConductPoints);
                              } else {
                                setConductActualPoints({});
                              }

                              setUpdatePointsFormVal("0");
                              setUpdatePointsFormReason("");
                            } else if (isOp) {
                              setSelectedRoleType("Operations");
                              setUpdatePointsFormType("performance");
                              if (emp.operationsInputs) {
                                const inputs = emp.operationsInputs;
                                setFulfillmentRate(inputs.fulfillmentRate);
                                setFulfillmentWeight(inputs.fulfillmentWeight);
                                setAccuracyRate(inputs.accuracyRate);
                                setAccuracyWeight(inputs.accuracyWeight);
                                setActualSavings(inputs.actualSavings);
                                setTargetSavings(inputs.targetSavings);
                                setSavingsWeight(inputs.savingsWeight);
                                setTargetVariance(inputs.targetVariance);
                                setActualVariance(inputs.actualVariance);
                                setVarianceWeight(inputs.varianceWeight);
                                setComplianceDeductions(inputs.complianceDeductions);
                                setComplianceWeight(inputs.complianceWeight);
                              } else {
                                setFulfillmentRate(0);
                                setFulfillmentWeight(20);
                                setAccuracyRate(0);
                                setAccuracyWeight(20);
                                setActualSavings(0);
                                setTargetSavings(0);
                                setSavingsWeight(15);
                                setTargetVariance(0);
                                setActualVariance(0);
                                setVarianceWeight(15);
                                setComplianceDeductions(0);
                                setComplianceWeight(10);
                              }

                              if (emp.operationsConductPoints) {
                                setConductActualPoints(emp.operationsConductPoints);
                              } else {
                                setConductActualPoints({});
                              }

                              setUpdatePointsFormVal("0");
                              setUpdatePointsFormReason("");
                            } else {
                              setSelectedRoleType("Engineering");
                              setUpdatePointsFormType("performance");
                              setUpdatePointsFormVal("");
                              setUpdatePointsFormReason("");
                            }
                          }
                        }}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-900/10 bg-white font-sans"
                      >
                        <option value="">Choose a user...</option>
                        {eligibleEmployees.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.firstName} {emp.lastName} [{emp.role} -{" "}
                            {emp.department}]
                          </option>
                        ))}
                      </select>
                    </div>

                    {!isTeamLeadRole && (
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">
                          Role/Formula Presets *
                        </label>
                        <select
                          value={selectedRoleType}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSelectedRoleType(val);
                            if (val === "Engineering") {
                              setUpdatePointsFormType("company conduct");
                              setConductActualPoints({});
                              setUpdatePointsFormVal("0");
                              const defaultReason = `Company Conduct Evaluation: ${companyWideConducts.map((item) => `${item.name}: ${item.points}/${item.points}`).join(", ")}. Net adjustment: 0 pts.`;
                              setUpdatePointsFormReason(defaultReason);
                            } else if (val === "Marketing") {
                              setUpdatePointsFormType("performance");
                              setUpdatePointsFormVal("0");
                              setUpdatePointsFormReason("");
                              // Reset/set defaults for Marketing to 0
                              setLeadsGeneratedTarget(0);
                              setLeadsGeneratedActual(0);
                              setLeadsGeneratedWeight(25);

                              setCostPerLeadTarget(0);
                              setCostPerLeadActual(0);
                              setCostPerLeadWeight(20);

                              setQualifiedLeadRateTarget(0);
                              setQualifiedLeadRateActual(0);
                              setQualifiedLeadRateWeight(20);

                              setCampaignConversionTarget(0);
                              setCampaignConversionActual(0);
                              setCampaignConversionWeight(15);

                              setConductActualPoints({});
                            } else if (val === "Sales") {
                              setUpdatePointsFormType("performance");
                              setUpdatePointsFormVal("0");
                              setUpdatePointsFormReason("");
                              setRevenueTarget(0);
                              setRevenueActual(0);
                              setRevenueWeight(35);
                              setDealsTarget(0);
                              setDealsActual(0);
                              setDealsWeight(15);
                              setConversionTarget(0);
                              setConversionActual(0);
                              setConversionWeight(15);
                              setCollectionsTarget(0);
                              setCollectionsActual(0);
                              setCollectionsWeight(15);
                              setConductActualPoints({});
                            } else if (val === "Customer Success") {
                              setUpdatePointsFormType("performance");
                              setUpdatePointsFormVal("0");
                              setUpdatePointsFormReason("");
                              setRenewalTarget(0);
                              setRenewalActual(0);
                              setRenewalWeight(25);
                              setRetentionActual(0);
                              setRetentionWeight(20);
                              setExpansionTarget(0);
                              setExpansionActual(0);
                              setExpansionWeight(15);
                              setHealthActual(0);
                              setHealthWeight(10);
                              setAdoptionActual(0);
                              setAdoptionWeight(10);
                              setConductActualPoints({});
                            } else if (val === "Operations") {
                              setUpdatePointsFormType("performance");
                              setUpdatePointsFormVal("0");
                              setUpdatePointsFormReason("");
                              setFulfillmentRate(0);
                              setFulfillmentWeight(20);
                              setAccuracyRate(0);
                              setAccuracyWeight(20);
                              setActualSavings(0);
                              setTargetSavings(0);
                              setSavingsWeight(15);
                              setTargetVariance(0);
                              setActualVariance(0);
                              setVarianceWeight(15);
                              setComplianceDeductions(0);
                              setComplianceWeight(10);
                              setConductActualPoints({});
                            } else if (val === "Manager") {
                              setUpdatePointsFormType("performance");
                              setUpdatePointsFormVal("0");
                              setUpdatePointsFormReason("");
                              setManagerTeamTarget(0);
                              setManagerActualTeamResult(0);
                              setManagerQualityPercent(0);
                              setManagerCompliancePercent(0);
                              setManagerReportingRating(0);
                              setManagerPeopleManagementRating(0);
                              setManagerLeadershipRating(0);
                              setConductActualPoints({});
                            } else if (val === "Tech Support") {
                              setUpdatePointsFormType("performance");
                              setUpdatePointsFormVal("0");
                              setUpdatePointsFormReason("");
                              setSlaTickets(0);
                              setTotalTickets(0);
                              setTargetResponseTime(0);
                              setActualResponseTime(0);
                              setResolvedTickets(0);
                              setAssignedTickets(0);
                              setCustomerSatisfaction(0);
                              setTargetReopenRate(0);
                              setActualReopenRate(0);
                              setSlaWeight(20);
                              setFirstResponseWeight(15);
                              setResolutionWeight(15);
                              setCsatWeight(20);
                              setReopenWeight(10);
                              setConductActualPoints({});
                            } else {
                              setUpdatePointsFormType("performance");
                              setUpdatePointsFormVal("0");
                              setUpdatePointsFormReason("");
                            }
                          }}
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-900/10 bg-[#ffffff] font-sans"
                        >
                          <option value="Engineering">
                            Engineering (Standard Conduct Based)
                          </option>
                          <option value="Tech Support">
                            Tech Support (Formula-Based KPIs + Conduct)
                          </option>
                          <option value="Marketing">
                            Marketing (Formula-Based KPIs + Conduct)
                          </option>
                          <option value="Sales">
                            Sales (Formula-Based KPIs + Conduct)
                          </option>
                          <option value="Customer Success">
                            Customer Success (Formula-Based KPIs + Conduct)
                          </option>
                          <option value="Operations">
                            Operations (Formula-Based KPIs + Conduct)
                          </option>
                          <option value="Manager">
                            Manager / Team Lead (Formula-Based KPIs + Conduct)
                          </option>
                        </select>
                      </div>
                    )}
                  </div>

                  {updatePointsFormUser ? (
                    <>
                      {/* Hero Employee Profile Banner */}
                      {(() => {
                        const currentEmp = employees.find((e) => e.id === updatePointsFormUser);
                        if (!currentEmp) return null;
                        const score = currentEmp.performanceScore ?? 100;
                        const grade = score >= 90 ? "A+" : score >= 80 ? "A" : score >= 70 ? "B" : score >= 60 ? "C" : "D";
                        const gradeBg = score >= 80 ? "bg-emerald-500/10 text-emerald-700 border-emerald-300" : score >= 60 ? "bg-amber-500/10 text-amber-700 border-amber-300" : "bg-rose-500/10 text-rose-700 border-rose-300";

                        return (
                          <div className="bg-white text-slate-900 rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/90 flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in relative overflow-hidden">
                            <div className="flex items-center gap-3.5 min-w-0 relative z-10">
                              <div className="w-12 h-12 rounded-2xl bg-[#02275A]/10 text-[#02275A] border border-[#02275A]/20 font-black text-lg flex items-center justify-center shrink-0 shadow-xs uppercase">
                                {currentEmp.firstName?.[0]}{currentEmp.lastName?.[0]}
                              </div>
                              <div className="min-w-0 text-left">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="text-base font-extrabold text-slate-900 truncate">
                                    {currentEmp.firstName} {currentEmp.lastName}
                                  </h3>
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 font-mono">
                                    ID: #{currentEmp.id?.substring(0, 6)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-600 mt-1 flex-wrap font-sans">
                                  <span className="font-semibold text-slate-800">{currentEmp.role}</span>
                                  <span className="text-slate-300">•</span>
                                  <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold text-slate-700 border border-slate-200/80">{currentEmp.department}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 bg-slate-50/90 p-2.5 px-3.5 rounded-xl border border-slate-200/80 items-center">
                        <div>
                          <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1 font-sans">
                            Review Quarter / Period
                          </label>
                          <div className="w-full px-3 py-1.5 bg-white border border-slate-200 text-slate-900 text-xs font-black rounded-lg flex items-center justify-between shadow-2xs">
                            <span>{activeQuarter}</span>
                            <span className="bg-amber-50 text-amber-800 border border-amber-200/60 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                              Active
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1 font-sans">
                            Review Type *
                          </label>
                          <select
                            value={reviewType}
                            onChange={(e) => {
                              const val = e.target.value as "weekly" | "monthly";
                              setReviewType(val);
                              setReviewDateType(val as any);
                              if (val === "monthly") {
                                setEngineTab("kpis");
                              } else {
                                setEngineTab("weekly");
                              }
                            }}
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 text-slate-800 text-xs rounded-lg hover:border-slate-300 transition-all focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-bold font-sans cursor-pointer shadow-2xs"
                          >
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                          </select>
                        </div>
                      </div>

                  {(reviewType === "weekly" || reviewType === "monthly") && (
                    <div className="bg-white border border-slate-200 rounded-xl p-2.5 px-3.5 space-y-2 animate-fade-in text-left">
                      {reviewType === "weekly" && (
                        <div className="flex items-center justify-between border-b border-slate-200/80 pb-1">
                          <h4 className="text-[11px] font-extrabold uppercase text-slate-800 tracking-wider">
                            Weekly Review Specifications
                          </h4>
                        </div>
                      )}
                      <div className={`grid grid-cols-1 ${reviewType === "weekly" ? "md:grid-cols-3" : "md:grid-cols-2"} gap-2 md:gap-3`}>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                            Year *
                          </label>
                          <select
                            value={weeklyYear}
                            onChange={(e) => setWeeklyYear(e.target.value)}
                            className="w-full px-2.5 py-1 bg-white border border-slate-200 text-slate-700 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-semibold cursor-pointer"
                          >
                            <option value="2026">2026</option>
                            <option value="2027">2027</option>
                            <option value="2025">2025</option>
                            <option value="2024">2024</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                            Month *
                          </label>
                          <select
                            value={weeklyMonth}
                            onChange={(e) => setWeeklyMonth(e.target.value)}
                            className="w-full px-2.5 py-1 bg-white border border-slate-200 text-slate-700 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-semibold cursor-pointer"
                          >
                            {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((m) => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                        </div>
                        {reviewType === "weekly" && (
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                              Week *
                            </label>
                            <select
                              value={weeklyWeek}
                              onChange={(e) => setWeeklyWeek(e.target.value)}
                              className="w-full px-2.5 py-1 bg-white border border-slate-200 text-slate-700 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-semibold cursor-pointer"
                            >
                              {Array.from({ length: getWeeksInMonth(weeklyYear, weeklyMonth) }).map((_, i) => (
                                <option key={i} value={`Week ${i + 1}`}>Week {i + 1}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                      <div>
                        {reviewType === "weekly" ? (
                          (() => {
                            const reqWeeks = getWeeksInMonth(weeklyYear, weeklyMonth);
                            const selWeekNum = parseInt(String(weeklyWeek).replace(/\D/g, ""), 10) || 1;
                            const empForCheck = employees.find((e) => e.id === updatePointsFormUser) || selectedEmp;
                            const recordedReviews = (empForCheck?.weeklyReviews || []).filter(
                              (r: any) => String(r.year) === String(weeklyYear) && String(r.month) === String(weeklyMonth)
                            );
                            const recordedWeeksCount = new Set(
                              recordedReviews.map((r: any) => String(r.week).toLowerCase().trim())
                            ).size;
                            const isLastWeekRecordedOrSelected = selWeekNum >= reqWeeks || recordedWeeksCount >= reqWeeks;

                            return (
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                                  Weekly Comments {isLastWeekRecordedOrSelected ? "*" : "(Optional)"}
                                </label>
                                <textarea
                                  required={isLastWeekRecordedOrSelected}
                                  rows={1.5}
                                  placeholder="Please enter the detailed weekly evaluation comments..."
                                  value={weeklyComments}
                                  onChange={(e) => setWeeklyComments(e.target.value)}
                                  className="w-full px-3 py-1 bg-white border border-slate-200 text-slate-700 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-sans leading-normal"
                                />
                              </div>
                            );
                          })()
                        ) : (
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                              Monthly Comments *
                            </label>
                            <textarea
                              required
                              rows={1.5}
                              placeholder="Please enter the detailed monthly evaluation comments..."
                              value={weeklyComments}
                              onChange={(e) => setWeeklyComments(e.target.value)}
                              className="w-full px-3 py-1 bg-white border border-slate-200 text-slate-700 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-sans leading-normal"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                      {/* Workspace Sub-Navigation Tab Switcher */}
                      <div className="flex flex-wrap items-center justify-between gap-2 font-sans my-1.5">
                        <div className="flex items-center gap-1.5 w-full sm:w-auto">
                          <button
                            type="button"
                            onClick={() => setEngineTab("kpis")}
                            className={`px-3.5 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap shadow-2xs ${
                              engineTab === "kpis"
                                ? "bg-[#02275A] text-white font-extrabold ring-1 ring-slate-900/10"
                                : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 font-bold"
                            }`}
                          >
                            <i className="fas fa-sliders text-emerald-400"></i>
                            <span>Role KPIs ({selectedRoleType})</span>
                          </button>
                          {reviewType !== "monthly" && (
                            <button
                              type="button"
                              onClick={() => setEngineTab("weekly")}
                              className={`px-3.5 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap shadow-2xs ${
                                engineTab === "weekly"
                                  ? "bg-[#02275A] text-white font-extrabold ring-1 ring-slate-900/10"
                                  : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 font-bold"
                              }`}
                            >
                              <i className="fas fa-calendar-days text-amber-400"></i>
                              <span>Weekly Logs</span>
                              {selectedEmp && (
                                <span
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                                    engineTab === "weekly"
                                      ? "bg-white/20 text-white"
                                      : "bg-slate-100 text-slate-700 border border-slate-200/60"
                                  }`}
                                >
                                  {
                                    (selectedEmp.weeklyReviews || []).filter(
                                      (r: any) =>
                                        String(r.year) === String(weeklyYear) &&
                                        String(r.month) === String(weeklyMonth)
                                    ).length
                                  } logged
                                </span>
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* TAB 1: WEEKLY LOGS */}
                      {reviewType !== "monthly" && engineTab === "weekly" && (
                        <div className="space-y-4 animate-fade-in">

                  {selectedEmp && reviewType === "weekly" && (() => {
                    const currentMonthWeeklyReviews = (selectedEmp.weeklyReviews || []).filter(
                      (r: any) => String(r.year) === String(weeklyYear) && String(r.month) === String(weeklyMonth)
                    );
                    const requiredWeeksForMonth = getWeeksInMonth(weeklyYear, weeklyMonth);
                    const uniqueWeeksRecorded = new Set(
                      currentMonthWeeklyReviews.map((r: any) => String(r.week).toLowerCase().trim())
                    ).size;
                    const isAllWeeksCompleted = uniqueWeeksRecorded >= requiredWeeksForMonth;

                    const existingMonthlyForMonth = (selectedEmp.monthlyReviews || []).find(
                      (m: any) => String(m.year) === String(weeklyYear) && String(m.month) === String(weeklyMonth)
                    );
                    const isMonthLocked = existingMonthlyForMonth?.isLocked || false;

                    const handleComputeMonthlyClick = () => {
                      if (!isAllWeeksCompleted) {
                        alert(`Cannot compute monthly performance. All ${requiredWeeksForMonth} required weeks for ${weeklyMonth} ${weeklyYear} must be completed first.`);
                        return;
                      }

                      const computedScore = (() => {
                        if (selectedRoleType === "Tech Support") return computedTechSupportOverallScore;
                        if (selectedRoleType === "Marketing") return computedMarketingOverallScore;
                        if (selectedRoleType === "Sales") return computedSalesOverallScore;
                        if (selectedRoleType === "Customer Success") return computedCustomerSuccessOverallScore;
                        if (selectedRoleType === "Operations") return computedOperationsOverallScore;
                        if (selectedRoleType === "Manager") return computedManagerOverallScore;
                        return selectedEmp.performanceScore ?? 100;
                      })();

                      const computedGrade = calculateGradeFromPerformance(computedScore);

                      const newMonthlyRecord = {
                        id: `monthly-${weeklyYear}-${weeklyMonth}`,
                        year: weeklyYear,
                        month: weeklyMonth,
                        performanceScore: computedScore,
                        grade: computedGrade,
                        comments: `Monthly performance calculated across ${currentMonthWeeklyReviews.length} weekly records for ${weeklyMonth} ${weeklyYear}.`,
                        dateCreated: new Date().toISOString().split("T")[0],
                        roleType: selectedRoleType,
                        isCalculated: true,
                        isLocked: true,
                        status: "Locked",
                        weeklyCount: currentMonthWeeklyReviews.length,
                        totalWeeksInMonth: requiredWeeksForMonth,
                      };

                      setEmployees((prev) => {
                        const updated = prev.map((item) => {
                          if (item.id === selectedEmp.id || item.employeeId === selectedEmp.id) {
                            const existingMonthlyReviews = Array.isArray(item.monthlyReviews) ? [...item.monthlyReviews] : [];
                            const existingIdx = existingMonthlyReviews.findIndex(
                              (m: any) => String(m.year) === String(weeklyYear) && String(m.month) === String(weeklyMonth)
                            );

                            if (existingIdx >= 0) {
                              existingMonthlyReviews[existingIdx] = newMonthlyRecord;
                            } else {
                              existingMonthlyReviews.push(newMonthlyRecord);
                            }

                            // Auto reset weekly review history & logs for this employee for this calculated period
                            const updatedWeeklyReviews = (item.weeklyReviews || []).filter(
                              (r: any) => !(String(r.year) === String(weeklyYear) && String(r.month) === String(weeklyMonth))
                            );

                            const updatedEmp = {
                              ...item,
                              monthlyReviews: existingMonthlyReviews,
                              weeklyReviews: updatedWeeklyReviews,
                              performanceScore: computedScore,
                              grade: computedGrade,
                            };

                            if (viewEmployee && viewEmployee.id === item.id) {
                              setViewEmployee(updatedEmp);
                            }
                            return updatedEmp;
                          }
                          return item;
                        });

                        localStorage.setItem("company_employees_data", JSON.stringify(updated));
                        localStorage.setItem("company_employees_kpi_state", JSON.stringify(updated));
                        return updated;
                      });

                      resetWeeklyInputsAndLogs();
                      showSuccess(`Monthly performance for ${weeklyMonth} ${weeklyYear} computed (${computedScore}%) and locked! Weekly review history & logs auto-reset.`);
                    };

                    return (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4 font-sans text-left">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                          <div>
                            <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                              <i className="fas fa-tasks text-slate-700"></i>
                              <span>Weekly Records Status ({weeklyMonth} {weeklyYear})</span>
                            </h3>
                            <p className="text-[11px] text-slate-500 font-medium">
                              {uniqueWeeksRecorded} of {requiredWeeksForMonth} required weeks recorded
                            </p>
                          </div>
                          <div>
                            {isMonthLocked ? (
                              <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5 border border-emerald-200">
                                <i className="fas fa-lock text-emerald-600"></i>
                                <span>Completed & Locked ({existingMonthlyForMonth.performanceScore}%)</span>
                              </span>
                            ) : isAllWeeksCompleted ? (
                              <span className="bg-emerald-600 text-white text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
                                <i className="fas fa-check-circle text-white"></i>
                                <span>Ready for Review</span>
                              </span>
                            ) : null}
                          </div>
                        </div>

                        {/* List of Weekly Records for Selected Month */}
                        <div>
                          <h4 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center justify-between">
                            <span>Recorded Weekly Entries</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-400 font-normal font-mono">
                                {currentMonthWeeklyReviews.length} record(s)
                              </span>
                            </div>
                          </h4>
                          {currentMonthWeeklyReviews.length === 0 ? (
                            <div className="text-center py-4 bg-white rounded-lg border border-dashed border-slate-200 text-slate-400 text-xs italic">
                              No weekly performance entries recorded yet for {weeklyMonth} {weeklyYear}.
                            </div>
                          ) : (
                            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                              {currentMonthWeeklyReviews.map((rev: any, rIdx: number) => {
                                const roleTypeKey = rev.roleType || selectedRoleType;
                                const inp = rev.inputs || {};
                                const cPoints = rev.conductPoints || {};
                                const recCardId = String(rev.id || rIdx);
                                const isRecExpanded = expandedWeeklyId === recCardId;

                                return (
                                  <div key={rev.id || rIdx} className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs space-y-2.5 shadow-xs hover:border-slate-300 transition-all text-left">
                                    {/* Header */}
                                    <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-100 pb-2">
                                      <div className="flex items-center gap-2">
                                        <span className="bg-[#02275A] text-white px-2.5 py-0.5 rounded-lg font-mono font-bold text-[10px] shadow-2xs">
                                          {rev.week}
                                        </span>
                                        <span className="font-extrabold text-slate-800 text-xs">{rev.month} {rev.year}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <button
                                          type="button"
                                          onClick={() => setExpandedWeeklyId(isRecExpanded ? null : recCardId)}
                                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold rounded-md text-[10px] transition-colors cursor-pointer flex items-center gap-1 border border-slate-200 font-sans"
                                        >
                                          <i className={`fas fa-chevron-${isRecExpanded ? "up" : "down"} text-[9px]`}></i>
                                          {isRecExpanded ? "Hide Details" : "View Breakdown"}
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleLoadWeeklyRecordForEdit(rev)}
                                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold rounded-md text-[10px] transition-colors cursor-pointer flex items-center gap-1 font-sans"
                                        >
                                          <i className="fas fa-edit text-[9px]"></i> Edit
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteWeeklyReview(selectedEmp.id, rev.id || rIdx)}
                                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold rounded-md text-[10px] transition-colors cursor-pointer flex items-center gap-1 border border-rose-200/60 font-sans"
                                        >
                                          <i className="fas fa-trash text-[9px]"></i> Delete
                                        </button>
                                      </div>
                                    </div>

                                    {isRecExpanded && (
                                      <div className="space-y-2.5 animate-fade-in">
                                        {/* Role KPI Values */}
                                    <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-200/60 space-y-1.5">
                                      <div className="text-[10px] font-black uppercase tracking-wider text-slate-800 flex items-center gap-1 font-sans">
                                        <i className="fas fa-chart-line text-amber-600"></i>
                                        <span>{roleTypeKey} Role KPI Values</span>
                                      </div>
                                      <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 text-[11px] font-sans">
                                        {roleTypeKey === "Tech Support" && (
                                          <>
                                            <div className="bg-white p-1.5 rounded border border-slate-200/70">
                                              <span className="text-slate-400 block text-[9px] uppercase font-bold">SLA / Total</span>
                                              <span className="font-bold text-slate-800 font-mono">{inp.slaTickets ?? 0} / {inp.totalTickets ?? 0}</span>
                                            </div>
                                            <div className="bg-white p-1.5 rounded border border-slate-200/70">
                                              <span className="text-slate-400 block text-[9px] uppercase font-bold">Resolved / Assigned</span>
                                              <span className="font-bold text-slate-800 font-mono">{inp.resolvedTickets ?? 0} / {inp.assignedTickets ?? 0}</span>
                                            </div>
                                            <div className="bg-white p-1.5 rounded border border-slate-200/70">
                                              <span className="text-slate-400 block text-[9px] uppercase font-bold">Response Time</span>
                                              <span className="font-bold text-slate-800 font-mono">{inp.actualResponseTime ?? 0}h <span className="text-slate-400 font-normal text-[9px]">(Tgt: {inp.targetResponseTime ?? 0}h)</span></span>
                                            </div>
                                            <div className="bg-white p-1.5 rounded border border-slate-200/70">
                                              <span className="text-slate-400 block text-[9px] uppercase font-bold">CSAT Rating</span>
                                              <span className="font-bold text-slate-800 font-mono">{inp.customerSatisfaction ?? 0} / 5</span>
                                            </div>
                                            <div className="bg-white p-1.5 rounded border border-slate-200/70">
                                              <span className="text-slate-400 block text-[9px] uppercase font-bold">Reopen Rate</span>
                                              <span className="font-bold text-slate-800 font-mono">{inp.actualReopenRate ?? 0}% <span className="text-slate-400 font-normal text-[9px]">(Tgt: {inp.targetReopenRate ?? 0}%)</span></span>
                                            </div>
                                          </>
                                        )}

                                        {roleTypeKey === "Marketing" && (
                                          <>
                                            <div className="bg-white p-1.5 rounded border border-slate-200/70">
                                              <span className="text-slate-400 block text-[9px] uppercase font-bold">Leads Generated</span>
                                              <span className="font-bold text-slate-800 font-mono">{inp.leadsGeneratedActual ?? 0} <span className="text-slate-400 font-normal text-[9px]">(Tgt: {inp.leadsGeneratedTarget ?? 0})</span></span>
                                            </div>
                                            <div className="bg-white p-1.5 rounded border border-slate-200/70">
                                              <span className="text-slate-400 block text-[9px] uppercase font-bold">Cost Per Lead</span>
                                              <span className="font-bold text-slate-800 font-mono">${inp.costPerLeadActual ?? 0} <span className="text-slate-400 font-normal text-[9px]">(Tgt: ${inp.costPerLeadTarget ?? 0})</span></span>
                                            </div>
                                            <div className="bg-white p-1.5 rounded border border-slate-200/70">
                                              <span className="text-slate-400 block text-[9px] uppercase font-bold">Qual. Lead Rate</span>
                                              <span className="font-bold text-slate-800 font-mono">{inp.qualifiedLeadRateActual ?? 0}% <span className="text-slate-400 font-normal text-[9px]">(Tgt: {inp.qualifiedLeadRateTarget ?? 0}%)</span></span>
                                            </div>
                                            <div className="bg-white p-1.5 rounded border border-slate-200/70">
                                              <span className="text-slate-400 block text-[9px] uppercase font-bold">Campaign Conv.</span>
                                              <span className="font-bold text-slate-800 font-mono">{inp.campaignConversionActual ?? 0}% <span className="text-slate-400 font-normal text-[9px]">(Tgt: {inp.campaignConversionTarget ?? 0}%)</span></span>
                                            </div>
                                          </>
                                        )}

                                        {roleTypeKey === "Sales" && (
                                          <>
                                            <div className="bg-white p-1.5 rounded border border-slate-200/70">
                                              <span className="text-slate-400 block text-[9px] uppercase font-bold">Revenue</span>
                                              <span className="font-bold text-slate-800 font-mono">${Number(inp.revenueActual ?? 0).toLocaleString()} <span className="text-slate-400 font-normal text-[9px]">(Tgt: ${Number(inp.revenueTarget ?? 0).toLocaleString()})</span></span>
                                            </div>
                                            <div className="bg-white p-1.5 rounded border border-slate-200/70">
                                              <span className="text-slate-400 block text-[9px] uppercase font-bold">Deals Closed</span>
                                              <span className="font-bold text-slate-800 font-mono">{inp.dealsActual ?? 0} <span className="text-slate-400 font-normal text-[9px]">(Tgt: {inp.dealsTarget ?? 0})</span></span>
                                            </div>
                                            <div className="bg-white p-1.5 rounded border border-slate-200/70">
                                              <span className="text-slate-400 block text-[9px] uppercase font-bold">Sales Conv.</span>
                                              <span className="font-bold text-slate-800 font-mono">{inp.conversionActual ?? 0}% <span className="text-slate-400 font-normal text-[9px]">(Tgt: {inp.conversionTarget ?? 0}%)</span></span>
                                            </div>
                                            <div className="bg-white p-1.5 rounded border border-slate-200/70">
                                              <span className="text-slate-400 block text-[9px] uppercase font-bold">Collections</span>
                                              <span className="font-bold text-slate-800 font-mono">${Number(inp.collectionsActual ?? 0).toLocaleString()} <span className="text-slate-400 font-normal text-[9px]">(Tgt: ${Number(inp.collectionsTarget ?? 0).toLocaleString()})</span></span>
                                            </div>
                                          </>
                                        )}

                                        {roleTypeKey === "Customer Success" && (
                                          <>
                                            <div className="bg-white p-1.5 rounded border border-slate-200/70">
                                              <span className="text-slate-400 block text-[9px] uppercase font-bold">Renewal Revenue</span>
                                              <span className="font-bold text-slate-800 font-mono">${Number(inp.renewalActual ?? 0).toLocaleString()} <span className="text-slate-400 font-normal text-[9px]">(Tgt: ${Number(inp.renewalTarget ?? 0).toLocaleString()})</span></span>
                                            </div>
                                            <div className="bg-white p-1.5 rounded border border-slate-200/70">
                                              <span className="text-slate-400 block text-[9px] uppercase font-bold">Retention Rate</span>
                                              <span className="font-bold text-slate-800 font-mono">{inp.retentionActual ?? 0}%</span>
                                            </div>
                                            <div className="bg-white p-1.5 rounded border border-slate-200/70">
                                              <span className="text-slate-400 block text-[9px] uppercase font-bold">Expansion Rev.</span>
                                              <span className="font-bold text-slate-800 font-mono">${Number(inp.expansionActual ?? 0).toLocaleString()} <span className="text-slate-400 font-normal text-[9px]">(Tgt: ${Number(inp.expansionTarget ?? 0).toLocaleString()})</span></span>
                                            </div>
                                            <div className="bg-white p-1.5 rounded border border-slate-200/70">
                                              <span className="text-slate-400 block text-[9px] uppercase font-bold">Account Health</span>
                                              <span className="font-bold text-slate-800 font-mono">{inp.healthActual ?? 0}%</span>
                                            </div>
                                            <div className="bg-white p-1.5 rounded border border-slate-200/70">
                                              <span className="text-slate-400 block text-[9px] uppercase font-bold">Product Adoption</span>
                                              <span className="font-bold text-slate-800 font-mono">{inp.adoptionActual ?? 0}%</span>
                                            </div>
                                          </>
                                        )}

                                        {roleTypeKey === "Operations" && (
                                          <>
                                            <div className="bg-white p-1.5 rounded border border-slate-200/70">
                                              <span className="text-slate-400 block text-[9px] uppercase font-bold">Fulfillment Rate</span>
                                              <span className="font-bold text-slate-800 font-mono">{inp.fulfillmentRate ?? 0}%</span>
                                            </div>
                                            <div className="bg-white p-1.5 rounded border border-slate-200/70">
                                              <span className="text-slate-400 block text-[9px] uppercase font-bold">Process Accuracy</span>
                                              <span className="font-bold text-slate-800 font-mono">{inp.accuracyRate ?? 0}%</span>
                                            </div>
                                            <div className="bg-white p-1.5 rounded border border-slate-200/70">
                                              <span className="text-slate-400 block text-[9px] uppercase font-bold">Cost Savings</span>
                                              <span className="font-bold text-slate-800 font-mono">${Number(inp.actualSavings ?? 0).toLocaleString()} <span className="text-slate-400 font-normal text-[9px]">(Tgt: ${Number(inp.targetSavings ?? 0).toLocaleString()})</span></span>
                                            </div>
                                            <div className="bg-white p-1.5 rounded border border-slate-200/70">
                                              <span className="text-slate-400 block text-[9px] uppercase font-bold">SLA Variance</span>
                                              <span className="font-bold text-slate-800 font-mono">{inp.actualVariance ?? 0}% <span className="text-slate-400 font-normal text-[9px]">(Tgt: {inp.targetVariance ?? 0}%)</span></span>
                                            </div>
                                            <div className="bg-white p-1.5 rounded border border-slate-200/70">
                                              <span className="text-slate-400 block text-[9px] uppercase font-bold">Compliance Deductions</span>
                                              <span className="font-bold text-slate-800 font-mono">{inp.complianceDeductions ?? 0} pts</span>
                                            </div>
                                          </>
                                        )}

                                        {roleTypeKey === "Manager" && (
                                          <>
                                            <div className="bg-white p-1.5 rounded border border-slate-200/70">
                                              <span className="text-slate-400 block text-[9px] uppercase font-bold">Team Target Result</span>
                                              <span className="font-bold text-slate-800 font-mono">{inp.actualTeamResult ?? 0}% <span className="text-slate-400 font-normal text-[9px]">(Tgt: {inp.teamTarget ?? 0}%)</span></span>
                                            </div>
                                            <div className="bg-white p-1.5 rounded border border-slate-200/70">
                                              <span className="text-slate-400 block text-[9px] uppercase font-bold">Work Quality</span>
                                              <span className="font-bold text-slate-800 font-mono">{inp.qualityPercent ?? 0}%</span>
                                            </div>
                                            <div className="bg-white p-1.5 rounded border border-slate-200/70">
                                              <span className="text-slate-400 block text-[9px] uppercase font-bold">Policy Compliance</span>
                                              <span className="font-bold text-slate-800 font-mono">{inp.compliancePercent ?? 0}%</span>
                                            </div>
                                            <div className="bg-white p-1.5 rounded border border-slate-200/70">
                                              <span className="text-slate-400 block text-[9px] uppercase font-bold">Reporting Rating</span>
                                              <span className="font-bold text-slate-800 font-mono">{inp.reportingRating ?? 0} / 5</span>
                                            </div>
                                            <div className="bg-white p-1.5 rounded border border-slate-200/70">
                                              <span className="text-slate-400 block text-[9px] uppercase font-bold">People Mgmt</span>
                                              <span className="font-bold text-slate-800 font-mono">{inp.peopleManagementRating ?? 0} / 5</span>
                                            </div>
                                            <div className="bg-white p-1.5 rounded border border-slate-200/70">
                                              <span className="text-slate-400 block text-[9px] uppercase font-bold">Leadership Rating</span>
                                              <span className="font-bold text-slate-800 font-mono">{inp.leadershipRating ?? 0} / 5</span>
                                            </div>
                                          </>
                                        )}

                                        {/* Fallback if raw inputs exist and role is different */}
                                        {roleTypeKey !== "Tech Support" &&
                                         roleTypeKey !== "Marketing" &&
                                         roleTypeKey !== "Sales" &&
                                         roleTypeKey !== "Customer Success" &&
                                         roleTypeKey !== "Operations" &&
                                         roleTypeKey !== "Manager" && (
                                          Object.entries(inp).map(([k, v]) => (
                                            <div key={k} className="bg-white p-1.5 rounded border border-slate-200/70">
                                              <span className="text-slate-400 block text-[9px] uppercase font-bold truncate">
                                                {k.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                                              </span>
                                              <span className="font-bold text-slate-800 font-mono truncate">{String(v)}</span>
                                            </div>
                                          ))
                                        )}
                                      </div>
                                    </div>

                                    {/* Conduct Rating Values */}
                                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1.5">
                                      <div className="text-[10px] font-black uppercase tracking-wider text-amber-900 flex items-center justify-between font-sans">
                                        <span className="flex items-center gap-1">
                                          <i className="fas fa-user-shield text-amber-600"></i>
                                          <span>Conduct Ratings & Rule Assessments</span>
                                        </span>
                                        {companyWideConducts.length > 0 && (
                                          <span className="font-mono text-[10px] bg-amber-100 text-amber-950 px-2 py-0.5 rounded-md font-bold border border-amber-200/60">
                                            {(() => {
                                              const totalScored = companyWideConducts.reduce((acc, c) => {
                                                const rating = cPoints[c.id] !== undefined ? cPoints[c.id] : 5;
                                                return acc + (rating / 5) * c.points;
                                              }, 0);
                                              const totalMax = companyWideConducts.reduce((acc, c) => acc + c.points, 0);
                                              return `${totalScored.toFixed(1)} / ${totalMax} pts`;
                                            })()}
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex flex-wrap gap-1.5 text-[10px] font-sans">
                                        {companyWideConducts.length > 0 ? (
                                          companyWideConducts.map((c) => {
                                            const r = cPoints[c.id] !== undefined ? cPoints[c.id] : 5;
                                            return (
                                              <div key={c.id} className="bg-white px-2 py-1 rounded-md border border-amber-200/80 flex items-center gap-1.5 shadow-2xs">
                                                <span className="font-medium text-slate-700">{c.name}:</span>
                                                <span className="font-mono font-bold text-amber-900 bg-amber-100/80 px-1.5 py-0.2 rounded">
                                                  {r}/5 ⭐
                                                </span>
                                              </div>
                                            );
                                          })
                                        ) : Object.keys(cPoints).length > 0 ? (
                                          Object.entries(cPoints).map(([cKey, cVal]) => (
                                            <div key={cKey} className="bg-white px-2 py-1 rounded-md border border-amber-200/80 flex items-center gap-1.5 shadow-2xs">
                                              <span className="font-medium text-slate-700 truncate max-w-[120px]">{cKey}:</span>
                                              <span className="font-mono font-bold text-amber-900 bg-amber-100/80 px-1.5 py-0.2 rounded">
                                                {String(cVal)}
                                              </span>
                                            </div>
                                          ))
                                        ) : (
                                          <span className="text-slate-400 italic">No specific conduct rating scores logged.</span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Comments & Timestamp */}
                                    <div className="pt-0.5 flex flex-col gap-1 font-sans">
                                      
                                      <div className="text-[10px] text-slate-400 flex justify-between items-center px-1 font-mono">
                                        <span>Recorded on {rev.dateCreated || "N/A"}</span>
                                        <span>Role Type: {roleTypeKey}</span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                            </div>
                          )}
                        </div>

                        {/* Cumulative Totals Summary Box */}
                        {isAllWeeksCompleted && currentMonthWeeklyReviews.length > 0 && (
                          <div className="bg-slate-100/90 border border-slate-200/90 rounded-xl p-3.5 space-y-2">
                            <h4 className="text-[11px] font-black uppercase text-slate-900 tracking-wider flex items-center gap-1">
                              <i className="fas fa-calculator text-amber-600"></i> Cumulative Monthly Totals ({currentMonthWeeklyReviews.length} Weeks)
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                              {selectedRoleType === "Tech Support" && (
                                <>
                                  <div className="bg-white p-2 rounded border border-slate-200/70">
                                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Total SLA Tickets</div>
                                    <div className="font-bold text-slate-900 font-mono">
                                      {currentMonthWeeklyReviews.reduce((s, r) => s + (Number(r.inputs?.slaTickets) || 0), 0)} / {currentMonthWeeklyReviews.reduce((s, r) => s + (Number(r.inputs?.totalTickets) || 0), 0)}
                                    </div>
                                  </div>
                                  <div className="bg-white p-2 rounded border border-slate-200/70">
                                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Total Resolved</div>
                                    <div className="font-bold text-slate-900 font-mono">
                                      {currentMonthWeeklyReviews.reduce((s, r) => s + (Number(r.inputs?.resolvedTickets) || 0), 0)}
                                    </div>
                                  </div>
                                  <div className="bg-white p-2 rounded border border-slate-200/70">
                                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Avg CSAT</div>
                                    <div className="font-bold text-slate-900 font-mono">
                                      {(currentMonthWeeklyReviews.reduce((s, r) => s + (Number(r.inputs?.customerSatisfaction) || 0), 0) / (currentMonthWeeklyReviews.length || 1)).toFixed(1)} / 5
                                    </div>
                                  </div>
                                </>
                              )}

                              {selectedRoleType === "Sales" && (
                                <>
                                  <div className="bg-white p-2 rounded border border-slate-200/70">
                                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Total Revenue</div>
                                    <div className="font-bold text-slate-900 font-mono">
                                      ${currentMonthWeeklyReviews.reduce((s, r) => s + (Number(r.inputs?.revenueActual) || 0), 0).toLocaleString()}
                                    </div>
                                  </div>
                                  <div className="bg-white p-2 rounded border border-slate-200/70">
                                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Total Deals</div>
                                    <div className="font-bold text-slate-900 font-mono">
                                      {currentMonthWeeklyReviews.reduce((s, r) => s + (Number(r.inputs?.dealsActual) || 0), 0)}
                                    </div>
                                  </div>
                                  <div className="bg-white p-2 rounded border border-slate-200/70">
                                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Avg Conversion</div>
                                    <div className="font-bold text-slate-900 font-mono">
                                      {(currentMonthWeeklyReviews.reduce((s, r) => s + (Number(r.inputs?.conversionActual) || 0), 0) / (currentMonthWeeklyReviews.length || 1)).toFixed(1)}%
                                    </div>
                                  </div>
                                </>
                              )}

                              {selectedRoleType === "Marketing" && (
                                <>
                                  <div className="bg-white p-2 rounded border border-slate-200/70">
                                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Total Leads</div>
                                    <div className="font-bold text-slate-900 font-mono">
                                      {currentMonthWeeklyReviews.reduce((s, r) => s + (Number(r.inputs?.leadsGeneratedActual) || 0), 0)}
                                    </div>
                                  </div>
                                  <div className="bg-white p-2 rounded border border-slate-200/70">
                                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Avg Qualified Rate</div>
                                    <div className="font-bold text-slate-900 font-mono">
                                      {(currentMonthWeeklyReviews.reduce((s, r) => s + (Number(r.inputs?.qualifiedLeadRateActual) || 0), 0) / (currentMonthWeeklyReviews.length || 1)).toFixed(1)}%
                                    </div>
                                  </div>
                                  <div className="bg-white p-2 rounded border border-slate-200/70">
                                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Avg Conversion</div>
                                    <div className="font-bold text-slate-900 font-mono">
                                      {(currentMonthWeeklyReviews.reduce((s, r) => s + (Number(r.inputs?.campaignConversionActual) || 0), 0) / (currentMonthWeeklyReviews.length || 1)).toFixed(1)}%
                                    </div>
                                  </div>
                                </>
                              )}

                              {selectedRoleType === "Customer Success" && (
                                <>
                                  <div className="bg-white p-2 rounded border border-slate-200/70">
                                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Total Renewal</div>
                                    <div className="font-bold text-slate-900 font-mono">
                                      ${currentMonthWeeklyReviews.reduce((s, r) => s + (Number(r.inputs?.renewalActual) || 0), 0).toLocaleString()}
                                    </div>
                                  </div>
                                  <div className="bg-white p-2 rounded border border-slate-200/70">
                                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Avg Retention</div>
                                    <div className="font-bold text-slate-900 font-mono">
                                      {(currentMonthWeeklyReviews.reduce((s, r) => s + (Number(r.inputs?.retentionActual) || 0), 0) / (currentMonthWeeklyReviews.length || 1)).toFixed(1)}%
                                    </div>
                                  </div>
                                  <div className="bg-white p-2 rounded border border-slate-200/70">
                                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Avg Account Health</div>
                                    <div className="font-bold text-slate-900 font-mono">
                                      {(currentMonthWeeklyReviews.reduce((s, r) => s + (Number(r.inputs?.healthActual) || 0), 0) / (currentMonthWeeklyReviews.length || 1)).toFixed(1)}%
                                    </div>
                                  </div>
                                </>
                              )}

                              {selectedRoleType === "Operations" && (
                                <>
                                  <div className="bg-white p-2 rounded border border-slate-200/70">
                                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Avg Fulfillment Rate</div>
                                    <div className="font-bold text-slate-900 font-mono">
                                      {(currentMonthWeeklyReviews.reduce((s, r) => s + (Number(r.inputs?.fulfillmentRate) || 0), 0) / (currentMonthWeeklyReviews.length || 1)).toFixed(1)}%
                                    </div>
                                  </div>
                                  <div className="bg-white p-2 rounded border border-slate-200/70">
                                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Avg Accuracy Rate</div>
                                    <div className="font-bold text-slate-900 font-mono">
                                      {(currentMonthWeeklyReviews.reduce((s, r) => s + (Number(r.inputs?.accuracyRate) || 0), 0) / (currentMonthWeeklyReviews.length || 1)).toFixed(1)}%
                                    </div>
                                  </div>
                                  <div className="bg-white p-2 rounded border border-slate-200/70">
                                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Total Cost Savings</div>
                                    <div className="font-bold text-slate-900 font-mono">
                                      ${currentMonthWeeklyReviews.reduce((s, r) => s + (Number(r.inputs?.actualSavings) || 0), 0).toLocaleString()}
                                    </div>
                                  </div>
                                </>
                              )}

                              {selectedRoleType === "Manager" && (
                                <>
                                  <div className="bg-white p-2 rounded border border-slate-200/70">
                                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Avg Team Result</div>
                                    <div className="font-bold text-slate-900 font-mono">
                                      {(currentMonthWeeklyReviews.reduce((s, r) => s + (Number(r.inputs?.actualTeamResult) || 0), 0) / (currentMonthWeeklyReviews.length || 1)).toFixed(1)}%
                                    </div>
                                  </div>
                                  <div className="bg-white p-2 rounded border border-slate-200/70">
                                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Avg Quality</div>
                                    <div className="font-bold text-slate-900 font-mono">
                                      {(currentMonthWeeklyReviews.reduce((s, r) => s + (Number(r.inputs?.qualityPercent) || 0), 0) / (currentMonthWeeklyReviews.length || 1)).toFixed(1)}%
                                    </div>
                                  </div>
                                  <div className="bg-white p-2 rounded border border-slate-200/70">
                                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Avg Compliance</div>
                                    <div className="font-bold text-slate-900 font-mono">
                                      {(currentMonthWeeklyReviews.reduce((s, r) => s + (Number(r.inputs?.compliancePercent) || 0), 0) / (currentMonthWeeklyReviews.length || 1)).toFixed(1)}%
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Compute Monthly Performance Button */}
                        <div className="pt-2 flex justify-start">
                          <button
                            type="button"
                            onClick={handleComputeMonthlyClick}
                            disabled={!isAllWeeksCompleted || isMonthLocked}
                            className={`w-fit py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm ${
                              isMonthLocked
                                ? "bg-slate-200 text-slate-500 border border-slate-300 cursor-not-allowed"
                                : isAllWeeksCompleted
                                ? "bg-[#02275A] hover:bg-[#0b3b82] text-white cursor-pointer active:scale-98"
                                : "bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed"
                            }`}
                          >
                            <i className="fas fa-calculator text-sm"></i>
                            <span>
                              {isMonthLocked
                                ? `Monthly Result Computed & Locked (${existingMonthlyForMonth.performanceScore}%)`
                                : isAllWeeksCompleted
                                ? "Compute Scores"
                                : `Complete All ${requiredWeeksForMonth} Required Weeks (${uniqueWeeksRecorded}/${requiredWeeksForMonth}) to Compute Monthly`}
                            </span>
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Note: Past Monthly Reviews are managed and accessed via the dedicated Performance History tab */}
                  </div>
                  )}

                  {/* TAB 2: ROLE KPIS FORMULAS & EVALUATION */}
                  {engineTab === "kpis" && (
                    <div className="space-y-4 animate-fade-in">
                  {/* IF SELECTED ROLE TYPE IS ENGINEERING, RENDER THE STANDARD UI */}
                  {selectedRoleType === "Engineering" && (
                    <>
                      {/* Type (Performance vs Reward vs Company Conduct) */}
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 font-sans">
                          Type *
                        </label>
                        <select
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-900/10 bg-white font-sans"
                          value={updatePointsFormType}
                          onChange={(e) => {
                            const newType = e.target.value;
                            setUpdatePointsFormType(newType);
                            if (newType === "company conduct") {
                              setConductActualPoints({});
                              setUpdatePointsFormVal("0");
                              const defaultReason = `Company Conduct Evaluation: ${companyWideConducts.map((item) => `${item.name}: ${item.points}/${item.points}`).join(", ")}. Net adjustment: 0 pts.`;
                              setUpdatePointsFormReason(defaultReason);
                            } else {
                              setUpdatePointsFormVal("");
                              setUpdatePointsFormReason("");
                            }
                          }}
                        >
                          {isEngineer ? (
                            <>
                              <option value="company conduct">
                                company conduct
                              </option>
                              <option value="reward">reward</option>
                              <option value="role deduction">
                                role deduction
                              </option>
                            </>
                          ) : (
                            <>
                              <option value="performance">
                                Policy Violation
                              </option>
                              <option value="reward">Reward</option>
                            </>
                          )}
                        </select>
                      </div>

                      {/* Company conducts display section */}
                      {updatePointsFormType === "company conduct" && (
                        <div
                          className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 font-sans animate-fade-in"
                          id="company-conduct-display-section"
                        >
                          <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                            <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                              <i className="fas fa-gavel text-slate-700"></i>{" "}
                              Active Company Conduct
                            </h3>
                            <div className="text-xs font-bold text-slate-600">
                              Total Weight:{" "}
                              <span
                                className={`font-mono font-black ${conductsTotalPoints > 20 ? "text-rose-600" : "text-slate-900"}`}
                              >
                                {conductsTotalPoints}
                              </span>{" "}
                              / 20 pts
                            </div>
                          </div>
                          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                            {companyWideConducts.length === 0 ? (
                              <div className="p-4 border border-slate-200 border-dashed rounded-xl text-center text-xs font-bold text-slate-500 bg-slate-50/50">
                                <i className="fas fa-info-circle text-slate-500 mr-1.5"></i> No conduct standards are mapped to this employee's department ({selectedEmp?.department || "N/A"}) or employee type ({selectedEmp?.employeeType || "Full-Time"}).
                              </div>
                            ) : (
                              companyWideConducts.map((c) => {
                                const actualVal =
                                  conductActualPoints[c.id] !== undefined
                                    ? conductActualPoints[c.id]
                                    : (isEngineer || selectedRoleType === "Engineering" ? c.points : 5);
                                return (
                                  <div
                                    key={c.id}
                                    className="p-3 rounded-xl border bg-white border-slate-100 flex items-center justify-between gap-4 shadow-sm"
                                  >
                                    <div className="space-y-0.5 whitespace-normal">
                                      <div className="text-xs font-extrabold text-slate-900">
                                        {c.name}
                                      </div>
                                      <div className="text-[10px] text-slate-500 font-medium">
                                        Target:{" "}
                                        <span className="font-extrabold text-slate-800">
                                          {c.points} pts
                                        </span>
                                      </div>
                                      {c.description && (
                                        <p className="text-[10px] text-slate-400 leading-normal">
                                          {c.description}
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                      {isEngineer || selectedRoleType === "Engineering" ? (
                                        <>
                                          <span className="text-[10px] text-slate-500 font-bold whitespace-nowrap">
                                            Deduction:
                                          </span>
                                          <div className="relative flex items-center gap-1.5">
                                            <input
                                              type="number"
                                              min="0"
                                              max={c.points}
                                              value={Math.max(0, c.points - actualVal)}
                                              onChange={(e) => {
                                                const deduct = Math.min(c.points, Math.max(0, Number(e.target.value) || 0));
                                                const val = c.points - deduct;
                                                updateConductPoint(c.id, val);
                                              }}
                                              className="w-16 px-2 py-1 text-center border border-slate-200 rounded-lg text-xs font-mono font-bold text-rose-600 focus:outline-none focus:border-rose-500 bg-white shadow-sm"
                                              placeholder="0"
                                            />
                                            <span className="text-[10px] font-bold text-slate-400">/ {c.points} pts</span>
                                          </div>
                                        </>
                                      ) : (
                                        <>
                                          <span className="text-[10px] text-slate-500 font-bold whitespace-nowrap">
                                            Rating:
                                          </span>
                                          <select
                                            value={String(actualVal)}
                                            onChange={(e) => {
                                              const val = Number(e.target.value);
                                              updateConductPoint(c.id, val);
                                            }}
                                            className="px-2.5 py-1 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-800 bg-white focus:outline-none focus:border-slate-800 cursor-pointer"
                                          >
                                            <option value="5">5 - Outstanding</option>
                                            <option value="4">4 - Commendable</option>
                                            <option value="3">3 - Satisfactory</option>
                                            <option value="2">2 - Needs Imp.</option>
                                            <option value="1">1 - Poor</option>
                                          </select>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                          <div className="bg-slate-100 rounded-xl p-3 flex flex-col gap-1 text-[11px] font-semibold text-slate-800">
                            <div className="flex justify-between items-center text-slate-800">
                              <span>Total Target Value:</span>
                              <span className="font-bold">
                                {conductsTotalPoints} pts
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-slate-800">
                              <span>Total Actual Value Entered:</span>
                              <span className="font-black">
                                {companyWideConducts.reduce((sum, item) => {
                                  const val =
                                    conductActualPoints[item.id] !== undefined
                                      ? conductActualPoints[item.id]
                                      : item.points;
                                  return sum + val;
                                }, 0)}{" "}
                                pts
                              </span>
                            </div>
                            <div className="border-t border-slate-200 my-1"></div>
                            <div className="flex justify-between items-center text-slate-900 text-xs font-bold">
                              <span>Net Score Adjustment:</span>
                              <span
                                className={`font-mono font-black ${parseInt(updatePointsFormVal) < 0 ? "text-rose-600" : parseInt(updatePointsFormVal) === 0 ? "text-slate-600" : "text-emerald-700"}`}
                              >
                                {parseInt(updatePointsFormVal) > 0 ? "+" : ""}
                                {updatePointsFormVal} pts
                              </span>
                            </div>
                          </div>
                          {conductsTotalPoints > 20 && (
                            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2 text-[10px] font-semibold text-rose-700">
                              <i className="fas fa-exclamation-circle mt-0.5 shrink-0 text-xs"></i>
                              <span>
                                Attention: Your total defined conduct points
                                score is {conductsTotalPoints} points. This
                                exceeds the maximum weight limit of 20 points!
                                Please adjust conduct weights in Performance
                                Settings.
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Choose Predefined Policy/Reason */}
                      {updatePointsFormType !== "company conduct" && (
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">
                            Select Issue/Reward (Optional)
                          </label>
                          <select
                            value={selectedDefinedPolicy}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSelectedDefinedPolicy(val);
                              if (val !== "custom") {
                                const allPolicies = [
                                  // Rewards
                                  { name: "Documentation Hero", points: 5 },
                                  { name: "Early Delivery", points: 5 },
                                  { name: "Proactive Warning", points: 5 },
                                  { name: "Product addition", points: 10 },
                                  { name: "Urgent Review SLA Met", points: 5 },
                                  { name: "Zero-Bug Release", points: 10 },

                                  // Company Conduct / Performance
                                  { name: "Repeated Lateness", points: -5 },
                                  {
                                    name: "Attendance Violations",
                                    points: -10,
                                  },
                                  { name: "Disciplinary Actions", points: -15 },
                                  { name: "Customer Complaints", points: -5 },
                                  {
                                    name: "Performance Misconduct",
                                    points: -20,
                                  },

                                  // Role Deduction (Engineering)
                                  {
                                    name: "Critical production bug",
                                    points: -15,
                                  },
                                  { name: "Major production bug", points: -10 },
                                  {
                                    name: "Minor bug from negligence",
                                    points: -3,
                                  },
                                  {
                                    name: "Missed sprint commitment without reason",
                                    points: -5,
                                  },
                                  {
                                    name: "Failed deployment process",
                                    points: -10,
                                  },
                                  { name: "Poor documentation", points: -3 },
                                  {
                                    name: "Security issue caused by negligence",
                                    points: -20,
                                  },
                                ];

                                const found = allPolicies.find(
                                  (p) => p.name === val,
                                );
                                if (found) {
                                  setUpdatePointsFormVal(String(found.points));
                                  setUpdatePointsFormReason(found.name);
                                }
                              }
                            }}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-slate-800 bg-white font-sans"
                          >
                            <option value="custom">
                              -- Custom Point Update --
                            </option>

                            {updatePointsFormType === "reward" && (
                              <>
                                <option
                                  value="conduct-header"
                                  disabled
                                  className="font-bold text-slate-400 bg-slate-100"
                                >
                                  --- Rewards ---
                                </option>
                                <option value="Documentation Hero">
                                  🌟 Documentation Hero (+5 pts)
                                </option>
                                <option value="Early Delivery">
                                  🌟 Early Delivery (+5 pts)
                                </option>
                                <option value="Proactive Warning">
                                  🌟 Proactive Warning (+5 pts)
                                </option>
                                <option value="Product addition">
                                  🌟 Product addition (+10 pts)
                                </option>
                                <option value="Urgent Review SLA Met">
                                  🌟 Urgent Review SLA Met (+5 pts)
                                </option>
                                <option value="Zero-Bug Release">
                                  🌟 Zero-Bug Release (+10 pts)
                                </option>
                              </>
                            )}

                            {(updatePointsFormType === "performance" ||
                              updatePointsFormType === "company conduct") && (
                              <>
                                <option
                                  value="conduct-header"
                                  disabled
                                  className="font-bold text-slate-400 bg-slate-100"
                                >
                                  --- Company Conduct ---
                                </option>
                                <option value="Repeated Lateness">
                                  ⚙️ Repeated Lateness (-5 pts)
                                </option>
                                <option value="Attendance Violations">
                                  ⚙️ Attendance Violations (-10 pts)
                                </option>
                                <option value="Disciplinary Actions">
                                  ⚙️ Disciplinary Actions (-15 pts)
                                </option>
                                <option value="Customer Complaints">
                                  ⚙️ Customer Complaints (-5 pts)
                                </option>
                                <option value="Performance Misconduct">
                                  ⚙️ Performance Misconduct (-20 pts)
                                </option>
                              </>
                            )}

                            {updatePointsFormType === "role deduction" && (
                              <>
                                <option
                                  value="role-deduct-header"
                                  disabled
                                  className="font-bold text-slate-400 bg-slate-100"
                                >
                                  --- Engineering Violations ---
                                </option>
                                <option value="Critical production bug">
                                  ⚙️ Critical production bug (-15 pts)
                                </option>
                                <option value="Major production bug">
                                  ⚙️ Major production bug (-10 pts)
                                </option>
                                <option value="Minor bug from negligence">
                                  ⚙️ Minor bug from negligence (-3 pts)
                                </option>
                                <option value="Missed sprint commitment without reason">
                                  ⚙️ Missed sprint commitment without reason (-5
                                  pts)
                                </option>
                                <option value="Failed deployment process">
                                  ⚙️ Failed deployment process (-10 pts)
                                </option>
                                <option value="Poor documentation">
                                  ⚙️ Poor documentation (-3 pts)
                                </option>
                                <option value="Security issue caused by negligence">
                                  ⚙️ Security issue caused by negligence (-20
                                  pts)
                                </option>
                              </>
                            )}
                          </select>
                        </div>
                      )}

                      {/* Points Input */}
                      {updatePointsFormType !== "company conduct" && (
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">
                            Points *
                          </label>
                          <input
                            required
                            type="number"
                            placeholder="e.g. -5"
                            value={updatePointsFormVal}
                            onChange={(e) =>
                              setUpdatePointsFormVal(e.target.value)
                            }
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800 text-sm font-mono"
                          />
                        </div>
                      )}

                      {/* Reason Input */}
                      {updatePointsFormType !== "company conduct" && (
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">
                            Reason *
                          </label>
                          <textarea
                            required
                            rows={3}
                            placeholder="Explain why you're applying these points..."
                            value={updatePointsFormReason}
                            onChange={(e) =>
                              setUpdatePointsFormReason(e.target.value)
                            }
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800 text-sm font-sans"
                          />
                        </div>
                      )}

                      {/* Evidence Screenshot */}
                      {updatePointsFormType !== "company conduct" && (
                        <div>
                          <label className="block text-sm font-bold text-slate-705 mb-1">
                            Evidence Screenshot (optional)
                          </label>
                          <div className="border border-dashed border-slate-200 rounded-lg p-4 bg-slate-50 text-center relative hover:bg-slate-100/50 transition-colors cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  if (file.size > 5 * 1024 * 1024) {
                                    alert("File size exceeds 5MB.");
                                    return;
                                  }
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    setUpdatePointsFormScreenshot(
                                      reader.result as string,
                                    );
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            />
                            {updatePointsFormScreenshot ? (
                              <div className="flex flex-col items-center justify-center gap-2">
                                <img
                                  src={updatePointsFormScreenshot}
                                  alt="Evidence"
                                  className="max-h-24 rounded-lg object-contain shadow-sm"
                                />
                                <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                                  <i className="fas fa-check-circle"></i>{" "}
                                  Screenshot Attached (Click to change)
                                </span>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <p className="text-sm font-bold text-slate-600">
                                  Attach Screenshot
                                </p>
                                <p className="text-xs text-slate-400">
                                  Max 5MB. JPEG, PNG, GIF, or WebP.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* IF SELECTED ROLE TYPE IS TECH SUPPORT, RENDER THE FORMULA-KPI UI */}
                  {selectedRoleType === "Tech Support" && (
                    <div className="space-y-4 animate-fade-in text-left">

                      {isWeightSumInvalid && (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 leading-relaxed flex items-start gap-2.5 font-semibold animate-pulse">
                          <i className="fas fa-exclamation-triangle text-sm shrink-0"></i>
                          <span>
                            Attention: The sum of the allocated Role Weights is
                            currently {sumOfSupportWeights} pts. It must not
                            exceed the limit of 80! Please reduce metric
                            weights.
                          </span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Column 1: Math Inputs */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                          <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider border-b pb-1">
                            1. Enter Actual Values
                          </h3>

                          {/* SLA Score */}
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                            <span className="text-xs font-bold text-slate-800">
                              A. SLA Tickets (SLA Score)
                            </span>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] text-slate-500 font-bold mb-0.5">
                                  SLA Tickets
                                </label>
                                <input
                                  type="number"
                                  step="any"
                                  min="0"
                                  value={slaTickets}
                                  onChange={(e) =>
                                    setSlaTickets(
                                      parseFloat(e.target.value) || 0,
                                    )
                                  }
                                  className="w-full px-2 py-1 text-center border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-900/10"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] text-slate-500 font-bold mb-0.5">
                                  Total Tickets
                                </label>
                                <input
                                  type="number"
                                  step="any"
                                  min="1"
                                  value={totalTickets}
                                  onChange={(e) =>
                                    setTotalTickets(
                                      parseFloat(e.target.value) || 1,
                                    )
                                  }
                                  className="w-full px-2 py-1 text-center border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-900/10"
                                />
                              </div>
                            </div>
                          </div>

                          {/* First Response Score */}
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                            <span className="text-xs font-bold text-slate-800">
                              B. First Response Time (mins)
                            </span>
                            <div className="grid grid-cols-1 gap-2">
                              <div>
                                <label className="block text-[10px] text-slate-500 font-bold mb-0.5">
                                  Actual Time
                                </label>
                                <input
                                  type="number"
                                  step="any"
                                  min="1"
                                  value={actualResponseTime}
                                  onChange={(e) =>
                                    setActualResponseTime(
                                      parseFloat(e.target.value) || 1,
                                    )
                                  }
                                  className="w-full px-2 py-1 text-center border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-900/10"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Resolution Score */}
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                            <span className="text-xs font-bold text-slate-800">
                              C. Ticket Resolution Rate
                            </span>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] text-slate-500 font-bold mb-0.5">
                                  Resolved Tkts
                                </label>
                                <input
                                  type="number"
                                  step="any"
                                  min="0"
                                  value={resolvedTickets}
                                  onChange={(e) =>
                                    setResolvedTickets(
                                      parseFloat(e.target.value) || 0,
                                    )
                                  }
                                  className="w-full px-2 py-1 text-center border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-900/10"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] text-slate-500 font-bold mb-0.5">
                                  Assigned Tkts
                                </label>
                                <input
                                  type="number"
                                  step="any"
                                  min="1"
                                  value={assignedTickets}
                                  onChange={(e) =>
                                    setAssignedTickets(
                                      parseFloat(e.target.value) || 1,
                                    )
                                  }
                                  className="w-full px-2 py-1 text-center border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-900/10"
                                />
                              </div>
                            </div>
                          </div>

                          {/* CSAT Score */}
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                            <span className="text-xs font-bold text-slate-800">
                              D. Customer Satisfaction % (CSAT)
                            </span>
                            <div className="grid grid-cols-1 gap-2">
                              <div>
                                <label className="block text-[10px] text-slate-500 font-bold mb-0.5">
                                  Actual Satisfaction %
                                </label>
                                <input
                                  type="number"
                                  step="any"
                                  min="0"
                                  max="100"
                                  value={customerSatisfaction}
                                  onChange={(e) =>
                                    setCustomerSatisfaction(
                                      Math.min(
                                        100,
                                        Math.max(
                                          0,
                                          parseFloat(e.target.value) || 0,
                                        ),
                                      ),
                                    )
                                  }
                                  className="w-full px-2 py-1 text-center border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-900/10"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Reopen Score */}
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                            <span className="text-xs font-bold text-slate-800">
                              E. Ticket Reopen Rate %
                            </span>
                            <div className="grid grid-cols-1 gap-2">
                              <div>
                                <label className="block text-[10px] text-slate-500 font-bold mb-0.5">
                                  Actual Reopen %
                                </label>
                                <input
                                  type="number"
                                  step="any"
                                  min="0.1"
                                  value={actualReopenRate}
                                  onChange={(e) =>
                                    setActualReopenRate(
                                      parseFloat(e.target.value) || 0.1,
                                    )
                                  }
                                  className="w-full px-2 py-1 text-center border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-900/10"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Column 2: Computations & Conduct Score */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                          <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider border-b pb-1">
                            2. Conduct Rating (Max 20 pts)
                          </h3>

                          {/* Active Company Conducts */}
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
                            <p className="text-[10px] text-slate-500 font-medium">
                              Evaluate the employee on active conducts (Total
                              sum is capped at 20):
                            </p>
                            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                              {companyWideConducts.map((c) => {
                                const actualVal =
                                  conductActualPoints[c.id] !== undefined
                                    ? conductActualPoints[c.id]
                                    : 5;
                                return (
                                  <div
                                    key={c.id}
                                    className="p-2 border border-slate-200 bg-white rounded-lg flex items-center justify-between text-xs font-sans shadow-sm"
                                  >
                                    <div className="min-w-0 pr-2">
                                      <div className="font-bold text-slate-800 truncate">
                                        {c.name}
                                      </div>
                                      <div className="text-[9px] text-slate-400">
                                        Target Weight: {c.points} pts
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <span className="text-[9px] font-bold text-slate-500">
                                        Rating:
                                      </span>
                                      <select
                                        value={actualVal}
                                        onChange={(e) => {
                                          const val = Number(e.target.value);
                                          updateConductPoint(c.id, val);
                                        }}
                                        className="px-2 py-1 border border-slate-200 rounded text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-slate-800"
                                      >
                                        <option value="5">5 - Outstanding</option>
                                        <option value="4">4 - Commendable</option>
                                        <option value="3">3 - Satisfactory</option>
                                        <option value="2">2 - Needs Imp.</option>
                                        <option value="1">1 - Unsatisfactory</option>
                                      </select>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="flex justify-between items-center text-xs font-bold text-slate-705 bg-white border border-slate-100 p-2 rounded-lg">
                              <span>Calculated Conduct Score:</span>
                              <span className="font-mono font-black text-emerald-700">
                                {reviewType === "weekly"
                                  ? "-- / 20.0 pts"
                                  : `${supportConductScore.toFixed(1)} / 20.0 pts`}
                              </span>
                            </div>
                          </div>

                          {/* Real-time Formulas Evaluation Dashboard */}
                          <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider border-b pb-1 pt-1">
                            3. Live Score Preview
                          </h3>

                          <div className="bg-white text-slate-800 p-4 rounded-xl border border-slate-200 font-sans space-y-2.5 shadow-xs">
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pb-1 border-b border-slate-200 flex justify-between">
                              <span>Formula Metrics Breakdown</span>
                              <span>{reviewType === "weekly" ? "Points" : "Calculated Points"}</span>
                            </div>

                            <div className="flex justify-between text-xs font-mono">
                              <span className="text-slate-700">
                                {reviewType === "weekly"
                                  ? "SLA:"
                                  : `SLA: (${slaTickets}/${totalTickets}) \u00D7 ${slaWeight}`}
                              </span>
                              <span className="text-emerald-600 font-bold">
                                {reviewType === "weekly"
                                  ? "--"
                                  : `${computedSla.toFixed(1)} pts`}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs font-mono">
                              <span className="text-slate-700">
                                {reviewType === "weekly"
                                  ? "Response Time:"
                                  : `Response Time: (${targetResponseTime}/${actualResponseTime}) \u00D7 ${firstResponseWeight}`}
                              </span>
                              <span className="text-emerald-600 font-bold">
                                {reviewType === "weekly"
                                  ? "--"
                                  : `${computedResp.toFixed(1)} pts`}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs font-mono">
                              <span className="text-slate-700">
                                {reviewType === "weekly"
                                  ? "Resolution Ratio:"
                                  : `Resolution Ratio: (${resolvedTickets}/${assignedTickets}) \u00D7 ${resolutionWeight}`}
                              </span>
                              <span className="text-emerald-600 font-bold">
                                {reviewType === "weekly"
                                  ? "--"
                                  : `${computedRes.toFixed(1)} pts`}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs font-mono">
                              <span className="text-slate-700">
                                {reviewType === "weekly"
                                  ? "CSAT Satisfaction:"
                                  : `CSAT Satisfaction: (${customerSatisfaction}%) \u00D7 ${csatWeight}`}
                              </span>
                              <span className="text-emerald-600 font-bold">
                                {reviewType === "weekly"
                                  ? "--"
                                  : `${computedCsat.toFixed(1)} pts`}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs font-mono">
                              <span className="text-slate-700">
                                {reviewType === "weekly"
                                  ? "Reopen Rate:"
                                  : `Reopen Rate: (${targetReopenRate}/${actualReopenRate}) \u00D7 ${reopenWeight}`}
                              </span>
                              <span className="text-emerald-600 font-bold">
                                {reviewType === "weekly"
                                  ? "--"
                                  : `${computedReopen.toFixed(1)} pts`}
                              </span>
                            </div>

                            <div className="border-t border-slate-200 my-1"></div>

                            <div className="flex justify-between text-xs pt-1 text-slate-700">
                              <span>Calculated Role Score (Max 80):</span>
                              <span className="font-mono font-bold text-[#02275A]">
                                {reviewType === "weekly"
                                  ? "-- / 80.0 pts"
                                  : `${supportRoleScore.toFixed(1)} / 80.0 pts`}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs text-slate-700">
                              <span>Calculated Conduct Score (Max 20):</span>
                              <span className="font-mono font-bold text-[#02275A]">
                                {reviewType === "weekly"
                                  ? "-- / 20.0 pts"
                                  : `${supportConductScore.toFixed(1)} / 20.0 pts`}
                              </span>
                            </div>

                            <div className="border-t border-slate-200 my-1"></div>

                            <div className="flex justify-between items-center text-sm font-bold bg-[#02275A]/5 border border-[#02275A]/15 p-2.5 rounded-lg text-slate-900">
                              <span>Overall Performance Score:</span>
                              <span className="font-mono text-base font-black text-[#02275A]">
                                {reviewType === "weekly"
                                  ? "Pending"
                                  : `${computedTechSupportOverallScore}%`}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* IF SELECTED ROLE TYPE IS MARKETING, RENDER THE FORMULA-KPI UI */}
                  {selectedRoleType === "Marketing" && (
                    <div className="space-y-4 animate-fade-in text-left">

                      {isMarketingWeightSumInvalid && (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 leading-relaxed flex items-start gap-2.5 font-semibold animate-pulse">
                          <i className="fas fa-exclamation-triangle text-sm shrink-0"></i>
                          <span>
                            Attention: The sum of the allocated Role Weights is
                            currently {sumOfMarketingWeights} pts. It must not
                            exceed the limit of 80! Please reduce metric
                            weights.
                          </span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Column 1: Math Inputs */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                          <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider border-b pb-1">
                            1. Enter Actual Values
                          </h3>

                          {/* Leads Generated */}
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                            <span className="text-xs font-bold text-slate-800">
                              A. Leads Generated (Achievement)
                            </span>
                            <div className="grid grid-cols-1 gap-2">
                              <div>
                                <label className="block text-[10px] text-slate-500 font-bold mb-0.5">
                                  Actual Leads
                                </label>
                                <input
                                  type="number"
                                  step="any"
                                  min="0"
                                  value={leadsGeneratedActual}
                                  onChange={(e) =>
                                    setLeadsGeneratedActual(
                                      parseFloat(e.target.value) || 0,
                                    )
                                  }
                                  className="w-full px-2 py-1 text-center border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-900/10"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Cost Per Lead */}
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                            <span className="text-xs font-bold text-slate-800">
                              B. Cost Per Lead (Reverse Achievement)
                            </span>
                            <div className="grid grid-cols-1 gap-2">
                              <div>
                                <label className="block text-[10px] text-slate-500 font-bold mb-0.5">
                                  Actual Cost (₦)
                                </label>
                                <input
                                  type="number"
                                  step="any"
                                  min="1"
                                  value={costPerLeadActual}
                                  onChange={(e) =>
                                    setCostPerLeadActual(
                                      parseFloat(e.target.value) || 1,
                                    )
                                  }
                                  className="w-full px-2 py-1 text-center border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-900/10"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Qualified Lead Rate */}
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                            <span className="text-xs font-bold text-slate-800">
                              C. Qualified Lead Rate % (Ratio)
                            </span>
                            <div className="grid grid-cols-1 gap-2">
                              <div>
                                <label className="block text-[10px] text-slate-500 font-bold mb-0.5">
                                  Actual %
                                </label>
                                <input
                                  type="number"
                                  step="any"
                                  min="0"
                                  value={qualifiedLeadRateActual}
                                  onChange={(e) =>
                                    setQualifiedLeadRateActual(
                                      parseFloat(e.target.value) || 0,
                                    )
                                  }
                                  className="w-full px-2 py-1 text-center border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-900/10"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Campaign Conversion Rate */}
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                            <span className="text-xs font-bold text-slate-800">
                              D. Campaign Conversion Rate % (Ratio)
                            </span>
                            <div className="grid grid-cols-1 gap-2">
                              <div>
                                <label className="block text-[10px] text-slate-500 font-bold mb-0.5">
                                  Actual Cons.
                                </label>
                                <input
                                  type="number"
                                  step="any"
                                  min="0"
                                  value={campaignConversionActual}
                                  onChange={(e) =>
                                    setCampaignConversionActual(
                                      parseFloat(e.target.value) || 0,
                                    )
                                  }
                                  className="w-full px-2 py-1 text-center border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-900/10"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Column 2: Computations & Conduct Score */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                          <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider border-b pb-1">
                            2. Conduct Rating (Max 20 pts)
                          </h3>

                          {/* Active Company Conducts */}
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
                            <p className="text-[10px] text-slate-500 font-medium">
                              Evaluate the employee on active conducts (Total
                              sum is capped at 20):
                            </p>
                            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                              {companyWideConducts.map((c) => {
                                const actualVal =
                                  conductActualPoints[c.id] !== undefined
                                    ? conductActualPoints[c.id]
                                    : 5;
                                return (
                                  <div
                                    key={c.id}
                                    className="p-2 border border-slate-200 bg-white rounded-lg flex items-center justify-between text-xs font-sans shadow-sm"
                                  >
                                    <div className="min-w-0 pr-2">
                                      <div className="font-bold text-slate-800 truncate">
                                        {c.name}
                                      </div>
                                      <div className="text-[9px] text-slate-400">
                                        Target Weight: {c.points} pts
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <span className="text-[9px] font-bold text-slate-500">
                                        Rating:
                                      </span>
                                      <select
                                        value={actualVal}
                                        onChange={(e) => {
                                          const val = Number(e.target.value);
                                          updateConductPoint(c.id, val);
                                        }}
                                        className="px-2 py-1 border border-slate-200 rounded text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-slate-800"
                                      >
                                        <option value="5">5 - Outstanding</option>
                                        <option value="4">4 - Commendable</option>
                                        <option value="3">3 - Satisfactory</option>
                                        <option value="2">2 - Needs Imp.</option>
                                        <option value="1">1 - Unsatisfactory</option>
                                      </select>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="flex justify-between items-center text-xs font-bold text-slate-705 bg-white border border-slate-100 p-2 rounded-lg">
                              <span>Calculated Conduct Score:</span>
                              <span className="font-mono font-black text-emerald-700">
                                {reviewType === "weekly"
                                  ? "-- / 20.0 pts"
                                  : `${marketingConductScore.toFixed(1)} / 20.0 pts`}
                              </span>
                            </div>
                          </div>

                          {/* Real-time Formulas Evaluation Dashboard */}
                          <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider border-b pb-1 pt-1">
                            3. Live Score Preview
                          </h3>

                          <div className="bg-white text-slate-800 p-4 rounded-xl border border-slate-200 font-sans space-y-2.5 shadow-xs">
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pb-1 border-b border-slate-200 flex justify-between">
                              <span>Formula Metrics Breakdown</span>
                              <span>{reviewType === "weekly" ? "Points" : "Calculated Points"}</span>
                            </div>

                            <div className="flex justify-between text-xs font-mono">
                              <span className="text-slate-700">
                                {reviewType === "weekly"
                                  ? "Leads Gen (Achievement):"
                                  : `Leads Gen (Achievement): (${leadsGeneratedActual}/${leadsGeneratedTarget}) \u00D7 ${leadsGeneratedWeight}`}
                              </span>
                              <span className="text-emerald-600 font-bold">
                                {reviewType === "weekly"
                                  ? "--"
                                  : `${computedLeads.toFixed(2)} pts`}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs font-mono">
                              <span className="text-slate-700">
                                {reviewType === "weekly"
                                  ? "Cost Per Lead (Reverse):"
                                  : `Cost Per Lead (Reverse): (${costPerLeadTarget}/${costPerLeadActual}) \u00D7 ${costPerLeadWeight}`}
                              </span>
                              <span className="text-emerald-600 font-bold">
                                {reviewType === "weekly"
                                  ? "--"
                                  : `${computedCost.toFixed(2)} pts`}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs font-mono">
                              <span className="text-slate-700">
                                {reviewType === "weekly"
                                  ? "Qual. Lead Rate (Ratio):"
                                  : `Qual. Lead Rate (Ratio): (${qualifiedLeadRateActual}/${qualifiedLeadRateTarget}) \u00D7 ${qualifiedLeadRateWeight}`}
                              </span>
                              <span className="text-emerald-600 font-bold">
                                {reviewType === "weekly"
                                  ? "--"
                                  : `${computedQual.toFixed(2)} pts`}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs font-mono">
                              <span className="text-slate-700">
                                {reviewType === "weekly"
                                  ? "Campaign Conversion (Ratio):"
                                  : `Campaign Conversion (Ratio): (${campaignConversionActual}/${campaignConversionTarget}) \u00D7 ${campaignConversionWeight}`}
                              </span>
                              <span className="text-emerald-600 font-bold">
                                {reviewType === "weekly"
                                  ? "--"
                                  : `${computedConv.toFixed(2)} pts`}
                              </span>
                            </div>

                            <div className="border-t border-slate-200 my-1"></div>

                            <div className="flex justify-between text-xs pt-1 text-slate-700">
                              <span>Calculated Role Score (Max 80):</span>
                              <span className="font-mono font-bold text-[#02275A]">
                                {reviewType === "weekly"
                                  ? "-- / 80.0 pts"
                                  : `${marketingRoleScore.toFixed(2)} / 80.0 pts`}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs text-slate-700">
                              <span>Calculated Conduct Score (Max 20):</span>
                              <span className="font-mono font-bold text-[#02275A]">
                                {reviewType === "weekly"
                                  ? "-- / 20.0 pts"
                                  : `${marketingConductScore.toFixed(2)} / 20.0 pts`}
                              </span>
                            </div>

                            <div className="border-t border-slate-200 my-1"></div>

                            <div className="flex justify-between items-center text-sm font-bold bg-[#02275A]/5 border border-[#02275A]/15 p-2.5 rounded-lg text-slate-900">
                              <span>Overall Performance Score:</span>
                              <span className="font-mono text-base font-black text-[#02275A]">
                                {reviewType === "weekly"
                                  ? "Pending"
                                  : `${computedMarketingOverallScore}%`}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* IF SELECTED ROLE TYPE IS SALES, RENDER THE FORMULA-KPI UI */}
                  {selectedRoleType === "Sales" && (
                    <div className="space-y-4 animate-fade-in text-left">

                      {isSalesWeightSumInvalid && (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 leading-relaxed flex items-start gap-2.5 font-semibold animate-pulse">
                          <i className="fas fa-exclamation-triangle text-sm shrink-0"></i>
                          <span>
                            Attention: The sum of the allocated Role Weights is
                            currently {sumOfSalesWeights} pts. It must not
                            exceed the limit of 80! Please reduce metric
                            weights.
                          </span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Column 1: Math Inputs */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                          <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider border-b pb-1">
                            1. Enter Actual Values
                          </h3>

                          {/* Revenue Achieved */}
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                            <span className="text-xs font-bold text-slate-800">
                              A. Revenue Achieved (Achievement)
                            </span>
                            <div className="grid grid-cols-1 gap-2">
                              <div>
                                <label className="block text-[10px] text-slate-500 font-bold mb-0.5">
                                  Actual Rev. (₦)
                                </label>
                                <input
                                  type="number"
                                  step="any"
                                  min="0"
                                  value={revenueActual}
                                  onChange={(e) =>
                                    setRevenueActual(
                                      parseFloat(e.target.value) || 0,
                                    )
                                  }
                                  className="w-full px-2 py-1 text-center border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-900/10"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Deals Closed */}
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                            <span className="text-xs font-bold text-slate-800">
                              B. Deals Closed (Achievement)
                            </span>
                            <div className="grid grid-cols-1 gap-2">
                              <div>
                                <label className="block text-[10px] text-slate-500 font-bold mb-0.5">
                                  Actual Deals
                                </label>
                                <input
                                  type="number"
                                  step="any"
                                  min="0"
                                  value={dealsActual}
                                  onChange={(e) =>
                                    setDealsActual(
                                      parseFloat(e.target.value) || 0,
                                    )
                                  }
                                  className="w-full px-2 py-1 text-center border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-900/10"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Conversion Rate */}
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                            <span className="text-xs font-bold text-slate-800">
                              C. Conversion Rate % (Ratio)
                            </span>
                            <div className="grid grid-cols-1 gap-2">
                              <div>
                                <label className="block text-[10px] text-slate-500 font-bold mb-0.5">
                                  Actual %
                                </label>
                                <input
                                  type="number"
                                  step="any"
                                  min="0"
                                  value={conversionActual}
                                  onChange={(e) =>
                                    setConversionActual(
                                      parseFloat(e.target.value) || 0,
                                    )
                                  }
                                  className="w-full px-2 py-1 text-center border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-900/10"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Collections */}
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                            <span className="text-xs font-bold text-slate-800">
                              D. Collections (Achievement)
                            </span>
                            <div className="grid grid-cols-1 gap-2">
                              <div>
                                <label className="block text-[10px] text-slate-500 font-bold mb-0.5">
                                  Actual Coll. (₦)
                                </label>
                                <input
                                  type="number"
                                  step="any"
                                  min="0"
                                  value={collectionsActual}
                                  onChange={(e) =>
                                    setCollectionsActual(
                                      parseFloat(e.target.value) || 0,
                                    )
                                  }
                                  className="w-full px-2 py-1 text-center border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-900/10"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Column 2: Computations & Conduct Score */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                          <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider border-b pb-1">
                            2. Conduct Rating (Max 20 pts)
                          </h3>

                          {/* Active Company Conducts */}
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
                            <p className="text-[10px] text-slate-500 font-medium">
                              Evaluate the employee on active conducts (Total
                              sum is capped at 20):
                            </p>
                            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                              {companyWideConducts.map((c) => {
                                const actualVal =
                                  conductActualPoints[c.id] !== undefined
                                    ? conductActualPoints[c.id]
                                    : 5;
                                return (
                                  <div
                                    key={c.id}
                                    className="p-2 border border-slate-200 bg-white rounded-lg flex items-center justify-between text-xs font-sans shadow-sm"
                                  >
                                    <div className="min-w-0 pr-2">
                                      <div className="font-bold text-slate-800 truncate">
                                        {c.name}
                                      </div>
                                      <div className="text-[9px] text-slate-400">
                                        Target Weight: {c.points} pts
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <span className="text-[9px] font-bold text-slate-500">
                                        Rating:
                                      </span>
                                      <select
                                        value={actualVal}
                                        onChange={(e) => {
                                          const val = Number(e.target.value);
                                          updateConductPoint(c.id, val);
                                        }}
                                        className="px-2 py-1 border border-slate-200 rounded text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-slate-800"
                                      >
                                        <option value="5">5 - Outstanding</option>
                                        <option value="4">4 - Commendable</option>
                                        <option value="3">3 - Satisfactory</option>
                                        <option value="2">2 - Needs Imp.</option>
                                        <option value="1">1 - Unsatisfactory</option>
                                      </select>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="flex justify-between items-center text-xs font-bold text-slate-705 bg-white border border-slate-100 p-2 rounded-lg">
                              <span>Calculated Conduct Score:</span>
                              <span className="font-mono font-black text-emerald-700">
                                {reviewType === "weekly"
                                  ? "-- / 20.0 pts"
                                  : `${salesConductScore.toFixed(1)} / 20.0 pts`}
                              </span>
                            </div>
                          </div>

                          {/* Real-time Formulas Evaluation Dashboard */}
                          <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider border-b pb-1 pt-1">
                            3. Live Score Preview
                          </h3>

                          <div className="bg-white text-slate-800 p-4 rounded-xl border border-slate-200 font-sans space-y-2.5 shadow-xs">
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pb-1 border-b border-slate-200 flex justify-between">
                              <span>Formula Metrics Breakdown</span>
                              <span>{reviewType === "weekly" ? "Points" : "Calculated Points"}</span>
                            </div>

                            <div className="flex justify-between text-xs font-mono">
                              <span className="text-slate-700">
                                {reviewType === "weekly"
                                  ? "Revenue (Achievement):"
                                  : `Revenue (Achievement): (${revenueActual}/${revenueTarget}) \u00D7 ${revenueWeight}`}
                              </span>
                              <span className="text-emerald-600 font-bold">
                                {reviewType === "weekly"
                                  ? "--"
                                  : `${computedRevenue.toFixed(2)} pts`}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs font-mono">
                              <span className="text-slate-700">
                                {reviewType === "weekly"
                                  ? "Deals (Achievement):"
                                  : `Deals (Achievement): (${dealsActual}/${dealsTarget}) \u00D7 ${dealsWeight}`}
                              </span>
                              <span className="text-emerald-600 font-bold">
                                {reviewType === "weekly"
                                  ? "--"
                                  : `${computedDeals.toFixed(2)} pts`}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs font-mono">
                              <span className="text-slate-700">
                                {reviewType === "weekly"
                                  ? "Conversion (Ratio):"
                                  : `Conversion (Ratio): (${conversionActual}/${conversionTarget}) \u00D7 ${conversionWeight}`}
                              </span>
                              <span className="text-emerald-600 font-bold">
                                {reviewType === "weekly"
                                  ? "--"
                                  : `${computedConversion.toFixed(2)} pts`}
                              </span>
                            </div>
                            <div className="flex justify-between text-[11px] font-mono">
                              <span className="text-slate-700">
                                {reviewType === "weekly"
                                  ? "Collections (Achievement):"
                                  : `Collections (Achievement): (${collectionsActual}/${collectionsTarget}) \u00D7 ${collectionsWeight}`}
                              </span>
                              <span className="text-emerald-600 font-bold">
                                {reviewType === "weekly"
                                  ? "--"
                                  : `${computedCollections.toFixed(2)} pts`}
                              </span>
                            </div>

                            <div className="border-t border-slate-200 my-1"></div>

                            <div className="flex justify-between text-xs pt-1 text-slate-700">
                              <span>Calculated Role Score (Max 80):</span>
                              <span className="font-mono font-bold text-[#02275A]">
                                {reviewType === "weekly"
                                  ? "-- / 80.0 pts"
                                  : `${salesRoleScore.toFixed(2)} / 80.0 pts`}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs text-slate-700">
                              <span>Calculated Conduct Score (Max 20):</span>
                              <span className="font-mono font-bold text-[#02275A]">
                                {reviewType === "weekly"
                                  ? "-- / 20.0 pts"
                                  : `${salesConductScore.toFixed(2)} / 20.0 pts`}
                              </span>
                            </div>

                            <div className="border-t border-slate-200 my-1"></div>

                            <div className="flex justify-between items-center text-sm font-bold bg-[#02275A]/5 border border-[#02275A]/15 p-2.5 rounded-lg text-slate-900">
                              <span>Overall Performance Score:</span>
                              <span className="font-mono text-base font-black text-[#02275A]">
                                {reviewType === "weekly"
                                  ? "Pending"
                                  : `${computedSalesOverallScore}%`}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* IF SELECTED ROLE TYPE IS CUSTOMER SUCCESS, RENDER THE FORMULA-KPI UI REVIEW CARD */}
                  {selectedRoleType === "Customer Success" && (
                    <div className="space-y-4 animate-fade-in text-left">

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Column 1: Enter Actual Values */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                          <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider border-b pb-1">
                            1. Enter Actual Values
                          </h3>

                          {/* Renewal Achievement */}
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                            <span className="text-xs font-bold text-slate-800">
                              A. Renewal Revenue (Achievement)
                            </span>
                            <div className="grid grid-cols-1 gap-2">
                              <div>
                                <label className="block text-[10px] text-slate-500 font-bold mb-0.5">
                                  Actual Rev. (₦)
                                </label>
                                <input
                                  type="number"
                                  step="any"
                                  min="0"
                                  value={renewalActual}
                                  onChange={(e) =>
                                    setRenewalActual(
                                      parseFloat(e.target.value) || 0,
                                    )
                                  }
                                  className="w-full px-2 py-1 text-center border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-900/10"
                                />
                              </div>
                            </div>
                            <div className="text-slate-500 text-[10px] mt-1">
                              Formula Points: {reviewType === "weekly" ? "--" : `${computedRenewal.toFixed(2)} / 25.00 pts`}
                            </div>
                          </div>

                          {/* Customer Retention */}
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                            <span className="text-xs font-bold text-slate-800">
                              B. Customer Retention (Ratio)
                            </span>
                            <div className="grid grid-cols-1 gap-2">
                              <div>
                                <label className="block text-[10px] text-slate-500 font-bold mb-0.5">
                                  Actual Retention (%)
                                </label>
                                <input
                                  type="number"
                                  step="any"
                                  min="0"
                                  max="100"
                                  value={retentionActual}
                                  onChange={(e) =>
                                    setRetentionActual(
                                      parseFloat(e.target.value) || 0,
                                    )
                                  }
                                  className="w-full px-2 py-1 text-center border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-900/10"
                                />
                              </div>
                            </div>
                            <div className="text-slate-500 text-[10px] mt-1">
                              Formula Points: {reviewType === "weekly" ? "--" : `${computedRetention.toFixed(2)} / 20.00 pts`}
                            </div>
                          </div>

                          {/* Expansion Revenue */}
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                            <span className="text-xs font-bold text-slate-800">
                              C. Expansion Revenue (Achievement)
                            </span>
                            <div className="grid grid-cols-1 gap-2">
                              <div>
                                <label className="block text-[10px] text-slate-500 font-bold mb-0.5">
                                  Actual Exp. (₦)
                                </label>
                                <input
                                  type="number"
                                  step="any"
                                  min="0"
                                  value={expansionActual}
                                  onChange={(e) =>
                                    setExpansionActual(
                                      parseFloat(e.target.value) || 0,
                                    )
                                  }
                                  className="w-full px-2 py-1 text-center border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-900/10"
                                />
                              </div>
                            </div>
                            <div className="text-slate-500 text-[10px] mt-1">
                              Formula Points: {reviewType === "weekly" ? "--" : `${computedExpansion.toFixed(2)} / 15.00 pts`}
                            </div>
                          </div>

                          {/* Customer Health */}
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                            <span className="text-xs font-bold text-slate-800">
                              D. Customer Health (Ratio)
                            </span>
                            <div className="grid grid-cols-1 gap-2">
                              <div>
                                <label className="block text-[10px] text-slate-500 font-bold mb-0.5">
                                  Actual Health (%)
                                </label>
                                <input
                                  type="number"
                                  step="any"
                                  min="0"
                                  max="100"
                                  value={healthActual}
                                  onChange={(e) =>
                                    setHealthActual(
                                      parseFloat(e.target.value) || 0,
                                    )
                                  }
                                  className="w-full px-2 py-1 text-center border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-900/10"
                                />
                              </div>
                            </div>
                            <div className="text-slate-500 text-[10px] mt-1">
                              Formula Points: {reviewType === "weekly" ? "--" : `${computedHealth.toFixed(2)} / 10.00 pts`}
                            </div>
                          </div>

                          {/* Product Adoption */}
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                            <span className="text-xs font-bold text-slate-800">
                              E. Product Adoption (Ratio)
                            </span>
                            <div className="grid grid-cols-1 gap-2">
                              <div>
                                <label className="block text-[10px] text-slate-500 font-bold mb-0.5">
                                  Actual Adoption (%)
                                </label>
                                <input
                                  type="number"
                                  step="any"
                                  min="0"
                                  max="100"
                                  value={adoptionActual}
                                  onChange={(e) =>
                                    setAdoptionActual(
                                      parseFloat(e.target.value) || 0,
                                    )
                                  }
                                  className="w-full px-2 py-1 text-center border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-900/10"
                                />
                              </div>
                            </div>
                            <div className="text-slate-500 text-[10px] mt-1">
                              Formula Points: {reviewType === "weekly" ? "--" : `${computedAdoption.toFixed(2)} / 10.00 pts`}
                            </div>
                          </div>
                        </div>

                        {/* Column 2: Conduct & Scoring Review */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                          <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider border-b pb-1">
                            2. Conduct Rating (Max 20 pts)
                          </h3>

                          {/* Conduct scoring list */}
                          <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50">
                            {companyWideConducts.map((item) => {
                              const currPoints =
                                conductActualPoints[item.id] !== undefined
                                  ? conductActualPoints[item.id]
                                  : 5;
                              return (
                                <div
                                  key={item.id}
                                  className="flex items-center justify-between text-xs py-1 border-b border-dashed border-slate-100 last:border-0"
                                >
                                  <div className="flex flex-col text-left">
                                    <span className="font-semibold text-slate-700">
                                      {item.name}
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                      Target Weight: {item.points} pts
                                    </span>
                                  </div>
                                  <select
                                    value={currPoints}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      updateConductPoint(item.id, val);
                                    }}
                                    className="px-2 py-1 border border-slate-200 rounded-md text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-slate-800"
                                  >
                                    <option value="5">5 - Outstanding</option>
                                    <option value="4">4 - Commendable</option>
                                    <option value="3">3 - Satisfactory</option>
                                    <option value="2">2 - Needs Imp.</option>
                                    <option value="1">1 - Unsatisfactory</option>
                                  </select>
                                </div>
                              );
                            })}
                          </div>

                          <div className="p-4 bg-white text-slate-800 rounded-xl border border-slate-200 space-y-3 shrink-0 shadow-xs">
                            <h4 className="text-xs font-bold text-[#02275A] uppercase tracking-widest text-left">
                              Result Summary
                            </h4>

                            <div className="flex justify-between text-xs text-slate-700">
                              <span>Customer Success Score (Max 80):</span>
                              <span className="font-mono font-bold text-[#02275A]">
                                {reviewType === "weekly"
                                  ? "-- / 80.00 pts"
                                  : `${csRoleScore.toFixed(2)} / 80.00 pts`}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs text-slate-700">
                              <span>Calculated Conduct Score (Max 20):</span>
                              <span className="font-mono font-bold text-[#02275A]">
                                {reviewType === "weekly"
                                  ? "-- / 20.00 pts"
                                  : `${csConductScore.toFixed(2)} / 20.00 pts`}
                              </span>
                            </div>

                            <div className="border-t border-slate-200 my-1"></div>

                            <div className="flex justify-between items-center text-sm font-bold bg-[#02275A]/5 border border-[#02275A]/15 p-2.5 rounded-lg text-slate-900">
                              <span>Overall Performance Score:</span>
                              <span className="font-mono text-base font-black text-[#02275A]">
                                {reviewType === "weekly"
                                  ? "Pending"
                                  : `${computedCustomerSuccessOverallScore}%`}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* IF SELECTED ROLE TYPE IS OPERATIONS, RENDER THE COMPACT SIMPLE FORM */}
                  {selectedRoleType === "Operations" && (
                    <div className="space-y-4 animate-fade-in text-left">
                      <div className="p-3 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed flex items-start gap-2.5">
                        <i className="fas fa-cubes text-sm text-slate-600 shrink-0 mt-0.5"></i>
                        <div>
                          <p className="font-bold text-slate-900 font-sans">
                            Configure Operations KPIs (KPI by KPI)
                          </p>
                          <p className="mt-1 font-sans text-slate-600">
                            Set actual rates and config weights. Mathematical scoring acts programmatically without complex layout displays.
                          </p>
                        </div>
                      </div>

                      {isOperationsWeightSumInvalid && (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold flex items-center gap-2.5 animate-pulse font-sans">
                          <i className="fas fa-exclamation-triangle text-sm shrink-0"></i>
                          <span>
                            Attention: Sum of weights ({sumOfOperationsWeights} pts) exceeds the limit of 80! Please reduce metric weights.
                          </span>
                        </div>
                      )}

                      <div className="space-y-4 max-w-xl mx-auto">
                        {/* KPI 1: Order Fulfillment */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                          <h4 className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide font-sans">
                            1. Order Fulfillment Rate
                          </h4>
                          <div className="grid grid-cols-1 gap-3">
                            <div>
                              <label className="block text-[10px] text-slate-500 font-bold mb-1 font-sans">
                                Fulfillment Rate (%)
                              </label>
                              <input
                                type="number"
                                step="any"
                                min="0"
                                max="100"
                                value={fulfillmentRate}
                                onChange={(e) =>
                                  setFulfillmentRate(parseFloat(e.target.value) || 0)
                                }
                                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-mono font-bold text-slate-800 focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-900/10"
                              />
                            </div>
                          </div>
                        </div>

                        {/* KPI 2: Inventory Accuracy */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                          <h4 className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide font-sans">
                            2. Inventory Accuracy Rate
                          </h4>
                          <div className="grid grid-cols-1 gap-3">
                            <div>
                              <label className="block text-[10px] text-slate-500 font-bold mb-1 font-sans">
                                Accuracy Rate (%)
                              </label>
                              <input
                                type="number"
                                step="any"
                                min="0"
                                max="100"
                                value={accuracyRate}
                                onChange={(e) =>
                                  setAccuracyRate(parseFloat(e.target.value) || 0)
                                }
                                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-mono font-bold text-slate-800 focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-900/10"
                              />
                            </div>
                          </div>
                        </div>

                        {/* KPI 3: Cost Saving */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                          <h4 className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide font-sans">
                            3. Cost Saving (Actual)
                          </h4>
                          <div className="grid grid-cols-1 gap-2">
                            <div>
                              <label className="block text-[10px] text-slate-500 font-bold mb-1 font-sans">
                                Actual Savings (₦)
                              </label>
                              <input
                                type="number"
                                step="any"
                                min="0"
                                value={actualSavings}
                                onChange={(e) =>
                                  setActualSavings(parseFloat(e.target.value) || 0)
                                }
                                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-mono font-bold text-slate-800 focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-900/10"
                              />
                            </div>
                          </div>
                        </div>

                        {/* KPI 4: Stock Variance */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                          <h4 className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide font-sans">
                            4. Stock Variance (Actual)
                          </h4>
                          <div className="grid grid-cols-1 gap-2">
                            <div>
                              <label className="block text-[10px] text-slate-500 font-bold mb-1 font-sans">
                                Actual Variance
                              </label>
                              <input
                                type="number"
                                step="any"
                                min="1"
                                value={actualVariance}
                                onChange={(e) =>
                                  setActualVariance(parseFloat(e.target.value) || 1)
                                }
                                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-mono font-bold text-slate-800 focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-900/10"
                              />
                            </div>
                          </div>
                        </div>

                        {/* KPI 5: Process Compliance Deductions */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                          <h4 className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide font-sans">
                            5. Process Compliance Deductions
                          </h4>
                          <div className="grid grid-cols-1 gap-3">
                            <div>
                              <label className="block text-[10px] text-slate-500 font-bold mb-1 font-sans">
                                Compliance Deductions (pts)
                              </label>
                              <input
                                type="number"
                                step="any"
                                min="0"
                                max="10"
                                value={complianceDeductions}
                                onChange={(e) =>
                                  setComplianceDeductions(parseFloat(e.target.value) || 0)
                                }
                                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-mono font-bold text-slate-800 focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-900/10"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Company Conduct Evaluation for Operations */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200">
                          <h4 className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide font-sans">
                            6. Adjust Conduct Evaluated Points (Max 20)
                          </h4>
                          <div className="space-y-2 border border-slate-100 rounded-xl p-3 bg-white">
                            {companyWideConducts.map((item) => {
                              const currPoints = conductActualPoints[item.id] !== undefined
                                ? conductActualPoints[item.id]
                                : 5;
                              return (
                                <div
                                  key={item.id}
                                  className="flex items-center justify-between text-xs py-1.5 border-b border-dashed border-slate-100 last:border-0"
                                >
                                  <div className="flex flex-col text-left">
                                    <span className="font-semibold text-slate-700 font-sans">
                                      {item.name}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-sans">
                                      Target Weight: {item.points} pts
                                    </span>
                                  </div>
                                  <select
                                    value={currPoints}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      updateConductPoint(item.id, val);
                                    }}
                                    className="px-2 py-1 border border-slate-200 rounded-md text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-slate-800"
                                  >
                                    <option value="5">5 - Outstanding</option>
                                    <option value="4">4 - Commendable</option>
                                    <option value="3">3 - Satisfactory</option>
                                    <option value="2">2 - Needs Imp.</option>
                                    <option value="1">1 - Unsatisfactory</option>
                                  </select>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Operations Result Summary card */}
                        <div className="p-4 bg-white text-slate-800 rounded-xl border border-slate-200 space-y-3 shrink-0 shadow-xs">
                          <h4 className="text-xs font-bold text-[#02275A] uppercase tracking-widest text-left font-sans">
                            Result Summary
                          </h4>

                          <div className="flex justify-between text-xs text-slate-700">
                            <span className="font-sans">Operations Role Score (Max 80):</span>
                            <span className="font-mono font-bold text-[#02275A]">
                              {reviewType === "weekly"
                                ? "-- / 80.00 pts"
                                : `${operationsRoleScore.toFixed(2)} / 80.00 pts`}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs text-slate-700">
                            <span className="font-sans">Calculated Conduct Score (Max 20):</span>
                            <span className="font-mono font-bold text-[#02275A]">
                              {reviewType === "weekly"
                                ? "-- / 20.00 pts"
                                : `${operationsConductScore.toFixed(2)} / 20.00 pts`}
                            </span>
                          </div>

                          <div className="border-t border-slate-200 my-1"></div>

                          <div className="flex justify-between items-center text-sm font-bold bg-[#02275A]/5 border border-[#02275A]/15 p-2.5 rounded-lg text-slate-900">
                            <span className="font-sans">Overall Performance Score:</span>
                            <span className="font-mono text-base font-black text-[#02275A]">
                              {reviewType === "weekly"
                                ? "Pending"
                                : `${computedOperationsOverallScore}%`}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* IF SELECTED ROLE TYPE IS MANAGER, RENDER YOUR FORMULA-BASED INPUTS & CONDUCT RULES */}
                  {selectedRoleType === "Manager" && (
                    <div className="space-y-4 animate-fade-in text-left">

                      {(() => {
                        const selectedEmp = employees.find(e => e.id === updatePointsFormUser || e.employeeId === updatePointsFormUser);
                        if (!selectedEmp) return null;
                        const selectedEmpId = selectedEmp.employeeId || selectedEmp.id;
                        const selectedEmpDept = selectedEmp.department || "";
                        
                        // Subordinates are anyone whose reports_to matches this manager, OR anyone in the same department who is not a manager/lead
                        const reports = employees.filter(e => 
                          (e.reports_to === selectedEmpId || e.reports_to === selectedEmp.id ||
                          (e.department && selectedEmpDept && e.department.toLowerCase() === selectedEmpDept.toLowerCase() && e.id !== selectedEmp.id)) &&
                          !(
                            (e.role || "").toLowerCase().includes("manager") ||
                            (e.role || "").toLowerCase().includes("lead") ||
                            (e.role || "").toLowerCase().includes("director") ||
                            (e.role || "").toLowerCase().includes("head") ||
                            e.is_team_lead === true
                          )
                        );

                        if (reports.length === 0) return null;

                        // Calculate average performance of these reports
                        const avgPerf = reports.reduce((sum, r) => {
                          const subKpis = r.kpis || [];
                          const roleKpis = subKpis.filter(k => {
                            const kName = (k.name || "").toLowerCase();
                            const coreNames = [
                              "punctuality & attendance",
                              "punctuality and attendance",
                              "team player & collaboration",
                              "team player and collaboration",
                              "communication adeptness",
                              "administrative compliance",
                              "punctuality",
                              "collaboration",
                              "communication",
                              "compliance",
                              "attendance",
                              "team player"
                            ];
                            const isCore = coreNames.some(cn => kName.includes(cn) || cn.includes(kName));
                            return !isCore;
                          });
                          const roleKpiScoreSum = roleKpis.reduce((s, k) => s + calculateKPIContribution(k), 0);
                          const roleKpiWeightSum = roleKpis.reduce((s, k) => s + k.weight, 0);
                          const subRoleKpiPct = getSubordinateRoleKpiPercentage(r);
                          return sum + subRoleKpiPct;
                        }, 0) / reports.length;

                        // Calculate average quality (CSAT, health, etc.)
                        const avgQuality = reports.reduce((sum, r) => {
                          const qual = r.customerSuccessInputs?.healthActual || (r.techSupportInputs?.customerSatisfaction ? r.techSupportInputs.customerSatisfaction * 20 : null) || r.performanceScore || 85;
                          return sum + qual;
                        }, 0) / reports.length;

                        // Calculate average compliance
                        const avgCompliance = reports.reduce((sum, r) => {
                          const comp = r.techSupportInputs?.slaCompliance || r.operationsInputs?.fulfillmentRate || r.performanceScore || 90;
                          return sum + comp;
                        }, 0) / reports.length;

                        return (
                          <div className="bg-[#02275A]/5 border border-[#02275A]/15 text-slate-900 p-5 rounded-2xl shadow-xs max-w-xl mx-auto space-y-4 mb-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                <h4 className="text-xs font-bold uppercase tracking-wider text-[#02275A] font-sans">
                                  Cumulative Team Performance Engine Active
                                </h4>
                              </div>
                              <span className="text-[10px] bg-[#02275A]/10 text-[#02275A] border border-[#02275A]/20 px-2.5 py-0.5 rounded-full font-bold font-mono">
                                {reports.length} Direct Reports
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                              This manager leads a team in <strong>{selectedEmpDept}</strong>. You can automatically sync and calculate their team KPIs cumulatively based on the actual scores of their subordinates listed below.
                            </p>

                            <div className="bg-white rounded-xl p-3 max-h-32 overflow-y-auto space-y-2 border border-slate-200">
                              {reports.map(r => (
                                <div key={r.id} className="flex justify-between items-center text-xs py-1 border-b border-dashed border-slate-100 last:border-0">
                                  <div className="flex flex-col text-left">
                                    <span className="font-semibold text-slate-800">{r.firstName} {r.lastName}</span>
                                    <span className="text-[9px] text-slate-500">{r.role}</span>
                                  </div>
                                  <span className="font-mono font-bold text-[#02275A] bg-[#02275A]/10 px-2 py-0.5 rounded">
                                    {r.performanceScore || 0}% Score
                                  </span>
                                </div>
                              ))}
                            </div>

                            <div className="grid grid-cols-3 gap-2 text-center">
                              <div className="bg-white rounded-lg p-2 border border-slate-200">
                                <span className="block text-[9px] text-slate-500 uppercase tracking-wider font-sans">Avg Performance</span>
                                <span className="font-mono text-xs font-bold text-emerald-700">{avgPerf.toFixed(1)}%</span>
                              </div>
                              <div className="bg-white rounded-lg p-2 border border-slate-200">
                                <span className="block text-[9px] text-slate-500 uppercase tracking-wider font-sans">Avg Team Quality</span>
                                <span className="font-mono text-xs font-bold text-[#02275A]">{avgQuality.toFixed(1)}%</span>
                              </div>
                              <div className="bg-white rounded-lg p-2 border border-slate-200">
                                <span className="block text-[9px] text-slate-500 uppercase tracking-wider font-sans">Avg Compliance</span>
                                <span className="font-mono text-xs font-bold text-emerald-700">{avgCompliance.toFixed(1)}%</span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setManagerActualTeamResult(Number(avgPerf.toFixed(1)));
                                setManagerTeamTarget(100);
                                setManagerQualityPercent(Number(avgQuality.toFixed(1)));
                                setManagerCompliancePercent(Number(avgCompliance.toFixed(1)));
                                setManagerReportingRating(Math.max(1, Math.min(5, Math.round(avgPerf / 20))));
                                setManagerPeopleManagementRating(Math.max(1, Math.min(5, Math.round(avgQuality / 20))));
                                setManagerLeadershipRating(Math.max(1, Math.min(5, Math.round((avgPerf + avgQuality) / 40))));
                                showSuccess("Cumulative team averages successfully synchronized and calculated!");
                              }}
                              className="w-full py-2.5 bg-[#02275A] hover:bg-[#0b3b82] text-white font-extrabold rounded-xl text-xs transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
                            >
                              <i className="fas fa-sync-alt text-white animate-spin-slow"></i>
                              Auto-Calculate & Sync Cumulative Averages
                            </button>
                          </div>
                        );
                      })()}

                      <div className="space-y-4 max-w-xl mx-auto">
                        {isCumulativeManager && (
                          <div className="bg-emerald-50 text-emerald-900 border border-emerald-200/50 p-4 rounded-xl text-xs text-left leading-relaxed font-sans space-y-1">
                            <h5 className="font-bold text-emerald-800 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                              <i className="fas fa-check-circle"></i>
                              Cumulative Team Metrics Mode
                            </h5>
                            <p>
                              This manager utilizes a <strong>cumulative performance template</strong>. All individual performance metrics (Team Achievement, Quality, Compliance, and leadership reviews) are automatically derived from the direct and indirect subordinate performance scores. Manual inputs are disabled.
                            </p>
                          </div>
                        )}

                        {!isCumulativeManager && (
                          <>
                            {/* KPI 1: Team Achievement */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                              <h4 className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide font-sans">
                                1. Team Achievement Score (Weight: 30)
                              </h4>
                              <p className="text-[10px] text-slate-400 mb-2 font-sans">
                                Formula: (Actual Team Result &divide; Team Target) &times; 30
                              </p>
                              <div className="grid grid-cols-1 gap-3">
                                <div>
                                  <label className="block text-[10px] text-slate-500 font-bold mb-1 font-sans">
                                    Actual Team Result
                                  </label>
                                  <input
                                    type="number"
                                    step="any"
                                    min="0"
                                    value={managerActualTeamResult}
                                    onChange={(e) =>
                                      setManagerActualTeamResult(parseFloat(e.target.value) || 0)
                                    }
                                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-mono font-bold text-slate-800 focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-900/10"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* KPI 2: Team Quality */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                              <h4 className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide font-sans">
                                2. Team Quality Score (Weight: 15)
                              </h4>
                              <p className="text-[10px] text-slate-400 mb-2 font-sans font-sans">
                                Formula: Quality % &times; 15
                              </p>
                              <div>
                                <label className="block text-[10px] text-slate-500 font-bold mb-1 font-sans">
                                  Quality percentage (%)
                                </label>
                                <input
                                  type="number"
                                  step="any"
                                  min="0"
                                  max="100"
                                  value={managerQualityPercent}
                                  onChange={(e) =>
                                    setManagerQualityPercent(parseFloat(e.target.value) || 0)
                                  }
                                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-mono font-bold text-slate-800 focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-900/10"
                                />
                              </div>
                            </div>

                            {/* KPI 3: Team Compliance */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                              <h4 className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide font-sans font-sans">
                                3. Team Compliance Score (Weight: 10)
                              </h4>
                              <p className="text-[10px] text-slate-400 mb-2 font-sans">
                                Formula: Compliance % &times; 10
                              </p>
                              <div>
                                <label className="block text-[10px] text-slate-500 font-bold mb-1 font-sans font-sans font-sans">
                                  Compliance percentage (%)
                                </label>
                                <input
                                  type="number"
                                  step="any"
                                  min="0"
                                  max="100"
                                  value={managerCompliancePercent}
                                  onChange={(e) =>
                                    setManagerCompliancePercent(parseFloat(e.target.value) || 0)
                                  }
                                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-mono font-bold text-slate-800 focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-900/10"
                                />
                              </div>
                            </div>

                            {/* KPI 4: Reporting Score */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                              <h4 className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide font-sans">
                                4. Reporting Score (Weight: 10)
                              </h4>
                              <p className="text-[10px] text-slate-400 mb-2 font-sans font-sans">
                                Formula: (Rating &divide; 5) &times; 10
                              </p>
                              <div>
                                <label className="block text-[10px] text-slate-500 font-bold mb-1 font-sans">
                                  Rating (1 - 5)
                                </label>
                                <input
                                  type="number"
                                  step="any"
                                  min="1"
                                  max="5"
                                  value={managerReportingRating}
                                  onChange={(e) =>
                                    setManagerReportingRating(parseFloat(e.target.value) || 0)
                                  }
                                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-mono font-bold text-slate-800 focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-900/10"
                                />
                              </div>
                            </div>

                            {/* KPI 5: People Management Score */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                              <h4 className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide font-sans">
                                5. People Management Score (Weight: 10)
                              </h4>
                              <p className="text-[10px] text-slate-400 mb-2 font-sans font-sans font-sans">
                                Formula: (Rating &divide; 5) &times; 10
                              </p>
                              <div>
                                <label className="block text-[10px] text-slate-500 font-bold mb-1 font-sans">
                                  Rating (1 - 5)
                                </label>
                                <input
                                  type="number"
                                  step="any"
                                  min="1"
                                  max="5"
                                  value={managerPeopleManagementRating}
                                  onChange={(e) =>
                                    setManagerPeopleManagementRating(parseFloat(e.target.value) || 0)
                                  }
                                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-mono font-bold text-slate-800 focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-900/10"
                                />
                              </div>
                            </div>

                            {/* KPI 6: Leadership Score */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                              <h4 className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide font-sans">
                                6. Leadership Score (Weight: 5)
                              </h4>
                              <p className="text-[10px] text-slate-400 mb-2 font-sans font-sans">
                                Formula: (Rating &divide; 5) &times; 5
                              </p>
                              <div>
                                <label className="block text-[10px] text-slate-500 font-bold mb-1 font-sans">
                                  Rating (1 - 5)
                                </label>
                                <input
                                  type="number"
                                  step="any"
                                  min="1"
                                  max="5"
                                  value={managerLeadershipRating}
                                  onChange={(e) =>
                                    setManagerLeadershipRating(parseFloat(e.target.value) || 0)
                                  }
                                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-mono font-bold text-slate-800 focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-900/10"
                                />
                              </div>
                            </div>
                          </>
                        )}

                        {/* Conduct Adjustment */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200">
                          <h4 className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide font-sans">
                            7. Adjust Conduct Evaluated Points (Max 20)
                          </h4>
                          <div className="space-y-2 border border-slate-100 rounded-xl p-3 bg-white">
                            {companyWideConducts.map((item) => {
                              const currPoints = conductActualPoints[item.id] !== undefined
                                ? conductActualPoints[item.id]
                                : 5;
                              return (
                                <div
                                  key={item.id}
                                  className="flex items-center justify-between text-xs py-1.5 border-b border-dashed border-slate-100 last:border-0"
                                >
                                  <div className="flex flex-col text-left">
                                    <span className="font-semibold text-slate-700 font-sans">
                                      {item.name}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-sans">
                                      Target Weight: {item.points} pts
                                    </span>
                                  </div>
                                  <select
                                    value={currPoints}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      updateConductPoint(item.id, val);
                                    }}
                                    className="px-2 py-1 border border-slate-200 rounded-md text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-slate-800"
                                  >
                                    <option value="5">5 - Outstanding</option>
                                    <option value="4">4 - Commendable</option>
                                    <option value="3">3 - Satisfactory</option>
                                    <option value="2">2 - Needs Imp.</option>
                                    <option value="1">1 - Unsatisfactory</option>
                                  </select>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Result Summary card */}
                        <div className="p-4 bg-white text-slate-800 rounded-xl border border-slate-200 space-y-3 shrink-0 shadow-xs">
                          <h4 className="text-xs font-bold text-[#02275A] uppercase tracking-widest text-left font-sans">
                            Result Summary
                          </h4>

                          {isCumulativeManager ? (
                            <div className="flex justify-between text-xs text-slate-700 font-sans">
                              <span>Cumulative Team Performance (Max 80):</span>
                              <span className="font-mono font-bold text-[#02275A] font-sans">
                                {reviewType === "weekly"
                                  ? "-- / 80.00 pts"
                                  : `${managerRoleScore.toFixed(2)} / 80.00 pts`}
                              </span>
                            </div>
                          ) : (
                            <>
                              <div className="flex justify-between text-xs text-slate-700 font-sans">
                                <span>Team Achievement Score (Max 30):</span>
                                <span className="font-mono font-bold text-[#02275A]">
                                  {reviewType === "weekly"
                                    ? "--"
                                    : `${computedTeamAchievement.toFixed(2)} / 30.00 pts`}
                                </span>
                              </div>
                              <div className="flex justify-between text-xs text-slate-700 font-sans">
                                <span>Team Quality Score (Max 15):</span>
                                <span className="font-mono font-bold text-[#02275A]">
                                  {reviewType === "weekly"
                                    ? "--"
                                    : `${computedTeamQuality.toFixed(2)} / 15.00 pts`}
                                </span>
                              </div>
                              <div className="flex justify-between text-xs text-slate-700 font-sans">
                                <span>Team Compliance Score (Max 10):</span>
                                <span className="font-mono font-bold text-[#02275A]">
                                  {reviewType === "weekly"
                                    ? "--"
                                    : `${computedTeamCompliance.toFixed(2)} / 10.00 pts`}
                                </span>
                              </div>
                              <div className="flex justify-between text-xs text-slate-700 font-sans font-sans">
                                <span>Reporting Score (Max 10):</span>
                                <span className="font-mono font-bold text-[#02275A]">
                                  {reviewType === "weekly"
                                    ? "--"
                                    : `${computedReporting.toFixed(2)} / 10.00 pts`}
                                </span>
                              </div>
                              <div className="flex justify-between text-xs text-slate-700 font-sans font-sans">
                                <span>People Management Score (Max 10):</span>
                                <span className="font-mono font-bold text-[#02275A]">
                                  {reviewType === "weekly"
                                    ? "--"
                                    : `${computedPeopleMgmt.toFixed(2)} / 10.00 pts`}
                                </span>
                              </div>
                              <div className="flex justify-between text-xs text-slate-700 font-sans">
                                <span>Leadership Score (Max 5):</span>
                                <span className="font-mono font-bold text-[#02275A] font-sans">
                                  {reviewType === "weekly"
                                    ? "--"
                                    : `${computedLeadership.toFixed(2)} / 5.000 pts`}
                                </span>
                              </div>
                            </>
                          )}
                          <div className="border-t border-slate-200 my-1 font-sans"></div>
                          <div className="flex justify-between text-xs text-slate-700 font-sans">
                            <span>Calculated Conduct Score (Max 20):</span>
                            <span className="font-mono font-bold text-[#02275A]">
                              {reviewType === "weekly"
                                ? "-- / 20.00 pts"
                                : `${managerConductScore.toFixed(2)} / 20.00 pts`}
                            </span>
                          </div>

                          <div className="border-t border-slate-200 my-1"></div>

                          <div className="flex justify-between items-center text-sm font-bold bg-[#02275A]/5 border border-[#02275A]/15 p-2.5 rounded-lg text-slate-900 font-sans">
                            <span>Overall Performance Score:</span>
                            <span className="font-mono text-base font-black text-[#02275A]">
                              {reviewType === "weekly"
                                ? "Pending"
                                : `${computedManagerOverallScore}%`}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                    </div>
                  )}

                    </>
                  ) : (
                    <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center space-y-2 py-16 animate-fade-in my-4">
                      <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                        <i className="fas fa-user-tie text-slate-700 text-xl animate-bounce"></i>
                      </div>
                      <p className="text-sm font-bold text-slate-700 font-sans">No Employee Selected</p>
                      <p className="text-xs text-slate-400 font-sans max-w-xs leading-relaxed">
                        Please select an employee from the dropdown above to view KPI metrics and conduct evaluations.
                      </p>
                    </div>
                  )}

                  </div>
                </div>

                {/* Submit Actions Sticky Footer */}
                <div className="px-6 sm:px-8 py-3.5 border-t border-slate-200 bg-white/95 backdrop-blur-md flex items-center justify-end gap-3 shrink-0 shadow-lg z-20">
                  <div className="flex items-center justify-end gap-3 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setIsUpdatePointsModalOpen(false)}
                      className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 transition-all cursor-pointer font-sans"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitDisabled}
                    onClick={() => {
                      if (!updatePointsFormUser) {
                        alert("Please select a user.");
                        return;
                      }

                      const currentEmp = employees.find((e) => e.id === updatePointsFormUser);
                      if (!currentEmp) {
                        alert("Selected employee not found.");
                        return;
                      }

                      if (reviewType === "weekly") {
                        const currentEmp = employees.find((e) => e.id === updatePointsFormUser || e.employeeId === updatePointsFormUser);
                        if (!currentEmp) {
                          alert("Selected employee not found.");
                          return;
                        }

                        // Constraint 1: Allow only one Weekly review per employee for each week. Prevent duplicates unless editing.
                        if (!editingWeeklyRecordId && currentEmp.weeklyReviews) {
                          const duplicateExists = currentEmp.weeklyReviews.some(
                            (rev) =>
                              String(rev.year) === String(weeklyYear) &&
                              String(rev.month) === String(weeklyMonth) &&
                              String(rev.week) === String(weeklyWeek)
                          );
                          if (duplicateExists) {
                            alert("A weekly performance review already exists for this employee for the selected week.");
                            return;
                          }
                        }

                        setEmployees((prev) => {
                          const updated = prev.map((item) => {
                            if (item.id === updatePointsFormUser || item.employeeId === updatePointsFormUser) {
                              const calculatedScore = (() => {
                                if (selectedRoleType === "Tech Support") return computedTechSupportOverallScore;
                                if (selectedRoleType === "Marketing") return computedMarketingOverallScore;
                                if (selectedRoleType === "Sales") return computedSalesOverallScore;
                                if (selectedRoleType === "Customer Success") return computedCustomerSuccessOverallScore;
                                if (selectedRoleType === "Operations") return computedOperationsOverallScore;
                                if (selectedRoleType === "Manager") return computedManagerOverallScore;
                                return item.performanceScore ?? 100;
                              })();

                              const newRecord = {
                                id: editingWeeklyRecordId || Math.random().toString(36).substring(2, 9),
                                year: weeklyYear,
                                month: weeklyMonth,
                                week: weeklyWeek,
                                comments: weeklyComments.trim(),
                                dateCreated: new Date().toISOString().split("T")[0],
                                performanceScore: calculatedScore,
                                roleType: selectedRoleType,
                                conductPoints: { ...conductActualPoints },
                                inputs: (() => {
                                  if (selectedRoleType === "Tech Support") {
                                    return {
                                      slaTickets,
                                      totalTickets,
                                      targetResponseTime,
                                      actualResponseTime,
                                      resolvedTickets,
                                      assignedTickets,
                                      customerSatisfaction,
                                      targetReopenRate,
                                      actualReopenRate,
                                    };
                                  }
                                  if (selectedRoleType === "Marketing") {
                                    return {
                                      leadsGeneratedTarget,
                                      leadsGeneratedActual,
                                      costPerLeadTarget,
                                      costPerLeadActual,
                                      qualifiedLeadRateTarget,
                                      qualifiedLeadRateActual,
                                      campaignConversionTarget,
                                      campaignConversionActual,
                                    };
                                  }
                                  if (selectedRoleType === "Sales") {
                                    return {
                                      revenueTarget,
                                      revenueActual,
                                      dealsTarget,
                                      dealsActual,
                                      conversionTarget,
                                      conversionActual,
                                      collectionsTarget,
                                      collectionsActual,
                                    };
                                  }
                                  if (selectedRoleType === "Customer Success") {
                                    return {
                                      renewalTarget,
                                      renewalActual,
                                      retentionActual,
                                      expansionTarget,
                                      expansionActual,
                                      healthActual,
                                      adoptionActual,
                                    };
                                  }
                                  if (selectedRoleType === "Operations") {
                                    return {
                                      fulfillmentRate,
                                      accuracyRate,
                                      actualSavings,
                                      targetSavings,
                                      targetVariance,
                                      actualVariance,
                                      complianceDeductions,
                                    };
                                  }
                                  if (selectedRoleType === "Manager") {
                                    return {
                                      teamTarget: managerTeamTarget,
                                      actualTeamResult: managerActualTeamResult,
                                      qualityPercent: managerQualityPercent,
                                      compliancePercent: managerCompliancePercent,
                                      reportingRating: managerReportingRating,
                                      peopleManagementRating: managerPeopleManagementRating,
                                      leadershipRating: managerLeadershipRating,
                                    };
                                  }
                                  return {};
                                })(),
                              };

                              let updatedWeeklyReviews = item.weeklyReviews ? [...item.weeklyReviews] : [];
                              if (editingWeeklyRecordId) {
                                const idx = updatedWeeklyReviews.findIndex((r) => String(r.id) === String(editingWeeklyRecordId));
                                if (idx >= 0) {
                                  updatedWeeklyReviews[idx] = { ...newRecord, id: editingWeeklyRecordId };
                                } else {
                                  updatedWeeklyReviews.unshift(newRecord);
                                }
                              } else {
                                updatedWeeklyReviews.unshift(newRecord);
                              }

                              let updatedEmp = {
                                ...item,
                                reviewDateType: "weekly",
                                weeklyReviews: updatedWeeklyReviews,
                              };

                              updatedEmp = recalculateEmployeeMonthlyAverages(updatedEmp);

                              if (viewEmployee && (viewEmployee.id === item.id || viewEmployee.employeeId === item.employeeId)) {
                                setViewEmployee(updatedEmp);
                              }
                              return updatedEmp;
                            }
                            return item;
                          });

                          localStorage.setItem(
                            "company_employees_data",
                            JSON.stringify(updated),
                          );
                          localStorage.setItem(
                            "company_employees_kpi_state",
                            JSON.stringify(updated),
                          );
                          return updated;
                        });

                        showSuccess(editingWeeklyRecordId ? "Successfully updated Weekly Review record." : "Successfully saved new Weekly Review record.");
                        setEditingWeeklyRecordId(null);
                        setWeeklyComments(""); // Reset comments
                        return;
                      }

                      // Apply points based on the role structure
                      setEmployees((prev) => {
                        const updated = prev.map((item) => {
                          if (item.id === updatePointsFormUser) {
                            const emp = {
                              ...item,
                              reviewDateType: reviewDateType,
                            };
                            if (selectedRoleType === "Tech Support") {
                              const sub = {
                                slaTickets,
                                totalTickets,
                                targetResponseTime,
                                actualResponseTime,
                                resolvedTickets,
                                assignedTickets,
                                customerSatisfaction,
                                targetReopenRate,
                                actualReopenRate,
                                slaWeight,
                                firstResponseWeight,
                                resolutionWeight,
                                csatWeight,
                                reopenWeight,
                              };

                              const auditEntry: GradeAuditEntry = {
                                id: Date.now().toString(),
                                previousGrade: `Score: ${emp.performanceScore ?? 100}`,
                                newGrade: `Score: ${computedTechSupportOverallScore}`,
                                policyResponsible:
                                  "Tech Support Formula Review",
                                dateOfChange: new Date()
                                  .toISOString()
                                  .split("T")[0],
                                approvingAuthority: "Admin / HR",
                                reason: `Tech Support Evaluation Formula - SLA: ${computedSla.toFixed(1)} pts, Response: ${computedResp.toFixed(1)} pts, Resolution: ${computedRes.toFixed(1)} pts, CSAT: ${computedCsat.toFixed(1)} pts, Reopen: ${computedReopen.toFixed(1)} pts. Conduct: ${supportConductScore.toFixed(1)} pts. Performance Score: ${computedTechSupportOverallScore}/100.`,
                              };

                              const updatedEmp = {
                                ...emp,
                                performanceScore:
                                  computedTechSupportOverallScore,
                                techSupportInputs: sub,
                                techSupportConductPoints: conductActualPoints,
                                gradeAuditTrail: [
                                  auditEntry,
                                  ...(emp.gradeAuditTrail || []),
                                ],
                              };

                              if (viewEmployee && viewEmployee.id === emp.id) {
                                setViewEmployee(updatedEmp);
                              }
                              return updatedEmp;
                            } else if (selectedRoleType === "Marketing") {
                              const mktInputs = {
                                leadsGeneratedTarget,
                                leadsGeneratedActual,
                                leadsGeneratedWeight,
                                costPerLeadTarget,
                                costPerLeadActual,
                                costPerLeadWeight,
                                qualifiedLeadRateTarget,
                                qualifiedLeadRateActual,
                                qualifiedLeadRateWeight,
                                campaignConversionTarget,
                                campaignConversionActual,
                                campaignConversionWeight,
                              };

                              const auditEntry: GradeAuditEntry = {
                                id: Date.now().toString(),
                                previousGrade: `Score: ${emp.performanceScore ?? 100}`,
                                newGrade: `Score: ${computedMarketingOverallScore}`,
                                policyResponsible: "Marketing Formula Review",
                                dateOfChange: new Date()
                                  .toISOString()
                                  .split("T")[0],
                                approvingAuthority: "Admin / HR",
                                reason: `Marketing Evaluation Formula - Leads: ${computedLeads.toFixed(1)} pts, Cost Per Lead: ${computedCost.toFixed(1)} pts, Qualified Lead Rate: ${computedQual.toFixed(1)} pts, Campaign Conv: ${computedConv.toFixed(1)} pts. Conduct: ${marketingConductScore.toFixed(1)} pts. Performance Score: ${computedMarketingOverallScore}/100.`,
                              };

                              const updatedEmp = {
                                ...emp,
                                performanceScore: computedMarketingOverallScore,
                                marketingInputs: mktInputs,
                                marketingConductPoints: conductActualPoints,
                                gradeAuditTrail: [
                                  auditEntry,
                                  ...(emp.gradeAuditTrail || []),
                                ],
                              };

                              if (viewEmployee && viewEmployee.id === emp.id) {
                                setViewEmployee(updatedEmp);
                              }
                              return updatedEmp;
                            } else if (selectedRoleType === "Sales") {
                              const salesInps = {
                                revenueTarget,
                                revenueActual,
                                revenueWeight,
                                dealsTarget,
                                dealsActual,
                                dealsWeight,
                                conversionTarget,
                                conversionActual,
                                conversionWeight,
                                collectionsTarget,
                                collectionsActual,
                                collectionsWeight,
                              };

                              const auditEntry: GradeAuditEntry = {
                                id: Date.now().toString(),
                                previousGrade: `Score: ${emp.performanceScore ?? 100}`,
                                newGrade: `Score: ${computedSalesOverallScore}`,
                                policyResponsible: "Sales Formula Review",
                                dateOfChange: new Date()
                                  .toISOString()
                                  .split("T")[0],
                                approvingAuthority: "Admin / HR",
                                reason: `Sales Evaluation Formula - Revenue: ${computedRevenue.toFixed(1)} pts, Deals: ${computedDeals.toFixed(1)} pts, Conversion: ${computedConversion.toFixed(1)} pts, Collections: ${computedCollections.toFixed(1)} pts. Conduct: ${salesConductScore.toFixed(1)} pts. Performance Score: ${computedSalesOverallScore}/100.`,
                              };

                              const updatedEmp = {
                                ...emp,
                                performanceScore: computedSalesOverallScore,
                                salesInputs: salesInps,
                                salesConductPoints: conductActualPoints,
                                gradeAuditTrail: [
                                  auditEntry,
                                  ...(emp.gradeAuditTrail || []),
                                ],
                              };

                              if (viewEmployee && viewEmployee.id === emp.id) {
                                setViewEmployee(updatedEmp);
                              }
                              return updatedEmp;
                            } else if (selectedRoleType === "Customer Success") {
                              const csInps = {
                                renewalTarget,
                                renewalActual,
                                renewalWeight,
                                retentionActual,
                                retentionWeight,
                                expansionTarget,
                                expansionActual,
                                expansionWeight,
                                healthActual,
                                healthWeight,
                                adoptionActual,
                                adoptionWeight,
                              };

                              const auditEntry: GradeAuditEntry = {
                                id: Date.now().toString(),
                                previousGrade: `Score: ${emp.performanceScore ?? 100}`,
                                newGrade: `Score: ${computedCustomerSuccessOverallScore}`,
                                policyResponsible: "Customer Success Formula Review",
                                dateOfChange: new Date()
                                  .toISOString()
                                  .split("T")[0],
                                approvingAuthority: "Admin / HR",
                                reason: `Customer Success Evaluation Formula - Renewal: ${computedRenewal.toFixed(1)} pts, Retention: ${computedRetention.toFixed(1)} pts, Expansion: ${computedExpansion.toFixed(1)} pts, Health: ${computedHealth.toFixed(1)} pts, Adoption: ${computedAdoption.toFixed(1)} pts. Conduct: ${csConductScore.toFixed(1)} pts. Performance Score: ${computedCustomerSuccessOverallScore}/100.`,
                              };

                              const updatedEmp = {
                                ...emp,
                                performanceScore: computedCustomerSuccessOverallScore,
                                customerSuccessInputs: csInps,
                                customerSuccessConductPoints: conductActualPoints,
                                gradeAuditTrail: [
                                  auditEntry,
                                  ...(emp.gradeAuditTrail || []),
                                ],
                              };

                              if (viewEmployee && viewEmployee.id === emp.id) {
                                setViewEmployee(updatedEmp);
                              }
                              return updatedEmp;
                            } else if (selectedRoleType === "Operations") {
                              const opInps = {
                                fulfillmentRate,
                                fulfillmentWeight,
                                accuracyRate,
                                accuracyWeight,
                                actualSavings,
                                targetSavings,
                                savingsWeight,
                                targetVariance,
                                actualVariance,
                                varianceWeight,
                                complianceDeductions,
                                complianceWeight,
                              };

                              const auditEntry: GradeAuditEntry = {
                                id: Date.now().toString(),
                                previousGrade: `Score: ${emp.performanceScore ?? 100}`,
                                newGrade: `Score: ${computedOperationsOverallScore}`,
                                policyResponsible: "Operations Formula Review",
                                dateOfChange: new Date()
                                  .toISOString()
                                  .split("T")[0],
                                approvingAuthority: "Admin / HR",
                                reason: `Operations Evaluation Formula - Fulfillment: ${computedFulfillment.toFixed(1)} pts, Accuracy: ${computedAccuracy.toFixed(1)} pts, Savings: ${computedSavings.toFixed(1)} pts, Variance: ${computedVariance.toFixed(1)} pts, Compliance: ${computedCompliance.toFixed(1)} pts. Conduct: ${operationsConductScore.toFixed(1)} pts. Performance Score: ${computedOperationsOverallScore}/100.`,
                              };

                              const updatedEmp = {
                                ...emp,
                                performanceScore: computedOperationsOverallScore,
                                operationsInputs: opInps,
                                operationsConductPoints: conductActualPoints,
                                gradeAuditTrail: [
                                  auditEntry,
                                  ...(emp.gradeAuditTrail || []),
                                ],
                              };

                              if (viewEmployee && viewEmployee.id === emp.id) {
                                setViewEmployee(updatedEmp);
                              }
                              return updatedEmp;
                            } else if (selectedRoleType === "Manager") {
                              const managerInps = {
                                teamTarget: managerTeamTarget,
                                actualTeamResult: managerActualTeamResult,
                                qualityPercent: managerQualityPercent,
                                compliancePercent: managerCompliancePercent,
                                reportingRating: managerReportingRating,
                                peopleManagementRating: managerPeopleManagementRating,
                                leadershipRating: managerLeadershipRating,
                              };

                              const auditEntry: GradeAuditEntry = {
                                id: Date.now().toString(),
                                previousGrade: `Score: ${emp.performanceScore ?? 100}`,
                                newGrade: `Score: ${computedManagerOverallScore}`,
                                policyResponsible: "Manager Formula Review",
                                dateOfChange: new Date()
                                  .toISOString()
                                  .split("T")[0],
                                approvingAuthority: "Admin / HR",
                                reason: isCumulativeManager
                                  ? `Cumulative Manager Evaluation Formula - Team Avg Performance: ${avgTeamPerf.toFixed(1)}% (Weighted: ${(avgTeamPerf * 0.8).toFixed(1)} pts). Conduct: ${managerConductScore.toFixed(1)} pts. Performance Score: ${computedManagerOverallScore}/100.`
                                  : `Manager Evaluation Formula - Team Achievement: ${computedTeamAchievement.toFixed(1)} pts, Quality: ${computedTeamQuality.toFixed(1)} pts, Compliance: ${computedTeamCompliance.toFixed(1)} pts, Reporting: ${computedReporting.toFixed(1)} pts, People Mgmt: ${computedPeopleMgmt.toFixed(1)} pts, Leadership: ${computedLeadership.toFixed(1)} pts. Conduct: ${managerConductScore.toFixed(1)} pts. Performance Score: ${computedManagerOverallScore}/100.`,
                              };

                              const updatedEmp = {
                                ...emp,
                                performanceScore: computedManagerOverallScore,
                                managerInputs: managerInps,
                                managerConductPoints: conductActualPoints,
                                gradeAuditTrail: [
                                  auditEntry,
                                  ...(emp.gradeAuditTrail || []),
                                ],
                              };

                              if (viewEmployee && viewEmployee.id === emp.id) {
                                setViewEmployee(updatedEmp);
                              }
                              return updatedEmp;
                            } else {
                              const parsedPoints = parseInt(
                                updatePointsFormVal,
                                10,
                              );
                              if (isNaN(parsedPoints)) {
                                alert("Please enter valid points.");
                                return emp;
                              }
                              if (!updatePointsFormReason.trim()) {
                                alert("Please enter a reason.");
                                return emp;
                              }

                              const isPerf = updatePointsFormType !== "reward";
                              const previousVal = isPerf
                                ? `Score: ${emp.performanceScore ?? 100}`
                                : `Points: ${emp.rewardPoints ?? 100}`;

                              let newScore = emp.performanceScore ?? 100;
                              let newPoints = emp.rewardPoints ?? 100;
                              let newVal = "";

                              if (isPerf) {
                                newScore = Math.max(
                                  0,
                                  Math.min(100, newScore + parsedPoints),
                                );
                                newVal = `Score: ${newScore}`;
                              } else {
                                newPoints = newPoints + parsedPoints;
                                newVal = `Points: ${newPoints}`;
                              }

                              const policyResponsible =
                                updatePointsFormType === "performance"
                                  ? "Policy Violation"
                                  : updatePointsFormType === "reward"
                                    ? "Reward Achievement"
                                    : updatePointsFormType;

                              const auditEntry: GradeAuditEntry = {
                                id: Date.now().toString(),
                                previousGrade: previousVal,
                                newGrade: newVal,
                                policyResponsible: policyResponsible,
                                dateOfChange: new Date()
                                  .toISOString()
                                  .split("T")[0],
                                approvingAuthority: "Admin / HR",
                                reason: `${updatePointsFormReason.trim()} (${parsedPoints > 0 ? "+" : ""}${parsedPoints} pts)`,
                              };

                              const updatedEmp = {
                                ...emp,
                                performanceScore: newScore,
                                rewardPoints: newPoints,
                                gradeAuditTrail: [
                                  auditEntry,
                                  ...(emp.gradeAuditTrail || []),
                                ],
                              };

                              if (viewEmployee && viewEmployee.id === emp.id) {
                                setViewEmployee(updatedEmp);
                              }
                              return updatedEmp;
                            }
                          }
                          return item;
                        });
                        let finalUpdated = updated;
                        if (reviewType === "monthly") {
                          finalUpdated = updated.map((item) => {
                            if (item.id === updatePointsFormUser) {
                              const newRecord = {
                                id: Math.random().toString(36).substring(2, 9),
                                year: weeklyYear,
                                month: weeklyMonth,
                                comments: weeklyComments.trim(),
                                dateCreated: new Date().toISOString().split("T")[0],
                                performanceScore: item.performanceScore ?? 100,
                                roleType: selectedRoleType,
                                conductPoints: item.operationsConductPoints || item.managerConductPoints || item.techSupportConductPoints || item.marketingConductPoints || item.salesConductPoints || item.customerSuccessConductPoints || { ...conductActualPoints },
                                inputs: item.operationsInputs || item.managerInputs || item.techSupportInputs || item.marketingInputs || item.salesInputs || item.customerSuccessInputs || {
                                  pointsChange: parseInt(updatePointsFormVal, 10) || 0,
                                  type: updatePointsFormType,
                                  reason: updatePointsFormReason.trim(),
                                },
                              };
                              // Auto reset weekly reviews history for this employee for this calculated month/period
                              const updatedWeeklyReviews = (item.weeklyReviews || []).filter(
                                (r: any) => !(String(r.year) === String(weeklyYear) && String(r.month) === String(weeklyMonth))
                              );
                              const updatedWithMonthly = {
                                ...item,
                                weeklyReviews: updatedWeeklyReviews,
                                monthlyReviews: [newRecord, ...(item.monthlyReviews || [])],
                              };
                              if (viewEmployee && viewEmployee.id === item.id) {
                                setViewEmployee(updatedWithMonthly);
                              }
                              return updatedWithMonthly;
                            }
                            return item;
                          });
                        }

                        localStorage.setItem(
                          "company_employees_data",
                          JSON.stringify(finalUpdated),
                        );
                        localStorage.setItem(
                          "company_employees_kpi_state",
                          JSON.stringify(finalUpdated),
                        );
                        return finalUpdated;
                      });

                      showSuccess("Successfully saved monthly performance review record.");
                      setIsUpdatePointsModalOpen(false);
                      resetWeeklyInputsAndLogs();
                    }}
                    className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white shadow-lg transition-all font-sans flex items-center justify-center gap-2 whitespace-nowrap ${
                      isSubmitDisabled
                        ? "bg-slate-300 cursor-not-allowed text-slate-500 shadow-none"
                        : "bg-[#02275A] hover:bg-[#0b3b82] active:scale-98 cursor-pointer shadow-[#02275A]/20"
                    }`}
                  >
                    <i className={`fas ${reviewType === "weekly" ? "fa-save" : "fa-check-circle"}`}></i>
                    <span>
                      {reviewType === "weekly"
                        ? "Save Record"
                        : (selectedRoleType === "Tech Support" ||
                          selectedRoleType === "Marketing" ||
                          selectedRoleType === "Sales" ||
                          selectedRoleType === "Customer Success" ||
                          selectedRoleType === "Operations" ||
                          selectedRoleType === "Manager"
                            ? "Apply Formula Calculation"
                            : `Apply ${isNaN(parseInt(updatePointsFormVal, 10)) ? 0 : parseInt(updatePointsFormVal, 10)} Points`)}
                    </span>
                  </button>
                </div>
              </div>
          </div>
          </div>
        );
      })()}
    </div>
  );
};

export default AdminHRCenterView;
