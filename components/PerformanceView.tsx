
import React, { useState } from 'react';

const PerformanceView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'kpi' | 'reward' | 'progression'>('kpi');
    const [timeFilter, setTimeFilter] = useState('Monthly');

    // --- MOCK DATA ---
    const monthlySalesData = [
        { label: 'Jan', value: 35, amount: '₦350k' },
        { label: 'Feb', value: 48, amount: '₦480k' },
        { label: 'Mar', value: 42, amount: '₦420k' },
        { label: 'Apr', value: 65, amount: '₦650k' },
        { label: 'May', value: 58, amount: '₦580k' },
        { label: 'Jun', value: 85, amount: '₦850k' },
        { label: 'Jul', value: 72, amount: '₦720k' },
        { label: 'Aug', value: 60, amount: '₦600k' },
        { label: 'Sep', value: 90, amount: '₦900k' },
        { label: 'Oct', value: 55, amount: '₦550k' },
        { label: 'Nov', value: 68, amount: '₦680k' },
        { label: 'Dec', value: 82, amount: '₦820k' }
    ];

    const weeklySalesData = [
        { label: 'Wk 1', value: 45, amount: '₦135k' },
        { label: 'Wk 2', value: 60, amount: '₦180k' },
        { label: 'Wk 3', value: 55, amount: '₦165k' },
        { label: 'Wk 4', value: 75, amount: '₦225k' },
        { label: 'Wk 5', value: 50, amount: '₦150k' },
        { label: 'Wk 6', value: 80, amount: '₦240k' },
        { label: 'Wk 7', value: 65, amount: '₦195k' },
        { label: 'Wk 8', value: 70, amount: '₦210k' },
        { label: 'Wk 9', value: 85, amount: '₦255k' },
        { label: 'Wk 10', value: 60, amount: '₦180k' },
        { label: 'Wk 11', value: 90, amount: '₦270k' },
        { label: 'Wk 12', value: 75, amount: '₦225k' }
    ];

    const dailySalesData = [
        { label: 'Mon', value: 30, amount: '₦30k' },
        { label: 'Tue', value: 45, amount: '₦45k' },
        { label: 'Wed', value: 60, amount: '₦60k' },
        { label: 'Thu', value: 55, amount: '₦55k' },
        { label: 'Fri', value: 80, amount: '₦80k' },
        { label: 'Sat', value: 95, amount: '₦95k' },
        { label: 'Sun', value: 40, amount: '₦40k' },
        { label: 'Mon', value: 50, amount: '₦50k' },
        { label: 'Tue', value: 65, amount: '₦65k' },
        { label: 'Wed', value: 70, amount: '₦70k' },
        { label: 'Thu', value: 60, amount: '₦60k' },
        { label: 'Fri', value: 85, amount: '₦85k' }
    ];

    const salesData = timeFilter === 'Monthly' ? monthlySalesData : timeFilter === 'Weekly' ? weeklySalesData : dailySalesData;

    const getYAxisLabels = () => {
        if (timeFilter === 'Monthly') return ['₦1.0M', '₦750k', '₦500k', '₦250k', '0'];
        if (timeFilter === 'Weekly') return ['₦300k', '₦225k', '₦150k', '₦75k', '0'];
        return ['₦100k', '₦75k', '₦50k', '₦25k', '0'];
    };

    const yAxisLabels = getYAxisLabels();
    
    const leaderboardData = [
        { rank: 1, name: "Sarah O.", level: "Super Star", xp: 18500, sales: "₦3.2M", retention: "98%", churn: "0.5%", isMe: false },
        { rank: 2, name: "Emmanuel K.", level: "Rising Star", xp: 6200, sales: "₦2.8M", retention: "96%", churn: "1.2%", isMe: false },
        { rank: 3, name: "John Agent", level: "Rising Star", xp: 5750, sales: "₦2.4M", retention: "94%", churn: "1.5%", isMe: true }, // Current User
        { rank: 4, name: "Chinedu B.", level: "New Star", xp: 4100, sales: "₦2.1M", retention: "92%", churn: "2.0%", isMe: false },
        { rank: 5, name: "Fatima A.", level: "New Star", xp: 3800, sales: "₦1.9M", retention: "91%", churn: "2.1%", isMe: false },
    ];

    const weeklyLeaderboard = [
        { rank: 1, name: "Sarah O.", region: "Lagos Mainland", sales: "₦850k", points: 2400, badges: 3, avatar: "SO" },
        { rank: 2, name: "Emmanuel K.", region: "Lagos Island", sales: "₦720k", points: 2100, badges: 2, avatar: "EK" },
        { rank: 3, name: "John Agent", region: "Lekki Axis", sales: "₦690k", points: 1950, badges: 4, avatar: "JA", isMe: true },
        { rank: 4, name: "Chinedu B.", region: "Ikeja", sales: "₦550k", points: 1500, badges: 1, avatar: "CB" },
        { rank: 5, name: "Fatima A.", region: "Surulere", sales: "₦480k", points: 1200, badges: 1, avatar: "FA" },
    ];

    const badges = [
        { name: "First Sale", icon: "fa-check-circle", color: "text-white", bg: "bg-gradient-to-br from-emerald-400 to-emerald-600", desc: "First Sale", date: "Aug 20, 2023", unlocked: true, isOneTime: true, xp: 50, count: 1 },
        { name: "Fast Starter", icon: "fa-bolt", color: "text-white", bg: "bg-gradient-to-br from-amber-400 to-orange-500", desc: "3 sales in first month", date: "Sep 07, 2023", unlocked: true, isOneTime: true, xp: 100, count: 1 },
        { name: "Millionaire Club", icon: "fa-money-bill-wave", color: "text-white", bg: "bg-gradient-to-br from-[#02275A] to-blue-900", desc: "1 million earned", date: "Oct 20, 2023", unlocked: true, isOneTime: true, xp: 500, count: 1 },
        { name: "Retention King", icon: "fa-crown", color: "text-white", bg: "bg-gradient-to-br from-indigo-400 to-purple-600", desc: "90% Retention Rate for 3months straight", date: "Oct 15, 2023", unlocked: true, isOneTime: false, xp: 300, count: 3 },
        { name: "Top Regional", icon: "fa-map-marked-alt", color: "text-white", bg: "bg-gradient-to-br from-blue-400 to-cyan-500", desc: "Highest sales in the Region", date: "Nov 01, 2023", unlocked: true, isOneTime: false, xp: 100, count: 2 },
        { name: "Upsell Guru", icon: "fa-level-up-alt", color: "text-white", bg: "bg-gradient-to-br from-pink-500 to-rose-500", desc: "Generate 1million in upsales", date: "Nov 10, 2023", unlocked: true, isOneTime: false, xp: 100, count: 5 },
        { name: "Support Hero", icon: "fa-headset", color: "text-slate-400", bg: "bg-slate-100", desc: "Maintain 5stars out of every 10 Reviews", date: "Locked", unlocked: false, isOneTime: false, xp: 200, count: 0 },
        { name: "Streak Master", icon: "fa-fire", color: "text-slate-400", bg: "bg-slate-100", desc: "Hit targets 3 months in a row", date: "Locked", unlocked: false, isOneTime: false, xp: 1000, count: 0 },
        { name: "Referral Pro", icon: "fa-users", color: "text-slate-400", bg: "bg-slate-100", desc: "Refer 5 other agents (Someone already installing other softwares)", date: "Locked", unlocked: false, isOneTime: false, xp: 200, count: 0 },
    ];

    const rankDetails = [
        { name: "Starter", xp: 0, req: "Entry Level", benefit: "Welcome recognition" },
        { name: "New Star", xp: 1000, req: "Accumulate 1,000 XP", benefit: "Recognition badge + leaderboard mention" },
        { name: "Rising Star", xp: 5000, req: "Accumulate 5,000 XP", benefit: "Priority leads + special recognition" },
        { name: "Super Star", xp: 15000, req: "Accumulate 15,000 XP", benefit: "Enterprise sales tools + recognition" },
        { name: "Pro", xp: 30000, req: "Accumulate 30,000 XP", benefit: "₦1,000,000 cash" },
        { name: "Elite", xp: 50000, req: "Accumulate 50,000 XP", benefit: "1 international trip + VIP recognition" },
        { name: "Master", xp: 70000, req: "Accumulate 70,000 XP", benefit: "₦5,000,000 cash + leadership perks" },
        { name: "Legend", xp: 100000, req: "Accumulate 100,000 XP", benefit: "Multiple international trips + exclusive leadership perks" },
        { name: "Zonal Coordinator", xp: 250000, req: "Accumulate 250,000 XP", benefit: "Car award + elite recognition" },
        { name: "State Manager", xp: 500000, req: "Accumulate 500,000 XP", benefit: "Monthly salary + special packages + international trip" },
    ];
    
    // Heatmap fake data (last 28 days)
    const activityIntensity = [
        1, 2, 3, 1, 0, 2, 3, 
        3, 3, 2, 1, 0, 1, 2, 
        2, 1, 0, 0, 1, 3, 3, 
        3, 2, 2, 1, 0, 1, 2
    ];

    const renderKPIView = () => (
        <div className="space-y-6 animate-fade-in">
            {/* Analytics Header & Score */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Overall Score */}
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Overall Performance Score</p>
                        <h2 className="text-4xl font-extrabold text-slate-800">82<span className="text-lg text-slate-400 font-medium">/100</span></h2>
                        <div className="mt-2 inline-flex items-center px-2 py-1 rounded bg-emerald-50 text-emerald-600 text-[10px] font-bold">
                            <i className="fas fa-check-circle mr-1"></i> On Track
                        </div>
                    </div>
                    <div className="w-24 h-24 rounded-full border-8 border-slate-100 border-t-[#02275A] border-r-[#02275A] flex items-center justify-center relative rotate-45">
                        <i className="fas fa-chart-pie text-2xl text-[#02275A]/30 -rotate-45"></i>
                    </div>
                </div>

                {/* Sales Volume Tracker */}
                <div className="md:col-span-2 bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="font-bold text-slate-800">Sales Volume Tracker</h3>
                            <p className="text-xs text-slate-500">Revenue trend over selected period</p>
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
                    <p className="text-xs text-slate-500 font-bold uppercase mb-2">Target vs Actual</p>
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-xl font-bold text-slate-800">₦1.3M</span>
                        <span className="text-xs text-slate-400 font-medium">Target: ₦2.0M</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-gradient-to-r from-[#02275A] to-blue-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 text-right">65% Achieved</p>
                </div>

                {/* Retention & Churn */}
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center">
                    <div className="mb-3">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="font-bold text-slate-600">Retention Rate</span>
                            <span className="font-bold text-emerald-600">94%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '94%' }}></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="font-bold text-slate-600">Churn Rate</span>
                            <span className="font-bold text-rose-600">3%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                            <div className="bg-rose-500 h-1.5 rounded-full" style={{ width: '3%' }}></div>
                        </div>
                    </div>
                </div>

                {/* Lead Conversion */}
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-500 font-bold uppercase mb-1">Lead Conversion</p>
                        <h3 className="text-2xl font-bold text-slate-800">24.5%</h3>
                        <p className="text-[10px] text-emerald-600 font-bold mt-1"><i className="fas fa-arrow-up"></i> +2.1% this month</p>
                    </div>
                    <div className="w-12 h-12 bg-[#02275A]/10 rounded-full flex items-center justify-center text-[#02275A] text-lg">
                        <i className="fas fa-filter"></i>
                    </div>
                </div>

                {/* Activity Heatmap */}
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-xs text-slate-500 font-bold uppercase mb-2">Activity Intensity</p>
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
                    <h3 className="font-bold text-slate-800 mb-4 text-sm">Performance Weighting</h3>
                    <div className="space-y-4">
                        {[
                            { label: 'Sales Volume', val: 80, detail: '₦1.6M' },
                            { label: 'Sales Count', val: 65, detail: '45' },
                            { label: 'Retention', val: 94, detail: '25%' },
                            { label: 'Compliance', val: 100, detail: '10%' }
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
                        <h3 className="font-bold text-slate-800 mb-4 text-sm">Reviews & Quality</h3>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-3xl font-bold text-amber-500">4.8</span>
                            <div className="text-amber-400 text-sm">
                                <i className="fas fa-star"></i>
                                <i className="fas fa-star"></i>
                                <i className="fas fa-star"></i>
                                <i className="fas fa-star"></i>
                                <i className="fas fa-star-half-alt"></i>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500">Based on 42 client ratings</p>
                    </div>
                    <div className="mt-6 pt-6 border-t border-slate-50">
                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">Upsell Impact</p>
                        <p className="text-xl font-bold text-emerald-600">₦250,000</p>
                        <p className="text-[10px] text-slate-400">Additional revenue generated</p>
                    </div>
                </div>

                {/* Customer Mix */}
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center relative">
                    <h3 className="font-bold text-slate-800 mb-4 text-sm w-full text-left">Customer Mix</h3>
                    <div className="w-32 h-32 rounded-full relative" style={{ background: 'conic-gradient(#10b981 0% 75%, #e2e8f0 75% 100%)' }}>
                        <div className="absolute inset-0 m-auto w-20 h-20 bg-white rounded-full flex flex-col items-center justify-center">
                            <span className="text-xl font-bold text-slate-800">142</span>
                            <span className="text-[8px] text-slate-400 uppercase">Total</span>
                        </div>
                    </div>
                    <div className="flex gap-4 mt-4">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            <span className="text-xs text-slate-600">Active (75%)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                            <span className="text-xs text-slate-600">Inactive (25%)</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );

    const renderRewardView = () => {
        // Mock data for calculation
        const currentSales = 1650000;
        const salesCount = 7;
        const meetingsDone = 15;
        const retentionRate = 92;

        const baseTarget = 1000000;
        const baseBonus = 100000;
        
        // Requirements
        const reqSales = 1000000;
        const reqCount = 4;
        const reqMeetings = 10;
        const reqRetention = 60;

        const isBaseQualified = currentSales >= reqSales && salesCount >= reqCount && meetingsDone >= reqMeetings && retentionRate >= reqRetention;

        // Accelerator Calculation
        let acceleratorBonus = 0;
        let acceleratorRate = 0;
        const extraRevenue = Math.max(0, currentSales - baseTarget);

        if (isBaseQualified && extraRevenue >= 100000) {
            if (currentSales >= 2000000) {
                acceleratorRate = 5;
            } else if (currentSales >= 1500000) {
                acceleratorRate = 4;
            } else if (currentSales >= 1100000) {
                acceleratorRate = 3;
            }
            acceleratorBonus = extraRevenue * (acceleratorRate / 100);
        }

        const totalReward = (isBaseQualified ? baseBonus : 0) + acceleratorBonus;

        return (
        <div className="space-y-6 animate-fade-in">
            {/* Premium Monthly Bonus Card */}
            <div className="bg-gradient-to-br from-[#011530] to-black rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden border border-indigo-900/30">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>
                
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Header & Total Reward */}
                    <div className="lg:col-span-1 flex flex-col justify-center">
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider">
                                    Current Month
                                </span>
                            </div>
                            <h2 className="text-2xl font-extrabold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">Performance Bonus</h2>
                            <p className="text-indigo-200 text-xs">Unlock huge Monthly cash rewards by hitting your sales targets. Push harder, earn more!</p>
                        </div>
                        
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg relative group">
                            <p className="text-xs text-indigo-200 uppercase font-bold mb-2">Performance Reward</p>
                            <div className="flex items-baseline gap-1 mb-3">
                                <span className="text-4xl font-extrabold text-white tracking-tight">₦{totalReward.toLocaleString()}</span>
                            </div>
                            
                            <div className="space-y-2 pt-3 border-t border-white/10">
                                <div className="flex justify-between text-sm items-center">
                                    <span className="text-indigo-200">Base Bonus</span>
                                    <span className={`font-bold ${isBaseQualified ? "text-emerald-400" : "text-slate-400"}`}>
                                        ₦{isBaseQualified ? baseBonus.toLocaleString() : '0'}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm items-center">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-indigo-200">Accelerator</span>
                                        {acceleratorBonus > 0 && (
                                            <span className="bg-amber-500 text-black text-[10px] font-bold px-1.5 rounded">+{acceleratorRate}%</span>
                                        )}
                                        <div className="relative group/tooltip cursor-help">
                                            <i className="fas fa-info-circle text-indigo-400 text-xs"></i>
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-900 text-white text-[10px] p-3 rounded-lg shadow-xl opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50 border border-slate-700">
                                                <p className="font-bold mb-1 text-amber-400">Accelerator Tiers (on extra revenue):</p>
                                                <ul className="space-y-1 text-slate-300">
                                                    <li className="flex justify-between"><span>₦1.1M - ₦1.4M:</span> <span className="text-white">3%</span></li>
                                                    <li className="flex justify-between"><span>₦1.5M - ₦1.9M:</span> <span className="text-white">4%</span></li>
                                                    <li className="flex justify-between"><span>₦2.0M+:</span> <span className="text-white">5%</span></li>
                                                </ul>
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`font-bold ${acceleratorBonus > 0 ? "text-amber-400" : "text-slate-400"}`}>
                                        +₦{acceleratorBonus.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Progress Trackers */}
                    <div className="lg:col-span-2 flex flex-col justify-center">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Sales Volume */}
                            <div className="bg-white/5 rounded-xl p-4 border border-white/5 hover:bg-white/10 transition-colors">
                                <div className="flex justify-between text-xs mb-2">
                                    <span className="text-indigo-200 font-medium">Sales Volume</span>
                                    <span className={`font-bold ${currentSales >= reqSales ? 'text-emerald-400' : 'text-white'}`}>₦{currentSales.toLocaleString()} / ₦1M</span>
                                </div>
                                <div className="w-full bg-black/40 rounded-full h-2 mb-2">
                                    <div className={`h-full rounded-full transition-all duration-1000 ${currentSales >= reqSales ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${Math.min((currentSales / reqSales) * 100, 100)}%` }}></div>
                                </div>
                                <p className="text-[10px] text-slate-400 flex justify-between">
                                    <span>Min: ₦1M</span>
                                    {currentSales > reqSales && <span className="text-amber-400">Extra: ₦{(currentSales - reqSales).toLocaleString()}</span>}
                                </p>
                            </div>

                            {/* Sales Count */}
                            <div className="bg-white/5 rounded-xl p-4 border border-white/5 hover:bg-white/10 transition-colors">
                                <div className="flex justify-between text-xs mb-2">
                                    <span className="text-indigo-200 font-medium">Sales Count</span>
                                    <span className={`font-bold ${salesCount >= reqCount ? 'text-emerald-400' : 'text-white'}`}>{salesCount} / 6</span>
                                </div>
                                <div className="w-full bg-black/40 rounded-full h-2 mb-2">
                                    <div className={`h-full rounded-full transition-all duration-1000 ${salesCount >= reqCount ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${Math.min((salesCount / 6) * 100, 100)}%` }}></div>
                                </div>
                                <p className="text-[10px] text-slate-400">Min: 4 Sales</p>
                            </div>

                            {/* Meetings */}
                            <div className="bg-white/5 rounded-xl p-4 border border-white/5 hover:bg-white/10 transition-colors">
                                <div className="flex justify-between text-xs mb-2">
                                    <span className="text-indigo-200 font-medium">Lead Meetings</span>
                                    <span className={`font-bold ${meetingsDone >= reqMeetings ? 'text-emerald-400' : 'text-white'}`}>{meetingsDone} / 10</span>
                                </div>
                                <div className="w-full bg-black/40 rounded-full h-2 mb-2">
                                    <div className={`h-full rounded-full transition-all duration-1000 ${meetingsDone >= reqMeetings ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${Math.min((meetingsDone / reqMeetings) * 100, 100)}%` }}></div>
                                </div>
                                <p className="text-[10px] text-slate-400">Min: 10 Lead Meetings</p>
                            </div>

                            {/* Retention */}
                            <div className="bg-white/5 rounded-xl p-4 border border-white/5 hover:bg-white/10 transition-colors">
                                <div className="flex justify-between text-xs mb-2">
                                    <span className="text-indigo-200 font-medium">Retention</span>
                                    <span className={`font-bold ${retentionRate >= reqRetention ? 'text-emerald-400' : 'text-white'}`}>{retentionRate}% / 60%</span>
                                </div>
                                <div className="w-full bg-black/40 rounded-full h-2 mb-2">
                                    <div className={`h-full rounded-full transition-all duration-1000 ${retentionRate >= reqRetention ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${Math.min((retentionRate / 60) * 100, 100)}%` }}></div>
                                </div>
                                <p className="text-[10px] text-slate-400">Min: 60%</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Badges Grid */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 md:p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">Trophy Cabinet</h3>
                        <p className="text-xs text-slate-500">Collect badges to show off your achievements and earn XP!</p>
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
                        { date: 'Oct 01, 2023', reward: 'Q3 Top Performer Bonus', amount: '₦100,000', status: 'Paid', icon: 'fa-trophy', color: 'bg-amber-100 text-amber-600' },
                        { date: 'Sep 15, 2023', reward: 'Fast Starter Badge Bonus', amount: '₦10,000', status: 'Paid', icon: 'fa-bolt', color: 'bg-orange-100 text-orange-600' },
                        { date: 'Aug 30, 2023', reward: 'August Monthly Target', amount: '₦50,000', status: 'Paid', icon: 'fa-bullseye', color: 'bg-indigo-100 text-indigo-600' },
                        { date: 'Aug 20, 2023', reward: 'First Sale Commission Bonus', amount: '₦20,000', status: 'Paid', icon: 'fa-check-circle', color: 'bg-emerald-100 text-emerald-600' }
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
    };

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
                            <h2 className="text-3xl font-extrabold tracking-tight">Rising Star</h2>
                            <div className="bg-rose-500/20 border border-rose-500/50 px-2 py-0.5 rounded text-[10px] font-bold text-rose-300 flex items-center gap-1">
                                <i className="fas fa-fire"></i> 5 Day Streak
                            </div>
                        </div>
                        <p className="text-indigo-200 text-sm mb-4">Level 3 • 5,750 XP</p>
                        
                        <div className="w-full bg-black/30 h-3 rounded-full border border-white/10 relative">
                            <div className="absolute -top-6 right-0 text-xs text-indigo-300">Next: Super Star (15k XP)</div>
                            <div className="bg-gradient-to-r from-indigo-400 to-purple-400 h-full rounded-full shadow-[0_0_15px_rgba(129,140,248,0.6)]" style={{ width: '38%' }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Rank Progression Path */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 overflow-hidden">
                <h3 className="font-bold text-slate-800 mb-4">Rank Progression Path</h3>
                <div className="flex flex-nowrap overflow-x-auto pb-4 gap-4 no-scrollbar">
                    {rankDetails.map((rank, i) => (
                        <div key={i} className={`flex-shrink-0 w-64 p-4 rounded-xl border transition-all ${
                            rank.name === 'Rising Star' ? 'border-[#02275A] bg-[#02275A]/5 ring-2 ring-[#02275A]/10' : 
                            i < 2 ? 'border-emerald-100 bg-emerald-50/30 grayscale' : 'border-slate-100 bg-white opacity-60'
                        }`}>
                            <div className="flex justify-between items-start mb-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${rank.name === 'Rising Star' ? 'bg-[#02275A] text-white' : i < 2 ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                    {i + 1}
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${rank.name === 'Rising Star' ? 'bg-[#02275A]/10 text-[#02275A]' : i < 2 ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                    {rank.xp.toLocaleString()} XP
                                </span>
                            </div>
                            <h4 className={`font-bold text-sm mb-1 ${rank.name === 'Rising Star' ? 'text-[#02275A]' : 'text-slate-800'}`}>{rank.name}</h4>
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
                            <i className="fas fa-trophy text-amber-500"></i> Weekly Top Leaderboard
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">Lagos Region • Based on Points & Trophies</p>
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
                                <th className="px-5 py-3">Agent</th>
                                <th className="px-5 py-3">Sales Vol.</th>
                                <th className="px-5 py-3 text-center">Badges Won</th>
                                <th className="px-5 py-3 text-right">Points (XP)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {weeklyLeaderboard.map((agent) => (
                                <tr key={agent.rank} className={`${agent.isMe ? 'bg-amber-50/50' : 'hover:bg-slate-50'} transition-colors`}>
                                    <td className="px-5 py-4 text-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mx-auto ${agent.rank === 1 ? 'bg-amber-100 text-amber-600 ring-4 ring-amber-50' : agent.rank === 2 ? 'bg-slate-200 text-slate-600' : agent.rank === 3 ? 'bg-orange-100 text-orange-700' : 'text-slate-400'}`}>
                                            {agent.rank}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                                                {agent.avatar}
                                            </div>
                                            <div>
                                                <p className={`font-bold ${agent.isMe ? 'text-[#02275A]' : 'text-slate-700'}`}>
                                                    {agent.name} {agent.isMe && '(You)'}
                                                </p>
                                                <p className="text-[10px] text-slate-400">{agent.region}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 font-medium text-slate-600">{agent.sales}</td>
                                    <td className="px-5 py-4 text-center">
                                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-indigo-50 text-indigo-700 font-bold text-xs">
                                            <i className="fas fa-medal"></i> {agent.badges}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <span className="font-bold text-emerald-600">{agent.points.toLocaleString()} XP</span>
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
                        <h3 className="font-bold text-slate-800">Agent Leaderboard</h3>
                        <span className="text-xs text-slate-400">Regional Ranking</span>
                    </div>
                    
                    {/* Desktop View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50/50 text-xs text-slate-400 uppercase">
                                <tr>
                                    <th className="px-5 py-3">#</th>
                                    <th className="px-5 py-3">Agent</th>
                                    <th className="px-5 py-3">Rank</th>
                                    <th className="px-5 py-3">XP</th>
                                    <th className="px-5 py-3">Sales Vol</th>
                                    <th className="px-5 py-3">Retention</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {leaderboardData.map((agent) => (
                                    <tr key={agent.rank} className={`${agent.isMe ? 'bg-[#02275A]/5' : 'hover:bg-slate-50'} transition-colors`}>
                                        <td className="px-5 py-4 font-bold text-slate-500">{agent.rank}</td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${agent.rank === 1 ? 'bg-amber-400' : agent.rank === 2 ? 'bg-slate-400' : agent.rank === 3 ? 'bg-amber-700' : 'bg-indigo-400'}`}>
                                                    {agent.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className={`font-bold ${agent.isMe ? 'text-[#02275A]' : 'text-slate-700'}`}>{agent.name} {agent.isMe && '(You)'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-slate-600 text-xs font-medium uppercase">{agent.level}</td>
                                        <td className="px-5 py-4 font-mono text-slate-500">{agent.xp.toLocaleString()}</td>
                                        <td className="px-5 py-4 font-bold text-emerald-600">{agent.sales}</td>
                                        <td className="px-5 py-4 text-slate-600">{agent.retention}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden divide-y divide-slate-50">
                        {leaderboardData.map((agent) => (
                            <div key={agent.rank} className={`p-4 ${agent.isMe ? 'bg-[#02275A]/5' : ''}`}>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-sm font-bold text-slate-400">#{agent.rank}</span>
                                    <div className="flex-1 font-bold text-slate-800">{agent.name} {agent.isMe && <span className="text-[10px] bg-[#02275A]/10 text-[#02275A] px-1.5 rounded ml-1">You</span>}</div>
                                    <div className="text-xs font-bold text-[#02275A] bg-[#02275A]/10 px-2 py-0.5 rounded">{agent.level}</div>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-xs text-center">
                                    <div className="bg-slate-50 p-2 rounded">
                                        <p className="text-slate-400 mb-1">XP</p>
                                        <p className="font-bold text-slate-700">{agent.xp.toLocaleString()}</p>
                                    </div>
                                    <div className="bg-slate-50 p-2 rounded">
                                        <p className="text-slate-400 mb-1">Sales</p>
                                        <p className="font-bold text-emerald-600">{agent.sales}</p>
                                    </div>
                                    <div className="bg-slate-50 p-2 rounded">
                                        <p className="text-slate-400 mb-1">Retention</p>
                                        <p className="font-bold text-blue-600">{agent.retention}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* History Timeline */}
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                    <h3 className="font-bold text-slate-800 mb-6">Milestone History</h3>
                    <div className="relative border-l-2 border-slate-100 pl-6 space-y-8">
                        <div className="relative">
                            <div className="absolute -left-[31px] w-4 h-4 rounded-full bg-[#02275A] border-4 border-white shadow-sm"></div>
                            <p className="text-xs text-slate-400 mb-1">Oct 20, 2023</p>
                            <h4 className="text-sm font-bold text-slate-800">Achieved 'Rising Star'</h4>
                            <p className="text-xs text-slate-500">Unlocked Level 3 perks and Priority Support.</p>
                        </div>
                        <div className="relative">
                            <div className="absolute -left-[31px] w-4 h-4 rounded-full bg-emerald-500 border-4 border-white shadow-sm"></div>
                            <p className="text-xs text-slate-400 mb-1">Sep 01, 2023</p>
                            <h4 className="text-sm font-bold text-slate-800">New Star Status</h4>
                            <p className="text-xs text-slate-500">Closed first sale and received Starter Kit.</p>
                        </div>
                        <div className="relative opacity-50">
                            <div className="absolute -left-[31px] w-4 h-4 rounded-full bg-slate-300 border-4 border-white shadow-sm"></div>
                            <p className="text-xs text-slate-400 mb-1">Aug 15, 2023</p>
                            <h4 className="text-sm font-bold text-slate-800">Joined Prokip</h4>
                            <p className="text-xs text-slate-500">Completed 'Starter' requirements.</p>
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
                    <h2 className="text-xl font-bold text-slate-800">Performance & Analytics</h2>
                    <p className="text-xs text-slate-500">Track your metrics, earn rewards, and level up.</p>
                </div>
                
                {/* Tab Navigation */}
                <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm flex overflow-x-auto no-scrollbar max-w-full">
                    {[
                        { id: 'kpi', label: 'KPIs & Analytics', icon: 'fa-chart-pie' },
                        { id: 'reward', label: 'Rewards', icon: 'fa-gift' },
                        { id: 'progression', label: 'Rankings', icon: 'fa-trophy' }
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

export default PerformanceView;
