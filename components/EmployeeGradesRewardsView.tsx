import React, { useState } from 'react';
import AddGradeModal from './AddGradeModal';

interface EmployeeGradesRewardsViewProps {
    hideRewards?: boolean;
}

const EmployeeGradesRewardsView: React.FC<EmployeeGradesRewardsViewProps> = ({ hideRewards = false }) => {
    const [isAddGradeModalOpen, setIsAddGradeModalOpen] = useState(false);

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-[#02275A] mb-1">Grade System</h2>
                    <p className="text-slate-500 text-sm">Define grades, point thresholds, and rewards.</p>
                </div>
                <button 
                    onClick={() => setIsAddGradeModalOpen(true)}
                    className="bg-[#02275A] hover:bg-[#02275A]/90 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center gap-2"
                >
                    <i className="fas fa-plus"></i> Add Grade
                </button>
            </div>

            {/* Active Quarter Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 shadow-sm">
                        <i className="far fa-calendar-alt text-lg"></i>
                    </div>
                    <div>
                        <h3 className="font-bold text-[#02275A]">Q2 2026</h3>
                        <p className="text-sm text-slate-500">Apr 1, 2026 → Jul 1, 2026</p>
                    </div>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold flex items-center gap-1.5 rounded-full">
                    Active
                </span>
            </div>

            {/* Global Grade Definitions */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="px-6 py-5 border-b border-slate-100">
                    <h3 className="font-bold text-[#02275A]">Global Grade Definitions</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="text-slate-500 border-b border-slate-100 font-medium">
                            <tr>
                                <th className="px-6 py-4">Grade</th>
                                <th className="px-6 py-4">Min Points</th>
                                <th className="px-6 py-4">Max Points</th>
                                <th className="px-6 py-4">Consequence</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                            <tr>
                                <td className="px-6 py-4">
                                    <span className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold inline-flex">A</span>
                                </td>
                                <td className="px-6 py-4">90</td>
                                <td className="px-6 py-4">100</td>
                                <td className="px-6 py-4 text-slate-400">—</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4">
                                    <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold inline-flex">B</span>
                                </td>
                                <td className="px-6 py-4">75</td>
                                <td className="px-6 py-4">89</td>
                                <td className="px-6 py-4 text-slate-400">—</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4">
                                    <span className="w-6 h-6 rounded-full bg-yellow-400 text-white flex items-center justify-center text-xs font-bold inline-flex">C</span>
                                </td>
                                <td className="px-6 py-4">60</td>
                                <td className="px-6 py-4">74</td>
                                <td className="px-6 py-4 text-slate-500 font-normal">Mandatory Estimation Training & peer review</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4">
                                    <span className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold inline-flex">F</span>
                                </td>
                                <td className="px-6 py-4">0</td>
                                <td className="px-6 py-4">59</td>
                                <td className="px-6 py-4 text-slate-500 font-normal">Loss of remote work + Daily EOD micromanagement</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Rewards */}
            {!hideRewards && (
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-2">
                        <h3 className="font-bold text-[#02275A] flex items-center gap-2">
                            <i className="fas fa-gift text-orange-400"></i> Rewards
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="text-slate-500 border-b border-slate-100 font-medium">
                                <tr>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Point Range</th>
                                    <th className="px-6 py-4">Reward</th>
                                    <th className="px-6 py-4">Department</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                                <tr>
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        <span className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">A</span>
                                        High Performer
                                    </td>
                                    <td className="px-6 py-4">90 – 100</td>
                                    <td className="px-6 py-4 text-slate-400 italic font-normal">Not defined</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-[11px] font-bold">Global</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">B</span>
                                        Reliable
                                    </td>
                                    <td className="px-6 py-4">75 – 89</td>
                                    <td className="px-6 py-4 text-slate-400 italic font-normal">Not defined</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-[11px] font-bold">Global</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        <span className="w-6 h-6 rounded-full bg-yellow-400 text-white flex items-center justify-center text-xs font-bold">C</span>
                                        Warning
                                    </td>
                                    <td className="px-6 py-4">60 – 74</td>
                                    <td className="px-6 py-4 text-slate-400 italic font-normal">Not defined</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-[11px] font-bold">Global</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        <span className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold">F</span>
                                        Probation
                                    </td>
                                    <td className="px-6 py-4">0 – 59</td>
                                    <td className="px-6 py-4 text-slate-400 italic font-normal">Not defined</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-[11px] font-bold">Global</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Policy List / Data (shown on employee dashboard instead of Rewards) */}
            {hideRewards && (
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="px-6 py-5 border-b border-slate-100">
                        <h3 className="font-bold text-[#02275A] flex items-center gap-2">
                            <i className="far fa-shield-check"></i> Policy List
                        </h3>
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
            )}

            {/* Quarter History */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-2">
                    <h3 className="font-bold text-[#02275A]">Quarter History</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="text-slate-500 border-b border-slate-100 font-medium">
                            <tr>
                                <th className="px-6 py-4">Quarter</th>
                                <th className="px-6 py-4">Start</th>
                                <th className="px-6 py-4">End</th>
                                <th className="px-6 py-4">Scope</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                            <tr>
                                <td className="px-6 py-4">Q2 2026</td>
                                <td className="px-6 py-4 text-slate-500 font-normal">4/1/2026</td>
                                <td className="px-6 py-4 text-slate-500 font-normal">7/1/2026</td>
                                <td className="px-6 py-4 text-slate-500 font-normal">Global</td>
                                <td className="px-6 py-4">
                                    <span className="px-2.5 py-1 bg-green-100 text-green-700 text-[11px] font-bold rounded-full">Active</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <AddGradeModal 
                isOpen={isAddGradeModalOpen} 
                onClose={() => setIsAddGradeModalOpen(false)} 
                onSuccess={(data) => {
                    console.log('Grade saved:', data);
                    setIsAddGradeModalOpen(false);
                }} 
            />
        </div>
    );
};

export default EmployeeGradesRewardsView;
