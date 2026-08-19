import React, { useState } from 'react';
import { useAlert } from '../contexts/AlertContext';

interface Manager {
    id: string;
    name: string;
    email: string;
    phone: string;
    region: string;
    status: 'Active' | 'Inactive' | 'Suspended';
    agents: number;
    activeAgents: number;
    inactiveAgents: number;
    performance: string;
    totalSales: string;
    retentionRate: string;
    topAgent: string;
    commissionEarned: string;
    joinedDate: string;
    lastLogin: string;
    totalLeads: number;
    agentInvoices: number;
}

const AdminManagersView: React.FC = () => {
    const { showSuccess } = useAlert();
    const [selectedManager, setSelectedManager] = useState<Manager | null>(null);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive' | 'Suspended'>('All');

    const [managers, setManagers] = useState<Manager[]>([
        { 
            id: 'MGR-001', 
            name: 'John Doe', 
            email: 'john@prokip.com', 
            phone: '08011122233',
            region: 'Lagos', 
            status: 'Active', 
            agents: 15, 
            activeAgents: 12,
            inactiveAgents: 3,
            performance: '92%',
            totalSales: '₦15,500,000',
            retentionRate: '95%',
            topAgent: 'Sarah O.',
            commissionEarned: '₦450,000',
            joinedDate: 'Jan 15, 2023',
            lastLogin: '2 hrs ago',
            totalLeads: 450,
            agentInvoices: 120
        },
        { 
            id: 'MGR-002', 
            name: 'Alice Kayode', 
            email: 'alice@prokip.com', 
            phone: '08022233344',
            region: 'Abuja', 
            status: 'Active', 
            agents: 8, 
            activeAgents: 6,
            inactiveAgents: 2,
            performance: '88%',
            totalSales: '₦8,200,000',
            retentionRate: '85%',
            topAgent: 'Mike T.',
            commissionEarned: '₦240,000',
            joinedDate: 'Mar 10, 2023',
            lastLogin: '1 day ago',
            totalLeads: 210,
            agentInvoices: 65
        },
        { 
            id: 'MGR-003', 
            name: 'Chinedu Obi', 
            email: 'chinedu@prokip.com', 
            phone: '08033344455',
            region: 'Port Harcourt', 
            status: 'Suspended', 
            agents: 5, 
            activeAgents: 1,
            inactiveAgents: 4,
            performance: '45%',
            totalSales: '₦1,500,000',
            retentionRate: '40%',
            topAgent: 'N/A',
            commissionEarned: '₦45,000',
            joinedDate: 'Jun 20, 2023',
            lastLogin: '2 weeks ago',
            totalLeads: 85,
            agentInvoices: 12
        },
    ]);

    const filteredManagers = managers.filter(m => {
        const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              m.region.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All' || m.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleViewProfile = (manager: Manager) => {
        setSelectedManager(manager);
        setShowProfileModal(true);
    };

    const handleCloseModal = () => {
        setShowProfileModal(false);
        setSelectedManager(null);
    };

    return (
        <div className="p-4 md:p-6 animate-fade-in space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Manager Oversight</h1>
                    <p className="text-sm text-slate-500">Track performance and manage regional managers.</p>
                </div>
                <button className="bg-[#02275A] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-[#02275A]/90 transition-all flex items-center gap-2">
                    <i className="fas fa-user-tie"></i> Add Manager
                </button>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div className="relative w-full md:w-96 flex-1">
                    <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input 
                        type="text" 
                        placeholder="Search managers by name, email, or region..." 
                        className="pl-10 pr-4 py-2 w-full bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#02275A] focus:ring-1 focus:ring-[#02275A] transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
                    <select 
                        className="bg-slate-50 border border-slate-200 text-slate-700 py-2 px-4 rounded-lg outline-none text-sm font-medium focus:border-[#02275A]"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                    >
                        <option value="All">All Statuses</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Suspended">Suspended</option>
                    </select>
                </div>
            </div>

            {/* Managers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredManagers.map(manager => (
                    <div key={manager.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4">
                             <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                manager.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 
                                manager.status === 'Suspended' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'
                            }`}>
                                {manager.status}
                            </span>
                        </div>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-[#02275A]/5 flex items-center justify-center text-[#02275A] font-bold text-xl shadow-sm">
                                {manager.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">{manager.name}</h3>
                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                    <i className="fas fa-map-marker-alt text-slate-400"></i> {manager.region} Region
                                </p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-4">
                            <div>
                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Sales</p>
                                <p className="text-base font-bold text-slate-800">{manager.totalSales}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Performance</p>
                                <p className={`text-base font-bold ${parseInt(manager.performance) >= 80 ? 'text-emerald-600' : parseInt(manager.performance) >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>
                                    {manager.performance}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Agents</p>
                                <p className="text-sm font-bold text-slate-700">{manager.activeAgents} Active <span className="text-slate-400 font-normal">/ {manager.agents} Total</span></p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Retention</p>
                                <p className="text-sm font-bold text-slate-700">{manager.retentionRate}</p>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-50 flex gap-2">
                            <button 
                                onClick={() => handleViewProfile(manager)}
                                className="w-full bg-[#02275A]/5 hover:bg-[#02275A]/10 text-[#02275A] text-xs font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <i className="fas fa-eye"></i> View Profile
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Manager Profile Modal */}
            {showProfileModal && selectedManager && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Manager Profile</h2>
                                <p className="text-xs text-slate-500">Detailed view of {selectedManager.name}</p>
                            </div>
                            <button onClick={handleCloseModal} className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 flex items-center justify-center transition-colors">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-8">
                            {/* Header Info */}
                            <div className="flex flex-col md:flex-row gap-6 items-start">
                                <div className="w-24 h-24 rounded-2xl bg-[#02275A] text-white flex items-center justify-center text-3xl font-bold shadow-lg shrink-0">
                                    {selectedManager.name.charAt(0)}
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-2xl font-bold text-slate-800">{selectedManager.name}</h3>
                                            <p className="text-slate-500 flex items-center gap-2 text-sm mt-1">
                                                <i className="fas fa-envelope"></i> {selectedManager.email}
                                            </p>
                                            <p className="text-slate-500 flex items-center gap-2 text-sm mt-1">
                                                <i className="fas fa-phone"></i> {selectedManager.phone}
                                            </p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                                            selectedManager.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 
                                            selectedManager.status === 'Suspended' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                                        }`}>
                                            {selectedManager.status}
                                        </span>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <p className="text-[10px] text-slate-400 uppercase font-bold">Region</p>
                                            <p className="font-bold text-slate-800">{selectedManager.region}</p>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <p className="text-[10px] text-slate-400 uppercase font-bold">Joined</p>
                                            <p className="font-bold text-slate-800">{selectedManager.joinedDate}</p>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <p className="text-[10px] text-slate-400 uppercase font-bold">ID</p>
                                            <p className="font-bold text-slate-800">#{selectedManager.id.split('-')[1]}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Activity & Leads */}
                            <div>
                                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Activity & Operations</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Last Login</p>
                                        <p className="font-bold text-slate-800 text-lg">{selectedManager.lastLogin}</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Agent Leads</p>
                                        <p className="font-bold text-slate-800 text-lg">{selectedManager.totalLeads}</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Agent Invoices</p>
                                        <p className="font-bold text-slate-800 text-lg">{selectedManager.agentInvoices}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Performance Stats */}
                            <div>
                                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Performance Overview</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="p-2 bg-white rounded-lg text-indigo-600 shadow-sm"><i className="fas fa-chart-line"></i></div>
                                            <span className="text-xs font-bold text-indigo-400">Total Sales</span>
                                        </div>
                                        <p className="text-xl font-bold text-indigo-900">{selectedManager.totalSales}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="p-2 bg-white rounded-lg text-emerald-600 shadow-sm"><i className="fas fa-users"></i></div>
                                            <span className="text-xs font-bold text-emerald-400">Agents</span>
                                        </div>
                                        <p className="text-xl font-bold text-emerald-900">{selectedManager.activeAgents} <span className="text-sm font-normal text-emerald-600 font-medium">/ {selectedManager.agents} Active</span></p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="p-2 bg-white rounded-lg text-amber-600 shadow-sm"><i className="fas fa-wallet"></i></div>
                                            <span className="text-xs font-bold text-amber-400">Commission</span>
                                        </div>
                                        <p className="text-xl font-bold text-amber-900">{selectedManager.commissionEarned}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="p-2 bg-white rounded-lg text-blue-600 shadow-sm"><i className="fas fa-trophy"></i></div>
                                            <span className="text-xs font-bold text-blue-400">Top Agent</span>
                                        </div>
                                        <p className="text-sm font-bold text-blue-900 mt-1">{selectedManager.topAgent}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Team Health</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-slate-500">Agent Retention Rate</span>
                                                <span className="font-bold text-slate-800">{selectedManager.retentionRate}</span>
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-full h-2">
                                                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: selectedManager.retentionRate }}></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-slate-500">Performance Score</span>
                                                <span className="font-bold text-slate-800">{selectedManager.performance}</span>
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-full h-2">
                                                <div className="bg-[#02275A] h-2 rounded-full" style={{ width: selectedManager.performance }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Actions</h4>
                                    <div className="flex flex-col gap-3">
                                        <button className="w-full py-3 border border-slate-200 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                                            <i className="fas fa-file-alt"></i> Download Performance Report
                                        </button>
                                        <button className="w-full py-3 border border-rose-200 text-rose-600 rounded-xl font-bold text-sm hover:bg-rose-50 transition-colors flex items-center justify-center gap-2">
                                            <i className="fas fa-ban"></i> Suspend Manager
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminManagersView;
