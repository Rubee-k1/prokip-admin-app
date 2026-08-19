import React, { useState } from 'react';

const ManagerReportsView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'analytics' | 'trials' | 'detailed' | 'rankings'>('analytics');
    const [reportType, setReportType] = useState('weekly-performance');
    const [rankingTimeFilter, setRankingTimeFilter] = useState<'weekly' | 'monthly' | 'all-time'>('weekly');

    // --- MOCK DATA ---

    // Agents Rankings Data
    const agentsRankings = [
        { rank: 1, name: 'Emmanuel O.', zone: 'Lagos Mainland', revenue: '₦850k', points: 1250, badge: 'Gold' },
        { rank: 2, name: 'Chioma A.', zone: 'Lagos Island', revenue: '₦720k', points: 1100, badge: 'Silver' },
        { rank: 3, name: 'Tunde B.', zone: 'Ikeja Axis', revenue: '₦690k', points: 950, badge: 'Bronze' },
        { rank: 4, name: 'Sarah K.', zone: 'Badagry Zone', revenue: '₦550k', points: 800, badge: 'Iron' },
        { rank: 5, name: 'David L.', zone: 'Ikorodu North', revenue: '₦420k', points: 650, badge: 'Iron' },
        { rank: 6, name: 'Mike R.', zone: 'Lekki Phase 1', revenue: '₦380k', points: 600, badge: 'Iron' },
        { rank: 7, name: 'Lisa M.', zone: 'Yaba', revenue: '₦350k', points: 550, badge: 'Iron' },
        { rank: 8, name: 'John D.', zone: 'Surulere', revenue: '₦320k', points: 500, badge: 'Iron' },
    ];

    // State Analytics Data
    const zonePerformance = [
        { name: 'Lagos Mainland', manager: 'Emmanuel O.', revenue: '₦45.2M', agents: 12, activeBiz: 340, score: 92, trend: 'up' },
        { name: 'Lagos Island', manager: 'Chioma A.', revenue: '₦38.5M', agents: 10, activeBiz: 280, score: 88, trend: 'up' },
        { name: 'Ikeja Axis', manager: 'Tunde B.', revenue: '₦32.1M', agents: 9, activeBiz: 210, score: 85, trend: 'down' },
        { name: 'Badagry Zone', manager: 'Sarah K.', revenue: '₦12.4M', agents: 5, activeBiz: 95, score: 72, trend: 'up' },
        { name: 'Ikorodu North', manager: 'David L.', revenue: '₦8.9M', agents: 4, activeBiz: 60, score: 68, trend: 'down' },
    ];

    // Free Trial Data
    const trialFunnel = {
        initiated: 150,
        active: 85,
        engaged: 45,
        converted: 20
    };

    const hotLeads = [
        { business: 'Mama Cass', agent: 'John D.', usage: 'High', daysLeft: 2, prob: 95 },
        { business: 'TechHub', agent: 'Sarah K.', usage: 'High', daysLeft: 5, prob: 88 },
        { business: 'City Mall', agent: 'Mike R.', usage: 'Medium', daysLeft: 3, prob: 75 },
        { business: 'Local Pharmacy', agent: 'Lisa M.', usage: 'Medium', daysLeft: 1, prob: 60 },
    ];

    const agentTrialPerf = [
        { name: 'John Doe', trials: 15, converted: 8, rate: '53%' },
        { name: 'Sarah King', trials: 12, converted: 5, rate: '41%' },
        { name: 'Mike Ross', trials: 10, converted: 3, rate: '30%' },
    ];

    // Detailed Reports Data
    const agentsPerformance = [
        { name: 'John Doe', zone: 'Mainland', sales: '₦2.5M', conversion: '45%', retention: '92%', status: 'Top' },
        { name: 'Sarah King', zone: 'Island', sales: '₦1.8M', conversion: '38%', retention: '88%', status: 'Good' },
        { name: 'Mike Ross', zone: 'Ikeja', sales: '₦800k', conversion: '20%', retention: '75%', status: 'Low' },
        { name: 'Lisa Mona', zone: 'Badagry', sales: '₦400k', conversion: '15%', retention: '60%', status: 'Critical' },
        { name: 'David Lee', zone: 'Ikorodu', sales: '₦2.1M', conversion: '42%', retention: '90%', status: 'Top' },
    ];

    const businessesList = [
        { name: 'Alpha Traders', plan: 'Premium', status: 'Active', agent: 'John Doe', expiry: '2024-12-01' },
        { name: 'Beta Shops', plan: 'Standard', status: 'Active', agent: 'Sarah King', expiry: '2024-11-15' },
        { name: 'Gamma Retail', plan: 'Basic', status: 'Inactive', agent: 'Mike Ross', expiry: '2023-10-01' },
        { name: 'Delta Foods', plan: 'Premium', status: 'Active', agent: 'David Lee', expiry: '2024-12-20' },
        { name: 'Epsilon Tech', plan: 'Standard', status: 'Expired', agent: 'Lisa Mona', expiry: '2023-09-15' },
    ];

    // --- RENDER FUNCTIONS ---

    const renderStateAnalytics = () => (
        <div className="space-y-6 animate-fade-in">
            {/* Top Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total State Revenue', value: '₦137.1M', change: '+12%', color: 'text-emerald-600', icon: 'fa-coins' },
                    { label: 'Active Zones', value: '5', change: '0', color: 'text-blue-600', icon: 'fa-map' },
                    { label: 'Total Active Agents', value: '40', change: '+2', color: 'text-indigo-600', icon: 'fa-users' },
                    { label: 'Total Businesses', value: '985', change: '+45', color: 'text-amber-600', icon: 'fa-store' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-500 font-bold uppercase">{stat.label}</p>
                            <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{stat.value}</h3>
                            <p className={`text-[10px] font-bold ${stat.change.includes('+') ? 'text-emerald-600' : 'text-slate-400'}`}>
                                {stat.change !== '0' && <i className={`fas fa-arrow-${stat.change.includes('+') ? 'up' : 'down'} mr-1`}></i>}
                                {stat.change} vs last month
                            </p>
                        </div>
                        <div className={`w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center ${stat.color} text-lg`}>
                            <i className={`fas ${stat.icon}`}></i>
                        </div>
                    </div>
                ))}
            </div>

            {/* Zone Breakdown */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">Zone Performance Breakdown</h3>
                    <button className="text-xs text-[#02275A] font-bold hover:underline">Download Report</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                            <tr>
                                <th className="px-5 py-3">Zone Name</th>
                                <th className="px-5 py-3">Zonal Manager</th>
                                <th className="px-5 py-3">Revenue</th>
                                <th className="px-5 py-3">Agents</th>
                                <th className="px-5 py-3">Active Biz</th>
                                <th className="px-5 py-3">Perf. Score</th>
                                <th className="px-5 py-3">Trend</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {zonePerformance.map((zone, i) => (
                                <tr key={i} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-5 py-4 font-bold text-slate-700">{zone.name}</td>
                                    <td className="px-5 py-4 text-slate-600">{zone.manager}</td>
                                    <td className="px-5 py-4 font-bold text-emerald-600">{zone.revenue}</td>
                                    <td className="px-5 py-4 text-slate-600">{zone.agents}</td>
                                    <td className="px-5 py-4 text-slate-600">{zone.activeBiz}</td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-bold ${zone.score >= 90 ? 'text-emerald-600' : zone.score >= 80 ? 'text-blue-600' : 'text-amber-600'}`}>{zone.score}%</span>
                                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full ${zone.score >= 90 ? 'bg-emerald-500' : zone.score >= 80 ? 'bg-blue-500' : 'bg-amber-500'}`} style={{ width: `${zone.score}%` }}></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        {zone.trend === 'up' ? (
                                            <span className="text-emerald-500 text-xs"><i className="fas fa-chart-line"></i> Up</span>
                                        ) : (
                                            <span className="text-rose-500 text-xs"><i className="fas fa-chart-line transform rotate-180"></i> Down</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Revenue Distribution Chart (Mock Visual) */}
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4">Revenue Distribution by Zone</h3>
                <div className="flex items-end gap-4 h-48">
                    {zonePerformance.map((zone, i) => {
                        const height = (parseInt(zone.revenue.replace(/[^0-9.]/g, '')) / 50) * 100; // Mock scale
                        return (
                            <div key={i} className="flex-1 flex flex-col justify-end group cursor-pointer">
                                <div className="w-full bg-[#02275A] rounded-t-md relative transition-all group-hover:bg-blue-700" style={{ height: `${height}%` }}>
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        {zone.revenue}
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-500 text-center mt-2 truncate">{zone.name}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    const renderFreeTrialCenter = () => (
        <div className="space-y-6 animate-fade-in">
            {/* Trial Funnel */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
                    <h3 className="text-2xl font-extrabold text-blue-700">{trialFunnel.initiated}</h3>
                    <p className="text-xs font-bold text-blue-500 uppercase">Trials Initiated</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-center relative">
                    <i className="fas fa-chevron-right absolute -left-3 top-1/2 -translate-y-1/2 text-slate-300 hidden md:block"></i>
                    <h3 className="text-2xl font-extrabold text-indigo-700">{trialFunnel.active}</h3>
                    <p className="text-xs font-bold text-indigo-500 uppercase">Active Trials</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-center relative">
                    <i className="fas fa-chevron-right absolute -left-3 top-1/2 -translate-y-1/2 text-slate-300 hidden md:block"></i>
                    <h3 className="text-2xl font-extrabold text-amber-700">{trialFunnel.engaged}</h3>
                    <p className="text-xs font-bold text-amber-500 uppercase">Highly Engaged</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-center relative">
                    <i className="fas fa-chevron-right absolute -left-3 top-1/2 -translate-y-1/2 text-slate-300 hidden md:block"></i>
                    <h3 className="text-2xl font-extrabold text-emerald-700">{trialFunnel.converted}</h3>
                    <p className="text-xs font-bold text-emerald-500 uppercase">Converted (This Month)</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Hot Leads */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-50 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-slate-800">🔥 Hot Leads (Likely to Convert)</h3>
                            <p className="text-xs text-slate-500">Businesses with high engagement scores</p>
                        </div>
                    </div>
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                            <tr>
                                <th className="px-5 py-3">Business</th>
                                <th className="px-5 py-3">Agent</th>
                                <th className="px-5 py-3">Usage</th>
                                <th className="px-5 py-3">Days Left</th>
                                <th className="px-5 py-3">Probability</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {hotLeads.map((lead, i) => (
                                <tr key={i} className="hover:bg-slate-50">
                                    <td className="px-5 py-4 font-bold text-slate-700">{lead.business}</td>
                                    <td className="px-5 py-4 text-slate-600">{lead.agent}</td>
                                    <td className="px-5 py-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${lead.usage === 'High' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                            {lead.usage}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-slate-600">{lead.daysLeft} days</td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-slate-700">{lead.prob}%</span>
                                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-500" style={{ width: `${lead.prob}%` }}></div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Agent Trial Performance */}
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
                    <h3 className="font-bold text-slate-800 mb-4">Agent Trial Performance</h3>
                    <div className="space-y-4">
                        {agentTrialPerf.map((agent, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                                        {agent.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-700">{agent.name}</p>
                                        <p className="text-[10px] text-slate-400">{agent.trials} Trials • {agent.converted} Converted</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-emerald-600">{agent.rate}</p>
                                    <p className="text-[10px] text-slate-400">Conv. Rate</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-6 py-2 text-xs font-bold text-[#02275A] bg-[#02275A]/5 rounded-lg hover:bg-[#02275A]/10 transition-colors">
                        View All Agents
                    </button>
                </div>
            </div>
        </div>
    );

    const renderDetailedReports = () => {
        let content;
        let title;

        switch (reportType) {
            case 'weekly-performance':
                title = "Weekly Agent Performance";
                content = (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                            <tr>
                                <th className="px-5 py-3">Agent Name</th>
                                <th className="px-5 py-3">Zone</th>
                                <th className="px-5 py-3">Sales</th>
                                <th className="px-5 py-3">Conversion</th>
                                <th className="px-5 py-3">Retention</th>
                                <th className="px-5 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {agentsPerformance.map((agent, i) => (
                                <tr key={i} className="hover:bg-slate-50">
                                    <td className="px-5 py-4 font-bold text-slate-700">{agent.name}</td>
                                    <td className="px-5 py-4 text-slate-600">{agent.zone}</td>
                                    <td className="px-5 py-4 font-bold text-emerald-600">{agent.sales}</td>
                                    <td className="px-5 py-4 text-slate-600">{agent.conversion}</td>
                                    <td className="px-5 py-4 text-slate-600">{agent.retention}</td>
                                    <td className="px-5 py-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                                            agent.status === 'Top' ? 'bg-emerald-100 text-emerald-600' :
                                            agent.status === 'Good' ? 'bg-blue-100 text-blue-600' :
                                            agent.status === 'Low' ? 'bg-amber-100 text-amber-600' :
                                            'bg-rose-100 text-rose-600'
                                        }`}>
                                            {agent.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
                break;
            case 'underperforming':
                title = "Underperforming Agents (Low KPI)";
                content = (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                            <tr>
                                <th className="px-5 py-3">Agent Name</th>
                                <th className="px-5 py-3">Zone</th>
                                <th className="px-5 py-3">Sales</th>
                                <th className="px-5 py-3">KPI Score</th>
                                <th className="px-5 py-3">Action Required</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {agentsPerformance.filter(a => a.status === 'Low' || a.status === 'Critical').map((agent, i) => (
                                <tr key={i} className="hover:bg-slate-50">
                                    <td className="px-5 py-4 font-bold text-slate-700">{agent.name}</td>
                                    <td className="px-5 py-4 text-slate-600">{agent.zone}</td>
                                    <td className="px-5 py-4 font-bold text-rose-600">{agent.sales}</td>
                                    <td className="px-5 py-4">
                                        <span className="text-rose-600 font-bold">Low</span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <button className="text-xs bg-rose-50 text-rose-600 px-3 py-1 rounded border border-rose-100 hover:bg-rose-100">
                                            Contact Agent
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
                break;
            case 'top-performing':
                title = "Top Performing Agents";
                content = (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                            <tr>
                                <th className="px-5 py-3">Agent Name</th>
                                <th className="px-5 py-3">Zone</th>
                                <th className="px-5 py-3">Sales</th>
                                <th className="px-5 py-3">Conversion</th>
                                <th className="px-5 py-3">Reward Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {agentsPerformance.filter(a => a.status === 'Top').map((agent, i) => (
                                <tr key={i} className="hover:bg-slate-50">
                                    <td className="px-5 py-4 font-bold text-slate-700">{agent.name}</td>
                                    <td className="px-5 py-4 text-slate-600">{agent.zone}</td>
                                    <td className="px-5 py-4 font-bold text-emerald-600">{agent.sales}</td>
                                    <td className="px-5 py-4 text-emerald-600 font-bold">{agent.conversion}</td>
                                    <td className="px-5 py-4">
                                        <span className="text-xs bg-emerald-50 text-emerald-600 px-3 py-1 rounded border border-emerald-100">
                                            Eligible for Bonus
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
                break;
            case 'active-businesses':
                title = "Active Businesses List";
                content = (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                            <tr>
                                <th className="px-5 py-3">Business Name</th>
                                <th className="px-5 py-3">Plan</th>
                                <th className="px-5 py-3">Agent</th>
                                <th className="px-5 py-3">Expiry Date</th>
                                <th className="px-5 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {businessesList.filter(b => b.status === 'Active').map((biz, i) => (
                                <tr key={i} className="hover:bg-slate-50">
                                    <td className="px-5 py-4 font-bold text-slate-700">{biz.name}</td>
                                    <td className="px-5 py-4 text-slate-600">{biz.plan}</td>
                                    <td className="px-5 py-4 text-slate-600">{biz.agent}</td>
                                    <td className="px-5 py-4 text-slate-600">{biz.expiry}</td>
                                    <td className="px-5 py-4">
                                        <span className="px-2 py-1 rounded text-[10px] font-bold bg-emerald-100 text-emerald-600">
                                            Active
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
                break;
            case 'inactive-businesses':
                title = "Inactive Businesses List";
                content = (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                            <tr>
                                <th className="px-5 py-3">Business Name</th>
                                <th className="px-5 py-3">Plan</th>
                                <th className="px-5 py-3">Agent</th>
                                <th className="px-5 py-3">Expiry Date</th>
                                <th className="px-5 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {businessesList.filter(b => b.status !== 'Active').map((biz, i) => (
                                <tr key={i} className="hover:bg-slate-50">
                                    <td className="px-5 py-4 font-bold text-slate-700">{biz.name}</td>
                                    <td className="px-5 py-4 text-slate-600">{biz.plan}</td>
                                    <td className="px-5 py-4 text-slate-600">{biz.agent}</td>
                                    <td className="px-5 py-4 text-slate-600">{biz.expiry}</td>
                                    <td className="px-5 py-4">
                                        <span className="px-2 py-1 rounded text-[10px] font-bold bg-slate-200 text-slate-500">
                                            {biz.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
                break;
            default:
                content = null;
        }

        return (
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden animate-fade-in">
                <div className="p-5 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h3 className="font-bold text-slate-800">{title}</h3>
                    <div className="flex gap-2">
                        <select 
                            className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-2 outline-none focus:border-[#02275A]"
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                        >
                            <option value="weekly-performance">Weekly Agent Performance</option>
                            <option value="underperforming">Underperforming Agents</option>
                            <option value="top-performing">Top Performing Agents</option>
                            <option value="active-businesses">Active Businesses List</option>
                            <option value="inactive-businesses">Inactive Businesses List</option>
                        </select>
                        <button className="bg-[#02275A] text-white text-xs px-4 py-2 rounded-lg font-bold hover:bg-[#02275A]/90">
                            <i className="fas fa-download mr-1"></i> Export
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    {content}
                </div>
            </div>
        );
    };

    const renderAgentsRankings = () => (
        <div className="space-y-6 animate-fade-in">
            {/* Filters */}
            <div className="flex justify-center mb-6">
                <div className="bg-slate-100 p-1 rounded-xl inline-flex">
                    {(['weekly', 'monthly', 'all-time'] as const).map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setRankingTimeFilter(filter)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                                rankingTimeFilter === filter
                                    ? 'bg-white text-[#02275A] shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            {filter.replace('-', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Leaderboard Table */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-50 flex justify-between items-center bg-gradient-to-r from-[#02275A] to-blue-900 text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-amber-400">
                            <i className="fas fa-trophy text-xl"></i>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Agents Leaderboard</h3>
                            <p className="text-xs text-blue-200">Top performing agents across all zones</p>
                        </div>
                    </div>
                    <div className="text-right hidden md:block">
                        <p className="text-[10px] text-blue-200 uppercase tracking-wider font-bold">Current Period</p>
                        <p className="font-bold text-sm">
                            {rankingTimeFilter === 'weekly' ? 'Week 42, 2024' : 
                             rankingTimeFilter === 'monthly' ? 'October 2024' : 'All Time'}
                        </p>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                            <tr>
                                <th className="px-6 py-4">Rank</th>
                                <th className="px-6 py-4">Agent</th>
                                <th className="px-6 py-4">Zone</th>
                                <th className="px-6 py-4 text-right">Revenue</th>
                                <th className="px-6 py-4 text-center">Points</th>
                                <th className="px-6 py-4 text-center">Badge</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {agentsRankings.map((agent, index) => (
                                <tr key={index} className={`hover:bg-slate-50 transition-colors ${index < 3 ? 'bg-slate-50/30' : ''}`}>
                                    <td className="px-6 py-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                                            index === 0 ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-200' :
                                            index === 1 ? 'bg-slate-200 text-slate-700 ring-2 ring-slate-300' :
                                            index === 2 ? 'bg-orange-100 text-orange-800 ring-2 ring-orange-200' :
                                            'bg-slate-100 text-slate-500'
                                        }`}>
                                            {agent.rank}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-[#02275A] text-white flex items-center justify-center text-xs font-bold">
                                                {agent.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <span className="font-bold text-slate-700">{agent.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 font-medium">{agent.zone}</td>
                                    <td className="px-6 py-4 text-right font-bold text-emerald-600">{agent.revenue}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                                            {agent.points} XP
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {agent.badge === 'Gold' && <i className="fas fa-medal text-amber-400 text-lg" title="Gold"></i>}
                                        {agent.badge === 'Silver' && <i className="fas fa-medal text-slate-400 text-lg" title="Silver"></i>}
                                        {agent.badge === 'Bronze' && <i className="fas fa-medal text-orange-400 text-lg" title="Bronze"></i>}
                                        {agent.badge === 'Iron' && <i className="fas fa-medal text-slate-300 text-lg" title="Iron"></i>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                <div className="p-4 border-t border-slate-50 bg-slate-50/50 text-center">
                    <button className="text-xs font-bold text-[#02275A] hover:underline">View Full Leaderboard</button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="w-full mx-auto px-4 md:px-8 py-6 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Advanced Reports & Analytics</h2>
                    <p className="text-xs text-slate-500">Deep dive into state performance, free trials, and detailed agent reports.</p>
                </div>
                
                {/* Tab Navigation */}
                <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm flex overflow-x-auto no-scrollbar max-w-full">
                    {[
                        { id: 'analytics', label: 'State Analytics', icon: 'fa-chart-bar' },
                        { id: 'trials', label: 'Free Trial Center', icon: 'fa-flask' },
                        { id: 'detailed', label: 'Detailed Reports', icon: 'fa-file-alt' },
                        { id: 'rankings', label: 'Agents Rankings', icon: 'fa-trophy' }
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

            {/* Content */}
            <div className="min-h-[500px]">
                {activeTab === 'analytics' && renderStateAnalytics()}
                {activeTab === 'trials' && renderFreeTrialCenter()}
                {activeTab === 'detailed' && renderDetailedReports()}
                {activeTab === 'rankings' && renderAgentsRankings()}
            </div>
        </div>
    );
};

export default ManagerReportsView;
