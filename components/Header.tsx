
import React, { useState, useRef, useEffect } from 'react';
import { Notification } from '../types';

interface HeaderProps {
    title: string;
    subtitle: string;
    setView: (view: string) => void;
    unreadCount: number;
    notifications: Notification[];
    markAsRead: (id: number) => void;
    markAllAsRead: () => void;
    toggleMobileMenu: () => void;
    userRole?: string;
    currentView?: string;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle, setView, unreadCount, notifications, markAsRead, markAllAsRead, toggleMobileMenu, userRole, currentView }) => {
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifMenu, setShowNotifMenu] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const notifRef = useRef<HTMLDivElement>(null);

    const toggleProfileMenu = () => {
        setShowProfileMenu(!showProfileMenu);
        setShowNotifMenu(false);
    };

    const toggleNotifMenu = () => {
        setShowNotifMenu(!showNotifMenu);
        setShowProfileMenu(false);
    };

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setShowNotifMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleNotificationClick = (notification: Notification) => {
        markAsRead(notification.id);
        setShowNotifMenu(false);
        if (notification.actionLink) {
            setView(notification.actionLink);
        } else {
            setView('notifications');
        }
    };

    const getIconClass = (type: string) => {
        switch(type) {
            case 'success': return 'bg-emerald-50 text-emerald-600';
            case 'warning': return 'bg-amber-50 text-amber-600';
            case 'alert': return 'bg-rose-50 text-rose-600';
            default: return 'bg-blue-50 text-blue-600';
        }
    };

    const getIcon = (type: string) => {
        switch(type) {
            case 'success': return 'fa-check-circle';
            case 'warning': return 'fa-exclamation-triangle';
            case 'alert': return 'fa-bell';
            default: return 'fa-info-circle';
        }
    };

    return (
        <header className="w-full z-30 bg-white border-b border-slate-200 sticky top-0">
            <div className="px-4 md:px-8 py-3 md:py-4 flex justify-between items-center gap-4">
                
                {/* Left Section: Mobile Toggle & Page Title */}
                <div className="flex items-center gap-3 lg:gap-6">
                    <button 
                        onClick={toggleMobileMenu} 
                        className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-[#02275A] transition-colors rounded-lg focus:outline-none hover:bg-slate-50"
                    >
                        <i className="fas fa-bars text-xl"></i>
                    </button>
                    <div>
                        <h1 className="text-xl lg:text-2xl font-bold text-slate-800 tracking-tight leading-tight">{title}</h1>
                        <p className="hidden md:block text-xs font-medium text-slate-500 mt-0.5">{subtitle}</p>
                    </div>
                </div>

                {/* Right Section: Actions & Profile */}
                <div className="flex items-center gap-2 md:gap-4">
                    
                    {/* Notification Bell */}
                    <div className="relative" ref={notifRef}>
                        <button 
                            onClick={toggleNotifMenu}
                            className={`relative p-2.5 rounded-xl transition-all duration-200 ${showNotifMenu ? 'bg-indigo-50 text-[#02275A]' : 'hover:bg-slate-50 text-slate-500 hover:text-slate-700'}`}
                            title="Notifications"
                        >
                            <i className="far fa-bell text-xl"></i>
                            {unreadCount > 0 && (
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse"></span>
                            )}
                        </button>

                        {/* Notification Dropdown */}
                        {showNotifMenu && (
                            <div className="absolute right-0 top-14 w-80 md:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-fade-in origin-top-right ring-1 ring-slate-900/5">
                                <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                                    <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
                                    <button onClick={markAllAsRead} className="text-[10px] text-[#02275A] font-bold hover:underline">Mark all as read</button>
                                </div>
                                
                                <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                                    {notifications.length === 0 ? (
                                        <div className="p-10 text-center text-slate-400 flex flex-col items-center">
                                            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                                <i className="far fa-bell-slash text-xl opacity-50"></i>
                                            </div>
                                            <p className="text-xs font-medium">No new notifications</p>
                                        </div>
                                    ) : (
                                        <div>
                                            {notifications.slice(0, 5).map((notif) => (
                                                <div 
                                                    key={notif.id} 
                                                    onClick={() => handleNotificationClick(notif)}
                                                    className={`p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors flex gap-3 group ${!notif.read ? 'bg-blue-50/30' : ''}`}
                                                >
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${getIconClass(notif.type)}`}>
                                                        <i className={`fas ${getIcon(notif.type)} text-xs`}></i>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start mb-0.5">
                                                            <h4 className={`text-xs truncate pr-2 ${!notif.read ? 'font-bold text-slate-800' : 'font-medium text-slate-600'}`}>{notif.title}</h4>
                                                            <span className="text-[9px] text-slate-400 whitespace-nowrap">{notif.time}</span>
                                                        </div>
                                                        <p className={`text-[10px] line-clamp-2 ${!notif.read ? 'text-slate-600' : 'text-slate-400'}`}>{notif.message}</p>
                                                    </div>
                                                    {!notif.read && (
                                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 self-center shrink-0"></div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                
                                <div className="p-2 border-t border-slate-50 bg-slate-50/30">
                                    <button 
                                        onClick={() => { setView('notifications'); setShowNotifMenu(false); }}
                                        className="w-full py-2.5 text-center text-xs font-bold text-[#02275A] hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-200 hover:shadow-sm"
                                    >
                                        View All Activity
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="h-8 w-px bg-slate-200 hidden md:block mx-1"></div>

                    {/* Profile Section */}
                    <div className="relative" ref={profileRef}>
                        <button 
                            onClick={toggleProfileMenu}
                            className="flex items-center gap-3 group focus:outline-none pl-1"
                        >
                            <div className="hidden md:block text-right">
                                <p className="text-sm font-bold text-slate-800 group-hover:text-[#02275A] transition-colors leading-tight">John Agent</p>
                                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Elite Agent</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#02275A] to-indigo-600 p-0.5 shadow-md group-hover:shadow-lg transition-all ring-2 ring-white">
                                <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-[#02275A] font-bold text-sm">
                                    JA
                                </div>
                            </div>
                            <i className={`fas fa-chevron-down text-slate-300 text-xs transition-transform duration-300 hidden md:block ${showProfileMenu ? 'rotate-180' : ''}`}></i>
                        </button>

                        {/* Profile Dropdown */}
                        {showProfileMenu && (
                            <div className="absolute right-0 top-14 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-fade-in origin-top-right ring-1 ring-slate-900/5">
                                {/* Mobile User Info inside dropdown */}
                                <div className="p-4 border-b border-slate-50 md:hidden bg-slate-50/50 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-[#011530] rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md">
                                        JA
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">John Agent</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Elite Agent</p>
                                    </div>
                                </div>

                                <div className="p-2">
                                    {['call-agent', 'support-staff', 'customer-success'].includes(userRole || '') ? (
                                        <>
                                            <button 
                                                onClick={() => { 
                                                    setView('team-lead-my-profile');
                                                    setShowProfileMenu(false); 
                                                }}
                                                className="w-full text-left px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#02275A] flex items-center gap-3 transition-colors font-medium rounded-xl group"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs shadow-sm group-hover:bg-blue-100 transition-colors">
                                                    <i className="fas fa-user-circle"></i>
                                                </div>
                                                <div>
                                                    <p className="leading-none font-bold text-xs">My Profile</p>
                                                    <p className="text-[10px] text-slate-400 font-normal mt-0.5">Account settings</p>
                                                </div>
                                            </button>

                                            <button 
                                                onClick={() => { 
                                                    setView('team-lead-my-performance');
                                                    setShowProfileMenu(false); 
                                                }}
                                                className="w-full text-left px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#02275A] flex items-center gap-3 transition-colors font-medium rounded-xl group"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs shadow-sm group-hover:bg-emerald-100 transition-colors">
                                                    <i className="fas fa-chart-line"></i>
                                                </div>
                                                <div>
                                                    <p className="leading-none font-bold text-xs">Performance</p>
                                                    <p className="text-[10px] text-slate-400 font-normal mt-0.5">Grades & Point Ledger</p>
                                                </div>
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button 
                                                onClick={() => { 
                                                    if (['cx-head', 'customer-success', 'sales-manager', 'marketing-manager', 'support-staff', 'finance', 'content-lead', 'call-agent'].includes(userRole)) {
                                                        setView('team-lead-my-profile');
                                                    } else {
                                                        setView('profile');
                                                    }
                                                    setShowProfileMenu(false); 
                                                }}
                                                className="w-full text-left px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#02275A] flex items-center gap-3 transition-colors font-medium rounded-xl group"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs shadow-sm group-hover:bg-blue-100 transition-colors">
                                                    <i className="fas fa-user-circle"></i>
                                                </div>
                                                <div>
                                                    <p className="leading-none font-bold text-xs">My Profile</p>
                                                    <p className="text-[10px] text-slate-400 font-normal mt-0.5">Account settings</p>
                                                </div>
                                            </button>

                                            {!(userRole === 'employee' && currentView === 'dashboard') && !['cx-head', 'sales-manager', 'content-lead', 'marketing-manager', 'call-agent', 'finance', 'customer-success', 'support-staff'].includes(userRole || '') && (
                                                <button 
                                                    onClick={() => { setView('tickets'); setShowProfileMenu(false); }}
                                                    className="w-full text-left px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#02275A] flex items-center gap-3 transition-colors font-medium rounded-xl group"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-xs shadow-sm group-hover:bg-purple-100 transition-colors">
                                                        <i className="fas fa-ticket-alt"></i>
                                                    </div>
                                                    <div>
                                                        <p className="leading-none font-bold text-xs">Support Tickets</p>
                                                        <p className="text-[10px] text-slate-400 font-normal mt-0.5">My complaints</p>
                                                    </div>
                                                </button>
                                            )}

                                            {!(userRole === 'employee' && currentView === 'dashboard') && !['cx-head', 'sales-manager', 'marketing-manager', 'finance', 'content-lead'].includes(userRole || '') && (
                                                <button 
                                                    onClick={() => { setView('policy'); setShowProfileMenu(false); }}
                                                    className="w-full text-left px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#02275A] flex items-center gap-3 transition-colors font-medium rounded-xl group"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center text-xs shadow-sm group-hover:bg-orange-100 transition-colors">
                                                        <i className="fas fa-gavel"></i>
                                                    </div>
                                                    <div>
                                                        <p className="leading-none font-bold text-xs">Policy & Violations</p>
                                                        <p className="text-[10px] text-slate-400 font-normal mt-0.5">Compliance status</p>
                                                    </div>
                                                </button>
                                            )}
                                        </>
                                    )}
                                    
                                    <div className="border-t border-slate-50 my-1"></div>
                                    
                                    <button 
                                        onClick={() => { alert('Logged out successfully'); setShowProfileMenu(false); }}
                                        className="w-full text-left px-3 py-2.5 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-3 transition-colors font-bold rounded-xl group"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center text-xs shadow-sm group-hover:bg-rose-100 transition-colors">
                                            <i className="fas fa-sign-out-alt"></i>
                                        </div>
                                        <div>
                                            <p className="leading-none text-xs">Logout</p>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
