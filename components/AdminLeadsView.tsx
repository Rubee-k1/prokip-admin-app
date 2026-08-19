import React, { useState } from 'react';
import CreateInvoiceModal from './CreateInvoiceModal';
import GenerateProposalModal from './GenerateProposalModal';
import InvoicesView from './InvoicesView';
import NearbyLeads from './NearbyLeads';
import AppointmentsView from './AppointmentsView';
import { Lead, Business, Invoice, Reminder, Notification, Agent } from '../types';
import { useAlert } from '../contexts/AlertContext';

interface AdminLeadsViewProps {
    setView?: (view: string) => void;
    businesses?: Business[];
    invoices?: Invoice[];
    onAddInvoice?: (inv: Invoice) => void;
    onUpdateInvoice?: (inv: Invoice) => void;
    onAddNotification?: (notification: Notification) => void;
    initialTab?: 'list' | 'invoices' | 'find' | 'appointment';
    userCountry?: string;
    userRole?: string;
}

const AdminLeadsView: React.FC<AdminLeadsViewProps> = ({ setView, businesses = [], invoices: propInvoices = [], onAddInvoice, onUpdateInvoice, onAddNotification, initialTab = 'list', userCountry = 'Nigeria', userRole = 'admin' }) => {
    const { showSuccess, showInfo, showError } = useAlert();
    const [activeTab, setActiveTab] = useState<'list' | 'invoices' | 'find' | 'appointment'>(initialTab);
    
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

    // Mock BRMs (Business Relationship Managers) Data
    const [brmsList] = useState([
        { id: 'BRM-001', name: 'Sarah O.', address: '12 Bankole Street, Ikeja, Lagos' },
        { id: 'BRM-002', name: 'Mike T.', address: '42 Sabon Gari, Kano' },
        { id: 'BRM-003', name: 'Felix M.', address: 'Plot 305 Wuse II, Abuja' },
        { id: 'BRM-004', name: 'Grace T.', address: '55 Trans Amadi, PH, Rivers' }
    ]);

    const isRestrictedRole = userRole === 'call-agent';

    // Lead List State
    const [activeCategory, setActiveCategory] = useState<'All' | 'Personal' | 'Company' | 'State Manager' | 'Sales Lead'>(
        isRestrictedRole ? 'Company' : 'All'
    );
    const [statusFilter, setStatusFilter] = useState('All');
    const [agentFilter, setAgentFilter] = useState('All');
    const [brmFilter, setBrmFilter] = useState('All');
    const [managerFilter, setManagerFilter] = useState('All');
    const [sortBy, setSortBy] = useState('Priority');
    
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [isEditingLead, setIsEditingLead] = useState(false);
    const [editLeadData, setEditLeadData] = useState({
        name: '',
        business: '',
        phone: '',
        location: '',
        email: '',
        type: 'Company' as 'Personal' | 'Company' | 'Sales Lead' | 'State Manager'
    });

    React.useEffect(() => {
        if (selectedLead) {
            setEditLeadData({
                name: selectedLead.name || '',
                business: selectedLead.business || '',
                phone: selectedLead.phone || '',
                location: selectedLead.location || '',
                email: selectedLead.email || '',
                type: selectedLead.type || 'Company'
            });
            setIsEditingLead(false);
        }
    }, [selectedLead]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addLeadErrors, setAddLeadErrors] = useState<{ name?: string; email?: string; phone?: string; general?: string } | null>(null);

    React.useEffect(() => {
        if (!isAddModalOpen) {
            setAddLeadErrors(null);
        }
    }, [isAddModalOpen]);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [selectedLinkType, setSelectedLinkType] = useState<string>('discovery');
    const [copied, setCopied] = useState(false);

    const agentRef = 'agy-449';
    const baseUrl = `${window.location.origin}/#/landing`;
    const generatedLink = `${baseUrl}/${selectedLinkType}/${agentRef}`;

    const handleCopyText = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        showSuccess('Booking link copied to clipboard!');
    };
    const [selectedBrmIdInModal, setSelectedBrmIdInModal] = useState<string>('');
    const [brmSearchTerm, setBrmSearchTerm] = useState('');
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isBrmAssignModalOpen, setIsBrmAssignModalOpen] = useState(false);
    const [leadToAssign, setLeadToAssign] = useState<Lead | null>(null);
    const [newNote, setNewNote] = useState('');
    const [brmSearchTermModal, setBrmSearchTermModal] = useState('');
    const [agentSearchTermModal, setAgentSearchTermModal] = useState('');
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
        { id: 3, name: "TechPoint Logistics", business: "TechPoint", type: "State Manager", status: "New", phone: "08199988877", location: "Central Area", lastAction: "None", notes: [], managerId: 'SM-002', managerName: 'Abuja Manager' }, // Unassigned agent
        { id: 4, name: "Bisi Cakes", business: "Bisi Bakery", type: "Personal", status: "Negotiating", phone: "07055566677", location: "Maitama", lastAction: "Email (Today)", notes: [{ date: '2023-10-25', type: 'Note', text: 'Sent pricing proposal.' }], reminders: [], assignedAgentId: 'AG-001', assignedAgentName: 'Sarah O.', managerId: 'SM-001', managerName: 'John D.' },
        { id: 5, name: "BlueChip Inc.", business: "BlueChip", type: "Company", status: "Converted", phone: "09011122233", location: "Wuse 2", lastAction: "Onboarding", notes: [{ date: '2023-10-15', type: 'System', text: 'Lead converted to paid customer.' }], reminders: [], assignedAgentId: 'AG-003', assignedAgentName: 'Chidinma N.', managerId: 'SM-001', managerName: 'John D.' },
        { id: 6, name: "Emeka Phones", business: "Emeka Phones", type: "Personal", status: "New", phone: "08012312312", location: "Banex Plaza", lastAction: "None", notes: [], managerId: 'SM-002', managerName: 'Abuja Manager' },
        { id: 7, name: "Kiddies World", business: "Kiddies World", type: "Company", status: "Interested", phone: "07098798798", location: "Gwarinpa", lastAction: "Call (1 week ago)", notes: [], assignedAgentId: 'AG-002', assignedAgentName: 'Emmanuel K.', managerId: 'SM-002', managerName: 'Abuja Manager' },
    ]);

    const [invoices, setInvoices] = useState<Invoice[]>(propInvoices);

    const visibleLeads = userRole === 'sales-manager'
        ? leads.filter(l => l.type === 'Company' || l.type === 'Sales Lead' || l.type === 'State Manager')
        : isRestrictedRole 
            ? leads.filter(l => l.type === 'Company') 
            : leads;

    // Metrics
    const totalLeads = visibleLeads.length;
    const convertedCount = visibleLeads.filter(l => l.status === 'Converted').length;
    const conversionRate = totalLeads ? Math.round((convertedCount / totalLeads) * 100) : 0;
    const unassignedCount = visibleLeads.filter(l => !l.assignedAgentId).length;
    
    // Get metrics for each BRM based on actual and realistic mock baselines
    const getBrmMetrics = (brmId: string) => {
        const actualLeadCount = visibleLeads.filter(l => l.brmId === brmId).length;
        const baselines: Record<string, { leads: number; conversations: number; conversion: string }> = {
            'BRM-001': { leads: 14, conversations: 42, conversion: '78%' },
            'BRM-002': { leads: 8, conversations: 24, conversion: '65%' },
            'BRM-003': { leads: 11, conversations: 35, conversion: '72%' },
            'BRM-004': { leads: 9, conversations: 28, conversion: '70%' },
        };
        const base = baselines[brmId] || { leads: 0, conversations: 0, conversion: '0%' };
        return {
            totalLeads: base.leads + actualLeadCount,
            conversations: base.conversations + (actualLeadCount * 3),
            conversionRate: base.conversion
        };
    };
    
    // Helper to map BRM ID to State Manager ID
    const getBrmManagerId = (bId?: string) => {
        if (!bId) return null;
        if (bId === 'BRM-001' || bId === 'BRM-002') return 'SM-001'; // John D. (Lagos Zone)
        if (bId === 'BRM-003' || bId === 'BRM-004') return 'SM-002'; // Abuja Manager (Abuja / Northern Zone)
        return null;
    };

    // Filtered Leads Logic
    const filteredLeads = visibleLeads
        .filter(l => {
            const matchesCategory = activeCategory === 'All' ? true : l.type === activeCategory;
            const matchesStatus = statusFilter === 'All' || l.status === statusFilter;
            
            // Telesales Filter (using agentFilter)
            const matchesTelesales = agentFilter === 'All' || 
                (agentFilter === 'Assigned' ? !!l.assignedAgentId : 
                 (agentFilter === 'Unassigned' ? !l.assignedAgentId : l.assignedAgentId === agentFilter));
                 
            // Agent / BRM Filter
            const matchesBrm = brmFilter === 'All' || 
                (brmFilter === 'Unassigned' ? !l.brmId : l.brmId === brmFilter);
                
            // State Manager Filter
            const matchesManager = managerFilter === 'All' || 
                (managerFilter === 'Unassigned' ? (!l.managerId && !getBrmManagerId(l.brmId)) : 
                 (l.managerId === managerFilter || getBrmManagerId(l.brmId) === managerFilter));
                 
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = !searchTerm || 
                l.name.toLowerCase().includes(searchLower) || 
                l.business.toLowerCase().includes(searchLower) || 
                l.phone.includes(searchLower);
                
            return matchesCategory && matchesSearch && matchesStatus && matchesTelesales && matchesBrm && matchesManager;
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

    const handleCategoryChange = (category: 'All' | 'Personal' | 'Company' | 'State Manager' | 'Sales Lead') => {
        if (isRestrictedRole && category !== 'Company') {
            return;
        }
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

    const handleAssignBrm = (brmId: string) => {
        if (!leadToAssign) return;
        const brm = brmsList.find(b => b.id === brmId);
        if (!brm) return;

        const updatedLeads = leads.map(l => l.id === leadToAssign.id ? { ...l, brmId: brm.id, brmName: brm.name } : l);
        setLeads(updatedLeads);
        showSuccess(`Lead assigned to BRM ${brm.name}`);
        setIsBrmAssignModalOpen(false);
        setLeadToAssign(null);
        if (selectedLead && selectedLead.id === leadToAssign.id) {
            setSelectedLead({ ...selectedLead, brmId: brm.id, brmName: brm.name });
        }
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

    const isFromSharedLink = selectedLead && (
        selectedLead.notes?.some(n => 
            n.text?.toLowerCase().includes('shared link') || 
            n.text?.toLowerCase().includes('booking') || 
            n.text?.toLowerCase().includes('discovery call') || 
            n.text?.toLowerCase().includes('direct demo') ||
            n.text?.toLowerCase().includes('appointment')
        ) || 
        selectedLead.lastAction?.toLowerCase().includes('appointment') ||
        selectedLead.lastAction?.toLowerCase().includes('booking') ||
        (selectedLead.location === 'Unknown' && selectedLead.lastAction === 'Appointment')
    );

    const canEditSharedLead = ['call-agent', 'sales-manager', 'admin', 'agent', 'team-lead'].includes(userRole || '');

    return (
        <div className="w-full mx-auto px-4 md:px-8 py-6 animate-fade-in pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">
                        {activeTab === 'list' ? 'Leads Management' : activeTab === 'find' ? 'Find Businesses' : activeTab === 'appointment' ? 'Appointments' : 'Invoicing'}
                    </h2>
                    <p className="text-xs text-slate-500">
                        {activeTab === 'list' 
                            ? 'Assign and track leads for your agents.' 
                            : activeTab === 'find'
                            ? 'Discover high-value businesses and import leads.'
                            : activeTab === 'appointment'
                            ? 'Manage and schedule lead appointments, discovery calls, and direct demos.'
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
                        onClick={() => setActiveTab('appointment')} 
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'appointment' ? 'bg-white text-[#02275A] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <i className="fas fa-calendar-check"></i> Appointments
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
                            {!isRestrictedRole && (
                                <div className="flex bg-white p-1 rounded-full border border-slate-200 shrink-0">
                                    <button 
                                        onClick={() => handleCategoryChange('All')}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeCategory === 'All' ? 'bg-[#02275A] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                                    >
                                        All
                                    </button>
                                    <button 
                                        onClick={() => handleCategoryChange('Company')}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeCategory === 'Company' ? 'bg-[#02275A] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                                    >
                                        Company
                                    </button>
                                    {userRole === 'admin' && (
                                        <button 
                                            onClick={() => handleCategoryChange('State Manager')}
                                            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeCategory === 'State Manager' ? 'bg-[#02275A] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                                        >
                                            State Managers
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => handleCategoryChange('Sales Lead')}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeCategory === 'Sales Lead' ? 'bg-[#02275A] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                                    >
                                        Sales Lead
                                    </button>
                                </div>
                            )}

                            {/* Telesales Filter Pill */}
                            <div className="relative shrink-0">
                                <select 
                                    value={agentFilter}
                                    onChange={(e) => { setAgentFilter(e.target.value); setCurrentPage(1); }}
                                    className={`appearance-none pl-3 pr-8 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer outline-none focus:ring-2 focus:ring-[#02275A]/20 ${agentFilter !== 'All' ? 'bg-[#02275A] text-white border-[#02275A]' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                                >
                                    <option value="All">Telesales: All</option>
                                    <option value="Assigned">Assigned to Telesales</option>
                                    <option value="Unassigned">Unassigned Telesales</option>
                                    {agents.map(a => (
                                        <option key={a.id} value={a.id}>{a.name}</option>
                                    ))}
                                </select>
                                <i className={`fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-[10px] pointer-events-none ${agentFilter !== 'All' ? 'text-white' : 'text-slate-400'}`}></i>
                            </div>

                            {/* Agent (BRM) Filter Pill */}
                            <div className="relative shrink-0">
                                <select 
                                    value={brmFilter}
                                    onChange={(e) => { setBrmFilter(e.target.value); setCurrentPage(1); }}
                                    className={`appearance-none pl-3 pr-8 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer outline-none focus:ring-2 focus:ring-emerald-600/20 ${brmFilter !== 'All' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                                >
                                    <option value="All">Agent (BRM): All</option>
                                    <option value="Unassigned">Unassigned Agent (BRM)</option>
                                    {brmsList.map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                                <i className={`fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-[10px] pointer-events-none ${brmFilter !== 'All' ? 'text-white' : 'text-slate-400'}`}></i>
                            </div>

                            {/* Manager Filter Pill */}
                            <div className="relative shrink-0">
                                <select 
                                    value={managerFilter}
                                    onChange={(e) => { setManagerFilter(e.target.value); setCurrentPage(1); }}
                                    className={`appearance-none pl-3 pr-8 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer outline-none focus:ring-2 focus:ring-[#02275A]/20 ${managerFilter !== 'All' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                                >
                                    <option value="All">State Manager: All</option>
                                    <option value="Unassigned">Unassigned State Manager</option>
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
                        
                        <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                            <button 
                                onClick={() => setIsShareModalOpen(true)}
                                className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-slate-50 transition-all active:scale-95 flex items-center gap-2 justify-center flex-1 md:flex-none whitespace-nowrap"
                            >
                                <i className="fas fa-share-alt text-slate-500"></i> Share Link
                            </button>
                            <button onClick={() => { setSelectedBrmIdInModal(''); setBrmSearchTerm(''); setIsAddModalOpen(true); }} className="bg-[#02275A] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md hover:opacity-90 transition-all active:scale-95 flex items-center gap-2 justify-center flex-1 md:flex-none whitespace-nowrap">
                                <i className="fas fa-plus"></i> Add New Lead
                            </button>
                        </div>
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
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${(lead.type === 'Personal' || lead.type === 'Sales Lead' || lead.type === 'State Manager') ? 'bg-[#02275A]/10 text-[#02275A]' : 'bg-orange-50 text-orange-600'}`}>
                                                {lead.name.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <h3 className="font-bold text-slate-800 text-sm truncate">{lead.business}</h3>
                                                    {lead.type === 'Company' && <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 rounded">Biz</span>}
                                                    {lead.type === 'State Manager' && <span className="text-[9px] bg-[#02275A]/10 text-[#02275A] px-1.5 rounded font-bold">State Manager</span>}
                                                </div>
                                                <p className="text-xs text-slate-500 truncate">{lead.name} • {lead.location}</p>
                                                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${getStatusColor(lead.status)}`}>{lead.status}</span>
                                                    
                                                    {lead.brmName && (
                                                        <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded flex items-center gap-1 font-bold">
                                                            <i className="fas fa-handshake"></i> BRM: {lead.brmName}
                                                        </span>
                                                    )}

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
                                            <div className="flex gap-1 flex-1 md:flex-none">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); setLeadToAssign(lead); setIsAssignModalOpen(true); }}
                                                    className="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 flex-1"
                                                    title="Assign Telesales"
                                                >
                                                    <i className="fas fa-user-plus"></i> Telesales
                                                </button>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); setLeadToAssign(lead); setIsBrmAssignModalOpen(true); }}
                                                    className="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 flex-1"
                                                    title="Assign BRM"
                                                >
                                                    <i className="fas fa-handshake"></i> BRM
                                                </button>
                                            </div>
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

            {/* --- APPOINTMENTS TAB --- */}
            {activeTab === 'appointment' && (
                <AppointmentsView leads={leads} onSelectLead={(lead) => setSelectedLead(lead)} />
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
                        brmsList={brmsList}
                        userRole={userRole}
                    />
                </div>
            )}

            {/* Assign Agent Modal */}
            {isAssignModalOpen && leadToAssign && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
                        <h3 className="font-bold text-slate-800 text-lg mb-2">Assign Lead</h3>
                        <p className="text-sm text-slate-500 mb-4">Assign <span className="font-bold text-slate-800">{leadToAssign.business}</span> to an agent.</p>
                        <div className="mb-4">
                            <input 
                                type="text"
                                placeholder="Search telesales..."
                                className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#02275A]"
                                value={agentSearchTermModal}
                                onChange={(e) => setAgentSearchTermModal(e.target.value)}
                            />
                        </div>
                        
                        <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
                            {agents.filter(a => a.name.toLowerCase().includes(agentSearchTermModal.toLowerCase())).map(agent => (
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

            {/* Assign BRM Modal */}
            {isBrmAssignModalOpen && leadToAssign && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
                        <h3 className="font-bold text-slate-800 text-lg mb-2">Assign BRM</h3>
                        <p className="text-sm text-slate-500 mb-4">Assign <span className="font-bold text-slate-800">{leadToAssign.business}</span> to a BRM.</p>
                        <div className="mb-4">
                            <input 
                                type="text"
                                placeholder="Search BRM by name or address..."
                                className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#02275A]"
                                value={brmSearchTermModal}
                                onChange={(e) => setBrmSearchTermModal(e.target.value)}
                            />
                        </div>
                        
                        <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
                            {brmsList.filter(b => b.name.toLowerCase().includes(brmSearchTermModal.toLowerCase()) || b.address.toLowerCase().includes(brmSearchTermModal.toLowerCase())).map(brm => {
                                const metrics = getBrmMetrics(brm.id);
                                return (
                                    <button 
                                        key={brm.id}
                                        type="button"
                                        onClick={() => handleAssignBrm(brm.id)}
                                        className={`w-full flex flex-col p-3 rounded-xl border text-left transition-all ${leadToAssign.brmId === brm.id ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-100 hover:border-emerald-200 hover:bg-slate-50'}`}
                                    >
                                        <div className="w-full flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                                                    {brm.name.charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-slate-800 truncate">{brm.name}</p>
                                                    <p className="text-[10px] text-slate-500 truncate max-w-48 leading-tight">{brm.address}</p>
                                                </div>
                                            </div>
                                            {leadToAssign.brmId === brm.id && <i className="fas fa-check-circle text-emerald-600 shrink-0"></i>}
                                        </div>
                                        
                                        {/* Performance indicators */}
                                        <div className="w-full flex items-center gap-4 mt-2 pt-1.5 border-t border-slate-100/60 text-[10px] text-slate-500 font-medium">
                                            <span className="flex items-center gap-1">
                                                <i className="fas fa-users text-slate-400"></i>
                                                <span>Total client: </span>
                                                <strong>{metrics.totalLeads}</strong>
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <i className="fas fa-chart-line text-slate-400"></i>
                                                <span>Conversion rate: </span>
                                                <strong className="text-emerald-600 font-bold">{metrics.conversionRate}</strong>
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        <button 
                            onClick={() => setIsBrmAssignModalOpen(false)}
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
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${(selectedLead.type === 'Personal' || selectedLead.type === 'Sales Lead' || selectedLead.type === 'State Manager') ? 'bg-[#02275A]/10 text-[#02275A]' : 'bg-orange-100 text-orange-600'}`}>
                                    {selectedLead.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">{selectedLead.business}</h3>
                                    <p className="text-xs text-slate-500">{selectedLead.name} • {selectedLead.location}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {canEditSharedLead && (
                                    <button 
                                        onClick={() => setIsEditingLead(!isEditingLead)}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isEditingLead ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                        title={isEditingLead ? "Cancel Editing" : "Edit Lead Details"}
                                    >
                                        <i className={`fas ${isEditingLead ? 'fa-times' : 'fa-edit'}`}></i>
                                    </button>
                                )}
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
                            {isEditingLead ? (
                                <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <h4 className="text-sm font-extrabold text-slate-800 mb-2 flex items-center gap-2">
                                        <i className="fas fa-edit text-indigo-600"></i> Edit Lead Details
                                    </h4>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contact Name</label>
                                        <input 
                                            type="text" 
                                            value={editLeadData.name} 
                                            onChange={(e) => setEditLeadData({ ...editLeadData, name: e.target.value })}
                                            className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Business Name</label>
                                        <input 
                                            type="text" 
                                            value={editLeadData.business} 
                                            onChange={(e) => setEditLeadData({ ...editLeadData, business: e.target.value })}
                                            className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone Number</label>
                                        <input 
                                            type="text" 
                                            value={editLeadData.phone} 
                                            onChange={(e) => setEditLeadData({ ...editLeadData, phone: e.target.value })}
                                            className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Location</label>
                                        <input 
                                            type="text" 
                                            value={editLeadData.location} 
                                            onChange={(e) => setEditLeadData({ ...editLeadData, location: e.target.value })}
                                            className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white"
                                        />
                                    </div>
                                    {editLeadData.email !== undefined && (
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                                            <input 
                                                type="email" 
                                                value={editLeadData.email} 
                                                onChange={(e) => setEditLeadData({ ...editLeadData, email: e.target.value })}
                                                className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white"
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Lead Type</label>
                                        <select 
                                            value={editLeadData.type} 
                                            onChange={(e) => setEditLeadData({ ...editLeadData, type: e.target.value as any })}
                                            className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white font-bold text-slate-700"
                                        >
                                            <option value="Company">Company Lead</option>
                                            <option value="State Manager">State Manager</option>
                                            <option value="Sales Lead">Sales Lead</option>
                                        </select>
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <button 
                                            onClick={() => setIsEditingLead(false)}
                                            className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            onClick={() => {
                                                const updatedLead = {
                                                    ...selectedLead,
                                                    name: editLeadData.name,
                                                    business: editLeadData.business,
                                                    phone: editLeadData.phone,
                                                    location: editLeadData.location,
                                                    email: editLeadData.email,
                                                    type: editLeadData.type
                                                };
                                                setSelectedLead(updatedLead);
                                                setLeads(leads.map(l => l.id === updatedLead.id ? updatedLead : l));
                                                setIsEditingLead(false);
                                                showSuccess("Lead details updated successfully!");
                                            }}
                                            className="flex-1 py-2 bg-[#02275A] hover:bg-[#02275A]/90 text-white font-bold text-xs rounded-lg transition-colors"
                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Agent Assignment Info */}
                            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-xs font-bold text-indigo-800 uppercase mb-1">Assigned Telesales</p>
                                        <p className="text-sm font-bold text-slate-800">{selectedLead.assignedAgentName || 'Unassigned'}</p>
                                        {selectedLead.brmName && <p className="text-xs font-bold text-emerald-600 mt-1"><i className="fas fa-handshake"></i> BRM: {selectedLead.brmName}</p>}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <button 
                                            onClick={() => { setLeadToAssign(selectedLead); setIsAssignModalOpen(true); }}
                                            className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors w-max"
                                        >
                                            Change Telesales
                                        </button>
                                        <button 
                                            onClick={() => { setLeadToAssign(selectedLead); setIsBrmAssignModalOpen(true); }}
                                            className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors w-max"
                                        >
                                            Change BRM
                                        </button>
                                    </div>
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
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ADD LEAD MODAL */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">Add New Lead</h3>
                                <p className="text-xs text-slate-400">Fill in the lead details to route and assign to field agents.</p>
                            </div>
                            <button 
                                type="button"
                                onClick={() => setIsAddModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                            >
                                <i className="fas fa-times text-lg"></i>
                            </button>
                        </div>

                        <form onSubmit={(e) => { 
                            e.preventDefault(); 
                            const form = e.target as HTMLFormElement;
                            const formData = new FormData(form);
                            const firstName = (formData.get('firstName') as string || '').trim();
                            const lastName = (formData.get('lastName') as string || '').trim();
                            const businessName = (formData.get('businessName') as string || '').trim();
                            const phone = (formData.get('phone') as string || '').trim();
                            const email = (formData.get('email') as string || '').trim();
                            const formType = (formData.get('type') as 'Personal' | 'Company' | 'Sales Lead' | 'State Manager') || activeCategory;
                            const type = ['sales-manager', 'call-agent', 'telesales'].includes(userRole || '') ? 'Company' : formType;
                            const leadCategory = (formData.get('leadCategory') as string) || undefined;
                            const address = (formData.get('address') as string || '').trim();
                            const source = formData.get('source') as string;
                            const assignedAgentId = formData.get('assignedAgentId') as string;
                            const assignedAgentName = assignedAgentId ? agents.find(a => a.id === assignedAgentId)?.name : undefined;
                            const brmId = formData.get('brmId') as string;
                            const brmName = brmId ? brmsList.find(b => b.id === brmId)?.name : undefined;

                            const fullName = `${firstName} ${lastName}`.trim();
                            const fullPhone = `${countryCode}${phone}`;

                            const normalizedNewName = fullName.toLowerCase();
                            const normalizedNewEmail = email.toLowerCase();
                            const normalizedNewPhone = fullPhone.replace(/\D/g, '');

                            const duplicateByName = leads.find(l => l.name && l.name.trim().toLowerCase() === normalizedNewName);
                            const duplicateByEmail = email ? leads.find(l => l.email && l.email.trim().toLowerCase() === normalizedNewEmail) : null;
                            const duplicateByPhone = phone ? leads.find(l => l.phone && l.phone.replace(/\D/g, '') === normalizedNewPhone) : null;

                            const isSalesManagerOrTelesales = ['sales-manager', 'call-agent', 'telesales'].includes(userRole || '');

                            if (isSalesManagerOrTelesales && (duplicateByName || duplicateByEmail || duplicateByPhone)) {
                                const matchedLeads = [duplicateByName, duplicateByEmail, duplicateByPhone].filter(Boolean) as Lead[];
                                
                                const getLeadCreatorText = (lead: Lead) => {
                                    let brmName = '';
                                    let stateManagerName = '';
                                    let telesalesName = '';
                                    
                                    // 1. Check Telesales (assignedAgentName)
                                    if (lead.assignedAgentName) {
                                        telesalesName = lead.assignedAgentName;
                                    }
                                    
                                    // 2. Check BRM Name
                                    if (lead.brmName) {
                                        brmName = lead.brmName;
                                    } else if (lead.brmId) {
                                        brmName = lead.brmName || 'Assigned BRM';
                                    } else if (lead.managerId && (lead.managerId.startsWith('BRM') || lead.managerId.startsWith('brm'))) {
                                        brmName = lead.managerName || '';
                                    }
                                    
                                    // 3. Check managerId and managerName for State Manager or BRM
                                    if (lead.managerId) {
                                        if (lead.managerId.startsWith('SM-')) {
                                            stateManagerName = lead.managerName || '';
                                        } else if (lead.managerId.startsWith('BRM-')) {
                                            brmName = lead.managerName || '';
                                        }
                                    } else if (lead.managerName) {
                                        if (lead.managerName === 'John D.' || lead.managerName === 'Abuja Manager') {
                                            stateManagerName = lead.managerName;
                                        } else {
                                            brmName = lead.managerName;
                                        }
                                    }
                                    
                                    // 4. Map BRM to their State Manager if we have BRM but no State Manager
                                    if (brmName && !stateManagerName) {
                                        const lowerBrm = brmName.toLowerCase();
                                        if (lowerBrm.includes('sarah') || lead.brmId === 'BRM-001' || lead.managerId === 'BRM-001') {
                                            stateManagerName = 'John D.';
                                        } else if (lowerBrm.includes('felix') || lead.brmId === 'BRM-003' || lead.managerId === 'BRM-003') {
                                            stateManagerName = 'Abuja Manager';
                                        }
                                    }
                                    
                                    // Build a descriptive, clean list of descriptions
                                    let creatorsList: string[] = [];
                                    if (brmName) {
                                        creatorsList.push(`BRM (${brmName})`);
                                    }
                                    if (stateManagerName) {
                                        creatorsList.push(`State Manager (${stateManagerName})`);
                                    }
                                    if (telesalesName) {
                                        creatorsList.push(`Telesales (${telesalesName})`);
                                    }
                                    
                                    if (creatorsList.length === 0) {
                                        const fallbackName = lead.managerName || lead.brmName || lead.assignedAgentName || 'Unknown';
                                        creatorsList.push(`Creator (${fallbackName})`);
                                    }
                                    
                                    return creatorsList.join(' and ');
                                };

                                const errors: { name?: string; email?: string; phone?: string; general?: string } = {};
                                let allCreators: string[] = [];

                                if (duplicateByName) {
                                    const creator = getLeadCreatorText(duplicateByName);
                                    errors.name = `Name already exists. Created by: ${creator}`;
                                    allCreators.push(creator);
                                }
                                if (duplicateByEmail) {
                                    const creator = getLeadCreatorText(duplicateByEmail);
                                    errors.email = `Email already exists. Created by: ${creator}`;
                                    allCreators.push(creator);
                                }
                                if (duplicateByPhone) {
                                    const creator = getLeadCreatorText(duplicateByPhone);
                                    errors.phone = `Phone number already exists. Created by: ${creator}`;
                                    allCreators.push(creator);
                                }
                                
                                const uniqueCreators = Array.from(new Set(allCreators));
                                const creatorText = uniqueCreators.join(' and ');
                                
                                errors.general = `This lead already exists. It was already created by ${creatorText}.`;
                                setAddLeadErrors(errors);
                                
                                showError(`Lead already exists! It was already created by ${creatorText}.`);
                                return;
                            }

                            const newLead: Lead = {
                                id: leads.length + 1,
                                name: fullName,
                                business: businessName,
                                type: type,
                                status: 'New',
                                phone: fullPhone,
                                location: address,
                                email: email || undefined,
                                assignedAgentId,
                                assignedAgentName,
                                brmId,
                                brmName,
                                lastAction: 'None',
                                notes: source ? [{ date: new Date().toISOString().split('T')[0], type: 'System', text: `Lead Source: ${source}` }] : [],
                                reminders: [],
                                leadCategory: leadCategory
                            };
                            
                            setLeads([newLead, ...leads]);
                            setIsAddModalOpen(false); 
                            setAddLeadErrors(null);
                            showSuccess('Lead added successfully');
                        }} className="space-y-4">
                            
                            {/* SECTION 1: Personal & Business Info */}
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">First Name</label>
                                        <input 
                                            name="firstName" 
                                            required 
                                            className={`w-full p-2.5 border rounded-lg text-sm mt-1 focus:outline-none focus:border-[#02275A] focus:ring-1 focus:ring-[#02275A]/20 transition-all placeholder-slate-300 ${addLeadErrors?.name ? 'border-red-500 bg-red-50/50' : 'border-slate-200'}`} 
                                            placeholder="John" 
                                        />
                                        {addLeadErrors?.name && <p className="text-[10px] text-red-500 font-semibold mt-1">{addLeadErrors.name}</p>}
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Last Name</label>
                                        <input 
                                            name="lastName" 
                                            required 
                                            className={`w-full p-2.5 border rounded-lg text-sm mt-1 focus:outline-none focus:border-[#02275A] focus:ring-1 focus:ring-[#02275A]/20 transition-all placeholder-slate-300 ${addLeadErrors?.name ? 'border-red-500 bg-red-50/50' : 'border-slate-200'}`} 
                                            placeholder="Doe" 
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Business Name</label>
                                        <input name="businessName" required className="w-full p-2.5 border border-slate-200 rounded-lg text-sm mt-1 focus:outline-none focus:border-[#02275A] focus:ring-1 focus:ring-[#02275A]/20 transition-all placeholder-slate-300" placeholder="E.g., Lagos Bakery" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                                        <div className="flex mt-1">
                                            <div className="relative">
                                                <select 
                                                    value={countryCode}
                                                    onChange={(e) => setCountryCode(e.target.value)}
                                                    className="h-full pl-3 pr-7 bg-slate-50 border border-r-0 border-slate-200 rounded-l-lg text-xs font-bold text-slate-600 focus:outline-none appearance-none cursor-pointer"
                                                >
                                                    <option value="+234">+234</option>
                                                    <option value="+233">+233</option>
                                                    <option value="+254">+254</option>
                                                </select>
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                    <i className="fas fa-chevron-down text-[8px]"></i>
                                                </div>
                                            </div>
                                            <input 
                                                name="phone" 
                                                type="tel" 
                                                required 
                                                className={`w-full p-2.5 border rounded-r-lg text-sm focus:outline-none focus:border-[#02275A] focus:ring-1 focus:ring-[#02275A]/20 transition-all -ml-[1px] placeholder-slate-300 ${addLeadErrors?.phone ? 'border-red-500 bg-red-50/50' : 'border-slate-200'}`} 
                                                placeholder="8012345678" 
                                            />
                                        </div>
                                        {addLeadErrors?.phone && <p className="text-[10px] text-red-500 font-semibold mt-1">{addLeadErrors.phone}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Address</label>
                                    <div className="relative mt-1">
                                        <input name="address" required className="w-full pl-9 pr-2.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#02275A] focus:ring-1 focus:ring-[#02275A]/20 transition-all placeholder-slate-300" placeholder="Shop 5, Wuse Market, Abuja" />
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                                            <i className="fas fa-map-marker-alt"></i>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                                    <div className="relative mt-1">
                                        <input 
                                            name="email" 
                                            type="email" 
                                            className={`w-full pl-9 pr-2.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:border-[#02275A] focus:ring-1 focus:ring-[#02275A]/20 transition-all placeholder-slate-300 ${addLeadErrors?.email ? 'border-red-500 bg-red-50/50' : 'border-slate-200'}`} 
                                            placeholder="E.g., contact@business.com" 
                                        />
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                                            <i className="fas fa-envelope"></i>
                                        </div>
                                    </div>
                                    {addLeadErrors?.email && <p className="text-[10px] text-red-500 font-semibold mt-1">{addLeadErrors.email}</p>}
                                </div>
                            </div>

                            {/* SECTION 2: Routing & Assignment */}
                            <div className="border-t border-slate-100 pt-4 mt-2 space-y-4">
                                <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Lead Assignment & Sourcing</h4>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Source</label>
                                        <select name="source" className="w-full p-2.5 border border-slate-200 rounded-lg text-sm mt-1 focus:outline-none focus:border-[#02275A] bg-white text-slate-700">
                                            <option value="">Select source</option>
                                            <option value="Facebook">Facebook</option>
                                            <option value="WhatsApp">WhatsApp</option>
                                            <option value="Instagram">Instagram</option>
                                            <option value="Google">Google</option>
                                            <option value="TikTok">TikTok</option>
                                            <option value="LinkedIn">LinkedIn</option>
                                            <option value="Referral">Referral</option>
                                            <option value="GMB">GMB</option>
                                            <option value="Cold Call">Cold Call</option>
                                            <option value="Walk-in">Walk-in</option>
                                            <option value="Website">Website</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Owner (Telesales)</label>
                                        {!(userRole === 'sales-manager' || userRole === 'admin') ? (
                                            <>
                                                <select 
                                                    disabled 
                                                    className="w-full p-2.5 border border-slate-200 bg-slate-100 rounded-lg text-sm mt-1 focus:outline-none cursor-not-allowed text-slate-700 font-bold"
                                                    value="AG-001"
                                                >
                                                    <option value="AG-001">Sarah O.</option>
                                                </select>
                                                <input type="hidden" name="assignedAgentId" value="AG-001" />
                                            </>
                                        ) : (
                                            <select 
                                                name="assignedAgentId" 
                                                defaultValue="AG-001"
                                                className="w-full p-2.5 border border-slate-200 rounded-lg text-sm mt-1 focus:outline-none focus:border-[#02275A] bg-white text-slate-700"
                                            >
                                                <option value="">Select Telesales</option>
                                                {agents.map(a => (
                                                    <option key={a.id} value={a.id}>{a.name}</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    {['sales-manager', 'call-agent', 'telesales'].includes(userRole || '') ? (
                                        <>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lead Type</label>
                                                <div className="relative mt-1">
                                                    <select 
                                                        disabled
                                                        className="w-full p-2.5 border border-slate-200 bg-slate-50 rounded-lg text-sm focus:outline-none text-slate-700 font-medium cursor-not-allowed"
                                                        value="Company"
                                                    >
                                                        <option value="Company">Company Lead</option>
                                                    </select>
                                                    <input type="hidden" name="type" value="Company" />
                                                </div>
                                            </div>
                                            <div className="mt-3">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lead Category</label>
                                                <div className="relative mt-1">
                                                    <select 
                                                        name="leadCategory" 
                                                        required 
                                                        className="w-full p-2.5 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:border-[#02275A] text-slate-700 font-medium"
                                                        defaultValue="Company Lead"
                                                    >
                                                        <option value="Company Lead">Company Lead</option>
                                                        <option value="Sales Lead">Sales Lead</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lead Type</label>
                                            <select 
                                                name="type" 
                                                required 
                                                className="w-full p-2.5 border border-slate-200 rounded-lg text-sm mt-1 focus:outline-none focus:border-[#02275A] bg-white text-slate-700"
                                                defaultValue={activeCategory === 'All' ? 'Company' : activeCategory}
                                            >
                                                <option value="Company">Company</option>
                                                <option value="Personal">Personal</option>
                                                <option value="State Manager">State Manager</option>
                                                <option value="Sales Lead">Sales Lead</option>
                                            </select>
                                        </>
                                    )}
                                </div>

                                <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-3 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5ClassName">
                                            <i className="fas fa-handshake text-slate-400"></i> Assign to BRM Field Officer
                                        </label>
                                        <span className="text-[10px] bg-slate-200/60 text-slate-500 px-2 py-0.5 rounded-full font-semibold">Field Service</span>
                                    </div>

                                    {/* Selected BRM Hidden input for form capture */}
                                    <input type="hidden" name="brmId" value={selectedBrmIdInModal} />

                                    {selectedBrmIdInModal ? (
                                        <div>
                                            <div 
                                                onClick={() => {
                                                    setSelectedBrmIdInModal('');
                                                    setBrmSearchTerm('');
                                                }}
                                                className="w-full p-2.5 border border-slate-200 rounded-lg text-sm flex items-center justify-between bg-white text-slate-700 cursor-pointer hover:border-slate-300 transition-colors"
                                            >
                                                <span className="font-medium text-slate-800">{brmsList.find(b => b.id === selectedBrmIdInModal)?.name}</span>
                                                <div className="flex items-center gap-1.5 text-slate-400">
                                                    <i className="fas fa-times text-xs hover:text-red-500 transition-colors"></i>
                                                    <i className="fas fa-chevron-down text-[10px]"></i>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <div className="relative">
                                                <input 
                                                    type="text" 
                                                    placeholder="Search BRM by name or address location..."
                                                    className="w-full pl-9 pr-8 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#02275A]/20 focus:border-[#02275A] bg-white text-slate-800"
                                                    value={brmSearchTerm}
                                                    onChange={e => setBrmSearchTerm(e.target.value)}
                                                />
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                                                    <i className="fas fa-search"></i>
                                                </div>
                                                {brmSearchTerm && (
                                                    <button 
                                                        type="button"
                                                        onClick={() => setBrmSearchTerm('')}
                                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                                                    >
                                                        <i className="fas fa-times-circle text-xs"></i>
                                                    </button>
                                                )}
                                            </div>

                                            <div className="mt-2 max-h-48 overflow-y-auto border border-slate-100 rounded-lg bg-white p-1 divide-y divide-slate-100">
                                                {!brmSearchTerm.trim() ? (
                                                    <div className="p-4 text-center text-xs text-slate-400 font-medium">
                                                        <i className="fas fa-search text-slate-300 text-lg mb-1 block"></i>
                                                        Type a BRM's name or address to search & assign
                                                    </div>
                                                ) : brmsList.filter(b => 
                                                    b.name.toLowerCase().includes(brmSearchTerm.toLowerCase()) || 
                                                    b.address.toLowerCase().includes(brmSearchTerm.toLowerCase())
                                                ).length === 0 ? (
                                                    <div className="p-4 text-center text-xs text-slate-400">
                                                        <i className="fas fa-info-circle text-slate-300 text-lg mb-1 block"></i>
                                                        No BRM found matching "{brmSearchTerm}"
                                                    </div>
                                                ) : (
                                                    brmsList
                                                        .filter(b => 
                                                            b.name.toLowerCase().includes(brmSearchTerm.toLowerCase()) || 
                                                            b.address.toLowerCase().includes(brmSearchTerm.toLowerCase())
                                                        )
                                                        .map(b => {
                                                            const metrics = getBrmMetrics(b.id);
                                                            const isSelected = selectedBrmIdInModal === b.id;
                                                            return (
                                                                <div 
                                                                    key={b.id} 
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setSelectedBrmIdInModal(isSelected ? '' : b.id);
                                                                    }}
                                                                    className={`p-2.5 rounded-lg cursor-pointer transition-all flex items-start gap-2.5 ${isSelected ? 'bg-emerald-50/70 border-l-4 border-emerald-600' : 'hover:bg-slate-50 bg-transparent'}`}
                                                                >
                                                                    <div className={`mt-1 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300 bg-white'}`}>
                                                                        {isSelected && <div className="w-2 h-2 bg-white rounded-full animate-scale-in"></div>}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center justify-between gap-1">
                                                                            <p className="text-xs font-bold text-slate-800">{b.name}</p>
                                                                            <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded font-mono shrink-0">
                                                                                {b.id}
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                                                                            <i className="fas fa-map-marker-alt text-slate-400 mr-1 shrink-0"></i>
                                                                            {b.address}
                                                                        </p>
                                                                        
                                                                        {/* Performance indicators */}
                                                                        <div className="flex items-center gap-4 mt-2 pt-1.5 border-t border-slate-100/60 text-[10px] text-slate-500 font-medium">
                                                                            <span className="flex items-center gap-1">
                                                                                <i className="fas fa-users text-slate-400"></i>
                                                                                <span>Total client: </span>
                                                                                <strong>{metrics.totalLeads}</strong>
                                                                            </span>
                                                                            <span className="flex items-center gap-1">
                                                                                <i className="fas fa-chart-line text-slate-400"></i>
                                                                                <span>Conversion rate: </span>
                                                                                <strong className="text-emerald-600 font-bold">{metrics.conversionRate}</strong>
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
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

            {/* Share Booking Link Modal */}
            {isShareModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in-up">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-extrabold text-xl text-slate-800 flex items-center gap-2">
                                <i className="fas fa-link text-[#02275A]"></i> Generate Booking Link
                            </h3>
                            <button onClick={() => setIsShareModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 hover:text-slate-700 transition-colors">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="p-8">
                            <div className="flex bg-slate-100 p-1.5 rounded-xl mb-6">
                                <button onClick={() => setSelectedLinkType('discovery')} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${selectedLinkType === 'discovery' ? 'bg-white text-[#02275A] shadow' : 'text-slate-500 hover:text-slate-700'}`}>Discovery Call</button>
                                <button onClick={() => setSelectedLinkType('demo')} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${selectedLinkType === 'demo' ? 'bg-white text-[#02275A] shadow' : 'text-slate-500 hover:text-slate-700'}`}>Direct Demo</button>
                            </div>
                            
                            <div className="relative w-full mb-4">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
                                    <i className="fas fa-globe"></i>
                                </div>
                                <input 
                                    type="text" 
                                    readOnly 
                                    value={generatedLink}
                                    className="w-full bg-slate-50 border border-slate-200 text-sm font-mono text-slate-600 rounded-xl py-4 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-[#02275A]/20"
                                />
                            </div>
                            
                            <button 
                                onClick={() => handleCopyText(generatedLink)}
                                className={`w-full py-4 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${copied ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-[#02275A] text-white hover:bg-[#02275A]/90'}`}
                            >
                                <i className={copied ? "fas fa-check" : "fas fa-copy"}></i> 
                                {copied ? 'Copied to Clipboard!' : 'Copy Link to Clipboard'}
                            </button>
                            
                            <div className="mt-6 flex flex-col gap-3 text-xs text-slate-500 bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
                                <div className="flex gap-3">
                                    <i className="fas fa-info-circle text-blue-500 mt-0.5 text-base"></i>
                                    <span className="leading-relaxed">
                                        Share this {selectedLinkType === 'discovery' ? 'Discovery Call' : 'Direct Demo'} link with prospects. When they book, they will automatically be added as new leads (if they don't exist) and their appointments will appear on your dashboard.
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminLeadsView;
