import React, { useState } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { CEOMetrics, RevenueMetric, RunwayMetric, RetentionMetric, EfficiencyMetric, ProfitabilityMetric, CEORiskAlert } from '../types';

const MOCK_CEO_SUMMARY: CEOMetrics = {
    cashBalance: 450000000,
    monthlyRevenue: 85000000,
    netRevenue: 72000000,
    burnRate: 45000000,
    runwayMonths: 10,
    activeCustomers: 4500,
    monthlyGrowth: 12.5,
    churnRate: 2.1,
    profit: 27000000,
    nrr: 112,
    grr: 96,
    ltvCacRatio: 4.2,
    cacPaybackMonths: 8,
    burnMultiple: 1.5,
    zeroCashDate: 'March 2027',
    ruleOf40: 44.3,
    magicNumber: 1.2
};

const MOCK_REVENUE_TREND = [
    { name: 'Jan', revenue: 65000000, expenses: 40000000 },
    { name: 'Feb', revenue: 68000000, expenses: 42000000 },
    { name: 'Mar', revenue: 72000000, expenses: 43000000 },
    { name: 'Apr', revenue: 78000000, expenses: 44000000 },
    { name: 'May', revenue: 85000000, expenses: 45000000 },
];

const MOCK_COUNTRY_REVENUE = [
    { country: 'Nigeria', revenue: 60000000 },
    { country: 'Ghana', revenue: 15000000 },
    { country: 'Kenya', revenue: 7000000 },
    { country: 'Rwanda', revenue: 3000000 },
];

const MOCK_RISK_ALERTS: CEORiskAlert[] = [
    { id: '1', type: 'warning', title: 'Rising Infrastructure Costs', description: 'Infrastructure costs rose by 15% this month, exceeding budget by 5%.', date: '2 hours ago' },
    { id: '2', type: 'critical', title: 'High Churn in Retail Segment', description: 'Monthly churn rate for retail businesses in Lagos hit 4.5% this week.', date: '5 hours ago' },
];

const COLORS = ['#02275A', '#FFD700', '#F59E0B', '#10B981', '#6366F1'];

interface AdminCEODashboardProps {
    marketingExpenses?: number;
}

