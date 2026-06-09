import React, { useState } from 'react';

interface Member {
    initials: string;
    name: string;
    dept: string;
    pts: number;
    isYou?: boolean;
}

const ALL_MEMBERS: Member[] = [
    { initials: 'PM', name: 'Providence Mathias', dept: 'Product', pts: 100 },
    { initials: 'TM', name: 'Test Member', dept: 'Sales', pts: 90, isYou: true },
    { initials: 'TL', name: 'Team Lead', dept: 'Product', pts: 70 },
    { initials: 'FJ', name: 'Fred John', dept: 'Sales', pts: 68 },
    { initials: 'AO', name: 'Agnes Opoku', dept: 'Product', pts: 30 },
    { initials: 'JD', name: 'Jane Doe', dept: 'Sales', pts: 50 },
    { initials: 'JS', name: 'John Smith', dept: 'Sales', pts: 85 },
];

const EmployeeLeaderboardView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'all' | 'dept'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Filter members based on selected tab and search query
    const filteredMembers = ALL_MEMBERS.filter(member => {
        const matchesTab = activeTab === 'all' || member.dept === 'Sales';
        const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              member.dept.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    // Sort by points desc
    const sortedMembers = [...filteredMembers].sort((a, b) => b.pts - a.pts);

    // Assign ranking
    const rankedMembers = sortedMembers.map((member, index) => ({
        ...member,
        rank: index + 1
    }));

    // Top 3 for the podium
    const top1 = rankedMembers.find(m => m.rank === 1);
    const top2 = rankedMembers.find(m => m.rank === 2);
    const top3 = rankedMembers.find(m => m.rank === 3);

    // Table members (rank #4 and lower)
    const listMembers = rankedMembers.filter(m => m.rank > 3);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
            {/* Title Block */}
            <div className="mb-6">
                <h1 id="leaderboard_title" className="text-2xl font-bold text-[#02275A] mb-1 font-sans">Leaderboard</h1>
                <div className="flex items-center gap-2 mt-4">
                    <h2 className="text-lg font-bold text-[#011530] flex items-center gap-2">
                        <span>🏆</span> Top Performers
                    </h2>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1">
                    Ranked by Reward Points — celebrating extra-mile achievements
                </p>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200 shadow-sm">
                    <button
                        id="tab_all"
                        onClick={() => setActiveTab('all')}
                        className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
                            activeTab === 'all'
                                ? 'bg-[#02275A] text-white shadow-md'
                                : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
                        }`}
                    >
                        Whole Company
                    </button>
                    <button
                        id="tab_dept"
                        onClick={() => setActiveTab('dept')}
                        className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
                            activeTab === 'dept'
                                ? 'bg-[#02275A] text-white shadow-md'
                                : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
                        }`}
                    >
                        My Department
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                        <i className="fas fa-search text-xs"></i>
                    </span>
                    <input
                        id="leaderboard_search"
                        type="text"
                        placeholder="Search member..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all"
                    />
                </div>
            </div>

            {/* Podium Card Layout */}
            {rankedMembers.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm mb-6 flex flex-col justify-center">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto w-full items-end pb-2 pt-6">
                        
                        {/* Rank 2 (Left) */}
                        {top2 ? (
                            <div className="bg-white border border-slate-200/80 rounded-2xl px-6 py-8 flex flex-col items-center justify-center text-center shadow-sm relative transition-all hover:shadow-md order-2 md:order-1 min-h-[220px]">
                                {/* Medal */}
                                <div className="absolute -top-6">
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                                        <path d="M7 14L4 21L12 18L20 21L17 14" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#3B82F6" />
                                        <circle cx="12" cy="10" r="6" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2" />
                                        <text x="12" y="13" fill="#475569" fontSize="9" fontWeight="bold" textAnchor="middle">2</text>
                                    </svg>
                                </div>
                                <div className="w-16 h-16 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-lg border-2 border-white shadow-inner mb-3">
                                    {top2.initials}
                                </div>
                                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1 leading-tight">
                                    {top2.name}
                                    {top2.isYou && (
                                        <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">You</span>
                                    )}
                                </h3>
                                <p className="text-[11px] text-slate-400 font-bold mt-1 uppercase tracking-wider">{top2.dept}</p>
                                <div className="bg-slate-50 border border-slate-100 px-4 py-1.5 rounded-lg text-xs font-bold text-[#02275A] mt-4 shadow-sm font-sans">
                                    {top2.pts} pts
                                </div>
                            </div>
                        ) : (
                            <div className="hidden md:block order-1"></div>
                        )}

                        {/* Rank 1 (Center) */}
                        {top1 ? (
                            <div className="bg-amber-50/20 border-2 border-amber-200/80 rounded-3xl px-6 py-10 flex flex-col items-center justify-center text-center shadow-md relative transition-all hover:shadow-lg order-1 md:order-2 min-h-[250px]">
                                {/* Medal */}
                                <div className="absolute -top-7 scale-110">
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                                        <path d="M7 14L4 21L12 18L20 21L17 14" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#EF4444" />
                                        <circle cx="12" cy="10" r="6" fill="#FBBF24" stroke="#D97706" strokeWidth="2" />
                                        <text x="12" y="13" fill="#B45309" fontSize="9" fontWeight="bold" textAnchor="middle">1</text>
                                    </svg>
                                </div>
                                <div className="w-20 h-20 rounded-full bg-amber-400 text-white flex items-center justify-center font-bold text-2xl border-4 border-white shadow-md mb-4">
                                    {top1.initials}
                                </div>
                                <h3 className="font-extrabold text-[#02275A] text-base flex items-center gap-1 leading-tight">
                                    {top1.name}
                                    {top1.isYou && (
                                        <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">You</span>
                                    )}
                                </h3>
                                <p className="text-[11px] text-amber-700 font-bold mt-1 uppercase tracking-wider">{top1.dept}</p>
                                <div className="bg-white border border-amber-200 px-5 py-2 rounded-xl text-sm font-extrabold text-[#02275A] mt-5 shadow-sm font-sans">
                                    {top1.pts} pts
                                </div>
                            </div>
                        ) : (
                            <div className="hidden md:block order-2"></div>
                        )}

                        {/* Rank 3 (Right) */}
                        {top3 ? (
                            <div className="bg-white border border-slate-200/80 rounded-2xl px-6 py-8 flex flex-col items-center justify-center text-center shadow-sm relative transition-all hover:shadow-md order-3 md:order-3 min-h-[220px]">
                                {/* Medal */}
                                <div className="absolute -top-6">
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                                        <path d="M7 14L4 21L12 18L20 21L17 14" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#22C55E" />
                                        <circle cx="12" cy="10" r="6" fill="#F3A261" stroke="#C2410C" strokeWidth="2" />
                                        <text x="12" y="13" fill="#7C2D12" fontSize="9" fontWeight="bold" textAnchor="middle">3</text>
                                    </svg>
                                </div>
                                <div className="w-16 h-16 rounded-full bg-[#EA580C]/20 text-[#C2410C] flex items-center justify-center font-bold text-lg border-2 border-white shadow-inner mb-3">
                                    {top3.initials}
                                </div>
                                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1 leading-tight">
                                    {top3.name}
                                    {top3.isYou && (
                                        <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">You</span>
                                    )}
                                </h3>
                                <p className="text-[11px] text-slate-400 font-bold mt-1 uppercase tracking-wider">{top3.dept}</p>
                                <div className="bg-slate-50 border border-slate-100 px-4 py-1.5 rounded-lg text-xs font-bold text-[#02275A] mt-4 shadow-sm font-sans">
                                    {top3.pts} pts
                                </div>
                            </div>
                        ) : (
                            <div className="hidden md:block order-3"></div>
                        )}

                    </div>
                </div>
            )}

            {/* Table section for Rank 4 and below */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table id="leaderboard_table" className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 text-slate-500 font-bold text-xs bg-slate-50/50">
                                <th className="px-6 py-4 w-20">Rank</th>
                                <th className="px-6 py-4">Member</th>
                                <th className="px-6 py-4">Department</th>
                                <th className="px-6 py-4 text-right">Reward Pts</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                            {listMembers.length > 0 ? (
                                listMembers.map((member) => (
                                    <tr key={member.name} className="hover:bg-slate-50/40 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-400">
                                            #{member.rank}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[11px] font-bold">
                                                    {member.initials}
                                                </div>
                                                <span className="font-bold text-slate-800 text-[13px]">
                                                    {member.name}
                                                    {member.isYou && (
                                                        <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded ml-1.5 uppercase tracking-wider">You</span>
                                                    )}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wide">
                                            {member.dept}
                                        </td>
                                        <td className="px-6 py-4 text-right font-extrabold text-[#02275A] text-[13px]">
                                            {member.pts}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium">
                                        {rankedMembers.length === 0 ? 'No members found matching search query.' : 'All top performers are featured on the podium above.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default EmployeeLeaderboardView;
