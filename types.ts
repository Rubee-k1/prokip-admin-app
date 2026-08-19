
export type UserRole = 'agent' | 'manager' | 'admin' | 'team-lead' | 'cx-head' | 'call-agent' | 'sales-manager' | 'support-staff' | 'finance' | 'marketing-manager' | 'content-lead' | 'customer-success' | 'employee' | 'engineering' | 'engineer';

export interface Business {
    id: string;
    name: string;
    owner: string;
    phone: string;
    email: string;
    username?: string;
    category: string;
    plan: string;
    planClass: string;
    status: string;
    statusClass: string;
    verified: boolean;
    dateJoined: string;
    address: string;
    country: string;
    expiryDate: string;
    limits: { 
        locations: string; 
        users: string; 
        products: string; 
    };
}

export interface Note {
    date: string;
    type: string;
    text: string;
}

export interface Reminder {
    id: string;
    type: 'Call' | 'Meeting' | 'Email' | 'Visit';
    date: string;
    time: string;
    note: string;
    status: 'Pending' | 'Completed';
}

export interface ProposalItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
    type: 'Service' | 'Product' | 'Plan';
}

export interface Proposal {
    id: string;
    leadId: number;
    businessName: string;
    contactName: string;
    items: ProposalItem[];
    totalAmount: number;
    validUntil: string;
    status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected';
    dateCreated: string;
    notes?: string;
}

export interface Lead {
    id: number;
    name: string;
    business: string;
    type: 'Personal' | 'Company' | 'Sales Lead' | 'State Manager';
    status: string;
    phone: string;
    location: string;
    lastAction: string;
    notes: Note[];
    reminders?: Reminder[]; // Added reminders array
    email?: string; 
    assignedAgentId?: string;
    assignedAgentName?: string;
    managerId?: string;
    managerName?: string;
    brmId?: string;
    brmName?: string;
    commissionPercent?: number;
    leadCategory?: string;
}

export interface Trial {
    id: string;
    name: string;
    owner: string;
    phone: string;
    daysLeft: number;
    plan: string;
    usage: string;
    transactions: number;
    lastSeen: string;
    status: string;
}

export interface UpsellOpportunity {
    id: number;
    business: string;
    type: string;
    trigger: string;
    suggestion: string;
    reason: string;
    revenue: string;
    icon: string;
    color: string;
    action: string;
}

export interface ContentItem {
    id: string;
    title: string;
    description: string;
    type: 'video' | 'image' | 'text' | 'document';
    category: 'Videos' | 'Flyers & Print' | 'Social Media' | 'Ad Copies' | 'Cold Outreach' | 'Enterprise Prospecting';
    url: string;
    thumbnailUrl?: string;
    size?: string;
    duration?: string;
    textContent?: string;
}

export interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
}

export interface KBModule {
    id: string;
    title: string;
    type: 'Video' | 'Article';
    duration: string;
    description: string;
    url?: string;
    textContent?: string;
    quiz?: QuizQuestion[];
    status?: 'Completed' | 'InProgress' | 'Locked'; // agent status
    score?: number;
}

export interface KBPath {
    id: number;
    title: string;
    level: 'Basic' | 'Intermediate' | 'Advanced';
    progress: number;
    modules: KBModule[];
    isLocked: boolean;
}

export interface KBResource {
    id: string;
    title: string;
    type: 'Video' | 'Article';
    duration: string;
    description?: string;
    url?: string;
    textContent?: string;
}

export interface Transaction {
    id: string;
    business?: string; 
    amount: string;
    type?: string;
    detail?: string; 
    status: 'Paid' | 'Pending' | 'Processing' | 'Completed';
    date: string;
    ref?: string; 
    account?: string; 
    leadCategory?: 'Personal' | 'Company' | 'Sales Lead' | 'Renewal';
    commissionPercent?: number;
}

export interface HistoryItem {
    id: string;
    date: string;
    type: string;
    plan: string;
    amount: string;
    status: string;
    invoiceId: string;
    renewalDate: string;
}

export interface Notification {
    id: number;
    title: string;
    message: string;
    time: string;
    type: 'success' | 'warning' | 'info' | 'alert';
    read: boolean;
    details?: string;
    actionLink?: string;
}

export interface Attachment {
    id: string;
    name: string;
    type: 'image' | 'video';
    url: string;
}

export interface Comment {
    id: string;
    author: string;
    role: string;
    text: string;
    date: string;
    attachments?: Attachment[];
}

export interface Complaint {
    id: string;
    businessId: string;
    subject: string;
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    status: 'Open' | 'In Progress' | 'Resolved';
    category: string;
    description: string;
    dateCreated: string;
    lastUpdated?: string;
    resolution?: string;
    attachments?: Attachment[];
    comments?: Comment[];
    ticketType?: 'BRM' | 'Customer' | 'State Manager' | 'Partner';
    targetName?: string;
}

export interface Alert {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
}

export interface InvoiceItem {
    id: string;
    description: string;
    amount: number;
    type: 'Subscription' | 'Addon' | 'Service'; // Addon added
}

