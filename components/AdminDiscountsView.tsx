import React, { useState, useEffect } from 'react';
import { Discount, UserRole, DiscountTimelineEvent, DiscountAuditLog } from '../types';
import { useAlert } from '../contexts/AlertContext';

interface AdminDiscountsViewProps {
    userRole: UserRole;
    userDepartment?: string;
}

// Initial mock data to ensure immediate working state
const INITIAL_MOCK_DISCOUNTS: Discount[] = [
    {
        id: 'DSC-101',
        percentage: 20,
        leadType: 'Company Lead',
        validFrom: '2026-07-20T08:00',
        validTo: '2026-08-05T23:59',
        status: 'Active',
        createdBy: 'providence@prokip.africa',
        dateCreated: '2026-07-19',
        lastUpdated: '2026-07-19 14:30',
        timeline: [
            { status: 'Created', timestamp: '2026-07-19 14:30', label: 'Discount created in draft state' },
            { status: 'Scheduled', timestamp: '2026-07-19 14:30', label: 'Automatically scheduled to start on 20 July' },
            { status: 'Activated', timestamp: '2026-07-20 08:00', label: 'Discount is now live and available on new invoices' }
        ],
        auditHistory: [
            { user: 'providence@prokip.africa', timestamp: '2026-07-19 14:30', action: 'Created', details: 'Created 20% discount for Company Leads' }
        ]
    },
    {
        id: 'DSC-102',
        percentage: 15,
        leadType: 'Company Lead',
        validFrom: '2026-08-10T09:00',
        validTo: '2026-08-20T18:00',
        status: 'Upcoming',
        createdBy: 'manager@prokip.africa',
        dateCreated: '2026-07-21',
        lastUpdated: '2026-07-21 09:15',
        timeline: [
            { status: 'Created', timestamp: '2026-07-21 09:15', label: 'Discount created by Sales Manager' },
            { status: 'Scheduled', timestamp: '2026-07-21 09:15', label: 'Scheduled to activate automatically on 10 Aug' }
        ],
        auditHistory: [
            { user: 'manager@prokip.africa', timestamp: '2026-07-21 09:15', action: 'Created', details: 'Created 15% discount for Company Leads' }
        ]
    },
    {
        id: 'DSC-103',
        percentage: 10,
        leadType: 'Company Lead',
        validFrom: '2026-07-01T08:00',
        validTo: '2026-07-10T23:59',
        status: 'Expired',
        createdBy: 'providence@prokip.africa',
        dateCreated: '2026-06-29',
        lastUpdated: '2026-07-10 23:59',
        timeline: [
            { status: 'Created', timestamp: '2026-06-29 10:00', label: 'Discount created by providence@prokip.africa' },
            { status: 'Scheduled', timestamp: '2026-06-29 10:00', label: 'Scheduled for 1 July' },
            { status: 'Activated', timestamp: '2026-07-01 08:00', label: 'Went live' },
            { status: 'Expired', timestamp: '2026-07-10 23:59', label: 'Validity period concluded' }
        ],
        auditHistory: [
            { user: 'providence@prokip.africa', timestamp: '2026-06-29 10:00', action: 'Created', details: 'Created 10% discount for Company Leads' },
            { user: 'System', timestamp: '2026-07-10 23:59', action: 'Applied', details: 'Automatically expired based on date configuration' }
        ]
    }
];

