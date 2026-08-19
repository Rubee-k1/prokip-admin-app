import React, { useState } from 'react';
import { useAlert } from '../contexts/AlertContext';

const AdminReportsView: React.FC = () => {
    const { showSuccess } = useAlert();
    const [activeTab, setActiveTab] = useState<'analytics' | 'trials' | 'detailed' | 'rankings'>('analytics');
    const [reportType, setReportType] = useState('weekly-performance');
    const [rankingTimeFilter, setRankingTimeFilter] = useState<'weekly' | 'monthly' | 'all-time'>('weekly');
    
    // Global Filters
    const [selectedCountry, setSelectedCountry] = useState('All');
    const [selectedState, setSelectedState] = useState('All');

    // --- MOCK DATA ---

    // Global Analytics Data
    const statePerformance = [
        { name: 'Lagos', country: 'Nigeria', manager: 'John Doe', revenue: '₦145.2M', agents: 45, activeBiz: 1240, score: 94, trend: 'up' },
        { name: 'Abuja', country: 'Nigeria', manager: 'Alice Kayode', revenue: '₦98.5M', agents: 28, activeBiz: 850, score: 89, trend: 'up' },
        { name: 'Kano', country: 'Nigeria', manager: 'Musa Ibrahim', revenue: '₦62.1M', agents: 22, activeBiz: 510, score: 82, trend: 'down' },
        { name: 'Accra', country: 'Ghana', manager: 'Kwame Mensah', revenue: '₵850k', agents: 15, activeBiz: 320, score: 78, trend: 'up' },
        { name: 'Rivers', country: 'Nigeria', manager: 'Chinedu Obi', revenue: '₦45.9M', agents: 18, activeBiz: 410, score: 75, trend: 'down' },
    ];

    // Zone Analytics Data (Drill-down)
    const zonePerformance = [
        { name: 'Lagos Mainland', state: 'Lagos', manager: 'Emmanuel O.', revenue: '₦45.2M', agents: 12, activeBiz: 340, score: 92, trend: 'up' },
        { name: 'Lagos Island', state: 'Lagos', manager: 'Chioma A.', revenue: '₦38.5M', agents: 10, activeBiz: 280, score: 88, trend: 'up' },
        { name: 'Ikeja Axis', state: 'Lagos', manager: 'Tunde B.', revenue: '₦32.1M', agents: 9, activeBiz: 210, score: 85, trend: 'down' },
        { name: 'Badagry Zone', state: 'Lagos', manager: 'Sarah K.', revenue: '₦12.4M', agents: 5, activeBiz: 95, score: 72, trend: 'up' },
        { name: 'Central Area', state: 'Abuja', manager: 'Sarah K.', revenue: '₦40.5M', agents: 10, activeBiz: 300, score: 90, trend: 'up' },
        { name: 'Gwarinpa', state: 'Abuja', manager: 'Ibrahim Y.', revenue: '₦25.2M', agents: 8, activeBiz: 200, score: 85, trend: 'up' },
        { name: 'Kano Central', state: 'Kano', manager: 'Musa I.', revenue: '₦35.1M', agents: 12, activeBiz: 250, score: 80, trend: 'down' },
        { name: 'Accra Central', state: 'Accra', manager: 'Kwame M.', revenue: '₵450k', agents: 8, activeBiz: 150, score: 78, trend: 'up' },
    ];

    // Filtered Data Logic
    const filteredStatePerformance = statePerformance.filter(item => {
        if (selectedCountry !== 'All' && item.country !== selectedCountry) return false;
        if (selectedState !== 'All' && item.name !== selectedState) return false;
        return true;
    });

    const filteredZonePerformance = zonePerformance.filter(item => {
        if (selectedState !== 'All' && item.state !== selectedState) return false;
        return true;
    });

    // Agents Rankings Data
    const agentsRankings = [
        { rank: 1, name: 'Emmanuel O.', location: 'Lagos, NG', revenue: '₦850k', points: 1250, badge: 'Gold' },
        { rank: 2, name: 'Chioma A.', location: 'Abuja, NG', revenue: '₦720k', points: 1100, badge: 'Silver' },
        { rank: 3, name: 'Kofi A.', location: 'Accra, GH', revenue: '₵5,200', points: 950, badge: 'Bronze' },
        { rank: 4, name: 'Sarah K.', location: 'Lagos, NG', revenue: '₦550k', points: 800, badge: 'Iron' },
        { rank: 5, name: 'David L.', location: 'Kano, NG', revenue: '₦420k', points: 650, badge: 'Iron' },
    ];

    // Free Trial Data
    const trialFunnel = {
        initiated: 450,
        active: 215,
        engaged: 120,
        converted: 65
    };

    const hotLeads = [
        { business: 'Mama Cass', location: 'Lagos', agent: 'John D.', usage: 'High', daysLeft: 2, prob: 95 },
        { business: 'TechHub', location: 'Abuja', agent: 'Sarah K.', usage: 'High', daysLeft: 5, prob: 88 },
        { business: 'Accra Mall', location: 'Accra', agent: 'Kofi A.', usage: 'Medium', daysLeft: 3, prob: 75 },
        { business: 'City Pharmacy', location: 'Kano', agent: 'Musa I.', usage: 'Medium', daysLeft: 1, prob: 60 },
    ];

    const agentTrialPerf = [
        { name: 'John Doe', location: 'Lagos', trials: 45, converted: 22, rate: '48%' },
        { name: 'Sarah King', location: 'Abuja', trials: 32, converted: 15, rate: '46%' },
        { name: 'Kwame Mensah', location: 'Accra', trials: 28, converted: 10, rate: '35%' },
    ];

    // Detailed Reports Data
    const agentsPerformance = [
        { name: 'John Doe', location: 'Lagos', sales: '₦2.5M', conversion: '45%', retention: '92%', status: 'Top' },
        { name: 'Sarah King', location: 'Abuja', sales: '₦1.8M', conversion: '38%', retention: '88%', status: 'Good' },
        { name: 'Mike Ross', location: 'Kano', sales: '₦800k', conversion: '20%', retention: '75%', status: 'Low' },
        { name: 'Lisa Mona', location: 'Rivers', sales: '₦400k', conversion: '15%', retention: '60%', status: 'Critical' },
        { name: 'Kofi Anan', location: 'Accra', sales: '₵12k', conversion: '42%', retention: '90%', status: 'Top' },
    ];

    const businessesList = [
        { name: 'Alpha Traders', plan: 'Premium', status: 'Active', location: 'Lagos', expiry: '2024-12-01' },
        { name: 'Beta Shops', plan: 'Standard', status: 'Active', location: 'Abuja', expiry: '2024-11-15' },
        { name: 'Gamma Retail', plan: 'Basic', status: 'Inactive', location: 'Kano', expiry: '2023-10-01' },
        { name: 'Delta Foods', plan: 'Premium', status: 'Active', location: 'Accra', expiry: '2024-12-20' },
    ];

    // --- RENDER FUNCTIONS ---

    const renderGlobalAnalytics = () => {
        const isStateView = selectedState !== 'All';
        const dataToDisplay = isStateView ? filteredZonePerformance : filteredStatePerformance;
        const title = isStateView ? `${selectedState} Zone Performance` : 'Regional Performance Breakdown';
        const columnHeader = isStateView ? 'Zone Name' : 'State/Region';

        return (
            <div className="space-y-6 animate-fade-in">
                {/* Top Metrics - Dynamic based on view */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                        { label: isStateView ? 'State Revenue' : 'Total Revenue', value: isStateView ? '₦137.1M' : '₦450.5M', change: '+18%', color: 'text-emerald-600', icon: 'fa-coins' },
                        { label: isStateView ? 'Active Zones' : 'Active Countries', value: isStateView ? filteredZonePerformance.length : '3', change: '+1', color: 'text-blue-600', icon: 'fa-globe' },
                        { label: 'Total Agents', value: isStateView ? '45' : '1,240', change: '+120', color: 'text-indigo-600', icon: 'fa-users' },
                        { label: 'Total Businesses', value: isStateView ? '980' : '15,450', change: '+850', color: 'text-amber-600', icon: 'fa-store' },
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

                {/* Performance Table */}
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-50 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800">{title}</h3>
                        <button className="text-xs text-[#02275A] font-bold hover:underline">Download Report</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                                <tr>
                                    <th className="px-5 py-3">{columnHeader}</th>
                                    <th className="px-5 py-3">{isStateView ? 'State' : 'Country'}</th>
                                    <th className="px-5 py-3">Manager</th>
                                    <th className="px-5 py-3">Revenue</th>
                                    <th className="px-5 py-3">Agents</th>
                                    <th className="px-5 py-3">Active Biz</th>
                                    <th className="px-5 py-3">Perf. Score</th>
                                    <th className="px-5 py-3">Trend</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {dataToDisplay.map((item, i) => (
                                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-5 py-4 font-bold text-slate-700">{item.name}</td>
                                        <td className="px-5 py-4 text-slate-600">{isStateView ? (item as any).state : (item as any).country}</td>
                                        <td className="px-5 py-4 text-slate-600">{item.manager}</td>
                                        <td className="px-5 py-4 font-bold text-emerald-600">{item.revenue}</td>
                                        <td className="px-5 py-4 text-slate-600">{item.agents}</td>
                                        <td className="px-5 py-4 text-slate-600">{item.activeBiz}</td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs font-bold ${item.score >= 90 ? 'text-emerald-600' : item.score >= 80 ? 'text-blue-600' : 'text-amber-600'}`}>{item.score}%</span>
                                                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full ${item.score >= 90 ? 'bg-emerald-500' : item.score >= 80 ? 'bg-blue-500' : 'bg-amber-500'}`} style={{ width: `${item.score}%` }}></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            {item.trend === 'up' ? (
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

                {/* Revenue Distribution Chart */}
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4">Revenue Distribution by {isStateView ? 'Zone' : 'Region'}</h3>
                    <div className="flex items-end gap-4 h-48">
                        {dataToDisplay.map((item, i) => {
                            // Mock scale calculation
                            const numericRevenue = parseInt(item.revenue.replace(/[^0-9.]/g, ''));
                            // Adjust scale factor based on view (State view has smaller numbers)
                            const scaleFactor = isStateView ? 50 : 150;
                            const height = Math.min((numericRevenue / scaleFactor) * 100, 100); 
                            
                            return (
                                <div key={i} className="flex-1 flex flex-col justify-end group cursor-pointer">
                                    <div className="w-full bg-[#02275A] rounded-t-md relative transition-all group-hover:bg-blue-700" style={{ height: `${height}%` }}>
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                            {item.revenue}
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-500 text-center mt-2 truncate">{item.name}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

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
                            <h3 className="font-bold text-slate-800">🔥 Hot Leads (Global)</h3>
                            <p className="text-xs text-slate-500">Businesses with high engagement scores across all regions</p>
                        </div>
                    </div>
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                            <tr>
                                <th className="px-5 py-3">Business</th>
                                <th className="px-5 py-3">Location</th>
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
                                    <td className="px-5 py-4 text-slate-600">{lead.location}</td>
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
                    <h3 className="font-bold text-slate-800 mb-4">Top Converters</h3>
                    <div className="space-y-4">
                        {agentTrialPerf.map((agent, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                                        {agent.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-700">{agent.name}</p>
                                        <p className="text-[10px] text-slate-400">{agent.location}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-emerald-600">{agent.rate}</p>
                                    <p className="text-[10px] text-slate-400">{agent.converted} Converted</p>
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
                                <th className="px-5 py-3">Location</th>
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
                                    <td className="px-5 py-4 text-slate-600">{agent.location}</td>
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
                                <th className="px-5 py-3">Location</th>
                                <th className="px-5 py-3">Sales</th>
                                <th className="px-5 py-3">KPI Score</th>
                                <th className="px-5 py-3">Action Required</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {agentsPerformance.filter(a => a.status === 'Low' || a.status === 'Critical').map((agent, i) => (
                                <tr key={i} className="hover:bg-slate-50">
                                    <td className="px-5 py-4 font-bold text-slate-700">{agent.name}</td>
                                    <td className="px-5 py-4 text-slate-600">{agent.location}</td>
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
                                <th className="px-5 py-3">Location</th>
                                <th className="px-5 py-3">Sales</th>
                                <th className="px-5 py-3">Conversion</th>
                                <th className="px-5 py-3">Reward Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {agentsPerformance.filter(a => a.status === 'Top').map((agent, i) => (
                                <tr key={i} className="hover:bg-slate-50">
                                    <td className="px-5 py-4 font-bold text-slate-700">{agent.name}</td>
                                    <td className="px-5 py-4 text-slate-600">{agent.location}</td>
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
                                <th className="px-5 py-3">Location</th>
                                <th className="px-5 py-3">Expiry Date</th>
                                <th className="px-5 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {businessesList.filter(b => b.status === 'Active').map((biz, i) => (
                                <tr key={i} className="hover:bg-slate-50">
                                    <td className="px-5 py-4 font-bold text-slate-700">{biz.name}</td>
                                    <td className="px-5 py-4 text-slate-600">{biz.plan}</td>
                                    <td className="px-5 py-4 text-slate-600">{biz.location}</td>
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
                                <th className="px-5 py-3">Location</th>
                                <th className="px-5 py-3">Expiry Date</th>
                                <th className="px-5 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {businessesList.filter(b => b.status !== 'Active').map((biz, i) => (
                                <tr key={i} className="hover:bg-slate-50">
                                    <td className="px-5 py-4 font-bold text-slate-700">{biz.name}</td>
                                    <td className="px-5 py-4 text-slate-600">{biz.plan}</td>
                                    <td className="px-5 py-4 text-slate-600">{biz.location}</td>
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
                            <h3 className="font-bold text-lg">Global Agents Leaderboard</h3>
                            <p className="text-xs text-blue-200">Top performing agents across all countries</p>
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
                                <th className="px-6 py-4">Location</th>
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
                                    <td className="px-6 py-4 text-slate-600 font-medium">{agent.location}</td>
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
                    <h2 className="text-xl font-bold text-slate-800">Global Reports & Analytics</h2>
                    <p className="text-xs text-slate-500">Comprehensive view of performance across all countries and states.</p>
                </div>
                
                {/* Global Filters */}
                <div className="flex gap-2">
                    <select 
                        className="bg-white border border-slate-200 text-xs rounded-lg px-3 py-2 outline-none focus:border-[#02275A]"
                        value={selectedCountry}
                        onChange={(e) => setSelectedCountry(e.target.value)}
                    >
                        <option value="All">All Countries</option>
                        <option value="Nigeria">Nigeria</option>
                        <option value="Ghana">Ghana</option>
                        <option value="Kenya">Kenya</option>
                    </select>
                    <select 
                        className="bg-white border border-slate-200 text-xs rounded-lg px-3 py-2 outline-none focus:border-[#02275A]"
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                    >
                        <option value="All">All States/Regions</option>
                        <option value="Lagos">Lagos</option>
                        <option value="Abuja">Abuja</option>
                        <option value="Kano">Kano</option>
                        <option value="Accra">Accra</option>
                        <option value="Rivers">Rivers</option>
                    </select>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm flex overflow-x-auto no-scrollbar max-w-full mb-6">
                {[
                    { id: 'analytics', label: 'Global Analytics', icon: 'fa-globe' },
                    { id: 'trials', label: 'Free Trial Center', icon: 'fa-flask' },
                    { id: 'detailed', label: 'Detailed Reports', icon: 'fa-file-alt' },
                    { id: 'rankings', label: 'Rankings', icon: 'fa-trophy' }
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

            {/* Content */}
            <div className="min-h-[500px]">
                {activeTab === 'analytics' && renderGlobalAnalytics()}
                {activeTab === 'trials' && renderFreeTrialCenter()}
                {activeTab === 'detailed' && renderDetailedReports()}
                {activeTab === 'rankings' && renderAgentsRankings()}
            </div>
        </div>
    );
};

export default AdminReportsView;
