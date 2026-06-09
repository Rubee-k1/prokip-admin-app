import React, { useState, useMemo } from 'react';
import { useAlert } from '../contexts/AlertContext';

interface ActivityLog {
    id: string;
    type: 'Call' | 'Email' | 'Meeting' | 'Note';
    summary: string;
    date: string;
    loggedBy: string;
}

interface CSCustomer {
    id: string;
    businessName: string;
    customerName?: string;
    phone: string;
    email: string;
    username?: string;
    plan: string;
    mrr: number; // Monthly Revenue
    registrationDate: string;
    lastLoginDate: string | null;
    lastTransactionDate: string | null;
    renewalDate: string;
    upsellOpportunity: string | null;
    status: 'Active' | 'Not Active' | 'Lost' | 'New';
    healthScore: number; // 0 to 100
    healthTrend: 'improving' | 'falling' | 'no change';
    usageLevel: number; // 0 to 100%
    customerHappiness: number; // -100 to 100
    nextFollowUp: string | null;
    agent: string;
    manager: string;
    accountManager: string;
    tags: string[];
    logs: ActivityLog[];
    addons: string[];
    locationsCount: number;
    usersCount: number;
    industry: string;
    segment: string;
    businessType: string;
    billingHistory: {
        id: string;
        date: string;
        amount: number;
        description: string;
        status: 'Paid' | 'Failed' | 'Pending';
    }[];
    paymentDate?: string | null;
    onboardingCompleted?: boolean;
    conflictReported?: boolean;
    unresolvedTickets?: number;
    badReview?: boolean;
    location?: string;
}

const formatRelativeTime = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const now = new Date();
    
    // Reset time for day diff comparison
    const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const diffDays = Math.round((dateDay.getTime() - nowDay.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 1) return `in ${diffDays} days`;
    if (diffDays < -1) return `${Math.abs(diffDays)} days ago`;
    return dateString;
};

