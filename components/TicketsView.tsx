
import React, { useState } from 'react';
import { Business, Complaint } from '../types';
import LogComplaintModal from './LogComplaintModal';

interface TicketsViewProps {
    businesses: Business[];
    complaints: Complaint[];
    onAddComplaint: (complaint: Complaint) => void;
    onUpdateComplaint: (complaint: Complaint) => void;
}

const BRM_LIST = [
    { id: 'BRM-Sarah', name: 'Sarah O.' },
    { id: 'BRM-Mike', name: 'Mike T.' },
    { id: 'BRM-Felix', name: 'Felix M.' },
    { id: 'BRM-Grace', name: 'Grace T.' },
    { id: 'BRM-David', name: 'David K.' }
];

const STATE_MANAGER_LIST = [
    { id: 'SM-David', name: 'David K.' },
    { id: 'SM-John', name: 'John D.' },
    { id: 'SM-Amina', name: 'Amina B.' },
    { id: 'SM-Kwame', name: 'Kwame A.' }
];

const PARTNER_LIST = [
    { id: 'PT-Zenith', name: 'Zenith Bank Partner' },
    { id: 'PT-Moniepoint', name: 'Moniepoint Agent Network' },
    { id: 'PT-Paystack', name: 'Paystack Merchant Service' },
    { id: 'PT-Hubone', name: 'Hubone Tech Hub' },
    { id: 'PT-Konga', name: 'Konga Retail Group' }
];

