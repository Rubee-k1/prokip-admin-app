
import React, { useState } from 'react';
import { Business, Complaint } from '../types';
import LogComplaintModal from './LogComplaintModal';

interface TicketsViewProps {
    businesses: Business[];
    complaints: Complaint[];
    onAddComplaint: (complaint: Complaint) => void;
    onUpdateComplaint: (complaint: Complaint) => void;
}

const TicketsView: React.FC<TicketsViewProps> = ({ businesses, complaints, onAddComplaint, onUpdateComplaint }) => {
    const [statusFilter, setStatusFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTicket, setSelectedTicket] = useState<Complaint | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Filter tickets
    const filteredTickets = complaints.filter(ticket => {
        const matchesStatus = statusFilter === 'All' || ticket.status === statusFilter;
        const lowerSearch = searchTerm.toLowerCase();
        
        // Find business name
        const business = businesses.find(b => b.id === ticket.businessId);
        const businessName = business ? business.name.toLowerCase() : '';
        
        const matchesSearch = 
            ticket.subject.toLowerCase().includes(lowerSearch) || 
            ticket.id.toLowerCase().includes(lowerSearch) ||
            businessName.includes(lowerSearch);

        return matchesStatus && matchesSearch;
    });

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
        return businesses.find(b => b.id === ticket.businessId) || null;
    };

    return (
        <div className="w-full mx-auto px-4 md:px-8 py-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-lg font-bold text-slate-800">Support Tickets</h2>
                    <p className="text-xs text-slate-500">Track and manage client complaints.</p>
                </div>
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
             <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                    <span className="absolute left-3 top-3 text-slate-400"><i className="fas fa-search"></i></span>
                    <input 
                        type="text" 
                        placeholder="Search tickets by ID, subject, or business..." 
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#02275A] shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {['All', 'Open', 'In Progress', 'Resolved'].map(status => (
                        <button 
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${statusFilter === status ? 'bg-[#02275A] text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tickets List */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="p-4 font-bold text-slate-600">Ticket Details</th>
                                <th className="p-4 font-bold text-slate-600">Business</th>
                                <th className="p-4 font-bold text-slate-600">Priority</th>
                                <th className="p-4 font-bold text-slate-600">Status</th>
                                <th className="p-4 font-bold text-slate-600">Date</th>
                                <th className="p-4 font-bold text-right text-slate-600">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredTickets.map(ticket => {
                                const business = businesses.find(b => b.id === ticket.businessId);
                                return (
                                    <tr key={ticket.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-bold text-slate-800">{ticket.subject}</div>
                                            <div className="text-xs text-slate-400 font-mono">{ticket.id} • {ticket.category}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-semibold text-slate-700">{business ? business.name : 'Unknown Business'}</div>
                                            <div className="text-xs text-slate-500">ID: {ticket.businessId}</div>
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
        </div>
    );
};

export default TicketsView;
