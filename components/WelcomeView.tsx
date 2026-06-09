
import React from 'react';

interface WelcomeViewProps {
    onLogin: () => void;
    onSignup: () => void;
}

const WelcomeView: React.FC<WelcomeViewProps> = ({ onLogin, onSignup }) => {
    return (
        <div className="min-h-screen bg-white flex flex-col md:flex-row animate-fade-in">
            {/* Left Brand Panel - Hidden on Mobile */}
            <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#02275A] to-[#011530] relative overflow-hidden flex-col justify-between p-12 text-white">
                {/* Background Patterns */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 flex items-center justify-center">
                            {/* White bordered version for dark bg */}
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="40" height="40" rx="12" fill="#02275A" stroke="white" strokeWidth="2"/>
                                <defs>
                                    <linearGradient id="welcome-gold-gradient" x1="13" y1="10" x2="28" y2="30" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#FFD700" />
                                        <stop offset="1" stopColor="#F59E0B" />
                                    </linearGradient>
                                </defs>
                                <path 
                                    d="M13 30V12H21C25 12 28 15 28 19C28 23 25 26 21 26H18" 
                                    stroke="url(#welcome-gold-gradient)" 
                                    strokeWidth="5" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                        <span className="text-xl font-bold tracking-wide">Prokip</span>
                    </div>
                </div>

                <div className="relative z-10 max-w-lg">
                    <h1 className="text-5xl font-extrabold leading-tight mb-6 tracking-tight">
                        Empowering Agents, <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-emerald-200">Growing Business.</span>
                    </h1>
                    <p className="text-lg text-blue-100/80 leading-relaxed mb-8">
                        Join thousands of agents managing businesses, tracking leads, and earning real-time commissions with our comprehensive dashboard.
                    </p>
                    
                    <div className="flex items-center gap-4">
                        <div className="flex -space-x-3">
                            <div className="w-10 h-10 rounded-full border-2 border-[#02275A] bg-gray-200"></div>
                            <div className="w-10 h-10 rounded-full border-2 border-[#02275A] bg-gray-300"></div>
                            <div className="w-10 h-10 rounded-full border-2 border-[#02275A] bg-gray-400"></div>
                            <div className="w-10 h-10 rounded-full border-2 border-[#02275A] bg-[#02275A] text-white flex items-center justify-center text-xs font-bold ring-2 ring-white/20">
                                +2k
                            </div>
                        </div>
                        <div className="text-sm font-medium">
                            <p className="text-white">Join 2,000+ Agents</p>
                            <div className="flex text-amber-400 text-xs gap-0.5">
                                <i className="fas fa-star"></i>
                                <i className="fas fa-star"></i>
                                <i className="fas fa-star"></i>
                                <i className="fas fa-star"></i>
                                <i className="fas fa-star"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 text-xs text-blue-200/50">
                    &copy; 2023 Prokip. All rights reserved.
                </div>
            </div>

            {/* Right Content Panel */}
            <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 md:p-12 relative">
                {/* Mobile Header Logo */}
                <div className="md:hidden absolute top-6 left-6 flex items-center gap-2 text-[#02275A]">
                    <div className="w-8 h-8 flex items-center justify-center">
                        <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="40" height="40" rx="12" fill="#02275A"/>
                            <defs>
                                <linearGradient id="mobile-gold-gradient" x1="13" y1="10" x2="28" y2="30" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#FFD700" />
                                    <stop offset="1" stopColor="#F59E0B" />
                                </linearGradient>
                            </defs>
                            <path 
                                d="M13 30V12H21C25 12 28 15 28 19C28 23 25 26 21 26H18" 
                                stroke="url(#mobile-gold-gradient)" 
                                strokeWidth="5" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                    <span className="text-lg font-bold">Prokip</span>
                </div>

                <div className="max-w-md w-full">
                    <div className="text-center md:text-left mb-10 mt-12 md:mt-0">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Get Started</h2>
                        <p className="text-slate-500 text-base">Choose how you want to access your dashboard.</p>
                    </div>

                    <div className="space-y-4">
                        <button 
                            onClick={onLogin}
                            className="group w-full p-4 bg-[#02275A] text-white rounded-xl shadow-lg shadow-blue-900/20 hover:bg-[#02275A]/90 hover:shadow-xl transition-all flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                    <i className="fas fa-sign-in-alt"></i>
                                </div>
                                <div className="text-left">
                                    <span className="block font-bold text-base">Login to Account</span>
                                    <span className="text-xs text-blue-200 font-medium">Access your existing dashboard</span>
                                </div>
                            </div>
                            <i className="fas fa-arrow-right opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all"></i>
                        </button>

                        <button 
                            onClick={onSignup}
                            className="group w-full p-4 bg-white border-2 border-slate-100 text-slate-700 rounded-xl hover:border-[#02275A]/30 hover:shadow-md transition-all flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-50 text-slate-500 flex items-center justify-center group-hover:bg-[#02275A]/10 group-hover:text-[#02275A] transition-colors">
                                    <i className="fas fa-user-plus"></i>
                                </div>
                                <div className="text-left">
                                    <span className="block font-bold text-base group-hover:text-[#02275A] transition-colors">Create New Account</span>
                                    <span className="text-xs text-slate-400 font-medium">Start earning commissions today</span>
                                </div>
                            </div>
                            <i className="fas fa-arrow-right text-slate-300 group-hover:text-[#02275A] transition-colors"></i>
                        </button>
                    </div>

                    {/* Features Grid (Mobile/Desktop Footer area) */}
                    <div className="mt-12 pt-8 border-t border-slate-100 grid grid-cols-3 gap-4 text-center">
                        <div>
                            <div className="w-10 h-10 mx-auto bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-2">
                                <i className="fas fa-wallet"></i>
                            </div>
                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">Instant Pay</p>
                        </div>
                        <div>
                            <div className="w-10 h-10 mx-auto bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-2">
                                <i className="fas fa-chart-pie"></i>
                            </div>
                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">Analytics</p>
                        </div>
                        <div>
                            <div className="w-10 h-10 mx-auto bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-2">
                                <i className="fas fa-users"></i>
                            </div>
                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">Support</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomeView;
