import React, { useState } from 'react';
import MetricCard from './MetricCard';
import { useAlert } from '../contexts/AlertContext';

const AdminDashboardView: React.FC = () => {
    const { showSuccess } = useAlert();
    const [showFabMenu, setShowFabMenu] = useState(false);
    const [trackingPeriod, setTrackingPeriod] = useState('This Month');
    
    const userName = "Administrator";
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="w-full mx-auto px-4 md:px-8 py-6 animate-fade-in relative">
            
            {/* Mobile Action Backdrop */}
            {showFabMenu && (
                <div 
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden animate-fade-in"
                    onClick={() => setShowFabMenu(false)}
                ></div>
            )}

            {/* Mobile FAB */}
            <div className="md:hidden fixed bottom-24 right-4 z-50 flex flex-col items-end gap-3">
                {showFabMenu && (
                    <div className="flex flex-col items-end gap-3 mb-1 animate-fade-in">
                        <button 
                            className="bg-white text-[#02275A] px-5 py-2.5 rounded-full shadow-xl border border-slate-100 font-bold text-sm flex items-center gap-3 transform transition-all active:scale-95"
                        >
                            <span className="whitespace-nowrap">Add User</span>
                            <div className="w-8 h-8 rounded-full bg-[#02275A]/10 flex items-center justify-center text-[#02275A]">
                                <i className="fas fa-user-plus"></i>
                            </div>
                        </button>
                        <button 
                            className="bg-white text-slate-600 px-5 py-2.5 rounded-full shadow-xl border border-slate-100 font-bold text-sm flex items-center gap-3 transform transition-all active:scale-95 delay-75"
                        >
                            <span className="whitespace-nowrap">Broadcast Message</span>
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                <i className="fas fa-bullhorn"></i>
                            </div>
                        </button>
                    </div>
                )}
                <button 
                    onClick={() => setShowFabMenu(!showFabMenu)}
                    className={`w-14 h-14 rounded-full shadow-2xl shadow-[#02275A]/40 flex items-center justify-center text-white text-2xl transition-all duration-300 ${showFabMenu ? 'bg-rose-500 rotate-45' : 'bg-[#02275A] hover:scale-110'}`}
                >
                    <i className="fas fa-plus"></i>
                </button>
            </div>

            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Welcome, {userName}! 👋</h1>
                    <p className="text-sm text-slate-500 mt-1 font-medium">{today}</p>
                </div>
                <div className="hidden md:flex gap-3 w-full md:w-auto">
                    <button 
                        className="flex-1 md:flex-none bg-white border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <i className="fas fa-bullhorn text-slate-400"></i> Broadcast
                    </button>
                    <button 
                        className="flex-1 md:flex-none bg-[#02275A] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-[#02275A]/90 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <i className="fas fa-user-plus"></i> Add User
                    </button>
                </div>
            </div>

            {/* Tracking Period Filter */}
            <div className="flex justify-end mb-4">
                <div className="bg-slate-100 p-1 rounded-xl inline-flex text-sm font-bold shadow-inner">
                    {['Today', 'This Week', 'This Month', 'This Year'].map(period => (
                        <button 
                            key={period}
                            onClick={() => setTrackingPeriod(period)}
                            className={`px-4 py-1.5 rounded-lg transition-all ${trackingPeriod === period ? 'bg-white text-[#02275A] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            {period}
                        </button>
                    ))}
                </div>
            </div>

            {/* Key SaaS Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <MetricCard 
                    icon="fa-coins"
                    colorClass="bg-blue-50 text-blue-600"
                    title="Sales Volume"
                    value="₦4,520,000"
                    subtext={<p className="text-xs text-emerald-600 font-semibold flex items-center gap-1"><i className="fas fa-arrow-up"></i> +12.5% vs last period</p>}
                />
                <MetricCard 
                    icon="fa-exchange-alt"
                    colorClass="bg-indigo-50 text-indigo-600"
                    title="Transactions Done"
                    value="1,432"
                    subtext={<p className="text-xs text-emerald-600 font-semibold flex items-center gap-1"><i className="fas fa-arrow-up"></i> +8.2% vs last period</p>}
                />
                <MetricCard 
                    icon="fa-credit-card"
                    colorClass="bg-emerald-50 text-emerald-600"
                    title="Payments Processed"
                    value="₦12,350,000"
                    subtext={<p className="text-xs text-emerald-600 font-semibold flex items-center gap-1"><i className="fas fa-arrow-up"></i> +15.3% vs last period</p>}
                />
                <MetricCard 
                    icon="fa-shopping-cart"
                    colorClass="bg-amber-50 text-amber-600"
                    title="Platform Purchases"
                    value="₦840,000"
                    subtext={<p className="text-xs text-emerald-600 font-semibold flex items-center gap-1"><i className="fas fa-arrow-up"></i> +5.1% vs last period</p>}
                />
            </div>

            {/* Detailed Tracking Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                
                {/* Subscription Types */}
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-800 text-sm">Subscription Types</h3>
                        <i className="fas fa-layer-group text-slate-400"></i>
                    </div>
                    <div className="space-y-4 flex-1">
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="font-bold text-slate-600">Basic Plan</span>
                                <span className="font-bold text-[#02275A]">45%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-blue-400 h-2 rounded-full" style={{width: '45%'}}></div></div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="font-bold text-slate-600">Standard Plan</span>
                                <span className="font-bold text-[#02275A]">35%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-indigo-500 h-2 rounded-full" style={{width: '35%'}}></div></div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="font-bold text-slate-600">Premium Plan</span>
                                <span className="font-bold text-[#02275A]">20%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-emerald-500 h-2 rounded-full" style={{width: '20%'}}></div></div>
                        </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-50 text-center">
                        <p className="text-xl font-bold text-slate-800">8,450</p>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Total Active Subs</p>
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-800 text-sm">Payment Methods</h3>
                        <i className="fas fa-wallet text-slate-400"></i>
                    </div>
                    <div className="flex justify-center mb-4">
                        <div className="w-32 h-32 rounded-full relative" style={{background: 'conic-gradient(#10b981 0% 50%, #3b82f6 50% 85%, #f59e0b 85% 100%)'}}>
                            <div className="absolute inset-0 m-auto w-20 h-20 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
                                <i className="fas fa-money-check-alt text-slate-300 text-xl"></i>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-3 mt-auto">
                        <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-emerald-500"></div><span className="font-bold text-slate-600">Bank Transfer</span></div>
                            <span className="font-bold text-slate-800">50%</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-blue-500"></div><span className="font-bold text-slate-600">Card Payment</span></div>
                            <span className="font-bold text-slate-800">35%</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-amber-500"></div><span className="font-bold text-slate-600">POS / Other</span></div>
                            <span className="font-bold text-slate-800">15%</span>
                        </div>
                    </div>
                </div>

                {/* Transaction Types */}
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-800 text-sm">Transaction Types</h3>
                        <i className="fas fa-chart-pie text-slate-400"></i>
                    </div>
                    <div className="space-y-5">
                        <div className="border-l-4 border-emerald-500 pl-3">
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Sales Revenue</p>
                            <p className="text-lg font-bold text-slate-800">₦8,450,000</p>
                            <p className="text-xs text-emerald-600 font-semibold"><i className="fas fa-caret-up"></i> 65% of volume</p>
                        </div>
                        <div className="border-l-4 border-blue-500 pl-3">
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Purchases & Expenses</p>
                            <p className="text-lg font-bold text-slate-800">₦3,120,000</p>
                            <p className="text-xs text-rose-500 font-semibold"><i className="fas fa-caret-down"></i> 24% of volume</p>
                        </div>
                        <div className="border-l-4 border-amber-500 pl-3">
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Other Transactions</p>
                            <p className="text-lg font-bold text-slate-800">₦1,430,000</p>
                            <p className="text-xs text-amber-600 font-semibold">11% of volume</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Revenue & Overview */}
            <div className="mb-6">
                {/* Total Revenue Card */}
                <div className="bg-[#02275A] rounded-2xl p-6 text-white shadow-md relative overflow-hidden flex flex-col justify-between">
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-blue-200 text-xs font-bold uppercase tracking-wider mb-1">Total Platform Revenue</p>
                                <h3 className="text-3xl font-bold text-white">₦45,200,000</h3>
                            </div>
                            <button 
                                className="bg-amber-500 text-[#02275A] px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg hover:bg-amber-400 transition-colors transform active:scale-95"
                            >
                                View Report
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4 mt-2">
                            <div>
                                <p className="text-[10px] text-blue-200 uppercase font-bold">This Month</p>
                                <p className="text-lg font-semibold text-white">+₦4,500,000</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-blue-200 uppercase font-bold">Growth</p>
                                <p className="text-lg font-semibold text-emerald-400">+18%</p>
                            </div>
                        </div>
                    </div>
                    <div className="absolute right-0 bottom-0 p-4 opacity-10"><i className="fas fa-chart-line text-9xl text-white"></i></div>
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <MetricCard 
                    icon="fa-users" 
                    colorClass="bg-blue-50 text-blue-600" 
                    title="Total Agents" 
                    value="1,245" 
                    subtext={<p className="text-xs text-emerald-600 font-semibold flex items-center gap-1"><i className="fas fa-arrow-up"></i> +45 this month</p>}
                />
                <MetricCard 
                    icon="fa-user-tie" 
                    colorClass="bg-indigo-50 text-indigo-600" 
                    title="Total Managers" 
                    value="45" 
                    subtext={<p className="text-xs text-emerald-600 font-semibold flex items-center gap-1"><i className="fas fa-arrow-up"></i> +2 this month</p>}
                />
                <MetricCard 
                    icon="fa-store" 
                    colorClass="bg-emerald-50 text-emerald-600" 
                    title="Active Businesses" 
                    value="8,932" 
                    subtext={<p className="text-xs text-emerald-600 font-semibold flex items-center gap-1"><i className="fas fa-arrow-up"></i> +120 this month</p>}
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* User Distribution Pie */}
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col items-center justify-center">
                    <h3 className="font-bold text-slate-800 mb-6 w-full text-left border-b border-slate-50 pb-2">User Distribution</h3>
                    <div className="flex items-center gap-8">
                        <div className="w-40 h-40 rounded-full shadow-inner relative" style={{background: 'conic-gradient(#3b82f6 0% 85%, #6366f1 85% 95%, #10b981 95% 100%)'}}>
                            <div className="absolute inset-0 m-auto w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm">
                                <div className="text-center">
                                    <span className="text-xs text-slate-400">Total Users</span>
                                    <span className="text-slate-800 font-bold text-xl block">1,295</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                <div>
                                    <p className="text-xs text-slate-500">Agents</p>
                                    <p className="text-sm font-bold text-slate-800">1,245 (96%)</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                                <div>
                                    <p className="text-xs text-slate-500">Managers</p>
                                    <p className="text-sm font-bold text-slate-800">45 (3%)</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                <div>
                                    <p className="text-xs text-slate-500">Admins</p>
                                    <p className="text-sm font-bold text-slate-800">5 (1%)</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Radial Revenue Chart */}
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col items-center justify-center">
                    <h3 className="font-bold text-slate-800 mb-6 w-full text-left border-b border-slate-50 pb-2">Revenue vs Target</h3>
                    <div className="flex items-center gap-8">
                        <div className="w-40 h-40 rounded-full relative flex items-center justify-center" style={{background: 'conic-gradient(#02275A 0% 75%, #e2e8f0 75% 100%)'}}>
                            <div className="w-32 h-32 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
                                <span className="text-3xl font-bold text-[#02275A]">75%</span>
                                <span className="text-[10px] text-slate-400 uppercase tracking-wide">Achieved</span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Target Revenue</p>
                                <p className="text-sm font-bold text-slate-800">₦60,000,000</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Actual Revenue</p>
                                <p className="text-sm font-bold text-[#02275A]">₦45,200,000</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Rate Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-xl border border-slate-100 p-5">
                    <p className="text-xs text-slate-500 font-bold mb-3 uppercase">Agent Retention Rate</p>
                    <div className="flex items-end justify-between">
                        <h3 className="text-3xl font-bold text-slate-800">88%</h3>
                        <div className="h-10 w-20 flex items-end gap-1">
                            <div className="bg-blue-200 w-1/4 h-[60%] rounded-t"></div>
                            <div className="bg-blue-300 w-1/4 h-[70%] rounded-t"></div>
                            <div className="bg-blue-500 w-1/4 h-[80%] rounded-t"></div>
                            <div className="bg-blue-600 w-1/4 h-full rounded-t"></div>
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2">Agents active &gt; 6 months</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-100 p-5">
                    <p className="text-xs text-slate-500 font-bold mb-3 uppercase">Business Churn Rate</p>
                    <div className="flex items-end justify-between">
                        <h3 className="text-3xl font-bold text-emerald-600">2.5%</h3>
                        <div className="w-12 h-12 rounded-full border-4 border-emerald-100 border-t-emerald-600 flex items-center justify-center">
                            <i className="fas fa-check text-emerald-600"></i>
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2">Target &lt; 5%</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-100 p-5">
                    <p className="text-xs text-slate-500 font-bold mb-3 uppercase">Support Resolution</p>
                    <div className="flex items-end justify-between">
                        <h3 className="text-3xl font-bold text-amber-500">95%</h3>
                        <div className="w-12 h-12 rounded-full border-4 border-amber-100 border-t-amber-500 flex items-center justify-center">
                            <i className="fas fa-headset text-amber-500"></i>
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2">Tickets resolved &lt; 24h</p>
                </div>
            </div>

            {/* Bottom Row - List & Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent User Registrations */}
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-bold text-slate-800 text-sm">Recent User Registrations</h3>
                        <button className="text-xs text-[#02275A] font-bold hover:underline">View All</button>
                    </div>
                    <div className="divide-y divide-slate-50">
                        <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold">SO</div>
                                <div>
                                    <p className="text-sm font-bold text-slate-700">Sarah O.</p>
                                    <p className="text-[10px] text-slate-500 font-semibold">Role: Agent • Region: Lagos</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded">Active</span>
                            </div>
                        </div>
                        <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold">JD</div>
                                <div>
                                    <p className="text-sm font-bold text-slate-700">John D.</p>
                                    <p className="text-[10px] text-slate-500 font-semibold">Role: Manager • Region: Abuja</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <span className="px-2 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold rounded">Pending</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pending Actions */}
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-bold text-slate-800 text-sm">Pending Actions</h3>
                        <button className="text-xs text-[#02275A] font-bold hover:underline">View All</button>
                    </div>
                    <div className="divide-y divide-slate-50">
                        <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-xs font-bold"><i className="fas fa-money-bill-wave"></i></div>
                                <div>
                                    <p className="text-sm font-bold text-slate-700">Commission Approval</p>
                                    <p className="text-[10px] text-slate-500 font-semibold">Agent: Mike T. • Amount: ₦25,000</p>
                                </div>
                            </div>
                            <button className="px-3 py-1 bg-[#02275A] text-white text-[10px] font-bold rounded hover:opacity-90 shadow-sm">Review</button>
                        </div>
                        <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 text-xs font-bold"><i className="fas fa-exclamation-triangle"></i></div>
                                <div>
                                    <p className="text-sm font-bold text-slate-700">High Priority Ticket</p>
                                    <p className="text-[10px] text-slate-500 font-semibold">Business: Kano Fabrics • Issue: Login</p>
                                </div>
                            </div>
                            <button className="px-3 py-1 bg-white border border-[#02275A] text-[#02275A] text-[10px] font-bold rounded hover:bg-slate-50">Resolve</button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default AdminDashboardView;
