export interface LeaveType {
  id: string;
  name: string;
  defaultDays: number;
  description?: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export interface EmployeeLeaveBalance {
  employeeEmail: string;
  employeeName: string;
  department: string;
  isTeamLead?: boolean;
  balances: Record<string, { totalDays: number; usedDays: number; remainingDays: number }>;
}

export interface LeaveEmailTemplate {
  id: string;
  templateName: string;
  leaveType: string; // Leave type name or 'Default'
  subject: string;
  emailBody: string;
}

export interface LeaveRequestRecord {
  id: string;
  employeeName: string;
  employeeEmail: string;
  department: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  workingDays: number;
  handoverEmployeeName: string;
  handoverEmployeeEmail: string;
  availability: 'Reachable by Phone' | 'Reachable by Email' | 'Reachable if Urgent' | 'Not Reachable' | string;
  subject: string;
  emailBody: string;
  attachmentName?: string;
  attachmentUrl?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  submittedDate: string;
  approver?: string;
  approverRole?: 'Team Lead' | 'HR' | 'Manager';
  approvalDate?: string;
  approvalComments?: string;
  isHistorical?: boolean;
  remarks?: string;
  routedToHR?: boolean;
}

export interface LeaveNotification {
  id: string;
  recipientEmail: string;
  recipientRole: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  timestamp: string;
  read: boolean;
  isEmailSent?: boolean;
}

export interface PublicHoliday {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  description?: string;
  category: 'National Holiday' | 'Company Holiday' | 'Regional Holiday';
  status: 'Active' | 'Inactive';
  createdBy: string;
  createdAt: string; // YYYY-MM-DD
}

export interface HolidayNotificationConfig {
  enabled: boolean;
  remind7DaysBefore: boolean;
  remind3DaysBefore: boolean;
  remind1DayBefore: boolean;
  inApp: boolean;
  email: boolean;
}

export interface LeaveAuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  requestId: string;
  details: string;
}

export interface OrganizationEmployee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  isTeamLead?: boolean;
}

// Default Organization Employees
export const DEFAULT_EMPLOYEES: OrganizationEmployee[] = [
  { id: 'EMP-101', name: 'Test Member', email: 'user@prokip.africa', department: 'Sales', role: 'Sales Specialist', isTeamLead: false },
  { id: 'EMP-102', name: 'John Agent', email: 'john.agent@prokip.com', department: 'Sales', role: 'Senior Agent', isTeamLead: false },
  { id: 'EMP-103', name: 'Adaeze O.', email: 'adaeze@prokip.com', department: 'Sales', role: 'Sales Team Lead', isTeamLead: true },
  { id: 'EMP-104', name: 'Jane Smith', email: 'jane.smith@prokip.com', department: 'Marketing', role: 'Marketing Specialist', isTeamLead: false },
  { id: 'EMP-105', name: 'Michael T.', email: 'michael@prokip.com', department: 'Marketing', role: 'Marketing Team Lead', isTeamLead: true },
  { id: 'EMP-106', name: 'Abubakar Ibrahim', email: 'abubakar@prokip.com', department: 'Support', role: 'Customer Support Rep', isTeamLead: false },
  { id: 'EMP-107', name: 'Sarah Connor', email: 'sarah@prokip.com', department: 'Engineering', role: 'Lead Software Engineer', isTeamLead: true },
  { id: 'EMP-108', name: 'Chidi Okonkwo', email: 'chidi@prokip.com', department: 'Finance', role: 'Financial Analyst', isTeamLead: false },
  { id: 'EMP-109', name: 'Grace Admin', email: 'grace.hr@prokip.com', department: 'Human Resources', role: 'HR Manager', isTeamLead: true }
];

