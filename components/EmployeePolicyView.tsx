import React from 'react';

const EmployeePolicyView: React.FC = () => {
    return (
        <div className="p-8 max-w-6xl mx-auto space-y-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#02275A] flex items-center gap-2 mb-1">
                    <i className="far fa-shield-check"></i> Policies & Rewards
                </h2>
                <p className="text-slate-500 text-sm">Company policies and point impact rules</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="px-6 py-5 border-b border-slate-100">
                    <h3 className="font-bold text-[#02275A]">Policy List</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="text-[#02275A] font-bold border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Policy</th>
                                <th className="px-6 py-4">Description</th>
                                <th className="px-6 py-4 text-right">Impact</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                            <tr>
                                <td className="px-6 py-4">Critical Bug Released (Reviewer)</td>
                                <td className="px-6 py-4 text-slate-500 font-normal">-15 for passing a critical bug in review</td>
                                <td className="px-6 py-4 text-right font-bold text-red-500">-15</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4">Documentation Hero</td>
                                <td className="px-6 py-4 text-slate-500 font-normal">+5 for creating technical guides for features</td>
                                <td className="px-6 py-4 text-right font-bold text-green-500">+5</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4">Early Delivery</td>
                                <td className="px-6 py-4 text-slate-500 font-normal">+5 per 24 hours ahead of schedule</td>
                                <td className="px-6 py-4 text-right font-bold text-green-500">+5</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4">Jira/Status Ghosting</td>
                                <td className="px-6 py-4 text-slate-500 font-normal">-2 per day of no status update</td>
                                <td className="px-6 py-4 text-right font-bold text-red-500">-2</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4">late coming</td>
                                <td className="px-6 py-4 text-slate-500 font-normal">tesr</td>
                                <td className="px-6 py-4 text-right font-bold text-red-500">-5</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4">Late project delivery</td>
                                <td className="px-6 py-4 text-slate-500 font-normal">Delivery of project late</td>
                                <td className="px-6 py-4 text-right font-bold text-red-500">-15</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4">Low Review SLA Missed (5hrs)</td>
                                <td className="px-6 py-4 text-slate-500 font-normal">-3 for missing low review SLA (Reviewer)</td>
                                <td className="px-6 py-4 text-right font-bold text-red-500">-3</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4">Medium Review SLA Missed (2hrs)</td>
                                <td className="px-6 py-4 text-slate-500 font-normal">-5 for missing medium review SLA (Reviewer)</td>
                                <td className="px-6 py-4 text-right font-bold text-red-500">-5</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4">Missed Deadline</td>
                                <td className="px-6 py-4 text-slate-500 font-normal">-15 for missing an agreed-upon deadline</td>
                                <td className="px-6 py-4 text-right font-bold text-red-500">-15</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4">Non- reaction to messages</td>
                                <td className="px-6 py-4 text-slate-500 font-normal">when there is no reaction to messages posted</td>
                                <td className="px-6 py-4 text-right font-bold text-red-500">-5</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="py-4 border-t border-slate-100 flex justify-center">
                    <button className="text-[13px] font-bold text-[#02275A] hover:underline">
                        Load More (5 remaining)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmployeePolicyView;
