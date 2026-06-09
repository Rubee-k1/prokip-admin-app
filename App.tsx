
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ManagerSidebar from './components/ManagerSidebar';
import AdminSidebar from './components/AdminSidebar';
import TeamLeadSidebar from './components/TeamLeadSidebar';
import DepartmentSidebar from './components/DepartmentSidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import ManagerDashboardView from './components/ManagerDashboardView';
import ManagerAgentsView from './components/ManagerAgentsView';
import ManagerLeadsView from './components/ManagerLeadsView';
import ManagerLeaderboard from './components/ManagerLeaderboard';
import ManagerEarningsView from './components/ManagerEarningsView';
import ManagerPerformanceView from './components/ManagerPerformanceView';
import ManagerReportsView from './components/ManagerReportsView';
import AdminDashboardView from './components/AdminDashboardView';
import AdminUsersView from './components/AdminUsersView';
import AdminHRCenterView from './components/AdminHRCenterView';
import AdminReportsView from './components/AdminReportsView';
import AdminCommissionsView from './components/AdminCommissionsView';
import AdminComplaintsView from './components/AdminComplaintsView';
import AdminBroadcastsView from './components/AdminBroadcastsView';
import AdminCustomerSuccessView from './components/AdminCustomerSuccessView';
import AdminAppManagementView from './components/AdminAppManagementView';
import AdminSettingsView from './components/AdminSettingsView';
import AdminAgentsView from './components/AdminAgentsView';
import AdminManagersView from './components/AdminManagersView';
import AdminLeadsView from './components/AdminLeadsView';
import AdminCustomersView from './components/AdminCustomersView';
import AdminFinanceCenterView from './components/AdminFinanceCenterView';
import BusinessesView from './components/BusinessesView';
import TrialsView from './components/TrialsView';
import LeadsView from './components/LeadsView';
import UpsellView from './components/UpsellView';
import EarningsView from './components/EarningsView';
import PerformanceView from './components/PerformanceView';
import EmployeeDashboardView from './components/EmployeeDashboardView';
import EmployeeGradesRewardsView from './components/EmployeeGradesRewardsView';
import EmployeePolicyView from './components/EmployeePolicyView';
import EmployeeHistoryView from './components/EmployeeHistoryView';
import EmployeeProfileView from './components/EmployeeProfileView';
import EmployeeLeaderboardView from './components/EmployeeLeaderboardView';
import CXHeadProfileView from './components/CXHeadProfileView';
import TeamLeadDashboardView from './components/TeamLeadDashboardView';
import CXHeadDashboardView from './components/CXHeadDashboardView';
import ProfileView from './components/ProfileView';
import NotificationsView from './components/NotificationsView';
import KnowledgeBaseView, { MOCK_KB_MODULES } from './components/KnowledgeBaseView';
import ContentHubView, { MOCK_CONTENT } from './components/ContentHubView';
import AdminCEODashboardView from './components/AdminCEODashboardView';
import AdminResourceCenterView from './components/AdminResourceCenterView';
import TicketsView from './components/TicketsView';
import PolicyView from './components/PolicyView';
import PlansView from './components/PlansView';
import LoginView from './components/LoginView';
import SignUpView from './components/SignUpView';
import OnboardingView from './components/OnboardingView';
import ForgotPasswordView from './components/ForgotPasswordView';
import WelcomeBonusModal from './components/WelcomeBonusModal';
import AgentAgreementModal from './components/AgentAgreementModal';
import InvoicePaymentView from './components/InvoicePaymentView';
import { AlertProvider, useAlert } from './contexts/AlertContext';
import { Notification, Business, Complaint, Trial, Invoice, UserRole, FinanceExpense } from './types';

// Auth types
type AuthStage = 'login' | 'signup' | 'onboarding' | 'agreement' | 'dashboard' | 'forgot-password';