const TicketsView: React.FC<TicketsViewProps> = ({ businesses, complaints, onAddComplaint, onUpdateComplaint }) => {
    const [statusFilter, setStatusFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTicket, setSelectedTicket] = useState<Complaint | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 3;

    // Create Modal States
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<'Customer' | 'BRM' | 'State Manager' | 'Partner'>('Customer');
    const [selectedTargetId, setSelectedTargetId] = useState('');
    const [subject, setSubject] = useState('');
    const [category, setCategory] = useState('Technical');
    const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
    const [description, setDescription] = useState('');

    // Default target ID when selected ticket type changes
    React.useEffect(() => {
        if (selectedType === 'Customer') {
            setSelectedTargetId(businesses[0]?.id || '');
        } else if (selectedType === 'BRM') {
            setSelectedTargetId(BRM_LIST[0]?.id || '');
        } else if (selectedType === 'State Manager') {
            setSelectedTargetId(STATE_MANAGER_LIST[0]?.id || '');
        } else if (selectedType === 'Partner') {
            setSelectedTargetId(PARTNER_LIST[0]?.id || '');
        }
    }, [selectedType, businesses]);

    React.useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter, typeFilter, searchTerm]);

    // Filter tickets
    const filteredTickets = complaints.filter(ticket => {
        const matchesStatus = statusFilter === 'All' || ticket.status === statusFilter;
        const matchesType = typeFilter === 'All' || (ticket.ticketType || 'Customer') === typeFilter;
        const lowerSearch = searchTerm.toLowerCase();
        
        // Find business name
        const b = businesses.find(item => item.id === ticket.businessId);
        const entityLabel = ticket.targetName || (b ? b.name : 'Unknown Business');
        const entityType = ticket.ticketType || 'Customer';
        
        const matchesSearch = 
            ticket.subject.toLowerCase().includes(lowerSearch) || 
            ticket.id.toLowerCase().includes(lowerSearch) ||
            entityLabel.toLowerCase().includes(lowerSearch) ||
            entityType.toLowerCase().includes(lowerSearch) ||
            ticket.description.toLowerCase().includes(lowerSearch);

        return matchesStatus && matchesType && matchesSearch;
    });

    const totalItems = filteredTickets.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const paginatedTickets = filteredTickets.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'Open': return 'bg-rose-100 text-rose-700';
            case 'In Progress': return 'bg-blue-100 text-blue-700';
            case 'Resolved': return 'bg-emerald-100 text-emerald-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch(priority) {
            case 'Critical': return 'text-rose-600 font-bold';
            case 'High': return 'text-orange-600 font-bold';
            case 'Medium': return 'text-blue-600';
            default: return 'text-slate-500';
        }
    };

    const handleTicketClick = (ticket: Complaint) => {
        setSelectedTicket(ticket);
        setIsModalOpen(true);
    };

    const getBusinessForTicket = (ticket: Complaint | null) => {
        if (!ticket) return null;
        const found = businesses.find(b => b.id === ticket.businessId);
        if (found) return found;

        return {
            id: ticket.businessId,
            name: ticket.targetName || 'Non-Customer Entity',
            owner: 'N/A',
            phone: 'N/A',
            email: 'N/A',
            category: 'Support',
            plan: 'N/A',
            planClass: 'N/A',
            status: 'Active',
            statusClass: 'N/A',
            verified: true,
            dateJoined: ticket.dateCreated,
            address: 'N/A',
            country: 'Nigeria',
            expiryDate: 'N/A',
            limits: { locations: '0', users: '0', products: '0' }
        } as Business;
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        let nameStr = '';
        if (selectedType === 'Customer') {
            const b = businesses.find(item => item.id === selectedTargetId);
            nameStr = b ? b.name : 'Unknown Business';
        } else if (selectedType === 'BRM') {
            const brm = BRM_LIST.find(item => item.id === selectedTargetId);
            nameStr = brm ? brm.name : '';
        } else if (selectedType === 'State Manager') {
            const sm = STATE_MANAGER_LIST.find(item => item.id === selectedTargetId);
            nameStr = sm ? sm.name : '';
        } else if (selectedType === 'Partner') {
            const pt = PARTNER_LIST.find(item => item.id === selectedTargetId);
            nameStr = pt ? pt.name : '';
        }

        const newComplaint: Complaint = {
            id: `TKT-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
            businessId: selectedTargetId || 'Unassigned',
            subject: subject.trim() || 'No Subject',
            priority: priority,
            category: category,
            description: description.trim(),
            status: 'Open',
            dateCreated: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
            lastUpdated: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
            attachments: [],
            comments: [],
            ticketType: selectedType,
            targetName: nameStr
        };

        onAddComplaint(newComplaint);
        
        // Reset states
        setIsCreateModalOpen(false);
        setSubject('');
        setDescription('');
        setCategory('Technical');
        setPriority('Medium');
        setSelectedTargetId('');
    };

    return (
        <div className="w-full mx-auto px-4 md:px-8 py-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-lg font-bold text-slate-800">Support Tickets</h2>
                    <p className="text-xs text-slate-500">Track and manage client complaints.</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-4 py-2 bg-[#02275A] text-white text-xs font-bold rounded-lg hover:bg-[#03367A] transition-all flex items-center gap-2 cursor-pointer shadow-sm border-none"
                >
                    <i className="fas fa-plus"></i> Create Support Ticket
                </button>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-xs text-slate-500 font-bold uppercase mb-1">Total Tickets</p>
                    <h3 className="text-2xl font-bold text-slate-800">{complaints.length}</h3>
                </div>
                <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 shadow-sm">
                    <p className="text-xs text-rose-600 font-bold uppercase mb-1">Open</p>
                    <h3 className="text-2xl font-bold text-rose-700">{complaints.filter(c => c.status === 'Open').length}</h3>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 shadow-sm">
                    <p className="text-xs text-blue-600 font-bold uppercase mb-1">In Progress</p>
                    <h3 className="text-2xl font-bold text-blue-700">{complaints.filter(c => c.status === 'In Progress').length}</h3>
                </div>
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 shadow-sm">
                    <p className="text-xs text-emerald-600 font-bold uppercase mb-1">Resolved</p>
                    <h3 className="text-2xl font-bold text-emerald-700">{complaints.filter(c => c.status === 'Resolved').length}</h3>
                </div>
            </div>

             {/* Search and Filter */}
             <div className="space-y-4 mb-6">
                 <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <span className="absolute left-3 top-3 text-slate-400"><i className="fas fa-search"></i></span>
                        <input 
                            type="text" 
                            placeholder="Search tickets by ID, subject, entity or content..." 
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#02275A] shadow-sm text-slate-800 font-semibold"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        {['All', 'Open', 'In Progress', 'Resolved'].map(status => (
                            <button 
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${statusFilter === status ? 'bg-[#02275A] text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Ticket Type Creator filter tabs */}
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Ticket Creator Type:</span>
                    <div className="flex items-center gap-1.5 p-1 bg-slate-50 rounded-xl border border-slate-100 flex-wrap">
                        {['All', 'Customer', 'BRM', 'State Manager', 'Partner'].map(type => (
                            <button
                                key={type}
                                onClick={() => setTypeFilter(type)}
                                className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                                    typeFilter === type
                                        ? 'bg-[#02275A] text-white shadow-sm'
                                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                                }`}
                            >
                                {type === 'All' ? 'All Creator Types' : type}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tickets List */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="p-4 font-bold text-slate-600">Ticket Details</th>
                                <th className="p-4 font-bold text-slate-600">Ticket By (Type)</th>
                                <th className="p-4 font-bold text-slate-600">Priority</th>
                                <th className="p-4 font-bold text-slate-600">Status</th>
                                <th className="p-4 font-bold text-slate-600">Date</th>
                                <th className="p-4 font-bold text-right text-slate-600">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {paginatedTickets.map(ticket => {
                                const business = businesses.find(b => b.id === ticket.businessId);
                                return (
                                    <tr key={ticket.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-bold text-slate-800">{ticket.subject}</div>
                                            <div className="text-xs text-slate-400 font-mono">{ticket.id} • {ticket.category}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-wider border leading-none ${
                                                        ticket.ticketType === 'BRM' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                        ticket.ticketType === 'State Manager' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                        ticket.ticketType === 'Partner' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                        'bg-indigo-50 text-indigo-700 border-indigo-200'
                                                    }`}>
                                                        {ticket.ticketType || 'Customer'}
                                                    </span>
                                                    <span className="font-semibold text-slate-700">
                                                        {ticket.targetName || (business ? business.name : 'Unknown Business')}
                                                    </span>
                                                </div>
                                                <div className="text-[10px] text-slate-400 font-mono">ID: {ticket.businessId}</div>
                                            </div>
                                        </td>
                                        <td className={`p-4 text-xs ${getPriorityColor(ticket.priority)}`}>{ticket.priority}</td>
                                        <td className="p-4">
                                            <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${getStatusColor(ticket.status)}`}>
                                                {ticket.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-500 text-xs">{ticket.dateCreated}</td>
                                        <td className="p-4 text-right">
                                            <button 
                                                onClick={() => handleTicketClick(ticket)}
                                                className="text-[#02275A] hover:bg-[#02275A]/10 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                                            >
                                                Manage
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredTickets.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-slate-500">
                                        No tickets found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalItems > 0 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center bg-white px-6 py-4 border-t border-slate-100 gap-4">
                        <div className="text-xs font-semibold text-slate-500">
                            Showing <span className="font-bold text-slate-700">{Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, totalItems)}</span> to <span className="font-bold text-slate-700">{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}</span> of <span className="font-bold text-slate-700">{totalItems}</span> tickets
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center gap-1.5 ${
                                    currentPage === 1
                                        ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 cursor-pointer'
                                }`}
                            >
                                <i className="fas fa-chevron-left text-[10px]"></i> Prev
                            </button>
                            
                            {/* Page Numbers */}
                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
                                    if (
                                        totalPages > 6 &&
                                        pageNum !== 1 &&
                                        pageNum !== totalPages &&
                                        Math.abs(pageNum - currentPage) > 1
                                    ) {
                                        if (pageNum === 2 && currentPage > 3) {
                                            return <span key="dots-start" className="px-2 text-slate-400 text-xs">...</span>;
                                        }
                                        if (pageNum === totalPages - 1 && currentPage < totalPages - 2) {
                                            return <span key="dots-end" className="px-2 text-slate-400 text-xs">...</span>;
                                        }
                                        return null;
                                    }
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                                                currentPage === pageNum
                                                    ? 'bg-[#02275A] text-white shadow-sm'
                                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center gap-1.5 ${
                                    currentPage === totalPages
                                        ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 cursor-pointer'
                                }`}
                            >
                                Next <i className="fas fa-chevron-right text-[10px]"></i>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Reuse LogComplaintModal for viewing details */}
            <LogComplaintModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                business={getBusinessForTicket(selectedTicket)}
                complaints={complaints}
                onAddComplaint={onAddComplaint}
                onUpdateComplaint={onUpdateComplaint}
            />

            {/* Custom Create Support Ticket Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in text-slate-700">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
                        {/* Header */}
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
                            <div>
                                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                                    <i className="fas fa-ticket-alt text-[#02275A]"></i> Create Support Ticket
                                </h3>
                                <p className="text-[11px] text-slate-500">Log a new internal or external complaint</p>
                            </div>
                            <button 
                                onClick={() => setIsCreateModalOpen(false)} 
                                className="w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                            >
                                <i className="fas fa-times text-xs"></i>
                            </button>
                        </div>

                        {/* Form Body */}
                        <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
                            {/* Ticket Type Selector */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Ticket Type</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {(['Customer', 'BRM', 'State Manager', 'Partner'] as const).map(type => {
                                        const getIcon = () => {
                                            switch (type) {
                                                case 'Customer': return 'fa-building';
                                                case 'BRM': return 'fa-user-tie';
                                                case 'State Manager': return 'fa-map-marker-alt';
                                                case 'Partner': return 'fa-handshake';
                                            }
                                        };
                                        const isSelected = selectedType === type;
                                        return (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setSelectedType(type)}
                                                className={`py-2 px-1 text-[10.5px] font-bold rounded-lg border flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer ${
                                                    isSelected 
                                                        ? 'bg-[#02275A]/5 text-[#02275A] border-[#02275A] ring-1 ring-[#02275A]/20' 
                                                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                                }`}
                                            >
                                                <i className={`fas ${getIcon()} text-xs ${isSelected ? 'text-[#02275A]' : 'text-slate-400'}`}></i>
                                                <span className="leading-tight">{type}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Dropdown Selection based on Ticket Type */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5 font-bold">
                                    {selectedType === 'Customer' && 'Select Business Name'}
                                    {selectedType === 'BRM' && 'Select BRM / Agent'}
                                    {selectedType === 'State Manager' && 'Select State Manager'}
                                    {selectedType === 'Partner' && 'Select Partner'}
                                </label>
                                <select
                                    required
                                    value={selectedTargetId}
                                    onChange={(e) => setSelectedTargetId(e.target.value)}
                                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-[#02275A] text-slate-800"
                                >
                                    {selectedType === 'Customer' && (
                                        <>
                                            <option value="" disabled>-- Select Customer Business --</option>
                                            {businesses.map(b => (
                                                <option key={b.id} value={b.id}>{b.name}</option>
                                            ))}
                                        </>
                                    )}
                                    {selectedType === 'BRM' && (
                                        <>
                                            <option value="" disabled>-- Select BRM --</option>
                                            {BRM_LIST.map(brm => (
                                                <option key={brm.id} value={brm.id}>{brm.name}</option>
                                            ))}
                                        </>
                                    )}
                                    {selectedType === 'State Manager' && (
                                        <>
                                            <option value="" disabled>-- Select State Manager --</option>
                                            {STATE_MANAGER_LIST.map(sm => (
                                                <option key={sm.id} value={sm.id}>{sm.name}</option>
                                            ))}
                                        </>
                                    )}
                                    {selectedType === 'Partner' && (
                                        <>
                                            <option value="" disabled>-- Select Partner --</option>
                                            {PARTNER_LIST.map(pt => (
                                                <option key={pt.id} value={pt.id}>{pt.name}</option>
                                            ))}
                                        </>
                                    )}
                                </select>
                            </div>

                            {/* Subject */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Subject</label>
                                <input 
                                    required 
                                    type="text" 
                                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-[#02275A] text-slate-800"
                                    placeholder="Brief summary of the issue..."
                                    value={subject}
                                    onChange={e => setSubject(e.target.value)}
                                />
                            </div>

                            {/* Category & Priority Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Category</label>
                                    <select 
                                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-[#02275A] text-slate-800"
                                        value={category}
                                        onChange={e => setCategory(e.target.value)}
                                    >
                                        <option>Technical</option>
                                        <option>Billing</option>
                                        <option>Feature Request</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Priority</label>
                                    <select 
                                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-[#02275A] text-slate-800"
                                        value={priority}
                                        onChange={e => setPriority(e.target.value as any)}
                                    >
                                        <option>Low</option>
                                        <option>Medium</option>
                                        <option>High</option>
                                        <option>Critical</option>
                                    </select>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Description</label>
                                <textarea 
                                    required 
                                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-[#02275A] min-h-[100px] resize-none text-slate-800"
                                    placeholder="Describe the complaint or ticket details..."
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                ></textarea>
                            </div>

                            {/* Submit and Cancel Actions */}
                            <div className="pt-4 flex justify-end gap-2.5 border-t border-slate-100">
                                <button 
                                    type="button" 
                                    onClick={() => setIsCreateModalOpen(false)} 
                                    className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-lg text-xs hover:bg-slate-200 cursor-pointer border-none animate-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="px-4 py-2 bg-[#02275A] text-white font-bold rounded-lg text-xs hover:bg-[#03367A] transition-all shadow-sm cursor-pointer border-none"
                                >
                                    Submit Ticket
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TicketsView;
