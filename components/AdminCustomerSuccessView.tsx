import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
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
    nextAction?: string | null;
    agent: string;
    partner?: string | null;
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

interface AdminCustomerSuccessViewProps {
    userRole?: string;
}

const AdminCustomerSuccessView: React.FC<AdminCustomerSuccessViewProps> = ({ userRole = 'admin' }) => {
    const { showSuccess, showError } = useAlert();
    const [activeDashboardTab, setActiveDashboardTab] = useState<'customers' | 'emails' | 'reports' | 'settings'>('customers');
    const [reportCsmFilter, setReportCsmFilter] = useState<string>('all');
    const [activeTab, setActiveTab] = useState<'all' | 'active' | 'onbd_delayed' | 'about_to_churn' | 'new_to_call' | 'checkins' | 'retention' | 'followups' | 'tickets'>('all');
    const [viewMode, setViewMode] = useState<string>(userRole === 'customer-success' ? 'mine' : 'all');
    const [stateManagerFilter, setStateManagerFilter] = useState<string>('all');
    const [selectedTagConfig, setSelectedTagConfig] = useState<string>('all');
    const [selectedInactiveConfig, setSelectedInactiveConfig] = useState<string>('all');
    const [selectedRenewalConfig, setSelectedRenewalConfig] = useState<string>('all');
    const currentUser = 'Grace T.'; // Mocked current user
    
    // Mock Data representing the CS database
    const [customers, setCustomers] = useState<CSCustomer[]>([
        { 
            id: 'CUS-001', 
            businessName: 'Okafor Hardware', 
            customerName: 'Chike Okafor', 
            phone: '+2348000000001', 
            email: 'hello@okafor.com', 
            username: 'chike.okafor', 
            plan: 'Premium', 
            mrr: 45000, 
            registrationDate: '2025-10-01', 
            paymentDate: '2025-10-01', 
            onboardingCompleted: true, 
            lastLoginDate: '2026-05-15', 
            lastTransactionDate: '2026-05-10', 
            renewalDate: '2026-05-20', 
            upsellOpportunity: 'Add-on Module A', 
            status: 'Active', 
            healthScore: 92, 
            healthTrend: 'improving', 
            usageLevel: 85, 
            customerHappiness: 45, 
            nextFollowUp: '2026-05-25', 
            nextAction: 'Ask about addition of Multi-Store modules and billing setup.', 
            agent: 'Sarah O.', 
            manager: 'John D.', 
            accountManager: 'Grace T.', 
            tags: ['Important', 'Uses App Daily', 'Renewal Soon'], 
            logs: [
                { id: 'cus001-email-reply-2', type: 'Email', summary: 'Hello Grace, we received the discount offer for Prokip Inventory Plus. We would love to activate the module next week. Please send the pricing tier. Thanks!\n\nBest,\nChike Okafor', date: '2026-06-20T10:30:00Z', loggedBy: 'Chike Okafor (Customer)' },
                { id: 'cus001-email-sent-1', type: 'Email', summary: 'Sent Email\nSubject: Prokip Inventory Plus Premium Addon Offer\n\nHi Chike,\n\nI hope you are having an amazing week! We have an exclusive discount on Prokip Inventory Plus this month.', date: '2026-06-19T14:22:00Z', loggedBy: 'Grace T.' },
                { id: 'cus001-email-reply-1', type: 'Email', summary: 'Hey Grace, everything is running smoothly! We reached our transaction record yesterday. Thanks for checking in.', date: '2026-06-15T09:12:00Z', loggedBy: 'Chike Okafor (Customer)' },
                { id: 'log-1', type: 'Call', summary: 'Checked in, they are happy.', date: '2026-05-01', loggedBy: 'Grace T.' }
            ], 
            addons: ['Inventory Plus', 'Multi-Store'], 
            locationsCount: 3, 
            usersCount: 12, 
            industry: 'Retail', 
            segment: 'B2B/B2C', 
            businessType: 'Hardware', 
            billingHistory: [{ id: 'inv-001', date: '2025-10-01', amount: 45000, description: 'Premium Plan - Monthly', status: 'Paid' }], 
            location: 'Lagos, NG' 
        },
        { 
            id: 'CUS-002', 
            businessName: 'Kano Fabrics', 
            customerName: 'Amina Kano', 
            phone: '+2348000000002', 
            email: 'sales@kanofabrics.ng', 
            username: 'amina.kano', 
            plan: 'Standard', 
            mrr: 15000, 
            registrationDate: '2026-05-01', 
            paymentDate: '2026-05-01', 
            onboardingCompleted: false, 
            lastLoginDate: '2026-05-02', 
            lastTransactionDate: '2026-05-01', 
            renewalDate: '2027-05-01', 
            upsellOpportunity: null, 
            status: 'New', 
            healthScore: 40, 
            healthTrend: 'falling', 
            usageLevel: 5, 
            customerHappiness: 0, 
            nextFollowUp: '2026-05-20', 
            nextAction: 'Call management to schedule overdue activation onboarding.', 
            agent: 'Mike T.', 
            manager: 'John D.', 
            accountManager: 'Grace T.', 
            tags: ['Onboarding Delayed'], 
            logs: [
                { id: 'cus002-email-reply-1', type: 'Email', summary: 'Hi, we cannot schedule our onboarding session this week because we are having internet downtime at our Kano warehouse. Is it possible to postpone it to Tuesday next week?', date: '2026-06-20T16:45:00Z', loggedBy: 'Amina Kano (Customer)' },
                { id: 'cus002-email-sent-1', type: 'Email', summary: 'Sent Email\nSubject: Urgently Schedule activation onboarding\n\nHi Amina,\n\nWe noticed you haven\'t fully completed your onboarding setup since registering. Let\'s schedule a call this week!', date: '2026-06-18T10:00:00Z', loggedBy: 'Grace T.' }
            ], 
            addons: [], 
            locationsCount: 1, 
            usersCount: 3, 
            industry: 'Textiles', 
            segment: 'B2B', 
            businessType: 'Wholesale', 
            billingHistory: [{ id: 'inv-003', date: '2026-05-01', amount: 15000, description: 'Standard Plan - Monthly', status: 'Paid' }], 
            badReview: true, 
            location: 'Kano, NG' 
        },
        { 
            id: 'CUS-003', 
            businessName: 'Lagos Logistics', 
            customerName: 'Tunde Bakare', 
            phone: '+2348000000003', 
            email: 'admin@lagoslog.com', 
            username: 'tunde.bakare', 
            plan: 'Basic', 
            mrr: 5000, 
            registrationDate: '2025-01-12', 
            paymentDate: '2025-01-12', 
            onboardingCompleted: true, 
            lastLoginDate: '2026-02-15', 
            lastTransactionDate: '2026-02-20', 
            renewalDate: '2026-01-12', 
            upsellOpportunity: null, 
            status: 'Not Active', 
            healthScore: 10, 
            healthTrend: 'falling', 
            usageLevel: 0, 
            customerHappiness: -40, 
            nextFollowUp: '2026-05-22', 
            nextAction: 'Resolve payment disputes and check on unresolved delivery complaints.', 
            agent: 'Sarah O.', 
            manager: 'David K.', 
            accountManager: 'Felix M.', 
            tags: ['Churn Risk', 'Conflict', 'Need Check-in'], 
            logs: [
                { id: 'cus003-email-reply-1', type: 'Email', summary: 'Hello Felix and Grace, the delivery complaints from our customers are resolved but we have a payment dispute. The system registered a duplicate transaction ID on June 1. Can you help refund the extra 5,000 NGN?', date: '2026-06-21T08:15:00Z', loggedBy: 'Tunde Bakare (Customer)' },
                { id: 'log-2', type: 'Email', summary: 'Agent conflict reported.', date: '2026-05-10', loggedBy: 'Felix M.' }
            ], 
            addons: [], 
            locationsCount: 2, 
            usersCount: 5, 
            industry: 'Logistics', 
            segment: 'B2B', 
            businessType: 'Delivery', 
            billingHistory: [{ id: 'inv-004', date: '2026-05-01', amount: 5000, description: 'Basic Plan - Monthly', status: 'Failed' }], 
            conflictReported: true, 
            location: 'Lagos, NG' 
        },
        { id: 'CUS-004', businessName: 'Abuja Wares', customerName: 'Hauwa Bello', phone: '+2348000000004', email: 'contact@abujawares.com', username: 'hauwa.wares', plan: 'Premium', mrr: 45000, registrationDate: '2024-11-05', paymentDate: '2024-11-05', onboardingCompleted: true, lastLoginDate: '2025-01-01', lastTransactionDate: '2025-01-15', renewalDate: '2026-06-15', upsellOpportunity: null, status: 'Not Active', healthScore: 20, healthTrend: 'no change', usageLevel: 5, customerHappiness: -20, nextFollowUp: '2026-05-24', nextAction: 'Inquire why the team-member log activity has dropped.', agent: 'Unassigned', manager: 'David K.', accountManager: 'Grace T.', tags: ['Almost Lost', '1 Year Inactive'], logs: [], addons: ['Advanced Analytics'], locationsCount: 5, usersCount: 20, industry: 'Retail', segment: 'B2C', businessType: 'Supermarket', billingHistory: [{id:'inv-005', date:'2025-10-30', amount:45000, description:'Premium Plan - Monthly', status:'Pending'}], unresolvedTickets: 3, location: 'Abuja, NG' },
        { id: 'CUS-005', businessName: 'Ibadan Retail Hub', customerName: 'Femi Adeyemi', phone: '+2348000000005', email: 'store@ibadanretail.ng', username: 'femi.retail', plan: 'Premium', mrr: 45000, registrationDate: '2026-02-15', paymentDate: '2026-02-15', onboardingCompleted: true, lastLoginDate: '2026-05-16', lastTransactionDate: '2026-05-14', renewalDate: '2027-02-15', upsellOpportunity: 'POS Hardware', status: 'Active', healthScore: 88, healthTrend: 'improving', usageLevel: 70, customerHappiness: 60, nextFollowUp: null, nextAction: 'Initiate 90-days experience check-in call.', agent: 'Sarah O.', manager: 'John D.', accountManager: 'Felix M.', tags: ['90-Days Check-in Due'], logs: [], addons: ['Multi-Store'], locationsCount: 2, usersCount: 8, industry: 'Retail', segment: 'B2C', businessType: 'Grocery', billingHistory: [{id:'inv-006', date:'2026-05-10', amount:45000, description:'Premium Plan - Monthly', status:'Paid'}], location: 'Ibadan, NG' },
        { id: 'CUS-006', businessName: 'City Pharmacy', customerName: 'Joy Eze', phone: '+2348000000006', email: 'info@citypharmacy.com', username: 'joy.pharm', plan: 'Standard', mrr: 15000, registrationDate: '2026-05-15', paymentDate: '2026-05-15', onboardingCompleted: true, lastLoginDate: '2026-05-17', lastTransactionDate: '2026-05-17', renewalDate: '2027-05-15', upsellOpportunity: null, status: 'New', healthScore: 100, healthTrend: 'improving', usageLevel: 15, customerHappiness: 0, nextFollowUp: '2026-05-22', nextAction: 'Assist with final deployment check of user accounts.', agent: 'Mike T.', manager: 'John D.', accountManager: 'Grace T.', tags: ['7-Day Activation Call'], logs: [], addons: [], locationsCount: 1, usersCount: 4, industry: 'Healthcare', segment: 'B2C', businessType: 'Pharmacy', billingHistory: [{id:'inv-007', date:'2026-05-15', amount:15000, description:'Standard Plan - Monthly', status:'Paid'}], location: 'Port Harcourt, NG' },
        { id: 'CUS-007', businessName: 'Enugu Motors', customerName: 'Obinna Eze', phone: '+2348000000007', email: 'hello@enugumotors.com', username: 'obinna.motors', plan: 'Standard', mrr: 15000, registrationDate: '2025-05-25', paymentDate: '2025-05-25', onboardingCompleted: true, lastLoginDate: '2026-04-10', lastTransactionDate: '2026-04-05', renewalDate: '2026-05-28', upsellOpportunity: 'Pro Upgrade', status: 'Lost', healthScore: 30, healthTrend: 'falling', usageLevel: 20, customerHappiness: 10, nextFollowUp: '2026-05-18', nextAction: null, agent: 'Mike T.', manager: 'John D.', accountManager: 'Grace T.', tags: ['Lost', 'Needs Recovery'], logs: [], addons: [], locationsCount: 1, usersCount: 2, industry: 'Automotive', segment: 'B2B/B2C', businessType: 'Dealership', billingHistory: [], location: 'Enugu, NG' }
    ]);

    const [searchQuery, setSearchQuery] = useState('');
    const [customerPage, setCustomerPage] = useState(1);
    const customersPerPage = 5;
    const [tagEditorVisible, setTagEditorVisible] = useState<string | null>(null);
    const [newTagInput, setNewTagInput] = useState('');
    const [definedTags, setDefinedTags] = useState<string[]>([
        'Important', 'Uses App Daily', 'Renewal Soon', 'Onboarding Delayed',
        'Churn Risk', 'Conflict', 'Need Check-in', 'Almost Lost', '1 Year Inactive',
        '90-Days Check-in Due', '7-Day Activation Call', 'Lost', 'Needs Recovery', 'Recovered'
    ]);
    const [isGlobalTagsModalOpen, setIsGlobalTagsModalOpen] = useState(false);
    const [tempGlobalNewTagInput, setTempGlobalNewTagInput] = useState('');

    // Retention Portfolio Pagination, view, search, and layout states
    const [retentionView, setRetentionView] = useState<'split' | 'expired' | 'upcoming'>('split');
    const [retentionSearch, setRetentionSearch] = useState('');
    const [retentionLayout, setRetentionLayout] = useState<'grid' | 'table'>('grid');
    const [retentionSort, setRetentionSort] = useState<'days-asc' | 'days-desc' | 'health-asc' | 'health-desc' | 'name-asc'>('days-asc');
    const [retentionPageExpired, setRetentionPageExpired] = useState(1);
    const [retentionPageUpcoming, setRetentionPageUpcoming] = useState(1);
    const retentionItemsPerPage = 10;

    // Modal & Drawer State
    const [selectedCustomerForView, setSelectedCustomerForView] = useState<CSCustomer | null>(null);
    const [loggingActivityFor, setLoggingActivityFor] = useState<CSCustomer | null>(null);
    const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
    const [resetPasswordInput, setResetPasswordInput] = useState('');
    const [isBrmRatingModalOpen, setIsBrmRatingModalOpen] = useState(false);
    const [brmRatingInput, setBrmRatingInput] = useState<number>(3);
    const [brmFeedbackInput, setBrmFeedbackInput] = useState('');
    
    // Activity Form State
    const [actType, setActType] = useState<'Call' | 'Email' | 'Meeting' | 'Note'>('Call');
    const [actSummary, setActSummary] = useState('');
    const [actNextFollowUp, setActNextFollowUp] = useState('');
    const [actNextAction, setActNextAction] = useState('');
    
    // Direct Messaging State
    const [messageInput, setMessageInput] = useState('');
    const [emailSubjectInput, setEmailSubjectInput] = useState('');
    const [selectedInboxCustomerId, setSelectedInboxCustomerId] = useState<string>('CUS-001');
    const [inboxMessageInput, setInboxMessageInput] = useState('');
    const [inboxSubjectInput, setInboxSubjectInput] = useState('');
    const [searchInboxQuery, setSearchInboxQuery] = useState('');
    const [inboxFilter, setInboxFilter] = useState<'all' | 'unread' | 'Premium' | 'Standard' | 'Basic'>('all');

    // Added states for Customer single/bulk email sending from Customer List
    const [sendingEmailTo, setSendingEmailTo] = useState<CSCustomer | null>(null);
    const [singleEmailSubject, setSingleEmailSubject] = useState('');
    const [singleEmailMessage, setSingleEmailMessage] = useState('');
    const [sendingBulkEmail, setSendingBulkEmail] = useState<boolean>(false);
    const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
    const [bulkEmailSubject, setBulkEmailSubject] = useState('');
    const [bulkEmailMessage, setBulkEmailMessage] = useState('');

    const handleAutoAssign = () => {
        const teamMembers = ['Sarah O.', 'Mike T.', 'Felix M.'];
        const updatedCustomers = customers.map((c, index) => ({
            ...c,
            accountManager: teamMembers[index % teamMembers.length],
            agent: teamMembers[index % teamMembers.length] // Optionally assign agent too, to make sure it runs the whole team
        }));
        setCustomers(updatedCustomers);
        showSuccess('Customers successfully assigned to Sarah, Mike, and Felix.');
    };

    const isTeamLead = currentUser === 'Grace T.';

    const handleReassignCustomer = (customerId: string, newCSM: string) => {
        setCustomers(prev => prev.map(c => 
            c.id === customerId ? { ...c, accountManager: newCSM, agent: newCSM } : c
        ));
        if (selectedCustomerForView?.id === customerId) {
            setSelectedCustomerForView(prev => prev ? { ...prev, accountManager: newCSM, agent: newCSM } : null);
        }
        showSuccess(`Customer reassigned to ${newCSM} successfully.`);
    };

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

    // All unique Customer Success / Account Managers for filtering by admins / head of CX
    const allCSRepresentatives = useMemo(() => {
        const managers = new Set(customers.map(c => c.accountManager).filter(Boolean));
        return Array.from(managers);
    }, [customers]);

    // Report metrics based on report CSM filter
    const reportMetrics = useMemo(() => {
        const targetCustomers = reportCsmFilter === 'all' 
            ? customers 
            : customers.filter(c => c.accountManager === reportCsmFilter);

        // Average happiness
        const customersWithHappiness = targetCustomers.filter(c => c.customerHappiness !== null && c.customerHappiness !== undefined);
        const totalHappiness = customersWithHappiness.reduce((sum, c) => sum + Number(c.customerHappiness), 0);
        const avgHappiness = customersWithHappiness.length > 0 ? Math.round(totalHappiness / customersWithHappiness.length) : 0;

        // Total customers contacted (customers with at least one log)
        const totalContactedCustomers = targetCustomers.filter(c => c.logs && c.logs.length > 0).length;
        
        // Total interactions (total sum of logs across target customers)
        const totalInteractions = targetCustomers.reduce((sum, c) => sum + (c.logs?.length || 0), 0);

        // Other metrics
        const totalCustomers = targetCustomers.length;
        const activeCustomers = targetCustomers.filter(c => c.status === 'Active').length;

        return {
            avgHappiness,
            totalContactedCustomers,
            totalInteractions,
            totalCustomers,
            activeCustomers
        };
    }, [customers, reportCsmFilter]);

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
            case 'about_to_churn': {
                const daysSinceLastTx = c.lastTransactionDate ? (now.getTime() - new Date(c.lastTransactionDate).getTime()) / (1000 * 3600 * 24) : 0;
                return (daysSinceReg >= 90 && daysSinceLastTx > 14) || c.badReview;
            }
            case 'new_to_call': 
                return c.status === 'New' && daysSinceReg <= 30;
            case 'checkins': 
                return (daysSinceReg >= 80 && daysSinceReg <= 110) || c.conflictReported;
            case 'retention': {
                const daysUntil = c.renewalDate ? (new Date(c.renewalDate).getTime() - now.getTime()) / (1000 * 3600 * 24) : null;
                const willExpireIn30Days = daysUntil !== null && daysUntil >= 0 && daysUntil <= 30;
                const isAlreadyExpired = (daysUntil !== null && daysUntil < 0) || 
                                          c.status === 'Lost' || 
                                          !c.billingHistory || 
                                          c.billingHistory.length === 0;
                return willExpireIn30Days || isAlreadyExpired;
            }
            case 'followups':
                return !!c.nextFollowUp && new Date(c.nextFollowUp).getTime() <= now.getTime() + (7 * 24 * 3600 * 1000);
            case 'tickets':
                return !!c.unresolvedTickets && c.unresolvedTickets > 0;
            default: return true; // 'all'
        }
    }).sort((a, b) => {
        return b.tags.length - a.tags.length;
    });

    const handleAddTag = (customerId: string, tagToAdd?: string) => {
        const inputTag = (tagToAdd || newTagInput).trim();
        if (!inputTag) return;
        setCustomers(customers.map(c => {
            if (c.id === customerId && !c.tags.includes(inputTag)) {
                return { ...c, tags: [...c.tags, inputTag] };
            }
            return c;
        }));
        
        if (!definedTags.includes(inputTag)) {
            setDefinedTags(prev => [...prev, inputTag].sort());
        }
        
        setNewTagInput('');
        setTagEditorVisible(null);
        showSuccess(`Tag "${inputTag}" added successfully.`);
    };

    const handleAddGlobalLibraryTag = () => {
        const val = tempGlobalNewTagInput.trim();
        if (!val) return;
        if (definedTags.includes(val)) {
            showError(`Tag "${val}" is already defined in the library.`);
            return;
        }
        setDefinedTags(prev => [...prev, val].sort());
        setTempGlobalNewTagInput('');
        showSuccess(`Tag "${val}" defined globally.`);
    };

    const handleRemoveGlobalLibraryTag = (tagToRemove: string) => {
        setDefinedTags(prev => prev.filter(t => t !== tagToRemove));
        showSuccess(`Removed "${tagToRemove}" from global library.`);
    };

    const allTags = useMemo(() => {
        const tags = new Set<string>(definedTags);
        customers.forEach(c => c.tags.forEach(t => tags.add(t)));
        return Array.from(tags).sort();
    }, [definedTags, customers]);

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
                    nextFollowUp: actNextFollowUp ? actNextFollowUp : c.nextFollowUp,
                    nextAction: actNextAction.trim() ? actNextAction.trim() : c.nextAction
                };
            }
            return c;
        }));

        if (selectedCustomerForView?.id === loggingActivityFor.id) {
             const updatedCustomer = { 
                ...selectedCustomerForView, 
                logs: [newLog, ...selectedCustomerForView.logs],
                nextFollowUp: actNextFollowUp ? actNextFollowUp : selectedCustomerForView.nextFollowUp,
                nextAction: actNextAction.trim() ? actNextAction.trim() : selectedCustomerForView.nextAction
             };
             setSelectedCustomerForView(updatedCustomer);
        }

        setLoggingActivityFor(null);
        setActType('Call');
        setActSummary('');
        setActNextFollowUp('');
        setActNextAction('');
        showSuccess('Activity logged successfully.');
    };

    const simulateCustomerReply = (customerObj: CSCustomer, lastSubject: string) => {
        let replyText = "Thank you for getting in touch! We appreciate the outstanding support and will review this with our management team.";
        const sub = lastSubject.toLowerCase();
        
        if (sub.includes('onboard') || sub.includes('activat') || sub.includes('setup') || sub.includes('schedul')) {
            replyText = `Hi ${currentUser},\n\nThanks for reaching out! We are definitely ready to complete our onboarding and account setup. Our floor team is free next Tuesday around 11:30 AM WAT. Let me know if that works for our activation call!`;
        } else if (sub.includes('bill') || sub.includes('price') || sub.includes('pay') || sub.includes('pack') || sub.includes('dispute') || sub.includes('refund')) {
            replyText = `Hello ${currentUser},\n\nThank you for the billing assistance. Our accounting supervisor has been informed and we have successfully initiated the subscription renewal payment transfer on our end. Please verify on your side.`;
        } else if (sub.includes('complain') || sub.includes('issue') || sub.includes('support') || sub.includes('ticket') || sub.includes('disput') || sub.includes('reconcil')) {
            replyText = `Hi Grace,\n\nWe appreciate you looking into this conflict so promptly! The customer dispute has been resolved satisfactorily. We\'ll keep monitoring this week and let you know if anything else arises.`;
        } else if (sub.includes('upsell') || sub.includes('feature') || sub.includes('addon') || sub.includes('module')) {
            replyText = `Hello ${currentUser},\n\nWe read your proposal for the Prokip Inventory Plus add-on module. It sounds like an excellent upgrade! Can we schedule a brief 10-minute demo this Thursday?`;
        } else {
            replyText = `Dear ${currentUser},\n\nThank you for checking in on us! Everything is working beautifully, and our team is logging transactions smoothly on Prokip. We really appreciate your proactive assistance.`;
        }

        const replyLog: ActivityLog = {
            id: `reply-${Date.now()}`,
            type: 'Email',
            summary: replyText,
            date: new Date().toISOString(),
            loggedBy: `${customerObj.customerName || 'Customer'} (Customer Reply)`
        };

        setCustomers(prev => prev.map(c => {
            if (c.id === customerObj.id) {
                return { ...c, logs: [replyLog, ...c.logs] };
            }
            return c;
        }));

        if (selectedCustomerForView && selectedCustomerForView.id === customerObj.id) {
            setSelectedCustomerForView(prev => prev ? { ...prev, logs: [replyLog, ...prev.logs] } : null);
        }

        showSuccess(`Inbound reply received from ${customerObj.businessName}!`);
    };

    const handleSendMessage = () => {
        if (!selectedCustomerForView || !messageInput.trim() || !emailSubjectInput.trim()) {
            showError("Please enter both a subject and message body.");
            return;
        }
        
        const targetId = selectedCustomerForView.id;
        const targetSubject = emailSubjectInput;
        const targetBody = messageInput;

        const newLog: ActivityLog = {
            id: `msg-${Date.now()}`,
            type: 'Email',
            summary: `Sent Email\nSubject: ${targetSubject}\n\n${targetBody}`,
            date: new Date().toISOString(),
            loggedBy: `${currentUser} from Prokip`
        };

        setCustomers(prev => prev.map(c => {
            if (c.id === targetId) {
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
        setEmailSubjectInput('');
        showSuccess('Email sent successfully.');

        // Simulate reply from the customer dynamically
        setTimeout(() => {
            setCustomers(currentCustomers => {
                const updatedC = currentCustomers.find(c => c.id === targetId);
                if (updatedC) {
                    simulateCustomerReply(updatedC, targetSubject);
                }
                return currentCustomers;
            });
        }, 2200);
    };

    const handleSendInboxMessage = (customerId: string) => {
        if (!inboxMessageInput.trim() || !inboxSubjectInput.trim()) {
            showError("Please enter both a subject and message body.");
            return;
        }

        const targetSubject = inboxSubjectInput;
        const targetBody = inboxMessageInput;

        const newLog: ActivityLog = {
            id: `msg-${Date.now()}`,
            type: 'Email',
            summary: `Sent Email\nSubject: ${targetSubject}\n\n${targetBody}`,
            date: new Date().toISOString(),
            loggedBy: `${currentUser} from Prokip`
        };

        setCustomers(prev => prev.map(c => {
            if (c.id === customerId) {
                return { ...c, logs: [newLog, ...c.logs] };
            }
            return c;
        }));

        setInboxMessageInput('');
        setInboxSubjectInput('');
        showSuccess('Email sent successfully.');

        // Simulate reply from the customer dynamically
        setTimeout(() => {
            setCustomers(currentCustomers => {
                const updatedC = currentCustomers.find(c => c.id === customerId);
                if (updatedC) {
                    simulateCustomerReply(updatedC, targetSubject);
                }
                return currentCustomers;
            });
        }, 2200);
    };

    const handleSendSingleEmailDirect = () => {
        if (!sendingEmailTo || !singleEmailSubject.trim() || !singleEmailMessage.trim()) {
            showError("Please enter both a subject and message body.");
            return;
        }

        const targetId = sendingEmailTo.id;
        const targetSubject = singleEmailSubject;
        const targetBody = singleEmailMessage;

        const newLog: ActivityLog = {
            id: `msg-${Date.now()}`,
            type: 'Email',
            summary: `Sent Email\nSubject: ${targetSubject}\n\n${targetBody}`,
            date: new Date().toISOString(),
            loggedBy: `${currentUser} from Prokip`
        };

        setCustomers(prev => prev.map(c => {
            if (c.id === targetId) {
                return { ...c, logs: [newLog, ...c.logs] };
            }
            return c;
        }));

        if (selectedCustomerForView && selectedCustomerForView.id === targetId) {
            setSelectedCustomerForView(prev => prev ? { ...prev, logs: [newLog, ...prev.logs] } : null);
        }

        setSingleEmailSubject('');
        setSingleEmailMessage('');
        setSendingEmailTo(null);
        showSuccess(`Email sent to ${sendingEmailTo.businessName} successfully.`);

        // Simulate reply from the customer dynamically
        setTimeout(() => {
            setCustomers(currentCustomers => {
                const updatedC = currentCustomers.find(c => c.id === targetId);
                if (updatedC) {
                    simulateCustomerReply(updatedC, targetSubject);
                }
                return currentCustomers;
            });
        }, 2200);
    };

    const handleSendBulkEmail = () => {
        if (selectedCustomerIds.length === 0) {
            showError("No customers selected for bulk email.");
            return;
        }
        if (!bulkEmailSubject.trim() || !bulkEmailMessage.trim()) {
            showError("Please enter both a subject and message body.");
            return;
        }

        const targetSubject = bulkEmailSubject;
        const targetBody = bulkEmailMessage;

        const timestampStr = new Date().toISOString();

        setCustomers(prev => prev.map(c => {
            if (selectedCustomerIds.includes(c.id)) {
                const newLog: ActivityLog = {
                    id: `msg-bulk-${Date.now()}-${c.id}`,
                    type: 'Email',
                    summary: `Sent Email\nSubject: ${targetSubject}\n\n${targetBody}`,
                    date: timestampStr,
                    loggedBy: `${currentUser} from Prokip`
                };
                return { ...c, logs: [newLog, ...c.logs] };
            }
            return c;
        }));

        setBulkEmailSubject('');
        setBulkEmailMessage('');
        setSendingBulkEmail(false);
        setSelectedCustomerIds([]);
        showSuccess(`Bulk email successfully sent to ${selectedCustomerIds.length} selected customers.`);
    };

    const getHealthColor = (score: number) => {
        if (score >= 80) return 'text-emerald-500 bg-emerald-50 border-emerald-200';
        if (score >= 50) return 'text-amber-500 bg-amber-50 border-amber-200';
        return 'text-rose-500 bg-rose-50 border-rose-200';
    };

    return (
        <div className="p-6 animate-fade-in space-y-6 pb-20 relative">
            <div className="flex border-b border-slate-200 pb-4">
                {/* Tier 1: Main Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 shadow-inner w-max">
                    <button 
                        onClick={() => setActiveDashboardTab('customers')}
                        className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${activeDashboardTab === 'customers' ? 'bg-white text-[#02275A] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        <i className="fas fa-users mr-1"></i> Customer List
                    </button>
                    <button 
                        onClick={() => {
                            setActiveDashboardTab('emails');
                            if (customers.length > 0 && !selectedInboxCustomerId) {
                                setSelectedInboxCustomerId(customers[0].id);
                            }
                        }}
                        className={`px-6 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-1.5 ${activeDashboardTab === 'emails' ? 'bg-white text-[#02275A] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        <i className="fas fa-envelope mr-1"></i> Inbox
                        {(() => {
                            const unansweredCount = customers.filter(c => {
                                const emailLogs = c.logs.filter(l => l.type === 'Email');
                                if (emailLogs.length === 0) return false;
                                return emailLogs[0].loggedBy.includes('(Customer');
                            }).length;
                            return unansweredCount > 0 ? (
                                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-rose-600 text-white rounded-full leading-none animate-pulse">
                                    {unansweredCount}
                                </span>
                            ) : null;
                        })()}
                    </button>
                    <button 
                        onClick={() => setActiveDashboardTab('reports')}
                        className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${activeDashboardTab === 'reports' ? 'bg-white text-[#02275A] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        <i className="fas fa-chart-pie mr-1"></i> Reports & Staff Work
                    </button>
                    <button 
                        onClick={() => setActiveDashboardTab('settings')}
                        className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${activeDashboardTab === 'settings' ? 'bg-white text-[#02275A] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        <i className="fas fa-cog mr-1"></i> Settings
                    </button>
                </div>
            </div>

            {activeDashboardTab === 'customers' && (
                <>

                    {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <div className="bg-[#02275A] p-5 rounded-xl shadow-md flex items-center justify-between text-white relative overflow-hidden group hover:cursor-pointer" onClick={() => setActiveTab('onbd_delayed')}>
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

            {/* View Mode Toggle: Assigned to Me vs All Customers */}
            {userRole === 'customer-success' && (
                <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 shadow-inner w-max">
                    <button 
                        onClick={() => setViewMode('mine')}
                        className={`px-6 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-1 ${viewMode === 'mine' ? 'bg-[#02275A] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        Assigned to Me <span className={viewMode === 'mine' ? "text-amber-300" : "text-amber-600 font-extrabold"}>({customers.filter(c => c.accountManager === currentUser).length})</span>
                    </button>
                    <button 
                        onClick={() => setViewMode('all')}
                        className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${viewMode === 'all' || (viewMode !== 'mine' && viewMode !== 'all') ? 'bg-[#02275A] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        All Customers
                    </button>
                </div>
            )}

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
                    <button onClick={() => setActiveTab('about_to_churn')} className={`px-5 py-4 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${activeTab === 'about_to_churn' ? 'border-rose-500 text-rose-600' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
                        About to Churn
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

                <div className="p-4 bg-slate-50 border-b border-slate-100 space-y-4">
                    {/* Primary Search Row - High Visibility */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative w-full md:max-w-xl flex-1">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                                <i className="fas fa-search text-[#02275A] text-base opacity-90"></i>
                            </span>
                            <input
                                type="text"
                                placeholder="Search by Business Name, Customer Success Rep, or Agent..."
                                className="bg-white border-2 border-slate-200 text-sm rounded-lg pl-11 pr-10 py-2.5 outline-none focus:border-[#02275A] focus:ring-4 focus:ring-[#02275A]/10 w-full shadow-sm text-slate-800 placeholder-slate-400 font-medium transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button 
                                    onClick={() => setSearchQuery('')}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                                    title="Clear search"
                                >
                                    <i className="fas fa-times-circle"></i>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Filters Row */}
                    <div className="flex gap-2 w-full flex-wrap items-center">
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
                        {userRole !== 'customer-success' && (
                            <select 
                                value={viewMode}
                                onChange={e => setViewMode(e.target.value)}
                                className="bg-white border border-slate-200 text-slate-700 px-3 py-2 rounded-lg text-sm font-bold outline-none focus:border-[#02275A] shadow-sm flex-1 md:w-auto cursor-pointer"
                            >
                                <option value="all">Success Experts</option>
                                {allCSRepresentatives.map(am => (
                                    <option key={am} value={am}>Assigned to {am}</option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>

                {activeTab === 'retention' ? (() => {
                    const expiredList = filteredCustomers.filter(c => {
                        const daysUntil = c.renewalDate ? (new Date(c.renewalDate).getTime() - now.getTime()) / (1000 * 3600 * 24) : null;
                        return (daysUntil !== null && daysUntil < 0) || c.status === 'Lost' || !c.billingHistory || c.billingHistory.length === 0;
                    });

                    const upcomingList = filteredCustomers.filter(c => {
                        const daysUntil = c.renewalDate ? (new Date(c.renewalDate).getTime() - now.getTime()) / (1000 * 3600 * 24) : null;
                        const isExpired = (daysUntil !== null && daysUntil < 0) || c.status === 'Lost' || !c.billingHistory || c.billingHistory.length === 0;
                        return !isExpired && daysUntil !== null && daysUntil >= 0 && daysUntil <= 30;
                    });

                    // Search filtering specific to retention
                    const matchesSearchInRetention = (c: CSCustomer) => {
                        if (!retentionSearch.trim()) return true;
                        const query = retentionSearch.toLowerCase();
                        return (
                            c.businessName.toLowerCase().includes(query) ||
                            (c.customerName && c.customerName.toLowerCase().includes(query)) ||
                            c.email.toLowerCase().includes(query) ||
                            c.phone.includes(query) ||
                            c.accountManager.toLowerCase().includes(query) ||
                            c.agent.toLowerCase().includes(query) ||
                            c.tags.some(tag => tag.toLowerCase().includes(query))
                        );
                    };

                    // Sort comparator specific to retention
                    const sortComparison = (a: CSCustomer, b: CSCustomer) => {
                        const daysA = a.renewalDate ? (new Date(a.renewalDate).getTime() - now.getTime()) / (1000 * 3600 * 24) : 999;
                        const daysB = b.renewalDate ? (new Date(b.renewalDate).getTime() - now.getTime()) / (1000 * 3600 * 24) : 999;
                        
                        if (retentionSort === 'days-asc') return daysA - daysB;
                        if (retentionSort === 'days-desc') return daysB - daysA;
                        if (retentionSort === 'health-asc') return a.healthScore - b.healthScore;
                        if (retentionSort === 'health-desc') return b.healthScore - a.healthScore;
                        if (retentionSort === 'name-asc') return a.businessName.localeCompare(b.businessName);
                        return 0;
                    };

                    const filteredSortedExpired = expiredList.filter(matchesSearchInRetention).sort(sortComparison);
                    const filteredSortedUpcoming = upcomingList.filter(matchesSearchInRetention).sort(sortComparison);

                    // Compute bounded page indexes to prevent out-of-bound errors on live search
                    const currentExpiredPage = Math.min(retentionPageExpired, Math.ceil(filteredSortedExpired.length / retentionItemsPerPage) || 1);
                    const currentUpcomingPage = Math.min(retentionPageUpcoming, Math.ceil(filteredSortedUpcoming.length / retentionItemsPerPage) || 1);

                    const paginatedExpired = filteredSortedExpired.slice((currentExpiredPage - 1) * retentionItemsPerPage, currentExpiredPage * retentionItemsPerPage);
                    const paginatedUpcoming = filteredSortedUpcoming.slice((currentUpcomingPage - 1) * retentionItemsPerPage, currentUpcomingPage * retentionItemsPerPage);

                    const renderCustomerRenewalCard = (customer: CSCustomer, isExpired: boolean) => {
                        const daysUntil = customer.renewalDate ? (new Date(customer.renewalDate).getTime() - now.getTime()) / (1000 * 3600 * 24) : null;

                        let healthLabel = 'Inactive';
                        let healthStyleClass = 'bg-amber-50 text-amber-700 border-amber-200';

                        if (customer.status === 'New') {
                            healthLabel = 'New';
                            healthStyleClass = 'bg-blue-50 text-blue-700 border-blue-200';
                        } else if (customer.status === 'Active') {
                            healthLabel = 'Active';
                            healthStyleClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                        } else if (customer.status === 'Not Active') {
                            healthLabel = 'Inactive';
                            healthStyleClass = 'bg-amber-50 text-amber-700 border-amber-200';
                        } else if (customer.status === 'Lost' || !customer.billingHistory || customer.billingHistory.length === 0) {
                            healthLabel = 'Expired';
                            healthStyleClass = 'bg-rose-50 text-rose-700 border-rose-200';
                        }

                        const daysSinceReg = customer.registrationDate ? (now.getTime() - new Date(customer.registrationDate).getTime()) / (1000 * 3600 * 24) : 0;
                        const daysSinceTx = customer.lastTransactionDate ? (now.getTime() - new Date(customer.lastTransactionDate).getTime()) / (1000 * 3600 * 24) : 999;
                        
                        let actionItem = { text: 'Monitor Account', icon: 'fa-eye', color: 'text-slate-500 bg-slate-50 border-slate-200' };

                        const hasRecentActivity = customer.logs && customer.logs.some(log => {
                            if (!log.date) return false;
                            const logTime = new Date(log.date).getTime();
                            const diffDays = (now.getTime() - logTime) / (1000 * 3600 * 24);
                            return diffDays >= 0 && diffDays <= 30;
                        });

                        if (!hasRecentActivity) {
                            actionItem = { text: 'No Activity', icon: 'fa-history', color: 'text-rose-600 bg-rose-50 border-rose-200 shadow-sm' };
                        } else if (customer.status === 'Lost' || customer.status === 'Not Active' || daysSinceTx > 90) {
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
                        }

                        return (
                            <div key={customer.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col gap-4 relative">
                                
                                {/* Row 1: Business name and Core actions */}
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex flex-col">
                                        <h3 onClick={() => setSelectedCustomerForView(customer)} className="font-extrabold text-[#02275A] text-base hover:underline cursor-pointer transition-all">
                                            {customer.businessName}
                                        </h3>
                                        {customer.location && (
                                            <span className="text-[11px] font-semibold text-slate-500 mt-1 flex items-center">
                                                <i className="fas fa-map-marker-alt text-slate-400 mr-1.5"></i> {customer.location}
                                            </span>
                                        )}
                                    </div>
                                    
                                    {/* Action dropdown menu */}
                                    <div className="relative group/dropdown inline-block text-left">
                                        <button className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm">
                                            Actions <i className="fas fa-chevron-down text-[10px] text-slate-400"></i>
                                        </button>
                                        <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-slate-100 shadow-slate-200/50 opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all -translate-y-1 group-hover/dropdown:translate-y-0 z-[40] overflow-hidden">
                                            <button 
                                                onClick={() => setLoggingActivityFor(customer)}
                                                className="w-full text-left px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-b border-slate-50 transition-colors pointer-events-auto"
                                            >
                                                <div className="w-5 flex justify-center text-[#02275A]"><i className="fas fa-bolt"></i></div>
                                                Log Activity
                                            </button>
                                            <button 
                                                onClick={() => setSelectedCustomerForView(customer)}
                                                className="w-full text-left px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors pointer-events-auto"
                                            >
                                                <div className="w-5 flex justify-center text-slate-400"><i className="fas fa-eye"></i></div>
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Active subscription timeline alert - beautiful, rounded */}
                                {isExpired ? (
                                    <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex flex-col gap-1 text-xs">
                                        <div className="flex items-center gap-1.5 text-rose-700 font-extrabold uppercase text-[9px] tracking-wider">
                                            <i className="fas fa-exclamation-triangle"></i> Expired Subscription
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-rose-800 font-bold mt-1">
                                            <span>Date expired:</span>
                                            <span className="font-extrabold underline">{customer.renewalDate || 'No subscription recorded'}</span>
                                        </div>
                                        {daysUntil !== null && (
                                            <div className="text-[10px] text-rose-600 font-bold text-right mt-0.5">
                                                ({Math.abs(Math.floor(daysUntil))} days ago)
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex flex-col gap-1 text-xs">
                                        <div className="flex items-center gap-1.5 text-amber-700 font-extrabold uppercase text-[9px] tracking-wider">
                                            <i className="fas fa-clock"></i> Upcoming Expiration
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-amber-800 font-bold mt-1">
                                            <span>Date will expire:</span>
                                            <span className="font-extrabold underline">{customer.renewalDate}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-[11px] text-amber-700 font-bold mt-0.5">
                                            <span>Expires in:</span>
                                            <span className="font-black text-amber-900">{Math.max(0, Math.ceil(daysUntil ?? 0))} days</span>
                                        </div>
                                    </div>
                                )}

                                {/* Card Details Grid - avoids crowding */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-b border-dashed border-slate-100 py-3.5 my-0.5">
                                    
                                    {/* Column 1 info: User contacts & plan */}
                                    <div className="space-y-3">
                                        <div className="flex flex-col gap-0.5 text-xs">
                                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Contact Name</span>
                                            <span className="font-extrabold text-slate-700">{customer.customerName || 'N/A'}</span>
                                            <span className="text-slate-500 font-medium text-[11px]">{customer.email}</span>
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Phone contact</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-slate-600">{customer.phone}</span>
                                                <div className="flex gap-1">
                                                    <a href={`tel:${customer.phone}`} className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-colors" title="Call">
                                                        <i className="fas fa-phone text-[9px]"></i>
                                                    </a>
                                                    <a href={`https://wa.me/${customer.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-emerald-600 hover:bg-emerald-100 transition-colors" title="WhatsApp">
                                                        <i className="fab fa-whatsapp text-[11px]"></i>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Plan badge info */}
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Plan details</span>
                                            <div>
                                                <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 uppercase tracking-widest inline-block">
                                                    {customer.plan} Plan
                                                </span>
                                            </div>
                                        </div>

                                        {/* State support team assignment */}
                                        <div className="flex flex-col gap-1 pt-1">
                                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Assigned BRM & Partner</span>
                                            <div className="space-y-1 text-[11px]">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <span className="text-slate-400 font-bold">CX Rep:</span>
                                                    {isTeamLead ? (
                                                        <select
                                                            value={customer.accountManager}
                                                            onChange={(e) => handleReassignCustomer(customer.id, e.target.value)}
                                                            className="font-bold text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded border border-indigo-200 outline-none cursor-pointer text-[11px]"
                                                        >
                                                            {['Sarah O.', 'Mike T.', 'Felix M.', 'Grace T.', 'David K.', 'Unassigned'].map(csm => (
                                                                <option key={csm} value={csm}>{csm}</option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <span className="font-bold text-indigo-700 bg-indigo-50 px-2 rounded border border-indigo-100">{customer.accountManager}</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-slate-400 font-bold">BRM:</span>
                                                    <span className="font-semibold text-slate-700">{(!customer.agent || customer.agent === 'Unassigned') && (!customer.partner || customer.partner === 'Unassigned') ? 'Prokip' : customer.agent || 'Prokip'}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-slate-400 font-bold">Partner:</span>
                                                    <span className="font-semibold text-slate-700">{(!customer.agent || customer.agent === 'Unassigned') && (!customer.partner || customer.partner === 'Unassigned') ? 'Prokip' : customer.partner || 'None'}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-slate-400 font-bold">State Mgr:</span>
                                                    <span className="font-semibold text-slate-700">{customer.manager}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Column 2 info: Health Scores, Required Actions and Login history */}
                                    <div className="flex flex-col justify-between gap-3 text-xs sm:pl-4 sm:border-l sm:border-slate-100">
                                        
                                        {/* Circular progress with status label */}
                                        <div className="flex items-center gap-3">
                                            <div className="relative w-11 h-11 flex items-center justify-center">
                                                <svg className="w-11 h-11 -rotate-90" viewBox="0 0 36 36">
                                                    <circle
                                                        className={`${
                                                            customer.healthScore >= 80 ? 'stroke-emerald-100' :
                                                            customer.healthScore >= 40 ? 'stroke-amber-100' :
                                                            'stroke-rose-100'
                                                        }`}
                                                        cx="18"
                                                        cy="18"
                                                        r="15"
                                                        strokeWidth="3.5"
                                                        fill="none"
                                                    />
                                                    <circle
                                                        className={`${
                                                            customer.healthScore >= 80 ? 'fill-emerald-50/10' :
                                                            customer.healthScore >= 40 ? 'fill-amber-50/10' :
                                                            'fill-rose-50/10'
                                                        }`}
                                                        cx="18"
                                                        cy="18"
                                                        r="13.5"
                                                    />
                                                    <circle
                                                        className={`transition-all duration-500 ${
                                                            customer.healthScore >= 80 ? 'stroke-emerald-500' :
                                                            customer.healthScore >= 40 ? 'stroke-amber-500' :
                                                            'stroke-rose-500'
                                                        }`}
                                                        cx="18"
                                                        cy="18"
                                                        r="15"
                                                        strokeWidth="3.5"
                                                        strokeDasharray="94.24"
                                                        strokeDashoffset={`${((100 - customer.healthScore) * 94.24) / 100}`}
                                                        strokeLinecap="round"
                                                        fill="none"
                                                    />
                                                </svg>
                                                <div className={`absolute inset-0 flex items-center justify-center font-black text-xs ${
                                                    customer.healthScore >= 80 ? 'text-emerald-700' :
                                                    customer.healthScore >= 40 ? 'text-amber-600' :
                                                    'text-rose-700'
                                                }`}>
                                                    {customer.healthScore}
                                                </div>
                                                <div className="absolute bottom-[-1px] right-[-2px] bg-white rounded-full px-1 py-0.5 shadow-sm border border-slate-100 flex items-center justify-center min-w-[12px]">
                                                    {customer.healthTrend === 'improving' ? (
                                                        <i className="fas fa-arrow-up text-emerald-500 text-[8px] font-extrabold" />
                                                    ) : customer.healthTrend === 'falling' ? (
                                                        <i className="fas fa-arrow-down text-rose-500 text-[8px] font-extrabold" />
                                                    ) : (
                                                        <span className="text-slate-400 font-extrabold text-[8px]">-</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Health Assessment</span>
                                                <div>
                                                    <span className={`inline-block text-[8px] font-extrabold px-2 py-0.5 rounded-full border tracking-wider uppercase ${healthStyleClass}`}>
                                                        {healthLabel}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Engagement Box */}
                                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[10px] space-y-1">
                                            <div className="flex items-center justify-between text-slate-500 font-medium">
                                                <span className="flex items-center gap-1"><i className="fas fa-sign-in-alt text-slate-400 text-[8px]"></i> Last Login:</span>
                                                <span className="font-bold text-slate-700">{customer.lastLoginDate ? formatRelativeTime(customer.lastLoginDate) : 'Never'}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-slate-500 font-medium">
                                                <span className="flex items-center gap-1"><i className="fas fa-money-bill-wave text-slate-400 text-[8px]"></i> Last Transaction:</span>
                                                <span className="font-bold text-slate-700">{customer.lastTransactionDate ? formatRelativeTime(customer.lastTransactionDate) : 'Never'}</span>
                                            </div>
                                        </div>

                                        {/* Required Actions Container */}
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Required Action</span>
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white hover:bg-opacity-82 shadow-xs text-[11px] font-extrabold border ${actionItem.color}`}>
                                                    <i className={`fas ${actionItem.icon} text-xs`}></i>
                                                    <span>{actionItem.text}</span>
                                                </div>
                                                {hasRecentActivity && customer.nextFollowUp && (() => {
                                                    const isDue = (new Date(customer.nextFollowUp).getTime() - now.getTime()) <= 0;
                                                    const isUpcoming = (new Date(customer.nextFollowUp).getTime() - now.getTime()) <= (7 * 24 * 3600 * 1000);
                                                    if (isDue || isUpcoming) {
                                                        return (
                                                            <div className={`text-[9px] font-bold px-2 py-0.5 rounded shadow-xs border inline-flex items-center gap-1 ${isDue ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                                                                <i className="far fa-calendar-alt text-[8px]"></i> {isDue ? 'Overdue' : 'Due'}
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                })()}
                                            </div>
                                        </div>

                                    </div>
                                </div>

                                {hasRecentActivity && ((customer.nextFollowUp) || customer.nextAction) && (
                                    <div className="p-3.5 rounded-xl bg-indigo-50/40 border border-indigo-100 flex flex-col gap-2 text-xs shadow-xs">
                                        <div className="flex items-center gap-1.5 text-indigo-800 font-extrabold uppercase text-[9px] tracking-wider">
                                            <i className="fas fa-bullseye text-[#02275A]"></i> Next Teammate Action Reminder
                                        </div>
                                        {customer.nextFollowUp && (
                                            <div className="flex items-center justify-between text-[11px] text-slate-600 font-bold">
                                                <span>Planned Follow-up:</span>
                                                <span className="font-extrabold text-indigo-950 bg-white border border-indigo-100 px-2 py-0.5 rounded shadow-xs text-[10px]">
                                                    {formatRelativeTime(customer.nextFollowUp)} ({customer.nextFollowUp})
                                                </span>
                                            </div>
                                        )}
                                        {customer.nextAction && (
                                            <div className="text-[11px] text-indigo-900 font-semibold leading-relaxed p-2.5 bg-white border border-indigo-100/60 rounded-lg shadow-2xs">
                                                <span className="block font-black text-[8px] text-indigo-400 tracking-widest mb-1">EXPECTED UPDATE ACTION:</span>
                                                "{customer.nextAction}"
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Row 4: Account tags - beautifully spaced with simple editor */}
                                <div className="flex flex-col gap-1">
                                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Account Tags</span>
                                    <div className="flex flex-wrap gap-1 mt-0.5">
                                        {customer.tags.map(tag => (
                                            <span key={tag} className="group/tag flex items-center gap-1 bg-slate-50 text-slate-700 font-bold text-[10px] px-2 py-0.5 rounded border border-slate-200 shadow-xs">
                                                {tag}
                                                <i 
                                                    className="fas fa-times text-slate-400 hover:text-rose-500 cursor-pointer transition-colors ml-1 text-[8px]"
                                                    onClick={() => handleRemoveTag(customer.id, tag)}
                                                    title="Remove Tag"
                                                ></i>
                                            </span>
                                        ))}
                                        <button 
                                            onClick={() => setTagEditorVisible(tagEditorVisible === customer.id ? null : customer.id)}
                                            className="bg-white border border-dashed border-slate-300 text-slate-400 hover:text-[#02275A] hover:border-[#02275A] font-bold text-[9px] px-2 py-0.5 rounded transition-colors"
                                        >
                                            <i className="fas fa-plus text-[8px]"></i> Add Tag
                                        </button>
                                    </div>
                                    {tagEditorVisible === customer.id && (
                                        <div className="mt-1.5 p-2 bg-slate-50 border border-slate-200 rounded-lg shadow-sm animate-fade-in relative z-20 w-full max-w-xs">
                                            <div className="flex gap-1">
                                                <input 
                                                    type="text" 
                                                    autoFocus
                                                    className="border border-slate-300 text-[10px] rounded px-2 py-0.5 w-full outline-none focus:border-[#02275A] shadow-xs bg-white text-slate-800"
                                                    placeholder="Search or type tag..."
                                                    value={newTagInput}
                                                    onChange={(e) => setNewTagInput(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handleAddTag(customer.id);
                                                        if (e.key === 'Escape') setTagEditorVisible(null);
                                                    }}
                                                />
                                                <button onClick={() => handleAddTag(customer.id)} className="bg-[#02275A] text-white px-2 py-0.5 rounded text-[10px] hover:bg-[#03367A] shrink-0 cursor-pointer"><i className="fas fa-check text-[8px]"></i></button>
                                            </div>
                                            <div className="mt-2 pt-2 border-t border-slate-200">
                                                <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 shadow-none">
                                                    {newTagInput ? 'Search Results' : 'Select Existing Tag'}
                                                </span>
                                                <div className="flex flex-col gap-1 max-h-36 overflow-y-auto custom-scrollbar w-full">
                                                    {definedTags
                                                        .filter(t => !customer.tags.includes(t) && t.toLowerCase().includes(newTagInput.toLowerCase()))
                                                        .map(tag => (
                                                            <button
                                                                key={tag}
                                                                onClick={() => handleAddTag(customer.id, tag)}
                                                                className="w-full text-left bg-white hover:bg-[#02275A]/10 text-slate-700 hover:text-[#02275A] border border-slate-200/60 rounded px-2 py-1 text-[10px] font-semibold transition-all cursor-pointer flex items-center justify-between"
                                                            >
                                                                <span>{tag}</span>
                                                                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Select</span>
                                                            </button>
                                                        ))}
                                                    {newTagInput.trim() && !definedTags.map(t => t.toLowerCase()).includes(newTagInput.toLowerCase().trim()) && (
                                                        <button
                                                            onClick={() => handleAddTag(customer.id, newTagInput.trim())}
                                                            className="w-full text-left bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded px-2 py-1 text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1.5"
                                                        >
                                                            <i className="fas fa-plus text-[8px]"></i>
                                                            <span>New: "{newTagInput.trim()}"</span>
                                                        </button>
                                                    )}
                                                    {definedTags.filter(t => !customer.tags.includes(t) && t.toLowerCase().includes(newTagInput.toLowerCase())).length === 0 && 
                                                     (!newTagInput.trim() || definedTags.map(t => t.toLowerCase()).includes(newTagInput.toLowerCase().trim())) && (
                                                        <span className="text-[9px] text-slate-400 italic">No matches found.</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="mt-1.5 pt-1.5 border-t border-slate-200 flex items-center justify-between text-[8px] text-slate-400 font-bold">
                                                <span>Library: {definedTags.length} tags</span>
                                                <button 
                                                    onClick={() => setIsGlobalTagsModalOpen(true)}
                                                    className="text-indigo-600 hover:underline hover:text-indigo-800 cursor-pointer"
                                                >
                                                    Manage Library
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                            </div>
                        );
                    };

                    const renderCustomerRenewalTable = (list: typeof filteredCustomers, isExpired: boolean) => {
                        return (
                            <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-xs max-w-full">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider text-[10px]">
                                            <th className="p-3 w-56">Business</th>
                                            <th className="p-3 w-40">Expiration Date</th>
                                            <th className="p-3 w-28">Health</th>
                                            <th className="p-3 w-44">Contact Person</th>
                                            <th className="p-3 w-44">Assigned BRM & Partner</th>
                                            <th className="p-3 min-w-44">Required Action</th>
                                            <th className="p-3 text-right w-24">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {list.map(customer => {
                                            const daysUntil = customer.renewalDate ? (new Date(customer.renewalDate).getTime() - now.getTime()) / (1000 * 3600 * 24) : null;
                                            
                                            let healthLabel = 'Inactive';
                                            let healthStyleClass = 'bg-amber-50 text-amber-700 border-amber-200';
                                            if (customer.status === 'New') {
                                                healthLabel = 'New';
                                                healthStyleClass = 'bg-blue-50 text-blue-700 border-blue-200';
                                            } else if (customer.status === 'Active') {
                                                healthLabel = 'Active';
                                                healthStyleClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                                            } else if (customer.status === 'Lost' || !customer.billingHistory || customer.billingHistory.length === 0) {
                                                healthLabel = 'Expired';
                                                healthStyleClass = 'bg-rose-50 text-rose-700 border-rose-200';
                                            }

                                            // Determine Required Action item
                                            const daysSinceReg = customer.registrationDate ? (now.getTime() - new Date(customer.registrationDate).getTime()) / (1000 * 3600 * 24) : 0;
                                            const daysSinceTx = customer.lastTransactionDate ? (now.getTime() - new Date(customer.lastTransactionDate).getTime()) / (1000 * 3600 * 24) : 999;
                                            
                                            let actionItem = { text: 'Monitor Account', icon: 'fa-eye', color: 'text-slate-500 bg-slate-50 border-slate-200' };

                                            const hasRecentActivity = customer.logs && customer.logs.some(log => {
                                                if (!log.date) return false;
                                                const logTime = new Date(log.date).getTime();
                                                const diffDays = (now.getTime() - logTime) / (1000 * 3600 * 24);
                                                return diffDays >= 0 && diffDays <= 30;
                                            });

                                            if (!hasRecentActivity) {
                                                actionItem = { text: 'No Activity', icon: 'fa-history', color: 'text-rose-600 bg-rose-50 border-rose-200 shadow-sm' };
                                            } else if (customer.status === 'Lost' || customer.status === 'Not Active' || daysSinceTx > 90) {
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
                                            }

                                            return (
                                                <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="p-3 align-middle font-bold text-slate-800">
                                                        <div className="flex flex-col gap-0.5">
                                                            <span 
                                                                onClick={() => setSelectedCustomerForView(customer)}
                                                                className="hover:underline cursor-pointer font-bold text-slate-800 text-[13px]"
                                                            >
                                                                {customer.businessName}
                                                            </span>
                                                            <span className="text-[10px] text-slate-400 font-semibold">{customer.location || 'N/A'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-3 align-middle">
                                                        {isExpired ? (
                                                            <div className="inline-flex flex-col animate-pulse">
                                                                <span className="text-rose-600 font-extrabold">{customer.renewalDate}</span>
                                                                <span className="text-[10px] text-rose-500 font-bold">Lapsed {daysUntil !== null ? Math.abs(Math.floor(daysUntil)) : 0} days ago</span>
                                                            </div>
                                                        ) : (
                                                            <div className="inline-flex flex-col">
                                                                <span className="text-amber-700 font-bold">{customer.renewalDate}</span>
                                                                <span className="text-[10px] text-amber-600 font-extrabold">{daysUntil !== null ? Math.max(0, Math.ceil(daysUntil)) : 0} days left</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="p-3 align-middle">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`px-1.5 py-0.5 rounded text-[11px] font-black ${
                                                                customer.healthScore >= 80 ? 'text-emerald-700 bg-emerald-50' :
                                                                customer.healthScore >= 40 ? 'text-amber-600 bg-amber-50' :
                                                                'text-rose-700 bg-rose-50'
                                                            }`}>
                                                                {customer.healthScore}
                                                            </span>
                                                            {customer.healthTrend === 'improving' ? (
                                                                <i className="fas fa-arrow-up text-emerald-500 text-[10px]" title="Improving" />
                                                            ) : customer.healthTrend === 'falling' ? (
                                                                <i className="fas fa-arrow-down text-rose-500 text-[10px]" title="Falling" />
                                                            ) : (
                                                                <span className="text-slate-300 text-[10px]" title="Flat">-</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-3 align-middle">
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="font-bold text-slate-700">{customer.customerName || 'N/A'}</span>
                                                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium mt-0.5">
                                                                <span>{customer.phone}</span>
                                                                <div className="flex gap-1">
                                                                    <a href={`tel:${customer.phone}`} className="text-blue-500 hover:text-blue-700"><i className="fas fa-phone text-[8px]"></i></a>
                                                                    <a href={`https://wa.me/${customer.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-700"><i className="fab fa-whatsapp text-[10px]"></i></a>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-3 align-middle text-slate-600 font-semibold">
                                                        <div className="flex flex-col leading-tight gap-1">
                                                            <span className="text-[11px] flex items-center gap-1 flex-wrap"><span className="text-slate-400">CX Rep:</span> 
                                                                {isTeamLead ? (
                                                                    <select
                                                                        value={customer.accountManager}
                                                                        onChange={(e) => handleReassignCustomer(customer.id, e.target.value)}
                                                                        className="font-bold text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded border border-indigo-200 outline-none cursor-pointer text-[10.5px]"
                                                                    >
                                                                        {['Sarah O.', 'Mike T.', 'Felix M.', 'Grace T.', 'David K.', 'Unassigned'].map(csm => (
                                                                            <option key={csm} value={csm}>{csm}</option>
                                                                        ))}
                                                                    </select>
                                                                ) : (
                                                                    <strong className="text-indigo-700">{customer.accountManager}</strong>
                                                                )}
                                                            </span>
                                                            <span className="text-[10px] text-slate-500"><span className="text-slate-400 font-normal">BRM:</span> {(!customer.agent || customer.agent === 'Unassigned') && (!customer.partner || customer.partner === 'Unassigned') ? 'Prokip' : customer.agent || 'Prokip'}</span>
                                                            <span className="text-[10px] text-slate-500"><span className="text-slate-400 font-normal">Partner:</span> {(!customer.agent || customer.agent === 'Unassigned') && (!customer.partner || customer.partner === 'Unassigned') ? 'Prokip' : customer.partner || 'None'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-3 align-middle">
                                                        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-extrabold border ${actionItem.color}`}>
                                                            <i className={`fas ${actionItem.icon}`}></i>
                                                            <span>{actionItem.text}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-3 align-middle text-right">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <button 
                                                                onClick={() => setLoggingActivityFor(customer)}
                                                                className="px-2 py-1.5 bg-[#02275A]/5 hover:bg-[#02275A]/10 text-[#02275A] border border-transparent rounded-lg font-bold text-[10px] transition-colors pointer-events-auto"
                                                                title="Log Activity"
                                                            >
                                                                <i className="fas fa-bolt"></i> Log
                                                            </button>
                                                            <button 
                                                                onClick={() => setSelectedCustomerForView(customer)}
                                                                className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[10px] transition-all pointer-events-auto"
                                                                title="View Details"
                                                            >
                                                                <i className="fas fa-eye text-[10px]"></i> View
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        );
                    };

                    const renderPaginationControls = (totalCount: number, currentPage: number, setPage: (p: number) => void) => {
                        const totalPages = Math.ceil(totalCount / retentionItemsPerPage) || 1;
                        if (totalPages <= 1) return null;
                        
                        const startItem = (currentPage - 1) * retentionItemsPerPage + 1;
                        const endItem = Math.min(currentPage * retentionItemsPerPage, totalCount);
                        const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

                        return (
                            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                                <div className="text-[11px] text-slate-500 font-bold">
                                    Showing <span className="text-[#02275A] font-extrabold">{startItem}–{endItem}</span> of <span className="text-slate-800 font-extrabold">{totalCount}</span> accounts
                                </div>
                                <div className="flex items-center gap-1">
                                    <button 
                                        disabled={currentPage === 1}
                                        onClick={() => setPage(currentPage - 1)}
                                        className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all pointer-events-auto shadow-2xs"
                                        title="Previous Page"
                                    >
                                        <i className="fas fa-chevron-left text-[9px]"></i>
                                    </button>
                                    
                                    {pages.map(page => {
                                        const isCurrent = page === currentPage;
                                        if (totalPages > 5 && Math.abs(page - currentPage) > 1 && page !== 1 && page !== totalPages) {
                                            if (page === 2 || page === totalPages - 1) {
                                                return <span key={page} className="text-slate-300 text-[10px] px-1 select-none font-bold">...</span>;
                                            }
                                            return null;
                                        }

                                        return (
                                            <button 
                                                key={page}
                                                onClick={() => setPage(page)}
                                                className={`w-8 h-8 rounded-lg font-bold text-xs transition-all pointer-events-auto ${
                                                    isCurrent 
                                                        ? 'bg-[#02275A] text-white border border-[#02275A] shadow-xs' 
                                                        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        );
                                    })}

                                    <button 
                                        disabled={currentPage === totalPages}
                                        onClick={() => setPage(currentPage + 1)}
                                        className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all pointer-events-auto shadow-2xs"
                                        title="Next Page"
                                    >
                                        <i className="fas fa-chevron-right text-[9px]"></i>
                                    </button>
                                </div>
                            </div>
                        );
                    };

                    return (
                        <div className="p-5 bg-slate-50/50 min-h-[480px]">
                            {/* Summary alert info bar */}
                            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
                                <div>
                                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                        <i className="fas fa-arrows-spin text-blue-600 animate-spin-slow"></i> Renewal Portfolio Manager
                                    </h4>
                                    <p className="text-xs text-slate-500 mt-1.5 font-semibold">
                                        Monitor already expired businesses and anticipate customer renewals due within 30 days. Designed for ultra-high high-volume portfolios.
                                    </p>
                                </div>
                                <div className="flex gap-3 text-xs font-bold shrink-0">
                                    <div 
                                        onClick={() => { setRetentionView('expired'); }}
                                        className={`flex items-center gap-2 border px-3 py-2 rounded-xl shadow-xs cursor-pointer transition-all ${
                                            retentionView === 'expired' 
                                                ? 'bg-rose-600 text-white border-rose-600' 
                                                : 'bg-rose-50 border-rose-100 text-rose-700 hover:bg-rose-100'
                                        }`}
                                    >
                                        <span className={`w-2 h-2 rounded-full ${retentionView === 'expired' ? 'bg-white' : 'bg-rose-500'} animate-pulse`}></span>
                                        <span>Expired: <strong className="font-extrabold">{expiredList.length}</strong></span>
                                    </div>
                                    <div 
                                        onClick={() => { setRetentionView('upcoming'); }}
                                        className={`flex items-center gap-2 border px-3 py-2 rounded-xl shadow-xs cursor-pointer transition-all ${
                                            retentionView === 'upcoming' 
                                                ? 'bg-amber-600 text-white border-amber-600' 
                                                : 'bg-amber-50 border-amber-100 text-amber-700 hover:bg-amber-100'
                                        }`}
                                    >
                                        <span className={`w-2 h-2 rounded-full ${retentionView === 'upcoming' ? 'bg-white' : 'bg-amber-500'}`}></span>
                                        <span>Expiring &le; 30 Days: <strong className="font-extrabold">{upcomingList.length}</strong></span>
                                    </div>
                                </div>
                            </div>

                            {/* Layout & Filtering Toolbar */}
                            <div className="bg-white p-4 rounded-xl border border-slate-200 mb-6 flex flex-col gap-4 shadow-sm">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                    
                                    {/* Action Toggles: Layout Split, Expired, Upcoming */}
                                    <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 self-start">
                                        <button 
                                            onClick={() => { setRetentionView('split'); }}
                                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all pointer-events-auto ${retentionView === 'split' ? 'bg-white text-[#02275A] shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                                        >
                                            <i className="fas fa-columns mr-1"></i> Split Columns ({expiredList.length + upcomingList.length})
                                        </button>
                                        <button 
                                            onClick={() => { setRetentionView('expired'); }}
                                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all pointer-events-auto ${retentionView === 'expired' ? 'bg-rose-50  text-rose-700 shadow-xs border border-rose-100' : 'text-slate-600 hover:text-rose-600'}`}
                                        >
                                            <i className="fas fa-exclamation-triangle mr-1 text-rose-500"></i> Expired Only ({expiredList.length})
                                        </button>
                                        <button 
                                            onClick={() => { setRetentionView('upcoming'); }}
                                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all pointer-events-auto ${retentionView === 'upcoming' ? 'bg-amber-50 text-amber-700 shadow-xs border border-amber-100' : 'text-slate-600 hover:text-amber-600'}`}
                                        >
                                            <i className="fas fa-clock mr-1 text-amber-500"></i> Expiring Soon Only ({upcomingList.length})
                                        </button>
                                    </div>

                                    {/* Layout format mode: Cards vs Table Sheet */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-500 font-bold hidden sm:inline">Density Layout:</span>
                                        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                                            <button 
                                                onClick={() => setRetentionLayout('grid')}
                                                className={`px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1 transition-all pointer-events-auto ${retentionLayout === 'grid' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                                                title="Comfortable Cards Grid"
                                            >
                                                <i className="fas fa-th-large text-[11px] text-slate-600"></i> <span className="text-[10px]">Comfortable Grid</span>
                                            </button>
                                            <button 
                                                onClick={() => setRetentionLayout('table')}
                                                className={`px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1 transition-all pointer-events-auto ${retentionLayout === 'table' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                                                title="Compact Database Row Table"
                                            >
                                                <i className="fas fa-list text-[11px] text-slate-600"></i> <span className="text-[10px]">Dense Row Sheet</span>
                                            </button>
                                        </div>
                                    </div>
                                    
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                                    {/* Quick Search */}
                                    <div className="relative md:col-span-8">
                                        <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                                        <input 
                                            type="text"
                                            value={retentionSearch}
                                            onChange={(e) => {
                                                setRetentionSearch(e.target.value);
                                                setRetentionPageExpired(1);
                                                setRetentionPageUpcoming(1);
                                            }}
                                            placeholder="Find within renewals by Business, Customer Name, Rep, Agent, or Tags..."
                                            className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg pl-8.5 pr-8 py-2.5 outline-none focus:bg-white focus:border-[#02275A] transition-all text-slate-800 placeholder-slate-400 font-bold"
                                        />
                                        {retentionSearch && (
                                            <button 
                                                onClick={() => { setRetentionSearch(''); }} 
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 pointer-events-auto"
                                            >
                                                <i className="fas fa-times-circle text-xs"></i>
                                            </button>
                                        )}
                                    </div>

                                    {/* Portfolio Sort Selection */}
                                    <div className="md:col-span-4 flex items-center gap-2">
                                        <span className="text-xs text-slate-500 font-bold whitespace-nowrap">Sort:</span>
                                        <select 
                                            value={retentionSort}
                                            onChange={(e) => {
                                                setRetentionSort(e.target.value as any);
                                            }}
                                            className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 px-3 py-2 rounded-lg text-xs font-bold outline-none focus:border-[#02275A] cursor-pointer"
                                        >
                                            <option value="days-asc">⏳ Days Remaining (Asc/Urgent)</option>
                                            <option value="days-desc">⏳ Days Remaining (Desc/Latest)</option>
                                            <option value="health-asc">⚠️ Health Score (Risk First)</option>
                                            <option value="health-desc">✅ Health Score (Safe First)</option>
                                            <option value="name-asc">🔤 Business Name (A-Z)</option>
                                        </select>
                                    </div>
                                </div>

                                {retentionSearch && (
                                    <div className="text-[11px] text-slate-500 font-bold">
                                        SearchResults: Found <span className="text-rose-600 font-extrabold">{filteredSortedExpired.length}</span> expired match(es) and <span className="text-amber-600 font-extrabold">{filteredSortedUpcoming.length}</span> expiring match(es).
                                    </div>
                                )}
                            </div>

                            {/* Dual side-by-side workspace sections */}
                            <div className="grid grid-cols-1 gap-6 items-start">
                                
                                {/* ALREADY EXPIRED Segment */}
                                {(retentionView === 'split' || retentionView === 'expired') && (
                                    <div className="bg-rose-50/15 rounded-2xl border border-rose-100 p-4">
                                        <div className="mb-4 flex items-center justify-between pb-3.5 border-b border-rose-100 flex-wrap gap-2">
                                            <div className="flex items-center gap-2">
                                                <span className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xs"><i className="fas fa-exclamation-triangle"></i></span>
                                                <div>
                                                    <h3 className="font-black text-rose-900 text-xs tracking-wider uppercase">Already Expired ({filteredSortedExpired.length})</h3>
                                                    <p className="text-[10px] text-rose-700/80 font-bold mt-0.5">Lapsed accounts requiring immediate rescue or recovery</p>
                                                </div>
                                            </div>
                                            {retentionView === 'expired' && (
                                                <span className="text-[10px] uppercase font-bold text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">Widescreen Focus</span>
                                            )}
                                        </div>

                                        {retentionLayout === 'grid' ? (
                                            <div className={`grid grid-cols-1 gap-4 ${retentionView === 'expired' ? 'md:grid-cols-2 xl:grid-cols-3' : 'md:grid-cols-1 lg:grid-cols-2'}`}>
                                                {paginatedExpired.map(c => renderCustomerRenewalCard(c, true))}
                                            </div>
                                        ) : (
                                            renderCustomerRenewalTable(paginatedExpired, true)
                                        )}

                                        {filteredSortedExpired.length === 0 && (
                                            <div className="p-10 text-center bg-white border border-dashed border-rose-205 rounded-xl text-xs font-bold text-rose-600/60 shadow-xs flex flex-col items-center gap-2">
                                                <i className="fas fa-box-open text-lg"></i>
                                                No expired segments found matching selection.
                                            </div>
                                        )}

                                        {renderPaginationControls(filteredSortedExpired.length, currentExpiredPage, setRetentionPageExpired)}
                                    </div>
                                )}

                                {/* UPCOMING EXPIRATIONS Segment */}
                                {(retentionView === 'split' || retentionView === 'upcoming') && (
                                    <div className="bg-amber-50/15 rounded-2xl border border-amber-100 p-4 mt-2">
                                        <div className="mb-4 flex items-center justify-between pb-3.5 border-b border-amber-100 flex-wrap gap-2">
                                            <div className="flex items-center gap-2">
                                                <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-xs"><i className="fas fa-clock"></i></span>
                                                <div>
                                                    <h3 className="font-black text-amber-900 text-xs tracking-wider uppercase">Expiring Inside 30 Days ({filteredSortedUpcoming.length})</h3>
                                                    <p className="text-[10px] text-amber-700/80 font-bold mt-0.5">Subscription expiries due for renewal follow-ups</p>
                                                </div>
                                            </div>
                                            {retentionView === 'upcoming' && (
                                                <span className="text-[10px] uppercase font-bold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">Widescreen Focus</span>
                                            )}
                                        </div>

                                        {retentionLayout === 'grid' ? (
                                            <div className={`grid grid-cols-1 gap-4 ${retentionView === 'upcoming' ? 'md:grid-cols-2 xl:grid-cols-3' : 'md:grid-cols-1 lg:grid-cols-2'}`}>
                                                {paginatedUpcoming.map(c => renderCustomerRenewalCard(c, false))}
                                            </div>
                                        ) : (
                                            renderCustomerRenewalTable(paginatedUpcoming, false)
                                        )}

                                        {filteredSortedUpcoming.length === 0 && (
                                            <div className="p-10 text-center bg-white border border-dashed border-amber-200 rounded-xl text-xs font-bold text-amber-600/60 shadow-xs flex flex-col items-center gap-2">
                                                <i className="fas fa-check-double text-lg text-amber-400"></i>
                                                No upcoming expirations matches found.
                                            </div>
                                        )}

                                        {renderPaginationControls(filteredSortedUpcoming.length, currentUpcomingPage, setRetentionPageUpcoming)}
                                    </div>
                                )}

                            </div>
                        </div>
                    );
                })() : (() => {
                    const currentCustomerPage = Math.min(customerPage, Math.ceil(filteredCustomers.length / customersPerPage) || 1);
                    const paginatedCustomers = filteredCustomers.slice((currentCustomerPage - 1) * customersPerPage, currentCustomerPage * customersPerPage);
                    
                    const renderGeneralPagination = () => {
                        const totalPages = Math.ceil(filteredCustomers.length / customersPerPage) || 1;
                        
                        const startItem = (currentCustomerPage - 1) * customersPerPage + 1;
                        const endItem = Math.min(currentCustomerPage * customersPerPage, filteredCustomers.length);
                        const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

                        return (
                            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                                <div className="text-[11px] text-slate-500 font-bold">
                                    Showing <span className="text-[#02275A] font-extrabold">{startItem}–{endItem}</span> of <span className="text-slate-800 font-extrabold">{filteredCustomers.length}</span> accounts
                                </div>
                                <div className="flex items-center gap-1">
                                    <button 
                                        disabled={currentCustomerPage === 1}
                                        onClick={() => setCustomerPage(currentCustomerPage - 1)}
                                        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent"
                                    ><i className="fas fa-chevron-left text-[10px]"></i></button>
                                    {pages.map(p => (
                                        <button 
                                            key={p} onClick={() => setCustomerPage(p)}
                                            className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${currentCustomerPage === p ? 'bg-[#02275A] text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                                        >{p}</button>
                                    ))}
                                    <button 
                                        disabled={currentCustomerPage === totalPages}
                                        onClick={() => setCustomerPage(currentCustomerPage + 1)}
                                        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent"
                                    ><i className="fas fa-chevron-right text-[10px]"></i></button>
                                </div>
                            </div>
                        );
                    };

                    return (
                        <div className="flex flex-col">
                            {selectedCustomerIds.length > 0 && (
                                <div className="p-3 mb-4 bg-indigo-50 border border-indigo-100 rounded-xl flex justify-between items-center px-4 animate-fade-in shadow-xs">
                                    <div className="flex items-center gap-2">
                                        <i className="fas fa-check-square text-indigo-650 text-lg"></i>
                                        <span className="text-xs font-bold text-indigo-700">
                                            {selectedCustomerIds.length} customer(s) selected
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setBulkEmailSubject('');
                                                setBulkEmailMessage('');
                                                setSendingBulkEmail(true);
                                            }}
                                            className="bg-indigo-600 hover:bg-indigo-705 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                                        >
                                            <i className="fas fa-paper-plane"></i> Send Bulk Email
                                        </button>
                                        <button
                                            onClick={() => setSelectedCustomerIds([])}
                                            className="text-slate-500 hover:text-slate-800 text-xs font-bold px-2 py-1"
                                        >
                                            Deselect All
                                        </button>
                                    </div>
                                </div>
                            )}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[1200px]">
                                    <thead>
                                <tr className="bg-white text-xs uppercase text-slate-500 font-bold tracking-wider border-b border-slate-200">
                                    <th className="p-4 w-12 text-center">
                                        <input
                                            type="checkbox"
                                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                                            checked={paginatedCustomers.length > 0 && paginatedCustomers.every(c => selectedCustomerIds.includes(c.id))}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    const toAdd = paginatedCustomers.map(c => c.id);
                                                    setSelectedCustomerIds(prev => Array.from(new Set([...prev, ...toAdd])));
                                                } else {
                                                    const toRemove = paginatedCustomers.map(c => c.id);
                                                    setSelectedCustomerIds(prev => prev.filter(id => !toRemove.includes(id)));
                                                }
                                            }}
                                        />
                                    </th>
                                    <th className="p-4 w-56">Business</th>
                                    <th className="p-4 w-56">Customer</th>
                                    {activeTab === 'new_to_call' && <th className="p-4 w-32 border-l border-slate-100">Date Signed Up</th>}
                                    <th className="p-4 w-32 border-l border-slate-100">Plan</th>
                                    <th className="p-4 border-l border-slate-100 min-w-32">Assigned BRM & Partner</th>
                                    <th className="p-4 w-44 border-l border-slate-100">Health Score</th>
                                    <th className="p-4 w-64 border-l border-slate-100">Activities Log</th>
                                    <th className="p-4 w-56 border-l border-slate-100">Tags</th>
                                    <th className="p-4 text-center border-l border-slate-100 w-32">Status</th>
                                    <th className="p-4 text-center border-l border-slate-100">Required Action</th>
                                    <th className="p-4 text-right border-l border-slate-100">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {paginatedCustomers.map(customer => {
                                    const isAtRisk = customer.status === 'Lost' || customer.status === 'Not Active' || customer.healthScore < 40;
                                    return (
                                    <tr key={customer.id} className={`transition-colors group ${isAtRisk ? 'bg-rose-50/30 hover:bg-rose-50/50' : 'hover:bg-slate-50'}`}>
                                        <td className="p-4 align-top text-center w-12 border-r border-slate-100">
                                            <input
                                                type="checkbox"
                                                className="rounded border-slate-300 text-indigo-650 focus:ring-indigo-500 w-4 h-4 cursor-pointer mt-1"
                                                checked={selectedCustomerIds.includes(customer.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedCustomerIds(prev => [...prev, customer.id]);
                                                    } else {
                                                        setSelectedCustomerIds(prev => prev.filter(id => id !== customer.id));
                                                    }
                                                }}
                                            />
                                        </td>
                                        <td className="p-4 align-top">
                                            <div className="flex flex-col gap-1.5">
                                                <span onClick={() => setSelectedCustomerForView(customer)} className="font-bold text-slate-800 text-sm cursor-pointer hover:underline">{customer.businessName}</span>
                                                {customer.location && (
                                                    <span className="text-xs text-slate-500 flex items-center">
                                                        <i className="fas fa-map-marker-alt text-slate-400 mr-1.5"></i> {customer.location}
                                                    </span>
                                                )}
                                                {activeTab === 'retention' && (() => {
                                                    const daysUntil = customer.renewalDate ? (new Date(customer.renewalDate).getTime() - now.getTime()) / (1000 * 3600 * 24) : null;
                                                    const isExpired = (daysUntil !== null && daysUntil < 0) || 
                                                                      customer.status === 'Lost' || 
                                                                      !customer.billingHistory || 
                                                                      customer.billingHistory.length === 0;
                                                    
                                                    return isExpired ? (
                                                        <div className="mt-1.5 p-2.5 rounded-xl bg-rose-50 border border-rose-200 shadow-sm flex flex-col gap-1 text-xs">
                                                            <div className="flex items-center gap-1.5 text-rose-700 font-black uppercase text-[9px] tracking-wider">
                                                                <i className="fas fa-exclamation-triangle"></i> Expired Business
                                                            </div>
                                                            <div className="text-[11px] text-rose-600 font-bold mt-0.5">
                                                                Date expired: <span className="font-extrabold underline">{customer.renewalDate || 'No subscription recorded'}</span>
                                                            </div>
                                                            {daysUntil !== null && (
                                                                <div className="text-[10px] text-rose-500 font-semibold">
                                                                    ({Math.abs(Math.floor(daysUntil))} days ago)
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="mt-1.5 p-2.5 rounded-xl bg-amber-50 border border-amber-200 shadow-sm flex flex-col gap-1 text-xs">
                                                            <div className="flex items-center gap-1.5 text-amber-700 font-black uppercase text-[9px] tracking-wider">
                                                                <i className="fas fa-clock"></i> Upcoming Expiration
                                                            </div>
                                                            <div className="text-[11px] text-amber-700 font-bold mt-0.5">
                                                                Date will expire: <span className="font-extrabold underline">{customer.renewalDate}</span>
                                                            </div>
                                                            <div className="text-[10px] text-amber-600 font-semibold">
                                                                Expires in: <span className="font-black text-amber-700">{Math.max(0, Math.ceil(daysUntil ?? 0))} days</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })()}
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
                                        {activeTab === 'new_to_call' && <td className="p-4 align-top border-l border-slate-100">
                                            <span className="text-sm font-semibold text-slate-700">{customer.registrationDate}</span>
                                        </td>}
                                        <td className="p-4 align-top border-l border-slate-100">
                                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider border border-blue-100 inline-block">
                                                {customer.plan} Plan
                                            </span>
                                        </td>
                                        <td className="p-4 align-top border-l border-slate-100">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2 text-xs flex-wrap">
                                                    <span className="w-16 font-bold text-slate-400 uppercase text-[9px] tracking-wider">CX Rep:</span>
                                                    {isTeamLead ? (
                                                        <select
                                                            value={customer.accountManager}
                                                            onChange={(e) => handleReassignCustomer(customer.id, e.target.value)}
                                                            className="font-bold text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded border border-indigo-200 outline-none cursor-pointer text-xs"
                                                        >
                                                            {['Sarah O.', 'Mike T.', 'Felix M.', 'Grace T.', 'David K.', 'Unassigned'].map(csm => (
                                                                <option key={csm} value={csm}>{csm}</option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 shadow-sm whitespace-nowrap">{customer.accountManager}</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs">
                                                    <span className="w-16 font-bold text-slate-400 uppercase text-[9px] tracking-wider">BRM:</span>
                                                    <span className="font-semibold text-slate-700 whitespace-nowrap">{(!customer.agent || customer.agent === 'Unassigned') && (!customer.partner || customer.partner === 'Unassigned') ? 'Prokip' : customer.agent || 'Prokip'}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs">
                                                    <span className="w-16 font-bold text-slate-400 uppercase text-[9px] tracking-wider">Partner:</span>
                                                    <span className="font-semibold text-slate-700 whitespace-nowrap">{(!customer.agent || customer.agent === 'Unassigned') && (!customer.partner || customer.partner === 'Unassigned') ? 'Prokip' : customer.partner || 'None'}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs">
                                                    <span className="w-16 font-bold text-slate-400 uppercase text-[9px] tracking-wider">State Mgr:</span>
                                                    <span className="font-semibold text-slate-700 whitespace-nowrap">{customer.manager}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 align-top border-l border-slate-100 w-44">
                                            <div className="flex flex-col items-center justify-center gap-3 py-1">
                                                {/* Circular Progress Container */}
                                                <div className="relative w-14 h-14 flex items-center justify-center">
                                                    <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                                                        {/* Track */}
                                                        <circle
                                                            className={`${
                                                                customer.healthScore >= 80 ? 'stroke-emerald-100' :
                                                                customer.healthScore >= 40 ? 'stroke-amber-100' :
                                                                'stroke-rose-100'
                                                            }`}
                                                            cx="18"
                                                            cy="18"
                                                            r="15"
                                                            strokeWidth="3.5"
                                                            fill="none"
                                                        />
                                                        {/* Inner background fill */}
                                                        <circle
                                                            className={`${
                                                                customer.healthScore >= 80 ? 'fill-emerald-50/20' :
                                                                customer.healthScore >= 40 ? 'fill-amber-50/20' :
                                                                'fill-rose-50/20'
                                                            }`}
                                                            cx="18"
                                                            cy="18"
                                                            r="13.5"
                                                        />
                                                        {/* Progress */}
                                                        <circle
                                                            className={`transition-all duration-500 ${
                                                                customer.healthScore >= 80 ? 'stroke-emerald-500' :
                                                                customer.healthScore >= 40 ? 'stroke-amber-500' :
                                                                'stroke-rose-500'
                                                            }`}
                                                            cx="18"
                                                            cy="18"
                                                            r="15"
                                                            strokeWidth="3.5"
                                                            strokeDasharray="94.24"
                                                            strokeDashoffset={`${((100 - customer.healthScore) * 94.24) / 100}`}
                                                            strokeLinecap="round"
                                                            fill="none"
                                                        />
                                                    </svg>
    
                                                    {/* Percentage Text (Displaying plain score number) */}
                                                    <div className={`absolute inset-0 flex items-center justify-center font-black text-sm md:text-base ${
                                                        customer.healthScore >= 80 ? 'text-emerald-600' :
                                                        customer.healthScore >= 40 ? 'text-amber-500' :
                                                        'text-rose-500'
                                                    }`}>
                                                        {customer.healthScore}
                                                    </div>
    
                                                    {/* Floating Trend Indicator Overlap Pill */}
                                                    <div className="absolute bottom-[-2px] right-[-4px] bg-white rounded-full px-1.5 py-0.5 shadow-sm border border-slate-100 flex items-center justify-center min-w-[14px]">
                                                        {customer.healthTrend === 'improving' ? (
                                                            <i className="fas fa-arrow-up text-emerald-500 text-[9px] font-extrabold" />
                                                        ) : customer.healthTrend === 'falling' ? (
                                                            <i className="fas fa-arrow-down text-rose-500 text-[9px] font-extrabold" />
                                                        ) : (
                                                            <span className="text-slate-400 font-extrabold text-[9px]">-</span>
                                                        )}
                                                    </div>
                                                </div>
    
                                                {/* Status Label Pill (New, Active (Old), Inactive (Old), Expired) */}
                                                {(() => {
                                                    let label = 'Inactive (Old)';
                                                    let styleClass = 'bg-amber-50 text-amber-700 border-amber-200';
                                                    
                                                    if (customer.status === 'New') {
                                                        label = 'New';
                                                        styleClass = 'bg-blue-50 text-blue-700 border-blue-200';
                                                    } else if (customer.status === 'Active') {
                                                        label = 'Active (Old)';
                                                        styleClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                                                    } else if (customer.status === 'Not Active') {
                                                        label = 'Inactive (Old)';
                                                        styleClass = 'bg-amber-50 text-amber-700 border-amber-200';
                                                    } else if (customer.status === 'Lost' || !customer.billingHistory || customer.billingHistory.length === 0) {
                                                        label = 'Expired';
                                                        styleClass = 'bg-rose-50 text-rose-700 border-rose-200';
                                                    }
                                                    
                                                    return (
                                                        <span className={`inline-block text-[9px] font-extrabold px-2 py-0.5 rounded-full border tracking-wider uppercase transition-all duration-200 text-center ${styleClass}`} title={customer.status === 'Lost' || !customer.billingHistory || customer.billingHistory.length === 0 ? "No Active Subscription" : undefined}>
                                                            {label}
                                                        </span>
                                                    );
                                                })()}
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
                                                <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-lg shadow-sm animate-fade-in relative z-20 w-80 max-w-full">
                                                    <div className="flex gap-1">
                                                        <input 
                                                            type="text" 
                                                            autoFocus
                                                            className="border border-slate-300 text-xs rounded px-2 py-1 w-full outline-none focus:border-[#02275A] shadow-sm bg-white text-slate-800"
                                                            placeholder="Search or type tag..."
                                                            value={newTagInput}
                                                            onChange={(e) => setNewTagInput(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') handleAddTag(customer.id);
                                                                if (e.key === 'Escape') setTagEditorVisible(null);
                                                            }}
                                                        />
                                                        <button onClick={() => handleAddTag(customer.id)} className="bg-[#02275A] text-white px-2.5 py-1 rounded text-xs hover:bg-[#03367A] shadow-sm shrink-0 cursor-pointer"><i className="fas fa-check"></i></button>
                                                    </div>
                                                    <div className="mt-2.5 pt-2 border-t border-slate-200">
                                                        <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 shadow-none">
                                                            {newTagInput ? 'Search Results' : 'Select Existing Tag'}
                                                        </span>
                                                        <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto w-full custom-scrollbar">
                                                            {definedTags
                                                                .filter(t => !customer.tags.includes(t) && t.toLowerCase().includes(newTagInput.toLowerCase()))
                                                                .map(tag => (
                                                                    <button
                                                                        key={tag}
                                                                        onClick={() => handleAddTag(customer.id, tag)}
                                                                        className="w-full text-left bg-white hover:bg-[#02275A]/10 text-slate-600 hover:text-[#02275A] border border-slate-200 hover:border-[#02275A]/30 px-2 py-1.5 rounded text-[10px] font-bold transition-all cursor-pointer flex items-center justify-between shadow-xs"
                                                                    >
                                                                        <span>{tag}</span>
                                                                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Select</span>
                                                                    </button>
                                                                ))}
                                                            {newTagInput.trim() && !definedTags.map(t => t.toLowerCase()).includes(newTagInput.toLowerCase().trim()) && (
                                                                <button
                                                                    onClick={() => handleAddTag(customer.id, newTagInput.trim())}
                                                                    className="w-full text-left bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded px-2 py-1.5 text-[10.5px] font-bold transition-all cursor-pointer flex items-center gap-1.5"
                                                                >
                                                                    <i className="fas fa-plus text-[9px]"></i>
                                                                    <span>New: "{newTagInput.trim()}"</span>
                                                                </button>
                                                            )}
                                                            {definedTags.filter(t => !customer.tags.includes(t) && t.toLowerCase().includes(newTagInput.toLowerCase())).length === 0 && 
                                                             (!newTagInput.trim() || definedTags.map(t => t.toLowerCase()).includes(newTagInput.toLowerCase().trim())) && (
                                                                <span className="text-[10px] text-slate-400 italic py-1 px-1">No matches found.</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="mt-2 pt-1.5 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400 font-bold">
                                                        <span>Library: {definedTags.length} tags</span>
                                                        <button 
                                                            onClick={() => setIsGlobalTagsModalOpen(true)}
                                                            className="text-indigo-600 hover:underline hover:text-indigo-800 cursor-pointer font-black"
                                                        >
                                                            Manage Library
                                                        </button>
                                                    </div>
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
                                                const hasRecentActivity = customer.logs && customer.logs.some(log => {
                                                    if (!log.date) return false;
                                                    const logTime = new Date(log.date).getTime();
                                                    const diffDays = (now.getTime() - logTime) / (1000 * 3600 * 24);
                                                    return diffDays >= 0 && diffDays <= 30;
                                                });
    
                                                if (!hasRecentActivity) {
                                                    actionItem = { text: 'No Activity', icon: 'fa-history', color: 'text-rose-600 bg-rose-50 border-rose-200 shadow-sm' };
                                                } else if (customer.status === 'Lost' || customer.status === 'Not Active' || daysSinceTx > 90) {
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
                                                        {hasRecentActivity && customer.nextFollowUp && (() => {
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
                                                        {hasRecentActivity && customer.nextAction && (
                                                            <div className="text-[10px] text-indigo-900 font-bold bg-indigo-50 border border-indigo-150 p-2 rounded-lg max-w-[200px] text-center shadow-xs mt-1.5 leading-normal">
                                                                <span className="block font-black text-[8px] text-indigo-400 uppercase tracking-widest mb-0.5">NEXT UPDATE REMINDER:</span>
                                                                "{customer.nextAction}"
                                                            </div>
                                                        )}
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
                                                        onClick={() => {
                                                            setSendingEmailTo(customer);
                                                            setSingleEmailSubject('');
                                                            setSingleEmailMessage('');
                                                        }}
                                                        className="w-full text-left px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-b border-slate-50 transition-colors"
                                                     >
                                                         <div className="w-5 flex justify-center text-indigo-600"><i className="fas fa-paper-plane"></i></div>
                                                         Send Email
                                                     </button>
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
                                {paginatedCustomers.length === 0 && (
                                    <tr>
                                        <td colSpan={12} className="p-12 text-center">
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
                    {renderGeneralPagination()}
                    </div>
                )})()}
            </div>

            {/* Modal: Send Direct Single Email from Customer List */}
            {sendingEmailTo && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <i className="fas fa-paper-plane text-indigo-650"></i>
                                Send Email to <span className="text-[#02275A]">{sendingEmailTo.businessName}</span>
                            </h3>
                            <button onClick={() => setSendingEmailTo(null)} className="text-slate-400 hover:text-slate-600">
                                <i className="fas fa-times text-lg"></i>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Recipient Business</label>
                                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600">
                                    {sendingEmailTo.businessName} ({sendingEmailTo.customerName || "No contact name"}) &lt;{sendingEmailTo.email}&gt;
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Subject</label>
                                <input 
                                    type="text"
                                    className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none focus:border-[#02275A] shadow-sm font-semibold text-slate-800 bg-white"
                                    placeholder="Enter email subject line..."
                                    value={singleEmailSubject}
                                    onChange={(e) => setSingleEmailSubject(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Body</label>
                                <textarea 
                                    className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none focus:border-[#02275A] shadow-sm resize-none text-slate-700 bg-white" 
                                    rows={6}
                                    placeholder="Type your message to the customer success contact..."
                                    value={singleEmailMessage}
                                    onChange={(e) => setSingleEmailMessage(e.target.value)}
                                ></textarea>
                            </div>
                        </div>
                        <div className="p-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                            <button onClick={() => setSendingEmailTo(null)} className="px-5 py-2 text-sm font-bold text-slate-600 hover:text-slate-800">Cancel</button>
                            <button onClick={handleSendSingleEmailDirect} className="bg-indigo-650 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center gap-1.5">
                                <i className="fas fa-paper-plane text-xs"></i> Send Email
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Send Bulk Email from Customer List */}
            {sendingBulkEmail && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <i className="fas fa-envelope-open-text text-indigo-655"></i>
                                Send Bulk Email
                            </h3>
                            <button onClick={() => setSendingBulkEmail(false)} className="text-slate-400 hover:text-slate-600">
                                <i className="fas fa-times text-lg"></i>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                                    Recipients ({selectedCustomerIds.length})
                                </label>
                                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg max-h-24 overflow-y-auto w-full custom-scrollbar flex flex-wrap gap-1.5">
                                    {customers.filter(c => selectedCustomerIds.includes(c.id)).map(c => (
                                        <span key={c.id} className="inline-flex items-center gap-1 bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded text-[11px] font-bold shadow-xs">
                                            {c.businessName}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Subject</label>
                                <input 
                                    type="text"
                                    className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none focus:border-[#02275A] shadow-sm font-semibold text-slate-800 bg-white"
                                    placeholder="Enter email subject line..."
                                    value={bulkEmailSubject}
                                    onChange={(e) => setBulkEmailSubject(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Body</label>
                                <textarea 
                                    className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none focus:border-[#02275A] shadow-sm resize-none text-slate-700 bg-white" 
                                    rows={6}
                                    placeholder="Type your message... Individual logs will be created for each recipient."
                                    value={bulkEmailMessage}
                                    onChange={(e) => setBulkEmailMessage(e.target.value)}
                                ></textarea>
                            </div>
                        </div>
                        <div className="p-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                            <button onClick={() => setSendingBulkEmail(false)} className="px-5 py-2 text-sm font-bold text-slate-600 hover:text-slate-800">Cancel</button>
                            <button onClick={handleSendBulkEmail} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center gap-1.5">
                                <i className="fas fa-paper-plane text-xs"></i> Send Bulk Email
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-2">Next Expected Action / Update Reminder (Optional)</label>
                                <textarea 
                                    className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none focus:border-[#02275A] shadow-sm resize-none" 
                                    rows={2}
                                    placeholder="e.g., Ask about team feedback or check on multi-store upgrades..."
                                    value={actNextAction}
                                    onChange={(e) => setActNextAction(e.target.value)}
                                ></textarea>
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
                            {/* Health Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Health Score */}
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Health Score</span>
                                    <div className="flex items-end justify-between">
                                        <span className={`text-3xl font-extrabold ${
                                            selectedCustomerForView.healthScore >= 80 ? 'text-emerald-500' :
                                            selectedCustomerForView.healthScore >= 50 ? 'text-amber-500' : 'text-rose-500'
                                        }`}>
                                            {selectedCustomerForView.healthScore}
                                        </span>
                                        <i className={`fas fa-heartbeat text-2xl ${
                                            selectedCustomerForView.healthScore >= 80 ? 'text-emerald-100' :
                                            selectedCustomerForView.healthScore >= 50 ? 'text-amber-100' : 'text-rose-100'
                                        }`}></i>
                                    </div>
                                </div>
                                
                                {/* Usage Level */}
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                                    {(() => {
                                        const regDate = selectedCustomerForView.registrationDate ? new Date(selectedCustomerForView.registrationDate) : now;
                                        const daysUsingApp = Math.max(0, Math.floor((now.getTime() - regDate.getTime()) / (1000 * 3600 * 24)));
                                        const usageCycleDays = daysUsingApp % 10;
                                        const calculatedUsageLevel = Math.min(100, Math.round((usageCycleDays / 10) * 100));
                                        const lastResetDate = new Date(now.getTime() - (usageCycleDays * 1000 * 3600 * 24));
                                        
                                        return (
                                            <>
                                                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                                    Usage Level <span className="normal-case font-medium text-slate-400 ml-1 tracking-normal text-[10px] block">(Days tracked: {usageCycleDays} / Last reset: {lastResetDate.toLocaleDateString()})</span>
                                                </span>
                                                <div className="flex flex-col mt-auto w-full">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="font-extrabold text-[#02275A] text-2xl">{calculatedUsageLevel}%</span>
                                                        <i className="fas fa-chart-line text-2xl text-blue-100"></i>
                                                    </div>
                                                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                                                        <div className="bg-[#02275A] h-full transition-all duration-500" style={{width: `${calculatedUsageLevel}%`}}></div>
                                                    </div>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>

                                {/* Customer Happiness */}
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between group relative">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Customer Happiness</span>
                                        <button 
                                            onClick={() => {
                                                setBrmRatingInput(3);
                                                setBrmFeedbackInput('');
                                                setIsBrmRatingModalOpen(true);
                                            }}
                                            className="text-[10px] bg-slate-100 hover:bg-[#02275A] text-slate-500 hover:text-white px-2 py-1 rounded transition-colors font-bold flex items-center gap-1 cursor-pointer"
                                            title="Rate BRM Impact"
                                        >
                                            <i className="fas fa-star"></i> Rate BRM
                                        </button>
                                    </div>
                                    <div className="flex items-end justify-between">
                                        <span className={`text-3xl font-extrabold ${
                                            selectedCustomerForView.customerHappiness > 50 ? 'text-emerald-500' :
                                            selectedCustomerForView.customerHappiness >= 0 ? 'text-blue-500' : 'text-rose-500'
                                        }`}>
                                            {selectedCustomerForView.customerHappiness}%
                                        </span>
                                        <i className={`fas ${
                                            selectedCustomerForView.customerHappiness > 50 ? 'fa-smile text-emerald-100' :
                                            selectedCustomerForView.customerHappiness >= 0 ? 'fa-meh text-blue-100' : 'fa-frown text-rose-100'
                                        } text-2xl`}></i>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Business Profile Details */}
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="text-sm font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Business Profile</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-2">
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
                                <h3 className="text-sm font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Assigned BRM & Tags</h3>
                                <div className="grid grid-cols-2 gap-y-4">
                                    <div className="text-sm">
                                        <span className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Customer Success</span>
                                        {isTeamLead ? (
                                            <select 
                                                value={selectedCustomerForView.accountManager}
                                                onChange={(e) => handleReassignCustomer(selectedCustomerForView.id, e.target.value)}
                                                className="font-bold text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded border border-indigo-200 outline-none cursor-pointer"
                                            >
                                                {['Sarah O.', 'Mike T.', 'Felix M.', 'Grace T.', 'David K.', 'Unassigned'].map(csm => (
                                                    <option key={csm} value={csm}>{csm}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{selectedCustomerForView.accountManager}</span>
                                        )}
                                    </div>
                                    <div className="text-sm col-span-2 md:col-span-1">
                                        <span className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Assigned BRM & Partner</span>
                                        {(() => {
                                            // Mock BRM Directory
                                            const brmDirectory: Record<string, {name: string, email: string, state: string, address: string, phone: string, whatsapp: string}> = {
                                                'Sarah O.': {name: 'Sarah Olayinka', email: 'sarah.o@prokip.com', state: 'Lagos', address: '12 Bankole Street, Ikeja', phone: '+2348000000111', whatsapp: '2348000000111'},
                                                'Mike T.': {name: 'Mike Thompson', email: 'mike.t@prokip.com', state: 'Kano', address: '42 Sabon Gari, Kano', phone: '+2348000000222', whatsapp: '2348000000222'},
                                                'Felix M.': {name: 'Felix Mba', email: 'felix.m@prokip.com', state: 'Abuja', address: 'Plot 305 Wuse II, Abuja', phone: '+2348000000333', whatsapp: '2348000000333'},
                                                'Grace T.': {name: 'Grace Taylor', email: 'grace.t@prokip.com', state: 'Rivers', address: '55 Trans Amadi, PH', phone: '+2348000000444', whatsapp: '2348000000444'},
                                                'David K.': {name: 'David Kareem', email: 'david.k@prokip.com', state: 'Oyo', address: 'Ring Road, Ibadan', phone: '+2348000000555', whatsapp: '2348000000555'}
                                            };
                                            const resolvedAgent = (!selectedCustomerForView.agent || selectedCustomerForView.agent === 'Unassigned') && (!selectedCustomerForView.partner || selectedCustomerForView.partner === 'Unassigned') ? 'Prokip' : selectedCustomerForView.agent || 'Prokip';
                                            const resolvedPartner = (!selectedCustomerForView.agent || selectedCustomerForView.agent === 'Unassigned') && (!selectedCustomerForView.partner || selectedCustomerForView.partner === 'Unassigned') ? 'Prokip' : selectedCustomerForView.partner || 'None';
                                            const brmInfo = brmDirectory[resolvedAgent];
                                            
                                            return (
                                                <div className="flex flex-col gap-3">
                                                    <div>
                                                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1 tracking-wider">BRM</span>
                                                        {!brmInfo ? (
                                                            <span className="font-bold text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-xs">{resolvedAgent}</span>
                                                        ) : (
                                                            <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
                                                                <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-200">
                                                                    <span className="font-bold text-slate-800">{brmInfo.name}</span>
                                                                    <a href={`https://wa.me/${brmInfo.whatsapp}`} target="_blank" rel="noreferrer" className="text-emerald-500 hover:text-emerald-600 transition-colors bg-emerald-50 w-6 h-6 rounded flex items-center justify-center">
                                                                        <i className="fab fa-whatsapp"></i>
                                                                    </a>
                                                                </div>
                                                                <div className="space-y-1.5 text-xs">
                                                                    <div className="flex items-center gap-2 text-slate-600"><i className="fas fa-envelope w-3 text-slate-400"></i> {brmInfo.email}</div>
                                                                    <div className="flex items-center gap-2 text-slate-600"><i className="fas fa-phone-alt w-3 text-slate-400"></i> {brmInfo.phone}</div>
                                                                    <div className="flex items-center gap-2 text-slate-600"><i className="fas fa-map-marker-alt w-3 text-slate-400"></i> {brmInfo.state} - {brmInfo.address}</div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1 tracking-wider">Partner</span>
                                                        <span className="font-bold text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-xs">{resolvedPartner}</span>
                                                    </div>
                                                </div>
                                            );
                                        })()}
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

                            {/* Direct Communication Thread - Email Design */}
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                                <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
                                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1">
                                        <i className="fas fa-envelope text-[#02275A]"></i> Direct Communication
                                    </h3>
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            const subOptions = ["activation demo scheduling", "billing inquiry follow-up", "support ticket query"];
                                            const selectedSub = subOptions[Math.floor(Math.random() * subOptions.length)];
                                            simulateCustomerReply(selectedCustomerForView, selectedSub);
                                        }}
                                        className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 px-2 py-0.5 rounded cursor-pointer transition-all"
                                    >
                                        <i className="fas fa-magic"></i> Simulate Reply
                                    </button>
                                </div>
                                <div className="space-y-4 max-h-60 overflow-y-auto mb-4 pr-2">
                                    {selectedCustomerForView.logs.filter(log => log.type === 'Email').map((msg) => {
                                        const isCustomerReply = msg.loggedBy.includes('(Customer');
                                        return (
                                            <div key={msg.id} className={`flex flex-col ${isCustomerReply ? 'items-start' : 'items-end'}`}>
                                                <div className="flex justify-between items-center mb-1 w-full max-w-[85%]">
                                                    <span className={`font-bold text-[10px] ${isCustomerReply ? 'text-amber-800' : 'text-[#02275A]'}`}>
                                                        {isCustomerReply ? (
                                                            <span><i className="fas fa-comment shadow-xs mr-0.5"></i> {msg.loggedBy}</span>
                                                        ) : (
                                                            <span><i className="fas fa-check-circle mr-0.5"></i> Grace T. (Prokip CS)</span>
                                                        )}
                                                    </span>
                                                    <span className="text-[9px] text-slate-400">{formatRelativeTime(msg.date)}</span>
                                                </div>
                                                <div className={`p-3 rounded-lg text-xs max-w-[85%] shadow-xs ${
                                                    isCustomerReply 
                                                        ? 'bg-slate-100 border border-slate-200 text-slate-800 rounded-tl-none' 
                                                        : 'bg-indigo-50 border border-indigo-150 text-slate-700 rounded-tr-none'
                                                }`}>
                                                    <p className="whitespace-pre-wrap">{msg.summary}</p>
                                                    {isCustomerReply && (
                                                        <div className="mt-1 flex justify-end">
                                                            <button 
                                                                type="button"
                                                                onClick={() => {
                                                                    const lines = msg.summary.split('\n');
                                                                    let subj = "Support Update";
                                                                    for(const line of lines) {
                                                                        if (line.toLowerCase().startsWith('subject:')) {
                                                                            subj = line.slice(8).trim();
                                                                        }
                                                                    }
                                                                    setEmailSubjectInput(`Re: ${subj.replace(/^Re:\s*/i, '')}`);
                                                                    const textarea = document.getElementById('drawer-composer-textarea');
                                                                    if (textarea) textarea.focus();
                                                                }}
                                                                className="text-[9px] text-indigo-700 font-extrabold hover:underline"
                                                            >
                                                                <i className="fas fa-reply mr-0.5"></i> Reply
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {selectedCustomerForView.logs.filter(log => log.type === 'Email').length === 0 && (
                                        <div className="text-center py-6 text-xs text-slate-400 italic">No email communications history found.</div>
                                    )}
                                </div>
                                
                                <div className="flex flex-col border border-slate-200 rounded-xl overflow-hidden focus-within:border-[#02275A] focus-within:ring-1 focus-within:ring-[#02275A] transition-all bg-slate-50">
                                    <div className="px-4 py-2 border-b border-slate-100 bg-white flex items-center gap-2">
                                        <span className="text-xs font-bold text-slate-500 w-12">To:</span>
                                        <span className="text-sm font-medium text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">{selectedCustomerForView.email || 'customer@example.com'}</span>
                                    </div>
                                    <div className="px-4 py-2 border-b border-slate-100 bg-white flex items-center gap-2">
                                        <span className="text-xs font-bold text-slate-500 w-12">Subject:</span>
                                        <input 
                                            type="text"
                                            className="flex-1 text-sm outline-none bg-transparent font-medium"
                                            placeholder="Enter email subject..."
                                            value={emailSubjectInput}
                                            onChange={(e) => setEmailSubjectInput(e.target.value)}
                                        />
                                    </div>
                                    <textarea 
                                        id="drawer-composer-textarea"
                                        className="w-full p-4 text-sm outline-none bg-white resize-none h-32" 
                                        placeholder="Type your email message here..."
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                    ></textarea>
                                    <div className="bg-slate-50 p-3 border-t border-slate-100 flex justify-between items-center">
                                        <div className="text-xs text-slate-400 flex items-center gap-2">
                                            <i className="fas fa-paperclip hover:text-slate-600 cursor-pointer"></i>
                                            <i className="fas fa-image hover:text-slate-600 cursor-pointer"></i>
                                            <i className="fas fa-link hover:text-slate-600 cursor-pointer"></i>
                                        </div>
                                        <button 
                                            onClick={handleSendMessage}
                                            className="px-5 py-2 bg-[#02275A] text-white rounded-lg font-bold text-sm hover:bg-[#03367A] transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
                                        >
                                            <i className="fas fa-paper-plane"></i> Send Email
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Drawer Footer Tasks/Alerts */}
                        {(selectedCustomerForView.nextFollowUp || selectedCustomerForView.nextAction) && (
                            <div className="p-4 bg-indigo-50/50 border-t border-indigo-100 flex flex-col gap-2.5 col-span-full">
                                <div className="flex justify-between items-center w-full">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 shrink-0">
                                            <i className="far fa-calendar-alt"></i>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-indigo-900 text-sm">Follow-up Task</h4>
                                            {selectedCustomerForView.nextFollowUp && (
                                                <p className="text-xs text-indigo-700 font-medium">Follow-up due {formatRelativeTime(selectedCustomerForView.nextFollowUp)} ({selectedCustomerForView.nextFollowUp})</p>
                                            )}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            setCustomers(customers.map(c => c.id === selectedCustomerForView.id ? { ...c, nextFollowUp: null, nextAction: null } : c));
                                            setSelectedCustomerForView({ ...selectedCustomerForView, nextFollowUp: null, nextAction: null });
                                            showSuccess("Follow-up marked as completed!");
                                        }}
                                        className="bg-white border border-indigo-200 text-indigo-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-indigo-100 shadow-sm transition-colors cursor-pointer shrink-0"
                                    >
                                        Done
                                    </button>
                                </div>
                                {selectedCustomerForView.nextAction && (
                                    <div className="bg-white border border-indigo-100 p-3 rounded-lg shadow-2xs text-xs font-bold text-slate-700 leading-normal w-full">
                                        <span className="block font-black text-[9px] text-indigo-400 uppercase tracking-widest mb-1">Expected Teammate Action</span>
                                        "{selectedCustomerForView.nextAction}"
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
            </>
            )}

            {activeDashboardTab === 'emails' && (() => {
                // Filter the list of customers based on search text and selected filter criteria (all, unread, plans)
                const filteredAndSearchedCustomers = customers.filter(c => {
                    const term = searchInboxQuery.toLowerCase();
                    const matchesSearch = (
                        c.businessName.toLowerCase().includes(term) ||
                        (c.customerName && c.customerName.toLowerCase().includes(term)) ||
                        c.email.toLowerCase().includes(term)
                    );

                    if (inboxFilter === 'all') {
                        return matchesSearch;
                    } else if (inboxFilter === 'unread') {
                        const emailLogs = c.logs.filter(l => l.type === 'Email');
                        const lastMsg = emailLogs[0];
                        const isUnread = lastMsg && lastMsg.loggedBy.includes('(Customer');
                        return matchesSearch && isUnread;
                    } else {
                        // Filter by Plan: Premium, Standard, Basic
                        return matchesSearch && c.plan === inboxFilter;
                    }
                });

                // Helper to check if a customer id is already selected for bulk
                const isSelectedForBulk = (id: string) => selectedCustomerIds.includes(id);

                const handleSelectAllFiltered = () => {
                    setSelectedCustomerIds(filteredAndSearchedCustomers.map(c => c.id));
                    showSuccess(`Selected all ${filteredAndSearchedCustomers.length} matching clients for broadcast.`);
                };

                const handleDeselectAll = () => {
                    setSelectedCustomerIds([]);
                };

                return (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in pb-12" id="customer-success-inbox-section">
                        {/* Left Panel: Customer Threads List */}
                        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden flex flex-col h-[750px] transition-all duration-300">
                            {/* Inbox Header */}
                            <div className="p-5 bg-slate-50/80 border-b border-slate-100/80 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <h3 className="text-xs font-black text-[#02275A] flex items-center gap-2 uppercase tracking-widest">
                                            <span className="w-2.5 h-2.5 rounded-full bg-[#02275A] inline-block animate-pulse"></span>
                                            Inbox Hub
                                        </h3>
                                        <p className="text-[10px] text-slate-400 font-medium">Manage client communications</p>
                                    </div>
                                    <span className="text-[10px] font-black px-2.5 py-1 bg-[#02275A]/5 text-[#02275A] rounded-full font-mono">
                                        {filteredAndSearchedCustomers.length} Threads
                                    </span>
                                </div>

                                {/* Search bar */}
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <i className="fas fa-search text-slate-400 text-xs"></i>
                                    </span>
                                    <input
                                        type="text"
                                        value={searchInboxQuery}
                                        onChange={(e) => setSearchInboxQuery(e.target.value)}
                                        placeholder="Search by client name, email..."
                                        className="w-full bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-xs text-slate-800 rounded-md pl-10 pr-4 py-2.5 outline-none border border-slate-200 focus:border-[#02275A] focus:ring-1 focus:ring-[#02275A]/20 transition-all duration-200"
                                    />
                                    {searchInboxQuery && (
                                        <button 
                                            onClick={() => setSearchInboxQuery('')}
                                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 text-xs"
                                        >
                                            <i className="fas fa-times-circle"></i>
                                        </button>
                                    )}
                                </div>

                                {/* Filtering Tabs */}
                                <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full custom-scrollbar">
                                    {[
                                        { key: 'all', label: 'All' },
                                        { key: 'unread', label: 'Unread' },
                                        { key: 'Premium', label: 'Premium' },
                                        { key: 'Standard', label: 'Standard' },
                                        { key: 'Basic', label: 'Basic' },
                                    ].map((pill) => {
                                        const isActive = inboxFilter === pill.key;
                                        return (
                                            <button
                                                key={pill.key}
                                                type="button"
                                                onClick={() => setInboxFilter(pill.key as any)}
                                                className={`px-3 py-1.5 rounded-md text-[11px] font-bold tracking-tight whitespace-nowrap border cursor-pointer transition-all duration-200 ${
                                                    isActive
                                                        ? 'bg-[#02275A] text-white border-[#02275A] font-black'
                                                        : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200/80'
                                                }`}
                                            >
                                                {pill.label}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Bulk Control Actions Row */}
                                <div className="flex bg-slate-100/50 p-2 rounded-lg border border-slate-200/40 items-center justify-between text-[11px] font-semibold text-slate-600">
                                    <div className="flex items-center gap-1">
                                        <i className="fas fa-mail-bulk text-slate-400 text-xs"></i>
                                        <span>Bulk select:</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {selectedCustomerIds.length > 0 ? (
                                            <>
                                                <span className="bg-indigo-100 text-[#02275A] px-2 py-0.5 rounded text-[10px] font-extrabold animate-pulse">
                                                    {selectedCustomerIds.length} checked
                                                </span>
                                                <button 
                                                    type="button"
                                                    onClick={handleDeselectAll} 
                                                    className="text-xs text-red-650 hover:underline cursor-pointer font-bold"
                                                >
                                                    Clear ({selectedCustomerIds.length})
                                                </button>
                                            </>
                                        ) : (
                                            <button 
                                                type="button"
                                                onClick={handleSelectAllFiltered} 
                                                className="text-[#02275A] hover:underline cursor-pointer font-bold text-[10px]"
                                            >
                                                Select All matching ({filteredAndSearchedCustomers.length})
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* List of customer threads */}
                            <div className="flex-1 overflow-y-auto divide-y divide-slate-100/70 custom-scrollbar bg-slate-50/20">
                                {filteredAndSearchedCustomers.length === 0 ? (
                                    <div className="p-8 text-center text-slate-400 text-xs font-semibold flex flex-col items-center justify-center h-48 gap-2 bg-white">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
                                            <i className="fas fa-envelope-open text-base"></i>
                                        </div>
                                        No client conversations found.
                                    </div>
                                ) : (
                                    filteredAndSearchedCustomers.map(c => {
                                        const emailLogs = c.logs.filter(l => l.type === 'Email');
                                        const lastMsg = emailLogs[0]; 
                                        const unread = lastMsg && lastMsg.loggedBy.includes('(Customer');
                                        const isChecked = isSelectedForBulk(c.id);
                                        const isCurrentIndividual = selectedInboxCustomerId === c.id;

                                        return (
                                            <div
                                                key={c.id}
                                                onClick={() => {
                                                    // Selecting the list row switches the current chat in-place AND deselects bulk checklist for clear reading context!
                                                    setSelectedInboxCustomerId(c.id);
                                                    setSelectedCustomerIds([]); 
                                                    if (lastMsg) {
                                                        const lines = lastMsg.summary.split('\n');
                                                        let lastSub = "Support Query";
                                                        for (const line of lines) {
                                                            if (line.toLowerCase().startsWith('subject:')) {
                                                                 lastSub = line.slice(8).trim();
                                                            }
                                                        }
                                                        setInboxSubjectInput(`Re: ${lastSub.replace(/^Re:\s*/i, '')}`);
                                                    } else {
                                                        setInboxSubjectInput(`Follow-up Check-in`);
                                                    }
                                                }}
                                                className={`p-4 transition-all duration-200 cursor-pointer flex gap-3.5 relative border-b border-slate-100 bg-white ${
                                                    isCurrentIndividual && selectedCustomerIds.length === 0
                                                        ? 'bg-[#02275A]/5 border-l-4 border-[#02275A]' 
                                                        : unread 
                                                            ? 'bg-rose-50/10 hover:bg-slate-50 border-l-4 border-rose-500' 
                                                            : isChecked
                                                                ? 'bg-indigo-50/40 hover:bg-indigo-50/60 border-l-4 border-indigo-400'
                                                                : 'hover:bg-slate-50 border-l-4 border-transparent'
                                                }`}
                                            >
                                                {/* Checkbox Wrapper */}
                                                <div 
                                                    className="flex items-center justify-center pt-0.5"
                                                    onClick={(e) => e.stopPropagation()} 
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSelectedCustomerIds(prev => [...prev, c.id]);
                                                            } else {
                                                                setSelectedCustomerIds(prev => prev.filter(id => id !== c.id));
                                                            }
                                                        }}
                                                        className="w-4 h-4 rounded-md text-[#02275A] border-slate-300 focus:ring-[#02275A] cursor-pointer"
                                                    />
                                                </div>

                                                <div className="flex-1 min-w-0 space-y-1.5">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] font-black text-slate-400 font-mono tracking-wider">
                                                            {c.id}
                                                        </span>
                                                        {lastMsg && (
                                                            <span className="text-[10px] font-bold text-slate-400 font-mono">
                                                                {formatRelativeTime(lastMsg.date)}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <h4 className={`text-xs truncate font-extrabold ${unread ? 'text-[#02275A]' : 'text-slate-800'}`}>
                                                            {c.businessName}
                                                        </h4>
                                                        {unread && (
                                                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 animate-ping" title="Unread ticket update"></span>
                                                        )}
                                                    </div>

                                                    <p className={`text-[11px] truncate font-medium text-slate-500 ${isCurrentIndividual ? 'text-slate-900 font-bold' : ''}`}>
                                                        {lastMsg ? lastMsg.summary.replace(/Sent Email\nSubject:.*?\n\n/gs, '') : 'No conversations logged'}
                                                    </p>

                                                    <div className="flex items-center justify-between pt-1">
                                                        <span className="text-[9px] font-bold uppercase text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                                            {c.customerName || 'No contact'}
                                                        </span>
                                                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                                            c.plan === 'Premium' ? 'bg-amber-50 text-amber-600 border border-amber-100 font-extrabold' :
                                                            c.plan === 'Standard' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                                            'bg-slate-50 text-slate-500 border border-slate-100'
                                                        }`}>
                                                            {c.plan}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>                          {/* Right Panel: Dynamic Thread Preview / Response Composer */}
                        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden flex flex-col h-[750px] relative transition-all duration-300">
                            {/* IF BULK MODE IS ACTIVE (1 OR MORE CLIENTS CHECKED) */}
                            {selectedCustomerIds.length > 0 ? (
                                <div className="flex flex-col h-full animate-fade-in bg-slate-50/20">
                                    {/* Header */}
                                    <div className="p-5 bg-[#02275A]/5 border-b border-[#02275A]/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="w-2.5 h-2.5 rounded-full bg-[#02275A] animate-pulse inline-block"></span>
                                                <h3 className="font-extrabold text-slate-800 text-sm">Bulk Messages Broadcast</h3>
                                            </div>
                                            <p className="text-xs text-slate-500 font-semibold">
                                                Currently addressing <strong className="text-[#02275A] font-black">{selectedCustomerIds.length}</strong> checked clients.
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleDeselectAll}
                                            className="px-3 py-1.5 text-[11px] font-bold text-red-650 border border-red-200 bg-red-50/50 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                        >
                                            Cancel Bulk Broadcast
                                        </button>
                                    </div>

                                    {/* Scrollable Recipients List */}
                                    <div className="p-4 bg-slate-50/40 space-y-3">
                                        <span className="block text-[10px] uppercase font-black tracking-widest text-slate-400">Selected Recipients List</span>
                                        <div className="max-h-24 overflow-y-auto border border-slate-200/60 rounded-xl p-3 bg-white flex flex-wrap gap-1.5 custom-scrollbar">
                                            {customers.filter(c => selectedCustomerIds.includes(c.id)).map(c => (
                                                <span 
                                                    key={c.id} 
                                                    className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-2xs hover:bg-rose-50 hover:text-rose-700 hover:border-rose-100 transition-all cursor-pointer"
                                                    title="Click to remove from bulk checklist"
                                                    onClick={() => {
                                                        setSelectedCustomerIds(prev => prev.filter(id => id !== c.id));
                                                    }}
                                                >
                                                    {c.businessName}
                                                    <i className="fas fa-times text-[9px] opacity-60"></i>
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Composer area */}
                                    <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/20">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 pb-2 border-b border-slate-100">
                                            <span className="text-xs font-bold text-[#02275A] flex items-center gap-1.5">
                                                <i className="fas fa-bullhorn text-[#02275A]"></i> Broadcast Composer
                                            </span>
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="text-[10px] font-bold text-slate-400">Load Template:</span>
                                                {[
                                                    { 
                                                        title: 'v3 Release Upgrade', 
                                                        sub: 'Offline multi-location business tracking is live on Prokip v3', 
                                                        msg: 'Hi,\n\nWe are excited to announce a brand new upgrade to your Prokip account! You can now log and track offline transactions and sync live data across all retail locations seamlessly.\n\nLet us know if you would like a brief guided demo from your account representative!\n\nBest regards,\nThe Prokip Customer Success Team' 
                                                    },
                                                    { 
                                                        title: 'Platform Maintenance', 
                                                        sub: 'Notice: Scheduled Prokip infrastructure performance update', 
                                                        msg: 'Hi,\n\nTo continue providing high performance, we have scheduled a routine infrastructure database maintenance window this Saturday between 2:00 AM and 3:00 AM WAT.\n\nYour account operations will be fully accessible before and after this window. Thank you for your continued partnership!\n\nBest regards,\nThe Prokip DevOps Team' 
                                                    },
                                                    { 
                                                        title: 'CSAT Improvement survey', 
                                                        sub: 'Quick 2-minute check-in: help improve your Prokip application experience', 
                                                        msg: 'Hi,\n\nWe would love to learn more about your experience using Prokip. Could you spare 2 minutes to share your thoughts and suggest any new features you would like to see?\n\nYour feedback directly helps us build a better platform for your active stores.\n\nWarm regards,\nThe Prokip Customer Support Team' 
                                                    }
                                                ].map((bulkPreset, idx) => (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        onClick={() => {
                                                            setBulkEmailSubject(bulkPreset.sub);
                                                            setBulkEmailMessage(bulkPreset.msg);
                                                            showSuccess(`Template "${bulkPreset.title}" loaded!`);
                                                        }}
                                                        className="text-[10px] font-bold text-indigo-750 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 rounded px-2.5 py-1 transition-all cursor-pointer"
                                                    >
                                                        {bulkPreset.title}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            {/* Subject line */}
                                            <input
                                                type="text"
                                                value={bulkEmailSubject}
                                                onChange={(e) => setBulkEmailSubject(e.target.value)}
                                                placeholder="Enter email subject line..."
                                                className="w-full bg-slate-50 focus:bg-white border border-slate-200 text-xs rounded-md px-3.5 py-2.5 outline-none focus:border-[#02275A] font-bold text-slate-800 transition-all"
                                            />

                                            {/* Body */}
                                            <div className="flex flex-col">
                                                <textarea
                                                    rows={8}
                                                    value={bulkEmailMessage}
                                                    onChange={(e) => setBulkEmailMessage(e.target.value)}
                                                    placeholder="Type broadcast message body here..."
                                                    className="w-full bg-slate-50/30 focus:bg-white border border-slate-200 text-xs rounded-md px-3.5 py-3 outline-none focus:border-[#02275A] text-slate-700 resize-none min-h-[140px] transition-all leading-relaxed"
                                                />
                                                <span className="text-[10px] text-slate-400 italic font-medium mt-1.5">
                                                    Pro-Tip: Individual email log records will be created under each recipient's customer profile.
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Broadcast Footer */}
                                    <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between">
                                        <div className="text-[11px] font-bold text-slate-500">
                                            Sending to: <span className="text-[#02275A] font-extrabold">{selectedCustomerIds.length} businesses</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleSendBulkEmail}
                                            className="px-5 py-2 rounded-md text-xs font-bold transition-all duration-200 bg-[#02275A] hover:bg-[#02275A]/95 disabled:opacity-40 text-white shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer border-none"
                                        >
                                            <i className="fas fa-paper-plane text-[10px]"></i> Send Broadcast Email
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* INDIVIDUAL CUSTOMER READ & WRITE THREAD VIEW */
                                (() => {
                                    const c = customers.find(item => item.id === selectedInboxCustomerId);
                                    if (!c) {
                                        return (
                                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 bg-slate-50/20">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 mb-3">
                                                    <i className="fas fa-envelope-open text-base"></i>
                                                </div>
                                                <p className="font-extrabold text-sm text-slate-700">No Conversation Thread Selected</p>
                                                <p className="text-[11px] max-w-xs mt-0.5 text-slate-400 font-sans">Select a client customer thread from the left list or search to browse direct messaging history.</p>
                                            </div>
                                        );
                                    }

                                    const emailLogs = c.logs.filter(l => l.type === 'Email');

                                    return (
                                        <div className="flex flex-col h-full bg-slate-50/30" id="individual-chat-container">
                                            {/* Selected Customer Thread Header */}
                                            <div className="p-5 bg-white border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-[10px] bg-[#02275A]/5 text-[#02275A] border border-[#02275A]/10 px-2 py-0.5 rounded-lg font-black font-mono">
                                                            {c.id}
                                                        </span>
                                                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                                            c.plan === 'Premium' ? 'bg-amber-50 text-amber-600 border border-amber-100 font-extrabold' :
                                                            'bg-slate-100 text-slate-600'
                                                        }`}>
                                                            {c.plan} Plan
                                                        </span>
                                                    </div>
                                                    <h3 className="text-sm font-black text-slate-800 leading-snug">
                                                        {c.businessName}
                                                    </h3>
                                                    <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 pt-0.5">
                                                        <i className="fas fa-user-circle text-slate-400"></i>
                                                        Client Contact: <span className="text-slate-800 font-bold">{c.customerName || 'N/A'}</span> 
                                                        <span className="text-slate-400 font-mono text-[10px]">({c.email})</span>
                                                    </p>
                                                </div>
                                                {/* Simulator Button */}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const someSubjects = [
                                                            "onboarding setup", 
                                                            "payment billing error", 
                                                            "support query", 
                                                            "upsell add-on proposal"
                                                        ];
                                                        const pickSub = someSubjects[Math.floor(Math.random() * someSubjects.length)];
                                                        simulateCustomerReply(c, pickSub);
                                                    }}
                                                    className="px-3 py-1.5 text-[11px] font-bold rounded-lg border-2 border-dashed border-amber-600 bg-amber-50 text-amber-801 hover:bg-amber-100 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                                                    title="Click to simulate receiving an email from this customer"
                                                >
                                                    <i className="fas fa-magic text-amber-600 animate-bounce"></i> Sim Reply
                                                </button>
                                            </div>

                                            {/* Message convo stream */}
                                            <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar bg-slate-50/40">
                                                {emailLogs.length === 0 ? (
                                                    <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                                                        <i className="far fa-envelope text-2xl text-slate-300 mb-2"></i>
                                                        <p className="font-bold text-xs">No previous communications logged</p>
                                                        <p className="text-[11px] max-w-sm mt-0.5">Use the response area below to send the client their very first email message!</p>
                                                    </div>
                                                ) : (
                                                    [...emailLogs].reverse().map((msg) => {
                                                        const isCustomerReply = msg.loggedBy.includes('(Customer');
                                                        return (
                                                            <div 
                                                                key={msg.id} 
                                                                className={`rounded-3xl p-5 shadow-sm space-y-2.5 max-w-[85%] animate-fade-in ${
                                                                    isCustomerReply 
                                                                        ? 'bg-white border border-slate-100 mr-auto' 
                                                                        : 'bg-[#02275A]/5 border border-[#02275A]/10 ml-auto'
                                                                }`}
                                                            >
                                                                <div className="flex items-center justify-between text-[10px] border-b border-black/5 pb-1.5 font-bold text-slate-400">
                                                                    <span className="text-slate-700 flex items-center gap-1.5">
                                                                        {isCustomerReply ? (
                                                                            <>
                                                                                <i className="fas fa-comment-dots text-amber-500"></i> 
                                                                                <span className="font-extrabold text-amber-600">{msg.loggedBy}</span>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <i className="fas fa-paper-plane text-[#02275A]"></i> 
                                                                                <span className="font-extrabold text-[#02275A]">{msg.loggedBy}</span>
                                                                            </>
                                                                        )}
                                                                    </span>
                                                                    <span className="font-mono">{formatRelativeTime(msg.date)}</span>
                                                                </div>
                                                                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap pl-1 font-sans font-medium">
                                                                    {msg.summary}
                                                                </p>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>

                                            {/* Composer Box */}
                                            <div className="p-4 bg-white border-t border-slate-100 space-y-3 shadow-lg">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                                                    <div className="flex items-center justify-between text-xs font-bold text-[#02275A] px-1 w-full md:w-auto">
                                                        <span className="flex items-center gap-1.5">
                                                            <i className="fas fa-comment-dots text-[#02275A]"></i> Send Email Response
                                                        </span>
                                                    </div>
                                                    {/* Quick Templates */}
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Presets:</span>
                                                        {[
                                                            { title: 'Onboarding Schedule', sub: 'Prokip onboarding session schedule', txt: 'Hi,\n\nI hope your day is going well! I would like to schedule your activation onboarding session next week. Let me know if you are free Wednesday or Thursday!' },
                                                            { title: 'Support Answer', sub: 'Urgent: Issue Resolution', txt: 'Hello,\n\nWe have successfully fixed the transaction logging error on your account. Your system was fully updated today. Please let us know if everything is running smoothly now!' },
                                                            { title: 'Addon Proposal', sub: 'Prokip Inventory Plus Upgrades discount', txt: 'Hi,\n\nI would love to introduce a special premium upgrade proposal for your multi-store locations. We can enable Prokip Inventory Plus for a free trial!' }
                                                        ].map((t, idx) => (
                                                            <button
                                                                key={idx}
                                                                type="button"
                                                                onClick={() => {
                                                                    setInboxSubjectInput(t.sub);
                                                                    setInboxMessageInput(t.txt);
                                                                    showSuccess(`Template "${t.title}" loaded!`);
                                                                }}
                                                                className="text-[10px] font-semibold text-[#02275A] bg-blue-50 border border-blue-100 hover:bg-blue-100 rounded px-2 py-0.5 transition-colors cursor-pointer"
                                                            >
                                                                {t.title}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="space-y-2.5">
                                                    {/* Subject line */}
                                                    <input 
                                                        type="text"
                                                        value={inboxSubjectInput}
                                                        onChange={(e) => setInboxSubjectInput(e.target.value)}
                                                        placeholder="Subject line..."
                                                        className="w-full bg-slate-50 focus:bg-white border border-slate-200 text-xs rounded-md px-3.5 py-2.5 outline-none focus:border-[#02275A] font-bold text-slate-800 transition-all"
                                                    />

                                                    {/* Message text textarea */}
                                                    <textarea
                                                        id="inbox-composer-textarea"
                                                        rows={3}
                                                        value={inboxMessageInput}
                                                        onChange={(e) => setInboxMessageInput(e.target.value)}
                                                        placeholder={`Write your professional response to ${c.customerName}...`}
                                                        className="w-full bg-slate-50/30 focus:bg-white border border-slate-200 text-xs rounded-md px-3.5 py-3 outline-none focus:border-[#02275A] text-slate-700 resize-none min-h-[90px] transition-all leading-relaxed"
                                                    />

                                                    {/* Action buttons */}
                                                    <div className="flex justify-between items-center bg-slate-50 p-2 rounded-md border border-dashed border-slate-200">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1.5 flex items-center gap-1.5">
                                                            <i className="fas fa-clipboard-check text-emerald-500"></i>
                                                            Saves as "Awaiting Reply"
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                handleSendInboxMessage(c.id);
                                                            }}
                                                            disabled={!inboxMessageInput.trim()}
                                                            className="px-5 py-2 rounded-md text-xs font-bold transition-all duration-200 bg-[#02275A] hover:bg-[#02275A]/95 disabled:opacity-40 text-white shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer border-none"
                                                        >
                                                            <i className="fas fa-paper-plane text-[10px]"></i> Send Email
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()
                            )}
                        </div>
                    </div>
                );
            })()}

            {activeDashboardTab === 'reports' && (
                <div className="space-y-6 animate-fade-in">
                    
                    {/* Report Header & Filter */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg">Customer Success Performance metrics</h3>
                            <p className="text-slate-500 text-xs">Analytics and team engagement summary</p>
                        </div>
                        {isTeamLead && (
                            <div className="flex items-center gap-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Filter Staff:</label>
                                <select 
                                    value={reportCsmFilter}
                                    onChange={e => setReportCsmFilter(e.target.value)}
                                    className="bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-bold outline-none cursor-pointer"
                                >
                                    <option value="all">All Team Members</option>
                                    <option value={currentUser}>{currentUser} (Me)</option>
                                    {accountManagers.map(am => (
                                        <option key={am} value={am}>{am}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Key Importance Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 border-t-4 border-t-blue-500">
                            <h4 className="text-xs uppercase font-bold text-slate-500 mb-1">Average Happiness</h4>
                            <div className="flex items-end justify-between">
                                <span className="text-3xl font-black text-slate-800">{reportMetrics.avgHappiness}</span>
                                <span className="text-xs font-bold text-slate-500">score</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                                <div className="bg-blue-500 h-full" style={{ width: `${Math.max(0, Math.min(100, reportMetrics.avgHappiness))}%` }}></div>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-2 font-medium">Higher is better.</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 border-t-4 border-t-emerald-500">
                            <h4 className="text-xs uppercase font-bold text-slate-500 mb-1">Customers Contacted</h4>
                            <div className="flex items-end justify-between">
                                <span className="text-3xl font-black text-slate-800">{reportMetrics.totalContactedCustomers}</span>
                                <span className="text-xs font-bold text-slate-500">/ {reportMetrics.totalCustomers}</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                                <div className="bg-emerald-500 h-full" style={{ width: `${Math.max(0, Math.min(100, (reportMetrics.totalContactedCustomers / Math.max(1, reportMetrics.totalCustomers)) * 100))}%` }}></div>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-2 font-medium">Coverage of assigned acts.</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 border-t-4 border-t-indigo-500">
                            <h4 className="text-xs uppercase font-bold text-slate-500 mb-1">Active Customers</h4>
                            <div className="flex items-end justify-between">
                                <span className="text-3xl font-black text-slate-800">{reportMetrics.activeCustomers}</span>
                                <span className="text-xs font-bold text-slate-500">/ {reportMetrics.totalCustomers}</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                                <div className="bg-indigo-500 h-full" style={{ width: `${Math.max(0, Math.min(100, (reportMetrics.activeCustomers / Math.max(1, reportMetrics.totalCustomers)) * 100))}%` }}></div>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-2 font-medium">Accounts currently active.</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 border-t-4 border-t-amber-500">
                            <h4 className="text-xs uppercase font-bold text-slate-500 mb-1">Total Interactions</h4>
                            <div className="flex items-end justify-between">
                                <span className="text-3xl font-black text-slate-800">{reportMetrics.totalInteractions}</span>
                                <span className="text-xs font-bold text-slate-500">logs</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                                <div className="bg-amber-500 h-full" style={{ width: '100%' }}></div>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-2 font-medium">Total logged activities.</p>
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
            
            {activeDashboardTab === 'settings' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in text-slate-700">
                    {/* Auto Customer Assignment Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <i className="fas fa-magic text-emerald-500"></i>
                                <h3 className="font-bold text-slate-800 text-base">Auto Customer Assignment</h3>
                            </div>
                            <p className="text-xs text-slate-500 mb-4">
                                Automatically distributes active accounts across portfolio managers (Sarah, Mike, and Felix) in a round-robin format.
                            </p>
                            
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mb-6 text-xs text-slate-600 space-y-2">
                                <span className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Team Allocation Status</span>
                                <div className="flex justify-between items-center bg-white px-3 py-2 rounded border border-slate-200/60">
                                    <span className="font-bold text-slate-700">Sarah O.</span>
                                    <span className="font-black text-[#02275A]">{customers.filter(c => c.accountManager === 'Sarah O.').length} assigned</span>
                                </div>
                                <div className="flex justify-between items-center bg-white px-3 py-2 rounded border border-slate-200/60">
                                    <span className="font-bold text-slate-700">Felix M.</span>
                                    <span className="font-black text-[#02275A]">{customers.filter(c => c.accountManager === 'Felix M.').length} assigned</span>
                                </div>
                                <div className="flex justify-between items-center bg-white px-3 py-2 rounded border border-slate-200/60">
                                    <span className="font-bold text-slate-700">Mike T.</span>
                                    <span className="font-black text-[#02275A]">{customers.filter(c => c.accountManager === 'Mike T.').length} assigned</span>
                                </div>
                            </div>
                        </div>
                        
                        <button
                            onClick={handleAutoAssign}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-4 py-3 rounded-lg shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 border-none"
                        >
                            <i className="fas fa-magic"></i>
                            Auto assign
                        </button>
                    </div>

                    {/* Tags Library Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-[#e2e8f0] p-6 flex flex-col">
                        <div className="flex items-center gap-2 mb-2">
                            <i className="fas fa-tags text-indigo-500"></i>
                            <h3 className="font-bold text-slate-800 text-base">Global Portfolio Tags Library</h3>
                        </div>
                        <p className="text-xs text-slate-500 mb-4">
                            Define standard portfolio categories, flags, or status tags. Customers page users can attach these tags when editing accounts.
                        </p>
                        
                        {/* Define New Tag Form */}
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
                            <span className="block text-[10px] font-black text-[#02275A] uppercase tracking-wider mb-1.5">Define New Portfolio Tag</span>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={tempGlobalNewTagInput}
                                    onChange={(e) => setTempGlobalNewTagInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleAddGlobalLibraryTag();
                                    }}
                                    placeholder="Enter tag name (e.g. High Priority, Inactive CX)"
                                    className="flex-grow bg-white border border-slate-300 text-slate-800 text-xs rounded px-3 py-2 outline-none focus:border-[#02275A] transition-colors font-bold shadow-xs whitespace-nowrap"
                                />
                                <button 
                                    onClick={handleAddGlobalLibraryTag}
                                    className="bg-[#02275A] hover:bg-[#03367A] text-white font-bold text-xs px-4 py-2 rounded transition-colors cursor-pointer shrink-0 border-none"
                                >
                                    Define Tag
                                </button>
                            </div>
                        </div>

                        {/* Tags List Container */}
                        <div className="space-y-2 flex-grow overflow-y-auto max-h-[250px] pr-1 custom-scrollbar">
                            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Defined Tags ({definedTags.length})</span>
                            <div className="flex flex-wrap gap-2">
                                {definedTags.map(tag => {
                                    const count = customers.filter(c => c.tags.includes(tag)).length;
                                    return (
                                        <div 
                                            key={tag} 
                                            className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full transition-all"
                                        >
                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></span>
                                            <span className="font-bold text-slate-700 text-[11px]">{tag}</span>
                                            <span className="text-[9px] text-slate-400 font-extrabold bg-slate-200 px-1.5 py-0.5 rounded leading-none">
                                                {count}
                                            </span>
                                            <button 
                                                onClick={() => handleRemoveGlobalLibraryTag(tag)}
                                                className="text-slate-400 hover:text-rose-500 p-0.5 rounded transition-colors cursor-pointer bg-transparent border-none flex items-center justify-center h-4 w-4"
                                                title="Remove globally"
                                            >
                                                <i className="fas fa-times text-[9px]"></i>
                                            </button>
                                        </div>
                                    );
                                })}
                                {definedTags.length === 0 && (
                                    <div className="w-full text-center py-6 text-slate-400 text-xs font-bold italic border border-dashed border-slate-200 rounded-lg">
                                        No tags defined.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {isGlobalTagsModalOpen && createPortal(
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in text-slate-700">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100 flex flex-col max-h-[85vh]">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-[#02275A] text-white">
                            <h3 className="font-bold flex items-center gap-2 text-white">
                                <i className="fas fa-tags text-amber-400"></i> Global Portfolio Tags Library
                            </h3>
                            <button onClick={() => { setIsGlobalTagsModalOpen(false); setTempGlobalNewTagInput(''); }} className="text-white hover:text-amber-300 transition-colors cursor-pointer bg-transparent border-none">
                                <i className="fas fa-times text-lg"></i>
                            </button>
                        </div>
                        <div className="p-6 space-y-6 overflow-y-auto flex-grow">
                            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                                Define standard portfolio categories, flags, or status tags. Customer Success reps will be able to select these existing tags from the dropdown menu when updating records.
                            </p>
                            
                            {/* Create New Defined Tag Form */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 animate-fade-in">
                                <label className="block text-xs font-black text-[#02275A] uppercase tracking-wider mb-2">Define New Portfolio Tag</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={tempGlobalNewTagInput}
                                        onChange={(e) => setTempGlobalNewTagInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleAddGlobalLibraryTag();
                                        }}
                                        placeholder="Enter tag name (e.g. High Priority, Inactive CX)"
                                        className="flex-grow bg-white border border-slate-300 text-slate-800 text-xs rounded-lg px-3 py-2.5 outline-none focus:border-[#02275A] transition-colors font-bold shadow-xs"
                                    />
                                    <button 
                                        onClick={handleAddGlobalLibraryTag}
                                        className="bg-[#02275A] hover:bg-[#03367A] text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 border-none"
                                    >
                                        <i className="fas fa-plus"></i> Define Tag
                                    </button>
                                </div>
                            </div>

                            {/* Tags list with assignment counts */}
                            <div className="space-y-3">
                                <span className="block text-xs font-black text-slate-400 uppercase tracking-wider">Currently Defined Tags ({definedTags.length})</span>
                                <div className="flex flex-wrap gap-2 py-1">
                                    {definedTags.map(tag => {
                                        const count = customers.filter(c => c.tags.includes(tag)).length;
                                        return (
                                            <div 
                                                key={tag} 
                                                className="inline-flex items-center gap-2 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 px-3 py-1.5 rounded-full transition-all"
                                            >
                                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></span>
                                                <span className="font-bold text-slate-700 text-xs">{tag}</span>
                                                <span className="text-[10px] text-slate-400 font-extrabold bg-slate-200/55 px-1.5 py-0.5 rounded-md leading-none">
                                                    {count}
                                                </span>
                                                <button 
                                                    onClick={() => handleRemoveGlobalLibraryTag(tag)}
                                                    className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-0.5 rounded-full transition-colors cursor-pointer bg-transparent border-none flex items-center justify-center h-4 w-4"
                                                    title="Delete from global tags list"
                                                >
                                                    <i className="fas fa-times text-[10px]"></i>
                                                </button>
                                            </div>
                                        );
                                    })}
                                    {definedTags.length === 0 && (
                                        <div className="w-full text-center py-6 text-slate-400 text-xs font-bold italic border border-dashed border-slate-200 rounded-xl">
                                            No tags are currently defined. Please add some above.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                            <button 
                                onClick={() => { setIsGlobalTagsModalOpen(false); setTempGlobalNewTagInput(''); }}
                                className="px-5 py-2.5 text-xs font-bold bg-[#02275A] text-white hover:bg-[#03367A] rounded-xl transition-colors cursor-pointer shadow-xs border-none"
                            >
                                Close Library
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
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

            {/* BRM Rating Modal */}
            {isBrmRatingModalOpen && selectedCustomerForView && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <i className="fas fa-star text-amber-500"></i> Rate BRM Performance
                            </h3>
                            <button onClick={() => setIsBrmRatingModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                                <i className="fas fa-times text-lg"></i>
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <p className="text-sm text-slate-600">Evaluate business relationship manager performance for <strong>{selectedCustomerForView.businessName}</strong>. This feedback is converted into Customer Happiness.</p>
                            
                            <div className="flex justify-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setBrmRatingInput(star)}
                                        className={`text-4xl transition-all cursor-pointer ${star <= brmRatingInput ? 'text-amber-400 scale-110' : 'text-slate-200 hover:text-amber-200'}`}
                                    >
                                        <i className="fas fa-star"></i>
                                    </button>
                                ))}
                            </div>
                            <div className="text-center text-xs font-bold text-slate-500 mt-2">
                                {brmRatingInput === 1 && "Very Poor (-100%)"}
                                {brmRatingInput === 2 && "Poor (-50%)"}
                                {brmRatingInput === 3 && "Neutral (0%)"}
                                {brmRatingInput === 4 && "Good (50%)"}
                                {brmRatingInput === 5 && "Excellent (100%)"}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-2">Optional Feedback / Notes</label>
                                <textarea 
                                    value={brmFeedbackInput}
                                    onChange={(e) => setBrmFeedbackInput(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 rounded-xl text-sm outline-none focus:border-[#02275A] resize-none h-24"
                                    placeholder="Any specific comments on their performance?"
                                ></textarea>
                            </div>
                        </div>
                        <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                            <button 
                                onClick={() => setIsBrmRatingModalOpen(false)}
                                className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => {
                                    // Convert 1-5 to -100 to +100
                                    const newHappiness = (brmRatingInput - 3) * 50;
                                    setCustomers(customers.map(c => c.id === selectedCustomerForView.id ? { ...c, customerHappiness: newHappiness } : c));
                                    setSelectedCustomerForView({ ...selectedCustomerForView, customerHappiness: newHappiness });
                                    showSuccess(`BRM rating submitted. Customer Happiness updated to ${newHappiness}%`);
                                    setIsBrmRatingModalOpen(false);
                                }}
                                className="px-5 py-2.5 text-sm font-bold bg-[#02275A] text-white hover:bg-[#03367A] rounded-xl transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
                            >
                                <i className="fas fa-paper-plane"></i> Submit Rating
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCustomerSuccessView;
