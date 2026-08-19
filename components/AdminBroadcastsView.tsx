import React, { useState, useMemo } from 'react';
import { useAlert } from '../contexts/AlertContext';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

    const defaultHtmlTemplates = [
        {
            id: 'tpl-1',
            title: 'Welcome & Onboarding',
            cat: 'Customer Lifecycle',
            channel: 'Email',
            color: 'bg-emerald-50',
            html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333; padding: 30px; border: 1px solid #e2e8f0; border-radius: 8px;">
  <h2 style="color: #02275A; font-size: 24px; margin-bottom: 10px;">Welcome to Prokip, {{first_name | default: "there"}}!</h2>
  <p style="font-size: 16px; line-height: 1.5; color: #475569;">We are thrilled to have you on board. Here are 3 quick steps to get your store up and running:</p>
  <ul style="margin: 20px 0; padding-left: 20px; line-height: 1.8;">
    <li><strong>Complete your profile:</strong> Add your business details.</li>
    <li><strong>Add your first product:</strong> Setup your inventory.</li>
    <li><strong>Record a sale:</strong> Make your first transaction.</li>
  </ul>
  <a href="{{login_url}}" style="display: inline-block; background-color: #02275A; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">Log In to Dashboard</a>
  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
  <p style="font-size: 12px; color: #94a3b8;">If you need help, reply to this email or visit our help center.</p>
</div>`
        },
        {
            id: 'tpl-2',
            title: 'Payment Failed Alert',
            cat: 'Service & System',
            channel: 'Email',
            color: 'bg-rose-50',
            html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333; padding: 30px; border: 1px solid #e2e8f0; border-radius: 8px;">
  <h2 style="color: #E11D48; font-size: 24px; margin-bottom: 10px;">Payment Failed</h2>
  <p style="font-size: 16px; line-height: 1.5; color: #475569;">Hi {{first_name}},</p>
  <p style="font-size: 16px; line-height: 1.5; color: #475569;">We attempted to process your subscription renewal for the <strong>{{plan_name}}</strong>, but the payment failed.</p>
  <p style="font-size: 16px; line-height: 1.5; color: #475569;">To avoid service interruption, please update your payment method or ensure sufficient funds are available.</p>
  <a href="{{billing_url}}" style="display: inline-block; background-color: #E11D48; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">Update Payment Method</a>
</div>`
        },
        {
            id: 'tpl-3',
            title: 'Scheduled Maintenance',
            cat: 'Service & System',
            channel: 'Email',
            color: 'bg-slate-100',
            html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333; padding: 30px; border: 1px solid #e2e8f0; border-radius: 8px;">
  <h2 style="color: #02275A; font-size: 24px; margin-bottom: 10px;">Scheduled Maintenance Notice</h2>
  <p style="font-size: 16px; line-height: 1.5; color: #475569;">Hello,</p>
  <p style="font-size: 16px; line-height: 1.5; color: #475569;">We will be performing scheduled system maintenance on <strong>{{maintenance_date}}</strong> starting at <strong>{{start_time}}</strong>.</p>
  <p style="font-size: 16px; line-height: 1.5; color: #475569;">During this window, the platform may be temporarily unavailable for approximately 2 hours as we upgrade our infrastructure.</p>
  <p style="font-size: 16px; line-height: 1.5; color: #475569;">Thank you for your patience and understanding.</p>
</div>`
        },
        {
            id: 'tpl-4',
            title: 'New Feature Announcement',
            cat: 'Product Updates',
            channel: 'Email',
            color: 'bg-blue-50',
            html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333; padding: 30px; border: 1px solid #e2e8f0; border-radius: 8px;">
  <div style="background-color: #EFF6FF; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
    <h2 style="color: #1D4ED8; margin-top: 0;">Introducing New Automations!</h2>
  </div>
  <p style="font-size: 16px; line-height: 1.5; color: #475569;">Hi {{first_name}},</p>
  <p style="font-size: 16px; line-height: 1.5; color: #475569;">You can now save time with our brand new automated workflows. Set up triggers for customer lifecycle events, payment reminders, and more directly from your dashboard.</p>
  <div style="text-align: center; margin-top: 30px;">
    <a href="{{feature_url}}" style="display: inline-block; background-color: #1D4ED8; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Explore New Features</a>
  </div>
</div>`
        },
        {
            id: 'tpl-wa-1',
            title: 'WhatsApp: Welcome Alert',
            cat: 'Customer Lifecycle',
            channel: 'WhatsApp',
            color: 'bg-green-50',
            html: `*Welcome to Prokip, {{first_name}}!*\n\nWe are thrilled to have you on board.`
        },
        {
            id: 'tpl-sms-1',
            title: 'SMS: Payment Failed',
            cat: 'Service & System',
            channel: 'SMS',
            color: 'bg-emerald-50',
            html: `Prokip: Your payment for {{plan_name}} failed. Please update your billing info to avoid service interruption.`
        }
    ];


type TabType = 'overview' | 'campaigns' | 'audiences' | 'templates' | 'automations' | 'health';
type CampaignState = 'Draft' | 'Preparing' | 'Queued' | 'Sending' | 'Paused' | 'Completed' | 'Failed';
export type CampaignType = 'Customers' | 'Agents' | 'Partners' | 'State Managers' | 'Employees';

interface BroadcastCampaign {
    id: string;
    name: string;
    type: CampaignType | string;
    channels: string[];
    audience: string;
    audienceSize: number;
    sentCount: number;
    deliveredCount: number;
    openedCount: number;
    clickedCount: number;
    failedCount: number;
    status: CampaignState;
    date: string;
}

export interface SavedSegment {
    id: string;
    name: string;
    count: string;
    countNum: number;
    desc: string;
    type: CampaignType;
    icon?: string;
    badgeColor?: string;
}

export const savedSegmentsByType: Record<CampaignType, SavedSegment[]> = {
    'Customers': [
        { id: 'cust_all_active', name: 'All Active Customers', count: '52,400', countNum: 52400, desc: 'All verified business accounts active in the last 60 days.', type: 'Customers', icon: 'fa-users text-blue-600 bg-blue-50', badgeColor: 'bg-blue-50 text-blue-700' },
        { id: 'cust_paid_only', name: 'Paid Customers Only', count: '48,200', countNum: 48200, desc: 'Active Basic, Pro, and Enterprise subscription plan holders.', type: 'Customers', icon: 'fa-crown text-amber-500 bg-amber-50', badgeColor: 'bg-amber-50 text-amber-700 font-black' },
        { id: 'cust_new_30d', name: 'New Customers (Within 30 Days)', count: '5,620', countNum: 5620, desc: 'Newly registered accounts onboarded in the last 30 days.', type: 'Customers', icon: 'fa-user-plus text-emerald-600 bg-emerald-50', badgeColor: 'bg-emerald-50 text-emerald-700' },
        { id: 'cust_frequent', name: 'Frequently Used Customers', count: '16,800', countNum: 16800, desc: 'Power merchants with at least 5 transactions recorded per week.', type: 'Customers', icon: 'fa-bolt text-emerald-500 bg-emerald-50', badgeColor: 'bg-emerald-50 text-emerald-700' },
        { id: 'cust_old_90d', name: 'Old Customers (Active > 90 Days)', count: '21,300', countNum: 21300, desc: 'Active loyal customers older than 90 days and actively transacting.', type: 'Customers', icon: 'fa-award text-indigo-500 bg-indigo-50', badgeColor: 'bg-indigo-50 text-indigo-700' },
        { id: 'cust_trials', name: 'Trial Accounts', count: '4,200', countNum: 4200, desc: 'Users currently on a 14-day free trial or pending upgrade.', type: 'Customers', icon: 'fa-clock text-indigo-500 bg-indigo-50', badgeColor: 'bg-slate-100 text-slate-700' },
        { id: 'cust_inactive_30d_less', name: 'Inactive Customers (< 30 Days)', count: '3,450', countNum: 3450, desc: 'Zero POS activity or sales for between 7 to 29 days.', type: 'Customers', icon: 'fa-history text-amber-500 bg-amber-50', badgeColor: 'bg-amber-50 text-amber-700' },
        { id: 'cust_inactive_30d_plus', name: 'Inactive (30+ Days)', count: '8,900', countNum: 8900, desc: 'Accounts with zero transactions or logins in over a month.', type: 'Customers', icon: 'fa-user-slash text-rose-500 bg-rose-50', badgeColor: 'bg-slate-100 text-slate-700' },
        { id: 'cust_overdue', name: 'Overdue Accounts (> 7 Days)', count: '1,850', countNum: 1850, desc: 'Expired subscriptions past the 7-day grace period.', type: 'Customers', icon: 'fa-receipt text-rose-600 bg-rose-50', badgeColor: 'bg-rose-50 text-rose-700' },
        { id: 'cust_new_no_tx', name: 'New Customers (> 30d No Tx)', count: '1,280', countNum: 1280, desc: 'Registered over 30 days ago without recording first POS sale.', type: 'Customers', icon: 'fa-user-times text-purple-600 bg-purple-50', badgeColor: 'bg-purple-50 text-purple-700' },
        { id: 'cust_dynamic_seg', name: 'Dynamic Segment', count: '14,950', countNum: 14950, desc: 'Target using preset POS criteria, scale, or ERP add-ons.', type: 'Customers', icon: 'fa-sliders-h text-purple-500 bg-purple-50', badgeColor: 'bg-purple-50 text-purple-700' },
        { id: 'cust_csv_list', name: 'Uploaded CSV List', count: '3 Lists', countNum: 3, desc: 'Send to an imported custom audience file or contact list.', type: 'Customers', icon: 'fa-file-csv text-emerald-600 bg-emerald-50', badgeColor: 'bg-slate-100 text-slate-700' },
    ],
    'Agents': [
        { 
            id: 'agent_all_active', 
            name: 'All Active Agents', 
            count: '3,850', 
            countNum: 3850, 
            desc: 'All verified field sales agents, POS aggregators & territory reps active in last 60 days.', 
            type: 'Agents', 
            icon: 'fa-id-badge text-blue-600 bg-blue-50', 
            badgeColor: 'bg-blue-50 text-blue-700 font-bold' 
        },
        { 
            id: 'agent_with_sm', 
            name: 'Agents with State Managers', 
            count: '2,450', 
            countNum: 2450, 
            desc: 'Field agents assigned to and actively coordinated under a designated state manager.', 
            type: 'Agents', 
            icon: 'fa-user-check text-blue-600 bg-blue-50', 
            badgeColor: 'bg-blue-50 text-blue-700 font-bold' 
        },
        { 
            id: 'agent_without_sm', 
            name: 'Agents without State Managers', 
            count: '1,400', 
            countNum: 1400, 
            desc: 'Direct field agents operating without an assigned regional or state manager.', 
            type: 'Agents', 
            icon: 'fa-user-minus text-amber-500 bg-amber-50', 
            badgeColor: 'bg-amber-50 text-amber-700 font-bold' 
        },
        { 
            id: 'agent_top_commission', 
            name: 'Top Commission Earners (Tier 1)', 
            count: '820', 
            countNum: 820, 
            desc: 'High-performing field agents earning > ₦500k monthly in POS terminal rollout commissions.', 
            type: 'Agents', 
            icon: 'fa-trophy text-amber-500 bg-amber-50', 
            badgeColor: 'bg-amber-50 text-amber-700 font-black' 
        },
        { 
            id: 'agent_new_30d', 
            name: 'New Agents (Within 30 Days)', 
            count: '450', 
            countNum: 450, 
            desc: 'Newly recruited field agents currently undergoing onboarding and terminal compliance.', 
            type: 'Agents', 
            icon: 'fa-user-plus text-emerald-600 bg-emerald-50', 
            badgeColor: 'bg-emerald-50 text-emerald-700 font-bold' 
        },
        { 
            id: 'agent_frequently_active', 
            name: 'Frequently Active Agents (5+ Deployments/Wk)', 
            count: '1,240', 
            countNum: 1240, 
            desc: 'Power agents deploying at least 5 new merchant POS terminals per week.', 
            type: 'Agents', 
            icon: 'fa-bolt text-emerald-500 bg-emerald-50', 
            badgeColor: 'bg-emerald-50 text-emerald-700 font-bold' 
        },
        { 
            id: 'agent_old_90d', 
            name: 'Old Agents (Active > 90 Days & Onboarding)', 
            count: '1,950', 
            countNum: 1950, 
            desc: 'Tenured field agents older than 90 days actively deploying & supporting stores.', 
            type: 'Agents', 
            icon: 'fa-medal text-indigo-500 bg-indigo-50', 
            badgeColor: 'bg-indigo-50 text-indigo-700 font-bold' 
        },
        { 
            id: 'agent_inactive_30d_less', 
            name: 'Inactive Agents (< 30 Days)', 
            count: '280', 
            countNum: 280, 
            desc: 'Agents with zero merchant onboarding or float balance activity for 7–29 days.', 
            type: 'Agents', 
            icon: 'fa-history text-amber-500 bg-amber-50', 
            badgeColor: 'bg-amber-50 text-amber-700 font-bold' 
        },
        { 
            id: 'agent_dormant_30d_plus', 
            name: 'Dormant Agents (30+ Days Inactive)', 
            count: '640', 
            countNum: 640, 
            desc: 'Field agents with zero activity or terminal syncs in over a month.', 
            type: 'Agents', 
            icon: 'fa-user-slash text-rose-500 bg-rose-50', 
            badgeColor: 'bg-rose-50 text-rose-700 font-bold' 
        },
    ],
    'Partners': [
        { id: 'partner_all_active', name: 'All Active Partners', count: '420', countNum: 420, desc: 'Registered corporate, solution, and channel distribution partners.', type: 'Partners' },
        { id: 'partner_tier1', name: 'Tier 1 Regional Partners', count: '115', countNum: 115, desc: 'High-volume channel partners with certified commercial teams.', type: 'Partners' },
        { id: 'partner_pending', name: 'Pending Accreditation Partners', count: '64', countNum: 64, desc: 'New partner applications awaiting tier compliance review.', type: 'Partners' },
    ],
    'State Managers': [
        { id: 'sm_all_states', name: 'All State Managers', count: '37', countNum: 37, desc: 'Regional state directors across 36 states + FCT.', type: 'State Managers' },
        { id: 'sm_top_growth', name: 'Top Growth State Managers', count: '12', countNum: 12, desc: 'State leadership exceeding monthly target quotas.', type: 'State Managers' },
        { id: 'sm_under_review', name: 'States Under Performance Review', count: '8', countNum: 8, desc: 'State leadership teams flagged for KPI intervention.', type: 'State Managers' },
    ],
    'Employees': [
        { id: 'emp_all_staff', name: 'All Employees (Company-wide)', count: '185', countNum: 185, desc: 'Full-time staff across all internal business departments.', type: 'Employees' },
        { id: 'emp_support_ops', name: 'Customer Support & Operations', count: '42', countNum: 42, desc: 'Support engineers, customer success officers, and dispatchers.', type: 'Employees' },
        { id: 'emp_sales_growth', name: 'Sales & Growth Team', count: '38', countNum: 38, desc: 'Business development, direct sales, and marketing specialists.', type: 'Employees' },
        { id: 'emp_engineering', name: 'Engineering & Product Team', count: '48', countNum: 48, desc: 'Software engineers, QA specialists, and product managers.', type: 'Employees' },
        { id: 'emp_executive', name: 'Executive & Department Heads', count: '18', countNum: 18, desc: 'C-Suite directors, HODs, and operational team leads.', type: 'Employees' },
    ],
};

