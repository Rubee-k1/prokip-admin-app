import React, { useState } from 'react';
import { useAlert } from '../contexts/AlertContext';

interface Agent {
    id: string;
    name: string;
    email: string;
    phone: string;
    country: string;
    region: string;
    stateManager: string;
    stateManagerEmail?: string;
    stateManagerPhone?: string;
    stateManagerAddress?: string;
    status: 'Active' | 'Inactive' | 'Suspended';
    sales: string;
    onboarded: string;
    performance: string;
    retention: string;
    clients: number;
    violations: number;
    lastActive: string;
    pendingCommission: string;
    paidCommission: string;
    lastPayout: string;
    kycStatus: 'Verified' | 'Pending' | 'Unverified';
    dob: string;
    address: string;
    idType: string;
    idNumber: string;
}

const AdminAgentsView: React.FC = () => {
    const { showSuccess, showWarning } = useAlert();
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
    const [agents, setAgents] = useState<Agent[]>([
        { 
            id: 'AGT-001', 
            name: 'Sarah O.', 
            email: 'sarah@prokip.com', 
            phone: '08012345678',
            country: 'Nigeria',
            region: 'Lagos', 
            stateManager: 'John D.',
            stateManagerEmail: 'john.d@prokip.com',
            stateManagerPhone: '08011112222',
            stateManagerAddress: '10 Victoria Island, Lagos',
            status: 'Active', 
            sales: '₦1.2M', 
            onboarded: 'Oct 2023',
            performance: '95%',
            retention: '92%',
            clients: 45,
            violations: 0,
            lastActive: '2 mins ago',
            pendingCommission: '₦25,000',
            paidCommission: '₦150,000',
            lastPayout: 'Oct 25, 2023',
            kycStatus: 'Verified',
            dob: '12 May 1990',
            address: '15 Admiralty Way, Lekki, Lagos',
            idType: 'NIN',
            idNumber: '12345678901'
        },
        { 
            id: 'AGT-002', 
            name: 'Mike T.', 
            email: 'mike@prokip.com', 
            phone: '08098765432',
            country: 'Nigeria',
            region: 'Abuja', 
            stateManager: 'Alice K.',
            stateManagerEmail: 'alice.k@prokip.com',
            stateManagerPhone: '08033334444',
            stateManagerAddress: '15 Wuse Zone 2, Abuja',
            status: 'Active', 
            sales: '₦850k', 
            onboarded: 'Sep 2023',
            performance: '88%',
            retention: '85%',
            clients: 32,
            violations: 1,
            lastActive: '1 hour ago',
            pendingCommission: '₦12,500',
            paidCommission: '₦95,000',
            lastPayout: 'Oct 20, 2023',
            kycStatus: 'Verified',
            dob: '23 Aug 1992',
            address: '45 Gana Street, Maitama, Abuja',
            idType: 'Voters Card',
            idNumber: '987654321'
        },
        { 
            id: 'AGT-003', 
            name: 'Jessica L.', 
            email: 'jessica@prokip.com', 
            phone: '07055544433',
            country: 'Nigeria',
            region: 'Kano', 
            stateManager: 'Musa B.',
            stateManagerEmail: 'musa.b@prokip.com',
            stateManagerPhone: '08055556666',
            stateManagerAddress: '5 Sabon Gari, Kano',
            status: 'Inactive', 
            sales: '₦0', 
            onboarded: 'Nov 2023',
            performance: '0%',
            retention: '0%',
            clients: 0,
            violations: 0,
            lastActive: '5 days ago',
            pendingCommission: '₦0',
            paidCommission: '₦0',
            lastPayout: 'N/A',
            kycStatus: 'Pending',
            dob: '05 Jan 1995',
            address: '10 Zoo Road, Kano',
            idType: 'NIN',
            idNumber: 'Pending'
        },
    ]);

    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [stateManagerFilter, setStateManagerFilter] = useState('All');

    const stateManagers = Array.from(new Set(agents.map(a => a.stateManager))).filter(Boolean);

    const handleStatusToggle = (id: string) => {
        setAgents(agents.map(agent => 
            agent.id === id 
            ? { ...agent, status: agent.status === 'Active' ? 'Inactive' : 'Active' } 
            : agent
        ));
        showSuccess('Agent status updated.');
    };

    const handleSuspend = (id: string) => {
        setAgents(agents.map(agent => 
            agent.id === id 
            ? { ...agent, status: 'Suspended' } 
            : agent
        ));
        showWarning('Agent has been suspended.');
        if (selectedAgent?.id === id) setSelectedAgent(null);
    };

    const filteredAgents = agents.filter(a => {
        const matchesStatus = filter === 'All' || a.status === filter;
        const matchesManager = stateManagerFilter === 'All' || a.stateManager === stateManagerFilter;
        const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              a.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              a.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              a.region.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesManager && matchesSearch;
    });

    return (
        <div className="p-4 md:p-6 animate-fade-in space-y-6 relative">
            
            {/* Profile Modal */}
            {selectedAgent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-[#02275A] text-white flex items-center justify-center font-bold text-xl">
                                    {selectedAgent.name.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800">{selectedAgent.name}</h2>
                                    <p className="text-sm text-slate-500">{selectedAgent.id} • {selectedAgent.region}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedAgent(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-8">
                            {/* Key Stats */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Performance</p>
                                    <p className="text-xl font-bold text-[#02275A]">{selectedAgent.performance}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Retention</p>
                                    <p className="text-xl font-bold text-emerald-600">{selectedAgent.retention}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Violations</p>
                                    <p className={`text-xl font-bold ${selectedAgent.violations > 0 ? 'text-rose-600' : 'text-slate-600'}`}>{selectedAgent.violations}</p>
                                </div>
                            </div>

                            {/* Biodata & KYC */}
                            <div>
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Biodata & KYC</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase mb-1">Email Address</p>
                                        <p className="text-sm font-medium text-slate-700">{selectedAgent.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase mb-1">Phone Number</p>
                                        <p className="text-sm font-medium text-slate-700">{selectedAgent.phone}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase mb-1">Country</p>
                                        <p className="text-sm font-medium text-slate-700">{selectedAgent.country}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase mb-1">Date of Birth</p>
                                        <p className="text-sm font-medium text-slate-700">{selectedAgent.dob}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase mb-1">Address</p>
                                        <p className="text-sm font-medium text-slate-700">{selectedAgent.address}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase mb-1">ID Type</p>
                                        <p className="text-sm font-medium text-slate-700">{selectedAgent.idType}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase mb-1">ID Number</p>
                                        <p className="text-sm font-medium text-slate-700">{selectedAgent.idNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase mb-1">KYC Status</p>
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${selectedAgent.kycStatus === 'Verified' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                            {selectedAgent.kycStatus === 'Verified' && <i className="fas fa-check-circle"></i>}
                                            {selectedAgent.kycStatus}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* State Manager Details */}
                            {selectedAgent.stateManager && (
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">State Manager Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                                        <div>
                                            <p className="text-xs text-slate-400 font-bold uppercase mb-1">Manager Name</p>
                                            <p className="text-sm font-medium text-slate-700">{selectedAgent.stateManager}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 font-bold uppercase mb-1">Contact Email</p>
                                            <p className="text-sm font-medium text-slate-700">{selectedAgent.stateManagerEmail || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 font-bold uppercase mb-1">Contact Phone</p>
                                            <p className="text-sm font-medium text-slate-700">{selectedAgent.stateManagerPhone || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 font-bold uppercase mb-1">Address</p>
                                            <p className="text-sm font-medium text-slate-700">{selectedAgent.stateManagerAddress || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Financials */}
                            <div>
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Financial Overview</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase mb-1">Total Sales</p>
                                        <p className="text-sm font-bold text-slate-700">{selectedAgent.sales}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase mb-1">Pending Commission</p>
                                        <p className="text-sm font-bold text-amber-600">{selectedAgent.pendingCommission}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase mb-1">Paid Commission</p>
                                        <p className="text-sm font-bold text-emerald-600">{selectedAgent.paidCommission}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase mb-1">Last Payout</p>
                                        <p className="text-sm font-medium text-slate-700">{selectedAgent.lastPayout}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
                            <button 
                                onClick={() => handleSuspend(selectedAgent.id)}
                                className="px-4 py-2 bg-rose-100 text-rose-700 font-bold text-sm rounded-xl hover:bg-rose-200 transition-colors flex items-center gap-2"
                            >
                                <i className="fas fa-ban"></i> Suspend Agent
                            </button>
                            <button 
                                onClick={() => setSelectedAgent(null)}
                                className="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-50 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col justify-between items-start md:items-center gap-4 mb-4 md:mb-0 md:flex-row">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Agent Management</h1>
                    <p className="text-sm text-slate-500">View and manage all registered agents.</p>
                </div>
                <button className="bg-[#02275A] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-[#02275A]/90 transition-all flex items-center gap-2 whitespace-nowrap">
                    <i className="fas fa-plus"></i> <span className="hidden md:inline">Add Agent</span><span className="md:hidden">Add</span>
                </button>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-3 w-full">
                <div className="relative flex-1 w-full">
                    <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input 
                        type="text" 
                        placeholder="Search agents..." 
                        className="w-full bg-white border border-slate-200 text-slate-600 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#02275A]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select 
                    className="bg-white border border-slate-200 text-slate-600 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#02275A] w-full md:w-auto"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                >
                    <option value="All">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                </select>
                <select 
                    className="bg-white border border-slate-200 text-slate-600 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#02275A] w-full md:w-auto"
                    value={stateManagerFilter}
                    onChange={(e) => setStateManagerFilter(e.target.value)}
                >
                    <option value="All">All State Managers</option>
                    {stateManagers.map(manager => (
                        <option key={manager} value={manager}>{manager}</option>
                    ))}
                </select>
            </div>

            {/* Mobile Card View (Visible on small screens) */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {filteredAgents.map(agent => (
                    <div key={agent.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-lg">
                                    {agent.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800 text-lg">{agent.name}</p>
                                    <p className="text-xs text-slate-500 font-medium">{agent.id}</p>
                                </div>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                                agent.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 
                                agent.status === 'Suspended' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'
                            }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                    agent.status === 'Active' ? 'bg-emerald-500' : 
                                    agent.status === 'Suspended' ? 'bg-rose-500' : 'bg-slate-400'
                                }`}></span>
                                {agent.status}
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm border-t border-b border-slate-50 py-3">
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase mb-1">Location</p>
                                <p className="font-medium text-slate-700">{agent.region}, {agent.country}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase mb-1">Phone</p>
                                <p className="font-medium text-slate-700">{agent.phone}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase mb-1">Manager</p>
                                <p className="font-medium text-slate-700">{agent.stateManager}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase mb-1">Performance</p>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-[#02275A]">{agent.performance}</span>
                                    <span className={`text-xs ${parseInt(agent.retention) >= 90 ? 'text-emerald-500' : 'text-amber-500'}`}>({agent.retention} Ret.)</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-1">
                            <div className="text-xs text-slate-400">
                                Last Active: <span className="text-slate-600 font-medium">{agent.lastActive}</span>
                            </div>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => handleSuspend(agent.id)}
                                    className="px-3 py-2 bg-rose-50 text-rose-600 text-xs font-bold rounded-lg hover:bg-rose-100 transition-colors"
                                >
                                    Suspend
                                </button>
                                <button 
                                    onClick={() => setSelectedAgent(agent)}
                                    className="px-4 py-2 bg-[#02275A] text-white text-xs font-bold rounded-lg hover:bg-[#02275A]/90 shadow-sm transition-colors"
                                >
                                    View Profile
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop Table View (Hidden on small screens) */}
            <div className="hidden md:block bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500 font-bold tracking-wider">
                                <th className="p-4">Agent Details</th>
                                <th className="p-4">State Manager</th>
                                <th className="p-4">Performance</th>
                                <th className="p-4">Retention</th>
                                <th className="p-4">Clients</th>
                                <th className="p-4">Violations</th>
                                <th className="p-4">Commissions</th>
                                <th className="p-4">Last Active</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredAgents.map(agent => (
                                <tr key={agent.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm">
                                                {agent.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm">{agent.name}</p>
                                                <p className="text-xs text-slate-500">{agent.region}, {agent.country}</p>
                                                <p className="text-[10px] text-slate-400">{agent.phone}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-slate-600 font-medium">{agent.stateManager}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                <div className="bg-[#02275A] h-full rounded-full" style={{ width: agent.performance }}></div>
                                            </div>
                                            <span className="text-xs font-bold text-[#02275A]">{agent.performance}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`text-xs font-bold ${parseInt(agent.retention) >= 90 ? 'text-emerald-600' : parseInt(agent.retention) >= 70 ? 'text-amber-600' : 'text-rose-600'}`}>
                                            {agent.retention}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm font-bold text-slate-700">{agent.clients}</td>
                                    <td className="p-4">
                                        {agent.violations > 0 ? (
                                            <span className="px-2 py-0.5 bg-rose-100 text-rose-600 rounded text-xs font-bold">{agent.violations}</span>
                                        ) : (
                                            <span className="text-slate-400 text-xs">-</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex justify-between text-xs w-32">
                                                <span className="text-slate-400">Pending:</span>
                                                <span className="font-bold text-amber-600">{agent.pendingCommission}</span>
                                            </div>
                                            <div className="flex justify-between text-xs w-32">
                                                <span className="text-slate-400">Paid:</span>
                                                <span className="font-bold text-emerald-600">{agent.paidCommission}</span>
                                            </div>
                                            <div className="text-[10px] text-slate-400 mt-0.5 border-t border-slate-100 pt-0.5">
                                                Last Payout: {agent.lastPayout}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-xs text-slate-500 font-medium">{agent.lastActive}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit ${
                                            agent.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 
                                            agent.status === 'Suspended' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${
                                                agent.status === 'Active' ? 'bg-emerald-500' : 
                                                agent.status === 'Suspended' ? 'bg-rose-500' : 'bg-slate-400'
                                            }`}></span>
                                            {agent.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => setSelectedAgent(agent)}
                                                className="px-3 py-1.5 bg-[#02275A] text-white text-xs font-bold rounded-lg hover:bg-[#02275A]/90 shadow-sm transition-colors"
                                            >
                                                View Profile
                                            </button>
                                            <button 
                                                onClick={() => handleSuspend(agent.id)}
                                                className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                title="Suspend Agent"
                                            >
                                                <i className="fas fa-ban"></i>
                                            </button>
                                        </div>
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

export default AdminAgentsView;