// Default Leave Types
export const DEFAULT_LEAVE_TYPES: LeaveType[] = [
  { id: 'LT-1', name: 'Annual Leave', defaultDays: 15, description: 'Standard paid annual leave for vacation and personal rest.', status: 'Active', createdAt: '2026-01-01' },
  { id: 'LT-2', name: 'Sick Leave', defaultDays: 10, description: 'Medical leave for illness, injury, or medical appointments.', status: 'Active', createdAt: '2026-01-01' },
  { id: 'LT-3', name: 'Maternity Leave', defaultDays: 90, description: 'Paid leave for female employees before and after childbirth.', status: 'Active', createdAt: '2026-01-01' },
  { id: 'LT-4', name: 'Paternity Leave', defaultDays: 14, description: 'Paid leave for male employees upon the birth of a child.', status: 'Active', createdAt: '2026-01-01' },
  { id: 'LT-5', name: 'Compassionate Leave', defaultDays: 5, description: 'Leave for bereavement or urgent family emergencies.', status: 'Active', createdAt: '2026-01-01' },
  { id: 'LT-6', name: 'Study Leave', defaultDays: 7, description: 'Leave for exams, studies, and professional certifications.', status: 'Active', createdAt: '2026-01-01' },
  { id: 'LT-7', name: 'Marriage Leave', defaultDays: 5, description: 'Special paid leave for employee wedding.', status: 'Active', createdAt: '2026-01-01' },
  { id: 'LT-8', name: 'Unpaid Leave', defaultDays: 30, description: 'Approved leave without pay for extended personal requirements.', status: 'Active', createdAt: '2026-01-01' }
];

// Default Email Templates
export const DEFAULT_TEMPLATES: LeaveEmailTemplate[] = [
  {
    id: 'TPL-1',
    templateName: 'Annual Leave Template',
    leaveType: 'Annual Leave',
    subject: 'Annual Leave Request: {{Employee Name}} ({{Start Date}} - {{End Date}})',
    emailBody: `Dear Team Lead and HR Team,

I am writing to formally request Annual Leave for a total of {{Working Days}} working days, starting on {{Start Date}} and returning to office on {{End Date}}.

My remaining annual leave balance after this request will be {{Remaining Leave}} days.

During my absence, {{Handover Employee}} has agreed to manage my primary operational duties and urgent inquiries.

Regarding my contact availability: {{Availability}}.

Thank you for reviewing my request.

Warm regards,
{{Employee Name}}`
  },
  {
    id: 'TPL-2',
    templateName: 'Sick Leave Template',
    leaveType: 'Sick Leave',
    subject: 'Sick Leave Application: {{Employee Name}} ({{Start Date}} to {{End Date}})',
    emailBody: `Dear Team Lead and HR Team,

Please accept this application for Sick Leave covering {{Working Days}} working days, from {{Start Date}} through {{End Date}}.

Remaining sick leave quota: {{Remaining Leave}} days.

{{Handover Employee}} will handle urgent tasks in my absence. Medical documentation/reports are attached where applicable.

Availability during leave: {{Availability}}.

Sincerely,
{{Employee Name}}`
  },
  {
    id: 'TPL-3',
    templateName: 'Standard Default Leave Template',
    leaveType: 'Default',
    subject: 'Leave Request: {{Leave Type}} - {{Employee Name}}',
    emailBody: `Dear Management and HR,

I am writing to apply for {{Leave Type}} for {{Working Days}} working days, effective from {{Start Date}} to {{End Date}}.

Current Remaining Quota: {{Remaining Leave}} days.
Handover Staff: {{Handover Employee}}
Contact Availability: {{Availability}}.

Thank you for your assistance.

Kind regards,
{{Employee Name}}`
  }
];

// Helper: Calculate working days excluding Saturday & Sunday
export const calculateWorkingDays = (startDateStr: string, endDateStr: string): number => {
  if (!startDateStr || !endDateStr) return 0;
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return 0;

  let count = 0;
  const current = new Date(start);
  while (current <= end) {
    const dayOfWeek = current.getDay();
    // 0 = Sunday, 6 = Saturday
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  return count;
};

// Helper: Replace template placeholders with actual values
export const replaceTemplatePlaceholders = (
  templateText: string,
  data: {
    employeeName: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    workingDays: number;
    remainingLeave: number;
    handoverEmployee: string;
    availability: string;
  }
): string => {
  if (!templateText) return '';
  return templateText
    .replace(/\{\{Employee Name\}\}/g, data.employeeName || 'Employee')
    .replace(/\{\{Leave Type\}\}/g, data.leaveType || 'Leave')
    .replace(/\{\{Start Date\}\}/g, data.startDate || '[Start Date]')
    .replace(/\{\{End Date\}\}/g, data.endDate || '[End Date]')
    .replace(/\{\{Working Days\}\}/g, String(data.workingDays || 0))
    .replace(/\{\{Remaining Leave\}\}/g, String(data.remainingLeave || 0))
    .replace(/\{\{Handover Employee\}\}/g, data.handoverEmployee || '[Handover Employee]')
    .replace(/\{\{Availability\}\}/g, data.availability || '[Availability]');
};

// Helper: Get Leave Types from LocalStorage or Default
export const getLeaveTypes = (): LeaveType[] => {
  const saved = localStorage.getItem('company_leave_types');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
  }
  localStorage.setItem('company_leave_types', JSON.stringify(DEFAULT_LEAVE_TYPES));
  return DEFAULT_LEAVE_TYPES;
};

