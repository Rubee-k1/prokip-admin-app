import React, { useState } from 'react';
import { Agent, Customer } from '../types';
import ManagerAgentKycModal from './ManagerAgentKycModal';
import { useAlert } from '../contexts/AlertContext';

const ManagerAgentsView: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('All');
    const { showSuccess, showError } = useAlert();
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
    const [isKycModalOpen, setIsKycModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'agents' | 'customers' | 'zones'>('agents');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);

    // Zone Management State
    interface Zone {
        id: string;
        name: string;
        description: string;
        agentCount: number;
    }
    const [zones, setZones] = useState<Zone[]>([
        { id: 'Z-001', name: 'Lagos Mainland', description: 'Mainland axis covering Ikeja to Yaba', agentCount: 2 },
        { id: 'Z-002', name: 'Lagos Island', description: 'Island axis covering VI to Lekki', agentCount: 1 },
    ]);
    const [showZoneModal, setShowZoneModal] = useState(false);
    const [newZoneData, setNewZoneData] = useState({ name: '', description: '' });
    const [showAssignZoneModal, setShowAssignZoneModal] = useState(false);
    const [selectedAgentForZone, setSelectedAgentForZone] = useState<string | null>(null);
    const [selectedZoneId, setSelectedZoneId] = useState<string>('');

    // Remap & Filter State
    const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
    const [showRemapModal, setShowRemapModal] = useState(false);
    const [remapTarget, setRemapTarget] = useState<'single' | 'bulk'>('single');
    const [customerToRemap, setCustomerToRemap] = useState<Customer | null>(null);
    const [selectedNewAgentId, setSelectedNewAgentId] = useState<string>('');
    const [agentFilter, setAgentFilter] = useState<string>('All');
    const [activeCustomerActionMenu, setActiveCustomerActionMenu] = useState<string | null>(null);

    // Mock Agents Data
    const [agents, setAgents] = useState<Agent[]>([
        { 
            id: 'AG-001', 
            name: 'Sarah O.', 
            email: 'sarah@prokip.com', 
            phone: '08012345678', 
            state: 'Lagos', 
            status: 'Active', 
            kycStatus: 'Approved',
            totalSales: '₦3.2M', 
            activeBusinesses: 45, 
            inactiveBusinesses: 5,
            violations: 0,
            lastActive: '2 mins ago', 
            performanceScore: 95,
            zone: 'Lagos Mainland'
        },
        { 
            id: 'AG-002', 
            name: 'Emmanuel K.', 
            email: 'emmanuel@prokip.com', 
            phone: '08087654321', 
            state: 'Lagos', 
            status: 'Active', 
            kycStatus: 'Approved',
            totalSales: '₦2.8M', 
            activeBusinesses: 38, 
            inactiveBusinesses: 12,
            violations: 1,
            lastActive: '1 hour ago', 
            performanceScore: 88,
            zone: 'Lagos Island'
        },
        { 
            id: 'AG-003', 
            name: 'John Agent', 
            email: 'john@prokip.com', 
            phone: '08055555555', 
            state: 'Lagos', 
            status: 'Active', 
            kycStatus: 'Pending',
            kycSubmittedDate: 'Oct 24, 2023',
            documents: {
                idCard: 'https://picsum.photos/seed/id1/400/300',
                utilityBill: 'https://picsum.photos/seed/util1/400/300',
                photo: 'https://picsum.photos/seed/photo1/300/300'
            },
            totalSales: '₦2.4M', 
            activeBusinesses: 32, 
            inactiveBusinesses: 8,
            violations: 0,
            lastActive: 'Today', 
            performanceScore: 82,
            zone: 'Lagos Mainland'
        },
        { 
            id: 'AG-004', 
            name: 'Chinedu B.', 
            email: 'chinedu@prokip.com', 
            phone: '08099999999', 
            state: 'Lagos', 
            status: 'Inactive', 
            kycStatus: 'Rejected',
            rejectionReason: 'ID Card image was blurry. Please re-upload.',
            totalSales: '₦2.1M', 
            activeBusinesses: 28, 
            inactiveBusinesses: 15,
            violations: 3,
            lastActive: '3 days ago', 
            performanceScore: 75 
        },
        { 
            id: 'AG-005', 
            name: 'Fatima A.', 
            email: 'fatima@prokip.com', 
            phone: '08022222222', 
            state: 'Lagos', 
            status: 'Suspended', 
            kycStatus: 'Approved',
            totalSales: '₦1.9M', 
            activeBusinesses: 25, 
            inactiveBusinesses: 20,
            violations: 5,
            lastActive: '1 week ago', 
            performanceScore: 60 
        },
        { 
            id: 'AG-006', 
            name: 'David O.', 
            email: 'david@prokip.com', 
            phone: '08033333333', 
            state: 'Lagos', 
            status: 'Active', 
            kycStatus: 'Pending',
            kycSubmittedDate: 'Oct 25, 2023',
            documents: {
                idCard: 'https://picsum.photos/seed/id2/400/300',
                utilityBill: 'https://picsum.photos/seed/util2/400/300',
                photo: 'https://picsum.photos/seed/photo2/300/300'
            },
            totalSales: '₦0', 
            activeBusinesses: 0, 
            inactiveBusinesses: 0,
            violations: 0,
            lastActive: 'Just now', 
            performanceScore: 0 
        },
    ]);

    // Mock Customers Data
    const [customers, setCustomers] = useState<Customer[]>([
        { id: 'CUST-001', businessName: 'Mama Nkechi Store', ownerName: 'Nkechi Obi', email: 'nkechi@gmail.com', phone: '08011111111', plan: 'Pro Plan', status: 'Active', assignedAgentId: 'AG-001', assignedAgentName: 'Sarah O.', dateJoined: '2023-01-15', lastTransactionDate: '2023-10-25' },
        { id: 'CUST-002', businessName: 'Emeka Electronics', ownerName: 'Emeka Ugo', email: 'emeka@yahoo.com', phone: '08022222222', plan: 'Basic Plan', status: 'Active', assignedAgentId: 'AG-002', assignedAgentName: 'Emmanuel K.', dateJoined: '2023-02-10', lastTransactionDate: '2023-10-24' },
        { id: 'CUST-003', businessName: 'Grace Fashion', ownerName: 'Grace Ade', email: 'grace@hotmail.com', phone: '08033333333', plan: 'Enterprise', status: 'Active', assignedAgentId: 'AG-001', assignedAgentName: 'Sarah O.', dateJoined: '2023-03-05', lastTransactionDate: '2023-10-20' },
        { id: 'CUST-004', businessName: 'Tunde Motors', ownerName: 'Tunde Bakare', email: 'tunde@gmail.com', phone: '08044444444', plan: 'Pro Plan', status: 'Inactive', assignedAgentId: 'AG-003', assignedAgentName: 'John Agent', dateJoined: '2023-04-12', lastTransactionDate: '2023-09-15' },
        { id: 'CUST-005', businessName: 'Iya Ibeji Provisions', ownerName: 'Funke Akindele', email: 'funke@gmail.com', phone: '08055555555', plan: 'Basic Plan', status: 'Trial', assignedAgentId: 'AG-002', assignedAgentName: 'Emmanuel K.', dateJoined: '2023-10-20', lastTransactionDate: '2023-10-26' },
        { id: 'CUST-006', businessName: 'Lekki Gardens', ownerName: 'Jide Kosoko', email: 'jide@lekki.com', phone: '08066666666', plan: 'Enterprise', status: 'Active', assignedAgentId: 'AG-004', assignedAgentName: 'Chinedu B.', dateJoined: '2023-05-20', lastTransactionDate: '2023-10-22' },
    ]);

    const filteredAgents = agents.filter(agent => {
        const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) || agent.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'All' || agent.status === filter || (filter === 'Pending KYC' && agent.kycStatus === 'Pending');
        return matchesSearch && matchesFilter;
    });

    const filteredCustomers = customers.filter(customer => {
        const matchesSearch = customer.businessName.toLowerCase().includes(searchTerm.toLowerCase()) || customer.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'All' || customer.status === filter;
        const matchesAgent = agentFilter === 'All' || customer.assignedAgentId === agentFilter;
        return matchesSearch && matchesFilter && matchesAgent;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredAgents.length / itemsPerPage);
    const currentAgents = filteredAgents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'Active': return 'bg-emerald-100 text-emerald-700';
            case 'Inactive': return 'bg-amber-100 text-amber-700';
            case 'Suspended': return 'bg-rose-100 text-rose-700';
            case 'Trial': return 'bg-blue-100 text-blue-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getKycStatusColor = (status: string) => {
        switch(status) {
            case 'Approved': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
            case 'Rejected': return 'text-rose-600 bg-rose-50 border-rose-100';
            case 'Pending': return 'text-amber-600 bg-amber-50 border-amber-100';
            default: return 'text-slate-400 bg-slate-50 border-slate-100';
        }
    };

    const handleReviewKyc = (agent: Agent) => {
        setSelectedAgent(agent);
        setIsKycModalOpen(true);
        setActiveActionMenu(null);
    };

    const handleApproveKyc = (agentId: string) => {
        setAgents(prev => prev.map(agent => 
            agent.id === agentId ? { ...agent, kycStatus: 'Approved' } : agent
        ));
        showSuccess('Agent KYC Approved Successfully');
        setIsKycModalOpen(false);
        setSelectedAgent(null);
    };

    const handleRejectKyc = (agentId: string, reason: string) => {
        setAgents(prev => prev.map(agent => 
            agent.id === agentId ? { ...agent, kycStatus: 'Rejected', rejectionReason: reason } : agent
        ));
        showSuccess('Agent KYC Rejected');
        setIsKycModalOpen(false);
        setSelectedAgent(null);
    };

    const handleAddViolation = (agentId: string) => {
        const reason = prompt("Enter violation reason:");
        if (reason) {
            setAgents(prev => prev.map(agent => 
                agent.id === agentId ? { ...agent, violations: (agent.violations || 0) + 1 } : agent
            ));
            showSuccess('Violation added successfully');
        }
        setActiveActionMenu(null);
    };

    const handleSuspendAgent = (agentId: string) => {
        if (confirm("Are you sure you want to suspend this agent?")) {
            setAgents(prev => prev.map(agent => 
                agent.id === agentId ? { ...agent, status: 'Suspended' } : agent
            ));
            showSuccess('Agent suspended successfully');
        }
        setActiveActionMenu(null);
    };

    const handleViewProfile = (agent: Agent) => {
        // Placeholder for profile view
        alert(`Viewing profile for ${agent.name}`);
        setActiveActionMenu(null);
    };

    const toggleActionMenu = (agentId: string) => {
        setActiveActionMenu(activeActionMenu === agentId ? null : agentId);
    };

    const toggleCustomerActionMenu = (customerId: string) => {
        setActiveCustomerActionMenu(activeCustomerActionMenu === customerId ? null : customerId);
    };

    const handleSingleRemap = (customer: Customer) => {
        setCustomerToRemap(customer);
        setRemapTarget('single');
        setSelectedNewAgentId('');
        setShowRemapModal(true);
        setActiveCustomerActionMenu(null);
    };

    const handleBulkRemap = () => {
        if (selectedCustomerIds.length === 0) return;
        setRemapTarget('bulk');
        setSelectedNewAgentId('');
        setShowRemapModal(true);
    };

    const handleCreateZone = () => {
        if (!newZoneData.name) {
            showError('Please enter a zone name');
            return;
        }
        const newZone: Zone = {
            id: `Z-${Date.now()}`,
            name: newZoneData.name,
            description: newZoneData.description,
            agentCount: 0
        };
        setZones([...zones, newZone]);
        setNewZoneData({ name: '', description: '' });
        setShowZoneModal(false);
        showSuccess(`Zone "${newZone.name}" created successfully`);
    };

    const handleAssignZone = () => {
        if (!selectedZoneId || !selectedAgentForZone) {
            showError('Please select a zone');
            return;
        }
        const zone = zones.find(z => z.id === selectedZoneId);
        if (zone) {
            setAgents(prev => prev.map(a => 
                a.id === selectedAgentForZone ? { ...a, zone: zone.name } : a
            ));
            // Update agent count in zone (mock logic)
            setZones(prev => prev.map(z => 
                z.id === selectedZoneId ? { ...z, agentCount: z.agentCount + 1 } : z
            ));
            showSuccess(`Agent assigned to ${zone.name}`);
            setShowAssignZoneModal(false);
            setSelectedAgentForZone(null);
            setSelectedZoneId('');
        }
    };

    const openAssignZoneModal = (agentId: string) => {
        setSelectedAgentForZone(agentId);
        setShowAssignZoneModal(true);
        setActiveActionMenu(null);
    };

    const confirmRemap = () => {
        if (!selectedNewAgentId) {
            showError('Please select a new agent');
            return;
        }

        const newAgent = agents.find(a => a.id === selectedNewAgentId);
        if (!newAgent) return;

        if (remapTarget === 'single' && customerToRemap) {
            setCustomers(prev => prev.map(c => 
                c.id === customerToRemap.id 
                    ? { ...c, assignedAgentId: newAgent.id, assignedAgentName: newAgent.name }
                    : c
            ));
            showSuccess(`Successfully remapped ${customerToRemap.businessName} to ${newAgent.name}`);
        } else if (remapTarget === 'bulk') {
            setCustomers(prev => prev.map(c => 
                selectedCustomerIds.includes(c.id)
                    ? { ...c, assignedAgentId: newAgent.id, assignedAgentName: newAgent.name }
                    : c
            ));
            showSuccess(`Successfully remapped ${selectedCustomerIds.length} customers to ${newAgent.name}`);
        }
        
        setShowRemapModal(false);
        setSelectedCustomerIds([]);
        setCustomerToRemap(null);
    };

    const toggleCustomerSelection = (customerId: string) => {
        setSelectedCustomerIds(prev => 
            prev.includes(customerId) 
                ? prev.filter(id => id !== customerId)
                : [...prev, customerId]
        );
    };

    const toggleSelectAllCustomers = () => {
        if (selectedCustomerIds.length === filteredCustomers.length) {
            setSelectedCustomerIds([]);
        } else {
            setSelectedCustomerIds(filteredCustomers.map(c => c.id));
        }
    };

    return (
        <div className="w-full mx-auto px-4 md:px-8 py-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Manage Agents & Customers</h2>
                    <p className="text-xs text-slate-500">Track performance, manage KYC, and view customer details.</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={handleBulkRemap}
                        disabled={selectedCustomerIds.length === 0}
                        className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <i className="fas fa-exchange-alt mr-2"></i> Bulk Remap
                    </button>
                    <button className="bg-[#02275A] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-[#02275A]/90">
                        <i className="fas fa-user-plus mr-2"></i> Invite Agent
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-slate-200 mb-6">
                <button 
                    onClick={() => { setActiveTab('agents'); setFilter('All'); setCurrentPage(1); }}
                    className={`pb-3 px-2 text-sm font-bold transition-colors relative ${activeTab === 'agents' ? 'text-[#02275A]' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Agents List
                    {activeTab === 'agents' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#02275A] rounded-t-full"></div>}
                </button>
                <button 
                    onClick={() => { setActiveTab('customers'); setFilter('All'); }}
                    className={`pb-3 px-2 text-sm font-bold transition-colors relative ${activeTab === 'customers' ? 'text-[#02275A]' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    All Customers
                    {activeTab === 'customers' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#02275A] rounded-t-full"></div>}
                </button>
                <button 
                    onClick={() => { setActiveTab('zones'); setFilter('All'); }}
                    className={`pb-3 px-2 text-sm font-bold transition-colors relative ${activeTab === 'zones' ? 'text-[#02275A]' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Zones
                    {activeTab === 'zones' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#02275A] rounded-t-full"></div>}
                </button>
            </div>

            {/* Filters */}
            {['agents', 'customers'].includes(activeTab) && (
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                        <span className="absolute left-3 top-2.5 text-slate-400"><i className="fas fa-search"></i></span>
                        <input 
                            type="text" 
                            placeholder={`Search ${activeTab === 'agents' ? 'agents' : 'customers'}...`} 
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#02275A] shadow-sm"
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                    {activeTab === 'customers' && (
                        <div className="w-full md:w-48">
                            <select 
                                value={agentFilter}
                                onChange={(e) => setAgentFilter(e.target.value)}
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#02275A] shadow-sm text-slate-600 font-bold"
                            >
                                <option value="All">All Agents</option>
                                {agents.map(agent => (
                                    <option key={agent.id} value={agent.id}>{agent.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar">
                        {activeTab === 'agents' ? (
                            ['All', 'Active', 'Inactive', 'Pending KYC', 'Suspended'].map(f => (
                                <button 
                                    key={f} 
                                    onClick={() => { setFilter(f); setCurrentPage(1); }}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${filter === f ? 'bg-[#02275A] text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                >
                                    {f}
                                </button>
                            ))
                        ) : activeTab === 'customers' ? (
                            ['All', 'Active', 'Inactive', 'Trial'].map(f => (
                                <button 
                                    key={f} 
                                    onClick={() => setFilter(f)}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${filter === f ? 'bg-[#02275A] text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                >
                                    {f}
                                </button>
                            ))
                        ) : null}
                    </div>
                </div>
            )}

            {/* Content */}
            {activeTab === 'agents' ? (
                <>
                    {/* Agents Table (Desktop) */}
                    <div className="hidden md:block bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 border-b border-slate-100 text-xs text-slate-500 uppercase">
                                    <tr>
                                        <th className="px-3 py-3 font-bold">Agent Details</th>
                                        <th className="px-3 py-3 font-bold">Status</th>
                                        <th className="px-3 py-3 font-bold">Clients</th>
                                        <th className="px-3 py-3 font-bold">Performance</th>
                                        <th className="px-3 py-3 font-bold">Zone</th>
                                        <th className="px-3 py-3 font-bold">Violations</th>
                                        <th className="px-3 py-3 font-bold">KYC Status</th>
                                        <th className="px-3 py-3 font-bold text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {currentAgents.map(agent => (
                                        <tr key={agent.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-3 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs">
                                                        {agent.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800">{agent.name}</p>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <p className="text-xs text-slate-500">{agent.phone}</p>
                                                            <div className="flex gap-2 ml-1">
                                                                <a href={`https://wa.me/${agent.phone.replace(/^0/, '234').replace(/\s/g, '')}`} target="_blank" rel="noreferrer" className="text-emerald-500 hover:text-emerald-600 transition-colors" title="WhatsApp">
                                                                    <i className="fab fa-whatsapp"></i>
                                                                </a>
                                                                <a href={`tel:${agent.phone}`} className="text-blue-500 hover:text-blue-600 transition-colors" title="Call">
                                                                    <i className="fas fa-phone"></i>
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-3">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusColor(agent.status)}`}>
                                                    {agent.status}
                                                </span>
                                                <p className="text-[10px] text-slate-400 mt-1">Last seen: {agent.lastActive}</p>
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center justify-between text-xs w-28">
                                                        <span className="text-slate-500">Total:</span>
                                                        <span className="font-bold text-slate-800">{agent.activeBusinesses + (agent.inactiveBusinesses || 0)}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-[10px] w-28">
                                                        <span className="text-emerald-600">Active:</span>
                                                        <span className="font-bold text-emerald-600">{agent.activeBusinesses}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-[10px] w-28">
                                                        <span className="text-amber-600">Inactive:</span>
                                                        <span className="font-bold text-amber-600">{agent.inactiveBusinesses || 0}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 w-16 bg-slate-100 rounded-full h-1.5">
                                                        <div 
                                                            className={`h-full rounded-full ${agent.performanceScore >= 80 ? 'bg-emerald-500' : agent.performanceScore >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`} 
                                                            style={{width: `${agent.performanceScore}%`}}
                                                        ></div>
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-600">{agent.performanceScore}%</span>
                                                </div>
                                                <p className="text-[10px] text-slate-400 mt-1">Sales: {agent.totalSales}</p>
                                            </td>
                                            <td className="px-3 py-3">
                                                <span className={`text-xs font-bold ${agent.zone ? 'text-[#02275A] bg-blue-50 px-2 py-1 rounded' : 'text-slate-400 italic'}`}>
                                                    {agent.zone || 'Unassigned'}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3">
                                                <span className={`text-xs font-bold ${agent.violations && agent.violations > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                                                    {agent.violations || 0}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3">
                                                <span className={`px-2 py-1 rounded-lg border text-[10px] font-bold uppercase ${getKycStatusColor(agent.kycStatus)}`}>
                                                    {agent.kycStatus}
                                                </span>
                                                {agent.kycStatus === 'Rejected' && (
                                                    <p className="text-[10px] text-rose-500 mt-1 max-w-[120px] truncate" title={agent.rejectionReason}>
                                                        {agent.rejectionReason}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-3 py-3 text-right relative">
                                                <button 
                                                    onClick={() => toggleActionMenu(agent.id)}
                                                    className="text-slate-400 hover:text-[#02275A] p-2 rounded-full hover:bg-slate-50 transition-colors"
                                                >
                                                    <i className="fas fa-ellipsis-v"></i>
                                                </button>
                                                
                                                {activeActionMenu === agent.id && (
                                                    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-20 overflow-hidden animate-fade-in">
                                                        <div className="py-1">
                                                            <button 
                                                                onClick={() => handleViewProfile(agent)}
                                                                className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#02275A] flex items-center gap-2"
                                                            >
                                                                <i className="fas fa-user w-4"></i> View Profile
                                                            </button>
                                                            {agent.kycStatus === 'Pending' && (
                                                                <button 
                                                                    onClick={() => handleReviewKyc(agent)}
                                                                    className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#02275A] flex items-center gap-2"
                                                                >
                                                                    <i className="fas fa-file-contract w-4"></i> Review KYC
                                                                </button>
                                                            )}
                                                            <button 
                                                                onClick={() => openAssignZoneModal(agent.id)}
                                                                className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#02275A] flex items-center gap-2"
                                                            >
                                                                <i className="fas fa-map-marker-alt w-4"></i> Assign Zone
                                                            </button>
                                                            <button 
                                                                onClick={() => handleAddViolation(agent.id)}
                                                                className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-rose-600 flex items-center gap-2"
                                                            >
                                                                <i className="fas fa-exclamation-triangle w-4"></i> Add Violation
                                                            </button>
                                                            <button 
                                                                onClick={() => handleSuspendAgent(agent.id)}
                                                                className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2 border-t border-slate-50"
                                                            >
                                                                <i className="fas fa-ban w-4"></i> Suspend Agent
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Agents Cards (Mobile) */}
                    <div className="md:hidden space-y-4">
                        {currentAgents.map(agent => (
                            <div key={agent.id} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm relative">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
                                            {agent.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800">{agent.name}</h3>
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <span>{agent.phone}</span>
                                                <div className="flex gap-2">
                                                    <a href={`https://wa.me/${agent.phone.replace(/^0/, '234').replace(/\s/g, '')}`} target="_blank" rel="noreferrer" className="text-emerald-500">
                                                        <i className="fab fa-whatsapp"></i>
                                                    </a>
                                                    <a href={`tel:${agent.phone}`} className="text-blue-500">
                                                        <i className="fas fa-phone"></i>
                                                    </a>
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-slate-400 mt-1">Last seen: {agent.lastActive}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusColor(agent.status)}`}>
                                            {agent.status}
                                        </span>
                                        <button 
                                            onClick={() => toggleActionMenu(agent.id)}
                                            className="text-slate-400 hover:text-[#02275A] p-1"
                                        >
                                            <i className="fas fa-ellipsis-h"></i>
                                        </button>
                                    </div>
                                </div>
                                
                                {activeActionMenu === agent.id && (
                                    <div className="absolute right-4 top-12 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-20 overflow-hidden animate-fade-in">
                                        <div className="py-1">
                                            <button 
                                                onClick={() => handleViewProfile(agent)}
                                                className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#02275A] flex items-center gap-2"
                                            >
                                                <i className="fas fa-user w-4"></i> View Profile
                                            </button>
                                            {agent.kycStatus === 'Pending' && (
                                                <button 
                                                    onClick={() => handleReviewKyc(agent)}
                                                    className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#02275A] flex items-center gap-2"
                                                >
                                                    <i className="fas fa-file-contract w-4"></i> Review KYC
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => handleAddViolation(agent.id)}
                                                className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-rose-600 flex items-center gap-2"
                                            >
                                                <i className="fas fa-exclamation-triangle w-4"></i> Add Violation
                                            </button>
                                            <button 
                                                onClick={() => handleSuspendAgent(agent.id)}
                                                className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2 border-t border-slate-50"
                                            >
                                                <i className="fas fa-ban w-4"></i> Suspend Agent
                                            </button>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                                    <div className="bg-slate-50 p-2 rounded-lg">
                                        <p className="text-slate-500 mb-1">Performance</p>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-1.5 bg-slate-200 rounded-full">
                                                <div className={`h-full rounded-full ${agent.performanceScore >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{width: `${agent.performanceScore}%`}}></div>
                                            </div>
                                            <span className="font-bold">{agent.performanceScore}%</span>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 p-2 rounded-lg">
                                        <p className="text-slate-500 mb-1">Clients</p>
                                        <p className="font-bold text-slate-800">{agent.activeBusinesses} Active <span className="text-slate-400">/ {agent.activeBusinesses + (agent.inactiveBusinesses || 0)} Total</span></p>
                                    </div>
                                    <div className="bg-slate-50 p-2 rounded-lg">
                                        <p className="text-slate-500 mb-1">Violations</p>
                                        <p className={`font-bold ${agent.violations && agent.violations > 0 ? 'text-rose-600' : 'text-slate-800'}`}>{agent.violations || 0}</p>
                                    </div>
                                    <div className="bg-slate-50 p-2 rounded-lg">
                                        <p className="text-slate-500 mb-1">KYC Status</p>
                                        <span className={`text-[10px] font-bold uppercase ${getKycStatusColor(agent.kycStatus).split(' ')[0]}`}>
                                            {agent.kycStatus}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    {agent.kycStatus === 'Pending' ? (
                                        <button 
                                            onClick={() => handleReviewKyc(agent)}
                                            className="flex-1 bg-[#02275A] text-white py-2 rounded-lg text-xs font-bold shadow-sm"
                                        >
                                            Review KYC
                                        </button>
                                    ) : (
                                        <button className="flex-1 bg-slate-100 text-[#02275A] py-2 rounded-lg text-xs font-bold">
                                            Manage Agent
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex justify-between items-center mt-4 px-2">
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-50"
                            >
                                Previous
                            </button>
                            <span className="text-xs text-slate-500">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            ) : activeTab === 'zones' ? (
                /* Zones Management View */
                <div className="space-y-6 animate-fade-in">
                    <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                        <div>
                            <h3 className="font-bold text-slate-800">Operational Zones</h3>
                            <p className="text-xs text-slate-500">Create and manage zones for your agents.</p>
                        </div>
                        <button 
                            onClick={() => setShowZoneModal(true)}
                            className="bg-[#02275A] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-[#02275A]/90"
                        >
                            <i className="fas fa-plus mr-2"></i> Create Zone
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {zones.map(zone => (
                            <div key={zone.id} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#02275A]">
                                        <i className="fas fa-map-marked-alt text-lg"></i>
                                    </div>
                                    <button className="text-slate-400 hover:text-[#02275A]">
                                        <i className="fas fa-ellipsis-v"></i>
                                    </button>
                                </div>
                                <h3 className="font-bold text-lg text-slate-800 mb-1">{zone.name}</h3>
                                <p className="text-xs text-slate-500 mb-4 h-10 line-clamp-2">{zone.description}</p>
                                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                    <span className="text-xs font-bold text-slate-600">
                                        <i className="fas fa-users mr-1 text-slate-400"></i> {zone.agentCount} Agents
                                    </span>
                                    <button className="text-xs font-bold text-[#02275A] hover:underline">View Details</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                /* Customers Table */
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-100 text-xs text-slate-500 uppercase">
                                <tr>
                                    <th className="p-4 w-10">
                                        <input 
                                            type="checkbox" 
                                            className="rounded border-slate-300 text-[#02275A] focus:ring-[#02275A]"
                                            checked={selectedCustomerIds.length === filteredCustomers.length && filteredCustomers.length > 0}
                                            onChange={toggleSelectAllCustomers}
                                        />
                                    </th>
                                    <th className="p-4 font-bold">Business Details</th>
                                    <th className="p-4 font-bold">Plan</th>
                                    <th className="p-4 font-bold">Status</th>
                                    <th className="p-4 font-bold">Assigned Agent</th>
                                    <th className="p-4 font-bold">Joined Date</th>
                                    <th className="p-4 font-bold text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredCustomers.map(customer => (
                                    <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4">
                                            <input 
                                                type="checkbox" 
                                                className="rounded border-slate-300 text-[#02275A] focus:ring-[#02275A]"
                                                checked={selectedCustomerIds.includes(customer.id)}
                                                onChange={() => toggleCustomerSelection(customer.id)}
                                            />
                                        </td>
                                        <td className="p-4">
                                            <div>
                                                <p className="font-bold text-slate-800">{customer.businessName}</p>
                                                <p className="text-xs text-slate-500">{customer.ownerName}</p>
                                                <p className="text-[10px] text-slate-400">{customer.phone}</p>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${
                                                customer.plan === 'Pro Plan' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                                customer.plan === 'Enterprise' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                'bg-slate-50 text-slate-600 border-slate-100'
                                            }`}>
                                                {customer.plan}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusColor(customer.status)}`}>
                                                {customer.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                                    {customer.assignedAgentName.charAt(0)}
                                                </div>
                                                <span className="text-sm text-slate-700">{customer.assignedAgentName}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-xs text-slate-500">
                                            {new Date(customer.dateJoined).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right relative">
                                            <button 
                                                onClick={() => toggleCustomerActionMenu(customer.id)}
                                                className="text-slate-400 hover:text-[#02275A] transition-colors p-2 rounded-full hover:bg-slate-100"
                                            >
                                                <i className="fas fa-ellipsis-v"></i>
                                            </button>
                                            {activeCustomerActionMenu === customer.id && (
                                                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-20 overflow-hidden animate-fade-in">
                                                    <div className="py-1">
                                                        <button 
                                                            onClick={() => handleSingleRemap(customer)}
                                                            className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#02275A] flex items-center gap-2"
                                                        >
                                                            <i className="fas fa-exchange-alt w-4"></i> Remap Agent
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* KYC Modal */}
            {selectedAgent && (
                <ManagerAgentKycModal 
                    agent={selectedAgent}
                    isOpen={isKycModalOpen}
                    onClose={() => {
                        setIsKycModalOpen(false);
                        setSelectedAgent(null);
                    }}
                    onApprove={handleApproveKyc}
                    onReject={handleRejectKyc}
                />
            )}

            {/* Create Zone Modal */}
            {showZoneModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-800">Create New Zone</h3>
                            <button onClick={() => setShowZoneModal(false)} className="text-slate-400 hover:text-slate-600">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Zone Name</label>
                                <input 
                                    type="text" 
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#02275A]"
                                    placeholder="e.g. Lagos Mainland"
                                    value={newZoneData.name}
                                    onChange={(e) => setNewZoneData({...newZoneData, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Description</label>
                                <textarea 
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#02275A]"
                                    placeholder="Describe the area covered..."
                                    rows={3}
                                    value={newZoneData.description}
                                    onChange={(e) => setNewZoneData({...newZoneData, description: e.target.value})}
                                ></textarea>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button 
                                    onClick={() => setShowZoneModal(false)}
                                    className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleCreateZone}
                                    className="flex-1 px-4 py-2.5 bg-[#02275A] text-white rounded-xl text-sm font-bold hover:bg-[#02275A]/90 transition-colors shadow-lg shadow-blue-900/20"
                                >
                                    Create Zone
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Assign Zone Modal */}
            {showAssignZoneModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-800">Assign Agent to Zone</h3>
                            <button onClick={() => setShowAssignZoneModal(false)} className="text-slate-400 hover:text-slate-600">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-slate-600">Select a zone to assign to this agent.</p>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Select Zone</label>
                                <select 
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#02275A]"
                                    value={selectedZoneId}
                                    onChange={(e) => setSelectedZoneId(e.target.value)}
                                >
                                    <option value="">Select Zone...</option>
                                    {zones.map(zone => (
                                        <option key={zone.id} value={zone.id}>{zone.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button 
                                    onClick={() => setShowAssignZoneModal(false)}
                                    className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleAssignZone}
                                    className="flex-1 px-4 py-2.5 bg-[#02275A] text-white rounded-xl text-sm font-bold hover:bg-[#02275A]/90 transition-colors shadow-lg shadow-blue-900/20"
                                >
                                    Assign Zone
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Remap Modal */}
            {showRemapModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-800">
                                {remapTarget === 'single' ? 'Remap Customer' : 'Bulk Remap Customers'}
                            </h3>
                            <button onClick={() => setShowRemapModal(false)} className="text-slate-400 hover:text-slate-600">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-slate-600 mb-4">
                                {remapTarget === 'single' 
                                    ? `Select a new agent for ${customerToRemap?.businessName}.` 
                                    : `Select a new agent for the ${selectedCustomerIds.length} selected customers.`}
                            </p>
                            
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">New Agent</label>
                                <select 
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#02275A] transition-colors"
                                    value={selectedNewAgentId}
                                    onChange={(e) => setSelectedNewAgentId(e.target.value)}
                                >
                                    <option value="">Select Agent...</option>
                                    {agents.filter(a => a.status === 'Active').map(agent => (
                                        <option key={agent.id} value={agent.id}>{agent.name} ({agent.activeBusinesses} clients)</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button 
                                    onClick={() => setShowRemapModal(false)}
                                    className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={confirmRemap}
                                    className="flex-1 px-4 py-2.5 bg-[#02275A] text-white rounded-xl text-sm font-bold hover:bg-[#02275A]/90 transition-colors shadow-lg shadow-blue-900/20"
                                >
                                    Confirm Remap
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagerAgentsView;