const AdminCEODashboardView: React.FC<AdminCEODashboardProps> = ({ marketingExpenses = 500000 }) => {
    const [activeTab, setActiveTab] = useState('summary');

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(value);
    };

    const renderSummary = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                <MetricBox title="Cash Balance" value={formatCurrency(MOCK_CEO_SUMMARY.cashBalance)} subtext="Bank Balances" icon="fa-building-columns" color="blue" />
                <MetricBox title="Monthly Revenue" value={formatCurrency(MOCK_CEO_SUMMARY.monthlyRevenue)} subtext="+12% from last month" icon="fa-chart-line" color="emerald" />
                <MetricBox title="Monthly Burn" value={formatCurrency(MOCK_CEO_SUMMARY.burnRate)} subtext="Operating Expenses" icon="fa-fire" color="rose" />
                <MetricBox title="Runway" value={`${MOCK_CEO_SUMMARY.runwayMonths} Months`} subtext="Projected Survival" icon="fa-hourglass-half" color="amber" />
                <MetricBox title="Active Customers" value={MOCK_CEO_SUMMARY.activeCustomers.toLocaleString()} subtext="Paying Businesses" icon="fa-id-card" color="indigo" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <i className="fas fa-chart-area text-[#02275A]"></i>
                        Revenue vs Expenses Trend
                    </h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={MOCK_REVENUE_TREND}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#02275A" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#02275A" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: number) => [formatCurrency(value), '']}
                                />
                                <Legend verticalAlign="top" align="right" height={36} iconType="circle" />
                                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#02275A" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                                <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#F59E0B" fillOpacity={0.05} fill="#F59E0B" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <i className="fas fa-globe text-[#02275A]"></i>
                        Revenue by Country
                    </h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={MOCK_COUNTRY_REVENUE}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="revenue"
                                    nameKey="country"
                                >
                                    {MOCK_COUNTRY_REVENUE.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: number) => [formatCurrency(value), '']}
                                />
                                <Legend verticalAlign="bottom" align="center" iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderRevenue = () => (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricBox title="MRR (Monthly Recurring)" value={formatCurrency(78000000)} subtext="Predictable Revenue" icon="fa-repeat" color="blue" />
                <MetricBox title="ARR (Annual Run Rate)" value={formatCurrency(936000000)} subtext="Yearly Projection" icon="fa-calendar-check" color="indigo" />
                <MetricBox title="New Revenue" value={formatCurrency(12500000)} subtext="This Month" icon="fa-plus-circle" color="emerald" />
                <MetricBox title="Churned Revenue" value={formatCurrency(1800000)} subtext="Lost Subscriptions" icon="fa-minus-circle" color="rose" />
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-xl font-bold text-slate-800 mb-8 tracking-tight">Revenue Breakdown by Plan</h3>
                <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                            { plan: 'Basic', revenue: 15000000 },
                            { plan: 'Standard', revenue: 28000000 },
                            { plan: 'Premium', revenue: 32000000 },
                            { plan: 'Ultimate', revenue: 10000000 },
                        ]}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="plan" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            <Bar dataKey="revenue" fill="#02275A" radius={[8, 8, 0, 0]} barSize={60} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );

    const renderRunway = () => (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="lg:w-1/3 bg-[#02275A] text-white p-8 rounded-2xl shadow-xl shadow-blue-900/20 relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                    <div>
                        <p className="text-blue-200 text-sm font-bold uppercase tracking-widest mb-1">Estimated Runway</p>
                        <h2 className="text-6xl font-black mb-4">{MOCK_CEO_SUMMARY.runwayMonths.toFixed(1)} <span className="text-2xl font-medium">Months</span></h2>
                        <div className="w-full bg-blue-900/50 h-3 rounded-full overflow-hidden mb-6">
                            <div className="bg-amber-400 h-full w-[83%] rounded-full shadow-[0_0_10px_rgba(251,191,36,0.5)]"></div>
                        </div>
                        <p className="text-sm text-blue-100">Survival based on current <span className="font-bold text-white">{formatCurrency(MOCK_CEO_SUMMARY.burnRate)}/mo</span> net burn. Recommended minimum runway: 18 months.</p>
                    </div>
                    <div className="mt-8 pt-6 border-t border-blue-800">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center">
                                <i className="fas fa-calendar-xmark"></i>
                            </div>
                            <div>
                                <p className="text-xs text-blue-200 uppercase font-bold tracking-widest mb-0.5">Zero Cash Date</p>
                                <p className="font-bold text-white">{MOCK_CEO_SUMMARY.zeroCashDate}</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative group overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50/50 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-rose-100/50 transition-colors"></div>
                        <p className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-wider flex items-center gap-2">
                            <i className="fas fa-fire-flame-curved text-rose-500"></i> Cash Dynamics
                        </p>
                        <div className="space-y-4 relative z-10">
                            <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                                <span className="text-slate-500 font-medium">Available Cash</span>
                                <span className="font-bold text-slate-800 tracking-tight">{formatCurrency(MOCK_CEO_SUMMARY.cashBalance)}</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                                <span className="text-slate-500 font-medium">Monthly Gross Burn</span>
                                <span className="font-bold text-slate-800 tracking-tight">{formatCurrency(MOCK_CEO_SUMMARY.burnRate + MOCK_CEO_SUMMARY.monthlyRevenue)}</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b border-slate-50 text-rose-600">
                                <span className="font-medium">Monthly Net Burn</span>
                                <span className="font-black tracking-tight">{formatCurrency(MOCK_CEO_SUMMARY.burnRate)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-slate-500 font-medium text-sm">Monthly Revenue</span>
                                <span className="font-bold text-emerald-600 tracking-tight text-sm">+{formatCurrency(MOCK_CEO_SUMMARY.monthlyRevenue)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-wider flex items-center gap-2">
                            <i className="fas fa-money-bill-transfer text-emerald-500"></i> Cashflow Forecast
                        </p>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                                <span className="text-slate-500 font-medium">Expected A/R (30 days)</span>
                                <span className="font-bold text-emerald-600 tracking-tight">+{formatCurrency(28900000)}</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                                <span className="text-slate-500 font-medium">Upcoming A/P (30 days)</span>
                                <span className="font-bold text-rose-600 tracking-tight">-{formatCurrency(12500000)}</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b border-slate-50 bg-slate-50 p-2 rounded-lg mt-2">
                                <span className="text-slate-600 font-bold">Net 30-Day Cashflow</span>
                                <span className="font-black text-emerald-600 tracking-tight">+{formatCurrency(16400000)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-rose-50 border border-rose-100 p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <h3 className="text-lg font-black text-rose-900 mb-2 flex items-center gap-2">
                        <i className="fas fa-triangle-exclamation text-rose-600"></i>
                        Capital Strategy Alert
                    </h3>
                    <p className="text-sm text-rose-800 leading-relaxed max-w-3xl">
                        With {MOCK_CEO_SUMMARY.runwayMonths} months of runway, the company is slightly below the recommended 18-month safety buffer. 
                        To reach a default-alive position (profitability) before the Zero Cash Date ({MOCK_CEO_SUMMARY.zeroCashDate}), we need to either reduce net burn by {formatCurrency(MOCK_CEO_SUMMARY.burnRate * 0.4)}/mo or grow MRR by 18% consistently over the next 4 months.
                    </p>
                </div>
                <div className="flex-none">
                    <button className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-black transition-shadow shadow-lg shadow-rose-600/20 whitespace-nowrap">
                        Initiate Contingency Plan
                    </button>
                </div>
            </div>
        </div>
    );

    const renderRetention = () => (
        <div className="space-y-6 animate-fade-in">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <MetricBox title="Customer Churn Rate" value="2.1%" subtext="Healthy: Below 3%" icon="fa-user-minus" color="amber" />
                <MetricBox title="Renewal Rate" value="94.8%" subtext="Target: 96%" icon="fa-arrows-rotate" color="emerald" />
                <MetricBox title="Avg. Customer LTV" value={formatCurrency(485000)} subtext="Lifetime Value" icon="fa-gem" color="indigo" />
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Retention Breakdown</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                <th className="pb-4 px-4 font-black">Segment</th>
                                <th className="pb-4 px-4 font-black text-center">Renewal Rate</th>
                                <th className="pb-4 px-4 font-black text-center">Avg. Duration</th>
                                <th className="pb-4 px-4 font-black text-center">Churn Risk</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {[
                                { name: 'Retail / Small Biz', renewal: '92%', duration: '14 Months', risk: 'Medium', riskClass: 'text-amber-600 bg-amber-50' },
                                { name: 'Enterprise / Corporate', renewal: '99%', duration: '28 Months', risk: 'Low', riskClass: 'text-emerald-600 bg-emerald-50' },
                                { name: 'Professional Services', renewal: '95%', duration: '18 Months', risk: 'Low', riskClass: 'text-emerald-600 bg-emerald-50' },
                                { name: 'Manufacturing', renewal: '89%', duration: '11 Months', risk: 'High', riskClass: 'text-rose-600 bg-rose-50' },
                            ].map((row, i) => (
                                <tr key={i} className="hover:bg-slate-50 transition-colors">
                                    <td className="py-4 px-4 text-sm font-bold text-slate-700">{row.name}</td>
                                    <td className="py-4 px-4 text-sm text-center text-slate-600">{row.renewal}</td>
                                    <td className="py-4 px-4 text-sm text-center text-slate-600">{row.duration}</td>
                                    <td className="py-4 px-4 text-center">
                                        <span className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-full ${row.riskClass}`}>
                                            {row.risk}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderProfitability = () => (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <MetricBox title="Gross Margin" value="84.7%" subtext="Software standard" icon="fa-percent" color="emerald" />
                <MetricBox title="Net Profit Margin" value="31.8%" subtext="Healthy profitability" icon="fa-piggy-bank" color="indigo" />
                <MetricBox title="Infrastructure Ratio" value="6.4%" subtext="Cost to Revenue" icon="fa-server" color="blue" />
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-indigo-100/50 transition-colors"></div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Cost Optimization Suggestions</h3>
                <p className="text-slate-500 text-sm mb-8 max-w-2xl">Based on current profitability and infrastructure ratios, here are identified areas for potential savings.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-200 transition-all">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                                <i className="fas fa-server"></i>
                            </div>
                            <h4 className="font-bold text-slate-800">Cloud Infrastructure</h4>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">Scaling DB instances during off-peak hours could reduce costs by <span className="font-bold text-emerald-600">8-12%</span>.</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-200 transition-all">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                                <i className="fas fa-comments-dollar"></i>
                            </div>
                            <h4 className="font-bold text-slate-800">SMS Gateway Optimization</h4>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">Transitioning specific alerts to WhatsApp/In-App could lower notification spend by <span className="font-bold text-emerald-600">₦1.2M/mo</span>.</p>
                    </div>
                </div>
            </div>
        </div>
    );

    const newCustomersThisMonth = 45;
    const dynamicCAC = marketingExpenses > 0 ? marketingExpenses / newCustomersThisMonth : 115000;
    
    const renderEfficiency = () => (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricBox title="LTV:CAC Ratio" value={`${(485000 / dynamicCAC).toFixed(1)}x`} subtext="Target: > 3x" icon="fa-balance-scale" color="emerald" />
                <MetricBox title="CAC Payback" value={`${Math.max(1, Math.round(dynamicCAC / 15000))} Months`} subtext="Target: < 12 Months" icon="fa-rotate-left" color="blue" />
                <MetricBox title="Magic Number" value={`${MOCK_CEO_SUMMARY.magicNumber}`} subtext="Sales Efficiency (Target: > 1)" icon="fa-wand-magic-sparkles" color="indigo" />
                <MetricBox title="Burn Multiple" value={`${MOCK_CEO_SUMMARY.burnMultiple}x`} subtext="Net Burn / Net New ARR" icon="fa-fire-flame-curved" color="amber" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative">
                    <div className="absolute top-4 right-4 bg-purple-50 text-purple-600 text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded-full border border-purple-100 flex items-center gap-1">
                        <i className="fas fa-link"></i> Live from Finance Center
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <i className="fas fa-bullseye text-[#02275A]"></i>
                        Acquisition Economics
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                            <span className="text-slate-500 font-medium">Customer Acquisition Cost (CAC)</span>
                            <span className="font-bold text-slate-800 tracking-tight">{formatCurrency(dynamicCAC)}</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                            <span className="text-slate-500 font-medium">Cost Per Lead (CPL)</span>
                            <span className="font-bold text-slate-800 tracking-tight">{formatCurrency(marketingExpenses / 250)}</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                            <span className="text-slate-500 font-medium">Total Marketing Expenses (CAC Pool)</span>
                            <span className="font-bold text-purple-600 tracking-tight">{formatCurrency(marketingExpenses)}</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                            <span className="text-slate-500 font-medium">Lead to Customer Conversion</span>
                            <span className="font-bold text-emerald-600 tracking-tight">{(45 / 250 * 100).toFixed(1)}%</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-2xl border border-indigo-100 shadow-sm">
                    <h3 className="text-lg font-bold text-indigo-900 mb-6 flex items-center gap-2">
                        <i className="fas fa-lightbulb text-amber-500"></i>
                        Efficiency Insights
                    </h3>
                    <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                            <i className="fas fa-check-circle text-emerald-500 mt-1"></i>
                            <p className="text-sm text-slate-700 leading-relaxed"><strong className="text-indigo-900">Highly Efficient Growth:</strong> With a Magic Number of {MOCK_CEO_SUMMARY.magicNumber}, for every dollar spent on sales & marketing, we are generating ${MOCK_CEO_SUMMARY.magicNumber} in ARR. We should accelerate marketing spend.</p>
                        </li>
                        <li className="flex items-start gap-3">
                            <i className="fas fa-check-circle text-emerald-500 mt-1"></i>
                            <p className="text-sm text-slate-700 leading-relaxed"><strong className="text-indigo-900">Capital Efficient:</strong> A burn multiple of {MOCK_CEO_SUMMARY.burnMultiple}x means we burn {MOCK_CEO_SUMMARY.burnMultiple} dollars to generate 1 dollar of Net New ARR. This is considered "Good" for early/growth stage.</p>
                        </li>
                        <li className="flex items-start gap-3">
                            <i className="fas fa-exclamation-circle text-amber-500 mt-1"></i>
                            <p className="text-sm text-slate-700 leading-relaxed"><strong className="text-indigo-900">LTV Expansion:</strong> Although payback is fast ({MOCK_CEO_SUMMARY.cacPaybackMonths} months), cross-selling Ultimate plans could further push LTV:CAC past 5x.</p>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );

    const renderInvestors = () => (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricBox title="Net Revenue Retention (NRR)" value={`${MOCK_CEO_SUMMARY.nrr}%`} subtext="Target: > 110%" icon="fa-chart-pie" color="indigo" />
                <MetricBox title="Gross Revenue Retention (GRR)" value={`${MOCK_CEO_SUMMARY.grr}%`} subtext="Target: > 90%" icon="fa-shield-halved" color="emerald" />
                <MetricBox title="Rule of 40" value={`${MOCK_CEO_SUMMARY.ruleOf40}%`} subtext="Growth + Margin (%)" icon="fa-chart-line" color="blue" />
                <MetricBox title="Zero Cash Date" value={MOCK_CEO_SUMMARY.zeroCashDate} subtext="If Burn Remains Constant" icon="fa-calendar-xmark" color="rose" />
            </div>

            <div className="bg-[#02275A] text-white p-8 rounded-2xl shadow-sm relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="relative z-10">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <i className="fas fa-file-invoice text-blue-300"></i> Board & Investor Summary
                    </h3>
                    <p className="text-blue-100 mb-6 max-w-4xl leading-relaxed text-sm">
                        The company is exhibiting healthy top-line growth ({MOCK_CEO_SUMMARY.monthlyGrowth}% MoM) combined with exceptional Net Revenue Retention ({MOCK_CEO_SUMMARY.nrr}%), indicating strong product-market fit and ability to expand accounts. 
                        Our Burn Multiple indicates efficient capital allocation at {MOCK_CEO_SUMMARY.burnMultiple}x. Runway is tight at {MOCK_CEO_SUMMARY.runwayMonths} months, projecting our Zero Cash Date to be {MOCK_CEO_SUMMARY.zeroCashDate}. 
                        This dictates that we must either close a fundraising round within the next {Math.floor(MOCK_CEO_SUMMARY.runwayMonths - 6)} months to maintain a comfortable 6-month buffer, or aggressively maneuver towards default alive by reducing burn by {formatCurrency(MOCK_CEO_SUMMARY.burnRate * 0.4)}/mo.
                    </p>
                    <div className="flex gap-4">
                        <button className="px-5 py-2.5 bg-white text-[#02275A] rounded-xl text-sm font-black transition-shadow hover:shadow-lg shadow-white/20 flex items-center gap-2">
                            <i className="fas fa-download"></i> Generate Board Deck PDF
                        </button>
                        <button className="px-5 py-2.5 bg-blue-900 border border-blue-700 text-white rounded-xl text-sm font-bold transition-all hover:bg-blue-800 flex items-center gap-2">
                            <i className="fas fa-share-nodes"></i> Share Memo to Investors
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <i className="fas fa-scale-balanced text-indigo-600"></i>
                    Rule of 40 Analysis
                </h3>
                <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-6">
                        <div className="flex-1">
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-bold text-slate-600">YoY Growth Rate</span>
                                <span className="text-sm font-black text-indigo-600">12.5%</span>
                            </div>
                            <div className="w-full bg-slate-200 h-2 rounded-full"><div className="bg-indigo-500 h-full rounded-full w-[12.5%]" /></div>
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-bold text-slate-600">Profit Margin</span>
                                <span className="text-sm font-black text-emerald-600">31.8%</span>
                            </div>
                            <div className="w-full bg-slate-200 h-2 rounded-full"><div className="bg-emerald-500 h-full rounded-full w-[31.8%]" /></div>
                        </div>
                        <div className="flex-none p-4 bg-white rounded-lg border border-slate-200 shadow-sm text-center min-w-[120px]">
                            <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Score</span>
                            <span className="block text-2xl font-black text-slate-800">44.3%</span>
                            <span className="block text-[10px] text-emerald-600 font-bold mt-1">Excellent</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-y-auto no-scrollbar pb-10">
            {/* Header */}
            <div className="bg-white border-b border-slate-100 px-6 py-6 sticky top-0 z-30 shadow-sm backdrop-blur-md bg-white/90">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-[#02275A] tracking-tighter flex items-center gap-2">
                            <i className="fas fa-tower-broadcast text-rose-600 animate-pulse"></i>
                            CEO Command Center
                        </h1>
                        <p className="text-sm text-slate-500 font-medium tracking-wide">Real-time Financial & Growth Strategic Insight</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-all flex items-center gap-2">
                            <i className="fas fa-file-export text-xs"></i>
                            Export CEO Report
                        </button>
                        <button className="px-4 py-2 bg-[#02275A] hover:bg-blue-900 text-white rounded-xl text-sm font-black transition-shadow shadow-lg shadow-blue-900/20">
                            Forecast Simulator
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 mt-8 overflow-x-auto no-scrollbar scroll-smooth">
                    {['summary', 'revenue', 'efficiency', 'runway', 'retention', 'profitability', 'investors'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                activeTab === tab 
                                ? 'bg-[#02275A] text-white shadow-md' 
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="px-6 py-8 max-w-[1600px] mx-auto w-full space-y-8">
                {/* Risk Alerts Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Risk Alerts</h2>
                        <span className="text-[10px] text-rose-500 font-bold bg-rose-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">Immediate Attention Required</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {MOCK_RISK_ALERTS.map(alert => (
                            <div key={alert.id} className="bg-white p-5 rounded-2xl border-l-4 border-rose-500 shadow-sm border border-slate-100 relative group overflow-hidden transition-all hover:scale-[1.01]">
                                <div className="absolute right-4 top-4 text-xs text-slate-400 font-bold">{alert.date}</div>
                                <h4 className="font-black text-slate-800 text-sm mb-1 tracking-tight flex items-center gap-2">
                                    <i className={`fas fa-triangle-exclamation ${alert.type === 'critical' ? 'text-rose-600' : 'text-amber-500'}`}></i>
                                    {alert.title}
                                </h4>
                                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 pr-10">{alert.description}</p>
                                <button className="mt-3 text-[10px] font-black text-[#02275A] uppercase tracking-widest hover:underline">Investigate Source</button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Dashboard Views */}
                {activeTab === 'summary' && renderSummary()}
                {activeTab === 'revenue' && renderRevenue()}
                {activeTab === 'efficiency' && renderEfficiency()}
                {activeTab === 'runway' && renderRunway()}
                {activeTab === 'retention' && renderRetention()}
                {activeTab === 'profitability' && renderProfitability()}
                {activeTab === 'investors' && renderInvestors()}
            </div>
        </div>
    );
};

interface MetricBoxProps {
    title: string;
    value: string;
    subtext: string;
    icon: string;
    color: 'blue' | 'emerald' | 'amber' | 'rose' | 'indigo';
}

const MetricBox: React.FC<MetricBoxProps> = ({ title, value, subtext, icon, color }) => {
    const colorMap = {
        blue: 'bg-blue-50 text-blue-700 border-blue-100 shadow-blue-100/30',
        emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-emerald-100/30',
        amber: 'bg-amber-50 text-amber-700 border-amber-100 shadow-amber-100/30',
        rose: 'bg-rose-50 text-rose-700 border-rose-100 shadow-rose-100/30',
        indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100 shadow-indigo-100/30'
    };

    const iconColorMap = {
        blue: 'bg-blue-600 shadow-blue-600/30',
        emerald: 'bg-emerald-600 shadow-emerald-600/30',
        amber: 'bg-amber-600 shadow-amber-600/30',
        rose: 'bg-rose-600 shadow-rose-600/30',
        indigo: 'bg-indigo-600 shadow-indigo-600/30'
    };

    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative group overflow-hidden transition-all hover:border-indigo-100">
            <div className={`absolute -right-2 -top-2 w-12 h-12 ${colorMap[color]} opacity-10 rounded-full scale-150 group-hover:scale-175 transition-transform`}></div>
            <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl ${iconColorMap[color]} text-white flex items-center justify-center shadow-lg`}>
                    <i className={`fas ${icon} text-sm`}></i>
                </div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</h4>
            </div>
            <div>
                <h3 className="text-2xl font-black text-slate-800 mb-1 tracking-tighter">{value}</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{subtext}</p>
            </div>
        </div>
    );
};

export default AdminCEODashboardView;