// Helper: Get Email Templates
export const getLeaveTemplates = (): LeaveEmailTemplate[] => {
  const saved = localStorage.getItem('company_leave_templates');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
  }
  localStorage.setItem('company_leave_templates', JSON.stringify(DEFAULT_TEMPLATES));
  return DEFAULT_TEMPLATES;
};

// Helper: Get Employee Balances
export const getEmployeeBalances = (): EmployeeLeaveBalance[] => {
  const saved = localStorage.getItem('company_leave_balances');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
  }

  const types = getLeaveTypes();
  // Build default balances for all employees
  const initialBalances: EmployeeLeaveBalance[] = DEFAULT_EMPLOYEES.map((emp) => {
    const balances: Record<string, { totalDays: number; usedDays: number; remainingDays: number }> = {};
    types.forEach((t) => {
      let used = 0;
      if (emp.name === 'John Agent' && t.name === 'Annual Leave') used = 5;
      if (emp.name === 'Jane Smith' && t.name === 'Sick Leave') used = 2;
      balances[t.name] = {
        totalDays: t.defaultDays,
        usedDays: used,
        remainingDays: Math.max(0, t.defaultDays - used)
      };
    });
    return {
      employeeEmail: emp.email,
      employeeName: emp.name,
      department: emp.department,
      isTeamLead: emp.isTeamLead,
      balances
    };
  });

  localStorage.setItem('company_leave_balances', JSON.stringify(initialBalances));
  return initialBalances;
};

// Helper: Save Employee Balances
export const saveEmployeeBalances = (balances: EmployeeLeaveBalance[]) => {
  localStorage.setItem('company_leave_balances', JSON.stringify(balances));
  window.dispatchEvent(new Event('leaveDataUpdated'));
};

// Helper: Get Single Employee's Balance Record
export const getSingleEmployeeBalanceRecord = (email: string, name?: string, dept?: string, isTeamLead?: boolean): EmployeeLeaveBalance => {
  const allBals = getEmployeeBalances();
  let found = allBals.find((b) => b.employeeEmail.toLowerCase() === email.toLowerCase());
  
  if (!found) {
    const types = getLeaveTypes();
    const balances: Record<string, { totalDays: number; usedDays: number; remainingDays: number }> = {};
    types.forEach((t) => {
      balances[t.name] = {
        totalDays: t.defaultDays,
        usedDays: 0,
        remainingDays: t.defaultDays
      };
    });
    found = {
      employeeEmail: email,
      employeeName: name || 'Employee',
      department: dept || 'Sales',
      isTeamLead: !!isTeamLead,
      balances
    };
    allBals.push(found);
    saveEmployeeBalances(allBals);
  }
  
  // Ensure all active leave types are populated in employee's balance object
  const types = getLeaveTypes();
  let updated = false;
  types.forEach((t) => {
    if (!found!.balances[t.name]) {
      found!.balances[t.name] = {
        totalDays: t.defaultDays,
        usedDays: 0,
        remainingDays: t.defaultDays
      };
      updated = true;
    }
  });

  if (updated) {
    saveEmployeeBalances(allBals);
  }

  return found!;
};

