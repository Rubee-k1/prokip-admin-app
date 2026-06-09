
import React, { useState } from 'react';
import { Trial } from '../types';

interface TrialsViewProps {
    setView: (view: string) => void;
    onConvertTrial: (trial: Trial) => void;
}

const TrialsView: React.FC<TrialsViewProps> = ({ setView, onConvertTrial }) => {
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Mock Data inheriting business structure but adding trial specifics
    const trialsData: Trial[] = [
        { id: '9921', name: 'Sokoto Rice Mill', owner: 'Mr. John Doe', phone: '08012345678', daysLeft: 2, plan: 'Free Trial', usage: 'High', transactions: 145, lastSeen: 'Today', status: 'Expiring Soon' },
        { id: '9923', name: 'Tantalizers Festac', owner: 'Mr. Biggs', phone: '07098765432', daysLeft: 5, plan: 'Free Trial', usage: 'Medium', transactions: 42, lastSeen: 'Yesterday', status: 'Active' },
        { id: '9926', name: 'K-Mart Stores', owner: 'Mrs. K', phone: '09011223344', daysLeft: 12, plan: 'Free Trial', usage: 'None', transactions: 0, lastSeen: '5 days ago', status: 'Inactive' },
        { id: '9929', name: 'Mama Put', owner: 'Iya Basira', phone: '08122334455', daysLeft: 1, plan: 'Free Trial', usage: 'Very High', transactions: 320, lastSeen: '1 hour ago', status: 'Expiring Soon' },
        { id: '9931', name: 'Tech Haven', owner: 'Chinedu', phone: '08055667788', daysLeft: 28, plan: 'Free Trial', usage: 'Low', transactions: 5, lastSeen: '2 days ago', status: 'Active' },
        { id: '9932', name: 'City Bakery', owner: 'Mrs. Adebayo', phone: '07011223344', daysLeft: 15, plan: 'Free Trial', usage: 'Medium', transactions: 55, lastSeen: '3 days ago', status: 'Active' },
        { id: '9933', name: 'Olu Mechanics', owner: 'Olu', phone: '08199887766', daysLeft: 1, plan: 'Free Trial', usage: 'None', transactions: 0, lastSeen: '2 weeks ago', status: 'Inactive' },
    ];

    const getFilteredData = () => {
        let data = trialsData;

        // 1. Status Filter
        if (filter === 'expiring') data = data.filter(t => t.daysLeft <= 3);
        if (filter === 'inactive') data = data.filter(t => t.transactions === 0);

        // 2. Search Filter
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            data = data.filter(t => 
                t.name.toLowerCase().includes(lowerTerm) ||
                t.owner.toLowerCase().includes(lowerTerm) ||
                t.phone.includes(lowerTerm)
            );
        }
        return data;
    };

    const allFilteredData = getFilteredData();
    
    // 3. Pagination Logic
    const totalPages = Math.ceil(allFilteredData.length / itemsPerPage);
    const paginatedData = allFilteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Stats
    const expiringCount = trialsData.filter(t => t.daysLeft <= 3).length;
    const inactiveCount = trialsData.filter(t => t.transactions === 0).length;
    const conversionRate = "18%"; // Mock

    const handleFilterChange = (newFilter: string) => {
        setFilter(newFilter);
        setCurrentPage(1); // Reset to page 1 on filter change
    };

    return (
        <div className="w-full mx-auto px-4 md:px-8 py-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between md:items-end mb-6 gap-4">
                <div>
                    <h2 className="text-lg font-bold text-slate-800">Free Trial Conversion Center</h2>
                    <p className="text-xs text-slate-500">Monitor and convert trial businesses to paid plans.</p>
                </div>
                <button onClick={() => setView('businesses')} className="text-[#02275A] text-xs font-bold hover:underline self-end md:self-auto">View All Businesses</button>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-xs text-slate-500 font-bold uppercase mb-1">Total Trials</p>
                    <h3 className="text-2xl font-bold text-slate-800">{trialsData.length}</h3>
                </div>
                <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 shadow-sm cursor-pointer hover:bg-rose-100 transition-colors" onClick={() => handleFilterChange('expiring')}>
                    <p className="text-xs text-rose-600 font-bold uppercase mb-1">Expiring Soon</p>
                    <h3 className="text-2xl font-bold text-rose-700">{expiringCount}</h3>
                    <p className="text-[10px] text-rose-500">Less than 3 days</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 shadow-sm cursor-pointer hover:bg-amber-100 transition-colors" onClick={() => handleFilterChange('inactive')}>
                    <p className="text-xs text-amber-600 font-bold uppercase mb-1">Inactive / Risk</p>
                    <h3 className="text-2xl font-bold text-amber-700">{inactiveCount}</h3>
                    <p className="text-[10px] text-amber-500">Zero transactions</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 shadow-sm">
                    <p className="text-xs text-emerald-600 font-bold uppercase mb-1">Conversion Rate</p>
                    <h3 className="text-2xl font-bold text-emerald-700">{conversionRate}</h3>
                    <p className="text-[10px] text-emerald-500">This month</p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="w-full relative mb-4">
                <span className="absolute left-3 top-2.5 text-slate-400"><i className="fas fa-search"></i></span>
                <input 
                    type="text" 
                    placeholder="Search trials by business name, owner, or phone..." 
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#02275A] shadow-sm"
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
            </div>

            {/* Tabs - Expanded Grid on Mobile */}
            <div className="grid grid-cols-1 md:flex gap-2 mb-6">
                <button onClick={() => handleFilterChange('all')} className={`w-full md:w-auto px-4 py-3 md:py-2 text-sm md:text-xs font-bold rounded-lg transition-colors flex justify-between md:justify-center items-center ${filter === 'all' ? 'bg-[#02275A] text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
                    <span>All Trials</span>
                    <span className="bg-white/20 px-2 rounded-full text-[10px] ml-2">{trialsData.length}</span>
                </button>
                <button onClick={() => handleFilterChange('expiring')} className={`w-full md:w-auto px-4 py-3 md:py-2 text-sm md:text-xs font-bold rounded-lg transition-colors flex justify-between md:justify-center items-center ${filter === 'expiring' ? 'bg-rose-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
                    <span>Expiring Soon</span>
                    <span className="bg-white/20 px-2 rounded-full text-[10px] ml-2">{expiringCount}</span>
                </button>
                <button onClick={() => handleFilterChange('inactive')} className={`w-full md:w-auto px-4 py-3 md:py-2 text-sm md:text-xs font-bold rounded-lg transition-colors flex justify-between md:justify-center items-center ${filter === 'inactive' ? 'bg-amber-500 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
                    <span>Inactive / No Txn</span>
                    <span className="bg-white/20 px-2 rounded-full text-[10px] ml-2">{inactiveCount}</span>
                </button>
            </div>

            {/* Desktop List */}
            <div className="hidden md:block bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden mb-4">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-xs text-slate-500 uppercase tracking-wider">
                            <th className="p-4 font-bold">Business</th>
                            <th className="p-4 font-bold">Trial Status</th>
                            <th className="p-4 font-bold">Usage Stats</th>
                            <th className="p-4 font-bold">Last Active</th>
                            <th className="p-4 font-bold text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {paginatedData.map((trial) => (
                            <tr key={trial.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4">
                                    <p className="font-bold text-slate-800">{trial.name}</p>
                                    <p className="text-xs text-slate-500">{trial.owner} • {trial.phone}</p>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${trial.daysLeft <= 3 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                                        <span className={`text-xs font-bold ${trial.daysLeft <= 3 ? 'text-rose-600' : 'text-slate-700'}`}>
                                            {trial.daysLeft} Days Left
                                        </span>
                                    </div>
                                    <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-2">
                                        <div 
                                            className={`h-full rounded-full ${trial.daysLeft <= 3 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                                            style={{width: `${Math.max(0, 100 - (trial.daysLeft * 3.3))}%`}} // Rough calc for progress
                                        ></div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <p className="text-slate-800 font-bold">{trial.transactions} Txns</p>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                                        trial.usage === 'High' || trial.usage === 'Very High' ? 'bg-emerald-100 text-emerald-700' :
                                        trial.usage === 'Medium' ? 'bg-blue-100 text-blue-700' :
                                        'bg-rose-100 text-rose-700'
                                    }`}>
                                        {trial.usage} Usage
                                    </span>
                                </td>
                                <td className="p-4 text-slate-600 text-xs">{trial.lastSeen}</td>
                                <td className="p-4 text-right">
                                    {trial.transactions === 0 ? (
                                        <button className="px-4 py-2 bg-white border border-[#02275A] text-[#02275A] text-xs font-bold rounded-lg hover:bg-[#02275A]/5 transition-colors mr-2">
                                            <i className="fas fa-phone mr-1"></i> Follow Up
                                        </button>
                                    ) : (
                                        <button onClick={() => onConvertTrial(trial)} className="px-4 py-2 bg-[#02275A] text-white text-xs font-bold rounded-lg shadow-md hover:opacity-90 transition-colors animate-pulse">
                                            Convert Now
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {paginatedData.length === 0 && <div className="p-8 text-center text-slate-500">No trials found matching this filter.</div>}
            </div>

            {/* Mobile List */}
            <div className="md:hidden space-y-4 mb-4">
                {paginatedData.map((trial) => (
                    <div key={trial.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="font-bold text-slate-800">{trial.name}</h3>
                                <p className="text-xs text-slate-500">{trial.owner}</p>
                            </div>
                            <div className={`px-2 py-1 rounded-lg text-xs font-bold ${trial.daysLeft <= 3 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                {trial.daysLeft} Days Left
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                            <div className="bg-slate-50 p-2 rounded">
                                <p className="text-slate-400">Transactions</p>
                                <p className="font-bold text-slate-800">{trial.transactions}</p>
                            </div>
                            <div className="bg-slate-50 p-2 rounded">
                                <p className="text-slate-400">Last Active</p>
                                <p className="font-bold text-slate-800">{trial.lastSeen}</p>
                            </div>
                        </div>

                        {trial.transactions === 0 ? (
                            <button className="w-full py-3 bg-white border border-[#02275A] text-[#02275A] font-bold rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-[#02275A]/5">
                                <i className="fas fa-phone-alt"></i> Follow Up (Inactive)
                            </button>
                        ) : (
                            <button onClick={() => onConvertTrial(trial)} className="w-full py-3 bg-[#02275A] text-white font-bold rounded-xl text-sm shadow-md flex items-center justify-center gap-2 hover:opacity-90">
                                <i className="fas fa-rocket"></i> Convert to Paid
                            </button>
                        )}
                    </div>
                ))}
                {paginatedData.length === 0 && <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-100">No trials found.</div>}
            </div>

            {/* Pagination Controls */}
            {allFilteredData.length > 0 && (
                <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
                    <span>Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, allFilteredData.length)} of {allFilteredData.length} trials</span>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Prev
                        </button>
                        <span className="px-3 py-1 bg-[#02275A]/10 rounded border border-[#02275A]/20 font-bold text-[#02275A]">Page {currentPage}</span>
                        <button 
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrialsView;
