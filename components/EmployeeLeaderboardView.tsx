import React, { useState, useMemo } from 'react';
import { initialEmployees, Employee, EmployeeKPI } from './AdminHRCenterView';
import { calculateKPIContribution, getRoleCategory } from './AdminPerformanceView';

interface Member {
    initials: string;
    name: string;
    dept: string;
    pts: number;
    isYou?: boolean;
    role: string;
    employeeId: string;
}

const EmployeeLeaderboardView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'all' | 'dept'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Load active real-time employee evaluation states from company_employees_kpi_state
    const employees = useMemo<Employee[]>(() => {
        const saved = localStorage.getItem('company_employees_kpi_state');
        if (saved) {
            try {
                return JSON.parse(saved) as Employee[];
            } catch (e) {
                console.error("Failed to parse saved kpis data", e);
            }
        }

        // Standard Default KPI templates fallback
        const CORE_KPIS_TEMPLATES = [
            { id: 'core-1', name: 'Punctuality & Attendance', type: 'Percentage', weight: 5, currentValue: 95, targetValue: 100, unit: '%', maxWeightRange: 20 },
            { id: 'core-2', name: 'Team Player & Collaboration', type: 'Binary', weight: 5, currentValue: 1, targetValue: 1, unit: 'yes/no', maxWeightRange: 20 },
            { id: 'core-3', name: 'Communication Adeptness', type: 'Percentage', weight: 5, currentValue: 90, targetValue: 100, unit: '%', maxWeightRange: 20 },
            { id: 'core-4', name: 'Administrative Compliance', type: 'Percentage', weight: 5, currentValue: 90, targetValue: 100, unit: '%', maxWeightRange: 20 }
        ];

        const ROLE_KPINAMES_TEMPLATES = {
            marketer: [
                { id: 'item-mk-1', name: 'Leads generated', type: 'Target-Based', weight: 25, targetValue: 150, currentValue: 135, unit: 'leads' },
                { id: 'item-mk-2', name: 'Cost per lead', type: 'Deductive', weight: 20, targetValue: 10, currentValue: 8, unit: '$' },
                { id: 'item-mk-3', name: 'Qualified lead rate', type: 'Percentage', weight: 20, targetValue: 100, currentValue: 85, unit: '%' },
                { id: 'item-mk-4', name: 'Campaign conversion', type: 'Percentage', weight: 15, targetValue: 100, currentValue: 78, unit: '%' }
            ],
            sales: [
                { id: 'item-sl-1', name: 'Revenue achieved', type: 'Target-Based', weight: 35, targetValue: 500000, currentValue: 420000, unit: '₦' },
                { id: 'item-sl-2', name: 'Deals closed', type: 'Target-Based', weight: 25, targetValue: 12, currentValue: 10, unit: 'deals' },
                { id: 'item-sl-3', name: 'Conversion rate', type: 'Percentage', weight: 20, targetValue: 100, currentValue: 80, unit: '%' }
            ],
            support: [
                { id: 'item-su-1', name: 'SLA compliance', type: 'Percentage', weight: 30, targetValue: 100, currentValue: 96, unit: '%' },
                { id: 'item-su-2', name: 'First response rate', type: 'Percentage', weight: 20, targetValue: 100, currentValue: 92, unit: '%' },
                { id: 'item-su-3', name: 'Resolution rate', type: 'Percentage', weight: 15, targetValue: 100, currentValue: 90, unit: '%' },
                { id: 'item-su-4', name: 'CSAT', type: 'Percentage', weight: 15, targetValue: 100, currentValue: 94, unit: '%' }
            ],
            engineer: [
                { id: 'item-en-1', name: 'Engineering deductions', type: 'Deductive', weight: 25, targetValue: 10, currentValue: 1, unit: 'deductions' },
                { id: 'item-en-2', name: 'Delivery quality', type: 'Percentage', weight: 20, targetValue: 100, currentValue: 94, unit: '%' },
                { id: 'item-en-3', name: 'Bug impact', type: 'Deductive', weight: 20, targetValue: 10, currentValue: 2, unit: 'bugs' },
                { id: 'item-en-4', name: 'Sprint commitment', type: 'Percentage', weight: 15, targetValue: 100, currentValue: 95, unit: '%' }
            ],
            cxsuccess: [
                { id: 'item-cx-1', name: 'Renewal Revenue', type: 'Target-Based', weight: 20, targetValue: 300000, currentValue: 280000, unit: '₦' },
                { id: 'item-cx-2', name: 'Retention Rate', type: 'Percentage', weight: 15, targetValue: 100, currentValue: 96, unit: '%' },
                { id: 'item-cx-3', name: 'Expansion Revenue', type: 'Target-Based', weight: 15, targetValue: 800000, currentValue: 600000, unit: '₦' },
                { id: 'item-cx-4', name: 'Customer Health Score', type: 'Percentage', weight: 10, targetValue: 100, currentValue: 88, unit: '%' },
                { id: 'item-cx-5', name: 'Product Adoption', type: 'Percentage', weight: 10, targetValue: 100, currentValue: 85, unit: '%' }
            ]
        };

        return initialEmployees.map((emp, idx) => {
            const cat = getRoleCategory(emp.role, emp.department);
            const rolePresets = ROLE_KPINAMES_TEMPLATES[cat] || ROLE_KPINAMES_TEMPLATES.support;
            const combined = [
                ...rolePresets.map(k => ({ ...k })),
                ...CORE_KPIS_TEMPLATES.map(k => ({ ...k }))
            ];
            return {
                ...emp,
                kpis: combined as unknown as EmployeeKPI[],
                rewardPoints: emp.rewardPoints ?? Math.floor(Math.random() * 80 + 20)
            };
        });
    }, []);

    // Process roster using exact 9-step Score calculation engine
    const processedLeaderboard = useMemo(() => {
        return employees.map(emp => {
            let roleScoreSum = 0;
            let coreScoreSum = 0;

            if (emp.kpis) {
                emp.kpis.forEach(kpi => {
                    const contribution = calculateKPIContribution(kpi);
                    if (kpi.id.startsWith('core-') || kpi.id.startsWith('custom-core-') || kpi.id.startsWith('item-cc-') || kpi.id.includes('item-cc')) {
                        coreScoreSum += contribution;
                    } else {
                        roleScoreSum += contribution;
                    }
                });
            }

            // Step 3 & 4 weights lops
            const roleScore = Math.max(0, Math.min(80, roleScoreSum));
            const coreScore = Math.max(0, Math.min(20, coreScoreSum));
            
            // Step 5
            const baseScoreSum = Math.round(roleScore + coreScore);

            // Step 6 Caps & Penalties
            const penalty = emp.specialPenalty || 0;
            const cap = emp.perfCap !== undefined ? emp.perfCap : 100;
            const performanceBalance = Math.max(0, Math.min(cap, baseScoreSum) - penalty);

            // Step 7 & 8
            const rewardPoints = emp.rewardPoints || 0;
            const netBalance = Math.max(0, performanceBalance + rewardPoints);

            const initials = `${emp.firstName.charAt(0)}${emp.lastName.charAt(0)}`.toUpperCase();

            // Reward Category logic based on Net Balance
            let awardTier = 'Bronze Class Contributor';
            let awardBadge = '🥉';
            if (netBalance >= 120) {
                awardTier = 'Platinum Executive Star';
                awardBadge = '⭐';
            } else if (netBalance >= 100) {
                awardTier = 'Elite Gold Performer';
                awardBadge = '🥇';
            } else if (netBalance >= 85) {
                awardTier = 'Silver Star Achiever';
                awardBadge = '🥈';
            }

            return {
                id: emp.id,
                employeeId: emp.employeeId,
                initials,
                name: `${emp.firstName} ${emp.lastName}`,
                dept: emp.department,
                role: emp.role,
                pts: netBalance,
                isYou: emp.is_user_account || emp.id === '1', // identify current user account
                awardTier,
                awardBadge,
                roleScore,
                coreScore,
                performanceBalance,
                rewardPoints
            };
        });
    }, [employees]);

    // Filter members based on selected tab and search query
    const filteredMembers = useMemo(() => {
        return processedLeaderboard.filter(member => {
            const matchesTab = activeTab === 'all' || member.dept === 'Sales' || member.dept === 'Engineering' || member.isYou;
            const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  member.dept.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  member.role.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesTab && matchesSearch;
        });
    }, [processedLeaderboard, activeTab, searchQuery]);

    // Sort by netBalance (pts) desc
    const sortedMembers = useMemo(() => {
        return [...filteredMembers].sort((a, b) => b.pts - a.pts);
    }, [filteredMembers]);

    // Assign ranking based on all processed members, so ranking remains accurate even on filtered view!
    const rankedMembers = useMemo(() => {
        const globalSorted = [...processedLeaderboard].sort((a,b) => b.pts - a.pts);
        return sortedMembers.map(member => {
            const globalRank = globalSorted.findIndex(e => e.id === member.id) + 1;
            return {
                ...member,
                rank: globalRank
            };
        });
    }, [sortedMembers, processedLeaderboard]);

    // Top 3 for the podium based on whole ranking
    const podiumMembers = useMemo(() => {
        const globalSorted = [...processedLeaderboard].sort((a,b) => b.pts - a.pts);
        const top1 = globalSorted[0];
        const top2 = globalSorted[1];
        const top3 = globalSorted[2];

        return {
            top1: top1 ? { ...top1, rank: 1 } : null,
            top2: top2 ? { ...top2, rank: 2 } : null,
            top3: top3 ? { ...top3, rank: 3 } : null,
        };
    }, [processedLeaderboard]);

    // Table members (the remaining ones that are not in Top 3, or all search matches)
    const listMembers = searchQuery.trim().length > 0
        ? rankedMembers
        : rankedMembers.filter(m => m.rank > 3);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6 animate-fade-in" id="performance-leaderboard-view">
            {/* Title Block */}
            <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-slate-100 pb-5">
                <div>
                    <span className="text-[10px] uppercase font-black text-indigo-500 tracking-wider">Net Balance Lead Indices</span>
                    <h1 id="leaderboard_title" className="text-3xl font-black text-[#02275A] font-sans tracking-tight">
                        Global Performance Leaderboard
                    </h1>
                    <p className="text-xs text-slate-400 font-bold mt-1">
                        Live indices computed from Role KPIs (80%), Conduct (20%), Disciplinary Penalties, Caps, and Reward Points.
                    </p>
                </div>
                <div className="flex gap-2 shrink-0">
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full border border-emerald-200">
                        ⭐ Realtime scoring Active
                    </span>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200 shadow-sm">
                    <button
                        id="tab_all"
                        onClick={() => setActiveTab('all')}
                        className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
                            activeTab === 'all'
                                ? 'bg-[#02275A] text-white shadow-md'
                                : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
                        }`}
                    >
                        Whole Company
                    </button>
                    <button
                        id="tab_dept"
                        onClick={() => setActiveTab('dept')}
                        className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
                            activeTab === 'dept'
                                ? 'bg-[#02275A] text-white shadow-md'
                                : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
                        }`}
                    >
                        My Cohort Department
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                        <i className="fas fa-search text-xs"></i>
                    </span>
                    <input
                        id="leaderboard_search"
                        type="text"
                        placeholder="Search employee or role..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all"
                    />
                </div>
            </div>

            {/* Podium Card Layout (Only shown when not searching) */}
            {searchQuery.trim().length === 0 && (
                <div className="bg-gradient-to-b from-slate-50 to-white rounded-3xl border border-slate-200/60 p-8 shadow-xs mb-6 flex flex-col justify-center">
                    <h2 className="text-center font-black uppercase text-xs tracking-widest text-[#02275A] mb-8">
                        👑 Standardized Net Balance Winners Podium 👑
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto w-full items-end pb-2">
                        
                        {/* Rank 2 (Left) */}
                        {podiumMembers.top2 ? (
                            <div className="bg-white border border-slate-200 rounded-2xl px-6 py-6 flex flex-col items-center justify-center text-center shadow-xs relative transition-all hover:translate-y-[-4px] order-2 md:order-1 min-h-[220px]">
                                <div className="absolute -top-6">
                                    <span className="text-3xl">🥈</span>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-slate-100 text-[#02275A] flex items-center justify-center font-black text-xs border-2 border-white shadow-xs mb-3">
                                    {podiumMembers.top2.initials}
                                </div>
                                <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1 leading-tight">
                                    {podiumMembers.top2.name}
                                    {podiumMembers.top2.isYou && (
                                        <span className="bg-amber-100 text-amber-800 text-[8px] font-black px-1 rounded uppercase tracking-wider">You</span>
                                    )}
                                </h3>
                                <p className="text-[10px] text-slate-400 font-extrabold mt-0.5 uppercase tracking-wider font-mono">
                                    {podiumMembers.top2.role}
                                </p>
                                <span className="bg-indigo-50 text-indigo-800 text-[8px] font-black px-2 py-0.5 rounded-full mt-2 uppercase tracking-tight">
                                    {podiumMembers.top2.awardBadge} {podiumMembers.top2.awardTier}
                                </span>
                                <div className="bg-[#02275A] text-white px-4 py-1.5 rounded-lg text-xs font-black mt-4 shadow-sm font-mono">
                                    {podiumMembers.top2.pts} pts
                                </div>
                            </div>
                        ) : null}

                        {/* Rank 1 (Center) */}
                        {podiumMembers.top1 ? (
                            <div className="bg-white border-2 border-amber-300 rounded-3xl px-6 py-8 flex flex-col items-center justify-center text-center shadow-md relative transition-all hover:translate-y-[-6px] order-1 md:order-2 min-h-[260px]">
                                <div className="absolute -top-7 scale-110">
                                    <span className="text-4xl">🥇</span>
                                </div>
                                <div className="w-16 h-16 rounded-full bg-amber-400 text-white flex items-center justify-center font-black text-base border-4 border-white shadow-md mb-3">
                                    {podiumMembers.top1.initials}
                                </div>
                                <h3 className="font-black text-[#02275A] text-base flex items-center gap-1 leading-tight">
                                    {podiumMembers.top1.name}
                                    {podiumMembers.top1.isYou && (
                                        <span className="bg-amber-100 text-amber-800 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">You</span>
                                    )}
                                </h3>
                                <p className="text-[10px] text-amber-700 font-extrabold mt-0.5 uppercase tracking-wider font-mono">
                                    {podiumMembers.top1.role}
                                </p>
                                <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-2.5 py-0.5 rounded-full mt-2 uppercase tracking-tight border border-amber-300">
                                    {podiumMembers.top1.awardBadge} {podiumMembers.top1.awardTier}
                                </span>
                                <div className="bg-amber-500 text-white px-5 py-2 rounded-xl text-sm font-black mt-4 shadow-md font-mono border border-amber-300">
                                    {podiumMembers.top1.pts} pts
                                </div>
                            </div>
                        ) : null}

                        {/* Rank 3 (Right) */}
                        {podiumMembers.top3 ? (
                            <div className="bg-white border border-slate-200 rounded-2xl px-6 py-6 flex flex-col items-center justify-center text-center shadow-xs relative transition-all hover:translate-y-[-4px] order-3 md:order-3 min-h-[220px]">
                                <div className="absolute -top-6">
                                    <span className="text-3xl">🥉</span>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-orange-100 text-[#C2410C] flex items-center justify-center font-black text-xs border-2 border-white shadow-xs mb-3">
                                    {podiumMembers.top3.initials}
                                </div>
                                <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1 leading-tight">
                                    {podiumMembers.top3.name}
                                    {podiumMembers.top3.isYou && (
                                        <span className="bg-amber-100 text-amber-800 text-[8px] font-black px-1 rounded uppercase tracking-wider">You</span>
                                    )}
                                </h3>
                                <p className="text-[10px] text-slate-400 font-extrabold mt-0.5 uppercase tracking-wider font-mono">
                                    {podiumMembers.top3.role}
                                </p>
                                <span className="bg-orange-50 text-orange-800 text-[8px] font-black px-2 py-0.5 rounded-full mt-2 uppercase tracking-tight">
                                    {podiumMembers.top3.awardBadge} {podiumMembers.top3.awardTier}
                                </span>
                                <div className="bg-[#02275A] text-white px-4 py-1.5 rounded-lg text-xs font-black mt-4 shadow-sm font-mono">
                                    {podiumMembers.top3.pts} pts
                                </div>
                            </div>
                        ) : null}

                    </div>
                </div>
            )}

            {/* Table section for remaining ranks */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                    <table id="leaderboard_table" className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 text-slate-400 font-extrabold text-[10px] uppercase bg-slate-50 tracking-wider">
                                <th className="px-6 py-4 w-24">Rank</th>
                                <th className="px-6 py-4">Employee Member</th>
                                <th className="px-6 py-4">Department / Core Role</th>
                                <th className="px-6 py-4">Accolade Medal Class</th>
                                <th className="px-6 py-4 text-right">Computed Net Balance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                            {listMembers.length > 0 ? (
                                listMembers.map((member) => (
                                    <tr key={member.id} className="hover:bg-slate-50/40 transition-colors">
                                        <td className="px-6 py-4 font-mono font-black text-slate-400 text-xs">
                                            #{member.rank}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 text-[#02275A] flex items-center justify-center text-[10px] font-black">
                                                    {member.initials}
                                                </div>
                                                <div>
                                                    <span className="font-extrabold text-slate-800 text-xs block">
                                                        {member.name}
                                                        {member.isYou && (
                                                            <span className="bg-amber-100 text-amber-800 text-[8px] font-black px-1.5 py-0.5 rounded ml-1.5 uppercase tracking-wider">You</span>
                                                        )}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 capitalize font-medium">{member.role}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                                            {member.dept}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-slate-700">
                                                <span>{member.awardBadge}</span>
                                                <span>{member.awardTier}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-mono font-black text-[#02275A] text-xs bg-indigo-50/50 border border-indigo-100 px-2.5 py-1 rounded">
                                                {member.pts} points
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">
                                        {rankedMembers.length === 0 ? 'No employees matches search query.' : 'All top performing employees are showcased on the podium above.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default EmployeeLeaderboardView;
