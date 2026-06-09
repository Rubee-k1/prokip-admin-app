import React, { useState } from 'react';
import { useAlert } from '../contexts/AlertContext';

interface Commission {
    id: string;
    agent: string;
    role: 'Agent' | 'Manager'; // Added
    business: string; // Added
    amount: string;
    status: 'Pending' | 'Approved' | 'Rejected' | 'Paid';
    date: string;
    type: string;
    detail: string; // Added
    ref: string; // Added
    invoiceId?: string;
}

interface InvoiceItem {
    description: string;
    quantity: number;
    price: number;
    type: 'Plan' | 'Addon' | 'Service'; // Added type for logic
}

interface PendingInvoice {
    id: string;
    agentName: string;
    role: 'Agent' | 'Manager'; // Added
    recipientName: string;
    amount: number;
    date: string;
    status: 'Unpaid' | 'Pending';
    items: InvoiceItem[];
}

const AdminCommissionsView: React.FC = () => {
    const { showSuccess } = useAlert();
    const [activeTab, setActiveTab] = useState<'commissions' | 'invoices' | 'wallet'>('commissions');
    
    // Mock Data
    const [commissions, setCommissions] = useState<Commission[]>([
        { id: '1', agent: 'Sarah O.', role: 'Agent', business: 'Okafor Hardware', amount: '₦150,000', status: 'Pending', date: 'Oct 25, 2023', type: 'New Sale', detail: 'Premium Plan', ref: 'TXN-001', invoiceId: 'INV-1001' },
        { id: '2', agent: 'John D.', role: 'Manager', business: 'N/A', amount: '₦50,000', status: 'Approved', date: 'Oct 24, 2023', type: 'Bonus', detail: 'Performance Bonus', ref: 'TXN-002' },
        { id: '3', agent: 'Mike T.', role: 'Agent', business: 'City Pharmacy', amount: '₦25,000', status: 'Rejected', date: 'Oct 23, 2023', type: 'Renewal', detail: 'Standard Plan', ref: 'TXN-003', invoiceId: 'INV-1003' },
        { id: '4', agent: 'Sarah O.', role: 'Agent', business: 'Lagos Logistics', amount: '₦15,000', status: 'Approved', date: 'Oct 22, 2023', type: 'Add-on', detail: 'Extra Users (3)', ref: 'TXN-004' },
        { id: '5', agent: 'David K.', role: 'Manager', business: 'Kano Fabrics', amount: '₦30,000', status: 'Pending', date: 'Oct 21, 2023', type: 'Upgrade', detail: 'Standard → Premium', ref: 'TXN-005' },
        { id: '6', agent: 'Mike T.', role: 'Agent', business: 'Abuja Wares', amount: '₦25,000', status: 'Approved', date: 'Oct 20, 2023', type: 'Module', detail: 'Expiry Management', ref: 'TXN-006' },
    ]);

    const [pendingInvoices, setPendingInvoices] = useState<PendingInvoice[]>([
        { 
            id: 'INV-2024-001', 
            agentName: 'Sarah O.', 
            role: 'Agent',
            recipientName: 'Lagos Logistics', 
            amount: 500000, 
            date: '2023-10-26', 
            status: 'Unpaid',
            items: [
                { description: 'Annual Subscription - Premium', quantity: 1, price: 450000, type: 'Plan' },
                { description: 'Setup & Training Fee', quantity: 1, price: 50000, type: 'Service' }
            ]
        },
        { 
            id: 'INV-2024-002', 
            agentName: 'David K.', 
            role: 'Manager',
            recipientName: 'Kano Fabrics', 
            amount: 120000, 
            date: '2023-10-27', 
            status: 'Pending',
            items: [
                { description: 'Standard Plan (6 Months)', quantity: 1, price: 120000, type: 'Plan' }
            ]
        },
        { 
            id: 'INV-2024-005', 
            agentName: 'Sarah O.', 
            role: 'Agent',
            recipientName: 'Abuja Wares', 
            amount: 75000, 
            date: '2023-10-28', 
            status: 'Unpaid',
            items: [
                { description: 'Extra Location Add-on', quantity: 5, price: 15000, type: 'Addon' },
                { description: 'Onsite Support', quantity: 1, price: 60000, type: 'Service' } // 15k + 60k = 75k
            ]
        }
    ]);

    interface WalletTransaction {
        id: string;
        user: string;
        role: 'Agent' | 'Manager';
        type: 'Credit' | 'Debit';
        amount: string;
        description: string;
        date: string;
        status: 'Completed' | 'Pending' | 'Failed';
        ref: string;
    }

    const [walletTransactions] = useState<WalletTransaction[]>([
        { id: 'WT-1', user: 'Sarah O.', role: 'Agent', type: 'Credit', amount: '₦150,000', description: 'Commission payout for Premium Plan (Lagos Logistics)', date: 'Oct 25, 2023', status: 'Completed', ref: 'MNFY-WT001' },
        { id: 'WT-2', user: 'John D.', role: 'Manager', type: 'Debit', amount: '₦50,000', description: 'Bank Withdrawal', date: 'Oct 24, 2023', status: 'Completed', ref: 'MNFY-WT002' },
        { id: 'WT-3', user: 'Mike T.', role: 'Agent', type: 'Debit', amount: '₦20,000', description: 'Bank Withdrawal', date: 'Oct 22, 2023', status: 'Pending', ref: 'MNFY-WT003' },
        { id: 'WT-4', user: 'David K.', role: 'Manager', type: 'Credit', amount: '₦45,000', description: 'Manager Override Bonus', date: 'Oct 21, 2023', status: 'Completed', ref: 'MNFY-WT004' }
    ]);

    // Modal States
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
    
    // Form States
    const [newCommission, setNewCommission] = useState({ 
        agent: '', 
        business: '',
        amount: '', 
        type: 'Sales', 
        detail: '',
        date: new Date().toISOString().split('T')[0],
        paymentStatus: 'Pending' as 'Pending' | 'Approved' | 'Rejected' | 'Paid',
        applyBonus: false
    });
    const [selectedInvoice, setSelectedInvoice] = useState<PendingInvoice | null>(null);
    const [approvalNote, setApprovalNote] = useState('');
    
    // Editable Commission Rates (Percentage)
    const [planRate, setPlanRate] = useState(10);
    const [serviceRate, setServiceRate] = useState(100);

    // Filters
    const [statusFilter, setStatusFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');
    const [dateFilter, setDateFilter] = useState('All Time');
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    
    // Country / Region Toggle
    const [selectedCountry, setSelectedCountry] = useState('Nigeria');
    
    // Configuration Map
    const regionConfig = {
        'Nigeria': { provider: 'Monnify System Wallet', currency: '₦', balance: 15200000, color: 'bg-[#02275A]' },
        'Ghana': { provider: 'Flutterwave Ghana', currency: 'GH₵', balance: 105000, color: 'bg-amber-600' },
        'Kenya': { provider: 'Flutterwave Kenya', currency: 'KSh', balance: 850000, color: 'bg-rose-600' },
        'Rwanda': { provider: 'Flutterwave Rwanda', currency: 'RWF', balance: 4500000, color: 'bg-emerald-600' }
    };
    const currentRegion = regionConfig[selectedCountry as keyof typeof regionConfig];

    // Handlers
    const handleApproveCommission = (id: string) => {
        setCommissions(commissions.map(c => c.id === id ? { ...c, status: 'Approved' } : c));
        showSuccess('Commission approved successfully.');
    };

    const handleRejectCommission = (id: string) => {
        setCommissions(commissions.map(c => c.id === id ? { ...c, status: 'Rejected' } : c));
        showSuccess('Commission rejected.');
    };

    const handleAddManualCommission = (e: React.FormEvent) => {
        e.preventDefault();
        
        let finalAmount = parseInt(newCommission.amount);
        if (newCommission.applyBonus) {
            finalAmount += finalAmount * 0.1; // Example 10% bonus
        }

        const commission: Commission = {
            id: Date.now().toString(),
            agent: newCommission.agent,
            role: 'Agent', // Defaulting to Agent for manual entry
            business: newCommission.business || 'Manual Entry',
            amount: `₦${finalAmount.toLocaleString()}`,
            status: newCommission.paymentStatus,
            date: newCommission.date,
            type: newCommission.type,
            detail: newCommission.detail || 'Manual Adjustment',
            ref: `MAN-${Date.now().toString().slice(-4)}`
        };
        setCommissions([commission, ...commissions]);
        showSuccess('Manual commission added successfully.');
        setIsManualModalOpen(false);
        setNewCommission({ 
            agent: '', 
            business: '',
            amount: '', 
            type: 'Sales', 
            detail: '',
            date: new Date().toISOString().split('T')[0],
            paymentStatus: 'Pending',
            applyBonus: false
        });
    };

    const openApprovalModal = (invoice: PendingInvoice) => {
        setSelectedInvoice(invoice);
        setApprovalNote('');
        setPlanRate(10); // Reset to default
        setServiceRate(100); // Reset to default
        setIsApprovalModalOpen(true);
    };

    const calculateCommission = (invoice: PendingInvoice) => {
        let planComm = 0;
        let serviceComm = 0;

        invoice.items.forEach(item => {
            if (item.type === 'Plan' || item.type === 'Addon') {
                planComm += item.price * (planRate / 100);
            } else if (item.type === 'Service') {
                serviceComm += item.price * (serviceRate / 100);
            }
        });

        return { planComm, serviceComm, total: planComm + serviceComm };
    };

    const handleApproveInvoice = () => {
        if (!selectedInvoice) return;

        const { total } = calculateCommission(selectedInvoice);
        
        // 1. Create Commission Record
        const newComm: Commission = {
            id: `COMM-${Date.now()}`,
            agent: selectedInvoice.agentName,
            role: selectedInvoice.role,
            business: selectedInvoice.recipientName,
            amount: `₦${total.toLocaleString()}`,
            status: 'Approved',
            date: new Date().toISOString().split('T')[0],
            type: 'Invoice Payment',
            detail: `Comm. for Invoice #${selectedInvoice.id}`,
            ref: `TXN-${Date.now().toString().slice(-6)}`,
            invoiceId: selectedInvoice.id
        };

        setCommissions([newComm, ...commissions]);

        // 2. Remove from Pending Invoices (simulate status change to Paid)
        setPendingInvoices(pendingInvoices.filter(inv => inv.id !== selectedInvoice.id));

        showSuccess(`Invoice #${selectedInvoice.id} approved. Commission of ₦${total.toLocaleString()} added for ${selectedInvoice.agentName}.`);
        setIsApprovalModalOpen(false);
        setSelectedInvoice(null);
        setActiveTab('commissions'); // Switch to view the new commission
    };

    // Filter Logic
    const filteredCommissions = commissions.filter(comm => {
        const matchesStatus = statusFilter === 'All' || comm.status === statusFilter;
        const matchesType = typeFilter === 'All' || comm.type === typeFilter;
        const matchesRole = roleFilter === 'All' || comm.role === roleFilter;
        // Mock date filtering logic for simplicity
        const matchesDate = dateFilter === 'All Time' ? true : true; 
        const matchesSearch = comm.agent.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              comm.business.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              comm.ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              comm.detail.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesType && matchesRole && matchesDate && matchesSearch;
    });

    const filteredInvoices = pendingInvoices.filter(inv => {
        const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
        const matchesRole = roleFilter === 'All' || inv.role === roleFilter;
        const matchesSearch = inv.agentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              inv.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              inv.id.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesRole && matchesSearch;
    });

    const filteredWalletTransactions = walletTransactions.filter(txn => {
        const matchesStatus = statusFilter === 'All' || txn.status === statusFilter;
        const matchesType = typeFilter === 'All' ? true : typeFilter === 'Credit' ? txn.type === 'Credit' : typeFilter === 'Debit' ? txn.type === 'Debit' : true;
        const matchesRole = roleFilter === 'All' || txn.role === roleFilter;
        const matchesSearch = txn.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              txn.ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              txn.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesType && matchesRole && matchesSearch;
    });

    // Summary Stats
    const parseAmount = (amt: string) => parseInt(amt.replace(/[^0-9]/g, '') || '0', 10);
    const totalPaidAmount = commissions.filter(c => c.status === 'Approved' || c.status === 'Paid').reduce((acc, curr) => acc + parseAmount(curr.amount), 0);
    
    // For mock purposes, using proportional math to simulate "this week/month" if not enough data
    const totalPendingAmount = commissions.filter(c => c.status === 'Pending').reduce((acc, curr) => acc + parseAmount(curr.amount), 0);
    const paidThisMonth = Math.max(totalPaidAmount * 0.8, 450000); // Simulated month data
    const pendingThisWeek = totalPendingAmount; // Simulated week data

    // Mock balances 
    const totalAgentsBalance = 8450000;
    const totalManagersBalance = 1250000;
    const monnifyWalletBalance = 15200000; // Mock Monnify Wallet Balance

    return (
        <div className="p-6 animate-fade-in space-y-6 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Commission & Wallet Management</h1>
                    <p className="text-sm text-slate-500">Oversee commissions, approve invoices, and manage wallet payouts.</p>
                </div>
                <div className="flex gap-2">
                    <select
                        className="bg-white border border-slate-200 text-slate-700 px-3 py-2 rounded-lg text-sm font-bold shadow-sm focus:outline-none focus:border-[#02275A]"
                        value={selectedCountry}
                        onChange={(e) => setSelectedCountry(e.target.value)}
                    >
                        <option value="Nigeria">🇳🇬 Nigeria</option>
                        <option value="Ghana">🇬🇭 Ghana</option>
                        <option value="Kenya">🇰🇪 Kenya</option>
                        <option value="Rwanda">🇷🇼 Rwanda</option>
                    </select>
                     <button 
                        onClick={() => setIsManualModalOpen(true)}
                        className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors flex items-center gap-2"
                    >
                        <i className="fas fa-plus"></i> Manual Entry
                    </button>
                </div>
            </div>

            {/* Balances Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Dynamic System Wallet Balance */}
                <div className={`${currentRegion.color} p-4 rounded-xl shadow-md flex flex-col justify-center text-white relative overflow-hidden transition-colors`}>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-2">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/80 text-sm">
                                <i className="fas fa-wallet"></i>
                            </div>
                            <span className="text-[10px] font-bold text-slate-900 bg-white/90 px-2 py-0.5 rounded-full">Liquidity</span>
                        </div>
                        <p className="text-[11px] text-white/80 font-bold uppercase tracking-wider mb-1">{currentRegion.provider}</p>
                        <h3 className="text-2xl font-extrabold text-white">{currentRegion.currency}{currentRegion.balance.toLocaleString()}</h3>
                    </div>
                </div>

                {/* 2. Agents Balances */}
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center">
                    <div className="flex justify-between items-start mb-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 text-sm">
                            <i className="fas fa-users"></i>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">Total Outstanding</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1">Agents Balance</p>
                    <h3 className="text-2xl font-extrabold text-slate-800">₦{totalAgentsBalance.toLocaleString()}</h3>
                </div>

                {/* 3. Managers Balances */}
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center">
                    <div className="flex justify-between items-start mb-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 text-sm">
                            <i className="fas fa-user-tie"></i>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">Total Outstanding</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1">Managers Balance</p>
                    <h3 className="text-2xl font-extrabold text-slate-800">₦{totalManagersBalance.toLocaleString()}</h3>
                </div>
            </div>

            {/* Commission Flow Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Pending This Week */}
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center">
                    <div className="flex justify-between items-start mb-2">
                        <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 text-sm">
                            <i className="fas fa-clock"></i>
                        </div>
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">This Week</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1">Pending Comm.</p>
                    <h3 className="text-xl font-extrabold text-slate-800">₦{pendingThisWeek.toLocaleString()}</h3>
                </div>

                {/* 2. Paid This Month */}
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center">
                    <div className="flex justify-between items-start mb-2">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 text-sm">
                            <i className="fas fa-calendar-check"></i>
                        </div>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">This Month</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1">Paid Comm.</p>
                    <h3 className="text-xl font-extrabold text-slate-800">₦{paidThisMonth.toLocaleString()}</h3>
                </div>

                {/* 3. Total Paid */}
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center">
                    <div className="flex justify-between items-start mb-2">
                        <div className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 text-sm">
                            <i className="fas fa-check-double"></i>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">All Time</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1">Total Paid</p>
                    <h3 className="text-xl font-extrabold text-slate-800">₦{totalPaidAmount.toLocaleString()}</h3>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 justify-between items-center">
                <div className="flex">
                    <button 
                        onClick={() => setActiveTab('commissions')}
                        className={`px-6 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'commissions' ? 'border-[#02275A] text-[#02275A]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        Commissions History
                    </button>
                    <button 
                        onClick={() => setActiveTab('invoices')}
                        className={`px-6 py-3 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${activeTab === 'invoices' ? 'border-[#02275A] text-[#02275A]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        Pending Invoices
                        {pendingInvoices.length > 0 && (
                            <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full">{pendingInvoices.length}</span>
                        )}
                    </button>
                    <button 
                        onClick={() => setActiveTab('wallet')}
                        className={`px-6 py-3 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${activeTab === 'wallet' ? 'border-[#02275A] text-[#02275A]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        Wallet Transactions
                    </button>
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-1 mt-2 sm:mt-0 flex-wrap sm:flex-nowrap justify-end items-center">
                    <div className="relative">
                        <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                        <input
                            type="text"
                            placeholder="Advance Search..."
                            className="bg-white border border-slate-200 text-xs rounded-lg pl-8 pr-3 py-1.5 outline-none focus:border-[#02275A] w-full sm:w-48 shadow-sm transition-shadow"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    {/* Role Filter Applicable to All Tabs */}
                    <select 
                        className="bg-white border border-slate-200 text-xs rounded-lg px-2 py-1.5 outline-none focus:border-[#02275A] shadow-sm"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="All">All Roles</option>
                        <option value="Agent">Agents Only</option>
                        <option value="Manager">Managers Only</option>
                    </select>
                    {activeTab === 'commissions' && (
                        <select 
                            className="bg-white border border-slate-200 text-xs rounded-lg px-2 py-1.5 outline-none focus:border-[#02275A] shadow-sm"
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                        >
                            <option value="All">All Types</option>
                            <option value="New Sale">New Sale</option>
                            <option value="Renewal">Renewal</option>
                            <option value="Upgrade">Upgrade</option>
                            <option value="Add-on">Add-on</option>
                            <option value="Module">Module</option>
                            <option value="Bonus">Bonus</option>
                        </select>
                    )}
                    {activeTab === 'wallet' && (
                        <select 
                            className="bg-white border border-slate-200 text-xs rounded-lg px-2 py-1.5 outline-none focus:border-[#02275A] shadow-sm"
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                        >
                            <option value="All">All Flow</option>
                            <option value="Credit">Credits</option>
                            <option value="Debit">Debits</option>
                        </select>
                    )}
                    {(activeTab === 'commissions' || activeTab === 'wallet' || activeTab === 'invoices') && (
                        <select 
                            className="bg-white border border-slate-200 text-xs rounded-lg px-2 py-1.5 outline-none focus:border-[#02275A] shadow-sm"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="All">All Status</option>
                            {activeTab === 'invoices' ? (
                                <>
                                    <option value="Pending">Pending</option>
                                    <option value="Unpaid">Unpaid</option>
                                </>
                            ) : activeTab === 'wallet' ? (
                                <>
                                    <option value="Completed">Completed</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Failed">Failed</option>
                                </>
                            ) : (
                                <>
                                    <option value="Approved">Approved</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Rejected">Rejected</option>
                                    <option value="Paid">Paid</option>
                                </>
                            )}
                        </select>
                    )}
                    <select 
                        className="bg-white border border-slate-200 text-xs rounded-lg px-2 py-1.5 outline-none focus:border-[#02275A] shadow-sm"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                    >
                        <option>All Time</option>
                        <option>This Month</option>
                        <option>Last Month</option>
                    </select>
                </div>
            </div>

            {/* --- COMMISSIONS TAB --- */}
            {activeTab === 'commissions' && (
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden animate-fade-in">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500 font-bold tracking-wider">
                                    <th className="p-4">User</th>
                                    <th className="p-4">Role</th>
                                    <th className="p-4">Business</th>
                                    <th className="p-4">Type / Detail</th>
                                    <th className="p-4">Amount</th>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Ref No</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredCommissions.map(comm => (
                                    <tr key={comm.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="p-4 font-bold text-slate-800">{comm.agent}</td>
                                        <td className="p-4">
                                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                                                comm.role === 'Manager' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                                            }`}>
                                                {comm.role}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-slate-600">{comm.business}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                                                    comm.type === 'New Sale' ? 'bg-blue-100 text-blue-700' :
                                                    comm.type === 'Renewal' ? 'bg-purple-100 text-purple-700' :
                                                    comm.type === 'Upgrade' ? 'bg-indigo-100 text-indigo-700' :
                                                    comm.type === 'Add-on' ? 'bg-pink-100 text-pink-700' :
                                                    comm.type === 'Bonus' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-slate-100 text-slate-700'
                                                }`}>
                                                    {comm.type}
                                                </span>
                                            </div>
                                            <div className="text-xs text-slate-500 font-medium">{comm.detail}</div>
                                        </td>
                                        <td className="p-4 text-emerald-600 font-bold">{comm.amount}</td>
                                        <td className="p-4 text-sm text-slate-500">{comm.date}</td>
                                        <td className="p-4 text-xs font-mono text-slate-400">{comm.ref}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit ${
                                                comm.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' :
                                                comm.status === 'Pending' ? 'bg-amber-50 text-amber-600' :
                                                'bg-rose-50 text-rose-600'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${
                                                    comm.status === 'Approved' ? 'bg-emerald-500' :
                                                    comm.status === 'Pending' ? 'bg-amber-500' :
                                                    'bg-rose-500'
                                                }`}></span>
                                                {comm.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            {comm.status === 'Pending' && (
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={() => handleApproveCommission(comm.id)}
                                                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                        title="Approve"
                                                    >
                                                        <i className="fas fa-check"></i>
                                                    </button>
                                                    <button 
                                                        onClick={() => handleRejectCommission(comm.id)}
                                                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                        title="Reject"
                                                    >
                                                        <i className="fas fa-times"></i>
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {filteredCommissions.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="p-8 text-center text-slate-500 italic">No commissions found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* --- PENDING INVOICES TAB --- */}
            {activeTab === 'invoices' && (
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden animate-fade-in">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500 font-bold tracking-wider">
                                    <th className="p-4">Invoice ID</th>
                                    <th className="p-4">User</th>
                                    <th className="p-4">Role</th>
                                    <th className="p-4">Recipient</th>
                                    <th className="p-4">Items</th>
                                    <th className="p-4">Total Amount</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredInvoices.map(inv => (
                                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 text-xs font-mono text-slate-500">{inv.id}</td>
                                        <td className="p-4 font-bold text-slate-800">{inv.agentName}</td>
                                        <td className="p-4">
                                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                                                inv.role === 'Manager' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                                            }`}>
                                                {inv.role}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-slate-600">{inv.recipientName}</td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1">
                                                {inv.items.slice(0, 2).map((item, idx) => (
                                                    <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded w-fit truncate max-w-[150px] flex items-center gap-1">
                                                        {item.description}
                                                        <span className={`w-1.5 h-1.5 rounded-full ${
                                                            item.type === 'Plan' ? 'bg-blue-400' :
                                                            item.type === 'Addon' ? 'bg-purple-400' : 'bg-amber-400'
                                                        }`}></span>
                                                    </span>
                                                ))}
                                                {inv.items.length > 2 && <span className="text-[10px] text-slate-400">+{inv.items.length - 2} more</span>}
                                            </div>
                                        </td>
                                        <td className="p-4 font-bold text-slate-800">₦{inv.amount.toLocaleString()}</td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button 
                                                onClick={() => openApprovalModal(inv)}
                                                className="bg-[#02275A] text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow hover:bg-[#02275A]/90 transition-colors"
                                            >
                                                Approve & Pay
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredInvoices.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-slate-500 italic">No pending invoices found matching your criteria.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* --- WALLET TRANSACTIONS TAB --- */}
            {activeTab === 'wallet' && (
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden animate-fade-in">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500 font-bold tracking-wider">
                                    <th className="p-4">Ref No</th>
                                    <th className="p-4">User</th>
                                    <th className="p-4">Role</th>
                                    <th className="p-4">Type</th>
                                    <th className="p-4">Description</th>
                                    <th className="p-4">Amount</th>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredWalletTransactions.map(txn => (
                                    <tr key={txn.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 text-xs font-mono text-slate-500">{txn.ref}</td>
                                        <td className="p-4 font-bold text-slate-800">{txn.user}</td>
                                        <td className="p-4">
                                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                                                txn.role === 'Manager' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                                            }`}>
                                                {txn.role}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                                                txn.type === 'Credit' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                            }`}>
                                                {txn.type}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-slate-600 truncate max-w-[200px]">{txn.description}</td>
                                        <td className={`p-4 font-bold ${txn.type === 'Credit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {txn.type === 'Credit' ? '+' : '-'}{txn.amount}
                                        </td>
                                        <td className="p-4 text-sm text-slate-500">{txn.date}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                txn.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                                                txn.status === 'Failed' ? 'bg-rose-100 text-rose-700' :
                                                'bg-amber-100 text-amber-700'
                                            }`}>
                                                {txn.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {filteredWalletTransactions.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="p-8 text-center text-slate-500 italic">No wallet transactions found matching your criteria.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* --- ADD MANUAL COMMISSION MODAL --- */}
            {isManualModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl transform transition-all scale-100 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-slate-800 text-lg">Add Manual Commission</h3>
                            <button onClick={() => setIsManualModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        
                        <form onSubmit={handleAddManualCommission} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Agent Name</label>
                                    <input 
                                        type="text" 
                                        required
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#02275A] transition-colors"
                                        placeholder="e.g. Sarah O."
                                        value={newCommission.agent}
                                        onChange={e => setNewCommission({...newCommission, agent: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Business Name</label>
                                    <input 
                                        type="text" 
                                        required
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#02275A] transition-colors"
                                        placeholder="e.g. Lagos Logistics"
                                        value={newCommission.business}
                                        onChange={e => setNewCommission({...newCommission, business: e.target.value})}
                                    />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Amount (₦)</label>
                                    <input 
                                        type="number" 
                                        required
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#02275A] transition-colors"
                                        placeholder="e.g. 50000"
                                        value={newCommission.amount}
                                        onChange={e => setNewCommission({...newCommission, amount: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Date</label>
                                    <input 
                                        type="date" 
                                        required
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#02275A] transition-colors"
                                        value={newCommission.date}
                                        onChange={e => setNewCommission({...newCommission, date: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Type</label>
                                    <select 
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#02275A] transition-colors"
                                        value={newCommission.type}
                                        onChange={e => setNewCommission({...newCommission, type: e.target.value})}
                                    >
                                        <option value="Sales">Sales Commission</option>
                                        <option value="Bonus">Performance Bonus</option>
                                        <option value="Adjustment">Manual Adjustment</option>
                                        <option value="Renewal">Renewal</option>
                                        <option value="Upgrade">Upgrade</option>
                                        <option value="Add-on">Add-on</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Payment Status</label>
                                    <select 
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#02275A] transition-colors"
                                        value={newCommission.paymentStatus}
                                        onChange={e => setNewCommission({...newCommission, paymentStatus: e.target.value as 'Pending' | 'Approved' | 'Rejected' | 'Paid'})}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Approved">Approved</option>
                                        <option value="Paid">Paid</option>
                                        <option value="Rejected">Rejected</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Details / Description</label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#02275A] transition-colors"
                                    placeholder="e.g. Premium Plan Setup"
                                    value={newCommission.detail}
                                    onChange={e => setNewCommission({...newCommission, detail: e.target.value})}
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input 
                                    type="checkbox" 
                                    id="applyBonus"
                                    className="rounded border-slate-300 text-[#02275A] focus:ring-[#02275A] w-4 h-4"
                                    checked={newCommission.applyBonus}
                                    onChange={e => setNewCommission({...newCommission, applyBonus: e.target.checked})}
                                />
                                <label htmlFor="applyBonus" className="text-sm font-bold text-slate-700 cursor-pointer">
                                    Apply Performance Bonus (10%)
                                </label>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setIsManualModalOpen(false)}
                                    className="flex-1 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 py-2.5 bg-[#02275A] text-white font-bold rounded-xl hover:bg-[#02275A]/90 transition-colors shadow-lg shadow-blue-900/20"
                                >
                                    Add Commission
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- APPROVE INVOICE & PAY COMMISSION MODAL --- */}
            {isApprovalModalOpen && selectedInvoice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-0 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">Approve Invoice #{selectedInvoice.id}</h3>
                                <p className="text-xs text-slate-500">Review details and confirm commission.</p>
                            </div>
                            <button onClick={() => setIsApprovalModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-6">
                            {/* Invoice Summary */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Agent:</span>
                                    <span className="font-bold text-slate-800">{selectedInvoice.agentName}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Recipient:</span>
                                    <span className="font-bold text-slate-800">{selectedInvoice.recipientName}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Date:</span>
                                    <span className="font-bold text-slate-800">{selectedInvoice.date}</span>
                                </div>
                                <div className="border-t border-slate-200 my-2 pt-2">
                                    <p className="text-xs font-bold text-slate-500 uppercase mb-2">Items Breakdown</p>
                                    <div className="space-y-2">
                                        {selectedInvoice.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between text-xs items-center">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                                        item.type === 'Plan' ? 'bg-blue-400' :
                                                        item.type === 'Addon' ? 'bg-purple-400' : 'bg-amber-400'
                                                    }`}></span>
                                                    <span className="text-slate-600">{item.quantity}x {item.description}</span>
                                                </div>
                                                <span className="font-mono text-slate-700">₦{item.price.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                                    <span className="font-bold text-slate-700">Total Invoice Amount</span>
                                    <span className="font-extrabold text-[#02275A] text-lg">₦{selectedInvoice.amount.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Commission Calculation Breakdown */}
                            <div>
                                <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                                    <i className="fas fa-calculator text-[#02275A]"></i> Commission Breakdown
                                </h4>
                                
                                {/* Editable Rates */}
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Plan/Addon Rate (%)</label>
                                        <div className="relative">
                                            <input 
                                                type="number" 
                                                min="0"
                                                max="100"
                                                className="w-full pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-[#02275A]"
                                                value={planRate}
                                                onChange={(e) => setPlanRate(Number(e.target.value))}
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">%</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Service Rate (%)</label>
                                        <div className="relative">
                                            <input 
                                                type="number" 
                                                min="0"
                                                max="100"
                                                className="w-full pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-[#02275A]"
                                                value={serviceRate}
                                                onChange={(e) => setServiceRate(Number(e.target.value))}
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">%</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-emerald-50/50 rounded-xl border border-emerald-100 p-4 space-y-3">
                                    {(() => {
                                        const { planComm, serviceComm, total } = calculateCommission(selectedInvoice);
                                        return (
                                            <>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-slate-600">Plans & Addons ({planRate}%)</span>
                                                    <span className="font-bold text-slate-800">₦{planComm.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-slate-600">Custom Services ({serviceRate}%)</span>
                                                    <span className="font-bold text-slate-800">₦{serviceComm.toLocaleString()}</span>
                                                </div>
                                                <div className="border-t border-emerald-200 pt-2 flex justify-between items-center">
                                                    <span className="font-bold text-emerald-800">Total Commission Payout</span>
                                                    <span className="font-extrabold text-emerald-600 text-xl">₦{total.toLocaleString()}</span>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                                <p className="text-[10px] text-slate-400 mt-2 italic">
                                    * Adjust rates above to override defaults for this specific invoice.
                                </p>
                            </div>

                            {/* Note */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Approval Note (Optional)</label>
                                <textarea 
                                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#02275A] resize-none h-20"
                                    placeholder="Add a note for the agent..."
                                    value={approvalNote}
                                    onChange={(e) => setApprovalNote(e.target.value)}
                                ></textarea>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                            <button 
                                onClick={() => setIsApprovalModalOpen(false)}
                                className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleApproveInvoice}
                                className="flex-[2] py-3 bg-[#02275A] text-white font-bold rounded-xl hover:bg-[#02275A]/90 transition-colors shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
                            >
                                <i className="fas fa-check-circle"></i> Approve & Pay
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCommissionsView;