// Helper: Get Leave Requests
export const getLeaveRequests = (): LeaveRequestRecord[] => {
  const saved = localStorage.getItem('company_leave_requests');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
  }

  const defaultRequests: LeaveRequestRecord[] = [
    {
      id: 'LV-1001',
      employeeName: 'John Agent',
      employeeEmail: 'john.agent@prokip.com',
      department: 'Sales',
      leaveType: 'Annual Leave',
      startDate: '2026-07-06',
      endDate: '2026-07-10',
      workingDays: 5,
      handoverEmployeeName: 'Adaeze O.',
      handoverEmployeeEmail: 'adaeze@prokip.com',
      availability: 'Reachable by Phone',
      subject: 'Annual Leave Request: John Agent (2026-07-06 - 2026-07-10)',
      emailBody: 'Requesting 5 days of annual leave. Coverage by Adaeze.',
      status: 'Approved',
      submittedDate: '2026-06-20',
      approver: 'Adaeze O. (Team Lead)',
      approverRole: 'Team Lead',
      approvalDate: '2026-06-21',
      approvalComments: 'Approved. Handover is confirmed.'
    },
    {
      id: 'LV-1002',
      employeeName: 'Jane Smith',
      employeeEmail: 'jane.smith@prokip.com',
      department: 'Marketing',
      leaveType: 'Sick Leave',
      startDate: '2026-06-25',
      endDate: '2026-06-26',
      workingDays: 2,
      handoverEmployeeName: 'Michael T.',
      handoverEmployeeEmail: 'michael@prokip.com',
      availability: 'Reachable by Email',
      subject: 'Sick Leave Application: Jane Smith',
      emailBody: 'Taking 2 days sick leave for medical checkup.',
      status: 'Approved',
      submittedDate: '2026-06-24',
      approver: 'Grace Admin (HR)',
      approverRole: 'HR',
      approvalDate: '2026-06-24',
      approvalComments: 'Medical note verified.'
    },
    {
      id: 'LV-1003',
      employeeName: 'Abubakar Ibrahim',
      employeeEmail: 'abubakar@prokip.com',
      department: 'Support',
      leaveType: 'Annual Leave',
      startDate: '2026-08-10',
      endDate: '2026-08-14',
      workingDays: 5,
      handoverEmployeeName: 'Sarah Connor',
      handoverEmployeeEmail: 'sarah@prokip.com',
      availability: 'Reachable if Urgent',
      subject: 'Annual Leave Application: Abubakar Ibrahim',
      emailBody: 'Requesting 5 days leave for rest.',
      status: 'Pending',
      submittedDate: '2026-08-01'
    }
  ];

  localStorage.setItem('company_leave_requests', JSON.stringify(defaultRequests));
  return defaultRequests;
};

// Helper: Save Leave Requests
export const saveLeaveRequests = (requests: LeaveRequestRecord[]) => {
  localStorage.setItem('company_leave_requests', JSON.stringify(requests));
  window.dispatchEvent(new Event('leaveDataUpdated'));
};

