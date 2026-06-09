import React, { useState } from 'react';
import { useAlert } from '../contexts/AlertContext';
import { UserRole } from '../types';
import { initialEmployees } from './AdminHRCenterView';

interface User {
    id: string;
    employeeId?: string; // Links back to HR Employee profile
    name: string;
    email: string;
    roleId: string;
    status: 'Active' | 'Inactive' | 'Suspended';
    lastLogin: string;
}

interface PermissionCategory {
    name: string;
    description: string;
    actions: { id: string; name: string }[];
}

interface Role {
    id: string;
    name: string;
    type: 'default' | 'custom';
    description: string;
    permissions: string[]; // List of action ids
    userCount: number;
}

const PERMISSION_CATEGORIES: PermissionCategory[] = [
    {
        name: 'Dashboard & System',
        description: 'Core dashboard access and system-wide settings.',
        actions: [
            { id: 'dashboard.view', name: 'View Overview Dashboard' },
            { id: 'settings.view', name: 'View System Settings' },
            { id: 'settings.manage', name: 'Manage System Settings' },
            { id: 'audit_logs.view', name: 'View Audit Logs' },
            { id: 'ceo.dashboard', name: 'CEO Command Center Access' }
        ]
    },
    {
        name: 'User Management',
        description: 'Manage internal users, managers, and agents.',
        actions: [
            { id: 'users.view', name: 'View Users' },
            { id: 'users.create', name: 'Create Users' },
            { id: 'users.edit', name: 'Edit Users' },
            { id: 'users.delete', name: 'Delete Users' },
            { id: 'users.suspend', name: 'Suspend/Activate Users' },
            { id: 'roles.manage', name: 'Manage Roles & Permissions' }
        ]
    },
    {
        name: 'Sales & Leads',
        description: 'Access to lead generation, trials, and conversion.',
        actions: [
            { id: 'leads.view', name: 'View Leads & Trials' },
            { id: 'leads.view_all', name: 'View All Leads (Global)' },
            { id: 'leads.create', name: 'Create Leads' },
            { id: 'leads.assign', name: 'Assign Leads to Agents' },
            { id: 'leads.convert', name: 'Convert Leads/Trials' },
            { id: 'leads.export', name: 'Export Leads Data' }
        ]
    },
    {
        name: 'Customer Success',
        description: 'Manage active businesses, retention, and health scores.',
        actions: [
            { id: 'customers.view', name: 'View Customer Business Data' },
            { id: 'customers.view_all', name: 'View All Customers (Global)' },
            { id: 'customers.edit', name: 'Edit Customer Details' },
            { id: 'customers.health', name: 'View Health & Engagement Scores' },
            { id: 'customers.actions', name: 'Log Check-ins & Actions' }
        ]
    },
    {
        name: 'Support & Tickets',
        description: 'Helpdesk and customer complaints resolution.',
        actions: [
            { id: 'tickets.view', name: 'View Support Tickets' },
            { id: 'tickets.reply', name: 'Reply to Tickets' },
            { id: 'tickets.resolve', name: 'Resolve & Close Tickets' },
            { id: 'tickets.delete', name: 'Delete Tickets' },
            { id: 'complaints.view', name: 'View Complaints' }
        ]
    },
    {
        name: 'Knowledgebase & Content',
        description: 'Knowledgebase and resource center access.',
        actions: [
            { id: 'knowledgebase.view', name: 'View Knowledgebase' },
            { id: 'knowledgebase.manage', name: 'Manage Knowledgebase' },
            { id: 'content.view', name: 'View Resource Center' },
            { id: 'content.manage', name: 'Manage Resource/Content' }
        ]
    },
    {
        name: 'Finance & Billing',
        description: 'Invoicing, expenses, commissions, and revenue.',
        actions: [
            { id: 'finance.view', name: 'View General Financials' },
            { id: 'invoices.manage', name: 'Manage Invoices & Billing' },
            { id: 'expenses.approve', name: 'Approve System Expenses' },
            { id: 'commissions.manage', name: 'Manage Agent Commissions' },
            { id: 'pricing.manage', name: 'Manage SaaS Pricing & Plans' },
            { id: 'payroll.manage', name: 'Manage Payroll' }
        ]
    },
    {
        name: 'HR & Employee Records',
        description: 'Employee Human Resource records.',
        actions: [
            { id: 'hr.self', name: 'View Own Employee HR Data' },
            { id: 'hr.manage', name: 'Manage All HR Records' },
            { id: 'performance.team', name: 'Team Leads Performance Access' }
        ]
    },
    {
        name: 'Analytics & Reporting',
        description: 'Access to performance data and business intelligence.',
        actions: [
            { id: 'reports.view', name: 'View Standard Reports' },
            { id: 'reports.advanced', name: 'View Advanced Enterprise Analytics' },
            { id: 'reports.export', name: 'Export Reports (CSV/PDF)' },
            { id: 'salesdata.view', name: 'View Sales Data' }
        ]
    }
];

