import React, { useState } from 'react';
import { Wallet } from '../types';
import WithdrawalModal from './WithdrawalModal';

interface ManagerTransaction {
    id: string;
    agent?: string;
    business?: string;
    amount: string;
    type: string;
    detail: string;
    status: 'Paid' | 'Pending';
    date: string;
    ref: string;
    leadCategory?: string;
    commissionPercent?: number;
}

interface Payout {
    id: string;
    amount: string;
    date: string;
    account: string;
    status: 'Processing' | 'Completed' | 'Failed';
}

interface ManagerEarningsViewProps {
    wallet?: Wallet;
    onWithdrawSuccess?: (amount: number) => void;
}

const ManagerEarningsView: React.FC<ManagerEarningsViewProps> = ({ wallet, onWithdrawSuccess }) => {
    const [activeTab, setActiveTab] = useState<'earnings' | 'payouts'>('earnings');
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    
    // Filtering & Pagination State
    const [earningsFilter, setEarningsFilter] = useState('All');
    const [earningsDateFilter, setEarningsDateFilter] = useState('All Time');
    const [payoutFilter, setPayoutFilter] = useState('All');
    const [payoutDateFilter, setPayoutDateFilter] = useState('All Time');
    const [earningsPage, setEarningsPage] = useState(1);
    const [payoutPage, setPayoutPage] = useState(1);
    const itemsPerPage = 5;

    // Mock Manager Earnings Data (Company / Sales Leads)
    const defaultEarningsData: ManagerTransaction[] = [
        { id: 'TXN-001', agent: 'Emmanuel O.', business: 'Okafor Hardware', amount: '₦40,000', type: 'New Sale', detail: 'Standard Plan Sale', status: 'Paid', date: 'Oct 24, 2023', ref: 'REF-8821', leadCategory: 'Sales Lead', commissionPercent: 20 },
        { id: 'TXN-002', agent: 'Chioma A.', business: 'TechPoint Logistics', amount: '₦45,000', type: 'New Sale', detail: 'Premium Plan Sale', status: 'Paid', date: 'Oct 22, 2023', ref: 'REF-8819', leadCategory: 'Company', commissionPercent: 5 },
        { id: 'TXN-005', agent: 'Sarah K.', business: 'Lagos Logistics', amount: '₦30,000', type: 'New Sale', detail: 'Premium Plan Sale', status: 'Paid', date: 'Oct 15, 2023', ref: 'REF-8550', leadCategory: 'Sales Lead', commissionPercent: 20 },
        { id: 'TXN-007', agent: 'Tunde B.', business: 'Emeka Phones', amount: '₦40,000', type: 'New Sale', detail: 'Standard Plan Sale', status: 'Paid', date: 'Oct 08, 2023', ref: 'REF-8399', leadCategory: 'Company', commissionPercent: 5 },
    ];

    // Mock Payout Data (Wallet Transactions)
    const defaultPayoutData: Payout[] = [
        { id: 'WDR-001', amount: '₦120,000', date: 'Oct 25, 2023', account: 'GTBank •••• 1234', status: 'Processing' },
        { id: 'WDR-002', amount: '₦80,000', date: 'Oct 10, 2023', account: 'GTBank •••• 1234', status: 'Completed' },
        { id: 'WDR-003', amount: '₦250,000', date: 'Sep 28, 2023', account: 'Zenith Bank •••• 5678', status: 'Completed' },
        { id: 'WDR-004', amount: '₦100,000', date: 'Aug 15, 2023', account: 'GTBank •••• 1234', status: 'Completed' },
    ];

    const earningsData = wallet ? (wallet.transactions as any[]) : defaultEarningsData;
    const payoutData = wallet ? wallet.payouts : defaultPayoutData;

    // Monthly Commission Calculator State
    const getMonthYearStr = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
                return date.toLocaleString('default', { month: 'long', year: 'numeric' });
            }
        } catch (e) {}
        
        const parts = dateStr.split(/[,\s]+/);
        if (parts.length >= 3) {
            const m = parts[0];
            const y = parts[2];
            let fullMonth = m;
            const monthMap: Record<string, string> = {
                'Jan': 'January', 'Feb': 'February', 'Mar': 'March', 'Apr': 'April',
                'May': 'May', 'Jun': 'June', 'Jul': 'July', 'Aug': 'August',
                'Sep': 'September', 'Oct': 'October', 'Nov': 'November', 'Dec': 'December'
            };
            if (monthMap[m]) fullMonth = monthMap[m];
            return `${fullMonth} ${y}`;
        }
        return 'October 2023';
    };

    const parseAmount = (amtStr: string): number => {
        if (!amtStr) return 0;
        const clean = amtStr.replace(/[^\d.]/g, '');
        const parsed = parseFloat(clean);
        return isNaN(parsed) ? 0 : parsed;
    };

    const availableMonths = React.useMemo(() => {
        const months = new Set<string>();
        earningsData.forEach(item => {
            months.add(getMonthYearStr(item.date));
        });
        
        if (months.size === 0) {
            months.add(new Date().toLocaleString('default', { month: 'long', year: 'numeric' }));
        }
        months.add("October 2023");
        return Array.from(months);
    }, [earningsData]);

    const [selectedCommissionMonth, setSelectedCommissionMonth] = useState<string>(() => {
        const monthsList = Array.from(new Set(earningsData.map(item => getMonthYearStr(item.date))));
        if (monthsList.includes("October 2023")) return "October 2023";
        if (monthsList.length > 0) return monthsList[0];
        return new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    });

    const { monthlyTotalCommission, monthlySalesCount } = React.useMemo(() => {
        let total = 0;
        let count = 0;
        earningsData.forEach(item => {
            if (getMonthYearStr(item.date) === selectedCommissionMonth) {
                total += parseAmount(item.amount);
                count++;
            }
        });
        return { monthlyTotalCommission: total, monthlySalesCount: count };
    }, [earningsData, selectedCommissionMonth]);

    const availableBalanceStr = wallet ? wallet.balance.toLocaleString() : "850,000";
    const totalEarnedStr = wallet ? wallet.totalEarned.toLocaleString() : "4,200,000";
    const pendingStr = wallet ? wallet.pending.toLocaleString() : "35,000";

    const getLeadTypeAndPercent = (item: any) => {
        let category = item.leadCategory || '';
        const detailLower = (item.detail || '').toLowerCase();
        const typeLower = (item.type || '').toLowerCase();

        if (!category) {
            if (detailLower.includes('sales') || typeLower.includes('sales')) {
                category = 'Sales Lead';
            } else {
                category = 'Company';
            }
        }

        let percent = 5;
        let leadType = 'Company Lead';

        if (category === 'Sales Lead' || category.toLowerCase().includes('sales')) {
            percent = 20;
            leadType = 'Sales Lead';
        }

        return {
            leadType,
            commissionPercent: percent + '%',
            isRenewal: false
        };
    };

    // Logic for Earnings
    const filteredEarnings = earningsData.filter(item => {
        const matchesType = earningsFilter === 'All' || item.type === earningsFilter; // Simplified filter for now
        let matchesDate = true;

        if (earningsDateFilter !== 'All Time') {
            const itemDate = new Date(item.date);
            const today = new Date();

            if (earningsDateFilter === 'This Month') {
                matchesDate = itemDate.getMonth() === today.getMonth() && itemDate.getFullYear() === today.getFullYear();
            } else if (earningsDateFilter === 'Last Month') {
                const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                matchesDate = itemDate.getMonth() === lastMonth.getMonth() && itemDate.getFullYear() === lastMonth.getFullYear();
            } else if (earningsDateFilter === 'This Year') {
                 matchesDate = itemDate.getFullYear() === today.getFullYear();
            }
        }
        return matchesType && matchesDate;
    });

    const earningsTotalPages = Math.ceil(filteredEarnings.length / itemsPerPage);
    const currentEarnings = filteredEarnings.slice((earningsPage - 1) * itemsPerPage, earningsPage * itemsPerPage);

    // Logic for Payouts
    const filteredPayouts = payoutData.filter(item => {
        const matchesStatus = payoutFilter === 'All' || item.status === payoutFilter;
        let matchesDate = true;
        
        if (payoutDateFilter !== 'All Time') {
            const itemDate = new Date(item.date);
            const today = new Date();
            
            if (payoutDateFilter === 'This Month') {
                matchesDate = itemDate.getMonth() === today.getMonth() && itemDate.getFullYear() === today.getFullYear();
            } else if (payoutDateFilter === 'Last Month') {
                const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                matchesDate = itemDate.getMonth() === lastMonth.getMonth() && itemDate.getFullYear() === lastMonth.getFullYear();
            } else if (payoutDateFilter === 'This Year') {
                 matchesDate = itemDate.getFullYear() === today.getFullYear();
            }
        }
        
        return matchesStatus && matchesDate;
    });

    const payoutsTotalPages = Math.ceil(filteredPayouts.length / itemsPerPage);
    const currentPayouts = filteredPayouts.slice((payoutPage - 1) * itemsPerPage, payoutPage * itemsPerPage);

    return (
        <div className="w-full mx-auto px-4 md:px-8 py-6 animate-fade-in">
            {/* Balance Card - Redesigned to match Telesales Wallet Card style */}
            <div className="bg-[#34495E] rounded-3xl p-8 md:p-10 text-white shadow-2xl relative overflow-hidden mb-8">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 p-10 opacity-5 transform translate-x-10 -translate-y-5">
                    <i className="fas fa-wallet text-9xl"></i>
                </div>

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
                    
                    {/* Left Column: Balance Info */}
                    <div>
                        <p className="text-slate-400 text-xs font-bold tracking-widest uppercase mb-3">Withdrawable Balance</p>
                        <h2 className="text-5xl md:text-6xl font-bold tracking-tight text-white mb-3">₦{availableBalanceStr}</h2>
                        <p className="text-slate-400 text-xs font-medium">Available for immediate payout</p>
                    </div>

                    {/* Right Column: Stats & Action */}
                    <div className="flex flex-col gap-5">
                        
                        {/* Stats Panel */}
                        <div className="bg-black/20 rounded-2xl p-6 backdrop-blur-sm border border-white/5 flex justify-between items-center shadow-inner">
                            <div>
                                <div className="flex items-center gap-2 mb-1.5">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></div>
                                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Paid</span>
                                </div>
                                <p className="text-xl md:text-2xl font-bold text-white tracking-tight">₦{totalEarnedStr}</p>
                            </div>
                            
                            <div className="w-px h-10 bg-white/10 mx-2"></div>

                            <div className="text-right">
                                <div className="flex items-center justify-end gap-2 mb-1.5">
                                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Pending</span>
                                    <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]"></div>
                                </div>
                                <p className="text-xl md:text-2xl font-bold text-white tracking-tight">₦{pendingStr}</p>
                            </div>
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={() => setShowWithdrawModal(true)}
                            className="bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white py-4 px-6 rounded-2xl font-bold text-sm shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                        >
                            <i className="fas fa-arrow-up-from-bracket"></i>
                            Request Payout (Withdrawal)
                        </button>
                    </div>
                </div>
            </div>

            {/* Month-wise Commission Selector & Display Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="font-bold text-[#02275A] text-sm uppercase tracking-wide mb-1">Monthly Commission Calculator</h3>
                        <p className="text-xs text-slate-500">Select a month to view the total commission earned.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative group min-w-[180px]">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#02275A]">
                                <i className="far fa-calendar-alt"></i>
                            </div>
                            <select 
                                className="w-full appearance-none pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-[#02275A] outline-none focus:bg-white focus:border-[#02275A] transition-all cursor-pointer"
                                value={selectedCommissionMonth}
                                onChange={(e) => setSelectedCommissionMonth(e.target.value)}
                            >
                                {availableMonths.map(month => (
                                    <option key={month} value={month}>{month}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#02275A]">
                                <i className="fas fa-chevron-down text-xs"></i>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="mt-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-100/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100/50 shrink-0">
                            <i className="fas fa-coins text-xl animate-pulse"></i>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-0.5">Total Commission ({selectedCommissionMonth})</p>
                            <h4 className="text-2xl font-extrabold text-[#02275A]">₦{monthlyTotalCommission.toLocaleString()}</h4>
                        </div>
                    </div>
                    
                    <div className="text-xs text-emerald-800 font-medium bg-white/60 px-3 py-1.5 rounded-lg border border-emerald-100/30 w-fit">
                        <i className="fas fa-check-circle text-emerald-500 mr-1.5"></i> {monthlySalesCount} {monthlySalesCount === 1 ? 'sale' : 'sales'} recorded
                    </div>
                </div>
            </div>

            {/* Control Bar: Tabs & Filters */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                
                {/* Tabs */}
                <div className="flex gap-2 self-start md:self-auto overflow-x-auto no-scrollbar pb-1 max-w-full">
                    <button 
                        onClick={() => setActiveTab('earnings')} 
                        className={`whitespace-nowrap px-5 py-3 text-sm font-bold rounded-xl transition-all flex items-center gap-2 border ${
                            activeTab === 'earnings' 
                            ? 'bg-[#02275A] text-white border-[#02275A] shadow-md' 
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        <i className="fas fa-list-ul"></i>
                        <span>Earnings History</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ml-1 ${
                            activeTab === 'earnings' 
                            ? 'bg-white/20 text-white' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                            {earningsData.length}
                        </span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('payouts')} 
                        className={`whitespace-nowrap px-5 py-3 text-sm font-bold rounded-xl transition-all flex items-center gap-2 border ${
                            activeTab === 'payouts' 
                            ? 'bg-[#02275A] text-white border-[#02275A] shadow-md' 
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        <i className="fas fa-history"></i>
                        <span>Payouts</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ml-1 ${
                            activeTab === 'payouts' 
                            ? 'bg-white/20 text-white' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                            {payoutData.length}
                        </span>
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 w-full md:w-auto justify-end">
                    {/* Date Filter */}
                    <div className="relative group min-w-[160px]">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#02275A]">
                            <i className="far fa-calendar-alt"></i>
                        </div>
                        <select 
                            className="w-full appearance-none pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-[#02275A] outline-none focus:border-[#02275A] focus:ring-4 focus:ring-[#02275A]/5 shadow-sm cursor-pointer hover:border-[#02275A] transition-all"
                            value={activeTab === 'earnings' ? earningsDateFilter : payoutDateFilter}
                            onChange={(e) => {
                                if (activeTab === 'earnings') { setEarningsDateFilter(e.target.value); setEarningsPage(1); }
                                else { setPayoutDateFilter(e.target.value); setPayoutPage(1); }
                            }}
                        >
                            <option>All Time</option>
                            <option>This Month</option>
                            <option>Last Month</option>
                            <option>This Year</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#02275A] group-hover:text-[#02275A] transition-colors">
                            <i className="fas fa-chevron-down text-xs"></i>
                        </div>
                    </div>

                    {/* Specific Filter (Type or Status) */}
                    <div className="relative group min-w-[160px]">
                         <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#02275A]">
                            <i className="fas fa-filter"></i>
                        </div>
                        {activeTab === 'earnings' ? (
                            <select 
                                className="w-full appearance-none pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-[#02275A] outline-none focus:border-[#02275A] focus:ring-4 focus:ring-[#02275A]/5 shadow-sm cursor-pointer hover:border-[#02275A] transition-all"
                                value={earningsFilter}
                                onChange={(e) => { setEarningsFilter(e.target.value); setEarningsPage(1); }}
                            >
                                <option value="All">All Types</option>
                                <option value="New Sale">New Sale</option>
                                <option value="Renewal">Renewal</option>
                                <option value="Upgrade">Upgrade</option>
                                <option value="Add-on">Add-on</option>
                                <option value="Module">Module</option>
                            </select>
                        ) : (
                            <select 
                                className="w-full appearance-none pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-[#02275A] outline-none focus:border-[#02275A] focus:ring-4 focus:ring-[#02275A]/5 shadow-sm cursor-pointer hover:border-[#02275A] transition-all"
                                value={payoutFilter}
                                onChange={(e) => { setPayoutFilter(e.target.value); setPayoutPage(1); }}
                            >
                                <option value="All">All Status</option>
                                <option value="Completed">Completed</option>
                                <option value="Processing">Processing</option>
                            </select>
                        )}
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#02275A] group-hover:text-[#02275A] transition-colors">
                            <i className="fas fa-chevron-down text-xs"></i>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Content */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                {activeTab === 'earnings' && (
                    <>
                        <div className="overflow-x-auto hidden md:block">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="p-4 font-bold text-slate-600">Business / Agent</th>
                                        <th className="p-4 font-bold text-slate-600">Lead Type</th>
                                        <th className="p-4 font-bold text-slate-600">Commission Percent</th>
                                        <th className="p-4 font-bold text-slate-600">Detail / Type</th>
                                        <th className="p-4 font-bold text-slate-600">Amount</th>
                                        <th className="p-4 font-bold text-slate-600">Status</th>
                                        <th className="p-4 font-bold text-slate-600">Date</th>
                                        <th className="p-4 font-bold text-slate-600">Ref No</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {currentEarnings.map((item) => {
                                        const { leadType, commissionPercent, isRenewal } = getLeadTypeAndPercent(item);
                                        return (
                                            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="p-4 font-bold text-slate-800">{item.business || item.agent || 'N/A'}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                        isRenewal ? 'bg-amber-100 text-amber-800' :
                                                        leadType.includes('Company') ? 'bg-blue-100 text-blue-800' :
                                                        leadType.includes('Sales') ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                                                    }`}>
                                                        {leadType}
                                                    </span>
                                                </td>
                                                <td className="p-4 font-semibold text-slate-700">
                                                    {isRenewal ? (
                                                        <span className="text-slate-400">0% (Renewal)</span>
                                                    ) : (
                                                        <span>{commissionPercent}</span>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    <span className="font-bold text-slate-700 block">{item.type}</span>
                                                    <span className="text-xs text-slate-500">{item.detail}</span>
                                                </td>
                                                <td className="p-4 font-bold text-emerald-600">+{item.amount}</td>
                                                <td className="p-4">
                                                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${item.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-slate-600">{item.date}</td>
                                                <td className="p-4 text-slate-400 text-xs">{item.ref}</td>
                                            </tr>
                                        );
                                    })}
                                    {currentEarnings.length === 0 && <tr><td colSpan={8} className="p-8 text-center text-slate-500">No earnings found.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                        <div className="md:hidden divide-y divide-slate-50">
                            {currentEarnings.map((item) => {
                                const { leadType, commissionPercent, isRenewal } = getLeadTypeAndPercent(item);
                                return (
                                    <div key={item.id} className="p-4 border-b border-slate-50 flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-slate-800">{item.business || item.agent || 'N/A'}</p>
                                            <p className="text-xs text-slate-500">{item.type} • {item.detail}</p>
                                            <div className="flex gap-2 mt-1">
                                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                                    isRenewal ? 'bg-amber-100 text-amber-800' :
                                                    leadType.includes('Company') ? 'bg-blue-100 text-blue-800' :
                                                    leadType.includes('Sales') ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                                                }`}>
                                                    {leadType}
                                                </span>
                                                <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                                                    {isRenewal ? '0% Commission' : `${commissionPercent} Commission`}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-slate-400 mt-1.5">{item.date} • {item.ref}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-emerald-600">+{item.amount}</p>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold inline-block mt-1 ${item.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {item.status}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            {currentEarnings.length === 0 && <div className="p-8 text-center text-slate-500">No earnings found.</div>}
                        </div>
                        {/* Pagination for Earnings */}
                        {filteredEarnings.length > 0 && (
                            <div className="p-4 flex justify-between items-center text-xs text-slate-500 border-t border-slate-50">
                                <span>Page {earningsPage} of {earningsTotalPages}</span>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setEarningsPage(p => Math.max(1, p - 1))} 
                                        disabled={earningsPage === 1}
                                        className="px-3 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50"
                                    >Prev</button>
                                    <button 
                                        onClick={() => setEarningsPage(p => Math.min(earningsTotalPages, p + 1))} 
                                        disabled={earningsPage === earningsTotalPages}
                                        className="px-3 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50"
                                    >Next</button>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'payouts' && (
                    <>
                        <div className="overflow-x-auto hidden md:block">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="p-4 font-bold text-slate-600">Transaction ID</th>
                                        <th className="p-4 font-bold text-slate-600">Amount Requested</th>
                                        <th className="p-4 font-bold text-slate-600">Bank Account</th>
                                        <th className="p-4 font-bold text-slate-600">Date</th>
                                        <th className="p-4 font-bold text-slate-600">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {currentPayouts.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-4 text-slate-500 text-xs font-mono">{item.id}</td>
                                            <td className="p-4 font-bold text-slate-800">{item.amount}</td>
                                            <td className="p-4 text-slate-600">
                                                <div className="flex items-center gap-2">
                                                    <i className="fas fa-building text-slate-400"></i> {item.account}
                                                </div>
                                            </td>
                                            <td className="p-4 text-slate-600">{item.date}</td>
                                            <td className="p-4">
                                                <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${
                                                    item.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 
                                                    item.status === 'Processing' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'
                                                }`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {currentPayouts.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-slate-500">No payouts found.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                        <div className="md:hidden divide-y divide-slate-50">
                            {currentPayouts.map((item) => (
                                <div key={item.id} className="p-4 border-b border-slate-50 flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-slate-800">{item.amount}</p>
                                        <p className="text-xs text-slate-500">{item.account}</p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">{item.date} • <span className="font-mono">{item.id}</span></p>
                                    </div>
                                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${
                                        item.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 
                                        item.status === 'Processing' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'
                                    }`}>
                                        {item.status}
                                    </span>
                                </div>
                            ))}
                            {currentPayouts.length === 0 && <div className="p-8 text-center text-slate-500">No payouts found.</div>}
                        </div>
                        {/* Pagination for Payouts */}
                        {filteredPayouts.length > 0 && (
                            <div className="p-4 flex justify-between items-center text-xs text-slate-500 border-t border-slate-50">
                                <span>Page {payoutPage} of {payoutsTotalPages}</span>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setPayoutPage(p => Math.max(1, p - 1))} 
                                        disabled={payoutPage === 1}
                                        className="px-3 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50"
                                    >Prev</button>
                                    <button 
                                        onClick={() => setPayoutPage(p => Math.min(payoutsTotalPages, p + 1))} 
                                        disabled={payoutPage === payoutsTotalPages}
                                        className="px-3 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50"
                                    >Next</button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
            
            <WithdrawalModal 
                isOpen={showWithdrawModal} 
                onClose={() => setShowWithdrawModal(false)} 
                availableBalance={availableBalanceStr} 
                onWithdrawSuccess={onWithdrawSuccess}
            />
        </div>
    );
};

export default ManagerEarningsView;