// Helper: Log Action to Audit Trail
export const addLeaveAuditLog = (actor: string, action: string, requestId: string, details: string) => {
  const saved = localStorage.getItem('company_leave_audit_logs');
  let logs: LeaveAuditLog[] = [];
  if (saved) {
    try {
      logs = JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
  }
  const newLog: LeaveAuditLog = {
    id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    actor,
    action,
    requestId,
    details
  };
  const updated = [newLog, ...logs];
  localStorage.setItem('company_leave_audit_logs', JSON.stringify(updated));
  window.dispatchEvent(new Event('leaveDataUpdated'));
};

// Helper: Dispatch In-App & Email Notifications
export const dispatchLeaveNotification = (
  recipientEmail: string,
  recipientRole: string,
  title: string,
  message: string,
  type: 'info' | 'success' | 'warning' | 'alert' = 'info'
) => {
  const saved = localStorage.getItem('company_leave_notifications');
  let notifs: LeaveNotification[] = [];
  if (saved) {
    try {
      notifs = JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
  }

  const newNotif: LeaveNotification = {
    id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    recipientEmail,
    recipientRole,
    title,
    message,
    type,
    timestamp: new Date().toLocaleString(),
    read: false,
    isEmailSent: true
  };

  const updated = [newNotif, ...notifs];
  localStorage.setItem('company_leave_notifications', JSON.stringify(updated));

  // Also dispatch into general notifications system if present
  const sysSaved = localStorage.getItem('notifications');
  if (sysSaved) {
    try {
      const sysNotifs = JSON.parse(sysSaved);
      sysNotifs.unshift({
        id: Date.now(),
        title: `[Email & In-App] ${title}`,
        message,
        time: 'Just now',
        type,
        read: false
      });
      localStorage.setItem('notifications', JSON.stringify(sysNotifs));
    } catch (e) {
      console.error(e);
    }
  }

  window.dispatchEvent(new Event('leaveDataUpdated'));
};

// Default Public Holidays
export const DEFAULT_PUBLIC_HOLIDAYS: PublicHoliday[] = [
  {
    id: 'HOL-2026-001',
    name: "New Year's Day",
    date: '2026-01-01',
    description: 'First day of the calendar year. Global public holiday celebrating the new year.',
    category: 'National Holiday',
    status: 'Active',
    createdBy: 'Grace Admin (HR)',
    createdAt: '2026-01-01'
  },
  {
    id: 'HOL-2026-002',
    name: 'Good Friday',
    date: '2026-04-03',
    description: 'Christian holiday commemorating the crucifixion of Jesus Christ.',
    category: 'National Holiday',
    status: 'Active',
    createdBy: 'Grace Admin (HR)',
    createdAt: '2026-01-01'
  },
  {
    id: 'HOL-2026-003',
    name: 'Easter Monday',
    date: '2026-04-06',
    description: 'Public holiday following Easter Sunday.',
    category: 'National Holiday',
    status: 'Active',
    createdBy: 'Grace Admin (HR)',
    createdAt: '2026-01-01'
  },
  {
    id: 'HOL-2026-004',
    name: "Workers' Day",
    date: '2026-05-01',
    description: 'International Workers Day honoring laborers and working classes.',
    category: 'National Holiday',
    status: 'Active',
    createdBy: 'Grace Admin (HR)',
    createdAt: '2026-01-01'
  },
  {
    id: 'HOL-2026-005',
    name: 'Democracy Day',
    date: '2026-06-12',
    description: 'National holiday honoring the restoration of democracy.',
    category: 'National Holiday',
    status: 'Active',
    createdBy: 'Grace Admin (HR)',
    createdAt: '2026-01-01'
  },
  {
    id: 'HOL-2026-006',
    name: 'Company Founder Day',
    date: '2026-08-15',
    description: 'Annual corporate celebration honoring Prokip founding principles.',
    category: 'Company Holiday',
    status: 'Active',
    createdBy: 'Grace Admin (HR)',
    createdAt: '2026-01-01'
  },
  {
    id: 'HOL-2026-007',
    name: 'Independence Day',
    date: '2026-10-01',
    description: 'National day celebrating sovereign independence.',
    category: 'National Holiday',
    status: 'Active',
    createdBy: 'Grace Admin (HR)',
    createdAt: '2026-01-01'
  },
  {
    id: 'HOL-2026-008',
    name: 'Christmas Day',
    date: '2026-12-25',
    description: 'Annual festival commemorating the birth of Jesus Christ.',
    category: 'National Holiday',
    status: 'Active',
    createdBy: 'Grace Admin (HR)',
    createdAt: '2026-01-01'
  },
  {
    id: 'HOL-2026-009',
    name: 'Boxing Day',
    date: '2026-12-26',
    description: 'Public holiday following Christmas Day.',
    category: 'National Holiday',
    status: 'Active',
    createdBy: 'Grace Admin (HR)',
    createdAt: '2026-01-01'
  },
  {
    id: 'HOL-2027-001',
    name: "New Year's Day (2027)",
    date: '2027-01-01',
    description: 'First day of the 2027 calendar year.',
    category: 'National Holiday',
    status: 'Active',
    createdBy: 'Grace Admin (HR)',
    createdAt: '2026-01-01'
  }
];

// Helper: Get Public Holidays
export const getPublicHolidays = (): PublicHoliday[] => {
  const saved = localStorage.getItem('company_public_holidays');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
  }
  localStorage.setItem('company_public_holidays', JSON.stringify(DEFAULT_PUBLIC_HOLIDAYS));
  return DEFAULT_PUBLIC_HOLIDAYS;
};

// Helper: Save Public Holidays
export const savePublicHolidays = (holidays: PublicHoliday[]) => {
  localStorage.setItem('company_public_holidays', JSON.stringify(holidays));
  window.dispatchEvent(new Event('leaveDataUpdated'));
};

// Helper: Get Holiday Notification Configuration
export const getHolidayNotificationConfig = (): HolidayNotificationConfig => {
  const saved = localStorage.getItem('company_holiday_notif_config');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
  }
  const defaultConfig: HolidayNotificationConfig = {
    enabled: true,
    remind7DaysBefore: true,
    remind3DaysBefore: true,
    remind1DayBefore: true,
    inApp: true,
    email: true
  };
  localStorage.setItem('company_holiday_notif_config', JSON.stringify(defaultConfig));
  return defaultConfig;
};

// Helper: Save Holiday Notification Configuration
export const saveHolidayNotificationConfig = (config: HolidayNotificationConfig) => {
  localStorage.setItem('company_holiday_notif_config', JSON.stringify(config));
  window.dispatchEvent(new Event('leaveDataUpdated'));
};

