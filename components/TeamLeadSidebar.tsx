import React from 'react';

interface TeamLeadSidebarProps {
    currentView: string;
    setView: (view: string) => void;
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (isOpen: boolean) => void;
    logout: () => void;
    userRole?: string;
}

const TeamLeadSidebar: React.FC<TeamLeadSidebarProps> = ({ currentView, setView, isMobileMenuOpen, setIsMobileMenuOpen, logout, userRole }) => {
    let menuItems = [
        { id: 'team-lead-dashboard', icon: 'fa-chart-pie', label: 'My Dashboard' },
        { id: 'team-lead-my-grades', icon: 'fa-star', label: 'My Grades & Rewards' },
        { id: 'team-lead-my-policies', icon: 'fa-shield-check', label: 'My Policies' },
        { id: 'team-lead-my-history', icon: 'fa-clock', label: 'My History' },
        { id: 'team-lead-my-profile', icon: 'fa-user', label: 'My Profile' },
    ];

    const isCxEquivalent = ['cx-head', 'customer-success', 'sales-manager', 'marketing-manager', 'support-staff', 'finance', 'content-lead'].includes(userRole);

    if (isCxEquivalent) {
        menuItems = menuItems.filter(item => item.id !== 'team-lead-my-grades' && item.id !== 'team-lead-my-history' && item.id !== 'team-lead-my-profile' && item.id !== 'team-lead-my-policies');
    }

    let teamMenuItems = [
        { id: 'team-lead-performance', icon: 'fa-chart-line', label: 'Performance' },
        { id: 'team-lead-my-team', icon: 'fa-users', label: 'My Team' },
        { id: 'team-lead-customers', icon: 'fa-building', label: 'Customers' },
        { id: 'team-lead-success', icon: 'fa-heart', label: 'Customer Success' },
        { id: 'team-lead-knowledgebase', icon: 'fa-book', label: 'Knowledge Base' },
        { id: 'team-lead-complaints', icon: 'fa-ticket', label: 'Complaints' },
        { id: 'team-lead-permissions', icon: 'fa-shield-alt', label: 'Permissions' },
    ];

    if (isCxEquivalent) {
        teamMenuItems = teamMenuItems.filter(item => item.id !== 'team-lead-my-team' && item.id !== 'team-lead-permissions');
    }

    if (userRole === 'support-staff') {
        teamMenuItems = teamMenuItems.filter(item => item.id !== 'team-lead-performance');
    }

    if (userRole === 'sales-manager' || userRole === 'marketing-manager') {
        teamMenuItems = teamMenuItems.filter(item => item.id !== 'team-lead-success' && item.id !== 'team-lead-complaints' && item.id !== 'team-lead-knowledgebase');
        teamMenuItems.push({ id: 'team-lead-sales-data', icon: 'fa-chart-pie', label: 'Sales Data' });
        teamMenuItems.push({ id: 'team-lead-leads', icon: 'fa-user-tag', label: 'All Leads' });
        teamMenuItems.push({ id: 'team-lead-resources', icon: 'fa-folder-open', label: 'Resource Center' });
    }

    if (userRole === 'finance') {
        teamMenuItems = teamMenuItems.filter(item => item.id !== 'team-lead-success' && item.id !== 'team-lead-knowledgebase' && item.id !== 'team-lead-complaints');
        teamMenuItems.push({ id: 'team-lead-finance', icon: 'fa-wallet', label: 'Finance Center' });
        teamMenuItems.push({ id: 'team-lead-commissions', icon: 'fa-money-bill-wave', label: 'Commissions' });
    }

    if (userRole === 'content-lead') {
        teamMenuItems = teamMenuItems.filter(item => item.id === 'team-lead-performance');
        teamMenuItems.push({ id: 'team-lead-resources', icon: 'fa-folder-open', label: 'Resource Center' });
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
                                    <linearGradient id="team-lead-gold-gradient" x1="13" y1="10" x2="28" y2="30" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#FFD700" />
                                        <stop offset="1" stopColor="#F59E0B" />
                                    </linearGradient>
                                </defs>
                                <path 
                                    d="M13 30V12H21C25 12 28 15 28 19C28 23 25 26 21 26H18" 
                                    stroke="url(#team-lead-gold-gradient)" 
                                    strokeWidth="5" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                        <div>
                            <span className="text-xl font-extrabold text-[#02275A] block leading-none">Prokip</span>
                            <span className="text-[10px] text-[#02275A] font-bold uppercase tracking-widest mt-1 block">Team Lead</span>
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
                    <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">My HR</p>
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
                    <div className="border-t border-slate-100 my-2"></div>
                    <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 mt-2">Team Management</p>
                    {teamMenuItems.map(item => (
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

export default TeamLeadSidebar;
