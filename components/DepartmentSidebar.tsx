import React from 'react';
import { UserRole } from '../types';

interface DepartmentSidebarProps {
    currentView: string;
    setView: (view: string) => void;
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (isOpen: boolean) => void;
    userRole: UserRole;
    logout: () => void;
}

const DepartmentSidebar: React.FC<DepartmentSidebarProps> = ({ currentView, setView, isMobileMenuOpen, setIsMobileMenuOpen, userRole, logout }) => {
    
    let menuItems: { id: string, icon: string, label: string }[] = [];
    let roleLabel = '';

    switch (userRole) {
        case 'cx-head':
            roleLabel = 'CX Head';
            menuItems = [
                { id: 'dept-performance', icon: 'fa-chart-line', label: 'Performance' },
                { id: 'dept-customers', icon: 'fa-building', label: 'Customers' },
                { id: 'dept-success', icon: 'fa-heart', label: 'Customer Success' },
                { id: 'dept-knowledge', icon: 'fa-book', label: 'Knowledge Base' },
                { id: 'dept-complaints', icon: 'fa-ticket', label: 'Complaints' },
            ];
            break;
        case 'team-lead':
            roleLabel = 'Team Lead';
            menuItems = [
                { id: 'dept-performance', icon: 'fa-chart-line', label: 'Performance' },
                { id: 'dept-customers', icon: 'fa-building', label: 'Customers' },
                { id: 'dept-success', icon: 'fa-heart', label: 'Customer Success' },
                { id: 'dept-knowledge', icon: 'fa-book', label: 'Knowledge Base' },
                { id: 'dept-complaints', icon: 'fa-ticket', label: 'Complaints' },
            ];
            break;
        case 'call-agent':
            roleLabel = 'Call Agent';
            menuItems = [
                { id: 'dashboard', icon: 'fa-chart-pie', label: 'My Dashboard' },
                { id: 'dept-leads', icon: 'fa-user-plus', label: 'My Leads' },
                { id: 'dept-customers', icon: 'fa-building', label: 'My Customers' },
            ];
            break;
        case 'sales-manager':
            roleLabel = 'Sales Manager';
            menuItems = [
                { id: 'dept-performance', icon: 'fa-chart-line', label: 'Dept Performance' },
                { id: 'dept-sales-data', icon: 'fa-chart-bar', label: 'Sales Data' },
                { id: 'dept-customers', icon: 'fa-building', label: 'Customers' },
                { id: 'dept-leads', icon: 'fa-user-plus', label: 'All Leads' },
                { id: 'dept-resources', icon: 'fa-folder-open', label: 'Resource Center' },
            ];
            break;
        case 'support-staff':
            roleLabel = 'Support Staff';
            menuItems = [
                { id: 'dept-customers', icon: 'fa-building', label: 'Customers' },
                { id: 'dept-knowledge', icon: 'fa-book', label: 'Knowledge Base' },
                { id: 'dept-complaints', icon: 'fa-ticket', label: 'Complaints' },
            ];
            break;
        case 'finance':
            roleLabel = 'Finance';
            menuItems = [
                { id: 'dept-performance', icon: 'fa-chart-line', label: 'Dept Performance' },
                { id: 'dept-finance', icon: 'fa-wallet', label: 'Finance Center' },
                { id: 'dept-commissions', icon: 'fa-money-bill-wave', label: 'Commissions' },
                { id: 'dept-customers', icon: 'fa-building', label: 'Customers' },
            ];
            break;
        case 'marketing-manager':
            roleLabel = 'Marketing Mgr';
            menuItems = [
                { id: 'dept-performance', icon: 'fa-chart-line', label: 'Dept Performance' },
                { id: 'dept-sales-data', icon: 'fa-chart-bar', label: 'Sales Data' },
                { id: 'dept-customers', icon: 'fa-building', label: 'Customers' },
                { id: 'dept-leads', icon: 'fa-user-plus', label: 'Leads' },
                { id: 'dept-resources', icon: 'fa-folder-open', label: 'Resource Center' },
            ];
            break;
        case 'content-lead':
            roleLabel = 'Content Lead';
            menuItems = [
                { id: 'dept-performance', icon: 'fa-chart-line', label: 'Dept Performance' },
                { id: 'dept-resources', icon: 'fa-folder-open', label: 'Resource Center' },
            ];
            break;
        case 'customer-success':
            roleLabel = 'Cust Success';
            menuItems = [
                { id: 'dept-success', icon: 'fa-heart', label: 'Customer Success' },
            ];
            break;
        default:
            break;
    }

    return (
        <>
            {/* Mobile Overlay Backdrop */}
            <div 
                className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsMobileMenuOpen(false)}
            ></div>

            {/* Sidebar Navigation */}
            <nav className={`fixed top-0 left-0 h-full w-[264px] bg-white border-r border-slate-200 z-50 transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl lg:shadow-none lg:translate-x-0 lg:static ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                
                {/* Logo Area */}
                <div className="flex items-center justify-between px-6 py-8 border-b border-slate-50 lg:border-none">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center">
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="40" height="40" rx="12" fill="#02275A"/>
                                <defs>
                                    <linearGradient id="dept-gold-gradient" x1="13" y1="10" x2="28" y2="30" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#FFD700" />
                                        <stop offset="1" stopColor="#F59E0B" />
                                    </linearGradient>
                                </defs>
                                <path 
                                    d="M13 30V12H21C25 12 28 15 28 19C28 23 25 26 21 26H18" 
                                    stroke="url(#dept-gold-gradient)" 
                                    strokeWidth="5" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                        <div>
                            <span className="text-xl font-extrabold text-[#02275A] block leading-none">Prokip</span>
                            <span className="text-[10px] text-[#02275A] font-bold uppercase tracking-widest mt-1 block">{roleLabel}</span>
                        </div>
                    </div>
                    {/* Close Button for Mobile */}
                    <button 
                        onClick={() => setIsMobileMenuOpen(false)} 
                        className="lg:hidden w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
                    >
                        <i className="fas fa-times text-lg"></i>
                    </button>
                </div>

                {/* Menu Items Container */}
                <div className="flex flex-col w-full px-4 overflow-y-auto custom-scrollbar flex-1 gap-2 pt-4">
                    <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Workspace</p>
                    {menuItems.map(item => (
                        <button 
                            key={item.id}
                            onClick={() => { setView(item.id); setIsMobileMenuOpen(false); }}
                            className={`group flex items-center gap-3 px-4 py-3 rounded-xl w-full text-sm h-[52px] m-0 transition-all duration-200 ease-in-out ${
                                currentView === item.id 
                                ? 'text-white bg-[#02275A] font-bold shadow-md shadow-blue-900/10' 
                                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium'
                            }`}
                        >
                            <div className={`w-5 flex justify-center transition-transform group-hover:scale-110 ${currentView === item.id ? 'text-white' : 'text-slate-400 group-hover:text-[#02275A]'}`}>
                                <i className={`fas ${item.icon} text-lg`}></i>
                            </div>
                            <span className="whitespace-nowrap tracking-wide">{item.label}</span>
                            {currentView === item.id && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/30"></div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Logout Section */}
                <div className="mt-auto w-full px-4 pb-8 pt-4">
                    <div className="border-t border-slate-100 mb-4"></div>
                    <button 
                        onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                        className="w-full text-left px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-3 h-[52px] transition-all"
                    >
                        <div className="w-5 flex justify-center">
                            <i className="fas fa-sign-out-alt text-lg"></i>
                        </div>
                        Logout
                    </button>
                </div>
            </nav>
        </>
    );
};

export default DepartmentSidebar;