const AdminCustomerSuccessView: React.FC = () => {
    const { showSuccess, showError } = useAlert();
    const [activeDashboardTab, setActiveDashboardTab] = useState<'customers' | 'reports'>('customers');
    const [activeTab, setActiveTab] = useState<'all' | 'active' | 'onbd_delayed' | 'new_to_call' | 'checkins' | 'retention' | 'followups' | 'tickets'>('all');
    const [viewMode, setViewMode] = useState<string>('all');
    const [stateManagerFilter, setStateManagerFilter] = useState<string>('all');
    const [selectedTagConfig, setSelectedTagConfig] = useState<string>('all');
    const [selectedInactiveConfig, setSelectedInactiveConfig] = useState<string>('all');
    const [selectedRenewalConfig, setSelectedRenewalConfig] = useState<string>('all');
    const currentUser = 'Grace T.'; // Mocked current user
    
    // Mock Data representing the CS database
    const [customers, setCustomers] = useState<CSCustomer[]>([
        { id: 'CUS-001', businessName: 'Okafor Hardware', customerName: 'Chike Okafor', phone: '+2348000000001', email: 'hello@okafor.com', username: 'chike.okafor', plan: 'Premium', mrr: 45000, registrationDate: '2025-10-01', paymentDate: '2025-10-01', onboardingCompleted: true, lastLoginDate: '2026-05-15', lastTransactionDate: '2026-05-10', renewalDate: '2026-05-20', upsellOpportunity: 'Add-on Module A', status: 'Active', healthScore: 92, healthTrend: 'improving', usageLevel: 85, customerHappiness: 45, nextFollowUp: '2026-05-25', agent: 'Sarah O.', manager: 'John D.', accountManager: 'Grace T.', tags: ['Important', 'Uses App Daily', 'Renewal Soon'], logs: [{id:'log-1', type:'Call', summary:'Checked in, they are happy.', date:'2026-05-01', loggedBy:'Grace T.'}], addons: ['Inventory Plus', 'Multi-Store'], locationsCount: 3, usersCount: 12, industry: 'Retail', segment: 'B2B/B2C', businessType: 'Hardware', billingHistory: [{id:'inv-001', date:'2025-10-01', amount:45000, description:'Premium Plan - Monthly', status:'Paid'}], location: 'Lagos, NG' },
        { id: 'CUS-002', businessName: 'Kano Fabrics', customerName: 'Amina Kano', phone: '+2348000000002', email: 'sales@kanofabrics.ng', username: 'amina.kano', plan: 'Standard', mrr: 15000, registrationDate: '2026-05-01', paymentDate: '2026-05-01', onboardingCompleted: false, lastLoginDate: '2026-05-02', lastTransactionDate: '2026-05-01', renewalDate: '2027-05-01', upsellOpportunity: null, status: 'New', healthScore: 40, healthTrend: 'falling', usageLevel: 5, customerHappiness: 0, nextFollowUp: '2026-05-20', agent: 'Mike T.', manager: 'John D.', accountManager: 'Grace T.', tags: ['Onboarding Delayed'], logs: [], addons: [], locationsCount: 1, usersCount: 3, industry: 'Textiles', segment: 'B2B', businessType: 'Wholesale', billingHistory: [{id:'inv-003', date:'2026-05-01', amount:15000, description:'Standard Plan - Monthly', status:'Paid'}], badReview: true, location: 'Kano, NG' },
        { id: 'CUS-003', businessName: 'Lagos Logistics', customerName: 'Tunde Bakare', phone: '+2348000000003', email: 'admin@lagoslog.com', username: 'tunde.bakare', plan: 'Basic', mrr: 5000, registrationDate: '2025-01-12', paymentDate: '2025-01-12', onboardingCompleted: true, lastLoginDate: '2026-02-15', lastTransactionDate: '2026-02-20', renewalDate: '2026-01-12', upsellOpportunity: null, status: 'Not Active', healthScore: 10, healthTrend: 'falling', usageLevel: 0, customerHappiness: -40, nextFollowUp: '2026-05-22', agent: 'Sarah O.', manager: 'David K.', accountManager: 'Felix M.', tags: ['Churn Risk', 'Conflict', 'Need Check-in'], logs: [{id:'log-2', type:'Email', summary:'Agent conflict reported.', date:'2026-05-10', loggedBy:'Felix M.'}], addons: [], locationsCount: 2, usersCount: 5, industry: 'Logistics', segment: 'B2B', businessType: 'Delivery', billingHistory: [{id:'inv-004', date:'2026-05-01', amount:5000, description:'Basic Plan - Monthly', status:'Failed'}], conflictReported: true, location: 'Lagos, NG' },
        { id: 'CUS-004', businessName: 'Abuja Wares', customerName: 'Hauwa Bello', phone: '+2348000000004', email: 'contact@abujawares.com', username: 'hauwa.wares', plan: 'Premium', mrr: 45000, registrationDate: '2024-11-05', paymentDate: '2024-11-05', onboardingCompleted: true, lastLoginDate: '2025-01-01', lastTransactionDate: '2025-01-15', renewalDate: '2026-06-15', upsellOpportunity: null, status: 'Not Active', healthScore: 20, healthTrend: 'no change', usageLevel: 5, customerHappiness: -20, nextFollowUp: '2026-05-24', agent: 'Unassigned', manager: 'David K.', accountManager: 'Grace T.', tags: ['Almost Lost', '1 Year Inactive'], logs: [], addons: ['Advanced Analytics'], locationsCount: 5, usersCount: 20, industry: 'Retail', segment: 'B2C', businessType: 'Supermarket', billingHistory: [{id:'inv-005', date:'2025-10-30', amount:45000, description:'Premium Plan - Monthly', status:'Pending'}], unresolvedTickets: 3, location: 'Abuja, NG' },
        { id: 'CUS-005', businessName: 'Ibadan Retail Hub', customerName: 'Femi Adeyemi', phone: '+2348000000005', email: 'store@ibadanretail.ng', username: 'femi.retail', plan: 'Premium', mrr: 45000, registrationDate: '2026-02-15', paymentDate: '2026-02-15', onboardingCompleted: true, lastLoginDate: '2026-05-16', lastTransactionDate: '2026-05-14', renewalDate: '2027-02-15', upsellOpportunity: 'POS Hardware', status: 'Active', healthScore: 88, healthTrend: 'improving', usageLevel: 70, customerHappiness: 60, nextFollowUp: null, agent: 'Sarah O.', manager: 'John D.', accountManager: 'Felix M.', tags: ['90-Days Check-in Due'], logs: [], addons: ['Multi-Store'], locationsCount: 2, usersCount: 8, industry: 'Retail', segment: 'B2C', businessType: 'Grocery', billingHistory: [{id:'inv-006', date:'2026-05-10', amount:45000, description:'Premium Plan - Monthly', status:'Paid'}], location: 'Ibadan, NG' },
        { id: 'CUS-006', businessName: 'City Pharmacy', customerName: 'Joy Eze', phone: '+2348000000006', email: 'info@citypharmacy.com', username: 'joy.pharm', plan: 'Standard', mrr: 15000, registrationDate: '2026-05-15', paymentDate: '2026-05-15', onboardingCompleted: true, lastLoginDate: '2026-05-17', lastTransactionDate: '2026-05-17', renewalDate: '2027-05-15', upsellOpportunity: null, status: 'New', healthScore: 100, healthTrend: 'improving', usageLevel: 15, customerHappiness: 0, nextFollowUp: '2026-05-22', agent: 'Mike T.', manager: 'John D.', accountManager: 'Grace T.', tags: ['7-Day Activation Call'], logs: [], addons: [], locationsCount: 1, usersCount: 4, industry: 'Healthcare', segment: 'B2C', businessType: 'Pharmacy', billingHistory: [{id:'inv-007', date:'2026-05-15', amount:15000, description:'Standard Plan - Monthly', status:'Paid'}], location: 'Port Harcourt, NG' },
        { id: 'CUS-007', businessName: 'Enugu Motors', customerName: 'Obinna Eze', phone: '+2348000000007', email: 'hello@enugumotors.com', username: 'obinna.motors', plan: 'Standard', mrr: 15000, registrationDate: '2025-05-25', paymentDate: '2025-05-25', onboardingCompleted: true, lastLoginDate: '2026-04-10', lastTransactionDate: '2026-04-05', renewalDate: '2026-05-28', upsellOpportunity: 'Pro Upgrade', status: 'Lost', healthScore: 30, healthTrend: 'falling', usageLevel: 20, customerHappiness: 10, nextFollowUp: '2026-05-18', agent: 'Mike T.', manager: 'John D.', accountManager: 'Grace T.', tags: ['Lost', 'Needs Recovery'], logs: [], addons: [], locationsCount: 1, usersCount: 2, industry: 'Automotive', segment: 'B2B/B2C', businessType: 'Dealership', billingHistory: [], location: 'Enugu, NG' }
    ]);

    const [searchQuery, setSearchQuery] = useState('');
    const [tagEditorVisible, setTagEditorVisible] = useState<string | null>(null);
    const [newTagInput, setNewTagInput] = useState('');

    // Modal & Drawer State
    const [selectedCustomerForView, setSelectedCustomerForView] = useState<CSCustomer | null>(null);
    const [loggingActivityFor, setLoggingActivityFor] = useState<CSCustomer | null>(null);
    const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
    const [resetPasswordInput, setResetPasswordInput] = useState('');
    
    // Activity Form State
    const [actType, setActType] = useState<'Call' | 'Email' | 'Meeting' | 'Note'>('Call');
    const [actSummary, setActSummary] = useState('');
    const [actNextFollowUp, setActNextFollowUp] = useState('');
    
    // Direct Messaging State
    const [messageInput, setMessageInput] = useState('');

    // Filter by Assignment (Me vs All vs Specific CSM, AND State Manager)
    const viewCustomers = useMemo(() => {
        let filtered = customers;
        
        // CSM Filter
        if (viewMode === 'mine') filtered = filtered.filter(c => c.accountManager === currentUser);
        else if (viewMode !== 'all') filtered = filtered.filter(c => c.accountManager === viewMode);

        // State Manager Filter
        if (stateManagerFilter !== 'all') {
            filtered = filtered.filter(c => c.manager === stateManagerFilter);
        }

        return filtered;
    }, [customers, viewMode, currentUser, stateManagerFilter]);

    // Unique Account Managers for filtering
    const accountManagers = useMemo(() => {
        const managers = new Set(customers.map(c => c.accountManager));
        return Array.from(managers).filter(m => m !== currentUser);
    }, [customers, currentUser]);

    // Unique State Managers for filtering
    const stateManagers = useMemo(() => {
        const sm = new Set(customers.map(c => c.manager));
        return Array.from(sm);
    }, [customers]);

    // Derived Metrics (based on view)
    const now = new Date();
    
    // Calculations for the requested brief
    const recoveredCustomers = useMemo(() => viewCustomers.filter(c => c.status === 'Active' && c.tags.includes('Recovered')).length, [viewCustomers]);
    const overallRetention = 82; // Mock calculation metric
    
    const delayedOnboardingCount = useMemo(() => 
        viewCustomers.filter(c => !c.onboardingCompleted && c.registrationDate && ((now.getTime() - new Date(c.registrationDate).getTime()) / (1000 * 3600 * 24)) > 14).length, 
    [viewCustomers]);
    
    const dormantCount = useMemo(() => 
        viewCustomers.filter(c => c.lastTransactionDate && ((now.getTime() - new Date(c.lastTransactionDate).getTime()) / (1000 * 3600 * 24)) > 30).length, 
    [viewCustomers]);

    // Filtering
    const filteredCustomers = viewCustomers.filter(c => {
        const matchesSearch = c.businessName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              c.agent.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              c.accountManager.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (!matchesSearch) return false;
        if (selectedTagConfig !== 'all' && !c.tags.includes(selectedTagConfig)) return false;

        const daysSinceReg = c.registrationDate ? (now.getTime() - new Date(c.registrationDate).getTime()) / (1000 * 3600 * 24) : 0;
        const daysSinceTx = c.lastTransactionDate ? (now.getTime() - new Date(c.lastTransactionDate).getTime()) / (1000 * 3600 * 24) : 999;
        const daysUntilRenewal = c.renewalDate ? (new Date(c.renewalDate).getTime() - now.getTime()) / (1000 * 3600 * 24) : 999;
        
        if (selectedInactiveConfig !== 'all') {
            if (c.status === 'Active' && daysSinceTx <= 14) return false;
            switch(selectedInactiveConfig) {
                case '14d': if(daysSinceTx < 14 || daysSinceTx >= 30) return false; break;
                case '30d': if(daysSinceTx < 30 || daysSinceTx >= 90) return false; break;
                case '3m': if(daysSinceTx < 90 || daysSinceTx >= 180) return false; break;
                case '6m': if(daysSinceTx < 180 || daysSinceTx >= 365) return false; break;
                case '1y': if(daysSinceTx < 365) return false; break;
            }
        }

        if (selectedRenewalConfig !== 'all') {
            switch(selectedRenewalConfig) {
                case 'this_week': if(daysUntilRenewal < 0 || daysUntilRenewal > 7) return false; break;
                case 'next_week': if(daysUntilRenewal <= 7 || daysUntilRenewal > 14) return false; break;
                case '30d': if(daysUntilRenewal < 0 || daysUntilRenewal > 30) return false; break;
                case '60d': if(daysUntilRenewal < 0 || daysUntilRenewal > 60) return false; break;
                case 'expired': if(daysUntilRenewal >= 0) return false; break;
            }
        }

        switch (activeTab) {
            case 'active':
                return c.status === 'Active';
            case 'onbd_delayed':
                return !c.onboardingCompleted && daysSinceReg > 14;
            case 'new_to_call': 
                return c.status === 'New';
            case 'checkins': 
                return (daysSinceReg >= 80 && daysSinceReg <= 110) || c.conflictReported;
            case 'retention': 
                return c.renewalDate && (new Date(c.renewalDate).getTime() - now.getTime()) / (1000 * 3600 * 24) <= 30;
            case 'followups':
                return !!c.nextFollowUp && new Date(c.nextFollowUp).getTime() <= now.getTime() + (7 * 24 * 3600 * 1000);
            case 'tickets':
                return !!c.unresolvedTickets && c.unresolvedTickets > 0;
            default: return true; // 'all'
        }
    }).sort((a, b) => {
        return b.tags.length - a.tags.length;
    });

    const handleAddTag = (customerId: string) => {
        if (!newTagInput.trim()) return;
        setCustomers(customers.map(c => {
            if (c.id === customerId && !c.tags.includes(newTagInput.trim())) {
                return { ...c, tags: [...c.tags, newTagInput.trim()] };
            }
            return c;
        }));
        setNewTagInput('');
        setTagEditorVisible(null);
        showSuccess(`Tag added successfully.`);
    };

    const allTags = useMemo(() => {
        const tags = new Set<string>();
        viewCustomers.forEach(c => c.tags.forEach(t => tags.add(t)));
        return Array.from(tags).sort();
    }, [viewCustomers]);

    const handleRemoveTag = (customerId: string, tagToRemove: string) => {
        setCustomers(customers.map(c => c.id === customerId ? { ...c, tags: c.tags.filter(t => t !== tagToRemove) } : c));
        showSuccess(`Tag removed successfully.`);
    };

    const handleSaveActivity = () => {
        if (!loggingActivityFor || !actSummary.trim()) {
            showError("Please enter a summary.");
            return;
        }
        const newLog: ActivityLog = {
            id: `log-${Date.now()}`,
            type: actType,
            summary: actSummary,
            date: new Date().toISOString().split('T')[0],
            loggedBy: 'Current Admin'
        };

        setCustomers(customers.map(c => {
            if (c.id === loggingActivityFor.id) {
                return { 
                    ...c, 
                    logs: [newLog, ...c.logs],
                    nextFollowUp: actNextFollowUp ? actNextFollowUp : c.nextFollowUp
                };
            }
            return c;
        }));

        if (selectedCustomerForView?.id === loggingActivityFor.id) {
             const updatedCustomer = { 
                ...selectedCustomerForView, 
                logs: [newLog, ...selectedCustomerForView.logs],
                nextFollowUp: actNextFollowUp ? actNextFollowUp : selectedCustomerForView.nextFollowUp
             };
             setSelectedCustomerForView(updatedCustomer);
        }

        setLoggingActivityFor(null);
        setActType('Call');
        setActSummary('');
        setActNextFollowUp('');
        showSuccess('Activity logged successfully.');
    };

    const handleSendMessage = () => {
        if (!selectedCustomerForView || !messageInput.trim()) return;
        
        const newLog: ActivityLog = {
            id: `msg-${Date.now()}`,
            type: 'Email',
            summary: `Sent message: "${messageInput}"`,
            date: new Date().toISOString(),
            loggedBy: `${currentUser} from Prokip`
        };

        setCustomers(customers.map(c => {
            if (c.id === selectedCustomerForView.id) {
                return { ...c, logs: [newLog, ...c.logs] };
            }
            return c;
        }));

        const updatedCustomer = { 
            ...selectedCustomerForView, 
            logs: [newLog, ...selectedCustomerForView.logs]
        };
        setSelectedCustomerForView(updatedCustomer);
        setMessageInput('');
        showSuccess('Message sent successfully.');
    };

    const getHealthColor = (score: number) => {
        if (score >= 80) return 'text-emerald-500 bg-emerald-50 border-emerald-200';
        if (score >= 50) return 'text-amber-500 bg-amber-50 border-amber-200';
        return 'text-rose-500 bg-rose-50 border-rose-200';
    };

    return (
        <div className="p-6 animate-fade-in space-y-6 pb-20 relative">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Customer Success Dashboard</h1>
                    <p className="text-sm text-slate-500">Keep customers happy, prevent them from leaving, and track their business health.</p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 shadow-inner">
                    <button 
                        onClick={() => setActiveDashboardTab('customers')}
                        className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${activeDashboardTab === 'customers' ? 'bg-white text-[#02275A] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        <i className="fas fa-users mr-1"></i> Customer List
                    </button>
                    <button 
                        onClick={() => setActiveDashboardTab('reports')}
                        className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${activeDashboardTab === 'reports' ? 'bg-white text-[#02275A] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        <i className="fas fa-chart-pie mr-1"></i> Reports & Staff Work
                    </button>
                </div>
            </div>

            {activeDashboardTab === 'customers' && (
                <>
                    {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <div className="bg-[#02275A] p-5 rounded-xl shadow-md flex items-center justify-between text-white relative overflow-hidden group hover:cursor-pointer" onClick={() => setActiveTab('onboarding')}>
                    <div className="relative z-10">
                        <p className="text-xs text-blue-200 font-bold uppercase tracking-wider mb-1">Onboarding Delays</p>
                        <h3 className="text-3xl font-extrabold text-white">{delayedOnboardingCount}</h3>
                        <p className="text-[10px] text-amber-300 font-bold mt-1 group-hover:underline">&gt; 14 days without setup <i className="fas fa-arrow-right"></i></p>
                    </div>
                    <i className="fas fa-user-clock absolute -right-4 -bottom-4 text-white/10 text-7xl transition-transform group-hover:scale-110"></i>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between border-l-4 border-l-emerald-500">
                    <div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Customer Retention</p>
                        <h3 className="text-2xl font-extrabold text-slate-800">{overallRetention}<span className="text-sm text-slate-400">%</span></h3>
                        <p className="text-[10px] text-emerald-500 font-bold mt-1">Target: At least 75%</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
                        <i className="fas fa-chart-line"></i>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between border-l-4 border-l-amber-500">
                    <div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Dormant Accounts</p>
                        <h3 className="text-2xl font-extrabold text-slate-800">{dormantCount}</h3>
                        <p className="text-[10px] text-amber-500 font-bold mt-1"><i className="fas fa-exclamation-triangle"></i> &gt; 30 days without Tx</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-xl">
                        <i className="fas fa-pause-circle"></i>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between border-l-4 border-l-blue-500">
                    <div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Churn Recovery</p>
                        <h3 className="text-2xl font-extrabold text-slate-800">{recoveredCustomers}</h3>
                        <p className="text-[10px] text-blue-500 font-bold mt-1">Target: 50% Recovery</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
                        <i className="fas fa-undo-alt"></i>
                    </div>
                </div>
            </div>

            {/* Navigation and Filters */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
                <div className="flex border-b border-slate-200 overflow-x-auto overflow-y-hidden">
                    <button onClick={() => setActiveTab('all')} className={`px-5 py-4 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${activeTab === 'all' ? 'border-[#02275A] text-[#02275A]' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
                        All Customers
                    </button>
                    <button onClick={() => setActiveTab('active')} className={`px-5 py-4 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${activeTab === 'active' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
                        Total Active
                    </button>
                    <button onClick={() => setActiveTab('onbd_delayed')} className={`px-5 py-4 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${activeTab === 'onbd_delayed' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
                        Onbd. Delayed
                    </button>
                    <button onClick={() => setActiveTab('new_to_call')} className={`px-5 py-4 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${activeTab === 'new_to_call' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
                        New (Needs Call)
                    </button>
                    <button onClick={() => setActiveTab('checkins')} className={`px-5 py-4 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${activeTab === 'checkins' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
                        Experience Check-ins
                    </button>
                    <button onClick={() => setActiveTab('retention')} className={`px-5 py-4 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${activeTab === 'retention' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
                        Renewals
                    </button>
                    <button onClick={() => setActiveTab('followups')} className={`px-5 py-4 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${activeTab === 'followups' ? 'border-amber-600 text-amber-700' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
                        Follow-ups Due
                    </button>
                    <button onClick={() => setActiveTab('tickets')} className={`px-5 py-4 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${activeTab === 'tickets' ? 'border-rose-500 text-rose-600' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
                        Overdue Tickets <i className="fas fa-exclamation-circle ml-1"></i>
                    </button>
                </div>

                <div className="p-4 bg-slate-50 flex items-center justify-between border-b border-slate-100 gap-4 flex-wrap">
                    <div className="relative w-full md:w-auto md:flex-1 md:max-w-md">
                        <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                        <input
                            type="text"
                            placeholder="Find by Business, CS Rep, or Agent..."
                            className="bg-white border border-slate-200 text-sm rounded-lg pl-9 pr-3 py-2 outline-none focus:border-[#02275A] w-full shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto flex-wrap">
                        <select 
                            value={selectedInactiveConfig} 
                            onChange={e => setSelectedInactiveConfig(e.target.value)}
                            className="bg-white border border-slate-200 text-slate-700 px-3 py-2 rounded-lg text-sm font-bold outline-none focus:border-[#02275A] shadow-sm flex-1 md:w-auto cursor-pointer"
                        >
                            <option value="all">Any Inactivity</option>
                            <option value="14d">14 Days Inactive</option>
                            <option value="30d">30+ Days Inactive</option>
                            <option value="3m">3+ Months Inactive</option>
                            <option value="6m">6+ Months Inactive</option>
                            <option value="1y">1+ Year Inactive</option>
                        </select>
                        <select 
                            value={selectedRenewalConfig} 
                            onChange={e => setSelectedRenewalConfig(e.target.value)}
                            className="bg-white border border-slate-200 text-slate-700 px-3 py-2 rounded-lg text-sm font-bold outline-none focus:border-[#02275A] shadow-sm flex-1 md:w-auto cursor-pointer"
                        >
                            <option value="all">Any Renewal Date</option>
                            <option value="this_week">Expiring This Week</option>
                            <option value="next_week">Expiring Next Week</option>
                            <option value="30d">Expiring in 30 Days</option>
                            <option value="60d">Expiring in 60 Days</option>
                            <option value="expired">Already Expired</option>
                        </select>
                        <select 
                            value={selectedTagConfig} 
                            onChange={e => setSelectedTagConfig(e.target.value)}
                            className="bg-white border border-slate-200 text-slate-700 px-3 py-2 rounded-lg text-sm font-bold outline-none focus:border-[#02275A] shadow-sm flex-1 md:w-auto cursor-pointer"
                        >
                            <option value="all">Filter by Tag</option>
                            {allTags.map(tag => (
                                <option key={tag} value={tag}>{tag}</option>
                            ))}
                        </select>
                        <select 
                            value={stateManagerFilter}
                            onChange={e => setStateManagerFilter(e.target.value)}
                            className="bg-white border border-slate-200 text-slate-700 px-3 py-2 rounded-lg text-sm font-bold outline-none focus:border-[#02275A] shadow-sm flex-1 md:w-auto cursor-pointer"
                        >
                            <option value="all">Any State Manager</option>
                            {stateManagers.map(sm => (
                                <option key={sm} value={sm}>{sm}</option>
                            ))}
                        </select>
                        <select 
                            value={viewMode}
                            onChange={e => setViewMode(e.target.value)}
                            className="bg-[#02275A] border border-[#02275A] text-white px-3 py-2 rounded-lg text-sm font-bold outline-none shadow-sm flex-1 md:w-auto cursor-pointer"
                        >
                            <option value="mine">Assigned to Me</option>
                            <option value="all">All Customers</option>
                            {accountManagers.map(am => (
                                <option key={am} value={am}>Assigned to {am}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1200px]">
                        <thead>
                            <tr className="bg-white text-xs uppercase text-slate-500 font-bold tracking-wider border-b border-slate-200">
                                <th className="p-4 w-56">Business</th>
                                <th className="p-4 w-56">Customer</th>
                                <th className="p-4 w-32 border-l border-slate-100">Plan</th>
                                <th className="p-4 border-l border-slate-100 min-w-32">Assigned Team</th>
                                <th className="p-4 w-64 border-l border-slate-100">Activities Log</th>
                                <th className="p-4 w-56 border-l border-slate-100">Tags</th>
                                <th className="p-4 text-center border-l border-slate-100 w-32">Status</th>
                                <th className="p-4 text-center border-l border-slate-100">Required Action</th>
                                <th className="p-4 text-right border-l border-slate-100">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredCustomers.map(customer => {
                                const isAtRisk = customer.status === 'Lost' || customer.status === 'Not Active' || customer.healthScore < 40;
                                return (
                                <tr key={customer.id} className={`transition-colors group ${isAtRisk ? 'bg-rose-50/30 hover:bg-rose-50/50' : 'hover:bg-slate-50'}`}>
                                    <td className="p-4 align-top">
                                        <div className="flex flex-col gap-1.5">
                                            <span onClick={() => setSelectedCustomerForView(customer)} className="font-bold text-slate-800 text-sm cursor-pointer hover:underline">{customer.businessName}</span>
                                            {customer.location && (
                                                <span className="text-xs text-slate-500 flex items-center">
                                                    <i className="fas fa-map-marker-alt text-slate-400 mr-1.5"></i> {customer.location}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 align-top">
                                        <div className="flex flex-col gap-1.5">
                                            {customer.customerName && (
                                                <span className="font-bold text-slate-700 text-sm">{customer.customerName}</span>
                                            )}
                                            <span className="text-xs text-slate-600 font-medium">{customer.email}</span>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-xs text-slate-600 font-medium">{customer.phone}</span>
                                                <a href={`tel:${customer.phone}`} className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-colors" title="Call">
                                                    <i className="fas fa-phone text-[9px]"></i>
                                                </a>
                                                <a href={`https://wa.me/${customer.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-emerald-600 hover:bg-emerald-100 transition-colors" title="WhatsApp">
                                                    <i className="fab fa-whatsapp text-[11px]"></i>
                                                </a>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 align-top border-l border-slate-100">
                                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider border border-blue-100 inline-block">
                                            {customer.plan} Plan
                                        </span>
                                    </td>
                                    <td className="p-4 align-top border-l border-slate-100">
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2 text-xs">
                                                <span className="w-16 font-bold text-slate-400 uppercase text-[9px] tracking-wider">CX Rep:</span>
                                                <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 shadow-sm whitespace-nowrap">{customer.accountManager}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs">
                                                <span className="w-16 font-bold text-slate-400 uppercase text-[9px] tracking-wider">Agent:</span>
                                                <span className="font-semibold text-slate-700 whitespace-nowrap">{customer.agent}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs">
                                                <span className="w-16 font-bold text-slate-400 uppercase text-[9px] tracking-wider">State Mgr:</span>
                                                <span className="font-semibold text-slate-700 whitespace-nowrap">{customer.manager}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 align-top border-l border-slate-100 min-w-64">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-100">
                                                <i className="fas fa-sign-in-alt text-slate-400 text-xs"></i>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Last Login</span>
                                                    <span className="text-xs font-semibold text-slate-700">
                                                        {customer.lastLoginDate ? `${customer.lastLoginDate} (${formatRelativeTime(customer.lastLoginDate)})` : 'Never'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-100">
                                                <i className="fas fa-money-bill-wave text-emerald-500 text-xs"></i>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Last Transaction</span>
                                                    <span className="text-xs font-semibold text-slate-700">
                                                        {customer.lastTransactionDate ? `${customer.lastTransactionDate} (${formatRelativeTime(customer.lastTransactionDate)})` : 'Never'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 align-top border-l border-slate-100">
                                        <div className="flex flex-wrap gap-1.5 min-h-[40px] mb-2">
                                            {customer.tags.map(tag => (
                                                <span key={tag} className="group/tag flex items-center gap-1.5 bg-slate-50 text-slate-700 font-bold text-[11px] px-2 py-1 rounded-md border border-slate-200 shadow-sm">
                                                    {tag}
                                                    <i 
                                                        className="fas fa-times text-slate-400 hover:text-rose-500 cursor-pointer transition-colors"
                                                        onClick={() => handleRemoveTag(customer.id, tag)}
                                                        title="Remove Tag"
                                                    ></i>
                                                </span>
                                            ))}
                                            <button 
                                                onClick={() => setTagEditorVisible(tagEditorVisible === customer.id ? null : customer.id)}
                                                className="bg-white border border-dashed border-slate-300 text-slate-400 hover:text-[#02275A] hover:border-[#02275A] font-bold text-[10px] px-2 py-1 rounded-md transition-colors"
                                            >
                                                <i className="fas fa-plus"></i> Add Tag
                                            </button>
                                        </div>
                                        {tagEditorVisible === customer.id && (
                                            <div className="mt-2 flex gap-1 animate-fade-in relative z-10 w-full">
                                                <input 
                                                    type="text" 
                                                    autoFocus
                                                    className="border border-slate-300 text-xs rounded px-2 py-1 w-full outline-none focus:border-[#02275A] shadow-sm"
                                                    placeholder="Type tag..."
                                                    value={newTagInput}
                                                    onChange={(e) => setNewTagInput(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handleAddTag(customer.id);
                                                        if (e.key === 'Escape') setTagEditorVisible(null);
                                                    }}
                                                />
                                                <button onClick={() => handleAddTag(customer.id)} className="bg-[#02275A] text-white px-2 py-1 rounded text-xs hover:bg-[#03367A] shadow-sm"><i className="fas fa-check"></i></button>
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4 align-top text-center border-l border-slate-100">
                                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md border inline-block ${
                                            customer.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                            customer.status === 'New' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                            'bg-rose-50 text-rose-700 border-rose-200'
                                        }`}>
                                            {customer.status}
                                        </span>
                                    </td>
                                    <td className="p-4 align-top text-center border-l border-slate-100">
                                        {/* Derived Required Action */}
                                        {(() => {
                                            const daysSinceReg = customer.registrationDate ? (now.getTime() - new Date(customer.registrationDate).getTime()) / (1000 * 3600 * 24) : 0;
                                            const daysSinceTx = customer.lastTransactionDate ? (now.getTime() - new Date(customer.lastTransactionDate).getTime()) / (1000 * 3600 * 24) : 999;
                                            
                                            let actionItem = null;

                                            if (customer.status === 'Lost' || customer.status === 'Not Active' || daysSinceTx > 90) {
                                                actionItem = { text: 'Recovery Call', icon: 'fa-life-ring', color: 'text-rose-600 bg-rose-50 border-rose-200' };
                                            } else if (customer.conflictReported) {
                                                actionItem = { text: 'Resolve Conflict', icon: 'fa-handshake', color: 'text-rose-600 bg-rose-50 border-rose-200' };
                                            } else if (customer.badReview) {
                                                actionItem = { text: 'Address Bad Review', icon: 'fa-star-half-alt', color: 'text-rose-600 bg-rose-50 border-rose-200' };
                                            } else if (customer.unresolvedTickets && customer.unresolvedTickets > 0) {
                                                actionItem = { text: 'Escalate Tickets', icon: 'fa-ticket-alt', color: 'text-amber-600 bg-amber-50 border-amber-200' };
                                            } else if (!customer.onboardingCompleted && daysSinceReg > 14) {
                                                actionItem = { text: 'Onboarding Rescue', icon: 'fa-user-clock', color: 'text-amber-600 bg-amber-50 border-amber-200' };
                                            } else if (customer.onboardingCompleted && daysSinceTx > 30) {
                                                actionItem = { text: 'Activation Call', icon: 'fa-bolt', color: 'text-amber-600 bg-amber-50 border-amber-200' };
                                            } else if (daysSinceReg >= 80 && daysSinceReg <= 110) {
                                                actionItem = { text: '90-Day Experience Check-in', icon: 'fa-comments', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
                                            } else if (customer.paymentDate && ((now.getTime() - new Date(customer.paymentDate).getTime()) / (1000 * 3600 * 24)) >= 7 && ((now.getTime() - new Date(customer.paymentDate).getTime()) / (1000 * 3600 * 24)) <= 14) {
                                                actionItem = { text: 'Appreciation Call', icon: 'fa-gift', color: 'text-blue-600 bg-blue-50 border-blue-200' };
                                            } else if (customer.renewalDate && (new Date(customer.renewalDate).getTime() - now.getTime()) / (1000 * 3600 * 24) <= 30) {
                                                actionItem = { text: 'Renewal', icon: 'fa-arrow-trend-up', color: 'text-indigo-600 bg-indigo-50 border-indigo-200' };
                                            } else {
                                                actionItem = { text: 'Monitor Account', icon: 'fa-eye', color: 'text-slate-500 bg-slate-50 border-slate-200' };
                                            }

                                            return (
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className={`inline-flex flex-col items-center gap-1.5 p-2 rounded-xl border ${actionItem.color} w-36 shadow-sm`}>
                                                        <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center -mb-1 mt-1">
                                                            <i className={`fas ${actionItem.icon} text-lg`}></i>
                                                        </div>
                                                        <span className="text-[10px] md:text-xs uppercase font-bold text-center leading-tight tracking-wide px-1">{actionItem.text}</span>
                                                    </div>
                                                    {customer.nextFollowUp && (() => {
                                                        const isDue = (new Date(customer.nextFollowUp).getTime() - now.getTime()) <= 0;
                                                        const isUpcoming = (new Date(customer.nextFollowUp).getTime() - now.getTime()) <= (7 * 24 * 3600 * 1000);
                                                        if (isDue || isUpcoming) {
                                                            return (
                                                                <div className={`text-[10px] sm:text-xs font-bold px-2 py-1 rounded-md shadow-sm border inline-flex items-center gap-1.5 mt-1 ${isDue ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                                                                    <i className="far fa-calendar-alt"></i> {isDue ? 'Overdue' : 'Due'}: {formatRelativeTime(customer.nextFollowUp)}
                                                                </div>
                                                            );
                                                        }
                                                        return null;
                                                    })()}
                                                </div>
                                            );
                                        })()}
                                    </td>
                                    <td className="p-4 text-right align-top border-l border-slate-100">
                                        <div className="relative group/dropdown inline-block text-left">
                                            <button className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold w-24 flex items-center justify-center gap-1.5 transition-colors shadow-sm">
                                                Actions <i className="fas fa-chevron-down text-[10px] text-slate-400"></i>
                                            </button>
                                            <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-slate-100 shadow-slate-200/50 opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all -translate-y-1 group-hover/dropdown:translate-y-0 z-[40] overflow-hidden">
                                                <button 
                                                    onClick={() => setLoggingActivityFor(customer)}
                                                    className="w-full text-left px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-b border-slate-50 transition-colors"
                                                >
                                                    <div className="w-5 flex justify-center text-[#02275A]"><i className="fas fa-bolt"></i></div>
                                                    Log Activity
                                                </button>
                                                <button 
                                                    onClick={() => setSelectedCustomerForView(customer)}
                                                    className="w-full text-left px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                                                >
                                                    <div className="w-5 flex justify-center text-slate-400"><i className="fas fa-eye"></i></div>
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                                );
                            })}
                            {filteredCustomers.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="p-12 text-center">
                                        <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <i className="fas fa-inbox text-slate-300 text-2xl"></i>
                                        </div>
                                        <p className="text-slate-500 font-medium text-sm">No customers align with your selected filters or search state.</p>
                                        <button onClick={() => {setSearchQuery(''); setActiveTab('all');}} className="font-bold text-[#02275A] mt-2 underline">Clear all parameters</button>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal: Log Activity */}
            {loggingActivityFor && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800">
                                Log Activity for <span className="text-[#02275A]">{loggingActivityFor.businessName}</span>
                            </h3>
                            <button onClick={() => setLoggingActivityFor(null)} className="text-slate-400 hover:text-slate-600">
                                <i className="fas fa-times text-lg"></i>
                            </button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-2">Activity Type</label>
                                <div className="flex gap-3">
                                    {(['Call', 'Email', 'Meeting', 'Note'] as const).map(type => (
                                        <button 
                                            key={type}
                                            onClick={() => setActType(type)}
                                            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold border transition-colors flex items-center justify-center gap-2 ${actType === type ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                        >
                                            <i className={`fas ${type === 'Call' ? 'fa-phone' : type === 'Email' ? 'fa-envelope' : type === 'Meeting' ? 'fa-handshake' : 'fa-sticky-note'}`}></i> {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-2">Summary / Notes</label>
                                <textarea 
                                    className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none focus:border-[#02275A] shadow-sm resize-none" 
                                    rows={4}
                                    placeholder="Provide details about the interaction..."
                                    value={actSummary}
                                    onChange={(e) => setActSummary(e.target.value)}
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-2">Schedule Next Follow-up (Optional)</label>
                                <input 
                                    type="date"
                                    className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none focus:border-[#02275A] shadow-sm"
                                    value={actNextFollowUp}
                                    onChange={(e) => setActNextFollowUp(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="p-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                            <button onClick={() => setLoggingActivityFor(null)} className="px-5 py-2 text-sm font-bold text-slate-600 hover:text-slate-800">Cancel</button>
                            <button onClick={handleSaveActivity} className="bg-[#02275A] hover:bg-[#03367A] text-white px-5 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors">
                                Save Activity
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Customer 360 Slide-over Drawer */}
            {selectedCustomerForView && (
                <div className="fixed inset-0 z-[50] flex justify-end bg-slate-900/30 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col animate-[slide-in-right_0.3s_ease-out]">
                        {/* Drawer Header */}
                        <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-[#02275A] text-white">
                            <div>
                                <div className="flex items-center gap-3">
                                    <h2 className="text-2xl font-bold">{selectedCustomerForView.businessName}</h2>
                                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${
                                        selectedCustomerForView.status === 'Active' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' :
                                        selectedCustomerForView.status === 'Onboarding' ? 'bg-blue-500/20 text-blue-300 border-blue-400/30' :
                                        'bg-rose-500/20 text-rose-300 border-rose-400/30'
                                    }`}>
                                        {selectedCustomerForView.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 mt-2 text-sm text-blue-100 opacity-90 flex-wrap">
                                    <span><i className="fas fa-envelope mr-1"></i> {selectedCustomerForView.email}</span>
                                    <span><i className="fas fa-phone mr-1"></i> {selectedCustomerForView.phone}</span>
                                    {selectedCustomerForView.location && (
                                        <span><i className="fas fa-map-marker-alt mr-1"></i> {selectedCustomerForView.location}</span>
                                    )}
                                    <span><i className="fas fa-star mr-1 text-amber-300"></i> {selectedCustomerForView.plan} Plan</span>
                                </div>
                            </div>
                            <button onClick={() => setSelectedCustomerForView(null)} className="text-white/60 hover:text-white bg-white/10 hover:bg-white/20 w-8 h-8 rounded-full flex items-center justify-center transition-colors">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        {/* Drawer Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
                            {/* Business Profile Details */}
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="text-sm font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Business Profile & Usage</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-2">
                                    <div className="text-sm col-span-2 md:col-span-3 mb-2">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Usage Level</span>
                                            <span className="font-bold text-[#02275A]">{selectedCustomerForView.usageLevel}%</span>
                                        </div>
                                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                            <div className="bg-[#02275A] h-full" style={{width: `${selectedCustomerForView.usageLevel}%`}}></div>
                                        </div>
                                    </div>
                                    <div className="text-sm">
                                        <span className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Industry</span>
                                        <span className="font-medium text-slate-700">{selectedCustomerForView.industry}</span>
                                    </div>
                                    <div className="text-sm">
                                        <span className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Segment</span>
                                        <span className="font-medium text-slate-700">{selectedCustomerForView.segment}</span>
                                    </div>
                                    <div className="text-sm">
                                        <span className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Business Type</span>
                                        <span className="font-medium text-slate-700">{selectedCustomerForView.businessType}</span>
                                    </div>
                                    <div className="text-sm">
                                        <span className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Username</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-slate-700">{selectedCustomerForView.username || 'Not Set'}</span>
                                            <button 
                                                onClick={() => setIsResetPasswordModalOpen(true)}
                                                className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded transition-colors"
                                            >
                                                Reset Password
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-sm">
                                        <span className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Locations</span>
                                        <span className="font-medium text-slate-700">{selectedCustomerForView.locationsCount} Store{selectedCustomerForView.locationsCount !== 1 ? 's' : ''}</span>
                                    </div>
                                    <div className="text-sm">
                                        <span className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Users</span>
                                        <span className="font-medium text-slate-700">{selectedCustomerForView.usersCount} User{selectedCustomerForView.usersCount !== 1 ? 's' : ''}</span>
                                    </div>
                                    <div className="text-sm">
                                        <span className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Active Add-ons</span>
                                        {selectedCustomerForView.addons.length > 0 ? (
                                            <div className="flex gap-1 flex-wrap mt-0.5">
                                            {selectedCustomerForView.addons.map(addon => (
                                                <span key={addon} className="bg-blue-50 text-blue-700 font-bold text-[10px] px-1.5 py-0.5 rounded border border-blue-100">{addon}</span>
                                            ))}
                                            </div>
                                        ) : <span className="text-slate-400 text-xs italic">None</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Personnel & Tags */}
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="text-sm font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Assigned Team & Tags</h3>
                                <div className="grid grid-cols-2 gap-y-4">
                                    <div className="text-sm">
                                        <span className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Account Manager</span>
                                        <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{selectedCustomerForView.accountManager}</span>
                                    </div>
                                    <div className="text-sm">
                                        <span className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Assigned Agent</span>
                                        <span className="font-bold text-slate-700">{selectedCustomerForView.agent}</span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Applied Tags</span>
                                        <div className="flex gap-2 flex-wrap">
                                            {selectedCustomerForView.tags.map(tag => (
                                                <span key={tag} className="bg-slate-100 text-slate-600 font-bold text-[10px] px-2 py-1 rounded-md border border-slate-200">{tag}</span>
                                            ))}
                                            {selectedCustomerForView.tags.length === 0 && <span className="text-xs text-slate-400 italic">No tags assigned.</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Billing History */}
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="text-sm font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Billing History</h3>
                                <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                                    {selectedCustomerForView.billingHistory.length > 0 ? (
                                        selectedCustomerForView.billingHistory.map(invoice => (
                                            <div key={invoice.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">{invoice.description}</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">{new Date(invoice.date).toLocaleDateString()} • {invoice.id}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-black text-slate-800 tracking-tight">₦{invoice.amount.toLocaleString()}</p>
                                                    <span className={`inline-block mt-0.5 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded tracking-wider ${
                                                        invoice.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                                                        invoice.status === 'Failed' ? 'bg-rose-100 text-rose-700' :
                                                        'bg-amber-100 text-amber-700'
                                                    }`}>
                                                        {invoice.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm italic text-slate-400 text-center py-4">No billing history available.</p>
                                    )}
                                </div>
                            </div>

                            {/* Activity Feed */}
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
                                    <h3 className="text-sm font-bold text-slate-800">Activity & Touchpoints</h3>
                                    <button 
                                        onClick={() => setLoggingActivityFor(selectedCustomerForView)}
                                        className="text-xs text-[#02275A] font-bold hover:underline"
                                    >
                                        <i className="fas fa-plus mr-1"></i> Log Activity
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {selectedCustomerForView.logs.map((log) => (
                                        <div key={log.id} className="flex gap-4">
                                            <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-white ${
                                                log.type === 'Call' ? 'bg-blue-500' :
                                                log.type === 'Email' ? 'bg-indigo-500' :
                                                log.type === 'Meeting' ? 'bg-emerald-500' : 'bg-amber-500'
                                            }`}>
                                                <i className={`fas text-sm ${
                                                    log.type === 'Call' ? 'fa-phone' :
                                                    log.type === 'Email' ? 'fa-envelope' :
                                                    log.type === 'Meeting' ? 'fa-handshake' : 'fa-sticky-note'
                                                }`}></i>
                                            </div>
                                            <div className="flex-1 bg-white border border-slate-100 rounded-xl p-3 shadow-sm">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="font-bold text-slate-800 text-sm">{log.type} logged by {log.loggedBy}</span>
                                                    <span className="text-xs text-slate-400 bg-slate-50 px-2 rounded-full border border-slate-100">{formatRelativeTime(log.date)}</span>
                                                </div>
                                                <p className="text-sm text-slate-600 mt-1">{log.summary}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {selectedCustomerForView.logs.length === 0 && (
                                        <div className="text-center py-6 text-sm text-slate-400 italic">No activity logs recorded yet.</div>
                                    )}
                                </div>
                            </div>

                            {/* Direct Communication Thread */}
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                                <h3 className="text-sm font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Direct Communication</h3>
                                <div className="space-y-4 max-h-60 overflow-y-auto mb-4 pr-2">
                                    {selectedCustomerForView.logs.filter(log => log.type === 'Email').map((msg) => (
                                        <div key={msg.id} className="flex flex-col mb-3">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-bold text-slate-800 text-xs text-[#02275A]">{msg.loggedBy}</span>
                                                <span className="text-[10px] text-slate-400">{formatRelativeTime(msg.date)}</span>
                                            </div>
                                            <div className="bg-blue-50 text-slate-700 p-3 rounded-lg text-sm rounded-tl-none shadow-sm">
                                                <p className="whitespace-pre-wrap">{msg.summary.replace(/^Sent message: "/, '').replace(/"$/, '')}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {selectedCustomerForView.logs.filter(log => log.type === 'Email').length === 0 && (
                                        <div className="text-center py-6 text-sm text-slate-400 italic">No direct messages sent yet.</div>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <textarea 
                                        className="flex-1 border border-slate-200 rounded-lg p-3 text-sm outline-none focus:border-[#02275A] shadow-sm resize-none" 
                                        rows={2}
                                        placeholder={`Send email as ${currentUser} from Prokip...`}
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                    ></textarea>
                                    <button 
                                        onClick={handleSendMessage}
                                        className="px-4 py-2 bg-[#02275A] text-white rounded-lg font-bold text-sm hover:bg-[#03367A] transition-colors self-end shadow-sm"
                                    >
                                        <i className="fas fa-paper-plane mr-1"></i> Send
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Drawer Footer Tasks/Alerts */}
                        {selectedCustomerForView.nextFollowUp && (
                            <div className="p-4 bg-amber-50 border-t border-amber-100 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                                        <i className="far fa-calendar-alt"></i>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-amber-800 text-sm">Follow-up Task</h4>
                                        <p className="text-xs text-amber-700">Follow-up due {formatRelativeTime(selectedCustomerForView.nextFollowUp)}</p>
                                    </div>
                                </div>
                                <button className="bg-white border border-amber-200 text-amber-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-amber-100 shadow-sm transition-colors">
                                    Done
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
            </>
            )}

            {activeDashboardTab === 'reports' && (
                <div className="space-y-6 animate-fade-in">
                    {/* Key Importance Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 border-t-4 border-t-blue-500">
                            <h4 className="text-xs uppercase font-bold text-slate-500 mb-1">Global Recovery</h4>
                            <div className="flex items-end justify-between">
                                <span className="text-3xl font-black text-slate-800">45%</span>
                                <span className="text-xs font-bold text-rose-500">-5% vs Target</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                                <div className="bg-blue-500 h-full" style={{ width: '45%' }}></div>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-2 font-medium">Target: 50% recovery rate.</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 border-t-4 border-t-emerald-500">
                            <h4 className="text-xs uppercase font-bold text-slate-500 mb-1">Global Retention</h4>
                            <div className="flex items-end justify-between">
                                <span className="text-3xl font-black text-slate-800">82%</span>
                                <span className="text-xs font-bold text-emerald-500">+7% vs Target</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                                <div className="bg-emerald-500 h-full" style={{ width: '82%' }}></div>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-2 font-medium">Target: 75% retention rate.</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 border-t-4 border-t-indigo-500">
                            <h4 className="text-xs uppercase font-bold text-slate-500 mb-1">Avg Time to Onboarding</h4>
                            <div className="flex items-end justify-between">
                                <span className="text-3xl font-black text-slate-800">4.2d</span>
                                <span className="text-xs font-bold text-emerald-500">-2.8d vs Target</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                                <div className="bg-indigo-500 h-full" style={{ width: '60%' }}></div>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-2 font-medium">Target: &lt; 7 Days.</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 border-t-4 border-t-amber-500">
                            <h4 className="text-xs uppercase font-bold text-slate-500 mb-1">Total Interactions</h4>
                            <div className="flex items-end justify-between">
                                <span className="text-3xl font-black text-slate-800">432</span>
                                <span className="text-xs font-bold text-emerald-500">+12% WoW</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                                <div className="bg-amber-500 h-full" style={{ width: '80%' }}></div>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-2 font-medium">Goal: Consistent touchpoints.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Staff Leaderboard & Rewards */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                            <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-[#02275A] to-blue-800 text-white flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold mb-1">Monthly Leaderboard</h3>
                                    <p className="text-xs text-blue-200">Based on Retention & Recovery Impact</p>
                                </div>
                                <i className="fas fa-trophy text-3xl text-amber-300 opacity-80"></i>
                            </div>
                            <div className="p-0">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 border-b border-slate-100">
                                        <tr className="text-slate-400 font-bold text-xs uppercase tracking-wider">
                                            <th className="p-3">Rank</th>
                                            <th className="p-3">Agent</th>
                                            <th className="p-3 text-center">Score</th>
                                            <th className="p-3 text-right">Potential Reward</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        <tr className="hover:bg-slate-50 bg-amber-50/30">
                                            <td className="p-3 font-black text-amber-500 flex items-center gap-2"><i className="fas fa-medal"></i> 1st</td>
                                            <td className="p-3 font-bold text-slate-800">Grace T. (You)</td>
                                            <td className="p-3 text-center font-bold text-blue-600">920 pts</td>
                                            <td className="p-3 text-right text-emerald-600 font-bold whitespace-nowrap">Bonus Tier 1 (₦50k)</td>
                                        </tr>
                                        <tr className="hover:bg-slate-50 bg-slate-100/30">
                                            <td className="p-3 font-black text-slate-400 flex items-center gap-2"><i className="fas fa-medal"></i> 2nd</td>
                                            <td className="p-3 font-bold text-slate-700">Felix M.</td>
                                            <td className="p-3 text-center font-bold text-slate-600">840 pts</td>
                                            <td className="p-3 text-right text-emerald-600 font-bold whitespace-nowrap">Bonus Tier 2 (₦25k)</td>
                                        </tr>
                                        <tr className="hover:bg-slate-50 bg-amber-50/10">
                                            <td className="p-3 font-bold text-amber-700/60 flex items-center gap-2"><i className="fas fa-medal"></i> 3rd</td>
                                            <td className="p-3 font-bold text-slate-700">Sarah O.</td>
                                            <td className="p-3 text-center font-bold text-slate-600">760 pts</td>
                                            <td className="p-3 text-right text-emerald-600 font-bold whitespace-nowrap">Bonus Tier 3 (₦10k)</td>
                                        </tr>
                                        <tr className="hover:bg-slate-50">
                                            <td className="p-3 font-bold text-slate-400 flex items-center gap-2">4th</td>
                                            <td className="p-3 font-semibold text-slate-600">Mike T.</td>
                                            <td className="p-3 text-center font-bold text-slate-600">420 pts</td>
                                            <td className="p-3 text-right text-slate-400 font-medium">Qualifying...</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Individual Performance Breakdown */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider border-b border-slate-100 pb-2">Individual Performance & Impact</h3>
                            
                            <div className="space-y-6">
                                {/* Grace T. */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <div>
                                            <span className="font-bold text-slate-800 block text-sm">Grace T.</span>
                                            <span className="text-[10px] font-bold text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded uppercase">45 Assigned</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs font-bold text-emerald-600 block">52% Recovery (Target: 50%)</span>
                                            <span className="text-[10px] font-medium text-slate-500">128 Interactions Logged</span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden relative">
                                        <div className="bg-blue-500 h-full absolute left-0" style={{ width: '52%' }}></div>
                                        <div className="h-full absolute left-[50%] border-l-2 border-slate-800 border-dashed z-10" title="Target: 50%"></div>
                                    </div>
                                </div>
                                
                                {/* Felix M. */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <div>
                                            <span className="font-bold text-slate-800 block text-sm">Felix M.</span>
                                            <span className="text-[10px] font-bold text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded uppercase">38 Assigned</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs font-bold text-rose-500 block">48% Recovery (Target: 50%)</span>
                                            <span className="text-[10px] font-medium text-slate-500">94 Interactions Logged</span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden relative">
                                        <div className="bg-emerald-500 h-full absolute left-0" style={{ width: '48%' }}></div>
                                        <div className="h-full absolute left-[50%] border-l-2 border-slate-800 border-dashed z-10" title="Target: 50%"></div>
                                    </div>
                                </div>

                                {/* Sarah O. */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <div>
                                            <span className="font-bold text-slate-800 block text-sm">Sarah O.</span>
                                            <span className="text-[10px] font-bold text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded uppercase">42 Assigned</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs font-bold text-rose-500 block">41% Recovery (Target: 50%)</span>
                                            <span className="text-[10px] font-medium text-slate-500">82 Interactions Logged</span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden relative">
                                        <div className="bg-indigo-500 h-full absolute left-0" style={{ width: '41%' }}></div>
                                        <div className="h-full absolute left-[50%] border-l-2 border-slate-800 border-dashed z-10" title="Target: 50%"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Reset Password Modal */}
            {isResetPasswordModalOpen && selectedCustomerForView && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <i className="fas fa-key text-amber-500"></i> Reset Password
                            </h3>
                            <button onClick={() => { setIsResetPasswordModalOpen(false); setResetPasswordInput(''); }} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <i className="fas fa-times text-lg"></i>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-slate-600">You can send a reset link to <strong>{selectedCustomerForView.email}</strong>, or manually set a new password if the customer cannot access their email.</p>
                            
                            <div className="space-y-4">
                                <button 
                                    onClick={() => {
                                        showSuccess(`Password reset link sent to ${selectedCustomerForView.email}`);
                                        setIsResetPasswordModalOpen(false);
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
                                onClick={() => { setIsResetPasswordModalOpen(false); setResetPasswordInput(''); }}
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
                                    showSuccess(`Password updated successfully for ${selectedCustomerForView.businessName}`);
                                    setIsResetPasswordModalOpen(false);
                                    setResetPasswordInput('');
                                }}
                                className="px-5 py-2.5 text-sm font-bold bg-amber-500 text-white hover:bg-amber-600 rounded-xl transition-colors shadow-sm flex items-center gap-2"
                            >
                                <i className="fas fa-save"></i> Save Password
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCustomerSuccessView;
