import React, { useState, useMemo } from 'react';
import { 
    ResponsiveContainer, BarChart, Bar, 
    PieChart, Pie, Cell, Tooltip, Legend, XAxis, YAxis, CartesianGrid 
} from 'recharts';

interface AdminDashboardViewProps {
    setView?: (view: string) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ setView }) => {
    const [trackingPeriod, setTrackingPeriod] = useState<'Today' | 'This Week' | 'This Month' | 'This Quarter' | 'This Year'>('This Month');
    const [selectedCountry, setSelectedCountry] = useState<'All' | 'Nigeria' | 'Ghana' | 'Kenya' | 'Rwanda'>('All');
    const [paymentFilterType, setPaymentFilterType] = useState<'value' | 'count'>('value');
    const [activeIndustryTab, setActiveIndustryTab] = useState<'type' | 'industry'>('type');
    const [leaderboardTab, setLeaderboardTab] = useState<'states' | 'managers' | 'agents'>('states');

    // Multipliers based on time period
    const periodMultiplier = useMemo(() => {
        switch (trackingPeriod) {
            case 'Today': return 0.05;
            case 'This Week': return 0.25;
            case 'This Month': return 1.0;
            case 'This Quarter': return 2.8;
            case 'This Year': return 11.2;
            default: return 1.0;
        }
    }, [trackingPeriod]);

    // Country multiplier
    const countryMultiplier = useMemo(() => {
        switch (selectedCountry) {
            case 'Nigeria': return 0.72;
            case 'Ghana': return 0.15;
            case 'Kenya': return 0.09;
            case 'Rwanda': return 0.04;
            default: return 1.0;
        }
    }, [selectedCountry]);

    const formatNaira = (val: number) => {
        if (val >= 1000000) {
            return `₦${(val / 1000000).toFixed(1)}M`;
        }
        return `₦${val.toLocaleString()}`;
    };

    const formatFullNaira = (val: number) => {
        return `₦${Math.round(val).toLocaleString()}`;
    };

    // Scaled Metrics
    const stats = useMemo(() => {
        const factor = periodMultiplier * countryMultiplier;
        const totalSalesRevenue = Math.round(45200000 * factor);
        const renewalsRevenue = Math.round(16200000 * factor);
        const newSalesRevenue = Math.round(24800000 * factor);

        const totalTransactionsCount = Math.round(148920 * factor);
        const totalTransactionsValue = Math.round(284500000 * factor);

        const totalBusinesses = Math.round(8932 * (selectedCountry === 'All' ? 1 : countryMultiplier));
        const newBusinesses = Math.round(248 * periodMultiplier * (selectedCountry === 'All' ? 1 : countryMultiplier));

        const totalLocations = Math.round(14680 * (selectedCountry === 'All' ? 1 : countryMultiplier));
        const newLocations = Math.round(412 * periodMultiplier * (selectedCountry === 'All' ? 1 : countryMultiplier));

        const totalCustomers = Math.round(32450 * (selectedCountry === 'All' ? 1 : countryMultiplier));
        const newCustomers = Math.round(890 * periodMultiplier * (selectedCountry === 'All' ? 1 : countryMultiplier));

        const totalFreeTrials = Math.round(1420 * (selectedCountry === 'All' ? 1 : countryMultiplier));
        const newFreeTrials = Math.round(210 * periodMultiplier * (selectedCountry === 'All' ? 1 : countryMultiplier));

        const totalAgents = Math.round(1245 * (selectedCountry === 'All' ? 1 : countryMultiplier));
        const totalPartners = Math.round(86 * (selectedCountry === 'All' ? 1 : countryMultiplier));

        // Commissions
        const commissionsPaid = Math.round(6840000 * factor);
        const commissionsDue = Math.round(1420000 * factor);
        const totalCommissionsEarned = commissionsPaid + commissionsDue;

        const customerRetentionRate = 96.8;
        const totalChurnedThisPeriod = Math.round(28 * periodMultiplier * (selectedCountry === 'All' ? 1 : countryMultiplier));

        // Sales Breakdown by Channels (Partners, Agents with Managers, Agents without Managers)
        const salesByPartners = Math.round(12800000 * factor);
        const salesAgentsWithManagers = Math.round(22400000 * factor);
        const salesAgentsWithoutManagers = Math.round(10000000 * factor);

        // Daily Pulse Specifics
        const dailyTransactionsCount = Math.round(5200 * countryMultiplier);
        const dailySalesTransactionsCount = Math.round(4420 * countryMultiplier);
        const dailyOtherTransactionsCount = dailyTransactionsCount - dailySalesTransactionsCount;
        const dailyTransactionsValue = Math.round(42500000 * countryMultiplier);
        const lowestTransactionAmount = 150;
        const highestTransactionAmount = Math.round(1840000 * countryMultiplier);
        const averageTransactionPerCustomer = Math.round(dailyTransactionsValue / 1250); 
        const highestSalesCustomer = "MegaMart Retail";
        const highestSalesCustomerValue = Math.round(2850000 * countryMultiplier);
        const lowestSalesCustomer = "Corner Shop";
        const lowestSalesCustomerValue = 450;

        // Core SaaS Metrics
        const mrr = Math.round(totalSalesRevenue / 12);
        const activeCustomers = Math.round(totalCustomers * 0.85);
        const arpu = activeCustomers > 0 ? Math.round(mrr / activeCustomers) : 0;

        return {
            totalSalesRevenue,
            renewalsRevenue,
            newSalesRevenue,
            totalTransactionsCount,
            totalTransactionsValue,
            totalBusinesses,
            newBusinesses,
            totalLocations,
            newLocations,
            totalCustomers,
            newCustomers,
            totalFreeTrials,
            newFreeTrials,
            totalAgents,
            totalPartners,
            commissionsPaid,
            commissionsDue,
            totalCommissionsEarned,
            customerRetentionRate,
            totalChurnedThisPeriod,
            salesByPartners,
            salesAgentsWithManagers,
            salesAgentsWithoutManagers,
            dailyTransactionsCount,
            dailySalesTransactionsCount,
            dailyOtherTransactionsCount,
            dailyTransactionsValue,
            lowestTransactionAmount,
            highestTransactionAmount,
            averageTransactionPerCustomer,
            highestSalesCustomer,
            highestSalesCustomerValue,
            lowestSalesCustomer,
            lowestSalesCustomerValue,
            mrr,
            activeCustomers,
            arpu
        };
    }, [periodMultiplier, countryMultiplier, selectedCountry]);

    // Top Payment Methods
    const paymentMethodsData = useMemo(() => {
        const factor = periodMultiplier * countryMultiplier;
        return [
            { 
                name: 'Bank Transfer', 
                shortName: 'Bank Transfer',
                share: 65.0, 
                count: Math.round(96798 * factor), 
                value: Math.round(184925000 * factor),
                color: '#3B82F6',
                icon: 'fa-building-columns'
            },
            { 
                name: 'Cash', 
                shortName: 'Cash',
                share: 25.0, 
                count: Math.round(37230 * factor), 
                value: Math.round(71125000 * factor),
                color: '#10B981',
                icon: 'fa-money-bill-wave'
            },
            { 
                name: 'Other Payment Methods', 
                shortName: 'Others',
                share: 10.0, 
                count: Math.round(14892 * factor), 
                value: Math.round(28450000 * factor),
                color: '#F59E0B',
                icon: 'fa-credit-card'
            }
        ];
    }, [periodMultiplier, countryMultiplier]);

    // Top 5 States
    const topStatesData = useMemo(() => {
        const factor = periodMultiplier * countryMultiplier;
        return [
            { name: 'Lagos', revenue: Math.round(18500000 * factor), businesses: 3420, agents: 480, growth: '+22.4%', share: '40.9%' },
            { name: 'Abuja (FCT)', revenue: Math.round(9200000 * factor), businesses: 1650, agents: 210, growth: '+18.1%', share: '20.4%' },
            { name: 'Rivers (Port Harcourt)', revenue: Math.round(6400000 * factor), businesses: 1180, agents: 165, growth: '+14.6%', share: '14.2%' },
            { name: 'Kano', revenue: Math.round(4800000 * factor), businesses: 940, agents: 135, growth: '+12.0%', share: '10.6%' },
            { name: 'Oyo (Ibadan)', revenue: Math.round(3500000 * factor), businesses: 760, agents: 98, growth: '+15.3%', share: '7.7%' },
        ];
    }, [periodMultiplier, countryMultiplier]);

    // Top 5 Managers
    const topManagersData = useMemo(() => {
        const factor = periodMultiplier * countryMultiplier;
        return [
            { name: 'Amina Yusuf', region: 'Lagos Island & Lekki', teamSize: 64, sales: Math.round(7200000 * factor), targetAchieved: '128%', commission: Math.round(720000 * factor) },
            { name: 'Emeka Nwosu', region: 'Abuja Central & Garki', teamSize: 42, sales: Math.round(5400000 * factor), targetAchieved: '115%', commission: Math.round(540000 * factor) },
            { name: 'Tunde Bakare', region: 'Ikeja & Mainland', teamSize: 51, sales: Math.round(4900000 * factor), targetAchieved: '108%', commission: Math.round(490000 * factor) },
            { name: 'Blessing Okon', region: 'Port Harcourt Metro', teamSize: 38, sales: Math.round(3800000 * factor), targetAchieved: '102%', commission: Math.round(380000 * factor) },
            { name: 'Musa Ibrahim', region: 'Kano & Kaduna Zone', teamSize: 35, sales: Math.round(3100000 * factor), targetAchieved: '98%', commission: Math.round(310000 * factor) },
        ];
    }, [periodMultiplier, countryMultiplier]);

    // Top 5 Agents
    const topAgentsData = useMemo(() => {
        const factor = periodMultiplier * countryMultiplier;
        return [
            { name: 'Chinedu Eze', territory: 'Lekki / Victoria Island', manager: 'Amina Yusuf', storesOnboarded: 48, sales: Math.round(1850000 * factor), commission: Math.round(277500 * factor) },
            { name: 'Fatima Bello', territory: 'Wuse 2 & Maitama', manager: 'Emeka Nwosu', storesOnboarded: 39, sales: Math.round(1520000 * factor), commission: Math.round(228000 * factor) },
            { name: 'Kunle Adebayo', territory: 'Ikeja Computer Village', manager: 'Tunde Bakare', storesOnboarded: 36, sales: Math.round(1410000 * factor), commission: Math.round(211500 * factor) },
            { name: 'Grace Danjuma', territory: 'Garki & Jabi', manager: 'Emeka Nwosu', storesOnboarded: 31, sales: Math.round(1240000 * factor), commission: Math.round(186000 * factor) },
            { name: 'David Kariuki', territory: 'Nairobi CBD / Westlands', manager: 'Self-Managed (Partner)', storesOnboarded: 29, sales: Math.round(1150000 * factor), commission: Math.round(172500 * factor) },
        ];
    }, [periodMultiplier, countryMultiplier]);

    // Top 5 Business Types (with Retention Rate & New Customers)
    const businessTypesData = useMemo(() => {
        const factor = periodMultiplier * countryMultiplier;
        return [
            { type: 'Retail Supermarket & Groceries', businesses: 2840, newCustomers: Math.round(86 * periodMultiplier), retentionRate: 98.2, salesVolume: Math.round(14600000 * factor), color: '#3B82F6' },
            { type: 'Pharmacy & Drug Stores', businesses: 1980, newCustomers: Math.round(62 * periodMultiplier), retentionRate: 97.8, salesVolume: Math.round(10200000 * factor), color: '#10B981' },
            { type: 'Wholesale & Distributors', businesses: 1450, newCustomers: Math.round(41 * periodMultiplier), retentionRate: 96.5, salesVolume: Math.round(8900000 * factor), color: '#F59E0B' },
            { type: 'Restaurants, Bars & Lounges', businesses: 1320, newCustomers: Math.round(35 * periodMultiplier), retentionRate: 94.1, salesVolume: Math.round(6800000 * factor), color: '#8B5CF6' },
            { type: 'Electronics & Phone Retail', businesses: 940, newCustomers: Math.round(24 * periodMultiplier), retentionRate: 95.4, salesVolume: Math.round(4700000 * factor), color: '#EC4899' },
        ];
    }, [periodMultiplier, countryMultiplier]);

    // Top 5 Business Industries (with Retention Rate & New Customers)
    const businessIndustriesData = useMemo(() => {
        const factor = periodMultiplier * countryMultiplier;
        return [
            { industry: 'Fast-Moving Consumer Goods (FMCG)', businesses: 3250, newCustomers: Math.round(98 * periodMultiplier), retentionRate: 98.4, salesVolume: Math.round(16800000 * factor), color: '#3B82F6' },
            { industry: 'Healthcare & Pharmaceuticals', businesses: 2120, newCustomers: Math.round(65 * periodMultiplier), retentionRate: 97.9, salesVolume: Math.round(11200000 * factor), color: '#10B981' },
            { industry: 'Food, Beverage & Hospitality', businesses: 1540, newCustomers: Math.round(42 * periodMultiplier), retentionRate: 94.6, salesVolume: Math.round(7900000 * factor), color: '#F59E0B' },
            { industry: 'Consumer Electronics & Gadgets', businesses: 1110, newCustomers: Math.round(28 * periodMultiplier), retentionRate: 95.8, salesVolume: Math.round(5400000 * factor), color: '#8B5CF6' },
            { industry: 'Fashion, Apparel & Footwear', businesses: 912, newCustomers: Math.round(15 * periodMultiplier), retentionRate: 93.2, salesVolume: Math.round(3900000 * factor), color: '#EC4899' },
        ];
    }, [periodMultiplier, countryMultiplier]);

    // Channel Sales Composition Data
    const channelSalesData = useMemo(() => {
        return [
            { name: 'Agents with Managers', value: stats.salesAgentsWithManagers, percentage: '49.6%', color: '#3B82F6', description: 'Field agents assigned to Territory Managers' },
            { name: 'Partners & Resellers', value: stats.salesByPartners, percentage: '28.3%', color: '#10B981', description: 'Certified reseller partners & franchises' },
            { name: 'Agents without Managers', value: stats.salesAgentsWithoutManagers, percentage: '22.1%', color: '#F59E0B', description: 'Independent / direct field agents' },
        ];
    }, [stats]);

    // Active vs Total Customers Trend
    const retentionTrendData = [
        { month: 'Feb', totalCustomers: 8500, activeCustomers: 7900, retentionRate: 92.9 },
        { month: 'Mar', totalCustomers: 8900, activeCustomers: 8400, retentionRate: 94.3 },
        { month: 'Apr', totalCustomers: 9400, activeCustomers: 8950, retentionRate: 95.2 },
        { month: 'May', totalCustomers: 10100, activeCustomers: 9680, retentionRate: 95.8 },
        { month: 'Jun', totalCustomers: 10800, activeCustomers: 10450, retentionRate: 96.7 },
        { month: 'Jul', totalCustomers: 11200, activeCustomers: 10900, retentionRate: 97.3 },
    ];

    // Quick navigation shortcuts to core admin menus
    const adminShortcuts = [
        { label: 'Agents Management', view: 'admin-agents', icon: 'fa-user-tie', count: `${stats.totalAgents} Agents`, color: 'text-blue-600 bg-blue-50' },
        { label: 'Managers Hub', view: 'admin-managers', icon: 'fa-user-shield', count: '45 Managers', color: 'text-indigo-600 bg-indigo-50' },
        { label: 'Customers & Stores', view: 'admin-customers', icon: 'fa-store', count: `${stats.totalBusinesses.toLocaleString()} Stores`, color: 'text-amber-600 bg-amber-50' },
        { label: 'Commissions Center', view: 'admin-commissions', icon: 'fa-hand-holding-dollar', count: `${formatNaira(stats.commissionsDue)} Due`, color: 'text-emerald-600 bg-emerald-50' },
        { label: 'Finance Center', view: 'admin-finance', icon: 'fa-building-columns', count: `${formatNaira(stats.totalSalesRevenue)} ARR`, color: 'text-sky-600 bg-sky-50' },
        { label: 'Leads Pipeline', view: 'admin-leads', icon: 'fa-funnel-dollar', count: '3,840 Leads', color: 'text-purple-600 bg-purple-50' },
        { label: 'HR Center & Staff', view: 'admin-hr-center', icon: 'fa-users', count: '128 Staff', color: 'text-teal-600 bg-teal-50' },
        { label: 'Executive Reports', view: 'admin-reports', icon: 'fa-chart-pie', count: 'Full Analytics', color: 'text-rose-600 bg-rose-50' },
    ];

    return (
        <div className="w-full mx-auto px-4 md:px-8 py-6 space-y-6 text-slate-800 animate-fade-in">
            
            {/* TOP HEADER & CONTROLS */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#02275A] text-amber-400 flex items-center justify-center font-black text-lg shadow-xs">
                            <i className="fas fa-gauge-high"></i>
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                                Admin Command Center
                                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                                    <i className="fas fa-circle text-[8px] text-emerald-500 mr-1 animate-pulse"></i> Live
                                </span>
                            </h1>
                            <p className="text-xs text-slate-500 font-medium">
                                Executive metrics, sales distribution by channel, commissions, top states, managers, agents & business types.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                    {/* Country Selector */}
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-700">
                        <i className="fas fa-globe text-[#02275A] mr-1.5"></i>
                        <select 
                            value={selectedCountry}
                            onChange={(e) => setSelectedCountry(e.target.value as any)}
                            className="bg-transparent border-none text-slate-800 font-bold focus:outline-none cursor-pointer py-1"
                        >
                            <option value="All">All Territories (Pan-Africa)</option>
                            <option value="Nigeria">Nigeria 🇳🇬</option>
                            <option value="Ghana">Ghana 🇬🇭</option>
                            <option value="Kenya">Kenya 🇰🇪</option>
                            <option value="Rwanda">Rwanda 🇷🇼</option>
                        </select>
                    </div>

                    {/* Period Tabs */}
                    <div className="bg-slate-100 p-1 rounded-xl inline-flex text-xs font-bold shadow-inner">
                        {(['Today', 'This Week', 'This Month', 'This Quarter', 'This Year'] as const).map(period => (
                            <button 
                                key={period}
                                onClick={() => setTrackingPeriod(period)}
                                className={`px-3 py-1.5 rounded-lg transition-all ${trackingPeriod === period ? 'bg-[#02275A] text-white shadow-xs font-extrabold' : 'text-slate-600 hover:text-slate-900'}`}
                            >
                                {period}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* SECTION 1: CORE SAAS METRICS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Total Sales Revenue */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Total Sales Revenue</span>
                            <h3 className="text-2xl font-black text-[#02275A] mt-1">{formatFullNaira(stats.totalSalesRevenue)}</h3>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
                            <i className="fas fa-coins"></i>
                        </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                            <i className="fas fa-arrow-trend-up"></i> MRR: {formatFullNaira(stats.mrr)}
                        </span>
                        <span className="text-slate-500 font-semibold">{trackingPeriod}</span>
                    </div>
                </div>

                {/* Active Customers */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Active Customers</span>
                            <h3 className="text-2xl font-black text-emerald-700 mt-1">{stats.activeCustomers.toLocaleString()}</h3>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
                            <i className="fas fa-users-viewfinder"></i>
                        </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-emerald-600 font-bold">
                            <i className="fas fa-circle-check mr-1"></i> {stats.customerRetentionRate}% Retention
                        </span>
                        <span className="text-slate-400 font-semibold">Total: {stats.totalCustomers.toLocaleString()}</span>
                    </div>
                </div>

                {/* ARPU */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Avg Revenue Per Customer</span>
                            <h3 className="text-2xl font-black text-slate-900 mt-1">{formatFullNaira(stats.arpu)}</h3>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg">
                            <i className="fas fa-chart-line"></i>
                        </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-indigo-600 font-bold">
                            <i className="fas fa-money-bill-trend-up mr-1"></i> Solid Growth
                        </span>
                        <span className="text-emerald-600 font-bold">+5.2%</span>
                    </div>
                </div>

                {/* Total Renewals */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Total Renewals</span>
                            <h3 className="text-2xl font-black text-amber-600 mt-1">{formatFullNaira(stats.renewalsRevenue)}</h3>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg">
                            <i className="fas fa-arrows-rotate"></i>
                        </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-emerald-600 font-bold">91.4% Renewal Rate</span>
                        <span className="text-slate-500 font-bold">Recurring</span>
                    </div>
                </div>

            </div>

            {/* SECTION 1B: TODAY'S TRANSACTION PULSE */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-3xl opacity-50 -mr-10 -mt-10 pointer-events-none"></div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 pb-4 border-b border-slate-100 relative z-10">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <i className="fas fa-bolt text-amber-500"></i>
                            Today's Transaction Pulse
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">Live monitoring of all transactions counted for the day entirely.</p>
                    </div>
                    <div className="mt-3 sm:mt-0 flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-100 px-3 py-1.5 rounded-lg text-xs">
                        <i className="fas fa-trophy text-amber-500"></i>
                        <span className="font-semibold">Day closes leading with:</span>
                        <span className="font-black">{stats.highestSalesCustomer}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Sales Transactions</span>
                        <p className="text-lg font-black text-emerald-700 mt-1">{stats.dailySalesTransactionsCount.toLocaleString()}</p>
                        <p className="text-[10px] text-slate-400 mt-1">sales txns today</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Total (Incl. Others)</span>
                        <p className="text-lg font-black text-[#02275A] mt-1">{stats.dailyTransactionsCount.toLocaleString()}</p>
                        <p className="text-[10px] text-slate-400 mt-1">all txns today</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Total Value</span>
                        <p className="text-lg font-black text-[#02275A] mt-1">{formatFullNaira(stats.dailyTransactionsValue)}</p>
                        <p className="text-[10px] text-slate-400 mt-1">processed today</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Avg Amount</span>
                        <p className="text-lg font-black text-indigo-600 mt-1">{formatFullNaira(stats.averageTransactionPerCustomer)}</p>
                        <p className="text-[10px] text-slate-400 mt-1">per customer</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Highest Txn</span>
                        <p className="text-lg font-black text-emerald-600 mt-1">{formatFullNaira(stats.highestTransactionAmount)}</p>
                        <p className="text-[10px] text-slate-400 mt-1">single payment</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Lowest Txn</span>
                        <p className="text-lg font-black text-rose-500 mt-1">{formatFullNaira(stats.lowestTransactionAmount)}</p>
                        <p className="text-[10px] text-slate-400 mt-1">single payment</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Highest Sales (Customer)</span>
                        <p className="text-lg font-black text-emerald-700 mt-1" title={stats.highestSalesCustomer}>{formatFullNaira(stats.highestSalesCustomerValue)}</p>
                        <p className="text-[10px] text-slate-400 mt-1 truncate">{stats.highestSalesCustomer}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Lowest Sales (Customer)</span>
                        <p className="text-lg font-black text-rose-600 mt-1" title={stats.lowestSalesCustomer}>{formatFullNaira(stats.lowestSalesCustomerValue)}</p>
                        <p className="text-[10px] text-slate-400 mt-1 truncate">{stats.lowestSalesCustomer}</p>
                    </div>
                </div>
            </div>

            {/* SECTION 2: SALES BREAKDOWN BY CHANNEL (Partners, Agents w/ Managers, Agents w/o Managers) */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <i className="fas fa-network-wired text-[#02275A]"></i>
                            Sales Revenue by Distribution Channel
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Breakdown of sales generated by Partners, Agents with Managers, and Independent Agents without Managers.
                        </p>
                    </div>
                    <span className="text-xs bg-blue-50 text-[#02275A] font-extrabold px-3 py-1 rounded-lg border border-blue-100">
                        Total: {formatNaira(stats.totalSalesRevenue)}
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* 1. Agents with Managers */}
                    <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-blue-900 uppercase">Agents with Managers</span>
                                <span className="text-xs font-extrabold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">49.6%</span>
                            </div>
                            <h4 className="text-xl font-black text-blue-950">{formatFullNaira(stats.salesAgentsWithManagers)}</h4>
                            <p className="text-xs text-slate-500 mt-1">Supervised by 45 Territory Managers across all regions.</p>
                        </div>
                        <div className="mt-3 pt-3 border-t border-blue-100/80 flex justify-between text-[11px] font-bold text-blue-800">
                            <span>820 Active Agents</span>
                            <span>Highest Volume</span>
                        </div>
                    </div>

                    {/* 2. Partners & Resellers */}
                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-emerald-900 uppercase">Partners & Resellers</span>
                                <span className="text-xs font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">28.3%</span>
                            </div>
                            <h4 className="text-xl font-black text-emerald-950">{formatFullNaira(stats.salesByPartners)}</h4>
                            <p className="text-xs text-slate-500 mt-1">86 Certified corporate reseller partners & franchises.</p>
                        </div>
                        <div className="mt-3 pt-3 border-t border-emerald-100/80 flex justify-between text-[11px] font-bold text-emerald-800">
                            <span>86 Partner Hubs</span>
                            <span>High Value Deals</span>
                        </div>
                    </div>

                    {/* 3. Agents without Managers */}
                    <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-amber-900 uppercase">Agents without Managers</span>
                                <span className="text-xs font-extrabold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">22.1%</span>
                            </div>
                            <h4 className="text-xl font-black text-amber-950">{formatFullNaira(stats.salesAgentsWithoutManagers)}</h4>
                            <p className="text-xs text-slate-500 mt-1">425 Independent direct field agents operating autonomously.</p>
                        </div>
                        <div className="mt-3 pt-3 border-t border-amber-100/80 flex justify-between text-[11px] font-bold text-amber-800">
                            <span>425 Direct Agents</span>
                            <span>Direct Onboarding</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTION 3: CORE PLATFORM ENTITIES */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                
                {/* Total Locations */}
                <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase mb-1">
                        <span>Locations</span>
                        <i className="fas fa-location-dot text-sky-500"></i>
                    </div>
                    <p className="text-lg font-black text-slate-900">{stats.totalLocations.toLocaleString()}</p>
                    <p className="text-[11px] text-emerald-600 font-bold mt-0.5">+{stats.newLocations} new</p>
                </div>

                {/* Total Customers */}
                <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase mb-1">
                        <span>Total Customers</span>
                        <i className="fas fa-users-gear text-indigo-500"></i>
                    </div>
                    <p className="text-lg font-black text-slate-900">{stats.totalCustomers.toLocaleString()}</p>
                    <p className="text-[11px] text-emerald-600 font-bold mt-0.5">+{stats.newCustomers} new</p>
                </div>

                {/* Total Free Trials */}
                <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase mb-1">
                        <span>Free Trials</span>
                        <i className="fas fa-clock text-amber-500"></i>
                    </div>
                    <p className="text-lg font-black text-slate-900">{stats.totalFreeTrials.toLocaleString()}</p>
                    <p className="text-[11px] text-amber-600 font-bold mt-0.5">+{stats.newFreeTrials} new</p>
                </div>

                {/* Total Businesses */}
                <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase mb-1">
                        <span>Businesses</span>
                        <i className="fas fa-briefcase text-emerald-500"></i>
                    </div>
                    <p className="text-lg font-black text-slate-900">{stats.totalBusinesses.toLocaleString()}</p>
                    <p className="text-[11px] text-emerald-600 font-bold mt-0.5">+{stats.newBusinesses} new</p>
                </div>

                {/* Total Agents */}
                <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase mb-1">
                        <span>Agents</span>
                        <i className="fas fa-user-tie text-blue-500"></i>
                    </div>
                    <p className="text-lg font-black text-slate-900">{stats.totalAgents.toLocaleString()}</p>
                    <p className="text-[11px] text-slate-500 font-semibold mt-0.5">380 active today</p>
                </div>

                {/* Total Partners */}
                <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase mb-1">
                        <span>Partners</span>
                        <i className="fas fa-handshake text-purple-500"></i>
                    </div>
                    <p className="text-lg font-black text-slate-900">{stats.totalPartners.toLocaleString()}</p>
                    <p className="text-[11px] text-purple-600 font-bold mt-0.5">Certified</p>
                </div>

            </div>

            {/* SECTION 4: TOP 5 STATES, TOP 5 MANAGERS & TOP 5 AGENTS */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5 pb-3 border-b border-slate-100">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <i className="fas fa-trophy text-amber-500"></i>
                            Top 5 Performance Leaders
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Top performing territories (States), Territory Managers, and Field Sales Agents.
                        </p>
                    </div>

                    {/* Tabs between States, Managers, Agents */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                        <button
                            onClick={() => setLeaderboardTab('states')}
                            className={`px-3 py-1.5 rounded-lg transition-all ${leaderboardTab === 'states' ? 'bg-[#02275A] text-white shadow-xs font-extrabold' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                            <i className="fas fa-map-location-dot mr-1"></i> Top 5 States
                        </button>
                        <button
                            onClick={() => setLeaderboardTab('managers')}
                            className={`px-3 py-1.5 rounded-lg transition-all ${leaderboardTab === 'managers' ? 'bg-[#02275A] text-white shadow-xs font-extrabold' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                            <i className="fas fa-user-shield mr-1"></i> Top 5 Managers
                        </button>
                        <button
                            onClick={() => setLeaderboardTab('agents')}
                            className={`px-3 py-1.5 rounded-lg transition-all ${leaderboardTab === 'agents' ? 'bg-[#02275A] text-white shadow-xs font-extrabold' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                            <i className="fas fa-user-tie mr-1"></i> Top 5 Agents
                        </button>
                    </div>
                </div>

                {/* Tab 1: Top 5 States */}
                {leaderboardTab === 'states' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-slate-200 text-slate-400 font-extrabold uppercase tracking-wider">
                                    <th className="pb-3 px-3">Rank / State</th>
                                    <th className="pb-3 px-3">Sales Revenue</th>
                                    <th className="pb-3 px-3">Businesses Onboarded</th>
                                    <th className="pb-3 px-3">Active Agents</th>
                                    <th className="pb-3 px-3">Growth Rate</th>
                                    <th className="pb-3 px-3 text-right">National Share</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {topStatesData.map((state, idx) => (
                                    <tr key={state.name} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="py-3 px-3 font-bold text-slate-900 flex items-center gap-2">
                                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${idx === 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'}`}>
                                                #{idx + 1}
                                            </span>
                                            <span>{state.name}</span>
                                        </td>
                                        <td className="py-3 px-3 font-extrabold text-slate-900">{formatFullNaira(state.revenue)}</td>
                                        <td className="py-3 px-3 font-semibold text-slate-600">{state.businesses.toLocaleString()} stores</td>
                                        <td className="py-3 px-3 font-semibold text-slate-600">{state.agents} agents</td>
                                        <td className="py-3 px-3 font-bold text-emerald-600">{state.growth}</td>
                                        <td className="py-3 px-3 text-right font-bold text-slate-700">{state.share}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Tab 2: Top 5 Managers */}
                {leaderboardTab === 'managers' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-slate-200 text-slate-400 font-extrabold uppercase tracking-wider">
                                    <th className="pb-3 px-3">Manager</th>
                                    <th className="pb-3 px-3">Assigned Region</th>
                                    <th className="pb-3 px-3">Agents in Team</th>
                                    <th className="pb-3 px-3">Team Sales</th>
                                    <th className="pb-3 px-3">Quota Attainment</th>
                                    <th className="pb-3 px-3 text-right">Commission</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {topManagersData.map((mgr, idx) => (
                                    <tr key={mgr.name} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="py-3 px-3 font-bold text-slate-900 flex items-center gap-2">
                                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${idx === 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'}`}>
                                                #{idx + 1}
                                            </span>
                                            <span>{mgr.name}</span>
                                        </td>
                                        <td className="py-3 px-3 font-semibold text-slate-600">{mgr.region}</td>
                                        <td className="py-3 px-3 font-semibold text-slate-600">{mgr.teamSize} agents</td>
                                        <td className="py-3 px-3 font-extrabold text-[#02275A]">{formatFullNaira(mgr.sales)}</td>
                                        <td className="py-3 px-3 font-bold text-emerald-600">{mgr.targetAchieved}</td>
                                        <td className="py-3 px-3 text-right font-bold text-amber-600">{formatFullNaira(mgr.commission)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Tab 3: Top 5 Agents */}
                {leaderboardTab === 'agents' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-slate-200 text-slate-400 font-extrabold uppercase tracking-wider">
                                    <th className="pb-3 px-3">Agent Name</th>
                                    <th className="pb-3 px-3">Territory</th>
                                    <th className="pb-3 px-3">Reporting Manager</th>
                                    <th className="pb-3 px-3">Stores Onboarded</th>
                                    <th className="pb-3 px-3">Total Sales</th>
                                    <th className="pb-3 px-3 text-right">Commission Earned</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {topAgentsData.map((agent, idx) => (
                                    <tr key={agent.name} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="py-3 px-3 font-bold text-slate-900 flex items-center gap-2">
                                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${idx === 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'}`}>
                                                #{idx + 1}
                                            </span>
                                            <span>{agent.name}</span>
                                        </td>
                                        <td className="py-3 px-3 font-semibold text-slate-600">{agent.territory}</td>
                                        <td className="py-3 px-3 font-semibold text-slate-600">{agent.manager}</td>
                                        <td className="py-3 px-3 font-bold text-blue-600">{agent.storesOnboarded} stores</td>
                                        <td className="py-3 px-3 font-extrabold text-[#02275A]">{formatFullNaira(agent.sales)}</td>
                                        <td className="py-3 px-3 text-right font-bold text-amber-600">{formatFullNaira(agent.commission)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* SECTION 5: TOP 5 BUSINESS TYPES & INDUSTRIES (With Retention Rate and New Customers) */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5 pb-3 border-b border-slate-100">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <i className="fas fa-building-user text-[#02275A]"></i>
                            Top 5 Business Types & Industry Segments
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Active business counts, new customer additions, retention rate %, and sales volume.
                        </p>
                    </div>

                    {/* Toggle between Business Type and Business Industry */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                        <button
                            onClick={() => setActiveIndustryTab('type')}
                            className={`px-3 py-1.5 rounded-lg transition-all ${activeIndustryTab === 'type' ? 'bg-[#02275A] text-white shadow-xs font-extrabold' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                            <i className="fas fa-tags mr-1"></i> By Business Type
                        </button>
                        <button
                            onClick={() => setActiveIndustryTab('industry')}
                            className={`px-3 py-1.5 rounded-lg transition-all ${activeIndustryTab === 'industry' ? 'bg-[#02275A] text-white shadow-xs font-extrabold' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                            <i className="fas fa-industry mr-1"></i> By Business Industry
                        </button>
                    </div>
                </div>

                {/* Business Type Table */}
                {activeIndustryTab === 'type' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-slate-200 text-slate-400 font-extrabold uppercase tracking-wider">
                                    <th className="pb-3 px-3">Business Type</th>
                                    <th className="pb-3 px-3">Total Businesses</th>
                                    <th className="pb-3 px-3">New Customers ({trackingPeriod})</th>
                                    <th className="pb-3 px-3">Retention Rate</th>
                                    <th className="pb-3 px-3 text-right">Sales Volume</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {businessTypesData.map((item, idx) => (
                                    <tr key={item.type} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="py-3 px-3 font-bold text-slate-900 flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                                            <span>{item.type}</span>
                                        </td>
                                        <td className="py-3 px-3 font-bold text-slate-800">{item.businesses.toLocaleString()} stores</td>
                                        <td className="py-3 px-3 font-bold text-emerald-600">+{item.newCustomers} new</td>
                                        <td className="py-3 px-3 font-extrabold text-blue-700">
                                            <span className="bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                                                {item.retentionRate}% CRR
                                            </span>
                                        </td>
                                        <td className="py-3 px-3 text-right font-black text-slate-900">{formatFullNaira(item.salesVolume)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Business Industry Table */}
                {activeIndustryTab === 'industry' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-slate-200 text-slate-400 font-extrabold uppercase tracking-wider">
                                    <th className="pb-3 px-3">Industry Vertical</th>
                                    <th className="pb-3 px-3">Total Businesses</th>
                                    <th className="pb-3 px-3">New Customers ({trackingPeriod})</th>
                                    <th className="pb-3 px-3">Retention Rate</th>
                                    <th className="pb-3 px-3 text-right">Sales Volume</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {businessIndustriesData.map((item, idx) => (
                                    <tr key={item.industry} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="py-3 px-3 font-bold text-slate-900 flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                                            <span>{item.industry}</span>
                                        </td>
                                        <td className="py-3 px-3 font-bold text-slate-800">{item.businesses.toLocaleString()} stores</td>
                                        <td className="py-3 px-3 font-bold text-emerald-600">+{item.newCustomers} new</td>
                                        <td className="py-3 px-3 font-extrabold text-blue-700">
                                            <span className="bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                                                {item.retentionRate}% CRR
                                            </span>
                                        </td>
                                        <td className="py-3 px-3 text-right font-black text-slate-900">{formatFullNaira(item.salesVolume)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* SECTION 6: PAYMENT METHODS */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <i className="fas fa-credit-card text-[#02275A]"></i>
                            Transactions by Payment Methods
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Breakdown of transaction values, volume counts, and percentage distribution.
                        </p>
                    </div>

                    {/* Toggle Value vs Count */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                        <button
                            onClick={() => setPaymentFilterType('value')}
                            className={`px-3 py-1 rounded-lg transition-all ${paymentFilterType === 'value' ? 'bg-white text-[#02275A] shadow-xs font-extrabold' : 'text-slate-600'}`}
                        >
                            By Value (₦)
                        </button>
                        <button
                            onClick={() => setPaymentFilterType('count')}
                            className={`px-3 py-1 rounded-lg transition-all ${paymentFilterType === 'count' ? 'bg-white text-[#02275A] shadow-xs font-extrabold' : 'text-slate-600'}`}
                        >
                            By Count (#)
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    {/* Donut Chart */}
                    <div className="lg:col-span-5 flex flex-col items-center justify-center p-3 bg-slate-50 rounded-xl">
                        <div className="h-56 w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={paymentMethodsData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={85}
                                        paddingAngle={3}
                                        dataKey={paymentFilterType === 'value' ? 'value' : 'count'}
                                    >
                                        {paymentMethodsData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        formatter={(value: any, name: any, item: any) => [
                                            paymentFilterType === 'value' ? formatFullNaira(Number(value)) : `${Number(value).toLocaleString()} Txns`,
                                            item.payload.shortName
                                        ]}
                                        contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12px', fontWeight: 'bold' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Total {paymentFilterType === 'value' ? 'Value' : 'Txns'}</span>
                                <span className="text-base font-black text-[#02275A]">
                                    {paymentFilterType === 'value' ? formatNaira(stats.totalTransactionsValue) : `${stats.totalTransactionsCount.toLocaleString()}`}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Ranked List */}
                    <div className="lg:col-span-7 space-y-2.5">
                        {paymentMethodsData.map((method, idx) => (
                            <div 
                                key={method.name}
                                className="p-3 bg-slate-50/70 border border-slate-200/60 rounded-xl flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white text-xs shrink-0" style={{ backgroundColor: method.color }}>
                                        #{idx + 1}
                                    </div>
                                    <div>
                                        <p className="font-bold text-xs sm:text-sm text-slate-900">{method.name}</p>
                                        <p className="text-[11px] text-slate-400 font-medium">{method.share}% overall share</p>
                                    </div>
                                </div>

                                <div className="text-right shrink-0">
                                    <p className="text-xs sm:text-sm font-black text-slate-900">
                                        {paymentFilterType === 'value' ? formatFullNaira(method.value) : `${method.count.toLocaleString()} txns`}
                                    </p>
                                    <p className="text-[11px] text-slate-500 font-semibold">
                                        {paymentFilterType === 'value' ? `${method.count.toLocaleString()} txns` : formatFullNaira(method.value)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* SECTION 7: RETENTION & CHURN COMPARISON */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <i className="fas fa-arrows-spin text-emerald-600"></i>
                            Customer Retention (Active vs Total)
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Monthly Total Customers versus Active Transacting Customers.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg">
                            Avg CRR: {stats.customerRetentionRate}%
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    {/* Bar Chart Comparison */}
                    <div className="lg:col-span-8 h-60 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={retentionTrendData} barSize={24}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12px', fontWeight: 'bold' }}
                                />
                                <Legend verticalAlign="top" align="right" height={32} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                                <Bar dataKey="totalCustomers" name="Total Customers" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="activeCustomers" name="Active Customers" fill="#10B981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Summary Quick Table */}
                    <div className="lg:col-span-4 bg-slate-50 rounded-xl p-4 border border-slate-200/60 space-y-3">
                        <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Latest Month Summary</h4>
                        
                        <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
                            <span className="text-slate-600 font-bold">Total Customers:</span>
                            <span className="text-slate-800 font-extrabold text-sm">{retentionTrendData[retentionTrendData.length - 1].totalCustomers.toLocaleString()}</span>
                        </div>

                        <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
                            <span className="text-slate-600 font-bold">Active Customers:</span>
                            <span className="text-emerald-700 font-extrabold text-sm">{retentionTrendData[retentionTrendData.length - 1].activeCustomers.toLocaleString()}</span>
                        </div>

                        <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
                            <span className="text-slate-600 font-bold">Inactive / Churned:</span>
                            <span className="text-rose-600 font-extrabold text-sm">{(retentionTrendData[retentionTrendData.length - 1].totalCustomers - retentionTrendData[retentionTrendData.length - 1].activeCustomers).toLocaleString()}</span>
                        </div>

                        <div className="flex justify-between items-center text-xs pt-1">
                            <span className="text-slate-600 font-bold">Monthly Retention Rate:</span>
                            <span className="text-slate-900 font-extrabold text-sm">{retentionTrendData[retentionTrendData.length - 1].retentionRate}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTION 8: ADMIN MANAGEMENT SHORTCUTS */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <i className="fas fa-th-large text-[#02275A]"></i>
                            Admin Management Centers
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Direct quick access to monitor operations across administrative departments.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {adminShortcuts.map(item => (
                        <button
                            key={item.view}
                            onClick={() => setView && setView(item.view)}
                            className="p-3.5 rounded-xl border border-slate-200/70 hover:border-[#02275A]/40 hover:bg-slate-50 transition-all text-left flex items-start justify-between group cursor-pointer"
                        >
                            <div className="space-y-1">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${item.color}`}>
                                    <i className={`fas ${item.icon}`}></i>
                                </div>
                                <p className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-[#02275A] pt-1">
                                    {item.label}
                                </p>
                                <p className="text-[11px] text-slate-500 font-medium">
                                    {item.count}
                                </p>
                            </div>
                            <i className="fas fa-arrow-right text-slate-300 group-hover:text-[#02275A] text-xs pt-1"></i>
                        </button>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default AdminDashboardView;
