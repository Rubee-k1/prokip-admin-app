import React, { useState } from 'react';
import { useAlert } from '../contexts/AlertContext';

interface CustomerContact {
    name: string;
    email: string;
}

interface SupportTicket {
    id: string;
    customer: CustomerContact;
    subject: string;
    description: string;
    assignedStaff: string | null;
    createdBy:string; // "Customer", or Admin name
    category: string;
    priority: 'Urgent' | 'High' | 'Medium' | 'Low';
    status: 'Open' | 'In Progress' | 'Awaiting Reply' | 'Resolved' | 'Closed';
    createdAt: string;
    updatedAt: string;
}

const AdminComplaintsView: React.FC = () => {
    const { showSuccess } = useAlert();
    const [activeTab, setActiveTab] = useState<'tickets' | 'analytics'>('tickets');
    
    // Mock Data
    const [tickets, setTickets] = useState<SupportTicket[]>([
        { id: 'TKT-2023-001', customer: { name: 'Lagos Logistics', email: 'admin@lagoslog.com' }, subject: 'Login Issues on Web Portal', description: 'Cannot login since yesterday.', assignedStaff: 'Sarah O.', createdBy: 'Customer', category: 'Technical Issue', priority: 'High', status: 'In Progress', createdAt: 'Oct 25, 2023', updatedAt: 'Oct 26, 2023' },
        { id: 'TKT-2023-002', customer: { name: 'Kano Fabrics', email: 'sales@kanofabrics.ng' }, subject: 'Billing Error - Charged Twice', description: 'My card was charged twice for the basic plan.', assignedStaff: 'Mike T.', createdBy: 'Customer', category: 'Billing', priority: 'Urgent', status: 'Open', createdAt: 'Oct 26, 2023', updatedAt: 'Oct 26, 2023' },
        { id: 'TKT-2023-003', customer: { name: 'Abuja Wares', email: 'hello@abujawares.com' }, subject: 'How to add new agents?', description: 'I want to add 3 more agents to my team.', assignedStaff: null, createdBy: 'Admin (System)', category: 'General Query', priority: 'Low', status: 'Open', createdAt: 'Oct 27, 2023', updatedAt: 'Oct 27, 2023' },
        { id: 'TKT-2023-004', customer: { name: 'Okafor Hardware', email: 'okafor@mail.com' }, subject: 'Feature Request: POS integration', description: 'Would love to see integrated POS.', assignedStaff: 'John D.', createdBy: 'Customer', category: 'Feedback', priority: 'Medium', status: 'Resolved', createdAt: 'Oct 20, 2023', updatedAt: 'Oct 22, 2023' },
    ]);

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [priorityFilter, setPriorityFilter] = useState('All');
    const [staffFilter, setStaffFilter] = useState('All');

    const handleAssignStaff = (id: string, staffName: string) => {
        setTickets(tickets.map(t => t.id === id ? { ...t, assignedStaff: staffName, status: t.status === 'Open' ? 'In Progress' : t.status } : t));
        showSuccess(`Ticket ${id} assigned to ${staffName}.`);
    };

    const handleStatusChange = (id: string, newStatus: any) => {
        setTickets(tickets.map(t => t.id === id ? { ...t, status: newStatus } : t));
        showSuccess(`Ticket ${id} status updated to ${newStatus}.`);
    };

    const filteredTickets = tickets.filter(t => {
        const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
        const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;
        const matchesStaff = staffFilter === 'All' ? true : 
                             staffFilter === 'Unassigned' ? t.assignedStaff === null : 
                             t.assignedStaff === staffFilter;
        const matchesSearch = t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              t.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              (t.assignedStaff && t.assignedStaff.toLowerCase().includes(searchQuery.toLowerCase()));
        
        return matchesStatus && matchesPriority && matchesStaff && matchesSearch;
    });

    const totalTickets = tickets.length;
    const openTickets = tickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length;
    const resolvedTickets = tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;

    return (
        <div className="p-6 animate-fade-in space-y-6 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Support Center Pipeline</h1>
                    <p className="text-sm text-slate-500">Track complaints, monitor staff performance, and resolve issues.</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setActiveTab('tickets')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'tickets' ? 'bg-[#02275A] text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                        <i className="fas fa-ticket-alt mr-2"></i> All Tickets
                    </button>
                    <button 
                        onClick={() => setActiveTab('analytics')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'analytics' ? 'bg-[#02275A] text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                        <i className="fas fa-chart-pie mr-2"></i> Performance Reports
                    </button>
                </div>
            </div>

            {/* Performance Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between transition-shadow hover:shadow-md">
                    <div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Tickets</p>
                        <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{totalTickets}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 text-xl">
                        <i className="fas fa-layer-group"></i>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between transition-shadow hover:shadow-md">
                    <div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Active/Open</p>
                        <h3 className="text-2xl font-extrabold text-amber-500 mt-1">{openTickets}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 text-xl">
                        <i className="fas fa-folder-open"></i>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between transition-shadow hover:shadow-md">
                    <div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Resolved</p>
                        <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{resolvedTickets}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 text-xl">
                        <i className="fas fa-check-double"></i>
                    </div>
                </div>
                <div className="bg-[#02275A] p-5 rounded-xl shadow-md flex items-center justify-between text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-xs text-blue-200 font-bold uppercase tracking-wider">Avg. Resolution</p>
                        <h3 className="text-2xl font-extrabold text-white mt-1">4.2 hrs</h3>
                        <p className="text-[10px] text-emerald-400 mt-1"><i className="fas fa-arrow-down"></i> 12% faster</p>
                    </div>
                    <i className="fas fa-stopwatch absolute -right-2 top-2 text-white/5 text-6xl shadow-none"></i>
                </div>
            </div>

            {activeTab === 'tickets' && (
                <div className="space-y-4">
                    {/* Filters Strip */}
                    <div className="flex flex-col sm:flex-row gap-2 justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="relative w-full sm:w-64">
                            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                            <input
                                type="text"
                                placeholder="Search by ID, Customer, Subject..."
                                className="bg-white border border-slate-200 text-xs rounded-lg pl-8 pr-3 py-2 outline-none focus:border-[#02275A] w-full shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                            <select 
                                className="bg-white border border-slate-200 text-xs rounded-lg px-3 py-2 outline-none focus:border-[#02275A] shadow-sm flex-1 sm:flex-none"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="All">All Statuses</option>
                                <option value="Open">Open</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Awaiting Reply">Awaiting Reply</option>
                                <option value="Resolved">Resolved</option>
                            </select>
                            <select 
                                className="bg-white border border-slate-200 text-xs rounded-lg px-3 py-2 outline-none focus:border-[#02275A] shadow-sm flex-1 sm:flex-none"
                                value={priorityFilter}
                                onChange={(e) => setPriorityFilter(e.target.value)}
                            >
                                <option value="All">All Priorities</option>
                                <option value="Urgent">Urgent</option>
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>
                            <select 
                                className="bg-white border border-slate-200 text-xs rounded-lg px-3 py-2 outline-none focus:border-[#02275A] shadow-sm flex-1 sm:flex-none"
                                value={staffFilter}
                                onChange={(e) => setStaffFilter(e.target.value)}
                            >
                                <option value="All">All Staff</option>
                                <option value="Unassigned">Unassigned</option>
                                <option value="Sarah O.">Sarah O.</option>
                                <option value="Mike T.">Mike T.</option>
                                <option value="John D.">John D.</option>
                            </select>
                        </div>
                    </div>

                    {/* Rich Complaints Table */}
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[1000px]">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500 font-bold tracking-wider">
                                        <th className="p-4 w-64 border-r border-slate-100">Customer / ID</th>
                                        <th className="p-4 border-r border-slate-100">Subject</th>
                                        <th className="p-4 border-r border-slate-100 w-44">Status & Priority</th>
                                        <th className="p-4 border-r border-slate-100">Staff Assignment</th>
                                        <th className="p-4 border-r border-slate-100">Creator & Logs</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredTickets.map(ticket => (
                                        <tr key={ticket.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="p-4 border-r border-slate-50">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-800 text-sm tracking-tight">{ticket.customer.name}</span>
                                                    <span className="text-xs text-slate-500 font-medium">{ticket.customer.email}</span>
                                                    <span className="text-[10px] font-mono font-bold text-slate-400 mt-1 bg-slate-100 w-fit px-1.5 py-0.5 rounded">{ticket.id}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 border-r border-slate-50">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-800 line-clamp-1">{ticket.subject}</span>
                                                    <span className="text-xs text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">{ticket.description}</span>
                                                    <span className="text-[10px] bg-slate-100 text-slate-600 font-bold w-fit px-2 py-0.5 rounded mt-2 border border-slate-200">{ticket.category}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 border-r border-slate-50 align-top">
                                                <div className="flex flex-col gap-2 items-start mt-1">
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 ${
                                                        ticket.status === 'Resolved' || ticket.status === 'Closed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                                        ticket.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                                        ticket.status === 'Awaiting Reply' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                                                        'bg-amber-50 text-amber-700 border border-amber-200 shadow-sm shadow-amber-100'
                                                    }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full shadow-sm ${
                                                            ticket.status === 'Resolved' || ticket.status === 'Closed' ? 'bg-emerald-500' :
                                                            ticket.status === 'In Progress' ? 'bg-blue-500' :
                                                            ticket.status === 'Awaiting Reply' ? 'bg-indigo-500' :
                                                            'bg-amber-500 shadow-amber-300'
                                                        }`}></span>
                                                        {ticket.status}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                                        ticket.priority === 'Urgent' ? 'bg-rose-100 text-rose-700' :
                                                        ticket.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                                                        ticket.priority === 'Medium' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-emerald-100 text-emerald-700'
                                                    }`}>
                                                        {ticket.priority.charAt(0)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 border-r border-slate-50 align-top">
                                                {ticket.assignedStaff ? (
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center text-xs font-bold border border-indigo-100">
                                                            {ticket.assignedStaff.charAt(0)}
                                                        </div>
                                                        <span className="text-sm font-bold text-slate-700">{ticket.assignedStaff}</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col gap-2 mt-1">
                                                        <span className="text-xs text-rose-500 font-bold flex items-center gap-1.5">
                                                            <i className="fas fa-exclamation-circle"></i> Unassigned
                                                        </span>
                                                        <select 
                                                            className="text-xs bg-slate-50 border border-slate-200 text-slate-700 font-bold outline-none cursor-pointer rounded px-2 py-1 focus:border-[#02275A] w-full max-w-[120px]"
                                                            onChange={(e) => {
                                                                if(e.target.value) handleAssignStaff(ticket.id, e.target.value);
                                                            }}
                                                            value=""
                                                        >
                                                            <option value="" disabled>Assign Staff...</option>
                                                            <option value="Sarah O.">Sarah O.</option>
                                                            <option value="Mike T.">Mike T.</option>
                                                            <option value="John D.">John D.</option>
                                                        </select>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4 border-r border-slate-50 align-top">
                                                <div className="flex flex-col mt-1">
                                                    <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1 mb-1.5">
                                                        <i className={`fas ${ticket.createdBy === 'Customer' ? 'fa-user text-slate-400' : 'fa-user-shield text-indigo-500'} w-4`}></i> 
                                                        {ticket.createdBy}
                                                    </span>
                                                    <span className="text-[10px] text-slate-500 tracking-wide">
                                                        Created: <span className="font-bold text-slate-700">{ticket.createdAt}</span>
                                                    </span>
                                                    <span className="text-[10px] text-slate-500 tracking-wide mt-0.5">
                                                        Updated: <span className="font-bold text-slate-700">{ticket.updatedAt}</span>
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-right align-top">
                                                <div className="flex flex-col items-end gap-2 mt-1">
                                                    <select 
                                                        className="bg-white border border-slate-200 text-[10px] font-bold rounded px-2 py-1 outline-none focus:border-[#02275A] text-slate-700 cursor-pointer hover:bg-slate-50 transition-colors w-24 text-right shadow-sm"
                                                        value={ticket.status}
                                                        onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                                                    >
                                                        <option value="Open">Set Open</option>
                                                        <option value="In Progress">Set Active</option>
                                                        <option value="Awaiting Reply">Set Wait</option>
                                                        <option value="Resolved">Resolve</option>
                                                    </select>
                                                    <button className="bg-slate-50 hover:bg-[#02275A] hover:text-white text-slate-700 px-3 py-1.5 rounded text-xs font-bold transition-all border border-slate-200 hover:border-[#02275A] shadow-sm w-24 flex items-center justify-center gap-1.5">
                                                        <i className="fas fa-eye text-[10px]"></i> View
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredTickets.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="p-12 text-center">
                                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <i className="fas fa-search text-slate-300 text-2xl"></i>
                                                </div>
                                                <p className="text-slate-500 font-medium">No support tickets found matching your criteria.</p>
                                                <button 
                                                    className="text-[#02275A] text-sm font-bold mt-2 hover:underline"
                                                    onClick={() => {
                                                        setSearchQuery('');
                                                        setStatusFilter('All');
                                                        setPriorityFilter('All');
                                                        setStaffFilter('All');
                                                    }}
                                                >
                                                    Clear Filters
                                                </button>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'analytics' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-slate-800 text-lg">Support Load Pipeline</h3>
                            <select className="text-xs shadow-sm font-bold border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 hover:bg-white transition-colors outline-none cursor-pointer">
                                <option>Last 7 Days</option>
                                <option>This Month</option>
                                <option>This Quarter</option>
                            </select>
                        </div>
                        
                        {/* Mock Visual Pipeline */}
                        <div className="flex justify-between items-center mb-8 relative">
                            {/* Line connecting the steps */}
                            <div className="absolute top-10 left-12 right-12 h-1 bg-slate-100 z-0 hidden md:block"></div>
                            
                            <div className="flex flex-col items-center bg-white z-10 px-4">
                                <div className="w-20 h-20 rounded-full bg-white shadow-md border-[6px] border-slate-50 flex items-center justify-center mb-3 text-2xl font-black text-slate-700">{totalTickets}</div>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tickets Received</span>
                            </div>
                            
                            <div className="hidden md:flex flex-col items-center bg-white z-10 px-4">
                                <div className="w-20 h-20 rounded-full bg-white shadow-md border-[6px] border-amber-50 flex items-center justify-center mb-3 text-2xl font-black text-amber-500">{openTickets}</div>
                                <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">In Open Queue</span>
                            </div>
                            
                            <div className="hidden md:flex flex-col items-center bg-white z-10 px-4">
                                <div className="w-20 h-20 rounded-full bg-white shadow-md border-[6px] border-blue-50 flex items-center justify-center mb-3 text-2xl font-black text-blue-500">1</div>
                                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Awaiting Action</span>
                            </div>
                            
                            <div className="flex flex-col items-center bg-white z-10 px-4">
                                <div className="w-20 h-20 rounded-full bg-white shadow-md border-[6px] border-emerald-50 flex items-center justify-center mb-3 text-2xl font-black text-emerald-500">{resolvedTickets}</div>
                                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Successfully Resolved</span>
                            </div>
                        </div>

                        {/* Additional Reports Area */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
                            {/* Tickets by Category */}
                            <div className="border border-slate-100 rounded-xl p-5 shadow-sm">
                                <h4 className="font-bold text-slate-800 text-sm mb-4">Tickets by Category</h4>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                                            <span>Technical Issue</span>
                                            <span>45% (124 tickets)</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-2">
                                            <div className="bg-[#02275A] h-2 rounded-full" style={{ width: '45%' }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                                            <span>Billing</span>
                                            <span>30% (82 tickets)</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-2">
                                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                                            <span>General Query</span>
                                            <span>15% (41 tickets)</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-2">
                                            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                                            <span>Feedback</span>
                                            <span>10% (27 tickets)</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-2">
                                            <div className="bg-amber-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tickets by Priority */}
                            <div className="border border-slate-100 rounded-xl p-5 shadow-sm">
                                <h4 className="font-bold text-slate-800 text-sm mb-4">Tickets by Priority</h4>
                                <div className="flex h-32 items-end gap-2">
                                    <div className="flex-1 flex flex-col justify-end items-center group">
                                        <div className="w-full bg-emerald-100 group-hover:bg-emerald-200 transition-colors rounded-t-lg relative" style={{ height: '20%' }}>
                                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-600">54</span>
                                        </div>
                                        <span className="text-[10px] uppercase font-bold text-slate-500 mt-2">Low</span>
                                    </div>
                                    <div className="flex-1 flex flex-col justify-end items-center group">
                                        <div className="w-full bg-amber-100 group-hover:bg-amber-200 transition-colors rounded-t-lg relative" style={{ height: '45%' }}>
                                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-600">122</span>
                                        </div>
                                        <span className="text-[10px] uppercase font-bold text-slate-500 mt-2">Medium</span>
                                    </div>
                                    <div className="flex-1 flex flex-col justify-end items-center group">
                                        <div className="w-full bg-orange-100 group-hover:bg-orange-200 transition-colors rounded-t-lg relative" style={{ height: '25%' }}>
                                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-600">68</span>
                                        </div>
                                        <span className="text-[10px] uppercase font-bold text-slate-500 mt-2">High</span>
                                    </div>
                                    <div className="flex-1 flex flex-col justify-end items-center group">
                                        <div className="w-full bg-rose-200 group-hover:bg-rose-300 transition-colors rounded-t-lg relative" style={{ height: '10%' }}>
                                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-600">30</span>
                                        </div>
                                        <span className="text-[10px] uppercase font-bold text-slate-500 mt-2">Urgent</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Staff Performance Table */}
                        <div className="mt-10">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                                    <i className="fas fa-users-cog"></i>
                                </div>
                                <h4 className="font-bold text-slate-800 text-lg">Staff Performance Grid</h4>
                            </div>
                            
                            <div className="overflow-x-auto rounded-xl border border-slate-100">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50 text-[11px] uppercase text-slate-500 font-bold tracking-wider border-b border-slate-100">
                                            <th className="p-4">Staff Member</th>
                                            <th className="p-4">Tickets Assigned</th>
                                            <th className="p-4">Resolved</th>
                                            <th className="p-4">Avg. Response Time</th>
                                            <th className="p-4">Satisfaction (CSAT)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        <tr className="hover:bg-slate-50 transition-colors">
                                            <td className="p-4 font-bold text-slate-800 flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-[#02275A] text-white flex items-center justify-center text-xs shadow-sm">SO</div>
                                                <div className="flex flex-col">
                                                    <span>Sarah O.</span>
                                                    <span className="text-[10px] text-slate-500 font-medium">Senior Support Staff</span>
                                                </div>
                                            </td>
                                            <td className="p-4 font-bold text-slate-600">24</td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-emerald-600 font-bold">21</span>
                                                    <span className="text-[10px] text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded">87% rate</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm font-bold text-slate-700">1h 15m</span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex text-amber-400 text-[10px]">
                                                        <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star-half-alt"></i>
                                                    </div>
                                                    <span className="font-bold text-sm text-slate-800">4.8</span>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr className="hover:bg-slate-50 transition-colors">
                                            <td className="p-4 font-bold text-slate-800 flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-[#02275A] text-white flex items-center justify-center text-xs shadow-sm">MT</div>
                                                <div className="flex flex-col">
                                                    <span>Mike T.</span>
                                                    <span className="text-[10px] text-slate-500 font-medium">Technical Support</span>
                                                </div>
                                            </td>
                                            <td className="p-4 font-bold text-slate-600">18</td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-emerald-600 font-bold">15</span>
                                                    <span className="text-[10px] text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded">83% rate</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm font-bold text-amber-600">2h 30m</span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex text-amber-400 text-[10px]">
                                                        <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="far fa-star"></i>
                                                    </div>
                                                    <span className="font-bold text-sm text-slate-800">4.2</span>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr className="hover:bg-slate-50 transition-colors">
                                            <td className="p-4 font-bold text-slate-800 flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-[#02275A] text-white flex items-center justify-center text-xs shadow-sm">JD</div>
                                                <div className="flex flex-col">
                                                    <span>John D.</span>
                                                    <span className="text-[10px] text-slate-500 font-medium">Billing Support</span>
                                                </div>
                                            </td>
                                            <td className="p-4 font-bold text-slate-600">32</td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-emerald-600 font-bold">30</span>
                                                    <span className="text-[10px] text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded">93% rate</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm font-bold text-emerald-600">45m</span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex text-amber-400 text-[10px]">
                                                        <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
                                                    </div>
                                                    <span className="font-bold text-sm text-slate-800">4.9</span>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminComplaintsView;