const DEFAULT_ROLES: Role[] = [
    { id: 'role-super-admin', name: 'Super Admin', type: 'default', description: 'Highest-level system role. Unlimited access across the entire system. Full CRUD access, role management, and delete capabilities.', permissions: PERMISSION_CATEGORIES.flatMap(c => c.actions.map(a => a.id)), userCount: 1 },
    { id: 'role-admin', name: 'Admin', type: 'default', description: 'System administrator with broad operational control. Access to all system permissions and CEO Command Center. Restricted from permanent deletion.', permissions: PERMISSION_CATEGORIES.flatMap(c => c.actions.map(a => a.id)).filter(id => !id.includes('.delete') && id !== 'ceo.dashboard'), userCount: 2 },
    { id: 'role-head-cx', name: 'Head of Customer Experience', type: 'default', description: 'Oversees customer satisfaction. Access to all customers, success center, knowledge base, complaints, team performance tracking, and own HR features.', permissions: ['hr.self', 'customers.view', 'customers.view_all', 'customers.health', 'customers.actions', 'knowledgebase.manage', 'knowledgebase.view', 'complaints.view', 'tickets.view', 'tickets.reply', 'tickets.resolve', 'performance.team'], userCount: 1 },
    { id: 'role-sales-manager', name: 'Sales Manager', type: 'default', description: 'Oversees sales operations. Access to all leads, customers, sales dashboard, resource center, team performance tracking, and own HR features.', permissions: ['hr.self', 'customers.view', 'customers.view_all', 'salesdata.view', 'leads.view', 'leads.view_all', 'content.view', 'performance.team', 'leads.assign'], userCount: 4 },
    { id: 'role-marketing-manager', name: 'Marketing Manager', type: 'default', description: 'Manages marketing campaigns. Access to sales data, all leads, customers, resource center, team performance tracking, and own HR features.', permissions: ['hr.self', 'customers.view', 'customers.view_all', 'salesdata.view', 'leads.view', 'leads.view_all', 'content.view', 'performance.team'], userCount: 3 },
    { id: 'role-finance', name: 'Finance', type: 'default', description: 'Manages company financial operations. Access to finance center, commissions, payroll, customer data, financial reports, and own HR features.', permissions: ['hr.self', 'finance.view', 'invoices.manage', 'expenses.approve', 'commissions.manage', 'payroll.manage', 'customers.view'], userCount: 5 },
    { id: 'role-content-lead', name: 'Content Lead', type: 'default', description: 'Manages training and internal content. Access to resource center to upload materials, internal documentation, and own HR features.', permissions: ['hr.self', 'content.view', 'content.manage'], userCount: 2 },
    { id: 'role-customer-success', name: 'Customer Success', type: 'default', description: 'Handles onboarding, retention, and customer relationships. Access to assigned customers, success center, engagement tracking, and own HR features.', permissions: ['hr.self', 'customers.view', 'customers.edit', 'customers.health', 'customers.actions'], userCount: 12 },
    { id: 'role-support-staff', name: 'Support Staff', type: 'default', description: 'Handles customer complaints and tickets. Access to customer module, knowledge base, complaints, tickets resolution, and own HR features.', permissions: ['hr.self', 'customers.view', 'knowledgebase.view', 'tickets.view', 'tickets.reply', 'tickets.resolve', 'complaints.view'], userCount: 20 },
    { id: 'role-team-lead', name: 'Team Lead', type: 'default', description: 'Manages a department/team. Access to team performance dashboard, team KPI tracking, attendance, resource center, and own HR features.', permissions: ['hr.self', 'performance.team'], userCount: 8 },
    { id: 'role-call-agent', name: 'Call Agent', type: 'default', description: 'Handles lead follow-up. Access to own assigned leads, own assigned customers, call history, and own HR features. Restricted from global leads.', permissions: ['hr.self', 'leads.view', 'customers.view', 'leads.create'], userCount: 45 },
    { id: 'role-employee', name: 'Employee', type: 'default', description: 'Basic staff account for all employees. Access to own HR features, personal dashboard and profile. Cannot manage other employees or access business modules.', permissions: ['hr.self'], userCount: 50 },
];

