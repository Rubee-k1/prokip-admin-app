import React from 'react';

interface AdminSidebarProps {
    currentView: string;
    setView: (view: string) => void;
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (isOpen: boolean) => void;
    logout: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ currentView, setView, isMobileMenuOpen, setIsMobileMenuOpen, logout }) => {
    
    const menuItems = [
        { id: 'admin-dashboard', label: 'Home', icon: 'fa-house' },
        { id: 'admin-ceo-dashboard', label: 'CEO Command Center', icon: 'fa-tower-broadcast' },
        { id: 'admin-users', label: 'Users & Roles', icon: 'fa-user-shield' },
        { id: 'admin-hr-center', label: 'HR Center', icon: 'fa-users-gear' },
        { id: 'admin-performance', label: 'Performance', icon: 'fa-chart-line' },
        { id: 'admin-agents', label: 'Agents', icon: 'fa-users' },
        { id: 'admin-managers', label: 'Managers', icon: 'fa-user-tie' },
        { id: 'admin-leads', label: 'Leads', icon: 'fa-briefcase' },
        { id: 'admin-customers', label: 'Customers', icon: 'fa-store' },
        { id: 'admin-reports', label: 'Reports', icon: 'fa-chart-line' },
        { id: 'admin-finance', label: 'Finance Center', icon: 'fa-file-invoice-dollar' },
        { id: 'admin-commissions', label: 'Commissions', icon: 'fa-wallet' },
        { id: 'admin-discounts', label: 'Discount Management', icon: 'fa-tags' },
        { id: 'admin-complaints', label: 'Support Tickets', icon: 'fa-headset' },
        { id: 'admin-broadcasts', label: 'Broadcasts', icon: 'fa-bullhorn' },
        { id: 'admin-customer-success', label: 'Customer Success', icon: 'fa-heartbeat' },
        { id: 'admin-app-tracking', label: 'Apps & Devices', icon: 'fa-mobile-alt' },
        { id: 'admin-resources', label: 'Resource Center', icon: 'fa-photo-video' },
        { id: 'admin-settings', label: 'Settings', icon: 'fa-gear' },
    ];

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
                                    <linearGradient id="sidebar-gold-gradient" x1="13" y1="10" x2="28" y2="30" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#FFD700" />
                                        <stop offset="1" stopColor="#F59E0B" />
                                    </linearGradient>
                                </defs>
                                <path 
                                    d="M13 30V12H21C25 12 28 15 28 19C28 23 25 26 21 26H18" 
                                    stroke="url(#sidebar-gold-gradient)" 
                                    strokeWidth="5" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                        <span className="text-2xl font-extrabold text-[#02275A] tracking-tight">Prokip</span>
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
                    <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Admin Menu</p>
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

export default AdminSidebar;
