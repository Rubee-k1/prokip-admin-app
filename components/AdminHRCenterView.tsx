import React, { useState, useMemo, useEffect } from 'react';
import { useAlert } from '../contexts/AlertContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import AddGradeModal from './AddGradeModal';
import SetQuarterModal from './SetQuarterModal';

export interface EmployeeDocument {
    id: string;
    type: 'ID Card' | 'Degree Certificate' | 'Resume' | 'Offer Letter' | 'Other';
    name: string;
    status: 'Verified' | 'Pending' | 'Rejected';
    uploadDate: string;
}

export interface Guarantor {
    name: string;
    phone: string;
    email?: string;
    relationship: string;
    address: string;
    verified: boolean;
}

export interface Employee {
    id: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
    department: string;
    country: 'Nigeria' | 'Ghana' | 'Kenya' | string;
    state: string;
    city: string;
    gender: 'Male' | 'Female' | 'Other';
    maritalStatus: 'Single' | 'Married' | 'Divorced' | 'Widowed' | 'Other';
    dateOfBirth: string;
    hireDate: string;
    status: 'Active' | 'On Leave' | 'Terminated';
    salary: number;
    currency: string;
    performanceScore: number;

    // Advanced Localized Records
    nin?: string; // National Identity Number
    bvn?: string; // Bank Verification Number (Nigeria)
    taxId?: string; // TIN
    pfaName?: string; // Pension Fund Administrator
    pensionNumber?: string;
    bankName?: string;
    accountNumber?: string;

    emergencyContact: {
        name: string;
        phone: string;
        relationship: string;
    };
    guarantors: Guarantor[];
    documents: EmployeeDocument[];
    
    // Performance Review
    lastReviewDate?: string;
    coreGoalsCompleted?: number;
    totalGoals?: number;
    managerFeedback?: string;
    
    // Authorization & Hierarchy
    is_user_account?: boolean;
    is_team_lead?: boolean;
    reports_to?: string; // Employee ID this person reports to
    department_id?: string;
    role_id?: string;

    // Separate Independent Metrics
    grade?: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | 'F';
    rewardPoints?: number;
    leaderboardRank?: string;
    gradeAuditTrail?: GradeAuditEntry[];
}

export interface GradeAuditEntry {
    id: string;
    previousGrade: string;
    newGrade: string;
    policyResponsible: string;
    dateOfChange: string;
    approvingAuthority: string;
    reason: string;
    strengths?: string;
    recommendations?: string;
    type?: string;
}