function AgentApp() {
    const [authStage, setAuthStage] = useState<AuthStage>('login');
    const [userRole, setUserRole] = useState<UserRole>('agent'); // Default to agent
    const [userCountry, setUserCountry] = useState<string>('Nigeria'); // Default to Nigeria
    const [userDepartment, setUserDepartment] = useState<string>(''); // Default to empty
    const [currentView, setView] = useState<string>('dashboard');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { showError, showSuccess, showWarning } = useAlert();
    const [pendingBusinessId, setPendingBusinessId] = useState<string | null>(null);
    
    // Welcome Bonus State
    const [showWelcomeBonus, setShowWelcomeBonus] = useState(false);
    
    // Public Invoice State
    const [publicInvoiceId, setPublicInvoiceId] = useState<string | null>(null);

    useEffect(() => {
        const hash = window.location.hash;
        if (hash.startsWith('#/invoice/')) {
            setPublicInvoiceId(hash.replace('#/invoice/', ''));
        }
        
        const handleHashChange = () => {
            const newHash = window.location.hash;
            if (newHash.startsWith('#/invoice/')) {
                setPublicInvoiceId(newHash.replace('#/invoice/', ''));
            } else {
                setPublicInvoiceId(null);
            }
        };
        
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    // Network Status Listeners
    useEffect(() => {
        const handleOnline = () => showSuccess("You are back online!");
        const handleOffline = () => showError("No Internet Connection. You are currently offline.");

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [showSuccess, showError]);

    // Centralized Data State
    const [businesses, setBusinesses] = useState<Business[]>([]);

    useEffect(() => {
        if (userCountry === 'Ghana') {
            setBusinesses([
                { id: 'GH-001', name: 'Accra Tech Hub', owner: 'Kwame Mensah', phone: '0241234567', email: 'kwame@accratech.gh', category: 'Technology', plan: 'Premium', planClass: 'bg-indigo-100 text-indigo-700', status: 'Completed', statusClass: 'bg-emerald-100 text-emerald-700', verified: true, dateJoined: '15 Jan 2023', address: 'Osu, Accra', country: 'Ghana', expiryDate: '15 Jan 2024', limits: { locations: '1/3', users: '4/10', products: '450/Unlimited' } },
                { id: 'GH-002', name: 'Kumasi Traders', owner: 'Abena Osei', phone: '0209876543', email: 'abena@kumasitraders.gh', category: 'Retail', plan: 'Basic', planClass: 'bg-slate-100 text-slate-600', status: 'Dormant', statusClass: 'bg-rose-100 text-rose-700', verified: true, dateJoined: '02 Feb 2023', address: 'Kejetia Market, Kumasi', country: 'Ghana', expiryDate: '02 Feb 2024', limits: { locations: '1/1', users: '1/2', products: '120/500' } },
                { id: 'GH-003', name: 'Tema Logistics', owner: 'Kofi Annan', phone: '0275554443', email: 'kofi@temalogistics.gh', category: 'Logistics', plan: 'Ultimate', planClass: 'bg-blue-100 text-blue-900', status: 'Engaged', statusClass: 'bg-emerald-100 text-emerald-700', verified: true, dateJoined: '05 Apr 2023', address: 'Tema Port', country: 'Ghana', expiryDate: '05 Apr 2024', limits: { locations: '5/Unlimited', users: '45/Unlimited', products: '2500/Unlimited' } }
            ]);
        } else if (userCountry === 'Kenya') {
            setBusinesses([
                { id: 'KE-001', name: 'Nairobi Safari Tours', owner: 'Jomo Kenyatta', phone: '0712345678', email: 'jomo@nairobisafari.ke', category: 'Travel', plan: 'Premium', planClass: 'bg-indigo-100 text-indigo-700', status: 'Completed', statusClass: 'bg-emerald-100 text-emerald-700', verified: true, dateJoined: '15 Jan 2023', address: 'Westlands, Nairobi', country: 'Kenya', expiryDate: '15 Jan 2024', limits: { locations: '1/3', users: '4/10', products: '450/Unlimited' } },
                { id: 'KE-002', name: 'Mombasa Exports', owner: 'Amina Mohamed', phone: '0729876543', email: 'amina@mombasaexports.ke', category: 'Logistics', plan: 'Basic', planClass: 'bg-slate-100 text-slate-600', status: 'Dormant', statusClass: 'bg-rose-100 text-rose-700', verified: true, dateJoined: '02 Feb 2023', address: 'Mombasa Port', country: 'Kenya', expiryDate: '02 Feb 2024', limits: { locations: '1/1', users: '1/2', products: '120/500' } },
                { id: 'KE-003', name: 'Kisumu Fisheries', owner: 'Oginga Odinga', phone: '0735554443', email: 'oginga@kisumufish.ke', category: 'Agriculture', plan: 'Ultimate', planClass: 'bg-blue-100 text-blue-900', status: 'Engaged', statusClass: 'bg-emerald-100 text-emerald-700', verified: true, dateJoined: '05 Apr 2023', address: 'Lake Victoria, Kisumu', country: 'Kenya', expiryDate: '05 Apr 2024', limits: { locations: '5/Unlimited', users: '45/Unlimited', products: '2500/Unlimited' } }
            ]);
        } else if (userCountry === 'Rwanda') {
            setBusinesses([
                { id: 'RW-001', name: 'Kigali Coffee', owner: 'Paul Kagame', phone: '0781234567', email: 'paul@kigalicoffee.rw', category: 'Agriculture', plan: 'Premium', planClass: 'bg-indigo-100 text-indigo-700', status: 'Completed', statusClass: 'bg-emerald-100 text-emerald-700', verified: true, dateJoined: '15 Jan 2023', address: 'Nyarutarama, Kigali', country: 'Rwanda', expiryDate: '15 Jan 2024', limits: { locations: '1/3', users: '4/10', products: '450/Unlimited' } },
                { id: 'RW-002', name: 'Musanze Tourism', owner: 'Louise Mushikiwabo', phone: '0799876543', email: 'louise@musanzetours.rw', category: 'Travel', plan: 'Basic', planClass: 'bg-slate-100 text-slate-600', status: 'Dormant', statusClass: 'bg-rose-100 text-rose-700', verified: true, dateJoined: '02 Feb 2023', address: 'Volcanoes National Park', country: 'Rwanda', expiryDate: '02 Feb 2024', limits: { locations: '1/1', users: '1/2', products: '120/500' } }
            ]);
        } else {
            setBusinesses([
                { id: '9921', name: 'Sokoto Rice Mill', owner: 'Mr. John Doe', phone: '08012345678', email: 'john@sokotomill.com', category: 'Manufacturing', plan: 'Premium', planClass: 'bg-indigo-100 text-indigo-700', status: 'Completed', statusClass: 'bg-emerald-100 text-emerald-700', verified: true, dateJoined: '15 Jan 2023', address: 'Plot 45, Industrial Layout, Sokoto', country: 'Nigeria', expiryDate: '15 Jan 2024', limits: { locations: '1/3', users: '4/10', products: '450/Unlimited' } },
                { id: '9922', name: 'Lagos Logistics', owner: 'Mrs. Jane Smith', phone: '07098765432', email: 'jane@lagoslog.com', category: 'Logistics / Transport', plan: 'Basic', planClass: 'bg-slate-100 text-slate-600', status: 'Dormant', statusClass: 'bg-rose-100 text-rose-700', verified: true, dateJoined: '02 Feb 2023', address: '12 Wharf Road, Apapa, Lagos', country: 'Nigeria', expiryDate: '02 Feb 2024', limits: { locations: '1/1', users: '1/2', products: '120/500' } },
                { id: '9925', name: 'Kano Fabrics', owner: 'Alh. Musa', phone: '08122233344', email: 'musa@kanofab.com', category: 'Fashion / Apparel', plan: 'Standard (Trial)', planClass: 'bg-amber-100 text-amber-700', status: 'Pending', statusClass: 'bg-amber-50 text-amber-600', verified: false, dateJoined: '10 Mar 2023', address: 'Kantin Kwari Market, Kano', country: 'Nigeria', expiryDate: 'N/A', limits: { locations: '1/1', users: '1/5', products: '0/1000' } },
                { id: '9930', name: 'Eko Hotels', owner: 'Chief Obi', phone: '08055544433', email: 'info@ekohotels.com', category: 'Hospitality / Hotel', plan: 'Ultimate', planClass: 'bg-blue-100 text-blue-900', status: 'Engaged', statusClass: 'bg-emerald-100 text-emerald-700', verified: true, dateJoined: '05 Apr 2023', address: 'Adetokunbo Ademola Street, VI, Lagos', country: 'Nigeria', expiryDate: '05 Apr 2024', limits: { locations: '5/Unlimited', users: '45/Unlimited', products: '2500/Unlimited' } }
            ]);
        }
    }, [userCountry]);

    const [complaints, setComplaints] = useState<Complaint[]>([
        { id: 'TKT-2023-001', businessId: '9921', subject: 'Login Issues', priority: 'High', status: 'Resolved', category: 'Technical', description: 'User unable to login on mobile app.', dateCreated: 'Oct 1, 2023', lastUpdated: 'Oct 2, 2023' },
        { id: 'TKT-2023-042', businessId: '9922', subject: 'Invoice Discrepancy', priority: 'Medium', status: 'Open', category: 'Billing', description: 'Oct invoice shows wrong tax amount.', dateCreated: 'Oct 25, 2023', lastUpdated: 'Oct 25, 2023' },
    ]);

    // Invoices State
    const [invoices, setInvoices] = useState<Invoice[]>([
        { 
            id: 'INV-10293', 
            recipientId: '9925', 
            recipientName: 'Kano Fabrics', 
            recipientType: 'Business', 
            totalAmount: '20000', 
            items: [],
            description: 'Standard Plan Subscription', 
            dateCreated: 'Oct 25, 2023', 
            dueDate: 'Oct 30, 2023', 
            expiryDate: 'Oct 30, 2023',
            status: 'Unpaid', 
            virtualAccount: '8901234567', 
            bankName: 'Moniepoint MFB', 
            accountName: 'Prokip - Kano Fabrics', 
            paymentLink: `${window.location.origin}/#/invoice/INV-10293`,
            remindersSent: { email: 1, whatsapp: 0, sms: 0 } 
        },
    ]);

    // Centralized Notification State
    const [notifications, setNotifications] = useState<Notification[]>([
        { id: 101, title: 'New Complaint Logged', message: 'Ticket #TKT-2023-042 created for Lagos Logistics.', time: '10 mins ago', type: 'alert', read: false, details: 'A new billing complaint has been raised regarding invoice discrepancies. Priority: Medium.', actionLink: 'tickets' },
        { id: 1, title: 'Commission Paid', message: 'You received ₦50,000 for Tantalizers Festac renewal.', time: '2 mins ago', type: 'success', read: false, details: 'The commission has been credited to your wallet balance. You can withdraw this amount anytime via the Earnings page. Transaction ID: #TXN-8842.', actionLink: 'earnings' },
        { id: 2, title: 'Trial Expiring Soon', message: 'K-Mart Stores trial ends in 2 days. Follow up now.', time: '1 hour ago', type: 'warning', read: false, details: 'K-Mart Stores has been active for 12 days. Their trial period is ending. Recommended action: Call the owner to discuss conversion to the Standard Plan.', actionLink: 'trials' },
        { id: 3, title: 'New Lead Assigned', message: 'A new lead "Abuja Wares" has been assigned to you.', time: '3 hours ago', type: 'info', read: true, details: 'Lead Source: Website Inquiry. Contact Person: Mr. Ahmed. Location: Abuja. Please reach out within 24 hours.', actionLink: 'leads' },
        { id: 4, title: 'System Maintenance', message: 'Scheduled maintenance on Oct 28th, 2am - 4am.', time: 'Yesterday', type: 'alert', read: true, details: 'The Prokip Agent Portal will be undergoing scheduled maintenance. Services might be intermittent during this period. We apologize for any inconvenience.' },
        { id: 5, title: 'Performance Badge Unlocked', message: 'Congratulations! You have earned the "Fast Starter" badge.', time: '2 days ago', type: 'success', read: true, details: 'You closed 5 deals within your first week. Keep up the great work! This badge is now visible on your profile.', actionLink: 'performance' },
    ]);

    // Content Hub State
    const [contentItems, setContentItems] = useState(MOCK_CONTENT);
    const [kbModules, setKbModules] = useState(MOCK_KB_MODULES);
    const [expenses, setExpenses] = useState<FinanceExpense[]>([
        { id: 'exp-001', date: '2023-11-01', amount: 500000, description: 'Facebook Ads - Nov', category: 'Marketing', accountId: 'acc-003', recurring: true, frequency: 'Monthly', status: 'Approved', submittedBy: 'Accountant Mary', marketingRelated: true },
        { id: 'exp-002', date: '2023-11-15', amount: 150000, description: 'Office Supplies', category: 'Operations', accountId: 'acc-001', recurring: false, status: 'Pending', submittedBy: 'Accountant Mary', marketingRelated: false },
    ]);

    const markAsRead = (id: number) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const handleAddNotification = (notification: Notification) => {
        setNotifications(prev => [notification, ...prev]);
    };

    const handleAddComplaint = (complaint: Complaint) => {
        setComplaints([complaint, ...complaints]);
        const newNotif: Notification = {
            id: Date.now(),
            title: 'New Ticket Created',
            message: `Ticket #${complaint.id} created successfully.`,
            time: 'Just now',
            type: 'success',
            read: false,
            details: `Subject: ${complaint.subject}. Priority: ${complaint.priority}.`,
            actionLink: 'tickets'
        };
        handleAddNotification(newNotif);
        showSuccess(`Ticket #${complaint.id} logged successfully.`);
    };

    const handleUpdateComplaint = (updatedComplaint: Complaint) => {
        setComplaints(complaints.map(c => c.id === updatedComplaint.id ? updatedComplaint : c));
        showSuccess(`Ticket #${updatedComplaint.id} updated.`);
    };

    const handleRegisterBusiness = (data: any) => {
        const newId = `99${Math.floor(Math.random() * 89) + 10}`; 
        const newBusiness: Business = {
            id: newId,
            name: data.companyName,
            owner: `${data.firstName} ${data.lastName}`,
            phone: data.phone,
            email: data.email,
            category: data.industry,
            plan: 'Pending',
            planClass: 'bg-slate-100 text-slate-600',
            status: 'Pending',
            statusClass: 'bg-amber-50 text-amber-600',
            verified: false,
            dateJoined: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            address: data.address,
            country: data.country,
            expiryDate: 'N/A',
            limits: { locations: '1/1', users: '1/1', products: '0/100' }
        };

        setBusinesses([newBusiness, ...businesses]);
        setPendingBusinessId(newId);
        setView('plans');
    };

    const handleConvertTrial = (trial: Trial) => {
        const existing = businesses.find(b => b.id === trial.id);
        if (!existing) {
            const convertedBusiness: Business = {
                id: trial.id,
                name: trial.name,
                owner: trial.owner,
                phone: trial.phone,
                email: 'pending@email.com',
                category: 'Retail',
                plan: 'Free Trial',
                planClass: 'bg-slate-100 text-slate-600',
                status: 'Engaged',
                statusClass: 'bg-blue-50 text-blue-600',
                verified: true,
                dateJoined: 'Recently',
                address: 'Unknown Address',
                country: 'Nigeria',
                expiryDate: 'Expiring Soon',
                limits: { locations: '1/1', users: '1/2', products: 'Unlimited' }
            };
            setBusinesses([convertedBusiness, ...businesses]);
        }
        setPendingBusinessId(trial.id);
        setView('plans');
    };

    const handlePlanSelected = (planName: string, isTrial: boolean = false) => {
        if (!pendingBusinessId) return;

        const planMap: Record<string, string> = {
            'Basic': 'bg-slate-100 text-slate-600',
            'Standard': 'bg-amber-100 text-amber-700',
            'Premium': 'bg-indigo-100 text-indigo-700',
            'Ultimate': 'bg-blue-100 text-blue-900'
        };

        setBusinesses(prev => prev.map(b => {
            if (b.id === pendingBusinessId) {
                let expiry = 'N/A';
                if (planName === 'Basic') expiry = 'Lifetime';
                else if (isTrial) expiry = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                else expiry = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

                return {
                    ...b,
                    plan: planName + (isTrial ? ' (Trial)' : ''),
                    planClass: planMap[planName] || 'bg-slate-100 text-slate-600',
                    status: 'Completed',
                    statusClass: 'bg-emerald-100 text-emerald-700',
                    expiryDate: expiry
                };
            }
            return b;
        }));

        const businessName = businesses.find(b => b.id === pendingBusinessId)?.name || 'Business';
        if (isTrial) {
            showSuccess(`14-Day Free Trial for ${planName} activated for ${businessName}.`);
        } else {
            showSuccess(`${planName} plan assigned to ${businessName}.`);
        }
        setPendingBusinessId(null);
        setView('businesses');
    };

    const handleAddInvoice = (invoice: Invoice) => {
        setInvoices([invoice, ...invoices]);
        showSuccess(`Invoice #${invoice.id} created successfully.`);
    };

    const handleUpdateInvoice = (updatedInvoice: Invoice) => {
        setInvoices(prev => prev.map(inv => inv.id === updatedInvoice.id ? updatedInvoice : inv));
        
        if (updatedInvoice.status === 'Paid') {
             const newNotif: Notification = {
                id: Date.now(),
                title: 'Payment Received',
                message: `Invoice #${updatedInvoice.id} for ₦${parseInt(updatedInvoice.totalAmount).toLocaleString()} has been paid by ${updatedInvoice.recipientName}.`,
                time: 'Just now',
                type: 'success',
                read: false,
                details: 'The amount has been credited to your pending balance.',
                actionLink: 'earnings'
            };
            handleAddNotification(newNotif);
            showSuccess(`Payment received for Invoice #${updatedInvoice.id}`);
        }
    };

    const handleLogout = () => {
        setAuthStage('login');
        setView('dashboard');
        setUserRole('agent');
        setUserDepartment('');
        setIsMobileMenuOpen(false);
        setShowWelcomeBonus(false);
    };

    const handleLoginSuccess = (role: UserRole, email?: string) => {
        setUserRole(role);
        
        switch (role) {
            case 'cx-head':
            case 'team-lead':
                setUserDepartment('Customer Experience');
                break;
            case 'call-agent':
                setUserDepartment('Call Center');
                break;
            case 'sales-manager':
                setUserDepartment('Sales');
                break;
            case 'support-staff':
                setUserDepartment('Support');
                break;
            case 'finance':
                setUserDepartment('Finance');
                break;
            case 'marketing-manager':
                setUserDepartment('Marketing');
                break;
            case 'content-lead':
                setUserDepartment('Content');
                break;
            case 'customer-success':
                setUserDepartment('Customer Success');
                break;
            default:
                setUserDepartment('');
                break;
        }
        
        // Set country based on email for mock flow
        if (email === 'ghana@gmail.com') {
            setUserCountry('Ghana');
        } else if (email === 'kenya@gmail.com') {
            setUserCountry('Kenya');
        } else if (email === 'rwanda@gmail.com') {
            setUserCountry('Rwanda');
        } else {
            setUserCountry('Nigeria');
        }

        setAuthStage('dashboard');
        // Set distinct initial views based on role
        if (role === 'admin') {
            setView('admin-dashboard');
        } else if (role === 'manager') {
            setView('manager-dashboard');
        } else if (['team-lead', 'cx-head', 'call-agent', 'sales-manager', 'support-staff', 'finance', 'marketing-manager', 'content-lead', 'customer-success'].includes(role)) {
            setView(role === 'call-agent' ? 'dashboard' : ((role === 'team-lead' || ['cx-head', 'customer-success', 'sales-manager', 'marketing-manager', 'support-staff', 'finance', 'content-lead'].includes(role)) ? 'team-lead-dashboard' : 'dept-performance'));
        } else if (role === 'employee') {
            setView('dashboard');
        } else {
            setView('dashboard');
        }
    };

    // --- AUTH FLOW HANDLING ---
    if (publicInvoiceId) {
        return (
            <InvoicePaymentView 
                invoiceId={publicInvoiceId} 
                invoices={invoices} 
                onPaymentSuccess={handleUpdateInvoice} 
                onClose={() => {
                    window.location.hash = '';
                    setPublicInvoiceId(null);
                }} 
                userCountry={userCountry}
            />
        );
    }

    if (authStage === 'login') {
        return <LoginView onLoginSuccess={handleLoginSuccess} onBack={() => {}} onForgotPassword={() => setAuthStage('forgot-password')} onSignUpClick={() => setAuthStage('signup')} />;
    }

    if (authStage === 'forgot-password') {
        return <ForgotPasswordView onBack={() => setAuthStage('login')} onPasswordResetSuccess={() => setAuthStage('login')} />;
    }

    if (authStage === 'signup') {
        return <SignUpView onSignUpSuccess={() => setAuthStage('onboarding')} onLoginClick={() => setAuthStage('login')} />;
    }

    if (authStage === 'onboarding') {
        return <OnboardingView onComplete={() => setAuthStage('agreement')} />;
    }

    if (authStage === 'agreement') {
        return <AgentAgreementModal isOpen={true} onSign={() => {
            setAuthStage('dashboard');
        }} />;
    }

    const isDepartmentRole = ['cx-head', 'call-agent', 'sales-manager', 'support-staff', 'finance', 'marketing-manager', 'content-lead', 'customer-success'].includes(userRole);

    // --- MAIN APP DASHBOARD ---
    const renderView = () => {
        if (userRole === 'admin') {
            // Admin specific views
            switch(currentView) {
                case 'admin-ceo-dashboard': return <AdminCEODashboardView marketingExpenses={expenses.filter(e => e.marketingRelated && e.status === 'Approved').reduce((sum, e) => sum + e.amount, 0)} />;
                case 'admin-dashboard': return <AdminDashboardView />;
                case 'admin-users': return <AdminUsersView />;
                case 'admin-hr-center': return <AdminHRCenterView userRole={userRole} userDepartment={userDepartment} />;
                case 'admin-agents': return <AdminAgentsView />;
                case 'admin-managers': return <AdminManagersView />;
                case 'admin-leads': return <AdminLeadsView setView={setView} businesses={businesses} invoices={invoices} onAddInvoice={handleAddInvoice} onUpdateInvoice={handleUpdateInvoice} onAddNotification={handleAddNotification} userCountry={userCountry} />;
                case 'admin-customers': return <AdminCustomersView userRole={userRole} />;
                case 'admin-reports': return <AdminReportsView />;
                case 'admin-finance': return <AdminFinanceCenterView expenses={expenses} setExpenses={setExpenses} />;
                case 'admin-commissions': return <AdminCommissionsView />;
                case 'admin-complaints': return <AdminComplaintsView />;
                case 'admin-broadcasts': return <AdminBroadcastsView />;
                case 'admin-customer-success': return <AdminCustomerSuccessView />;
                case 'admin-app-tracking': return <AdminAppManagementView />;
                case 'admin-settings': return <AdminSettingsView />;
                case 'admin-resources': return <AdminResourceCenterView contentItems={contentItems} setContentItems={setContentItems} kbModules={kbModules} setKbModules={setKbModules} />;
                default: return <AdminDashboardView />;
            }
        } else if (userRole === 'manager') {
            // Manager specific views
            switch(currentView) {
                case 'manager-dashboard': return <ManagerDashboardView setView={setView} />;
                case 'manager-agents': return <ManagerAgentsView />;
                case 'manager-leads': return <ManagerLeadsView setView={setView} businesses={businesses} invoices={invoices} onAddInvoice={handleAddInvoice} onUpdateInvoice={handleUpdateInvoice} onAddNotification={handleAddNotification} userCountry={userCountry} />;
                case 'manager-performance': 
                    // Reuse PerformanceView but maybe we'll customize it later for managers
                    return <ManagerPerformanceView />; 
                case 'manager-leaderboard': return <ManagerLeaderboard />;
                case 'manager-earnings': return <ManagerEarningsView />;
                case 'manager-reports': return <ManagerReportsView />;
                case 'manager-profile': return <ProfileView />;
                default: return <ManagerDashboardView setView={setView} />;
            }
        } else if (userRole === 'team-lead' || ['cx-head', 'customer-success', 'sales-manager', 'marketing-manager', 'support-staff', 'finance', 'content-lead'].includes(userRole)) {
            // Team Lead / CX Head specific views
            const isCxEquivalent = ['cx-head', 'customer-success', 'sales-manager', 'marketing-manager', 'support-staff', 'finance', 'content-lead'].includes(userRole);
            switch(currentView) {
                case 'team-lead-dashboard': return isCxEquivalent ? <CXHeadDashboardView setView={setView} userRole={userRole} /> : <TeamLeadDashboardView setView={setView} />;
                case 'team-lead-my-team': return <ManagerAgentsView />; // My Team
                case 'team-lead-my-grades': return <EmployeeGradesRewardsView />;
                case 'team-lead-my-policies': return <EmployeePolicyView />;
                case 'team-lead-my-history': return <EmployeeHistoryView setView={setView} />;
                case 'policy': return <PolicyView />;
                case 'team-lead-my-profile': return isCxEquivalent ? <CXHeadProfileView setView={setView} userRole={userRole} initialTab="profile" /> : <EmployeeProfileView />;
                case 'team-lead-my-performance': return isCxEquivalent ? <CXHeadProfileView setView={setView} userRole={userRole} initialTab="performance" /> : <EmployeeProfileView />;
                case 'team-lead-customers': return <AdminCustomersView userRole={userRole} />;
                case 'team-lead-performance': return <AdminHRCenterView initialTab="performance" hideTabs={true} departmentFilter={userDepartment} userRole={userRole} userDepartment={userDepartment} />;
                case 'team-lead-success': return <AdminCustomerSuccessView />;
                case 'team-lead-knowledgebase': return <AdminResourceCenterView contentItems={contentItems} setContentItems={setContentItems} kbModules={kbModules} setKbModules={setKbModules} />;
                case 'team-lead-complaints': return <AdminComplaintsView />;
                case 'team-lead-permissions': return <AdminUsersView />;
                case 'team-lead-sales-data': return <AdminReportsView />;
                case 'team-lead-leads': return <AdminLeadsView setView={setView} businesses={businesses} invoices={invoices} onAddInvoice={handleAddInvoice} onUpdateInvoice={handleUpdateInvoice} onAddNotification={handleAddNotification} userCountry={userCountry} />;
                case 'team-lead-resources': return <AdminResourceCenterView contentItems={contentItems} setContentItems={setContentItems} kbModules={kbModules} setKbModules={setKbModules} />;
                case 'team-lead-finance': return <AdminFinanceCenterView expenses={expenses} setExpenses={setExpenses} />;
                case 'team-lead-commissions': return <AdminCommissionsView />;
                case 'team-lead-payroll': return <AdminHRCenterView userRole={userRole} userDepartment={userDepartment} />;
                default: return <TeamLeadDashboardView setView={setView} />;
            }
        } else if (isDepartmentRole) {
            switch(currentView) {
                case 'dashboard':
                case 'dept-dashboard': return userRole === 'call-agent' ? <CXHeadDashboardView setView={setView} userRole={userRole} /> : <EmployeeDashboardView setView={setView} />;
                case 'dept-performance': return userRole === 'call-agent' ? <CXHeadDashboardView setView={setView} userRole={userRole} /> : <AdminHRCenterView initialTab="performance" hideTabs={true} departmentFilter={userDepartment} userRole={userRole} userDepartment={userDepartment} />;
                case 'dept-team': return <ManagerAgentsView />;
                case 'dept-permissions': return <AdminUsersView />;
                case 'dept-customers': 
                    return userRole === 'call-agent' ? 
                        <BusinessesView setView={setView} businesses={businesses} setBusinesses={setBusinesses} complaints={complaints} onAddComplaint={handleAddComplaint} onUpdateComplaint={handleUpdateComplaint} onRegisterSuccess={handleRegisterBusiness} userCountry={userCountry} /> :
                        <AdminCustomersView userRole={userRole} />;
                case 'dept-success': return <AdminCustomerSuccessView />;
                case 'dept-knowledge': return <AdminResourceCenterView contentItems={contentItems} setContentItems={setContentItems} kbModules={kbModules} setKbModules={setKbModules} />;
                case 'dept-complaints': return <AdminComplaintsView />;
                case 'dept-leads': 
                    return userRole === 'call-agent' ? 
                        <LeadsView setView={setView} businesses={businesses} invoices={invoices} onAddInvoice={handleAddInvoice} onUpdateInvoice={handleUpdateInvoice} onAddNotification={handleAddNotification} initialTab="list" userCountry={userCountry} /> :
                        <AdminLeadsView setView={setView} businesses={businesses} invoices={invoices} onAddInvoice={handleAddInvoice} onUpdateInvoice={handleUpdateInvoice} onAddNotification={handleAddNotification} userCountry={userCountry} />;
                case 'dept-sales-data': return <AdminReportsView />;
                case 'dept-resources': return <AdminResourceCenterView contentItems={contentItems} setContentItems={setContentItems} kbModules={kbModules} setKbModules={setKbModules} />;
                case 'dept-finance': return <AdminFinanceCenterView expenses={expenses} setExpenses={setExpenses} />;
                case 'dept-commissions': return <AdminCommissionsView />;
                case 'policy': return <PolicyView />;
                case 'team-lead-my-profile': return <CXHeadProfileView setView={setView} userRole={userRole} initialTab="profile" />;
                case 'team-lead-my-performance': return <CXHeadProfileView setView={setView} userRole={userRole} initialTab="performance" />;
                case 'dept-payroll': return <AdminHRCenterView userRole={userRole} userDepartment={userDepartment} />;
                default: return userRole === 'call-agent' ? <CXHeadDashboardView setView={setView} userRole={userRole} /> : <AdminHRCenterView initialTab="performance" hideTabs={true} departmentFilter={userDepartment} userRole={userRole} userDepartment={userDepartment} />;
            }
        } else if (userRole === 'employee') {
            // Employee strictly only views their own performance
            switch(currentView) {
                case 'dashboard': return <EmployeeDashboardView setView={setView} />;
                case 'grades': return <EmployeeGradesRewardsView hideRewards={true} />;
                case 'policies': return <EmployeePolicyView />;
                case 'history': return <EmployeeHistoryView setView={setView} />;
                case 'leaderboard': return <EmployeeLeaderboardView />;
                case 'profile': return <EmployeeProfileView />;
                default: return <EmployeeDashboardView setView={setView} />;
            }
        } else {
            // Agent specific views
            switch(currentView) {
                case 'dashboard': return <DashboardView setView={setView} />;
                case 'businesses': return <BusinessesView setView={setView} businesses={businesses} setBusinesses={setBusinesses} complaints={complaints} onAddComplaint={handleAddComplaint} onUpdateComplaint={handleUpdateComplaint} onRegisterSuccess={handleRegisterBusiness} userCountry={userCountry} />;
                case 'tickets': return <TicketsView businesses={businesses} complaints={complaints} onAddComplaint={handleAddComplaint} onUpdateComplaint={handleUpdateComplaint} />;
                case 'trials': return <TrialsView setView={setView} onConvertTrial={handleConvertTrial} />;
                case 'leads': return <LeadsView setView={setView} businesses={businesses} invoices={invoices} onAddInvoice={handleAddInvoice} onUpdateInvoice={handleUpdateInvoice} onAddNotification={handleAddNotification} initialTab="list" userCountry={userCountry} />;
                case 'invoices': return <LeadsView setView={setView} businesses={businesses} invoices={invoices} onAddInvoice={handleAddInvoice} onUpdateInvoice={handleUpdateInvoice} onAddNotification={handleAddNotification} initialTab="invoices" userCountry={userCountry} />; 
                case 'upsell': return <UpsellView />;
                case 'earnings': return <EarningsView />;
                case 'performance': return <PerformanceView />;
                case 'profile': return <ProfileView />;
                case 'notifications': return <NotificationsView notifications={notifications} markAsRead={markAsRead} markAllAsRead={markAllAsRead} setView={setView} />;
                case 'knowledge': return <KnowledgeBaseView kbModules={kbModules} />;
                case 'content-hub': return <ContentHubView contentItems={contentItems} />;
                case 'policy': return <PolicyView />;
                case 'plans': 
                    const targetBiz = businesses.find(b => b.id === pendingBusinessId);
                    return <PlansView setView={setView} targetBusinessName={targetBiz?.name} onPlanSelect={handlePlanSelected} userCountry={userCountry} pendingBusiness={targetBiz} />;
                default: return <DashboardView setView={setView} />;
            }
        }
    };

    const getPageTitle = () => {
        if (userRole === 'admin') {
            switch(currentView) {
                case 'admin-ceo-dashboard': return { title: 'CEO Command Center', subtitle: 'Strategic Financial & Growth Dashboard' };
                case 'admin-dashboard': return { title: 'Admin Dashboard', subtitle: 'System Overview' };
                case 'admin-users': return { title: 'User Management', subtitle: 'Manage Agents & Managers' };
                case 'admin-hr-center': return { title: 'HR Center', subtitle: 'Advanced Employee Records & Biodata' };
                case 'admin-agents': return { title: 'Agent Management', subtitle: 'View & Manage Agents' };
                case 'admin-managers': return { title: 'Manager Oversight', subtitle: 'Regional Performance' };
                case 'admin-leads': return { title: 'Leads Management', subtitle: 'View and filter all platform leads' };
                case 'admin-customers': return { title: 'Customer Management', subtitle: 'View & Manage Customers' };
                case 'admin-reports': return { title: 'System Reports', subtitle: 'Performance Analytics' };
                case 'admin-finance': return { title: 'Finance Center', subtitle: 'Accounting & Expenses' };
                case 'admin-commissions': return { title: 'Commissions', subtitle: 'Manage Payouts' };
                case 'admin-complaints': return { title: 'Complaints', subtitle: 'Resolve Issues' };
                case 'admin-broadcasts': return { title: 'Broadcasts', subtitle: 'Manage Notifications & Multichannel Campaigns' };
                case 'admin-customer-success': return { title: 'Customer Success', subtitle: 'Manage SaaS Retention & Health' };
                case 'admin-resources': return { title: 'Resource Center', subtitle: 'Manage sales & marketing materials and Knowledge Base' };
                case 'admin-settings': return { title: 'Settings', subtitle: 'System Configuration' };
                default: return { title: 'Admin Panel', subtitle: 'Welcome Administrator' };
            }
        } else if (userRole === 'manager') {
            switch(currentView) {
                case 'manager-dashboard': return { title: 'Dashboard', subtitle: 'Lagos State Manager' };
                case 'manager-agents': return { title: 'Agent Management', subtitle: 'Track and manage your team' };
                case 'manager-leaderboard': return { title: 'State Rankings', subtitle: 'Compare with other states' };
                case 'manager-earnings': return { title: 'Earnings & Wallet', subtitle: 'Track commissions and payouts' };
                case 'manager-reports': return { title: 'Advanced Reports', subtitle: 'Detailed analytics & insights' };
                case 'manager-profile': return { title: 'Manager Profile', subtitle: 'Your account settings' };
                default: return { title: 'Manager Portal', subtitle: 'Lagos State' };
            }
        } else if (userRole === 'team-lead' || ['cx-head', 'customer-success', 'sales-manager', 'marketing-manager', 'support-staff', 'finance', 'content-lead'].includes(userRole)) {
            switch(currentView) {
                case 'team-lead-dashboard': return { title: 'Dashboard', subtitle: 'Overview of your performance' };
                case 'team-lead-my-team': return { title: 'My Team', subtitle: 'Employees in your team' };
                case 'team-lead-my-grades': return { title: 'Grades & Rewards', subtitle: 'View your progression and rewards' };
                case 'team-lead-my-policies': return { title: 'Policies & Rewards', subtitle: 'Company guidelines and policies' };
                case 'team-lead-my-history': return { title: 'History', subtitle: 'Your past activities and metrics' };
                case 'team-lead-my-profile': return { title: 'My Profile', subtitle: 'Keep your records up to date — HR sees these on your employee bio.' };
                case 'team-lead-my-performance': return { title: 'Performance', subtitle: 'View grades and points ledger' };
                case 'team-lead-customers': return { title: 'Customers', subtitle: 'Customer Overview' };
                case 'team-lead-performance': return { title: 'Team Performance', subtitle: 'Metrics and Analytics' };
                case 'team-lead-success': return { title: 'Customer Success', subtitle: 'Retention and Health' };
                case 'team-lead-knowledgebase': return { title: 'Knowledge Base', subtitle: 'Resource materials' };
                case 'team-lead-complaints': return { title: 'Complaints', subtitle: 'Support requests' };
                case 'team-lead-permissions': return { title: 'Permissions', subtitle: 'Role and view access' };
                case 'team-lead-sales-data': return { title: 'Sales Data', subtitle: 'Detailed sales analytics' };
                case 'team-lead-leads': return { title: 'All Leads', subtitle: 'Manage leads and conversions' };
                case 'team-lead-resources': return { title: 'Resource Center', subtitle: 'Sales resources and materials' };
                case 'team-lead-finance': return { title: 'Finance Center', subtitle: 'Accounting & Expenses' };
                case 'team-lead-commissions': return { title: 'Commissions', subtitle: 'Manage Payouts' };
                case 'team-lead-payroll': return { title: 'Payroll', subtitle: 'Salary Management' };
                default: return { title: 'Team Lead', subtitle: 'Workspace' };
            }
        } else if (isDepartmentRole) {
            switch(currentView) {
                case 'dashboard':
                case 'dept-dashboard': return { title: 'Dashboard', subtitle: 'Overview of your performance' };
                case 'dept-performance': return { title: 'Performance', subtitle: 'Department Metrics' };
                case 'dept-team': return { title: 'Team Management', subtitle: 'Manage Employees' };
                case 'dept-permissions': return { title: 'Permissions', subtitle: 'Role Access' };
                case 'dept-customers': return { title: 'Customers', subtitle: 'Manage Customers' };
                case 'dept-success': return { title: 'Customer Success', subtitle: 'Retention & Health' };
                case 'dept-knowledge': return { title: 'Knowledge Base', subtitle: 'Resource materials' };
                case 'dept-complaints': return { title: 'Complaints', subtitle: 'Support Requests' };
                case 'dept-leads': return { title: 'Leads', subtitle: 'Manage Leads' };
                case 'dept-sales-data': return { title: 'Sales Data', subtitle: 'Analytics & Insights' };
                case 'dept-resources': return { title: 'Resource Center', subtitle: 'Materials & Assets' };
                case 'dept-finance': return { title: 'Finance Center', subtitle: 'Accounting' };
                case 'dept-commissions': return { title: 'Commissions', subtitle: 'Payouts' };
                case 'dept-payroll': return { title: 'Payroll', subtitle: 'Salary Management' };
                case 'team-lead-my-profile': return { title: 'My Profile', subtitle: 'Keep your records up to date — HR sees these on your employee bio.' };
                case 'team-lead-my-performance': return { title: 'Performance', subtitle: 'View grades and points ledger' };
                default: return { title: 'Workspace', subtitle: 'Department Overview' };
            }
        } else if (userRole === 'employee') {
            switch(currentView) {
                case 'dashboard': return { title: 'Dashboard', subtitle: 'Overview of your performance' };
                case 'grades': return { title: 'Grades & Rewards', subtitle: 'View your progression and rewards' };
                case 'policies': return { title: 'Policies & Rewards', subtitle: 'Company guidelines and policies' };
                case 'history': return { title: 'History', subtitle: 'Your past activities and metrics' };
                case 'leaderboard': return { title: 'Leaderboard', subtitle: 'Ranked by Reward Points — celebrating extra-mile achievements' };
                case 'profile': return { title: 'My Profile', subtitle: 'Manage your personal details' };
                default: return { title: 'Employee Portal', subtitle: 'Welcome back' };
            }
        } else {
            // Existing agent titles...
            switch(currentView) {
                case 'dashboard': return { title: 'Agent Dashboard', subtitle: 'Overview of your performance and portfolio' };
                case 'businesses': return { title: 'Business Portfolio', subtitle: 'Manage your client base' };
                case 'tickets': return { title: 'Support Tickets', subtitle: 'Track and resolve client complaints' };
                case 'trials': return { title: 'Free Trials', subtitle: 'Convert trial users to paid customers' };
                case 'leads': return { title: 'Lead Management', subtitle: 'Track and onboard new prospects' };
                case 'invoices': return { title: 'Invoices', subtitle: 'Manage payments and billing' };
                case 'upsell': return { title: 'Upsell Opportunities', subtitle: 'AI-driven revenue growth suggestions' };
                case 'earnings': return { title: 'My Earnings', subtitle: 'Track commissions and payouts' };
                case 'performance': return { title: 'Performance Analytics', subtitle: 'Detailed sales metrics and trends' };
                case 'profile': return { title: 'My Profile', subtitle: 'Manage your personal details and settings' };
                case 'notifications': return { title: 'Notifications', subtitle: 'Stay updated with your activities' };
                case 'knowledge': return { title: 'Knowledge Base', subtitle: 'Self-improvement and support resources' };
                case 'content-hub': return { title: 'Content Hub', subtitle: 'Marketing materials, videos, and resources' };
                case 'policy': return { title: 'Policy & Violations', subtitle: 'Compliance guidelines and account status' };
                case 'plans': return { title: 'Select Plan', subtitle: 'Choose a subscription plan for the business' };
                default: return { title: 'Prokip Agent', subtitle: 'Welcome back' };
            }
        }
    };

    // ... (existing auth flow handling)

    // --- MAIN APP DASHBOARD ---
    const { title, subtitle } = getPageTitle();

    return (
        <div className="flex flex-col lg:flex-row h-screen w-full bg-slate-50 relative">
            {/* Welcome Bonus Modal Overlay */}
            <WelcomeBonusModal isOpen={showWelcomeBonus} onClose={() => setShowWelcomeBonus(false)} />

            {userRole === 'admin' ? (
                <AdminSidebar 
                    currentView={currentView} 
                    setView={setView} 
                    isMobileMenuOpen={isMobileMenuOpen} 
                    setIsMobileMenuOpen={setIsMobileMenuOpen} 
                    logout={handleLogout}
                />
            ) : userRole === 'manager' ? (
                <ManagerSidebar 
                    currentView={currentView} 
                    setView={setView} 
                    isMobileMenuOpen={isMobileMenuOpen} 
                    setIsMobileMenuOpen={setIsMobileMenuOpen} 
                    logout={handleLogout}
                />
            ) : (userRole === 'team-lead' || ['cx-head', 'customer-success', 'sales-manager', 'marketing-manager', 'support-staff', 'finance', 'content-lead'].includes(userRole)) ? (
                <TeamLeadSidebar 
                    currentView={currentView} 
                    setView={setView} 
                    isMobileMenuOpen={isMobileMenuOpen} 
                    setIsMobileMenuOpen={setIsMobileMenuOpen} 
                    logout={handleLogout}
                    userRole={userRole}
                />
            ) : isDepartmentRole ? (
                <DepartmentSidebar
                    userRole={userRole}
                    currentView={currentView} 
                    setView={setView} 
                    isMobileMenuOpen={isMobileMenuOpen} 
                    setIsMobileMenuOpen={setIsMobileMenuOpen} 
                    logout={handleLogout}
                />
            ) : (
                <Sidebar 
                    userRole={userRole}
                    currentView={currentView} 
                    setView={setView} 
                    isMobileMenuOpen={isMobileMenuOpen} 
                    setIsMobileMenuOpen={setIsMobileMenuOpen} 
                />
            )}
            
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                <Header 
                    title={title} 
                    subtitle={subtitle} 
                    setView={setView} 
                    unreadCount={notifications.filter(n => !n.read).length}
                    notifications={notifications}
                    markAsRead={markAsRead}
                    markAllAsRead={markAllAsRead}
                    toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    userRole={userRole}
                    currentView={currentView}
                />
                <main className="flex-1 overflow-y-auto no-scrollbar pb-36 lg:pb-0 pt-4 lg:pt-0">
                    {renderView()}
                </main>
            </div>
        </div>
    );
}

export default function App() {
    return (
        <AlertProvider>
            <AgentApp />
        </AlertProvider>
    );
}
