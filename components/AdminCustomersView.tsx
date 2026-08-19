import React, { useState, useRef, useEffect } from 'react';
import { useAlert } from '../contexts/AlertContext';

interface Customer {
    id: string;
    name: string;
    owner: string;
    phone: string;
    email: string;
    category: string;
    plan: string;
    planClass: string;
    status: 'Completed' | 'Engaged' | 'Dormant' | 'Pending';
    statusClass: string;
    verified: boolean;
    agent: string;
    joinedDate: string;
}

const availableAgents = [
    { id: 'A001', name: 'Sarah O.', customersCount: 45, retentionRate: '92%', status: 'Active', specialty: 'Retail' },
    { id: 'A002', name: 'Mike T.', customersCount: 38, retentionRate: '88%', status: 'Active', specialty: 'Logistics' },
    { id: 'A003', name: 'Jessica L.', customersCount: 62, retentionRate: '95%', status: 'Active', specialty: 'FMCG' },
    { id: 'A004', name: 'David K.', customersCount: 15, retentionRate: '80%', status: 'On Leave', specialty: 'General' },
    { id: 'A005', name: 'Unassigned', customersCount: 0, retentionRate: 'N/A', status: 'Active', specialty: 'N/A' }
];

interface AdminCustomersViewProps {
    userRole?: string;
}

