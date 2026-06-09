import React, { useState } from 'react';
import CreateInvoiceModal from './CreateInvoiceModal';
import GenerateProposalModal from './GenerateProposalModal';
import InvoicesView from './InvoicesView';
import NearbyLeads from './NearbyLeads';
import { Lead, Business, Invoice, Reminder, Notification, Agent } from '../types';
import { useAlert } from '../contexts/AlertContext';

interface AdminLeadsViewProps {
    setView?: (view: string) => void;
    businesses?: Business[];
    invoices?: Invoice[];
    onAddInvoice?: (inv: Invoice) => void;
    onUpdateInvoice?: (inv: Invoice) => void;
    onAddNotification?: (notification: Notification) => void;
    initialTab?: 'list' | 'invoices' | 'find';
    userCountry?: string;
}

const AdminLeadsView: React.FC<AdminLeadsViewProps> = ({ setView, businesses = [], invoices: propInvoices = [], onAddInvoice, onUpdateInvoice, onAddNotification, initialTab = 'list', userCountry = 'Nigeria' }) => {
    const { showSuccess, showInfo } = useAlert();
    const [activeTab, setActiveTab] = useState<'list' | 'invoices' | 'find'>(initialTab);
    
    // Mock Agents Data
    const [agents] = useState<Agent[]>([
        { id: 'AG-001', name: 'Sarah O.', email: 'sarah@example.com', phone: '08012345678', state: 'Lagos', status: 'Active', totalSales: '₦1,200,000', activeBusinesses: 15, lastActive: '2 mins ago', performanceScore: 92 },
        { id: 'AG-002', name: 'Emmanuel K.', email: 'emmanuel@example.com', phone: '08087654321', state: 'Lagos', status: 'Active', totalSales: '₦850,000', activeBusinesses: 8, lastActive: '1 hour ago', performanceScore: 88 },
        { id: 'AG-003', name: 'Chidinma N.', email: 'chidinma@example.com', phone: '08055566677', state: 'Lagos', status: 'Inactive', totalSales: '₦450,000', activeBusinesses: 5, lastActive: '2 days ago', performanceScore: 75 },
    ]);
    
    // Mock State Managers Data
    const [stateManagers] = useState([
        { id: 'SM-001', name: 'John D.', state: 'Lagos' },
        { id: 'SM-002', name: 'Abuja Manager', state: 'Abuja' }
    ]);

    // Lead List State
    const [activeCategory, setActiveCategory] = useState<'Personal' | 'Company'>('Personal');
    const [statusFilter, setStatusFilter] = useState('All');
    const [agentFilter, setAgentFilter] = useState('All');
    const [managerFilter, setManagerFilter] = useState('All');
    const [sortBy, setSortBy] = useState('Priority');
    
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [leadToAssign, setLeadToAssign] = useState<Lead | null>(null);
    const [newNote, setNewNote] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    
    const defaultCountryCode = userCountry === 'Ghana' ? '+233' : 
                               userCountry === 'Kenya' ? '+254' : 
                               userCountry === 'Rwanda' ? '+250' : '+234';
    const [countryCode, setCountryCode] = useState(defaultCountryCode);

    React.useEffect(() => {
        setCountryCode(defaultCountryCode);
    }, [defaultCountryCode]);
    
    // Reminder State
    const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
    const [reminderForm, setReminderForm] = useState<{
        type: 'Call' | 'Meeting' | 'Email' | 'Visit';
        date: string;
        time: string;
        note: string;
        sendEmail: boolean;
    }>({
        type: 'Call',
        date: '',
        time: '',
        note: '',
        sendEmail: true
    });

    const itemsPerPage = 5;

    // Mock Leads Data
    const [leads, setLeads] = useState<Lead[]>([
        { id: 1, name: "Mr. Okafor", business: "Okafor Hardware", type: "Personal", status: "Interested", phone: "08033344455", location: "Wuse Market", lastAction: "Call (2 days ago)", notes: [{ date: '2023-10-24', type: 'Call', text: 'Spoke about inventory module. Very interested.' }], reminders: [{ id: 'r1', type: 'Call', date: '2023-10-30', time: '14:00', note: 'Follow up on pricing', status: 'Pending' }], assignedAgentId: 'AG-001', assignedAgentName: 'Sarah O.', managerId: 'SM-001', managerName: 'John D.' },
        { id: 2, name: "Madam Sarah", business: "Sarah Salon", type: "Personal", status: "Meeting Scheduled", phone: "08022211100", location: "Garki 2", lastAction: "Visit (Yesterday)", notes: [{ date: '2023-10-20', type: 'Visit', text: 'Visited shop. Demonstrated POS.' }], reminders: [], assignedAgentId: 'AG-002', assignedAgentName: 'Emmanuel K.', managerId: 'SM-001', managerName: 'John D.' },
        { id: 3, name: "TechPoint Logistics", business: "TechPoint", type: "Company", status: "New", phone: "08199988877", location: "Central Area", lastAction: "None", notes: [], managerId: 'SM-002', managerName: 'Abuja Manager' }, // Unassigned agent
        { id: 4, name: "Bisi Cakes", business: "Bisi Bakery", type: "Personal", status: "Negotiating", phone: "07055566677", location: "Maitama", lastAction: "Email (Today)", notes: [{ date: '2023-10-25', type: 'Note', text: 'Sent pricing proposal.' }], reminders: [], assignedAgentId: 'AG-001', assignedAgentName: 'Sarah O.', managerId: 'SM-001', managerName: 'John D.' },
        { id: 5, name: "BlueChip Inc.", business: "BlueChip", type: "Company", status: "Converted", phone: "09011122233", location: "Wuse 2", lastAction: "Onboarding", notes: [{ date: '2023-10-15', type: 'System', text: 'Lead converted to paid customer.' }], reminders: [], assignedAgentId: 'AG-003', assignedAgentName: 'Chidinma N.', managerId: 'SM-001', managerName: 'John D.' },
        { id: 6, name: "Emeka Phones", business: "Emeka Phones", type: "Personal", status: "New", phone: "08012312312", location: "Banex Plaza", lastAction: "None", notes: [], managerId: 'SM-002', managerName: 'Abuja Manager' },
        { id: 7, name: "Kiddies World", business: "Kiddies World", type: "Company", status: "Interested", phone: "07098798798", location: "Gwarinpa", lastAction: "Call (1 week ago)", notes: [], assignedAgentId: 'AG-002', assignedAgentName: 'Emmanuel K.', managerId: 'SM-002', managerName: 'Abuja Manager' },
    ]);

    const [invoices, setInvoices] = useState<Invoice[]>(propInvoices);

    // Metrics
    const totalLeads = leads.length;
    const convertedCount = leads.filter(l => l.status === 'Converted').length;
    const conversionRate = totalLeads ? Math.round((convertedCount / totalLeads) * 100) : 0;
    const unassignedCount = leads.filter(l => !l.assignedAgentId).length;
    
    // Filtered Leads Logic
    const filteredLeads = leads
        .filter(l => {
            const matchesCategory = l.type === activeCategory;
            const matchesStatus = statusFilter === 'All' || l.status === statusFilter;
            const matchesAgent = agentFilter === 'All' || (agentFilter === 'Unassigned' ? !l.assignedAgentId : l.assignedAgentId === agentFilter);
            const matchesManager = managerFilter === 'All' || (managerFilter === 'Unassigned' ? !l.managerId : l.managerId === managerFilter);
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = !searchTerm || 
                l.name.toLowerCase().includes(searchLower) || 
                l.business.toLowerCase().includes(searchLower) || 
                l.phone.includes(searchLower);
            return matchesCategory && matchesSearch && matchesStatus && matchesAgent && matchesManager;
        })
        .sort((a, b) => {
            if (sortBy === 'Name') return a.name.localeCompare(b.name);
            if (sortBy === 'Newest') return b.id - a.id;
            // Priority: Hot leads first
            const aHot = ['Interested', 'Negotiating', 'Meeting Scheduled'].includes(a.status) ? 1 : 0;
            const bHot = ['Interested', 'Negotiating', 'Meeting Scheduled'].includes(b.status) ? 1 : 0;
            return bHot - aHot;
        });

    const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
    const paginatedLeads = filteredLeads.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'New': return 'bg-blue-100 text-blue-700';
            case 'Interested': return 'bg-amber-100 text-amber-700';
            case 'Meeting Scheduled': return 'bg-indigo-100 text-indigo-700';
            case 'Negotiating': return 'bg-purple-100 text-purple-700';
            case 'Converted': return 'bg-emerald-100 text-emerald-700';
            case 'Lost': return 'bg-slate-100 text-slate-500';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const handleCategoryChange = (category: 'Personal' | 'Company') => {
        setActiveCategory(category);
        setCurrentPage(1);
    };

    const handleAddNote = (type: string) => {
        if (!newNote.trim() || !selectedLead) return;
        
        const note = {
            date: new Date().toISOString().split('T')[0],
            type,
            text: newNote
        };

        const updatedLead = {
            ...selectedLead,
            notes: [note, ...(selectedLead.notes || [])],
            lastAction: `${type} (Just now)`
        };

        setSelectedLead(updatedLead);
        setLeads(leads.map(l => l.id === updatedLead.id ? updatedLead : l));
        setNewNote('');
        showSuccess('Note added successfully');
    };

    const handleAddReminder = () => {
        if (!selectedLead || !reminderForm.date || !reminderForm.time || !reminderForm.note) {
            showInfo("Please fill all reminder fields");
            return;
        }

        const newReminder: Reminder = {
            id: `r${Date.now()}`,
            type: reminderForm.type,
            date: reminderForm.date,
            time: reminderForm.time,
            note: reminderForm.note,
            status: 'Pending'
        };

        const updatedLead = {
            ...selectedLead,
            reminders: [newReminder, ...(selectedLead.reminders || [])]
        };

        setSelectedLead(updatedLead);
        setLeads(leads.map(l => l.id === updatedLead.id ? updatedLead : l));
        setIsReminderModalOpen(false);
        setReminderForm({ type: 'Call', date: '', time: '', note: '', sendEmail: true });
        showSuccess("Reminder added successfully");
    };

    const handleStatusChange = (newStatus: string) => {
        if (!selectedLead) return;
        const updatedLead = { ...selectedLead, status: newStatus };
        setSelectedLead(updatedLead);
        setLeads(leads.map(l => l.id === updatedLead.id ? updatedLead : l));
    };

    const handleAssignAgent = (agentId: string) => {
        if (!leadToAssign) return;
        const agent = agents.find(a => a.id === agentId);
        if (!agent) return;

        const updatedLeads = leads.map(l => l.id === leadToAssign.id ? { ...l, assignedAgentId: agent.id, assignedAgentName: agent.name } : l);
        setLeads(updatedLeads);
        showSuccess(`Lead assigned to ${agent.name}`);
        setIsAssignModalOpen(false);
        setLeadToAssign(null);
        if (selectedLead && selectedLead.id === leadToAssign.id) {
            setSelectedLead({ ...selectedLead, assignedAgentId: agent.id, assignedAgentName: agent.name });
        }
    };

    const handleGenerateInvoice = () => {
        setIsInvoiceModalOpen(true);
    };

    const handleGenerateProposal = () => {
        setIsProposalModalOpen(true);
    };

    const handleInvoiceCreated = (inv: Invoice) => {
        if (onAddInvoice) onAddInvoice(inv);
        setInvoices([inv, ...invoices]);
        setIsInvoiceModalOpen(false);
        setActiveTab('invoices');
    };

    const handleSaveFromNearby = (data: any | any[]) => {
        const itemsToSave = Array.isArray(data) ? data : [data];
        
        const newLeads: Lead[] = itemsToSave.map((item: any, index: number) => ({
            id: leads.length + 1 + index,
            name: item.name,
            business: item.business,
            type: item.type,
            status: item.status,
            phone: item.phone,
            location: item.location,
            lastAction: item.lastAction || 'None',
            email: item.email,
            notes: item.notes ? [{ date: new Date().toISOString().split('T')[0], type: 'System', text: item.notes }] : []
        }));

        setLeads([...newLeads, ...leads]);
        
        if (itemsToSave.length > 1) {
            showSuccess(`${itemsToSave.length} leads imported successfully.`);
        } else {
            showSuccess(`${itemsToSave[0].business} saved to leads.`);
        }
    };

    const handleCall = (e: React.MouseEvent, lead: Lead) => {
        e.stopPropagation();
        window.open(`tel:${lead.phone}`, '_self');
    };

    const handleWhatsApp = (e: React.MouseEvent, lead: Lead) => {
        e.stopPropagation();
        window.open(`https://wa.me/${lead.phone.replace('+', '')}?text=Hello, I'm reaching out from Prokip regarding...`, '_blank');
    };

    return (
        <div className="w-full mx-auto px-4 md:px-8 py-6 animate-fade-in pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">
                        {activeTab === 'list' ? 'Leads Management' : activeTab === 'find' ? 'Find Businesses' : 'Invoicing'}
                    </h2>
                    <p className="text-xs text-slate-500">
                        {activeTab === 'list' 
                            ? 'Assign and track leads for your agents.' 
                            : activeTab === 'find'
                            ? 'Discover high-value businesses and import leads.'
                            : 'Manage payment requests for leads and trials.'}
                    </p>
                </div>
                
                {/* Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto no-scrollbar max-w-full">
                    <button 
                        onClick={() => setActiveTab('list')} 
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'list' ? 'bg-white text-[#02275A] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Manage Leads
                    </button>
                    <button 
                        onClick={() => setActiveTab('find')} 
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'find' ? 'bg-white text-[#02275A] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <i className="fas fa-map-marker-alt"></i> Find Nearby
                    </button>
                    <button 
                        onClick={() => setActiveTab('invoices')} 
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'invoices' ? 'bg-white text-[#02275A] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Invoices
                        <span className="bg-[#02275A]/10 text-[#02275A] px-1.5 rounded-full text-[9px]">{invoices.length}</span>
                    </button>
                </div>
            </div>

            {/* --- LIST TAB (Manage Leads) --- */}
            {activeTab === 'list' && (
                <div className="animate-fade-in">
                    
                    {/* Metrics Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-xs text-slate-500 font-bold uppercase mb-1">Total Leads</p>
                                <h3 className="text-2xl font-extrabold text-slate-800">{totalLeads}</h3>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                <i className="fas fa-users"></i>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-xs text-slate-500 font-bold uppercase mb-1">Conversion Rate</p>
                                <h3 className="text-2xl font-extrabold text-emerald-600">{conversionRate}%</h3>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <i className="fas fa-chart-line"></i>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-xs text-slate-500 font-bold uppercase mb-1">Unassigned</p>
                                <h3 className="text-2xl font-extrabold text-rose-600">{unassignedCount}</h3>
                                <p className="text-[10px] text-slate-400">Needs agent assignment</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                                <i className="fas fa-exclamation-circle"></i>
                            </div>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="w-full relative mb-4">
                        <span className="absolute left-3 top-2.5 text-slate-400"><i className="fas fa-search"></i></span>
                        <input 
                            type="text" 
                            placeholder="Search leads by name, business, or phone..." 
                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#02275A] shadow-sm"
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        />
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        {/* Improved Filter Row */}
                        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar pb-1">
                            {/* Category Tabs */}
                            <div className="flex bg-white p-1 rounded-full border border-slate-200 shrink-0">
                                <button 
                                    onClick={() => handleCategoryChange('Personal')}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeCategory === 'Personal' ? 'bg-[#02275A] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                                >
                                    Personal
                                </button>
                                <button 
                                    onClick={() => handleCategoryChange('Company')}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeCategory === 'Company' ? 'bg-[#02275A] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                                >
                                    Company
                                </button>
                            </div>

                            {/* Agent Filter Pill */}
                            <div className="relative shrink-0">
                                <select 
                                    value={agentFilter}
                                    onChange={(e) => { setAgentFilter(e.target.value); setCurrentPage(1); }}
                                    className={`appearance-none pl-3 pr-8 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer outline-none focus:ring-2 focus:ring-[#02275A]/20 ${agentFilter !== 'All' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                                >
                                    <option value="All">Agent: All</option>
                                    <option value="Unassigned">Unassigned</option>
                                    {agents.map(a => (
                                        <option key={a.id} value={a.id}>{a.name}</option>
                                    ))}
                                </select>
                                <i className={`fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-[10px] pointer-events-none ${agentFilter !== 'All' ? 'text-white' : 'text-slate-400'}`}></i>
                            </div>

                            {/* Manager Filter Pill */}
                            <div className="relative shrink-0">
                                <select 
                                    value={managerFilter}
                                    onChange={(e) => { setManagerFilter(e.target.value); setCurrentPage(1); }}
                                    className={`appearance-none pl-3 pr-8 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer outline-none focus:ring-2 focus:ring-[#02275A]/20 ${managerFilter !== 'All' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                                >
                                    <option value="All">State Manager: All</option>
                                    <option value="Unassigned">Unassigned</option>
                                    {stateManagers.map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                                <i className={`fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-[10px] pointer-events-none ${managerFilter !== 'All' ? 'text-white' : 'text-slate-400'}`}></i>
                            </div>

                            {/* Status Filter Pill */}
                            <div className="relative shrink-0">
                                <select 
                                    value={statusFilter}
                                    onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                                    className={`appearance-none pl-3 pr-8 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer outline-none focus:ring-2 focus:ring-[#02275A]/20 ${statusFilter !== 'All' ? 'bg-[#02275A] text-white border-[#02275A]' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                                >
                                    <option value="All">Status: All</option>
                                    <option value="New">New</option>
                                    <option value="Interested">Interested</option>
                                    <option value="Meeting Scheduled">Meeting</option>
                                    <option value="Negotiating">Negotiating</option>
                                    <option value="Converted">Converted</option>
                                    <option value="Lost">Lost</option>
                                </select>
                                <i className={`fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-[10px] pointer-events-none ${statusFilter !== 'All' ? 'text-white' : 'text-slate-400'}`}></i>
                            </div>

                            {/* Sort Filter Pill */}
                            <div className="relative shrink-0">
                                <select 
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className={`appearance-none pl-3 pr-8 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer outline-none focus:ring-2 focus:ring-[#02275A]/20 ${sortBy !== 'Priority' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                                >
                                    <option value="Priority">Sort: Priority</option>
                                    <option value="Newest">Sort: Newest</option>
                                    <option value="Name">Sort: A-Z</option>
                                </select>
                                <i className={`fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-[10px] pointer-events-none ${sortBy !== 'Priority' ? 'text-white' : 'text-slate-400'}`}></i>
                            </div>
                        </div>
                        
                        <button onClick={() => setIsAddModalOpen(true)} className="bg-[#02275A] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md hover:opacity-90 transition-all active:scale-95 flex items-center gap-2 w-full md:w-auto justify-center">
                            <i className="fas fa-plus"></i> Add New Lead
                        </button>
                    </div>

                    {/* Leads List */}
                    <div className="space-y-3">
                        {paginatedLeads.map(lead => {
                            const isHot = ['Interested', 'Negotiating', 'Meeting Scheduled'].includes(lead.status);
                            const hasReminder = lead.reminders && lead.reminders.length > 0;
                            const nextReminder = hasReminder ? lead.reminders![0] : null;
                            
                            return (
                                <div key={lead.id} className={`bg-white p-4 rounded-xl border shadow-sm transition-all cursor-pointer group relative overflow-hidden ${isHot ? 'border-amber-200 bg-amber-50/10 hover:border-amber-300' : 'border-slate-100 hover:border-indigo-200'}`} onClick={() => setSelectedLead(lead)}>
                                    {isHot && (
                                        <div className="absolute top-0 right-0 bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg z-10 flex items-center gap-1">
                                            <i className="fas fa-fire"></i> Hot Lead
                                        </div>
                                    )}
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div className="flex items-start gap-3 flex-1">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${lead.type === 'Personal' ? 'bg-[#02275A]/10 text-[#02275A]' : 'bg-orange-50 text-orange-600'}`}>
                                                {lead.name.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <h3 className="font-bold text-slate-800 text-sm truncate">{lead.business}</h3>
                                                    {lead.type === 'Company' && <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 rounded">Biz</span>}
                                                </div>
                                                <p className="text-xs text-slate-500 truncate">{lead.name} • {lead.location}</p>
                                                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${getStatusColor(lead.status)}`}>{lead.status}</span>
                                                    
                                                    {lead.assignedAgentName ? (
                                                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded flex items-center gap-1 font-bold">
                                                            <i className="fas fa-user-tag text-slate-400"></i> {lead.assignedAgentName}
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] bg-rose-50 text-rose-600 px-2 py-0.5 rounded flex items-center gap-1 font-bold">
                                                            <i className="fas fa-exclamation-circle"></i> Unassigned
                                                        </span>
                                                    )}

                                                    {lead.managerName && (
                                                        <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded flex items-center gap-1 font-bold">
                                                            <i className="fas fa-user-tie"></i> {lead.managerName}
                                                        </span>
                                                    )}

                                                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                                        <i className="far fa-clock"></i> {lead.lastAction}
                                                    </span>
                                                    {hasReminder && (
                                                        <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded flex items-center gap-1 font-bold">
                                                            <i className="fas fa-bell"></i> {nextReminder?.date}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Quick Actions */}
                                        <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-50">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setLeadToAssign(lead); setIsAssignModalOpen(true); }}
                                                className="flex-1 md:flex-none px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
                                                title="Assign Agent"
                                            >
                                                <i className="fas fa-user-plus"></i> {lead.assignedAgentId ? 'Reassign' : 'Assign'}
                                            </button>
                                            <button 
                                                onClick={(e) => handleCall(e, lead)}
                                                className="flex-1 md:flex-none px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
                                                title="Call"
                                            >
                                                <i className="fas fa-phone"></i> Call
                                            </button>
                                            <button 
                                                onClick={(e) => handleWhatsApp(e, lead)}
                                                className="flex-1 md:flex-none px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
                                                title="WhatsApp"
                                            >
                                                <i className="fab fa-whatsapp"></i> Chat
                                            </button>
                                            <button 
                                                className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:text-[#02275A] hover:bg-slate-100 flex items-center justify-center transition-colors"
                                                title="View Details"
                                            >
                                                <i className="fas fa-chevron-right"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {paginatedLeads.length === 0 && (
                            <div className="text-center p-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400 text-xl">
                                    <i className="fas fa-filter"></i>
                                </div>
                                <p className="text-slate-500 text-sm font-bold">No leads found matching your criteria.</p>
                                <p className="text-slate-400 text-xs mt-1">Try adjusting your filters or search term.</p>
                                <button onClick={() => { setSearchTerm(''); setStatusFilter('All'); setAgentFilter('All'); }} className="text-[#02275A] font-bold text-xs mt-3 hover:underline">Clear Filters</button>
                            </div>
                        )}
                    </div>

                    {/* Pagination Controls */}
                    {filteredLeads.length > 0 && (
                        <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 mt-4">
                            <span>Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredLeads.length)} of {filteredLeads.length} leads</span>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Prev
                                </button>
                                <span className="px-3 py-1 bg-[#02275A]/10 rounded border border-[#02275A]/20 font-bold text-[#02275A]">Page {currentPage}</span>
                                <button 
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* --- FIND BUSINESSES TAB --- */}
            {activeTab === 'find' && (
                <NearbyLeads 
                    onSave={handleSaveFromNearby} 
                    savedPhoneNumbers={leads.map(l => l.phone)} 
                />
            )}

            {/* --- INVOICES TAB --- */}
            {activeTab === 'invoices' && (
                <div className="animate-fade-in">
                    <InvoicesView 
                        invoices={invoices} 
                        leads={leads} 
                        businesses={businesses} 
                        onAddInvoice={(inv) => { if(onAddInvoice) onAddInvoice(inv); setInvoices([inv, ...invoices]); }}
                        onUpdateInvoice={(inv) => { if(onUpdateInvoice) onUpdateInvoice(inv); }}
                        isEmbedded={true}
                        agents={agents}
                        restrictToLeads={true}
                        userCountry={userCountry}
                    />
                </div>
            )}

            {/* Assign Agent Modal */}
            {isAssignModalOpen && leadToAssign && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
                        <h3 className="font-bold text-slate-800 text-lg mb-2">Assign Lead</h3>
                        <p className="text-sm text-slate-500 mb-4">Assign <span className="font-bold text-slate-800">{leadToAssign.business}</span> to an agent.</p>
                        
                        <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
                            {agents.map(agent => (
                                <button 
                                    key={agent.id}
                                    onClick={() => handleAssignAgent(agent.id)}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${leadToAssign.assignedAgentId === agent.id ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-100 hover:border-indigo-200 hover:bg-slate-50'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                            {agent.name.charAt(0)}
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-bold text-slate-800">{agent.name}</p>
                                            <p className="text-[10px] text-slate-500">{agent.activeBusinesses} Active Clients</p>
                                        </div>
                                    </div>
                                    {leadToAssign.assignedAgentId === agent.id && <i className="fas fa-check-circle text-indigo-600"></i>}
                                </button>
                            ))}
                        </div>

                        <button 
                            onClick={() => setIsAssignModalOpen(false)}
                            className="w-full py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-200 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* LEAD DETAIL / FOLLOW UP MODAL */}
            {selectedLead && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${selectedLead.type === 'Personal' ? 'bg-[#02275A]/10 text-[#02275A]' : 'bg-orange-100 text-orange-600'}`}>
                                    {selectedLead.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">{selectedLead.business}</h3>
                                    <p className="text-xs text-slate-500">{selectedLead.name} • {selectedLead.location}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => setIsReminderModalOpen(true)}
                                    className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-colors"
                                    title="Set Reminder"
                                >
                                    <i className="fas fa-bell"></i>
                                </button>
                                <button onClick={() => setSelectedLead(null)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"><i className="fas fa-times"></i></button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Agent Assignment Info */}
                            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-xs font-bold text-indigo-800 uppercase mb-1">Assigned Agent</p>
                                        <p className="text-sm font-bold text-slate-800">{selectedLead.assignedAgentName || 'Unassigned'}</p>
                                    </div>
                                    <button 
                                        onClick={() => { setLeadToAssign(selectedLead); setIsAssignModalOpen(true); }}
                                        className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors"
                                    >
                                        {selectedLead.assignedAgentId ? 'Change' : 'Assign'}
                                    </button>
                                </div>
                            </div>

                            {/* Actions Row */}
                            <div className="flex gap-2">
                                <button 
                                    onClick={handleGenerateProposal}
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-md hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <i className="fas fa-file-signature"></i> Send Proposal
                                </button>
                                <button 
                                    onClick={handleGenerateInvoice}
                                    className="flex-1 px-4 py-2 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
                                >
                                    <i className="fas fa-file-invoice"></i> Create Invoice
                                </button>
                            </div>

                            {/* Actions */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Current Status</label>
                                <select 
                                    value={selectedLead.status} 
                                    onChange={(e) => handleStatusChange(e.target.value)}
                                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 outline-none focus:border-[#02275A]"
                                >
                                    <option>New</option>
                                    <option>Interested</option>
                                    <option>Meeting Scheduled</option>
                                    <option>Negotiating</option>
                                    <option>Converted</option>
                                    <option>Lost</option>
                                </select>
                            </div>

                            {/* Reminders List */}
                            {selectedLead.reminders && selectedLead.reminders.length > 0 && (
                                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                    <h4 className="text-xs font-bold text-blue-800 uppercase mb-2 flex items-center gap-2">
                                        <i className="fas fa-bell"></i> Upcoming Reminders
                                    </h4>
                                    <div className="space-y-2">
                                        {selectedLead.reminders.map(rem => (
                                            <div key={rem.id} className="flex justify-between items-start bg-white p-2.5 rounded-lg border border-blue-100 shadow-sm text-sm">
                                                <div>
                                                    <p className="font-bold text-slate-800 text-xs">{rem.type}: {rem.note}</p>
                                                    <p className="text-[10px] text-slate-500">{rem.date} at {rem.time}</p>
                                                </div>
                                                <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">{rem.status}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Add Note */}
                            <div>
                                <h4 className="text-sm font-bold text-slate-800 mb-2">Activity & Notes</h4>
                                <div className="flex gap-2 mb-3">
                                    <textarea 
                                        value={newNote}
                                        onChange={(e) => setNewNote(e.target.value)}
                                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#02275A] resize-none h-20"
                                        placeholder="Log a call, visit, or note..."
                                    ></textarea>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => handleAddNote('Call')} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-[#02275A]/10 hover:text-[#02275A]"><i className="fas fa-phone mr-1"></i> Call</button>
                                    <button onClick={() => handleAddNote('Visit')} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-[#02275A]/10 hover:text-[#02275A]"><i className="fas fa-walking mr-1"></i> Visit</button>
                                    <button onClick={() => handleAddNote('Note')} className="px-3 py-1.5 bg-[#02275A] text-white text-xs font-bold rounded-lg hover:opacity-90">Add Note</button>
                                </div>
                            </div>

                            {/* History */}
                            <div>
                                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                                    {selectedLead.notes && selectedLead.notes.length > 0 ? selectedLead.notes.map((note, idx) => (
                                        <div key={idx} className="flex gap-3 text-sm">
                                            <div className="flex flex-col items-center">
                                                <div className="w-2 h-2 rounded-full bg-slate-300 mt-1.5"></div>
                                                {idx !== (selectedLead.notes?.length || 0) - 1 && <div className="w-0.5 h-full bg-slate-100 my-0.5"></div>}
                                            </div>
                                            <div className="pb-3">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="text-xs font-bold text-slate-700">{note.type}</span>
                                                    <span className="text-[10px] text-slate-400">{note.date}</span>
                                                </div>
                                                <p className="text-slate-600 text-xs">{note.text}</p>
                                            </div>
                                        </div>
                                    )) : (
                                        <p className="text-center text-xs text-slate-400 italic py-2">No activity recorded yet.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ADD LEAD MODAL */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
                        <h3 className="font-bold text-slate-800 text-lg mb-4">Add New Lead</h3>
                        <form onSubmit={(e) => { 
                            e.preventDefault(); 
                            const form = e.target as HTMLFormElement;
                            const formData = new FormData(form);
                            const firstName = formData.get('firstName') as string;
                            const lastName = formData.get('lastName') as string;
                            const businessName = formData.get('businessName') as string;
                            const phone = formData.get('phone') as string;
                            const type = formData.get('type') as 'Personal' | 'Company';
                            const address = formData.get('address') as string;
                            const source = formData.get('source') as string;

                            const newLead: Lead = {
                                id: leads.length + 1,
                                name: `${firstName} ${lastName}`,
                                business: businessName,
                                type: type,
                                status: 'New',
                                phone: `${countryCode}${phone}`,
                                location: address,
                                lastAction: 'None',
                                notes: source ? [{ date: new Date().toISOString().split('T')[0], type: 'System', text: `Lead Source: ${source}` }] : [],
                                reminders: []
                            };
                            
                            setLeads([newLead, ...leads]);
                            setIsAddModalOpen(false); 
                            showSuccess('Lead added successfully');
                        }} className="space-y-4">
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">First Name</label>
                                    <input name="firstName" required className="w-full p-2.5 border border-slate-200 rounded-lg text-sm mt-1 focus:outline-none focus:border-[#02275A]" placeholder="John" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Last Name</label>
                                    <input name="lastName" required className="w-full p-2.5 border border-slate-200 rounded-lg text-sm mt-1 focus:outline-none focus:border-[#02275A]" placeholder="Doe" />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Business Name</label>
                                <input name="businessName" required className="w-full p-2.5 border border-slate-200 rounded-lg text-sm mt-1 focus:outline-none focus:border-[#02275A]" placeholder="John's Shop" />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Phone Number</label>
                                <div className="flex mt-1">
                                    <select 
                                        value={countryCode}
                                        onChange={(e) => setCountryCode(e.target.value)}
                                        className="p-2.5 border border-r-0 border-slate-200 rounded-l-lg bg-slate-50 text-sm font-bold text-slate-600 outline-none"
                                    >
                                        <option value="+234">+234</option>
                                        <option value="+233">+233</option>
                                        <option value="+254">+254</option>
                                    </select>
                                    <input name="phone" type="tel" required className="w-full p-2.5 border border-slate-200 rounded-r-lg text-sm focus:outline-none focus:border-[#02275A]" placeholder="8012345678" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Type</label>
                                    <select name="type" className="w-full p-2.5 border border-slate-200 rounded-lg text-sm mt-1 focus:outline-none focus:border-[#02275A]">
                                        <option value="Personal">Personal</option>
                                        <option value="Company">Company</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Source</label>
                                    <select name="source" className="w-full p-2.5 border border-slate-200 rounded-lg text-sm mt-1 focus:outline-none focus:border-[#02275A]">
                                        <option value="Referral">Referral</option>
                                        <option value="Cold Call">Cold Call</option>
                                        <option value="Walk-in">Walk-in</option>
                                        <option value="Online">Online</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Address</label>
                                <input name="address" required className="w-full p-2.5 border border-slate-200 rounded-lg text-sm mt-1 focus:outline-none focus:border-[#02275A]" placeholder="Shop 5, Wuse Market" />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-200 transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 py-3 bg-[#02275A] text-white font-bold rounded-xl text-sm shadow-md hover:bg-[#02275A]/90 transition-colors">Add Lead</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Create Invoice Modal */}
            {isInvoiceModalOpen && selectedLead && (
                <CreateInvoiceModal 
                    isOpen={isInvoiceModalOpen} 
                    onClose={() => setIsInvoiceModalOpen(false)} 
                    leads={leads}
                    businesses={businesses}
                    onCreate={handleInvoiceCreated}
                    agents={agents}
                    restrictToLeads={true}
                    initialRecipient={{ id: selectedLead.id.toString(), type: 'Lead' }}
                />
            )}

            {/* Generate Proposal Modal */}
            {isProposalModalOpen && selectedLead && (
                <GenerateProposalModal 
                    isOpen={isProposalModalOpen} 
                    onClose={() => setIsProposalModalOpen(false)} 
                    lead={selectedLead}
                />
            )}

            {/* Set Reminder Modal */}
            {isReminderModalOpen && selectedLead && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
                        <h3 className="font-bold text-slate-800 text-lg mb-4">Set Reminder</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Reminder Type</label>
                                <select 
                                    value={reminderForm.type}
                                    onChange={(e) => setReminderForm({...reminderForm, type: e.target.value as any})}
                                    className="w-full p-2.5 border border-slate-200 rounded-lg text-sm mt-1 focus:outline-none focus:border-[#02275A]"
                                >
                                    <option value="Call">Call</option>
                                    <option value="Meeting">Meeting</option>
                                    <option value="Email">Email</option>
                                    <option value="Visit">Visit</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Date</label>
                                    <input 
                                        type="date" 
                                        value={reminderForm.date}
                                        onChange={(e) => setReminderForm({...reminderForm, date: e.target.value})}
                                        className="w-full p-2.5 border border-slate-200 rounded-lg text-sm mt-1 focus:outline-none focus:border-[#02275A]" 
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Time</label>
                                    <input 
                                        type="time" 
                                        value={reminderForm.time}
                                        onChange={(e) => setReminderForm({...reminderForm, time: e.target.value})}
                                        className="w-full p-2.5 border border-slate-200 rounded-lg text-sm mt-1 focus:outline-none focus:border-[#02275A]" 
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Note</label>
                                <textarea 
                                    value={reminderForm.note}
                                    onChange={(e) => setReminderForm({...reminderForm, note: e.target.value})}
                                    className="w-full p-2.5 border border-slate-200 rounded-lg text-sm mt-1 focus:outline-none focus:border-[#02275A] resize-none h-20"
                                    placeholder="What is this reminder about?"
                                ></textarea>
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={reminderForm.sendEmail}
                                    onChange={(e) => setReminderForm({...reminderForm, sendEmail: e.target.checked})}
                                    className="rounded border-slate-300 text-[#02275A] focus:ring-[#02275A]"
                                />
                                <span className="text-sm text-slate-600">Send me an email reminder</span>
                            </label>

                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setIsReminderModalOpen(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-200 transition-colors">Cancel</button>
                                <button onClick={handleAddReminder} className="flex-1 py-2.5 bg-[#02275A] text-white font-bold rounded-xl text-sm shadow-md hover:bg-[#02275A]/90 transition-colors">Save Reminder</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminLeadsView;