const AdminUsersView: React.FC = () => {
    const { showSuccess, showError } = useAlert();
    const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
    
    // User State
    const [users, setUsers] = useState<User[]>([
        { id: '1', employeeId: 'EMP-NG-002', name: 'Ada Eze', email: 'a.eze@company.com', roleId: 'role-employee', status: 'Active', lastLogin: '2 mins ago' },
        { id: '2', employeeId: 'EMP-NG-001', name: 'Chinedu Okafor', email: 'c.okafor@company.com', roleId: 'role-sales-manager', status: 'Active', lastLogin: '1 hour ago' },
        { id: '3', employeeId: 'EMP-KE-002', name: 'Aisha Omondi', email: 'a.omondi@company.com', roleId: 'role-admin', status: 'Active', lastLogin: 'Just now' },
        { id: '4', employeeId: 'EMP-GH-002', name: 'Kwame Osei', email: 'k.osei@company.com', roleId: 'role-team-lead', status: 'Active', lastLogin: '2 weeks ago' },
    ]);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [newUser, setNewUser] = useState({ employeeId: '', name: '', email: '', roleId: 'role-employee', password: '' });

    // Role State
    const [roles, setRoles] = useState<Role[]>([...DEFAULT_ROLES]);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [newRole, setNewRole] = useState<Role>({ id: '', name: '', type: 'custom', description: '', permissions: [], userCount: 0 });

    const openUserModal = (user?: User) => {
        if (user) {
            setEditingUserId(user.id);
            setNewUser({
                employeeId: user.employeeId || '',
                name: user.name,
                email: user.email,
                roleId: user.roleId,
                password: '' 
            });
        } else {
            setEditingUserId(null);
            setNewUser({ employeeId: '', name: '', email: '', roleId: 'role-employee', password: '' });
        }
        setIsUserModalOpen(true);
    };

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingUserId) {
            const originalUser = users.find(u => u.id === editingUserId);
            
            // Adjust role counts if the role changed
            if (originalUser && originalUser.roleId !== newUser.roleId) {
                setRoles(roles.map(r => {
                    if (r.id === originalUser.roleId) return { ...r, userCount: Math.max(0, r.userCount - 1) };
                    if (r.id === newUser.roleId) return { ...r, userCount: r.userCount + 1 };
                    return r;
                }));
            }
            
            setUsers(users.map(u => 
                u.id === editingUserId 
                    ? { ...u, name: newUser.name, email: newUser.email, roleId: newUser.roleId, employeeId: newUser.employeeId }
                    : u
            ));
            showSuccess(`User ${newUser.name} updated successfully.`);
        } else {
            const user: User = {
                id: Date.now().toString(),
                employeeId: newUser.employeeId,
                name: newUser.name,
                email: newUser.email,
                roleId: newUser.roleId,
                status: 'Active',
                lastLogin: 'Never',
            };
            setUsers([...users, user]);
            setRoles(roles.map(r => r.id === newUser.roleId ? { ...r, userCount: r.userCount + 1 } : r));
            showSuccess(`User ${newUser.name} created successfully.`);
        }
        
        setIsUserModalOpen(false);
        setEditingUserId(null);
        setNewUser({ employeeId: '', name: '', email: '', roleId: 'role-employee', password: '' });
    };

    const handleDeleteUser = (id: string, roleId: string) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            setUsers(users.filter(u => u.id !== id));
            setRoles(roles.map(r => r.id === roleId ? { ...r, userCount: Math.max(0, r.userCount - 1) } : r));
            showSuccess('User deleted successfully.');
        }
    };

    const handleSaveRole = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRole.name.trim()) return;

        if (editingRole) {
            setRoles(roles.map(r => r.id === editingRole.id ? newRole : r));
            showSuccess(`Role ${newRole.name} updated successfully.`);
        } else {
            const role: Role = {
                ...newRole,
                id: `role-custom-${Date.now()}`,
                type: 'custom',
                userCount: 0
            };
            setRoles([...roles, role]);
            showSuccess(`Custom Role ${role.name} created successfully.`);
        }
        setIsRoleModalOpen(false);
    };

    const handleDeleteRole = (id: string) => {
        const role = roles.find(r => r.id === id);
        if (role?.type === 'default') {
            showError('Cannot delete default system roles.');
            return;
        }
        if (role && role.userCount > 0) {
            showError(`Cannot delete role. There are ${role.userCount} users assigned to it.`);
            return;
        }
        if (window.confirm('Are you sure you want to delete this custom role?')) {
            setRoles(roles.filter(r => r.id !== id));
            showSuccess('Role deleted successfully.');
        }
    };

    const openRoleModal = (role?: Role) => {
        if (role) {
            setEditingRole(role);
            setNewRole({ ...role });
        } else {
            setEditingRole(null);
            setNewRole({ id: '', name: '', type: 'custom', description: '', permissions: [], userCount: 0 });
        }
        setIsRoleModalOpen(true);
    };

    const togglePermission = (permId: string) => {
        if (newRole.type === 'default' && newRole.id === 'role-super-admin') return; // Cannot edit super admin
        setNewRole(prev => {
            const perms = prev.permissions.includes(permId)
                ? prev.permissions.filter(p => p !== permId)
                : [...prev.permissions, permId];
            return { ...prev, permissions: perms };
        });
    };

    const getRoleName = (roleId: string) => roles.find(r => r.id === roleId)?.name || 'Unknown Role';
    const getRoleType = (roleId: string) => roles.find(r => r.id === roleId)?.type || 'custom';

    return (
        <div className="p-6 animate-fade-in space-y-6 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">User & Role Management</h1>
                    <p className="text-sm text-slate-500">Enterprise-grade access control. Manage users and define granular roles.</p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 shadow-inner">
                    <button 
                        onClick={() => setActiveTab('users')}
                        className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-white text-[#02275A] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        <i className="fas fa-users mr-1"></i> Users Overview
                    </button>
                    <button 
                        onClick={() => setActiveTab('roles')}
                        className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'roles' ? 'bg-white text-[#02275A] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        <i className="fas fa-shield-alt mr-1"></i> Roles & Permissions
                    </button>
                </div>
            </div>

            {activeTab === 'users' && (
                <div className="space-y-4 animate-fade-in">
                    <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="relative w-full max-w-md">
                            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                            <input 
                                type="text" 
                                placeholder="Search users by name or email..." 
                                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#02275A]"
                            />
                        </div>
                        <button 
                            onClick={() => openUserModal()}
                            className="bg-[#02275A] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-[#02275A]/90 transition-colors flex items-center gap-2"
                        >
                            <i className="fas fa-user-plus"></i> Add New User
                        </button>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500 font-bold tracking-wider">
                                        <th className="p-4">Name</th>
                                        <th className="p-4">Email</th>
                                        <th className="p-4">Assigned Role</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Last Login</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {users.map(user => {
                                        const roleType = getRoleType(user.roleId);
                                        return (
                                        <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase">
                                                        {user.name.substring(0, 2)}
                                                    </div>
                                                    <span className="font-bold text-slate-800">{user.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm text-slate-600">{user.email}</td>
                                            <td className="p-4">
                                                <span className={`px-2.5 py-1 rounded-md text-xs font-bold inline-flex items-center gap-1.5 ${
                                                    roleType === 'default' ? (user.roleId === 'role-super-admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700') : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                    <i className={`fas ${roleType === 'default' ? 'fa-shield-check' : 'fa-user-tag'} text-[10px]`}></i>
                                                    {getRoleName(user.roleId)}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit ${
                                                    user.status === 'Active' ? 'bg-emerald-50 text-emerald-600' :
                                                    user.status === 'Inactive' ? 'bg-slate-100 text-slate-500' :
                                                    'bg-rose-50 text-rose-600'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                                        user.status === 'Active' ? 'bg-emerald-500' :
                                                        user.status === 'Inactive' ? 'bg-slate-400' :
                                                        'bg-rose-500'
                                                    }`}></span>
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-xs text-slate-400">{user.lastLogin}</td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={() => openUserModal(user)}
                                                        className="px-2 py-1 bg-white border border-slate-200 text-slate-500 hover:text-[#02275A] hover:border-[#02275A] rounded-lg transition-colors text-xs font-bold shadow-sm"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteUser(user.id, user.roleId)}
                                                        className="px-2 py-1 bg-white border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-500 hover:bg-rose-50 rounded-lg transition-colors text-xs font-bold shadow-sm"
                                                    >
                                                        Delete
                                                    </button>
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

            {activeTab === 'roles' && (
                <div className="space-y-6 animate-fade-in">
                     <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">Permission Roles</h2>
                            <p className="text-xs text-slate-500">Define what users can see and do within the application.</p>
                        </div>
                        <button 
                            onClick={() => openRoleModal()}
                            className="bg-[#02275A] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-[#02275A]/90 transition-colors flex items-center gap-2"
                        >
                            <i className="fas fa-plus"></i> Create Custom Role
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {roles.map(role => (
                            <div key={role.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-slate-800">{role.name}</h3>
                                            {role.type === 'default' && (
                                                <span className="bg-slate-100 text-slate-500 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border border-slate-200">Default</span>
                                            )}
                                        </div>
                                        <div className="relative group/menu">
                                            <button className="text-slate-400 hover:text-slate-600">
                                                <i className="fas fa-ellipsis-v"></i>
                                            </button>
                                            <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-slate-100 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible z-10 transition-all">
                                                <button onClick={() => openRoleModal(role)} className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-[#02275A]">
                                                    {role.type === 'default' ? 'View Details' : 'Edit Role'}
                                                </button>
                                                {role.type === 'custom' && (
                                                    <button onClick={() => handleDeleteRole(role.id)} className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 border-t border-slate-100">
                                                        Delete Role
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-500 mb-4 line-clamp-2">{role.description}</p>
                                </div>
                                <div className="flex justify-between items-end border-t border-slate-100 pt-4 mt-2">
                                    <div>
                                        <span className="text-xs font-bold text-slate-400 block mb-1">Permissions Matrix</span>
                                        <div className="flex -space-x-1">
                                             <div className="w-8 h-8 rounded-full border-2 border-white bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold" title={`${role.permissions.length} Action Perms`}>
                                                <i className="fas fa-check-double"></i>
                                             </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-bold text-slate-400 block mb-1">Assigned Users</span>
                                        <span className={`text-sm font-bold ${role.userCount > 0 ? 'text-[#02275A]' : 'text-slate-400'}`}>
                                            <i className="fas fa-users text-xs mr-1"></i> {role.userCount}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Modals */}
            {isUserModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-white/20">
                        <div className="bg-gradient-to-r from-slate-50 to-white px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h3 className="font-extrabold text-slate-900 text-xl tracking-tight">{editingUserId ? 'Edit User' : 'Create New User'}</h3>
                                <p className="text-sm text-slate-500 font-medium mt-1">{editingUserId ? 'Update user details and access' : 'Configure access for a new team member'}</p>
                            </div>
                            <button onClick={() => { setIsUserModalOpen(false); setEditingUserId(null); }} className="bg-white hover:bg-slate-50 w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 shadow-sm border border-slate-100 transition-all">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        
                        <form onSubmit={handleAddUser} className="p-8">
                            <div className="space-y-6">
                                
                                {/* Full Width HR Link */}
                                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Link to HR Profile <span className="text-slate-400 font-normal ml-1">(Optional)</span></label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                            <i className="fas fa-id-badge"></i>
                                        </div>
                                        <select 
                                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#02275A]/20 focus:border-[#02275A] transition-all text-sm font-medium text-slate-700 shadow-sm appearance-none cursor-pointer"
                                            value={newUser.employeeId}
                                            onChange={e => {
                                                const empId = e.target.value;
                                                setNewUser(prev => {
                                                    const newState = { ...prev, employeeId: empId };
                                                    if (empId) {
                                                        const emp = initialEmployees.find(emp => emp.employeeId === empId);
                                                        if (emp) {
                                                            newState.name = `${emp.firstName} ${emp.lastName}`;
                                                            newState.email = emp.email;
                                                        }
                                                    }
                                                    return newState;
                                                });
                                            }}
                                        >
                                            <option value="">-- Standalone User Account --</option>
                                            {initialEmployees.map(emp => (
                                                <option key={emp.employeeId} value={emp.employeeId}>
                                                    {emp.firstName} {emp.lastName} ({emp.employeeId})
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                                            <i className="fas fa-chevron-down text-xs"></i>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2 font-medium"><i className="fas fa-info-circle mr-1 text-blue-500"></i> Auto-fills details if linked to an existing employee.</p>
                                </div>

                                {/* 2 Column Grid for remaining fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                                        <input 
                                            type="text" 
                                            required
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#02275A]/20 focus:border-[#02275A] transition-all text-sm"
                                            placeholder="e.g. John Doe"
                                            value={newUser.name}
                                            onChange={e => setNewUser({...newUser, name: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                                        <input 
                                            type="email" 
                                            required
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#02275A]/20 focus:border-[#02275A] transition-all text-sm"
                                            placeholder="e.g. john@prokip.com"
                                            value={newUser.email}
                                            onChange={e => setNewUser({...newUser, email: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Assigned Role</label>
                                        <div className="relative">
                                            <select 
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#02275A]/20 focus:border-[#02275A] transition-all appearance-none cursor-pointer text-sm font-bold text-slate-800"
                                                value={newUser.roleId}
                                                onChange={e => setNewUser({...newUser, roleId: e.target.value})}
                                            >
                                                {roles.map(r => (
                                                    <option key={r.id} value={r.id}>{r.name} {r.type === 'default' ? '(System)' : '(Custom)'}</option>
                                                ))}
                                            </select>
                                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                                                <i className="fas fa-chevron-down text-xs"></i>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">{editingUserId ? 'Update Password' : 'Initial Password'} <span className="text-slate-400 font-normal ml-1">{editingUserId && '(Optional)'}</span></label>
                                        <input 
                                            type="password" 
                                            required={!editingUserId}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#02275A]/20 focus:border-[#02275A] transition-all text-sm"
                                            placeholder={editingUserId ? 'Leave blank to keep current' : "••••••••"}
                                            value={newUser.password}
                                            onChange={e => setNewUser({...newUser, password: e.target.value})}
                                        />
                                    </div>
                                </div>

                            </div>
                            
                            <div className="pt-8 flex gap-3 mt-4 border-t border-slate-100">
                                <button 
                                    type="button"
                                    onClick={() => { setIsUserModalOpen(false); setEditingUserId(null); }}
                                    className="flex-1 py-3 px-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 py-3 px-4 bg-[#02275A] text-white font-bold rounded-xl hover:bg-[#02275A]/90 transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
                                >
                                    <i className={editingUserId ? "fas fa-save" : "fas fa-user-check"}></i> {editingUserId ? 'Save Changes' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isRoleModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in text-left">
                    <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-white/20">
                        <div className="bg-gradient-to-r from-slate-50 to-white px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h3 className="font-extrabold text-slate-900 text-xl tracking-tight">{editingRole ? (editingRole.type === 'default' ? 'View System Role' : 'Edit Custom Role') : 'Create Enterprise Role'}</h3>
                                {editingRole?.type === 'default' && <p className="text-xs text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block mt-1"><i className="fas fa-lock text-[10px]"></i> System default roles cannot be modified</p>}
                            </div>
                            <button onClick={() => setIsRoleModalOpen(false)} className="bg-white hover:bg-slate-50 w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 shadow-sm border border-slate-100 transition-all">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50 custom-scrollbar">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Role Details */}
                                <div className="lg:col-span-1 space-y-4">
                                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                                        <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2"><i className="fas fa-id-card text-blue-500 mr-2"></i> Role Profile</h4>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Role Name</label>
                                            <input 
                                                type="text" 
                                                disabled={newRole.type === 'default'}
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 focus:outline-none focus:border-[#02275A] disabled:opacity-70"
                                                placeholder="e.g. Support Specialist"
                                                value={newRole.name}
                                                onChange={e => setNewRole({...newRole, name: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Description</label>
                                            <textarea 
                                                disabled={newRole.type === 'default'}
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-[#02275A] min-h-[100px] disabled:opacity-70"
                                                placeholder="What can this role do?"
                                                value={newRole.description}
                                                onChange={e => setNewRole({...newRole, description: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Permissions Builder */}
                                <div className="lg:col-span-2">
                                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                        <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                                            <div>
                                                <h4 className="font-bold text-slate-800"><i className="fas fa-shield-check text-emerald-500 mr-2"></i> Enterprise Access Rights</h4>
                                                <p className="text-xs text-slate-500">Fine-grained action-level permissions</p>
                                            </div>
                                            <span className="bg-slate-100 text-[#02275A] px-2 py-1 rounded text-xs font-bold border border-slate-200">
                                                {newRole.permissions.length} Perms Active
                                            </span>
                                        </div>

                                        <div className="space-y-6">
                                            {PERMISSION_CATEGORIES.map(category => (
                                                <div key={category.name} className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                                                    <div className="bg-slate-100/50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                                                        <div>
                                                            <h5 className="font-bold text-slate-700 text-sm">{category.name}</h5>
                                                            <p className="text-[10px] text-slate-500">{category.description}</p>
                                                        </div>
                                                        {newRole.type === 'custom' && (
                                                            <button 
                                                                type="button"
                                                                className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded"
                                                                onClick={() => {
                                                                    const allActionIds = category.actions.map(a => a.id);
                                                                    const hasAll = allActionIds.every(id => newRole.permissions.includes(id));
                                                                    setNewRole(prev => {
                                                                        let newPerms = [...prev.permissions];
                                                                        if (hasAll) {
                                                                            newPerms = newPerms.filter(p => !allActionIds.includes(p));
                                                                        } else {
                                                                            allActionIds.forEach(id => {
                                                                                if (!newPerms.includes(id)) newPerms.push(id);
                                                                            });
                                                                        }
                                                                        return { ...prev, permissions: newPerms };
                                                                    });
                                                                }}
                                                            >
                                                                Toggle All
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 bg-white">
                                                        {category.actions.map(action => (
                                                            <label key={action.id} className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors border ${newRole.permissions.includes(action.id) ? 'bg-indigo-50/50 border-indigo-100' : 'border-transparent hover:bg-slate-50'}`}>
                                                                <div className="pt-0.5">
                                                                    <div className={`w-4 h-4 rounded shadow-sm flex items-center justify-center transition-colors border ${
                                                                        newRole.permissions.includes(action.id) 
                                                                            ? 'bg-[#02275A] border-[#02275A] text-white' 
                                                                            : 'bg-white border-slate-300 text-transparent'
                                                                    } ${newRole.type === 'default' ? 'opacity-50' : ''}`}>
                                                                        <i className="fas fa-check text-[10px]"></i>
                                                                    </div>
                                                                </div>
                                                                <input 
                                                                    type="checkbox" 
                                                                    className="hidden" 
                                                                    checked={newRole.permissions.includes(action.id)}
                                                                    disabled={newRole.type === 'default'}
                                                                    onChange={() => togglePermission(action.id)}
                                                                />
                                                                <div>
                                                                    <span className={`text-sm font-bold block ${newRole.permissions.includes(action.id) ? 'text-[#02275A]' : 'text-slate-600'}`}>
                                                                        {action.name}
                                                                    </span>
                                                                    <span className="text-[9px] text-slate-400 font-mono tracking-tighter">System ID: {action.id}</span>
                                                                </div>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3 flex-shrink-0">
                            <button 
                                type="button"
                                onClick={() => setIsRoleModalOpen(false)}
                                className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm"
                            >
                                {newRole.type === 'default' ? 'Close' : 'Cancel'}
                            </button>
                            {newRole.type === 'custom' && (
                                <button 
                                    type="button"
                                    onClick={handleSaveRole}
                                    disabled={!newRole.name.trim()}
                                    className="px-8 py-3 bg-[#02275A] text-white font-bold rounded-xl hover:bg-[#02275A]/90 transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    <i className="fas fa-save"></i> {editingRole ? 'Update Custom Role' : 'Save Custom Role'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminUsersView;

