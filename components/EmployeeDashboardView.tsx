import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { calculateEmployeePerformanceBalance, calculateKPIContribution, Employee, EmployeeKPI, initialEmployees, normalizeEmployeesList } from './AdminHRCenterView';

interface EmployeeDashboardViewProps {
    setView?: (view: string) => void;
}

const EmployeeDashboardView: React.FC<EmployeeDashboardViewProps> = ({ setView }) => {
    const employeesList = React.useMemo(() => {
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

    const currentEmployee = React.useMemo(() => {
        let loggedInEmail = localStorage.getItem('logged_in_email') || 'employee@gmail.com';

        if (loggedInEmail === 'marketer@gmail.com' || loggedInEmail === 'marketer') {
            loggedInEmail = 'marketer@gmail.com';
        } else if (loggedInEmail === 'customersuccess@gmail.com') {
            loggedInEmail = 'customersuccess@gmail.com';
        } else if (loggedInEmail === 'callagent@gmail.com') {
            loggedInEmail = 'b.danladi@company.com';
        }

        const userEmp = employeesList.find(e => e.email === loggedInEmail);
        if (userEmp) return userEmp;
        const nonLeadEmp = employeesList.find(e => e.is_team_lead === false);
        if (nonLeadEmp) return nonLeadEmp;
        return employeesList[0] || null;
    }, [employeesList]);

    const [expandedPeriodKey, setExpandedPeriodKey] = React.useState<string | null>("July 2026");

    const historicalPeriods = React.useMemo(() => {
        if (!currentEmployee) return [];
        const periods: Record<string, { year: string, month: string, weeks: any[], monthlyReview?: any }> = {};

        // Add weekly reviews
        if (Array.isArray(currentEmployee.weeklyReviews)) {
            currentEmployee.weeklyReviews.forEach((rev) => {
                const key = `${rev.month} ${rev.year}`;
                if (!periods[key]) {
                    periods[key] = { year: String(rev.year), month: String(rev.month), weeks: [] };
                }
                periods[key].weeks.push(rev);
            });
        }

        // Add monthly reviews
        if (Array.isArray(currentEmployee.monthlyReviews)) {
            currentEmployee.monthlyReviews.forEach((rev) => {
                const key = `${rev.month} ${rev.year}`;
                if (!periods[key]) {
                    periods[key] = { year: String(rev.year), month: String(rev.month), weeks: [] };
                }
                periods[key].monthlyReview = rev;
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
    }, [currentEmployee]);

    const reviewerName = React.useMemo(() => {
        if (!currentEmployee) return "HR Department";
        if (currentEmployee.reports_to) {
            const mgr = employeesList.find(e => e.employeeId === currentEmployee.reports_to);
            if (mgr) {
                return `${mgr.firstName} ${mgr.lastName}`;
            }
        }
        return "HR Department";
    }, [currentEmployee, employeesList]);

    const getPeriodSummary = React.useCallback((period: { year: string, month: string, weeks: any[], monthlyReview?: any }) => {
        let totalScore = 0;
        let avgScore = 0;
        let grade: "A+" | "A" | "B+" | "B" | "C" | "D" | "F" = "B";

        if (period.weeks.length > 0) {
            totalScore = period.weeks.reduce((sum, w) => sum + (w.performanceScore || 0), 0);
            avgScore = Math.round(totalScore / period.weeks.length);
        } else if (period.monthlyReview) {
            avgScore = period.monthlyReview.performanceScore || 0;
            totalScore = avgScore;
        }

        if (avgScore >= 95) grade = "A+";
        else if (avgScore >= 90) grade = "A";
        else if (avgScore >= 80) grade = "B+";
        else if (avgScore >= 70) grade = "B";
        else if (avgScore >= 60) grade = "C";
        else if (avgScore >= 50) grade = "D";
        else grade = "F";

        let rewards = 0;
        let penalties = 0;
        
        const savedRewards = localStorage.getItem('company_rewards_history_list');
        if (savedRewards && currentEmployee) {
            try {
                const list = JSON.parse(savedRewards) as any[];
                const empRecords = list.filter(r => String(r.employee_id) === String(currentEmployee.id));
                
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
                        const isPenalty = rec.reward_type?.toLowerCase().includes("penalty") || rec.points < 0;
                        const pts = Math.abs(rec.points || 0);
                        if (isPenalty) {
                            penalties += pts;
                        } else {
                            rewards += pts;
                        }
                    }
                });
            } catch (e) {
                console.error(e);
            }
        } else {
            if (period.month === "July" && period.year === "2026") {
                rewards = 35;
                penalties = 5;
            } else if (period.month === "June" && period.year === "2026") {
                rewards = 15;
                penalties = 0;
            }
        }

        const netPoints = rewards - penalties;

        return {
            totalScore,
            avgScore,
            grade,
            rewards,
            penalties,
            netPoints
        };
    }, [currentEmployee]);

    const perfScore = React.useMemo(() => {
        if (!currentEmployee) return 80;
        return currentEmployee.kpis ? calculateEmployeePerformanceBalance(currentEmployee.kpis) : currentEmployee.performanceScore;
    }, [currentEmployee]);

    const rewardScore = React.useMemo(() => {
        if (!currentEmployee) return 10;
        return currentEmployee.rewardPoints !== undefined ? currentEmployee.rewardPoints : 100;
    }, [currentEmployee]);

    const netBalance = perfScore + rewardScore;
    const currentGrade = currentEmployee?.grade || 'B+';

    // Build responsive department leaderboard
    const deptLeaderboard = React.useMemo(() => {
        if (!currentEmployee) return [];
        const deptEmps = employeesList.filter(e => e.department === currentEmployee.department);
        return deptEmps.map(emp => {
            const empPerf = emp.kpis ? calculateEmployeePerformanceBalance(emp.kpis) : emp.performanceScore;
            const empPoints = emp.rewardPoints !== undefined ? emp.rewardPoints : 100;
            return {
                id: emp.id,
                name: `${emp.firstName} ${emp.lastName}`,
                initials: `${emp.firstName[0]}${emp.lastName[0]}`,
                pts: empPerf + empPoints,
                isCurrent: emp.id === currentEmployee.id
            };
        }).sort((a, b) => b.pts - a.pts);
    }, [employeesList, currentEmployee]);
    
    const currentRank = React.useMemo(() => {
        const idx = deptLeaderboard.findIndex(u => u.isCurrent);
        return idx !== -1 ? idx + 1 : 3;
    }, [deptLeaderboard]);

    const rankSuffix = React.useMemo(() => {
        return currentRank === 1 ? '1st' : currentRank === 2 ? '2nd' : currentRank === 3 ? '3rd' : `${currentRank}th`;
    }, [currentRank]);

    // Graph trends
    const data = [
        { name: 'Week 1', points: Math.max(0, netBalance - 15) },
        { name: 'Week 2', points: Math.max(0, netBalance - 5) },
        { name: 'Week 3', points: netBalance },
    ];

    const recentActivities = React.useMemo(() => {
        if (!currentEmployee || !currentEmployee.gradeAuditTrail || currentEmployee.gradeAuditTrail.length === 0) {
            return [
                { id: 'act-1', reason: 'Exceptional goal completions this quarter.', policy: 'Quarterly Review', points: 25, date: '2026-06-18', positive: true },
                { id: 'act-2', reason: 'Hub discussion non-reaction warning.', policy: 'Communication Breach', points: -5, date: '2026-06-12', positive: false },
                { id: 'act-3', reason: 'Zero-Bug production delivery congratulations.', policy: 'Code Excellence Reward', points: 15, date: '2026-06-10', positive: true }
            ];
        }
        return currentEmployee.gradeAuditTrail.map((audit) => {
            const negative = audit.reason.toLowerCase().includes('deduct') || audit.reason.toLowerCase().includes('breach');
            return {
                id: audit.id,
                reason: audit.reason,
                policy: audit.policyResponsible || 'Performance Evaluation',
                points: negative ? -5 : 10,
                date: audit.dateOfChange,
                positive: !negative
            };
        });
    }, [currentEmployee]);

    let gradeBg = 'bg-blue-600';
    if (currentGrade === 'A+' || currentGrade === 'A') gradeBg = 'bg-emerald-500';
    if (currentGrade === 'B+' || currentGrade === 'B') gradeBg = 'bg-blue-600';
    if (currentGrade === 'C') gradeBg = 'bg-amber-500';
    if (currentGrade === 'D' || currentGrade === 'F') gradeBg = 'bg-rose-500';

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6 animate-fade-in text-left">
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-[#02275A] mb-1">
                        Welcome back, {currentEmployee ? `${currentEmployee.firstName} ${currentEmployee.lastName}` : 'Team Member'}!
                    </h2>
                    <p className="text-sm text-slate-500 font-medium">Logged in Scope: <span className="font-bold text-[#02275A]">{currentEmployee?.role} ({currentEmployee?.department})</span> &bull; Status: Good Standing</p>
                </div>
                <div className="text-xs font-mono bg-slate-100 px-3 py-1.5 rounded-lg text-slate-500 border border-slate-200">
                    ID: {currentEmployee?.employeeId || 'EMP-NG-001'}
                </div>
            </div>

            {/* Personal Performance Section */}
            <div>
                <h3 className="font-bold text-[#02275A] text-sm mb-4">My Performance</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col items-center justify-center shadow-sm h-32">
                        <div className="w-10 h-10 bg-slate-200 text-slate-700 rounded-full flex items-center justify-center font-bold text-lg mb-2 shadow-sm border border-slate-300">
                            {currentGrade}
                        </div>
                        <h3 className="font-bold text-[#02275A] text-sm">{currentGrade} Grade</h3>
                        <p className="text-[11px] text-slate-500">#{currentRank} in Department</p>
                    </div>
                    
                    <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col shadow-sm h-32">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Performance Points</p>
                        <h3 className="text-3xl font-bold text-green-600 mb-1">{perfScore}</h3>
                        <p className="text-[11px] text-slate-500 mt-auto">Current performance score</p>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col shadow-sm h-32">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <i className="far fa-star text-orange-400"></i> Reward Points
                        </p>
                        <h3 className="text-3xl font-bold text-orange-400 mb-1">{rewardScore}</h3>
                        <p className="text-[11px] text-slate-500 mt-auto">Available to redeem</p>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col shadow-sm h-32">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">My Leaderboard</p>
                        <div className="flex items-center gap-3 mt-1">
                            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-sm border border-amber-200">
                                {rankSuffix}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-700">Top 10%</p>
                                <button onClick={() => setView?.('history')} className="text-[11px] text-[#02275A] hover:underline mt-0.5 inline-block">View History &rarr;</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Performance Tracker Section */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 mt-4 shadow-sm animate-fade-in">
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
                        <h4 className="font-bold text-slate-800 text-sm tracking-tight">Performance Tracker</h4>
                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#EEFDF4] border border-[#BFF6D4] text-[#14532D] rounded-full text-[10px] font-bold">
                            <i className="far fa-bell text-[#16A34A]"></i>
                            <span>Grade {currentGrade} — you're in good standing</span>
                        </div>
                    </div>

                    {/* Score Labels Row */}
                    <div className="flex justify-between items-end text-[11px] font-bold text-slate-600 mb-1.5">
                        <span>Your score: <strong className="text-[#02275A] font-extrabold">{perfScore} pts</strong></span>
                        <span className="text-slate-400 font-medium">Grade drops below: <strong className="text-slate-700 font-bold">75 pts</strong></span>
                    </div>

                    {/* Multi-colored Progress Bar with drop threshold indicator line */}
                    <div className="h-1.5 w-full bg-[#E8EAED] rounded-full mb-4 relative overflow-visible">
                        <div className="h-full bg-[#10B981] rounded-full transition-all" style={{ width: `${Math.min(100, Math.max(0, perfScore))}%` }}></div>
                        {/* Orange threshold indicator tick mark at 75% from left */}
                        <div className="absolute left-[75%] top-0 bottom-0 w-[2.5px] bg-[#F59E0B] z-10" title="Drop threshold"></div>
                    </div>

                    {/* Under the Bar Alerts */}
                    <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 mb-4">
                        {/* No points deducted checkmark */}
                        {perfScore >= 100 ? (
                            <div className="flex items-start gap-2.5">
                                <div className="text-[#0F9D58] text-base mt-0.5 select-none shrink-0">
                                    <i className="far fa-check-circle"></i>
                                </div>
                                <div>
                                    <h5 className="font-bold text-slate-800 text-xs">No points deducted</h5>
                                    <p className="text-[11px] text-slate-500 mt-0.5">You haven't broken any policy rules yet</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-start gap-2.5">
                                <div className="text-[#EA4335] text-base mt-0.5 select-none shrink-0">
                                    <i className="fas fa-exclamation-circle text-red-500"></i>
                                </div>
                                <div>
                                    <h5 className="font-bold text-slate-800 text-xs">{100 - perfScore} points deducted</h5>
                                    <p className="text-[11px] text-slate-500 mt-0.5">Deducted from KPI target deficits or infractions</p>
                                </div>
                            </div>
                        )}

                        {/* Buffer alert card on the right */}
                        <div className="bg-[#FEF6E9] border border-[#FDE3B2] rounded-lg px-4 py-2 flex items-start gap-2 max-w-sm">
                            <div className="text-[#D97706] text-xs shrink-0 mt-0.5">
                                <i className="fas fa-exclamation-triangle"></i>
                            </div>
                            <div>
                                <p className="text-[10px] text-[#78350F] leading-tight font-semibold">
                                    {perfScore - 75 > 0 ? `Lose ${perfScore - 75} more pts and your grade drops further` : 'Your score has dropped below the warning limit'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Legend Section */}
                    <div className="border-t border-slate-100 pt-3 flex items-center gap-4 text-[10px] text-slate-400 font-bold select-none">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#10B981] inline-block"></span>
                            <span>Current score</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#F59E0B] inline-block"></span>
                            <span>Drop threshold</span>
                        </div>
                    </div>
                </div>
            </div>



            {/* Points Trend */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h3 className="font-bold text-[#02275A] text-sm mb-6">Net Points Trend (Calculated)</h3>
                <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0e7490" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#0e7490" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#64748b', fontSize: 11 }}
                                dy={10}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#64748b', fontSize: 11 }}
                            />
                            <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="points" 
                                stroke="#0e7490" 
                                fillOpacity={1} 
                                fill="url(#colorPoints)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col h-full">
                    <h3 className="font-bold text-[#02275A] text-sm mb-6">Evaluation Audit Trail</h3>
                    
                    <div className="space-y-6 flex-1">
                        {recentActivities.slice(0, 4).map((act, i) => (
                            <div key={act.id || i} className="flex items-start gap-3">
                                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${act.positive ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-slate-800 line-clamp-2">{act.reason}</p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">{act.policy}</p>
                                </div>
                                <div className="text-right ml-4">
                                    <p className={`text-sm font-bold ${act.positive ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {act.positive ? '+' : ''}{act.points}
                                    </p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">{act.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button 
                        onClick={() => setView?.('history')}
                        className="text-[13px] font-bold text-[#02275A] mt-6 hover:underline text-left inline-flex items-center gap-1 w-fit cursor-pointer"
                    >
                        See Full History <i className="fas fa-arrow-right text-[10px]"></i>
                    </button>
                </div>

                {/* Leaderboard */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col h-full">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-[#02275A] text-sm">Department Competitors Ranking</h3>
                        <button 
                            onClick={() => setView?.('leaderboard')}
                            className="text-[13px] font-bold text-[#02275A] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                            View All <i className="fas fa-arrow-right text-[10px]"></i>
                        </button>
                    </div>

                    <div className="space-y-2 flex-1">
                        {deptLeaderboard.slice(0, 5).map((user, idx) => {
                            const rank = idx + 1;
                            const isEmpCurrent = user.isCurrent;
                            return (
                                <div key={user.id} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                                    isEmpCurrent 
                                    ? 'bg-indigo-50/55 border-indigo-150 text-indigo-900 font-bold' 
                                    : 'bg-white border-transparent hover:bg-slate-50/50'
                                }`}>
                                    <div className={`w-6 h-6 rounded-full text-[11px] font-black flex items-center justify-center shadow-inner ${
                                        rank === 1 ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                        rank === 2 ? 'bg-slate-100 text-slate-700 border border-slate-200' :
                                        'bg-slate-50 text-slate-500'
                                    }`}>
                                        {rank}
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold ring-1 ring-slate-100 shadow-xs">
                                        {user.initials}
                                    </div>
                                    <div className="flex-1 font-semibold text-[13px] truncate">
                                        {user.name} {isEmpCurrent && <span className="text-indigo-500 text-xs font-normal">(You)</span>}
                                    </div>
                                    <div className="font-bold text-[13px] text-slate-800 font-mono">
                                        {user.pts} <span className="text-slate-400 font-normal text-xs">pts</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboardView;
