import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface EmployeeDashboardViewProps {
    setView?: (view: string) => void;
}

const data = [
  { name: '5/12/2026', points: -15 },
  { name: '5/12/2026', points: 10 },
  { name: '5/13/2026', points: -5 },
];

const EmployeeDashboardView: React.FC<EmployeeDashboardViewProps> = ({ setView }) => {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="mb-8">
                <h2 className="text-xl font-bold text-[#02275A] mb-1">Welcome back, Test!</h2>
                <p className="text-sm text-slate-500">Good standing</p>
            </div>

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col items-center justify-center shadow-sm h-32">
                    <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-lg mb-2">
                        A
                    </div>
                    <h3 className="font-bold text-[#02275A] text-sm">A Grade</h3>
                    <p className="text-[11px] text-slate-500">#1 in Sales</p>
                </div>
                
                <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col shadow-sm h-32">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Performance</p>
                    <h3 className="text-3xl font-bold text-[#02275A] mb-1">80</h3>
                    <p className="text-[11px] text-slate-500 mt-auto">Current performance score</p>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col shadow-sm h-32">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <i className="far fa-star text-orange-400"></i> Reward Points
                    </p>
                    <h3 className="text-3xl font-bold text-orange-400 mb-1">10</h3>
                    <p className="text-[11px] text-slate-500 mt-auto">Reward-category total</p>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col shadow-sm h-32">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Net Balance</p>
                    <h3 className="text-3xl font-bold text-[#02275A] mb-4 leading-none">90</h3>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 mb-1 mt-auto">
                        <div className="bg-slate-300 h-1.5 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                        <span>A</span>
                        <span>A+</span>
                    </div>
                </div>
            </div>

            {/* Performance Deduction Tracker */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
                    <h3 className="font-bold text-[#02275A] text-sm">Performance Deduction Tracker</h3>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-500 font-medium">Reading: <span className="font-bold text-[#02275A]">90 pts</span></span>
                        <span className="text-sm font-medium bg-red-50 text-red-600 px-2 py-1 rounded border border-red-100">Degrades at: 75 pts</span>
                    </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 mb-3 relative overflow-hidden">
                    <div className="bg-red-500 h-full absolute right-0 rounded-l-full transition-all" style={{ width: '50%' }}></div>
                </div>
                <div className="flex flex-col sm:flex-row justify-between gap-2 mt-3">
                    <p className="text-sm text-slate-500 flex items-center gap-1.5">
                        <i className="fas fa-exclamation-triangle text-amber-500"></i>
                        <span className="font-bold text-slate-700">15 points</span> deducted from Next Grade
                    </p>
                    <p className="text-sm text-slate-500 flex items-center gap-1.5">
                        <span className="font-bold text-red-500">15 points</span> remaining until degrading to <strong className="text-[#02275A]">B Grade</strong>
                    </p>
                </div>
            </div>

            {/* Points Trend */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h3 className="font-bold text-[#02275A] text-sm mb-6">Points Trend (Last 30 Days)</h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
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
                                dataKey="points" 
                                stroke="#475569" 
                                fillOpacity={1} 
                                fill="url(#colorPoints)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col h-full">
                    <h3 className="font-bold text-[#02275A] text-sm mb-6">Recent Activity</h3>
                    
                    <div className="space-y-6 flex-1">
                        <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-slate-800 line-clamp-2">when there is no reaction to messages posted</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">Non- reaction to messages</p>
                            </div>
                            <div className="text-right ml-4">
                                <p className="text-sm font-bold text-red-500">-5</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">5/13/2026</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-slate-800 line-clamp-2">+10 awarded after 48hrs in production with no...</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">Zero-Bug Release</p>
                            </div>
                            <div className="text-right ml-4">
                                <p className="text-sm font-bold text-green-500">+10</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">5/12/2026</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-slate-800 line-clamp-2">-15 for missing an agreed-upon deadline</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">Missed Deadline</p>
                            </div>
                            <div className="text-right ml-4">
                                <p className="text-sm font-bold text-red-500">-15</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">5/12/2026</p>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={() => setView?.('history')}
                        className="text-[13px] font-bold text-[#02275A] mt-6 hover:underline text-left inline-flex items-center gap-1 w-fit"
                    >
                        See Full History <i className="fas fa-arrow-right text-[10px]"></i>
                    </button>
                </div>

                {/* Leaderboard */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col h-full">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-[#02275A] text-sm">Top members in department</h3>
                        <button 
                            onClick={() => setView?.('leaderboard')}
                            className="text-[13px] font-bold text-[#02275A] hover:underline flex items-center gap-1"
                        >
                            View All <i className="fas fa-arrow-right text-[10px]"></i>
                        </button>
                    </div>

                    <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                            <div className="w-6 h-6 rounded-full bg-white text-[11px] font-bold flex items-center justify-center text-amber-600 shadow-sm border border-amber-200">
                                1
                            </div>
                            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[11px] font-bold">
                                TM
                            </div>
                            <div className="flex-1 font-medium text-slate-800 text-[13px]">
                                Test Member <span className="text-amber-500 text-xs font-normal">(You)</span>
                            </div>
                            <div className="font-bold text-slate-700 text-[13px]">
                                90 <span className="text-slate-400 font-normal text-xs">pts</span>
                            </div>
                        </div>

                        {[
                            { rank: 2, initials: 'PM', name: 'Providence Mathias', pts: 100, isCurrent: false },
                            { rank: 3, initials: 'TL', name: 'Team Lead', pts: 70, isCurrent: false },
                            { rank: 4, initials: 'FJ', name: 'Fred John', pts: 68, isCurrent: false },
                            { rank: 5, initials: 'AO', name: 'Agnes Opoku', pts: 30, isCurrent: false },
                        ].map((user) => (
                            <div key={user.rank} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                                <div className="w-6 h-6 rounded-full text-[11px] font-medium flex items-center justify-center text-slate-400">
                                    {user.rank}
                                </div>
                                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[11px] font-bold">
                                    {user.initials}
                                </div>
                                <div className="flex-1 font-medium text-slate-700 text-[13px]">
                                    {user.name}
                                </div>
                                <div className="font-bold text-slate-700 text-[13px]">
                                    {user.pts} <span className="text-slate-400 font-normal text-xs">pts</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboardView;
