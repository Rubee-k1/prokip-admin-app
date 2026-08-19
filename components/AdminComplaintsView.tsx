import React, { useState } from 'react';
import { useAlert } from '../contexts/AlertContext';

interface CustomerContact {
    name: string;
    email: string;
}

interface TicketComment {
    senderRole: string;
    senderName: string;
    text: string;
    createdAt: string;
    isEmail?: boolean;
    recipientEmail?: string;
}

interface SupportTicket {
    id: string;
    customer: CustomerContact;
    businessName?: string;
    brmName?: string;
    stateManager?: string;
    attachments?: string[];
    tags?: string[];
    subject: string;
    description: string;
    assignedStaff: string | null;
    createdBy:string; // "Customer", or Admin name
    category: string;
    priority: 'Urgent' | 'High' | 'Medium' | 'Low';
    status: 'Open' | 'In Progress' | 'Awaiting Reply' | 'Resolved' | 'Closed';
    createdAt: string;
    updatedAt: string;
    ticketType?: 'Customer' | 'BRM' | 'State Manager' | 'Partner';
    targetName?: string;
    escalated?: boolean;
    escalatedTo?: string;
    escalationReason?: string;
    comments?: TicketComment[];
    autoEmailSent?: boolean;
    autoEmailSentStatus?: 'Sent' | 'Failed' | 'Not Sent';
}

interface DirectEmail {
    id: string;
    recipientName: string;
    recipientEmail: string;
    subject: string;
    body: string;
    sentAt: string;
    isBulk?: boolean;
}

const SearchableSelect: React.FC<{
    options: string[], 
    placeholder?: string, 
    name: string, 
    id?: string,
    onSelect?: (val: string) => void
}> = ({ options, placeholder, name, id, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');

    const filteredOptions = options.filter(opt => opt.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="relative">
            <input type="hidden" name={name} value={search} />
            <input 
                type="text"
                id={id}
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value);
                    setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                className="w-full p-2.5 border border-slate-300 hover:border-slate-400 rounded-lg text-xs text-slate-800 bg-white focus:outline-none focus:border-[#02275A] focus:ring-2 focus:ring-[#02275A]/20 transition-all pr-8" 
                placeholder={placeholder}
            />
            <span className="absolute right-3 top-2.5 text-slate-400 pointer-events-none flex items-center h-5">
                <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'} text-xs`}></i>
            </span>
            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((opt, i) => (
                            <div 
                                key={i}
                                onMouseDown={(e) => {
                                    // Use onMouseDown instead of onClick to fire before onBlur
                                    e.preventDefault();
                                    setSearch(opt);
                                    setIsOpen(false);
                                    if(onSelect) onSelect(opt);
                                }}
                                className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"
                            >
                                {opt}
                            </div>
                        ))
                    ) : (
                        <div className="px-4 py-2 text-sm text-slate-400 italic bg-white">Press enter or tab to use "{search}"</div>
                    )}
                </div>
            )}
        </div>
    );
};

interface AdminComplaintsViewProps {
    userRole?: string;
}