export const AUDIENCE_COUNTRIES = [
    'All Countries',
    'Nigeria',
    'Ghana',
    'Kenya',
    'South Africa',
    'Rwanda',
    'Uganda',
    'United Kingdom',
    'United States',
    'Other'
];

export const LOCATIONS_BY_COUNTRY: Record<string, string[]> = {
    'All Countries': [
        'All Locations'
    ],
    'Nigeria': [
        'All States (36 + FCT)',
        'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
        'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT (Abuja)', 'Gombe',
        'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
        'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
        'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
    ],
    'Ghana': [
        'All Regions',
        'Greater Accra', 'Ashanti', 'Western', 'Central', 'Eastern', 'Northern', 'Volta', 'Upper East', 'Upper West', 'Bono'
    ],
    'Kenya': [
        'All Counties',
        'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret (Uasin Gishu)', 'Kiambu', 'Machakos', 'Kajiado', 'Kilifi'
    ],
    'South Africa': [
        'All Provinces',
        'Gauteng (Johannesburg/Pretoria)', 'Western Cape (Cape Town)', 'KwaZulu-Natal (Durban)', 'Eastern Cape', 'Free State', 'Mpumalanga', 'Limpopo'
    ],
    'Rwanda': [
        'All Provinces',
        'Kigali City', 'Eastern Province', 'Northern Province', 'Western Province', 'Southern Province'
    ],
    'Uganda': [
        'All Regions',
        'Kampala (Central)', 'Central Region', 'Eastern Region', 'Northern Region', 'Western Region'
    ],
    'United Kingdom': [
        'All Regions',
        'Greater London', 'South East', 'North West', 'West Midlands', 'Scotland', 'Wales', 'Northern Ireland', 'Yorkshire'
    ],
    'United States': [
        'All States',
        'California', 'Texas', 'New York', 'Florida', 'Illinois', 'Georgia', 'Pennsylvania', 'Washington', 'Massachusetts'
    ],
    'Other': [
        'All Locations',
        'International Region'
    ]
};

export const AUDIENCE_INDUSTRIES = [
    'All Industries',
    'Healthcare & Medical',
    'Retail & Supermarkets',
    'Food, Beverage & Hospitality',
    'Fashion, Apparel & Beauty',
    'Electronics & Technology',
    'Automotive & Logistics',
    'Agriculture & Farming',
    'Building & Construction',
    'Professional & Financial Services',
    'Uncategorized'
];

export const BUSINESS_TYPES_BY_INDUSTRY: Record<string, string[]> = {
    'All Industries': [
        'All Business Types'
    ],
    'Healthcare & Medical': [
        'All Healthcare Types',
        'Pharmacy / Chemist',
        'Hospitals & Medical Centers',
        'Clinics & Diagnostic Labs',
        'Dental Clinics',
        'Optometry & Eye Clinics',
        'Maternity & Child Care'
    ],
    'Retail & Supermarkets': [
        'All Retail Types',
        'Supermarkets & Grocery Stores',
        'Mini Marts & Convenience',
        'Wholesale Distributors',
        'Provisions & FMCG Stores',
        'Department Stores'
    ],
    'Food, Beverage & Hospitality': [
        'All Food & Hospitality Types',
        'Restaurants & Eateries',
        'Bars, Pubs & Lounges',
        'Bakeries & Confectioneries',
        'Hotels & Guest Houses',
        'Fast Food / Quick Service',
        'Event Catering Services'
    ],
    'Fashion, Apparel & Beauty': [
        'All Fashion & Beauty Types',
        'Boutiques & Clothing Stores',
        'Shoe & Footwear Stores',
        'Hair Salons & Barbershops',
        'Beauty, Cosmetics & Spas',
        'Tailoring & Fashion Designers',
        'Jewelry & Accessories'
    ],
    'Electronics & Technology': [
        'All Technology Types',
        'Phone & Gadget Stores',
        'Computer & IT Hardware',
        'Consumer Electronics & Appliances',
        'Software & Tech Services',
        'Phone/PC Repair Workshops'
    ],
    'Automotive & Logistics': [
        'All Automotive Types',
        'Auto Spare Parts Dealers',
        'Auto Mechanics & Workshops',
        'Car Dealerships & Sales',
        'Logistics & Courier Dispatch',
        'Car Wash & Detailing'
    ],
    'Agriculture & Farming': [
        'All Agriculture Types',
        'Agro-Chemicals & Seed Dealers',
        'Poultry & Livestock Farms',
        'Crop Produce & Grain Merchants',
        'Fishery & Aquaculture',
        'Animal Feeds & Supplements'
    ],
    'Building & Construction': [
        'All Construction Types',
        'Building Materials & Cement',
        'Hardware & Electrical Stores',
        'Plumbing & Sanitation Supplies',
        'Paints & Finishes Dealers',
        'Real Estate & Developers'
    ],
    'Professional & Financial Services': [
        'All Services Types',
        'Accounting & Auditing Firms',
        'Legal Services & Law Practices',
        'Printing & Graphic Presses',
        'Schools & Training Institutes',
        'Security & Cleaning Services'
    ],
    'Uncategorized': [
        'All Uncategorized',
        'General Merchants',
        'Informal & Micro Traders',
        'Other Unclassified'
    ]
};

export const AUDIENCE_SUBSCRIPTION_TYPES = [
    'All Subscriptions',
    'Free Trial',
    'Basic Plan',
    'Pro Plan',
    'Enterprise Plan',
    'Overdue / Grace Period',
    'Expired Accounts'
];

export const AUDIENCE_REFERRAL_SOURCES = [
    'All Sources',
    'Prokip (Direct / Organic)',
    'Agent',
    'Partners',
    'Field Representatives',
    'Social Media / Ads',
    'Customer Referral'
];

const mockCampaigns: BroadcastCampaign[] = [
    { id: 'CMP-1045', name: 'Q3 Product Release Notes', type: 'Customers', channels: ['Email', 'In-App'], audience: 'All Active Customers', audienceSize: 142590, sentCount: 142590, deliveredCount: 141200, openedCount: 68450, clickedCount: 14200, failedCount: 1390, status: 'Completed', date: 'Aug 10, 2026' },
    { id: 'CMP-1046', name: 'Security Policy Compliance Notice', type: 'Employees', channels: ['Email'], audience: 'All Employees (Company-wide)', audienceSize: 185, sentCount: 185, deliveredCount: 185, openedCount: 178, clickedCount: 142, failedCount: 0, status: 'Completed', date: 'Aug 12, 2026' },
    { id: 'CMP-1047', name: 'Black Friday SaaS Promotion', type: 'Customers', channels: ['Email', 'SMS'], audience: 'Free Trial Customers', audienceSize: 12450, sentCount: 12450, deliveredCount: 12380, openedCount: 4200, clickedCount: 1400, failedCount: 70, status: 'Sending', date: 'Aug 14, 2026' },
    { id: 'CMP-1048', name: 'Partner Training & Certification Webinar', type: 'Partners', channels: ['Email'], audience: 'All Active Partners', audienceSize: 420, sentCount: 0, deliveredCount: 0, openedCount: 0, clickedCount: 0, failedCount: 0, status: 'Scheduled', date: 'Aug 16, 2026' },
    { id: 'CMP-1049', name: 'Agent Incentive & Tier Reward Program', type: 'Agents', channels: ['In-App', 'WhatsApp'], audience: 'High-Performing Agents', audienceSize: 380, sentCount: 150, deliveredCount: 148, openedCount: 110, clickedCount: 45, failedCount: 2, status: 'Sending', date: 'Aug 17, 2026' },
    { id: 'CMP-1050', name: 'Monthly Regional KPI & State Growth Directives', type: 'State Managers', channels: ['Email', 'In-App'], audience: 'All State Managers', audienceSize: 37, sentCount: 37, deliveredCount: 37, openedCount: 36, clickedCount: 32, failedCount: 0, status: 'Completed', date: 'Aug 15, 2026' },
];

const performanceData = [
    { date: 'Aug 8', sent: 12000, opened: 5400, clicked: 1200 },
    { date: 'Aug 9', sent: 15000, opened: 6200, clicked: 1450 },
    { date: 'Aug 10', sent: 48000, opened: 21000, clicked: 3800 },
    { date: 'Aug 11', sent: 5000, opened: 2800, clicked: 600 },
    { date: 'Aug 12', sent: 118000, opened: 88000, clicked: 13000 },
    { date: 'Aug 13', sent: 8500, opened: 4100, clicked: 950 },
    { date: 'Aug 14', sent: 42000, opened: 18000, clicked: 4100 },
];

