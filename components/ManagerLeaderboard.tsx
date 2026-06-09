
import React from 'react';

const ManagerLeaderboard: React.FC = () => {
    const managers = [
        { rank: 1, name: 'Chukwudi O.', state: 'Lagos', sales: '₦45.2M', agents: 42, score: 98, isMe: true },
        { rank: 2, name: 'Fatima B.', state: 'Abuja (FCT)', sales: '₦38.5M', agents: 35, score: 95, isMe: false },
        { rank: 3, name: 'Emeka N.', state: 'Rivers', sales: '₦35.1M', agents: 30, score: 92, isMe: false },
        { rank: 4, name: 'Yusuf A.', state: 'Kano', sales: '₦30.8M', agents: 28, score: 88, isMe: false },
        { rank: 5, name: 'Adeola S.', state: 'Oyo', sales: '₦28.4M', agents: 25, score: 85, isMe: false },
    ];

    return (
        <div className="w-full mx-auto px-4 md:px-8 py-6 animate-fade-in">
            <div className="text-center mb-10">
                <h2 className="text-2xl font-bold text-slate-800">State Manager Leaderboard</h2>
                <p className="text-slate-500 text-sm">Ranking based on total state revenue and agent performance.</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#02275A] text-white">
                            <tr>
                                <th className="p-5 font-bold">Rank</th>
                                <th className="p-5 font-bold">Manager</th>
                                <th className="p-5 font-bold">State</th>
                                <th className="p-5 font-bold">Total Sales</th>
                                <th className="p-5 font-bold">Active Agents</th>
                                <th className="p-5 font-bold">Score</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {managers.map((m) => (
                                <tr key={m.rank} className={`${m.isMe ? 'bg-amber-50' : 'hover:bg-slate-50'} transition-colors`}>
                                    <td className="p-5">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${m.rank <= 3 ? 'bg-amber-400 text-white shadow-sm' : 'bg-slate-200 text-slate-500'}`}>
                                            {m.rank}
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <span className={`font-bold ${m.isMe ? 'text-[#02275A]' : 'text-slate-700'}`}>
                                            {m.name} {m.isMe && '(You)'}
                                        </span>
                                    </td>
                                    <td className="p-5 text-slate-600">{m.state}</td>
                                    <td className="p-5 font-bold text-emerald-600">{m.sales}</td>
                                    <td className="p-5 text-slate-600">{m.agents}</td>
                                    <td className="p-5">
                                        <span className="text-xs font-bold bg-[#02275A]/10 text-[#02275A] px-2 py-1 rounded-lg">
                                            {m.score}/100
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
};

export default ManagerLeaderboard;