export const initialEmployees: Employee[] = [
    {
        id: '1', employeeId: 'EMP-NG-001', firstName: 'Chinedu', lastName: 'Okafor', email: 'c.okafor@company.com', phone: '+234 801 234 5678',
        role: 'Senior Sales Executive', department: 'Sales', country: 'Nigeria', state: 'Lagos', city: 'Ikeja', gender: 'Male', maritalStatus: 'Married',
        dateOfBirth: '1985-05-14', hireDate: '2019-03-01', status: 'Active', salary: 1500000, currency: 'NGN', performanceScore: 92,
        bvn: '22334455667', nin: '12345678901', taxId: 'TIN-492-938-1', pfaName: 'Stanbic IBTC Pension Managers', pensionNumber: 'PEN100349200', bankName: 'GTBank', accountNumber: '0123456789',
        emergencyContact: { name: 'Nkechi Okafor', phone: '+234 802 345 6789', relationship: 'Spouse' },
        guarantors: [
            { name: 'Dr. Samuel Obi', phone: '+234 803 111 2222', relationship: 'Former Manager', address: '14 Victoria Island, Lagos', verified: true },
            { name: 'Emeka Nwosu', phone: '+234 805 222 3333', email: 'emeka.n@example.com', relationship: 'Uncle', address: '8 Yaba, Lagos', verified: true }
        ],
        documents: [
            { id: 'd1', type: 'ID Card', name: 'NIN Slip', status: 'Verified', uploadDate: '2019-02-25' },
            { id: 'd2', type: 'Offer Letter', name: 'Signed Offer', status: 'Verified', uploadDate: '2019-02-28' },
            { id: 'd3', type: 'Degree Certificate', name: 'BSc Computer Science', status: 'Verified', uploadDate: '2019-03-05' }
        ],
        lastReviewDate: '2026-03-10', coreGoalsCompleted: 4, totalGoals: 5, managerFeedback: 'Exceptional sales performance this quarter.',
        is_user_account: true, is_team_lead: true, department_id: 'dept-sales', role_id: 'role-sales-manager',
        grade: 'A', rewardPoints: 230, leaderboardRank: '2nd', gradeAuditTrail: []
    },
    {
        id: '2', employeeId: 'EMP-NG-002', firstName: 'Ada', lastName: 'Eze', email: 'a.eze@company.com', phone: '+234 802 345 6789',
        role: 'Sales Representative', department: 'Sales', country: 'Nigeria', state: 'Lagos', city: 'Ikeja', gender: 'Female', maritalStatus: 'Single',
        dateOfBirth: '1998-09-22', hireDate: '2022-01-15', status: 'Active', salary: 300000, currency: 'NGN', performanceScore: 88,
        nin: '11223344556', taxId: 'TIN-492-938-2', bankName: 'Zenith', accountNumber: '0987654321',
        emergencyContact: { name: 'Obinna Eze', phone: '+234 803 456 7890', relationship: 'Brother' },
        guarantors: [],
        documents: [],
        lastReviewDate: '2026-03-10', coreGoalsCompleted: 3, totalGoals: 4, managerFeedback: 'Solid performance, room for growth.',
        is_user_account: true, is_team_lead: false, reports_to: 'EMP-NG-001', department_id: 'dept-sales', role_id: 'role-employee',
        grade: 'B+', rewardPoints: 85, leaderboardRank: '4th', gradeAuditTrail: []
    },
    {
        id: '3', employeeId: 'EMP-NG-003', firstName: 'Samuel', lastName: 'Ojo', email: 's.ojo@company.com', phone: '+234 803 456 7890',
        role: 'Customer Experience Lead', department: 'Customer Experience', country: 'Nigeria', state: 'Lagos', city: 'Ikeja', gender: 'Male', maritalStatus: 'Married',
        dateOfBirth: '1992-11-05', hireDate: '2021-06-10', status: 'Active', salary: 800000, currency: 'NGN', performanceScore: 95,
        nin: '11223344557', taxId: 'TIN-492-938-3', bankName: 'Access Bank', accountNumber: '0987654322',
        emergencyContact: { name: 'Grace Ojo', phone: '+234 804 567 8901', relationship: 'Spouse' },
        guarantors: [],
        documents: [],
        lastReviewDate: '2026-04-10', coreGoalsCompleted: 4, totalGoals: 4, managerFeedback: 'Excellent team leadership.',
        is_user_account: true, is_team_lead: true, department_id: 'dept-cx', role_id: 'role-cx-lead',
        grade: 'A+', rewardPoints: 310, leaderboardRank: '1st', gradeAuditTrail: []
    },
    {
        id: '4', employeeId: 'EMP-NG-004', firstName: 'Binta', lastName: 'Danladi', email: 'b.danladi@company.com', phone: '+234 805 678 9012',
        role: 'Customer Support Representative', department: 'Customer Experience', country: 'Nigeria', state: 'Abuja', city: 'Abuja', gender: 'Female', maritalStatus: 'Single',
        dateOfBirth: '1996-02-14', hireDate: '2023-02-01', status: 'Active', salary: 250000, currency: 'NGN', performanceScore: 78,
        nin: '11223344558', taxId: 'TIN-492-938-4', bankName: 'UBA', accountNumber: '0987654323',
        emergencyContact: { name: 'Aliyu Danladi', phone: '+234 806 789 0123', relationship: 'Father' },
        guarantors: [],
        documents: [],
        lastReviewDate: '2026-04-12', coreGoalsCompleted: 3, totalGoals: 4, managerFeedback: 'Good communication skills, sometimes misses SLA.',
        is_user_account: true, is_team_lead: false, reports_to: 'EMP-NG-003', department_id: 'dept-cx', role_id: 'role-cx-rep',
        grade: 'C', rewardPoints: 40, leaderboardRank: '6th', gradeAuditTrail: []
    },
    {
        id: '5', employeeId: 'EMP-GH-002', firstName: 'Kwame', lastName: 'Osei', email: 'k.osei@company.com', phone: '+233 24 987 6543',
        role: 'Software Engineer', department: 'Engineering', country: 'Ghana', state: 'Ashanti', city: 'Kumasi', gender: 'Male', maritalStatus: 'Single',
        dateOfBirth: '1995-03-12', hireDate: '2023-08-01', status: 'Active', salary: 15000, currency: 'GHS', performanceScore: 90,
        nin: 'GHA-1234567-8', taxId: 'GH-TIN-89302', bankName: 'Ecobank Ghana', accountNumber: '12398700993',
        emergencyContact: { name: 'Akua Osei', phone: '+233 20 555 4444', relationship: 'Mother' },
        guarantors: [
            { name: 'Mr. John Appiah', phone: '+233 24 111 2222', relationship: 'Family Friend', address: 'East Legon, Accra', verified: true }
        ],
        documents: [
            { id: 'd4', type: 'ID Card', name: 'Ghana Card', status: 'Verified', uploadDate: '2023-07-15' },
            { id: 'd5', type: 'Resume', name: 'Resume_Updated.pdf', status: 'Pending', uploadDate: '2023-07-10' }
        ],
        lastReviewDate: '2026-04-05', coreGoalsCompleted: 3, totalGoals: 3, managerFeedback: 'Consistent delivery of high-quality code. Great team player.',
        is_user_account: true, is_team_lead: true, department_id: 'dept-engineering', role_id: 'role-team-lead',
        grade: 'B', rewardPoints: 175, leaderboardRank: '3rd', gradeAuditTrail: []
    },
    {
        id: '6', employeeId: 'EMP-KE-002', firstName: 'Aisha', lastName: 'Omondi', email: 'a.omondi@company.com', phone: '+254 733 456 789',
        role: 'HR Manager', department: 'Human Resources', country: 'Kenya', state: 'Mombasa', city: 'Mombasa', gender: 'Female', maritalStatus: 'Married',
        dateOfBirth: '1988-07-19', hireDate: '2020-04-12', status: 'Active', salary: 250000, currency: 'KES', performanceScore: 96,
        nin: '23948502', taxId: 'KRA-938472948', bankName: 'KCB Bank', accountNumber: '9988776655',
        emergencyContact: { name: 'Peter Omondi', phone: '+254 711 222 333', relationship: 'Spouse' },
        guarantors: [
            { name: 'Jane Wanjiku', phone: '+254 722 333 444', relationship: 'Former Colleague', address: 'Westlands, Nairobi', verified: true }
        ],
        documents: [
            { id: 'd6', type: 'ID Card', name: 'National ID', status: 'Verified', uploadDate: '2020-04-01' }
        ],
        lastReviewDate: '2026-01-20', coreGoalsCompleted: 5, totalGoals: 5, managerFeedback: 'Outstanding leadership in restructuring the East African branch policies.',
        is_user_account: true, is_team_lead: true, department_id: 'dept-hr', role_id: 'role-admin',
        grade: 'A+', rewardPoints: 290, leaderboardRank: '1st (HR)', gradeAuditTrail: []
    },
    {
        id: '7', employeeId: 'EMP-CS-001', firstName: 'Tunde', lastName: 'Bakari', email: 't.bakari@company.com', phone: '+234 812 345 6789',
        role: 'Customer Success Executive', department: 'Customer Success', country: 'Nigeria', state: 'Lagos', city: 'Ikeja', gender: 'Male', maritalStatus: 'Single',
        dateOfBirth: '1994-06-25', hireDate: '2022-04-10', status: 'Active', salary: 350000, currency: 'NGN', performanceScore: 85,
        nin: '11223344559', taxId: 'TIN-492-938-5', bankName: 'GTBank', accountNumber: '0122334455',
        emergencyContact: { name: 'Mofe Bakari', phone: '+234 813 456 7890', relationship: 'Brother' },
        guarantors: [],
        documents: [],
        lastReviewDate: '2026-03-12', coreGoalsCompleted: 4, totalGoals: 5, managerFeedback: 'Excellent response time.',
        is_user_account: true, is_team_lead: false, reports_to: 'EMP-NG-003', department_id: 'dept-cs', role_id: 'role-employee',
        grade: 'B+', rewardPoints: 90, leaderboardRank: '5th', gradeAuditTrail: []
    },
    {
        id: '8', employeeId: 'EMP-MKT-001', firstName: 'Fatima', lastName: 'Yusuf', email: 'f.yusuf@company.com', phone: '+234 809 345 6789',
        role: 'Marketing Associate', department: 'Marketing', country: 'Nigeria', state: 'Lagos', city: 'Lekki', gender: 'Female', maritalStatus: 'Married',
        dateOfBirth: '1996-10-14', hireDate: '2023-01-15', status: 'Active', salary: 400000, currency: 'NGN', performanceScore: 82,
        nin: '11223344560', taxId: 'TIN-492-938-6', bankName: 'Zenith Bank', accountNumber: '0233445566',
        emergencyContact: { name: 'Ibrahim Yusuf', phone: '+234 809 456 7890', relationship: 'Spouse' },
        guarantors: [],
        documents: [],
        lastReviewDate: '2026-02-18', coreGoalsCompleted: 3, totalGoals: 4, managerFeedback: 'Creative ideas, solid execution.',
        is_user_account: true, is_team_lead: false, department_id: 'dept-marketing', role_id: 'role-employee',
        grade: 'B', rewardPoints: 75, leaderboardRank: '7th', gradeAuditTrail: []
    },
    {
        id: '9', employeeId: 'EMP-FIN-001', firstName: 'Emmanuel', lastName: 'Appiah', email: 'e.appiah@company.com', phone: '+233 24 555 1234',
        role: 'Accounts Officer', department: 'Finance', country: 'Ghana', state: 'Greater Accra', city: 'Accra', gender: 'Male', maritalStatus: 'Single',
        dateOfBirth: '1991-12-05', hireDate: '2021-11-01', status: 'Active', salary: 18000, currency: 'GHS', performanceScore: 89,
        nin: 'GHA-7654321-0', taxId: 'GH-TIN-89305', bankName: 'Standard Chartered', accountNumber: '2345678901',
        emergencyContact: { name: 'Kofi Appiah', phone: '+233 20 555 6789', relationship: 'Uncle' },
        guarantors: [],
        documents: [],
        lastReviewDate: '2026-04-02', coreGoalsCompleted: 4, totalGoals: 4, managerFeedback: 'Very detailed and meticulous balance reconciliation.',
        is_user_account: true, is_team_lead: false, department_id: 'dept-finance', role_id: 'role-employee',
        grade: 'B+', rewardPoints: 120, leaderboardRank: '4th', gradeAuditTrail: []
    },
    {
        id: '10', employeeId: 'EMP-CNT-001', firstName: 'Grace', lastName: 'Koffi', email: 'g.koffi@company.com', phone: '+233 27 555 9876',
        role: 'Content Specialist', department: 'Content', country: 'Ghana', state: 'Greater Accra', city: 'Accra', gender: 'Female', maritalStatus: 'Single',
        dateOfBirth: '1997-04-20', hireDate: '2023-05-10', status: 'Active', salary: 14000, currency: 'GHS', performanceScore: 91,
        nin: 'GHA-8822334-1', taxId: 'GH-TIN-89306', bankName: 'Fidelity Bank Ghana', accountNumber: '3456789012',
        emergencyContact: { name: 'Ama Koffi', phone: '+233 20 555 2211', relationship: 'Sister' },
        guarantors: [],
        documents: [],
        lastReviewDate: '2026-03-25', coreGoalsCompleted: 4, totalGoals: 5, managerFeedback: 'Excellent copy writing quality and social media engagement.',
        is_user_account: true, is_team_lead: false, department_id: 'dept-content', role_id: 'role-employee',
        grade: 'A', rewardPoints: 195, leaderboardRank: '3rd', gradeAuditTrail: []
    }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

interface AdminHRCenterViewProps {
    initialTab?: 'dashboard' | 'directory' | 'performance' | 'policies' | 'rewards' | 'leaderboard' | 'upload';
    hideTabs?: boolean;
    departmentFilter?: string;
    userRole?: string;
    userDepartment?: string;
}

const AdminHRCenterView: React.FC<AdminHRCenterViewProps> = ({ 
    initialTab = 'dashboard', 
    hideTabs = false, 
    departmentFilter,
    userRole = 'admin',
    userDepartment = ''
}) => {
    const { showSuccess } = useAlert();
    
    // Load and persist employees in localStorage so rated/modified employees persist across role shifts
    const [employees, setEmployees] = useState<Employee[]>(() => {
        const saved = localStorage.getItem('company_employees_data');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Error parsing company_employees_data from localStorage:', e);
            }
        }
        return initialEmployees;
    });

    useEffect(() => {
        localStorage.setItem('company_employees_data', JSON.stringify(employees));
    }, [employees]);

    // Active Tab State
    const [activeTab, setActiveTab] = useState<'dashboard' | 'directory' | 'performance' | 'policies' | 'rewards' | 'leaderboard' | 'upload'>(initialTab);
    
    // New Rating States
    const [ratingGrade, setRatingGrade] = useState<'A+' | 'A' | 'B+' | 'B' | 'C' | 'D'>('B+');
    const [reviewComments, setReviewComments] = useState('');
    const [strengths, setStrengths] = useState('');
    const [recommendations, setRecommendations] = useState('');
    
    const [uploadType, setUploadType] = useState<'manual' | 'excel'>('manual');
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [manualRows, setManualRows] = useState<number[]>([1]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCountry, setSelectedCountry] = useState<string>('All');
    
    // View Modal State
    const [viewEmployee, setViewEmployee] = useState<Employee | null>(null);
    const [modalTab, setModalTab] = useState<'biodata' | 'guarantors' | 'documents' | 'payroll' | 'grades_audit'>('biodata');
    const [openedFromPerformance, setOpenedFromPerformance] = useState(false);
    const [ratingEmployee, setRatingEmployee] = useState<Employee | null>(null);

    const [selectedViolationCategory, setSelectedViolationCategory] = useState<string>('Repeated Lateness');
    const [policyApprover, setPolicyApprover] = useState<string>('HR Manager');
    const [violationNotes, setViolationNotes] = useState<string>('');

    const [leaderboardScope, setLeaderboardScope] = useState<'company' | 'department'>('company');
    const [leaderboardSearch, setLeaderboardSearch] = useState('');
    const [leaderboardDeptFilterState, setLeaderboardDeptFilterState] = useState<string>('All');
    
    // Update Points Modal State
    const [isUpdatePointsModalOpen, setIsUpdatePointsModalOpen] = useState(false);
    const [updatePointsFormUser, setUpdatePointsFormUser] = useState<string>('');
    const [updatePointsFormType, setUpdatePointsFormType] = useState<'performance' | 'reward'>('performance');
    const [updatePointsFormVal, setUpdatePointsFormVal] = useState<string>('');
    const [updatePointsFormReason, setUpdatePointsFormReason] = useState<string>('');
    const [updatePointsFormScreenshot, setUpdatePointsFormScreenshot] = useState<string | null>(null);
    const [selectedDefinedPolicy, setSelectedDefinedPolicy] = useState<string>('custom');

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAddPolicyModalOpen, setIsAddPolicyModalOpen] = useState(false);
    const [isAddGradeModalOpen, setIsAddGradeModalOpen] = useState(false);
    const [isSetQuarterModalOpen, setIsSetQuarterModalOpen] = useState(false);
    const [isUploadPolicyOpen, setIsUploadPolicyOpen] = useState(false);
    const [uploadPolicyTab, setUploadPolicyTab] = useState<'manual' | 'file'>('manual');
    const [uploadPolicyRows, setUploadPolicyRows] = useState<number[]>([1]);
    const [newPolicy, setNewPolicy] = useState({ name: '', description: '', impact: '' });
    const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({
        firstName: '', lastName: '', email: '', phone: '', role: '', department: 'Sales', 
        country: 'Nigeria', state: '', city: '', gender: 'Male', maritalStatus: 'Single', 
        dateOfBirth: '', hireDate: new Date().toISOString().split('T')[0], status: 'Active', 
        salary: 0, currency: 'NGN', performanceScore: 100
    });

    const [departments, setDepartments] = useState<string[]>(['Sales', 'Engineering', 'Customer Experience', 'Human Resources', 'HR', 'Customer Support', 'Finance']);
    const [isAddDeptModalOpen, setIsAddDeptModalOpen] = useState(false);
    const [newDeptFormName, setNewDeptFormName] = useState('');
    const [isAddingNewDept, setIsAddingNewDept] = useState(false);
    const [newDeptName, setNewDeptName] = useState('');

    const [isAddingGuarantor, setIsAddingGuarantor] = useState(false);
    const [guarantorForm, setGuarantorForm] = useState<Guarantor>({
        name: '',
        phone: '',
        email: '',
        relationship: 'Uncle',
        address: '',
        verified: false
    });

    const [isUploadingDoc, setIsUploadingDoc] = useState(false);
    const [docForm, setDocForm] = useState<{
        type: 'ID Card' | 'Degree Certificate' | 'Resume' | 'Offer Letter' | 'Other';
        name: string;
    }>({
        type: 'ID Card',
        name: ''
    });

    const [isEditingBank, setIsEditingBank] = useState(false);
    const [bankForm, setBankForm] = useState({
        bankName: '',
        accountNumber: '',
        bvn: '',
        taxId: '',
        pfaName: '',
        pensionNumber: '',
        salary: 0,
        currency: 'NGN'
    });

    const handleAddEmployeeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const id = Date.now().toString();
        const employeeId = `EMP-${newEmployee.country?.substring(0, 2).toUpperCase() || 'XX'}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
        const employeeToAdd: Employee = {
            id,
            employeeId,
            ...(newEmployee as any),
            guarantors: [],
            documents: [],
            grade: 'B+',
            rewardPoints: 100,
            leaderboardRank: '5th',
            gradeAuditTrail: []
        };
        setEmployees(prev => [...prev, employeeToAdd]);
        showSuccess(`Employee ${employeeToAdd.firstName} ${employeeToAdd.lastName} added successfully.`);
        setIsAddModalOpen(false);
        setNewEmployee({
            firstName: '', lastName: '', email: '', phone: '', role: '', department: 'Sales', 
            country: 'Nigeria', state: '', city: '', gender: 'Male', maritalStatus: 'Single', 
            dateOfBirth: '', hireDate: new Date().toISOString().split('T')[0], status: 'Active', 
            salary: 0, currency: 'NGN', performanceScore: 100
        });
    };

    // Simulation State
    const simulatorRole = 'admin';
    
    // Scoped Employees
    const scopedEmployees = useMemo(() => {
        let filtered = employees;
        
        // HR Managers and Admins can see employees across all departments.
        // Team Leads and designated managers can ONLY view and rate employees within their assigned department.
        const isAdminOrHr = userRole === 'admin' || userRole === 'hr';
        if (!isAdminOrHr) {
            const targetDept = departmentFilter || userDepartment;
            if (targetDept) {
                filtered = filtered.filter(e => e.department.toLowerCase() === targetDept.toLowerCase());
            } else {
                // Return empty if somehow no department is associated to a team lead, to fulfill safety constraint
                filtered = [];
            }
        } else if (departmentFilter && departmentFilter !== 'All') {
            // Admin or HR choosing to filter by a specific department in their global view
            filtered = filtered.filter(e => e.department.toLowerCase() === departmentFilter.toLowerCase());
        }
        return filtered;
    }, [employees, departmentFilter, userDepartment, userRole]);

    // Derived Metrics
    const headCount = scopedEmployees.length;
    const activeCount = scopedEmployees.filter(e => e.status === 'Active').length;
    const onLeaveCount = scopedEmployees.filter(e => e.status === 'On Leave').length;

    // Gender Distribution
    const genderData = useMemo(() => {
        const counts = { Male: 0, Female: 0, Other: 0 };
        scopedEmployees.forEach(e => {
            if (counts[e.gender] !== undefined) counts[e.gender]++;
        });
        return Object.entries(counts).filter(([_, count]) => count > 0).map(([name, value]) => ({ name, value }));
    }, [scopedEmployees]);

    // Country Distribution
    const countryData = useMemo(() => {
        const counts: Record<string, number> = {};
        scopedEmployees.forEach(e => {
            counts[e.country] = (counts[e.country] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [scopedEmployees]);

    // Department Distribution
    const departmentData = useMemo(() => {
        const counts: Record<string, number> = {};
        scopedEmployees.forEach(e => {
            counts[e.department] = (counts[e.department] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [scopedEmployees]);

    // Work Anniversaries (in the upcoming month - simplified)
    const upcomingAnniversaries = useMemo(() => {
        const today = new Date();
        const currentMonth = today.getMonth();
        return scopedEmployees.filter(e => {
            const hireDate = new Date(e.hireDate);
            return hireDate.getMonth() === currentMonth;
        }).sort((a, b) => new Date(a.hireDate).getDate() - new Date(b.hireDate).getDate());
    }, [scopedEmployees]);

    // Birthdays (in the upcoming month - simplified)
    const upcomingBirthdays = useMemo(() => {
        const today = new Date();
        const currentMonth = today.getMonth();
        return scopedEmployees.filter(e => {
            const dob = new Date(e.dateOfBirth);
            return dob.getMonth() === currentMonth;
        }).sort((a, b) => new Date(a.dateOfBirth).getDate() - new Date(b.dateOfBirth).getDate());
    }, [scopedEmployees]);

    const topEmployees = useMemo(() => {
        return [...scopedEmployees].sort((a, b) => b.performanceScore - a.performanceScore).slice(0, 5);
    }, [scopedEmployees]);

    const filteredEmployees = useMemo(() => {
        return scopedEmployees.filter(e => {
            const matchesSearch = (e.firstName + ' ' + e.lastName).toLowerCase().includes(searchTerm.toLowerCase()) || e.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCountry = selectedCountry === 'All' || e.country === selectedCountry;
            return matchesSearch && matchesCountry;
        });
    }, [scopedEmployees, searchTerm, selectedCountry]);

    return (
        <div className="p-6 animate-fade-in space-y-6 pb-20">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-start items-start md:items-center gap-4 border-b border-slate-200 pb-4">
                <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 shadow-inner overflow-x-auto w-full md:w-auto">
                    {!hideTabs && (
                        <>
                            <button 
                                onClick={() => setActiveTab('dashboard')}
                                className={`py-2 px-4 rounded-md text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-white text-[#02275A] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                            >
                                <i className="fas fa-chart-pie mr-1"></i> Dashboard
                            </button>
                            <button 
                                onClick={() => setActiveTab('directory')}
                                className={`py-2 px-4 rounded-md text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'directory' ? 'bg-white text-[#02275A] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                            >
                                <i className="fas fa-address-book mr-1"></i> Directory
                            </button>
                        </>
                    )}
                    <button 
                        onClick={() => setActiveTab('performance')}
                        className={`py-2 px-4 rounded-md text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'performance' ? 'bg-white text-[#02275A] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        <i className="fas fa-users mr-1"></i> {hideTabs ? "Team Members" : "Performance"}
                    </button>
                    <button 
                        onClick={() => setActiveTab('policies')}
                        className={`py-2 px-4 rounded-md text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'policies' ? 'bg-white text-[#02275A] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        <i className="fas fa-file-contract mr-1"></i> Policies
                    </button>
                    <button 
                        onClick={() => setActiveTab('rewards')}
                        className={`py-2 px-4 rounded-md text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'rewards' ? 'bg-white text-[#02275A] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        <i className="fas fa-gift mr-1"></i> Grades & Rewards
                    </button>
                    <button 
                        onClick={() => setActiveTab('leaderboard')}
                        className={`py-2 px-4 rounded-md text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'leaderboard' ? 'bg-white text-[#02275A] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        <i className="fas fa-trophy mr-1"></i> Leaderboard
                    </button>
                    <button 
                        onClick={() => setActiveTab('upload')}
                        className={`py-2 px-4 rounded-md text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'upload' ? 'bg-white text-[#02275A] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        <i className="fas fa-cloud-upload-alt mr-1"></i> Bulk Upload
                    </button>
                </div>
            </div>

            {activeTab === 'dashboard' && (
                <div className="space-y-6 animate-fade-in">
                    <h2 className="text-2xl font-bold text-[#02275A] mb-4">Overview</h2>
                    {/* Top KPIs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col items-start gap-4 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center text-xl">
                                <i className="fas fa-users"></i>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Headcount</p>
                                <h3 className="text-3xl font-bold text-slate-800">{headCount}</h3>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col items-start gap-4 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center text-xl">
                                <i className="fas fa-user-check"></i>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Active Employees</p>
                                <h3 className="text-3xl font-bold text-slate-800">{activeCount}</h3>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col items-start gap-4 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center text-xl">
                                <i className="fas fa-user-clock"></i>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">On Leave</p>
                                <h3 className="text-3xl font-bold text-slate-800">{onLeaveCount}</h3>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col items-start gap-4 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center text-xl">
                                <i className="fas fa-star"></i>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Avg Performance</p>
                                <h3 className="text-3xl font-bold text-slate-800">
                                    {Math.round(scopedEmployees.reduce((sum, e) => sum + e.performanceScore, 0) / (headCount || 1))}%
                                </h3>
                            </div>
                        </div>
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Gender Distribution */}
                        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col">
                            <h3 className="text-lg font-bold text-slate-800 mb-6">Gender Distribution</h3>
                            <div className="flex-1 min-h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={genderData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                            {genderData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Country Distribution */}
                        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col">
                            <h3 className="text-lg font-bold text-slate-800 mb-6">Workforce by Country</h3>
                            <div className="flex-1 min-h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={countryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                        <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Bar dataKey="value" fill="#02275A" radius={[4, 4, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Department Distribution */}
                        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col">
                            <h3 className="text-lg font-bold text-slate-800 mb-6">Department Headcount</h3>
                            <div className="flex-1 min-h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={departmentData} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                                        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} width={80} />
                                        <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Bar dataKey="value" fill="#0ea5e9" radius={[0, 4, 4, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Lists Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Top Performers */}
                        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                                <h3 className="font-bold text-lg text-slate-800">Top Performers</h3>
                            </div>
                            <div className="p-6 flex-1 flex flex-col gap-3">
                                {topEmployees.map((emp, idx) => (
                                    <div key={emp.id} className="flex justify-between items-center p-4 bg-slate-50/50 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-[#02275A] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                                                {emp.firstName[0]}{emp.lastName[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">{emp.firstName} {emp.lastName}</p>
                                                <p className="text-xs text-slate-500">{emp.role}</p>
                                            </div>
                                        </div>
                                        <span className="font-bold text-emerald-500 text-sm">
                                            {emp.performanceScore}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Upcoming Anniversaries */}
                        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                                <h3 className="font-bold text-lg text-slate-800">Anniversaries</h3>
                            </div>
                            <div className="p-6 flex-1 flex flex-col gap-3">
                                {upcomingAnniversaries.length > 0 ? upcomingAnniversaries.map((emp) => {
                                    const years = new Date().getFullYear() - new Date(emp.hireDate).getFullYear();
                                    return (
                                        <div key={emp.id} className="flex justify-between items-center p-4 bg-indigo-50/50 rounded-lg border border-indigo-100 hover:bg-indigo-50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs shadow-sm">
                                                    <i className="fas fa-gift"></i>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">{emp.firstName} {emp.lastName}</p>
                                                    <p className="text-xs text-slate-500">Joined {new Date(emp.hireDate).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <span className="font-bold text-indigo-500 text-sm">
                                                {years} {years === 1 ? 'Yr' : 'Yrs'}
                                            </span>
                                        </div>
                                    )
                                }) : (
                                    <div className="flex-1 flex items-center justify-center text-slate-400 text-sm py-8">
                                        No anniversaries this month
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Upcoming Birthdays */}
                        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                                <h3 className="font-bold text-lg text-slate-800">Birthdays</h3>
                            </div>
                            <div className="p-6 flex-1 flex flex-col gap-3">
                                {upcomingBirthdays.length > 0 ? upcomingBirthdays.map((emp) => (
                                    <div key={emp.id} className="flex justify-between items-center p-4 bg-rose-50/50 rounded-lg border border-rose-100 hover:bg-rose-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs shadow-sm">
                                                <i className="fas fa-cake-candles"></i>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">{emp.firstName} {emp.lastName}</p>
                                                <p className="text-xs text-slate-500">{emp.department}</p>
                                            </div>
                                        </div>
                                        <span className="font-bold text-rose-500 text-sm">
                                            {new Date(emp.dateOfBirth).getDate()} {new Date(emp.dateOfBirth).toLocaleString('default', { month: 'short' })}
                                        </span>
                                    </div>
                                )) : (
                                    <div className="flex-1 flex items-center justify-center text-slate-400 text-sm py-8">
                                        No birthdays this month
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Recent Activity and At Risk */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10 mt-6 bg-slate-50">
                         {/* At Risk Members */}
                         <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-slate-100">
                                <h3 className="font-bold text-lg text-slate-800">At Risk Members</h3>
                            </div>
                            <div className="p-6 flex-1 flex flex-col gap-3">
                                {scopedEmployees.filter(e => e.performanceScore < 60).length === 0 ? (
                                    <div className="flex-1 flex items-center justify-center text-slate-400 text-sm py-8">
                                        No at-risk members currently
                                    </div>
                                ) : (
                                    scopedEmployees.filter(e => e.performanceScore < 60).map(emp => (
                                        <div key={emp.id} className="flex justify-between items-center p-4 bg-rose-50/50 rounded-lg border border-rose-100 hover:bg-rose-50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                                                    F
                                                </div>
                                                <span className="font-bold text-slate-800 text-sm">{emp.firstName} {emp.lastName}</span>
                                            </div>
                                            <span className="font-bold text-rose-500 text-sm">{emp.performanceScore}%</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-slate-100">
                                <h3 className="font-bold text-lg text-slate-800">Recent Activity</h3>
                            </div>
                            <div className="p-6 flex-1 flex flex-col gap-3">
                                <div className="flex gap-4 p-4 rounded-xl border border-slate-100">
                                    <div className="mt-1 text-slate-400 text-lg">
                                        <i className="far fa-clock"></i>
                                    </div>
                                    <div className="flex-1 flex flex-col md:flex-row justify-between gap-2 md:items-start">
                                        <div>
                                            <p className="text-sm font-medium text-slate-800">
                                                <span className="font-bold">Super Admin</span> gave <span className="font-bold text-rose-500">-5 points</span> to <span className="font-bold">Test Member</span>
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">when there is no reaction to messages posted</p>
                                        </div>
                                        <span className="text-xs text-slate-500 whitespace-nowrap">5/13/2026</span>
                                    </div>
                                </div>
                                <div className="flex gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/30">
                                    <div className="mt-1 text-slate-400 text-lg">
                                        <i className="far fa-clock"></i>
                                    </div>
                                    <div className="flex-1 flex flex-col md:flex-row justify-between gap-2 md:items-start">
                                        <div>
                                            <p className="text-sm font-medium text-slate-800">
                                                <span className="font-bold">Super Admin</span> gave <span className="font-bold text-emerald-500">+10 points</span> to <span className="font-bold">Test Member</span>
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">+10 awarded after 48hrs in production with no bugs</p>
                                        </div>
                                        <span className="text-xs text-slate-500 whitespace-nowrap">5/12/2026</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'directory' && (
                <div className="space-y-4 animate-fade-in">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm gap-4">
                        <div className="flex items-center gap-4 w-full md:w-auto flex-1">
                            <div className="relative w-full max-w-md">
                                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                                <input 
                                    type="text" 
                                    placeholder="Search employees by name or email..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#02275A]"
                                />
                            </div>
                            <select 
                                value={selectedCountry}
                                onChange={(e) => setSelectedCountry(e.target.value)}
                                className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#02275A] bg-slate-50"
                            >
                                <option value="All">All Countries</option>
                                <option value="Nigeria">Nigeria</option>
                                <option value="Ghana">Ghana</option>
                                <option value="Kenya">Kenya</option>
                            </select>
                        </div>
                        <div className="flex flex-wrap gap-2 w-full md:w-auto">
                            <button onClick={() => setIsAddDeptModalOpen(true)} className="bg-white border border-slate-200 text-[#02275A] px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2 whitespace-nowrap">
                                <i className="fas fa-plus"></i> Create Department
                            </button>
                            <button onClick={() => setIsAddModalOpen(true)} className="bg-[#02275A] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-[#02275A]/90 transition-colors flex items-center gap-2 whitespace-nowrap">
                                <i className="fas fa-user-plus"></i> Add Employee
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500 font-bold tracking-wider">
                                        <th className="p-4">Employee</th>
                                        <th className="p-4">Contact</th>
                                        <th className="p-4">Role & Dept</th>
                                        <th className="p-4">Location</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredEmployees.map(emp => (
                                        <tr key={emp.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm">
                                                        {emp.firstName[0]}{emp.lastName[0]}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-800">{emp.firstName} {emp.lastName}</div>
                                                        <div className="text-xs text-slate-400 font-mono">{emp.employeeId}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm text-slate-700">{emp.email}</div>
                                                <div className="text-xs text-slate-500">{emp.phone}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm font-bold text-slate-700">{emp.role}</div>
                                                <div className="text-xs text-slate-500">{emp.department}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm font-bold text-slate-700">
                                                    {emp.country === 'Nigeria' && <span className="mr-1">🇳🇬</span>}
                                                    {emp.country === 'Ghana' && <span className="mr-1">🇬🇭</span>}
                                                    {emp.country === 'Kenya' && <span className="mr-1">🇰🇪</span>}
                                                    {emp.country}
                                                </div>
                                                <div className="text-xs text-slate-500">{emp.city}, {emp.state}</div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                                                    emp.status === 'Active' ? 'bg-emerald-50 text-emerald-600' :
                                                    emp.status === 'On Leave' ? 'bg-amber-50 text-amber-600' :
                                                    'bg-rose-50 text-rose-600'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                                        emp.status === 'Active' ? 'bg-emerald-500' :
                                                        emp.status === 'On Leave' ? 'bg-amber-500' :
                                                        'bg-rose-500'
                                                    }`}></span>
                                                    {emp.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button 
                                                    onClick={() => {
                                                        setViewEmployee(emp);
                                                        setModalTab('biodata');
                                                        setOpenedFromPerformance(false);
                                                    }}
                                                    className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:text-[#02275A] hover:border-[#02275A] rounded-lg transition-colors text-xs font-bold shadow-sm inline-flex items-center gap-1"
                                                >
                                                    <i className="fas fa-eye"></i> View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredEmployees.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-slate-500">
                                                No employees found matching your criteria.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
            {activeTab === 'performance' && (
                <div className="space-y-6 animate-fade-in pb-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h2 className="text-2xl font-bold text-[#02275A]">{hideTabs ? "Team Members" : "Performance & Rankings"}</h2>
                        <div className="flex flex-wrap items-center gap-3">
                            <button 
                                onClick={() => {
                                    setUpdatePointsFormUser('');
                                    setUpdatePointsFormType('performance');
                                    setUpdatePointsFormVal('');
                                    setUpdatePointsFormReason('');
                                    setUpdatePointsFormScreenshot(null);
                                    setSelectedDefinedPolicy('custom');
                                    setIsUpdatePointsModalOpen(true);
                                }}
                                className="px-4 py-2 bg-[#02275A] hover:bg-[#0b3b82] text-white rounded-lg text-sm font-bold shadow-md transition-colors flex items-center gap-2 cursor-pointer"
                            >
                                <i className="fas fa-star text-amber-300"></i> Update Points
                            </button>
                            <div className="relative">
                                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                                <input 
                                    type="text" 
                                    placeholder="Search team members..." 
                                    className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-[#02275A] transition-colors w-64 shadow-sm font-sans"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-600 font-semibold text-xs border-b border-slate-200 uppercase tracking-wider">
                                        <th className="px-4 py-3.5 font-bold">Employee & Role</th>
                                        <th className="px-4 py-3.5 font-bold text-center">Score</th>
                                        <th className="px-4 py-3.5 font-bold text-center">Reward Points</th>
                                        <th className="px-4 py-3.5 font-bold text-center">Leaderboard Rank</th>
                                        <th className="px-4 py-3.5 font-bold text-center">Overall Grade</th>
                                        <th className="px-4 py-3.5 font-bold text-right pr-6">Evaluate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEmployees.map((emp) => {
                                        // Independent metrics fallback gracefully
                                        const empGrade = emp.grade || 'B+';
                                        const empPoints = emp.rewardPoints !== undefined ? emp.rewardPoints : 100;
                                        const empRank = emp.leaderboardRank || 'N/A';
                                        
                                        let gradeClass = 'bg-rose-100 text-rose-700 border-rose-200';
                                        
                                        if (empGrade === 'A+' || empGrade === 'A') {
                                            gradeClass = 'bg-emerald-100 text-emerald-850 border-emerald-200 border';
                                        } else if (empGrade === 'B+' || empGrade === 'B') {
                                            gradeClass = 'bg-blue-100 text-blue-800 border-blue-200 border';
                                        } else if (empGrade === 'C') {
                                            gradeClass = 'bg-amber-100 text-amber-800 border-amber-200 border';
                                        } else if (empGrade === 'D') {
                                            gradeClass = 'bg-orange-100 text-orange-800 border-orange-200 border';
                                        }

                                        let pointsClass = 'text-slate-700 font-semibold';
                                        if (emp.performanceScore >= 90) {
                                            pointsClass = 'text-emerald-600 font-bold';
                                        } else if (emp.performanceScore < 60) {
                                            pointsClass = 'text-rose-600 font-bold';
                                        }

                                        return (
                                        <tr key={emp.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 text-[#02275A] flex items-center justify-center font-bold text-xs ring-1 ring-slate-200 shadow-inner shrink-0">
                                                        {emp.firstName[0]}{emp.lastName[0]}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="font-bold text-[#02275A] text-sm truncate">{emp.firstName} {emp.lastName}</div>
                                                        <div className="text-xs text-slate-500 truncate mt-0.5">
                                                            <span className="font-medium text-slate-600">{emp.role}</span>
                                                            <span className="text-slate-300 mx-1">•</span>
                                                            <span className="text-slate-400">{emp.department}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`${pointsClass} text-sm font-mono`}>{emp.performanceScore}%</span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="text-amber-500 font-bold flex items-center justify-center gap-1 text-sm font-mono">
                                                    <i className="fas fa-star text-[10px]"></i> {empPoints}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="text-indigo-600 font-bold flex items-center justify-center gap-1 text-sm font-mono">
                                                    <i className="fas fa-trophy text-[10px] text-yellow-500"></i> {empRank}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className={`mx-auto w-fit px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${gradeClass}`}>
                                                    Grade {empGrade}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right pr-6">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button 
                                                        onClick={() => {
                                                            setViewEmployee(emp);
                                                            setModalTab('grades_audit');
                                                            setOpenedFromPerformance(true);
                                                        }}
                                                        className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 hover:text-[#02275A] hover:border-[#02275A] hover:bg-slate-50/50 rounded-lg transition-colors text-xs font-bold shadow-xs inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                                                        title="View Performance History Logs"
                                                    >
                                                        <i className="fas fa-clock-rotate-left text-[11px]"></i> History
                                                    </button>
                                                    {(userRole === 'admin' || userRole === 'hr' || ['team-lead', 'cx-head', 'customer-success', 'sales-manager', 'marketing-manager', 'finance', 'content-lead'].includes(userRole)) && (
                                                        <button 
                                                            onClick={() => {
                                                                setRatingEmployee(emp);
                                                                setRatingGrade(emp.grade || 'B+');
                                                                setReviewComments('');
                                                                setStrengths('');
                                                                setRecommendations('');
                                                            }}
                                                            className="px-2.5 py-1 bg-[#02275A] hover:bg-[#0b3b82] hover:shadow text-white rounded-lg transition-all text-xs font-bold shadow-xs inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                                                        >
                                                            <i className="fas fa-star-half-stroke text-[11px]"></i> Rate
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )})}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'upload' && (
                <div className="space-y-6 animate-fade-in pb-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-[#02275A] mb-2">Bulk Upload Performance</h2>
                            <p className="text-slate-500 text-sm">Upload performance points or define metrics in bulk via Excel or manual entry.</p>
                        </div>
                        <div className="flex bg-slate-50 border border-slate-200 rounded-lg p-1 w-fit shadow-sm">
                            <button 
                                onClick={() => setUploadType('manual')}
                                className={`px-5 py-2 text-sm transition-colors ${uploadType === 'manual' ? 'font-bold bg-white text-[#02275A] rounded-md shadow-sm' : 'font-medium text-slate-500 hover:text-slate-800'}`}
                            >
                                Manual Add
                            </button>
                            <button 
                                onClick={() => setUploadType('excel')}
                                className={`px-5 py-2 text-sm transition-colors ${uploadType === 'excel' ? 'font-bold bg-white text-[#02275A] rounded-md shadow-sm' : 'font-medium text-slate-500 hover:text-slate-800'}`}
                            >
                                Excel Import
                            </button>
                        </div>
                    </div>

                    {uploadType === 'manual' ? (
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm animate-fade-in">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                                            <th className="py-4 px-6 w-1/3">Name</th>
                                            <th className="py-4 px-6 w-1/4">Type</th>
                                            <th className="py-4 px-6 w-32">Points</th>
                                            <th className="py-4 px-6">Reason</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {manualRows.map(rowId => (
                                            <tr key={rowId} className="border-b border-slate-50">
                                                <td className="py-4 px-6">
                                                    <select defaultValue="" className="w-full px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm rounded-lg hover:border-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-[#02275A]/20">
                                                        <option value="" disabled>Select user...</option>
                                                        {employees.map(emp => (
                                                            <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <select defaultValue="performance" className="w-full px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm rounded-lg hover:border-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-[#02275A]/20">
                                                        <option value="performance">Performance</option>
                                                        <option value="bonus">Bonus</option>
                                                        <option value="penalty">Penalty</option>
                                                    </select>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <input type="number" placeholder="0" className="w-full px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm rounded-lg hover:border-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-[#02275A]/20" />
                                                </td>
                                                <td className="py-4 px-6">
                                                    <input type="text" placeholder="Reason for points..." className="w-full px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm rounded-lg hover:border-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-[#02275A]/20" />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex items-center justify-between p-6 bg-slate-50 border-t border-slate-200">
                                <button 
                                    className="flex items-center gap-2 text-sm font-bold text-[#02275A] hover:text-[#0b3b82] transition-colors disabled:opacity-50"
                                    onClick={() => setManualRows([...manualRows, Math.max(0, ...manualRows) + 1])}
                                >
                                    <i className="fas fa-plus"></i>
                                    Add Row
                                </button>
                                <button 
                                    className="px-6 py-2 bg-[#02275A] text-white rounded-lg text-sm font-bold shadow-md hover:bg-[#1a2b54] transition-colors"
                                    onClick={() => {
                                        showSuccess('Performance points successfully added.');
                                        setManualRows([1]);
                                    }}
                                >
                                    Save Points
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-10 animate-fade-in text-center">
                            <div className="w-16 h-16 bg-[#02275A]/10 text-[#02275A] rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                                <i className="fas fa-cloud-upload-alt"></i>
                            </div>
                            <h3 className="font-bold text-lg text-[#02275A] mb-2">Excel Import</h3>
                            <p className="text-slate-500 text-sm mb-8 max-w-sm mx-auto">Upload an Excel file to update performance points for multiple team members at once.</p>
                            
                            <div className="border-2 border-dashed border-slate-300 bg-slate-50/50 rounded-xl p-10 cursor-pointer hover:bg-slate-50 transition-colors max-w-lg mx-auto">
                                <p className="text-[#02275A] font-bold mb-1">Drag and drop file here</p>
                                <p className="text-slate-500 text-sm mb-6">or browse from your system</p>
                                <button className="px-6 py-2.5 bg-[#02275A] text-white rounded-lg text-sm font-bold shadow-md hover:bg-[#02275A]/90 transition-colors">
                                    Browse Files
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'policies' && (
                <div className="space-y-6 animate-fade-in pb-10">
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-[#02275A] mb-2">Policies</h2>
                                <p className="text-slate-500 text-sm">Manage point policies for automated and manual point application.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={() => setIsUploadPolicyOpen(true)} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2">
                                    <i className="fas fa-upload"></i> Upload
                                </button>
                                <button onClick={() => setIsAddPolicyModalOpen(true)} className="px-4 py-2 bg-[#02275A] text-white rounded-lg text-sm font-bold shadow-md hover:bg-[#02275A]/90 transition-colors flex items-center gap-2">
                                    <i className="fas fa-plus"></i> Add Policy
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-lg shadow-sm text-slate-400">
                                    <i className="fas fa-search relative top-[1px]"></i>
                                </div>
                            </div>
                            <div className="relative flex-1">
                                <select className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-[#02275A] shadow-sm appearance-none">
                                    <option>All Scopes</option>
                                    <option>Global</option>
                                    <option>Engineering</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500">
                                    <i className="fas fa-chevron-down text-xs"></i>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 border-b border-transparent">
                            <button className="px-5 py-2.5 bg-[#02275A] text-white rounded-lg text-sm font-bold shadow-sm">
                                Rewards (6)
                            </button>
                            <button className="px-5 py-2.5 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg text-sm font-medium transition-colors">
                                Penalties (10)
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { title: 'Documentation Hero', desc: '+5 for creating technical guides for features', pts: '+5 points', scope: 'Global' },
                                { title: 'Early Delivery', desc: '+5 per 24 hours ahead of schedule', pts: '+5 points', scope: 'Global' },
                                { title: 'Proactive Warning', desc: '+5 for flagging a delay >72 hours in advance', pts: '+5 points', scope: 'Global' },
                                { title: 'Product addition', desc: 'Production addition', pts: '+10 points', scope: 'Engineering' },
                                { title: 'Urgent Review SLA Met', desc: '+5 for meeting urgent review SLA (Reviewer)', pts: '+5 points', scope: 'Global' },
                                { title: 'Zero-Bug Release', desc: '+10 awarded after 48hrs in production with no bugs', pts: '+10 points', scope: 'Global' },
                            ].map((policy, idx) => (
                                <div key={idx} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative group">
                                    <div className="absolute top-5 right-5 text-slate-300 hover:text-slate-500 cursor-pointer transition-colors">
                                        <i className="fas fa-pencil-alt text-[13px] transform -scale-x-100"></i>
                                    </div>
                                    <h4 className="font-bold text-[#02275A] text-[15px] mb-1.5 pr-6">{policy.title}</h4>
                                    <p className="text-slate-600 text-[13px] mb-5">{policy.desc}</p>
                                    <div className="flex items-center gap-3">
                                        <span className="text-emerald-600 font-bold text-[13px]">{policy.pts}</span>
                                        <span className="text-slate-500 text-[13px]">{policy.scope}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'rewards' && (
                <div className="space-y-6 animate-fade-in pb-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-[#02275A] mb-2">Grade System</h2>
                            <p className="text-slate-500 text-sm">Define grades, point thresholds, and rewards.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => setIsAddGradeModalOpen(true)}
                                className="px-4 py-2 bg-[#02275A] text-white rounded-lg text-sm font-bold shadow-md hover:bg-[#02275A]/90 transition-colors flex items-center gap-2"
                            >
                                <i className="fas fa-plus"></i> Add Grade Definition
                            </button>
                            <button 
                                onClick={() => setIsSetQuarterModalOpen(true)}
                                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2"
                            >
                                <i className="far fa-calendar-alt"></i> Set Quarter
                            </button>
                        </div>
                    </div>

                    <div className="bg-slate-100 rounded-xl border border-slate-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 items-start">
                        <div className="flex items-center gap-4">
                            <div className="text-slate-500 text-xl">
                                <i className="far fa-calendar-alt"></i>
                            </div>
                            <div>
                                <h4 className="font-bold text-[#02275A] text-sm">Q2 2026</h4>
                                <p className="text-slate-500 text-xs mt-0.5">Apr 1, 2026 &rarr; Jul 1, 2026</p>
                            </div>
                        </div>
                        <div>
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-md text-xs font-bold">Active</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 pt-2">
                        <span className="text-sm text-slate-700 font-medium">View:</span>
                        <div className="relative">
                            <select className="px-4 py-2 pr-8 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-[#02275A] shadow-sm appearance-none min-w-[200px]">
                                <option>All Departments</option>
                                <option>Engineering</option>
                                <option>Sales</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500">
                                <i className="fas fa-chevron-down text-xs"></i>
                            </div>
                        </div>
                    </div>

                    {/* Global Grade Definitions */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-4">
                        <div className="p-6 border-b border-slate-100">
                            <h3 className="font-bold text-[#02275A] text-lg">Global Grade Definitions</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 text-slate-700 text-sm font-bold">
                                        <th className="px-6 py-4">Grade</th>
                                        <th className="px-6 py-4">Min Points</th>
                                        <th className="px-6 py-4">Max Points</th>
                                        <th className="px-6 py-4">Consequence</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-slate-50 hover:bg-slate-50/50">
                                        <td className="px-6 py-4">
                                            <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">A</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-mono text-slate-600">90</td>
                                        <td className="px-6 py-4 text-sm font-mono text-slate-600">100</td>
                                        <td className="px-6 py-4 text-sm text-slate-400">&mdash;</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-3 text-slate-400">
                                                <i className="fas fa-pencil-alt hover:text-slate-600 cursor-pointer transition-colors text-[13px] transform -scale-x-100"></i>
                                                <i className="far fa-trash-alt hover:text-rose-500 cursor-pointer transition-colors text-[13px]"></i>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr className="border-b border-slate-50 hover:bg-slate-50/50">
                                        <td className="px-6 py-4">
                                            <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">B</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-mono text-slate-600">75</td>
                                        <td className="px-6 py-4 text-sm font-mono text-slate-600">89</td>
                                        <td className="px-6 py-4 text-sm text-slate-400">&mdash;</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-3 text-slate-400">
                                                <i className="fas fa-pencil-alt hover:text-slate-600 cursor-pointer transition-colors text-[13px] transform -scale-x-100"></i>
                                                <i className="far fa-trash-alt hover:text-rose-500 cursor-pointer transition-colors text-[13px]"></i>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr className="border-b border-slate-50 hover:bg-slate-50/50">
                                        <td className="px-6 py-4">
                                            <div className="w-6 h-6 rounded-full bg-amber-400 text-white flex items-center justify-center font-bold text-xs shadow-sm">C</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-mono text-slate-600">60</td>
                                        <td className="px-6 py-4 text-sm font-mono text-slate-600">74</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">Mandatory Estimation Training & peer review</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-3 text-slate-400">
                                                <i className="fas fa-pencil-alt hover:text-slate-600 cursor-pointer transition-colors text-[13px] transform -scale-x-100"></i>
                                                <i className="far fa-trash-alt hover:text-rose-500 cursor-pointer transition-colors text-[13px]"></i>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-slate-50/50">
                                        <td className="px-6 py-4">
                                            <div className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">F</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-mono text-slate-600">0</td>
                                        <td className="px-6 py-4 text-sm font-mono text-slate-600">59</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">Loss of remote work + Daily EOD micromanagement</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-3 text-slate-400">
                                                <i className="fas fa-pencil-alt hover:text-slate-600 cursor-pointer transition-colors text-[13px] transform -scale-x-100"></i>
                                                <i className="far fa-trash-alt hover:text-rose-500 cursor-pointer transition-colors text-[13px]"></i>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Rewards */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-6">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-bold text-[#02275A] text-lg flex items-center gap-2">
                                <i className="fas fa-gift text-amber-500"></i> Rewards
                            </h3>
                            <button className="px-4 py-2 bg-[#02275A] text-white rounded-lg text-sm font-bold shadow-md hover:bg-[#02275A]/90 transition-colors flex items-center gap-2">
                                <i className="fas fa-plus relative top-0.5 text-xs"></i> Add Reward
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 text-slate-700 text-sm font-bold">
                                        <th className="px-6 py-4">Name</th>
                                        <th className="px-6 py-4">Point Range</th>
                                        <th className="px-6 py-4">Reward</th>
                                        <th className="px-6 py-4">Department</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-slate-50 hover:bg-slate-50/50">
                                        <td className="px-6 py-4 flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">A</div>
                                            <span className="text-sm font-bold text-[#02275A]">High Performer</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-mono text-slate-600">90 - 100</td>
                                        <td className="px-6 py-4 text-sm text-slate-400 italic">Not defined</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold">Global</span>
                                        </td>
                                    </tr>
                                    <tr className="border-b border-slate-50 hover:bg-slate-50/50">
                                        <td className="px-6 py-4 flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">B</div>
                                            <span className="text-sm font-bold text-[#02275A]">Reliable</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-mono text-slate-600">75 - 89</td>
                                        <td className="px-6 py-4 text-sm text-slate-400 italic">Not defined</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold">Global</span>
                                        </td>
                                    </tr>
                                    <tr className="border-b border-slate-50 hover:bg-slate-50/50">
                                        <td className="px-6 py-4 flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-amber-400 text-white flex items-center justify-center font-bold text-xs shadow-sm">C</div>
                                            <span className="text-sm font-bold text-[#02275A]">Warning</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-mono text-slate-600">60 - 74</td>
                                        <td className="px-6 py-4 text-sm text-slate-400 italic">Not defined</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold">Global</span>
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-slate-50/50">
                                        <td className="px-6 py-4 flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">F</div>
                                            <span className="text-sm font-bold text-[#02275A]">Probation</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-mono text-slate-600">0 - 59</td>
                                        <td className="px-6 py-4 text-sm text-slate-400 italic">Not defined</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold">Global</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Quarter History */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-6 flex flex-col">
                        <div className="p-6 border-b border-slate-100">
                            <h3 className="font-bold text-[#02275A] text-lg">Quarter History</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 text-slate-700 text-sm font-bold">
                                        <th className="px-6 py-4">Quarter</th>
                                        <th className="px-6 py-4">Start</th>
                                        <th className="px-6 py-4">End</th>
                                        <th className="px-6 py-4">Scope</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="hover:bg-slate-50/50">
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-[#02275A] text-sm">Q2 2026</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">4/1/2026</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">7/1/2026</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">Global</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-emerald-100 text-emerald-600 rounded-md text-[11px] font-bold">Active</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end text-slate-400">
                                                <i className="far fa-trash-alt hover:text-rose-500 cursor-pointer transition-colors text-[13px]"></i>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'leaderboard' && (() => {
                const getInitials = (firstName?: string, lastName?: string) => {
                    return `${(firstName || '')[0] || ''}${(lastName || '')[0] || ''}`.toUpperCase();
                };

                const uniqueDepartments = Array.from(new Set(employees.map(e => e.department).filter(Boolean)));
                
                const filteredLeaderboardFilteredEmployees = employees.filter(emp => {
                    // Department Filter - if departmentFilter prop is present (TL / user view)
                    if (departmentFilter) {
                        if (emp.department !== departmentFilter) {
                            return false;
                        }
                    } else if (leaderboardDeptFilterState !== 'All') {
                        // Admin/HR choosing a specific department view
                        if (emp.department !== leaderboardDeptFilterState) {
                            return false;
                        }
                    }

                    // Search Term Filter
                    if (leaderboardSearch.trim()) {
                        const query = leaderboardSearch.toLowerCase();
                        const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase();
                        if (!fullName.includes(query) && 
                            !(emp.role || '').toLowerCase().includes(query) &&
                            !(emp.employeeId || '').toLowerCase().includes(query)) {
                            return false;
                        }
                    }

                    return true;
                });

                const sortedLeaderboardEmployees = [...filteredLeaderboardFilteredEmployees].sort((a, b) => {
                    const pointsA = a.rewardPoints !== undefined ? a.rewardPoints : 100;
                    const pointsB = b.rewardPoints !== undefined ? b.rewardPoints : 100;
                    if (pointsB !== pointsA) {
                        return pointsB - pointsA;
                    }
                    const perfA = a.performanceScore !== undefined ? a.performanceScore : 0;
                    const perfB = b.performanceScore !== undefined ? b.performanceScore : 0;
                    if (perfB !== perfA) {
                        return perfB - perfA;
                    }
                    return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
                });

                const firstPlace = sortedLeaderboardEmployees[0];
                const secondPlace = sortedLeaderboardEmployees[1];
                const thirdPlace = sortedLeaderboardEmployees[2];

                return (
                    <div className="space-y-6 animate-fade-in pb-10">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-[#02275A] mb-6">Leaderboard</h2>
                                <div className="flex items-center gap-3 mb-1">
                                    <i className="fas fa-trophy text-amber-500 text-2xl"></i>
                                    <h3 className="text-xl font-bold text-[#02275A]">Top Performers</h3>
                                </div>
                                <p className="text-slate-500 text-sm mt-1">Ranked by Reward Points — celebrating extra-mile achievements</p>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 mt-2 mb-6 font-sans">
                            <div className="flex bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm shrink-0">
                                {!departmentFilter && (
                                    <button 
                                        onClick={() => {
                                            setLeaderboardScope('company');
                                            setLeaderboardDeptFilterState('All');
                                        }}
                                        className={`px-5 py-2.5 text-sm transition-colors ${leaderboardDeptFilterState === 'All' ? 'font-bold bg-[#02275A] text-white' : 'font-medium text-slate-500 hover:bg-slate-50 border-r border-slate-200'}`}
                                    >
                                        Whole Company
                                    </button>
                                )}
                                <button 
                                    onClick={() => {
                                        setLeaderboardScope('department');
                                        if (departmentFilter) {
                                            setLeaderboardDeptFilterState(departmentFilter);
                                        } else {
                                            if (leaderboardDeptFilterState === 'All') {
                                                setLeaderboardDeptFilterState(uniqueDepartments[0] || 'Sales');
                                            }
                                        }
                                    }}
                                    className={`px-5 py-2.5 text-sm transition-colors ${leaderboardDeptFilterState !== 'All' ? 'font-bold bg-[#02275A] text-white' : 'font-medium text-slate-500 hover:bg-slate-50'}`}
                                >
                                    {departmentFilter ? 'My Department' : 'Filter by Department'}
                                </button>
                            </div>

                            {/* Dropdown to switch department filters dynamically (for Admin/HR only) */}
                            {!departmentFilter && (
                                <div className="relative">
                                    <select 
                                        value={leaderboardDeptFilterState}
                                        onChange={(e) => {
                                            setLeaderboardDeptFilterState(e.target.value);
                                            if (e.target.value === 'All') {
                                                setLeaderboardScope('company');
                                            } else {
                                                setLeaderboardScope('department');
                                            }
                                        }}
                                        className="w-full md:w-56 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:outline-none focus:ring-2 focus:ring-[#02275A]/20 shadow-sm"
                                    >
                                        <option value="All">All Departments</option>
                                        {uniqueDepartments.map(dept => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="relative flex-1 max-w-sm">
                                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                                <input 
                                    type="text" 
                                    placeholder="Search member..." 
                                    value={leaderboardSearch}
                                    onChange={(e) => setLeaderboardSearch(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-[#02275A] shadow-sm font-sans"
                                />
                            </div>
                        </div>

                        <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-8 flex flex-col md:flex-row items-end justify-center gap-6 shadow-sm min-h-[400px]">
                            {/* 2nd Place */}
                            <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col items-center w-full md:w-64 shadow-sm relative pt-12 transform hover:-translate-y-1 transition-transform">
                                <div className="absolute -top-7">
                                    <div className="relative">
                                        <i className="fas fa-medal text-[3.5rem] text-slate-300 drop-shadow-md"></i>
                                        <span className="absolute top-[25px] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[13px] font-bold text-slate-600">2</span>
                                    </div>
                                </div>
                                <div className="w-20 h-20 bg-slate-200 text-slate-700 rounded-full flex items-center justify-center text-2xl font-bold shadow-inner mb-4">
                                    {secondPlace ? getInitials(secondPlace.firstName, secondPlace.lastName) : '—'}
                                </div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-bold text-[#02275A] text-center text-sm">
                                        {secondPlace ? `${secondPlace.firstName} ${secondPlace.lastName}` : 'Empty Rank'}
                                    </h4>
                                    {secondPlace && secondPlace.is_user_account && (
                                        <span className="px-1.5 py-0.5 bg-[#02275A]/10 text-[#02275A] text-[9px] font-bold rounded">YOU</span>
                                    )}
                                </div>
                                <p className="text-slate-500 text-[11px] mb-4">{secondPlace ? secondPlace.department : 'No record'}</p>
                                <div className="px-4 py-1.5 bg-slate-50 rounded-md border border-slate-100 text-sm font-bold text-slate-700 mb-2 font-mono">
                                    {secondPlace ? (secondPlace.rewardPoints !== undefined ? secondPlace.rewardPoints : 100) : 0} <span className="text-slate-400 font-normal">pts</span>
                                </div>
                            </div>

                            {/* 1st Place */}
                            <div className="bg-[#FFFDF5] border border-amber-200 rounded-xl p-6 flex flex-col items-center w-full md:w-[17rem] shadow-md relative pt-14 mb-4 transform hover:-translate-y-1 transition-transform">
                                <div className="absolute -top-9">
                                    <div className="relative">
                                        <i className="fas fa-medal text-[4.5rem] text-amber-500 drop-shadow-md"></i>
                                        <span className="absolute top-[34px] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sm font-bold text-amber-900 drop-shadow-sm">1</span>
                                    </div>
                                </div>
                                <div className="w-24 h-24 bg-amber-500 text-amber-900 rounded-full flex items-center justify-center text-3xl font-bold shadow-inner mb-4 font-mono">
                                    {firstPlace ? getInitials(firstPlace.firstName, firstPlace.lastName) : '—'}
                                </div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-bold text-[#02275A] text-base text-center">
                                        {firstPlace ? `${firstPlace.firstName} ${firstPlace.lastName}` : 'Empty Rank'}
                                    </h4>
                                    {firstPlace && firstPlace.is_user_account && (
                                        <span className="px-1.5 py-0.5 bg-[#02275A]/10 text-[#02275A] text-[9px] font-bold rounded">YOU</span>
                                    )}
                                </div>
                                <p className="text-slate-500 text-xs mb-5">{firstPlace ? firstPlace.department : 'No record'}</p>
                                <div className="px-5 py-2 bg-white rounded-md border border-amber-100 text-base font-bold text-slate-700 shadow-sm text-center mb-2 font-mono">
                                    {firstPlace ? (firstPlace.rewardPoints !== undefined ? firstPlace.rewardPoints : 100) : 0} <span className="text-slate-400 font-normal">pts</span>
                                </div>
                            </div>

                            {/* 3rd Place */}
                            <div className="bg-[#FFFDF5] border border-amber-100 rounded-xl p-6 flex flex-col items-center w-full md:w-64 shadow-sm relative pt-12 transform hover:-translate-y-1 transition-transform">
                                <div className="absolute -top-7">
                                    <div className="relative">
                                        <i className="fas fa-medal text-[3.5rem] text-[#CD7F32] drop-shadow-md"></i>
                                        <span className="absolute top-[25px] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[13px] font-bold text-white">3</span>
                                    </div>
                                </div>
                                <div className="w-20 h-20 bg-[#CD7F32] text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-inner mb-4 border-2 border-white">
                                    {thirdPlace ? getInitials(thirdPlace.firstName, thirdPlace.lastName) : '—'}
                                </div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-bold text-[#02275A] text-center text-sm">
                                        {thirdPlace ? `${thirdPlace.firstName} ${thirdPlace.lastName}` : 'Empty Rank'}
                                    </h4>
                                    {thirdPlace && thirdPlace.is_user_account && (
                                        <span className="px-1.5 py-0.5 bg-[#02275A]/10 text-[#02275A] text-[9px] font-bold rounded">YOU</span>
                                    )}
                                </div>
                                <p className="text-slate-500 text-[11px] mb-4">{thirdPlace ? thirdPlace.department : 'No record'}</p>
                                <div className="px-4 py-1.5 bg-white rounded-md border border-slate-100 text-sm font-bold text-slate-700 shadow-sm text-center mb-2 font-mono">
                                    {thirdPlace ? (thirdPlace.rewardPoints !== undefined ? thirdPlace.rewardPoints : 100) : 0} <span className="text-slate-400 font-normal">pts</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm mt-8">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                            <th className="p-4">Rank</th>
                                            <th className="p-4">Member</th>
                                            <th className="p-4">Department</th>
                                            <th className="p-4 text-right">Reward Pts</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-sm animate-fade-in">
                                        {sortedLeaderboardEmployees.map((emp, index) => {
                                            const pts = emp.rewardPoints !== undefined ? emp.rewardPoints : 100;
                                            const initials = getInitials(emp.firstName, emp.lastName);
                                            let bgClass = "bg-slate-200 text-slate-700";
                                            if (index === 0) bgClass = "bg-amber-500 text-amber-950 font-bold";
                                            else if (index === 1) bgClass = "bg-slate-300 text-slate-800 font-bold";
                                            else if (index === 2) bgClass = "bg-[#CD7F32] text-white font-bold";

                                            return (
                                                <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="p-4">
                                                        <div className="w-8 h-8 rounded-full border border-slate-200 bg-white text-slate-600 flex items-center justify-center font-bold text-sm">
                                                            {index + 1}
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-9 h-9 rounded-full ${bgClass} flex items-center justify-center font-bold text-sm shrink-0`}>
                                                                {initials}
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <p className="font-bold text-[#02275A]">{emp.firstName} {emp.lastName}</p>
                                                                    {emp.is_user_account && (
                                                                        <span className="px-1.5 py-0.5 bg-[#02275A]/10 text-[#02275A] text-[9px] font-bold rounded">YOU</span>
                                                                    )}
                                                                </div>
                                                                <p className="text-xs text-slate-500">{emp.role}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-slate-700 font-medium">{emp.department}</td>
                                                    <td className="p-4 text-right">
                                                        <span className="font-bold text-[#02275A] font-mono">{pts}</span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {sortedLeaderboardEmployees.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="p-8 text-center text-slate-400 font-medium">
                                                    No members found matching the criteria.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );
            })()}



            {/* View Employee Modal */}
            {viewEmployee && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in text-left">
                    <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                        
                        {/* Modal Header */}
                        <div className="bg-[#02275A] text-white p-6 pb-0 relative">
                            <button 
                                onClick={() => {
                                    setViewEmployee(null);
                                    setIsAddingGuarantor(false);
                                    setIsUploadingDoc(false);
                                    setIsEditingBank(false);
                                    setOpenedFromPerformance(false);
                                }} 
                                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                            >
                                <i className="fas fa-times text-white"></i>
                            </button>
                            
                            <div className="flex items-center gap-6 mb-6">
                                <div className="w-20 h-20 rounded-full bg-white text-[#02275A] flex items-center justify-center font-bold text-3xl shadow-lg border-2 border-[#02275A]">
                                    {viewEmployee.firstName[0]}{viewEmployee.lastName[0]}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-2xl font-bold">{viewEmployee.firstName} {viewEmployee.lastName}</h2>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                                            viewEmployee.status === 'Active' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' : 
                                            'bg-rose-500/20 text-rose-300 border-rose-500/50'
                                        }`}>
                                            {viewEmployee.status}
                                        </span>
                                        {viewEmployee.is_user_account && (
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border bg-blue-500/20 text-blue-300 border-blue-500/50 flex items-center gap-1">
                                                <i className="fas fa-desktop"></i> User Account
                                            </span>
                                        )}
                                        {viewEmployee.is_team_lead && (
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border bg-amber-500/20 text-amber-300 border-amber-500/50 flex items-center gap-1">
                                                <i className="fas fa-users-cog"></i> Team Lead
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-blue-200 mt-1">{viewEmployee.role} &bull; {viewEmployee.department}</p>
                                    <p className="text-xs text-blue-300 mt-1 font-mono tracking-wide">{viewEmployee.employeeId} &bull; {viewEmployee.country}</p>
                                </div>
                            </div>
                            
                            <div className="flex gap-2 overflow-x-auto custom-scrollbar no-scrollbar-desktop pt-2">
                                {['biodata', 'guarantors', 'documents', 'payroll', 'grades_audit'].filter(tab => !openedFromPerformance || tab === 'grades_audit').map(tab => (
                                    <button 
                                        key={tab}
                                        onClick={() => setModalTab(tab as any)}
                                        className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap capitalize ${
                                            modalTab === tab 
                                                ? 'border-white text-white' 
                                                : 'border-transparent text-blue-200 hover:text-white hover:bg-white/5'
                                        }`}
                                    >
                                        {tab === 'grades_audit' ? 'Grades & Penalties' : tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto bg-slate-50 p-6 custom-scrollbar">
                            
                            {/* BIODATA TAB */}
                            {modalTab === 'biodata' && (
                                <div className="space-y-6">
                                    <div className="bg-white p-5 space-y-4 rounded-xl border border-slate-200 shadow-sm">
                                        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2"><i className="fas fa-address-card text-blue-500 mr-2"></i> Personal Information</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            <div><p className="text-xs font-bold text-slate-400 mb-1">Date of Birth</p><p className="text-sm font-bold text-slate-800">{new Date(viewEmployee.dateOfBirth).toLocaleDateString()}</p></div>
                                            <div><p className="text-xs font-bold text-slate-400 mb-1">Gender</p><p className="text-sm font-bold text-slate-800">{viewEmployee.gender}</p></div>
                                            <div><p className="text-xs font-bold text-slate-400 mb-1">Marital Status</p><p className="text-sm font-bold text-slate-800">{viewEmployee.maritalStatus || 'N/A'}</p></div>
                                            
                                            <div><p className="text-xs font-bold text-slate-400 mb-1">Email</p><p className="text-sm font-bold text-slate-800">{viewEmployee.email}</p></div>
                                            <div><p className="text-xs font-bold text-slate-400 mb-1">Phone</p><p className="text-sm font-bold text-slate-800">{viewEmployee.phone}</p></div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 mb-1">National Identity No. (NIN)</p>
                                                <p className="text-sm font-bold text-slate-800 tracking-wide font-mono">{viewEmployee.nin || 'Not Provided'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-white p-5 space-y-4 rounded-xl border border-slate-200 shadow-sm">
                                        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2"><i className="fas fa-briefcase text-emerald-500 mr-2"></i> Employment Context</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            <div><p className="text-xs font-bold text-slate-400 mb-1">Hire Date</p><p className="text-sm font-bold text-slate-800">{new Date(viewEmployee.hireDate).toLocaleDateString()}</p></div>
                                            <div><p className="text-xs font-bold text-slate-400 mb-1">Branch / Location</p><p className="text-sm font-bold text-slate-800">{viewEmployee.city}, {viewEmployee.state}, {viewEmployee.country}</p></div>
                                            <div><p className="text-xs font-bold text-slate-400 mb-1">Emergency Contact</p>
                                                {viewEmployee.emergencyContact ? (
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-800">{viewEmployee.emergencyContact.name}</p>
                                                        <p className="text-xs text-slate-500">{viewEmployee.emergencyContact.relationship} • {viewEmployee.emergencyContact.phone}</p>
                                                    </div>
                                                ) : <p className="text-sm text-slate-500 italic">Not provided</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* GUARANTORS TAB */}
                            {modalTab === 'guarantors' && (
                                <div className="space-y-4 text-left">
                                    <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg text-sm flex items-start gap-3">
                                        <i className="fas fa-info-circle mt-0.5"></i>
                                        <p>Guarantor verification is critical for roles handling finances or customer data. Ensure background checks are completed before changing status.</p>
                                    </div>

                                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                                        <h3 className="font-bold text-slate-800"><i className="fas fa-user-shield text-[#02275A] mr-2"></i> Guarantors Information</h3>
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                setIsAddingGuarantor(!isAddingGuarantor);
                                                setGuarantorForm({
                                                    name: '',
                                                    phone: '',
                                                    email: '',
                                                    relationship: 'Uncle',
                                                    address: '',
                                                    verified: false
                                                });
                                            }}
                                            className="bg-[#02275A] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#02275A]/90 transition-colors flex items-center gap-1"
                                        >
                                            <i className={`fas ${isAddingGuarantor ? 'fa-times' : 'fa-plus'}`}></i> {isAddingGuarantor ? 'Cancel' : 'Add Guarantor'}
                                        </button>
                                    </div>

                                    {isAddingGuarantor && (
                                        <form onSubmit={(e) => {
                                            e.preventDefault();
                                            if (!guarantorForm.name || !guarantorForm.phone || !guarantorForm.relationship || !guarantorForm.address) {
                                                return;
                                            }
                                            const updatedEmployee = {
                                                ...viewEmployee,
                                                guarantors: [...(viewEmployee.guarantors || []), guarantorForm]
                                            };
                                            setViewEmployee(updatedEmployee);
                                            setEmployees(prev => prev.map(emp => emp.id === viewEmployee.id ? updatedEmployee : emp));
                                            setIsAddingGuarantor(false);
                                            showSuccess(`Guarantor "${guarantorForm.name}" added successfully.`);
                                        }} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 animate-fade-in text-slate-700">
                                            <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2">New Guarantor</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-600 mb-1">Full Name *</label>
                                                    <input required type="text" className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-[#02275A]" value={guarantorForm.name} onChange={v => setGuarantorForm({...guarantorForm, name: v.target.value})} />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-600 mb-1">Phone Number *</label>
                                                    <input required type="text" className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-[#02275A]" value={guarantorForm.phone} onChange={v => setGuarantorForm({...guarantorForm, phone: v.target.value})} />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-600 mb-1">Email</label>
                                                    <input type="email" className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-[#02275A]" value={guarantorForm.email || ''} onChange={v => setGuarantorForm({...guarantorForm, email: v.target.value})} />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-600 mb-1">Relationship *</label>
                                                    <select className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:border-[#02275A] focus:outline-none" value={guarantorForm.relationship} onChange={v => setGuarantorForm({...guarantorForm, relationship: v.target.value})}>
                                                        <option value="Uncle">Uncle</option>
                                                        <option value="Aunt">Aunt</option>
                                                        <option value="Father">Father</option>
                                                        <option value="Mother">Mother</option>
                                                        <option value="Spouse">Spouse</option>
                                                        <option value="Former Manager">Former Manager</option>
                                                        <option value="Former Colleague">Former Colleague</option>
                                                        <option value="Professional Reference">Professional Reference</option>
                                                        <option value="Family Friend">Family Friend</option>
                                                        <option value="Other">Other</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-600 mb-1">Home/Office Address *</label>
                                                <textarea required rows={2} className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-[#02275A]" value={guarantorForm.address} onChange={v => setGuarantorForm({...guarantorForm, address: v.target.value})} />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input id="guarantor_verified" type="checkbox" className="w-4 h-4 text-[#02275A] rounded border-slate-300 focus:ring-0" checked={guarantorForm.verified} onChange={v => setGuarantorForm({...guarantorForm, verified: v.target.checked})} />
                                                <label htmlFor="guarantor_verified" className="text-xs text-slate-600">Mark as verified (Background check passed)</label>
                                            </div>
                                            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                                                <button type="button" onClick={() => setIsAddingGuarantor(false)} className="px-4 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors">Cancel</button>
                                                <button type="submit" className="px-4 py-1.5 bg-[#02275A] text-white rounded-lg text-xs font-bold hover:bg-[#02275A]/90 transition-colors shadow-sm">Save Guarantor</button>
                                            </div>
                                        </form>
                                    )}
                                    
                                    {viewEmployee.guarantors && viewEmployee.guarantors.length > 0 ? (
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                            {viewEmployee.guarantors.map((guarantor, i) => (
                                                <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative text-left">
                                                    {guarantor.verified && (
                                                        <span className="absolute top-4 right-4 bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                                                            <i className="fas fa-check-circle"></i> Verified
                                                        </span>
                                                    )}
                                                    {!guarantor.verified && (
                                                        <span className="absolute top-4 right-4 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                                                            <i className="fas fa-clock"></i> Pending
                                                        </span>
                                                    )}
                                                    
                                                    <h4 className="font-bold text-slate-800 text-lg mb-1">{guarantor.name}</h4>
                                                    <p className="text-xs text-indigo-600 font-bold uppercase tracking-wide mb-4">{guarantor.relationship}</p>
                                                    
                                                    <div className="space-y-2 mt-4 text-sm text-slate-600">
                                                        <div className="flex gap-3"><i className="fas fa-phone mt-1 text-slate-400 w-4"></i> <span>{guarantor.phone}</span></div>
                                                        {guarantor.email && <div className="flex gap-3"><i className="fas fa-envelope mt-1 text-slate-400 w-4"></i> <span>{guarantor.email}</span></div>}
                                                        <div className="flex gap-3"><i className="fas fa-map-marker-alt mt-1 text-slate-400 w-4"></i> <span>{guarantor.address}</span></div>
                                                    </div>
                                                    
                                                    {!guarantor.verified && (
                                                        <button 
                                                            onClick={() => {
                                                                const updatedGuarantors = [...viewEmployee.guarantors];
                                                                updatedGuarantors[i] = { ...guarantor, verified: true };
                                                                const updatedEmployee = { ...viewEmployee, guarantors: updatedGuarantors };
                                                                setViewEmployee(updatedEmployee);
                                                                setEmployees(prev => prev.map(emp => emp.id === viewEmployee.id ? updatedEmployee : emp));
                                                                showSuccess(`Verification started for ${guarantor.name}. Mark as verified.`);
                                                            }}
                                                            className="mt-5 w-full bg-slate-50 border border-slate-200 text-slate-700 py-2 rounded-lg text-sm font-bold hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                                                        >
                                                            Mark as Verified
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 text-2xl mx-auto mb-3">
                                                <i className="fas fa-user-shield"></i>
                                            </div>
                                            <h4 className="font-bold text-slate-700">No Guarantors Recorded</h4>
                                            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">This employee has not provided guarantor information yet.</p>
                                            <button 
                                                onClick={() => {
                                                    setIsAddingGuarantor(true);
                                                    setGuarantorForm({
                                                        name: '',
                                                        phone: '',
                                                        email: '',
                                                        relationship: 'Uncle',
                                                        address: '',
                                                        verified: false
                                                    });
                                                }}
                                                className="mt-4 text-[#02275A] font-bold text-sm bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                                            >
                                                Add Guarantor Details
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* DOCUMENTS TAB */}
                            {modalTab === 'documents' && (
                                <div className="space-y-4 text-left">
                                    <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                        <h3 className="font-bold text-slate-800"><i className="fas fa-folder-open text-amber-500 mr-2"></i> Employee Folder</h3>
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                setIsUploadingDoc(!isUploadingDoc);
                                                setDocForm({
                                                    type: 'ID Card',
                                                    name: ''
                                                });
                                            }}
                                            className="bg-[#02275A] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#02275A]/90 transition-colors flex items-center gap-1"
                                        >
                                            <i className={`fas ${isUploadingDoc ? 'fa-times' : 'fa-cloud-upload-alt'}`}></i> {isUploadingDoc ? 'Cancel' : 'Upload New'}
                                        </button>
                                    </div>

                                    {isUploadingDoc && (
                                        <form onSubmit={(e) => {
                                            e.preventDefault();
                                            if (!docForm.name) return;
                                            const docToAdd: EmployeeDocument = {
                                                id: `doc-${Date.now()}`,
                                                type: docForm.type,
                                                name: docForm.name,
                                                status: 'Verified',
                                                uploadDate: new Date().toISOString().split('T')[0]
                                            };
                                            const updatedEmployee = {
                                                ...viewEmployee,
                                                documents: [...(viewEmployee.documents || []), docToAdd]
                                            };
                                            setViewEmployee(updatedEmployee);
                                            setEmployees(prev => prev.map(emp => emp.id === viewEmployee.id ? updatedEmployee : emp));
                                            setIsUploadingDoc(false);
                                            showSuccess(`Document "${docForm.name}" has been uploaded.`);
                                        }} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 animate-fade-in text-slate-700">
                                            <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Upload Employee Document</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-600 mb-1">Document Type *</label>
                                                    <select className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:border-[#02275A] focus:outline-none" value={docForm.type} onChange={v => setDocForm({...docForm, type: v.target.value as any})}>
                                                        <option value="ID Card">ID Card (National ID, Passport, Driver's License)</option>
                                                        <option value="Degree Certificate">Degree & Academy Certificate</option>
                                                        <option value="Resume">Resume / Curriculum Vitae</option>
                                                        <option value="Offer Letter">Signed Offer Letter</option>
                                                        <option value="Other">Other Document</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-600 mb-1">Document File Name *</label>
                                                    <input required type="text" placeholder="e.g. Passport_Copy.pdf or BSc_Degree.pdf" className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-[#02275A]" value={docForm.name} onChange={v => setDocForm({...docForm, name: v.target.value})} />
                                                </div>
                                            </div>
                                            
                                            {/* File dropzone mockup since we are frontend local state */}
                                            <div className="border-2 border-dashed border-slate-200 hover:border-[#02275A] rounded-xl p-6 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-50">
                                                <i className="fas fa-file-upload text-3xl text-slate-300"></i>
                                                <span className="text-xs text-slate-600 font-bold">Drag and drop file here, or click to browse</span>
                                                <span className="text-[10px] text-slate-400">PDF, JPG, PNG or DOCX up to 10MB</span>
                                            </div>

                                            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                                                <button type="button" onClick={() => setIsUploadingDoc(false)} className="px-4 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors">Cancel</button>
                                                <button type="submit" className="px-4 py-1.5 bg-[#02275A] text-white rounded-lg text-xs font-bold hover:bg-[#02275A]/90 transition-colors shadow-sm">Upload & Verify</button>
                                            </div>
                                        </form>
                                    )}
                                    
                                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                    <th className="p-4">Document Type</th>
                                                    <th className="p-4">Name</th>
                                                    <th className="p-4">Date Uploaded</th>
                                                    <th className="p-4">Status</th>
                                                    <th className="p-4 text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {viewEmployee.documents && viewEmployee.documents.length > 0 ? (
                                                    viewEmployee.documents.map(doc => (
                                                        <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                                                            <td className="p-4 text-sm font-bold text-slate-700">{doc.type}</td>
                                                            <td className="p-4 text-sm text-[#02275A] font-medium flex items-center gap-2">
                                                                <i className="fas fa-file-pdf text-rose-400"></i> {doc.name}
                                                            </td>
                                                            <td className="p-4 text-sm text-slate-500">{new Date(doc.uploadDate).toLocaleDateString()}</td>
                                                            <td className="p-4">
                                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                                                                    doc.status === 'Verified' ? 'bg-emerald-100 text-emerald-700' : 
                                                                    doc.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 
                                                                    'bg-rose-100 text-rose-700'
                                                                }`}>
                                                                    {doc.status}
                                                                </span>
                                                            </td>
                                                            <td className="p-4 text-right">
                                                                <button className="text-slate-400 hover:text-[#02275A] transition-colors"><i className="fas fa-download"></i></button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={5} className="p-8 text-center text-slate-500">
                                                            No documents have been uploaded for this employee.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* GRADES & PENALTIES AUDIT TAB */}
                            {modalTab === 'grades_audit' && (
                                <div className="space-y-6">
                                    {/* KPI Section */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in text-left">
                                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-center">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Current Academic Grade</p>
                                            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black shadow-inner border border-slate-200 ${
                                                viewEmployee.grade === 'A+' || viewEmployee.grade === 'A' ? 'bg-emerald-100 text-emerald-800' :
                                                viewEmployee.grade === 'B+' || viewEmployee.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                                                viewEmployee.grade === 'C' ? 'bg-amber-100 text-amber-800' :
                                                viewEmployee.grade === 'D' ? 'bg-orange-100 text-orange-800' :
                                                'bg-rose-100 text-rose-800'
                                            }`}>
                                                {viewEmployee.grade || 'B+'}
                                            </div>
                                            <p className="text-xs text-slate-400 mt-2">Overall Quality Rating</p>
                                        </div>

                                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-center">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Reward Points</p>
                                            <div className="mx-auto w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-xl font-black border border-amber-100 font-mono">
                                                {viewEmployee.rewardPoints !== undefined ? viewEmployee.rewardPoints : 100}
                                            </div>
                                            <p className="text-xs text-slate-400 mt-2">Separate Redeemable Metric</p>
                                        </div>

                                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-center">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Leaderboard Ranking</p>
                                            <div className="mx-auto w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-black border border-indigo-100 font-mono">
                                                {viewEmployee.leaderboardRank || 'N/A'}
                                            </div>
                                            <p className="text-xs text-slate-400 mt-2">Separate Performance Metric</p>
                                        </div>
                                    </div>

                                    {/* Notice instead of inline rating form, since we made rating independent */}
                                    {(userRole === 'admin' || userRole === 'hr' || ['team-lead', 'cx-head', 'customer-success', 'sales-manager', 'marketing-manager', 'finance', 'content-lead'].includes(userRole)) && (
                                        <div className="bg-[#02275A]/5 border border-[#02275A]/20 p-5 rounded-xl flex items-center justify-between gap-4 font-sans text-left animate-fade-in">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-full bg-[#02275A]/10 text-[#02275A] flex items-center justify-center shrink-0 mt-0.5 animate-pulse">
                                                    <i className="fas fa-star-half-stroke text-base"></i>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-[#02275A] text-sm md:text-base">Looking to Rate {viewEmployee.firstName}?</h4>
                                                    <p className="text-slate-500 text-xs mt-1 md:max-w-xl leading-relaxed">
                                                        Performance Rating and Grade configuration has been modernized and moved into its own dedicated, independent modal to keep evaluation workflow clean. Please close this history log view and click the <strong>Rate</strong> button in the team listing table instead.
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="hidden sm:inline-block px-3 py-1 bg-white border border-slate-200 text-[#02275A] font-bold text-xs rounded-lg shadow-xs overflow-hidden truncate max-w-[150px]">
                                                Independent Rate
                                            </span>
                                        </div>
                                    )}

                                    {/* Action Box: Log Approved Policy Infraction */}
                                    {!openedFromPerformance && (userRole === 'admin' || userRole === 'hr') && (
                                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 font-sans text-left text-slate-700">
                                            <div className="border-b border-slate-150 pb-3">
                                                <h3 className="font-bold text-[#02275A] text-lg flex items-center gap-2">
                                                    <i className="fas fa-gavel text-rose-500"></i> Log Approved Policy Breach & Apply Grade Reduction
                                                </h3>
                                                <p className="text-xs text-slate-450 mt-1">
                                                    Penalties must be logged in alignment with predefined quality and compliance policy specifications.
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Approved Policy Infraction</label>
                                                    <select 
                                                        value={selectedViolationCategory}
                                                        onChange={(e) => setSelectedViolationCategory(e.target.value)}
                                                        className="w-full px-4 py-2 bg-white border border-slate-200 text-slate-705 text-sm rounded-lg hover:border-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-[#02275A]/20"
                                                    >
                                                        <option value="Repeated Lateness">Repeated Lateness (Penalty: 1 Tier Downgrade)</option>
                                                        <option value="Attendance Violations">Attendance Violations (Penalty: 1 Tier Downgrade)</option>
                                                        <option value="Disciplinary Actions">Disciplinary Actions (Penalty: 2 Tiers Downgrade)</option>
                                                        <option value="Customer Complaints">Customer Complaints (Penalty: 1 Tier Downgrade)</option>
                                                        <option value="Performance Misconduct">Performance Misconduct (Penalty: 2 Tiers Downgrade)</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Approving Authority Title / Name</label>
                                                    <input 
                                                        type="text" 
                                                        value={policyApprover}
                                                        onChange={(e) => setPolicyApprover(e.target.value)}
                                                        className="w-full px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm rounded-lg hover:border-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-[#02275A]/20 font-medium" 
                                                        placeholder="e.g. Head of Customer Success"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Audit Brief & Incident Details</label>
                                                <textarea 
                                                    value={violationNotes}
                                                    onChange={(e) => setViolationNotes(e.target.value)}
                                                    rows={2}
                                                    placeholder="Write a clear statement of context justifying the policy enforcement and audit trail..."
                                                    className="w-full px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:outline-none focus:border-[#02275A] transition-colors"
                                                />
                                            </div>

                                            {(() => {
                                                const currentGrade = viewEmployee.grade || 'B+';
                                                const tierLevels = (selectedViolationCategory === 'Disciplinary Actions' || selectedViolationCategory === 'Performance Misconduct') ? 2 : 1;
                                                
                                                const gradesList: ('A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | 'F')[] = ['A+', 'A', 'B+', 'B', 'C', 'D', 'F'];
                                                const cg = (currentGrade || 'B+') as any;
                                                const currentIndex = gradesList.indexOf(cg);
                                                const nextIndex = currentIndex === -1 ? gradesList.length - 1 : Math.min(gradesList.length - 1, currentIndex + tierLevels);
                                                const nextGrade = gradesList[nextIndex];

                                                return (
                                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                        <div className="flex items-start gap-2.5">
                                                            <i className="fas fa-exclamation-triangle mt-1 text-amber-600 text-sm"></i>
                                                            <div>
                                                                <h5 className="font-bold text-amber-800 text-sm">Automatic Downgrade Prediction</h5>
                                                                <p className="text-xs text-amber-700 mt-0.5">
                                                                    Grade would drop from <span className="font-bold">{currentGrade}</span> to <span className="font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">{nextGrade}</span>. 
                                                                    ({tierLevels} Tier{tierLevels > 1 ? 's' : ''} Reduction).
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                if (!policyApprover.trim()) {
                                                                    alert('Please specify the Approving Authority.');
                                                                    return;
                                                                }
                                                                const prev = currentGrade;
                                                                const updatedGrade = nextGrade;
                                                                
                                                                const auditEntry: GradeAuditEntry = {
                                                                    id: Date.now().toString(),
                                                                    previousGrade: prev as any,
                                                                    newGrade: updatedGrade as any,
                                                                    policyResponsible: selectedViolationCategory,
                                                                    dateOfChange: new Date().toISOString().split('T')[0],
                                                                    approvingAuthority: policyApprover,
                                                                    reason: violationNotes.trim() || 'No notes specified.'
                                                                };

                                                                const updatedEmployee: Employee = {
                                                                    ...viewEmployee,
                                                                    grade: updatedGrade as any,
                                                                    gradeAuditTrail: [auditEntry, ...(viewEmployee.gradeAuditTrail || [])]
                                                                };

                                                                // Propagate to main React state
                                                                setEmployees(prevList => prevList.map(e => e.id === viewEmployee.id ? updatedEmployee : e));
                                                                // Update current view pointer
                                                                setViewEmployee(updatedEmployee);
                                                                // Clear notes
                                                                setViolationNotes('');
                                                                
                                                                showSuccess(`Grade reduced successfully! Created a secure audit record.`);
                                                            }}
                                                            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-black shadow-sm transition-colors cursor-pointer flex items-center gap-1 self-end md:self-auto uppercase tracking-wider"
                                                        >
                                                            <i className="fas fa-caret-down"></i> Apply Grade Penalty
                                                        </button>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    )}

                                    {/* Grade Reduction History Audit Trail */}
                                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm text-left">
                                        <div className="px-5 py-4 border-b border-slate-150 bg-slate-50 flex items-center justify-between">
                                            <h4 className="font-bold text-[#02275A] text-sm tracking-wide uppercase flex items-center gap-2">
                                                <i className="fas fa-history text-slate-500"></i> Quality Grade Audit Trail
                                            </h4>
                                            <span className="text-[10px] font-bold uppercase py-0.5 px-2 bg-slate-200 text-slate-700 rounded-full">
                                                {viewEmployee.gradeAuditTrail?.length || 0} entries
                                            </span>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-xs text-slate-700">
                                                <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase tracking-widest text-[9px]">
                                                    <tr>
                                                        <th className="px-5 py-3 font-bold text-left">Date</th>
                                                        <th className="px-5 py-3 font-bold text-center">Previous</th>
                                                        <th className="px-5 py-3 font-bold text-center">New Grade</th>
                                                        <th className="px-5 py-3 font-bold text-left">Policy Responsible</th>
                                                        <th className="px-5 py-3 font-bold text-left">Approving Authority</th>
                                                        <th className="px-5 py-3 font-bold text-left">Notes & Comments</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 font-medium font-sans">
                                                    {(viewEmployee.gradeAuditTrail || []).map((entry) => (
                                                        <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors">
                                                            <td className="px-5 py-3 text-slate-500 font-mono whitespace-nowrap">{entry.dateOfChange}</td>
                                                            <td className="px-5 py-3 text-center">
                                                                <span className="inline-block px-2 py-0.5 bg-slate-100 border border-slate-200 rounded font-bold text-slate-600">
                                                                    {entry.previousGrade}
                                                                </span>
                                                            </td>
                                                            <td className="px-5 py-3 text-center">
                                                                {(() => {
                                                                    const isPointOrScore = entry.newGrade.includes('Score:') || entry.newGrade.includes('Points:');
                                                                    let colorClass = "bg-rose-50 border-rose-200 text-rose-700"; // default for grade downgrade
                                                                    
                                                                    if (entry.policyResponsible === 'Performance Review' || entry.type === 'rating') {
                                                                        colorClass = "bg-emerald-50 border-emerald-200 text-emerald-800";
                                                                    } else if (isPointOrScore) {
                                                                        const prevNum = parseInt(entry.previousGrade.replace(/[^0-9-]/g, ''), 10);
                                                                        const newNum = parseInt(entry.newGrade.replace(/[^0-9-]/g, ''), 10);
                                                                        if (!isNaN(prevNum) && !isNaN(newNum)) {
                                                                            if (newNum > prevNum) {
                                                                                colorClass = "bg-emerald-50 border-emerald-200 text-emerald-700";
                                                                            } else if (newNum < prevNum) {
                                                                                colorClass = "bg-rose-50 border-rose-200 text-rose-700";
                                                                            } else {
                                                                                colorClass = "bg-slate-100 border-slate-200 text-slate-600";
                                                                            }
                                                                        } else {
                                                                            colorClass = "bg-indigo-50 border-indigo-200 text-indigo-700";
                                                                        }
                                                                    }
                                                                    
                                                                    return (
                                                                        <span className={`inline-block px-2 py-0.5 border rounded font-bold font-sans ${colorClass}`}>
                                                                            {entry.newGrade}
                                                                        </span>
                                                                    );
                                                                })()}
                                                            </td>
                                                            <td className="px-5 py-3 text-slate-900 font-semibold">{entry.policyResponsible}</td>
                                                            <td className="px-5 py-3 text-slate-600 italic font-mono text-[11px]">{entry.approvingAuthority}</td>
                                                            <td className="px-5 py-3 text-slate-500 font-normal max-w-[320px]">
                                                                <div className="font-sans text-xs space-y-1">
                                                                    <div><span className="font-semibold text-slate-700">Comments:</span> {entry.reason}</div>
                                                                    {entry.strengths && (
                                                                        <div className="text-emerald-800"><span className="font-semibold text-emerald-850">Strengths:</span> {entry.strengths}</div>
                                                                    )}
                                                                    {entry.recommendations && (
                                                                        <div className="text-amber-800"><span className="font-semibold text-amber-850">Growth Plan:</span> {entry.recommendations}</div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {(!viewEmployee.gradeAuditTrail || viewEmployee.gradeAuditTrail.length === 0) && (
                                                        <tr>
                                                            <td colSpan={6} className="text-center p-8 text-slate-405 font-medium">
                                                                No quality grade changes or penalties logged for this employee.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* PAYROLL TAB */}
                            {modalTab === 'payroll' && (
                                <div className="space-y-6 text-left">
                                    <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                        <h3 className="font-bold text-slate-800"><i className="fas fa-file-invoice-dollar text-[#02275A] mr-2"></i> Payroll & Bank Settings</h3>
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                if (!isEditingBank) {
                                                    // Populate state
                                                    setBankForm({
                                                        bankName: viewEmployee.bankName || '',
                                                        accountNumber: viewEmployee.accountNumber || '',
                                                        bvn: viewEmployee.bvn || '',
                                                        taxId: viewEmployee.taxId || '',
                                                        pfaName: viewEmployee.pfaName || '',
                                                        pensionNumber: viewEmployee.pensionNumber || '',
                                                        salary: viewEmployee.salary || 0,
                                                        currency: viewEmployee.currency || 'NGN'
                                                    });
                                                }
                                                setIsEditingBank(!isEditingBank);
                                            }}
                                            className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors flex items-center gap-1"
                                        >
                                            <i className={`fas ${isEditingBank ? 'fa-times' : 'fa-edit'}`}></i> {isEditingBank ? 'Cancel' : 'Edit Bank/Payroll Details'}
                                        </button>
                                    </div>

                                    {isEditingBank ? (
                                        <form onSubmit={(e) => {
                                            e.preventDefault();
                                            const updatedEmployee = {
                                                ...viewEmployee,
                                                bankName: bankForm.bankName,
                                                accountNumber: bankForm.accountNumber,
                                                bvn: bankForm.bvn,
                                                taxId: bankForm.taxId,
                                                pfaName: bankForm.pfaName,
                                                pensionNumber: bankForm.pensionNumber,
                                                salary: Number(bankForm.salary),
                                                currency: bankForm.currency
                                            };
                                            setViewEmployee(updatedEmployee);
                                            setEmployees(prev => prev.map(emp => emp.id === viewEmployee.id ? updatedEmployee : emp));
                                            setIsEditingBank(false);
                                            showSuccess(`Payroll and banking details updated successfully.`);
                                        }} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6 animate-fade-in text-slate-700">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4 border-b border-slate-100">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-600 mb-1">Gross Base Salary *</label>
                                                    <input required type="number" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-[#02275A]" value={bankForm.salary} onChange={v => setBankForm({...bankForm, salary: Number(v.target.value)})} />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-600 mb-1">Currency *</label>
                                                    <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-[#02275A] focus:outline-none" value={bankForm.currency} onChange={v => setBankForm({...bankForm, currency: v.target.value})}>
                                                        <option value="NGN">Nigerian Naira (NGN)</option>
                                                        <option value="GHS">Ghanaian Cedi (GHS)</option>
                                                        <option value="KES">Kenyan Shilling (KES)</option>
                                                        <option value="USD">US Dollar (USD)</option>
                                                        <option value="GBP">British Pound (GBP)</option>
                                                        <option value="EUR">Euro (EUR)</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Left Column: Bank Details */}
                                                <div className="space-y-4">
                                                    <h4 className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-1"><i className="fas fa-university text-indigo-500 mr-2"></i> Bank Details</h4>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-600 mb-1">Bank Name</label>
                                                        <input type="text" className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-[#02275A]" value={bankForm.bankName} onChange={v => setBankForm({...bankForm, bankName: v.target.value})} />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-600 mb-1">Account Number</label>
                                                        <input type="text" className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-[#02275A]" value={bankForm.accountNumber} onChange={v => setBankForm({...bankForm, accountNumber: v.target.value})} />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-600 mb-1">Bank Verification Number (BVN)</label>
                                                        <input type="text" className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-[#02275A]" value={bankForm.bvn} onChange={v => setBankForm({...bankForm, bvn: v.target.value})} />
                                                    </div>
                                                </div>

                                                {/* Right Column: Tax & Pension Details */}
                                                <div className="space-y-4">
                                                    <h4 className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-1"><i className="fas fa-file-invoice-dollar text-emerald-500 mr-2"></i> Tax & Pension</h4>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-600 mb-1">Tax ID Number (TIN)</label>
                                                        <input type="text" className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-[#02275A]" value={bankForm.taxId} onChange={v => setBankForm({...bankForm, taxId: v.target.value})} />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-600 mb-1">Pension Fund Administrator (PFA)</label>
                                                        <input type="text" className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-[#02275A]" value={bankForm.pfaName} onChange={v => setBankForm({...bankForm, pfaName: v.target.value})} />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-600 mb-1">Pension Number (PENCOM)</label>
                                                        <input type="text" className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-[#02275A]" value={bankForm.pensionNumber} onChange={v => setBankForm({...bankForm, pensionNumber: v.target.value})} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                                                <button type="button" onClick={() => setIsEditingBank(false)} className="px-5 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors">Cancel</button>
                                                <button type="submit" className="px-5 py-2 bg-[#02275A] text-white rounded-lg text-xs font-bold hover:bg-[#02275A]/90 transition-colors shadow-sm">Save Changes</button>
                                            </div>
                                        </form>
                                    ) : (
                                        <>
                                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Gross Base Pay</p>
                                                    <h3 className="text-2xl font-black text-slate-800">
                                                        {viewEmployee.currency} {viewEmployee.salary.toLocaleString()}
                                                    </h3>
                                                </div>
                                                <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-xl">
                                                    <i className="fas fa-money-bill-wave"></i>
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                                    <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4"><i className="fas fa-university text-indigo-500 mr-2"></i> Bank Details</h4>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <p className="text-xs font-bold text-slate-400 mb-1">Bank Name</p>
                                                            <p className="text-sm font-bold text-slate-800">{viewEmployee.bankName || 'Not Set'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-slate-400 mb-1">Account Number</p>
                                                            <p className="text-sm font-bold text-slate-800 font-mono tracking-wider">{viewEmployee.accountNumber || 'Not Set'}</p>
                                                        </div>
                                                        {viewEmployee.country === 'Nigeria' && (
                                                            <div>
                                                                <p className="text-xs font-bold text-slate-400 mb-1">Bank Verification Num (BVN)</p>
                                                                <p className="text-sm font-bold text-slate-800 font-mono tracking-wider">{viewEmployee.bvn || 'Not Set'}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                                    <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4"><i className="fas fa-file-invoice-dollar text-emerald-500 mr-2"></i> Tax & Pension</h4>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <p className="text-xs font-bold text-slate-400 mb-1">Tax ID Number (TIN)</p>
                                                            <p className="text-sm font-bold text-slate-800 font-mono tracking-wider">{viewEmployee.taxId || 'Not Set'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-slate-400 mb-1">Pension Fund Administrator (PFA)</p>
                                                            <p className="text-sm font-bold text-slate-800">{viewEmployee.pfaName || 'Not Set'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-slate-400 mb-1">Pension Number (PENCOM)</p>
                                                            <p className="text-sm font-bold text-slate-800 font-mono tracking-wider">{viewEmployee.pensionNumber || 'Not Set'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )}

            {/* Dedicated Rating Modal */}
            {ratingEmployee && (
                <div className="fixed inset-0 z-[75] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in text-left">
                    <div className="bg-white rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden border border-slate-105">
                        {/* Modal Header */}
                        <div className="bg-[#02275A] text-white p-6 relative">
                            <button 
                                type="button"
                                onClick={() => setRatingEmployee(null)} 
                                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                            >
                                <i className="fas fa-times text-white"></i>
                            </button>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-bold text-md text-white shrink-0">
                                    {ratingEmployee.firstName[0]}{ratingEmployee.lastName[0]}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-lg text-white truncate">Rate Performance: {ratingEmployee.firstName} {ratingEmployee.lastName}</h3>
                                    <p className="text-xs text-blue-200 mt-0.5 truncate">{ratingEmployee.role} &bull; {ratingEmployee.department} Team</p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            if (!reviewComments.trim()) {
                                alert('Please add review comments.');
                                return;
                            }
                            const prev = ratingEmployee.grade || 'B+';
                            const updatedGrade = ratingGrade;
                            
                            let raterTitle = "Team Lead";
                            if (userRole === 'admin') raterTitle = "Admin";
                            if (userRole === 'hr') raterTitle = "HR Manager";
                            if (userRole === 'customer-success' || userRole === 'cx-head') raterTitle = "Head of Customer Success";
                            if (userRole === 'sales-manager') raterTitle = "Sales Manager";
                            if (userRole === 'marketing-manager') raterTitle = "Marketing Manager";
                            if (userRole === 'content-lead') raterTitle = "Content Lead";
                            if (userRole === 'finance') raterTitle = "Finance Manager";

                            const auditEntry: GradeAuditEntry = {
                                id: Date.now().toString(),
                                previousGrade: prev as any,
                                newGrade: updatedGrade as any,
                                policyResponsible: 'Performance Review',
                                dateOfChange: new Date().toISOString().split('T')[0],
                                approvingAuthority: `${raterTitle} (${ratingEmployee.department})`,
                                reason: reviewComments.trim(),
                                strengths: strengths.trim() || 'No strengths specified.',
                                recommendations: recommendations.trim() || 'No recommendations specified.',
                                type: 'rating'
                            };

                            const updatedEmployee: Employee = {
                                ...ratingEmployee,
                                grade: updatedGrade as any,
                                gradeAuditTrail: [auditEntry, ...(ratingEmployee.gradeAuditTrail || [])],
                                lastReviewDate: new Date().toISOString().split('T')[0],
                                managerFeedback: reviewComments.trim()
                            };

                            setEmployees(prevList => prevList.map(e => e.id === ratingEmployee.id ? updatedEmployee : e));
                            setRatingEmployee(null);
                            
                            // Reset state
                            setReviewComments('');
                            setStrengths('');
                            setRecommendations('');
                            
                            showSuccess(`Performance rated successfully! Assigned Grade ${updatedGrade}.`);
                        }} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-707 uppercase mb-1.5">Configure Grade Rating</label>
                                    <select 
                                        value={ratingGrade}
                                        onChange={(e) => setRatingGrade(e.target.value as any)}
                                        className="w-full px-3.5 py-2 bg-white border border-slate-200 text-slate-700 text-sm rounded-lg hover:border-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-[#02275A]/20 font-medium cursor-pointer"
                                    >
                                        <option value="A+">A+ (Exceptional Performance)</option>
                                        <option value="A">A (Excellent Performance)</option>
                                        <option value="B+">B+ (Very Good Performance)</option>
                                        <option value="B">B (Good / Expected Performance)</option>
                                        <option value="C">C (Average / Needs Improvement)</option>
                                        <option value="D">D (Unsatisfactory Performance)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-707 uppercase mb-1.5">Rater Authority / Scope</label>
                                    <input 
                                        type="text" 
                                        disabled
                                        value={(() => {
                                            let prefix = "Team Lead";
                                            if (userRole === 'admin') prefix = "Administrator";
                                            if (userRole === 'hr') prefix = "HR Manager";
                                            if (userRole === 'customer-success' || userRole === 'cx-head') prefix = "Head of Customer Success";
                                            if (userRole === 'sales-manager') prefix = "Sales Manager";
                                            if (userRole === 'marketing-manager') prefix = "Marketing Manager";
                                            if (userRole === 'content-lead') prefix = "Content Lead";
                                            if (userRole === 'finance') prefix = "Finance Manager";
                                            return `${prefix} (Scoped: ${ratingEmployee.department} Team)`;
                                        })()}
                                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 text-slate-500 text-sm rounded-lg cursor-not-allowed font-medium font-sans" 
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-707 uppercase mb-1.5">Review Summary / Evaluation comments *</label>
                                <textarea 
                                    value={reviewComments}
                                    onChange={(e) => setReviewComments(e.target.value)}
                                    rows={3}
                                    required
                                    placeholder="Provide comprehensive review comments justifying the rating..."
                                    className="w-full px-3.5 py-2 bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-[#02275A]/20 transition-all font-sans"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-707 uppercase mb-1.5">Key Strengths</label>
                                    <textarea 
                                        value={strengths}
                                        onChange={(e) => setStrengths(e.target.value)}
                                        rows={2}
                                        placeholder="List key professional strengths..."
                                        className="w-full px-3.5 py-2 bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-[#02275A]/20 transition-all font-sans"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-707 uppercase mb-1.5">Improvement Recommendations</label>
                                    <textarea 
                                        value={recommendations}
                                        onChange={(e) => setRecommendations(e.target.value)}
                                        rows={2}
                                        placeholder="Suggest action items or training for future growth..."
                                        className="w-full px-3.5 py-2 bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-[#02275A]/20 transition-all font-sans"
                                    />
                                </div>
                            </div>

                            {/* Modal Footer actions */}
                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setRatingEmployee(null)}
                                    className="px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-[#02275A] hover:bg-[#0b3b82] text-white rounded-lg text-xs font-bold shadow-sm transition-colors cursor-pointer flex items-center gap-1.5 uppercase tracking-wider"
                                >
                                    <i className="fas fa-check-double text-[10px]"></i> Submit Rating
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Employee Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="bg-[#02275A] text-white p-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold">Add New Employee</h2>
                                <p className="text-blue-200 text-sm">Create a new HR record</p>
                            </div>
                            <button 
                                onClick={() => setIsAddModalOpen(false)} 
                                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <form onSubmit={handleAddEmployeeSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">First Name</label>
                                        <input required type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#02275A]" value={newEmployee.firstName} onChange={e => setNewEmployee({...newEmployee, firstName: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Last Name</label>
                                        <input required type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#02275A]" value={newEmployee.lastName} onChange={e => setNewEmployee({...newEmployee, lastName: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                                        <input required type="email" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#02275A]" value={newEmployee.email} onChange={e => setNewEmployee({...newEmployee, email: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Phone</label>
                                        <input required type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#02275A]" value={newEmployee.phone} onChange={e => setNewEmployee({...newEmployee, phone: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Role/Job Title</label>
                                        <input required type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#02275A]" value={newEmployee.role} onChange={e => setNewEmployee({...newEmployee, role: e.target.value})} />
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="block text-sm font-bold text-slate-700">Department</label>
                                            <button 
                                                type="button" 
                                                onClick={() => setIsAddingNewDept(!isAddingNewDept)} 
                                                className="text-xs text-blue-600 hover:text-blue-800 font-bold"
                                            >
                                                {isAddingNewDept ? 'Select Existing' : '+ Add Department'}
                                            </button>
                                        </div>
                                        {isAddingNewDept ? (
                                            <div className="flex gap-2">
                                                <input 
                                                    type="text" 
                                                    placeholder="Type new department" 
                                                    className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#02275A]" 
                                                    value={newDeptName} 
                                                    onChange={e => setNewDeptName(e.target.value)} 
                                                />
                                                <button 
                                                    type="button" 
                                                    onClick={() => {
                                                        const cleanDept = newDeptName.trim();
                                                        if (cleanDept) {
                                                            if (!departments.includes(cleanDept)) {
                                                                setDepartments(prev => [...prev, cleanDept]);
                                                            }
                                                            setNewEmployee({...newEmployee, department: cleanDept});
                                                            setIsAddingNewDept(false);
                                                            setNewDeptName('');
                                                            showSuccess(`Department "${cleanDept}" added.`);
                                                        }
                                                    }}
                                                    className="bg-blue-50 text-blue-600 border border-blue-200 px-3 py-2 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        ) : (
                                            <select 
                                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#02275A]" 
                                                value={newEmployee.department} 
                                                onChange={e => setNewEmployee({...newEmployee, department: e.target.value})}
                                            >
                                                {departments.map(dept => (
                                                    <option key={dept} value={dept}>{dept}</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Country</label>
                                        <select className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#02275A]" value={newEmployee.country} onChange={e => setNewEmployee({...newEmployee, country: e.target.value})}>
                                            <option value="Nigeria">Nigeria</option>
                                            <option value="Ghana">Ghana</option>
                                            <option value="Kenya">Kenya</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">City</label>
                                        <input required type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#02275A]" value={newEmployee.city} onChange={e => setNewEmployee({...newEmployee, city: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Date of Birth</label>
                                        <input type="date" required className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#02275A]" value={newEmployee.dateOfBirth} onChange={e => setNewEmployee({...newEmployee, dateOfBirth: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Hire Date</label>
                                        <input type="date" required className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#02275A]" value={newEmployee.hireDate} onChange={e => setNewEmployee({...newEmployee, hireDate: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Salary</label>
                                        <input required type="number" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#02275A]" value={newEmployee.salary} onChange={e => setNewEmployee({...newEmployee, salary: Number(e.target.value)})} />
                                    </div>
                                </div>
                                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                                    <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-5 py-2 rounded-lg font-bold text-slate-500 hover:bg-slate-100 transition-colors">Cancel</button>
                                    <button type="submit" className="bg-[#02275A] text-white px-5 py-2 rounded-lg font-bold shadow-md hover:bg-[#02275A]/90 transition-colors">Save Employee</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Department Modal */}
            {isAddDeptModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
                        <div className="bg-[#02275A] text-white p-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold">Create Department</h2>
                                <p className="text-blue-200 text-sm">Add a new department for employee allocation</p>
                            </div>
                            <button 
                                onClick={() => {
                                    setIsAddDeptModalOpen(false);
                                    setNewDeptFormName('');
                                }} 
                                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="p-6">
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const cleanDept = newDeptFormName.trim();
                                if (cleanDept) {
                                    if (!departments.includes(cleanDept)) {
                                        setDepartments(prev => [...prev, cleanDept]);
                                        showSuccess(`Department "${cleanDept}" created successfully.`);
                                    } else {
                                        showSuccess(`Department "${cleanDept}" already exists.`);
                                    }
                                    setIsAddDeptModalOpen(false);
                                    setNewDeptFormName('');
                                }
                            }} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Department Name *</label>
                                    <input 
                                        required 
                                        type="text" 
                                        placeholder="e.g., Marketing, QA, Security"
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#02275A]" 
                                        value={newDeptFormName} 
                                        onChange={e => setNewDeptFormName(e.target.value)} 
                                    />
                                </div>
                                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                                    <button 
                                        type="button" 
                                        onClick={() => {
                                            setIsAddDeptModalOpen(false);
                                            setNewDeptFormName('');
                                        }} 
                                        className="px-5 py-2 rounded-lg font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="bg-[#02275A] text-white px-5 py-2 rounded-lg font-bold shadow-md hover:bg-[#02275A]/90 transition-colors"
                                    >
                                        Create
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <AddGradeModal 
                isOpen={isAddGradeModalOpen} 
                onClose={() => setIsAddGradeModalOpen(false)} 
                onSuccess={(data) => {
                    console.log('Grade saved:', data);
                    setIsAddGradeModalOpen(false);
                }} 
            />

            <SetQuarterModal
                isOpen={isSetQuarterModalOpen}
                onClose={() => setIsSetQuarterModalOpen(false)}
                onSuccess={(data) => {
                    console.log('Quarter saved:', data);
                    setIsSetQuarterModalOpen(false);
                }}
            />

            {/* Add Policy Modal */}
            {isAddPolicyModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
                        <div className="bg-[#02275A] text-white p-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold">Add Policy</h2>
                                <p className="text-blue-200 text-sm">Create a new point policy</p>
                            </div>
                            <button 
                                onClick={() => setIsAddPolicyModalOpen(false)} 
                                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <form onSubmit={(e) => { e.preventDefault(); setIsAddPolicyModalOpen(false); /* Normally save logic here */ }} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Policy Name *</label>
                                    <input 
                                        required 
                                        type="text" 
                                        placeholder="e.g., Code Review Completion"
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#02275A]" 
                                        value={newPolicy.name} 
                                        onChange={e => setNewPolicy({...newPolicy, name: e.target.value})} 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Description *</label>
                                    <textarea 
                                        required 
                                        rows={3}
                                        placeholder="Detailed description of when this policy applies..."
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#02275A]" 
                                        value={newPolicy.description} 
                                        onChange={e => setNewPolicy({...newPolicy, description: e.target.value})} 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Point Impact *</label>
                                    <input 
                                        required 
                                        type="number" 
                                        placeholder="e.g., 10 for rewards, -5 for penalties"
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#02275A]" 
                                        value={newPolicy.impact} 
                                        onChange={e => setNewPolicy({...newPolicy, impact: e.target.value})} 
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Positive numbers for rewards, negative for penalties</p>
                                </div>
                                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                                    <button type="button" onClick={() => setIsAddPolicyModalOpen(false)} className="px-5 py-2 rounded-lg font-bold text-slate-500 hover:bg-slate-100 transition-colors">Cancel</button>
                                    <button type="submit" className="bg-[#02275A] text-white px-5 py-2 rounded-lg font-bold shadow-md hover:bg-[#02275A]/90 transition-colors">Save Policy</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Upload Policies Modal */}
            {isUploadPolicyOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 flex items-center justify-between border-b border-slate-100">
                            <div>
                                <h2 className="text-xl font-bold text-[#02275A]">Upload Policies</h2>
                            </div>
                            <button 
                                onClick={() => setIsUploadPolicyOpen(false)} 
                                className="w-8 h-8 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 flex items-center justify-center transition-colors"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-white">
                            <div className="flex bg-slate-50 border border-slate-100 rounded-lg p-1 w-fit mb-6 shadow-sm">
                                <button 
                                    onClick={() => setUploadPolicyTab('manual')}
                                    className={`px-5 py-2 text-sm transition-colors ${uploadPolicyTab === 'manual' ? 'font-bold bg-white text-[#02275A] rounded-md shadow-sm' : 'font-medium text-slate-500 hover:text-slate-800'}`}
                                >
                                    Manual Add
                                </button>
                                <button 
                                    onClick={() => setUploadPolicyTab('file')}
                                    className={`px-5 py-2 text-sm transition-colors ${uploadPolicyTab === 'file' ? 'font-bold bg-white text-[#02275A] rounded-md shadow-sm' : 'font-medium text-slate-500 hover:text-slate-800'}`}
                                >
                                    File Import
                                </button>
                            </div>

                            {uploadPolicyTab === 'manual' ? (
                                <div className="border-t border-slate-100">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                                <th className="py-4 px-2 w-[35%]">NAME</th>
                                                <th className="py-4 px-2">DESCRIPTION</th>
                                                <th className="py-4 px-2 w-32">POINTS</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {uploadPolicyRows.map(rowId => (
                                                <tr key={rowId}>
                                                    <td className="py-3 px-2">
                                                        <input 
                                                            type="text" 
                                                            placeholder="Policy name" 
                                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#02275A]"
                                                        />
                                                    </td>
                                                    <td className="py-3 px-2">
                                                        <input 
                                                            type="text" 
                                                            placeholder="Description..." 
                                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#02275A]"
                                                        />
                                                    </td>
                                                    <td className="py-3 px-2">
                                                        <input 
                                                            type="number" 
                                                            placeholder="0" 
                                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#02275A]"
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="p-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-4 text-[#02275A] text-2xl">
                                        <i className="fas fa-file-excel"></i>
                                    </div>
                                    <h3 className="font-bold text-slate-800 text-lg mb-1">Import Data via Template</h3>
                                    <p className="text-slate-500 text-sm mb-6 text-center max-w-md">Download our standard CSV template, fill in your policy records, and upload it here to import data in bulk.</p>
                                    <div className="flex gap-4">
                                        <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2">
                                            <i className="fas fa-download"></i> Download Template
                                        </button>
                                        <button className="px-5 py-2.5 bg-[#02275A] text-white rounded-lg text-sm font-bold shadow-md hover:bg-[#02275A]/90 transition-colors flex items-center gap-2">
                                            <i className="fas fa-upload"></i> Browse Files
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="p-6 border-t border-slate-100 bg-white flex items-center justify-between">
                            {uploadPolicyTab === 'manual' ? (
                                <button 
                                    className="flex items-center gap-2 text-sm font-bold text-[#02275A] hover:text-[#0b3b82] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={() => {
                                        if (uploadPolicyRows.length < 20) {
                                            setUploadPolicyRows([...uploadPolicyRows, Math.max(0, ...uploadPolicyRows) + 1]);
                                        }
                                    }}
                                    disabled={uploadPolicyRows.length >= 20}
                                >
                                    <i className="fas fa-plus"></i>
                                    Add Row
                                    <span className="text-slate-400 font-medium ml-1">({uploadPolicyRows.length}/20)</span>
                                </button>
                            ) : <div></div>}
                            <button 
                                className="px-6 py-2.5 bg-[#0b132b] text-white rounded-lg text-sm font-bold shadow-md hover:bg-[#1a2b54] transition-colors"
                                onClick={() => {
                                    setIsUploadPolicyOpen(false);
                                    setUploadPolicyRows([1]);
                                }}
                            >
                                Save All
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Update Points Modal */}
            {isUpdatePointsModalOpen && (
                <div role="dialog" aria-modal="true" className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col font-sans">
                        <div className="bg-[#02275A] text-white p-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold">Update Points</h2>
                                <p className="text-blue-200 text-sm">Reward achievements or record policy violations</p>
                            </div>
                            <button 
                                onClick={() => setIsUpdatePointsModalOpen(false)} 
                                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors focus:outline-none"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
                            {/* Choose Defined Policy/Reward Dropdown */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">
                                    choose defined policy or reward
                                </label>
                                <select 
                                    value={selectedDefinedPolicy}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setSelectedDefinedPolicy(val);
                                        if (val !== 'custom') {
                                            const found = [
                                                { name: 'Documentation Hero', points: 5, type: 'reward' as const, desc: 'Creating technical guides for features' },
                                                { name: 'Early Delivery', points: 5, type: 'reward' as const, desc: 'Per 24 hours ahead of schedule' },
                                                { name: 'Proactive Warning', points: 5, type: 'reward' as const, desc: 'Flagging a delay >72 hours in advance' },
                                                { name: 'Product addition', points: 10, type: 'reward' as const, desc: 'Production addition' },
                                                { name: 'Urgent Review SLA Met', points: 5, type: 'reward' as const, desc: 'Meeting urgent review SLA (Reviewer)' },
                                                { name: 'Zero-Bug Release', points: 10, type: 'reward' as const, desc: 'Awarded after 48hrs in production with no bugs' },
                                                { name: 'Repeated Lateness', points: -5, type: 'performance' as const, desc: 'Repeated lateness policy enforcement' },
                                                { name: 'Attendance Violations', points: -10, type: 'performance' as const, desc: 'Attendance policy infraction' },
                                                { name: 'Disciplinary Actions', points: -15, type: 'performance' as const, desc: 'Disciplinary behavior enforcement' },
                                                { name: 'Customer Complaints', points: -5, type: 'performance' as const, desc: 'Validated customer service complaint' },
                                                { name: 'Performance Misconduct', points: -20, type: 'performance' as const, desc: 'Performance misconduct penalty' },
                                            ].find(p => p.name === val);
                                            
                                            if (found) {
                                                setUpdatePointsFormVal(String(found.points));
                                                setUpdatePointsFormType(found.type);
                                                setUpdatePointsFormReason(found.desc);
                                            }
                                        }
                                    }}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-[#02275A] bg-white font-sans"
                                >
                                    <option value="custom">-- Custom Point Update --</option>
                                    {updatePointsFormType === 'reward' && (
                                        <>
                                            <option value="zero-bug" disabled className="font-bold text-slate-400 bg-slate-100">--- Rewards ---</option>
                                            <option value="Documentation Hero">🌟 Documentation Hero (+5 pts)</option>
                                            <option value="Early Delivery">🌟 Early Delivery (+5 pts)</option>
                                            <option value="Proactive Warning">🌟 Proactive Warning (+5 pts)</option>
                                            <option value="Product addition">🌟 Product addition (+10 pts)</option>
                                            <option value="Urgent Review SLA Met">🌟 Urgent Review SLA Met (+5 pts)</option>
                                            <option value="Zero-Bug Release">🌟 Zero-Bug Release (+10 pts)</option>
                                        </>
                                    )}
                                    {updatePointsFormType === 'performance' && (
                                        <>
                                            <option value="repeated-late" disabled className="font-bold text-slate-400 bg-slate-100">--- Violations & Penalties ---</option>
                                            <option value="Repeated Lateness">⚙️ Repeated Lateness (-5 pts)</option>
                                            <option value="Attendance Violations">⚙️ Attendance Violations (-10 pts)</option>
                                            <option value="Disciplinary Actions">⚙️ Disciplinary Actions (-15 pts)</option>
                                            <option value="Customer Complaints">⚙️ Customer Complaints (-5 pts)</option>
                                            <option value="Performance Misconduct">⚙️ Performance Misconduct (-20 pts)</option>
                                        </>
                                    )}
                                </select>
                            </div>

                            {/* Select User */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">
                                    Select User *
                                </label>
                                <select 
                                    required
                                    value={updatePointsFormUser}
                                    onChange={(e) => setUpdatePointsFormUser(e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-[#02275A] bg-white font-sans"
                                >
                                    <option value="">Choose a user...</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} [{emp.department}]</option>
                                    ))}
                                </select>
                            </div>

                            {/* Type (Performance vs Reward) */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 font-sans">
                                    Type *
                                </label>
                                <div className="grid grid-cols-2 gap-3 font-sans">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setUpdatePointsFormType('performance');
                                            setSelectedDefinedPolicy('custom');
                                            setUpdatePointsFormVal('');
                                            setUpdatePointsFormReason('');
                                        }}
                                        className={`flex items-center justify-center gap-2 p-3 border rounded-xl font-bold text-sm transition-all focus:outline-none ${updatePointsFormType === 'performance' ? 'border-rose-300 bg-rose-50 text-rose-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                    >
                                        <i className="fas fa-gavel"></i> Policy Violation
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setUpdatePointsFormType('reward');
                                            setSelectedDefinedPolicy('custom');
                                            setUpdatePointsFormVal('');
                                            setUpdatePointsFormReason('');
                                        }}
                                        className={`flex items-center justify-center gap-2 p-3 border rounded-xl font-bold text-sm transition-all focus:outline-none ${updatePointsFormType === 'reward' ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                    >
                                        <i className="fas fa-star"></i> Reward
                                    </button>
                                </div>
                            </div>

                            {/* Points Input */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">
                                    Points *
                                </label>
                                <input 
                                    required
                                    type="number"
                                    placeholder="e.g. -5"
                                    value={updatePointsFormVal}
                                    onChange={(e) => setUpdatePointsFormVal(e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#02275A] text-sm font-mono"
                                />
                            </div>

                            {/* Reason Input */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">
                                    Reason *
                                </label>
                                <textarea 
                                    required
                                    rows={3}
                                    placeholder="Explain why you're applying these points..."
                                    value={updatePointsFormReason}
                                    onChange={(e) => setUpdatePointsFormReason(e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#02275A] text-sm font-sans"
                                />
                            </div>

                            {/* Evidence Screenshot */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">
                                    Evidence Screenshot (optional)
                                </label>
                                <div className="border border-dashed border-slate-200 rounded-lg p-4 bg-slate-50 text-center relative hover:bg-slate-100/50 transition-colors cursor-pointer">
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                if (file.size > 5 * 1024 * 1024) {
                                                    alert("File size exceeds 5MB.");
                                                    return;
                                                }
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setUpdatePointsFormScreenshot(reader.result as string);
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                    />
                                    {updatePointsFormScreenshot ? (
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <img src={updatePointsFormScreenshot} alt="Evidence" className="max-h-24 rounded-lg object-contain shadow-sm" />
                                            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                                                <i className="fas fa-check-circle"></i> Screenshot Attached (Click to change)
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-slate-600">Attach Screenshot</p>
                                            <p className="text-xs text-slate-400">Max 5MB. JPEG, PNG, GIF, or WebP.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Submit Actions */}
                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
                            <button 
                                type="button" 
                                onClick={() => setIsUpdatePointsModalOpen(false)} 
                                className="px-5 py-2.5 rounded-lg text-sm font-bold text-slate-500 hover:bg-slate-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="button" 
                                onClick={() => {
                                    if (!updatePointsFormUser) {
                                        alert("Please select a user.");
                                        return;
                                    }
                                    const parsedPoints = parseInt(updatePointsFormVal, 10);
                                    if (isNaN(parsedPoints)) {
                                        alert("Please enter valid points.");
                                        return;
                                    }
                                    if (!updatePointsFormReason.trim()) {
                                        alert("Please enter a reason.");
                                        return;
                                    }

                                    // Update State
                                    setEmployees(prev => prev.map(emp => {
                                        if (emp.id === updatePointsFormUser) {
                                            const isPerf = updatePointsFormType === 'performance';
                                            const previousVal = isPerf 
                                                ? `Score: ${emp.performanceScore ?? 100}` 
                                                : `Points: ${emp.rewardPoints ?? 100}`;
                                                
                                            let newScore = emp.performanceScore ?? 100;
                                            let newPoints = emp.rewardPoints ?? 100;
                                            let newVal = '';
                                            
                                            if (isPerf) {
                                                newScore = Math.max(0, Math.min(100, newScore + parsedPoints));
                                                newVal = `Score: ${newScore}`;
                                            } else {
                                                newPoints = newPoints + parsedPoints;
                                                newVal = `Points: ${newPoints}`;
                                            }

                                            // Determine policy responsible label
                                            const policyResponsible = selectedDefinedPolicy === 'custom'
                                                ? (isPerf ? 'Policy Violation' : 'Reward Achievement')
                                                : selectedDefinedPolicy;

                                            const auditEntry: GradeAuditEntry = {
                                                id: Date.now().toString(),
                                                previousGrade: previousVal,
                                                newGrade: newVal,
                                                policyResponsible: policyResponsible,
                                                dateOfChange: new Date().toISOString().split('T')[0],
                                                approvingAuthority: 'Admin / HR',
                                                reason: `${updatePointsFormReason.trim()} (${parsedPoints > 0 ? '+' : ''}${parsedPoints} pts)`
                                            };

                                            const updatedEmp = {
                                                ...emp,
                                                performanceScore: newScore,
                                                rewardPoints: newPoints,
                                                gradeAuditTrail: [auditEntry, ...(emp.gradeAuditTrail || [])]
                                            };

                                            if (viewEmployee && viewEmployee.id === emp.id) {
                                                setViewEmployee(updatedEmp);
                                            }

                                            return updatedEmp;
                                        }
                                        return emp;
                                    }));

                                    showSuccess(`Successfully applied feedback of ${parsedPoints} points to user.`);
                                    setIsUpdatePointsModalOpen(false);
                                }}
                                className="px-6 py-2.5 bg-[#02275A] hover:bg-[#0b3b82] text-white rounded-lg text-sm font-bold shadow-md transition-colors font-sans"
                            >
                                Apply {isNaN(parseInt(updatePointsFormVal, 10)) ? 0 : parseInt(updatePointsFormVal, 10)} Points
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminHRCenterView;