export const AdminBroadcastsView: React.FC = () => {
    const { showSuccess, showError } = useAlert();
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [campaignsList, setCampaignsList] = useState<BroadcastCampaign[]>(mockCampaigns);
    
    // Campaign Creation State
    const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
    const [creationStep, setCreationStep] = useState(1);
    
    // Builder states
    const [campaignName, setCampaignName] = useState('');
    const [campaignType, setCampaignType] = useState<CampaignType>('Customers');
    const [campaignPriority, setCampaignPriority] = useState<string>('Normal Queue');
    const [campaignNotes, setCampaignNotes] = useState<string>('');
    const [selectedAudienceType, setSelectedAudienceType] = useState<'saved' | 'dynamic'>('saved');
    const [selectedSavedSegmentId, setSelectedSavedSegmentId] = useState<string>('cust_all_active');
    const [savedSegmentCategoryFilter, setSavedSegmentCategoryFilter] = useState<'auto' | CampaignType>('auto');
    const [selectedChannels, setSelectedChannels] = useState<string[]>(['Email']);

    // Audience Refinement Filters
    const [audienceFilterCountry, setAudienceFilterCountry] = useState<string>('All Countries');
    const [audienceFilterLocation, setAudienceFilterLocation] = useState<string>('All Locations');
    const [audienceFilterIndustry, setAudienceFilterIndustry] = useState<string>('All Industries');
    const [audienceFilterBusinessType, setAudienceFilterBusinessType] = useState<string>('All Business Types');
    const [audienceFilterSubscription, setAudienceFilterSubscription] = useState<string>('All Subscriptions');
    const [audienceFilterReferral, setAudienceFilterReferral] = useState<string>('All Sources');

    // Dynamic Rule State
    const [dynamicRules, setDynamicRules] = useState([
        { id: '1', field: 'Last Active Date', operator: 'More than (Older than)', value: '7', unit: 'Days ago' }
    ]);
    const [selectedDynamicPreset, setSelectedDynamicPreset] = useState('custom');

    // Editor & Campaign State
    const [campaignSubject, setCampaignSubject] = useState('');
    const [campaignSender, setCampaignSender] = useState('updates@prokip.africa');
    const [campaignPreheader, setCampaignPreheader] = useState('');
    const [campaignHtml, setCampaignHtml] = useState('');
    const [editorMode, setEditorMode] = useState<'visual' | 'html'>('visual');
    const [selectedCampaignTemplateId, setSelectedCampaignTemplateId] = useState<string | null>(null);

    // Template Modal State
    const [templates, setTemplates] = useState<any[]>(defaultHtmlTemplates);
    const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
    const [selectedTemplateChannelFilter, setSelectedTemplateChannelFilter] = useState<'All' | 'Email' | 'WhatsApp' | 'SMS'>('Email');
    const [templateModalMode, setTemplateModalMode] = useState<'visual' | 'html' | 'preview'>('preview');
    const [editingTemplateHtml, setEditingTemplateHtml] = useState('');
    const [editingTemplateTitle, setEditingTemplateTitle] = useState('');
    const [templatePreviewMode, setTemplatePreviewMode] = useState<'desktop' | 'mobile'>('desktop');
    
    // Campaign Progress View & Filter
    const [selectedCampaignViewId, setSelectedCampaignViewId] = useState<string | null>(null);
    const [audienceViewCategoryFilter, setAudienceViewCategoryFilter] = useState<CampaignType | 'All'>('All');

    // Computed Audience Info
    const activeSavedSegmentCategory: CampaignType = savedSegmentCategoryFilter === 'auto' ? campaignType : savedSegmentCategoryFilter;
    const currentCategorySavedSegments = savedSegmentsByType[activeSavedSegmentCategory] || savedSegmentsByType['Customers'];
    
    const allSavedSegmentsFlat = Object.values(savedSegmentsByType).flat();
    const currentSavedSegment = allSavedSegmentsFlat.find(s => s.id === selectedSavedSegmentId) || currentCategorySavedSegments[0];

    const isCustomerAudience = (selectedAudienceType === 'saved' ? (currentSavedSegment?.type || campaignType) : campaignType) === 'Customers';
    const currentAudienceCategory: CampaignType = selectedAudienceType === 'saved' ? (currentSavedSegment?.type || campaignType) : campaignType;

    const isCountryFiltered = audienceFilterCountry !== 'All Countries';
    const isLocationFiltered = Boolean(audienceFilterLocation && !audienceFilterLocation.startsWith('All '));
    const isIndustryFiltered = isCustomerAudience && audienceFilterIndustry !== 'All Industries';
    const isBusinessTypeFiltered = isCustomerAudience && Boolean(audienceFilterBusinessType && !audienceFilterBusinessType.startsWith('All '));
    const isSubscriptionFiltered = isCustomerAudience && audienceFilterSubscription !== 'All Subscriptions';
    const isReferralFiltered = isCustomerAudience && audienceFilterReferral !== 'All Sources';

    const hasActiveAudienceFilters = isCountryFiltered || isLocationFiltered || (isCustomerAudience && (isIndustryFiltered || isBusinessTypeFiltered || isSubscriptionFiltered || isReferralFiltered));

    const calculateAudienceMetrics = () => {
        let baseCount = selectedAudienceType === 'saved'
            ? (currentSavedSegment?.countNum || 52400)
            : (selectedDynamicPreset === 'recent_inactive' ? 1240 : selectedDynamicPreset === 'high_value' ? 850 : 14950);

        let multiplier = 1.0;

        if (isCountryFiltered) {
            if (audienceFilterCountry === 'Nigeria') multiplier *= 0.94;
            else if (['Ghana', 'Kenya'].includes(audienceFilterCountry)) multiplier *= 0.04;
            else if (['South Africa', 'United Kingdom', 'United States'].includes(audienceFilterCountry)) multiplier *= 0.025;
            else multiplier *= 0.015;
        }

        if (isLocationFiltered) {
            if (['Lagos', 'Kano', 'Rivers', 'Oyo', 'Nairobi', 'Greater Accra', 'Gauteng (Johannesburg/Pretoria)', 'Greater London', 'California', 'Texas'].includes(audienceFilterLocation)) {
                multiplier *= 0.32;
            } else if (['Abia', 'Anambra', 'Kaduna', 'Ogun', 'Enugu', 'Delta', 'Edo', 'FCT (Abuja)', 'Ashanti', 'Mombasa', 'Western Cape (Cape Town)', 'New York', 'Florida'].includes(audienceFilterLocation)) {
                multiplier *= 0.14;
            } else if (['Sokoto', 'Borno', 'Bauchi', 'Katsina', 'Akwa Ibom', 'Plateau', 'Benue', 'Kisumu', 'Nakuru', 'Kigali City'].includes(audienceFilterLocation)) {
                multiplier *= 0.07;
            } else {
                multiplier *= 0.04;
            }
        }

        if (isCustomerAudience) {
            if (isIndustryFiltered) {
                if (audienceFilterIndustry === 'Healthcare & Medical') multiplier *= 0.19;
                else if (audienceFilterIndustry === 'Retail & Supermarkets') multiplier *= 0.28;
                else if (audienceFilterIndustry === 'Food, Beverage & Hospitality') multiplier *= 0.16;
                else if (audienceFilterIndustry === 'Fashion, Apparel & Beauty') multiplier *= 0.14;
                else if (audienceFilterIndustry === 'Electronics & Technology') multiplier *= 0.12;
                else if (audienceFilterIndustry === 'Automotive & Logistics') multiplier *= 0.09;
                else if (audienceFilterIndustry === 'Agriculture & Farming') multiplier *= 0.08;
                else if (audienceFilterIndustry === 'Building & Construction') multiplier *= 0.07;
                else if (audienceFilterIndustry === 'Professional & Financial Services') multiplier *= 0.06;
                else multiplier *= 0.05;
            }

            if (isBusinessTypeFiltered) {
                if (audienceFilterBusinessType === 'Pharmacy / Chemist') multiplier *= 0.48;
                else if (audienceFilterBusinessType.includes('Supermarket') || audienceFilterBusinessType.includes('Wholesale')) multiplier *= 0.45;
                else if (audienceFilterBusinessType.includes('Hospitals') || audienceFilterBusinessType.includes('Clinics')) multiplier *= 0.32;
                else if (audienceFilterBusinessType.includes('Restaurants') || audienceFilterBusinessType.includes('Boutiques')) multiplier *= 0.40;
                else if (audienceFilterBusinessType.includes('Phone & Gadget') || audienceFilterBusinessType.includes('Computer')) multiplier *= 0.38;
                else multiplier *= 0.28;
            }

            if (isSubscriptionFiltered) {
                if (audienceFilterSubscription === 'Pro Plan') multiplier *= 0.42;
                else if (audienceFilterSubscription === 'Basic Plan') multiplier *= 0.36;
                else if (audienceFilterSubscription === 'Enterprise Plan') multiplier *= 0.14;
                else if (audienceFilterSubscription === 'Free Trial') multiplier *= 0.08;
                else multiplier *= 0.05;
            }

            if (isReferralFiltered) {
                if (audienceFilterReferral === 'Agent') multiplier *= 0.35;
                else if (audienceFilterReferral === 'Partners') multiplier *= 0.22;
                else if (audienceFilterReferral.includes('Prokip')) multiplier *= 0.43;
                else multiplier *= 0.12;
            }
        }

        const finalTargetCount = Math.max(Math.round(baseCount * multiplier), baseCount > 0 ? (multiplier < 1 ? Math.min(baseCount, Math.max(12, Math.round(baseCount * multiplier))) : baseCount) : 0);

        return {
            baseCount,
            multiplier,
            finalTargetCount
        };
    };

    const calculateTotalTargetAudience = () => {
        return calculateAudienceMetrics().finalTargetCount;
    };

    const resetAudienceFilters = () => {
        setAudienceFilterCountry('All Countries');
        setAudienceFilterLocation('All Locations');
        setAudienceFilterIndustry('All Industries');
        setAudienceFilterBusinessType('All Business Types');
        setAudienceFilterSubscription('All Subscriptions');
        setAudienceFilterReferral('All Sources');
    };

    const getSelectedAudienceInfo = () => {
        const totalCount = calculateTotalTargetAudience();
        const baseName = selectedAudienceType === 'saved'
            ? (currentSavedSegment?.name || 'All Active Customers')
            : (selectedDynamicPreset === 'recent_inactive' ? 'Recently Inactive (7 Days)' : selectedDynamicPreset === 'high_value' ? 'High Value Customers' : 'Custom Dynamic Segment');
        
        const filterLabels = [];
        if (isCountryFiltered) filterLabels.push(audienceFilterCountry);
        if (isLocationFiltered) filterLabels.push(audienceFilterLocation);
        if (isCustomerAudience) {
            if (isIndustryFiltered) filterLabels.push(audienceFilterIndustry);
            if (isBusinessTypeFiltered) filterLabels.push(audienceFilterBusinessType);
            if (isSubscriptionFiltered) filterLabels.push(audienceFilterSubscription);
            if (isReferralFiltered) filterLabels.push(audienceFilterReferral);
        }

        const desc = filterLabels.length > 0
            ? `Targeting ${baseName} filtered by ${filterLabels.join(', ')}`
            : (currentSavedSegment?.desc || 'Targeting verified active accounts');

        return {
            name: baseName,
            count: totalCount.toLocaleString(),
            countNum: totalCount,
            desc: desc,
            category: currentSavedSegment?.type || campaignType
        };
    };

    const renderOverview = () => (
        <div className="space-y-6 animate-fade-in">
            {/* High-level KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Sent This Month</p>
                    <h4 className="text-2xl font-black text-slate-800">1.24M</h4>
                    <p className="text-[10px] text-emerald-600 font-bold mt-1"><i className="fas fa-arrow-up mr-1"></i> 14% vs Last</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Delivered</p>
                    <h4 className="text-2xl font-black text-emerald-600">98.4%</h4>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">1.22M successfully</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Average Open</p>
                    <h4 className="text-2xl font-black text-blue-600">42.8%</h4>
                    <p className="text-[10px] text-emerald-600 font-bold mt-1"><i className="fas fa-arrow-up mr-1"></i> Industry Avg: 21%</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Average Click</p>
                    <h4 className="text-2xl font-black text-amber-600">8.2%</h4>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">Unique clicks</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Bounce Rate</p>
                    <h4 className="text-2xl font-black text-rose-600">0.8%</h4>
                    <p className="text-[10px] text-emerald-600 font-bold mt-1">Healthy</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Active Queue</p>
                    <h4 className="text-2xl font-black text-indigo-600">50K</h4>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">Sending currently...</p>
                </div>
            </div>

            {/* Performance Chart & Delivery Health */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-800">Engagement Trend (Last 7 Days)</h3>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorOpened" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `${val / 1000}k`} />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Area type="monotone" dataKey="sent" stroke="#94a3b8" fillOpacity={1} fill="url(#colorSent)" name="Sent" strokeWidth={2} />
                                <Area type="monotone" dataKey="opened" stroke="#3b82f6" fillOpacity={1} fill="url(#colorOpened)" name="Opened" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col">
                    <h3 className="font-bold text-slate-800 mb-4">Infrastructure Health</h3>
                    
                    <div className="space-y-4 flex-1">
                        <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                    <i className="fas fa-server"></i>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-800">Primary SMTP (AWS SES)</p>
                                    <p className="text-[10px] text-emerald-600 font-bold">Operational • 99.9% Uptime</p>
                                </div>
                            </div>
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                        </div>

                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                    <i className="fas fa-layer-group"></i>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-800">Background Workers</p>
                                    <p className="text-[10px] text-blue-600 font-bold">24 Active Nodes</p>
                                </div>
                            </div>
                            <p className="text-xs font-black text-blue-700">7.2k / min</p>
                        </div>

                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center">
                                    <i className="fas fa-ban"></i>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-800">Global Suppression List</p>
                                    <p className="text-[10px] text-slate-500 font-medium">Bounces, complaints, unsubscribes</p>
                                </div>
                            </div>
                            <p className="text-xs font-black text-slate-700">14,204</p>
                        </div>
                    </div>

                    <button className="w-full mt-4 py-2 bg-slate-100 hover:bg-slate-200 transition-colors rounded-lg text-xs font-bold text-slate-700">
                        View Detailed Provider Metrics <i className="fas fa-arrow-right ml-1"></i>
                    </button>
                </div>
            </div>

            {/* Recent Campaigns List */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800">Recent Campaigns</h3>
                    <button onClick={() => setActiveTab('campaigns')} className="text-xs font-bold text-[#02275A] hover:underline">View All</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white">
                            <tr className="text-slate-500 font-bold border-b border-slate-200 text-xs uppercase tracking-wider">
                                <th className="p-4">Campaign</th>
                                <th className="p-4">Audience</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Sent</th>
                                <th className="p-4 text-right">Opened</th>
                                <th className="p-4 text-right">Clicked</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {mockCampaigns.slice(0, 4).map(c => (
                                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4">
                                        <p className="font-bold text-slate-800">{c.name}</p>
                                        <div className="flex gap-2 mt-1">
                                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{c.type}</span>
                                            {c.channels.map(ch => (
                                                <span key={ch} className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">{ch}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <p className="font-semibold text-slate-700 text-xs">{c.audience}</p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">{c.audienceSize.toLocaleString()} recipients</p>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                                            c.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                                            c.status === 'Sending' ? 'bg-blue-100 text-blue-700 animate-pulse' :
                                            c.status === 'Scheduled' ? 'bg-amber-100 text-amber-700' :
                                            'bg-slate-100 text-slate-700'
                                        }`}>
                                            {c.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right font-semibold text-slate-700">{c.sentCount.toLocaleString()}</td>
                                    <td className="p-4 text-right">
                                        <p className="font-semibold text-slate-700">{c.openedCount.toLocaleString()}</p>
                                        {c.sentCount > 0 && <p className="text-[10px] text-slate-400">{Math.round((c.openedCount/c.deliveredCount)*100)}%</p>}
                                    </td>
                                    <td className="p-4 text-right">
                                        <p className="font-semibold text-slate-700">{c.clickedCount.toLocaleString()}</p>
                                        {c.sentCount > 0 && <p className="text-[10px] text-slate-400">{Math.round((c.clickedCount/c.deliveredCount)*100)}%</p>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderAudiences = () => {
        const displayedSegments = audienceViewCategoryFilter === 'All'
            ? Object.values(savedSegmentsByType).flat()
            : savedSegmentsByType[audienceViewCategoryFilter] || [];

        return (
            <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Audience Segments & Lists</h2>
                        <p className="text-xs text-slate-500">Curated saved segments across campaign types and custom dynamic rules.</p>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => {
                                setIsCreatingCampaign(true);
                                setCreationStep(2);
                                setSelectedAudienceType('dynamic');
                            }} 
                            className="bg-[#02275A] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-[#03367A] transition-colors"
                        >
                            <i className="fas fa-filter mr-2"></i> Create Dynamic Segment
                        </button>
                    </div>
                </div>

                {/* Campaign Category Filter Bar */}
                <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Audience Category:</span>
                    {(['All', 'Customers', 'Agents', 'Partners', 'State Managers', 'Employees'] as const).map(cat => (
                        <button
                            key={cat}
                            onClick={() => setAudienceViewCategoryFilter(cat)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${audienceViewCategoryFilter === cat ? 'bg-[#02275A] text-white shadow-xs font-black' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {displayedSegments.map(seg => {
                        const iconClass = seg.icon || (
                            seg.type === 'Customers' ? 'fa-users text-emerald-600 bg-emerald-50' :
                            seg.type === 'Agents' ? 'fa-id-badge text-blue-600 bg-blue-50' :
                            seg.type === 'Partners' ? 'fa-handshake text-purple-600 bg-purple-50' :
                            seg.type === 'State Managers' ? 'fa-map-marked-alt text-amber-600 bg-amber-50' :
                            'fa-briefcase text-rose-600 bg-rose-50'
                        );

                        return (
                            <div 
                                key={seg.id} 
                                onClick={() => {
                                    setCampaignType(seg.type);
                                    setSelectedSavedSegmentId(seg.id);
                                    setIsCreatingCampaign(true);
                                    setCreationStep(2);
                                }}
                                className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-[#02275A]/40 transition-all cursor-pointer group flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg group-hover:scale-110 transition-transform ${iconClass}`}>
                                            <i className={`fas ${iconClass.split(' ')[0]}`}></i>
                                        </div>
                                        <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md">{seg.type}</span>
                                    </div>
                                    <h3 className="font-bold text-slate-800 text-sm group-hover:text-[#02275A] transition-colors">{seg.name}</h3>
                                    <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">{seg.desc}</p>
                                </div>
                                <div className="flex justify-between items-end pt-3 border-t border-slate-100">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Estimated Size</p>
                                        <p className="text-lg font-black text-slate-800">{seg.count}</p>
                                    </div>
                                    <button className="text-xs font-bold text-[#02275A] group-hover:underline flex items-center gap-1">
                                        Use in Broadcast <i className="fas fa-arrow-right text-[10px]"></i>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

            {/* Segment Builder Preview UI */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center"><i className="fas fa-code-branch mr-2 text-slate-400"></i> Advanced Segment Builder (Preview)</h3>
                
                <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded">IF</span>
                        <select className="bg-slate-50 border border-slate-200 rounded text-xs px-2 py-1 outline-none">
                            <option>Account Type</option>
                            <option>Subscription Status</option>
                        </select>
                        <select className="bg-slate-50 border border-slate-200 rounded text-xs px-2 py-1 outline-none">
                            <option>Equals</option>
                        </select>
                        <select className="bg-slate-50 border border-slate-200 rounded text-xs px-2 py-1 outline-none font-bold">
                            <option>Customer</option>
                        </select>
                        <button className="text-slate-400 hover:text-rose-500"><i className="fas fa-times"></i></button>
                    </div>

                    <div className="pl-6 border-l-2 border-slate-200 space-y-4 relative">
                        <div className="absolute -left-2 top-2 bg-white text-slate-400 text-[10px] font-bold">AND</div>
                        
                        <div className="flex items-center gap-3">
                            <select className="bg-slate-50 border border-slate-200 rounded text-xs px-2 py-1 outline-none">
                                <option>Last Active</option>
                            </select>
                            <select className="bg-slate-50 border border-slate-200 rounded text-xs px-2 py-1 outline-none">
                                <option>Less than or equal to</option>
                            </select>
                            <input type="number" defaultValue={30} className="w-16 bg-slate-50 border border-slate-200 rounded text-xs px-2 py-1 outline-none" />
                            <select className="bg-slate-50 border border-slate-200 rounded text-xs px-2 py-1 outline-none">
                                <option>Days ago</option>
                            </select>
                            <button className="text-slate-400 hover:text-rose-500"><i className="fas fa-times"></i></button>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 inline-block">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded">OR GROUP</span>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <select className="bg-white border border-slate-200 rounded text-xs px-2 py-1 outline-none"><option>Industry</option></select>
                                    <select className="bg-white border border-slate-200 rounded text-xs px-2 py-1 outline-none"><option>Equals</option></select>
                                    <select className="bg-white border border-slate-200 rounded text-xs px-2 py-1 outline-none"><option>Retail</option></select>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-bold text-slate-400">OR</span>
                                    <select className="bg-white border border-slate-200 rounded text-xs px-2 py-1 outline-none"><option>Industry</option></select>
                                    <select className="bg-white border border-slate-200 rounded text-xs px-2 py-1 outline-none"><option>Equals</option></select>
                                    <select className="bg-white border border-slate-200 rounded text-xs px-2 py-1 outline-none"><option>Fashion</option></select>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <button className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors">
                        <i className="fas fa-plus mr-1"></i> Add Condition
                    </button>
                </div>
            </div>
        </div>
        );
    };



    const handleOpenTemplate = (tpl: any) => {
        setSelectedTemplate(tpl);
        setEditingTemplateHtml(tpl.html);
        setEditingTemplateTitle(tpl.title);
        setTemplateModalMode('preview');
    };

    const handleCreateTemplate = () => {
        const newTpl = {
            id: 'new-' + Date.now(),
            title: 'New Custom Template',
            cat: 'Custom',
            color: 'bg-slate-50',
            html: '<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333; padding: 30px; border: 1px solid #e2e8f0; border-radius: 8px;">  <h2>Hello {{first_name}},</h2>  <p>Start writing your custom template...</p></div>'
        };
        setSelectedTemplate(newTpl);
        setEditingTemplateHtml(newTpl.html);
        setEditingTemplateTitle(newTpl.title);
        setTemplateModalMode('visual');
    };

    const handleSaveTemplate = () => {
        if (!selectedTemplate) return;
        const updated = {
            ...selectedTemplate,
            title: editingTemplateTitle,
            html: editingTemplateHtml
        };
        
        setTemplates(prev => {
            const exists = prev.find(t => t.id === updated.id);
            if (exists) {
                return prev.map(t => t.id === updated.id ? updated : t);
            }
            return [...prev, updated];
        });
        
        setSelectedTemplate(null);
    };

    const renderTemplates = () => (
        <div className="space-y-6 animate-fade-in relative">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-800">Email Template Gallery</h2>
                <button onClick={handleCreateTemplate} className="bg-[#02275A] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-[#03367A] transition-colors">
                    <i className="fas fa-plus mr-2"></i> Create Template
                </button>
            </div>

            <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
                    {['Email', 'WhatsApp', 'SMS'].map((channel) => (
                        <button 
                            key={channel} 
                            onClick={() => setSelectedTemplateChannelFilter(channel as any)}
                            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${selectedTemplateChannelFilter === channel ? 'bg-white text-[#02275A] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            <i className={`fas ${channel === 'Email' ? 'fa-envelope' : channel === 'WhatsApp' ? 'fa-whatsapp text-green-500' : 'fa-comment-alt'} mr-2`}></i>
                            {channel} Templates
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {templates.filter(t => t.channel === selectedTemplateChannelFilter).map((tpl) => (
                    <div key={tpl.id} className="group bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                        <div className={`h-32 ${tpl.color} flex items-center justify-center p-4 relative border-b border-slate-100`}>
                            <div className="w-full h-full bg-white rounded shadow-sm opacity-50 overflow-hidden flex flex-col p-2">
                                <div className="w-1/3 h-2 bg-slate-200 rounded mb-2"></div>
                                <div className="w-3/4 h-3 bg-slate-300 rounded mb-2"></div>
                                <div className="w-full h-1 bg-slate-100 rounded mb-1"></div>
                                <div className="w-5/6 h-1 bg-slate-100 rounded mb-1"></div>
                                <div className="mt-auto w-1/2 h-4 bg-[#02275A] rounded"></div>
                            </div>
                            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button onClick={() => handleOpenTemplate(tpl)} className="bg-white text-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-100 shadow-sm">Edit / Preview</button>
                                <button onClick={() => { setActiveTab('campaigns'); setIsCreatingCampaign(true); setCreationStep(4); setSelectedCampaignTemplateId(tpl.id); setCampaignHtml(tpl.html); }} className="bg-[#02275A] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#03367A] shadow-sm">Use</button>
                            </div>
                        </div>
                        <div className="p-4">
                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider mb-1 block">{tpl.cat}</span>
                            <h3 className="font-bold text-slate-800 text-sm">{tpl.title}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Template Preview / Edit Modal */}
            {selectedTemplate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                        
                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
                            <div className="flex-1 max-w-md">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">{selectedTemplate.cat}</span>
                                {templateModalMode === 'preview' ? (
                                    <h3 className="text-lg font-bold text-slate-800">{editingTemplateTitle}</h3>
                                ) : (
                                    <input 
                                        type="text" 
                                        value={editingTemplateTitle}
                                        onChange={(e) => setEditingTemplateTitle(e.target.value)}
                                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-lg font-bold text-slate-800 outline-none focus:border-[#02275A]" 
                                    />
                                )}
                            </div>
                            
                            <div className="flex items-center gap-4">
                                {selectedTemplate.channel !== 'WhatsApp' && (
                                    <div className="flex bg-slate-200 p-1 rounded-lg">
                                        <button 
                                            onClick={() => setTemplateModalMode('visual')}
                                            className={`px-3 py-1 rounded text-xs font-bold transition-colors ${templateModalMode === 'visual' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            <i className="fas fa-eye mr-1"></i> Visual
                                        </button>
                                        <button 
                                            onClick={() => setTemplateModalMode('html')}
                                            className={`px-3 py-1 rounded text-xs font-bold transition-colors ${templateModalMode === 'html' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            <i className="fas fa-code mr-1"></i> HTML
                                        </button>
                                        <button 
                                            onClick={() => setTemplateModalMode('preview')}
                                            className={`px-3 py-1 rounded text-xs font-bold transition-colors ${templateModalMode === 'preview' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            <i className="fas fa-desktop mr-1"></i> Preview
                                        </button>
                                    </div>
                                )}

                                {selectedTemplate.channel !== 'WhatsApp' && (
                                    <button onClick={handleSaveTemplate} className="bg-[#02275A] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-[#03367A] transition-colors">
                                        Save Template
                                    </button>
                                )}
                                <button onClick={() => setSelectedTemplate(null)} className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors flex items-center justify-center">
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="flex flex-1 overflow-hidden bg-slate-200/50 relative">
                            {templateModalMode === 'html' && (
                                <div className="w-full flex flex-col bg-slate-900">
                                    <div className="p-2 bg-slate-800 text-xs font-bold text-slate-400 flex justify-between uppercase tracking-wider">
                                        <span>Source HTML (Paste your custom HTML here)</span>
                                        <i className="fas fa-code"></i>
                                    </div>
                                    <textarea 
                                        value={editingTemplateHtml}
                                        onChange={(e) => setEditingTemplateHtml(e.target.value)}
                                        className="flex-1 w-full bg-slate-900 text-emerald-400 p-4 font-mono text-sm resize-none outline-none focus:ring-inset focus:ring-1 focus:ring-emerald-500/50"
                                        placeholder="<!-- Type or paste your raw HTML template here -->"
                                        spellCheck={false}
                                    />
                                </div>
                            )}

                            {templateModalMode === 'visual' && (
                                <div className="w-full flex flex-col">
                                    {/* Editor Toolbar */}
                                    <div className="bg-slate-50 border-b border-slate-200 p-2 flex flex-wrap gap-1 items-center z-10 shadow-sm">
                                        <button onClick={() => { document.execCommand('bold', false, undefined); document.getElementById('template-visual-editor')?.focus(); }} className="w-8 h-8 rounded hover:bg-slate-200 text-slate-600"><i className="fas fa-bold"></i></button>
                                        <button onClick={() => { document.execCommand('italic', false, undefined); document.getElementById('template-visual-editor')?.focus(); }} className="w-8 h-8 rounded hover:bg-slate-200 text-slate-600"><i className="fas fa-italic"></i></button>
                                        <button onClick={() => { document.execCommand('underline', false, undefined); document.getElementById('template-visual-editor')?.focus(); }} className="w-8 h-8 rounded hover:bg-slate-200 text-slate-600"><i className="fas fa-underline"></i></button>
                                        <div className="w-px h-6 bg-slate-300 mx-1"></div>
                                        <button onClick={() => { document.execCommand('formatBlock', false, 'H1'); document.getElementById('template-visual-editor')?.focus(); }} className="px-2 h-8 rounded hover:bg-slate-200 text-slate-600 text-xs font-bold"><i className="fas fa-heading mr-1"></i> H1</button>
                                        <button onClick={() => { document.execCommand('formatBlock', false, 'P'); document.getElementById('template-visual-editor')?.focus(); }} className="px-2 h-8 rounded hover:bg-slate-200 text-slate-600 text-xs font-bold"><i className="fas fa-paragraph mr-1"></i> Text</button>
                                        <button onClick={() => { const url = prompt('Enter link URL:'); if (url) { document.execCommand('createLink', false, url); document.getElementById('template-visual-editor')?.focus(); } }} className="px-2 h-8 rounded hover:bg-slate-200 text-slate-600 text-xs font-bold"><i className="fas fa-link mr-1"></i> Link</button>
                                        <button onClick={() => { const url = prompt('Enter Image URL:'); if (url) { document.execCommand('insertImage', false, url); document.getElementById('template-visual-editor')?.focus(); } }} className="px-2 h-8 rounded hover:bg-slate-200 text-slate-600 text-xs font-bold"><i className="fas fa-image mr-1"></i> Image</button>
                                        <div className="relative ml-auto group">
                                                <button className="px-3 h-8 rounded bg-[#02275A] text-white text-xs font-bold flex items-center transition-colors hover:bg-[#03367A]">
                                                    <i className="fas fa-code mr-2"></i> Insert Variable <i className="fas fa-chevron-down ml-2 text-[10px]"></i>
                                                </button>
                                                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                                                    <div className="py-1">
                                                        {[
                                                            { label: '{{first_name}}', val: '{{first_name}}' },
                                                            { label: '{{business_name}}', val: '{{business_name}}' },
                                                            { label: '{{unsubscribe_url}}', val: '{{unsubscribe_url}}' }
                                                        ].map(v => (
                                                            <button 
                                                                key={v.val}
                                                                onClick={() => {
                                                                    document.getElementById('template-visual-editor')?.focus();
                                                                    document.execCommand('insertText', false, v.val);
                                                                }}
                                                                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 font-mono"
                                                            >
                                                                {v.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-6 flex justify-center">
                                        <div className="bg-white w-full max-w-2xl border border-slate-200 rounded-lg shadow-sm min-h-full">
                                            <div 
                                                id="template-visual-editor"
                                                contentEditable={true}
                                                suppressContentEditableWarning={true}
                                                onBlur={(e) => setEditingTemplateHtml(e.currentTarget.innerHTML)}
                                                className="w-full min-h-[400px] focus:outline-none p-6 text-slate-800"
                                                dangerouslySetInnerHTML={{ __html: editingTemplateHtml || '<div style="color: #94a3b8;">Start typing...</div>' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {templateModalMode === 'preview' && (
                                <div className="w-full flex flex-col items-center justify-center p-8 overflow-y-auto">
                                    <div className="flex gap-2 mb-4">
                                        <button onClick={() => setTemplatePreviewMode('desktop')} className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${templatePreviewMode === 'desktop' ? 'bg-slate-800 text-white' : 'bg-slate-300 text-slate-700'}`}><i className="fas fa-desktop mr-1"></i> Desktop</button>
                                        <button onClick={() => setTemplatePreviewMode('mobile')} className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${templatePreviewMode === 'mobile' ? 'bg-slate-800 text-white' : 'bg-slate-300 text-slate-700'}`}><i className="fas fa-mobile-screen mr-1"></i> Mobile</button>
                                    </div>
                                    <div className={`bg-white shadow-lg border border-slate-200 transition-all duration-300 ${templatePreviewMode === 'mobile' ? 'w-[375px] h-[812px] rounded-3xl overflow-hidden shadow-2xl relative border-8 border-slate-800' : 'w-full max-w-2xl min-h-[500px] rounded-xl'}`}>
                                        {templatePreviewMode === 'mobile' && (
                                            <div className="absolute top-0 inset-x-0 h-6 bg-slate-800 flex justify-center rounded-t-xl z-10">
                                                <div className="w-32 h-4 bg-black rounded-b-xl"></div>
                                            </div>
                                        )}
                                        <div 
                                            className={`w-full h-full bg-white ${templatePreviewMode === 'mobile' ? 'pt-8' : ''}`}
                                            dangerouslySetInnerHTML={{ __html: editingTemplateHtml }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderCreateBroadcast = () => (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[600px] animate-fade-in">
            {/* Wizard Header */}
            <div className="bg-slate-50 border-b border-slate-100 p-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button onClick={() => setIsCreatingCampaign(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors">
                        <i className="fas fa-times text-sm"></i>
                    </button>
                    <div>
                        <h2 className="font-bold text-slate-800">Create New Broadcast</h2>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                            Step {creationStep} of 6
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-1.5 rounded-lg text-xs font-bold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50">Save Draft</button>
                </div>
            </div>

            <div className="flex flex-1">
                {/* Left Sidebar - Steps */}
                <div className="w-64 border-r border-slate-100 bg-slate-50/50 p-6 hidden md:block">
                    <ul className="space-y-6">
                        {[
                            { step: 1, title: 'Campaign Details', icon: 'fa-info-circle' },
                            { step: 2, title: 'Audience Selection', icon: 'fa-users' },
                            { step: 3, title: 'Channel & Template', icon: 'fa-layer-group' },
                            { step: 4, title: 'Content Editor', icon: 'fa-pen-nib' },
                            { step: 5, title: 'Preview & Test', icon: 'fa-mobile-screen' },
                            { step: 6, title: 'Schedule & Send', icon: 'fa-paper-plane' },
                        ].map((s) => (
                            <li key={s.step} className={`flex items-start gap-3 ${creationStep === s.step ? 'text-[#02275A]' : creationStep > s.step ? 'text-emerald-600' : 'text-slate-400'}`}>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5 ${creationStep === s.step ? 'bg-[#02275A] text-white shadow-sm' : creationStep > s.step ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                                    {creationStep > s.step ? <i className="fas fa-check"></i> : s.step}
                                </div>
                                <div>
                                    <p className={`text-sm font-bold ${creationStep === s.step ? 'text-slate-800' : ''}`}>{s.title}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 p-6 md:p-10 bg-white">
                    <div className="max-w-2xl mx-auto">
                        
                        {creationStep === 1 && (
                            <div className="space-y-6 animate-fade-in">
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 mb-1">Campaign Details</h3>
                                    <p className="text-sm text-slate-500 mb-6">Give your broadcast a name, target audience category, and operational details.</p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Broadcast Name <span className="text-rose-500">*</span></label>
                                        <input 
                                            type="text" 
                                            value={campaignName}
                                            onChange={e => setCampaignName(e.target.value)}
                                            placeholder="e.g. Q3 New Features & Policy Update" 
                                            className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 outline-none focus:border-[#02275A] focus:ring-1 focus:ring-[#02275A] text-sm shadow-sm transition-all" 
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="block text-xs font-bold text-slate-700">Campaign Type <span className="text-rose-500">*</span></label>
                                                <span className="text-[10px] text-slate-500 font-semibold">Target Audience Category</span>
                                            </div>
                                            <select 
                                                value={campaignType}
                                                onChange={e => {
                                                    const newType = e.target.value as CampaignType;
                                                    setCampaignType(newType);
                                                    const firstSeg = savedSegmentsByType[newType]?.[0];
                                                    if (firstSeg) {
                                                        setSelectedSavedSegmentId(firstSeg.id);
                                                    }
                                                }}
                                                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 outline-none focus:border-[#02275A] focus:ring-1 focus:ring-[#02275A] text-sm shadow-sm font-bold text-slate-800 cursor-pointer"
                                            >
                                                <option value="Customers">Customers</option>
                                                <option value="Agents">Agents</option>
                                                <option value="Partners">Partners</option>
                                                <option value="State Managers">State Managers</option>
                                                <option value="Employees">Employees</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
                                            <select 
                                                value={campaignPriority}
                                                onChange={e => setCampaignPriority(e.target.value)}
                                                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 outline-none focus:border-[#02275A] text-sm shadow-sm text-slate-800"
                                            >
                                                <option>Normal Queue</option>
                                                <option>High Priority</option>
                                                <option>Critical (Bypasses limits)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Internal Description / Notes</label>
                                        <textarea 
                                            rows={3} 
                                            value={campaignNotes}
                                            onChange={e => setCampaignNotes(e.target.value)}
                                            placeholder="Optional details for other admins, compliance justification, or operational remarks..." 
                                            className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 outline-none focus:border-[#02275A] text-sm shadow-sm"
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                        )}

                        {creationStep === 2 && (
                            <div className="space-y-6 animate-fade-in">
                                <div>
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="text-xl font-black text-slate-800">Audience Selection</h3>
                                        <span className="text-xs font-bold bg-[#02275A]/10 text-[#02275A] px-3 py-1 rounded-full border border-[#02275A]/20">
                                            Campaign Type: <strong className="font-black">{campaignType}</strong>
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500 mb-6">Define who will receive this broadcast. Choose from curated segments for {campaignType} or build dynamic rules.</p>
                                </div>

                                {/* Audience Type Tabs */}
                                <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
                                    <button 
                                        type="button"
                                        onClick={() => setSelectedAudienceType('saved')} 
                                        className={`flex-1 py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 ${selectedAudienceType === 'saved' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                    >
                                        <i className="fas fa-bookmark text-[11px]"></i> Saved Segments ({campaignType})
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setSelectedAudienceType('dynamic')} 
                                        className={`flex-1 py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 ${selectedAudienceType === 'dynamic' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                    >
                                        <i className="fas fa-sliders-h text-[11px]"></i> Dynamic Segments & Rules
                                    </button>
                                </div>

                                {selectedAudienceType === 'saved' && (
                                    <div className="space-y-4">
                                        {/* Category switcher */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 border border-slate-200 p-3 rounded-xl gap-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Type:</span>
                                                <span className="text-xs font-extrabold bg-[#02275A] text-white px-2.5 py-0.5 rounded-md">
                                                    {activeSavedSegmentCategory}
                                                </span>
                                            </div>
                                            <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
                                                {(['Customers', 'Agents', 'Partners', 'State Managers', 'Employees'] as const).map(cat => (
                                                    <button
                                                        key={cat}
                                                        type="button"
                                                        onClick={() => {
                                                            setSavedSegmentCategoryFilter(cat);
                                                            const firstSeg = savedSegmentsByType[cat]?.[0];
                                                            if (firstSeg) setSelectedSavedSegmentId(firstSeg.id);
                                                        }}
                                                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all whitespace-nowrap ${activeSavedSegmentCategory === cat ? 'bg-white text-[#02275A] shadow-xs border border-slate-300 font-black' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'}`}
                                                    >
                                                        {cat}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            {currentCategorySavedSegments.map(aud => {
                                                const iconClass = aud.icon || (
                                                    aud.type === 'Customers' ? 'fa-users text-emerald-600 bg-emerald-50' :
                                                    aud.type === 'Agents' ? 'fa-id-badge text-blue-600 bg-blue-50' :
                                                    aud.type === 'Partners' ? 'fa-handshake text-purple-600 bg-purple-50' :
                                                    aud.type === 'State Managers' ? 'fa-map-marked-alt text-amber-600 bg-amber-50' :
                                                    'fa-briefcase text-rose-600 bg-rose-50'
                                                );

                                                return (
                                                    <label 
                                                        key={aud.id} 
                                                        onClick={() => setSelectedSavedSegmentId(aud.id)}
                                                        className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-all ${selectedSavedSegmentId === aud.id ? 'border-[#02275A] bg-[#02275A]/5 shadow-xs ring-1 ring-[#02275A]' : 'border-slate-200 hover:border-[#02275A]/50 bg-white'}`}
                                                    >
                                                        <div className="mt-1">
                                                            <input 
                                                                type="radio" 
                                                                name="audience_preset" 
                                                                checked={selectedSavedSegmentId === aud.id}
                                                                onChange={() => setSelectedSavedSegmentId(aud.id)}
                                                                className="w-4 h-4 text-[#02275A] focus:ring-[#02275A]" 
                                                            />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                                <div className="flex items-center gap-2.5 min-w-0">
                                                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${iconClass}`}>
                                                                        <i className={`fas ${iconClass.split(' ')[0]}`}></i>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                        <h4 className="font-bold text-slate-800 text-sm">{aud.name}</h4>
                                                                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">{aud.type}</span>
                                                                    </div>
                                                                </div>
                                                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap self-start sm:self-auto ${aud.badgeColor || 'text-slate-700 bg-slate-100'}`}>
                                                                    {aud.count} {aud.count.includes('List') ? '' : 'recipients'}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{aud.desc}</p>
                                                        </div>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {selectedAudienceType === 'dynamic' && (
                                    <div className="space-y-6">
                                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                                            <i className="fas fa-info-circle text-blue-500 mt-0.5"></i>
                                            <div>
                                                <h4 className="font-bold text-sm text-blue-900">Dynamic Segments</h4>
                                                <p className="text-xs text-blue-700 mt-1">Select an existing dynamic segment or create custom rules to target specific sub-sections of your customers. The estimated audience size will update dynamically.</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <h4 className="font-bold text-slate-800 text-sm mb-2">Select Built Segment</h4>
                                            {[
                                                { id: 'recent_inactive', name: 'Recently Inactive (7 Days)', rulesText: 'Last Active Date > 7 Days ago', count: '~1,240' },
                                                { id: 'high_value', name: 'High Value Customers', rulesText: 'Total Sales Value > 1,000,000', count: '~850' },
                                                { id: 'custom', name: 'Custom Dynamic Segment', rulesText: 'Build your own criteria', count: 'Varies' }
                                            ].map(seg => (
                                                <label 
                                                    key={seg.id} 
                                                    className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-all ${selectedDynamicPreset === seg.id ? 'border-[#02275A] bg-[#02275A]/5' : 'border-slate-200 bg-white hover:border-[#02275A]/50'}`}
                                                    onClick={() => setSelectedDynamicPreset(seg.id)}
                                                >
                                                    <div className="mt-0.5">
                                                        <input 
                                                            type="radio" 
                                                            name="dynamic_preset" 
                                                            checked={selectedDynamicPreset === seg.id} 
                                                            onChange={() => setSelectedDynamicPreset(seg.id)}
                                                            className="w-4 h-4 text-[#02275A] focus:ring-[#02275A]" 
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between">
                                                            <h4 className="font-bold text-slate-800 text-sm">{seg.name}</h4>
                                                            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 rounded-full">{seg.count} recipients</span>
                                                        </div>
                                                        <p className="text-xs text-slate-500 mt-1">{seg.rulesText}</p>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>

                                        {selectedDynamicPreset === 'custom' && (
                                            <div className="border border-slate-200 rounded-xl bg-white overflow-hidden animate-fade-in">
                                                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                                    <span className="text-sm font-bold text-slate-700">Target customers matching <span className="text-[#02275A] underline underline-offset-2">ALL</span> of the following:</span>
                                                </div>
                                            
                                            <div className="p-4 space-y-3">
                                                {dynamicRules.map((rule, idx) => (
                                                    <div key={rule.id} className="flex flex-col md:flex-row gap-2">
                                                        <select 
                                                            value={rule.field}
                                                            onChange={(e) => {
                                                                const newRules = [...dynamicRules];
                                                                newRules[idx].field = e.target.value;
                                                                setDynamicRules(newRules);
                                                            }}
                                                            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 flex-1 focus:outline-none focus:border-[#02275A]"
                                                        >
                                                            <option>Last Active Date</option>
                                                            <option>Account Type</option>
                                                            <option>Subscription Status</option>
                                                            <option>Total Sales Value</option>
                                                        </select>
                                                        
                                                        {rule.field === 'Last Active Date' ? (
                                                            <>
                                                                <select 
                                                                    value={rule.operator}
                                                                    onChange={(e) => {
                                                                        const newRules = [...dynamicRules];
                                                                        newRules[idx].operator = e.target.value;
                                                                        setDynamicRules(newRules);
                                                                    }}
                                                                    className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 flex-1 focus:outline-none focus:border-[#02275A]"
                                                                >
                                                                    <option>More than (Older than)</option>
                                                                    <option>Less than (Within)</option>
                                                                    <option>Exactly</option>
                                                                </select>
                                                                <div className="flex-1 flex gap-2">
                                                                    <input 
                                                                        type="number" 
                                                                        value={rule.value} 
                                                                        onChange={(e) => {
                                                                            const newRules = [...dynamicRules];
                                                                            newRules[idx].value = e.target.value;
                                                                            setDynamicRules(newRules);
                                                                        }}
                                                                        className="w-16 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-[#02275A]" 
                                                                    />
                                                                    <select 
                                                                        value={rule.unit}
                                                                        onChange={(e) => {
                                                                            const newRules = [...dynamicRules];
                                                                            newRules[idx].unit = e.target.value;
                                                                            setDynamicRules(newRules);
                                                                        }}
                                                                        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 flex-1 focus:outline-none focus:border-[#02275A]"
                                                                    >
                                                                        <option>Days ago</option>
                                                                        <option>Weeks ago</option>
                                                                        <option>Months ago</option>
                                                                    </select>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <select 
                                                                    value={rule.operator}
                                                                    onChange={(e) => {
                                                                        const newRules = [...dynamicRules];
                                                                        newRules[idx].operator = e.target.value;
                                                                        setDynamicRules(newRules);
                                                                    }}
                                                                    className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 flex-1 focus:outline-none focus:border-[#02275A]"
                                                                >
                                                                    <option>Is exactly</option>
                                                                    <option>Is not</option>
                                                                </select>
                                                                <div className="flex-1 flex gap-2">
                                                                    {rule.field === 'Account Type' ? (
                                                                        <select 
                                                                            value={rule.value}
                                                                            onChange={(e) => {
                                                                                const newRules = [...dynamicRules];
                                                                                newRules[idx].value = e.target.value;
                                                                                setDynamicRules(newRules);
                                                                            }}
                                                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 flex-1 focus:outline-none focus:border-[#02275A]"
                                                                        >
                                                                            <option>Field Agent</option>
                                                                            <option>Business Owner</option>
                                                                            <option>Manager</option>
                                                                        </select>
                                                                    ) : (
                                                                        <input 
                                                                            type="text" 
                                                                            value={rule.value}
                                                                            onChange={(e) => {
                                                                                const newRules = [...dynamicRules];
                                                                                newRules[idx].value = e.target.value;
                                                                                setDynamicRules(newRules);
                                                                            }}
                                                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-[#02275A]" 
                                                                            placeholder="Enter value"
                                                                        />
                                                                    )}
                                                                </div>
                                                            </>
                                                        )}
                                                        
                                                        <button 
                                                            onClick={() => setDynamicRules(dynamicRules.filter(r => r.id !== rule.id))}
                                                            className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                                                        >
                                                            <i className="fas fa-trash-alt"></i>
                                                        </button>
                                                    </div>
                                                ))}
                                                
                                                <button 
                                                    onClick={() => setDynamicRules([...dynamicRules, { id: Math.random().toString(), field: 'Account Type', operator: 'Is exactly', value: 'Field Agent', unit: '' }])}
                                                    className="mt-2 text-xs font-bold text-[#02275A] hover:underline flex items-center gap-1"
                                                >
                                                    <i className="fas fa-plus"></i> Add Rule
                                                </button>
                                            </div>
                                            <div className="bg-slate-50 border-t border-slate-100 p-4 flex justify-between items-center">
                                                <span className="text-xs font-bold text-slate-500 uppercase">Estimated Audience Size</span>
                                                <span className="text-lg font-black text-emerald-600">
                                                    ~{dynamicRules.length === 0 ? '0' : Math.floor(Math.random() * 5000 + 100).toLocaleString()} recipients
                                                </span>
                                            </div>
                                        </div>
                                        )}
                                    </div>
                                )}

                                {/* Audience Targeting & Demographics Filter Section */}
                                <div className="mt-8 pt-6 border-t border-slate-200 space-y-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                                    <i className="fas fa-filter text-[#02275A]"></i>
                                                    Audience Targeting & Refinement Filters
                                                </h4>
                                                <span className="text-[10px] font-extrabold bg-blue-50 text-[#02275A] border border-blue-200 px-2 py-0.5 rounded-full">
                                                    Optional Refinement
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                {isCustomerAudience 
                                                    ? 'Filter the selected customer audience by country, dynamic state/region, industry, business type, subscription, or referral source.' 
                                                    : `Filter the selected ${currentSavedSegment?.type || campaignType} audience by country and state/region.`}
                                            </p>
                                        </div>
                                        {hasActiveAudienceFilters && (
                                            <button
                                                type="button"
                                                onClick={resetAudienceFilters}
                                                className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                                            >
                                                <i className="fas fa-times-circle"></i> Clear Filters
                                            </button>
                                        )}
                                    </div>

                                    {/* Filter Dropdowns Grid - Country FIRST. Only Country & Location for Agents, Partners, State Managers & Employees */}
                                    {(() => {
                                        const availableLocations = LOCATIONS_BY_COUNTRY[audienceFilterCountry] || LOCATIONS_BY_COUNTRY['All Countries'];
                                        const locationLabel = audienceFilterCountry === 'Nigeria' 
                                            ? 'Location / State (Nigeria)' 
                                            : audienceFilterCountry === 'Ghana' 
                                            ? 'Location / Region (Ghana)' 
                                            : audienceFilterCountry === 'Kenya' 
                                            ? 'Location / County (Kenya)' 
                                            : (audienceFilterCountry === 'South Africa' || audienceFilterCountry === 'Rwanda')
                                            ? 'Location / Province'
                                            : audienceFilterCountry === 'United States'
                                            ? 'Location / State (US)'
                                            : 'Location / State / Region';

                                        const availableBusinessTypes = BUSINESS_TYPES_BY_INDUSTRY[audienceFilterIndustry] || ['All Business Types'];
                                        const businessTypeLabel = audienceFilterIndustry !== 'All Industries' 
                                            ? `Business Type (${audienceFilterIndustry})` 
                                            : 'Business Type';

                                        return (
                                            <div className={`grid grid-cols-1 ${isCustomerAudience ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2'} gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200`}>
                                                {/* 1. Country - FIRST */}
                                                <div>
                                                    <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                                                        <i className="fas fa-globe-africa text-blue-500"></i> Country
                                                    </label>
                                                    <select
                                                        value={audienceFilterCountry}
                                                        onChange={(e) => {
                                                            const newCountry = e.target.value;
                                                            setAudienceFilterCountry(newCountry);
                                                            const locs = LOCATIONS_BY_COUNTRY[newCountry] || ['All Locations'];
                                                            setAudienceFilterLocation(locs[0]);
                                                        }}
                                                        className={`w-full text-xs font-bold bg-white border rounded-lg px-3 py-2.5 outline-none transition-all cursor-pointer ${isCountryFiltered ? 'border-[#02275A] text-[#02275A] bg-blue-50/30 ring-1 ring-[#02275A]' : 'border-slate-300 text-slate-700 focus:border-[#02275A]'}`}
                                                    >
                                                        {AUDIENCE_COUNTRIES.map(ct => (
                                                            <option key={ct} value={ct}>{ct}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* 2. Location / State / Region - Dynamically derived from selected Country */}
                                                <div>
                                                    <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                                                        <i className="fas fa-map-marker-alt text-rose-500"></i> {locationLabel}
                                                    </label>
                                                    <select
                                                        value={audienceFilterLocation}
                                                        onChange={(e) => setAudienceFilterLocation(e.target.value)}
                                                        className={`w-full text-xs font-bold bg-white border rounded-lg px-3 py-2.5 outline-none transition-all cursor-pointer ${isLocationFiltered ? 'border-[#02275A] text-[#02275A] bg-blue-50/30 ring-1 ring-[#02275A]' : 'border-slate-300 text-slate-700 focus:border-[#02275A]'}`}
                                                    >
                                                        {availableLocations.map(loc => (
                                                            <option key={loc} value={loc}>{loc}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Customer-only Refinement Filters: Industry, Business Type, Subscription & Referral */}
                                                {isCustomerAudience && (
                                                    <>
                                                        {/* 3. Industry - Primary Category */}
                                                        <div>
                                                            <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                                                                <i className="fas fa-industry text-emerald-600"></i> Industry
                                                            </label>
                                                            <select
                                                                value={audienceFilterIndustry}
                                                                onChange={(e) => {
                                                                    const newIndustry = e.target.value;
                                                                    setAudienceFilterIndustry(newIndustry);
                                                                    const types = BUSINESS_TYPES_BY_INDUSTRY[newIndustry] || ['All Business Types'];
                                                                    setAudienceFilterBusinessType(types[0]);
                                                                }}
                                                                className={`w-full text-xs font-bold bg-white border rounded-lg px-3 py-2.5 outline-none transition-all cursor-pointer ${isIndustryFiltered ? 'border-[#02275A] text-[#02275A] bg-blue-50/30 ring-1 ring-[#02275A]' : 'border-slate-300 text-slate-700 focus:border-[#02275A]'}`}
                                                            >
                                                                {AUDIENCE_INDUSTRIES.map(ind => (
                                                                    <option key={ind} value={ind}>{ind}</option>
                                                                ))}
                                                            </select>
                                                        </div>

                                                        {/* 4. Business Type - Dynamically derived from selected Industry */}
                                                        <div>
                                                            <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                                                                <i className="fas fa-store text-teal-600"></i> {businessTypeLabel}
                                                            </label>
                                                            <select
                                                                value={audienceFilterBusinessType}
                                                                onChange={(e) => setAudienceFilterBusinessType(e.target.value)}
                                                                className={`w-full text-xs font-bold bg-white border rounded-lg px-3 py-2.5 outline-none transition-all cursor-pointer ${isBusinessTypeFiltered ? 'border-[#02275A] text-[#02275A] bg-blue-50/30 ring-1 ring-[#02275A]' : 'border-slate-300 text-slate-700 focus:border-[#02275A]'}`}
                                                            >
                                                                {availableBusinessTypes.map(bt => (
                                                                    <option key={bt} value={bt}>{bt}</option>
                                                                ))}
                                                            </select>
                                                        </div>

                                                        {/* 5. Subscription Type */}
                                                        <div>
                                                            <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                                                                <i className="fas fa-crown text-amber-500"></i> Subscription Type
                                                            </label>
                                                            <select
                                                                value={audienceFilterSubscription}
                                                                onChange={(e) => setAudienceFilterSubscription(e.target.value)}
                                                                className={`w-full text-xs font-bold bg-white border rounded-lg px-3 py-2.5 outline-none transition-all cursor-pointer ${isSubscriptionFiltered ? 'border-[#02275A] text-[#02275A] bg-blue-50/30 ring-1 ring-[#02275A]' : 'border-slate-300 text-slate-700 focus:border-[#02275A]'}`}
                                                            >
                                                                {AUDIENCE_SUBSCRIPTION_TYPES.map(sub => (
                                                                    <option key={sub} value={sub}>{sub}</option>
                                                                ))}
                                                            </select>
                                                        </div>

                                                        {/* 6. Referral Source */}
                                                        <div>
                                                            <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                                                                <i className="fas fa-handshake text-purple-600"></i> Referral / Acquisition Source
                                                            </label>
                                                            <select
                                                                value={audienceFilterReferral}
                                                                onChange={(e) => setAudienceFilterReferral(e.target.value)}
                                                                className={`w-full text-xs font-bold bg-white border rounded-lg px-3 py-2.5 outline-none transition-all cursor-pointer ${isReferralFiltered ? 'border-[#02275A] text-[#02275A] bg-blue-50/30 ring-1 ring-[#02275A]' : 'border-slate-300 text-slate-700 focus:border-[#02275A]'}`}
                                                            >
                                                                {AUDIENCE_REFERRAL_SOURCES.map(ref => (
                                                                    <option key={ref} value={ref}>{ref}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })()}

                                    {/* TOTAL TARGET AUDIENCE DISPLAY CARD - Simplified, Bold, Focused on Total Reach */}
                                    <div className="bg-gradient-to-r from-[#02275A] via-[#033475] to-[#02275A] text-white p-5 rounded-2xl shadow-md border border-[#02275A]/30">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex items-center gap-3.5">
                                                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-amber-400 text-xl shrink-0 shadow-inner">
                                                    <i className="fas fa-bullseye"></i>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[11px] font-black uppercase tracking-wider text-blue-200">
                                                            Total Target Audience
                                                        </span>
                                                        <span className="text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.2 rounded-full">
                                                            Live Reach
                                                        </span>
                                                    </div>
                                                    <div className="flex items-baseline gap-2.5 mt-0.5 flex-wrap">
                                                        <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                                                            {calculateTotalTargetAudience().toLocaleString()}
                                                        </span>
                                                        <span className="text-xs font-bold text-blue-200">
                                                            Total Target Recipients
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="md:text-right border-t md:border-t-0 md:border-l border-white/15 pt-3 md:pt-0 md:pl-5">
                                                <div className="text-[11px] font-bold text-blue-200">Base Selection:</div>
                                                <div className="text-sm font-black text-white mt-0.5">
                                                    {selectedAudienceType === 'saved' ? currentSavedSegment?.name : 'Dynamic Segment & Rules'}
                                                </div>
                                                <div className="text-[11px] text-blue-200/80 mt-0.5">
                                                    {hasActiveAudienceFilters ? 'Refined by demographic filters & rules' : 'All accounts in selected segment'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Active Filter Tags */}
                                        {hasActiveAudienceFilters && (
                                            <div className="mt-4 pt-3 border-t border-white/15 flex items-center gap-2 flex-wrap text-xs">
                                                <span className="text-[11px] font-bold text-blue-200">Applied Rules:</span>
                                                {isCountryFiltered && (
                                                    <span className="inline-flex items-center gap-1 bg-white/15 text-white font-bold px-2.5 py-0.5 rounded-md text-[11px]">
                                                        <i className="fas fa-globe text-blue-300 text-[10px]"></i> {audienceFilterCountry}
                                                    </span>
                                                )}
                                                {isLocationFiltered && (
                                                    <span className="inline-flex items-center gap-1 bg-white/15 text-white font-bold px-2.5 py-0.5 rounded-md text-[11px]">
                                                        <i className="fas fa-map-marker-alt text-amber-300 text-[10px]"></i> {audienceFilterLocation}
                                                    </span>
                                                )}
                                                {isIndustryFiltered && (
                                                    <span className="inline-flex items-center gap-1 bg-white/15 text-white font-bold px-2.5 py-0.5 rounded-md text-[11px]">
                                                        <i className="fas fa-industry text-emerald-300 text-[10px]"></i> {audienceFilterIndustry}
                                                    </span>
                                                )}
                                                {isBusinessTypeFiltered && (
                                                    <span className="inline-flex items-center gap-1 bg-white/15 text-white font-bold px-2.5 py-0.5 rounded-md text-[11px]">
                                                        <i className="fas fa-store text-teal-300 text-[10px]"></i> {audienceFilterBusinessType}
                                                    </span>
                                                )}
                                                {isSubscriptionFiltered && (
                                                    <span className="inline-flex items-center gap-1 bg-white/15 text-white font-bold px-2.5 py-0.5 rounded-md text-[11px]">
                                                        <i className="fas fa-crown text-amber-300 text-[10px]"></i> {audienceFilterSubscription}
                                                    </span>
                                                )}
                                                {isReferralFiltered && (
                                                    <span className="inline-flex items-center gap-1 bg-white/15 text-white font-bold px-2.5 py-0.5 rounded-md text-[11px]">
                                                        <i className="fas fa-handshake text-purple-300 text-[10px]"></i> {audienceFilterReferral}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {creationStep === 3 && (
                            <div className="space-y-6 animate-fade-in">
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 mb-1">Channel & Template</h3>
                                    <p className="text-sm text-slate-500 mb-6">Select where to send this broadcast and choose a starting design.</p>
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-xs font-bold text-slate-700 mb-2">1. Select Communication Channels</label>
                                    <div className="flex flex-wrap gap-3">
                                        {[
                                            { id: 'Email', icon: 'fa-envelope', color: 'text-blue-500', activeBg: 'bg-blue-50', border: 'border-blue-200' },
                                            { id: 'In-App', icon: 'fa-bell', color: 'text-indigo-500', activeBg: 'bg-indigo-50', border: 'border-indigo-200' },
                                            { id: 'WhatsApp', icon: 'fa-whatsapp', color: 'text-green-500', activeBg: 'bg-green-50', border: 'border-green-200' },
                                            { id: 'SMS', icon: 'fa-comment-alt', color: 'text-emerald-500', activeBg: 'bg-emerald-50', border: 'border-emerald-200' },
                                        ].map(ch => {
                                            const isActive = selectedChannels.includes(ch.id);
                                            return (
                                                <div 
                                                    key={ch.id} 
                                                    onClick={() => {
                                                        if(isActive) setSelectedChannels(selectedChannels.filter(c => c !== ch.id));
                                                        else setSelectedChannels([...selectedChannels, ch.id]);
                                                    }}
                                                    className={`cursor-pointer border-2 rounded-xl p-3 flex items-center gap-3 transition-all ${isActive ? `${ch.border} ${ch.activeBg}` : 'border-slate-200 bg-white hover:border-slate-300'}`}
                                                >
                                                    <i className={`fas ${ch.icon} ${isActive ? ch.color : 'text-slate-400'}`}></i>
                                                    <span className={`text-sm font-bold ${isActive ? 'text-slate-800' : 'text-slate-500'}`}>{ch.id}</span>
                                                    {isActive && <i className="fas fa-check-circle text-[#02275A] ml-2"></i>}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100">
                                    <div className="flex justify-between items-end mb-4">
                                        <label className="block text-xs font-bold text-slate-700">2. Select Starting Template</label>
                                        <button className="text-xs font-bold text-[#02275A] hover:underline">Browse Gallery</button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                        {templates.filter(t => selectedChannels.length === 0 || selectedChannels.includes(t.channel)).map(tpl => (
                                            <div 
                                                key={tpl.id}
                                                onClick={() => {
                                                    setSelectedCampaignTemplateId(tpl.id);
                                                    setCampaignHtml(tpl.html);
                                                }}
                                                className={`border-2 rounded-xl p-4 cursor-pointer relative transition-all ${selectedCampaignTemplateId === tpl.id ? 'border-[#02275A] bg-blue-50/30' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                                            >
                                                {selectedCampaignTemplateId === tpl.id && (
                                                    <div className="absolute top-2 right-2 text-[#02275A]"><i className="fas fa-check-circle"></i></div>
                                                )}
                                                <div className={`w-full h-24 rounded mb-3 flex items-center justify-center relative overflow-hidden ${tpl.color}`}>
                                                    <div className="w-full h-full bg-white rounded shadow-sm opacity-50 overflow-hidden flex flex-col p-2 m-4">
                                                        <div className="w-1/3 h-2 bg-slate-200 rounded mb-2"></div>
                                                        <div className="w-3/4 h-3 bg-slate-300 rounded mb-2"></div>
                                                    </div>
                                                </div>
                                                <h4 className="font-bold text-slate-800 text-xs text-center">{tpl.title}</h4>
                                            </div>
                                        ))}
                                        <div 
                                            onClick={() => {
                                                setSelectedCampaignTemplateId('blank');
                                                setCampaignHtml('');
                                            }}
                                            className={`border-2 rounded-xl p-4 cursor-pointer relative transition-all ${selectedCampaignTemplateId === 'blank' ? 'border-[#02275A] bg-blue-50/30' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                                        >
                                            {selectedCampaignTemplateId === 'blank' && (
                                                <div className="absolute top-2 right-2 text-[#02275A]"><i className="fas fa-check-circle"></i></div>
                                            )}
                                            <div className="w-full h-24 bg-slate-50 border border-slate-200 rounded mb-3 flex items-center justify-center text-slate-400">
                                                <i className="fas fa-plus text-xl"></i>
                                            </div>
                                            <h4 className="font-bold text-slate-600 text-xs text-center">Start Blank</h4>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                                                                        {creationStep === 4 && (
                            <div className="space-y-6 animate-fade-in w-full flex flex-col">
                                {(() => {
                                    const isWhatsAppCampaign = templates.find(t => t.id === selectedCampaignTemplateId)?.channel === 'WhatsApp';
                                    return (
                                        <>
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="text-xl font-black text-slate-800">Content Editor {isWhatsAppCampaign && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded ml-2">WhatsApp - View Only</span>}</h3>
                                                {!isWhatsAppCampaign && (
                                                    <div className="bg-slate-100 p-1 rounded-lg flex text-xs font-bold">
                                                        <button 
                                                            onClick={() => setEditorMode('visual')}
                                                            className={`px-3 py-1 rounded transition-colors ${editorMode === 'visual' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-800'}`}
                                                        >
                                                            <i className="fas fa-eye mr-1"></i> Visual
                                                        </button>
                                                        <button 
                                                            onClick={() => setEditorMode('html')}
                                                            className={`px-3 py-1 rounded transition-colors ${editorMode === 'html' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-800'}`}
                                                        >
                                                            <i className="fas fa-code mr-1"></i> HTML
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-6 gap-4">
                                        <div className="col-span-4">
                                            <label className="block text-xs font-bold text-slate-700 mb-1">Subject Line</label>
                                            <input 
                                                type="text" 
                                                value={campaignSubject}
                                                onChange={(e) => setCampaignSubject(e.target.value)}
                                                placeholder="e.g. Exciting news inside!" 
                                                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#02275A] text-sm" 
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-xs font-bold text-slate-700 mb-1">Sender Profile</label>
                                            <select 
                                                value={campaignSender}
                                                onChange={(e) => setCampaignSender(e.target.value)}
                                                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#02275A] text-sm"
                                            >
                                                <option value="updates@prokip.africa">updates@prokip.africa</option>
                                                <option value="hello@prokip.africa">hello@prokip.africa</option>
                                                <option value="security@prokip.africa">security@prokip.africa</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Preview Text / Preheader</label>
                                        <input 
                                            type="text" 
                                            value={campaignPreheader}
                                            onChange={(e) => setCampaignPreheader(e.target.value)}
                                            placeholder="Short text visible in inbox preview..." 
                                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#02275A] text-sm" 
                                        />
                                    </div>

                                    {/* Classic Dual-Mode Editor */}
                                    <div className="border border-slate-300 rounded-xl overflow-hidden shadow-sm flex flex-col min-h-[500px]">
                                        {/* Editor Toolbar */}
                                        {!isWhatsAppCampaign && (
                                            <div className="bg-slate-50 border-b border-slate-200 p-2 flex flex-wrap gap-1 items-center">
                                                <button 
                                                    onClick={() => {
                                                        if (editorMode === 'visual') { document.execCommand('bold', false, undefined); document.getElementById('visual-editor')?.focus(); }
                                                        else setCampaignHtml(prev => prev + '<strong></strong>');
                                                    }}
                                                    className="w-8 h-8 rounded hover:bg-slate-200 text-slate-600 transition-colors" title="Bold"
                                                ><i className="fas fa-bold"></i></button>
                                            <button 
                                                onClick={() => {
                                                    if (editorMode === 'visual') { document.execCommand('italic', false, undefined); document.getElementById('visual-editor')?.focus(); }
                                                    else setCampaignHtml(prev => prev + '<em></em>');
                                                }}
                                                className="w-8 h-8 rounded hover:bg-slate-200 text-slate-600 transition-colors" title="Italic"
                                            ><i className="fas fa-italic"></i></button>
                                            <button 
                                                onClick={() => {
                                                    if (editorMode === 'visual') { document.execCommand('underline', false, undefined); document.getElementById('visual-editor')?.focus(); }
                                                    else setCampaignHtml(prev => prev + '<u></u>');
                                                }}
                                                className="w-8 h-8 rounded hover:bg-slate-200 text-slate-600 transition-colors" title="Underline"
                                            ><i className="fas fa-underline"></i></button>
                                            
                                            <div className="w-px h-6 bg-slate-300 mx-1"></div>
                                            
                                            <button 
                                                onClick={() => {
                                                    if (editorMode === 'visual') { document.execCommand('formatBlock', false, 'H1'); document.getElementById('visual-editor')?.focus(); }
                                                    else setCampaignHtml(prev => prev + '<h1>Heading</h1>');
                                                }}
                                                className="px-2 h-8 rounded hover:bg-slate-200 text-slate-600 text-xs font-bold transition-colors"
                                            ><i className="fas fa-heading mr-1"></i> H1</button>
                                            
                                            <button 
                                                onClick={() => {
                                                    if (editorMode === 'visual') { document.execCommand('formatBlock', false, 'P'); document.getElementById('visual-editor')?.focus(); }
                                                    else setCampaignHtml(prev => prev + '<p>Paragraph</p>');
                                                }}
                                                className="px-2 h-8 rounded hover:bg-slate-200 text-slate-600 text-xs font-bold transition-colors"
                                            ><i className="fas fa-paragraph mr-1"></i> Text</button>
                                            
                                            <button 
                                                onClick={() => {
                                                    const url = prompt('Enter link URL:');
                                                    if (url) {
                                                        if (editorMode === 'visual') { document.execCommand('createLink', false, url); document.getElementById('visual-editor')?.focus(); }
                                                        else setCampaignHtml(prev => prev + `<a href="${url}">Link text</a>`);
                                                    }
                                                }}
                                                className="px-2 h-8 rounded hover:bg-slate-200 text-slate-600 text-xs font-bold transition-colors"
                                            ><i className="fas fa-link mr-1"></i> Link</button>
                                            
                                            <button 
                                                onClick={() => {
                                                    const url = prompt('Enter Image URL:');
                                                    if (url) {
                                                        if (editorMode === 'visual') { document.execCommand('insertImage', false, url); document.getElementById('visual-editor')?.focus(); }
                                                        else setCampaignHtml(prev => prev + `<img src="${url}" alt="Image" style="max-width:100%; height:auto;" />`);
                                                    }
                                                }}
                                                className="px-2 h-8 rounded hover:bg-slate-200 text-slate-600 text-xs font-bold transition-colors"
                                            ><i className="fas fa-image mr-1"></i> Image</button>
                                            
                                            <div className="w-px h-6 bg-slate-300 mx-1"></div>
                                            
                                            <div className="relative ml-auto group">
                                                <button className="px-3 h-8 rounded bg-[#02275A] text-white text-xs font-bold flex items-center transition-colors hover:bg-[#03367A]">
                                                    <i className="fas fa-code mr-2"></i> Insert Variable <i className="fas fa-chevron-down ml-2 text-[10px]"></i>
                                                </button>
                                                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                                                    <div className="py-1">
                                                        {[
                                                            { label: '{{first_name}}', val: '{{first_name}}' },
                                                            { label: '{{business_name}}', val: '{{business_name}}' },
                                                            { label: '{{unsubscribe_url}}', val: '{{unsubscribe_url}}' }
                                                        ].map(v => (
                                                            <button 
                                                                key={v.val}
                                                                onClick={() => {
                                                                    if (editorMode === 'visual') {
                                                                        document.getElementById('visual-editor')?.focus();
                                                                        document.execCommand('insertText', false, v.val);
                                                                    } else {
                                                                        setCampaignHtml(prev => prev + v.val);
                                                                    }
                                                                }}
                                                                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 font-mono"
                                                            >
                                                                {v.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        )}
                                        
                                        {/* Editor Canvas Area */}
                                        <div className="flex flex-1 min-h-[400px] bg-slate-200/50 relative">
                                            {isWhatsAppCampaign ? (
                                                <div className="w-full flex justify-center p-6 overflow-y-auto bg-slate-100">
                                                    <div className="bg-green-50 w-full max-w-sm border border-green-200 rounded-lg shadow-sm h-fit min-h-[200px] p-6 text-slate-800 whitespace-pre-wrap font-sans">
                                                        {campaignHtml}
                                                    </div>
                                                </div>
                                            ) : editorMode === 'html' ? (
                                                <div className="w-full flex flex-col bg-slate-900">
                                                    <div className="p-2 bg-slate-800 text-xs font-bold text-slate-400 flex justify-between uppercase tracking-wider">
                                                        <span>Source HTML</span>
                                                        <i className="fas fa-code"></i>
                                                    </div>
                                                    <textarea 
                                                        value={campaignHtml}
                                                        onChange={(e) => setCampaignHtml(e.target.value)}
                                                        className="flex-1 w-full bg-slate-900 text-emerald-400 p-4 font-mono text-sm resize-none outline-none focus:ring-inset focus:ring-1 focus:ring-emerald-500/50"
                                                        placeholder="<!-- Type your HTML or use the toolbar to insert elements -->"
                                                        spellCheck={false}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-full flex justify-center p-6 overflow-y-auto">
                                                    <div className="bg-white w-full max-w-2xl border border-slate-200 rounded-lg shadow-sm h-fit min-h-full">
                                                        <div 
                                                            id="visual-editor"
                                                            contentEditable={true}
                                                            suppressContentEditableWarning={true}
                                                            onBlur={(e) => setCampaignHtml(e.currentTarget.innerHTML)}
                                                            className="w-full min-h-[400px] focus:outline-none p-6 text-slate-800"
                                                            dangerouslySetInnerHTML={{ __html: campaignHtml || '<div style="color: #94a3b8;">Start typing your email content here...</div>' }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                        </>
                                    );
                                })()}
                            </div>
                        )} 
                        {creationStep === 5 && (
                            <div className="space-y-6 animate-fade-in">
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 mb-1">Preview & Test</h3>
                                    <p className="text-sm text-slate-500 mb-6">Verify personalization variables and check mobile responsiveness before scheduling.</p>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                            <h4 className="text-xs font-bold text-slate-800 mb-3 uppercase tracking-wider">Test Delivery</h4>
                                            <div className="flex gap-2">
                                                <input type="email" placeholder="Enter test email address..." className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#02275A] text-sm" />
                                                <button onClick={() => showSuccess("Test email queued for delivery.")} className="bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-900 transition-colors">Send Test</button>
                                            </div>
                                            <p className="text-[10px] text-slate-500 mt-2">Variables will be replaced with dummy data.</p>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl border border-slate-200">
                                            <h4 className="text-xs font-bold text-slate-800 mb-3 uppercase tracking-wider">Pre-Send Validation</h4>
                                            <ul className="space-y-2 text-sm">
                                                <li className={`flex items-center gap-2 ${campaignSubject ? 'text-emerald-600' : 'text-rose-500'}`}>
                                                    <i className={`fas ${campaignSubject ? 'fa-check-circle' : 'fa-times-circle'}`}></i> Subject line present
                                                </li>
                                                <li className="flex items-center gap-2 text-emerald-600"><i className="fas fa-check-circle"></i> Audience selected</li>
                                                <li className={`flex items-center gap-2 ${campaignHtml.includes('unsubscribe_url') ? 'text-emerald-600' : 'text-amber-500'}`}>
                                                    <i className={`fas ${campaignHtml.includes('unsubscribe_url') ? 'fa-check-circle' : 'fa-exclamation-triangle'}`}></i> Unsubscribe link included
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-100 flex flex-col items-center p-4 min-h-[500px]">
                                        <div className="flex bg-white rounded-full shadow-sm mb-4">
                                            <button 
                                                onClick={() => setTemplatePreviewMode('desktop')}
                                                className={`px-4 py-1.5 text-xs font-bold rounded-full ${templatePreviewMode === 'desktop' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-800'}`}
                                            >
                                                <i className="fas fa-desktop mr-1"></i> Desktop
                                            </button>
                                            <button 
                                                onClick={() => setTemplatePreviewMode('mobile')}
                                                className={`px-4 py-1.5 text-xs font-bold rounded-full ${templatePreviewMode === 'mobile' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-800'}`}
                                            >
                                                <i className="fas fa-mobile-screen mr-1"></i> Mobile
                                            </button>
                                        </div>
                                        {/* Inbox Preview Render */}
                                        <div className={`bg-white w-full ${templatePreviewMode === 'mobile' ? 'max-w-[320px]' : 'max-w-lg'} rounded-t-lg border-x border-t border-slate-200 p-4 shadow-sm text-sm flex-1 flex flex-col transition-all duration-300`}>
                                            <div className="flex flex-col gap-1 mb-4 pb-4 border-b border-slate-100">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex gap-2 text-slate-600">
                                                        <strong>From:</strong> <span>{campaignSender || 'Not set'}</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 text-slate-800 text-lg">
                                                    <strong>Subject:</strong> <span className="font-bold">{campaignSubject || 'No Subject'}</span>
                                                </div>
                                                {campaignPreheader && (
                                                    <div className="text-slate-500 text-xs mt-1 italic">
                                                        Preview: {campaignPreheader}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="flex-1 bg-white overflow-hidden relative rounded">
                                                <div 
                                                    className="w-full h-full"
                                                    dangerouslySetInnerHTML={{ __html: campaignHtml || '<div style="padding: 20px; text-align: center; color: #94a3b8;">No content added yet.</div>' }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {creationStep === 6 && (() => {
                            const audInfo = getSelectedAudienceInfo();
                            return (
                                <div className="space-y-6 animate-fade-in">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-800 mb-1">Final Review & Schedule</h3>
                                        <p className="text-sm text-slate-500 mb-6">Review campaign configuration. Large sends are batched asynchronously automatically.</p>
                                    </div>

                                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-4">
                                        <div className="grid grid-cols-2 gap-y-4 text-sm">
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Campaign Name</p>
                                                <p className="font-bold text-slate-800">{campaignName || 'Untitled Broadcast'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Campaign Type</p>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="bg-[#02275A] text-white font-extrabold px-2.5 py-0.5 rounded text-xs">{campaignType}</span>
                                                    <span className="text-xs text-slate-500 font-semibold">• {campaignPriority}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Channels</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {selectedChannels.map(ch => <span key={ch} className="bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded text-[10px]">{ch}</span>)}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Target Audience</p>
                                                <p className="font-bold text-slate-800">{audInfo.name} <span className="text-xs text-slate-500 font-normal">({audInfo.category})</span></p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Estimated Recipients</p>
                                                <p className="font-black text-indigo-600 text-base">{audInfo.count} recipients</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Sender & Subject</p>
                                                <p className="font-semibold text-slate-700 text-xs truncate max-w-[200px]">{campaignSubject || 'No Subject'}</p>
                                                <p className="text-[10px] text-slate-400">{campaignSender}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="font-bold text-slate-800">Delivery Schedule</h4>
                                        
                                        <label className="flex items-center gap-3 p-4 border border-[#02275A] bg-blue-50/30 rounded-xl cursor-pointer">
                                            <input type="radio" name="schedule" defaultChecked className="w-4 h-4 text-[#02275A]" />
                                            <div>
                                                <h5 className="font-bold text-slate-800 text-sm">Send Immediately</h5>
                                                <p className="text-xs text-slate-500">Will be queued to background workers right now.</p>
                                            </div>
                                        </label>

                                        <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:border-slate-300 bg-white">
                                            <input type="radio" name="schedule" className="w-4 h-4 text-[#02275A]" />
                                            <div className="flex-1 flex justify-between items-center">
                                                <div>
                                                    <h5 className="font-bold text-slate-800 text-sm">Schedule for later</h5>
                                                    <p className="text-xs text-slate-500">Select date and time</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <input type="date" disabled className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-slate-400" />
                                                    <input type="time" disabled className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-slate-400" />
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                    
                                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-sm">
                                        <i className="fas fa-exclamation-triangle text-amber-500 mt-0.5"></i>
                                        <div>
                                            <p className="font-bold text-amber-800 mb-1">Queue & Deliverability Safeguards</p>
                                            <p className="text-amber-700 text-xs">This broadcast targets {audInfo.count} {audInfo.category}. It will be dispatched in optimized batches through the verified enterprise queue provider to protect deliverability and reputation.</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Wizard Navigation Footer */}
                        <div className="mt-10 pt-6 border-t border-slate-100 flex justify-between items-center">
                            <button 
                                onClick={() => setCreationStep(Math.max(1, creationStep - 1))}
                                disabled={creationStep === 1}
                                className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 disabled:opacity-0 hover:bg-slate-100 transition-colors"
                            >
                                <i className="fas fa-arrow-left mr-2"></i> Back
                            </button>
                            
                            {creationStep < 6 ? (
                                <button 
                                    onClick={() => setCreationStep(creationStep + 1)}
                                    className="bg-[#02275A] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-[#03367A] transition-colors"
                                >
                                    Continue <i className="fas fa-arrow-right ml-2"></i>
                                </button>
                            ) : (
                                <button 
                                    onClick={() => {
                                        const audInfo = getSelectedAudienceInfo();
                                        const newCamp: BroadcastCampaign = {
                                            id: `camp_${Date.now()}`,
                                            name: campaignName || `${campaignType} Announcement`,
                                            type: campaignType,
                                            channels: selectedChannels as any,
                                            audience: audInfo.name,
                                            audienceSize: audInfo.countNum,
                                            sentCount: 0,
                                            deliveredCount: 0,
                                            openedCount: 0,
                                            clickedCount: 0,
                                            failedCount: 0,
                                            status: 'Sending',
                                            createdAt: 'Just now'
                                        };
                                        setCampaignsList([newCamp, ...campaignsList]);
                                        showSuccess(`"${newCamp.name}" broadcast targeting ${audInfo.count} ${campaignType} successfully queued for delivery!`);
                                        setIsCreatingCampaign(false);
                                        setCreationStep(1);
                                        setActiveTab('campaigns');
                                    }}
                                    className="bg-emerald-600 text-white px-8 py-3 rounded-xl text-sm font-black shadow-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
                                >
                                    <i className="fas fa-paper-plane"></i> Dispatch Broadcast Now
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderCampaigns = () => {
        if (selectedCampaignViewId) {
            const campaign = campaignsList.find(c => c.id === selectedCampaignViewId) || mockCampaigns.find(c => c.id === selectedCampaignViewId);
            if (!campaign) return null;

            return (
                <div className="space-y-6 animate-fade-in">
                    <button onClick={() => setSelectedCampaignViewId(null)} className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
                        <i className="fas fa-arrow-left mr-2"></i> Back to Campaigns
                    </button>

                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-black text-slate-800">{campaign.name}</h2>
                                <div className="flex gap-2 mt-2">
                                    <span className="text-xs font-bold text-[#02275A] bg-blue-50 border border-blue-200 px-2.5 py-1 rounded">{campaign.type}</span>
                                    {campaign.channels.map(ch => (
                                        <span key={ch} className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100">{ch}</span>
                                    ))}
                                    <span className={`px-2 py-1 rounded text-xs font-extrabold uppercase tracking-wide ${
                                        campaign.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                                        campaign.status === 'Sending' ? 'bg-blue-100 text-blue-700 animate-pulse' :
                                        campaign.status === 'Scheduled' ? 'bg-amber-100 text-amber-700' :
                                        'bg-slate-100 text-slate-700'
                                    }`}>
                                        {campaign.status}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-slate-500">Audience: {campaign.audience}</p>
                                <p className="text-2xl font-black text-slate-800">{campaign.audienceSize.toLocaleString()} <span className="text-sm font-normal text-slate-500">recipients</span></p>
                            </div>
                        </div>

                        {campaign.status === 'Sending' && (
                            <div className="mb-8 p-6 bg-slate-50 rounded-xl border border-slate-200">
                                <div className="flex justify-between items-end mb-2">
                                    <h3 className="font-bold text-slate-800 text-sm">Sending Progress</h3>
                                    <p className="text-xs font-bold text-slate-500">
                                        <span className="text-blue-600">{campaign.sentCount.toLocaleString()}</span> / {campaign.audienceSize.toLocaleString()} sent
                                    </p>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-3 mb-2 overflow-hidden">
                                    <div className="bg-blue-600 h-3 rounded-full transition-all duration-500" style={{ width: `${(campaign.sentCount / campaign.audienceSize) * 100}%` }}></div>
                                </div>
                                <p className="text-xs text-slate-500 mt-2 text-right">
                                    <i className="fas fa-spinner fa-spin mr-1"></i> {campaign.audienceSize - campaign.sentCount} remaining in queue...
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
                                <p className="text-xs font-bold text-slate-500 uppercase">Sent</p>
                                <p className="text-2xl font-black text-slate-800">{campaign.sentCount.toLocaleString()}</p>
                            </div>
                            <div className="p-4 border border-slate-200 rounded-xl bg-emerald-50">
                                <p className="text-xs font-bold text-emerald-700 uppercase">Delivered</p>
                                <p className="text-2xl font-black text-emerald-700">{campaign.deliveredCount.toLocaleString()}</p>
                            </div>
                            <div className="p-4 border border-slate-200 rounded-xl bg-blue-50">
                                <p className="text-xs font-bold text-blue-700 uppercase">Opened</p>
                                <p className="text-2xl font-black text-blue-700">{campaign.openedCount.toLocaleString()}</p>
                            </div>
                            <div className="p-4 border border-slate-200 rounded-xl bg-amber-50">
                                <p className="text-xs font-bold text-amber-700 uppercase">Clicked</p>
                                <p className="text-2xl font-black text-amber-700">{campaign.clickedCount.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-6 animate-fade-in">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                        <h3 className="font-bold text-slate-800">All Campaigns ({campaignsList.length})</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-500">Categories: Customers • Agents • Partners • State Managers • Employees</span>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white">
                                <tr className="text-slate-500 font-bold border-b border-slate-200 text-xs uppercase tracking-wider">
                                    <th className="p-4">Campaign</th>
                                    <th className="p-4">Audience</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Progress</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {campaignsList.map(c => (
                                    <tr key={c.id} onClick={() => setSelectedCampaignViewId(c.id)} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                                        <td className="p-4">
                                            <p className="font-bold text-slate-800 group-hover:text-[#02275A] transition-colors">{c.name}</p>
                                            <div className="flex gap-2 mt-1">
                                                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{c.type}</span>
                                                {c.channels.map(ch => (
                                                    <span key={ch} className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">{ch}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <p className="font-semibold text-slate-700 text-xs">{c.audience}</p>
                                            <p className="text-[11px] text-slate-400 mt-0.5">{c.audienceSize.toLocaleString()} recipients</p>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                                                c.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                                                c.status === 'Sending' ? 'bg-blue-100 text-blue-700 animate-pulse' :
                                                c.status === 'Scheduled' ? 'bg-amber-100 text-amber-700' :
                                                'bg-slate-100 text-slate-700'
                                            }`}>
                                                {c.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right w-48">
                                            <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                                                <span>Sent</span>
                                                <span>{Math.round((c.sentCount / (c.audienceSize || 1)) * 100)}%</span>
                                            </div>
                                            <div className="w-full bg-slate-200 rounded-full h-1.5">
                                                <div className={`h-1.5 rounded-full ${c.status === 'Sending' ? 'bg-blue-500 animate-pulse' : c.status === 'Completed' ? 'bg-emerald-500' : 'bg-slate-400'}`} style={{ width: `${(c.sentCount / (c.audienceSize || 1)) * 100}%` }}></div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    const renderAutomations = () => (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-lg font-bold text-slate-800">Automated Workflows</h2>
                    <p className="text-sm text-slate-500">Manage transactional triggers and lifecycle events.</p>
                </div>
                <button className="bg-[#02275A] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-[#03367A] transition-colors">
                    <i className="fas fa-plus mr-2"></i> New Automation
                </button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
                {[
                    { title: 'Free Trial Expiring (3 Days)', trigger: '3 days before trial ends', template: 'Trial Expiry Warning', status: 'Active', category: 'Lifecycle' },
                    { title: 'Welcome Series - Day 1', trigger: 'On Customer Registration', template: 'Welcome & Onboarding', status: 'Active', category: 'Onboarding' },
                    { title: 'Payment Failed Retry', trigger: 'On Card Charge Failure', template: 'Payment Failed Alert', status: 'Active', category: 'Billing' },
                    { title: 'Dormant Account Reactivation', trigger: '14 days without login', template: 'We miss you - Update', status: 'Paused', category: 'Retention' },
                    { title: 'New Partner Registration Alert', trigger: 'On Partner Signup', template: 'Partner Program Update', status: 'Active', category: 'Partner' }
                ].map((auto, idx) => (
                    <div key={idx} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between hover:shadow-sm transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${auto.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                <i className="fas fa-bolt"></i>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    {auto.title}
                                    {auto.status === 'Active' ? 
                                        <span className="text-[9px] uppercase tracking-wider font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Active</span> :
                                        <span className="text-[9px] uppercase tracking-wider font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">Paused</span>
                                    }
                                </h3>
                                <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                                    <span><i className="fas fa-clock mr-1 text-slate-400"></i> {auto.trigger}</span>
                                    <span><i className="fas fa-file-code mr-1 text-slate-400"></i> {auto.template}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" defaultChecked={auto.status === 'Active'} />
                                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                                </label>
                            </div>
                            <button className="w-8 h-8 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors">
                                <i className="fas fa-ellipsis-v"></i>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="p-6 md:p-8 animate-fade-in space-y-6 pb-20">
            {/* Page Header */}
            {!isCreatingCampaign && (
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            Broadcasts & Communications
                            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                                <i className="fas fa-circle text-[8px] text-emerald-500 mr-1 animate-pulse"></i> Engine Online
                            </span>
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            High-volume scalable campaigns, segmented audiences, and HTML templates.
                        </p>
                    </div>
                    
                    <button 
                        onClick={() => setIsCreatingCampaign(true)}
                        className="bg-[#02275A] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-[#03367A] transition-colors flex items-center gap-2 shrink-0"
                    >
                        <i className="fas fa-paper-plane"></i> New Broadcast
                    </button>
                </div>
            )}

            {!isCreatingCampaign && (
                <>
                    {/* Navigation Tabs */}
                    <div className="flex overflow-x-auto border-b border-slate-200">
                        {[
                            { id: 'overview', label: 'Dashboard', icon: 'fa-chart-pie' },
                            { id: 'campaigns', label: 'All Campaigns', icon: 'fa-layer-group' },
                            { id: 'audiences', label: 'Audiences & Segments', icon: 'fa-users' },
                            { id: 'templates', label: 'Template Gallery', icon: 'fa-paint-roller' },
                            { id: 'automations', label: 'Automations', icon: 'fa-bolt' },
                            { id: 'health', label: 'Delivery Queue', icon: 'fa-server' },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as TabType)}
                                className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-[#02275A] text-[#02275A]' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'}`}
                            >
                                <i className={`fas ${tab.icon}`}></i> {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Contents */}
                    <div className="mt-6">
                        {activeTab === 'overview' && renderOverview()}
                        {activeTab === 'audiences' && renderAudiences()}
                        {activeTab === 'templates' && renderTemplates()}
                        {activeTab === 'campaigns' && renderCampaigns()}
                        {activeTab === 'automations' && renderAutomations()}
                        {activeTab === 'health' && (
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center text-slate-500">
                                <i className="fas fa-server text-4xl mb-4 text-slate-300"></i>
                                <h3 className="text-lg font-bold text-slate-800">Queue & Infrastructure Health</h3>
                                <p className="text-sm mt-1">Real-time worker status, failed delivery logs, and idempotency tracking goes here.</p>
                            </div>
                        )}
                    </div>
                </>
            )}

            {isCreatingCampaign && renderCreateBroadcast()}
        </div>
    );
};

export default AdminBroadcastsView;
