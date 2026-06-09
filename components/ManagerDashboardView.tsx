import React, { useState } from 'react';
import MetricCard from './MetricCard';

interface ManagerDashboardViewProps {
    setView: (view: string) => void;
}

const ManagerDashboardView: React.FC<ManagerDashboardViewProps> = ({ setView }) => {
    const [showInsight, setShowInsight] = useState(true);
    const userName = "State Manager";
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // Mock Data
    const stateManagers = [
        { rank: 1, name: 'Fatima A.', state: 'Kano State', score: '98%', color: 'bg-amber-400 text-white' },
        { rank: 2, name: 'Musa B.', state: 'Abuja FCT', score: '94%', color: 'bg-slate-400 text-white' },
        { rank: 4, name: 'You', state: 'Lagos State', score: '82%', color: 'bg-indigo-400 text-white' },
    ];

    const underperformingAgents = [
        { initials: 'MK', name: 'Musa K.', zone: 'Badagry', issue: 'No Sales (30 Days)', action: 'Call' },
        { initials: 'SA', name: 'Sarah A.', zone: 'Ikorodu', issue: 'Low Conversion', action: 'Train' },
    ];

    const annualTargets = {
        year: '2024',
        customers: { current: 1250, target: 2000, progress: 62.5 },
        revenue: { current: '₦145M', target: '₦300M', rawCurrent: 145, rawTarget: 300, progress: 48.3 },
        daysLeft: 142
    };

    return (
        <div className="w-full mx-auto px-6 md:px-8 py-6 animate-fade-in relative pb-24">
            
            {/* Welcome Message */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[#02275A]">Welcome, State Manager</h1>
                <p className="text-sm text-slate-500">Here's what's happening in your state today.</p>
            </div>

            {/* Insight Banner */}
            {showInsight && (
                <div className="mb-8 bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start justify-between relative overflow-hidden">
                    <div className="flex items-start gap-4 relative z-10">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-[#02275A] shrink-0">
                            <i className="fas fa-robot text-lg"></i>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-[#02275A] uppercase tracking-wider mb-1">AI Insight</h4>
                            <p className="text-sm text-[#02275A]">
                                Your conversion rate dropped 2% in <span className="font-bold">Ikeja Axis</span>. Consider scheduling a training session with Agents there.
                            </p>
                        </div>
                    </div>
                    <button onClick={() => setShowInsight(false)} className="text-blue-300 hover:text-blue-500 transition-colors"><i className="fas fa-times"></i></button>
                </div>
            )}

            {/* Commission & Targets Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Agents Weekly Commission Status */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-[#02275A] text-xs uppercase tracking-wide">Agents Commission (This Week)</h3>
                            <span className="bg-blue-50 text-blue-600 text-[10px] px-2 py-1 rounded-full font-bold">Week 42</span>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                        <i className="fas fa-check"></i>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-bold uppercase">Paid Out</p>
                                        <p className="text-[10px] text-slate-400">To Agents</p>
                                    </div>
                                </div>
                                <span className="font-bold text-emerald-700 text-lg">₦1,250,000</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                                        <i className="fas fa-clock"></i>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-bold uppercase">Pending</p>
                                        <p className="text-[10px] text-slate-400">Processing</p>
                                    </div>
                                </div>
                                <span className="font-bold text-amber-700 text-lg">₦450,000</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                         <p className="text-[10px] text-slate-400">Total processed this week: <span className="font-bold text-slate-600">₦1,700,000</span></p>
                         <button className="text-[10px] font-bold text-[#02275A] hover:underline">View History</button>
                    </div>
                </div>

                {/* Annual Targets Card */}
                <div className="bg-[#02275A] rounded-2xl p-6 text-white shadow-md relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <p className="text-blue-200 text-[10px] font-bold uppercase tracking-wider mb-1">Annual Goals • {annualTargets.year}</p>
                                <h3 className="text-xl font-bold text-white">State Targets</h3>
                            </div>
                            <div className="bg-white/10 px-3 py-1 rounded-lg border border-white/10 backdrop-blur-sm text-center">
                                <p className="text-lg font-bold text-white">{annualTargets.daysLeft}</p>
                                <p className="text-[10px] text-blue-200 uppercase font-bold">Days Left</p>
                            </div>
                        </div>

                        <div className="space-y-5">
                            {/* Revenue Target */}
                            <div>
                                <div className="flex justify-between text-xs mb-1.5">
                                    <span className="text-blue-100 font-medium">Revenue Target</span>
                                    <span className="font-bold text-white">{annualTargets.revenue.current} / {annualTargets.revenue.target}</span>
                                </div>
                                <div className="w-full bg-black/20 rounded-full h-2.5">
                                    <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-full rounded-full shadow-lg relative" style={{ width: `${annualTargets.revenue.progress}%` }}>
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-white rounded-full"></div>
                                    </div>
                                </div>
                                <p className="text-[10px] text-emerald-400 mt-1 text-right font-bold">{annualTargets.revenue.progress}% Achieved</p>
                            </div>

                            {/* Customer Target */}
                            <div>
                                <div className="flex justify-between text-xs mb-1.5">
                                    <span className="text-blue-100 font-medium">Customer Acquisition</span>
                                    <span className="font-bold text-white">{annualTargets.customers.current.toLocaleString()} / {annualTargets.customers.target.toLocaleString()}</span>
                                </div>
                                <div className="w-full bg-black/20 rounded-full h-2.5">
                                    <div className="bg-gradient-to-r from-blue-400 to-indigo-400 h-full rounded-full shadow-lg relative" style={{ width: `${annualTargets.customers.progress}%` }}>
                                         <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-white rounded-full"></div>
                                    </div>
                                </div>
                                <p className="text-[10px] text-blue-300 mt-1 text-right font-bold">{annualTargets.customers.progress}% Achieved</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <MetricCard 
                    icon="fa-users" 
                    colorClass="bg-blue-50 text-blue-600" 
                    title="Total Agents" 
                    value="142" 
                    subtext={<p className="text-xs text-emerald-600 font-semibold flex items-center gap-1"><i className="fas fa-arrow-up"></i> +5 this week</p>}
                    onClick={() => setView('manager-agents')}
                />
                <MetricCard 
                    icon="fa-store" 
                    colorClass="bg-indigo-50 text-indigo-600" 
                    title="Total Customers" 
                    value="2,845" 
                    subtext={<p className="text-xs text-emerald-600 font-semibold flex items-center gap-1"><i className="fas fa-arrow-up"></i> +124 New</p>}
                />
                <MetricCard 
                    icon="fa-money-bill-wave" 
                    colorClass="bg-blue-50 text-[#02275A]" 
                    title="State Revenue" 
                    value="₦4.2M" 
                    subtext={<p className="text-xs text-emerald-600 font-semibold flex items-center gap-1"><i className="fas fa-arrow-up"></i> 12% vs last month</p>}
                />
                <MetricCard 
                    icon="fa-flask" 
                    colorClass="bg-amber-50 text-amber-600" 
                    title="Free Trials" 
                    value="45" 
                    subtext={<p className="text-xs text-rose-500 font-semibold">8 Expiring Soon</p>}
                    onClick={() => setView('manager-reports')}
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Active vs Inactive Customers Pie */}
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col items-center justify-center">
                    <h3 className="font-bold text-slate-800 mb-6 w-full text-left border-b border-slate-50 pb-2">Customers Activity Status</h3>
                    <div className="flex items-center gap-8">
                        <div className="w-40 h-40 rounded-full shadow-inner relative" style={{background: 'conic-gradient(#10b981 0% 92%, #f43f5e 92% 100%)'}}>
                            <div className="absolute inset-0 m-auto w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm">
                                <div className="text-center">
                                    <span className="text-xs text-slate-400">Total</span>
                                    <span className="text-slate-800 font-bold text-xl block">2,845</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                <div>
                                    <p className="text-xs text-slate-500">Active</p>
                                    <p className="text-sm font-bold text-slate-800">2,617 (92%)</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                                <div>
                                    <p className="text-xs text-slate-500">Inactive</p>
                                    <p className="text-sm font-bold text-slate-800">228 (8%)</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* State Revenue Target Radial */}
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col items-center justify-center">
                    <h3 className="font-bold text-slate-800 mb-6 w-full text-left border-b border-slate-50 pb-2">State Revenue Target</h3>
                    <div className="flex items-center gap-8">
                        <div className="w-40 h-40 rounded-full relative flex items-center justify-center" style={{background: 'conic-gradient(#02275A 0% 72%, #e2e8f0 72% 100%)'}}>
                            <div className="w-32 h-32 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
                                <span className="text-3xl font-bold text-[#02275A]">72%</span>
                                <span className="text-[10px] text-slate-400 uppercase tracking-wide">Achieved</span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Target Revenue</p>
                                <p className="text-sm font-bold text-slate-800">₦5,800,000</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Actual Revenue</p>
                                <p className="text-sm font-bold text-[#02275A]">₦4,200,000</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Rate Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-xl border border-slate-100 p-5">
                    <p className="text-xs text-slate-500 font-bold mb-3 uppercase">Agent Activation Rate</p>
                    <div className="flex items-end justify-between">
                        <h3 className="text-3xl font-bold text-slate-800">65%</h3>
                        <div className="h-10 w-20 flex items-end gap-1">
                            <div className="bg-indigo-200 w-1/4 h-[40%] rounded-t"></div>
                            <div className="bg-indigo-300 w-1/4 h-[60%] rounded-t"></div>
                            <div className="bg-indigo-500 w-1/4 h-[80%] rounded-t"></div>
                            <div className="bg-indigo-600 w-1/4 h-full rounded-t"></div>
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2">New Agents making 1st sale</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-100 p-5">
                    <p className="text-xs text-slate-500 font-bold mb-3 uppercase">Customer Retention Rate</p>
                    <div className="flex items-end justify-between">
                        <h3 className="text-3xl font-bold text-emerald-600">94%</h3>
                        <div className="w-12 h-12 rounded-full border-4 border-emerald-100 border-t-emerald-600 flex items-center justify-center">
                            <i className="fas fa-check text-emerald-600"></i>
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2">Customers active &gt; 3 months</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-100 p-5">
                    <p className="text-xs text-slate-500 font-bold mb-3 uppercase">State Churn Rate</p>
                    <div className="flex items-end justify-between">
                        <h3 className="text-3xl font-bold text-rose-600">4.2%</h3>
                        <div className="w-12 h-12 rounded-full border-4 border-rose-100 border-t-rose-600 flex items-center justify-center">
                            <i className="fas fa-arrow-down text-rose-600"></i>
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2">Business churn in state</p>
                </div>
            </div>

            {/* Bottom Section: Underperforming Agents & Leaderboard */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Underperforming Agents List */}
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-bold text-slate-800 text-sm">Underperforming Agents</h3>
                        <button className="text-xs text-[#02275A] font-bold hover:underline" onClick={() => setView('manager-reports')}>View All</button>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {underperformingAgents.map((agent, i) => (
                            <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold">{agent.initials}</div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-700">{agent.name}</p>
                                        <p className="text-[10px] text-rose-500 font-semibold"><i className="fas fa-exclamation-circle"></i> {agent.issue}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="w-8 h-8 rounded-full bg-[#02275A]/10 text-[#02275A] flex items-center justify-center hover:bg-[#02275A]/20" title="Call"><i className="fas fa-phone"></i></button>
                                    <button className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100" title="Message"><i className="fas fa-comment-dots"></i></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top State Managers Leaderboard */}
                <div className="bg-[#02275A] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 opacity-10">
                        <i className="fas fa-trophy text-9xl -mr-4 -mt-4"></i>
                    </div>
                    
                    <h3 className="font-bold text-white text-sm mb-6 relative z-10 flex items-center gap-2">
                        <i className="fas fa-chart-simple"></i> TOP STATE MANAGERS
                    </h3>

                    <div className="space-y-4 relative z-10">
                        {stateManagers.map((manager) => (
                            <div key={manager.rank} className={`flex items-center justify-between ${manager.name === 'You' ? 'bg-white/10 -mx-2 px-2 py-2 rounded-lg border border-white/10' : ''}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${manager.color}`}>
                                        {manager.rank}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">{manager.name}</p>
                                        <p className="text-[10px] text-blue-200">{manager.state}</p>
                                    </div>
                                </div>
                                <span className="font-bold text-white">{manager.score}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Desktop FAB (Simple) */}
            <button 
                onClick={() => setView('manager-agents')}
                className="hidden md:flex fixed bottom-8 right-8 w-14 h-14 bg-[#02275A] text-white rounded-full shadow-lg hover:bg-[#02275A]/90 transition-transform hover:scale-105 active:scale-95 items-center justify-center z-40"
            >
                <i className="fas fa-plus text-xl"></i>
            </button>

        </div>
    );
};

export default ManagerDashboardView;
