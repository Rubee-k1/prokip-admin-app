import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Wallet } from '../types';

interface CXHeadDashboardViewProps {
    setView?: (view: string) => void;
    userRole?: string;
    wallet?: Wallet;
}

const cxTrendData = [
  { name: 'Mon', tickets: 40, satisfaction: 80 },
  { name: 'Tue', tickets: 30, satisfaction: 85 },
  { name: 'Wed', tickets: 45, satisfaction: 90 },
  { name: 'Thu', tickets: 50, satisfaction: 88 },
  { name: 'Fri', tickets: 35, satisfaction: 92 },
  { name: 'Sat', tickets: 20, satisfaction: 95 },
  { name: 'Sun', tickets: 15, satisfaction: 95 },
];

const CXHeadDashboardView: React.FC<CXHeadDashboardViewProps> = ({ setView, userRole, wallet }) => {
    let deptName = 'Customer Experience';
    let titleName = 'CX Head';
    
    if (userRole === 'customer-success') {
        deptName = 'Customer Success';
        titleName = 'Customer success';
    } else if (userRole === 'sales-manager') {
        deptName = 'Sales';
        titleName = 'Sales Manager';
    } else if (userRole === 'marketing-manager') {
        deptName = 'Marketing';
        titleName = 'Marketing Manager';
    } else if (userRole === 'support-staff') {
        deptName = 'Support';
        titleName = 'Support Lead';
    } else if (userRole === 'finance') {
        deptName = 'Finance';
        titleName = 'Finance Lead';
    } else if (userRole === 'content-lead') {
        deptName = 'Content';
        titleName = 'Content Lead';
    } else if (userRole === 'call-agent') {
        deptName = 'Call Center';
        titleName = 'Call Agent';
    }

    const renderMetrics = () => {
        if (userRole === 'content-lead') {
            return (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 text-[#02275A]">
                            <i className="fas fa-file-alt text-5xl"></i>
                        </div>
                        <p className="text-xs font-bold text-slate-500 mb-1 tracking-wide">Total Articles</p>
                        <h4 className="text-2xl font-bold text-[#02275A]">342</h4>
                        <p className="text-xs text-green-500 font-medium mt-2 flex items-center gap-1">
                            <i className="fas fa-arrow-up"></i> 12 this month
                        </p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 text-[#02275A]">
                            <i className="fas fa-eye text-5xl"></i>
                        </div>
                        <p className="text-xs font-bold text-slate-500 mb-1 tracking-wide">Article Views</p>
                        <h4 className="text-2xl font-bold text-[#02275A]">45.2k</h4>
                        <p className="text-xs text-green-500 font-medium mt-2 flex items-center gap-1">
                            <i className="fas fa-arrow-up"></i> 18% this month
                        </p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 text-[#02275A]">
                            <i className="fas fa-clock text-5xl"></i>
                        </div>
                        <p className="text-xs font-bold text-slate-500 mb-1 tracking-wide">Avg Read Time</p>
                        <h4 className="text-2xl font-bold text-[#02275A]">2m 14s</h4>
                        <p className="text-xs text-slate-500 font-medium mt-2 flex items-center gap-1">
                            Stable
                        </p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 text-[#02275A]">
                            <i className="fas fa-share-alt text-5xl"></i>
                        </div>
                        <p className="text-xs font-bold text-slate-500 mb-1 tracking-wide">Shares</p>
                        <h4 className="text-2xl font-bold text-[#02275A]">1,204</h4>
                        <p className="text-xs text-green-500 font-medium mt-2 flex items-center gap-1">
                            <i className="fas fa-arrow-up"></i> 5% this week
                        </p>
                    </div>
                </div>
            );
        } else if (userRole === 'finance') {
            return (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 text-[#02275A]">
                            <i className="fas fa-wallet text-5xl"></i>
                        </div>
                        <p className="text-xs font-bold text-slate-500 mb-1 tracking-wide">Total Revenue</p>
                        <h4 className="text-2xl font-bold text-[#02275A]">$842k</h4>
                        <p className="text-xs text-green-500 font-medium mt-2 flex items-center gap-1">
                            <i className="fas fa-arrow-up"></i> 12% this month
                        </p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 text-[#02275A]">
                            <i className="fas fa-file-invoice-dollar text-5xl"></i>
                        </div>
                        <p className="text-xs font-bold text-slate-500 mb-1 tracking-wide">Pending Payroll</p>
                        <h4 className="text-2xl font-bold text-[#02275A]">$124k</h4>
                        <p className="text-xs text-slate-500 font-medium mt-2 flex items-center gap-1">
                            <i className="fas fa-clock"></i> Due in 3 days
                        </p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 text-[#02275A]">
                            <i className="fas fa-money-bill-wave text-5xl"></i>
                        </div>
                        <p className="text-xs font-bold text-slate-500 mb-1 tracking-wide">Commissions</p>
                        <h4 className="text-2xl font-bold text-[#02275A]">$45k</h4>
                        <p className="text-xs text-green-500 font-medium mt-2 flex items-center gap-1">
                            <i className="fas fa-arrow-up"></i> 5% this month
                        </p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 text-[#02275A]">
                            <i className="fas fa-building text-5xl"></i>
                        </div>
                        <p className="text-xs font-bold text-slate-500 mb-1 tracking-wide">Invoices Sent</p>
                        <h4 className="text-2xl font-bold text-[#02275A]">142</h4>
                        <p className="text-xs text-amber-500 font-medium mt-2 flex items-center gap-1">
                            <i className="fas fa-exclamation-triangle"></i> 12 overdue
                        </p>
                    </div>
                </div>
            );
        } else if (userRole === 'sales-manager') {
            return (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 text-[#02275A]">
                            <i className="fas fa-chart-line text-5xl"></i>
                        </div>
                        <p className="text-xs font-bold text-slate-500 mb-1 tracking-wide">Total Sales Volume</p>
                        <h4 className="text-2xl font-bold text-[#02275A]">$124,500</h4>
                        <p className="text-xs text-green-500 font-medium mt-2 flex items-center gap-1">
                            <i className="fas fa-arrow-up"></i> 15% this month
                        </p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 text-[#02275A]">
                            <i className="fas fa-users text-5xl"></i>
                        </div>
                        <p className="text-xs font-bold text-slate-500 mb-1 tracking-wide">Leads Converted</p>
                        <h4 className="text-2xl font-bold text-[#02275A]">342</h4>
                        <p className="text-xs text-green-500 font-medium mt-2 flex items-center gap-1">
                            <i className="fas fa-arrow-up"></i> 5% this month
                        </p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 text-[#02275A]">
                            <i className="fas fa-percentage text-5xl"></i>
                        </div>
                        <p className="text-xs font-bold text-slate-500 mb-1 tracking-wide">Conversion Rate</p>
                        <h4 className="text-2xl font-bold text-amber-500">18.5%</h4>
                        <p className="text-xs text-amber-600 font-medium mt-2 flex items-center gap-1">
                            <i className="fas fa-exclamation-triangle"></i> Short of target
                        </p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 text-[#02275A]">
                            <i className="fas fa-handshake text-5xl"></i>
                        </div>
                        <p className="text-xs font-bold text-slate-500 mb-1 tracking-wide">Deals Won</p>
                        <h4 className="text-2xl font-bold text-[#02275A]">85</h4>
                        <p className="text-xs text-green-500 font-medium mt-2 flex items-center gap-1">
                            <i className="fas fa-arrow-up"></i> +12 this week
                        </p>
                    </div>
                </div>
            );
        } else if (userRole === 'marketing-manager') {
            return (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 text-[#02275A]">
                            <i className="fas fa-bullhorn text-5xl"></i>
                        </div>
                        <p className="text-xs font-bold text-slate-500 mb-1 tracking-wide">Campaign Reach</p>
                        <h4 className="text-2xl font-bold text-[#02275A]">45.2k</h4>
                        <p className="text-xs text-green-500 font-medium mt-2 flex items-center gap-1">
                            <i className="fas fa-arrow-up"></i> 22% this month
                        </p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 text-[#02275A]">
                            <i className="fas fa-mouse-pointer text-5xl"></i>
                        </div>
                        <p className="text-xs font-bold text-slate-500 mb-1 tracking-wide">Total Clicks</p>
                        <h4 className="text-2xl font-bold text-[#02275A]">12.8k</h4>
                        <p className="text-xs text-green-500 font-medium mt-2 flex items-center gap-1">
                            <i className="fas fa-arrow-up"></i> 8% this month
                        </p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 text-[#02275A]">
                            <i className="fas fa-magnet text-5xl"></i>
                        </div>
                        <p className="text-xs font-bold text-slate-500 mb-1 tracking-wide">Leads Generated</p>
                        <h4 className="text-2xl font-bold text-[#02275A]">850</h4>
                        <p className="text-xs text-green-500 font-medium mt-2 flex items-center gap-1">
                            <i className="fas fa-arrow-up"></i> 14% this month
                        </p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 text-[#02275A]">
                            <i className="fas fa-dollar-sign text-5xl"></i>
                        </div>
                        <p className="text-xs font-bold text-slate-500 mb-1 tracking-wide">Cost per Lead</p>
                        <h4 className="text-2xl font-bold text-[#02275A]">$12.40</h4>
                        <p className="text-xs text-green-500 font-medium mt-2 flex items-center gap-1">
                            <i className="fas fa-arrow-down"></i> $1.20 cheaper
                        </p>
                    </div>
                </div>
            );
        } else if (userRole === 'support-staff') {
            return (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 text-[#02275A]">
                            <i className="fas fa-ticket-alt text-5xl"></i>
                        </div>
                        <p className="text-xs font-bold text-slate-500 mb-1 tracking-wide">Open Tickets</p>
                        <h4 className="text-2xl font-bold text-[#02275A]">45</h4>
                        <p className="text-xs text-green-500 font-medium mt-2 flex items-center gap-1">
                            <i className="fas fa-arrow-down"></i> 12 less than yesterday
                        </p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 text-[#02275A]">
                            <i className="fas fa-clock text-5xl"></i>
                        </div>
                        <p className="text-xs font-bold text-slate-500 mb-1 tracking-wide">Avg Resolution Time</p>
                        <h4 className="text-2xl font-bold text-[#02275A]">4.2 <span className="text-base text-slate-400 font-normal">hrs</span></h4>
                        <p className="text-xs text-green-500 font-medium mt-2 flex items-center gap-1">
                            <i className="fas fa-arrow-down"></i> 0.5 hrs faster
                        </p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 text-[#02275A]">
                            <i className="fas fa-exclamation-circle text-5xl"></i>
                        </div>
                        <p className="text-xs font-bold text-slate-500 mb-1 tracking-wide">SLA Breaches</p>
                        <h4 className="text-2xl font-bold text-green-500">0</h4>
                        <p className="text-xs text-green-500 font-medium mt-2 flex items-center gap-1">
                            <i className="fas fa-check"></i> Perfect this week
                        </p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 text-[#02275A]">
                            <i className="fas fa-star text-5xl"></i>
                        </div>
                        <p className="text-xs font-bold text-slate-500 mb-1 tracking-wide">Ticket CSAT Score</p>
                        <h4 className="text-2xl font-bold text-[#02275A]">4.8/5</h4>
                        <p className="text-xs text-green-500 font-medium mt-2 flex items-center gap-1">
                            <i className="fas fa-arrow-up"></i> Top 10%
                        </p>
                    </div>
                </div>
            );
        }
        
        // Default to CX / CS
        return (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 text-[#02275A]">
                        <i className={userRole === 'customer-success' ? "fas fa-rocket text-5xl" : "fas fa-smile text-5xl"}></i>
                    </div>
                    <p className="text-xs font-bold text-slate-500 mb-1 tracking-wide">{userRole === 'customer-success' ? 'Successful Onboardings' : 'Net Promoter Score (NPS)'}</p>
                    <h4 className="text-2xl font-bold text-[#02275A]">{userRole === 'customer-success' ? '1,245' : '72'}</h4>
                    <p className="text-xs text-green-500 font-medium mt-2 flex items-center gap-1">
                        <i className="fas fa-arrow-up"></i> {userRole === 'customer-success' ? '12%' : '4 pts'} this month
                    </p>
                </div>
                
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 text-[#02275A]">
                        <i className="fas fa-check-circle text-5xl"></i>
                    </div>
                    <p className="text-xs font-bold text-slate-500 mb-1 tracking-wide">CSAT Score</p>
                    <h4 className="text-2xl font-bold text-[#02275A]">94%</h4>
                    <p className="text-xs text-green-500 font-medium mt-2 flex items-center gap-1">
                        <i className="fas fa-arrow-up"></i> 2% this month
                    </p>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 text-[#02275A]">
                        <i className="fas fa-ticket-alt text-5xl"></i>
                    </div>
                    <p className="text-xs font-bold text-slate-500 mb-1 tracking-wide">Open Tickets</p>
                    <h4 className="text-2xl font-bold text-amber-500">128</h4>
                    <p className="text-xs text-amber-600 font-medium mt-2 flex items-center gap-1">
                        <i className="fas fa-exclamation-triangle"></i> Needs attention
                    </p>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 text-[#02275A]">
                        <i className="fas fa-clock text-5xl"></i>
                    </div>
                    <p className="text-xs font-bold text-slate-500 mb-1 tracking-wide">Avg Resolution Time</p>
                    <h4 className="text-2xl font-bold text-[#02275A]">1.2 <span className="text-base text-slate-400 font-normal">hrs</span></h4>
                    <p className="text-xs text-green-500 font-medium mt-2 flex items-center gap-1">
                        <i className="fas fa-arrow-down"></i> 0.3 hrs faster
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6 overflow-y-auto custom-scrollbar h-full">
            <div className="mb-8">
                <h2 className="text-xl font-bold text-[#02275A] mb-1">Welcome back, {titleName}!</h2>
                <p className="text-sm text-slate-500">
                    {deptName} Department Overview{!['cx-head', 'sales-manager', 'marketing-manager', 'content-lead', 'engineering', 'engineer'].includes(userRole || '') && ' & Personal Performance'}
                </p>
            </div>

            {/* Personal Performance & Wallet Section */}
            <div>
                <h3 className="font-bold text-[#02275A] text-sm mb-4">My Performance & Wallet</h3>
                
                {(userRole === 'sales-manager' || userRole === 'call-agent') ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Performance Cards */}
                        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col items-center justify-center shadow-sm h-32">
                                <div className="w-10 h-10 bg-slate-200 text-slate-700 rounded-full flex items-center justify-center font-bold text-lg mb-2 shadow-sm border border-slate-300">
                                    A
                                </div>
                                <h3 className="font-bold text-[#02275A] text-sm">A Grade</h3>
                                <p className="text-[11px] text-slate-500">#3 in Department</p>
                            </div>
                            
                            <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col shadow-sm h-32">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Performance Points</p>
                                <h3 className="text-3xl font-bold text-green-600 mb-1">92</h3>
                                <p className="text-[11px] text-slate-500 mt-auto">Current performance score</p>
                            </div>

                            <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col shadow-sm h-32">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                    <i className="far fa-star text-orange-400"></i> Reward Points
                                </p>
                                <h3 className="text-3xl font-bold text-orange-400 mb-1">15</h3>
                                <p className="text-[11px] text-slate-500 mt-auto">Available to redeem</p>
                            </div>

                            <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col shadow-sm h-32">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">My Leaderboard</p>
                                <div className="flex items-center gap-3 mt-1">
                                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-sm border border-amber-200">
                                        3rd
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-700">Top 10%</p>
                                        <button onClick={() => setView?.('team-lead-my-history')} className="text-[11px] text-[#02275A] hover:underline mt-0.5 inline-block">View History &rarr;</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Wallet Balance Card for Sales Manager and Telesales (Call Agent) */}
                        <div className="lg:col-span-1">
                            <div className="bg-[#02275A] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden h-full flex flex-col justify-between min-h-[16rem]">
                                {/* Background decoration */}
                                <div className="absolute top-0 right-0 p-6 opacity-10 transform translate-x-4 -translate-y-2">
                                    <i className="fas fa-wallet text-6xl text-white"></i>
                                </div>
                                
                                <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                                    <div>
                                        <p className="text-blue-200 text-xs font-bold tracking-widest uppercase mb-1">My Wallet Balance</p>
                                        <h3 className="text-3xl font-extrabold tracking-tight text-white mb-2">
                                            ₦{wallet ? wallet.balance.toLocaleString() : (userRole === 'sales-manager' ? '850,000' : '450,000')}
                                        </h3>
                                        <div className="flex flex-col gap-2 text-xs text-blue-200 mt-3">
                                            <span className="flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                                Total Paid: <strong className="text-white">₦{wallet ? wallet.totalEarned.toLocaleString() : (userRole === 'sales-manager' ? '4,200,000' : '2,000,000')}</strong>
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                                                Pending: <strong className="text-white">₦{wallet ? wallet.pending.toLocaleString() : (userRole === 'sales-manager' ? '35,000' : '150,000')}</strong>
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <button 
                                            onClick={() => setView?.(userRole === 'sales-manager' ? 'manager-earnings' : 'earnings')} 
                                            className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-[#02275A] py-2.5 px-4 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                                        >
                                            <i className="fas fa-coins"></i>
                                            Withdraw Fund
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col items-center justify-center shadow-sm h-32">
                        <div className="w-10 h-10 bg-slate-200 text-slate-700 rounded-full flex items-center justify-center font-bold text-lg mb-2 shadow-sm border border-slate-300">
                            A
                        </div>
                        <h3 className="font-bold text-[#02275A] text-sm">A Grade</h3>
                        <p className="text-[11px] text-slate-500">#3 in Department</p>
                    </div>
                    
                    <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col shadow-sm h-32">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Performance Points</p>
                        <h3 className="text-3xl font-bold text-green-600 mb-1">92</h3>
                        <p className="text-[11px] text-slate-500 mt-auto">Current performance score</p>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col shadow-sm h-32">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <i className="far fa-star text-orange-400"></i> Reward Points
                        </p>
                        <h3 className="text-3xl font-bold text-orange-400 mb-1">15</h3>
                        <p className="text-[11px] text-slate-500 mt-auto">Available to redeem</p>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col shadow-sm h-32">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">My Leaderboard</p>
                        <div className="flex items-center gap-3 mt-1">
                            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-sm border border-amber-200">
                                3rd
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-700">Top 10%</p>
                                <button onClick={() => setView?.('team-lead-my-history')} className="text-[11px] text-[#02275A] hover:underline mt-0.5 inline-block">View History &rarr;</button>
                            </div>
                        </div>
                    </div>
                </div>
                )}

                {/* Performance Deduction Tracker */}
                {['call-agent', 'support-staff', 'customer-success', 'team-lead', 'cx-head', 'sales-manager', 'marketing-manager', 'finance', 'content-lead', 'engineering', 'engineer'].includes(userRole || '') ? (
                    <div className="bg-white rounded-xl border border-slate-200 p-4 mt-4 shadow-sm animate-fade-in">
                        {/* Header Row */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
                            <h4 className="font-bold text-slate-800 text-sm tracking-tight">Performance Tracker</h4>
                            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#EEFDF4] border border-[#BFF6D4] text-[#14532D] rounded-full text-[10px] font-bold">
                                <i className="far fa-bell text-[#16A34A]"></i>
                                <span>Grade A — you're in good standing</span>
                            </div>
                        </div>

                        {/* Score Labels Row */}
                        <div className="flex justify-between items-end text-[11px] font-bold text-slate-600 mb-1.5">
                            <span>Your score: <strong className="text-[#02275A] font-extrabold">100 pts</strong></span>
                            <span className="text-slate-400 font-medium">Grade drops below: <strong className="text-slate-700 font-bold">70 pts</strong></span>
                        </div>

                        {/* Multi-colored Progress Bar with drop threshold indicator line */}
                        <div className="h-1.5 w-full bg-[#E8EAED] rounded-full mb-4 relative overflow-visible">
                            <div className="h-full bg-[#10B981] rounded-full" style={{ width: '100%' }}></div>
                            {/* Orange threshold indicator tick mark at 70% from left */}
                            <div className="absolute left-[70%] top-0 bottom-0 w-[2.5px] bg-[#F59E0B] z-10" title="Drop threshold"></div>
                        </div>

                        {/* Under the Bar Alerts */}
                        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 mb-4">
                            {/* No points deducted checkmark */}
                            <div className="flex items-start gap-2.5">
                                <div className="text-[#0F9D58] text-base mt-0.5 select-none shrink-0">
                                    <i className="far fa-check-circle"></i>
                                </div>
                                <div>
                                    <h5 className="font-bold text-slate-800 text-xs">No points deducted</h5>
                                    <p className="text-[11px] text-slate-500 mt-0.5">You haven't broken any policy rules yet</p>
                                </div>
                            </div>

                            {/* Buffer alert card on the right */}
                            <div className="bg-[#FEF6E9] border border-[#FDE3B2] rounded-lg px-4 py-2 flex items-start gap-2 max-w-sm">
                                <div className="text-[#D97706] text-xs shrink-0 mt-0.5">
                                    <i className="fas fa-exclamation-triangle"></i>
                                </div>
                                <div>
                                    <p className="text-[10px] text-[#78350F] leading-tight font-semibold">Lose 30+ pts and your grade drops to B+</p>
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
                ) : (
                    <div className="bg-white rounded-xl border border-slate-200 p-6 mt-6 shadow-sm">
                        <div className="flex justify-between items-center mb-5">
                            <h4 className="font-bold text-[#02275A] text-[15px]">Performance Deduction Tracker</h4>
                            <div className="flex items-center gap-4 text-sm">
                                <span className="text-slate-500">Reading: <strong className="text-[#02275A]">90 pts</strong></span>
                                <span className="px-3 py-1.5 bg-red-50 border border-red-100 text-red-600 rounded-md text-sm font-medium">Degrades at: 75 pts</span>
                            </div>
                        </div>
                        
                        <div className="h-3 w-full bg-slate-100 rounded-full mb-4 overflow-hidden relative">
                            <div className="h-full bg-red-500 rounded-l-full absolute top-0 right-0 transition-all" style={{ width: '50%' }}></div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-[13px]">
                            <div className="text-slate-500 flex items-center gap-1.5">
                                <i className="fas fa-exclamation-triangle text-amber-500"></i>
                                <span className="font-bold text-slate-700">15 points</span> deducted from Next Grade
                            </div>
                            <div className="text-slate-500 flex items-center gap-1.5">
                                <span className="font-bold text-red-500">15 points</span> remaining until degrading to <strong className="text-[#02275A]">B Grade</strong>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Department Overview */}
            <div className="mt-8">
                <h3 className="font-bold text-[#02275A] text-sm mb-4">{deptName} Metrics</h3>
                {renderMetrics()}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm lg:col-span-2">
                    <h3 className="font-bold text-[#02275A] text-sm mb-6">{userRole === 'finance' ? 'Revenue Trend' : userRole === 'sales-manager' ? 'Sales Trend' : userRole === 'marketing-manager' ? 'Campaign Traffic' : userRole === 'content-lead' ? 'Content Views Traffic' : 'Volume Trend'}</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={cxTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="tickets" 
                                    stroke="#0ea5e9" 
                                    fillOpacity={1} 
                                    fill="url(#colorTickets)" 
                                    name="Volume Logged"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="font-bold text-[#02275A] text-sm mb-4">
                        {userRole === 'marketing-manager' ? 'Top Campaigns' : userRole === 'finance' ? 'Recent Transactions' : userRole === 'content-lead' ? 'Top Articles' : 'Recent Feedback'}
                    </h3>
                    {userRole === 'marketing-manager' ? (
                        <div className="space-y-4">
                            {[
                                { name: 'Summer Sale Promo', status: 'Active', reach: '12.5k', conversion: '3.2%' },
                                { name: 'Email Newsletter (Q3)', status: 'Active', reach: '8.4k', conversion: '4.5%' },
                                { name: 'Retargeting Ads', status: 'Paused', reach: '5.2k', conversion: '1.8%' },
                                { name: 'New Feature Launch', status: 'Active', reach: '15.1k', conversion: '5.1%' }
                            ].map((campaign, idx) => (
                                <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="font-bold text-slate-700 text-xs">{campaign.name}</div>
                                        <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                            campaign.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'
                                        }`}>
                                            {campaign.status}
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                        <p className="text-[11px] text-slate-600">Reach: <span className="font-bold">{campaign.reach}</span></p>
                                        <p className="text-[11px] text-slate-600">Conv: <span className="font-bold text-[#02275A]">{campaign.conversion}</span></p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : userRole === 'finance' ? (
                        <div className="space-y-4">
                            {[
                                { name: 'Server Hosting', amount: '-$1,200', type: 'Expense', time: '10m ago' },
                                { name: 'Payment Received', amount: '+$5,400', type: 'Income', time: '1h ago' },
                                { name: 'Software License', amount: '-$350', type: 'Expense', time: '3h ago' },
                                { name: 'Consulting Fee', amount: '+$2,100', type: 'Income', time: '5h ago' }
                            ].map((tx, idx) => (
                                <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="font-bold text-slate-700 text-xs">{tx.name}</div>
                                        <div className={`font-bold text-[12px] ${tx.type === 'Income' ? 'text-green-600' : 'text-slate-600'}`}>
                                            {tx.amount}
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-2">{tx.time}</p>
                                </div>
                            ))}
                        </div>
                    ) : userRole === 'content-lead' ? (
                        <div className="space-y-4">
                            {[
                                { name: 'Q3 Financial Report Summary', status: 'Published', views: '12.5k', shares: '3.2k' },
                                { name: 'How to Manage Sales Leads', status: 'Published', views: '8.4k', shares: '1.5k' },
                                { name: '10 Tips for Customer Success', status: 'Draft', views: '-', shares: '-' },
                                { name: 'Welcome to the New CRM', status: 'Published', views: '15.1k', shares: '5.1k' }
                            ].map((article, idx) => (
                                <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="font-bold text-slate-700 text-xs">{article.name}</div>
                                        <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                            article.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'
                                        }`}>
                                            {article.status}
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                        <p className="text-[11px] text-slate-600">Views: <span className="font-bold">{article.views}</span></p>
                                        <p className="text-[11px] text-slate-600">Shares: <span className="font-bold text-[#02275A]">{article.shares}</span></p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {[
                                { name: 'Sarah J.', score: 5, comment: 'Great experience overall, fast and efficient!', time: '10m ago' },
                                { name: 'David M.', score: 4, comment: 'Good service, but could be slightly faster.', time: '1h ago' },
                                { name: 'Amanda T.', score: 5, comment: 'Perfect execution, very polite.', time: '3h ago' },
                                { name: 'James W.', score: 2, comment: 'Still waiting on my pending action.', time: '5h ago' }
                            ].map((feedback, idx) => (
                                <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="font-bold text-slate-700 text-xs">{feedback.name}</div>
                                        <div className="flex text-amber-400 text-[10px]">
                                            {[...Array(5)].map((_, i) => (
                                                <i key={i} className={`fas fa-star ${i < feedback.score ? '' : 'text-slate-200'}`}></i>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-slate-600 mb-1">{feedback.comment}</p>
                                    <p className="text-[10px] text-slate-400">{feedback.time}</p>
                                </div>
                            ))}
                        </div>
                    )}
                    {userRole === 'customer-success' && (
                        <button 
                            onClick={() => setView?.('team-lead-success')}
                            className="w-full text-center mt-4 text-[#02275A] text-xs font-bold hover:underline"
                        >
                            View All Customer Success Data &rarr;
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CXHeadDashboardView;