const AdminCustomersView: React.FC<AdminCustomersViewProps> = ({ userRole }) => {
    const { showSuccess, showError } = useAlert();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('All');
    const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
    
    // Agent filter state
    const [agentFilter, setAgentFilter] = useState('All');
    const [isAgentFilterOpen, setIsAgentFilterOpen] = useState(false);
    const [agentSearchTerm, setAgentSearchTerm] = useState('');
    const agentFilterRef = useRef<HTMLDivElement>(null);
    
    // Bulk selection state
    const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
    
    // Remap Modal state
    const [isRemapModalOpen, setIsRemapModalOpen] = useState(false);
    const [customersToRemap, setCustomersToRemap] = useState<Customer[]>([]);
    const [selectedNewAgent, setSelectedNewAgent] = useState('');
    const [remapAgentSearchTerm, setRemapAgentSearchTerm] = useState('');
    
    // Reset Password Modal state
    const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
    const [resetPasswordInput, setResetPasswordInput] = useState('');
    const [customerToReset, setCustomerToReset] = useState<Customer | null>(null);

    // Login As Modal state
    const [isLoginAsModalOpen, setIsLoginAsModalOpen] = useState(false);
    const [customerToLogin, setCustomerToLogin] = useState<Customer | null>(null);
    const [loginReason, setLoginReason] = useState('');
    const [loginDuration, setLoginDuration] = useState('30'); // minutes
    const [loginUser, setLoginUser] = useState('johndoe');

    const canLoginAsCustomer = ['admin', 'cx-head', 'support-staff'].includes(userRole || '');

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (agentFilterRef.current && !agentFilterRef.current.contains(event.target as Node)) {
                setIsAgentFilterOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const [customers, setCustomers] = useState<Customer[]>([
        { 
            id: 'BUS-001', 
            name: 'Lagos Logistics', 
            owner: 'Tunde Bakare',
            phone: '08012345678',
            email: 'info@lagoslogistics.com', 
            category: 'Logistics',
            plan: 'Premium', 
            planClass: 'bg-purple-100 text-purple-700',
            status: 'Completed', 
            statusClass: 'bg-emerald-100 text-emerald-700',
            verified: true,
            agent: 'Sarah O.',
            joinedDate: 'Oct 12, 2023'
        },
        { 
            id: 'BUS-002', 
            name: 'Kano Fabrics', 
            owner: 'Amina Yusuf',
            phone: '08098765432',
            email: 'sales@kanofabrics.com', 
            category: 'Retail',
            plan: 'Standard', 
            planClass: 'bg-blue-100 text-blue-700',
            status: 'Engaged', 
            statusClass: 'bg-blue-100 text-blue-700',
            verified: true,
            agent: 'Mike T.',
            joinedDate: 'Sep 28, 2023'
        },
        { 
            id: 'BUS-003', 
            name: 'Abuja Wares', 
            owner: 'Emeka Okonkwo',
            phone: '07055544433',
            email: 'contact@abujawares.com', 
            category: 'General Merchandise',
            plan: 'Basic', 
            planClass: 'bg-slate-100 text-slate-700',
            status: 'Dormant', 
            statusClass: 'bg-amber-100 text-amber-700',
            verified: false,
            agent: 'Jessica L.',
            joinedDate: 'Nov 05, 2023'
        },
        { 
            id: 'BUS-004', 
            name: 'Delta Grocers', 
            owner: 'Efe Warri',
            phone: '08122334455',
            email: 'efe@deltagrocers.com', 
            category: 'FMCG',
            plan: 'Standard', 
            planClass: 'bg-blue-100 text-blue-700',
            status: 'Pending', 
            statusClass: 'bg-slate-100 text-slate-600',
            verified: false,
            agent: 'Sarah O.',
            joinedDate: 'Dec 01, 2023'
        },
    ]);

    // Calculate counts
    const counts = {
        All: customers.length,
        Active: customers.filter(c => ['Completed', 'Engaged'].includes(c.status)).length,
        Inactive: customers.filter(c => c.status === 'Dormant').length,
        Pending: customers.filter(c => c.status === 'Pending').length,
    };

    const tabs = [
        { id: 'All', label: 'All Customers', count: counts.All },
        { id: 'Active', label: 'Active', count: counts.Active },
        { id: 'Inactive', label: 'Inactive / Dormant', count: counts.Inactive },
        { id: 'Pending', label: 'Pending Onboarding', count: counts.Pending },
    ];

    // Filter logic
    const filteredData = customers.filter(cust => {
        const term = searchTerm.toLowerCase();
        const matchesSearch = (
            cust.name.toLowerCase().includes(term) ||
            cust.owner.toLowerCase().includes(term) ||
            cust.id.toLowerCase().includes(term) || 
            cust.phone.includes(term) ||
            cust.agent.toLowerCase().includes(term)
        );

        let matchesTab = true;
        if (activeTab === 'Active') matchesTab = ['Completed', 'Engaged'].includes(cust.status);
        else if (activeTab === 'Inactive') matchesTab = cust.status === 'Dormant';
        else if (activeTab === 'Pending') matchesTab = cust.status === 'Pending';
        
        let matchesAgent = true;
        if (agentFilter !== 'All') {
            matchesAgent = cust.agent === agentFilter;
        }
        
        return matchesSearch && matchesTab && matchesAgent;
    });

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedCustomers(filteredData.map(c => c.id));
        } else {
            setSelectedCustomers([]);
        }
    };

    const handleSelectCustomer = (id: string) => {
        if (selectedCustomers.includes(id)) {
            setSelectedCustomers(selectedCustomers.filter(cId => cId !== id));
        } else {
            setSelectedCustomers([...selectedCustomers, id]);
        }
    };

    const handleOpenRemapModal = (customerList: Customer[]) => {
        setCustomersToRemap(customerList);
        setSelectedNewAgent('');
        setRemapAgentSearchTerm('');
        setIsRemapModalOpen(true);
        setOpenActionMenuId(null);
    };

    const handleConfirmRemap = () => {
        if (!selectedNewAgent) return;
        
        setCustomers(customers.map(c => {
            if (customersToRemap.some(ctr => ctr.id === c.id)) {
                return { ...c, agent: selectedNewAgent };
            }
            return c;
        }));
        
        showSuccess(`Successfully remapped ${customersToRemap.length} customer(s) to ${selectedNewAgent}`);
        setIsRemapModalOpen(false);
        setSelectedCustomers([]);
    };

    const handleActionClick = (action: string, customer: Customer) => {
        setOpenActionMenuId(null);
        if (action === 'status') {
            setCustomers(customers.map(c => 
                c.id === customer.id 
                ? { ...c, status: c.status === 'Dormant' ? 'Completed' : 'Dormant', statusClass: c.status === 'Dormant' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700' } 
                : c
            ));
            showSuccess(`Customer status updated for ${customer.name}`);
        } else if (action === 'agent') {
            handleOpenRemapModal([customer]);
        } else if (action === 'reset-password') {
            setCustomerToReset(customer);
            setIsResetPasswordModalOpen(true);
        } else if (action === 'login-as') {
            setCustomerToLogin(customer);
            setIsLoginAsModalOpen(true);
        } else {
            // Placeholder for other actions
            console.log(`Action: ${action} for ${customer.name}`);
        }
    };

    return (
        <div className="p-4 md:p-6 animate-fade-in space-y-6" onClick={() => setOpenActionMenuId(null)}>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Customer Management</h1>
                    <p className="text-sm text-slate-500">View and manage all registered businesses and their assigned agents.</p>
                </div>
                <button className="bg-[#02275A] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-[#02275A]/90 transition-all flex items-center gap-2">
                    <i className="fas fa-plus"></i> Add Customer
                </button>
            </div>

            {/* Search Bar */}
            <div className="w-full relative">
                <span className="absolute left-3 top-3 text-slate-400"><i className="fas fa-search"></i></span>
                <input 
                    type="text" 
                    placeholder="Search by business, owner, ID, phone, or agent..." 
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#02275A] shadow-sm transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {tabs.map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`whitespace-nowrap px-4 py-2 text-sm font-bold rounded-lg transition-all border flex items-center gap-2 ${
                            activeTab === tab.id 
                            ? 'bg-[#02275A] text-white border-[#02275A] shadow-md' 
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        <span>{tab.label}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                            activeTab === tab.id 
                            ? 'bg-white/20 text-white' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row items-center gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mr-auto w-full md:w-auto">
                    <i className="fas fa-filter"></i> Filters:
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full md:w-auto">
                    <div className="relative w-full" ref={agentFilterRef}>
                        <button 
                            onClick={() => setIsAgentFilterOpen(!isAgentFilterOpen)} 
                            className="bg-white border border-slate-200 text-slate-600 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#02275A] w-full flex justify-between items-center"
                        >
                            <span className="truncate">{agentFilter === 'All' ? 'Agent: All' : `Agent: ${agentFilter}`}</span>
                            <i className={`fas fa-chevron-down ml-2 transition-transform ${isAgentFilterOpen ? 'rotate-180' : ''}`}></i>
                        </button>
                        {isAgentFilterOpen && (
                            <div className="absolute top-full left-0 mt-1 w-full md:w-64 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden">
                                <div className="p-2 border-b border-slate-100 bg-slate-50">
                                    <div className="relative">
                                        <span className="absolute left-2.5 top-2 text-slate-400 text-xs"><i className="fas fa-search"></i></span>
                                        <input 
                                            type="text" 
                                            placeholder="Search agents..." 
                                            className="w-full text-xs pl-8 pr-2 py-2 bg-white border border-slate-200 rounded focus:outline-none focus:border-[#02275A]"
                                            value={agentSearchTerm}
                                            onChange={(e) => setAgentSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="max-h-48 overflow-y-auto">
                                    <button 
                                        onClick={() => { setAgentFilter('All'); setIsAgentFilterOpen(false); }}
                                        className="w-full text-left px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 border-b border-slate-50"
                                    >
                                        All Agents
                                    </button>
                                    {availableAgents.filter(a => a.name.toLowerCase().includes(agentSearchTerm.toLowerCase())).map(agent => (
                                        <button 
                                            key={agent.id}
                                            onClick={() => { setAgentFilter(agent.name); setIsAgentFilterOpen(false); }}
                                            className="w-full text-left px-3 py-2.5 text-xs hover:bg-slate-50 flex justify-between items-center border-b border-slate-50 last:border-0"
                                        >
                                            <span className="font-medium text-slate-700">{agent.name}</span>
                                            <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{agent.customersCount}</span>
                                        </button>
                                    ))}
                                    {availableAgents.filter(a => a.name.toLowerCase().includes(agentSearchTerm.toLowerCase())).length === 0 && (
                                        <div className="px-3 py-4 text-center text-xs text-slate-400">No agents found</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    <select className="bg-white border border-slate-200 text-slate-600 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#02275A] w-full cursor-pointer">
                        <option>Status: All</option>
                        <option>Engaged</option>
                        <option>Dormant</option>
                        <option>Pending</option>
                    </select>
                    <select className="bg-white border border-slate-200 text-slate-600 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#02275A] w-full cursor-pointer">
                        <option>Verification: All</option>
                        <option>Verified</option>
                        <option>Unverified</option>
                    </select>
                    <select className="bg-white border border-slate-200 text-slate-600 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#02275A] w-full cursor-pointer">
                        <option>Plan: All</option>
                        <option>Basic</option>
                        <option>Standard</option>
                        <option>Premium</option>
                    </select>
                </div>
            </div>

            {/* Bulk Actions */}
            {selectedCustomers.length > 0 && (
                <div className="bg-[#02275A]/5 border border-[#02275A]/20 rounded-xl p-3 flex items-center justify-between animate-fade-in">
                    <div className="flex items-center gap-3 text-sm">
                        <span className="font-bold text-[#02275A]">{selectedCustomers.length} selected</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => handleOpenRemapModal(customers.filter(c => selectedCustomers.includes(c.id)))}
                            className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm"
                        >
                            <i className="fas fa-exchange-alt text-[#02275A]"></i> Remap Agent
                        </button>
                        <button 
                            onClick={() => setSelectedCustomers([])}
                            className="text-slate-400 hover:text-slate-600 px-3 py-2 rounded-lg text-xs font-bold transition-colors"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            )}

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden min-h-[300px]">
                <div className="overflow-x-auto overflow-y-visible">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-xs text-slate-500 uppercase tracking-wider">
                                <th className="p-4 w-10">
                                    <input 
                                        type="checkbox" 
                                        className="rounded border-slate-300 text-[#02275A] focus:ring-[#02275A]"
                                        checked={selectedCustomers.length === filteredData.length && filteredData.length > 0}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th className="p-4 font-bold">Business</th>
                                <th className="p-4 font-bold">Owner</th>
                                <th className="p-4 font-bold">Assigned Agent</th>
                                <th className="p-4 font-bold">Plan</th>
                                <th className="p-4 font-bold text-center">Status</th>
                                <th className="p-4 font-bold text-center">Verified</th>
                                <th className="p-4 font-bold text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-sm">
                            {filteredData.map((cust) => (
                                <tr key={cust.id} className={`hover:bg-slate-50 transition-colors ${selectedCustomers.includes(cust.id) ? 'bg-blue-50/50' : ''}`}>
                                    <td className="p-4">
                                        <input 
                                            type="checkbox" 
                                            className="rounded border-slate-300 text-[#02275A] focus:ring-[#02275A]"
                                            checked={selectedCustomers.includes(cust.id)}
                                            onChange={() => handleSelectCustomer(cust.id)}
                                        />
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold text-slate-800">{cust.name}</div>
                                        <div className="text-xs text-slate-500">ID: #{cust.id}</div>
                                        <div className="text-[10px] text-[#02275A] mt-1">{cust.category}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-slate-700 font-medium">{cust.owner}</div>
                                        <div className="text-xs text-slate-500">{cust.phone}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                                {cust.agent.charAt(0)}
                                            </div>
                                            <span className="text-slate-700 font-medium">{cust.agent}</span>
                                        </div>
                                    </td>
                                    <td className="p-4"><span className={`${cust.planClass} px-2 py-1 rounded text-xs font-bold`}>{cust.plan}</span></td>
                                    <td className="p-4 text-center"><span className={`${cust.statusClass} px-2 py-1 rounded-full text-xs font-bold`}>{cust.status}</span></td>
                                    <td className={`p-4 text-center ${cust.verified ? 'text-emerald-500' : 'text-slate-300'}`}>
                                        <i className={`fas ${cust.verified ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                                    </td>
                                    <td className="p-4 text-right relative">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setOpenActionMenuId(openActionMenuId === cust.id ? null : cust.id); }}
                                            className="text-slate-400 hover:text-[#02275A] p-2 rounded-full hover:bg-[#02275A]/5 transition-colors"
                                        >
                                            <i className="fas fa-ellipsis-v"></i>
                                        </button>
                                        {openActionMenuId === cust.id && (
                                            <div className="absolute right-8 top-8 mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-100 z-50 overflow-hidden text-left animate-fade-in">
                                                <button onClick={(e) => { e.stopPropagation(); handleActionClick('view', cust); }} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-b border-slate-50">
                                                    <i className="fas fa-eye text-[#02275A]"></i> View Details
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); handleActionClick('status', cust); }} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2 border-b border-slate-50">
                                                    <i className="fas fa-power-off"></i> Toggle Status
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); handleActionClick('agent', cust); }} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2 border-b border-slate-50">
                                                    <i className="fas fa-exchange-alt"></i> Remap Agent
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); handleActionClick('reset-password', cust); }} className={`w-full text-left px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2 ${canLoginAsCustomer ? 'border-b border-slate-50' : ''}`}>
                                                    <i className="fas fa-key text-amber-500"></i> Reset Password
                                                </button>
                                                {canLoginAsCustomer && (
                                                    <button onClick={(e) => { e.stopPropagation(); handleActionClick('login-as', cust); }} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2 text-indigo-600 hover:text-indigo-700">
                                                        <i className="fas fa-sign-in-alt text-indigo-500"></i> Login Securely
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredData.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-slate-500">No customers found matching your search.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile List View */}
            <div className="md:hidden space-y-4">
                {filteredData.length > 0 && (
                    <div className="flex items-center gap-2 px-2 pb-2 border-b border-slate-100">
                        <input 
                            type="checkbox" 
                            className="rounded border-slate-300 text-[#02275A] focus:ring-[#02275A]"
                            checked={selectedCustomers.length === filteredData.length && filteredData.length > 0}
                            onChange={handleSelectAll}
                            id="selectAllMobile"
                        />
                        <label htmlFor="selectAllMobile" className="text-sm font-bold text-slate-600">Select All</label>
                    </div>
                )}
                {filteredData.map((cust) => (
                    <div key={cust.id} className={`bg-white p-4 rounded-xl border ${selectedCustomers.includes(cust.id) ? 'border-[#02275A] shadow-md' : 'border-slate-100 shadow-sm'} flex flex-col gap-3 relative transition-all`}>
                        <div className="flex justify-between items-start">
                            <div className="flex items-start gap-3">
                                <input 
                                    type="checkbox" 
                                    className="rounded border-slate-300 text-[#02275A] focus:ring-[#02275A] mt-1"
                                    checked={selectedCustomers.includes(cust.id)}
                                    onChange={() => handleSelectCustomer(cust.id)}
                                />
                                <div>
                                    <h3 className="font-bold text-slate-800">{cust.name}</h3>
                                    <span className="text-xs text-slate-500">ID: #{cust.id} • {cust.category}</span>
                                </div>
                            </div>
                            <div className="relative">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setOpenActionMenuId(openActionMenuId === cust.id ? null : cust.id); }}
                                    className="text-slate-400 p-2"
                                >
                                    <i className="fas fa-ellipsis-v"></i>
                                </button>
                                {openActionMenuId === cust.id && (
                                    <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden text-left">
                                        <button onClick={(e) => { e.stopPropagation(); handleActionClick('view', cust); }} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-b border-slate-50">
                                            <i className="fas fa-eye text-[#02275A]"></i> View Details
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); handleActionClick('status', cust); }} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2 border-b border-slate-50">
                                            <i className="fas fa-power-off"></i> Toggle Status
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); handleActionClick('agent', cust); }} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2 border-b border-slate-50">
                                            <i className="fas fa-exchange-alt"></i> Remap Agent
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); handleActionClick('reset-password', cust); }} className={`w-full text-left px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2 ${canLoginAsCustomer ? 'border-b border-slate-50' : ''}`}>
                                            <i className="fas fa-key text-amber-500"></i> Reset Password
                                        </button>
                                        {canLoginAsCustomer && (
                                            <button onClick={(e) => { e.stopPropagation(); handleActionClick('login-as', cust); }} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2 text-indigo-600 hover:text-indigo-700">
                                                <i className="fas fa-sign-in-alt text-indigo-500"></i> Login Securely
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-y-2 text-sm">
                            <div>
                                <p className="text-xs text-slate-400">Owner</p>
                                <p className="font-medium text-slate-700">{cust.owner}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-400">Assigned Agent</p>
                                <p className="font-medium text-slate-700">{cust.agent}</p>
                            </div>
                            <div className="flex items-center gap-1 mt-2">
                                <span className={`${cust.planClass} px-2 py-0.5 rounded text-[10px] font-bold uppercase`}>{cust.plan}</span>
                            </div>
                            <div className="text-right mt-2">
                                <span className={`${cust.statusClass} px-2 py-0.5 rounded-full text-[10px] font-bold uppercase`}>{cust.status}</span>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-slate-50 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <i className={`fas ${cust.verified ? 'fa-check-circle text-emerald-500' : 'fa-times-circle text-slate-300'}`}></i>
                                <span className="text-xs text-slate-500">{cust.verified ? 'Verified' : 'Unverified'}</span>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); handleActionClick('view', cust); }} className="text-xs font-bold text-[#02275A] bg-[#02275A]/10 px-3 py-1.5 rounded-lg">Manage</button>
                        </div>
                    </div>
                ))}
                {filteredData.length === 0 && (
                    <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-100">No customers found.</div>
                )}
            </div>

            {/* Remap Agent Modal */}
            {isRemapModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">Remap Agent</h3>
                                <p className="text-xs text-slate-500">
                                    {customersToRemap.length === 1 
                                        ? `Remapping ${customersToRemap[0].name}` 
                                        : `Remapping ${customersToRemap.length} customers`}
                                </p>
                            </div>
                            <button onClick={() => setIsRemapModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-4 overflow-y-auto">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Search & Select New Agent</label>
                                <div className="relative mb-3">
                                    <span className="absolute left-3 top-2.5 text-slate-400"><i className="fas fa-search"></i></span>
                                    <input 
                                        type="text" 
                                        placeholder="Search by name or specialty..." 
                                        className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#02275A] shadow-sm"
                                        value={remapAgentSearchTerm}
                                        onChange={(e) => setRemapAgentSearchTerm(e.target.value)}
                                    />
                                </div>
                                
                                <div className="max-h-60 overflow-y-auto border border-slate-100 rounded-xl divide-y divide-slate-50">
                                    {availableAgents.filter(a => a.name.toLowerCase().includes(remapAgentSearchTerm.toLowerCase()) || a.specialty.toLowerCase().includes(remapAgentSearchTerm.toLowerCase())).map(agent => (
                                        <div 
                                            key={agent.id} 
                                            onClick={() => setSelectedNewAgent(agent.name)}
                                            className={`p-3 cursor-pointer transition-colors flex items-center justify-between ${selectedNewAgent === agent.name ? 'bg-blue-50 border-l-4 border-[#02275A]' : 'hover:bg-slate-50 border-l-4 border-transparent'}`}
                                        >
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <div className="font-bold text-slate-800 text-sm">{agent.name}</div>
                                                    {agent.status === 'On Leave' && (
                                                        <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold uppercase">On Leave</span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-slate-500 mt-0.5">Specialty: {agent.specialty}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs font-bold text-[#02275A]">{agent.customersCount} <span className="font-normal text-slate-500">Customers</span></div>
                                                <div className="text-[10px] text-emerald-600 font-bold mt-0.5"><i className="fas fa-chart-line"></i> {agent.retentionRate} Retention</div>
                                            </div>
                                        </div>
                                    ))}
                                    {availableAgents.filter(a => a.name.toLowerCase().includes(remapAgentSearchTerm.toLowerCase()) || a.specialty.toLowerCase().includes(remapAgentSearchTerm.toLowerCase())).length === 0 && (
                                        <div className="p-6 text-center text-slate-400 text-sm">
                                            No agents found matching your search.
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                                <i className="fas fa-info-circle text-blue-500 mt-0.5"></i>
                                <div className="text-xs text-blue-800">
                                    <p className="font-bold mb-1">What happens next?</p>
                                    <p>The new agent will be notified and these customers will appear in their dashboard immediately.</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
                            <button 
                                onClick={() => setIsRemapModalOpen(false)}
                                className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleConfirmRemap}
                                disabled={!selectedNewAgent}
                                className="px-6 py-2 bg-[#02275A] text-white text-sm font-bold rounded-lg shadow-md hover:bg-[#02275A]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <i className="fas fa-exchange-alt"></i> Confirm Remapping
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Reset Password Modal */}
            {isResetPasswordModalOpen && customerToReset && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <i className="fas fa-key text-amber-500"></i> Reset Password
                            </h3>
                            <button onClick={() => { setIsResetPasswordModalOpen(false); setResetPasswordInput(''); setCustomerToReset(null); }} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <i className="fas fa-times text-lg"></i>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-slate-600">You can send a reset link to <strong>{customerToReset.email}</strong>, or manually set a new password if the customer cannot access their email.</p>
                            
                            <div className="space-y-4">
                                <button 
                                    onClick={() => {
                                        showSuccess(`Password reset link sent to ${customerToReset.email}`);
                                        setIsResetPasswordModalOpen(false);
                                        setCustomerToReset(null);
                                    }}
                                    className="w-full bg-[#02275A]/10 text-[#02275A] hover:bg-[#02275A]/20 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                                >
                                    <i className="fas fa-envelope"></i> Send Reset Link
                                </button>
                                
                                <div className="relative flex py-2 items-center">
                                    <div className="flex-grow border-t border-slate-200"></div>
                                    <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-bold uppercase">Or</span>
                                    <div className="flex-grow border-t border-slate-200"></div>
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Manually Set Password</label>
                                    <input 
                                        type="text" 
                                        value={resetPasswordInput}
                                        onChange={(e) => setResetPasswordInput(e.target.value)}
                                        placeholder="Enter desired password"
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#02275A] focus:bg-white transition-colors"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                            <button 
                                onClick={() => { setIsResetPasswordModalOpen(false); setResetPasswordInput(''); setCustomerToReset(null); }}
                                className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => {
                                    if (!resetPasswordInput) {
                                        showError('Please enter a new password');
                                        return;
                                    }
                                    showSuccess(`Password updated successfully for ${customerToReset.name}`);
                                    setIsResetPasswordModalOpen(false);
                                    setResetPasswordInput('');
                                    setCustomerToReset(null);
                                }}
                                className="px-5 py-2.5 text-sm font-bold bg-amber-500 text-white hover:bg-amber-600 rounded-xl transition-colors shadow-sm flex items-center gap-2"
                            >
                                <i className="fas fa-save"></i> Save Password
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Login As Modal */}
            {isLoginAsModalOpen && customerToLogin && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <i className="fas fa-sign-in-alt text-indigo-500"></i> Secure Access
                            </h3>
                            <button onClick={() => { setIsLoginAsModalOpen(false); setLoginReason(''); }} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <i className="fas fa-times text-lg"></i>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-sm text-orange-800">
                                <i className="fas fa-info-circle mr-2"></i>
                                You are requesting secure access to <strong>{customerToLogin.name}</strong>'s account. This action will be logged and audited. The customer will not be logged out.
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Reason for Access (Required)</label>
                                <textarea 
                                    value={loginReason}
                                    onChange={(e) => setLoginReason(e.target.value)}
                                    placeholder="Provide ticket number or brief description..."
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors min-h-[100px] resize-y"
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Username</label>
                                <select 
                                    value={loginUser}
                                    onChange={(e) => setLoginUser(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors mb-4"
                                >
                                    <option value="johndoe">johndoe</option>
                                    <option value="janesmith">janesmith</option>
                                    <option value="mike_t">mike_t</option>
                                    <option value="sarah_o">sarah_o</option>
                                    <option value="david_k">david_k</option>
                                </select>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Access Duration</label>
                                <select 
                                    value={loginDuration}
                                    onChange={(e) => setLoginDuration(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                                >
                                    <option value="15">15 Minutes</option>
                                    <option value="30">30 Minutes</option>
                                    <option value="60">1 Hour</option>
                                    <option value="120">2 Hours</option>
                                </select>
                            </div>
                        </div>
                        <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                            <button 
                                onClick={() => { setIsLoginAsModalOpen(false); setLoginReason(''); }}
                                className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => {
                                    if (!loginReason.trim()) {
                                        showError('Please provide a reason for accessing this account.');
                                        return;
                                    }
                                    showSuccess(`Secure access granted for ${customerToLogin.name}. Session will expire in ${loginDuration} minutes.`);
                                    window.open(`https://app.prokip.africa/dashboard/${loginUser}`, '_blank', 'noopener,noreferrer');
                                    setIsLoginAsModalOpen(false);
                                    setLoginReason('');
                                    setCustomerToLogin(null);
                                }}
                                className="px-5 py-2.5 text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl transition-colors shadow-sm flex items-center gap-2"
                            >
                                <i className="fas fa-lock"></i> Authorize & Login
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCustomersView;
