import React, { useState } from 'react';
import { Business, HistoryItem } from '../types';

interface SubscriptionHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    business: Business | null;
}

const SubscriptionHistoryModal: React.FC<SubscriptionHistoryModalProps> = ({ isOpen, onClose, business }) => {
    if (!isOpen || !business) return null;

    const [filter, setFilter] = useState('All');

    // Mock History Data
    const historyData: HistoryItem[] = [
        { id: 'SUB-001', date: '15 Jan 2023', type: 'New Subscription', plan: 'Premium Plan', amount: '₦80,000', status: 'Active', invoiceId: 'INV-2023-001', renewalDate: '15 Jan 2024' },
        { id: 'SUB-002', date: '10 Jun 2022', type: 'Upgrade', plan: 'Standard to Premium', amount: '₦35,000', status: 'Completed', invoiceId: 'INV-2022-050', renewalDate: '15 Jan 2023' },
        { id: 'SUB-003', date: '15 Jan 2022', type: 'Renewal', plan: 'Standard Plan', amount: '₦45,000', status: 'Expired', invoiceId: 'INV-2022-001', renewalDate: '15 Jan 2023' },
        { id: 'SUB-004', date: '15 Dec 2021', type: 'Add-on', plan: 'Extra Location (x2)', amount: '₦20,000', status: 'Completed', invoiceId: 'INV-2021-099', renewalDate: 'N/A' },
    ];

    const filteredData = filter === 'All' ? historyData : historyData.filter(item => item.status === filter);

    // Calculated Mock Stats
    const totalSpent = "₦180,000";
    const nextBillDate = business.expiryDate || "15 Jan 2024";
    const nextBillAmount = "₦80,000";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto shadow-2xl relative flex flex-col">
                {/* Header */}
                <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-100 p-6 flex justify-between items-center z-20">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">Subscription Management</h3>
                        <p className="text-xs text-slate-500">Managing subscription for <span className="font-bold text-indigo-600">{business.name}</span></p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-500 flex items-center justify-center transition-colors">
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="p-6 md:p-8 space-y-8">
                    {/* Top Section: Overview Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Current Plan Status Card */}
                        <div className="lg:col-span-2 bg-gradient-to-br from-[#011530] to-slate-900 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg flex flex-col justify-between min-h-[220px]">
                            <div className="relative z-10 flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-indigo-100">
                                            Current Plan
                                        </div>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30`}>Active</span>
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-bold mb-1">{business.plan} Plan</h2>
                                    <p className="text-indigo-200 text-sm">Next Renewal: {nextBillDate}</p>
                                </div>
                                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-2xl backdrop-blur-sm border border-white/10">
                                    <i className="fas fa-crown text-amber-400"></i>
                                </div>
                            </div>

                            <div className="relative z-10 mt-8">
                                <div className="flex justify-between items-end text-sm mb-2">
                                    <span className="text-indigo-200">Usage Limit (Locations)</span>
                                    <span className="font-bold">{business.limits?.locations || '1/1'}</span>
                                </div>
                                <div className="w-full bg-black/30 h-2 rounded-full overflow-hidden">
                                    <div className="bg-gradient-to-r from-indigo-400 to-[#011530] h-full w-1/3"></div>
                                </div>
                                <div className="mt-6 flex gap-3">
                                    <button className="bg-white text-[#011530] px-5 py-2.5 rounded-lg text-sm font-bold shadow hover:bg-indigo-50 transition-colors">
                                        Upgrade Plan
                                    </button>
                                    <button className="bg-indigo-800/50 border border-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-indigo-800 transition-colors">
                                        Cancel Subscription
                                    </button>
                                </div>
                            </div>

                            {/* Background decoration */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                        </div>

                        {/* Summary Stats */}
                        <div className="flex flex-col gap-4">
                            <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm flex-1 flex flex-col justify-center">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                        <i className="fas fa-coins"></i>
                                    </div>
                                    <span className="text-xs font-bold text-slate-500 uppercase">Lifetime Value</span>
                                </div>
                                <p className="text-2xl font-bold text-slate-800 ml-1">{totalSpent}</p>
                                <p className="text-xs text-slate-400 ml-1 mt-1">Total revenue from client</p>
                            </div>
                            
                            <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm flex-1 flex flex-col justify-center">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                        <i className="fas fa-file-invoice-dollar"></i>
                                    </div>
                                    <span className="text-xs font-bold text-slate-500 uppercase">Next Invoice</span>
                                </div>
                                <p className="text-2xl font-bold text-slate-800 ml-1">{nextBillAmount}</p>
                                <p className="text-xs text-slate-400 ml-1 mt-1">Due on {nextBillDate}</p>
                            </div>
                        </div>
                    </div>

                    {/* Transaction History Section */}
                    <div>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-slate-100 pb-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">Billing History</h3>
                                <p className="text-xs text-slate-500">View and download past invoices</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-slate-500">Filter Status:</span>
                                <select 
                                    className="p-2 border border-slate-200 rounded-lg text-sm text-slate-600 outline-none focus:border-indigo-500 bg-slate-50"
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                >
                                    <option value="All">All Transactions</option>
                                    <option value="Active">Active</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Expired">Expired</option>
                                </select>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                            {/* Desktop Table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 border-b border-slate-100">
                                        <tr>
                                            <th className="p-4 pl-6 font-bold text-slate-600">Plan / Item</th>
                                            <th className="p-4 font-bold text-slate-600">Date</th>
                                            <th className="p-4 font-bold text-slate-600">Amount</th>
                                            <th className="p-4 font-bold text-slate-600">Status</th>
                                            <th className="p-4 font-bold text-slate-600">Invoice</th>
                                            <th className="p-4 pr-6 font-bold text-right text-slate-600">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filteredData.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                                                <td className="p-4 pl-6">
                                                    <div className="font-bold text-slate-800">{item.plan}</div>
                                                    <div className="text-xs text-slate-500 flex items-center gap-1">
                                                        <span className={`w-1.5 h-1.5 rounded-full ${item.type.includes('New') ? 'bg-emerald-500' : item.type.includes('Upgrade') ? 'bg-[#011530]' : 'bg-blue-500'}`}></span>
                                                        {item.type}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-slate-600">{item.date}</td>
                                                <td className="p-4 font-bold text-slate-800">{item.amount}</td>
                                                <td className="p-4">
                                                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${
                                                        item.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 
                                                        item.status === 'Expired' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                                                    }`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2 text-slate-500 text-xs font-mono bg-slate-50 px-2 py-1 rounded w-fit">
                                                        <i className="fas fa-hashtag text-slate-300"></i> {item.invoiceId}
                                                    </div>
                                                </td>
                                                <td className="p-4 pr-6 text-right">
                                                    <button className="text-slate-400 hover:text-indigo-600 p-2 rounded-full hover:bg-indigo-50 transition-colors" title="Download Invoice">
                                                        <i className="fas fa-download"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredData.length === 0 && (
                                            <tr><td colSpan={6} className="p-8 text-center text-slate-500">No subscription history found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile List View */}
                            <div className="md:hidden divide-y divide-slate-50">
                                {filteredData.map((item) => (
                                    <div key={item.id} className="p-4 flex flex-col gap-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-bold text-slate-800 text-sm">{item.plan}</h4>
                                                <p className="text-xs text-slate-500">{item.type} • {item.date}</p>
                                            </div>
                                            <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${
                                                item.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 
                                                item.status === 'Expired' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                                {item.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs bg-slate-50 p-3 rounded-lg">
                                            <div>
                                                <span className="block text-slate-400 text-[10px] uppercase">Amount</span>
                                                <span className="font-bold text-slate-800">{item.amount}</span>
                                            </div>
                                            <div>
                                                <span className="block text-slate-400 text-[10px] uppercase">Invoice</span>
                                                <span className="font-mono text-slate-600">{item.invoiceId}</span>
                                            </div>
                                            <button className="w-8 h-8 rounded-full bg-white border border-slate-200 text-indigo-600 flex items-center justify-center shadow-sm">
                                                <i className="fas fa-download"></i>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {filteredData.length === 0 && (
                                    <div className="p-8 text-center text-slate-500">No transactions found.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionHistoryModal;