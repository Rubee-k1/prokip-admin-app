import React, { useState, useMemo } from 'react';
import {
    Employee,
    initialEmployees,
    calculateEmployeePerformanceBalance,
    calculateKPIContribution,
    getDefaultKPIs,
    normalizeEmployeesList,
    calculateGradeFromPerformance
} from './AdminHRCenterView';

interface WeeklyReportRow {
    employeeId: string;
    employeeCode: string;
    employeeName: string;
    department: string;
    week: string;
    month: string;
    year: string;
    quarter: string;
    performanceScore: number;
    ratingPoint: number;
    finalScore: number;
    reviewer: string;
    comments: string;
    reviewDate: string;
    rewards: number;
    netPoints: number;
}

interface MonthlyReportRow {
    employeeId: string;
    employeeCode: string;
    employeeName: string;
    department: string;
    month: string;
    year: string;
    quarter: string;
    monthlyScore: number;
    avgScore: number;
    finalGrade: string;
    ratingPoint: number;
    rewards: number;
    penalties: number;
    netPoints: number;
    comments: string;
    reviewer: string;
    reviewDate: string;
}

interface EmployeeHistoryViewProps {
    setView?: (view: string) => void;
    userRole?: string;
}

const EmployeeHistoryView: React.FC<EmployeeHistoryViewProps> = ({ setView, userRole }) => {
    const [selectedCategory, setSelectedCategory] = useState("All Categories");
    const [activeTableTab, setActiveTableTab] = useState<'performance' | 'net'>('performance');
    const [viewMode, setViewMode] = useState<'ledger' | 'reports'>('reports');
    const [expandedMonthlyRow, setExpandedMonthlyRow] = useState<number | null>(null);
    
    // Performance Reports specific filters
    const [repType, setRepType] = useState<'weekly' | 'monthly'>('weekly');
    const [repYear, setRepYear] = useState<string>('All');
    const [repMonth, setRepMonth] = useState<string>('All');
    const [repWeek, setRepWeek] = useState<string>('All');
    const [repQuarter, setRepQuarter] = useState<string>('All');
    const [repSearch, setRepSearch] = useState<string>('');
    const [showFilters, setShowFilters] = useState<boolean>(false);

    const employeesList = useMemo(() => {
        const saved = localStorage.getItem('company_employees_data');
        let loadedList: Employee[] = [];
        if (saved) {
            try {
                loadedList = JSON.parse(saved) as Employee[];
            } catch (e) {
                console.error(e);
            }
        }
        if (loadedList.length === 0) {
            loadedList = initialEmployees;
        }
        return normalizeEmployeesList(loadedList);
    }, []);

    const currentEmployee = useMemo(() => {
        let loggedInEmail = localStorage.getItem('logged_in_email') || 'employee@gmail.com';

        if (loggedInEmail === 'marketer@gmail.com' || loggedInEmail === 'marketer') {
            loggedInEmail = 'marketer@gmail.com';
        } else if (loggedInEmail === 'customersuccess@gmail.com') {
            loggedInEmail = 'customersuccess@gmail.com';
        } else if (loggedInEmail === 'callagent@gmail.com') {
            loggedInEmail = 'b.danladi@company.com';
        }

        const isTeamLead = userRole === 'team-lead' || ['cx-head', 'customer-success', 'sales-manager', 'marketing-manager', 'support-staff', 'finance', 'content-lead', 'engineering', 'engineer'].includes(userRole || '') || ['teamlead@gmail.com', 'cx@gmail.com', 'salesmanager@gmail.com', 'support@gmail.com', 'finance@gmail.com', 'marketing@gmail.com', 'content@gmail.com', 'customersuccess@gmail.com'].includes(loggedInEmail);
        if (userRole === 'call-agent' || loggedInEmail === 'callagent@gmail.com') {
            loggedInEmail = 'b.danladi@company.com';
        } else if (isTeamLead && !['marketing@gmail.com', 'support@gmail.com', 'customersuccess@gmail.com'].includes(loggedInEmail)) {
            loggedInEmail = 's.ojo@company.com';
        }

        const userEmp = employeesList.find(e => e.email === loggedInEmail);
        if (userEmp) return userEmp;
        const nonLeadEmp = employeesList.find(e => e.is_team_lead === false);
        if (nonLeadEmp) return nonLeadEmp;
        return employeesList[0] || null;
    }, [employeesList, userRole]);

    const isEngineer = useMemo(() => {
        if (!currentEmployee) return false;
        const roleLower = (currentEmployee.role || '').toLowerCase();
        const deptLower = (currentEmployee.department || '').toLowerCase();
        return roleLower.includes('engineer') || deptLower.includes('engineering');
    }, [currentEmployee]);

    const isCallAgent = useMemo(() => {
        if (!currentEmployee) return false;
        const roleLower = (currentEmployee.role || '').toLowerCase();
        return roleLower.includes('support representative') || roleLower.includes('call agent');
    }, [currentEmployee]);

    const isTechSupport = useMemo(() => {
        if (!currentEmployee) return false;
        if (isCallAgent || isEngineer) return false;
        const roleLower = (currentEmployee.role || '').toLowerCase();
        const deptLower = (currentEmployee.department || '').toLowerCase();
        return deptLower.includes("support") || roleLower.includes("support") || roleLower.includes("tech");
    }, [currentEmployee, isCallAgent, isEngineer]);

    const isCustomerSuccess = useMemo(() => {
        if (!currentEmployee) return false;
        if (isCallAgent || isEngineer) return false;
        const roleLower = (currentEmployee.role || '').toLowerCase();
        const deptLower = (currentEmployee.department || '').toLowerCase();
        const isLeadOrManager = roleLower.includes("manager") || roleLower.includes("lead") || currentEmployee.is_team_lead === true || roleLower.includes("head");
        if (isLeadOrManager) return false;
        return deptLower.includes("success") || roleLower.includes("success");
    }, [currentEmployee, isCallAgent, isEngineer]);

    const isMarketing = useMemo(() => {
        if (!currentEmployee) return false;
        if (isCallAgent || isEngineer) return false;
        const roleLower = (currentEmployee.role || '').toLowerCase();
        const deptLower = (currentEmployee.department || '').toLowerCase();
        const isLeadOrManager = roleLower.includes("manager") || roleLower.includes("lead") || currentEmployee.is_team_lead === true || roleLower.includes("head");
        if (isLeadOrManager) return false;
        return deptLower.includes("marketing") || roleLower.includes("marketing") || deptLower.includes("growth") || roleLower.includes("growth") || roleLower.includes("brand") || roleLower.includes("content");
    }, [currentEmployee, isCallAgent, isEngineer]);

    const isManagerLayout = useMemo(() => {
        if (!currentEmployee) return false;
        if (isEngineer) return false;
        const roleLower = (currentEmployee.role || '').toLowerCase();
        return currentEmployee.is_team_lead === true || roleLower.includes("manager") || roleLower.includes("lead") || roleLower.includes("head") || roleLower.includes("hr") || roleLower.includes("director");
    }, [currentEmployee, isEngineer]);

    const getTechSupportKPIs = (emp: any) => {
        const inputs = emp.techSupportInputs || {
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

        const roleScore = computedSla + computedResp + computedRes + computedCsat + computedReopen;

        const cp = emp.techSupportConductPoints || {};
        const c1 = cp.cwc1 !== undefined ? cp.cwc1 : 4.5;
        const c2 = cp.cwc2 !== undefined ? cp.cwc2 : 4.8;
        const c3 = cp.cwc3 !== undefined ? cp.cwc3 : 4.9;
        const c4 = cp.cwc4 !== undefined ? cp.cwc4 : 4.6;
        const conductScore = c1 + c2 + c3 + c4;

        const overall = Math.min(100, Math.max(0, Math.round((roleScore + conductScore) * 10) / 10));

        return { inputs, computedSla, computedResp, computedRes, computedCsat, computedReopen, c1, c2, c3, c4, roleScore, conductScore, overall };
    };

    const getCustomerSuccessKPIs = (emp: any) => {
        const inputs = emp.customerSuccessInputs || {
            renewalTarget: 500000,
            renewalActual: 475000,
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

        const roleScore = computedRenewal + computedRetention + computedExpansion + computedHealth + computedAdoption;

        const cp = emp.customerSuccessConductPoints || {};
        const c1 = cp.cwc1 !== undefined ? cp.cwc1 : 4.5;
        const c2 = cp.cwc2 !== undefined ? cp.cwc2 : 4.8;
        const c3 = cp.cwc3 !== undefined ? cp.cwc3 : 4.9;
        const c4 = cp.cwc4 !== undefined ? cp.cwc4 : 4.6;
        const conductScore = c1 + c2 + c3 + c4;

        const overall = Math.min(100, Math.max(0, Math.round((roleScore + conductScore) * 10) / 10));

        return { inputs, computedRenewal, computedRetention, computedExpansion, computedHealth, computedAdoption, c1, c2, c3, c4, roleScore, conductScore, overall };
    };

    const getMarketingKPIs = (emp: any) => {
        const inputs = emp.marketingInputs || {
            leadsGeneratedTarget: 500,
            leadsGeneratedActual: 480,
            leadsGeneratedWeight: 25,
            costPerLeadTarget: 5.0,
            costPerLeadActual: 4.5,
            costPerLeadWeight: 20,
            qualifiedLeadRateTarget: 40,
            qualifiedLeadRateActual: 38,
            qualifiedLeadRateWeight: 20,
            campaignConversionTarget: 5.0,
            campaignConversionActual: 4.8,
            campaignConversionWeight: 15
        };

        const computedLeads = inputs.leadsGeneratedTarget > 0 ? (inputs.leadsGeneratedActual / inputs.leadsGeneratedTarget) * inputs.leadsGeneratedWeight : 0;
        const computedCost = inputs.costPerLeadActual > 0 ? (inputs.costPerLeadTarget / inputs.costPerLeadActual) * inputs.costPerLeadWeight : 0;
        const computedQual = inputs.qualifiedLeadRateTarget > 0 ? (inputs.qualifiedLeadRateActual / inputs.qualifiedLeadRateTarget) * inputs.qualifiedLeadRateWeight : 0;
        const computedConv = inputs.campaignConversionTarget > 0 ? (inputs.campaignConversionActual / inputs.campaignConversionTarget) * inputs.campaignConversionWeight : 0;

        const roleScore = computedLeads + computedCost + computedQual + computedConv;

        const cp = emp.marketingConductPoints || {};
        const c1 = cp.cwc1 !== undefined ? cp.cwc1 : 4.5;
        const c2 = cp.cwc2 !== undefined ? cp.cwc2 : 4.8;
        const c3 = cp.cwc3 !== undefined ? cp.cwc3 : 4.9;
        const c4 = cp.cwc4 !== undefined ? cp.cwc4 : 4.6;
        const conductScore = c1 + c2 + c3 + c4;

        const overall = Math.min(100, Math.max(0, Math.round((roleScore + conductScore) * 10) / 10));

        return { inputs, computedLeads, computedCost, computedQual, computedConv, c1, c2, c3, c4, roleScore, conductScore, overall };
    };

    const getManagerKPIs = (emp: any) => {
        const inputs = emp.managerInputs || {
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

        const roleScore = computedTeamAchievement + computedTeamQuality + computedTeamCompliance + computedReporting + computedPeopleMgmt + computedLeadership;

        const cp = emp.managerConductPoints || {};
        const c1 = cp.cwc1 !== undefined ? cp.cwc1 : 4.5;
        const c2 = cp.cwc2 !== undefined ? cp.cwc2 : 4.8;
        const c3 = cp.cwc3 !== undefined ? cp.cwc3 : 4.9;
        const c4 = cp.cwc4 !== undefined ? cp.cwc4 : 4.6;
        const conductScore = c1 + c2 + c3 + c4;

        const overall = Math.min(100, Math.max(0, Math.round((roleScore + conductScore) * 10) / 10));

        return { inputs, computedTeamAchievement, computedTeamQuality, computedTeamCompliance, computedReporting, computedPeopleMgmt, computedLeadership, c1, c2, c3, c4, roleScore, conductScore, overall };
    };

    const ratingPointsSum = useMemo(() => {
        if (!currentEmployee || !currentEmployee.gradeAuditTrail) return 0;
        return currentEmployee.gradeAuditTrail.reduce((sum: number, entry: any) => sum + (entry.ratingPoints || 0), 0);
    }, [currentEmployee]);

    const perfScore = useMemo(() => {
        if (!currentEmployee) return 80;
        let baseScore = 80;
        if (isCallAgent) {
            baseScore = 83.1; // Calculated Sum of Sales KPIs (64.25) plus Conduct Score (18.8)
        } else if (isTechSupport) {
            const data = getTechSupportKPIs(currentEmployee);
            baseScore = data.overall;
        } else if (isCustomerSuccess) {
            const data = getCustomerSuccessKPIs(currentEmployee);
            baseScore = data.overall;
        } else if (isMarketing) {
            const data = getMarketingKPIs(currentEmployee);
            baseScore = data.overall;
        } else if (isManagerLayout) {
            const data = getManagerKPIs(currentEmployee);
            baseScore = data.overall;
        } else {
            baseScore = currentEmployee.kpis ? calculateEmployeePerformanceBalance(currentEmployee.kpis) : (currentEmployee.performanceScore !== undefined ? currentEmployee.performanceScore : 80);
        }
        return Math.min(100, Math.max(0, baseScore + ratingPointsSum));
    }, [currentEmployee, isCallAgent, isTechSupport, isCustomerSuccess, isMarketing, isManagerLayout, ratingPointsSum]);

    const rewardScore = useMemo(() => {
        if (!currentEmployee) return 10;
        return currentEmployee.rewardPoints !== undefined ? currentEmployee.rewardPoints : 100;
    }, [currentEmployee]);

    const callAgentRows = useMemo(() => {
        if (!currentEmployee) return [];
        
        const rows: any[] = [];
        
        // 1. Revenue Achieved - Sales Role KPI
        rows.push({
            metric: "Revenue Achieved",
            activityType: "Sales Role KPI (Max 35)",
            done: "₦850,000 (Target: ₦1,000,000)",
            left: "29.75 / 35.00 Pts",
            dateAdded: "Jun 22, 2026, 04:30 PM",
            typeAdded: "daily",
            notes: "Formula: (Actual: ₦850,000 / Target: ₦1,000,000) * Weight: 35 = 29.75 points earned.",
            addedBy: "Sales System Portal"
        });

        // 2. Deals Closed - Sales Role KPI
        rows.push({
            metric: "Deals Closed",
            activityType: "Sales Role KPI (Max 15)",
            done: "6 (Target: 8 deals)",
            left: "11.25 / 15.00 Pts",
            dateAdded: "Jun 21, 2026, 05:00 PM",
            typeAdded: "weekly",
            notes: "Formula: (Actual: 6 / Target: 8) * Weight: 15 = 11.25 points earned.",
            addedBy: "Sales Manager"
        });

        // 3. Conversion Rate % - Sales Role KPI
        rows.push({
            metric: "Conversion Rate",
            activityType: "Sales Role KPI (Max 15)",
            done: "15% (Target: 20%)",
            left: "11.25 / 15.00 Pts",
            dateAdded: "Jun 22, 2026, 05:00 PM",
            typeAdded: "daily",
            notes: "Formula: (Actual: 15 / Target: 20) * Weight: 15 = 11.25 points earned.",
            addedBy: "Sales Manager"
        });

        // 4. Collections Achieved - Sales Role KPI
        rows.push({
            metric: "Collections Achieved",
            activityType: "Sales Role KPI (Max 15)",
            done: "₦400,000 (Target: ₦500,000)",
            left: "12.00 / 15.00 Pts",
            dateAdded: "Jun 22, 2026, 06:00 PM",
            typeAdded: "daily",
            notes: "Formula: (Actual: ₦400,000 / Target: ₦500,000) * Weight: 15 = 12.00 points earned.",
            addedBy: "Sales System Portal"
        });

        // 5. Corporate Conduct: Punctuality - Sales Conduct KPI
        rows.push({
            metric: "Corporate Conduct: Punctuality",
            activityType: "Conduct (Max 5)",
            done: "4.5 / 5.0",
            left: "4.50 / 5.00 Pts",
            dateAdded: "Jun 20, 2026, 09:00 AM",
            typeAdded: "weekly",
            notes: "Conduct Standard Appraisal. Regular morning sign-ins and prompt attendance.",
            addedBy: "Sales Manager"
        });

        // 6. Corporate Conduct: Collaboration - Sales Conduct KPI
        rows.push({
            metric: "Corporate Conduct: Collaboration",
            activityType: "Conduct (Max 5)",
            done: "4.8 / 5.0",
            left: "4.80 / 5.00 Pts",
            dateAdded: "Jun 20, 2026, 11:00 AM",
            typeAdded: "weekly",
            notes: "Conduct Standard Appraisal. Willingness to support peers and share knowledge.",
            addedBy: "Sales Manager"
        });

        // 7. Corporate Conduct: Communication - Sales Conduct KPI
        rows.push({
            metric: "Corporate Conduct: Communication",
            activityType: "Conduct (Max 5)",
            done: "4.9 / 5.0",
            left: "4.90 / 5.00 Pts",
            dateAdded: "Jun 20, 2026, 02:00 PM",
            typeAdded: "weekly",
            notes: "Conduct Standard Appraisal. Polite etiquette and response speed on updates.",
            addedBy: "Sales Manager"
        });

        // 8. Corporate Conduct: Compliance - Sales Conduct KPI
        rows.push({
            metric: "Corporate Conduct: Compliance",
            activityType: "Conduct (Max 5)",
            done: "4.6 / 5.0",
            left: "4.60 / 5.00 Pts",
            dateAdded: "Jun 19, 2026, 05:00 PM",
            typeAdded: "weekly",
            notes: "Conduct Standard Appraisal. Accurate timesheets submission and guidelines adherence.",
            addedBy: "HR Manager"
        });

        // 9. Reward points balance
        rows.push({
            metric: "Reward points balance",
            activityType: "Reward",
            done: `${rewardScore} pts`,
            left: "—",
            dateAdded: "Jun 22, 2026, 03:00 PM",
            typeAdded: "daily",
            notes: "Consolidated performance bonus reward points",
            addedBy: "HR Manager"
        });

        // 10. Current Grade Level
        rows.push({
            metric: "Current Grade Level",
            activityType: "Evaluation",
            done: currentEmployee.grade || "C",
            left: "A+ Target",
            dateAdded: "Jun 15, 2026, 12:00 PM",
            typeAdded: "monthly",
            notes: "Mid-quarter supervisor validation and evaluation (Calculated overall: 83.1%).",
            addedBy: "HR Manager"
        });

        return rows;
    }, [currentEmployee, rewardScore]);

    const rawRoleTableRows = useMemo(() => {
        if (!currentEmployee) return [];

        if (isCallAgent) {
            return callAgentRows;
        }

        if (isTechSupport) {
            const data = getTechSupportKPIs(currentEmployee);
            const { inputs, computedSla, computedResp, computedRes, computedCsat, computedReopen, c1, c2, c3, c4, overall } = data;
            const rows: any[] = [];

            // 1. SLA Tickets Resolved
            rows.push({
                metric: "SLA Tickets Resolved",
                activityType: `Support Role KPI (Max ${inputs.slaWeight})`,
                done: `${inputs.slaTickets} (Target: ${inputs.totalTickets} tickets)`,
                left: `${computedSla.toFixed(2)} / ${inputs.slaWeight.toFixed(2)} Pts`,
                dateAdded: "Jun 22, 2026, 04:30 PM",
                typeAdded: "daily",
                notes: `Formula: (Actual SLA Resolved: ${inputs.slaTickets} / Total Tickets: ${inputs.totalTickets}) * Weight: ${inputs.slaWeight} = ${computedSla.toFixed(2)} points earned.`,
                addedBy: "Ticketing System"
            });

            // 2. First Response Time (FRT)
            rows.push({
                metric: "First Response Time (FRT)",
                activityType: `Support Role KPI (Max ${inputs.firstResponseWeight})`,
                done: `${inputs.actualResponseTime}m (Target: ${inputs.targetResponseTime}m)`,
                left: `${computedResp.toFixed(2)} / ${inputs.firstResponseWeight.toFixed(2)} Pts`,
                dateAdded: "Jun 21, 2026, 05:00 PM",
                typeAdded: "weekly",
                notes: `Formula: (Target FRT: ${inputs.targetResponseTime}m / Actual FRT: ${inputs.actualResponseTime}m) * Weight: ${inputs.firstResponseWeight} = ${computedResp.toFixed(2)} points earned.`,
                addedBy: "Support Manager"
            });

            // 3. Resolution Rate %
            rows.push({
                metric: "Ticket Resolution Rate",
                activityType: `Support Role KPI (Max ${inputs.resolutionWeight})`,
                done: `${inputs.resolvedTickets} (Target: ${inputs.assignedTickets} resolved)`,
                left: `${computedRes.toFixed(2)} / ${inputs.resolutionWeight.toFixed(2)} Pts`,
                dateAdded: "Jun 22, 2026, 05:00 PM",
                typeAdded: "daily",
                notes: `Formula: (Actual Resolved: ${inputs.resolvedTickets} / Assigned: ${inputs.assignedTickets}) * Weight: ${inputs.resolutionWeight} = ${computedRes.toFixed(2)} points earned.`,
                addedBy: "Support Manager"
            });

            // 4. Customer Satisfaction (CSAT)
            rows.push({
                metric: "Customer Satisfaction (CSAT)",
                activityType: `Support Role KPI (Max ${inputs.csatWeight})`,
                done: `${inputs.customerSatisfaction}%`,
                left: `${computedCsat.toFixed(2)} / ${inputs.csatWeight.toFixed(2)} Pts`,
                dateAdded: "Jun 22, 2026, 06:00 PM",
                typeAdded: "daily",
                notes: `Formula: (Actual CSAT: ${inputs.customerSatisfaction}% / 100) * Weight: ${inputs.csatWeight} = ${computedCsat.toFixed(2)} points earned.`,
                addedBy: "CSAT Feedback Bot"
            });

            // 5. Ticket Reopen Rate
            rows.push({
                metric: "Ticket Reopen Rate",
                activityType: `Support Role KPI (Max ${inputs.reopenWeight})`,
                done: `${inputs.actualReopenRate}% (Target: ${inputs.targetReopenRate}%)`,
                left: `${computedReopen.toFixed(2)} / ${inputs.reopenWeight.toFixed(2)} Pts`,
                dateAdded: "Jun 22, 2026, 06:00 PM",
                typeAdded: "daily",
                notes: `Formula: (Target Reopen Rate: ${inputs.targetReopenRate}% / Actual Reopen Rate: ${inputs.actualReopenRate}%) * Weight: ${inputs.reopenWeight} = ${computedReopen.toFixed(2)} points earned.`,
                addedBy: "Quality QA Team"
            });

            // 6. Corporate Conduct: Punctuality
            rows.push({
                metric: "Corporate Conduct: Punctuality",
                activityType: "Conduct (Max 5)",
                done: `${c1.toFixed(1)} / 5.0`,
                left: `${c1.toFixed(2)} / 5.00 Pts`,
                dateAdded: "Jun 20, 2026, 09:00 AM",
                typeAdded: "weekly",
                notes: "Conduct Standard Appraisal. Regular morning sign-ins and prompt attendance.",
                addedBy: "Operations Coordinator"
            });

            // 7. Corporate Conduct: Collaboration
            rows.push({
                metric: "Corporate Conduct: Collaboration",
                activityType: "Conduct (Max 5)",
                done: `${c2.toFixed(1)} / 5.0`,
                left: `${c2.toFixed(2)} / 5.00 Pts`,
                dateAdded: "Jun 20, 2026, 11:00 AM",
                typeAdded: "weekly",
                notes: "Conduct Standard Appraisal. Willingness to support peers and share knowledge.",
                addedBy: "Support Team Lead"
            });

            // 8. Corporate Conduct: Communication
            rows.push({
                metric: "Corporate Conduct: Communication",
                activityType: "Conduct (Max 5)",
                done: `${c3.toFixed(1)} / 5.0`,
                left: `${c3.toFixed(2)} / 5.00 Pts`,
                dateAdded: "Jun 20, 2026, 02:00 PM",
                typeAdded: "weekly",
                notes: "Conduct Standard Appraisal. Polite etiquette and response speed on updates.",
                addedBy: "Support Team Lead"
            });

            // 9. Corporate Conduct: Compliance
            rows.push({
                metric: "Corporate Conduct: Compliance",
                activityType: "Conduct (Max 5)",
                done: `${c4.toFixed(1)} / 5.0`,
                left: `${c4.toFixed(2)} / 5.00 Pts`,
                dateAdded: "Jun 19, 2026, 05:00 PM",
                typeAdded: "weekly",
                notes: "Conduct Standard Appraisal. Accurate timesheets submission and guidelines adherence.",
                addedBy: "HR Manager"
            });

            // 10. Reward points balance
            rows.push({
                metric: "Reward points balance",
                activityType: "Reward",
                done: `${rewardScore} pts`,
                left: "—",
                dateAdded: "Jun 22, 2026, 03:00 PM",
                typeAdded: "daily",
                notes: "Consolidated performance bonus reward points",
                addedBy: "HR Manager"
            });

            // 11. Current Grade Level
            rows.push({
                metric: "Current Grade Level",
                activityType: "Evaluation",
                done: currentEmployee.grade || "C",
                left: "A+ Target",
                dateAdded: "Jun 15, 2026, 12:00 PM",
                typeAdded: "monthly",
                notes: `Mid-quarter supervisor validation and evaluation (Calculated overall: ${overall}%).`,
                addedBy: "HR Manager"
            });

            return rows;
        }

        if (isCustomerSuccess) {
            const data = getCustomerSuccessKPIs(currentEmployee);
            const { inputs, computedRenewal, computedRetention, computedExpansion, computedHealth, computedAdoption, c1, c2, c3, c4, overall } = data;
            const rows: any[] = [];

            // 1. Account Renewal Rate
            rows.push({
                metric: "Contract Renewal Achievement",
                activityType: `CS Role KPI (Max ${inputs.renewalWeight})`,
                done: `₦${inputs.renewalActual.toLocaleString()} (Target: ₦${inputs.renewalTarget.toLocaleString()})`,
                left: `${computedRenewal.toFixed(2)} / ${inputs.renewalWeight.toFixed(2)} Pts`,
                dateAdded: "Jun 22, 2026, 04:30 PM",
                typeAdded: "daily",
                notes: `Formula: (Actual Renewal: ₦${inputs.renewalActual.toLocaleString()} / Target: ₦${inputs.renewalTarget.toLocaleString()}) * Weight: ${inputs.renewalWeight} = ${computedRenewal.toFixed(2)} points earned.`,
                addedBy: "Accounts System"
            });

            // 2. Client Retention Rate
            rows.push({
                metric: "Client Retention Rate",
                activityType: `CS Role KPI (Max ${inputs.retentionWeight})`,
                done: `${inputs.retentionActual}%`,
                left: `${computedRetention.toFixed(2)} / ${inputs.retentionWeight.toFixed(2)} Pts`,
                dateAdded: "Jun 21, 2026, 05:00 PM",
                typeAdded: "weekly",
                notes: `Formula: (Actual Retention: ${inputs.retentionActual}% / 100) * Weight: ${inputs.retentionWeight} = ${computedRetention.toFixed(2)} points earned.`,
                addedBy: "CS Manager"
            });

            // 3. Renewal Expansion Target
            rows.push({
                metric: "Contract Expansion Volume",
                activityType: `CS Role KPI (Max ${inputs.expansionWeight})`,
                done: `₦${(inputs.expansionActual || 85000).toLocaleString()} (Target: ₦${(inputs.expansionTarget || 100000).toLocaleString()})`,
                left: `${computedExpansion.toFixed(2)} / ${inputs.expansionWeight.toFixed(2)} Pts`,
                dateAdded: "Jun 22, 2026, 05:00 PM",
                typeAdded: "daily",
                notes: `Formula: (Actual Expansion: ₦${(inputs.expansionActual || 85000).toLocaleString()} / Target: ₦${(inputs.expansionTarget || 100000).toLocaleString()}) * Weight: ${inputs.expansionWeight} = ${computedExpansion.toFixed(2)} points earned.`,
                addedBy: "Sales System Portal"
            });

            // 4. Overall Portfolio Client Health
            rows.push({
                metric: "Client Health Scoring",
                activityType: `CS Role KPI (Max ${inputs.healthWeight})`,
                done: `${inputs.healthActual}%`,
                left: `${computedHealth.toFixed(2)} / ${inputs.healthWeight.toFixed(2)} Pts`,
                dateAdded: "Jun 22, 2026, 06:00 PM",
                typeAdded: "daily",
                notes: `Formula: (Actual Portfolio Client Health: ${inputs.healthActual}% / 100) * Weight: ${inputs.healthWeight} = ${computedHealth.toFixed(2)} points earned.`,
                addedBy: "Client Health Index Tool"
            });

            // 5. Product Adoption Rate
            rows.push({
                metric: "Product Adoption Rate",
                activityType: `CS Role KPI (Max ${inputs.adoptionWeight})`,
                done: `${inputs.adoptionActual}%`,
                left: `${computedAdoption.toFixed(2)} / ${inputs.adoptionWeight.toFixed(2)} Pts`,
                dateAdded: "Jun 22, 2026, 06:00 PM",
                typeAdded: "daily",
                notes: `Formula: (Actual Product Adoption: ${inputs.adoptionActual}% / 100) * Weight: ${inputs.adoptionWeight} = ${computedAdoption.toFixed(2)} points earned.`,
                addedBy: "Product Analytics Board"
            });

            // 6. Corporate Conduct: Punctuality
            rows.push({
                metric: "Corporate Conduct: Punctuality",
                activityType: "Conduct (Max 5)",
                done: `${c1.toFixed(1)} / 5.0`,
                left: `${c1.toFixed(2)} / 5.00 Pts`,
                dateAdded: "Jun 20, 2026, 09:00 AM",
                typeAdded: "weekly",
                notes: "Conduct Standard Appraisal. Regular morning sign-ins and prompt attendance.",
                addedBy: "Operations Coordinator"
            });

            // 7. Corporate Conduct: Collaboration
            rows.push({
                metric: "Corporate Conduct: Collaboration",
                activityType: "Conduct (Max 5)",
                done: `${c2.toFixed(1)} / 5.0`,
                left: `${c2.toFixed(2)} / 5.00 Pts`,
                dateAdded: "Jun 20, 2026, 11:00 AM",
                typeAdded: "weekly",
                notes: "Conduct Standard Appraisal. Willingness to support peers and share knowledge.",
                addedBy: "CS Manager"
            });

            // 8. Corporate Conduct: Communication
            rows.push({
                metric: "Corporate Conduct: Communication",
                activityType: "Conduct (Max 5)",
                done: `${c3.toFixed(1)} / 5.0`,
                left: `${c3.toFixed(2)} / 5.00 Pts`,
                dateAdded: "Jun 20, 2026, 02:00 PM",
                typeAdded: "weekly",
                notes: "Conduct Standard Appraisal. Polite etiquette and response speed on updates.",
                addedBy: "CS Manager"
            });

            // 9. Corporate Conduct: Compliance
            rows.push({
                metric: "Corporate Conduct: Compliance",
                activityType: "Conduct (Max 5)",
                done: `${c4.toFixed(1)} / 5.0`,
                left: `${c4.toFixed(2)} / 5.00 Pts`,
                dateAdded: "Jun 19, 2026, 05:00 PM",
                typeAdded: "weekly",
                notes: "Conduct Standard Appraisal. Accurate timesheets submission and guidelines adherence.",
                addedBy: "HR Manager"
            });

            // 10. Reward points balance
            rows.push({
                metric: "Reward points balance",
                activityType: "Reward",
                done: `${rewardScore} pts`,
                left: "—",
                dateAdded: "Jun 22, 2026, 03:00 PM",
                typeAdded: "daily",
                notes: "Consolidated performance bonus reward points",
                addedBy: "HR Manager"
            });

            // 11. Current Grade Level
            rows.push({
                metric: "Current Grade Level",
                activityType: "Evaluation",
                done: currentEmployee.grade || "C",
                left: "A+ Target",
                dateAdded: "Jun 15, 2026, 12:00 PM",
                typeAdded: "monthly",
                notes: `Mid-quarter supervisor validation and evaluation (Calculated overall: ${overall}%).`,
                addedBy: "HR Manager"
            });

            return rows;
        }

        if (isMarketing) {
            const data = getMarketingKPIs(currentEmployee);
            const { inputs, computedLeads, computedCost, computedQual, computedConv, c1, c2, c3, c4, overall } = data;
            const rows: any[] = [];

            // 1. Leads Generated
            rows.push({
                metric: "MQL Leads Generated",
                activityType: `Marketing KPI (Max ${inputs.leadsGeneratedWeight})`,
                done: `${inputs.leadsGeneratedActual} (Target: ${inputs.leadsGeneratedTarget} leads)`,
                left: `${computedLeads.toFixed(2)} / ${inputs.leadsGeneratedWeight.toFixed(2)} Pts`,
                dateAdded: "Jun 22, 2026, 04:30 PM",
                typeAdded: "daily",
                notes: `Formula: (Actual Leads: ${inputs.leadsGeneratedActual} / Target Leads: ${inputs.leadsGeneratedTarget}) * Weight: ${inputs.leadsGeneratedWeight} = ${computedLeads.toFixed(2)} points earned.`,
                addedBy: "Marketing Hubspot CRM"
            });

            // 2. Cost Per Lead (CPL)
            rows.push({
                metric: "Cost Per Lead (CPL) Target",
                activityType: `Marketing KPI (Max ${inputs.costPerLeadWeight})`,
                done: `$${inputs.costPerLeadActual} (Target: $${inputs.costPerLeadTarget})`,
                left: `${computedCost.toFixed(2)} / ${inputs.costPerLeadWeight.toFixed(2)} Pts`,
                dateAdded: "Jun 21, 2026, 05:00 PM",
                typeAdded: "weekly",
                notes: `Formula: (Target CPL: $${inputs.costPerLeadTarget} / Actual CPL: $${inputs.costPerLeadActual}) * Weight: ${inputs.costPerLeadWeight} = ${computedCost.toFixed(2)} points earned.`,
                addedBy: "Marketing Systems"
            });

            // 3. Qualified Lead Rate %
            rows.push({
                metric: "Qualified Lead Rate %",
                activityType: `Marketing KPI (Max ${inputs.qualifiedLeadRateWeight})`,
                done: `${inputs.qualifiedLeadRateActual}% (Target: ${inputs.qualifiedLeadRateTarget}%)`,
                left: `${computedQual.toFixed(2)} / ${inputs.qualifiedLeadRateWeight.toFixed(2)} Pts`,
                dateAdded: "Jun 22, 2026, 05:00 PM",
                typeAdded: "daily",
                notes: `Formula: (Actual Rate: ${inputs.qualifiedLeadRateActual}% / Target Rate: ${inputs.qualifiedLeadRateTarget}%) * Weight: ${inputs.qualifiedLeadRateWeight} = ${computedQual.toFixed(2)} points earned.`,
                addedBy: "Marketing Manager"
            });

            // 4. Campaign Conversion %
            rows.push({
                metric: "Campaign Conversion %",
                activityType: `Marketing KPI (Max ${inputs.campaignConversionWeight})`,
                done: `${inputs.campaignConversionActual}% (Target: ${inputs.campaignConversionTarget}%)`,
                left: `${computedConv.toFixed(2)} / ${inputs.campaignConversionWeight.toFixed(2)} Pts`,
                dateAdded: "Jun 22, 2026, 06:00 PM",
                typeAdded: "daily",
                notes: `Formula: (Campaign Conversion Actual: ${inputs.campaignConversionActual}% / Conversion Target: ${inputs.campaignConversionTarget}%) * Weight: ${inputs.campaignConversionWeight} = ${computedConv.toFixed(2)} points earned.`,
                addedBy: "CRM Systems Tracker"
            });

            // 5. Corporate Conduct: Punctuality
            rows.push({
                metric: "Corporate Conduct: Punctuality",
                activityType: "Conduct (Max 5)",
                done: `${c1.toFixed(1)} / 5.0`,
                left: `${c1.toFixed(2)} / 5.00 Pts`,
                dateAdded: "Jun 20, 2026, 09:00 AM",
                typeAdded: "weekly",
                notes: "Conduct Standard Appraisal. Regular morning sign-ins and prompt attendance.",
                addedBy: "Operations Coordinator"
            });

            // 6. Corporate Conduct: Collaboration
            rows.push({
                metric: "Corporate Conduct: Collaboration",
                activityType: "Conduct (Max 5)",
                done: `${c2.toFixed(1)} / 5.0`,
                left: `${c2.toFixed(2)} / 5.00 Pts`,
                dateAdded: "Jun 20, 2026, 11:00 AM",
                typeAdded: "weekly",
                notes: "Conduct Standard Appraisal. Willingness to support peers and share knowledge.",
                addedBy: "Marketing Director"
            });

            // 7. Corporate Conduct: Communication
            rows.push({
                metric: "Corporate Conduct: Communication",
                activityType: "Conduct (Max 5)",
                done: `${c3.toFixed(1)} / 5.0`,
                left: `${c3.toFixed(2)} / 5.00 Pts`,
                dateAdded: "Jun 20, 2026, 02:00 PM",
                typeAdded: "weekly",
                notes: "Conduct Standard Appraisal. Polite etiquette and response speed on updates.",
                addedBy: "Marketing Director"
            });

            // 8. Corporate Conduct: Compliance
            rows.push({
                metric: "Corporate Conduct: Compliance",
                activityType: "Conduct (Max 5)",
                done: `${c4.toFixed(1)} / 5.0`,
                left: `${c4.toFixed(2)} / 5.00 Pts`,
                dateAdded: "Jun 19, 2026, 05:00 PM",
                typeAdded: "weekly",
                notes: "Conduct Standard Appraisal. Accurate timesheets submission and guidelines adherence.",
                addedBy: "HR Manager"
            });

            // 9. Reward points balance
            rows.push({
                metric: "Reward points balance",
                activityType: "Reward",
                done: `${rewardScore} pts`,
                left: "—",
                dateAdded: "Jun 22, 2026, 03:00 PM",
                typeAdded: "daily",
                notes: "Consolidated performance bonus reward points",
                addedBy: "HR Manager"
            });

            // 10. Current Grade Level
            rows.push({
                metric: "Current Grade Level",
                activityType: "Evaluation",
                done: currentEmployee.grade || "C",
                left: "A+ Target",
                dateAdded: "Jun 15, 2026, 12:00 PM",
                typeAdded: "monthly",
                notes: `Mid-quarter supervisor validation and evaluation (Calculated overall: ${overall}%).`,
                addedBy: "HR Manager"
            });

            return rows;
        }

        if (isManagerLayout) {
            const data = getManagerKPIs(currentEmployee);
            const { inputs, computedTeamAchievement, computedTeamQuality, computedTeamCompliance, computedReporting, computedPeopleMgmt, computedLeadership, c1, c2, c3, c4, overall } = data;
            const rows: any[] = [];

            // 1. Team Target Achievement
            rows.push({
                metric: "Team Target Volume Achievement",
                activityType: `Manager KPI (Max 30)`,
                done: `₦${inputs.actualTeamResult.toLocaleString()} (Target: ₦${inputs.teamTarget.toLocaleString()})`,
                left: `${computedTeamAchievement.toFixed(2)} / 30.00 Pts`,
                dateAdded: "Jun 22, 2026, 04:30 PM",
                typeAdded: "daily",
                notes: `Formula: (Actual Team Result: ₦${inputs.actualTeamResult.toLocaleString()} / Team Target: ₦${inputs.teamTarget.toLocaleString()}) * Weight: 30 = ${computedTeamAchievement.toFixed(2)} points earned.`,
                addedBy: "Executive Committee"
            });

            // 2. Team Quality SLA Achievement %
            rows.push({
                metric: "Team Quality SLA %",
                activityType: `Manager KPI (Max 15)`,
                done: `${inputs.qualityPercent}%`,
                left: `${computedTeamQuality.toFixed(2)} / 15.00 Pts`,
                dateAdded: "Jun 21, 2026, 05:00 PM",
                typeAdded: "weekly",
                notes: `Formula: (Team Quality Score: ${inputs.qualityPercent}% / 100) * Weight: 15 = ${computedTeamQuality.toFixed(2)} points earned.`,
                addedBy: "QA Lead"
            });

            // 3. Team Policy Compliance Adherence %
            rows.push({
                metric: "Team Compliance Adherence",
                activityType: `Manager KPI (Max 10)`,
                done: `${inputs.compliancePercent}%`,
                left: `${computedTeamCompliance.toFixed(2)} / 10.00 Pts`,
                dateAdded: "Jun 22, 2026, 05:30 PM",
                typeAdded: "daily",
                notes: `Formula: (Team Compliance Adherence Score: ${inputs.compliancePercent}% / 100) * Weight: 10 = ${computedTeamCompliance.toFixed(2)} points earned.`,
                addedBy: "Compliance Head"
            });

            // 4. Reporting Rating
            rows.push({
                metric: "Management Reporting Rating",
                activityType: `Manager KPI (Max 10)`,
                done: `${inputs.reportingRating} / 5.0★`,
                left: `${computedReporting.toFixed(2)} / 10.00 Pts`,
                dateAdded: "Jun 22, 2026, 06:00 PM",
                typeAdded: "daily",
                notes: `Formula: (Actual Rating: ${inputs.reportingRating} / 5.0) * Weight: 10 = ${computedReporting.toFixed(2)} points earned.`,
                addedBy: "Executive Committee"
            });

            // 5. People Management Rating
            rows.push({
                metric: "People & Talent Management Rating",
                activityType: `Manager KPI (Max 10)`,
                done: `${inputs.peopleManagementRating} / 5.0★`,
                left: `${computedPeopleMgmt.toFixed(2)} / 10.00 Pts`,
                dateAdded: "Jun 22, 2026, 06:15 PM",
                typeAdded: "daily",
                notes: `Formula: (Actual Rating: ${inputs.peopleManagementRating} / 5.0) * Weight: 10 = ${computedPeopleMgmt.toFixed(2)} points earned.`,
                addedBy: "HR Director"
            });

            // 6. Leadership Rating
            rows.push({
                metric: "Leadership & Strategy Alignment Rating",
                activityType: `Manager KPI (Max 5)`,
                done: `${inputs.leadershipRating} / 5.0★`,
                left: `${computedLeadership.toFixed(2)} / 5.00 Pts`,
                dateAdded: "Jun 22, 2026, 06:30 PM",
                typeAdded: "daily",
                notes: `Formula: (Actual Rating: ${inputs.leadershipRating} / 5.0) * Weight: 5 = ${computedLeadership.toFixed(2)} points earned.`,
                addedBy: "CEO Office"
            });

            // 7. Corporate Conduct: Punctuality
            rows.push({
                metric: "Corporate Conduct: Punctuality",
                activityType: "Conduct (Max 5)",
                done: `${c1.toFixed(1)} / 5.0`,
                left: `${c1.toFixed(2)} / 5.00 Pts`,
                dateAdded: "Jun 20, 2026, 09:00 AM",
                typeAdded: "weekly",
                notes: "Conduct Standard Appraisal. Regular morning sign-ins and prompt attendance.",
                addedBy: "Operations Coordinator"
            });

            // 8. Corporate Conduct: Collaboration
            rows.push({
                metric: "Corporate Conduct: Collaboration",
                activityType: "Conduct (Max 5)",
                done: `${c2.toFixed(1)} / 5.0`,
                left: `${c2.toFixed(2)} / 5.00 Pts`,
                dateAdded: "Jun 20, 2026, 11:00 AM",
                typeAdded: "weekly",
                notes: "Conduct Standard Appraisal. Willingness to support peers and share knowledge.",
                addedBy: "HR Manager"
            });

            // 9. Corporate Conduct: Communication
            rows.push({
                metric: "Corporate Conduct: Communication",
                activityType: "Conduct (Max 5)",
                done: `${c3.toFixed(1)} / 5.0`,
                left: `${c3.toFixed(2)} / 5.00 Pts`,
                dateAdded: "Jun 20, 2026, 02:00 PM",
                typeAdded: "weekly",
                notes: "Conduct Standard Appraisal. Polite etiquette and response speed on updates.",
                addedBy: "HR Manager"
            });

            // 10. Corporate Conduct: Compliance
            rows.push({
                metric: "Corporate Conduct: Compliance",
                activityType: "Conduct (Max 5)",
                done: `${c4.toFixed(1)} / 5.0`,
                left: `${c4.toFixed(2)} / 5.00 Pts`,
                dateAdded: "Jun 19, 2026, 05:00 PM",
                typeAdded: "weekly",
                notes: "Conduct Standard Appraisal. Accurate timesheets submission and guidelines adherence.",
                addedBy: "HR Manager"
            });

            // 11. Reward points balance
            rows.push({
                metric: "Reward points balance",
                activityType: "Reward",
                done: `${rewardScore} pts`,
                left: "—",
                dateAdded: "Jun 22, 2026, 03:00 PM",
                typeAdded: "daily",
                notes: "Consolidated performance bonus reward points",
                addedBy: "HR Manager"
            });

            // 12. Current Grade Level
            rows.push({
                metric: "Current Grade Level",
                activityType: "Evaluation",
                done: currentEmployee.grade || "C",
                left: "A+ Target",
                dateAdded: "Jun 15, 2026, 12:00 PM",
                typeAdded: "monthly",
                notes: `Mid-quarter supervisor validation and evaluation (Calculated overall: ${overall}%).`,
                addedBy: "HR Manager"
            });

            return rows;
        }

        // Try dynamically building rows based on the employee's defined KPI template
        if (currentEmployee.kpis && currentEmployee.kpis.length > 0) {
            const rows: any[] = [];
            
            let roleLabel = "Role";
            if (isTechSupport) roleLabel = "Support";
            else if (isCustomerSuccess) roleLabel = "CS";
            else if (isMarketing) roleLabel = "Marketing";
            else if (isManagerLayout) roleLabel = "Manager";

            currentEmployee.kpis.forEach((kpi: any, idx: number) => {
                const kpiNameLower = (kpi.name || "").toLowerCase();
                const isConduct = kpiNameLower.includes("punctuality") || 
                    kpiNameLower.includes("team player") || 
                    kpiNameLower.includes("collaboration") || 
                    kpiNameLower.includes("communication") || 
                    kpiNameLower.includes("compliance") || 
                    (kpi.id && (kpi.id.includes("core") || kpi.id.includes("cc")));

                const contribution = calculateKPIContribution(kpi);
                const roundedContribution = Math.round(contribution * 100) / 100;

                const activityType = isConduct 
                    ? `Conduct (Max ${kpi.weight})` 
                    : `${roleLabel} Role KPI (Max ${kpi.weight})`;

                let doneStr = "";
                if (kpi.type === "Percentage") {
                    doneStr = `${kpi.currentValue}% (Target: ${kpi.targetValue}%)`;
                } else if (kpi.type === "Target-Based" || kpi.type === "Deductive") {
                    const unitStr = kpi.unit || "";
                    if (unitStr === "₦" || unitStr === "$") {
                        doneStr = `${unitStr}${kpi.currentValue.toLocaleString()} (Target: ${unitStr}${kpi.targetValue.toLocaleString()})`;
                    } else {
                        doneStr = `${kpi.currentValue}${unitStr ? " " + unitStr : ""} (Target: ${kpi.targetValue}${unitStr ? " " + unitStr : ""})`;
                    }
                } else if (kpi.type === "Binary") {
                    doneStr = kpi.currentValue > 0 ? "Yes" : "No";
                } else if (kpi.type === "Rating" || kpi.type === "Stars") {
                    doneStr = `${kpi.currentValue} / ${kpi.targetValue || 5.0}★`;
                } else if (kpiNameLower.includes("rating") || kpiNameLower.includes("stars")) {
                    doneStr = `${kpi.currentValue} / ${kpi.targetValue || 5.0}★`;
                } else {
                    doneStr = `${kpi.currentValue} (Target: ${kpi.targetValue})`;
                }

                let notesStr = "";
                if (kpi.type === "Percentage") {
                    notesStr = `Formula: (Actual: ${kpi.currentValue}% / 100%) * Weight: ${kpi.weight} = ${roundedContribution} points earned.`;
                } else if (kpi.type === "Target-Based") {
                    notesStr = `Formula: (Actual: ${kpi.currentValue} / Target: ${kpi.targetValue}) * Weight: ${kpi.weight} = ${roundedContribution} points earned.`;
                } else if (kpi.type === "Deductive") {
                    notesStr = `Formula: Recorded ${kpi.currentValue} deducting units out of target limit ${kpi.targetValue}. Weight: ${kpi.weight}. Points earned: ${roundedContribution} / ${kpi.weight}.`;
                } else if (kpi.type === "Binary") {
                    notesStr = `Formula: Binary Validation check (Met: ${kpi.currentValue > 0 ? "Yes" : "No"}). Points earned: ${roundedContribution} / ${kpi.weight}.`;
                } else if (kpi.type === "Rating" || kpiNameLower.includes("rating") || kpiNameLower.includes("stars")) {
                    notesStr = `Formula: (Rating Actual: ${kpi.currentValue} / Max Target: ${kpi.targetValue || 5.0}) * Weight: ${kpi.weight} = ${roundedContribution} points earned.`;
                } else {
                    notesStr = `Calculated performance metric score: ${roundedContribution} points earned.`;
                }

                const dateStr = currentEmployee.lastReviewDate 
                    ? `${currentEmployee.lastReviewDate} 04:00 PM`
                    : `Jun ${20 - idx * 2}, 2026, 10:00 AM`;

                let addedByStr = "System Evaluator";
                if (isConduct) {
                    addedByStr = "HR Manager";
                } else if (isTechSupport) {
                    addedByStr = kpiNameLower.includes("sla") ? "Ticketing System" : "Support Manager";
                } else if (isCustomerSuccess) {
                    addedByStr = kpiNameLower.includes("revenue") ? "Sales System Portal" : "CS Lead";
                } else if (isMarketing) {
                    addedByStr = kpiNameLower.includes("lead") ? "Marketing Hubspot CRM" : "Marketing Director";
                } else if (isManagerLayout) {
                    addedByStr = "Management Board";
                }

                rows.push({
                    metric: kpi.name,
                    activityType: activityType,
                    done: doneStr,
                    left: `${roundedContribution.toFixed(2)} / ${kpi.weight.toFixed(2)} Pts`,
                    dateAdded: dateStr,
                    typeAdded: isConduct ? "weekly" : "daily",
                    notes: notesStr,
                    addedBy: addedByStr
                });
            });

            // Add reward point entry
            rows.push({
                metric: "Reward points balance",
                activityType: "Reward",
                done: `${rewardScore} pts`,
                left: "—",
                dateAdded: "Jun 22, 2026, 03:00 PM",
                typeAdded: "daily",
                notes: "Consolidated performance bonus reward points",
                addedBy: "HR Manager"
            });

            // Add overall grade level entry
            const overallScore = calculateEmployeePerformanceBalance(currentEmployee.kpis);
            rows.push({
                metric: "Current Grade Level",
                activityType: "Evaluation",
                done: currentEmployee.grade || "C",
                left: "A+ Target",
                dateAdded: "Jun 15, 2026, 12:00 PM",
                typeAdded: "monthly",
                notes: `Mid-quarter supervisor validation and evaluation (Calculated overall: ${overallScore}%).`,
                addedBy: "HR Manager"
            });

            return rows;
        }

        // --- LEGACY FALLBACK FOR DEEP BACKWARD COMPATIBILITY ---
        const rows: any[] = [];

        if (isTechSupport) {
            const data = getTechSupportKPIs(currentEmployee);
            const { inputs, computedSla, computedResp, computedRes, computedCsat, computedReopen, c1, c2, c3, c4, overall } = data;

            // 1. SLA Tickets Resolved
            rows.push({
                metric: "SLA Tickets Resolved",
                activityType: `Support Role KPI (Max ${inputs.slaWeight})`,
                done: `${inputs.slaTickets} (Target: ${inputs.totalTickets} tickets)`,
                left: `${computedSla.toFixed(2)} / ${inputs.slaWeight.toFixed(2)} Pts`,
                dateAdded: "Jun 22, 2026, 04:30 PM",
                typeAdded: "daily",
                notes: `Formula: (Actual SLA Resolved: ${inputs.slaTickets} / Total Tickets: ${inputs.totalTickets}) * Weight: ${inputs.slaWeight} = ${computedSla.toFixed(2)} points earned.`,
                addedBy: "Ticketing System"
            });

            // 2. First Response Time (FRT)
            rows.push({
                metric: "First Response Time (FRT)",
                activityType: `Support Role KPI (Max ${inputs.firstResponseWeight})`,
                done: `${inputs.actualResponseTime}m (Target: ${inputs.targetResponseTime}m)`,
                left: `${computedResp.toFixed(2)} / ${inputs.firstResponseWeight.toFixed(2)} Pts`,
                dateAdded: "Jun 21, 2026, 05:00 PM",
                typeAdded: "weekly",
                notes: `Formula: (Target FRT: ${inputs.targetResponseTime}m / Actual FRT: ${inputs.actualResponseTime}m) * Weight: ${inputs.firstResponseWeight} = ${computedResp.toFixed(2)} points earned.`,
                addedBy: "Support Manager"
            });

            // 3. Resolution Rate %
            rows.push({
                metric: "Ticket Resolution Rate",
                activityType: `Support Role KPI (Max ${inputs.resolutionWeight})`,
                done: `${inputs.resolvedTickets} (Target: ${inputs.assignedTickets} resolved)`,
                left: `${computedRes.toFixed(2)} / ${inputs.resolutionWeight.toFixed(2)} Pts`,
                dateAdded: "Jun 22, 2026, 05:00 PM",
                typeAdded: "daily",
                notes: `Formula: (Actual Resolved: ${inputs.resolvedTickets} / Assigned: ${inputs.assignedTickets}) * Weight: ${inputs.resolutionWeight} = ${computedRes.toFixed(2)} points earned.`,
                addedBy: "Support Manager"
            });

            // 4. Customer Satisfaction (CSAT)
            rows.push({
                metric: "Customer Satisfaction (CSAT)",
                activityType: `Support Role KPI (Max ${inputs.csatWeight})`,
                done: `${inputs.customerSatisfaction}%`,
                left: `${computedCsat.toFixed(2)} / ${inputs.csatWeight.toFixed(2)} Pts`,
                dateAdded: "Jun 22, 2026, 06:00 PM",
                typeAdded: "daily",
                notes: `Formula: (Actual CSAT: ${inputs.customerSatisfaction}% / 100) * Weight: ${inputs.csatWeight} = ${computedCsat.toFixed(2)} points earned.`,
                addedBy: "CSAT Feedback Bot"
            });

            // 5. Ticket Reopen Rate
            rows.push({
                metric: "Ticket Reopen Rate",
                activityType: `Support Role KPI (Max ${inputs.reopenWeight})`,
                done: `${inputs.actualReopenRate}% (Target: ${inputs.targetReopenRate}%)`,
                left: `${computedReopen.toFixed(2)} / ${inputs.reopenWeight.toFixed(2)} Pts`,
                dateAdded: "Jun 22, 2026, 06:00 PM",
                typeAdded: "daily",
                notes: `Formula: (Target Reopen Rate: ${inputs.targetReopenRate}% / Actual Reopen Rate: ${inputs.actualReopenRate}%) * Weight: ${inputs.reopenWeight} = ${computedReopen.toFixed(2)} points earned.`,
                addedBy: "Quality QA Team"
            });

            // 6. Corporate Conduct: Punctuality
            rows.push({
                metric: "Corporate Conduct: Punctuality",
                activityType: "Conduct (Max 5)",
                done: `${c1.toFixed(1)} / 5.0`,
                left: `${c1.toFixed(2)} / 5.00 Pts`,
                dateAdded: "Jun 20, 2026, 09:00 AM",
                typeAdded: "weekly",
                notes: "Conduct Standard Appraisal. Regular morning sign-ins and prompt attendance.",
                addedBy: "Operations Coordinator"
            });

            // 7. Corporate Conduct: Collaboration
            rows.push({
                metric: "Corporate Conduct: Collaboration",
                activityType: "Conduct (Max 5)",
                done: `${c2.toFixed(1)} / 5.0`,
                left: `${c2.toFixed(2)} / 5.00 Pts`,
                dateAdded: "Jun 20, 2026, 11:00 AM",
                typeAdded: "weekly",
                notes: "Conduct Standard Appraisal. Willingness to support peers and share knowledge.",
                addedBy: "Support Team Lead"
            });

            // 8. Corporate Conduct: Communication
            rows.push({
                metric: "Corporate Conduct: Communication",
                activityType: "Conduct (Max 5)",
                done: `${c3.toFixed(1)} / 5.0`,
                left: `${c3.toFixed(2)} / 5.00 Pts`,
                dateAdded: "Jun 20, 2026, 02:00 PM",
                typeAdded: "weekly",
                notes: "Conduct Standard Appraisal. Polite etiquette and response speed on updates.",
                addedBy: "Support Team Lead"
            });

            // 9. Corporate Conduct: Compliance
            rows.push({
                metric: "Corporate Conduct: Compliance",
                activityType: "Conduct (Max 5)",
                done: `${c4.toFixed(1)} / 5.0`,
                left: `${c4.toFixed(2)} / 5.00 Pts`,
                dateAdded: "Jun 19, 2026, 05:00 PM",
                typeAdded: "weekly",
                notes: "Conduct Standard Appraisal. Accurate timesheets submission and guidelines adherence.",
                addedBy: "HR Manager"
            });

            // 10. Reward points balance
            rows.push({
                metric: "Reward points balance",
                activityType: "Reward",
                done: `${rewardScore} pts`,
                left: "—",
                dateAdded: "Jun 22, 2026, 03:00 PM",
                typeAdded: "daily",
                notes: "Consolidated performance bonus reward points",
                addedBy: "HR Manager"
            });

            // 11. Current Grade Level
            rows.push({
                metric: "Current Grade Level",
                activityType: "Evaluation",
                done: currentEmployee.grade || "C",
                left: "A+ Target",
                dateAdded: "Jun 15, 2026, 12:00 PM",
                typeAdded: "monthly",
                notes: `Mid-quarter supervisor validation and evaluation (Calculated overall: ${overall}%).`,
                addedBy: "HR Manager"
            });
        }

        else if (isCustomerSuccess) {
            const data = getCustomerSuccessKPIs(currentEmployee);
            const { inputs, computedRenewal, computedRetention, computedExpansion, computedHealth, computedAdoption, c1, c2, c3, c4, overall } = data;

            // 1. Account Renewal Rate
            rows.push({
                metric: "Contract Renewal Achievement",
                activityType: `CS Role KPI (Max ${inputs.renewalWeight})`,
                done: `₦${inputs.renewalActual.toLocaleString()} (Target: ₦${inputs.renewalTarget.toLocaleString()})`,
                left: `${computedRenewal.toFixed(2)} / ${inputs.renewalWeight.toFixed(2)} Pts`,
                dateAdded: "Jun 22, 2026, 04:30 PM",
                typeAdded: "daily",
                notes: `Formula: (Actual Renewal: ₦${inputs.renewalActual.toLocaleString()} / Target: ₦${inputs.renewalTarget.toLocaleString()}) * Weight: ${inputs.renewalWeight} = ${computedRenewal.toFixed(2)} points earned.`,
                addedBy: "Accounts System"
            });

            // 2. Client Retention Rate
            rows.push({
                metric: "Client Retention Rate",
                activityType: `CS Role KPI (Max ${inputs.retentionWeight})`,
                done: `${inputs.retentionActual}%`,
                left: `${computedRetention.toFixed(2)} / ${inputs.retentionWeight.toFixed(2)} Pts`,
                dateAdded: "Jun 21, 2026, 05:00 PM",
                typeAdded: "weekly",
                notes: `Formula: (Actual Retention: ${inputs.retentionActual}% / 100) * Weight: ${inputs.retentionWeight} = ${computedRetention.toFixed(2)} points earned.`,
                addedBy: "CS Manager"
            });

            // 3. Renewal Expansion Target
            rows.push({
                metric: "Contract Expansion Volume",
                activityType: `CS Role KPI (Max ${inputs.expansionWeight})`,
                done: `₦${(inputs.expansionActual || 85000).toLocaleString()} (Target: ₦${(inputs.expansionTarget || 100000).toLocaleString()})`,
                left: `${computedExpansion.toFixed(2)} / ${inputs.expansionWeight.toFixed(2)} Pts`,
                dateAdded: "Jun 22, 2026, 05:00 PM",
                typeAdded: "daily",
                notes: `Formula: (Actual Expansion: ₦${(inputs.expansionActual || 85000).toLocaleString()} / Target: ₦${(inputs.expansionTarget || 100000).toLocaleString()}) * Weight: ${inputs.expansionWeight} = ${computedExpansion.toFixed(2)} points earned.`,
                addedBy: "Sales System Portal"
            });

            // 4. Overall Portfolio Client Health
            rows.push({
                metric: "Client Health Scoring",
                activityType: `CS Role KPI (Max ${inputs.healthWeight})`,
                done: `${inputs.healthActual}%`,
                left: `${computedHealth.toFixed(2)} / ${inputs.healthWeight.toFixed(2)} Pts`,
                dateAdded: "Jun 22, 2026, 06:00 PM",
                typeAdded: "daily",
                notes: `Formula: (Actual Portfolio Client Health: ${inputs.healthActual}% / 100) * Weight: ${inputs.healthWeight} = ${computedHealth.toFixed(2)} points earned.`,
                addedBy: "Client Health Index Tool"
            });

            // 5. Product Adoption Rate
            rows.push({
                metric: "Product Adoption Rate",
                activityType: `CS Role KPI (Max ${inputs.adoptionWeight})`,
                done: `${inputs.adoptionActual}%`,
                left: `${computedAdoption.toFixed(2)} / ${inputs.adoptionWeight.toFixed(2)} Pts`,
                dateAdded: "Jun 22, 2026, 06:00 PM",
                typeAdded: "daily",
                notes: `Formula: (Actual Product Adoption: ${inputs.adoptionActual}% / 100) * Weight: ${inputs.adoptionWeight} = ${computedAdoption.toFixed(2)} points earned.`,
                addedBy: "Product Analytics Board"
            });

            // 6. Corporate Conduct: Punctuality
            rows.push({
                metric: "Corporate Conduct: Punctuality",
                activityType: "Conduct (Max 5)",
                done: `${c1.toFixed(1)} / 5.0`,
                left: `${c1.toFixed(2)} / 5.00 Pts`,
                dateAdded: "Jun 20, 2026, 09:00 AM",
                typeAdded: "weekly",
                notes: "Conduct Standard Appraisal. Regular morning sign-ins and prompt attendance.",
                addedBy: "Operations Coordinator"
            });

            // 7. Corporate Conduct: Collaboration
            rows.push({
                metric: "Corporate Conduct: Collaboration",
                activityType: "Conduct (Max 5)",
                done: `${c2.toFixed(1)} / 5.0`,
                left: `${c2.toFixed(2)} / 5.00 Pts`,
                dateAdded: "Jun 20, 2026, 11:00 AM",
                typeAdded: "weekly",
                notes: "Conduct Standard Appraisal. Willingness to support peers and share knowledge.",
                addedBy: "CS Manager"
            });

            // 8. Corporate Conduct: Communication
            rows.push({
                metric: "Corporate Conduct: Communication",
                activityType: "Conduct (Max 5)",
                done: `${c3.toFixed(1)} / 5.0`,
                left: `${c3.toFixed(2)} / 5.00 Pts`,
                dateAdded: "Jun 20, 2026, 02:00 PM",
                typeAdded: "weekly",
                notes: "Conduct Standard Appraisal. Polite etiquette and response speed on updates.",
                addedBy: "CS Manager"
            });

            // 9. Corporate Conduct: Compliance
            rows.push({
                metric: "Corporate Conduct: Compliance",
                activityType: "Conduct (Max 5)",
                done: `${c4.toFixed(1)} / 5.0`,
                left: `${c4.toFixed(2)} / 5.00 Pts`,
                dateAdded: "Jun 19, 2026, 05:00 PM",
                typeAdded: "weekly",
                notes: "Conduct Standard Appraisal. Accurate timesheets submission and guidelines adherence.",
                addedBy: "HR Manager"
            });

            // 10. Reward points balance
            rows.push({
                metric: "Reward points balance",
                activityType: "Reward",
                done: `${rewardScore} pts`,
                left: "—",
                dateAdded: "Jun 22, 2026, 03:00 PM",
                typeAdded: "daily",
                notes: "Consolidated performance bonus reward points",
                addedBy: "HR Manager"
            });

            // 11. Current Grade Level
            rows.push({
                metric: "Current Grade Level",
                activityType: "Evaluation",
                done: currentEmployee.grade || "C",
                left: "A+ Target",
                dateAdded: "Jun 15, 2026, 12:00 PM",
                typeAdded: "monthly",
                notes: `Mid-quarter supervisor validation and evaluation (Calculated overall: ${overall}%).`,
                addedBy: "HR Manager"
            });
        }

        else if (isMarketing) {
            const data = getMarketingKPIs(currentEmployee);
            const { inputs, computedLeads, computedCost, computedQual, computedConv, c1, c2, c3, c4, overall } = data;

            // 1. Leads Generated
            rows.push({
                metric: "MQL Leads Generated",
                activityType: `Marketing KPI (Max ${inputs.leadsGeneratedWeight})`,
                done: `${inputs.leadsGeneratedActual} (Target: ${inputs.leadsGeneratedTarget} leads)`,
                left: `${computedLeads.toFixed(2)} / ${inputs.leadsGeneratedWeight.toFixed(2)} Pts`,
                dateAdded: "Jun 22, 2026, 04:30 PM",
                typeAdded: "daily",
                notes: `Formula: (Actual Leads: ${inputs.leadsGeneratedActual} / Target Leads: ${inputs.leadsGeneratedTarget}) * Weight: ${inputs.leadsGeneratedWeight} = ${computedLeads.toFixed(2)} points earned.`,
                addedBy: "Marketing Hubspot CRM"
            });

            // 2. Cost Per Lead (CPL)
            rows.push({
                metric: "Cost Per Lead (CPL) Target",
                activityType: `Marketing KPI (Max ${inputs.costPerLeadWeight})`,
                done: `$${inputs.costPerLeadActual} (Target: $${inputs.costPerLeadTarget})`,
                left: `${computedCost.toFixed(2)} / ${inputs.costPerLeadWeight.toFixed(2)} Pts`,
                dateAdded: "Jun 21, 2026, 05:00 PM",
                typeAdded: "weekly",
                notes: `Formula: (Target CPL: $${inputs.costPerLeadTarget} / Actual CPL: $${inputs.costPerLeadActual}) * Weight: ${inputs.costPerLeadWeight} = ${computedCost.toFixed(2)} points earned.`,
                addedBy: "Marketing Systems"
            });

            // 3. Qualified Lead Rate %
            rows.push({
                metric: "Qualified Lead Rate %",
                activityType: `Marketing KPI (Max ${inputs.qualifiedLeadRateWeight})`,
                done: `${inputs.qualifiedLeadRateActual}% (Target: ${inputs.qualifiedLeadRateTarget}%)`,
                left: `${computedQual.toFixed(2)} / ${inputs.qualifiedLeadRateWeight.toFixed(2)} Pts`,
                dateAdded: "Jun 22, 2026, 05:00 PM",
                typeAdded: "daily",
                notes: `Formula: (Actual Rate: ${inputs.qualifiedLeadRateActual}% / Target Rate: ${inputs.qualifiedLeadRateTarget}%) * Weight: ${inputs.qualifiedLeadRateWeight} = ${computedQual.toFixed(2)} points earned.`,
                addedBy: "Marketing Manager"
            });

            // 4. Campaign Conversion %
            rows.push({
                metric: "Campaign Conversion %",
                activityType: `Marketing KPI (Max ${inputs.campaignConversionWeight})`,
                done: `${inputs.campaignConversionActual}% (Target: ${inputs.campaignConversionTarget}%)`,
                left: `${computedConv.toFixed(2)} / ${inputs.campaignConversionWeight.toFixed(2)} Pts`,
                dateAdded: "Jun 22, 2026, 06:00 PM",
                typeAdded: "daily",
                notes: `Formula: (Campaign Conversion Actual: ${inputs.campaignConversionActual}% / Conversion Target: ${inputs.campaignConversionTarget}%) * Weight: ${inputs.campaignConversionWeight} = ${computedConv.toFixed(2)} points earned.`,
                addedBy: "CRM Systems Tracker"
            });

            // 5. Corporate Conduct: Punctuality
            rows.push({
                metric: "Corporate Conduct: Punctuality",
                activityType: "Conduct (Max 5)",
                done: `${c1.toFixed(1)} / 5.0`,
                left: `${c1.toFixed(2)} / 5.00 Pts`,
                dateAdded: "Jun 20, 2026, 09:00 AM",
                typeAdded: "weekly",
                notes: "Conduct Standard Appraisal. Regular morning sign-ins and prompt attendance.",
                addedBy: "Operations Coordinator"
            });

            // 6. Corporate Conduct: Collaboration
            rows.push({
                metric: "Corporate Conduct: Collaboration",
                activityType: "Conduct (Max 5)",
                done: `${c2.toFixed(1)} / 5.0`,
                left: `${c2.toFixed(2)} / 5.00 Pts`,
                dateAdded: "Jun 20, 2026, 11:00 AM",
                typeAdded: "weekly",
                notes: "Conduct Standard Appraisal. Willingness to support peers and share knowledge.",
                addedBy: "Marketing Director"
            });

            // 7. Corporate Conduct: Communication
            rows.push({
                metric: "Corporate Conduct: Communication",
                activityType: "Conduct (Max 5)",
                done: `${c3.toFixed(1)} / 5.0`,
                left: `${c3.toFixed(2)} / 5.00 Pts`,
                dateAdded: "Jun 20, 2026, 02:00 PM",
                typeAdded: "weekly",
                notes: "Conduct Standard Appraisal. Polite etiquette and response speed on updates.",
                addedBy: "Marketing Director"
            });

            // 8. Corporate Conduct: Compliance
            rows.push({
                metric: "Corporate Conduct: Compliance",
                activityType: "Conduct (Max 5)",
                done: `${c4.toFixed(1)} / 5.0`,
                left: `${c4.toFixed(2)} / 5.00 Pts`,
                dateAdded: "Jun 19, 2026, 05:00 PM",
                typeAdded: "weekly",
                notes: "Conduct Standard Appraisal. Accurate timesheets submission and guidelines adherence.",
                addedBy: "HR Manager"
            });

            // 9. Reward points balance
            rows.push({
                metric: "Reward points balance",
                activityType: "Reward",
                done: `${rewardScore} pts`,
                left: "—",
                dateAdded: "Jun 22, 2026, 03:00 PM",
                typeAdded: "daily",
                notes: "Consolidated performance bonus reward points",
                addedBy: "HR Manager"
            });

            // 10. Current Grade Level
            rows.push({
                metric: "Current Grade Level",
                activityType: "Evaluation",
                done: currentEmployee.grade || "C",
                left: "A+ Target",
                dateAdded: "Jun 15, 2026, 12:00 PM",
                typeAdded: "monthly",
                notes: `Mid-quarter supervisor validation and evaluation (Calculated overall: ${overall}%).`,
                addedBy: "HR Manager"
            });
        }

        else if (isManagerLayout) {
            const data = getManagerKPIs(currentEmployee);
            const { inputs, computedTeamAchievement, computedTeamQuality, computedTeamCompliance, computedReporting, computedPeopleMgmt, computedLeadership, c1, c2, c3, c4, overall } = data;

            // 1. Team Target Achievement
            rows.push({
                metric: "Team Target Volume Achievement",
                activityType: `Manager KPI (Max 30)`,
                done: `₦${inputs.actualTeamResult.toLocaleString()} (Target: ₦${inputs.teamTarget.toLocaleString()})`,
                left: `${computedTeamAchievement.toFixed(2)} / 30.00 Pts`,
                dateAdded: "Jun 22, 2026, 04:30 PM",
                typeAdded: "daily",
                notes: `Formula: (Actual Team Result: ₦${inputs.actualTeamResult.toLocaleString()} / Team Target: ₦${inputs.teamTarget.toLocaleString()}) * Weight: 30 = ${computedTeamAchievement.toFixed(2)} points earned.`,
                addedBy: "Executive Committee"
            });

            // 2. Team Quality SLA Achievement %
            rows.push({
                metric: "Team Quality SLA %",
                activityType: `Manager KPI (Max 15)`,
                done: `${inputs.qualityPercent}%`,
                left: `${computedTeamQuality.toFixed(2)} / 15.00 Pts`,
                dateAdded: "Jun 21, 2026, 05:00 PM",
                typeAdded: "weekly",
                notes: `Formula: (Team Quality Score: ${inputs.qualityPercent}% / 100) * Weight: 15 = ${computedTeamQuality.toFixed(2)} points earned.`,
                addedBy: "QA Lead"
            });

            // 3. Team Policy Compliance Adherence %
            rows.push({
                metric: "Team Compliance Adherence",
                activityType: `Manager KPI (Max 10)`,
                done: `${inputs.compliancePercent}%`,
                left: `${computedTeamCompliance.toFixed(2)} / 10.00 Pts`,
                dateAdded: "Jun 22, 2026, 05:00 PM",
                typeAdded: "daily",
                notes: `Formula: (Compliance Score: ${inputs.compliancePercent}% / 100) * Weight: 10 = ${computedTeamCompliance.toFixed(2)} points earned.`,
                addedBy: "Internal Auditor"
            });

            // 4. Timely and Accurate Reporting
            rows.push({
                metric: "Reporting & Planning Precision",
                activityType: `Manager KPI (Max 10)`,
                done: `${inputs.reportingRating} / 5.0 Rating`,
                left: `${computedReporting.toFixed(2)} / 10.00 Pts`,
                dateAdded: "Jun 22, 2026, 06:00 PM",
                typeAdded: "daily",
                notes: `Formula: (Reporting Rating: ${inputs.reportingRating} / 5) * Weight: 10 = ${computedReporting.toFixed(2)} points earned.`,
                addedBy: "CEO Office"
            });

            // 5. People Management & Development
            rows.push({
                metric: "People Mgmt & Coaching",
                activityType: `Manager KPI (Max 10)`,
                done: `${inputs.peopleManagementRating} / 5.0 Rating`,
                left: `${computedPeopleMgmt.toFixed(2)} / 10.00 Pts`,
                dateAdded: "Jun 22, 2026, 06:00 PM",
                typeAdded: "daily",
                notes: `Formula: (People Management Rating: ${inputs.peopleManagementRating} / 5) * Weight: 10 = ${computedPeopleMgmt.toFixed(2)} points earned.`,
                addedBy: "HR Partner"
            });

            // 6. Strategic Leadership & Vision
            rows.push({
                metric: "Strategic Vision Alignment",
                activityType: `Manager KPI (Max 5)`,
                done: `${inputs.leadershipRating} / 5.0 Rating`,
                left: `${computedLeadership.toFixed(2)} / 5.00 Pts`,
                dateAdded: "Jun 22, 2026, 06:00 PM",
                typeAdded: "daily",
                notes: `Formula: (Leadership Rating: ${inputs.leadershipRating} / 5) * Weight: 5 = ${computedLeadership.toFixed(2)} points earned.`,
                addedBy: "CEO Office"
            });

            // 7. Corporate Conduct: Punctuality
            rows.push({
                metric: "Corporate Conduct: Punctuality",
                activityType: "Conduct (Max 5)",
                done: `${c1.toFixed(1)} / 5.0`,
                left: `${c1.toFixed(2)} / 5.00 Pts`,
                dateAdded: "Jun 20, 2026, 09:00 AM",
                typeAdded: "weekly",
                notes: "Conduct Standard Appraisal. Regular morning sign-ins and prompt attendance.",
                addedBy: "CEO Office"
            });

            // 8. Corporate Conduct: Collaboration
            rows.push({
                metric: "Corporate Conduct: Collaboration",
                activityType: "Conduct (Max 5)",
                done: `${c2.toFixed(1)} / 5.0`,
                left: `${c2.toFixed(2)} / 5.00 Pts`,
                dateAdded: "Jun 20, 2026, 11:00 AM",
                typeAdded: "weekly",
                notes: "Conduct Standard Appraisal. Willingness to support peers and share knowledge.",
                addedBy: "Executive Board"
            });

            // 9. Corporate Conduct: Communication
            rows.push({
                metric: "Corporate Conduct: Communication",
                activityType: "Conduct (Max 5)",
                done: `${c3.toFixed(1)} / 5.0`,
                left: `${c3.toFixed(2)} / 5.00 Pts`,
                dateAdded: "Jun 20, 2026, 02:00 PM",
                typeAdded: "weekly",
                notes: "Conduct Standard Appraisal. Polite etiquette and response speed on updates.",
                addedBy: "Executive Board"
            });

            // 10. Corporate Conduct: Compliance
            rows.push({
                metric: "Corporate Conduct: Compliance",
                activityType: "Conduct (Max 5)",
                done: `${c4.toFixed(1)} / 5.0`,
                left: `${c4.toFixed(2)} / 5.00 Pts`,
                dateAdded: "Jun 19, 2026, 05:00 PM",
                typeAdded: "weekly",
                notes: "Conduct Standard Appraisal. Accurate timesheets submission and guidelines adherence.",
                addedBy: "HR Director"
            });

            // 11. Reward points balance
            rows.push({
                metric: "Reward points balance",
                activityType: "Reward",
                done: `${rewardScore} pts`,
                left: "—",
                dateAdded: "Jun 22, 2026, 03:00 PM",
                typeAdded: "daily",
                notes: "Consolidated performance bonus reward points",
                addedBy: "HR Manager"
            });

            // 12. Current Grade Level
            rows.push({
                metric: "Current Grade Level",
                activityType: "Evaluation",
                done: currentEmployee.grade || "C",
                left: "A+ Target",
                dateAdded: "Jun 15, 2026, 12:00 PM",
                typeAdded: "monthly",
                notes: `Mid-quarter supervisor validation and evaluation (Calculated overall: ${overall}%).`,
                addedBy: "HR Manager"
            });
        }

        return rows;
    }, [
        isCallAgent,
        isTechSupport,
        isCustomerSuccess,
        isMarketing,
        isManagerLayout,
        currentEmployee,
        callAgentRows,
        rewardScore
    ]);

    const roleTableRows = useMemo(() => {
        if (!currentEmployee) return [];
        const baseRows = [...rawRoleTableRows];

        // Append Grade Audit Trail entries (ratings/points) to baseRows for any of these roles!
        if (currentEmployee.gradeAuditTrail) {
            currentEmployee.gradeAuditTrail.forEach((audit: any) => {
                const negative = audit.reason.toLowerCase().includes('deduct') || audit.reason.toLowerCase().includes('breach');
                const pts = audit.ratingPoints !== undefined 
                    ? `+${audit.ratingPoints}` 
                    : (negative ? "-5" : "+10");
                
                baseRows.push({
                    metric: audit.policyResponsible || "Performance Evaluation",
                    activityType: audit.type === "rating" ? "Monthly Rating" : "Audit Log",
                    done: `Grade: ${audit.newGrade || "—"}`,
                    left: `${pts} Pts`,
                    dateAdded: audit.dateOfChange,
                    typeAdded: audit.type === "rating" ? "monthly" : "weekly",
                    notes: audit.reason,
                    addedBy: audit.approvingAuthority || "Admin / HR"
                });
            });
        }
        return baseRows;
    }, [rawRoleTableRows, currentEmployee]);

    const entries = useMemo(() => {
        const list: any[] = [];
        let runningBalance = 0;

        if (isEngineer) {
            // Keep the exact original three hardcoded entries for engineers
            list.push(
                {
                    date: "May 13, 2026, 09:43 AM",
                    category: "Performance",
                    type: "Deduction",
                    points: "-5",
                    notes: "when there is no reaction to messages posted",
                    addedBy: "Super Admin",
                    balanceAfter: "90",
                    evidence: "—"
                },
                {
                    date: "May 12, 2026, 11:10 AM",
                    category: "Reward",
                    type: "Addition",
                    points: "+10",
                    notes: "+10 awarded after 48hrs in production with no bugs",
                    addedBy: "Super Admin",
                    balanceAfter: "95",
                    evidence: "—"
                },
                {
                    date: "May 12, 2026, 11:10 AM",
                    category: "Performance",
                    type: "Deduction",
                    points: "-15",
                    notes: "-15 for missing an agreed-upon deadline",
                    addedBy: "Super Admin",
                    balanceAfter: "85",
                    evidence: "—"
                }
            );
        } else {
            // Add Role KPI Entries
            if (currentEmployee && currentEmployee.kpis) {
                currentEmployee.kpis.forEach((kpi, idx) => {
                    const contribution = calculateKPIContribution(kpi);
                    runningBalance += contribution;
                    const roundedContribution = Math.round(contribution * 10) / 10;
                    
                    // Construct nice notes
                    let notes = `${kpi.name} performance metrics.`;
                    if (kpi.type === 'Percentage') {
                        notes = `Achieved ${kpi.currentValue}% against ${kpi.targetValue}% target for ${kpi.name}.`;
                    } else if (kpi.type === 'Target-Based') {
                        const unitStr = kpi.unit ? ` ${kpi.unit}` : '';
                        notes = `Achieved ${kpi.currentValue}${unitStr} out of ${kpi.targetValue}${unitStr} target for ${kpi.name}.`;
                    } else if (kpi.type === 'Deductive') {
                        const unitStr = kpi.unit ? ` ${kpi.unit}` : '';
                        notes = `Recorded ${kpi.currentValue}${unitStr} penalty deductions out of max target ${kpi.targetValue}${unitStr} for ${kpi.name}.`;
                    } else if (kpi.type === 'Binary') {
                        notes = kpi.currentValue > 0 
                            ? `Met full operational binary targets for ${kpi.name}.`
                            : `Missed operational binary targets for ${kpi.name}.`;
                    }

                    const dateStr = currentEmployee.lastReviewDate 
                        ? `${currentEmployee.lastReviewDate} 04:00 PM`
                        : `May ${10 + idx}, 2026, 10:00 AM`;

                    list.push({
                        date: dateStr,
                        category: "Performance",
                        type: "Addition",
                        points: `+${roundedContribution}`,
                        notes: notes,
                        addedBy: "System Evaluator",
                        balanceAfter: `${Math.round(runningBalance)}`,
                        evidence: "Review Audit"
                    });
                });
            }

            // Add Reward Points Entry
            if (currentEmployee) {
                list.push({
                    date: "May 25, 2026, 11:30 AM",
                    category: "Reward",
                    type: "Addition",
                    points: `+${rewardScore}`,
                    notes: "Cumulative team activities and cultural reward balance.",
                    addedBy: "Admin / HR",
                    balanceAfter: `${rewardScore}`,
                    evidence: "Milestone Reward"
                });
            }
        }

        // Add Grade Audit Trail entries if present (for ALL roles, including engineers!)
        if (currentEmployee && currentEmployee.gradeAuditTrail) {
            currentEmployee.gradeAuditTrail.forEach((audit) => {
                const negative = audit.reason.toLowerCase().includes('deduct') || audit.reason.toLowerCase().includes('breach');
                const pts = audit.ratingPoints !== undefined 
                    ? `+${audit.ratingPoints}` 
                    : (negative ? "-5" : "+10");
                list.push({
                    date: audit.dateOfChange,
                    category: "Performance",
                    type: negative ? "Deduction" : "Addition",
                    points: pts,
                    notes: audit.reason,
                    addedBy: audit.approvingAuthority || "Admin / HR",
                    balanceAfter: audit.newGrade || "—",
                    evidence: audit.policyResponsible || "Evaluation"
                });
            });
        }

        if (selectedCategory === "Performance") {
            return list.filter(item => item.category === "Performance");
        } else if (selectedCategory === "Reward") {
            return list.filter(item => item.category === "Reward");
        }

        return list;
    }, [isEngineer, currentEmployee, rewardScore, selectedCategory]);

    const netPoints = useMemo(() => {
        const perfVal = isCallAgent ? 94.2 : perfScore;
        const rewardVal = rewardScore;
        return Math.round((perfVal + rewardVal + ratingPointsSum) * 10) / 10;
    }, [isCallAgent, perfScore, rewardScore, ratingPointsSum]);

    const parsePeriodFromDate = (dateStr: string) => {
        if (!dateStr || dateStr === "N/A" || dateStr === "—") {
            return { year: "All", month: "All", quarter: "All", week: "All" };
        }

        const localGetQuarter = (mName: string): string => {
            const m = String(mName).toLowerCase();
            if (['january', 'february', 'march'].includes(m)) return 'Q1';
            if (['april', 'may', 'june'].includes(m)) return 'Q2';
            if (['july', 'august', 'september'].includes(m)) return 'Q3';
            if (['october', 'november', 'december'].includes(m)) return 'Q4';
            return 'Q2';
        };

        try {
            let date: Date;
            if (dateStr.includes('-')) {
                const parts = dateStr.split('-');
                if (parts.length >= 3) {
                    date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                } else if (parts.length === 2) {
                    date = new Date(Number(parts[0]), Number(parts[1]) - 1, 15);
                } else {
                    date = new Date(dateStr);
                }
            } else {
                date = new Date(dateStr);
            }

            if (isNaN(date.getTime())) {
                const cleaned = dateStr.replace(/,/g, '');
                const tokens = cleaned.split(/\s+/);
                if (tokens.length >= 3) {
                    const yearToken = tokens[2];
                    const monthToken = tokens[0];
                    const dayToken = Number(tokens[1]);

                    let year = yearToken;
                    if (!/^\d{4}$/.test(year)) {
                        year = "2026";
                    }

                    let month = "July";
                    const monthsLower = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
                    const fullMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                    const tokenLower = monthToken.toLowerCase();
                    for (let i = 0; i < 12; i++) {
                        if (tokenLower.startsWith(monthsLower[i])) {
                            month = fullMonths[i];
                            break;
                        }
                    }

                    let day = dayToken || 15;
                    let weekNum = 1;
                    if (day > 21) weekNum = 4;
                    else if (day > 14) weekNum = 3;
                    else if (day > 7) weekNum = 2;

                    return { year, month, quarter: localGetQuarter(month), week: `Week ${weekNum}` };
                }

                return { year: "All", month: "All", quarter: "All", week: "All" };
            }

            const fullMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            const year = String(date.getFullYear());
            const month = fullMonths[date.getMonth()];
            
            const day = date.getDate();
            let weekNum = 1;
            if (day > 21) weekNum = 4;
            else if (day > 14) weekNum = 3;
            else if (day > 7) weekNum = 2;

            return { year, month, quarter: localGetQuarter(month), week: `Week ${weekNum}` };
        } catch (e) {
            return { year: "All", month: "All", quarter: "All", week: "All" };
        }
    };

    const filteredRoleTableRows = useMemo(() => {
        let base = roleTableRows;
        
        if (activeTableTab === 'performance') {
            base = base.filter(row => {
                const metricLower = (row.metric || '').toLowerCase();
                const actLower = (row.activityType || '').toLowerCase();
                return !metricLower.includes('reward') && !actLower.includes('reward');
            });
        }

        return base.filter(row => {
            const period = parsePeriodFromDate(row.dateAdded);
            if (repYear !== 'All' && period.year !== repYear) return false;
            if (repMonth !== 'All' && period.month.toLowerCase() !== repMonth.toLowerCase()) return false;
            if (repQuarter !== 'All' && period.quarter !== repQuarter) return false;
            if (repWeek !== 'All' && period.week !== repWeek) return false;
            return true;
        });
    }, [roleTableRows, activeTableTab, repYear, repMonth, repQuarter, repWeek]);

    const filteredEntries = useMemo(() => {
        let base = entries;
        
        if (activeTableTab === 'performance') {
            base = base.filter(item => item.category === 'Performance');
        }

        return base.filter(item => {
            const period = parsePeriodFromDate(item.date);
            if (repYear !== 'All' && period.year !== repYear) return false;
            if (repMonth !== 'All' && period.month.toLowerCase() !== repMonth.toLowerCase()) return false;
            if (repQuarter !== 'All' && period.quarter !== repQuarter) return false;
            if (repWeek !== 'All' && period.week !== repWeek) return false;
            return true;
        });
    }, [entries, activeTableTab, repYear, repMonth, repQuarter, repWeek]);

    const getQuarterFromMonth = (monthName: string): string => {
        const m = String(monthName).toLowerCase();
        if (['january', 'february', 'march'].includes(m)) return 'Q1';
        if (['april', 'may', 'june'].includes(m)) return 'Q2';
        if (['july', 'august', 'september'].includes(m)) return 'Q3';
        if (['october', 'november', 'december'].includes(m)) return 'Q4';
        return 'Q2'; // fallback default
    };

    // Flatten and compile specific employee's Weekly Reviews
    const myWeeklyData = useMemo<WeeklyReportRow[]>(() => {
        const list: WeeklyReportRow[] = [];
        if (!currentEmployee) return [];

        const savedRewards = localStorage.getItem('company_rewards_history_list');
        let rewardsHistory: any[] = [];
        if (savedRewards) {
            try {
                rewardsHistory = JSON.parse(savedRewards) as any[];
            } catch (e) {
                console.error(e);
            }
        }
        
        const reviews = currentEmployee.weeklyReviews || [];
        reviews.forEach((rev: any) => {
            const pScore = rev.performanceScore || 0;
            const rPoint = rev.ratingPoint || 0;
            const fScore = Math.min(100, Math.max(0, pScore + rPoint));
            const monthStr = rev.month || "July";

            let rowRewards = 0;
            const empRecords = rewardsHistory.filter(r => String(r.employee_id) === String(currentEmployee.id));
            empRecords.forEach(rec => {
                let isMatch = false;
                if (rec.created_at) {
                    const date = new Date(rec.created_at);
                    if (!isNaN(date.getTime())) {
                        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                        const mMatch = months[date.getMonth()].toLowerCase() === monthStr.toLowerCase();
                        const yMatch = String(date.getFullYear()) === String(rev.year || "2026");
                        const day = date.getDate();
                        let recWeek = "Week 1";
                        if (day > 21) recWeek = "Week 4";
                        else if (day > 14) recWeek = "Week 3";
                        else if (day > 7) recWeek = "Week 2";
                        
                        if (mMatch && yMatch && recWeek.toLowerCase() === (rev.week || "Week 1").toLowerCase()) {
                            isMatch = true;
                        }
                    }
                }
                const typeLower = String(rec.type || rec.reward_type || "").toLowerCase();
                const isPenalty = typeLower.includes("penalty") || typeLower.includes("demerit") || typeLower.includes("deduction") || Number(rec.points || 0) < 0;
                if (isMatch && !isPenalty) {
                    rowRewards += Math.abs(rec.points || 0);
                }
            });

            if (rowRewards === 0) {
                rowRewards = 15; // default fallback
            }

            list.push({
                employeeId: String(currentEmployee.id),
                employeeCode: currentEmployee.employeeId || `EMP-${currentEmployee.id}`,
                employeeName: currentEmployee.name || `${currentEmployee.firstName} ${currentEmployee.lastName}`,
                department: currentEmployee.department || "General",
                week: rev.week || "Week 1",
                month: monthStr,
                year: String(rev.year || "2026"),
                quarter: getQuarterFromMonth(monthStr),
                performanceScore: pScore,
                ratingPoint: rPoint,
                finalScore: fScore,
                reviewer: rev.reviewer || "System",
                comments: rev.comments || "No comments written.",
                reviewDate: rev.dateCreated || "N/A",
                rewards: rowRewards,
                netPoints: fScore + rowRewards
            });
        });

        // Add fallback sample records if empty for realistic simulation
        if (list.length === 0) {
            const sampleMonths = ["June", "July"];
            sampleMonths.forEach(m => {
                const rewards1 = 15;
                const rewards2 = 15;
                list.push({
                    employeeId: String(currentEmployee.id),
                    employeeCode: currentEmployee.employeeId || `EMP-${currentEmployee.id}`,
                    employeeName: currentEmployee.name || `${currentEmployee.firstName} ${currentEmployee.lastName}`,
                    department: currentEmployee.department || "General",
                    week: "Week 1",
                    month: m,
                    year: "2026",
                    quarter: getQuarterFromMonth(m),
                    performanceScore: 85,
                    ratingPoint: 5,
                    finalScore: 90,
                    reviewer: "Admin Reviewer",
                    comments: "Met individual operational metrics consistently.",
                    reviewDate: `2026-${m === "June" ? "06" : "07"}-05`,
                    rewards: rewards1,
                    netPoints: 90 + rewards1
                });
                list.push({
                    employeeId: String(currentEmployee.id),
                    employeeCode: currentEmployee.employeeId || `EMP-${currentEmployee.id}`,
                    employeeName: currentEmployee.name || `${currentEmployee.firstName} ${currentEmployee.lastName}`,
                    department: currentEmployee.department || "General",
                    week: "Week 2",
                    month: m,
                    year: "2026",
                    quarter: getQuarterFromMonth(m),
                    performanceScore: 92,
                    ratingPoint: 0,
                    finalScore: 92,
                    reviewer: "Admin Reviewer",
                    comments: "Exceptional promptness and ticket resolution speed.",
                    reviewDate: `2026-${m === "June" ? "06" : "07"}-12`,
                    rewards: rewards2,
                    netPoints: 92 + rewards2
                });
            });
        }
        return list;
    }, [currentEmployee]);

    // Flatten and compile specific employee's Monthly Reviews
    const myMonthlyData = useMemo<MonthlyReportRow[]>(() => {
        const list: MonthlyReportRow[] = [];
        if (!currentEmployee) return [];

        // Load rewards history to calculate rewards/penalties
        const savedRewards = localStorage.getItem('company_rewards_history_list');
        let rewardsHistory: any[] = [];
        if (savedRewards) {
            try {
                rewardsHistory = JSON.parse(savedRewards) as any[];
            } catch (e) {
                console.error(e);
            }
        }

        const empWeeks = myWeeklyData;
        const periodsMap: Record<string, WeeklyReportRow[]> = {};
        
        empWeeks.forEach(w => {
            const key = `${w.year}-${w.month}`;
            if (!periodsMap[key]) periodsMap[key] = [];
            periodsMap[key].push(w);
        });

        // Ensure we also register periods from the employee's gradeAuditTrail ratings
        if (currentEmployee && currentEmployee.gradeAuditTrail) {
            currentEmployee.gradeAuditTrail.forEach((log: any) => {
                if (log.type === "rating" && log.ratingYear && log.ratingMonth) {
                    const key = `${log.ratingYear}-${log.ratingMonth}`;
                    if (!periodsMap[key]) {
                        periodsMap[key] = [];
                    }
                }
            });
        }

        const periodsKeys = Object.keys(periodsMap);
        if (periodsKeys.length === 0) {
            periodsKeys.push("2026-July", "2026-June");
            periodsMap["2026-July"] = empWeeks.filter(w => w.month === "July") || [];
            periodsMap["2026-June"] = empWeeks.filter(w => w.month === "June") || [];
        }

        periodsKeys.forEach(periodKey => {
            const [year, month] = periodKey.split('-');
            const weeks = periodsMap[periodKey] || [];
            
            const ratingLogForMonth = currentEmployee.gradeAuditTrail?.find((log: any) => 
                log.type === "rating" && String(log.ratingYear) === year && String(log.ratingMonth) === month
            );
            const ratingPoint = ratingLogForMonth ? (ratingLogForMonth.ratingPoints || 0) : 0;

            const defaultBaseScore = ratingLogForMonth && ratingLogForMonth.score !== undefined
                ? ratingLogForMonth.score
                : 85;

            const avgScore = weeks.length > 0
                ? Math.round(weeks.reduce((sum, w) => sum + w.performanceScore, 0) / weeks.length)
                : defaultBaseScore; 

            const explicitSnap = (currentEmployee.monthlyReviews || []).find((r: any) => String(r.month) === month && String(r.year) === year);
            const monthlyScore = explicitSnap ? explicitSnap.performanceScore : (ratingLogForMonth && ratingLogForMonth.score !== undefined ? ratingLogForMonth.score : avgScore);

            const finalAppliedScore = Math.min(100, Math.max(0, monthlyScore + ratingPoint));
            const finalGrade = calculateGradeFromPerformance(finalAppliedScore);

            let rewards = 0;
            let penalties = 0;

            const empRecords = rewardsHistory.filter(r => String(r.employee_id) === String(currentEmployee.id));
            empRecords.forEach(rec => {
                let isMatch = false;
                if (rec.period_id) {
                    const pid = rec.period_id.toLowerCase();
                    if (pid.includes(month.toLowerCase()) && pid.includes(year)) {
                        isMatch = true;
                    }
                }
                if (rec.created_at) {
                    const date = new Date(rec.created_at);
                    if (!isNaN(date.getTime())) {
                        const monthsList = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                        if (String(date.getFullYear()) === year && monthsList[date.getMonth()].toLowerCase() === month.toLowerCase()) {
                            isMatch = true;
                        }
                    }
                }

                if (isMatch) {
                    const typeLower = String(rec.type || "").toLowerCase();
                    const pts = Math.abs(Number(rec.points || 0));
                    if (typeLower.includes("penalty") || typeLower.includes("demerit") || typeLower.includes("deduction") || Number(rec.points || 0) < 0) {
                        penalties += pts;
                    } else {
                        rewards += pts;
                    }
                }
            });

            if (rewards === 0 && penalties === 0) {
                if (finalGrade.startsWith("A")) {
                    rewards = 200;
                } else if (finalGrade.startsWith("B")) {
                    rewards = 100;
                } else if (finalGrade.startsWith("F") || finalGrade.startsWith("D")) {
                    penalties = 150;
                }
            }

            const netPoints = rewards - penalties + ratingPoint;

            list.push({
                employeeId: String(currentEmployee.id),
                employeeCode: currentEmployee.employeeId || `EMP-${currentEmployee.id}`,
                employeeName: currentEmployee.name || `${currentEmployee.firstName} ${currentEmployee.lastName}`,
                department: currentEmployee.department || "General",
                month,
                year,
                quarter: getQuarterFromMonth(month),
                monthlyScore,
                avgScore,
                finalGrade,
                ratingPoint,
                rewards,
                penalties,
                netPoints,
                comments: explicitSnap ? explicitSnap.comments : "Performance compiled from weekly review cycle averages.",
                reviewer: explicitSnap ? explicitSnap.reviewer : "System Compiler",
                reviewDate: explicitSnap ? explicitSnap.dateCreated : `${year}-${month === "June" ? "06" : "07"}-30`
            });
        });

        return list;
    }, [currentEmployee, myWeeklyData]);

    const availableYears = useMemo(() => {
        const yearsSet = new Set<string>();
        yearsSet.add("2026");
        yearsSet.add("2025");
        
        if (currentEmployee) {
            if (myWeeklyData) {
                myWeeklyData.forEach(w => {
                    if (w.year) yearsSet.add(String(w.year));
                });
            }
            if (myMonthlyData) {
                myMonthlyData.forEach(m => {
                    if (m.year) yearsSet.add(String(m.year));
                });
            }
            if (currentEmployee.gradeAuditTrail) {
                currentEmployee.gradeAuditTrail.forEach((log: any) => {
                    if (log.ratingYear) yearsSet.add(String(log.ratingYear));
                    if (log.year) yearsSet.add(String(log.year));
                    if (log.created_at) {
                        const d = new Date(log.created_at);
                        if (!isNaN(d.getTime())) {
                            yearsSet.add(String(d.getFullYear()));
                        }
                    }
                });
            }
            if (currentEmployee.monthlyReviews) {
                currentEmployee.monthlyReviews.forEach((r: any) => {
                    if (r.year) yearsSet.add(String(r.year));
                });
            }
        }
        return Array.from(yearsSet).sort((a, b) => b.localeCompare(a));
    }, [currentEmployee, myWeeklyData, myMonthlyData]);

    const currentRank = useMemo(() => {
        if (!currentEmployee) return "N/A";
        
        if (repYear === 'All' && repMonth === 'All' && repWeek === 'All' && repQuarter === 'All') {
            return currentEmployee.leaderboardRank || "3rd";
        }

        const employeeScores = employeesList.map(emp => {
            let score = 0;
            
            if (repWeek !== 'All') {
                const match = emp.weeklyReviews?.find((w: any) => 
                    (repYear === 'All' || String(w.year) === repYear) &&
                    (repMonth === 'All' || String(w.month).toLowerCase() === repMonth.toLowerCase()) &&
                    String(w.week) === repWeek
                );
                score = match ? (match.performanceScore + (match.ratingPoint || 0)) : (emp.performanceScore || 80);
            } else if (repMonth !== 'All') {
                const explicitSnap = emp.monthlyReviews?.find((r: any) => 
                    String(r.month).toLowerCase() === repMonth.toLowerCase() && 
                    (repYear === 'All' || String(r.year) === repYear)
                );
                if (explicitSnap) {
                    score = explicitSnap.performanceScore;
                } else {
                    const weeks = emp.weeklyReviews?.filter((w: any) => 
                        String(w.month).toLowerCase() === repMonth.toLowerCase() &&
                        (repYear === 'All' || String(w.year) === repYear)
                    ) || [];
                    if (weeks.length > 0) {
                        score = Math.round(weeks.reduce((sum: number, w: any) => sum + w.performanceScore, 0) / weeks.length);
                    } else {
                        score = emp.performanceScore || 80;
                    }
                }
            } else if (repQuarter !== 'All') {
                const monthsInQuarter = repQuarter === 'Q1' ? ['january', 'february', 'march'] :
                                        repQuarter === 'Q2' || repQuarter.includes('Q2') ? ['april', 'may', 'june'] :
                                        repQuarter === 'Q3' ? ['july', 'august', 'september'] :
                                        ['october', 'november', 'december'];
                const snaps = emp.monthlyReviews?.filter((r: any) => 
                    monthsInQuarter.includes(String(r.month).toLowerCase()) &&
                    (repYear === 'All' || String(r.year) === repYear)
                ) || [];
                if (snaps.length > 0) {
                    score = Math.round(snaps.reduce((sum: number, r: any) => sum + r.performanceScore, 0) / snaps.length);
                } else {
                    score = emp.performanceScore || 80;
                }
            } else {
                const snaps = emp.monthlyReviews?.filter((r: any) => 
                    (repYear === 'All' || String(r.year) === repYear)
                ) || [];
                if (snaps.length > 0) {
                    score = Math.round(snaps.reduce((sum: number, r: any) => sum + r.performanceScore, 0) / snaps.length);
                } else {
                    score = emp.performanceScore || 80;
                }
            }
            
            return { id: emp.id, score };
        });

        const sorted = [...employeeScores].sort((a, b) => b.score - a.score);
        const rankIndex = sorted.findIndex(item => String(item.id) === String(currentEmployee.id));
        
        if (rankIndex === -1) return "N/A";
        const rank = rankIndex + 1;
        if (rank === 1) return "1st";
        if (rank === 2) return "2nd";
        if (rank === 3) return "3rd";
        return `${rank}th`;
    }, [employeesList, currentEmployee, repYear, repMonth, repWeek, repQuarter]);

    const filteredMetrics = useMemo(() => {
        if (!currentEmployee) {
            return {
                academicGrade: "—",
                rewardPoints: 0,
                leaderboardRanking: "—",
                netPointsBalance: 0,
                perfScoreVal: 80
            };
        }

        let finalPerfScore = perfScore;
        
        if (repWeek !== 'All') {
            const matchWeek = myWeeklyData.find(w => 
                (repYear === 'All' || w.year === repYear) &&
                (repMonth === 'All' || w.month.toLowerCase() === repMonth.toLowerCase()) &&
                w.week === repWeek
            );
            if (matchWeek) {
                finalPerfScore = matchWeek.finalScore;
            }
        } else if (repMonth !== 'All') {
            const matchMonth = myMonthlyData.find(m => 
                (repYear === 'All' || m.year === repYear) &&
                m.month.toLowerCase() === repMonth.toLowerCase()
            );
            if (matchMonth) {
                finalPerfScore = matchMonth.monthlyScore + matchMonth.ratingPoint;
            }
        } else if (repQuarter !== 'All') {
            const matchMonths = myMonthlyData.filter(m => 
                (repYear === 'All' || m.year === repYear) &&
                m.quarter === repQuarter
            );
            if (matchMonths.length > 0) {
                finalPerfScore = Math.round(matchMonths.reduce((sum, m) => sum + (m.monthlyScore + m.ratingPoint), 0) / matchMonths.length);
            }
        } else if (repYear !== 'All') {
            const matchMonths = myMonthlyData.filter(m => m.year === repYear);
            if (matchMonths.length > 0) {
                finalPerfScore = Math.round(matchMonths.reduce((sum, m) => sum + (m.monthlyScore + m.ratingPoint), 0) / matchMonths.length);
            }
        }

        const academicGrade = calculateGradeFromPerformance(finalPerfScore);

        let finalRewardPoints = rewardScore;
        
        if (repYear !== 'All' || repMonth !== 'All' || repQuarter !== 'All' || repWeek !== 'All') {
            const matchMonths = myMonthlyData.filter(m => {
                if (repYear !== 'All' && m.year !== repYear) return false;
                if (repMonth !== 'All' && m.month.toLowerCase() !== repMonth.toLowerCase()) return false;
                if (repQuarter !== 'All' && m.quarter !== repQuarter) return false;
                return true;
            });
            
            if (repWeek !== 'All') {
                const savedRewards = localStorage.getItem('company_rewards_history_list');
                let weekRewards = 0;
                if (savedRewards) {
                    try {
                        const list = JSON.parse(savedRewards) as any[];
                        const empRecords = list.filter(r => String(r.employee_id) === String(currentEmployee.id));
                        empRecords.forEach(rec => {
                            let isMatch = false;
                            if (rec.created_at) {
                                const date = new Date(rec.created_at);
                                if (!isNaN(date.getTime())) {
                                    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                                    const mMatch = repMonth === 'All' || months[date.getMonth()].toLowerCase() === repMonth.toLowerCase();
                                    const yMatch = repYear === 'All' || String(date.getFullYear()) === repYear;
                                    const day = date.getDate();
                                    let recWeek = "Week 1";
                                    if (day > 21) recWeek = "Week 4";
                                    else if (day > 14) recWeek = "Week 3";
                                    else if (day > 7) recWeek = "Week 2";
                                    
                                    if (mMatch && yMatch && recWeek === repWeek) {
                                        isMatch = true;
                                    }
                                }
                            }
                            if (isMatch && !(rec.reward_type?.toLowerCase().includes("penalty") || rec.points < 0)) {
                                weekRewards += Math.abs(rec.points || 0);
                            }
                        });
                    } catch (e) {
                        console.error(e);
                    }
                }
                
                if (weekRewards === 0) {
                    const parentMonth = matchMonths[0];
                    weekRewards = parentMonth ? Math.round(parentMonth.rewards / 4) : 15;
                }
                finalRewardPoints = weekRewards;
            } else {
                finalRewardPoints = matchMonths.reduce((sum, m) => sum + m.rewards, 0);
                if (finalRewardPoints === 0 && matchMonths.length > 0) {
                    finalRewardPoints = matchMonths.reduce((sum, m) => {
                        if (m.finalGrade.startsWith("A")) return sum + 200;
                        if (m.finalGrade.startsWith("B")) return sum + 100;
                        return sum;
                    }, 0);
                }
            }
        }

        const leaderboardRanking = currentRank;

        let finalNetPoints = netPoints;
        
        if (repYear !== 'All' || repMonth !== 'All' || repQuarter !== 'All' || repWeek !== 'All') {
            const matchMonths = myMonthlyData.filter(m => {
                if (repYear !== 'All' && m.year !== repYear) return false;
                if (repMonth !== 'All' && m.month.toLowerCase() !== repMonth.toLowerCase()) return false;
                if (repQuarter !== 'All' && m.quarter !== repQuarter) return false;
                return true;
            });

            if (repWeek !== 'All') {
                const matchWeek = myWeeklyData.find(w => 
                    (repYear === 'All' || w.year === repYear) &&
                    (repMonth === 'All' || w.month.toLowerCase() === repMonth.toLowerCase()) &&
                    w.week === repWeek
                );
                const wPerf = matchWeek ? matchWeek.finalScore : 85;
                const wRewards = finalRewardPoints;
                finalNetPoints = Math.round((wPerf + wRewards) * 10) / 10;
            } else {
                finalNetPoints = matchMonths.reduce((sum, m) => sum + m.netPoints, 0);
                if (finalNetPoints === 0 && matchMonths.length > 0) {
                    finalNetPoints = Math.round((finalPerfScore + finalRewardPoints) * 10) / 10;
                }
            }
        }

        return {
            academicGrade,
            rewardPoints: finalRewardPoints,
            leaderboardRanking,
            netPointsBalance: finalNetPoints,
            perfScoreVal: finalPerfScore
        };
    }, [currentEmployee, perfScore, rewardScore, netPoints, currentRank, repYear, repMonth, repWeek, repQuarter, myWeeklyData, myMonthlyData]);

    // Filtering logic for Weekly Reports
    const filteredWeeklyReports = useMemo(() => {
        return myWeeklyData.filter(row => {
            if (repYear !== 'All' && row.year !== repYear) return false;
            if (repMonth !== 'All' && row.month.toLowerCase() !== repMonth.toLowerCase()) return false;
            if (repWeek !== 'All' && row.week.toLowerCase() !== repWeek.toLowerCase()) return false;
            if (repQuarter !== 'All' && row.quarter !== repQuarter) return false;
            if (repSearch) {
                const query = repSearch.toLowerCase();
                const matchComm = row.comments.toLowerCase().includes(query);
                const matchRev = row.reviewer.toLowerCase().includes(query);
                if (!matchComm && !matchRev) return false;
            }
            return true;
        });
    }, [myWeeklyData, repYear, repMonth, repWeek, repQuarter, repSearch]);

    // Filtering logic for Monthly Reports
    const filteredMonthlyReports = useMemo(() => {
        return myMonthlyData.filter(row => {
            if (repYear !== 'All' && row.year !== repYear) return false;
            if (repMonth !== 'All' && row.month.toLowerCase() !== repMonth.toLowerCase()) return false;
            if (repQuarter !== 'All' && row.quarter !== repQuarter) return false;
            if (repSearch) {
                const query = repSearch.toLowerCase();
                const matchComm = row.comments.toLowerCase().includes(query);
                const matchRev = row.reviewer.toLowerCase().includes(query);
                if (!matchComm && !matchRev) return false;
            }
            return true;
        });
    }, [myMonthlyData, repYear, repMonth, repQuarter, repSearch]);

    const activePeriodLabel = useMemo(() => {
        if (repYear === 'All' && repMonth === 'All' && repQuarter === 'All' && repWeek === 'All') {
            return "All-Time Cumulative";
        }
        const parts: string[] = [];
        if (repWeek !== 'All') parts.push(repWeek);
        if (repMonth !== 'All') parts.push(repMonth);
        if (repQuarter !== 'All') parts.push(repQuarter);
        if (repYear !== 'All') parts.push(repYear);
        return `For ${parts.join(', ')}`;
    }, [repYear, repMonth, repQuarter, repWeek]);

    const isEmployeeOnly = userRole !== 'admin' && userRole !== 'hr' && userRole !== 'manager';
    const effectiveRepType = isEmployeeOnly ? 'monthly' : repType;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="mb-4">
                <div className="flex items-center gap-4 mb-4">
                    <button 
                        onClick={() => setView?.('dashboard')}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
                        id="back-to-dashboard-btn"
                    >
                        <i className="fas fa-arrow-left text-slate-600"></i>
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-[#02275A]" id="point-ledger-title">
                            My Performance Reports
                        </h2>
                        <p className="text-slate-500 text-sm" id="point-ledger-subtitle">
                            {`${effectiveRepType === 'weekly' ? filteredWeeklyReports.length : filteredMonthlyReports.length} reports generated`}
                        </p>
                    </div>
                </div>
                {isEmployeeOnly && (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 flex items-center gap-2 text-xs text-indigo-900 font-medium">
                        <i className="fas fa-info-circle text-indigo-600"></i>
                        <span>Weekly entries are recorded internally as administrative logs. Official performance results are calculated and displayed monthly once all weekly entries for the month are completed.</span>
                    </div>
                )}
            </div>

            {/* Stats Summary Grid for Reports */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="report-stats-grid">
                {effectiveRepType === 'weekly' ? (
                    <>
                        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs text-center">
                            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Weekly Reviews</p>
                            <p className="text-xl font-black text-[#02275A] mt-1">{filteredWeeklyReports.length}</p>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs text-center">
                            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Avg Performance Score</p>
                            <p className="text-xl font-black text-indigo-600 mt-1">
                                {filteredWeeklyReports.length > 0 
                                    ? `${Math.round(filteredWeeklyReports.reduce((sum, r) => sum + r.performanceScore, 0) / filteredWeeklyReports.length)}%`
                                    : '—'
                                }
                            </p>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs text-center">
                            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Highest Weekly Score</p>
                            <p className="text-xl font-black text-emerald-600 mt-1">
                                {filteredWeeklyReports.length > 0 
                                    ? `${Math.max(...filteredWeeklyReports.map(r => r.finalScore))}%`
                                    : '—'
                                }
                            </p>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs text-center">
                            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Lowest Weekly Score</p>
                            <p className="text-xl font-black text-rose-500 mt-1">
                                {filteredWeeklyReports.length > 0 
                                    ? `${Math.min(...filteredWeeklyReports.map(r => r.finalScore))}%`
                                    : '—'
                                }
                            </p>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs text-center">
                            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Months Appraised</p>
                            <p className="text-xl font-black text-[#02275A] mt-1">{filteredMonthlyReports.length}</p>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs text-center">
                            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Avg Monthly Score</p>
                            <p className="text-xl font-black text-indigo-600 mt-1">
                                {filteredMonthlyReports.length > 0 
                                    ? `${Math.round(filteredMonthlyReports.reduce((sum, r) => sum + r.monthlyScore, 0) / filteredMonthlyReports.length)}%`
                                    : '—'
                                }
                            </p>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs text-center">
                            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Accumulated Rewards</p>
                            <p className="text-xl font-black text-emerald-600 mt-1">
                                {filteredMonthlyReports.length > 0 
                                    ? `+${filteredMonthlyReports.reduce((sum, r) => sum + r.rewards, 0)} pts`
                                    : '0 pts'
                                }
                            </p>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs text-center">
                            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Penalties Deducted</p>
                            <p className="text-xl font-black text-rose-500 mt-1">
                                {filteredMonthlyReports.length > 0 
                                    ? `-${filteredMonthlyReports.reduce((sum, r) => sum + r.penalties, 0)} pts`
                                    : '0 pts'
                                }
                            </p>
                        </div>
                    </>
                )}
            </div>

            {/* Global Unified Filter Panel */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm mb-2" id="global-unified-filter-panel">
                <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-3 ${showFilters ? 'border-b border-slate-100 pb-3 mb-4' : ''}`}>
                    <div>
                        <h3 className="font-extrabold text-[#02275A] text-sm md:text-base flex items-center gap-2">
                            <i className="fas fa-filter text-indigo-600"></i>
                            <span>Filter Performance Records</span>
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowFilters(!showFilters)}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                        <i className={`fas ${showFilters ? 'fa-eye-slash' : 'fa-filter'}`}></i>
                        <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
                    </button>
                </div>

                {showFilters && (
                    <>
                        {/* Filters Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                            {/* Search Keyword Filter */}
                            <div>
                                <label className="block text-[9px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">Search Keywords</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search comments..."
                                        className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 text-xs rounded-lg pl-8 pr-3 py-1.5 outline-none focus:border-[#02275A]"
                                        value={repSearch}
                                        onChange={(e) => setRepSearch(e.target.value)}
                                    />
                                    <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                                        <i className="fas fa-search text-[10px]"></i>
                                    </div>
                                </div>
                            </div>

                            {/* Year Filter */}
                            <div>
                                <label className="block text-[9px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">Year</label>
                                <select
                                    className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 text-xs rounded-lg px-2.5 py-1.5 outline-none focus:border-[#02275A]"
                                    value={repYear}
                                    onChange={(e) => setRepYear(e.target.value)}
                                >
                                    <option value="All">All Years</option>
                                    {availableYears.map(yr => (
                                        <option key={yr} value={yr}>{yr}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Month Filter */}
                            <div>
                                <label className="block text-[9px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">Month</label>
                                <select
                                    className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 text-xs rounded-lg px-2.5 py-1.5 outline-none focus:border-[#02275A]"
                                    value={repMonth}
                                    onChange={(e) => setRepMonth(e.target.value)}
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

                            {/* Quarter Filter */}
                            <div>
                                <label className="block text-[9px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">Quarter</label>
                                <select
                                    className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 text-xs rounded-lg px-2.5 py-1.5 outline-none focus:border-[#02275A]"
                                    value={repQuarter}
                                    onChange={(e) => setRepQuarter(e.target.value)}
                                >
                                    <option value="All">All Quarters</option>
                                    <option value="Q1">Q1 (Jan - Mar)</option>
                                    <option value="Q2 (Apr - Jun)">Q2 (Apr - Jun)</option>
                                    <option value="Q3">Q3 (Jul - Sep)</option>
                                    <option value="Q4">Q4 (Oct - Dec)</option>
                                </select>
                            </div>

                            {/* Week Filter */}
                            <div>
                                <label className="block text-[9px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">Week (Weekly only)</label>
                                <select
                                    className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 text-xs rounded-lg px-2.5 py-1.5 outline-none focus:border-[#02275A]"
                                    value={repWeek}
                                    onChange={(e) => setRepWeek(e.target.value)}
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

                        {/* Reset filters action row */}
                        <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100">
                            <span className="text-[11px] text-slate-400 font-medium">
                                Showing <strong className="text-[#02275A] font-extrabold">{repType === 'weekly' ? filteredWeeklyReports.length : filteredMonthlyReports.length}</strong> matching appraisals
                            </span>
                            <button
                                onClick={() => {
                                    setRepYear('All');
                                    setRepMonth('All');
                                    setRepWeek('All');
                                    setRepQuarter('All');
                                    setRepSearch('');
                                }}
                                className="text-xs text-indigo-600 hover:text-indigo-800 font-bold transition-colors cursor-pointer"
                            >
                                <i className="fas fa-undo mr-1"></i> Reset Filters
                            </button>
                        </div>
                    </>
                )}
            </div>



            <div className="space-y-6" id="reports-module-page">

                    {/* Table View */}
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm" id="reports-table-container">
                        <div className="overflow-x-auto">
                            {effectiveRepType === 'weekly' ? (
                                <table className="w-full text-left text-sm" id="weekly-reports-table">
                                    <thead className="text-[#02275A] font-bold border-b border-slate-100 bg-slate-50">
                                        <tr>
                                            <th className="px-6 py-4 text-xs uppercase tracking-wider">Week Period</th>
                                            <th className="px-6 py-4 text-xs uppercase tracking-wider text-center">Quarter</th>
                                            <th className="px-6 py-4 text-xs uppercase tracking-wider text-center">Performance Score</th>
                                            <th className="px-6 py-4 text-xs uppercase tracking-wider text-center">Rating Adjustment</th>
                                            <th className="px-6 py-4 text-xs uppercase tracking-wider text-center">Reward Point</th>
                                            <th className="px-6 py-4 text-xs uppercase tracking-wider text-center">Net Point</th>
                                            <th className="px-6 py-4 text-xs uppercase tracking-wider text-center">Grade</th>
                                            <th className="px-6 py-4 text-xs uppercase tracking-wider">Evaluation / Notes</th>
                                            <th className="px-6 py-4 text-xs uppercase tracking-wider">Evaluator</th>
                                            <th className="px-6 py-4 text-xs uppercase tracking-wider">Date Evaluated</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-slate-700 font-medium bg-white">
                                        {filteredWeeklyReports.length > 0 ? (
                                            filteredWeeklyReports.map((row, idx) => {
                                                const grade = calculateGradeFromPerformance(row.finalScore);
                                                return (
                                                    <tr key={idx} className="hover:bg-slate-50/50" id={`weekly-report-row-${idx}`}>
                                                        <td className="px-6 py-4">
                                                            <div className="font-bold text-slate-800">{row.week}</div>
                                                            <div className="text-[10px] text-slate-400 mt-0.5">{row.month} {row.year}</div>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-bold">{row.quarter}</span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center font-semibold">{row.performanceScore}%</td>
                                                        <td className="px-6 py-4 text-center font-mono text-slate-500">{row.ratingPoint > 0 ? `+${row.ratingPoint}` : row.ratingPoint === 0 ? '0' : row.ratingPoint}</td>
                                                        <td className="px-6 py-4 text-center font-bold text-emerald-600">+{row.rewards} pts</td>
                                                        <td className="px-6 py-4 text-center font-black">
                                                            <span className={`px-2 py-0.5 rounded text-xs ${row.netPoints >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                                {row.netPoints >= 0 ? '+' : ''}{row.netPoints} pts
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 rounded-md text-xs font-black">{grade}</span>
                                                        </td>
                                                        <td className="px-6 py-4 text-xs text-slate-500 max-w-xs">{row.comments}</td>
                                                        <td className="px-6 py-4 text-xs font-semibold text-slate-600">{row.reviewer}</td>
                                                        <td className="px-6 py-4 text-xs text-slate-400">{row.reviewDate}</td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr id="empty-weekly-reports-row">
                                                <td colSpan={10} className="px-6 py-12 text-center text-slate-400 italic bg-white">
                                                    No weekly reports found matching the selected filters.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            ) : (
                                <table className="w-full text-left text-sm" id="monthly-reports-table">
                                    <thead className="text-[#02275A] font-bold border-b border-slate-100 bg-slate-50">
                                        <tr>
                                            <th className="px-6 py-4 text-xs uppercase tracking-wider">Month Period</th>
                                            <th className="px-6 py-4 text-xs uppercase tracking-wider text-center">Quarter</th>
                                            <th className="px-6 py-4 text-xs uppercase tracking-wider text-center">Appraisal Score</th>
                                            <th className="px-6 py-4 text-xs uppercase tracking-wider text-center">Rating Adjustment</th>
                                            <th className="px-6 py-4 text-xs uppercase tracking-wider text-center">Final Grade</th>
                                            <th className="px-6 py-4 text-xs uppercase tracking-wider text-center">Rewards</th>
                                            <th className="px-6 py-4 text-xs uppercase tracking-wider text-center">Penalties</th>
                                            <th className="px-6 py-4 text-xs uppercase tracking-wider text-center">Net Points</th>
                                            <th className="px-6 py-4 text-xs uppercase tracking-wider">Feedback Summary</th>
                                            <th className="px-6 py-4 text-xs uppercase tracking-wider">Evaluator</th>
                                            <th className="px-6 py-4 text-xs uppercase tracking-wider text-right">Details</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-slate-700 font-medium bg-white">
                                        {filteredMonthlyReports.length > 0 ? (
                                            filteredMonthlyReports.map((row, idx) => {
                                                const ratingLogForMonth = currentEmployee?.gradeAuditTrail?.find((log: any) => 
                                                    log.type === "rating" && String(log.ratingYear) === String(row.year) && String(log.ratingMonth).toLowerCase() === String(row.month).toLowerCase()
                                                );
                                                const isExpanded = expandedMonthlyRow === idx;
                                                const hasDetails = !!ratingLogForMonth;

                                                return (
                                                    <React.Fragment key={idx}>
                                                        <tr className="hover:bg-slate-50/50" id={`monthly-report-row-${idx}`}>
                                                            <td className="px-6 py-4 font-bold text-slate-800">
                                                                {row.month} {row.year}
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-bold">{row.quarter}</span>
                                                            </td>
                                                            <td className="px-6 py-4 text-center font-semibold">{row.monthlyScore}%</td>
                                                            <td className="px-6 py-4 text-center font-mono text-slate-500">
                                                                {row.ratingPoint > 0 ? `+${row.ratingPoint}` : row.ratingPoint === 0 ? '0' : row.ratingPoint}
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                <span className="px-2.5 py-0.5 bg-[#02275A] text-white rounded-md text-xs font-black">{row.finalGrade}</span>
                                                            </td>
                                                            <td className="px-6 py-4 text-center font-bold text-emerald-600">+{row.rewards} pts</td>
                                                            <td className="px-6 py-4 text-center font-bold text-rose-500">-{row.penalties} pts</td>
                                                            <td className="px-6 py-4 text-center font-black">
                                                                <span className={`px-2 py-0.5 rounded text-xs ${row.netPoints >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                                    {row.netPoints >= 0 ? '+' : ''}{row.netPoints} pts
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-xs text-slate-500 max-w-xs">{row.comments}</td>
                                                            <td className="px-6 py-4 text-xs text-slate-600">
                                                                <div className="font-semibold">{row.reviewer}</div>
                                                                <div className="text-[10px] text-slate-400 mt-0.5">{row.reviewDate}</div>
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                {hasDetails ? (
                                                                    <button
                                                                        onClick={() => setExpandedMonthlyRow(isExpanded ? null : idx)}
                                                                        className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-bold bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded transition-all cursor-pointer"
                                                                    >
                                                                        <span>{isExpanded ? "Hide" : "View"} Details</span>
                                                                        <i className={`fas ${isExpanded ? "fa-chevron-up" : "fa-chevron-down"} text-[9px]`}></i>
                                                                    </button>
                                                                ) : (
                                                                    <span className="text-[10px] text-slate-400 italic">No Rating Added</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                        {isExpanded && ratingLogForMonth && (
                                                            <tr className="bg-indigo-50/10">
                                                                <td colSpan={11} className="px-8 py-5 border-t border-b border-slate-100">
                                                                    <div className="bg-white border border-indigo-100 rounded-xl p-6 shadow-sm space-y-4">
                                                                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                                                            <h4 className="text-sm font-bold text-[#02275A] flex items-center gap-2">
                                                                                <i className="fas fa-medal text-amber-500"></i>
                                                                                <span>Performance Rating details - {row.month} {row.year}</span>
                                                                            </h4>
                                                                            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded font-black border border-indigo-100">
                                                                                Grade Change: {ratingLogForMonth.previousGrade || "—"} → {ratingLogForMonth.newGrade || "—"}
                                                                            </span>
                                                                        </div>
                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                            <div className="space-y-2">
                                                                                <h5 className="text-xs font-bold text-emerald-700 uppercase tracking-wide flex items-center gap-1.5">
                                                                                    <i className="fas fa-arrow-trend-up"></i> Key Strengths
                                                                                </h5>
                                                                                <p className="text-xs text-slate-600 bg-emerald-50/30 p-3 rounded-lg border border-emerald-100/50 leading-relaxed font-semibold">
                                                                                    {ratingLogForMonth.strengths || "No strengths specified."}
                                                                                </p>
                                                                            </div>
                                                                            <div className="space-y-2">
                                                                                <h5 className="text-xs font-bold text-amber-700 uppercase tracking-wide flex items-center gap-1.5">
                                                                                    <i className="fas fa-circle-info"></i> Recommendations / Next Steps
                                                                                </h5>
                                                                                <p className="text-xs text-slate-600 bg-amber-50/30 p-3 rounded-lg border border-amber-100/50 leading-relaxed font-semibold">
                                                                                    {ratingLogForMonth.recommendations || "No recommendations specified."}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="pt-2 flex justify-between items-center text-[10px] text-slate-400 font-bold border-t border-slate-50">
                                                                            <span>Evaluation Method: Monthly Appraisal Validation</span>
                                                                            <span>Authorized on {ratingLogForMonth.dateOfChange || "—"} by {ratingLogForMonth.approvingAuthority || "Admin / HR"}</span>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </React.Fragment>
                                                );
                                            })
                                        ) : (
                                            <tr id="empty-monthly-reports-row">
                                                <td colSpan={11} className="px-6 py-12 text-center text-slate-400 italic bg-white">
                                                    No monthly reports found matching the selected filters.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
        </div>
    );
};

export default EmployeeHistoryView;
