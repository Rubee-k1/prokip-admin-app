import React, { useState, useEffect } from 'react';
import { Lead } from '../types';
import { useAlert } from '../contexts/AlertContext';

interface Appointment {
    id: string;
    leadId?: number; // link to lead if exists
    leadName: string;
    businessName: string;
    phone: string;
    email: string;
    date: string;
    time: string;
    duration: number; // in minutes
    status: 'Pending Approval' | 'Upcoming' | 'Completed' | 'Cancelled' | 'No-Show';
    type: 'Discovery Call' | 'Direct Demo' | 'Follow up';
    meetingLink?: string;
    notes?: string;
    brmName?: string;
    managerName?: string;
}

const MOCK_APPOINTMENTS: Appointment[] = [
    {
        id: 'APT-001',
        leadId: 1, // Mr. Okafor from LeadsView
        leadName: 'Mr. Okafor',
        businessName: 'Okafor Hardware',
        phone: '08033344455',
        email: 'okafor@example.com',
        date: new Date().toISOString().split('T')[0], // Today
        time: '14:30',
        duration: 30,
        status: 'Upcoming',
        type: 'Discovery Call',
        meetingLink: 'https://meet.google.com/abc-defg-hij',
        notes: 'Interested in the inventory module.',
        brmName: 'Sarah O.',
        managerName: 'John D.'
    },
    {
        id: 'APT-002',
        leadId: 2, // Madam Sarah
        leadName: 'Madam Sarah',
        businessName: 'Sarah Salon',
        phone: '08022211100',
        email: 'sarah@example.com',
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
        time: '10:00',
        duration: 45,
        status: 'Upcoming',
        type: 'Direct Demo',
        meetingLink: 'https://zoom.us/j/1234567890',
        notes: 'Wants to see accounting features.',
        brmName: 'Grace T.',
        managerName: 'John D.'
    },
    {
        id: 'APT-003',
        leadId: 3,
        leadName: 'TechPoint Logistics',
        businessName: 'TechPoint',
        phone: '08199988877',
        email: 'info@techpoint.com',
        date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0], // 2 days ago
        time: '11:15',
        duration: 30,
        status: 'Completed',
        type: 'Discovery Call',
        brmName: 'Mike T.',
        managerName: 'Abuja Manager'
    },
    {
        id: 'APT-004',
        leadName: 'Alhaji Musa',
        businessName: 'Musa Farms',
        phone: '08011122233',
        email: 'musa.farms@example.com',
        date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0], // 5 days ago
        time: '09:00',
        duration: 30,
        status: 'Cancelled',
        type: 'Discovery Call',
        notes: 'Rescheduled for later date.',
        brmName: 'Felix M.',
        managerName: 'Abuja Manager'
    },
    {
        id: 'APT-005',
        leadName: 'Emeka Nwosu',
        businessName: 'EMK Electronics',
        phone: '08111223344',
        email: 'emk.elec@example.com',
        date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
        time: '15:00',
        duration: 45,
        status: 'No-Show',
        type: 'Direct Demo',
        brmName: 'Sarah O.',
        managerName: 'John D.'
    },
    {
        id: 'APT-006',
        leadName: 'Chief Okpala',
        businessName: 'Okpala Trading Co.',
        phone: '08123456789',
        email: 'okpala@example.com',
        date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        time: '13:00',
        duration: 30,
        status: 'Pending Approval',
        type: 'Discovery Call',
        brmName: 'Grace T.',
        managerName: 'Abuja Manager'
    }
];

interface AppointmentsViewProps {
    leads?: Lead[];
    onSelectLead?: (lead: Lead) => void;
}