export const AdminDiscountsView: React.FC<AdminDiscountsViewProps> = ({ userRole, userDepartment }) => {
    const { showSuccess, showError, showWarning } = useAlert();
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const [currentScreen, setCurrentScreen] = useState<'list' | 'create' | 'details' | 'edit'>('list');
    const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(null);

    // Search and Filters state
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [percentFilter, setPercentFilter] = useState<string>('all');
    const [startDateFilter, setStartDateFilter] = useState('');
    const [endDateFilter, setEndDateFilter] = useState('');

    // Form states
    const [formPercent, setFormPercent] = useState<5 | 10 | 15 | 20 | 25>(20);
    const [formStartDate, setFormStartDate] = useState('');
    const [formStartTime, setFormStartTime] = useState('08:00');
    const [formEndDate, setFormEndDate] = useState('');
    const [formEndTime, setFormEndTime] = useState('23:59');

    // Modals state
    const [showConfirmCreateModal, setShowConfirmCreateModal] = useState(false);
    const [showConfirmEndModal, setShowConfirmEndModal] = useState(false);
    const [discountToEnd, setDiscountToEnd] = useState<Discount | null>(null);

    // Load and sync discounts
    useEffect(() => {
        const stored = localStorage.getItem('prokip_discounts');
        if (stored) {
            try {
                const parsed = JSON.parse(stored) as Discount[];
                // Update statuses based on current time
                const updated = parsed.map(updateDiscountStatus);
                setDiscounts(updated);
                localStorage.setItem('prokip_discounts', JSON.stringify(updated));
            } catch (e) {
                console.error(e);
                setDiscounts(INITIAL_MOCK_DISCOUNTS);
            }
        } else {
            setDiscounts(INITIAL_MOCK_DISCOUNTS);
            localStorage.setItem('prokip_discounts', JSON.stringify(INITIAL_MOCK_DISCOUNTS));
        }
    }, []);

    // Get current user identifier
    const getCurrentUser = () => {
        return localStorage.getItem('logged_in_email') || `${userRole}@prokip.africa`;
    };

    // Helper to evaluate discount status based on current time
    const updateDiscountStatus = (d: Discount): Discount => {
        if (d.status === 'Ended') return d; // If ended early, keep as Ended

        const now = new Date().getTime();
        const start = new Date(d.validFrom).getTime();
        const end = new Date(d.validTo).getTime();

        let newStatus: 'Active' | 'Upcoming' | 'Expired' | 'Ended' = d.status;
        let timelineUpdated = [...d.timeline];

        if (now < start) {
            newStatus = 'Upcoming';
        } else if (now >= start && now <= end) {
            newStatus = 'Active';
            // Add timeline event if transition happened
            if (d.status === 'Upcoming' && !d.timeline.some(t => t.status === 'Activated')) {
                timelineUpdated.push({
                    status: 'Activated',
                    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
                    label: 'Discount is now live and available on new invoices'
                });
            }
        } else {
            newStatus = 'Expired';
            if ((d.status === 'Active' || d.status === 'Upcoming') && !d.timeline.some(t => t.status === 'Expired')) {
                timelineUpdated.push({
                    status: 'Expired',
                    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
                    label: 'Validity period concluded'
                });
            }
        }

        return {
            ...d,
            status: newStatus,
            timeline: timelineUpdated
        };
    };

    // Helper to save discounts state
    const saveDiscounts = (updatedList: Discount[]) => {
        setDiscounts(updatedList);
        localStorage.setItem('prokip_discounts', JSON.stringify(updatedList));
    };

    // Form inputs change handler for live preview
    const getFormattedDateTime = (d: string, t: string) => {
        if (!d) return '';
        return `${d}T${t || '00:00'}`;
    };

    // Check for overlapping discounts or already existing active discount for same period
    const checkOverlappingDiscount = (startStr: string, endStr: string, excludeId?: string) => {
        const start = new Date(startStr).getTime();
        const end = new Date(endStr).getTime();

        for (const d of discounts) {
            if (excludeId && d.id === excludeId) continue;
            if (d.status === 'Ended' || d.status === 'Expired') continue;

            const dStart = new Date(d.validFrom).getTime();
            const dEnd = new Date(d.validTo).getTime();

            // Overlap check
            if (start < dEnd && end > dStart) {
                return d;
            }
        }
        return null;
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!formStartDate || !formEndDate) {
            showError('Please enter start and end validity dates.');
            return;
        }

        const validFromStr = getFormattedDateTime(formStartDate, formStartTime);
        const validToStr = getFormattedDateTime(formEndDate, formEndTime);

        const startMs = new Date(validFromStr).getTime();
        const endMs = new Date(validToStr).getTime();

        if (endMs <= startMs) {
            showError('End date and time must be later than Start date and time.');
            return;
        }

        // Overlap validation
        const overlap = checkOverlappingDiscount(validFromStr, validToStr);
        if (overlap) {
            showError(`Overlap Detected: A ${overlap.percentage}% discount is already active/upcoming during this period (${new Date(overlap.validFrom).toLocaleDateString()} to ${new Date(overlap.validTo).toLocaleDateString()}). Only one Company Lead discount is allowed at a time.`);
            return;
        }

        // Show confirmation modal
        setShowConfirmCreateModal(true);
    };

    const confirmCreateDiscount = () => {
        const validFromStr = getFormattedDateTime(formStartDate, formStartTime);
        const validToStr = getFormattedDateTime(formEndDate, formEndTime);
        const user = getCurrentUser();
        const todayStr = new Date().toISOString().split('T')[0];
        const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

        const isLiveNow = new Date().getTime() >= new Date(validFromStr).getTime() && new Date().getTime() <= new Date(validToStr).getTime();
        const initialStatus = isLiveNow ? 'Active' : 'Upcoming';

        const newId = `DSC-${Math.floor(100 + Math.random() * 900)}`;

        const timelineEvents: DiscountTimelineEvent[] = [
            {
                status: 'Created',
                timestamp: nowStr,
                label: `Discount created by ${user}`
            },
            {
                status: 'Scheduled',
                timestamp: nowStr,
                label: `Scheduled to activate from ${formStartDate} at ${formStartTime}`
            }
        ];

        if (isLiveNow) {
            timelineEvents.push({
                status: 'Activated',
                timestamp: nowStr,
                label: 'Discount is now live and available on new invoices'
            });
        }

        const newDiscount: Discount = {
            id: newId,
            percentage: formPercent,
            leadType: 'Company Lead',
            validFrom: validFromStr,
            validTo: validToStr,
            status: initialStatus,
            createdBy: user,
            dateCreated: todayStr,
            lastUpdated: nowStr,
            timeline: timelineEvents,
            auditHistory: [
                {
                    user,
                    timestamp: nowStr,
                    action: 'Created',
                    details: `Created ${formPercent}% Company Lead discount scheduled for ${formStartDate} - ${formEndDate}`
                }
            ]
        };

        const updated = [newDiscount, ...discounts];
        saveDiscounts(updated);
        setShowConfirmCreateModal(false);
        setCurrentScreen('list');
        showSuccess(`Discount Created Successfully! Promo code ${newId} is active.`);
    };

    const handleEndDiscountClick = (d: Discount) => {
        setDiscountToEnd(d);
        setShowConfirmEndModal(true);
    };

    const confirmEndDiscount = () => {
        if (!discountToEnd) return;
        const user = getCurrentUser();
        const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

        const updated = discounts.map(d => {
            if (d.id === discountToEnd.id) {
                return {
                    ...d,
                    status: 'Ended' as const,
                    lastUpdated: nowStr,
                    timeline: [
                        ...d.timeline,
                        {
                            status: 'Ended Early' as const,
                            timestamp: nowStr,
                            label: `Terminated early by ${user}`
                        }
                    ],
                    auditHistory: [
                        ...d.auditHistory,
                        {
                            user,
                            timestamp: nowStr,
                            action: 'Ended' as const,
                            details: `Ended discount campaign early`
                        }
                    ]
                };
            }
            return d;
        });

        saveDiscounts(updated);
        setShowConfirmEndModal(false);
        setDiscountToEnd(null);
        showSuccess('Discount Ended Successfully! This promo is no longer available.');
        
        if (selectedDiscount && selectedDiscount.id === discountToEnd.id) {
            const fresh = updated.find(d => d.id === discountToEnd.id) || null;
            setSelectedDiscount(fresh);
        }
    };

    // Filtered lists
    const filteredDiscounts = discounts.filter(d => {
        // Search
        const matchesSearch = d.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              d.createdBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              d.percentage.toString().includes(searchTerm) ||
                              d.leadType.toLowerCase().includes(searchTerm.toLowerCase());

        // Status filter
        const matchesStatus = statusFilter === 'all' || d.status.toLowerCase() === statusFilter.toLowerCase();

        // Percent filter
        const matchesPercent = percentFilter === 'all' || d.percentage.toString() === percentFilter;

        // Date range filter
        let matchesDates = true;
        if (startDateFilter) {
            const filterStart = new Date(startDateFilter).getTime();
            const dStart = new Date(d.validFrom).getTime();
            matchesDates = matchesDates && (dStart >= filterStart);
        }
        if (endDateFilter) {
            const filterEnd = new Date(endDateFilter + 'T23:59:59').getTime();
            const dEnd = new Date(d.validTo).getTime();
            matchesDates = matchesDates && (dEnd <= filterEnd);
        }

        return matchesSearch && matchesStatus && matchesPercent && matchesDates;
    });

    // Helper to format dates for elegant UI
    const formatPrettyDate = (isoStr: string) => {
        try {
            const date = new Date(isoStr);
            return date.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            }) + ', ' + date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } catch (e) {
            return isoStr;
        }
    };

    // Status badge style helper
    const getStatusBadgeStyle = (status: 'Active' | 'Upcoming' | 'Expired' | 'Ended') => {
        switch (status) {
            case 'Active':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'Upcoming':
                return 'bg-indigo-50 text-indigo-700 border-indigo-200';
            case 'Expired':
                return 'bg-slate-100 text-slate-600 border-slate-200';
            case 'Ended':
                return 'bg-rose-50 text-rose-700 border-rose-200';
            default:
                return 'bg-slate-50 text-slate-500 border-slate-200';
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in" id="discount-management-module">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl text-lg flex items-center justify-center">
                            <i className="fas fa-tags"></i>
                        </span>
                        <h2 className="text-xl font-bold text-slate-900">Discount Management</h2>
                    </div>
                    <p className="text-sm text-slate-500">
                        Manage temporary promotional discounts for Business Onboarding invoices. Authorized roles only.
                    </p>
                </div>
                {currentScreen === 'list' && (
                    <button
                        onClick={() => {
                            // Reset form
                            setFormPercent(20);
                            setFormStartDate(new Date().toISOString().split('T')[0]);
                            setFormStartTime('08:00');
                            setFormEndDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
                            setFormEndTime('23:59');
                            setCurrentScreen('create');
                        }}
                        className="px-5 py-3 bg-[#02275A] text-white text-sm font-bold rounded-xl shadow-md hover:bg-blue-900 transition-all flex items-center gap-2"
                        id="create-discount-btn"
                    >
                        <i className="fas fa-plus"></i> Create Discount
                    </button>
                )}
                {currentScreen !== 'list' && (
                    <button
                        onClick={() => setCurrentScreen('list')}
                        className="px-4 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm font-bold rounded-xl transition-all flex items-center gap-2"
                    >
                        <i className="fas fa-arrow-left"></i> Back to List
                    </button>
                )}
            </div>

            {/* SCREEN 1: LISTING VIEW */}
            {currentScreen === 'list' && (
                <>
                    {/* Filters Dashboard Panel */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                            <i className="fas fa-filter text-slate-400"></i>
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Search & Filters</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            {/* Search bar */}
                            <div className="relative">
                                <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
                                <input
                                    type="text"
                                    placeholder="Search campaign ID, creator..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-800"
                                />
                            </div>

                            {/* Status Filter */}
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-700"
                            >
                                <option value="all">All Statuses</option>
                                <option value="active">Active</option>
                                <option value="upcoming">Upcoming</option>
                                <option value="expired">Expired</option>
                                <option value="ended">Ended</option>
                            </select>

                            {/* Percent Filter */}
                            <select
                                value={percentFilter}
                                onChange={(e) => setPercentFilter(e.target.value)}
                                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-700"
                            >
                                <option value="all">All Percentages</option>
                                <option value="5">5% Discount</option>
                                <option value="10">10% Discount</option>
                                <option value="15">15% Discount</option>
                                <option value="20">20% Discount</option>
                                <option value="25">25% Discount</option>
                            </select>

                            {/* Date Range Start */}
                            <div className="relative">
                                <input
                                    type="date"
                                    value={startDateFilter}
                                    onChange={(e) => setStartDateFilter(e.target.value)}
                                    placeholder="Valid From"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-600"
                                />
                                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 pointer-events-none uppercase">From</span>
                            </div>

                            {/* Date Range End */}
                            <div className="relative">
                                <input
                                    type="date"
                                    value={endDateFilter}
                                    onChange={(e) => setEndDateFilter(e.target.value)}
                                    placeholder="Valid To"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-600"
                                />
                                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 pointer-events-none uppercase">To</span>
                            </div>
                        </div>

                        {/* Active Filters Clear Button */}
                        {(searchTerm || statusFilter !== 'all' || percentFilter !== 'all' || startDateFilter || endDateFilter) && (
                            <div className="flex justify-end pt-1">
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setStatusFilter('all');
                                        setPercentFilter('all');
                                        setStartDateFilter('');
                                        setEndDateFilter('');
                                    }}
                                    className="text-xs text-rose-500 font-semibold hover:text-rose-700 transition-colors flex items-center gap-1"
                                >
                                    <i className="fas fa-rotate-left"></i> Reset Active Filters
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Data Table / Empty state */}
                    {filteredDiscounts.length === 0 ? (
                        <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center text-3xl border border-slate-100">
                                <i className="fas fa-tags"></i>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold text-slate-800">No discounts found</h3>
                                <p className="text-sm text-slate-500 max-w-sm">
                                    No discounts match your current search queries or filters. Try adjusting your parameters or create a new campaign.
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setFormPercent(20);
                                    setFormStartDate(new Date().toISOString().split('T')[0]);
                                    setFormStartTime('08:00');
                                    setFormEndDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
                                    setFormEndTime('23:59');
                                    setCurrentScreen('create');
                                }}
                                className="px-5 py-2.5 bg-[#02275A] text-white text-xs font-bold rounded-xl shadow hover:bg-blue-900 transition-all flex items-center gap-2"
                            >
                                <i className="fas fa-plus"></i> Create Discount
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto no-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 text-slate-400 font-bold text-xs uppercase tracking-wider border-b border-slate-100">
                                            <th className="py-4 px-6">Discount</th>
                                            <th className="py-4 px-6">Lead Type</th>
                                            <th className="py-4 px-6">Validity Window</th>
                                            <th className="py-4 px-6">Status</th>
                                            <th className="py-4 px-6">Created By</th>
                                            <th className="py-4 px-6 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-sm">
                                        {filteredDiscounts.map((d) => (
                                            <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-2.5">
                                                        <span className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center font-extrabold text-sm">
                                                            {d.percentage}%
                                                        </span>
                                                        <div>
                                                            <div className="font-bold text-slate-800">{d.id}</div>
                                                            <div className="text-[10px] text-slate-400 font-semibold uppercase">ID Code</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 font-semibold text-slate-600">
                                                    {d.leadType}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="space-y-1">
                                                        <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                                            <i className="far fa-calendar-check text-[10px] text-emerald-500"></i>
                                                            {formatPrettyDate(d.validFrom)}
                                                        </div>
                                                        <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                                                            <i className="far fa-calendar-times text-[10px] text-rose-500"></i>
                                                            {formatPrettyDate(d.validTo)}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusBadgeStyle(d.status)}`}>
                                                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                                        {d.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-xs font-semibold text-slate-500">
                                                    <div className="space-y-0.5">
                                                        <div>{d.createdBy}</div>
                                                        <div className="text-[10px] font-medium text-slate-400">On {d.dateCreated}</div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedDiscount(d);
                                                                setCurrentScreen('details');
                                                            }}
                                                            className="h-8 px-3 text-xs font-bold bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-lg transition-all"
                                                        >
                                                            View Details
                                                        </button>
                                                        {d.status === 'Active' && (
                                                            <button
                                                                onClick={() => handleEndDiscountClick(d)}
                                                                className="h-8 px-3 text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg transition-all"
                                                            >
                                                                End Early
                                                            </button>
                                                        )}
                                                        {d.status === 'Upcoming' && (
                                                            <>
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedDiscount(d);
                                                                        setFormPercent(d.percentage);
                                                                        setFormStartDate(d.validFrom.split('T')[0]);
                                                                        setFormStartTime(d.validFrom.split('T')[1] || '09:00');
                                                                        setFormEndDate(d.validTo.split('T')[0]);
                                                                        setFormEndTime(d.validTo.split('T')[1] || '18:00');
                                                                        setCurrentScreen('edit');
                                                                    }}
                                                                    className="h-8 px-3 text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-all"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleEndDiscountClick(d)}
                                                                    className="h-8 px-3 text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg transition-all"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* SCREEN 2: CREATE DISCOUNT VIEW */}
            {currentScreen === 'create' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left 2 cols: Form Panel */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="pb-4 mb-6 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800">Create Promotional Discount</h3>
                            <p className="text-xs text-slate-400">Setup a new discount percentage and configure validity range.</p>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="space-y-6">
                            
                            {/* Section 1 — Discount Details */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 pb-2 border-b border-dashed border-slate-100">
                                    <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 font-bold text-xs flex items-center justify-center">1</span>
                                    <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Discount Details</h4>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Discount Percentage</label>
                                        <select
                                            value={formPercent}
                                            onChange={(e) => setFormPercent(Number(e.target.value) as any)}
                                            className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 text-slate-800"
                                            id="create-discount-percent"
                                        >
                                            <option value={5}>5% Promotional Discount</option>
                                            <option value={10}>10% Promotional Discount</option>
                                            <option value={15}>15% Promotional Discount</option>
                                            <option value={20}>20% Promotional Discount</option>
                                            <option value={25}>25% Promotional Discount</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Eligible Lead Type</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value="Company Lead"
                                                readOnly
                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-500 cursor-not-allowed outline-none"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-indigo-600 font-bold bg-indigo-50 px-2 py-1 rounded-lg">
                                                <i className="fas fa-lock text-[10px] mr-1"></i> Locked
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2 — Validity */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 pb-2 border-b border-dashed border-slate-100">
                                    <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 font-bold text-xs flex items-center justify-center">2</span>
                                    <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Campaign Validity Window</h4>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Valid From */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase">Campaign Start Date & Time</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <input
                                                type="date"
                                                value={formStartDate}
                                                onChange={(e) => setFormStartDate(e.target.value)}
                                                className="p-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 text-slate-700"
                                                required
                                            />
                                            <input
                                                type="time"
                                                value={formStartTime}
                                                onChange={(e) => setFormStartTime(e.target.value)}
                                                className="p-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 text-slate-700"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Valid To */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase">Campaign End Date & Time</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <input
                                                type="date"
                                                value={formEndDate}
                                                onChange={(e) => setFormEndDate(e.target.value)}
                                                className="p-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 text-slate-700"
                                                required
                                            />
                                            <input
                                                type="time"
                                                value={formEndTime}
                                                onChange={(e) => setFormEndTime(e.target.value)}
                                                className="p-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 text-slate-700"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <p className="text-xs text-indigo-600 bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100 flex gap-2">
                                    <i className="fas fa-info-circle text-sm mt-0.5"></i>
                                    <span>
                                        The discount will automatically become active at the selected start date and expire after the selected end date.
                                    </span>
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setCurrentScreen('list')}
                                    className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-[#02275A] text-white text-sm font-bold rounded-xl shadow-lg hover:bg-blue-900 transition-all flex items-center gap-2"
                                >
                                    Verify & Create Discount
                                </button>
                            </div>

                        </form>
                    </div>

                    {/* Right col: Section 3 — Live Preview Card */}
                    <div className="space-y-6">
                        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl space-y-6 relative overflow-hidden">
                            {/* Aesthetic background design */}
                            <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 w-36 h-36 bg-blue-700/10 rounded-full blur-xl pointer-events-none"></div>
                            
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Live Preview Card</h4>
                                    <div className="text-xl font-bold font-sans tracking-tight">Promotional Campaign</div>
                                </div>
                                <span className="p-2 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center text-sm border border-blue-500/10">
                                    <i className="fas fa-eye animate-pulse"></i>
                                </span>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-16 w-16 bg-blue-500 text-white rounded-2xl flex flex-col items-center justify-center font-extrabold text-2xl shadow-lg shadow-blue-500/20 border border-blue-400/20">
                                        {formPercent}%
                                        <span className="text-[8px] uppercase tracking-widest font-semibold block leading-none mt-0.5">OFF</span>
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">Recipient Qualification</div>
                                        <div className="font-bold text-base text-slate-100 flex items-center gap-1.5 mt-0.5">
                                            <i className="fas fa-check-circle text-emerald-400 text-sm"></i>
                                            Company Lead Only
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-slate-800 my-2"></div>

                                <div className="space-y-3">
                                    <div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Valid From:</div>
                                        <div className="text-xs font-bold text-slate-200 mt-1 flex items-center gap-1.5">
                                            <i className="far fa-clock text-blue-400"></i>
                                            {formStartDate ? formatPrettyDate(getFormattedDateTime(formStartDate, formStartTime)) : 'Select start date'}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Valid Until:</div>
                                        <div className="text-xs font-bold text-slate-200 mt-1 flex items-center gap-1.5">
                                            <i className="far fa-clock text-rose-400"></i>
                                            {formEndDate ? formatPrettyDate(getFormattedDateTime(formEndDate, formEndTime)) : 'Select end date'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-800 flex gap-2.5 items-center text-xs text-slate-300">
                                <i className="fas fa-receipt text-blue-400 text-sm"></i>
                                <span>Applied instantly at checkout for qualifying invoices.</span>
                            </div>
                        </div>

                        {/* Invoice discount sample card */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Example Breakdown (₦200,000 package)</h4>
                            <div className="space-y-2.5 text-xs text-slate-600">
                                <div className="flex justify-between">
                                    <span>Company Package Subscription</span>
                                    <span className="font-semibold text-slate-800">₦200,000</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Hardware Services (Non-discountable)</span>
                                    <span className="font-semibold text-slate-800">₦30,000</span>
                                </div>
                                <div className="flex justify-between text-emerald-600 font-bold bg-emerald-50/50 p-2 rounded-lg">
                                    <span>Discount Applied ({formPercent}%)</span>
                                    <span>-₦{(200000 * (formPercent / 100)).toLocaleString()}</span>
                                </div>
                                <div className="border-t border-slate-100 pt-2.5 flex justify-between font-bold text-sm text-slate-800">
                                    <span>Grand Total</span>
                                    <span className="text-[#02275A]">₦{(230000 - (200000 * (formPercent / 100))).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* SCREEN 3: EDIT DISCOUNT VIEW */}
            {currentScreen === 'edit' && selectedDiscount && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-2xl mx-auto">
                    <div className="pb-4 mb-6 border-b border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800">Edit Upcoming Discount Campaign ({selectedDiscount.id})</h3>
                        <p className="text-xs text-slate-400">Modifying scheduled validity period and percentage. Active campaigns cannot be edited.</p>
                    </div>

                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const validFromStr = getFormattedDateTime(formStartDate, formStartTime);
                        const validToStr = getFormattedDateTime(formEndDate, formEndTime);

                        const startMs = new Date(validFromStr).getTime();
                        const endMs = new Date(validToStr).getTime();

                        if (endMs <= startMs) {
                            showError('End date and time must be later than Start date and time.');
                            return;
                        }

                        // Overlap validation (excluding current discount)
                        const overlap = checkOverlappingDiscount(validFromStr, validToStr, selectedDiscount.id);
                        if (overlap) {
                            showError(`Overlap Detected: A ${overlap.percentage}% discount is active/upcoming during this period. Overlaps are forbidden.`);
                            return;
                        }

                        // Save update
                        const user = getCurrentUser();
                        const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

                        const updated = discounts.map(d => {
                            if (d.id === selectedDiscount.id) {
                                return {
                                    ...d,
                                    percentage: formPercent,
                                    validFrom: validFromStr,
                                    validTo: validToStr,
                                    lastUpdated: nowStr,
                                    auditHistory: [
                                        ...d.auditHistory,
                                        {
                                            user,
                                            timestamp: nowStr,
                                            action: 'Updated' as const,
                                            details: `Updated campaign parameters to ${formPercent}% for range ${formStartDate} - ${formEndDate}`
                                        }
                                    ]
                                };
                            }
                            return d;
                        });

                        saveDiscounts(updated);
                        setCurrentScreen('list');
                        showSuccess('Discount Updated Successfully!');
                    }} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Discount Percentage</label>
                                <select
                                    value={formPercent}
                                    onChange={(e) => setFormPercent(Number(e.target.value) as any)}
                                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 text-slate-800"
                                >
                                    <option value={5}>5%</option>
                                    <option value={10}>10%</option>
                                    <option value={15}>15%</option>
                                    <option value={20}>20%</option>
                                    <option value={25}>25%</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Lead Type</label>
                                <input
                                    type="text"
                                    value="Company Lead"
                                    readOnly
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-500 cursor-not-allowed outline-none"
                                />
                            </div>
                        </div>

                        {/* Validity dates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase">Start Date & Time</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="date"
                                        value={formStartDate}
                                        onChange={(e) => setFormStartDate(e.target.value)}
                                        className="p-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 text-slate-700"
                                        required
                                    />
                                    <input
                                        type="time"
                                        value={formStartTime}
                                        onChange={(e) => setFormStartTime(e.target.value)}
                                        className="p-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 text-slate-700"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase">End Date & Time</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="date"
                                        value={formEndDate}
                                        onChange={(e) => setFormEndDate(e.target.value)}
                                        className="p-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 text-slate-700"
                                        required
                                    />
                                    <input
                                        type="time"
                                        value={formEndTime}
                                        onChange={(e) => setFormEndTime(e.target.value)}
                                        className="p-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 text-slate-700"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setCurrentScreen('list')}
                                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-3 bg-[#02275A] text-white text-sm font-bold rounded-xl shadow-lg hover:bg-blue-900 transition-all"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* SCREEN 4: DETAILS VIEW */}
            {currentScreen === 'details' && selectedDiscount && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left 2 Cols: Main Info card */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Overview Information */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                            <div className="flex justify-between items-start pb-4 border-b border-slate-100">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-bold text-slate-800">Campaign {selectedDiscount.id} Overview</h3>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadgeStyle(selectedDiscount.status)}`}>
                                            {selectedDiscount.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">Full structural campaign properties and operational constraints.</p>
                                </div>
                                {selectedDiscount.status === 'Active' && (
                                    <button
                                        onClick={() => handleEndDiscountClick(selectedDiscount)}
                                        className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold transition-all"
                                    >
                                        <i className="fas fa-times-circle mr-1"></i> End Campaign
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
                                <div className="space-y-1">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Discount Rate</span>
                                    <span className="font-extrabold text-slate-800 text-lg flex items-center gap-1.5">
                                        <i className="fas fa-percentage text-indigo-500"></i>
                                        {selectedDiscount.percentage}% Discount
                                    </span>
                                </div>

                                <div className="space-y-1">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Eligible Audience</span>
                                    <span className="font-bold text-slate-700 text-base">
                                        {selectedDiscount.leadType}
                                    </span>
                                </div>

                                <div className="space-y-1">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Created By</span>
                                    <span className="font-semibold text-slate-600 block truncate">
                                        {selectedDiscount.createdBy}
                                    </span>
                                </div>

                                <div className="space-y-1">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Created Date</span>
                                    <span className="font-semibold text-slate-600">
                                        {selectedDiscount.dateCreated}
                                    </span>
                                </div>

                                <div className="space-y-1">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Last Updated</span>
                                    <span className="font-semibold text-slate-600">
                                        {selectedDiscount.lastUpdated}
                                    </span>
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-6 space-y-4">
                                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Validity Period</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
                                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100">
                                            <i className="far fa-clock"></i>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Start Date & Time</span>
                                            <span className="text-sm font-bold text-slate-700">{formatPrettyDate(selectedDiscount.validFrom)}</span>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
                                        <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center border border-rose-100">
                                            <i className="far fa-clock"></i>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Expiration Date & Time</span>
                                            <span className="text-sm font-bold text-slate-700">{formatPrettyDate(selectedDiscount.validTo)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Audit History Log */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                                <i className="fas fa-file-invoice-dollar text-slate-400"></i>
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Audit Trail Logs</h3>
                            </div>
                            <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto no-scrollbar pr-1">
                                {selectedDiscount.auditHistory.map((log, idx) => (
                                    <div key={idx} className="py-3 flex justify-between items-start text-xs gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1.5 font-bold text-slate-700">
                                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                                                    log.action === 'Created' ? 'bg-indigo-100 text-indigo-700' :
                                                    log.action === 'Updated' ? 'bg-amber-100 text-amber-700' :
                                                    log.action === 'Ended' ? 'bg-rose-100 text-rose-700' :
                                                    'bg-emerald-100 text-emerald-700'
                                                }`}>
                                                    {log.action}
                                                </span>
                                                {log.details || 'Campaign Status Action'}
                                            </div>
                                            <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                                <i className="far fa-user text-[9px]"></i>
                                                User: {log.user}
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">{log.timestamp}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right col: Activity Timeline */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                        <div className="pb-3 border-b border-slate-100">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Campaign Life Cycle Timeline</h3>
                        </div>

                        <div className="relative pl-6 border-l border-slate-200 ml-3 space-y-8 py-2">
                            {/* Created event */}
                            <div className="relative">
                                <span className="absolute -left-[31px] top-0.5 w-4.5 h-4.5 rounded-full bg-emerald-500 border-4 border-white shadow-sm flex items-center justify-center text-[7px] text-white">
                                    <i className="fas fa-check"></i>
                                </span>
                                <div>
                                    <h4 className="text-xs font-extrabold text-slate-800">Campaign Created</h4>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Promo structures initialized in system state.</p>
                                    <span className="text-[9px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded block w-fit mt-1">
                                        {selectedDiscount.dateCreated}
                                    </span>
                                </div>
                            </div>

                            {/* Scheduled event */}
                            <div className="relative">
                                <span className="absolute -left-[31px] top-0.5 w-4.5 h-4.5 rounded-full bg-indigo-500 border-4 border-white shadow-sm flex items-center justify-center text-[7px] text-white">
                                    <i className="fas fa-check"></i>
                                </span>
                                <div>
                                    <h4 className="text-xs font-extrabold text-slate-800">Campaign Scheduled</h4>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Awaiting countdown period validation.</p>
                                    <span className="text-[9px] font-bold text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded block w-fit mt-1">
                                        From {formatPrettyDate(selectedDiscount.validFrom).split(',')[0]}
                                    </span>
                                </div>
                            </div>

                            {/* Activated event */}
                            <div className="relative">
                                <span className={`absolute -left-[31px] top-0.5 w-4.5 h-4.5 rounded-full border-4 border-white shadow-sm flex items-center justify-center text-[7px] text-white ${
                                    ['Active', 'Expired', 'Ended'].includes(selectedDiscount.status) ? 'bg-emerald-500' : 'bg-slate-300'
                                }`}>
                                    {['Active', 'Expired', 'Ended'].includes(selectedDiscount.status) && <i className="fas fa-check"></i>}
                                </span>
                                <div>
                                    <h4 className={`text-xs font-extrabold ${['Active', 'Expired', 'Ended'].includes(selectedDiscount.status) ? 'text-slate-800' : 'text-slate-400'}`}>
                                        Campaign Activated
                                    </h4>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Discount is live and automatically visible on checkouts.</p>
                                </div>
                            </div>

                            {/* Ended / Expired event */}
                            <div className="relative">
                                <span className={`absolute -left-[31px] top-0.5 w-4.5 h-4.5 rounded-full border-4 border-white shadow-sm flex items-center justify-center text-[7px] text-white ${
                                    selectedDiscount.status === 'Expired' ? 'bg-slate-500' :
                                    selectedDiscount.status === 'Ended' ? 'bg-rose-500' : 'bg-slate-300'
                                }`}>
                                    {['Expired', 'Ended'].includes(selectedDiscount.status) && <i className="fas fa-check"></i>}
                                </span>
                                <div>
                                    <h4 className={`text-xs font-extrabold ${['Expired', 'Ended'].includes(selectedDiscount.status) ? 'text-slate-800' : 'text-slate-400'}`}>
                                        Campaign Concluded
                                    </h4>
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                        {selectedDiscount.status === 'Ended' ? 'Ended early by authorization command.' : 'Automatically expired after end date constraint.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* CONFIRMATION MODAL: CREATE DISCOUNT */}
            {showConfirmCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100 flex items-center gap-2">
                            <span className="text-indigo-600 text-lg"><i className="fas fa-info-circle"></i></span>
                            <h3 className="font-extrabold text-slate-800 text-base">Confirm Campaign Creation</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-slate-600">
                                You are about to create a <strong className="text-indigo-600">{formPercent}%</strong> promotional discount for <strong className="text-slate-800">Company Leads</strong> that will run from:
                            </p>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs space-y-2 font-mono text-slate-600">
                                <div className="flex justify-between">
                                    <span>Start Date:</span>
                                    <span className="font-bold text-slate-800">{formStartDate} at {formStartTime}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>End Date:</span>
                                    <span className="font-bold text-slate-800">{formEndDate} at {formEndTime}</span>
                                </div>
                                <div className="flex justify-between border-t border-slate-200/50 pt-2 font-sans">
                                    <span className="font-semibold text-slate-500">Eligibility:</span>
                                    <span className="font-bold text-indigo-600 uppercase tracking-wider">Company Leads Only</span>
                                </div>
                            </div>

                            <p className="text-xs text-slate-400 italic">
                                * Active or Upcoming discounts cannot overlap. Make sure the timing constraint is valid.
                            </p>
                        </div>
                        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end gap-2">
                            <button
                                onClick={() => setShowConfirmCreateModal(false)}
                                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmCreateDiscount}
                                className="px-5 py-2 bg-[#02275A] text-white text-xs font-bold rounded-xl hover:bg-blue-900 shadow transition-all"
                                id="confirm-create-discount-submit"
                            >
                                Create Discount
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CONFIRMATION MODAL: END DISCOUNT */}
            {showConfirmEndModal && discountToEnd && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in">
                        <div className="bg-rose-50 px-6 py-4 border-b border-rose-100 flex items-center gap-2">
                            <span className="text-rose-600 text-lg"><i className="fas fa-exclamation-triangle"></i></span>
                            <h3 className="font-extrabold text-slate-800 text-base">Confirm Campaign Termination</h3>
                        </div>
                        <div className="p-6 space-y-3">
                            <p className="text-sm text-slate-600">
                                Are you sure you want to end early or cancel the <strong className="text-slate-800">{discountToEnd.percentage}% Company Lead</strong> discount (Code: {discountToEnd.id})?
                            </p>
                            <p className="text-xs text-rose-600 bg-rose-50 p-3 rounded-lg font-bold border border-rose-100 flex gap-1.5">
                                <i className="fas fa-info-circle text-sm mt-0.5"></i>
                                <span>This action will immediately stop this discount from being available on new invoices.</span>
                            </p>
                        </div>
                        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setShowConfirmEndModal(false);
                                    setDiscountToEnd(null);
                                }}
                                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmEndDiscount}
                                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow transition-all"
                                id="confirm-end-discount-submit"
                            >
                                End Discount
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};
