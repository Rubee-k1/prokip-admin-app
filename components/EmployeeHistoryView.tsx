import React from 'react';

interface EmployeeHistoryViewProps {
    setView?: (view: string) => void;
}

const EmployeeHistoryView: React.FC<EmployeeHistoryViewProps> = ({ setView }) => {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#02275A] mb-6">Point Ledger</h2>
                
                <div className="flex items-center gap-4 mb-6">
                    <button 
                        onClick={() => setView?.('dashboard')}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
                    >
                        <i className="fas fa-arrow-left text-slate-600"></i>
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-[#02275A]">Point Ledger</h2>
                        <p className="text-slate-500 text-sm">3 entries total</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Performance Points Card */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0">
                        <i className="fas fa-arrow-down text-slate-800"></i>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5 mb-1">
                            <i className="fas fa-cog"></i> Performance Points
                        </p>
                        <h3 className="text-2xl font-bold text-[#02275A]">-20</h3>
                    </div>
                </div>

                {/* Reward Points Card */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center border border-orange-100 shrink-0">
                        <i className="fas fa-arrow-up text-orange-400"></i>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5 mb-1">
                            <i className="fas fa-star text-orange-400"></i> Reward Points
                        </p>
                        <h3 className="text-2xl font-bold text-orange-400">10</h3>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 mt-8 mb-4">
                <i className="fas fa-filter text-slate-400"></i>
                <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:border-blue-500 shadow-sm appearance-none pr-8 relative">
                    <option>All Categories</option>
                    <option>Performance</option>
                    <option>Reward</option>
                </select>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="text-[#02275A] font-bold border-b border-slate-100 bg-white">
                            <tr>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Activity Type</th>
                                <th className="px-6 py-4">Points</th>
                                <th className="px-6 py-4">Notes / Links</th>
                                <th className="px-6 py-4">Added By</th>
                                <th className="px-6 py-4 text-center">Balance After</th>
                                <th className="px-6 py-4">Evidence</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700 font-medium bg-white">
                            <tr>
                                <td className="px-6 py-5 text-slate-500">May 13, 2026, 09:43 AM</td>
                                <td className="px-6 py-5">
                                    <span className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-full text-xs font-medium inline-flex items-center gap-1.5">
                                        <i className="fas fa-cog"></i> Performance
                                    </span>
                                </td>
                                <td className="px-6 py-5">
                                    <span className="px-3 py-1 bg-red-50 text-red-600 border border-red-100 rounded text-xs font-medium">
                                        Deduction
                                    </span>
                                </td>
                                <td className="px-6 py-5 text-center">
                                    <span className="px-2 py-1 bg-red-50 text-red-500 rounded text-xs font-bold">-5</span>
                                </td>
                                <td className="px-6 py-5 text-slate-600 max-w-xs">
                                    when there is no reaction to messages posted
                                </td>
                                <td className="px-6 py-5 text-slate-500">Super Admin</td>
                                <td className="px-6 py-5 text-center font-bold text-[#02275A]">90</td>
                                <td className="px-6 py-5 text-slate-300">—</td>
                            </tr>
                            
                            <tr>
                                <td className="px-6 py-5 text-slate-500">May 12, 2026, 11:10 AM</td>
                                <td className="px-6 py-5">
                                    <span className="px-3 py-1.5 bg-orange-50 border border-orange-100 text-orange-600 rounded-full text-xs font-medium inline-flex items-center gap-1.5">
                                        <i className="fas fa-star text-orange-400"></i> Reward
                                    </span>
                                </td>
                                <td className="px-6 py-5">
                                    <span className="px-3 py-1 bg-green-50 text-green-600 border border-green-100 rounded text-xs font-medium">
                                        Addition
                                    </span>
                                </td>
                                <td className="px-6 py-5 text-center">
                                    <span className="px-2 py-1 bg-green-50 text-green-500 rounded text-xs font-bold">+10</span>
                                </td>
                                <td className="px-6 py-5 text-slate-600 max-w-xs">
                                    +10 awarded after 48hrs in production with no bugs
                                </td>
                                <td className="px-6 py-5 text-slate-500">Super Admin</td>
                                <td className="px-6 py-5 text-center font-bold text-[#02275A]">95</td>
                                <td className="px-6 py-5 text-slate-300">—</td>
                            </tr>

                            <tr>
                                <td className="px-6 py-5 text-slate-500">May 12, 2026, 11:10 AM</td>
                                <td className="px-6 py-5">
                                    <span className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-full text-xs font-medium inline-flex items-center gap-1.5">
                                        <i className="fas fa-cog"></i> Performance
                                    </span>
                                </td>
                                <td className="px-6 py-5">
                                    <span className="px-3 py-1 bg-red-50 text-red-600 border border-red-100 rounded text-xs font-medium">
                                        Deduction
                                    </span>
                                </td>
                                <td className="px-6 py-5 text-center">
                                    <span className="px-2 py-1 bg-red-50 text-red-500 rounded text-xs font-bold">-15</span>
                                </td>
                                <td className="px-6 py-5 text-slate-600 max-w-xs">
                                    -15 for missing an agreed-upon deadline
                                </td>
                                <td className="px-6 py-5 text-slate-500">Super Admin</td>
                                <td className="px-6 py-5 text-center font-bold text-[#02275A]">85</td>
                                <td className="px-6 py-5 text-slate-300">—</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default EmployeeHistoryView;