const AppointmentsView: React.FC<AppointmentsViewProps> = ({ leads = [], onSelectLead }) => {
    const { showSuccess } = useAlert();
    const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
    const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'upcoming' | 'today' | 'past' | 'cancelled' | 'calendar'>('all');

    const [selectedLinkType, setSelectedLinkType] = useState<string>('discovery');
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string>('All');
    const [selectedBrm, setSelectedBrm] = useState<string>('All');
    const [selectedManager, setSelectedManager] = useState<string>('All');
    
    interface DaySettings {
        enabled: boolean;
        startTime: string;
        endTime: string;
        breaks: { id: number; start: string; end: string }[];
    }

    const [settings, setSettings] = useState({
        autoApprove: false,
        bufferPeriod: '15',
        schedule: {
            Monday: { enabled: true, startTime: '09:00', endTime: '17:00', breaks: [{ id: 1, start: '13:00', end: '14:00' }] },
            Tuesday: { enabled: true, startTime: '09:00', endTime: '17:00', breaks: [{ id: 2, start: '13:00', end: '14:00' }] },
            Wednesday: { enabled: true, startTime: '09:00', endTime: '17:00', breaks: [{ id: 3, start: '13:00', end: '14:00' }] },
            Thursday: { enabled: true, startTime: '09:00', endTime: '17:00', breaks: [{ id: 4, start: '13:00', end: '14:00' }] },
            Friday: { enabled: true, startTime: '09:00', endTime: '17:00', breaks: [{ id: 5, start: '13:00', end: '14:00' }] },
            Saturday: { enabled: false, startTime: '10:00', endTime: '14:00', breaks: [] },
            Sunday: { enabled: false, startTime: '10:00', endTime: '14:00', breaks: [] },
        } as Record<string, DaySettings>
    });
    
    // Reschedule state
    const [rescheduleApt, setRescheduleApt] = useState<Appointment | null>(null);
    const [rescheduleDate, setRescheduleDate] = useState('');
    const [rescheduleTime, setRescheduleTime] = useState('');
    
    const agentRef = 'agy-449';
    const baseUrl = `${window.location.origin}/#/landing`;
    
    // Derived generated link
    const generatedLink = `${baseUrl}/${selectedLinkType}/${agentRef}`;
    const [copied, setCopied] = useState(false);

    const handleCopyText = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleViewLead = (apt: Appointment) => {
        if (!onSelectLead) return;
        const matchedLead = leads.find(l => l.id === apt.leadId);
        if (matchedLead) {
            onSelectLead(matchedLead);
        } else {
            // Create a pseudo lead if not found, just for viewing
            onSelectLead({
                id: Date.now(),
                name: apt.leadName,
                business: apt.businessName,
                type: 'Personal',
                status: 'New',
                phone: apt.phone,
                location: 'Unknown',
                lastAction: 'Appointment',
                email: apt.email,
                notes: [],
                reminders: []
            });
        }
    };

    const todayDateStr = new Date().toISOString().split('T')[0];

    // Pagination layout state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortBy, setSortBy] = useState<'date-asc' | 'date-desc'>('date-asc');

    const brmOptions = Array.from(new Set([
        'Sarah O.', 'Mike T.', 'Felix M.', 'Grace T.',
        ...leads.map(l => l.brmName).filter(Boolean),
        ...leads.map(l => l.assignedAgentName && l.assignedAgentId?.startsWith('BRM') ? l.assignedAgentName : null).filter(Boolean)
    ])) as string[];

    const managerOptions = Array.from(new Set([
        'John D.', 'Abuja Manager',
        ...leads.map(l => l.managerName).filter(Boolean)
    ])) as string[];

    const getAppointmentBrm = (apt: Appointment) => {
        if (apt.brmName) return apt.brmName;
        const matchedLead = leads.find(l => l.id === apt.leadId);
        if (matchedLead) {
            return matchedLead.brmName || matchedLead.assignedAgentName || '';
        }
        return '';
    };

    const getAppointmentManager = (apt: Appointment) => {
        if (apt.managerName) return apt.managerName;
        const matchedLead = leads.find(l => l.id === apt.leadId);
        if (matchedLead) {
            return matchedLead.managerName || '';
        }
        return '';
    };

    const handleExport = () => {
        // Mock export functionality
        alert('Exporting appointments to CSV...');
    };

    const filteredAppointments = appointments.filter(apt => {
        const matchesSearch = apt.leadName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              apt.businessName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === 'All' || apt.type === filterType;
        if (!matchesSearch || !matchesType) return false;

        const aptBrm = getAppointmentBrm(apt);
        if (selectedBrm !== 'All' && aptBrm !== selectedBrm) return false;

        const aptManager = getAppointmentManager(apt);
        if (selectedManager !== 'All' && aptManager !== selectedManager) return false;

        if (activeTab === 'today') return apt.date === todayDateStr && apt.status !== 'Cancelled' && apt.status !== 'No-Show' && apt.status !== 'Pending Approval';
        if (activeTab === 'upcoming') return apt.date >= todayDateStr && apt.status === 'Upcoming';
        if (activeTab === 'pending') return apt.status === 'Pending Approval';
        if (activeTab === 'past') return apt.date < todayDateStr && apt.status === 'Completed';
        if (activeTab === 'cancelled') return apt.status === 'Cancelled' || apt.status === 'No-Show';
        return true; 
    });

    const renderAppointmentsList = () => {
        if (filteredAppointments.length === 0) {
            return (
                <div className="text-center p-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <div className="w-12 h-12 bg-slate-200 text-slate-400 rounded-full flex items-center justify-center text-xl mx-auto mb-3">
                        <i className="fas fa-calendar-times"></i>
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 mb-1">No Appointments Found</h3>
                    <p className="text-xs text-slate-500">There are no appointments matching this view.</p>
                </div>
            );
        }

        const sortedAppointments = filteredAppointments.sort((a, b) => {
            const timeA = new Date(`${a.date}T${a.time}`).getTime();
            const timeB = new Date(`${b.date}T${b.time}`).getTime();
            return sortBy === 'date-asc' ? timeA - timeB : timeB - timeA;
        });
        const totalPages = Math.ceil(sortedAppointments.length / itemsPerPage);
        const paginatedAppointments = sortedAppointments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

        const getMeetingLink = (apt: Appointment) => {
            if (apt.meetingLink) return apt.meetingLink;
            return `https://meet.prokip.com/room-${apt.id.toLowerCase()}`;
        };

        return (
            <div className="space-y-4">
                <div className="space-y-3">
                    {paginatedAppointments.map(apt => {
                        const isToday = apt.date === todayDateStr;
                        return (
                            <div key={apt.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm transition-all hover:border-indigo-200 cursor-pointer group relative overflow-hidden" onClick={() => handleViewLead(apt)}>
                                {isToday && (
                                    <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg z-10 flex items-center gap-1">
                                        <i className="fas fa-calendar-day"></i> Today
                                    </div>
                                )}
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="flex items-start gap-3 flex-1">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${isToday ? 'bg-[#02275A]/10 text-[#02275A]' : 'bg-slate-100 text-slate-600'}`}>
                                            {apt.leadName.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <h3 className="font-bold text-slate-800 text-sm truncate">{apt.businessName}</h3>
                                                <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 rounded">{apt.type}</span>
                                            </div>
                                            <p className="text-xs text-slate-500 truncate">{apt.leadName}</p>
                                            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                                                    apt.status === 'Pending Approval' ? 'bg-purple-50 text-purple-600' :
                                                    apt.status === 'Upcoming' ? 'bg-amber-50 text-amber-600' :
                                                    apt.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                                                    'bg-rose-50 text-rose-600'
                                                }`}>{apt.status}</span>
                                                <span className="text-[10px] text-slate-500 flex items-center gap-1 font-bold">
                                                    <i className="far fa-clock"></i> 
                                                    {new Date(apt.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} at {apt.time} ({apt.duration}m)
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-end shrink-0 text-slate-400">
                                        <i className="fas fa-chevron-right text-xs"></i>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Pagination Controls */}
                {filteredAppointments.length > 0 && (
                    <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 mt-4">
                        <div className="flex items-center gap-3">
                            <span>Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAppointments.length)} of {filteredAppointments.length} appointments</span>
                            <select 
                                value={itemsPerPage}
                                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                                className="bg-slate-50 border border-slate-200 text-xs rounded py-1 pl-2 pr-6 outline-none font-medium"
                            >
                                <option value={5}>5 per page</option>
                                <option value={10}>10 per page</option>
                                <option value={20}>20 per page</option>
                                <option value={50}>50 per page</option>
                            </select>
                        </div>
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
        );
    };

    const renderCalendar = () => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const mockDaysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);
        
        return (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-lg">Current Month View</h3>
                    <div className="flex gap-2 text-sm">
                        <button className="px-3 py-1 bg-white border border-slate-200 rounded-md hover:bg-slate-100 font-bold text-slate-600"><i className="fas fa-chevron-left mr-1"></i> Prev</button>
                        <button className="px-3 py-1 bg-white border border-slate-200 rounded-md hover:bg-slate-100 font-bold text-slate-600">Next <i className="fas fa-chevron-right ml-1"></i></button>
                    </div>
                </div>
                <div className="grid grid-cols-7 border-b border-slate-100">
                    {days.map(d => (
                        <div key={d} className="p-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">{d}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 bg-slate-50 gap-px">
                    {mockDaysInMonth.map(day => {
                        const isToday = day === new Date().getDate();
                        const dayHasApt = filteredAppointments.some(a => new Date(a.date).getDate() === day);
                        const aptsForDay = filteredAppointments.filter(a => new Date(a.date).getDate() === day);
                        
                        return (
                            <div key={day} className={`min-h-[100px] p-2 bg-white ${isToday ? 'bg-blue-50/30' : 'hover:bg-slate-50'} transition-colors relative group`}>
                                <span className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold mb-1 ${isToday ? 'bg-[#02275A] text-white shadow-md' : 'text-slate-600'}`}>
                                    {day}
                                </span>
                                {dayHasApt && (
                                    <div className="flex flex-col gap-1.5 mt-2">
                                        {aptsForDay.map((apt, idx) => (
                                            <div key={idx} onClick={() => handleViewLead(apt)} className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-700 px-1.5 py-1 truncate rounded leading-tight font-medium cursor-pointer hover:bg-indigo-100 transition-colors" title={apt.leadName}>
                                                {apt.time} - {apt.leadName}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in relative">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                    <i className="fas fa-calendar-check text-[#02275A]"></i> Appointments
                </h3>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-2 h-full bg-blue-500"></div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Today's Appts</p>
                    <h4 className="text-3xl font-extrabold text-slate-800">{appointments.filter(a => a.date === todayDateStr && a.status !== 'Cancelled' && a.status !== 'No-Show').length}</h4>
                    <span className="text-[10px] text-blue-600 font-bold mt-1 block bg-blue-50 inline-block px-1.5 rounded">Happening today</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm overflow-hidden relative">
                    <div className="absolute right-0 top-0 w-2 h-full bg-amber-400"></div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Upcoming</p>
                    <h4 className="text-3xl font-extrabold text-slate-800">{appointments.filter(a => a.status === 'Upcoming').length}</h4>
                    <span className="text-[10px] text-amber-600 font-bold mt-1 block bg-amber-50 inline-block px-1.5 rounded">Action needed</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-2 h-full bg-emerald-500"></div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Completed</p>
                    <h4 className="text-3xl font-extrabold text-slate-800">{appointments.filter(a => a.status === 'Completed').length}</h4>
                    <span className="text-[10px] text-emerald-600 font-bold mt-1 block bg-emerald-50 inline-block px-1.5 rounded">Successfully held</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-2 h-full bg-slate-400"></div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total</p>
                    <h4 className="text-3xl font-extrabold text-slate-800">{appointments.length}</h4>
                    <span className="text-[10px] text-slate-600 font-bold mt-1 block bg-slate-50 inline-block px-1.5 rounded">All records</span>
                </div>
            </div>

            {/* List and Calendar */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex border-b border-slate-200 overflow-x-auto hide-scrollbar">
                    {[
                        { id: 'all', label: 'All Appointments', icon: 'fa-calendar-alt' },
                        { id: 'pending', label: 'Pending Approval', icon: 'fa-clock' },
                        { id: 'upcoming', label: 'Upcoming', icon: 'fa-hourglass-half' },
                        { id: 'today', label: 'Today', icon: 'fa-calendar-day' },
                        { id: 'past', label: 'Completed', icon: 'fa-check-circle' },
                        { id: 'cancelled', label: 'Cancelled', icon: 'fa-times-circle' },
                        { id: 'calendar', label: 'Calendar View', icon: 'fa-calendar' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id as any); setCurrentPage(1); }}
                            className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                                activeTab === tab.id ? 'border-[#02275A] text-[#02275A] bg-slate-50' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                            }`}
                        >
                            <i className={`fas ${tab.icon}`}></i> {tab.label}
                        </button>
                    ))}
                </div>
                
                <div className="p-6 bg-slate-50 space-y-4">
                    {/* Global Filter Panel */}
                    <div className="flex flex-col lg:flex-row gap-3 lg:items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <i className="fas fa-search text-slate-400"></i>
                            </div>
                            <input
                                type="text"
                                placeholder="Search by name or business..."
                                className="bg-slate-50 w-full pl-10 pr-4 py-2 rounded-lg text-sm border-transparent focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            {/* BRM Filter */}
                            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">BRM:</span>
                                <select 
                                    className="bg-transparent border-transparent text-xs py-0 pl-1 pr-6 focus:ring-0 outline-none font-bold text-slate-700 cursor-pointer"
                                    value={selectedBrm}
                                    onChange={(e) => { setSelectedBrm(e.target.value); setCurrentPage(1); }}
                                >
                                    <option value="All">All BRMs</option>
                                    {brmOptions.map(brm => (
                                        <option key={brm} value={brm}>{brm}</option>
                                    ))}
                                </select>
                            </div>

                            {/* State Manager Filter */}
                            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">State Mgr:</span>
                                <select 
                                    className="bg-transparent border-transparent text-xs py-0 pl-1 pr-6 focus:ring-0 outline-none font-bold text-slate-700 cursor-pointer"
                                    value={selectedManager}
                                    onChange={(e) => { setSelectedManager(e.target.value); setCurrentPage(1); }}
                                >
                                    <option value="All">All Managers</option>
                                    {managerOptions.map(manager => (
                                        <option key={manager} value={manager}>{manager}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Type:</span>
                                <select 
                                    className="bg-transparent border-transparent text-xs py-0 pl-1 pr-6 focus:ring-0 outline-none font-bold text-slate-700 cursor-pointer"
                                    value={filterType}
                                    onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
                                >
                                    <option value="All">All Types</option>
                                    <option value="Discovery Call">Discovery Call</option>
                                    <option value="Direct Demo">Direct Demo</option>
                                    <option value="Follow up">Follow up</option>
                                </select>
                            </div>
                            
                            {activeTab !== 'calendar' && (
                                <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sort:</span>
                                    <select 
                                        className="bg-transparent border-transparent text-xs py-0 pl-1 pr-6 focus:ring-0 outline-none font-bold text-slate-700 cursor-pointer"
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value as any)}
                                    >
                                        <option value="date-asc">Oldest First</option>
                                        <option value="date-desc">Newest First</option>
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>

                    {activeTab === 'calendar' ? renderCalendar() : renderAppointmentsList()}
                </div>
            </div>

            {/* Generate Booking Link Modal */}
            {showLinkModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in-up">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-extrabold text-xl text-slate-800 flex items-center gap-2">
                                <i className="fas fa-link text-[#02275A]"></i> Generate Booking Link
                            </h3>
                            <button onClick={() => setShowLinkModal(false)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 hover:text-slate-700 transition-colors">
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
                                <div className="flex gap-3 pt-2 border-t border-blue-100/50">
                                    <i className="fas fa-video text-blue-500 mt-0.5 text-base"></i>
                                    <span className="leading-relaxed">
                                        <strong>Company Meeting Active:</strong> A secure Prokip Meet link will be automatically generated for all your appointments. Prospects do not need an account to join.
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Settings Modal */}
            {showSettingsModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
                            <h3 className="font-extrabold text-xl text-slate-800 flex items-center gap-2">
                                <i className="fas fa-cog text-[#02275A]"></i> Booking Settings
                            </h3>
                            <button onClick={() => setShowSettingsModal(false)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 hover:text-slate-700 transition-colors">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-6">
                            {/* Weekly Schedule */}
                            <div>
                                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
                                    <h4 className="text-sm font-bold text-slate-800">Weekly Schedule</h4>
                                    <span className="text-xs text-slate-500">Working hours & breaks</span>
                                </div>
                                <div className="space-y-4">
                                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                                        const daySettings = settings.schedule[day];
                                        return (
                                            <div key={day} className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-6 pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                                                <div className="w-32 flex items-center gap-3 pt-2">
                                                    <button 
                                                        onClick={() => setSettings({...settings, schedule: {...settings.schedule, [day]: {...daySettings, enabled: !daySettings.enabled}}})}
                                                        className={`w-10 h-5 rounded-full transition-colors relative outline-none shrink-0 ${daySettings.enabled ? 'bg-indigo-500' : 'bg-slate-300'}`}
                                                    >
                                                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${daySettings.enabled ? 'left-5' : 'left-1'}`}></div>
                                                    </button>
                                                    <span className={`text-sm font-bold transition-colors ${daySettings.enabled ? 'text-slate-800' : 'text-slate-400'}`}>{day}</span>
                                                </div>
                                                
                                                <div className="flex-1 space-y-3">
                                                    {daySettings.enabled ? (
                                                        <>
                                                            <div className="flex items-center gap-2">
                                                                <input 
                                                                    type="time" 
                                                                    value={daySettings.startTime}
                                                                    onChange={(e) => setSettings({...settings, schedule: {...settings.schedule, [day]: {...daySettings, startTime: e.target.value}}})}
                                                                    className="bg-slate-50 border border-slate-200 text-sm font-medium text-slate-700 rounded-lg py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#02275A]/20"
                                                                />
                                                                <span className="text-slate-400 text-sm">-</span>
                                                                <input 
                                                                    type="time" 
                                                                    value={daySettings.endTime}
                                                                    onChange={(e) => setSettings({...settings, schedule: {...settings.schedule, [day]: {...daySettings, endTime: e.target.value}}})}
                                                                    className="bg-slate-50 border border-slate-200 text-sm font-medium text-slate-700 rounded-lg py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#02275A]/20"
                                                                />
                                                            </div>
                                                            
                                                            {/* Breaks for this day */}
                                                            {daySettings.breaks.length > 0 && (
                                                                <div className="space-y-2 mt-2">
                                                                    {daySettings.breaks.map(b => (
                                                                        <div key={b.id} className="flex items-center gap-2 pl-4 border-l-2 border-rose-100 relative">
                                                                            <span className="absolute -left-12 top-1.5 text-[10px] font-bold text-rose-400 uppercase">Break</span>
                                                                            <input 
                                                                                type="time" 
                                                                                value={b.start}
                                                                                onChange={(e) => setSettings({...settings, schedule: {...settings.schedule, [day]: {...daySettings, breaks: daySettings.breaks.map(item => item.id === b.id ? {...item, start: e.target.value} : item)}}})}
                                                                                className="w-24 bg-rose-50 border-transparent text-sm font-medium text-rose-700 rounded-lg py-1 px-2 focus:outline-none focus:ring-2 focus:ring-rose-200"
                                                                            />
                                                                            <span className="text-slate-400 text-sm">-</span>
                                                                            <input 
                                                                                type="time" 
                                                                                value={b.end}
                                                                                onChange={(e) => setSettings({...settings, schedule: {...settings.schedule, [day]: {...daySettings, breaks: daySettings.breaks.map(item => item.id === b.id ? {...item, end: e.target.value} : item)}}})}
                                                                                className="w-24 bg-rose-50 border-transparent text-sm font-medium text-rose-700 rounded-lg py-1 px-2 focus:outline-none focus:ring-2 focus:ring-rose-200"
                                                                            />
                                                                            <button 
                                                                                onClick={() => setSettings({...settings, schedule: {...settings.schedule, [day]: {...daySettings, breaks: daySettings.breaks.filter(item => item.id !== b.id)}}})}
                                                                                className="w-6 h-6 rounded-full text-rose-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors ml-2"
                                                                            >
                                                                                <i className="fas fa-times"></i>
                                                                            </button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                            <button 
                                                                onClick={() => setSettings({...settings, schedule: {...settings.schedule, [day]: {...daySettings, breaks: [...daySettings.breaks, { id: Date.now(), start: '12:00', end: '13:00' }]}}})}
                                                                className="text-xs text-[#02275A] font-bold hover:underline py-1 mt-1 flex items-center gap-1"
                                                            >
                                                                <i className="fas fa-plus"></i> Add break
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <span className="text-sm font-medium text-slate-400 block pt-2">Unavailable</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            
                            {/* Booking Rules */}
                            <div>
                                <h4 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Booking Rules</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-bold text-slate-700">Buffer Period</p>
                                            <p className="text-[10px] text-slate-500">Time needed between appointments</p>
                                        </div>
                                        <select 
                                            value={settings.bufferPeriod}
                                            onChange={(e) => setSettings({...settings, bufferPeriod: e.target.value})}
                                            className="bg-slate-50 border border-slate-200 text-sm rounded-lg py-2 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-[#02275A]/20 font-bold text-slate-700 cursor-pointer"
                                        >
                                            <option value="0">None</option>
                                            <option value="10">10 minutes</option>
                                            <option value="15">15 minutes</option>
                                            <option value="30">30 minutes</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-bold text-slate-700">Auto-Approve Bookings</p>
                                            <p className="text-[10px] text-slate-500">Instantly approve incoming slots</p>
                                        </div>
                                        <button 
                                            onClick={() => setSettings({...settings, autoApprove: !settings.autoApprove})}
                                            className={`w-12 h-6 rounded-full transition-colors relative outline-none ${settings.autoApprove ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.autoApprove ? 'left-7' : 'left-1'}`}></div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-100 flex gap-3 bg-slate-50/50 shrink-0">
                            <button onClick={() => { showSuccess('Settings saved successfully'); setShowSettingsModal(false); }} className="flex-1 py-3 bg-[#02275A] text-white font-bold text-sm rounded-xl hover:bg-[#02275A]/90 transition-colors shadow">Save Settings</button>
                            <button onClick={() => setShowSettingsModal(false)} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reschedule Modal */}
            {rescheduleApt && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-extrabold text-lg text-slate-800">
                                Reschedule Appointment
                            </h3>
                            <button onClick={() => setRescheduleApt(null)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 hover:text-slate-700 transition-colors">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">New Date</label>
                                <input 
                                    type="date" 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#02275A]/20"
                                    value={rescheduleDate}
                                    onChange={(e) => setRescheduleDate(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">New Time</label>
                                <input 
                                    type="time" 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#02275A]/20"
                                    value={rescheduleTime}
                                    onChange={(e) => setRescheduleTime(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-100 flex gap-3 bg-slate-50/50">
                            <button 
                                onClick={() => {
                                    if (!rescheduleDate || !rescheduleTime) {
                                        alert('Please select both date and time');
                                        return;
                                    }
                                    setAppointments(appointments.map(a => a.id === rescheduleApt.id ? { ...a, date: rescheduleDate, time: rescheduleTime, status: 'Upcoming' } : a));
                                    showSuccess('Appointment rescheduled successfully');
                                    setRescheduleApt(null);
                                    setRescheduleDate('');
                                    setRescheduleTime('');
                                }}
                                className="flex-1 py-3 bg-[#02275A] text-white font-bold text-sm rounded-xl hover:bg-[#02275A]/90 transition-colors shadow"
                            >
                                Confirm Reschedule
                            </button>
                            <button onClick={() => setRescheduleApt(null)} className="px-5 py-3 bg-white border border-slate-200 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AppointmentsView;
