import React, { useState } from 'react';

const ManagerPerformanceView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'kpi' | 'reward' | 'progression'>('kpi');
    const [timeFilter, setTimeFilter] = useState('Monthly');

    // --- MOCK DATA FOR STATE MANAGER ---
    const monthlyRevenueData = [
        { label: 'Jan', value: 45, amount: '₦4.5M' },
        { label: 'Feb', value: 52, amount: '₦5.2M' },
        { label: 'Mar', value: 48, amount: '₦4.8M' },
        { label: 'Apr', value: 60, amount: '₦6.0M' },
        { label: 'May', value: 55, amount: '₦5.5M' },
        { label: 'Jun', value: 75, amount: '₦7.5M' },
        { label: 'Jul', value: 68, amount: '₦6.8M' },
        { label: 'Aug', value: 62, amount: '₦6.2M' },
        { label: 'Sep', value: 85, amount: '₦8.5M' },
        { label: 'Oct', value: 70, amount: '₦7.0M' },
        { label: 'Nov', value: 78, amount: '₦7.8M' },
        { label: 'Dec', value: 92, amount: '₦9.2M' }
    ];

    const weeklyRevenueData = [
        { label: 'Wk 1', value: 50, amount: '₦1.5M' },
        { label: 'Wk 2', value: 65, amount: '₦1.9M' },
        { label: 'Wk 3', value: 60, amount: '₦1.8M' },
        { label: 'Wk 4', value: 80, amount: '₦2.4M' },
        { label: 'Wk 5', value: 55, amount: '₦1.6M' },
        { label: 'Wk 6', value: 85, amount: '₦2.5M' },
        { label: 'Wk 7', value: 70, amount: '₦2.1M' },
        { label: 'Wk 8', value: 75, amount: '₦2.2M' },
        { label: 'Wk 9', value: 90, amount: '₦2.7M' },
        { label: 'Wk 10', value: 65, amount: '₦1.9M' },
        { label: 'Wk 11', value: 95, amount: '₦2.8M' },
        { label: 'Wk 12', value: 80, amount: '₦2.4M' }
    ];

    const dailyRevenueData = [
        { label: 'Mon', value: 40, amount: '₦400k' },
        { label: 'Tue', value: 55, amount: '₦550k' },
        { label: 'Wed', value: 70, amount: '₦700k' },
        { label: 'Thu', value: 60, amount: '₦600k' },
        { label: 'Fri', value: 85, amount: '₦850k' },
        { label: 'Sat', value: 90, amount: '₦900k' },
        { label: 'Sun', value: 30, amount: '₦300k' },
        { label: 'Mon', value: 50, amount: '₦500k' },
        { label: 'Tue', value: 65, amount: '₦650k' },
        { label: 'Wed', value: 75, amount: '₦750k' },
        { label: 'Thu', value: 65, amount: '₦650k' },
        { label: 'Fri', value: 90, amount: '₦900k' }
    ];

    const salesData = timeFilter === 'Monthly' ? monthlyRevenueData : timeFilter === 'Weekly' ? weeklyRevenueData : dailyRevenueData;

    const getYAxisLabels = () => {
        if (timeFilter === 'Monthly') return ['₦10M', '₦7.5M', '₦5.0M', '₦2.5M', '0'];
        if (timeFilter === 'Weekly') return ['₦3.0M', '₦2.2M', '₦1.5M', '₦750k', '0'];
        return ['₦1.0M', '₦750k', '₦500k', '₦250k', '0'];
    };

    const yAxisLabels = getYAxisLabels();
    
    // Manager Leaderboard (Comparing State Managers)
    const leaderboardData = [
        { rank: 1, name: "Abuja Manager", state: "FCT", level: "Regional Manager", xp: 1050000, revenue: "₦125M", retention: "96%", agents: 45, isMe: false },
        { rank: 2, name: "Lagos Manager", state: "Lagos", level: "Senior State Manager", xp: 720000, revenue: "₦98M", retention: "94%", agents: 38, isMe: true }, // Current User
        { rank: 3, name: "Rivers Manager", state: "Rivers", level: "Senior State Manager", xp: 680000, revenue: "₦85M", retention: "92%", agents: 32, isMe: false },
        { rank: 4, name: "Kano Manager", state: "Kano", level: "Senior State Manager", xp: 550000, revenue: "₦62M", retention: "90%", agents: 28, isMe: false },
        { rank: 5, name: "Oyo Manager", state: "Oyo", level: "State Manager", xp: 480000, revenue: "₦54M", retention: "89%", agents: 25, isMe: false },
    ];

    const weeklyLeaderboard = [
        { rank: 1, name: "Abuja Manager", region: "North Central", revenue: "₦8.5M", points: 12400, badges: 5, avatar: "AM" },
        { rank: 2, name: "Lagos Manager", region: "South West", revenue: "₦7.2M", points: 10500, badges: 4, avatar: "LM", isMe: true },
        { rank: 3, name: "Rivers Manager", region: "South South", revenue: "₦6.9M", points: 9800, badges: 3, avatar: "RM" },
        { rank: 4, name: "Kano Manager", region: "North West", revenue: "₦5.5M", points: 7500, badges: 2, avatar: "KM" },
        { rank: 5, name: "Enugu Manager", region: "South East", revenue: "₦4.8M", points: 6200, badges: 2, avatar: "EM" },
    ];

    const badges = [
        { name: "State Launch", icon: "fa-flag", color: "text-white", bg: "bg-gradient-to-br from-emerald-400 to-emerald-600", desc: "Successfully launched operations in state", date: "Jan 15, 2023", unlocked: true, isOneTime: true, xp: 5000, count: 1 },
        { name: "Revenue Titan", icon: "fa-money-bill-wave", color: "text-white", bg: "bg-gradient-to-br from-amber-400 to-orange-500", desc: "Hit ₦50M State Revenue", date: "Jun 20, 2023", unlocked: true, isOneTime: true, xp: 10000, count: 1 },
        { name: "Team Builder", icon: "fa-users", color: "text-white", bg: "bg-gradient-to-br from-[#02275A] to-blue-900", desc: "Recruited 20+ Active Agents", date: "Mar 10, 2023", unlocked: true, isOneTime: true, xp: 8000, count: 1 },
        { name: "Retention Guardian", icon: "fa-shield-alt", color: "text-white", bg: "bg-gradient-to-br from-indigo-400 to-purple-600", desc: ">90% State Retention for 6 months", date: "Oct 15, 2023", unlocked: true, isOneTime: false, xp: 12000, count: 1 },
        { name: "Expansion Master", icon: "fa-map-marked-alt", color: "text-white", bg: "bg-gradient-to-br from-blue-400 to-cyan-500", desc: "Opened 5 new zones", date: "Nov 01, 2023", unlocked: true, isOneTime: false, xp: 15000, count: 1 },
        { name: "Millionaire Maker", icon: "fa-hand-holding-usd", color: "text-white", bg: "bg-gradient-to-br from-pink-500 to-rose-500", desc: "Helped 5 agents reach ₦1M sales", date: "Sep 10, 2023", unlocked: true, isOneTime: false, xp: 20000, count: 5 },
        { name: "National Top 3", icon: "fa-trophy", color: "text-slate-400", bg: "bg-slate-100", desc: "Ranked in top 3 states nationally", date: "Locked", unlocked: false, isOneTime: false, xp: 25000, count: 0 },
        { name: "Century Club", icon: "fa-building", color: "text-slate-400", bg: "bg-slate-100", desc: "Onboard 100 Businesses in a month", date: "Locked", unlocked: false, isOneTime: false, xp: 15000, count: 0 },
        { name: "Zero Churn", icon: "fa-infinity", color: "text-slate-400", bg: "bg-slate-100", desc: "0% Churn for a whole quarter", date: "Locked", unlocked: false, isOneTime: false, xp: 30000, count: 0 },
    ];

    const rankDetails = [
        { name: "State Manager", xp: 0, req: "Manage State Operations", benefit: "Base Salary + Override" },
        { name: "Senior State Manager", xp: 500000, req: "Hit ₦100M Revenue", benefit: "Higher Override + Bonus" },
        { name: "Regional Manager", xp: 1000000, req: "Manage Multiple States", benefit: "Profit Share + Car" },
        { name: "National Director", xp: 2500000, req: "National Operations", benefit: "Board Seat + Equity" },
        { name: "International Leader", xp: 5000000, req: "Global Operations", benefit: "Global Profit Share" },
    ];
    
    // Heatmap fake data (last 28 days) - State Level Activity
    const activityIntensity = [
        2, 3, 3, 2, 1, 3, 3, 
        3, 3, 3, 2, 1, 2, 3, 
        3, 2, 1, 1, 2, 3, 3, 
        3, 3, 2, 2, 1, 2, 3
    ];

    const renderKPIView = () => (
        <div className="space-y-6 animate-fade-in">
            {/* Analytics Header & Score */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Overall Score */}
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">State Performance Score</p>
                        <h2 className="text-4xl font-extrabold text-slate-800">88<span className="text-lg text-slate-400 font-medium">/100</span></h2>
                        <div className="mt-2 inline-flex items-center px-2 py-1 rounded bg-emerald-50 text-emerald-600 text-[10px] font-bold">
                            <i className="fas fa-check-circle mr-1"></i> Excellent
                        </div>
                    </div>
                    <div className="w-24 h-24 rounded-full border-8 border-slate-100 border-t-[#02275A] border-r-[#02275A] flex items-center justify-center relative rotate-45">
                        <i className="fas fa-chart-line text-2xl text-[#02275A]/30 -rotate-45"></i>
                    </div>
                </div>

                {/* Sales Volume Tracker */}
                <div className="md:col-span-2 bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="font-bold text-slate-800">State Revenue Tracker</h3>
                            <p className="text-xs text-slate-500">Cumulative revenue from all agents</p>
                        </div>
                        <div className="flex bg-slate-100 rounded-lg p-1">
                            {['Daily', 'Weekly', 'Monthly'].map(tf => (
                                <button 
                                    key={tf}
                                    onClick={() => setTimeFilter(tf)}
                                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${timeFilter === tf ? 'bg-white text-[#02275A] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    {tf}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {/* Chart Container */}
                    <div className="flex h-56 gap-4">
                        {/* Y-Axis */}
                        <div className="flex flex-col justify-between text-[10px] text-slate-400 font-medium pb-6 pt-1 h-full text-right w-12 shrink-0">
                            {yAxisLabels.map((label, idx) => (
                                <span key={idx}>{label}</span>
                            ))}
                        </div>
                        
                        {/* Plot Area */}
                        <div className="flex-1 relative h-full">
                            {/* Horizontal Grid Lines */}
                            <div className="absolute inset-0 flex flex-col justify-between pb-6 pt-2 h-full pointer-events-none">
                                <div className="border-t border-slate-100 border-dashed w-full h-0"></div>
                                <div className="border-t border-slate-100 border-dashed w-full h-0"></div>
                                <div className="border-t border-slate-100 border-dashed w-full h-0"></div>
                                <div className="border-t border-slate-100 border-dashed w-full h-0"></div>
                                <div className="border-b border-slate-200 w-full h-0"></div>
                            </div>
                            
                            {/* Bars & X-Axis Labels Container */}
                            <div className="flex items-end justify-between h-full gap-2 pb-6 pt-2 relative z-10 pl-1">
                                {salesData.map((data, i) => (
                                    <div key={i} className="w-full h-full flex flex-col justify-end group cursor-pointer relative">
                                        {/* Bar */}
                                        <div 
                                            className="w-full bg-[#02275A] rounded-t-sm transition-all duration-500 group-hover:bg-[#02275A]/90 relative"
                                            style={{ height: `${data.value}%` }}
                                        >
                                            {/* Tooltip */}
                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded pointer-events-none whitespace-nowrap z-20 shadow-lg">
                                                {data.amount}
                                                <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                                            </div>
                                        </div>
                                        {/* X-Axis Label */}
                                        <div className="absolute -bottom-6 left-0 right-0 text-[10px] text-slate-400 font-medium text-center truncate">
                                            {data.label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Widgets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Target vs Actual */}
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-xs text-slate-500 font-bold uppercase mb-2">State Target vs Actual</p>
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-xl font-bold text-slate-800">₦98M</span>
                        <span className="text-xs text-slate-400 font-medium">Target: ₦120M</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-gradient-to-r from-[#02275A] to-blue-500 h-2 rounded-full" style={{ width: '81%' }}></div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 text-right">81% Achieved</p>
                </div>

                {/* Retention & Churn */}
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center">
                    <div className="mb-3">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="font-bold text-slate-600">State Retention</span>
                            <span className="font-bold text-emerald-600">94%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '94%' }}></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="font-bold text-slate-600">State Churn</span>
                            <span className="font-bold text-rose-600">3%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                            <div className="bg-rose-500 h-1.5 rounded-full" style={{ width: '3%' }}></div>
                        </div>
                    </div>
                </div>

                {/* Active Agents */}
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-500 font-bold uppercase mb-1">Active Agents</p>
                        <h3 className="text-2xl font-bold text-slate-800">38<span className="text-sm text-slate-400 font-medium">/45</span></h3>
                        <p className="text-[10px] text-emerald-600 font-bold mt-1"><i className="fas fa-arrow-up"></i> +3 new this month</p>
                    </div>
                    <div className="w-12 h-12 bg-[#02275A]/10 rounded-full flex items-center justify-center text-[#02275A] text-lg">
                        <i className="fas fa-users"></i>
                    </div>
                </div>

                {/* Activity Heatmap */}
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-xs text-slate-500 font-bold uppercase mb-2">State Activity Intensity</p>
                    <div className="grid grid-cols-7 gap-1.5">
                        {activityIntensity.map((intensity, idx) => (
                            <div 
                                key={idx} 
                                title={`Day ${idx + 1}`}
                                className={`w-full aspect-square rounded-sm ${
                                    intensity === 0 ? 'bg-slate-100' : 
                                    intensity === 1 ? 'bg-emerald-200' : 
                                    intensity === 2 ? 'bg-emerald-400' : 'bg-emerald-600'
                                }`}
                            ></div>
                        ))}
                    </div>
                    <div className="flex justify-between items-center mt-2 text-[8px] text-slate-400 uppercase">
                        <span>Low</span>
                        <span>High</span>
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Performance Weighting */}
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4 text-sm">State KPI Weighting</h3>
                    <div className="space-y-4">
                        {[
                            { label: 'Total Revenue', val: 85, detail: '₦98M' },
                            { label: 'Active Agents', val: 84, detail: '38/45' },
                            { label: 'State Retention', val: 94, detail: '94%' },
                            { label: 'Compliance', val: 98, detail: '98%' }
                        ].map((m, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-slate-600">{m.label} <span className="text-slate-400 text-[10px]">({m.detail})</span></span>
                                    <span className="font-bold text-slate-800">{m.val}%</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-1.5">
                                    <div className={`h-1.5 rounded-full ${m.val >= 90 ? 'bg-emerald-500' : m.val >= 70 ? 'bg-[#02275A]' : 'bg-amber-500'}`} style={{ width: `${m.val}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Reviews & Upsell */}
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="font-bold text-slate-800 mb-4 text-sm">State Satisfaction Score</h3>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-3xl font-bold text-amber-500">4.6</span>
                            <div className="text-amber-400 text-sm">
                                <i className="fas fa-star"></i>
                                <i className="fas fa-star"></i>
                                <i className="fas fa-star"></i>
                                <i className="fas fa-star"></i>
                                <i className="fas fa-star-half-alt"></i>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500">Average rating across all state agents</p>
                    </div>
                    <div className="mt-6 pt-6 border-t border-slate-50">
                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">State Upsell Impact</p>
                        <p className="text-xl font-bold text-emerald-600">₦12,500,000</p>
                        <p className="text-[10px] text-slate-400">Total additional revenue generated</p>
                    </div>
                </div>

                {/* Customer Mix */}
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center relative">
                    <h3 className="font-bold text-slate-800 mb-4 text-sm w-full text-left">State Customer Mix</h3>
                    <div className="w-32 h-32 rounded-full relative" style={{ background: 'conic-gradient(#10b981 0% 80%, #e2e8f0 80% 100%)' }}>
                        <div className="absolute inset-0 m-auto w-20 h-20 bg-white rounded-full flex flex-col items-center justify-center">
                            <span className="text-xl font-bold text-slate-800">1,240</span>
                            <span className="text-[8px] text-slate-400 uppercase">Total</span>
                        </div>
                    </div>
                    <div className="flex gap-4 mt-4">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            <span className="text-xs text-slate-600">Active (80%)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                            <span className="text-xs text-slate-600">Inactive (20%)</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );

    const renderRewardView = () => (
        <div className="space-y-6 animate-fade-in">
            {/* Premium Monthly Bonus Card */}
            <div className="bg-gradient-to-br from-[#011530] to-black rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden border border-indigo-900/30">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-center md:text-left flex-1">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider">
                                Current Goal
                            </span>
                        </div>
                        <h2 className="text-3xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">State Manager Quarterly Bonus</h2>
                        <p className="text-indigo-200 text-sm max-w-sm mx-auto md:mx-0">Hit the state revenue target of ₦150M this quarter to unlock the official car reward.</p>
                    </div>
                    
                    <div className="w-full md:w-5/12 bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
                        <div className="flex justify-between items-end mb-1">
                            <span className="text-xs font-bold text-indigo-200 uppercase">Progress</span>
                            <span className="text-2xl font-bold text-white">65%</span>
                        </div>
                        <div className="w-full bg-black/40 rounded-full h-3 mb-3 overflow-hidden border border-white/5">
                            <div className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full relative shadow-[0_0_15px_rgba(16,185,129,0.4)]" style={{ width: '65%' }}>
                                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-indigo-300">Target: ₦150M</span>
                            <div className="flex items-center gap-1.5 text-amber-400 font-bold bg-amber-400/10 px-2 py-1 rounded">
                                <i className="fas fa-car"></i> Reward: Official Car
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Badges Grid */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 md:p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">State Trophy Cabinet</h3>
                        <p className="text-xs text-slate-500">Collect badges based on your state's performance!</p>
                    </div>
                    <div className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                        {badges.filter(b => b.unlocked).length} / {badges.length} Unlocked
                    </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {badges.map((badge, idx) => (
                        <div key={idx} className={`relative flex flex-col items-center text-center p-5 rounded-2xl transition-all duration-300 group border ${badge.unlocked ? 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-lg cursor-pointer' : 'bg-slate-50 border-slate-100 opacity-60 grayscale'}`}>
                            
                            {/* Icon Container */}
                            <div className={`w-16 h-16 ${badge.bg} rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-md transform group-hover:scale-110 transition-transform duration-300 ring-4 ring-white relative`}>
                                <i className={`fas ${badge.icon} ${badge.color}`}></i>
                                {badge.unlocked && !badge.isOneTime && badge.count > 1 && (
                                    <div className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                        x{badge.count}
                                    </div>
                                )}
                            </div>
                            
                            {/* Content */}
                            <h4 className={`font-bold text-sm mb-1 ${badge.unlocked ? 'text-slate-800' : 'text-slate-500'}`}>{badge.name}</h4>
                            <p className="text-[10px] text-slate-400 leading-tight mb-3 line-clamp-2 min-h-[2.5em]">{badge.desc}</p>
                            
                            {/* Footer Status */}
                            <div className={`text-[9px] font-bold px-2 py-1 rounded-full w-full flex justify-between items-center ${badge.unlocked ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                                <span>{badge.unlocked ? (badge.isOneTime ? 'Earned' : `Won x${badge.count}`) : 'Locked'}</span>
                                <span className="flex items-center gap-0.5"><i className="fas fa-bolt text-[8px]"></i> {badge.xp}</span>
                            </div>

                            {/* Shine Effect for unlocked */}
                            {badge.unlocked && (
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/0 via-white/40 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" style={{ backgroundSize: '200% 200%' }}></div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Rewards List */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 text-sm">Reward History</h3>
                    <button className="text-xs text-[#02275A] font-bold hover:underline">View All</button>
                </div>
                <div className="divide-y divide-slate-50">
                    {[
                        { date: 'Oct 01, 2023', reward: 'Q3 Best State Manager', amount: '₦500,000', status: 'Paid', icon: 'fa-trophy', color: 'bg-amber-100 text-amber-600' },
                        { date: 'Sep 15, 2023', reward: 'Expansion Bonus (5 Zones)', amount: '₦250,000', status: 'Paid', icon: 'fa-map-marked-alt', color: 'bg-blue-100 text-blue-600' },
                        { date: 'Aug 30, 2023', reward: 'August Revenue Target', amount: '₦150,000', status: 'Paid', icon: 'fa-bullseye', color: 'bg-indigo-100 text-indigo-600' },
                        { date: 'Jun 20, 2023', reward: 'Revenue Titan Bonus', amount: '₦1,000,000', status: 'Paid', icon: 'fa-money-bill-wave', color: 'bg-emerald-100 text-emerald-600' }
                    ].map((item, i) => (
                        <div key={i} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.color}`}>
                                    <i className={`fas ${item.icon}`}></i>
                                </div>
                                <div>
                                    <p className="font-bold text-slate-700 text-sm">{item.reward}</p>
                                    <p className="text-xs text-slate-500">{item.date}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-emerald-600">{item.amount}</p>
                                <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded font-bold border border-emerald-100">{item.status}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderProgressionView = () => (
        <div className="space-y-6 animate-fade-in">
            {/* Rank Card */}
            <div className="bg-gradient-to-br from-[#02275A] via-blue-900 to-[#02275A] rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                    <div className="w-24 h-24 relative flex items-center justify-center">
                         {/* Hexagon Shape Mock */}
                        <div className="absolute inset-0 m-auto w-20 h-20 bg-gradient-to-b from-amber-400 to-orange-600 rounded-full animate-pulse opacity-20"></div>
                        <i className="fas fa-crown text-5xl text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]"></i>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                            <h2 className="text-3xl font-extrabold tracking-tight">Senior State Manager</h2>
                            <div className="bg-rose-500/20 border border-rose-500/50 px-2 py-0.5 rounded text-[10px] font-bold text-rose-300 flex items-center gap-1">
                                <i className="fas fa-fire"></i> Top 3 Nationally
                            </div>
                        </div>
                        <p className="text-indigo-200 text-sm mb-4">Level 2 • 720,000 XP</p>
                        
                        <div className="w-full bg-black/30 h-3 rounded-full border border-white/10 relative">
                            <div className="absolute -top-6 right-0 text-xs text-indigo-300">Next: Regional Manager (1M XP)</div>
                            <div className="bg-gradient-to-r from-indigo-400 to-purple-400 h-full rounded-full shadow-[0_0_15px_rgba(129,140,248,0.6)]" style={{ width: '44%' }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Rank Progression Path */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 overflow-hidden">
                <h3 className="font-bold text-slate-800 mb-4">Manager Career Path</h3>
                <div className="flex flex-nowrap overflow-x-auto pb-4 gap-4 no-scrollbar">
                    {rankDetails.map((rank, i) => (
                        <div key={i} className={`flex-shrink-0 w-64 p-4 rounded-xl border transition-all ${
                            rank.name === 'Senior State Manager' ? 'border-[#02275A] bg-[#02275A]/5 ring-2 ring-[#02275A]/10' : 
                            i < 1 ? 'border-emerald-100 bg-emerald-50/30 grayscale' : 'border-slate-100 bg-white opacity-60'
                        }`}>
                            <div className="flex justify-between items-start mb-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${rank.name === 'Senior State Manager' ? 'bg-[#02275A] text-white' : i < 1 ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                    {i + 1}
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${rank.name === 'Senior State Manager' ? 'bg-[#02275A]/10 text-[#02275A]' : i < 1 ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                    {rank.xp.toLocaleString()} XP
                                </span>
                            </div>
                            <h4 className={`font-bold text-sm mb-1 ${rank.name === 'Senior State Manager' ? 'text-[#02275A]' : 'text-slate-800'}`}>{rank.name}</h4>
                            <div className="text-xs text-slate-500 mb-2 min-h-[32px]">
                                <span className="font-bold text-slate-700">Req:</span> {rank.req}
                            </div>
                            <div className="text-[10px] text-slate-400 border-t border-slate-200 pt-2">
                                <i className="fas fa-gift mr-1"></i> {rank.benefit}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Weekly Regional Leaderboard (Moved from Rewards) */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                            <i className="fas fa-trophy text-amber-500"></i> Weekly National Leaderboard
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">Comparing Top State Managers</p>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-white border border-slate-200 px-2 py-1 rounded">
                        <i className="far fa-clock"></i> Resets in 2d 14h
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100 text-xs text-slate-500 uppercase">
                            <tr>
                                <th className="px-5 py-3 text-center w-16">Rank</th>
                                <th className="px-5 py-3">Manager</th>
                                <th className="px-5 py-3">State Revenue</th>
                                <th className="px-5 py-3 text-center">Badges Won</th>
                                <th className="px-5 py-3 text-right">Points (XP)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {weeklyLeaderboard.map((manager) => (
                                <tr key={manager.rank} className={`${manager.isMe ? 'bg-amber-50/50' : 'hover:bg-slate-50'} transition-colors`}>
                                    <td className="px-5 py-4 text-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mx-auto ${manager.rank === 1 ? 'bg-amber-100 text-amber-600 ring-4 ring-amber-50' : manager.rank === 2 ? 'bg-slate-200 text-slate-600' : manager.rank === 3 ? 'bg-orange-100 text-orange-700' : 'text-slate-400'}`}>
                                            {manager.rank}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                                                {manager.avatar}
                                            </div>
                                            <div>
                                                <p className={`font-bold ${manager.isMe ? 'text-[#02275A]' : 'text-slate-700'}`}>
                                                    {manager.name} {manager.isMe && '(You)'}
                                                </p>
                                                <p className="text-[10px] text-slate-400">{manager.region}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 font-medium text-slate-600">{manager.revenue}</td>
                                    <td className="px-5 py-4 text-center">
                                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-indigo-50 text-indigo-700 font-bold text-xs">
                                            <i className="fas fa-medal"></i> {manager.badges}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <span className="font-bold text-emerald-600">{manager.points.toLocaleString()} XP</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Leaderboard Table */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-50 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800">State Manager Leaderboard</h3>
                        <span className="text-xs text-slate-400">National Ranking</span>
                    </div>
                    
                    {/* Desktop View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50/50 text-xs text-slate-400 uppercase">
                                <tr>
                                    <th className="px-5 py-3">#</th>
                                    <th className="px-5 py-3">Manager</th>
                                    <th className="px-5 py-3">Level</th>
                                    <th className="px-5 py-3">XP</th>
                                    <th className="px-5 py-3">Revenue</th>
                                    <th className="px-5 py-3">Agents</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {leaderboardData.map((manager) => (
                                    <tr key={manager.rank} className={`${manager.isMe ? 'bg-[#02275A]/5' : 'hover:bg-slate-50'} transition-colors`}>
                                        <td className="px-5 py-4 font-bold text-slate-500">{manager.rank}</td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${manager.rank === 1 ? 'bg-amber-400' : manager.rank === 2 ? 'bg-slate-400' : manager.rank === 3 ? 'bg-amber-700' : 'bg-indigo-400'}`}>
                                                    {manager.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className={`font-bold ${manager.isMe ? 'text-[#02275A]' : 'text-slate-700'}`}>{manager.name} {manager.isMe && '(You)'}</p>
                                                    <p className="text-[10px] text-slate-400">{manager.state}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-slate-600 text-xs font-medium uppercase">{manager.level}</td>
                                        <td className="px-5 py-4 font-mono text-slate-500">{manager.xp.toLocaleString()}</td>
                                        <td className="px-5 py-4 font-bold text-emerald-600">{manager.revenue}</td>
                                        <td className="px-5 py-4 text-slate-600">{manager.agents}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden divide-y divide-slate-50">
                        {leaderboardData.map((manager) => (
                            <div key={manager.rank} className={`p-4 ${manager.isMe ? 'bg-[#02275A]/5' : ''}`}>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-sm font-bold text-slate-400">#{manager.rank}</span>
                                    <div className="flex-1 font-bold text-slate-800">{manager.name} {manager.isMe && <span className="text-[10px] bg-[#02275A]/10 text-[#02275A] px-1.5 rounded ml-1">You</span>}</div>
                                    <div className="text-xs font-bold text-[#02275A] bg-[#02275A]/10 px-2 py-0.5 rounded">{manager.level}</div>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-xs text-center">
                                    <div className="bg-slate-50 p-2 rounded">
                                        <p className="text-slate-400 mb-1">XP</p>
                                        <p className="font-bold text-slate-700">{manager.xp.toLocaleString()}</p>
                                    </div>
                                    <div className="bg-slate-50 p-2 rounded">
                                        <p className="text-slate-400 mb-1">Revenue</p>
                                        <p className="font-bold text-emerald-600">{manager.revenue}</p>
                                    </div>
                                    <div className="bg-slate-50 p-2 rounded">
                                        <p className="text-slate-400 mb-1">Agents</p>
                                        <p className="font-bold text-blue-600">{manager.agents}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* History Timeline */}
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                    <h3 className="font-bold text-slate-800 mb-6">Career Milestones</h3>
                    <div className="relative border-l-2 border-slate-100 pl-6 space-y-8">
                        <div className="relative">
                            <div className="absolute -left-[31px] w-4 h-4 rounded-full bg-[#02275A] border-4 border-white shadow-sm"></div>
                            <p className="text-xs text-slate-400 mb-1">Oct 20, 2023</p>
                            <h4 className="text-sm font-bold text-slate-800">Promoted to State Manager</h4>
                            <p className="text-xs text-slate-500">Took over Lagos State Operations.</p>
                        </div>
                        <div className="relative">
                            <div className="absolute -left-[31px] w-4 h-4 rounded-full bg-emerald-500 border-4 border-white shadow-sm"></div>
                            <p className="text-xs text-slate-400 mb-1">Jun 01, 2023</p>
                            <h4 className="text-sm font-bold text-slate-800">Zonal Head Achievement</h4>
                            <p className="text-xs text-slate-500">Managed 20+ agents successfully.</p>
                        </div>
                        <div className="relative opacity-50">
                            <div className="absolute -left-[31px] w-4 h-4 rounded-full bg-slate-300 border-4 border-white shadow-sm"></div>
                            <p className="text-xs text-slate-400 mb-1">Jan 15, 2023</p>
                            <h4 className="text-sm font-bold text-slate-800">Joined as Senior Manager</h4>
                            <p className="text-xs text-slate-500">Started career at Prokip.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="w-full mx-auto px-4 md:px-8 py-6 animate-fade-in pb-12">
            
            {/* Main Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">State Performance & Analytics</h2>
                    <p className="text-xs text-slate-500">Track state metrics, earn manager rewards, and climb the national rank.</p>
                </div>
                
                {/* Tab Navigation */}
                <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm flex overflow-x-auto no-scrollbar max-w-full">
                    {[
                        { id: 'kpi', label: 'State KPIs', icon: 'fa-chart-pie' },
                        { id: 'reward', label: 'Manager Rewards', icon: 'fa-gift' },
                        { id: 'progression', label: 'National Rankings', icon: 'fa-trophy' }
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                                activeTab === tab.id 
                                ? 'bg-[#02275A] text-white shadow-md' 
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                            }`}
                        >
                            <i className={`fas ${tab.icon}`}></i> {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Render */}
            <div className="min-h-[500px]">
                {activeTab === 'kpi' && renderKPIView()}
                {activeTab === 'reward' && renderRewardView()}
                {activeTab === 'progression' && renderProgressionView()}
            </div>
        </div>
    );
}

export default ManagerPerformanceView;
