
import React, { useState } from 'react';
import RegistrationModal from './RegistrationModal';
import CreateInvoiceModal from './CreateInvoiceModal';
import GenerateProposalModal from './GenerateProposalModal';
import InvoicesView from './InvoicesView';
import NearbyLeads from './NearbyLeads';
import AppointmentsView from './AppointmentsView';
import { Lead, Business, Invoice, Reminder, Notification } from '../types';
import { useAlert } from '../contexts/AlertContext';

interface LeadsViewProps {
    setView: (view: string) => void;
    businesses?: Business[];
    invoices: Invoice[];
    onAddInvoice?: (inv: Invoice) => void;
    onUpdateInvoice?: (inv: Invoice) => void;
    onAddNotification?: (notification: Notification) => void;
    initialTab?: 'list' | 'invoices' | 'find' | 'appointment';
    userCountry?: string;
    userRole?: string;
}

const LeadsView: React.FC<LeadsViewProps> = ({ setView, businesses = [], invoices = [], onAddInvoice, onUpdateInvoice, onAddNotification, initialTab = 'list', userCountry = 'Nigeria', userRole = 'agent' }) => {
    // Default to 'list' (Manage Leads) or provided initialTab
    const { showSuccess, showInfo, showError } = useAlert();
    const [activeTab, setActiveTab] = useState<'list' | 'invoices' | 'find' | 'appointment'>(initialTab);
    
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

    // Mock Call Agents
    const [callAgents] = useState([
        { id: 'AG-001', name: 'Sarah O. (Me)' },
        { id: 'CA-002', name: 'James T.' },
        { id: 'CA-003', name: 'Bola A.' }
    ]);

    const [brmSearchTerm, setBrmSearchTerm] = useState('');
    const [agentSearchTerm, setAgentSearchTerm] = useState('');


    // Lead List State
    const [activeCategory, setActiveCategory] = useState<'Personal' | 'Company'>(
        userRole === 'call-agent' ? 'Company' : 'Personal'
    );
    const [statusFilter, setStatusFilter] = useState('All');
    const [sortBy, setSortBy] = useState('Priority');
    const [assignmentFilter, setAssignmentFilter] = useState<'All' | 'Assigned'>('All');
    const [managerFilter, setManagerFilter] = useState('All');
    const [brmFilter, setBrmFilter] = useState('All');
    
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [isEditingLead, setIsEditingLead] = useState(false);
    const [editLeadData, setEditLeadData] = useState({
        name: '',
        business: '',
        phone: '',
        location: '',
        email: '',
        type: 'Company' as 'Personal' | 'Company' | 'Sales Lead' | 'State Manager',
        commissionPercent: '' as string | number
    });

    React.useEffect(() => {
        if (selectedLead) {
            setEditLeadData({
                name: selectedLead.name || '',
                business: selectedLead.business || '',
                phone: selectedLead.phone || '',
                location: selectedLead.location || '',
                email: selectedLead.email || '',
                type: selectedLead.type || 'Company',
                commissionPercent: selectedLead.commissionPercent !== undefined ? selectedLead.commissionPercent : ''
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
    const [selectedBrmIdInModal, setSelectedBrmIdInModal] = useState<string>('');
    const [showRegisterModal, setShowRegisterModal] = useState(false);
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
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [isProposalModalOpen, setIsProposalModalOpen] = useState(false); // New Proposal Modal State
    const [registerData, setRegisterData] = useState<any>({});
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

    const countryCodes = [
        { code: '+234', country: 'NG' },
        { code: '+233', country: 'GH' },
        { code: '+254', country: 'KE' },
        { code: '+250', country: 'RW' },
        { code: '+256', country: 'UG' },
        { code: '+27', country: 'ZA' },
        { code: '+44', country: 'UK' },
        { code: '+1', country: 'US' },
        { code: '+1', country: 'CA' },
        { code: '+91', country: 'IN' }
    ];

    // Mock Data
    const [leads, setLeads] = useState<Lead[]>([
        { id: 1, name: "Mr. Okafor", business: "Okafor Hardware", type: "Personal", status: "Interested", phone: "08033344455", location: "Wuse Market", lastAction: "Call (2 days ago)", notes: [{ date: '2023-10-24', type: 'Call', text: 'Spoke about inventory module. Very interested.' }], reminders: [{ id: 'r1', type: 'Call', date: '2023-10-30', time: '14:00', note: 'Follow up on pricing', status: 'Pending' }], assignedAgentId: 'AG-001', assignedAgentName: 'Sarah O.', managerId: 'SM-001', managerName: 'John D.' },
        { id: 2, name: "Madam Sarah", business: "Sarah Salon", type: "Personal", status: "Meeting Scheduled", phone: "08022211100", location: "Garki 2", lastAction: "Visit (Yesterday)", notes: [{ date: '2023-10-20', type: 'Visit', text: 'Visited shop. Demonstrated POS.' }], reminders: [], assignedAgentId: 'AG-002', assignedAgentName: 'Emmanuel K.', managerId: 'SM-001', managerName: 'John D.' },
        { id: 3, name: "TechPoint Logistics", business: "TechPoint", type: "Company", status: "New", phone: "08199988877", location: "Central Area", lastAction: "None", notes: [], reminders: [], managerId: 'SM-002', managerName: 'Abuja Manager' },
        { id: 4, name: "Bisi Cakes", business: "Bisi Bakery", type: "Personal", status: "Negotiating", phone: "07055566677", location: "Maitama", lastAction: "Email (Today)", notes: [{ date: '2023-10-25', type: 'Note', text: 'Sent pricing proposal.' }], reminders: [], assignedAgentId: 'AG-001', assignedAgentName: 'Sarah O.', managerId: 'SM-001', managerName: 'John D.' },
        { id: 5, name: "BlueChip Inc.", business: "BlueChip", type: "Company", status: "Converted", phone: "09011122233", location: "Wuse 2", lastAction: "Onboarding", notes: [{ date: '2023-10-15', type: 'System', text: 'Lead converted to paid customer.' }], reminders: [], assignedAgentId: 'AG-003', assignedAgentName: 'Chidinma N.', managerId: 'SM-001', managerName: 'John D.' },
        { id: 6, name: "Emeka Phones", business: "Emeka Phones", type: "Personal", status: "New", phone: "08012312312", location: "Banex Plaza", lastAction: "None", notes: [], reminders: [], managerId: 'SM-002', managerName: 'Abuja Manager' },
        { id: 7, name: "Kiddies World", business: "Kiddies World", type: "Company", status: "Interested", phone: "07098798798", location: "Gwarinpa", lastAction: "Call (1 week ago)", notes: [], reminders: [], assignedAgentId: 'AG-001', assignedAgentName: 'Sarah O.', managerId: 'SM-002', managerName: 'Abuja Manager' },
    ]);

    // Metrics
    const totalLeads = leads.length;
    const convertedCount = leads.filter(l => l.status === 'Converted').length;
    const conversionRate = totalLeads ? Math.round((convertedCount / totalLeads) * 100) : 0;
    const hotLeadsCount = leads.filter(l => ['Interested', 'Meeting Scheduled', 'Negotiating'].includes(l.status)).length;
    
    // Get metrics for each BRM based on actual and realistic mock baselines
    const getBrmMetrics = (brmId: string) => {
        const actualLeadCount = leads.filter(l => l.managerId === brmId).length;
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
    
    // Filtered Leads Logic
    const filteredLeads = leads
        .filter(l => {
            const matchesCategory = userRole === 'call-agent' ? (l.type === 'Company' || l.type === 'Sales Lead') : l.type === activeCategory;
            const matchesStatus = statusFilter === 'All' || l.status === statusFilter;
            const matchesAssignment = assignmentFilter === 'All' || 
                (userRole === 'agent' ? l.assignedAgentId === 'AG-001' : !!l.assignedAgentId);
            const matchesManager = managerFilter === 'All' || (managerFilter === 'Unassigned' ? !l.managerId : l.managerId === managerFilter);
            const matchesBrm = brmFilter === 'All' || (brmFilter === 'Unassigned' ? !l.assignedAgentId : l.assignedAgentId === brmFilter);
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = !searchTerm || 
                l.name.toLowerCase().includes(searchLower) || 
                l.business.toLowerCase().includes(searchLower) || 
                l.phone.includes(searchLower);
            return matchesCategory && matchesSearch && matchesStatus && matchesAssignment && matchesManager && matchesBrm;
        })
        .sort((a, b) => {
            if (sortBy === 'Priority') {
                // Priority Map: High value statuses first
                const pMap: Record<string, number> = { 
                    'Negotiating': 5, 
                    'Meeting Scheduled': 4, 
                    'Interested': 3, 
                    'New': 2, 
                    'Converted': 1, 
                    'Lost': 0 
                };
                return (pMap[b.status] || 0) - (pMap[a.status] || 0);
            }
            if (sortBy === 'Newest') return b.id - a.id;
            if (sortBy === 'Name') return a.business.localeCompare(b.business);
            return 0;
        });

    // Pagination Logic
    const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
    const paginatedLeads = filteredLeads.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleCategoryChange = (category: 'Personal' | 'Company') => {
        if (userRole === 'call-agent' && category !== 'Company') {
            return;
        }
        setActiveCategory(category);
        setCurrentPage(1);
    };

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

    const handleAddNote = (type: string) => {
        if (!selectedLead || !newNote.trim()) return;
        const updatedLead = { ...selectedLead };
        if (!updatedLead.notes) updatedLead.notes = [];
        updatedLead.notes.unshift({
            date: new Date().toISOString().split('T')[0],
            type: type,
            text: newNote
        });
        
        // Update local state and main list
        setSelectedLead(updatedLead);
        setLeads(leads.map(l => l.id === updatedLead.id ? updatedLead : l));
        setNewNote('');
    };

    const handleSetReminder = () => {
        if (!selectedLead || !reminderForm.date || !reminderForm.time) return;

        const newReminder: Reminder = {
            id: `rem-${Date.now()}`,
            type: reminderForm.type,
            date: reminderForm.date,
            time: reminderForm.time,
            note: reminderForm.note,
            status: 'Pending'
        };

        const updatedLead = { 
            ...selectedLead, 
            reminders: [...(selectedLead.reminders || []), newReminder] 
        };

        setSelectedLead(updatedLead);
        setLeads(leads.map(l => l.id === updatedLead.id ? updatedLead : l));
        
        setIsReminderModalOpen(false);
        setReminderForm({ type: 'Call', date: '', time: '', note: '', sendEmail: true });

        // Notifications
        if (onAddNotification) {
            onAddNotification({
                id: Date.now(),
                title: 'Reminder Set',
                message: `Follow up with ${selectedLead.name} scheduled for ${newReminder.date}.`,
                time: 'Just now',
                type: 'info',
                read: false,
                details: `Task: ${newReminder.type}. Note: ${newReminder.note}`,
                actionLink: 'leads'
            });
        }

        if (reminderForm.sendEmail) {
            showSuccess(`Reminder set & email scheduled for ${newReminder.date}`);
        } else {
            showSuccess("Reminder added successfully");
        }
    };

    const handleStatusChange = (newStatus: string) => {
        if (!selectedLead) return;
        const updatedLead = { ...selectedLead, status: newStatus };
        setSelectedLead(updatedLead);
        setLeads(leads.map(l => l.id === updatedLead.id ? updatedLead : l));
    };

    const handleConvertLead = () => {
        if (!selectedLead) return;
        setRegisterData({
            business: selectedLead.business,
            name: selectedLead.name,
            phone: selectedLead.phone,
            location: selectedLead.location
        });
        
        setSelectedLead(null);
        setShowRegisterModal(true);
    };

    const handleGenerateInvoice = () => {
        setIsInvoiceModalOpen(true);
    };

    const handleGenerateProposal = () => {
        setIsProposalModalOpen(true);
    };

    const handleInvoiceCreated = (inv: Invoice) => {
        if (onAddInvoice) onAddInvoice(inv);
        setIsInvoiceModalOpen(false);
        setActiveTab('invoices'); // Switch to Invoice tab to see it
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

    // Quick Action Handlers
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
                        {activeTab === 'list' ? 'Leads Center' : activeTab === 'find' ? 'Find Businesses' : activeTab === 'appointment' ? 'Appointments' : 'Invoicing'}
                    </h2>
                    <p className="text-xs text-slate-500">
                        {activeTab === 'list' 
                            ? 'Manage prospects, track performance, and billing.' 
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
                                <p className="text-xs text-slate-500 font-bold uppercase mb-1">Hot Leads</p>
                                <h3 className="text-2xl font-extrabold text-orange-600">{hotLeadsCount}</h3>
                                <p className="text-[10px] text-slate-400">Interested & Negotiating</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                                <i className="fas fa-fire"></i>
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
                            {userRole !== 'call-agent' && (
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
                            )}

                            {/* Assignment Tabs */}
                            <div className="flex bg-white p-1 rounded-full border border-slate-200 shrink-0">
                                <button 
                                    onClick={() => { setAssignmentFilter('All'); setCurrentPage(1); }}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${assignmentFilter === 'All' ? 'bg-[#02275A] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                                >
                                    All Leads
                                </button>
                                <button 
                                    onClick={() => { setAssignmentFilter('Assigned'); setCurrentPage(1); }}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${assignmentFilter === 'Assigned' ? 'bg-[#02275A] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                                >
                                    {userRole === 'agent' ? 'Assigned to Me' : userRole === 'call-agent' ? 'Sales Lead' : 'Assigned to Agent'}
                                </button>
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

                            {/* State Manager Filter Pill */}
                            <div className="relative shrink-0">
                                <select 
                                    value={managerFilter}
                                    onChange={(e) => { setManagerFilter(e.target.value); setCurrentPage(1); }}
                                    className={`appearance-none pl-3 pr-8 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer outline-none focus:ring-2 focus:ring-[#02275A]/20 ${managerFilter !== 'All' ? 'bg-[#02275A] text-white border-[#02275A]' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                                >
                                    <option value="All">State Manager: All</option>
                                    <option value="Unassigned">Unassigned</option>
                                    {stateManagers.map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                                <i className={`fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-[10px] pointer-events-none ${managerFilter !== 'All' ? 'text-white' : 'text-slate-400'}`}></i>
                            </div>

                            {/* BRM Filter Pill */}
                            <div className="relative shrink-0">
                                <select 
                                    value={brmFilter}
                                    onChange={(e) => { setBrmFilter(e.target.value); setCurrentPage(1); }}
                                    className={`appearance-none pl-3 pr-8 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer outline-none focus:ring-2 focus:ring-[#02275A]/20 ${brmFilter !== 'All' ? 'bg-[#02275A] text-white border-[#02275A]' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                                >
                                    <option value="All">BRM: All</option>
                                    <option value="Unassigned">Unassigned</option>
                                    {brmsList.map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                                <i className={`fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-[10px] pointer-events-none ${brmFilter !== 'All' ? 'text-white' : 'text-slate-400'}`}></i>
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
                            const nextReminder = hasReminder ? lead.reminders![0] : null; // Simplification: assume first is next
                            
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
                                                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                                        <i className="far fa-clock"></i> {lead.lastAction}
                                                    </span>
                                                    {hasReminder && (
                                                        <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded flex items-center gap-1 font-bold">
                                                            <i className="fas fa-bell"></i> {nextReminder?.date}
                                                        </span>
                                                    )}
                                                    {lead.assignedAgentName && (
                                                        <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded flex items-center gap-1 font-bold">
                                                            <i className="fas fa-user-tag"></i> {lead.assignedAgentId === 'AG-001' && userRole === 'agent' ? 'Assigned to Me' : `Assigned: ${lead.assignedAgentName}`}
                                                        </span>
                                                    )}
                                                    {lead.managerName && (
                                                        <span className="text-[10px] bg-sky-50 text-sky-700 px-2 py-0.5 rounded flex items-center gap-1 font-bold">
                                                            <i className="fas fa-user-tie"></i> BRM: {lead.managerName}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Quick Actions */}
                                        <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-50">
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
                                <button onClick={() => { setSearchTerm(''); setStatusFilter('All'); }} className="text-[#02275A] font-bold text-xs mt-3 hover:underline">Clear Filters</button>
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
                    {/* Render InvoicesView internally within Leads */}
                    <InvoicesView 
                        invoices={invoices} 
                        leads={leads} 
                        businesses={businesses} 
                        onAddInvoice={(inv) => { if(onAddInvoice) onAddInvoice(inv); }}
                        onUpdateInvoice={(inv) => { if(onUpdateInvoice) onUpdateInvoice(inv); }}
                        isEmbedded={true}
                        userCountry={userCountry}
                        callAgents={callAgents}
                        brmsList={brmsList}
                        userRole={userRole}
                    />
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
                                            <option value="Personal">Personal Lead</option>
                                            <option value="Company">Company Lead</option>
                                            <option value="Sales Lead">Sales Lead</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Commission Percent (%)</label>
                                        <input 
                                            type="number" 
                                            min="0"
                                            max="100"
                                            value={editLeadData.commissionPercent}
                                            onChange={(e) => setEditLeadData({ ...editLeadData, commissionPercent: e.target.value })}
                                            placeholder="e.g. 10 (optional)"
                                            className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white font-bold text-slate-700"
                                        />
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
                                                    type: editLeadData.type,
                                                    commissionPercent: editLeadData.commissionPercent !== '' ? Number(editLeadData.commissionPercent) : undefined
                                                } as any;
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
                            
                            <button 
                                onClick={handleConvertLead} 
                                className="w-full px-4 py-3 bg-[#02275A] text-white text-xs font-bold rounded-lg shadow-md hover:opacity-90 transition-colors flex items-center justify-center gap-2"
                            >
                                <i className="fas fa-rocket"></i> Convert to Business
                            </button>

                            {/* Actions */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="col-span-1 md:col-span-2">
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
                                
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Owner (Telesales)</label>
                                    {['admin', 'manager', 'sales-manager', 'department-head'].includes(userRole || '') ? (
                                        <>
                                            <select 
                                                value={selectedLead.assignedAgentId || ''} 
                                                onChange={(e) => {
                                                    const newAgentId = e.target.value;
                                                    const ag = callAgents.find(a => a.id === newAgentId);
                                                    const updatedLead = { 
                                                        ...selectedLead, 
                                                        assignedAgentId: newAgentId || undefined, 
                                                        assignedAgentName: ag ? ag.name : undefined 
                                                    };
                                                    if (ag && selectedLead.type !== 'Sales Lead') updatedLead.type = 'Company';
                                                    setSelectedLead(updatedLead);
                                                    setLeads(leads.map(l => l.id === updatedLead.id ? updatedLead : l));
                                                    showSuccess("Owner reassigned");
                                                }}
                                                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 outline-none focus:border-[#02275A]"
                                            >
                                                <option value="">Unassigned</option>
                                                {callAgents.filter(a => a.name.toLowerCase().includes(agentSearchTerm.toLowerCase())).map(ag => (
                                                    <option key={ag.id} value={ag.id}>{ag.name}</option>
                                                ))}
                                            </select>
                                            <input 
                                                type="text" 
                                                placeholder="Search telesales by name..."
                                                className="w-full p-1.5 border border-slate-200 rounded text-[10px] mt-1 form-input"
                                                value={agentSearchTerm}
                                                onChange={e => setAgentSearchTerm(e.target.value)}
                                            />
                                        </>
                                    ) : (
                                        <div className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-500 cursor-not-allowed">
                                            {selectedLead.assignedAgentName || 'Unassigned'}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Assigned BRM</label>
                                    {['admin', 'manager', 'sales-manager', 'department-head', 'call-agent', 'agent'].includes(userRole || '') ? (
                                        <>
                                            <select 
                                                value={selectedLead.managerId || ''} 
                                                onChange={(e) => {
                                                    const newBrmId = e.target.value;
                                                    const brm = brmsList.find(b => b.id === newBrmId);
                                                    const updatedLead = { 
                                                        ...selectedLead, 
                                                        managerId: newBrmId || undefined, 
                                                        managerName: brm ? brm.name : undefined 
                                                    };
                                                    setSelectedLead(updatedLead);
                                                    setLeads(leads.map(l => l.id === updatedLead.id ? updatedLead : l));
                                                    showSuccess("BRM reassigned");
                                                }}
                                                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 outline-none focus:border-[#02275A]"
                                            >
                                                <option value="">Unassigned</option>
                                                {brmsList.filter(b => b.name.toLowerCase().includes(brmSearchTerm.toLowerCase()) || b.address.toLowerCase().includes(brmSearchTerm.toLowerCase())).map(b => (
                                                    <option key={b.id} value={b.id}>{b.name} - {b.address}</option>
                                                ))}
                                            </select>
                                            <input 
                                                type="text" 
                                                placeholder="Search BRM by name or address..."
                                                className="w-full p-1.5 border border-slate-200 rounded text-[10px] mt-1 form-input"
                                                value={brmSearchTerm}
                                                onChange={e => setBrmSearchTerm(e.target.value)}
                                            />
                                        </>
                                    ) : (
                                        <div className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-500 cursor-not-allowed">
                                            {selectedLead.managerName || 'Unassigned'}
                                        </div>
                                    )}
                                </div>
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
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* REMINDER MODAL */}
            {isReminderModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl relative">
                        <h3 className="font-bold text-slate-800 text-lg mb-4">Set Reminder</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Type</label>
                                <div className="flex gap-2">
                                    {['Call', 'Meeting', 'Email', 'Visit'].map(t => (
                                        <button 
                                            key={t}
                                            onClick={() => setReminderForm({ ...reminderForm, type: t as any })}
                                            className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${reminderForm.type === t ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Date</label>
                                    <input 
                                        type="date" 
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#02275A]"
                                        value={reminderForm.date}
                                        onChange={(e) => setReminderForm({ ...reminderForm, date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Time</label>
                                    <input 
                                        type="time" 
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#02275A]"
                                        value={reminderForm.time}
                                        onChange={(e) => setReminderForm({ ...reminderForm, time: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Note</label>
                                <textarea 
                                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#02275A] resize-none h-20"
                                    placeholder="What's this reminder for?"
                                    value={reminderForm.note}
                                    onChange={(e) => setReminderForm({ ...reminderForm, note: e.target.value })}
                                ></textarea>
                            </div>

                            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                                <input 
                                    type="checkbox" 
                                    id="emailNotif"
                                    checked={reminderForm.sendEmail}
                                    onChange={(e) => setReminderForm({ ...reminderForm, sendEmail: e.target.checked })}
                                    className="w-4 h-4 rounded text-[#02275A] focus:ring-[#02275A]"
                                />
                                <label htmlFor="emailNotif" className="text-xs text-slate-600 font-medium">Send me an email notification</label>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button 
                                    onClick={() => setIsReminderModalOpen(false)}
                                    className="flex-1 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSetReminder}
                                    className="flex-1 py-2.5 bg-[#02275A] text-white font-bold rounded-xl text-sm shadow-md hover:bg-[#02275A]/90 transition-colors"
                                >
                                    Set Reminder
                                </button>
                            </div>
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
                            const address = (formData.get('address') as string || '').trim();
                            const source = formData.get('source') as string;
                            const ownerId = formData.get('owner') as string;
                            const selectedBrmId = formData.get('brm') as string;

                            const ownerAgent = callAgents.find(a => a.id === ownerId);
                            const brm = brmsList.find(b => b.id === selectedBrmId);

                            const formType = (formData.get('type') as 'Personal' | 'Company' | 'Sales Lead' | 'State Manager') || activeCategory;
                            const type = formType;
                            const leadCategory = (formData.get('leadCategory') as string) || undefined;
                            const commPctRaw = formData.get('commissionPercent') as string;
                            const commissionPercent = commPctRaw ? Number(commPctRaw) : undefined;

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
                                lastAction: 'None',
                                notes: source ? [{ date: new Date().toISOString().split('T')[0], type: 'System', text: `Lead Source: ${source}` }] : [],
                                reminders: [],
                                assignedAgentId: ownerAgent ? ownerAgent.id : undefined,
                                assignedAgentName: ownerAgent ? ownerAgent.name : undefined,
                                managerId: brm ? brm.id : undefined,
                                managerName: brm ? brm.name : undefined,
                                commissionPercent: commissionPercent,
                                leadCategory: leadCategory
                            };
                            
                            setLeads([newLead, ...leads]);
                            setIsAddModalOpen(false); 
                            setAddLeadErrors(null);
                        }} className="space-y-4">
                            
                            {/* SECTION 1: Personal & Business Info */}
                            <div className="space-y-3">
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
                                        <div>
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
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lead Type</label>
                                        <div className="relative mt-1">
                                            <select 
                                                name="type" 
                                                required 
                                                className="w-full p-2.5 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:border-[#02275A] text-slate-700 font-medium"
                                                defaultValue={activeCategory}
                                            >
                                                <option value="Personal">Personal Lead</option>
                                                <option value="Company">Company Lead</option>
                                            </select>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Commission Percent (%)</label>
                                    <input 
                                        name="commissionPercent" 
                                        type="number"
                                        min="0"
                                        max="100"
                                        className="w-full p-2.5 border border-slate-200 rounded-lg text-sm mt-1 focus:outline-none focus:border-[#02275A] text-slate-700 font-medium"
                                        placeholder="e.g. 10 (optional, defaults used if empty)"
                                    />
                                </div>

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
                                                    {countryCodes.map((c, idx) => (
                                                        <option key={`${c.code}-${c.country}-${idx}`} value={c.code}>{c.code}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                    <i className="fas fa-chevron-down text-[8px]"></i>
                                                </div>
                                            </div>
                                            <input 
                                                name="phone" 
                                                required 
                                                type="tel" 
                                                className={`w-full p-2.5 border rounded-r-lg text-sm focus:outline-none focus:border-[#02275A] focus:ring-1 focus:ring-[#02275A]/20 transition-all -ml-[1px] placeholder-slate-300 ${addLeadErrors?.phone ? 'border-red-500 bg-red-50/50' : 'border-slate-200'}`} 
                                                placeholder="8012345678" 
                                            />
                                        </div>
                                        {addLeadErrors?.phone && <p className="text-[10px] text-red-500 font-semibold mt-1">{addLeadErrors.phone}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Address / Location</label>
                                    <div className="relative mt-1">
                                        <input name="address" required className="w-full pl-9 pr-2.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#02275A] focus:ring-1 focus:ring-[#02275A]/20 transition-all placeholder-slate-300" placeholder="Street Address, City, State" />
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
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lead Source</label>
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
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assign Owner (Telesales)</label>
                                        {!(userRole === 'sales-manager' || userRole === 'admin') ? (
                                            <>
                                                <select 
                                                    disabled 
                                                    className="w-full p-2.5 border border-slate-200 bg-slate-100 rounded-lg text-sm mt-1 focus:outline-none cursor-not-allowed text-slate-700 font-bold"
                                                    value="AG-001"
                                                >
                                                    <option value="AG-001">Sarah O. (Me)</option>
                                                </select>
                                                <input type="hidden" name="owner" value="AG-001" />
                                            </>
                                        ) : (
                                            <select 
                                                name="owner" 
                                                defaultValue="AG-001"
                                                className="w-full p-2.5 border border-slate-200 rounded-lg text-sm mt-1 focus:outline-none focus:border-[#02275A] bg-white text-slate-700"
                                            >
                                                <option value="">Unassigned</option>
                                                {callAgents.map(ag => (
                                                    <option key={ag.id} value={ag.id}>{ag.name}</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-3 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5ClassName">
                                            <i className="fas fa-handshake text-slate-400"></i> Assign to BRM Field Officer
                                        </label>
                                        <span className="text-[10px] bg-slate-200/60 text-slate-500 px-2 py-0.5 rounded-full font-semibold">Field Service</span>
                                    </div>

                                    {/* Selected BRM Hidden input for form capture */}
                                    <input type="hidden" name="brm" value={selectedBrmIdInModal} />

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

                            <div className="flex gap-3 pt-3 border-t border-slate-100">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-200 transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 py-2.5 bg-[#02275A] text-white font-bold rounded-xl text-sm shadow-md hover:bg-[#02275A]/90 transition-colors">Add Lead</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Register Modal */}
            <RegistrationModal 
                isOpen={showRegisterModal} 
                onClose={() => setShowRegisterModal(false)} 
                onSuccess={() => { setShowRegisterModal(false); setView('businesses'); }}
                initialData={registerData}
                userCountry={userCountry}
            />

            {/* Invoice Modal - Linked to LeadsView logic */}
            <CreateInvoiceModal
                isOpen={isInvoiceModalOpen}
                onClose={() => setIsInvoiceModalOpen(false)}
                leads={leads}
                businesses={businesses}
                onCreate={handleInvoiceCreated}
                initialRecipient={selectedLead ? { id: selectedLead.id.toString(), type: 'Lead' } : undefined}
            />

            {/* Proposal Modal */}
            <GenerateProposalModal 
                isOpen={isProposalModalOpen} 
                onClose={() => setIsProposalModalOpen(false)} 
                lead={selectedLead} 
            />

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

export default LeadsView;