const AdminComplaintsView: React.FC<AdminComplaintsViewProps> = ({ userRole = 'admin' }) => {
    const { showSuccess, showWarning } = useAlert();
    const [activeTab, setActiveTab] = useState<'tickets' | 'analytics' | 'inbox' | 'notifications'>('tickets');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    // Support Ticket Inbox States
    const [selectedInboxTicketId, setSelectedInboxTicketId] = useState<string | null>(null);
    const [searchInboxQuery, setSearchInboxQuery] = useState('');
    const [inboxFilter, setInboxFilter] = useState<'all' | 'unread' | 'Urgent' | 'High' | 'Medium' | 'Low'>('all');
    const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]); // holds Ticket IDs for bulk action
    const [inboxSubjectInput, setInboxSubjectInput] = useState('');
    const [inboxEmailBody, setInboxEmailBody] = useState('');
    const [bulkSubject, setBulkSubject] = useState('');
    const [bulkBody, setBulkBody] = useState('');
    const [cmtType, setCmtType] = useState<'note' | 'email'>('note');
    const [inboxStaffFilter, setInboxStaffFilter] = useState('All');
    const [inboxDatePreset, setInboxDatePreset] = useState('All');
    const [inboxDateFrom, setInboxDateFrom] = useState('');
    const [inboxDateTo, setInboxDateTo] = useState('');

    // Performance Reports Date States
    const [analyticsDatePreset, setAnalyticsDatePreset] = useState('Last 7 Days');
    const [analyticsCustomFrom, setAnalyticsCustomFrom] = useState('');
    const [analyticsCustomTo, setAnalyticsCustomTo] = useState('');

    // Refined Inbox States
    const [directEmails, setDirectEmails] = useState<DirectEmail[]>([
        {
            id: 'EML-001',
            recipientName: 'Kano Fabrics',
            recipientEmail: 'sales@kanofabrics.ng',
            subject: 'Partnership Onboarding Welcome',
            body: 'Hello Team,\n\nWelcome to our platform! This email contains the login links and instructions for setting up your fabric supply dashboard. Let us know if you need any assistance.\n\nBest regards,\nService Ops Team',
            sentAt: 'Jul 05, 2026, 09:30 AM'
        },
        {
            id: 'EML-002',
            recipientName: 'Delta Transports',
            recipientEmail: 'info@deltatrans.com',
            subject: 'Scheduled Maintenance Advisory',
            body: 'Dear Delta Transports,\n\nPlease be informed that our core routing APIs will undergo brief maintenance this weekend. Service disruptions are expected to be under 10 minutes.\n\nThank you for your cooperation.\nTech Support Staff',
            sentAt: 'Jul 06, 2026, 04:15 PM'
        },
        {
            id: 'EML-003',
            recipientName: 'All Customers',
            recipientEmail: 'all-customers@system.broadcast',
            subject: 'New Service Features Released!',
            body: 'Dear Valued Customers,\n\nWe are excited to announce major UI upgrades and bulk email dispatch capabilities in our support hub! Managing your requests is now easier than ever.\n\nThank you for choosing us.\nSystem Administration',
            sentAt: 'Jul 07, 2026, 08:00 AM',
            isBulk: true
        }
    ]);
    const [selectedDirectEmailId, setSelectedDirectEmailId] = useState<string | null>(null);
    const [inboxSubTab, setInboxSubTab] = useState<'tickets' | 'direct'>('tickets');
    const [composeMode, setComposeMode] = useState<boolean>(false);
    
    // Compose Form States
    const [composeRecipientType, setComposeRecipientType] = useState<'individual' | 'all' | 'bulk'>('individual');
    const [composeRecipientEmail, setComposeRecipientEmail] = useState('');
    const [composeRecipientName, setComposeRecipientName] = useState('');
    const [composeSubject, setComposeSubject] = useState('');
    const [composeBody, setComposeBody] = useState('');
    const [composeLinkedTicketId, setComposeLinkedTicketId] = useState<string>('');

    // Escalation & Detail Modal States
    const [escalateTicket, setEscalateTicket] = useState<SupportTicket | null>(null);
    const [viewTicket, setViewTicket] = useState<SupportTicket | null>(null);
    const [escalateDestination, setEscalateDestination] = useState<string>('Head of Customer Experience');
    const [escalationNote, setEscalationNote] = useState<string>('');
    
    // Comments & Notifications States
    const [newCommentText, setNewCommentText] = useState('');
    const [selectedTicketIds, setSelectedTicketIds] = useState<string[]>([]);
    const [bulkAssignee, setBulkAssignee] = useState<string>('');

    const handleSendIndividualEmail = (ticketId: string, subject: string, body: string) => {
        if (!body.trim()) return;
        const ticket = tickets.find(t => t.id === ticketId);
        if (!ticket) return;

        const emailComment: TicketComment = {
            senderRole: userRole,
            senderName: userRole === 'support-staff' ? 'Tech Support Staff' : 'System Support',
            text: `📧 [Sent Email to ${ticket.customer.email}]\nSubject: ${subject || 'Support Ticket Update'}\n\n${body}`,
            createdAt: new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true, month: 'short', day: 'numeric', year: 'numeric' }),
            isEmail: true,
            recipientEmail: ticket.customer.email
        };

        const updatedComments = [...(ticket.comments || []), emailComment];
        setTickets(prev => prev.map(t => t.id === ticketId ? {
            ...t,
            comments: updatedComments,
            status: 'Awaiting Reply',
            updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        } : t));

        addLocalSupportNotification({
            ticketId,
            title: 'Email Sent to Customer',
            message: `Official email dispatched to ${ticket.customer.email}`,
            type: 'success'
        });

        showSuccess(`Email successfully sent to customer at ${ticket.customer.email}`);
    };

    const handleSendBulkEmail = (ticketIds: string[], subject: string, body: string) => {
        if (!body.trim() || !subject.trim() || ticketIds.length === 0) return;

        let sentCount = 0;
        setTickets(prev => prev.map(t => {
            if (ticketIds.includes(t.id)) {
                sentCount++;
                const emailComment: TicketComment = {
                    senderRole: userRole,
                    senderName: userRole === 'support-staff' ? 'Tech Support Staff' : 'System Support',
                    text: `📧 [Bulk Broadcast Email Sent]\nSubject: ${subject}\n\n${body}`,
                    createdAt: new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true, month: 'short', day: 'numeric', year: 'numeric' }),
                    isEmail: true,
                    recipientEmail: t.customer.email
                };
                return {
                    ...t,
                    comments: [...(t.comments || []), emailComment],
                    status: 'Awaiting Reply',
                    updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                };
            }
            return t;
        }));

        showSuccess(`Bulk broadcast compiled successfully! Sent emails to ${sentCount} customers.`);
    };

    const handleBulkAssign = (staffName: string) => {
        if (!staffName || selectedTicketIds.length === 0) return;
        
        setTickets(tickets.map(t => {
            if (selectedTicketIds.includes(t.id)) {
                return {
                    ...t,
                    assignedStaff: staffName,
                    status: t.status === 'Open' ? 'In Progress' : t.status,
                    updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                };
            }
            return t;
        }));

        selectedTicketIds.forEach(id => {
            addLocalSupportNotification({
                ticketId: id,
                title: 'Ticket Bulk Assigned',
                message: `Ticket #${id} has been bulk assigned to ${staffName}.`,
                type: 'info'
            });
        });

        // If the view ticket is currently open and updated, sync it
        if (viewTicket && selectedTicketIds.includes(viewTicket.id)) {
            setViewTicket(prev => prev ? {
                ...prev,
                assignedStaff: staffName,
                status: prev.status === 'Open' ? 'In Progress' : prev.status,
                updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            } : null);
        }

        showSuccess(`Bulk assigned ${selectedTicketIds.length} tickets to ${staffName}`);
        setSelectedTicketIds([]);
        setBulkAssignee('');
    };

    const [supportNotifications, setSupportNotifications] = useState<Array<{
        id: string;
        ticketId: string;
        title: string;
        message: string;
        type: 'info' | 'success' | 'warning' | 'error';
        createdAt: string;
        read: boolean;
    }>>([
        {
            id: 'sn-1',
            ticketId: 'TKT-2023-001',
            title: 'High Priority Unassigned Ticket',
            message: 'A new ticket "Login Issues on Web Portal" has been submitted under category Technical Issue.',
            type: 'warning',
            createdAt: 'Oct 25, 2023, 10:00 AM',
            read: false
        },
        {
            id: 'sn-2',
            ticketId: 'TKT-2023-002',
            title: 'Urgent Billing Complaint Escalated',
            message: 'Ticket "Billing Error - Charged Twice" escalated to Technical Support Team.',
            type: 'error',
            createdAt: 'Oct 26, 2023, 11:15 AM',
            read: true
        }
    ]);

    const addLocalSupportNotification = ({ ticketId, title, message, type }: { ticketId: string, title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' }) => {
        const newNotif = {
            id: `sn-${Date.now()}`,
            ticketId,
            title,
            message,
            type,
            createdAt: new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true, month: 'short', day: 'numeric', year: 'numeric' }),
            read: false
        };
        setSupportNotifications(prev => [newNotif, ...prev]);
    };

    const handleAddComment = () => {
        if (!newCommentText.trim() || !viewTicket) return;
        
        const newComment: TicketComment = {
            senderRole: userRole,
            senderName: userRole === 'admin' ? 'System Admin' : 
                        userRole === 'cx-head' ? 'Head of CX' : 
                        userRole === 'support-staff' ? 'Tech Support Staff' : 
                        userRole === 'team-lead' ? 'Team Lead' : 'Support Agent',
            text: newCommentText.trim(),
            createdAt: new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true, month: 'short', day: 'numeric', year: 'numeric' })
        };

        const updatedComments = [...(viewTicket.comments || []), newComment];
        
        setTickets(tickets.map(t => t.id === viewTicket.id ? { 
            ...t, 
            comments: updatedComments,
            updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        } : t));

        setViewTicket({ 
            ...viewTicket, 
            comments: updatedComments,
            updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        });
        
        addLocalSupportNotification({
            ticketId: viewTicket.id,
            title: 'New Comment Posted',
            message: `${newComment.senderName} commented on Ticket #${viewTicket.id}: "${newComment.text.slice(0, 45)}..."`,
            type: 'info'
        });

        setNewCommentText('');
        showSuccess('Comment added successfully!');
    };

    // Mock Data
    const [businessListData] = useState([
        { name: 'Lagos Logistics', email: 'admin@lagoslog.com', cname: 'Mr. Lagos' },
        { name: 'Kano Fabrics', email: 'sales@kanofabrics.ng', cname: 'Mrs. Kano' },
        { name: 'Abuja Wares', email: 'hello@abujawares.com', cname: 'Mr. Abuja' },
        { name: 'Okafor Hardware', email: 'okafor@mail.com', cname: 'John Okafor' },
        { name: 'Delta Transports', email: 'info@deltatrans.com', cname: 'Jane Delta' },
        { name: 'Eko Bakeries', email: 'contact@ekobakeries.com', cname: 'Tom Eko' }
    ]);
    const businessList = businessListData.map(b => b.name);
    
    const [brmList] = useState(['Michael Johnson', 'Sarah Adams', 'David Okeke', 'Tola Alabi']);
    const [stateManagerList] = useState(['Ahmed Bello', 'Chioma Eze', 'Samuel Peters']);
    const [partnerList] = useState(['Zenith Bank Partner', 'Moniepoint Agent Network', 'Paystack Merchant Service', 'Hubone Tech Hub', 'Konga Retail Group']);
    const [supportStaffList] = useState(['Sarah O.', 'Mike T.', 'John D.', 'Emily W.']);

    const [newTags, setNewTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    
    const [selectedType, setSelectedType] = useState<'Customer' | 'BRM' | 'State Manager' | 'Partner'>('Customer');
    const [customerNameInput, setCustomerNameInput] = useState('');
    const [customerEmailInput, setCustomerEmailInput] = useState('');
    const [attachments, setAttachments] = useState<File[]>([]);

    const [tickets, setTickets] = useState<SupportTicket[]>([
        { 
            id: 'TKT-2023-001', 
            customer: { name: 'Lagos Logistics', email: 'admin@lagoslog.com' }, 
            subject: 'Login Issues on Web Portal', 
            description: 'Cannot login since yesterday.', 
            assignedStaff: 'Sarah O.', 
            createdBy: 'Customer', 
            category: 'Technical Issue', 
            priority: 'High', 
            status: 'In Progress', 
            createdAt: 'Oct 25, 2023', 
            updatedAt: 'Oct 26, 2023', 
            ticketType: 'Customer', 
            targetName: 'Lagos Logistics',
            tags: ['Login', 'Bug'],
            comments: [
                { senderRole: 'Customer', senderName: 'Mr. Lagos', text: 'Still unable to log in, getting 403 error.', createdAt: 'Oct 25, 2023, 10:14 AM' },
                { senderRole: 'support-staff', senderName: 'Sarah O.', text: 'Checking Server Logs, looks like an expired token refresh issue.', createdAt: 'Oct 25, 2023, 11:30 AM' }
            ]
        },
        { 
            id: 'TKT-2023-042', 
            customer: { name: 'Lagos Logistics', email: 'admin@lagoslog.com' }, 
            subject: 'Invoice Discrepancy', 
            priority: 'Medium', 
            status: 'Open', 
            category: 'Billing', 
            description: 'Oct invoice shows wrong tax amount.', 
            assignedStaff: 'Mike T.', 
            createdBy: 'Customer', 
            createdAt: 'Oct 25, 2023', 
            updatedAt: 'Oct 25, 2023', 
            ticketType: 'Customer', 
            targetName: 'Lagos Logistics',
            tags: ['Billing', 'Invoice'],
            comments: []
        },
        { 
            id: 'TKT-2023-112', 
            customer: { name: 'Michael Johnson', email: 'michael@prokip.com' }, 
            subject: 'Incentive Payout Issue', 
            description: 'Monthly commission for Abuja territory has not reflected on the balance sheet.', 
            assignedStaff: 'Sarah O.', 
            createdBy: 'BRM', 
            category: 'Billing', 
            priority: 'High', 
            status: 'Open', 
            createdAt: 'Nov 2, 2023', 
            updatedAt: 'Nov 2, 2023', 
            ticketType: 'BRM', 
            targetName: 'Michael Johnson', 
            brmName: 'Michael Johnson',
            tags: ['Commission', 'Billing'],
            comments: []
        },
        { 
            id: 'TKT-2023-305', 
            customer: { name: 'Ahmed Bello', email: 'ahmed@prokip.com' }, 
            subject: 'Regional Portal Slowdown', 
            description: 'The state dashboard is loading slower than usual during peak hours.', 
            assignedStaff: null, 
            createdBy: 'State Manager', 
            category: 'Technical Issue', 
            priority: 'Low', 
            status: 'In Progress', 
            createdAt: 'Nov 12, 2023', 
            updatedAt: 'Nov 13, 2023', 
            ticketType: 'State Manager', 
            targetName: 'Ahmed Bello', 
            stateManager: 'Ahmed Bello',
            tags: ['Performance', 'Subsystem'],
            comments: []
        },
        { 
            id: 'TKT-2023-002', 
            customer: { name: 'Kano Fabrics', email: 'sales@kanofabrics.ng' }, 
            subject: 'Billing Error - Charged Twice', 
            description: 'My card was charged twice for the basic plan.', 
            assignedStaff: 'Mike T.', 
            createdBy: 'Customer', 
            category: 'Billing', 
            priority: 'Urgent', 
            status: 'Open', 
            createdAt: 'Oct 26, 2023', 
            updatedAt: 'Oct 26, 2023', 
            ticketType: 'Customer', 
            targetName: 'Kano Fabrics',
            tags: ['Billing', 'Payment'],
            escalated: true,
            escalatedTo: 'Head of Customer Experience',
            escalationReason: 'Customer card was double-charged on basic plan payment transition, requires refund action.',
            comments: []
        },
        { 
            id: 'TKT-2023-003', 
            customer: { name: 'Abuja Wares', email: 'hello@abujawares.com' }, 
            subject: 'How to add new agents?', 
            description: 'I want to add 3 more agents to my team.', 
            assignedStaff: null, 
            createdBy: 'Admin (System)', 
            category: 'General Query', 
            priority: 'Low', 
            status: 'Open', 
            createdAt: 'Oct 27, 2023', 
            updatedAt: 'Oct 27, 2023', 
            ticketType: 'Customer', 
            targetName: 'Abuja Wares',
            tags: ['Onboarding', 'Documentation'],
            comments: []
        },
        { 
            id: 'TKT-2023-004', 
            customer: { name: 'Okafor Hardware', email: 'okafor@mail.com' }, 
            subject: 'Feature Request: POS integration', 
            description: 'Would love to see integrated POS.', 
            assignedStaff: 'John D.', 
            createdBy: 'Customer', 
            category: 'Feedback', 
            priority: 'Medium', 
            status: 'Resolved', 
            createdAt: 'Oct 20, 2023', 
            updatedAt: 'Oct 22, 2023', 
            ticketType: 'Customer', 
            targetName: 'Okafor Hardware',
            tags: ['Feature Request', 'Integration'],
            comments: []
        },
    ]);

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [priorityFilter, setPriorityFilter] = useState('All');
    const [staffFilter, setStaffFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');
    const [escalatedFilter, setEscalatedFilter] = useState<string>('All');
    const [tagFilter, setTagFilter] = useState<string>('All');
    const [datePresetFilter, setDatePresetFilter] = useState('All');
    const [dateFromFilter, setDateFromFilter] = useState('');
    const [dateToFilter, setDateToFilter] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 3;

    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter, priorityFilter, staffFilter, typeFilter, escalatedFilter, tagFilter, activeTab, datePresetFilter, dateFromFilter, dateToFilter]);

    const handleAssignStaff = (id: string, staffName: string) => {
        setTickets(tickets.map(t => t.id === id ? { ...t, assignedStaff: staffName, status: t.status === 'Open' ? 'In Progress' : t.status } : t));
        if (viewTicket && viewTicket.id === id) {
            setViewTicket(prev => prev ? {
                ...prev,
                assignedStaff: staffName,
                status: prev.status === 'Open' ? 'In Progress' : prev.status
            } : null);
        }
        showSuccess(`Ticket ${id} assigned to ${staffName}.`);
    };

    const handleStatusChange = (id: string, newStatus: any) => {
        setTickets(tickets.map(t => t.id === id ? { ...t, status: newStatus } : t));
        showSuccess(`Ticket ${id} status updated to ${newStatus}.`);
    };

    const filteredTickets = tickets.filter(t => {
        const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
        const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;
        const matchesType = typeFilter === 'All' || (t.ticketType || 'Customer') === typeFilter;
        const matchesStaff = staffFilter === 'All' ? true : 
                             staffFilter === 'Unassigned' ? t.assignedStaff === null : 
                             t.assignedStaff === staffFilter;
        const matchesSearch = t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              t.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              ((t.ticketType || 'Customer').toLowerCase().includes(searchQuery.toLowerCase())) ||
                              (t.assignedStaff && t.assignedStaff.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesEscalated = escalatedFilter === 'All' ? true :
                                 escalatedFilter === 'Yes' ? !!t.escalated :
                                 !t.escalated;
        const matchesTag = tagFilter === 'All' ? true :
                           !!(t.tags && t.tags.includes(tagFilter));

        let matchesDate = true;
        if (t.createdAt) {
            const ticketDate = new Date(t.createdAt);
            if (!isNaN(ticketDate.getTime())) {
                const now = new Date();
                if (datePresetFilter === 'Last 7 Days') {
                    const sevenDaysAgo = new Date();
                    sevenDaysAgo.setDate(now.getDate() - 7);
                    sevenDaysAgo.setHours(0, 0, 0, 0);
                    matchesDate = ticketDate >= sevenDaysAgo;
                } else if (datePresetFilter === 'Last 30 Days') {
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(now.getDate() - 30);
                    thirtyDaysAgo.setHours(0, 0, 0, 0);
                    matchesDate = ticketDate >= thirtyDaysAgo;
                } else if (datePresetFilter === 'This Month') {
                    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
                    matchesDate = ticketDate >= monthStart;
                } else if (datePresetFilter === 'Custom') {
                    if (dateFromFilter) {
                        const fromDate = new Date(dateFromFilter);
                        fromDate.setHours(0, 0, 0, 0);
                        if (ticketDate < fromDate) {
                            matchesDate = false;
                        }
                    }
                    if (dateToFilter) {
                        const toDate = new Date(dateToFilter);
                        toDate.setHours(23, 59, 59, 999);
                        if (ticketDate > toDate) {
                            matchesDate = false;
                        }
                    }
                }
            } else {
                matchesDate = false;
            }
        }

         return matchesStatus && matchesPriority && matchesType && matchesStaff && matchesSearch && matchesEscalated && matchesTag && matchesDate;
    });

    const totalItems = filteredTickets.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const paginatedTickets = filteredTickets.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const allUniqueTags = Array.from(new Set(tickets.flatMap(t => t.tags || []))).filter(Boolean).sort();

    const analyticsTickets = tickets.filter(t => {
        if (!t.createdAt) return true;
        const ticketDate = new Date(t.createdAt);
        if (isNaN(ticketDate.getTime())) return true;
        const now = new Date();

        if (analyticsDatePreset === 'Last 7 Days') {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(now.getDate() - 7);
            sevenDaysAgo.setHours(0, 0, 0, 0);
            return ticketDate >= sevenDaysAgo;
        } else if (analyticsDatePreset === 'Last 30 Days') {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(now.getDate() - 30);
            thirtyDaysAgo.setHours(0, 0, 0, 0);
            return ticketDate >= thirtyDaysAgo;
        } else if (analyticsDatePreset === 'This Month') {
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
            return ticketDate >= monthStart;
        } else if (analyticsDatePreset === 'Custom') {
            let match = true;
            if (analyticsCustomFrom) {
                const fromDate = new Date(analyticsCustomFrom);
                fromDate.setHours(0, 0, 0, 0);
                if (ticketDate < fromDate) {
                    match = false;
                }
            }
            if (analyticsCustomTo) {
                const toDate = new Date(analyticsCustomTo);
                toDate.setHours(23, 59, 59, 999);
                if (ticketDate > toDate) {
                    match = false;
                }
            }
            return match;
        }
        return true;
    });

    const totalTickets = analyticsTickets.length;
    const openTickets = analyticsTickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length;
    const resolvedTickets = analyticsTickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;

    const pCounts = {
        Low: analyticsTickets.filter(t => t.priority === 'Low').length,
        Medium: analyticsTickets.filter(t => t.priority === 'Medium').length,
        High: analyticsTickets.filter(t => t.priority === 'High').length,
        Urgent: analyticsTickets.filter(t => t.priority === 'Urgent').length,
    };
    const pTotal = Object.values(pCounts).reduce((a, b) => a + b, 0) || 1;
    const pMax = Math.max(...Object.values(pCounts), 1);

    const catCounts: { [key: string]: number } = {};
    analyticsTickets.forEach(t => {
        const cat = t.category || 'Uncategorized';
        catCounts[cat] = (catCounts[cat] || 0) + 1;
    });
    const sortedCats = Object.entries(catCounts).sort((a, b) => b[1] - a[1]);
    const topCats = sortedCats.slice(0, 3);
    const otherCount = sortedCats.slice(3).reduce((acc, current) => acc + current[1], 0);
    const finalCats = [...topCats];
    if (otherCount > 0) {
        finalCats.push(['Other', otherCount]);
    }
    const displayCats = finalCats.length > 0 ? finalCats : [
        ['Technical Issue', 124],
        ['Billing Query', 82],
        ['General Request', 41],
        ['Feedback', 27]
    ];

    return (
        <div className="p-6 animate-fade-in space-y-6 pb-20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
                <div className="flex flex-col gap-1.5">
                    <span className="w-fit text-[11px] font-bold text-[#02275A] bg-[#02275A]/5 border border-[#02275A]/10 px-2.5 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                        <i className="fas fa-shield-alt text-[9px]"></i> Action Role: {
                            userRole === 'admin' ? 'Administrator' : 
                            userRole === 'cx-head' ? 'Head of Customer Experience' : 
                            userRole === 'support-staff' ? 'Tech Support Staff' : 
                            userRole
                        }
                    </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    {/* Segmented Tab Controls */}
                    <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200/60 shrink-0 shadow-inner">
                        <button 
                            onClick={() => setActiveTab('tickets')}
                            className={`px-4 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'tickets' ? 'bg-white text-[#02275A] shadow-sm font-extrabold' : 'text-slate-600 hover:text-slate-800'}`}
                        >
                            <i className="fas fa-ticket-alt text-[11px]"></i> All Tickets
                        </button>
                        <button 
                            onClick={() => setActiveTab('inbox')}
                            className={`px-4 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'inbox' ? 'bg-white text-[#02275A] shadow-sm font-extrabold' : 'text-slate-600 hover:text-slate-800'}`}
                        >
                            <i className="fas fa-inbox text-[11px] text-[#02275A]"></i> Inbox
                        </button>
                        <button 
                            onClick={() => setActiveTab('analytics')}
                            className={`px-4 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'analytics' ? 'bg-white text-[#02275A] shadow-sm font-extrabold' : 'text-slate-600 hover:text-slate-800'}`}
                        >
                            <i className="fas fa-chart-pie text-[11px]"></i> Performance Reports
                        </button>
                    </div>

                    {/* Separated Primary Action Button */}
                    <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-5 py-2.5 rounded-md text-xs font-bold transition-all bg-[#02275A] hover:bg-[#033b8a] text-white shadow-md hover:shadow-lg active:scale-95 flex items-center gap-2 cursor-pointer shadow-blue-900/10 border-none"
                    >
                        <i className="fas fa-plus text-[10px]"></i> Create Ticket
                    </button>
                </div>
            </div>

            {/* Performance Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between transition-all hover:shadow-md hover:-translate-y-0.5 group">
                    <div className="space-y-1">
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Total Tickets</p>
                        <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight group-hover:text-[#02275A] transition-colors">{totalTickets}</h3>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 text-lg group-hover:bg-[#02275A]/5 group-hover:text-[#02275A] group-hover:border-[#02275A]/10 transition-all duration-300">
                        <i className="fas fa-layer-group text-base"></i>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between transition-all hover:shadow-md hover:-translate-y-0.5 group">
                    <div className="space-y-1">
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Active / Open</p>
                        <h3 className="text-2xl font-extrabold text-amber-500 tracking-tight group-hover:text-amber-600 transition-colors">{openTickets}</h3>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-amber-500/[0.04] border border-amber-500/10 flex items-center justify-center text-amber-500 text-lg group-hover:bg-amber-500/[0.08] group-hover:border-amber-500/20 transition-all duration-300">
                        <i className="fas fa-folder-open text-base animate-pulse"></i>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between transition-all hover:shadow-md hover:-translate-y-0.5 group">
                    <div className="space-y-1">
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Resolved</p>
                        <h3 className="text-2xl font-extrabold text-emerald-600 tracking-tight group-hover:text-emerald-700 transition-colors">{resolvedTickets}</h3>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/10 flex items-center justify-center text-emerald-600 text-lg group-hover:bg-emerald-500/[0.08] group-hover:border-emerald-500/20 transition-all duration-300">
                        <i className="fas fa-check-double text-base"></i>
                    </div>
                </div>
                <div className="bg-[#02275A] p-5 rounded-2xl shadow-sm flex items-center justify-between text-white relative overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5 group">
                    <div className="relative z-10 space-y-1">
                        <p className="text-[11px] text-blue-200 font-bold uppercase tracking-wider">Avg. Resolution</p>
                        <h3 className="text-2xl font-extrabold text-white tracking-tight">4.2 hrs</h3>
                        <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 mt-1"><i className="fas fa-arrow-down text-[8px]"></i> 12% faster</p>
                    </div>
                    <i className="fas fa-stopwatch absolute -right-3 -bottom-3 text-white/5 text-7xl shadow-none pointer-events-none group-hover:scale-110 group-hover:rotate-6 transition-all duration-300"></i>
                </div>
            </div>

            {activeTab === 'tickets' && (
                <div className="space-y-4">
                    {/* Filters Strip */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
                        {/* First Row: Search input + Reset Button */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-50">
                            <div className="relative flex-grow">
                                <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-[#02275A] text-sm opacity-80"></i>
                                <input
                                    type="text"
                                    placeholder="Search by Ticket ID, Customer Name, Subject, Staff, or Type..."
                                    className="bg-slate-50 hover:bg-slate-100/50 border border-slate-200 text-xs rounded-md pl-10 pr-10 py-3 outline-none focus:border-[#02275A] focus:ring-2 focus:ring-[#02275A]/10 w-full focus:bg-white transition-all font-medium placeholder:text-slate-400"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <button 
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        <i className="fas fa-times-circle"></i>
                                    </button>
                                )}
                            </div>
                            
                            {/* Reset Button */}
                            {(statusFilter !== 'All' || priorityFilter !== 'All' || typeFilter !== 'All' || staffFilter !== 'All' || escalatedFilter !== 'All' || tagFilter !== 'All' || searchQuery !== '' || dateFromFilter !== '' || dateToFilter !== '') && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setStatusFilter('All');
                                        setPriorityFilter('All');
                                        setTypeFilter('All');
                                        setStaffFilter('All');
                                        setEscalatedFilter('All');
                                        setTagFilter('All');
                                        setDateFromFilter('');
                                        setDateToFilter('');
                                        setSearchQuery('');
                                    }}
                                    className="shrink-0 text-xs font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-4 py-3 rounded-md transition-all flex items-center gap-1.5 self-start md:self-auto cursor-pointer border border-rose-100/40"
                                >
                                    <i className="fas fa-filter-slash"></i> Reset Filters
                                </button>
                            )}
                        </div>

                        {/* Second Row: Labeled Dropdowns for Easy Selection & Scanning */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                    <i className="fas fa-[#02275A] fa-tasks text-[9px] opacity-70"></i> Status
                                </label>
                                <div className="relative">
                                    <select 
                                        className="appearance-none w-full bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-xs rounded-md pl-3 pr-8 py-2.5 outline-none focus:border-[#02275A] focus:ring-2 focus:ring-[#02275A]/10 focus:bg-white font-bold text-slate-700 transition-all cursor-pointer"
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                    >
                                        <option value="All">All statuses</option>
                                        <option value="Open">Open</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Awaiting Reply">Awaiting Reply</option>
                                        <option value="Resolved">Resolved</option>
                                    </select>
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[10px]"><i className="fas fa-chevron-down"></i></span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                    <i className="fas fa-user-tag text-[9px] text-indigo-500 opacity-70"></i> Ticket Type
                                </label>
                                <div className="relative">
                                    <select 
                                        className="appearance-none w-full bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-xs rounded-md pl-3 pr-8 py-2.5 outline-none focus:border-[#02275A] focus:ring-2 focus:ring-[#02275A]/10 focus:bg-white font-bold text-slate-700 transition-all cursor-pointer"
                                        value={typeFilter}
                                        onChange={(e) => setTypeFilter(e.target.value)}
                                    >
                                        <option value="All">All types</option>
                                        <option value="Customer">Customer</option>
                                        <option value="BRM">BRM</option>
                                        <option value="State Manager">State Manager</option>
                                        <option value="Partner">Partner</option>
                                    </select>
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[10px]"><i className="fas fa-chevron-down"></i></span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                    <i className="fas fa-shield-alt text-[9px] text-emerald-600 opacity-70"></i> Priority
                                </label>
                                <div className="relative">
                                    <select 
                                        className="appearance-none w-full bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-xs rounded-md pl-3 pr-8 py-2.5 outline-none focus:border-[#02275A] focus:ring-2 focus:ring-[#02275A]/10 focus:bg-white font-bold text-slate-700 transition-all cursor-pointer"
                                        value={priorityFilter}
                                        onChange={(e) => setPriorityFilter(e.target.value)}
                                    >
                                        <option value="All">All priorities</option>
                                        <option value="Urgent">Urgent</option>
                                        <option value="High">High</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Low">Low</option>
                                    </select>
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[10px]"><i className="fas fa-chevron-down"></i></span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                    <i className="fas fa-user-shield text-[9px] text-blue-500 opacity-70"></i> Assigned Staff
                                </label>
                                <div className="relative">
                                    <select 
                                        className="appearance-none w-full bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-xs rounded-md pl-3 pr-8 py-2.5 outline-none focus:border-[#02275A] focus:ring-2 focus:ring-[#02275A]/10 focus:bg-white font-bold text-slate-700 transition-all cursor-pointer"
                                        value={staffFilter}
                                        onChange={(e) => setStaffFilter(e.target.value)}
                                    >
                                        <option value="All">All staff</option>
                                        <option value="Unassigned">Unassigned</option>
                                        <option value="Sarah O.">Sarah O.</option>
                                        <option value="Mike T.">Mike T.</option>
                                        <option value="John D.">John D.</option>
                                    </select>
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[10px]"><i className="fas fa-chevron-down"></i></span>
                                </div>
                            </div>

                            <div className={`flex flex-col gap-1.5 ${['admin', 'cx-head'].includes(userRole) ? '' : 'opacity-40 cursor-not-allowed'}`}>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                    <i className="fas fa-radiation text-[9px] text-rose-500 opacity-70"></i> Escalated
                                </label>
                                <div className="relative">
                                    <select 
                                        className="appearance-none w-full bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-xs rounded-md pl-3 pr-8 py-2.5 outline-none focus:border-[#02275A] focus:ring-2 focus:ring-[#02275A]/10 focus:bg-white font-bold text-slate-700 transition-all cursor-pointer disabled:bg-slate-100 disabled:text-slate-400"
                                        value={['admin', 'cx-head'].includes(userRole) ? escalatedFilter : 'All'}
                                        disabled={!['admin', 'cx-head'].includes(userRole)}
                                        onChange={(e) => setEscalatedFilter(e.target.value)}
                                    >
                                        <option value="All">All (Escalated)</option>
                                        <option value="Yes">Escalated Only</option>
                                        <option value="No">Not Escalated</option>
                                    </select>
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[10px]"><i className="fas fa-chevron-down"></i></span>
                                </div>
                            </div>

                            <div className={`flex flex-col gap-1.5 ${['admin', 'cx-head'].includes(userRole) ? '' : 'opacity-40 cursor-not-allowed'}`}>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                    <i className="fas fa-tag text-[9px] text-[#02275A] opacity-70"></i> Tag Filter
                                </label>
                                <div className="relative">
                                    <select 
                                        className="appearance-none w-full bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-xs rounded-md pl-3 pr-8 py-2.5 outline-none focus:border-[#02275A] focus:ring-2 focus:ring-[#02275A]/10 focus:bg-white font-bold text-slate-700 transition-all cursor-pointer disabled:bg-slate-100 disabled:text-slate-400"
                                        value={['admin', 'cx-head'].includes(userRole) ? tagFilter : 'All'}
                                        disabled={!['admin', 'cx-head'].includes(userRole)}
                                        onChange={(e) => setTagFilter(e.target.value)}
                                    >
                                        <option value="All">All Tags</option>
                                        {allUniqueTags.map(tag => (
                                            <option key={tag} value={tag}>{tag}</option>
                                        ))}
                                    </select>
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[10px]"><i className="fas fa-chevron-down"></i></span>
                                </div>
                            </div>

                            {/* Zoho Style Date Filter */}
                            <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-3 lg:col-span-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                    <i className="fas fa-calendar-alt text-[9px] text-[#02275A] opacity-70"></i> Date Filter
                                </label>
                                <div className="space-y-2">
                                    <div className="relative">
                                        <select 
                                            className="appearance-none w-full bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-xs rounded-md pl-3 pr-8 py-2.5 outline-none focus:border-[#02275A] focus:ring-2 focus:ring-[#02275A]/10 focus:bg-white font-bold text-slate-700 transition-all cursor-pointer"
                                            value={datePresetFilter}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setDatePresetFilter(val);
                                                if (val !== 'Custom') {
                                                    setDateFromFilter('');
                                                    setDateToFilter('');
                                                }
                                            }}
                                        >
                                            <option value="All">All Time</option>
                                            <option value="Last 7 Days">Last 7 Days</option>
                                            <option value="Last 30 Days">Last 30 Days</option>
                                            <option value="This Month">This Month</option>
                                            <option value="Custom">Custom Period...</option>
                                        </select>
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[10px]"><i className="fas fa-chevron-down"></i></span>
                                    </div>
                                    {datePresetFilter === 'Custom' && (
                                        <div className="grid grid-cols-2 gap-2 animate-fade-in">
                                            <div>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase">From</span>
                                                <input 
                                                    type="date"
                                                    className="w-full bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-[10px] rounded-md px-2 py-1 outline-none focus:border-[#02275A] font-bold text-slate-700 transition-all cursor-pointer"
                                                    value={dateFromFilter}
                                                    onChange={(e) => setDateFromFilter(e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase">To</span>
                                                <input 
                                                    type="date"
                                                    className="w-full bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-[10px] rounded-md px-2 py-1 outline-none focus:border-[#02275A] font-bold text-slate-700 transition-all cursor-pointer"
                                                    value={dateToFilter}
                                                    onChange={(e) => setDateToFilter(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bulk Assignment control strip */}
                    {['admin', 'cx-head'].includes(userRole) && (
                        <div className="bg-indigo-50/40 border border-indigo-100 rounded-2xl p-4.5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs animate-fade-in">
                            <div className="flex items-center gap-3.5">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center text-base font-bold shrink-0 shadow-xs">
                                    <i className="fas fa-tasks"></i>
                                </div>
                                <div className="text-left">
                                    <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Bulk Staff Assignment Control</h4>
                                    <p className="text-xs text-slate-500 mt-0.5 font-medium">
                                        {selectedTicketIds.length === 0 
                                            ? "Select tickets using the checkboxes below to assign multiple tickets to a tech support staff." 
                                            : `${selectedTicketIds.length} ticket${selectedTicketIds.length > 1 ? 's' : ''} currently selected for assignment.`
                                        }
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0 justify-end">
                                <div className="relative w-full sm:w-[190px]">
                                    <select 
                                        value={bulkAssignee}
                                        onChange={(e) => setBulkAssignee(e.target.value)}
                                        className="appearance-none w-full bg-white border border-slate-200 text-xs rounded-md pl-3 pr-8 py-2.5 outline-none focus:border-[#02275A] focus:ring-2 focus:ring-[#02275A]/10 shadow-sm font-bold text-slate-700 cursor-pointer"
                                    >
                                        <option value="" disabled>Select Tech Support...</option>
                                        {supportStaffList.map(staff => (
                                            <option key={staff} value={staff}>{staff}</option>
                                        ))}
                                    </select>
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[10px]"><i className="fas fa-chevron-down"></i></span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleBulkAssign(bulkAssignee)}
                                    disabled={!bulkAssignee || selectedTicketIds.length === 0}
                                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold rounded-md text-xs px-4 py-2.5 shadow-sm transition-all shrink-0 flex items-center gap-1.5 active:scale-95 cursor-pointer"
                                >
                                    <i className="fas fa-user-check"></i> Assign Selected
                                </button>
                                {selectedTicketIds.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setSelectedTicketIds([])}
                                        className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-md text-xs px-3.5 py-2.5 shadow-xs transition-all shrink-0 cursor-pointer"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Rich Complaints Table */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[1000px]">
                                <thead>
                                    <tr className="bg-slate-50/75 border-b border-slate-100 text-[10px] uppercase text-slate-400 font-bold tracking-wider">
                                        {['admin', 'cx-head'].includes(userRole) && (
                                            <th className="p-4 w-12 border-r border-slate-100/50 text-center">
                                                <input 
                                                    type="checkbox" 
                                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer h-4 w-4"
                                                    checked={filteredTickets.length > 0 && filteredTickets.every(t => selectedTicketIds.includes(t.id))}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedTicketIds(Array.from(new Set([...selectedTicketIds, ...filteredTickets.map(t => t.id)])));
                                                        } else {
                                                            setSelectedTicketIds(selectedTicketIds.filter(id => !filteredTickets.some(t => t.id === id)));
                                                        }
                                                    }}
                                                />
                                            </th>
                                        )}
                                        <th className="p-4 w-64 border-r border-slate-100/50">Customer / ID</th>
                                        <th className="p-4 border-r border-slate-100/50">Subject</th>
                                        <th className="p-4 border-r border-slate-100/50 w-44">Status & Priority</th>
                                        <th className="p-4 border-r border-slate-100/50">Staff Assignment</th>
                                        <th className="p-4 border-r border-slate-100/50">Creator & Logs</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100/70">
                                    {paginatedTickets.map(ticket => {
                                        const isChecked = selectedTicketIds.includes(ticket.id);
                                        return (
                                            <tr key={ticket.id} className={`hover:bg-slate-50/50 transition-all group ${isChecked ? 'bg-indigo-50/15' : ''}`}>
                                                {['admin', 'cx-head'].includes(userRole) && (
                                                    <td className="p-4 border-r border-slate-100/30 text-center align-middle">
                                                        <input 
                                                            type="checkbox" 
                                                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer h-4 w-4 transition-colors"
                                                            checked={isChecked}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setSelectedTicketIds([...selectedTicketIds, ticket.id]);
                                                                } else {
                                                                    setSelectedTicketIds(selectedTicketIds.filter(id => id !== ticket.id));
                                                                }
                                                            }}
                                                        />
                                                    </td>
                                                )}
                                                <td className="p-4 border-r border-slate-100/30">
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold shrink-0 uppercase border border-slate-200/50 shadow-xs">
                                                            {ticket.customer.name ? ticket.customer.name.substring(0, 2) : 'C'}
                                                        </div>
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="font-bold text-slate-700 text-[13px] tracking-tight truncate">{ticket.customer.name}</span>
                                                            <span className="text-[11px] text-slate-400 font-medium truncate">{ticket.customer.email}</span>
                                                            <div className="flex flex-wrap gap-1.5 mt-2 items-center">
                                                                <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 border border-slate-200/40 px-1.5 py-0.5 rounded-md">{ticket.id}</span>
                                                                <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md border uppercase tracking-wide shrink-0 ${
                                                                    ticket.ticketType === 'BRM' ? 'bg-indigo-50/80 border-indigo-200/40 text-indigo-700' :
                                                                    ticket.ticketType === 'State Manager' ? 'bg-emerald-50/80 border-emerald-200/40 text-emerald-700' :
                                                                    ticket.ticketType === 'Partner' ? 'bg-purple-50/80 border-purple-200/40 text-purple-700' :
                                                                    'bg-blue-50/90 border-blue-100 text-[#02275A]'
                                                                }`}>
                                                                    <i className={`fas ${
                                                                        ticket.ticketType === 'BRM' ? 'fa-user-tie' :
                                                                        ticket.ticketType === 'State Manager' ? 'fa-map-marker-alt' :
                                                                        ticket.ticketType === 'Partner' ? 'fa-handshake' :
                                                                        'fa-building'
                                                                    } text-[8px]`}></i>
                                                                    {ticket.ticketType || 'Customer'}
                                                                </span>
                                                            </div>
                                                            {(ticket.businessName || ticket.brmName || ticket.stateManager) && (
                                                                <div className="mt-2 text-[10px] flex flex-col gap-1 border-t border-slate-50 pt-1.5">
                                                                    {ticket.businessName && <span className="text-slate-500 font-medium flex items-center gap-1.5"><i className="fas fa-building text-slate-400 text-[9px]"></i> {ticket.businessName}</span>}
                                                                    {ticket.brmName && <span className="text-indigo-600 font-medium flex items-center gap-1.5"><i className="fas fa-user-tie text-indigo-400 text-[9px]"></i> BRM: {ticket.brmName}</span>}
                                                                    {ticket.stateManager && <span className="text-emerald-700 font-medium flex items-center gap-1.5"><i className="fas fa-map-marker-alt text-emerald-400 text-[9px]"></i> SM: {ticket.stateManager}</span>}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 border-r border-slate-100/30">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-slate-800 line-clamp-1 mb-1">{ticket.subject}</span>
                                                        <span className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed font-medium">{ticket.description}</span>
                                                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                                                            <span className="text-[10px] bg-slate-50 text-slate-600 font-semibold px-2 py-0.5 rounded-md border border-slate-200/60 shadow-2xs">{ticket.category}</span>
                                                            {ticket.tags && ticket.tags.map(tag => (
                                                                <span key={tag} className="text-[10px] bg-indigo-50/60 text-indigo-700 font-semibold px-2 py-0.5 rounded-md border border-indigo-100/50 shadow-2xs"><i className="fas fa-tag text-[8px] mr-1 opacity-75"></i>{tag}</span>
                                                            ))}
                                                            {ticket.attachments && ticket.attachments.map(att => (
                                                                <span key={att} className="text-[10px] bg-slate-50 text-slate-500 font-semibold px-2 py-0.5 rounded-md border border-slate-200/50 flex items-center gap-1 shadow-2xs">
                                                                    <i className={`fas ${att.toLowerCase().match(/\.(mp4|mov|avi)$/) ? 'fa-video text-rose-400' : 'fa-image text-blue-400'} text-[9px]`}></i>
                                                                    <span className="truncate max-w-[120px]">{att}</span>
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 border-r border-slate-100/30 align-top">
                                                    <div className="flex flex-col gap-1.5 items-start mt-0.5">
                                                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wide flex items-center gap-1.5 ${
                                                            ticket.status === 'Resolved' || ticket.status === 'Closed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' :
                                                            ticket.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border border-blue-150' :
                                                            ticket.status === 'Awaiting Reply' ? 'bg-indigo-50 text-indigo-700 border border-indigo-150' :
                                                            'bg-amber-50 text-amber-700 border border-amber-150 shadow-sm shadow-amber-100'
                                                        }`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${
                                                                ticket.status === 'Resolved' || ticket.status === 'Closed' ? 'bg-emerald-500 animate-pulse' :
                                                                ticket.status === 'In Progress' ? 'bg-blue-500' :
                                                                ticket.status === 'Awaiting Reply' ? 'bg-indigo-500' :
                                                                'bg-amber-500'
                                                            }`}></span>
                                                            {ticket.status}
                                                        </span>
                                                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                                                            ticket.priority === 'Urgent' ? 'bg-rose-50 border-rose-200 text-rose-700' :
                                                            ticket.priority === 'High' ? 'bg-orange-50 border-orange-200 text-orange-700' :
                                                            ticket.priority === 'Medium' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                                                            'bg-emerald-50 border-emerald-200 text-emerald-700'
                                                        }`}>
                                                            {ticket.priority}
                                                        </span>
                                                        {ticket.escalated && (
                                                            <span className="inline-flex items-center gap-1 bg-rose-50 border border-rose-100 text-rose-600 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md mt-1 shadow-2xs">
                                                                <i className="fas fa-radiation text-rose-500 text-[8px] animate-spin"></i> {ticket.escalatedTo || 'Escalated'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4 border-r border-slate-100/30 align-top">
                                                    <div className="flex flex-col gap-2 mt-0.5">
                                                        {ticket.assignedStaff ? (
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold shadow-2xs">
                                                                    {ticket.assignedStaff.charAt(0)}
                                                                </div>
                                                                <span className="text-xs font-bold text-slate-700">{ticket.assignedStaff}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-rose-500 font-semibold flex items-center gap-1.5">
                                                                <i className="fas fa-exclamation-circle text-rose-400"></i> Unassigned
                                                            </span>
                                                        )}
                                                        
                                                        {/* Admin or Head of CX dropdown to assign/reassign */}
                                                        {['admin', 'cx-head'].includes(userRole) ? (
                                                            <div className="relative mt-1">
                                                                <select 
                                                                    className="appearance-none text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold outline-none cursor-pointer rounded-md pl-2.5 pr-7 py-1.5 focus:border-[#02275A] w-full max-w-[140px]"
                                                                    onChange={(e) => {
                                                                        if(e.target.value) handleAssignStaff(ticket.id, e.target.value);
                                                                    }}
                                                                    value={ticket.assignedStaff || ""}
                                                                >
                                                                    <option value="" disabled>{ticket.assignedStaff ? "Change Assignee..." : "Assign Staff..."}</option>
                                                                    {supportStaffList.map(staff => (
                                                                        <option key={staff} value={staff}>{staff}</option>
                                                                    ))}
                                                                </select>
                                                                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[8px]"><i className="fas fa-chevron-down"></i></span>
                                                            </div>
                                                        ) : (
                                                            !ticket.assignedStaff && <span className="text-[10px] text-slate-400 italic">Pending Assignment</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4 border-r border-slate-100/30 align-top">
                                                    <div className="flex flex-col mt-0.5 space-y-1 font-medium">
                                                        <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                                                            <i className={`fas ${ticket.createdBy === 'Customer' ? 'fa-user text-slate-400' : 'fa-user-shield text-indigo-400'} text-[10px]`}></i> 
                                                            {ticket.createdBy}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400">
                                                            Created: <span className="font-bold text-slate-600">{ticket.createdAt}</span>
                                                        </span>
                                                        <span className="text-[10px] text-slate-400">
                                                            Updated: <span className="font-bold text-slate-600">{ticket.updatedAt}</span>
                                                        </span>
                                                        {ticket.autoEmailSentStatus && (
                                                            <div className="mt-1.5 flex items-center gap-1.5 text-[10px]">
                                                                <span className="text-slate-400 font-medium">Auto-Email:</span>
                                                                {ticket.autoEmailSentStatus === 'Sent' ? (
                                                                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded-md font-bold inline-flex items-center gap-0.5" title="Confirmation email successfully sent to customer">
                                                                        <i className="fas fa-check-circle text-emerald-500 text-[8px]"></i> Sent
                                                                    </span>
                                                                ) : ticket.autoEmailSentStatus === 'Failed' ? (
                                                                    <span className="bg-rose-50 text-rose-700 border border-rose-100 px-1.5 py-0.5 rounded-md font-bold inline-flex items-center gap-0.5" title="Failed to send due to invalid or empty email address format">
                                                                        <i className="fas fa-times-circle text-rose-500 text-[8px]"></i> Failed
                                                                    </span>
                                                                ) : (
                                                                    <span className="bg-slate-50 text-slate-500 border border-slate-200/60 px-1.5 py-0.5 rounded-md font-bold inline-flex items-center gap-0.5">
                                                                        Disabled
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right align-top">
                                                    <div className="flex flex-col items-end gap-2 mt-0.5">
                                                        <div className="relative">
                                                            <select 
                                                                className="appearance-none bg-white border border-slate-200 text-[10px] font-bold rounded-md pl-2 pr-6 py-1.5 outline-none focus:border-[#02275A] text-slate-700 cursor-pointer hover:bg-slate-50 transition-colors w-24 text-right shadow-sm"
                                                                value={ticket.status}
                                                                onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                                                            >
                                                                <option value="Open">Set Open</option>
                                                                <option value="In Progress">Set Active</option>
                                                                <option value="Awaiting Reply">Set Wait</option>
                                                                <option value="Resolved">Resolve</option>
                                                            </select>
                                                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[8px]"><i className="fas fa-chevron-down"></i></span>
                                                        </div>
                                                        <button 
                                                            onClick={() => setViewTicket(ticket)}
                                                            className="bg-slate-50 hover:bg-[#02275A] hover:text-white text-slate-700 px-3 py-1.5 rounded-md text-xs font-bold transition-all border border-slate-200 hover:border-[#02275A] shadow-sm w-24 flex items-center justify-center gap-1.5 cursor-pointer"
                                                        >
                                                            <i className="fas fa-eye text-[9px]"></i> View
                                                        </button>
                                                        {['admin', 'cx-head', 'support-staff'].includes(userRole) && (
                                                            <button 
                                                                onClick={() => setEscalateTicket(ticket)}
                                                                className="bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 px-3 py-1.5 rounded-md text-xs font-bold transition-all border border-rose-100 hover:border-rose-600 shadow-sm w-24 flex items-center justify-center gap-1 mt-0.5 cursor-pointer"
                                                            >
                                                                <i className="fas fa-radiation text-[9px]"></i> Escalate
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {filteredTickets.length === 0 && (
                                        <tr>
                                            <td colSpan={['admin', 'cx-head'].includes(userRole) ? 7 : 6} className="p-16 text-center">
                                                <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-bounce">
                                                    <i className="fas fa-search text-slate-300 text-xl"></i>
                                                </div>
                                                <h4 className="text-slate-800 font-bold text-sm">No Tickets Found</h4>
                                                <p className="text-slate-400 font-medium text-xs max-w-sm mx-auto mt-1 leading-relaxed">No support tickets found matching your selected filters. Try broadening your criteria or reset the filters.</p>
                                                <button 
                                                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold mt-4 px-4 py-2 rounded-md transition-all border border-slate-200 shadow-sm cursor-pointer"
                                                    onClick={() => {
                                                        setSearchQuery('');
                                                        setStatusFilter('All');
                                                        setPriorityFilter('All');
                                                        setStaffFilter('All');
                                                        setTypeFilter('All');
                                                        setEscalatedFilter('All');
                                                        setTagFilter('All');
                                                        setDatePresetFilter('All');
                                                        setDateFromFilter('');
                                                        setDateToFilter('');
                                                    }}
                                                >
                                                    Clear All Filters
                                                </button>
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
                                        type="button"
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
                                                    type="button"
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
                                        type="button"
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
                </div>
            )}

            {activeTab === 'inbox' && (() => {
                const matchTicketDate = (ticketDateStr: string, filterDateYMD: string) => {
                    if (!filterDateYMD) return true;
                    try {
                        const ticketDate = new Date(ticketDateStr);
                        if (isNaN(ticketDate.getTime())) return false;
                        const year = ticketDate.getFullYear();
                        const month = String(ticketDate.getMonth() + 1).padStart(2, '0');
                        const day = String(ticketDate.getDate()).padStart(2, '0');
                        const ticketYMD = `${year}-${month}-${day}`;
                        return ticketYMD === filterDateYMD;
                    } catch (e) {
                        return false;
                    }
                };

                // Filter the support tickets for the inbox
                const filteredInboxTickets = tickets.filter(t => {
                    const term = searchInboxQuery.toLowerCase();
                    const matchesSearch = (
                        t.id.toLowerCase().includes(term) ||
                        t.customer.name.toLowerCase().includes(term) ||
                        t.customer.email.toLowerCase().includes(term) ||
                        t.subject.toLowerCase().includes(term) ||
                        (t.category && t.category.toLowerCase().includes(term))
                    );

                    let matchesFilter = false;
                    if (inboxFilter === 'all') {
                        matchesFilter = matchesSearch;
                    } else if (inboxFilter === 'unread') {
                        // Consider unread if there are no comments yet or last comment is from Customer
                        const hasComments = t.comments && t.comments.length > 0;
                        const lastComment = hasComments && t.comments ? t.comments[t.comments.length - 1] : null;
                        const isLastFromCustomer = lastComment && lastComment.senderRole === 'Customer';
                        matchesFilter = matchesSearch && (!hasComments || isLastFromCustomer);
                    } else {
                        // Filter by Priority
                        matchesFilter = matchesSearch && t.priority === inboxFilter;
                    }

                    const isAdminOrCxHead = userRole === 'admin' || userRole === 'cx-head';
                    if (isAdminOrCxHead) {
                        const matchesStaff = inboxStaffFilter === 'All' ? true :
                                             inboxStaffFilter === 'Unassigned' ? t.assignedStaff === null :
                                             t.assignedStaff === inboxStaffFilter;
                        
                        let matchesDate = true;
                        if (t.createdAt) {
                            const ticketDate = new Date(t.createdAt);
                            if (!isNaN(ticketDate.getTime())) {
                                const now = new Date();
                                if (inboxDatePreset === 'Last 7 Days') {
                                    const sevenDaysAgo = new Date();
                                    sevenDaysAgo.setDate(now.getDate() - 7);
                                    sevenDaysAgo.setHours(0, 0, 0, 0);
                                    matchesDate = ticketDate >= sevenDaysAgo;
                                } else if (inboxDatePreset === 'Last 30 Days') {
                                    const thirtyDaysAgo = new Date();
                                    thirtyDaysAgo.setDate(now.getDate() - 30);
                                    thirtyDaysAgo.setHours(0, 0, 0, 0);
                                    matchesDate = ticketDate >= thirtyDaysAgo;
                                } else if (inboxDatePreset === 'This Month') {
                                    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
                                    matchesDate = ticketDate >= monthStart;
                                } else if (inboxDatePreset === 'Custom') {
                                    if (inboxDateFrom) {
                                        const fromDate = new Date(inboxDateFrom);
                                        fromDate.setHours(0, 0, 0, 0);
                                        if (ticketDate < fromDate) {
                                            matchesDate = false;
                                        }
                                    }
                                    if (inboxDateTo) {
                                        const toDate = new Date(inboxDateTo);
                                        toDate.setHours(23, 59, 59, 999);
                                        if (ticketDate > toDate) {
                                            matchesDate = false;
                                        }
                                    }
                                }
                            } else {
                                matchesDate = false;
                            }
                        }
                        return matchesFilter && matchesStaff && matchesDate;
                    }

                    return matchesFilter;
                });

                // Filter direct emails
                const filteredDirectEmails = directEmails.filter(e => {
                    const term = searchInboxQuery.toLowerCase();
                    return (
                        e.id.toLowerCase().includes(term) ||
                        e.recipientName.toLowerCase().includes(term) ||
                        e.recipientEmail.toLowerCase().includes(term) ||
                        e.subject.toLowerCase().includes(term) ||
                        e.body.toLowerCase().includes(term)
                    );
                });

                // Gather all system customers (tickets + business list contacts)
                const allSystemCustomers = Array.from(new Map([
                    ...tickets.map(t => [t.customer.email, t.customer]),
                    ...businessListData.map(b => [b.email, { name: b.name, email: b.email }])
                ].filter(item => item[0])).values());

                // Selected ticket details
                const selectedTicket = tickets.find(t => t.id === selectedInboxTicketId);
                const selectedDirectEmail = directEmails.find(e => e.id === selectedDirectEmailId);

                // Helper to toggle ticket checkbox for bulk sending
                const toggleInboxBulkSelect = (tId: string) => {
                    setSelectedCustomerIds(prev => 
                        prev.includes(tId) 
                            ? prev.filter(id => id !== tId) 
                            : [...prev, tId]
                    );
                };

                const isInboxSelectedForBulk = (tId: string) => selectedCustomerIds.includes(tId);

                const handleDeselectAllInbox = () => {
                    setSelectedCustomerIds([]);
                };

                // Form submit handler for the Composer
                const handleSendNewDirectOrTicketEmail = () => {
                    if (!composeSubject.trim() || !composeBody.trim()) {
                        showWarning('Please fill in both the subject and the body.');
                        return;
                    }

                    const nowStr = new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true, month: 'short', day: 'numeric', year: 'numeric' });

                    if (composeRecipientType === 'all') {
                        // Send broadcast to ALL customers
                        const newBulkEmail: DirectEmail = {
                            id: `EML-${Date.now().toString().slice(-3)}`,
                            recipientName: 'All Customers',
                            recipientEmail: 'all-customers@system.broadcast',
                            subject: composeSubject,
                            body: composeBody,
                            sentAt: nowStr,
                            isBulk: true
                        };
                        setDirectEmails(prev => [newBulkEmail, ...prev]);

                        // Send comments to all active tickets of these customers
                        setTickets(prev => prev.map(t => {
                            const broadcastComment: TicketComment = {
                                senderRole: userRole,
                                senderName: userRole === 'support-staff' ? 'Tech Support Staff' : 'System Support',
                                text: `📧 [Sent Bulk Email to All Customers]\nSubject: ${composeSubject}\n\n${composeBody}`,
                                createdAt: nowStr,
                                isEmail: true,
                                recipientEmail: t.customer.email
                            };
                            return {
                                ...t,
                                comments: [...(t.comments || []), broadcastComment],
                                updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            };
                        }));

                        showSuccess(`Bulk email broadcast sent successfully to all ${allSystemCustomers.length} registered customer contacts.`);
                        
                        // Switch tab to view it
                        setInboxSubTab('direct');
                        setSelectedDirectEmailId(newBulkEmail.id);
                        setSelectedInboxTicketId(null);
                        setComposeMode(false);
                    } else if (composeRecipientType === 'bulk') {
                        if (selectedCustomerIds.length === 0) {
                            showWarning('No ticket contacts selected for bulk sending.');
                            return;
                        }

                        // Send bulk email to checked ticket contacts
                        let sentCount = 0;
                        setTickets(prev => prev.map(t => {
                            if (selectedCustomerIds.includes(t.id)) {
                                sentCount++;
                                const emailComment: TicketComment = {
                                    senderRole: userRole,
                                    senderName: userRole === 'support-staff' ? 'Tech Support Staff' : 'System Support',
                                    text: `📧 [Bulk Broadcast Email Sent]\nSubject: ${composeSubject}\n\n${composeBody}`,
                                    createdAt: nowStr,
                                    isEmail: true,
                                    recipientEmail: t.customer.email
                                };
                                return {
                                    ...t,
                                    comments: [...(t.comments || []), emailComment],
                                    status: 'Awaiting Reply',
                                    updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                };
                            }
                            return t;
                        }));

                        const newBulkEmail: DirectEmail = {
                            id: `EML-${Date.now().toString().slice(-3)}`,
                            recipientName: `Bulk Tickets Group (${selectedCustomerIds.length} Customers)`,
                            recipientEmail: 'multiple-recipients@system.broadcast',
                            subject: composeSubject,
                            body: composeBody,
                            sentAt: nowStr,
                            isBulk: true
                        };
                        setDirectEmails(prev => [newBulkEmail, ...prev]);

                        showSuccess(`Bulk broadcast compiled successfully! Sent emails to ${sentCount} ticket customer contacts.`);
                        setSelectedCustomerIds([]);
                        setInboxSubTab('direct');
                        setSelectedDirectEmailId(newBulkEmail.id);
                        setSelectedInboxTicketId(null);
                        setComposeMode(false);
                    } else {
                        // Individual customer
                        if (!composeRecipientEmail.trim()) {
                            showWarning('Please specify a recipient email address.');
                            return;
                        }

                        if (composeLinkedTicketId) {
                            // Link to existing ticket
                            const ticket = tickets.find(t => t.id === composeLinkedTicketId);
                            if (ticket) {
                                const emailComment: TicketComment = {
                                    senderRole: userRole,
                                    senderName: userRole === 'support-staff' ? 'Tech Support Staff' : 'System Support',
                                    text: `📧 [Sent Email to Customer]\nSubject: ${composeSubject}\n\n${composeBody}`,
                                    createdAt: nowStr,
                                    isEmail: true,
                                    recipientEmail: composeRecipientEmail
                                };

                                setTickets(prev => prev.map(t => t.id === composeLinkedTicketId ? {
                                    ...t,
                                    comments: [...(t.comments || []), emailComment],
                                    status: 'Awaiting Reply',
                                    updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                } : t));

                                showSuccess(`Email sent and logged under Ticket ${composeLinkedTicketId}.`);
                                
                                setInboxSubTab('tickets');
                                setSelectedInboxTicketId(composeLinkedTicketId);
                                setSelectedDirectEmailId(null);
                                setComposeMode(false);
                            }
                        } else {
                            // Direct email without ticket
                            const newDirectEmail: DirectEmail = {
                                id: `EML-${Date.now().toString().slice(-3)}`,
                                recipientName: composeRecipientName || composeRecipientEmail.split('@')[0],
                                recipientEmail: composeRecipientEmail,
                                subject: composeSubject,
                                body: composeBody,
                                sentAt: nowStr
                            };
                            setDirectEmails(prev => [newDirectEmail, ...prev]);
                            showSuccess(`Direct email successfully sent to ${composeRecipientEmail} (without ticket).`);

                            setInboxSubTab('direct');
                            setSelectedDirectEmailId(newDirectEmail.id);
                            setSelectedInboxTicketId(null);
                            setComposeMode(false);
                        }
                    }

                    // Clear fields
                    setComposeSubject('');
                    setComposeBody('');
                };

                return (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in pb-12" id="support-tickets-inbox-section">
                        {/* Left Column: Communications Hub Directory */}
                        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden flex flex-col h-[750px] transition-all duration-300">
                            
                            {/* Directory Header & Compose Button */}
                            <div className="p-5 bg-slate-50/80 border-b border-slate-100/80 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <h3 className="text-xs font-black text-[#02275A] flex items-center gap-2 uppercase tracking-widest">
                                            <span className="w-2.5 h-2.5 rounded-full bg-[#02275A] inline-block animate-pulse"></span>
                                            Inbox Hub
                                        </h3>
                                        <p className="text-[10px] text-slate-400 font-medium">Manage support communications</p>
                                    </div>
                                    <span className="text-[10px] font-black px-2.5 py-1 bg-[#02275A]/5 text-[#02275A] rounded-full font-mono">
                                        {inboxSubTab === 'tickets' ? `${filteredInboxTickets.length} Threads` : `${filteredDirectEmails.length} Direct`}
                                    </span>
                                </div>
 
                                {/* Beautiful Action Switcher */}
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setComposeMode(true);
                                            setSelectedInboxTicketId(null);
                                            setSelectedDirectEmailId(null);
                                            setComposeRecipientType('individual');
                                            setComposeRecipientEmail('');
                                            setComposeRecipientName('');
                                            setComposeSubject('');
                                            setComposeBody('');
                                            setComposeLinkedTicketId('');
                                        }}
                                        className={`flex-1 py-2.5 px-4 rounded-md text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm border cursor-pointer ${
                                            composeMode 
                                                ? 'bg-[#02275A] text-white border-[#02275A] hover:bg-[#02275A]/90' 
                                                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                                        }`}
                                    >
                                        <i className="fas fa-paper-plane text-[10px]"></i> Compose Message
                                    </button>
 
                                    {selectedCustomerIds.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setComposeMode(true);
                                                setSelectedInboxTicketId(null);
                                                setSelectedDirectEmailId(null);
                                                setComposeRecipientType('bulk');
                                                setComposeSubject('Re: Support Progress & Checking-in');
                                                setComposeBody('Dear Valued Customer,\n\nWe are writing to provide a consolidated status update regarding your open support inquiries. Our engineering and customer success teams are currently working through solutions for you.\n\nWe will reach back out as soon as we have another update.\n\nThank you for your patience,\nSystem Support Team');
                                                setComposeLinkedTicketId('');
                                            }}
                                            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-md text-xs flex items-center gap-2 shadow-sm transition-all duration-200 cursor-pointer border-none"
                                        >
                                            <i className="fas fa-mail-bulk"></i> Broadcast ({selectedCustomerIds.length})
                                        </button>
                                    )}
                                </div>
 
                                {/* Sub Tabs Selector: Tickets vs. Direct Emails */}
                                <div className="flex bg-slate-200/40 p-1 rounded-lg border border-slate-200/20">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setInboxSubTab('tickets');
                                            setComposeMode(false);
                                            if (filteredInboxTickets.length > 0) {
                                                setSelectedInboxTicketId(filteredInboxTickets[0].id);
                                                setSelectedDirectEmailId(null);
                                                setInboxSubjectInput(`Re: [${filteredInboxTickets[0].id}] ${filteredInboxTickets[0].subject}`);
                                                setInboxEmailBody('');
                                            }
                                        }}
                                        className={`flex-1 py-2 rounded-md text-xs font-bold transition-all duration-200 cursor-pointer border-none ${
                                            inboxSubTab === 'tickets' && !composeMode
                                                ? 'bg-white text-[#02275A] shadow-sm font-extrabold'
                                                : 'text-slate-500 hover:text-slate-800 bg-transparent'
                                        }`}
                                    >
                                        <i className="fas fa-ticket-alt mr-1.5 opacity-80"></i> Ticket Threads
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setInboxSubTab('direct');
                                            setComposeMode(false);
                                            if (filteredDirectEmails.length > 0) {
                                                setSelectedDirectEmailId(filteredDirectEmails[0].id);
                                                setSelectedInboxTicketId(null);
                                            }
                                        }}
                                        className={`flex-1 py-2 rounded-md text-xs font-bold transition-all duration-200 cursor-pointer border-none ${
                                            inboxSubTab === 'direct' && !composeMode
                                                ? 'bg-white text-[#02275A] shadow-sm font-extrabold'
                                                : 'text-slate-500 hover:text-slate-800 bg-transparent'
                                        }`}
                                    >
                                        <i className="fas fa-envelope-open-text mr-1.5 opacity-80"></i> Direct Mail
                                    </button>
                                </div>
                            </div>
 
                            {/* Search & Filter Section */}
                            <div className="p-4 border-b border-slate-100 bg-white space-y-3">
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <i className="fas fa-search text-slate-400 text-xs"></i>
                                    </span>
                                    <input 
                                        type="text"
                                        placeholder={inboxSubTab === 'tickets' ? "Search ticket description, name, ID..." : "Search subjects, recipients..."}
                                        value={searchInboxQuery}
                                        onChange={(e) => setSearchInboxQuery(e.target.value)}
                                        className="w-full bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-xs text-slate-800 rounded-md pl-10 pr-4 py-2.5 outline-none border border-slate-200 focus:border-[#02275A] focus:ring-1 focus:ring-[#02275A]/20 transition-all duration-200"
                                    />
                                </div>
 
                                {inboxSubTab === 'tickets' && (
                                    <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full custom-scrollbar">
                                        {[
                                            { key: 'all', label: 'All Open' },
                                            { key: 'unread', label: 'Unread' },
                                            { key: 'Urgent', label: 'Urgent' },
                                            { key: 'High', label: 'High' },
                                            { key: 'Medium', label: 'Medium' }
                                        ].map(pill => {
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
                                )}
 
                                {inboxSubTab === 'tickets' && (userRole === 'admin' || userRole === 'cx-head') && (
                                    <div className="space-y-3 pt-3 border-t border-slate-100 mt-1">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="flex flex-col gap-1">
                                                <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                    <i className="fas fa-user-shield text-[9px] text-[#02275A]/50"></i> Support Staff
                                                </label>
                                                <select
                                                    className="bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-[10px] rounded-md px-2.5 py-2 outline-none focus:border-[#02275A] focus:bg-white font-bold text-slate-700 transition-all duration-200 cursor-pointer"
                                                    value={inboxStaffFilter}
                                                    onChange={(e) => setInboxStaffFilter(e.target.value)}
                                                >
                                                    <option value="All">All Staff</option>
                                                    <option value="Unassigned">Unassigned</option>
                                                    {supportStaffList.map(staff => (
                                                        <option key={staff} value={staff}>{staff}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                    <i className="fas fa-calendar-alt text-[9px] text-[#02275A]/50"></i> Created Date
                                                </label>
                                                <div className="relative">
                                                    <select
                                                        className="w-full bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-[10px] rounded-md px-2.5 py-2 outline-none focus:border-[#02275A] focus:bg-white font-bold text-slate-700 transition-all duration-200 cursor-pointer"
                                                        value={inboxDatePreset}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            setInboxDatePreset(val);
                                                            if (val !== 'Custom') {
                                                                setInboxDateFrom('');
                                                                setInboxDateTo('');
                                                            }
                                                        }}
                                                    >
                                                        <option value="All">All Time</option>
                                                        <option value="Last 7 Days">Last 7 Days</option>
                                                        <option value="Last 30 Days">Last 30 Days</option>
                                                        <option value="This Month">This Month</option>
                                                        <option value="Custom">Custom Period...</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        {inboxDatePreset === 'Custom' && (
                                            <div className="grid grid-cols-2 gap-2 p-2 bg-slate-50 rounded-md border border-slate-100 animate-fade-in">
                                                <div>
                                                    <span className="text-[8px] font-bold text-slate-400 uppercase">From</span>
                                                    <input 
                                                        type="date"
                                                        className="w-full bg-white hover:bg-slate-100/50 border border-slate-200 text-[10px] rounded-md px-2 py-1 outline-none focus:border-[#02275A] font-bold text-slate-700 transition-all cursor-pointer"
                                                        value={inboxDateFrom}
                                                        onChange={(e) => setInboxDateFrom(e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <span className="text-[8px] font-bold text-slate-400 uppercase">To</span>
                                                    <input 
                                                        type="date"
                                                        className="w-full bg-white hover:bg-slate-100/50 border border-slate-200 text-[10px] rounded-md px-2 py-1 outline-none focus:border-[#02275A] font-bold text-slate-700 transition-all cursor-pointer"
                                                        value={inboxDateTo}
                                                        onChange={(e) => setInboxDateTo(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
 
                            {/* Main Scrollable Lists */}
                            <div className="flex-1 overflow-y-auto divide-y divide-slate-100/70 custom-scrollbar bg-slate-50/20">
                                {inboxSubTab === 'tickets' ? (
                                    filteredInboxTickets.length === 0 ? (
                                        <div className="p-8 text-center text-slate-400 text-xs font-semibold flex flex-col items-center justify-center h-48 gap-2 bg-white">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
                                                <i className="fas fa-envelope-open text-base"></i>
                                            </div>
                                            No matching support ticket threads found.
                                        </div>
                                    ) : (
                                        filteredInboxTickets.map(t => {
                                            const hasComments = t.comments && t.comments.length > 0;
                                            const lastComment = hasComments && t.comments ? t.comments[t.comments.length - 1] : null;
                                            const isUnread = !hasComments || (lastComment && lastComment.senderRole === 'Customer');
                                            const isChecked = isInboxSelectedForBulk(t.id);
                                            const isCurrent = selectedInboxTicketId === t.id && !composeMode;
 
                                            return (
                                                <div
                                                    key={t.id}
                                                    onClick={() => {
                                                        setSelectedInboxTicketId(t.id);
                                                        setSelectedDirectEmailId(null);
                                                        setComposeMode(false);
                                                        setInboxSubjectInput(`Re: [${t.id}] ${t.subject}`);
                                                        setInboxEmailBody('');
                                                    }}
                                                    className={`p-4 transition-all duration-200 cursor-pointer flex gap-3.5 relative border-b border-slate-100 bg-white ${
                                                        isCurrent 
                                                            ? 'bg-[#02275A]/5 border-l-4 border-[#02275A]' 
                                                            : 'hover:bg-slate-50/80 border-l-4 border-transparent'
                                                    }`}
                                                >
                                                    {/* Bulk checkbox Selection */}
                                                    <div 
                                                        className="flex items-center justify-center pt-0.5"
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // prevent thread selection
                                                            toggleInboxBulkSelect(t.id);
                                                        }}
                                                    >
                                                        <input 
                                                            type="checkbox"
                                                            checked={isChecked}
                                                            onChange={() => {}} // handled by click wrapper
                                                            className="w-4 h-4 rounded-md text-[#02275A] border-slate-300 focus:ring-[#02275A] cursor-pointer"
                                                        />
                                                    </div>
 
                                                    <div className="flex-1 min-w-0 space-y-1.5">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[10px] font-black text-slate-400 font-mono tracking-wider">
                                                                {t.id}
                                                            </span>
                                                            <span className="text-[10px] font-bold text-slate-400 font-mono">
                                                                {t.updatedAt || t.createdAt}
                                                            </span>
                                                        </div>
 
                                                        <div className="flex items-center gap-2">
                                                            <h4 className={`text-xs truncate font-extrabold ${isUnread ? 'text-[#02275A]' : 'text-slate-800'}`}>
                                                                {t.customer.name}
                                                            </h4>
                                                            {isUnread && (
                                                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 animate-ping" title="Unread ticket update"></span>
                                                            )}
                                                        </div>
 
                                                        <p className={`text-[11px] truncate font-medium text-slate-500 ${isCurrent ? 'text-slate-900 font-bold' : ''}`}>
                                                            {t.subject}
                                                        </p>
 
                                                        <div className="flex items-center justify-between pt-1">
                                                            <span className="text-[9px] font-bold uppercase text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                                                {t.category}
                                                            </span>
                                                            <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                                                t.priority === 'Urgent' ? 'bg-rose-50 text-rose-600 border border-rose-100 font-extrabold' :
                                                                t.priority === 'High' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                                                t.priority === 'Medium' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                                                'bg-slate-50 text-slate-500 border border-slate-100'
                                                            }`}>
                                                                {t.priority}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )
                                ) : (
                                    filteredDirectEmails.length === 0 ? (
                                        <div className="p-8 text-center text-slate-400 text-xs font-semibold flex flex-col items-center justify-center h-48 gap-2 bg-white">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
                                                <i className="fas fa-envelope-open text-base"></i>
                                            </div>
                                            No direct emails found.
                                        </div>
                                    ) : (
                                        filteredDirectEmails.map(e => {
                                            const isCurrent = selectedDirectEmailId === e.id && !composeMode;
                                            return (
                                                <div
                                                    key={e.id}
                                                    onClick={() => {
                                                        setSelectedDirectEmailId(e.id);
                                                        setSelectedInboxTicketId(null);
                                                        setComposeMode(false);
                                                    }}
                                                    className={`p-4 transition-all duration-200 cursor-pointer flex gap-3.5 relative border-b border-slate-100 bg-white ${
                                                        isCurrent 
                                                            ? 'bg-slate-50 border-l-4 border-indigo-600' 
                                                            : 'hover:bg-slate-50/80 border-l-4 border-transparent'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-center text-indigo-500 pt-1">
                                                        <i className={`fas ${e.isBulk ? 'fa-mail-bulk' : 'fa-envelope'} text-xs`}></i>
                                                    </div>
 
                                                    <div className="flex-1 min-w-0 space-y-1.5">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[9px] font-black text-indigo-500 font-mono tracking-widest bg-indigo-50 px-1.5 py-0.5 rounded">
                                                                {e.id}
                                                            </span>
                                                            <span className="text-[10px] font-bold text-slate-400 font-mono">
                                                                {e.sentAt}
                                                            </span>
                                                        </div>
 
                                                        <div className="flex items-center gap-1.5">
                                                            <h4 className="text-xs truncate font-extrabold text-slate-800">
                                                                {e.recipientName}
                                                            </h4>
                                                            {e.isBulk && (
                                                                <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-100 px-1.5 py-0.2 rounded font-black font-mono">BROADCAST</span>
                                                            )}
                                                        </div>
 
                                                        <p className="text-[11px] truncate font-bold text-slate-700">
                                                            {e.subject}
                                                        </p>
 
                                                        <p className="text-[10px] truncate text-slate-400 leading-normal">
                                                            {e.body}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )
                                )}
                            </div>
                        </div>
 
                        {/* Right Column: Dynamic Workspace Viewport */}
                        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden flex flex-col h-[750px] relative transition-all duration-300">
                            {composeMode ? (
                                /* ============================================
                                   EMAIL COMPOSER WORKSPACE 
                                   ============================================ */
                                <div className="flex flex-col h-full bg-slate-50/20">
                                    {/* Composer Header */}
                                    <div className="p-5 bg-white border-b border-slate-100 flex items-center justify-between shadow-xs">
                                        <div className="space-y-0.5">
                                            <h3 className="text-xs font-black text-[#02275A] flex items-center gap-2 uppercase tracking-widest">
                                                <i className="fas fa-edit text-sm"></i> Dispatch Workspace
                                            </h3>
                                            <p className="text-[10px] text-slate-400 font-medium">
                                                Formulate and broadcast compliant communications instantly.
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setComposeMode(false);
                                                // select first ticket or email
                                                if (inboxSubTab === 'tickets' && filteredInboxTickets.length > 0) {
                                                    setSelectedInboxTicketId(filteredInboxTickets[0].id);
                                                    setInboxSubjectInput(`Re: [${filteredInboxTickets[0].id}] ${filteredInboxTickets[0].subject}`);
                                                } else if (inboxSubTab === 'direct' && filteredDirectEmails.length > 0) {
                                                    setSelectedDirectEmailId(filteredDirectEmails[0].id);
                                                }
                                            }}
                                            className="text-xs font-bold text-slate-500 hover:text-slate-800 px-3.5 py-2 rounded-xl hover:bg-slate-100 transition-all duration-200 cursor-pointer border-none bg-transparent"
                                        >
                                            Cancel
                                        </button>
                                    </div>
 
                                    {/* Composer Fields Content */}
                                    <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
                                        
                                        {/* Row 1: Recipient Strategy Type */}
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                                                <i className="fas fa-users text-[#02275A]/60"></i> Recipient Dispatch Strategy
                                            </label>
                                            <div className="grid grid-cols-3 gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setComposeRecipientType('individual');
                                                        setComposeRecipientEmail('');
                                                        setComposeRecipientName('');
                                                    }}
                                                    className={`py-2.5 px-3 border rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-200 ${
                                                        composeRecipientType === 'individual'
                                                            ? 'bg-[#02275A]/5 border-[#02275A] text-[#02275A] font-extrabold shadow-xs'
                                                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                                                    }`}
                                                >
                                                    <i className="fas fa-user text-[10px]"></i> Individual
                                                </button>
 
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setComposeRecipientType('all');
                                                        setComposeRecipientEmail('all-customers@system.broadcast');
                                                        setComposeRecipientName('All Registered Customers');
                                                    }}
                                                    className={`py-2.5 px-3 border rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-200 ${
                                                        composeRecipientType === 'all'
                                                            ? 'bg-[#02275A]/5 border-[#02275A] text-[#02275A] font-extrabold shadow-xs'
                                                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                                                    }`}
                                                >
                                                    <i className="fas fa-mail-bulk text-[10px]"></i> All Customers
                                                </button>
 
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setComposeRecipientType('bulk');
                                                    }}
                                                    disabled={selectedCustomerIds.length === 0}
                                                    className={`py-2.5 px-3 border rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed ${
                                                        composeRecipientType === 'bulk'
                                                            ? 'bg-[#02275A]/5 border-[#02275A] text-[#02275A] font-extrabold shadow-xs'
                                                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                                                    }`}
                                                    title={selectedCustomerIds.length === 0 ? "Select ticket checkboxes on the left directory to use bulk sending" : ""}
                                                >
                                                    <i className="fas fa-check-square text-[10px]"></i> Checked ({selectedCustomerIds.length})
                                                </button>
                                            </div>
                                        </div>
 
                                        {/* Row 2: Target Recipient Info */}
                                        {composeRecipientType === 'individual' && (
                                            <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm space-y-3">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                                                        Select Customer Profile
                                                    </label>
                                                    <select
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (val) {
                                                                const match = allSystemCustomers.find(c => c.email === val);
                                                                if (match) {
                                                                    setComposeRecipientEmail(match.email);
                                                                    setComposeRecipientName(match.name);
                                                                }
                                                            } else {
                                                                setComposeRecipientEmail('');
                                                                setComposeRecipientName('');
                                                            }
                                                        }}
                                                        className="w-full bg-slate-50 hover:bg-slate-100/50 border border-slate-200 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-[#02275A] focus:bg-white font-medium text-slate-700 transition-all cursor-pointer"
                                                    >
                                                        <option value="">-- Choose Existing Profile, or Custom below --</option>
                                                        {allSystemCustomers.map((cust, i) => (
                                                            <option key={i} value={cust.email}>
                                                                {cust.name} ({cust.email})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
 
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-extrabold uppercase text-slate-400">Recipient Name</label>
                                                        <input 
                                                            type="text"
                                                            value={composeRecipientName}
                                                            onChange={(e) => setComposeRecipientName(e.target.value)}
                                                            placeholder="John Doe"
                                                            className="w-full bg-slate-50/50 focus:bg-white border border-slate-200 text-xs rounded-xl px-3 py-2 outline-none focus:border-[#02275A] transition-all"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-extrabold uppercase text-slate-400">Recipient Email Address *</label>
                                                        <input 
                                                            type="email"
                                                            value={composeRecipientEmail}
                                                            onChange={(e) => setComposeRecipientEmail(e.target.value)}
                                                            placeholder="customer@example.com"
                                                            className="w-full bg-slate-50/50 focus:bg-white border border-slate-200 text-xs rounded-xl px-3 py-2 outline-none focus:border-[#02275A] transition-all"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
 
                                        {composeRecipientType === 'all' && (
                                            <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl flex items-start gap-3">
                                                <i className="fas fa-info-circle text-blue-600 mt-0.5"></i>
                                                <div>
                                                    <h4 className="text-xs font-bold text-[#02275A]">Broadcasting to ALL customers</h4>
                                                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                                                        This will construct and mail a general-purpose correspondence to all <strong>{allSystemCustomers.length}</strong> active profiles. The delivery log will record a unified entry under your Direct Emails catalog.
                                                    </p>
                                                </div>
                                            </div>
                                        )}
 
                                        {composeRecipientType === 'bulk' && (
                                            <div className="bg-amber-50/50 border border-amber-100/60 p-4 rounded-2xl space-y-2">
                                                <div className="flex items-start gap-3">
                                                    <i className="fas fa-mail-bulk text-amber-600 mt-0.5"></i>
                                                    <div>
                                                        <h4 className="text-xs font-bold text-amber-800">Broadcasting to Checked Contacts ({selectedCustomerIds.length})</h4>
                                                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                                                            Your broadcast message will append a formal response update to each of the <strong>{selectedCustomerIds.length}</strong> checked ticket streams simultaneously.
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="max-h-24 overflow-y-auto custom-scrollbar border border-amber-200/40 rounded-xl p-2 bg-white text-[10px] grid grid-cols-1 md:grid-cols-2 gap-1 font-mono text-slate-500">
                                                    {tickets.filter(t => selectedCustomerIds.includes(t.id)).map(t => (
                                                        <div key={t.id} className="truncate">
                                                            ● {t.customer.name} ({t.id})
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
 
                                        {/* Row 3: Link to Ticket (Optional) */}
                                        {composeRecipientType === 'individual' && (
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                                                    Link Email to Support Ticket (Optional)
                                                </label>
                                                <select
                                                    value={composeLinkedTicketId}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setComposeLinkedTicketId(val);
                                                        if (val) {
                                                            const t = tickets.find(ticket => ticket.id === val);
                                                            if (t) {
                                                                setComposeSubject(`Re: [${t.id}] ${t.subject}`);
                                                                setComposeRecipientEmail(t.customer.email);
                                                                setComposeRecipientName(t.customer.name);
                                                            }
                                                        } else {
                                                            setComposeSubject('');
                                                        }
                                                    }}
                                                    className="w-full bg-slate-50 hover:bg-slate-100/50 border border-slate-200 text-xs rounded-md px-3 py-2.5 outline-none focus:border-[#02275A] focus:bg-white font-medium text-slate-700 transition-all cursor-pointer"
                                                >
                                                    <option value="">No Ticket linkage (Direct Email/General Inquiries)</option>
                                                    {tickets.map(t => (
                                                        <option key={t.id} value={t.id}>
                                                            Ticket #{t.id} - {t.customer.name} - "{t.subject}"
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        {/* Row 4: Subject Line */}
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Email Subject line</label>
                                            <input 
                                                type="text"
                                                value={composeSubject}
                                                onChange={(e) => setComposeSubject(e.target.value)}
                                                placeholder="Enter clear, concise email subject line..."
                                                className="w-full bg-slate-50/30 focus:bg-white border border-slate-200 text-xs rounded-md px-3.5 py-2.5 outline-none focus:border-[#02275A] font-bold text-slate-800 transition-all"
                                            />
                                        </div>
  
                                        {/* Row 5: Body */}
                                        <div className="space-y-1 flex-1 flex flex-col">
                                            <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Email Message Body</label>
                                            <textarea
                                                rows={10}
                                                value={composeBody}
                                                onChange={(e) => setComposeBody(e.target.value)}
                                                placeholder="Write your beautiful message or formal document update here..."
                                                className="w-full bg-slate-50/30 focus:bg-white border border-slate-200 text-xs rounded-md px-4 py-3 outline-none focus:border-[#02275A] text-slate-700 resize-none min-h-[220px] transition-all leading-relaxed"
                                            />
                                        </div>
                                    </div>
  
                                    {/* Composer Footer Actions */}
                                    <div className="p-4 bg-white border-t border-slate-100 flex justify-between items-center shadow-xs">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                            <i className="fas fa-shield-alt text-emerald-500"></i> Secure Sandbox Delivery
                                        </span>
                                        <button
                                            type="button"
                                            onClick={handleSendNewDirectOrTicketEmail}
                                            disabled={!composeSubject.trim() || !composeBody.trim()}
                                            className="px-6 py-2.5 rounded-md text-xs font-bold transition-all duration-200 bg-[#02275A] hover:bg-[#02275A]/95 disabled:opacity-40 text-white shadow-md active:scale-95 flex items-center gap-2 cursor-pointer border-none"
                                        >
                                            <i className="fas fa-paper-plane text-[10px]"></i> Dispatch Digital Mail
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* ============================================
                                   VIEW THREAD OR VIEW EMAIL WORKSPACE 
                                   ============================================ */
                                inboxSubTab === 'tickets' && selectedTicket ? (
                                    <div className="flex flex-col h-full bg-slate-50/30">
                                        {/* Selected Ticket Thread Header */}
                                        <div className="p-5 bg-white border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-[10px] bg-[#02275A]/5 text-[#02275A] border border-[#02275A]/10 px-2 py-0.5 rounded-lg font-black font-mono">
                                                        {selectedTicket.id}
                                                    </span>
                                                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                                        selectedTicket.priority === 'Urgent' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                                                        selectedTicket.priority === 'High' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                                        'bg-slate-100 text-slate-600'
                                                    }`}>
                                                        {selectedTicket.priority} Priority
                                                    </span>
                                                    <span className="text-[9px] bg-sky-50 text-sky-600 border border-sky-100 px-2 py-0.5 rounded-full font-bold">
                                                        {selectedTicket.status}
                                                    </span>
                                                </div>
                                                <h3 className="text-sm font-black text-slate-800 leading-snug">
                                                    {selectedTicket.subject}
                                                </h3>
                                                <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 pt-0.5">
                                                    <i className="fas fa-user-circle text-slate-400"></i>
                                                    Customer: <span className="text-slate-800 font-bold">{selectedTicket.customer.name}</span> 
                                                    <span className="text-slate-400 font-mono text-[10px]">({selectedTicket.customer.email})</span>
                                                </p>
                                            </div>
                                        </div>
 
                                        {/* Message convo stream */}
                                        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar bg-slate-50/40">
                                            {/* Original Message Description */}
                                            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-3 max-w-[85%] font-medium animate-fade-in">
                                                <div className="flex items-center justify-between text-[10px] border-b border-slate-50 pb-2 font-bold text-slate-400">
                                                    <span className="text-[#02275A] flex items-center gap-1.5">
                                                        <i className="fas fa-file-contract text-[#02275A]"></i> Case Details
                                                    </span>
                                                    <span className="font-mono">{selectedTicket.createdAt}</span>
                                                </div>
                                                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                                                    {selectedTicket.description}
                                                </p>
                                                <div className="pt-2 text-[9px] text-slate-400 font-black uppercase tracking-widest bg-slate-50 px-2.5 py-1 rounded-lg w-fit">
                                                    Origin: {selectedTicket.ticketType} Portal
                                                </div>
                                            </div>
 
                                            {/* Ticket Comments & Sent Emails Timeline */}
                                            {selectedTicket.comments && selectedTicket.comments.map((cmt, index) => {
                                                const isEmailMessage = cmt.isEmail || cmt.text.includes('📧') || cmt.text.startsWith('Re:');
                                                return (
                                                    <div 
                                                        key={index} 
                                                        className={`rounded-3xl p-5 shadow-sm space-y-2.5 max-w-[85%] animate-fade-in ${
                                                            isEmailMessage 
                                                                ? 'bg-[#02275A]/5 border border-[#02275A]/10 ml-auto' 
                                                                : cmt.senderRole === 'Customer'
                                                                    ? 'bg-white border border-slate-100'
                                                                    : 'bg-[#02275A]/5 border border-[#02275A]/10 ml-auto'
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-between text-[10px] border-b border-black/5 pb-1.5 font-bold text-slate-400">
                                                            <span className="text-slate-700 flex items-center gap-1.5">
                                                                {isEmailMessage ? (
                                                                    <>
                                                                        <i className="fas fa-paper-plane text-[#02275A]"></i> 
                                                                        <span className="font-extrabold text-[#02275A]">Official Email Dispatch</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <i className="fas fa-user-circle text-slate-400"></i>
                                                                        <span className="font-extrabold text-slate-700">{cmt.senderName} ({cmt.senderRole})</span>
                                                                    </>
                                                                )}
                                                            </span>
                                                            <span className="font-mono">{cmt.createdAt}</span>
                                                        </div>
                                                        <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap pl-1">
                                                            {cmt.text}
                                                        </p>
                                                    </div>
                                                );
                                            })}
                                        </div>
 
                                        {/* Individual Thread Responder Form */}
                                        <div className="p-4 bg-white border-t border-slate-100 space-y-3 shadow-lg">
                                            <div className="flex items-center justify-between text-xs font-bold text-[#02275A] px-1">
                                                <span className="flex items-center gap-1.5">
                                                    <i className="fas fa-comment-dots text-[#02275A]"></i> Send Email Response
                                                </span>
                                                <span className="text-slate-400 font-semibold font-mono">To: {selectedTicket.customer.email}</span>
                                            </div>
 
                                            <div className="space-y-2.5">
                                                <input 
                                                    type="text"
                                                    value={inboxSubjectInput}
                                                    onChange={(e) => setInboxSubjectInput(e.target.value)}
                                                    placeholder="Subject line..."
                                                    className="w-full bg-slate-50 focus:bg-white border border-slate-200 text-xs rounded-md px-3.5 py-2.5 outline-none focus:border-[#02275A] font-bold text-slate-800 transition-all"
                                                />
                                                <div className="relative">
                                                    <textarea
                                                        rows={3}
                                                        value={inboxEmailBody}
                                                        onChange={(e) => setInboxEmailBody(e.target.value)}
                                                        placeholder="Write your email reply message to the customer... They will receive it instantly."
                                                        className="w-full bg-slate-50/30 focus:bg-white border border-slate-200 text-xs rounded-md px-3.5 py-3 outline-none focus:border-[#02275A] text-slate-700 resize-none min-h-[90px] transition-all leading-relaxed"
                                                    />
                                                </div>
                                                <div className="flex justify-between items-center bg-slate-50 p-2 rounded-md border border-dashed border-slate-200">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1.5 flex items-center gap-1.5">
                                                        <i className="fas fa-clipboard-check text-emerald-500"></i>
                                                        Saves as "Awaiting Reply"
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            handleSendIndividualEmail(selectedTicket.id, inboxSubjectInput, inboxEmailBody);
                                                            setInboxEmailBody('');
                                                        }}
                                                        disabled={!inboxEmailBody.trim()}
                                                        className="px-5 py-2 rounded-md text-xs font-bold transition-all duration-200 bg-[#02275A] hover:bg-[#02275A]/95 disabled:opacity-40 text-white shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer border-none"
                                                    >
                                                        <i className="fas fa-paper-plane text-[10px]"></i>
                                                        Send Email
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : inboxSubTab === 'direct' && selectedDirectEmail ? (
                                    /* ============================================
                                       DIRECT EMAIL FULL VIEWER
                                       ============================================ */
                                    <div className="flex flex-col h-full bg-slate-50/30">
                                        
                                        {/* Direct Email Header */}
                                        <div className="p-6 bg-white border-b border-slate-100 shadow-xs space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-lg font-mono uppercase tracking-widest">
                                                    {selectedDirectEmail.id}
                                                </span>
                                                <span className="text-xs text-slate-400 font-bold font-mono">
                                                    {selectedDirectEmail.sentAt}
                                                </span>
                                            </div>
 
                                            <h3 className="text-base font-black text-slate-800 leading-snug">
                                                {selectedDirectEmail.subject}
                                            </h3>
 
                                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-2 text-slate-500 font-bold">
                                                    <span className="bg-indigo-600 text-white w-7 h-7 rounded-full flex items-center justify-center font-black">
                                                        <i className="fas fa-user-shield text-[10px]"></i>
                                                    </span>
                                                    <div>
                                                        <p className="text-slate-800 font-extrabold text-[11px]">System Support Staff</p>
                                                        <p className="text-[10px] text-slate-400">Sender</p>
                                                    </div>
                                                </div>
 
                                                <div className="text-right">
                                                    <p className="text-slate-800 font-extrabold text-[11px]">
                                                        {selectedDirectEmail.recipientName}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 font-mono">
                                                        {selectedDirectEmail.recipientEmail}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
 
                                        {/* Email Content Body */}
                                        <div className="flex-1 overflow-y-auto p-6 bg-white">
                                            <div className="border border-slate-100 bg-slate-50/30 rounded-3xl p-6 shadow-xs max-w-2xl mx-auto space-y-4">
                                                <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100/55 pb-2">
                                                    <i className="fas fa-envelope-open-text text-indigo-500"></i> Dispatch Message Transmission Content
                                                </div>
                                                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                                                    {selectedDirectEmail.body}
                                                </p>
                                            </div>
                                        </div>
 
                                        {/* Quick Reply Trigger Footer */}
                                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                                <i className="fas fa-info-circle text-indigo-500"></i> Direct email dispatch thread
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setComposeMode(true);
                                                    setComposeRecipientType('individual');
                                                    setComposeRecipientEmail(selectedDirectEmail.recipientEmail);
                                                    setComposeRecipientName(selectedDirectEmail.recipientName);
                                                    setComposeSubject(`Re: ${selectedDirectEmail.subject}`);
                                                    setComposeBody(`\n\n--- On ${selectedDirectEmail.sentAt}, Support wrote:\n> ${selectedDirectEmail.body.replace(/\n/g, '\n> ')}`);
                                                    setComposeLinkedTicketId('');
                                                }}
                                                className="px-5 py-2.5 rounded-2xl text-xs font-bold transition-all bg-[#02275A] hover:bg-[#02275A]/95 text-white flex items-center gap-1.5 border-none cursor-pointer shadow-md"
                                            >
                                                <i className="fas fa-reply text-[10px]"></i> Send Follow-up
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    /* Welcome/Empty Area */
                                    <div className="p-8 text-center flex flex-col items-center justify-center h-full space-y-4 bg-slate-50/30">
                                        <div className="w-16 h-16 rounded-full bg-[#02275A]/5 flex items-center justify-center text-[#02275A] text-xl animate-pulse">
                                            <i className="fas fa-mail-bulk shadow-sm text-[#02275A]"></i>
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Select a Conversation</h3>
                                            <p className="text-xs text-slate-500 font-medium max-w-sm leading-relaxed mx-auto">
                                                Choose individual ticket holders or direct emails on the left panel to read or click the "Compose Message" button to send an official digital update!
                                            </p>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                );
            })()}

            {activeTab === 'analytics' && (
                <div className="space-y-5 animate-fade-in">
                    {/* Header Controls */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50/50 border border-slate-100 rounded-xl p-3">
                        <div>
                            <h3 className="font-extrabold text-slate-800 text-sm tracking-tight flex items-center gap-2">
                                <span className="w-1.5 h-3 bg-[#02275A] rounded-full"></span>
                                Performance & SLA Dashboard
                            </h3>
                            <p className="text-[11px] text-slate-400 font-medium">Real-time resolution rates and team productivity metrics</p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                            <select 
                                className="text-[11px] shadow-xs font-bold border border-slate-200/80 rounded-md px-2.5 py-1.5 bg-white hover:bg-slate-50 transition-colors outline-none cursor-pointer text-slate-700"
                                value={analyticsDatePreset}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setAnalyticsDatePreset(val);
                                    if (val !== 'Custom') {
                                        setAnalyticsCustomFrom('');
                                        setAnalyticsCustomTo('');
                                    }
                                }}
                            >
                                <option value="Last 7 Days">Last 7 Days</option>
                                <option value="Last 30 Days">Last 30 Days</option>
                                <option value="This Month">This Month</option>
                                <option value="Custom">Custom Period...</option>
                            </select>
                            {analyticsDatePreset === 'Custom' && (
                                <div className="flex items-center gap-1.5 animate-fade-in">
                                    <div className="flex items-center gap-1">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase">From</span>
                                        <input 
                                            type="date"
                                            className="text-[10px] shadow-xs font-bold border border-slate-200/80 rounded-md px-2 py-1 bg-white hover:bg-slate-50 transition-colors outline-none cursor-pointer text-slate-700"
                                            value={analyticsCustomFrom}
                                            onChange={(e) => setAnalyticsCustomFrom(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase">To</span>
                                        <input 
                                            type="date"
                                            className="text-[10px] shadow-xs font-bold border border-slate-200/80 rounded-md px-2 py-1 bg-white hover:bg-slate-50 transition-colors outline-none cursor-pointer text-slate-700"
                                            value={analyticsCustomTo}
                                            onChange={(e) => setAnalyticsCustomTo(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Compact Metrics Bento Grid */}
                    {(() => {
                        const urgentOpen = analyticsTickets.filter(t => (t.status === 'Open' || t.status === 'In Progress') && (t.priority === 'Urgent' || t.priority === 'High')).length;
                        return (
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-white border border-slate-100 rounded-xl p-3.5 shadow-xs flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-[#02275A]/5 text-[#02275A] flex items-center justify-center text-sm shrink-0">
                                        <i className="fas fa-inbox"></i>
                                    </div>
                                    <div>
                                        <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Total Received</span>
                                        <p className="text-lg font-black text-slate-800 leading-none mt-0.5">{totalTickets}</p>
                                    </div>
                                </div>

                                <div className="bg-white border border-slate-100 rounded-xl p-3.5 shadow-xs flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-amber-500/5 text-amber-600 flex items-center justify-center text-sm shrink-0">
                                        <i className="fas fa-clock"></i>
                                    </div>
                                    <div>
                                        <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">In Open Queue</span>
                                        <p className="text-lg font-black text-amber-600 leading-none mt-0.5">{openTickets}</p>
                                    </div>
                                </div>

                                <div className="bg-white border border-slate-100 rounded-xl p-3.5 shadow-xs flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-rose-500/5 text-rose-600 flex items-center justify-center text-sm shrink-0">
                                        <i className="fas fa-exclamation-triangle"></i>
                                    </div>
                                    <div>
                                        <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">High & Urgent</span>
                                        <p className="text-lg font-black text-rose-600 leading-none mt-0.5">{urgentOpen}</p>
                                    </div>
                                </div>

                                <div className="bg-white border border-slate-100 rounded-xl p-3.5 shadow-xs flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-emerald-500/5 text-emerald-600 flex items-center justify-center text-sm shrink-0">
                                        <i className="fas fa-check-circle"></i>
                                    </div>
                                    <div>
                                        <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Resolved Rate</span>
                                        <p className="text-lg font-black text-emerald-600 leading-none mt-0.5">
                                            {resolvedTickets} <span className="text-[10px] font-bold text-slate-400 font-mono">({totalTickets > 0 ? ((resolvedTickets / totalTickets) * 100).toFixed(0) : 0}%)</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

                    {/* Additional Reports Area */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Tickets by Category */}
                        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-xs flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-4 border-b border-slate-50 pb-2">
                                    <div>
                                        <h4 className="font-extrabold text-slate-800 text-xs tracking-tight">Support Requests by Topic</h4>
                                        <p className="text-[10px] text-slate-400 font-medium">Distribution across key service categories</p>
                                    </div>
                                    <span className="text-[9px] bg-slate-50 border border-slate-200/40 px-2 py-0.5 rounded-md font-bold text-slate-500 font-mono">
                                        Topic Analysis
                                    </span>
                                </div>

                                <div className="space-y-3 pt-1">
                                    {(() => {
                                        const displayTotal = displayCats.reduce((acc, current) => acc + (current[1] as number), 0) || 1;
                                        return displayCats.map(([catName, count]) => {
                                            const countNum = count as number;
                                            const pct = displayTotal > 0 ? (countNum / displayTotal) * 100 : 0;
                                            const barColor = 
                                                catName.includes('Tech') ? 'bg-gradient-to-r from-[#02275A] to-blue-600' :
                                                catName.includes('Bill') ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
                                                catName.includes('Query') || catName.includes('General') ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                                                'bg-gradient-to-r from-amber-500 to-orange-500';

                                            return (
                                                <div key={catName} className="group/cat">
                                                    <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1">
                                                        <span className="group-hover/cat:text-[#02275A] transition-colors">{catName}</span>
                                                        <span className="font-mono text-slate-500 text-[10px] flex items-center gap-1.5">
                                                            <span className="font-bold text-slate-800">{countNum}</span>
                                                            <span className="text-slate-300">|</span>
                                                            <span>{pct.toFixed(0)}%</span>
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-slate-100/70 rounded-full h-1.5 overflow-hidden">
                                                        <div 
                                                            className={`${barColor} h-1.5 rounded-full transition-all duration-700 ease-out`} 
                                                            style={{ width: `${pct}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                            </div>
                        </div>

                        {/* Tickets by Priority */}
                        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-xs flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-0 border-b border-slate-50 pb-1">
                                    <div>
                                        <h4 className="font-extrabold text-slate-800 text-xs tracking-tight">Queue Breakdown by Severity</h4>
                                        <p className="text-[10px] text-slate-400 font-medium">Real-time status of service level agreement queues</p>
                                    </div>
                                    <span className="text-[9px] bg-slate-50 border border-slate-200/40 px-2 py-0.5 rounded-md font-bold text-slate-500 font-mono">
                                        {pTotal} Classified
                                    </span>
                                </div>

                                {/* Shorter Graph Area */}
                                <div className="relative pt-0 pb-1 px-1 border-b border-slate-100/60">
                                    {/* Grid Lines */}
                                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                                        <div className="border-t border-dashed border-slate-100 h-0 w-full"></div>
                                        <div className="border-t border-dashed border-slate-100 h-0 w-full"></div>
                                        <div className="border-t border-dashed border-slate-100 h-0 w-full"></div>
                                    </div>

                                    {/* Columns */}
                                    <div className="relative z-10 flex h-20 items-end gap-3 px-1">
                                        {[
                                            { 
                                                name: 'Low', 
                                                count: pCounts.Low, 
                                                color: 'bg-gradient-to-t from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500', 
                                                shadow: 'shadow-emerald-500/10',
                                                hoverGlow: 'group-hover:shadow-[0_4px_12px_rgba(16,185,129,0.25)]',
                                                textColor: 'text-emerald-600 group-hover:text-emerald-700',
                                                badgeBg: 'bg-emerald-50/80 border-emerald-200/50'
                                            },
                                            { 
                                                name: 'Medium', 
                                                count: pCounts.Medium, 
                                                color: 'bg-gradient-to-t from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500', 
                                                shadow: 'shadow-amber-500/10',
                                                hoverGlow: 'group-hover:shadow-[0_4px_12px_rgba(245,158,11,0.25)]',
                                                textColor: 'text-amber-600 group-hover:text-amber-700',
                                                badgeBg: 'bg-amber-50/80 border-amber-200/50'
                                            },
                                            { 
                                                name: 'High', 
                                                count: pCounts.High, 
                                                color: 'bg-gradient-to-t from-orange-500 to-rose-400 hover:from-orange-600 hover:to-rose-500', 
                                                shadow: 'shadow-orange-500/10',
                                                hoverGlow: 'group-hover:shadow-[0_4px_12px_rgba(249,115,22,0.25)]',
                                                textColor: 'text-orange-600 group-hover:text-orange-700',
                                                badgeBg: 'bg-orange-50/80 border-orange-200/50'
                                            },
                                            { 
                                                name: 'Urgent', 
                                                count: pCounts.Urgent, 
                                                color: 'bg-gradient-to-t from-rose-600 to-red-500 hover:from-rose-700 hover:to-red-600', 
                                                shadow: 'shadow-rose-600/10',
                                                hoverGlow: 'group-hover:shadow-[0_4px_12px_rgba(225,29,72,0.3)]',
                                                textColor: 'text-rose-600 group-hover:text-rose-700',
                                                badgeBg: 'bg-rose-50/80 border-rose-200/50'
                                            }
                                        ].map(item => {
                                            const pct = pTotal > 0 ? (item.count / pTotal) * 100 : 0;
                                            const displayHeight = pMax > 0 ? (item.count / pMax) * 75 + 25 : 25;

                                            return (
                                                <button
                                                    key={item.name}
                                                    type="button"
                                                    onClick={() => {
                                                        setPriorityFilter(item.name);
                                                        setActiveTab('tickets');
                                                    }}
                                                    className="flex-1 flex flex-col justify-end items-center group cursor-pointer focus:outline-none bg-transparent border-none p-0 transition-transform duration-200 hover:-translate-y-0.5"
                                                    title={`Filter queue by ${item.name}`}
                                                >
                                                    <div className="w-full relative flex flex-col items-center">
                                                        {/* Beautiful Count Badge with appropriate category color above the bar */}
                                                        <span className={`text-[11px] font-black ${item.textColor} ${item.badgeBg} border rounded-full w-5.5 h-5.5 flex items-center justify-center shadow-xs transition-all duration-200 group-hover:scale-110 mb-2 font-mono`}>
                                                            {item.count}
                                                        </span>

                                                        {/* Premium Bar Design with glow */}
                                                        <div 
                                                            className={`w-full ${item.color} rounded-t-lg transition-all duration-300 relative flex items-start justify-center shadow-xs ${item.shadow} ${item.hoverGlow}`} 
                                                            style={{ height: `${displayHeight}%` }}
                                                        >
                                                            {/* Delicate white premium top highlight shine */}
                                                            <div className="absolute top-0.5 left-0.5 right-0.5 h-1 bg-white/20 rounded-t-md"></div>
                                                        </div>
                                                    </div>
                                                    {/* Leave space before listing low, medium, high, and urgent */}
                                                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-3.5 group-hover:text-[#02275A] transition-colors leading-none">
                                                        {item.name}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Detailed SLA Metrics List */}
                                <div className="mt-5 space-y-1">
                                    {[
                                        { name: 'Low', count: pCounts.Low, sla: '48hr SLA Target', icon: 'fa-circle text-emerald-400' },
                                        { name: 'Medium', count: pCounts.Medium, sla: '24hr SLA Target', icon: 'fa-circle text-amber-400' },
                                        { name: 'High', count: pCounts.High, sla: '4hr Urgent Response', icon: 'fa-exclamation-circle text-orange-400' },
                                        { name: 'Urgent', count: pCounts.Urgent, sla: '1hr Escalation Response', icon: 'fa-radiation text-rose-500 animate-pulse' }
                                    ].map(item => {
                                        const pct = pTotal > 0 ? (item.count / pTotal) * 100 : 0;
                                        return (
                                            <div 
                                                key={item.name} 
                                                onClick={() => {
                                                    setPriorityFilter(item.name);
                                                    setActiveTab('tickets');
                                                }}
                                                className="flex items-center justify-between py-1 px-1.5 hover:bg-slate-50 border border-transparent hover:border-slate-100 rounded-lg cursor-pointer transition-all group"
                                            >
                                                <div className="flex items-center gap-1.5">
                                                    <i className={`fas ${item.icon} text-[8px]`}></i>
                                                    <span className="text-xs font-bold text-slate-700 text-left">{item.name}</span>
                                                    <span className="text-[9px] text-slate-400 font-medium">({item.sla})</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[10px] font-bold text-slate-500 font-mono">{pct.toFixed(0)}%</span>
                                                    <span className="text-[9px] font-bold bg-slate-50 group-hover:bg-slate-100 text-slate-600 border border-slate-200/30 px-1.5 py-0.5 rounded">
                                                        {item.count} tickets
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Staff Performance Table */}
                    <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-3 border-b border-slate-50 pb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 text-xs">
                                    <i className="fas fa-users-cog"></i>
                                </div>
                                <h4 className="font-extrabold text-slate-800 text-xs tracking-tight">Staff Performance Grid</h4>
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium">Average CSAT: 4.63 ★</span>
                        </div>
                        
                        <div className="overflow-x-auto rounded-lg border border-slate-100">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50 text-[9px] uppercase text-slate-500 font-bold tracking-wider border-b border-slate-100">
                                        <th className="py-2 px-3">Staff Member</th>
                                        <th className="py-2 px-3">Tickets Assigned</th>
                                        <th className="py-2 px-3">Resolved</th>
                                        <th className="py-2 px-3">Avg. Response Time</th>
                                        <th className="py-2 px-3">Satisfaction (CSAT)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs">
                                    <tr className="hover:bg-slate-50/50 transition-colors">
                                        <td className="py-2 px-3 font-bold text-slate-800 flex items-center gap-2">
                                            <div className="w-6.5 h-6.5 rounded-full bg-[#02275A] text-white flex items-center justify-center text-[9px] font-bold shadow-xs shrink-0">SO</div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-800 text-xs">Sarah O.</span>
                                                <span className="text-[9px] text-slate-400 font-medium leading-none">Senior Support Staff</span>
                                            </div>
                                        </td>
                                        <td className="py-2 px-3 font-bold text-slate-600">24</td>
                                        <td className="py-2 px-3">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-emerald-600 font-bold">21</span>
                                                <span className="text-[9px] text-emerald-500 bg-emerald-50 px-1 py-0.2 rounded font-mono font-bold">87% rate</span>
                                            </div>
                                        </td>
                                        <td className="py-2 px-3">
                                            <span className="font-semibold text-slate-700">1h 15m</span>
                                        </td>
                                        <td className="py-2 px-3">
                                            <div className="flex items-center gap-1">
                                                <div className="flex text-amber-400 text-[9px]">
                                                    <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star-half-alt"></i>
                                                </div>
                                                <span className="font-bold text-xs text-slate-800">4.8</span>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-slate-50/50 transition-colors">
                                        <td className="py-2 px-3 font-bold text-slate-800 flex items-center gap-2">
                                            <div className="w-6.5 h-6.5 rounded-full bg-[#02275A] text-white flex items-center justify-center text-[9px] font-bold shadow-xs shrink-0">MT</div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-800 text-xs">Mike T.</span>
                                                <span className="text-[9px] text-slate-400 font-medium leading-none">Technical Support</span>
                                            </div>
                                        </td>
                                        <td className="py-2 px-3 font-bold text-slate-600">18</td>
                                        <td className="py-2 px-3">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-emerald-600 font-bold">15</span>
                                                <span className="text-[9px] text-emerald-500 bg-emerald-50 px-1 py-0.2 rounded font-mono font-bold">83% rate</span>
                                            </div>
                                        </td>
                                        <td className="py-2 px-3">
                                            <span className="font-semibold text-amber-600">2h 30m</span>
                                        </td>
                                        <td className="py-2 px-3">
                                            <div className="flex items-center gap-1">
                                                <div className="flex text-amber-400 text-[9px]">
                                                    <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="far fa-star"></i>
                                                </div>
                                                <span className="font-bold text-xs text-slate-800">4.2</span>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-slate-50/50 transition-colors">
                                        <td className="py-2 px-3 font-bold text-slate-800 flex items-center gap-2">
                                            <div className="w-6.5 h-6.5 rounded-full bg-[#02275A] text-white flex items-center justify-center text-[9px] font-bold shadow-xs shrink-0">JD</div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-800 text-xs">John D.</span>
                                                <span className="text-[9px] text-slate-400 font-medium leading-none">Billing Support</span>
                                            </div>
                                        </td>
                                        <td className="py-2 px-3 font-bold text-slate-600">32</td>
                                        <td className="py-2 px-3">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-emerald-600 font-bold">30</span>
                                                <span className="text-[9px] text-emerald-500 bg-emerald-50 px-1 py-0.2 rounded font-mono font-bold">93% rate</span>
                                            </div>
                                        </td>
                                        <td className="py-2 px-3">
                                            <span className="font-semibold text-emerald-600">45m</span>
                                        </td>
                                        <td className="py-2 px-3">
                                            <div className="flex items-center gap-1">
                                                <div className="flex text-amber-400 text-[9px]">
                                                    <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
                                                </div>
                                                <span className="font-bold text-xs text-slate-800">4.9</span>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}


             {isCreateModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col border border-slate-100 max-h-[90vh] overflow-hidden">
                        <div className="px-5 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                <h3 className="font-extrabold text-slate-800 text-sm">Create Support Ticket</h3>
                            </div>
                            <button 
                                onClick={() => setIsCreateModalOpen(false)}
                                className="text-slate-400 hover:text-rose-500 transition-colors w-7 h-7 flex items-center justify-center rounded-full hover:bg-rose-50 cursor-pointer"
                            >
                                <i className="fas fa-times text-xs"></i>
                            </button>
                        </div>
                        <div className="p-5 overflow-y-auto flex-1">
                            <form 
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.currentTarget);
                                    
                                    const autoSend = formData.get('autoSendEmail') === 'on';
                                    const customerEmail = customerEmailInput || (formData.get('customerEmail') as string);
                                    const customerName = customerNameInput || (formData.get('customerName') as string);
                                    const ticketId = `TKT-${new Date().getFullYear()}-00${tickets.length + 1}`;
                                    
                                    let emailSentStatus: 'Sent' | 'Failed' | 'Not Sent' = 'Not Sent';
                                    let emailSentBool: boolean | undefined = undefined;
                                    let ticketComments: TicketComment[] = [];

                                    if (autoSend) {
                                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                                        const isValidEmail = emailRegex.test(customerEmail);
                                        
                                        if (isValidEmail) {
                                            emailSentStatus = 'Sent';
                                            emailSentBool = true;
                                            
                                            const emailComment: TicketComment = {
                                                senderRole: userRole,
                                                senderName: userRole === 'support-staff' ? 'Tech Support Staff' : 'System Support',
                                                text: `📧 [Sent Email to ${customerEmail}]\nSubject: Support Ticket Reference - #${ticketId}\n\nDear ${customerName || 'Customer'},\n\nWe have received your support ticket and our team has been notified. Here are your ticket details:\n\n- Ticket ID: #${ticketId}\n- Subject: ${formData.get('subject') as string}\n- Category: ${formData.get('category') as string || 'General Query'}\n- Priority: ${formData.get('priority') as string || 'Medium'}\n\nDescription:\n${formData.get('description') as string}\n\nOur average response time is under 2 hours. We will notify you as soon as there is an update.\n\nBest regards,\nCustomer Experience Support Team`,
                                                createdAt: new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true, month: 'short', day: 'numeric', year: 'numeric' }),
                                                isEmail: true,
                                                recipientEmail: customerEmail
                                            };
                                            ticketComments = [emailComment];
                                        } else {
                                            emailSentStatus = 'Failed';
                                            emailSentBool = false;
                                        }
                                    }

                                    const newTicket: SupportTicket = {
                                        id: ticketId,
                                        customer: {
                                            name: customerName,
                                            email: customerEmail,
                                        },
                                        subject: formData.get('subject') as string,
                                        description: formData.get('description') as string,
                                        assignedStaff: formData.get('assignedStaff') as string || null,
                                        createdBy: selectedType,
                                        category: formData.get('category') as string || 'General Query',
                                        priority: formData.get('priority') as 'Urgent' | 'High' | 'Medium' | 'Low' || 'Medium',
                                        status: formData.get('status') as any || 'Open',
                                        createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                                        updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                                        businessName: selectedType === 'Customer' ? (formData.get('businessName') as string) : undefined,
                                        brmName: selectedType === 'BRM' ? customerNameInput : (formData.get('brmName') as string),
                                        stateManager: selectedType === 'State Manager' ? customerNameInput : (formData.get('stateManager') as string),
                                        attachments: attachments.map(f => f.name),
                                        tags: newTags,
                                        ticketType: selectedType,
                                        targetName: customerName,
                                        autoEmailSent: emailSentBool,
                                        autoEmailSentStatus: emailSentStatus,
                                        comments: ticketComments,
                                    };
                                    
                                    setTickets([newTicket, ...tickets]);
                                    addLocalSupportNotification({
                                        ticketId: newTicket.id,
                                        title: 'New Support Ticket Raised',
                                        message: `Ticket #${newTicket.id} "${newTicket.subject}" created for ${newTicket.customer.name} (Priority: ${newTicket.priority}).`,
                                        type: newTicket.priority === 'Urgent' ? 'error' : newTicket.priority === 'High' ? 'warning' : 'info'
                                    });
                                    
                                    if (emailSentStatus === 'Sent') {
                                        showSuccess(`Ticket created successfully! Auto-confirmation email successfully sent to ${customerEmail}.`);
                                    } else if (emailSentStatus === 'Failed') {
                                        showWarning(`Ticket created successfully, but auto-sending email failed (invalid email format: "${customerEmail}").`);
                                    } else {
                                        showSuccess('Ticket created successfully! (Auto-send email disabled)');
                                    }

                                    setIsCreateModalOpen(false);
                                    setNewTags([]); // Reset tags
                                    setAttachments([]);
                                    setCustomerEmailInput('');
                                    setCustomerNameInput('');
                                }}
                                className="space-y-4"
                            >
                                {/* Dynamic Creator Selector depending on Ticket Type */}
                                <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-200">
                                    <span id="creator-type-label" className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Ticket Creator Type</span>
                                    <div role="group" aria-labelledby="creator-type-label" className="grid grid-cols-4 gap-2">
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
                                                    aria-pressed={isSelected}
                                                    onClick={() => {
                                                        setSelectedType(type);
                                                    }}
                                                    className={`py-2 px-1 text-xs font-bold rounded-lg border flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer ${
                                                        isSelected 
                                                            ? 'bg-[#02275A]/10 text-[#02275A] border-[#02275A] ring-2 ring-[#02275A]/20 font-black' 
                                                            : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400 hover:bg-slate-50'
                                                    }`}
                                                >
                                                    <i className={`fas ${getIcon()} text-xs ${isSelected ? 'text-[#02275A]' : 'text-slate-500'}`}></i>
                                                    <span className="leading-tight text-[11px]">{type}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-3.5">
                                    {/* Left Column: Subject, Description, Tags, Type options */}
                                    <div className="space-y-3">
                                        <div>
                                            <label htmlFor="ticket-subject" className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 block">Subject</label>
                                            <input id="ticket-subject" required name="subject" type="text" className="w-full p-2.5 border border-slate-300 hover:border-slate-400 rounded-lg text-xs text-slate-800 bg-white focus:outline-none focus:border-[#02275A] focus:ring-2 focus:ring-[#02275A]/20 transition-all" placeholder="E.g. Unable to print receipt ticket" />
                                        </div>

                                        <div>
                                            <label htmlFor="ticket-description" className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 block">Description</label>
                                            <textarea id="ticket-description" required name="description" rows={3} className="w-full p-2.5 border border-slate-300 hover:border-slate-400 rounded-lg text-xs text-slate-800 bg-white focus:outline-none focus:border-[#02275A] focus:ring-2 focus:ring-[#02275A]/20 transition-all resize-none" placeholder="Describe the concern or query in detail..."></textarea>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2">
                                            <div>
                                                <label htmlFor="ticket-status" className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 block">Status</label>
                                                <select id="ticket-status" name="status" className="w-full p-2.5 border border-slate-300 hover:border-slate-400 rounded-lg text-xs font-bold text-slate-700 bg-white focus:outline-none focus:border-[#02275A] focus:ring-2 focus:ring-[#02275A]/20 transition-all">
                                                    <option value="Open">Open</option>
                                                    <option value="In Progress">In Progress</option>
                                                    <option value="Awaiting Reply">Awaiting Reply</option>
                                                    <option value="Resolved">Resolved</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label htmlFor="ticket-priority" className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 block">Priority</label>
                                                <select id="ticket-priority" name="priority" className="w-full p-2.5 border border-slate-300 hover:border-slate-400 rounded-lg text-xs font-bold text-slate-700 bg-white focus:outline-none focus:border-[#02275A] focus:ring-2 focus:ring-[#02275A]/20 transition-all">
                                                    <option value="Low">Low</option>
                                                    <option value="Medium">Medium</option>
                                                    <option value="High">High</option>
                                                    <option value="Urgent">Urgent</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label htmlFor="ticket-category" className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 block">Category</label>
                                                <select id="ticket-category" name="category" className="w-full p-2.5 border border-slate-300 hover:border-slate-400 rounded-lg text-xs font-bold text-slate-700 bg-white focus:outline-none focus:border-[#02275A] focus:ring-2 focus:ring-[#02275A]/20 transition-all">
                                                    <option value="Technical Issue">Tech Issue</option>
                                                    <option value="Billing">Billing</option>
                                                    <option value="General Query">Query</option>
                                                    <option value="Feedback">Feedback</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="ticket-tags" className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 block">Tags (Optional)</label>
                                            <div className="flex gap-1.5 mb-1.5">
                                                <input 
                                                    id="ticket-tags"
                                                    type="text" 
                                                    value={tagInput}
                                                    onChange={(e) => setTagInput(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            if (tagInput.trim() && !newTags.includes(tagInput.trim())) {
                                                                setNewTags([...newTags, tagInput.trim()]);
                                                                setTagInput('');
                                                            }
                                                        }
                                                    }}
                                                    className="flex-1 p-2.5 border border-slate-300 hover:border-slate-400 rounded-lg text-xs text-slate-800 bg-white focus:outline-none focus:border-[#02275A] focus:ring-2 focus:ring-[#02275A]/20 transition-all" 
                                                    placeholder="Press enter to add tag" 
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (tagInput.trim() && !newTags.includes(tagInput.trim())) {
                                                            setNewTags([...newTags, tagInput.trim()]);
                                                            setTagInput('');
                                                        }
                                                    }}
                                                    className="px-4 bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 rounded-lg transition-colors text-xs cursor-pointer"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                            {newTags.length > 0 && (
                                                <div className="flex flex-wrap gap-1 max-h-[44px] overflow-y-auto">
                                                    {newTags.map(tag => (
                                                        <span key={tag} className="px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-bold rounded flex items-center gap-1.5">
                                                            {tag}
                                                            <button 
                                                                type="button" 
                                                                onClick={() => setNewTags(newTags.filter(t => t !== tag))}
                                                                aria-label={`Remove tag ${tag}`}
                                                                className="w-4 h-4 flex items-center justify-center rounded hover:bg-indigo-100 hover:text-indigo-900 transition-colors text-indigo-600"
                                                            >
                                                                <i className="fas fa-times text-[9px]"></i>
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right Column: Customer/Specialty Association, Assigned Support, Attachments */}
                                    <div className="space-y-3">
                                        <div>
                                            <label htmlFor="ticket-business-name" className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 block">Business Name</label>
                                            <SearchableSelect 
                                                options={businessList} 
                                                name="businessName" 
                                                id="ticket-business-name"
                                                placeholder="Search Business Name..." 
                                                onSelect={(val) => {
                                                    const biz = businessListData.find(b => b.name === val);
                                                    if (biz) {
                                                        setCustomerNameInput(biz.cname);
                                                        setCustomerEmailInput(biz.email);
                                                    }
                                                }}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label htmlFor="ticket-customer-name" className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 block">Customer Name</label>
                                                <input id="ticket-customer-name" required name="customerName" value={customerNameInput} onChange={e => setCustomerNameInput(e.target.value)} type="text" className="w-full p-2.5 border border-slate-300 hover:border-slate-400 rounded-lg text-xs text-slate-800 bg-white focus:outline-none focus:border-[#02275A] focus:ring-2 focus:ring-[#02275A]/20 transition-all" placeholder="E.g. John Doe" />
                                            </div>

                                            <div>
                                                <label htmlFor="ticket-customer-email" className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 block">Customer Email</label>
                                                <input id="ticket-customer-email" required name="customerEmail" value={customerEmailInput} onChange={e => setCustomerEmailInput(e.target.value)} type="email" className="w-full p-2.5 border border-slate-300 hover:border-slate-400 rounded-lg text-xs text-slate-800 bg-white focus:outline-none focus:border-[#02275A] focus:ring-2 focus:ring-[#02275A]/20 transition-all" placeholder="email@address.com" />
                                            </div>
                                        </div>

                                        {/* Specialty linkers based on Creator Type */}
                                        {selectedType === 'BRM' && (
                                            <div>
                                                <label htmlFor="ticket-brm-name" className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 block">BRM / Agent Name</label>
                                                <SearchableSelect 
                                                    options={brmList} 
                                                    name="brmName" 
                                                    id="ticket-brm-name"
                                                    placeholder="Search BRM..." 
                                                    onSelect={(val) => {
                                                        setCustomerNameInput(val);
                                                        setCustomerEmailInput(`${val.toLowerCase().replace(/ /g, '')}@prokip.com`);
                                                    }}
                                                />
                                            </div>
                                        )}

                                        {selectedType === 'State Manager' && (
                                            <div>
                                                <label htmlFor="ticket-statemanager-name" className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 block">State Manager Name</label>
                                                <SearchableSelect 
                                                    options={stateManagerList} 
                                                    name="stateManager" 
                                                    id="ticket-statemanager-name"
                                                    placeholder="Search State Manager..." 
                                                    onSelect={(val) => {
                                                        setCustomerNameInput(val);
                                                        setCustomerEmailInput(`${val.toLowerCase().replace(/ /g, '')}@prokip.com`);
                                                    }}
                                                />
                                            </div>
                                        )}

                                        {selectedType === 'Partner' && (
                                            <div>
                                                <label htmlFor="ticket-partner-name" className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 block">Partner Platform Name</label>
                                                <SearchableSelect 
                                                    options={partnerList} 
                                                    name="partnerName" 
                                                    id="ticket-partner-name"
                                                    placeholder="Search Partner..." 
                                                    onSelect={(val) => {
                                                        setCustomerNameInput(val);
                                                        setCustomerEmailInput(`${val.toLowerCase().replace(/ /g, '')}@partnernetwork.com`);
                                                    }}
                                                />
                                            </div>
                                        )}

                                        <div>
                                            <label htmlFor="ticket-assigned-staff" className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 block">Name of Support (Assigned Staff)</label>
                                            <SearchableSelect id="ticket-assigned-staff" options={supportStaffList} name="assignedStaff" placeholder="Search Support Staff..." />
                                        </div>

                                        <div>
                                            <label htmlFor="ticket-attachments" className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 block">Attachments (Image/Video)</label>
                                            <input 
                                                id="ticket-attachments"
                                                type="file" 
                                                multiple
                                                accept="image/*,video/*"
                                                onChange={(e) => {
                                                    if (e.target.files) {
                                                        setAttachments(Array.from(e.target.files));
                                                    }
                                                }}
                                                className="w-full text-xs text-slate-600
                                                  file:mr-2.5 file:py-1.5 file:px-3
                                                  file:rounded-full file:border-0
                                                  file:text-xs file:font-bold
                                                  file:bg-indigo-50 file:text-indigo-800
                                                  hover:file:bg-indigo-100 cursor-pointer"
                                            />
                                            {attachments.length > 0 && (
                                                <div className="mt-1 flex gap-1 flex-wrap max-h-[44px] overflow-y-auto">
                                                    {attachments.map((file, idx) => (
                                                        <div key={idx} className="text-[10px] bg-slate-50 border border-slate-200 text-slate-700 px-2 py-0.5 rounded flex items-center shadow-none font-medium">
                                                            <i className={`fas ${file.type.startsWith('video/') ? 'fa-video' : 'fa-image'} mr-1 text-slate-500`}></i>
                                                            {file.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Auto Send Email Option */}
                                <div className="p-3 bg-indigo-50/20 rounded-xl border border-indigo-100/60 flex items-start gap-3 mt-4">
                                    <div className="flex items-center h-5">
                                        <input 
                                            id="ticket-auto-send-email" 
                                            name="autoSendEmail" 
                                            type="checkbox" 
                                            defaultChecked 
                                            className="w-4 h-4 text-[#02275A] border-slate-300 rounded focus:ring-2 focus:ring-[#02275A]/20 transition-all cursor-pointer" 
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label htmlFor="ticket-auto-send-email" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                                            Auto-send confirmation email to customer
                                        </label>
                                        <span className="text-[10px] text-slate-500 font-medium leading-relaxed">
                                            If selected, an email containing the ticket reference ID, subject, and description will be dispatched immediately to the customer's email.
                                        </span>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            setIsCreateModalOpen(false);
                                            setCustomerNameInput('');
                                            setCustomerEmailInput('');
                                            setAttachments([]);
                                        }}
                                        className="px-4 py-1.5 text-slate-600 font-bold hover:bg-slate-50 rounded-lg transition-colors text-xs cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        className="px-5 py-1.5 bg-[#02275A] hover:bg-[#033b8a] text-white font-extrabold rounded-lg hover:shadow active:scale-95 text-xs transition-all cursor-pointer"
                                    >
                                        Create Ticket
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Escalate Ticket Modal */}
            {escalateTicket && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-rose-100 bg-rose-50/50 flex justify-between items-center">
                            <div className="flex items-center gap-2 text-rose-700">
                                <i className="fas fa-radiation text-base"></i>
                                <h3 className="font-bold text-slate-800 text-lg">Escalate Support Ticket</h3>
                            </div>
                            <button 
                                onClick={() => setEscalateTicket(null)}
                                className="text-slate-400 hover:text-rose-500 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-rose-100"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="mb-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ticket Info</p>
                                <div className="mt-1.5 flex flex-col gap-1">
                                    <p className="text-sm font-bold text-slate-800"><span className="text-xs font-mono bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded mr-1.5">{escalateTicket.id}</span> {escalateTicket.subject}</p>
                                    <p className="text-xs text-slate-500"><i className="fas fa-user text-[10px] w-4"></i>Customer: {escalateTicket.customer.name} ({escalateTicket.customer.email})</p>
                                    {escalateTicket.businessName && <p className="text-xs text-slate-500"><i className="fas fa-building text-[10px] w-4"></i>Business: {escalateTicket.businessName}</p>}
                                </div>
                            </div>
                            <form 
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    setTickets(tickets.map(t => t.id === escalateTicket.id ? {
                                        ...t,
                                        escalated: true,
                                        escalatedTo: escalateDestination,
                                        escalationReason: escalationNote,
                                        priority: 'Urgent',
                                        status: 'In Progress',
                                        updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                    } : t));
                                    addLocalSupportNotification({
                                        ticketId: escalateTicket.id,
                                        title: 'Support Ticket Escalated',
                                        message: `Ticket #${escalateTicket.id} has been escalated to "${escalateDestination}". Reason: ${escalationNote}`,
                                        type: 'error'
                                    });
                                    showSuccess(`Ticket ${escalateTicket.id} updated and escalated to ${escalateDestination}!`);
                                    setEscalateTicket(null);
                                    setEscalationNote('');
                                }}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Escalate To</label>
                                    <select
                                        className="w-full bg-white border border-slate-200 text-sm font-medium rounded-lg p-2.5 outline-none focus:border-rose-500 text-slate-700 shadow-sm"
                                        value={escalateDestination}
                                        onChange={(e) => setEscalateDestination(e.target.value)}
                                        required
                                    >
                                        <option value="Head of Customer Experience">Head of Customer Experience</option>
                                        <option value="System Administrator">System Administrator</option>
                                        <option value="Technical Support Team">Technical Support Team</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Escalation Reason / Action Items</label>
                                    <textarea
                                        rows={3}
                                        className="w-full bg-white border border-slate-200 text-sm rounded-lg p-2.5 outline-none focus:border-rose-500 text-slate-700 shadow-sm resize-none"
                                        placeholder="Explain why this ticket is being escalated and what immediate action is required..."
                                        value={escalationNote}
                                        onChange={(e) => setEscalationNote(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                    <button 
                                        type="button"
                                        onClick={() => setEscalateTicket(null)}
                                        className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-50 rounded-lg transition-colors text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        className="px-6 py-2 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 transition-all shadow-md active:scale-95 text-sm flex items-center gap-2"
                                    >
                                        <i className="fas fa-radiation"></i> Execute Escalation
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* View Ticket Details Modal */}
            {viewTicket && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-slate-50 rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col border border-slate-200">
                        {/* Modal Header */}
                        <div className="p-4 px-6 border-b border-slate-200 bg-white flex justify-between items-center sticky top-0 z-10 shrink-0">
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-mono font-black bg-[#02275A]/10 text-[#02275A] px-2.5 py-1 rounded-lg border border-[#02275A]/20 shadow-xs">
                                    {viewTicket.id}
                                </span>
                                <h3 className="font-extrabold text-slate-800 text-lg">Support Ticket Workspace</h3>
                            </div>
                            <button 
                                onClick={() => setViewTicket(null)}
                                aria-label="Close modal"
                                className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all w-8 h-8 flex items-center justify-center rounded-full cursor-pointer"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                
                                {/* Left Column: Ticket Main Information & Conversation Thread */}
                                <div className="lg:col-span-2 space-y-6">
                                    
                                    {/* Subject & State Badges */}
                                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                                        <div className="flex flex-wrap gap-2">
                                            <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-md border uppercase tracking-wider ${
                                                viewTicket.ticketType === 'BRM' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' :
                                                viewTicket.ticketType === 'State Manager' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                                                viewTicket.ticketType === 'Partner' ? 'bg-purple-50 border-purple-200 text-purple-700' :
                                                'bg-blue-50 border-blue-200 text-[#02275A]'
                                            }`}>
                                                <i className={`fas ${
                                                    viewTicket.ticketType === 'BRM' ? 'fa-user-tie' :
                                                    viewTicket.ticketType === 'State Manager' ? 'fa-map-marker-alt' :
                                                    viewTicket.ticketType === 'Partner' ? 'fa-handshake' :
                                                    'fa-building'
                                                } text-[9px]`}></i>
                                                {viewTicket.ticketType || 'Customer'}
                                            </span>
                                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border ${
                                                viewTicket.status === 'Resolved' || viewTicket.status === 'Closed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                viewTicket.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                viewTicket.status === 'Awaiting Reply' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                                'bg-amber-50 text-amber-700 border-amber-200'
                                            }`}>
                                                {viewTicket.status}
                                            </span>
                                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${
                                                viewTicket.priority === 'Urgent' ? 'bg-rose-100 border-rose-200 text-rose-700 font-black' :
                                                viewTicket.priority === 'High' ? 'bg-orange-100 border-orange-200 text-orange-700 font-black' :
                                                viewTicket.priority === 'Medium' ? 'bg-amber-100 border-amber-200 text-amber-700 font-bold' :
                                                'bg-emerald-100 border-emerald-200 text-emerald-700 font-bold'
                                            }`}>
                                                Priority: {viewTicket.priority}
                                            </span>
                                        </div>
                                        <h2 className="text-xl font-black text-slate-800 leading-tight tracking-tight">
                                            {viewTicket.subject}
                                        </h2>
                                        <div className="text-xs text-slate-500 mt-2 flex items-center gap-1.5 bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                                            <i className="fas fa-user-clock text-slate-400 text-sm"></i>
                                            <span>
                                                Logged by <span className="font-extrabold text-slate-700">{viewTicket.createdBy}</span> on {viewTicket.createdAt}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Escalation Notification if active */}
                                    {viewTicket.escalated && (
                                        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3.5 shadow-sm">
                                            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                                                <i className="fas fa-radiation text-base animate-pulse"></i>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-black text-rose-700 uppercase tracking-widest">Active Escalation Threat</p>
                                                <p className="text-sm font-bold text-slate-800 mt-0.5">Escalated to: <span className="text-rose-700">{viewTicket.escalatedTo}</span></p>
                                                <p className="text-xs text-slate-600 mt-2 bg-white/80 rounded-lg p-2.5 border border-rose-100 italic">
                                                    "{viewTicket.escalationReason || 'No escalation reason specified.'}"
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Issue Description Card */}
                                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                            <i className="fas fa-align-left text-slate-400"></i> Issue Description
                                        </h4>
                                        <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 text-xs md:text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                                            {viewTicket.description || 'No description provided.'}
                                        </div>
                                    </div>

                                    {/* Evidence & Tag Classifications */}
                                    {((viewTicket.attachments && viewTicket.attachments.length > 0) || (viewTicket.tags && viewTicket.tags.length > 0)) && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            
                                            {/* Attachments */}
                                            {viewTicket.attachments && viewTicket.attachments.length > 0 && (
                                                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                                        <i className="fas fa-paperclip text-slate-400"></i> Attached Evidence ({viewTicket.attachments.length})
                                                    </h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {viewTicket.attachments.map(att => (
                                                            <span key={att} className="text-xs bg-slate-50 text-slate-700 font-bold px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5 shadow-xs">
                                                                <i className={`fas ${att.toLowerCase().match(/\.(mp4|mov|avi)$/) ? 'fa-video text-slate-500' : 'fa-image text-slate-500'} text-xs`}></i>
                                                                {att}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Tag Classifications */}
                                            {viewTicket.tags && viewTicket.tags.length > 0 && (
                                                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                                        <i className="fas fa-tags text-slate-400"></i> Tag Classifications
                                                    </h4>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {viewTicket.tags.map(tag => (
                                                            <span key={tag} className="text-xs bg-indigo-50 text-indigo-700 font-bold px-3 py-1.5 rounded-lg border border-indigo-100 flex items-center gap-1.5 shadow-xs">
                                                                <i className="fas fa-tag text-[10px] text-indigo-400 opacity-80"></i>
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Discussion, Activity feed & Comments timeline */}
                                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                                        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                <i className="fas fa-comments text-[#02275A]"></i>
                                                Discussion Logs ({viewTicket.comments?.length || 0})
                                            </h4>
                                            <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                Active Channel
                                            </span>
                                        </div>

                                        {/* Comments Timeline Area */}
                                        <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                                            {viewTicket.comments && viewTicket.comments.length > 0 ? (
                                                viewTicket.comments.map((cmt, idx) => {
                                                    const roleColors: {[key: string]: string} = {
                                                        'admin': 'bg-indigo-50 border-indigo-200 text-indigo-700',
                                                        'team-lead': 'bg-amber-50 border-amber-200 text-amber-700',
                                                        'support-staff': 'bg-emerald-50 border-emerald-200 text-emerald-700',
                                                        'cx-head': 'bg-purple-50 border-purple-200 text-purple-700',
                                                        'Customer': 'bg-slate-50 border-slate-200 text-slate-700'
                                                    };
                                                    const badgeClass = roleColors[cmt.senderRole] || 'bg-slate-50 text-slate-700 border-slate-200';
                                                    return (
                                                        <div key={idx} className="bg-slate-50 border border-slate-150 rounded-xl p-3.5 space-y-1.5 animate-fade-in shadow-xs">
                                                            <div className="flex justify-between items-center text-[10px]">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-extrabold text-slate-700 flex items-center gap-1">
                                                                        <i className="fas fa-user-circle text-slate-400 text-xs"></i>
                                                                        {cmt.senderName}
                                                                    </span>
                                                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${badgeClass}`}>
                                                                        {cmt.senderRole === 'admin' ? 'Admin' : cmt.senderRole === 'team-lead' ? 'Team Lead' : cmt.senderRole === 'support-staff' ? 'Tech Support' : cmt.senderRole === 'cx-head' ? 'Head of CX' : cmt.senderRole}
                                                                    </span>
                                                                </div>
                                                                <span className="text-slate-400 font-semibold">{cmt.createdAt}</span>
                                                            </div>
                                                            <p className="text-xs text-slate-700 leading-normal font-medium whitespace-pre-wrap pl-4">
                                                                {cmt.text}
                                                            </p>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                                    <p className="text-xs text-slate-400 italic">No notes logged yet. Post a comment below.</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Composer Tabs */}
                                        <div className="flex border-b border-slate-200 pb-2 items-center justify-between text-xs font-semibold">
                                            <div className="flex gap-4">
                                                <button 
                                                    type="button" 
                                                    onClick={() => setCmtType('note')}
                                                    className={`pb-2 px-1 transition-all border-b-2 font-bold cursor-pointer flex items-center gap-1.5 ${cmtType === 'note' ? 'border-[#02275A] text-[#02275A] pb-2 border-b-2' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                                >
                                                    <i className="fas fa-sticky-note"></i> Internal Note
                                                </button>
                                                <button 
                                                    type="button" 
                                                    onClick={() => {
                                                        setCmtType('email');
                                                        if (!inboxSubjectInput) {
                                                            setInboxSubjectInput(`Support Update: Re: ${viewTicket.subject}`);
                                                        }
                                                    }}
                                                    className={`pb-2 px-1 transition-all border-b-2 font-bold cursor-pointer flex items-center gap-1.5 ${cmtType === 'email' ? 'border-[#02275A] text-[#02275A] pb-2 border-b-2' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                                >
                                                    <i className="fas fa-paper-plane text-[#02275A]"></i> Email Customer
                                                </button>
                                            </div>
                                            {cmtType === 'email' && (
                                                <span className="text-[10px] text-[#02275A] font-extrabold bg-[#02275A]/5 px-2.5 py-1 rounded-md border border-[#02275A]/10">
                                                    To: {viewTicket.customer.email}
                                                </span>
                                            )}
                                        </div>

                                        {/* Comment Composer */}
                                        <div className="space-y-3">
                                            {cmtType === 'email' && (
                                                <div className="space-y-1 animate-fade-in">
                                                    <label htmlFor="email-subject-input" className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Email Subject</label>
                                                    <input 
                                                        id="email-subject-input"
                                                        type="text"
                                                        value={inboxSubjectInput}
                                                        onChange={(e) => setInboxSubjectInput(e.target.value)}
                                                        placeholder="Enter email subject line..."
                                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 outline-none focus:border-[#02275A] focus:ring-2 focus:ring-[#02275A]/20 focus:bg-white text-xs text-slate-800 font-bold transition-all"
                                                    />
                                                </div>
                                            )}

                                            <div className="flex gap-2.5 items-end">
                                                <div className="flex-1">
                                                    <label htmlFor="composer-textarea" className="sr-only">Message content</label>
                                                    <textarea
                                                        id="composer-textarea"
                                                        rows={cmtType === 'email' ? 4 : 2}
                                                        value={newCommentText}
                                                        onChange={(e) => setNewCommentText(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' && !e.shiftKey && cmtType === 'note') {
                                                                e.preventDefault();
                                                                handleAddComment();
                                                            }
                                                        }}
                                                        placeholder={cmtType === 'email' ? "Write a professional email body to the customer..." : "Write your note or ticket comment... (Press Enter to post)"}
                                                        className="w-full bg-slate-50 border border-slate-300 focus:border-[#02275A] focus:ring-2 focus:ring-[#02275A]/20 focus:bg-white text-xs md:text-sm rounded-xl px-3.5 py-2.5 outline-none text-slate-700 shadow-xs resize-none min-h-[50px] transition-all"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (cmtType === 'email') {
                                                            handleSendIndividualEmail(viewTicket.id, inboxSubjectInput, newCommentText);
                                                            // Add comments locally to synchronized viewTicket state
                                                            const emailComment: TicketComment = {
                                                                senderRole: userRole,
                                                                senderName: userRole === 'support-staff' ? 'Tech Support Staff' : 'System Support',
                                                                text: `📧 [Sent Email to ${viewTicket.customer.email}]\nSubject: ${inboxSubjectInput || 'Support Ticket Update'}\n\n${newCommentText}`,
                                                                createdAt: new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true, month: 'short', day: 'numeric', year: 'numeric' }),
                                                                isEmail: true,
                                                                recipientEmail: viewTicket.customer.email
                                                            };
                                                            setViewTicket({
                                                                ...viewTicket,
                                                                comments: [...(viewTicket.comments || []), emailComment],
                                                                status: 'Awaiting Reply',
                                                                updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                                            });
                                                            setNewCommentText('');
                                                        } else {
                                                            handleAddComment();
                                                        }
                                                    }}
                                                    disabled={!newCommentText.trim()}
                                                    className="bg-[#02275A] hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-[#02275A] text-white font-extrabold rounded-xl text-xs px-5 h-[44px] md:h-[50px] shrink-0 flex items-center gap-1.5 shadow active:scale-95 transition-all cursor-pointer"
                                                >
                                                    <i className="fas fa-paper-plane"></i>
                                                    <span>{cmtType === 'email' ? 'Send Mail' : 'Post'}</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Sidebar Contacts, Action items & Metadata directory */}
                                <div className="lg:col-span-1 space-y-6">
                                    
                                    {/* Customer Profile Card */}
                                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                                            Customer Profile
                                        </span>
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-[#02275A]/5 border border-[#02275A]/10 text-[#02275A] flex items-center justify-center text-sm font-black">
                                                {viewTicket.customer.name.slice(0, 2).toUpperCase()}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-extrabold text-slate-800 text-sm truncate">{viewTicket.customer.name}</p>
                                                <p className="text-slate-500 text-xs truncate select-all">{viewTicket.customer.email}</p>
                                            </div>
                                        </div>

                                        {viewTicket.businessName && (
                                            <div className="p-2.5 bg-slate-50 border border-slate-150 rounded-xl flex items-center gap-2">
                                                <i className="fas fa-building text-slate-400 text-xs"></i>
                                                <span className="text-xs font-bold text-indigo-600">Corp: {viewTicket.businessName}</span>
                                            </div>
                                        )}

                                        {/* Auto email sending status report */}
                                        {viewTicket.autoEmailSentStatus && (
                                            <div className="pt-3 border-t border-slate-100 space-y-1.5">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                                    <i className="fas fa-paper-plane text-[9px]"></i> Dispatch Logs
                                                </p>
                                                
                                                {viewTicket.autoEmailSentStatus === 'Sent' ? (
                                                    <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-2.5 rounded-xl flex items-start gap-2 text-xs">
                                                        <i className="fas fa-check-circle text-emerald-600 text-sm mt-0.5"></i>
                                                        <div>
                                                            <p className="font-bold">Confirmation Sent</p>
                                                            <p className="text-[10px] text-emerald-700 mt-0.5 leading-relaxed">
                                                                An auto-confirmation email was successfully compiled and sent to the customer upon ticket creation.
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : viewTicket.autoEmailSentStatus === 'Failed' ? (
                                                    <div className="bg-rose-50 text-rose-800 border border-rose-200 p-2.5 rounded-xl flex items-start gap-2 text-xs">
                                                        <i className="fas fa-times-circle text-rose-600 text-sm mt-0.5"></i>
                                                        <div>
                                                            <p className="font-bold">Dispatch Failed</p>
                                                            <p className="text-[10px] text-rose-700 mt-0.5 leading-relaxed">
                                                                The auto-confirmation failed to dispatch due to an invalid or empty email format.
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="bg-slate-100 text-slate-700 border border-slate-200 p-2.5 rounded-xl flex items-start gap-2 text-xs">
                                                        <i className="fas fa-info-circle text-slate-500 text-sm mt-0.5"></i>
                                                        <div>
                                                            <p className="font-bold">Dispatch Disabled</p>
                                                            <p className="text-[10px] text-slate-600 mt-0.5 leading-relaxed">
                                                                Auto-send confirmation email option was unselected/disabled at creation time.
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Resolution Ownership & Staff assignment */}
                                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                                            Ticket Allocation
                                        </span>
                                        
                                        <div className="space-y-3.5">
                                            <div>
                                                <label htmlFor="modal-assignee-select" className="text-xs font-bold text-slate-500 block mb-1.5 flex items-center gap-1.5">
                                                    <i className="fas fa-user-check text-[#02275A]"></i> Assigned Staff
                                                </label>
                                                {['admin', 'cx-head'].includes(userRole) ? (
                                                    <select 
                                                        id="modal-assignee-select"
                                                        className="w-full bg-white border border-slate-300 hover:border-slate-400 text-xs font-bold rounded-lg p-2.5 outline-none focus:border-[#02275A] text-slate-700 shadow-xs cursor-pointer transition-all"
                                                        onChange={(e) => {
                                                            if (e.target.value) handleAssignStaff(viewTicket.id, e.target.value);
                                                        }}
                                                        value={viewTicket.assignedStaff || ""}
                                                    >
                                                        <option value="" disabled>Change Staff...</option>
                                                        {supportStaffList.map(staff => (
                                                            <option key={staff} value={staff}>{staff}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700">
                                                        {viewTicket.assignedStaff || 'Unassigned'}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-2 pt-2 border-t border-slate-100 text-[11px]">
                                                <div className="flex justify-between items-center text-slate-500 py-1">
                                                    <span className="font-medium">Department</span>
                                                    <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">Service Ops</span>
                                                </div>
                                                <div className="flex justify-between items-center text-slate-500 py-1">
                                                    <span className="font-medium">Last Updated</span>
                                                    <span className="font-bold text-slate-700">{viewTicket.updatedAt}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Escalation Control Unit (Team Lead ONLY) */}
                                    {viewTicket.escalated && userRole === 'team-lead' && (
                                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-xs space-y-3.5">
                                            <div className="flex items-center gap-2 text-amber-800">
                                                <i className="fas fa-gavel text-sm animate-pulse"></i>
                                                <h4 className="text-xs font-black uppercase tracking-wider">Escalation Gavel Actions</h4>
                                            </div>
                                            <p className="text-xs text-slate-600 leading-relaxed">
                                                You have executive authority to modify or resolve escalated support requests. Shift status below:
                                            </p>
                                            <div className="flex flex-wrap gap-2 pt-1">
                                                {(['Open', 'In Progress', 'Awaiting Reply', 'Resolved', 'Closed'] as const).map((st) => {
                                                    const isCurrent = viewTicket.status === st;
                                                    return (
                                                        <button
                                                            key={st}
                                                            type="button"
                                                            onClick={() => {
                                                                const updatedTickets = tickets.map(t => t.id === viewTicket.id ? { 
                                                                    ...t, 
                                                                    status: st,
                                                                    updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                                                } : t);
                                                                setTickets(updatedTickets);
                                                                setViewTicket({ 
                                                                    ...viewTicket, 
                                                                    status: st,
                                                                    updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                                                });
                                                                addLocalSupportNotification({
                                                                    ticketId: viewTicket.id,
                                                                    title: 'Escalated Status Shifted',
                                                                    message: `Team Lead shifted the status of escalated Ticket #${viewTicket.id} to "${st}".`,
                                                                    type: 'success'
                                                                });
                                                                showSuccess(`Changed escalated ticket status to: ${st}`);
                                                            }}
                                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer ${
                                                                isCurrent 
                                                                ? 'bg-amber-600 text-white border border-amber-600 font-extrabold scale-102' 
                                                                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                                                            }`}
                                                        >
                                                            {st === 'In Progress' ? 'Active' : st === 'Awaiting Reply' ? 'Wait' : st}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer Close Actions */}
                        <div className="p-4 px-6 bg-white border-t border-slate-200 flex justify-end sticky bottom-0 shrink-0">
                            <button 
                                onClick={() => setViewTicket(null)}
                                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-950 text-white font-extrabold rounded-xl transition-all shadow text-sm cursor-pointer active:scale-95"
                            >
                                Close Workspace
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminComplaintsView;
