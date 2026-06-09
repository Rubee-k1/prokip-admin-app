import React, { useState } from 'react';
import WithdrawalModal from './WithdrawalModal';

interface ManagerTransaction {
    id: string;
    agent: string;
    amount: string;
    type: string;
    detail: string;
    status: 'Paid' | 'Pending';
    date: string;
    ref: string;
}

interface Payout {
    id: string;
    amount: string;
    date: string;
    account: string;
    status: 'Processing' | 'Completed' | 'Failed';
}

const ManagerEarningsView: React.FC = () => {
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

    // Mock Manager Earnings Data (10% Override)
    const earningsData: ManagerTransaction[] = [
        { id: 'OVR-001', agent: 'Emmanuel O.', amount: '₦4,000', type: 'Override (10%)', detail: 'Standard Plan Sale', status: 'Paid', date: 'Oct 24, 2023', ref: 'REF-8821' },
        { id: 'OVR-002', agent: 'Chioma A.', amount: '₦5,500', type: 'Override (10%)', detail: 'Premium Plan Sale', status: 'Paid', date: 'Oct 22, 2023', ref: 'REF-8819' },
        { id: 'OVR-003', agent: 'Tunde B.', amount: '₦1,500', type: 'Override (10%)', detail: 'Extra Users (3)', status: 'Pending', date: 'Oct 20, 2023', ref: 'REF-8750' },
        { id: 'OVR-004', agent: 'Emmanuel O.', amount: '₦2,500', type: 'Override (10%)', detail: 'Extra Location (2)', status: 'Paid', date: 'Oct 18, 2023', ref: 'REF-8600' },
        { id: 'OVR-005', agent: 'Sarah K.', amount: '₦8,000', type: 'Override (10%)', detail: 'Ultimate Plan Sale', status: 'Paid', date: 'Oct 15, 2023', ref: 'REF-8550' },
        { id: 'OVR-006', agent: 'Chioma A.', amount: '₦4,000', type: 'Override (10%)', detail: 'Standard Plan Renewal', status: 'Paid', date: 'Oct 10, 2023', ref: 'REF-8400' },
        { id: 'OVR-007', agent: 'Tunde B.', amount: '₦4,000', type: 'Override (10%)', detail: 'Standard Plan Sale', status: 'Paid', date: 'Oct 08, 2023', ref: 'REF-8399' },
        { id: 'OVR-008', agent: 'Emmanuel O.', amount: '₦1,500', type: 'Override (10%)', detail: 'Extra Users (1)', status: 'Paid', date: 'Oct 05, 2023', ref: 'REF-8350' },
    ];

    // Mock Payout Data (Wallet Transactions)
    const payoutData: Payout[] = [
        { id: 'WDR-001', amount: '₦120,000', date: 'Oct 25, 2023', account: 'GTBank •••• 1234', status: 'Processing' },
        { id: 'WDR-002', amount: '₦80,000', date: 'Oct 10, 2023', account: 'GTBank •••• 1234', status: 'Completed' },
        { id: 'WDR-003', amount: '₦250,000', date: 'Sep 28, 2023', account: 'Zenith Bank •••• 5678', status: 'Completed' },
        { id: 'WDR-004', amount: '₦100,000', date: 'Aug 15, 2023', account: 'GTBank •••• 1234', status: 'Completed' },
    ];

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
            {/* Balance Card - Manager Edition */}
            <div className="bg-[#02275A] rounded-3xl p-8 md:p-10 text-white shadow-2xl relative overflow-hidden mb-8">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 p-10 opacity-10 transform translate-x-10 -translate-y-5">
                    <i className="fas fa-wallet text-9xl"></i>
                </div>

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
                    
                    {/* Left Column: Stats Panel (Moved from Right) */}
                    <div>
                        <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/10 flex justify-between items-center shadow-inner">
                            <div>
                                <div className="flex items-center gap-2 mb-1.5">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></div>
                                    <span className="text-[10px] font-bold text-blue-100 uppercase tracking-wider">Total Paid</span>
                                </div>
                                <p className="text-xl md:text-2xl font-bold text-white tracking-tight">₦4,200,000</p>
                            </div>
                            
                            <div className="w-px h-10 bg-white/10 mx-2"></div>

                            <div className="text-right">
                                <div className="flex items-center justify-end gap-2 mb-1.5">
                                    <span className="text-[10px] font-bold text-blue-100 uppercase tracking-wider">Pending</span>
                                    <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]"></div>
                                </div>
                                <p className="text-xl md:text-2xl font-bold text-white tracking-tight">₦35,000</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Balance Info & Action (Moved from Left) */}
                    <div className="flex flex-col gap-5">
                        <div>
                            <p className="text-blue-200 text-xs font-bold tracking-widest uppercase mb-3">Manager Wallet Balance</p>
                            <h2 className="text-5xl md:text-6xl font-bold tracking-tight text-white mb-3">₦850,000</h2>
                            <p className="text-blue-200 text-xs font-medium">Available for immediate withdrawal</p>
                        </div>

                        {/* Action Button */}
                        <button 
                            onClick={() => setShowWithdrawModal(true)} 
                            className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-[#02275A] h-14 rounded-2xl font-bold text-sm shadow-xl hover:shadow-2xl hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-3 active:scale-95 group"
                        >
                            <span className="bg-white/20 w-6 h-6 rounded-full flex items-center justify-center text-[10px] group-hover:bg-white/30 transition-colors">
                                <i className="fas fa-arrow-down text-white"></i>
                            </span>
                            Withdraw to Bank
                        </button>
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
                        <i className="fas fa-percentage"></i>
                        <span>Commissions (10%)</span>
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
                        <i className="fas fa-wallet"></i>
                        <span>Wallet Transactions</span>
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
                                        <th className="p-4 font-bold text-slate-600">Agent</th>
                                        <th className="p-4 font-bold text-slate-600">Transaction Detail</th>
                                        <th className="p-4 font-bold text-slate-600">Commission (10%)</th>
                                        <th className="p-4 font-bold text-slate-600">Status</th>
                                        <th className="p-4 font-bold text-slate-600">Date</th>
                                        <th className="p-4 font-bold text-slate-600">Ref No</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {currentEarnings.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-4 font-bold text-slate-800">{item.agent}</td>
                                            <td className="p-4">
                                                <span className="font-bold text-slate-700 block">{item.detail}</span>
                                                <span className="text-xs text-slate-500">{item.type}</span>
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
                                    ))}
                                    {currentEarnings.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-slate-500">No earnings found.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                        <div className="md:hidden divide-y divide-slate-50">
                            {currentEarnings.map((item) => (
                                <div key={item.id} className="p-4 border-b border-slate-50 flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-slate-800">{item.agent}</p>
                                        <p className="text-xs text-slate-500">{item.detail}</p>
                                        <p className="text-[10px] text-slate-400 mt-1">{item.date} • {item.ref}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-emerald-600">+{item.amount}</p>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold inline-block mt-1 ${item.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {item.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
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
                                        <th className="p-4 font-bold text-slate-600">Amount Withdrawn</th>
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
                                    {currentPayouts.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-slate-500">No transactions found.</td></tr>}
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
                            {currentPayouts.length === 0 && <div className="p-8 text-center text-slate-500">No transactions found.</div>}
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
                availableBalance="850,000" 
            />
        </div>
    );
};

export default ManagerEarningsView;