export interface Invoice {
    id: string;
    recipientId: string;
    recipientName: string;
    recipientEmail?: string;
    recipientPhone?: string;
    recipientType: 'Lead' | 'Business';
    totalAmount: string;
    amount?: string; // Optional legacy/fallback support
    items: InvoiceItem[];
    description?: string; // Added to support simple invoice description
    dateCreated: string;
    dueDate: string;
    expiryDate: string; // New: For virtual account expiry
    status: 'Unpaid' | 'Paid' | 'Overdue' | 'Expired';
    virtualAccount: string;
    bankName: string;
    accountName: string;
    paymentLink: string;
    remindersSent?: { email: number; whatsapp: number; sms: number }; // Added
    assignedAgentId?: string;
    assignedAgentName?: string;
    leadCategory?: 'Personal' | 'Company' | 'Sales Lead';
    commissionPercent?: number;
    discountPercent?: number;
    originalAmount?: string;
    invoiceType?: 'New Sale' | 'Renewal' | 'Upgrade' | 'Standalone Add-on';
}

export interface DiscountTimelineEvent {
    status: 'Created' | 'Scheduled' | 'Activated' | 'Expired' | 'Ended Early';
    timestamp: string;
    label: string;
}

export interface DiscountAuditLog {
    user: string;
    timestamp: string;
    action: 'Created' | 'Updated' | 'Ended' | 'Applied';
    details?: string;
}

export interface Discount {
    id: string;
    percentage: 5 | 10 | 15 | 20 | 25;
    leadType: 'Company Lead';
    validFrom: string; // ISO string YYYY-MM-DDTHH:mm
    validTo: string; // ISO string YYYY-MM-DDTHH:mm
    status: 'Active' | 'Upcoming' | 'Expired' | 'Ended';
    createdBy: string;
    dateCreated: string;
    lastUpdated: string;
    timeline: DiscountTimelineEvent[];
    auditHistory: DiscountAuditLog[];
}

export interface Wallet {
    balance: number;
    totalEarned: number;
    pending: number;
    transactions: Transaction[];
    payouts: any[];
}

// New Interface for Manager View
export interface Agent {
    id: string;
    name: string;
    email: string;
    phone: string;
    state: string;
    status: 'Active' | 'Inactive' | 'Suspended';
    kycStatus?: 'Approved' | 'Pending' | 'Rejected';
    kycSubmittedDate?: string;
    rejectionReason?: string;
    documents?: {
        idCard: string;
        utilityBill: string;
        photo: string;
    };
    totalSales: string;
    activeBusinesses: number;
    inactiveBusinesses?: number;
    violations?: number;
    lastActive: string;
    performanceScore: number;
}

export interface Customer {
    id: string;
    businessName: string;
    ownerName: string;
    email: string;
    phone: string;
    plan: string;
    status: string;
    assignedAgentId: string;
    assignedAgentName: string;
    dateJoined: string;
    lastTransactionDate: string;
}

export interface CEOMetrics {
    cashBalance: number;
    monthlyRevenue: number;
    netRevenue: number;
    burnRate: number;
    runwayMonths: number;
    activeCustomers: number;
    monthlyGrowth: number;
    churnRate: number;
    profit: number;
    nrr: number;
    grr: number;
    ltvCacRatio: number;
    cacPaybackMonths: number;
    burnMultiple: number;
    zeroCashDate: string;
    ruleOf40: number;
    magicNumber: number;
}

export interface RevenueMetric {
    mrr: number;
    arr: number;
    gross: number;
    net: number;
    byCountry: { country: string; revenue: number }[];
    byPlan: { plan: string; revenue: number }[];
    newRevenue: number;
    expansionRevenue: number;
    churnedRevenue: number;
}

export interface RunwayMetric {
    availableCash: number;
    monthlyExpenses: number;
    netBurn: number;
    grossBurn: number;
    upcomingPayables: number;
    outstandingReceivables: number;
}

export interface RetentionMetric {
    activePaying: number;
    freeTrial: number;
    newCustomers: number;
    expiredCustomers: number;
    churnRate: number;
    renewalRate: number;
    ltv: number;
}

export interface EfficiencyMetric {
    cac: number;
    cpl: number;
    leadConversion: number;
    demoConversion: number;
    roas: number;
    revenuePerChannel: { channel: string; revenue: number }[];
}

export interface ProfitabilityMetric {
    grossProfit: number;
    grossMargin: number;
    operatingExpenses: number;
    netProfit: number;
    infrastructureRatio: number;
    payrollRatio: number;
}

export interface CEORiskAlert {
    id: string;
    type: 'critical' | 'warning' | 'info';
    title: string;
    description: string;
    date: string;
}

export interface ChartOfAccount {
    id: string;
    code: string;
    name: string;
    type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
    balance: number;
    description: string;
}

export interface FinanceExpense {
    id: string;
    date: string;
    amount: number;
    description: string;
    category: string;
    accountId: string; 
    recurring: boolean;
    frequency?: 'Weekly' | 'Monthly' | 'Yearly';
    status: 'Pending' | 'Approved' | 'Rejected';
    submittedBy: string;
    approvedBy?: string;
    marketingRelated?: boolean; 
}

export interface FinanceAllowedBudget {
    id: string;
    category: string;
    monthlyLimit: number;
    spentThisMonth: number;
}
