
import React, { useState, useEffect } from 'react';
import MetricCard from './MetricCard';
import WithdrawalModal from './WithdrawalModal';
import FirstSaleChallenge from './FirstSaleChallenge';
import { useAlert } from '../contexts/AlertContext';

interface DashboardViewProps {
    setView: (view: string) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ setView }) => {
    const { showSuccess } = useAlert();
    const [showFabMenu, setShowFabMenu] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    
    // KYC Simulation State
    const [kycStatus, setKycStatus] = useState<'review' | 'approved'>('review');
    const [showApprovedBanner, setShowApprovedBanner] = useState(true);

    const userName = "John Agent"; // Mock user name
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // Simulate KYC Review Process
    useEffect(() => {
        if (kycStatus === 'review') {
            const timer = setTimeout(() => {
                setKycStatus('approved');
                showSuccess("KYC Verification Complete! Your account is now fully active.");
            }, 8000); // 8 seconds delay for demo
            return () => clearTimeout(timer);
        }
    }, [kycStatus, showSuccess]);

    return (
        <div className="w-full mx-auto px-4 md:px-8 py-6 animate-fade-in relative">
            
            {/* Mobile Action Backdrop */}
            {showFabMenu && (
                <div 
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden animate-fade-in"
                    onClick={() => setShowFabMenu(false)}
                ></div>
            )}

            {/* Mobile FAB */}
            <div className="md:hidden fixed bottom-24 right-4 z-50 flex flex-col items-end gap-3">
                {showFabMenu && (
                    <div className="flex flex-col items-end gap-3 mb-1 animate-fade-in">
                        <button 
                            onClick={() => { setView('businesses'); setShowFabMenu(false); }}
                            className="bg-white text-[#02275A] px-5 py-2.5 rounded-full shadow-xl border border-slate-100 font-bold text-sm flex items-center gap-3 transform transition-all active:scale-95"
                        >
                            <span className="whitespace-nowrap">Register Business</span>
                            <div className="w-8 h-8 rounded-full bg-[#02275A]/10 flex items-center justify-center text-[#02275A]">
                                <i className="fas fa-store"></i>
                            </div>
                        </button>
                        <button 
                            onClick={() => { setView('leads'); setShowFabMenu(false); }}
                            className="bg-white text-slate-600 px-5 py-2.5 rounded-full shadow-xl border border-slate-100 font-bold text-sm flex items-center gap-3 transform transition-all active:scale-95 delay-75"
                        >
                            <span className="whitespace-nowrap">Add Lead</span>
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                <i className="fas fa-user-plus"></i>
                            </div>
                        </button>
                    </div>
                )}
                <button 
                    onClick={() => setShowFabMenu(!showFabMenu)}
                    className={`w-14 h-14 rounded-full shadow-2xl shadow-[#02275A]/40 flex items-center justify-center text-white text-2xl transition-all duration-300 ${showFabMenu ? 'bg-rose-500 rotate-45' : 'bg-[#02275A] hover:scale-110'}`}
                >
                    <i className="fas fa-plus"></i>
                </button>
            </div>

            {/* KYC Status Banner */}
            {kycStatus === 'review' && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-4 shadow-sm relative overflow-hidden animate-fade-in">
                    <div className="absolute -right-6 -bottom-6 text-blue-100/50 pointer-events-none">
                        <i className="fas fa-file-contract text-9xl"></i>
                    </div>
                    
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-blue-600 shadow-sm shrink-0 z-10">
                        <i className="fas fa-sync-alt fa-spin"></i>
                    </div>
                    
                    <div className="flex-1 text-center sm:text-left z-10">
                        <h3 className="font-bold text-blue-900 text-sm mb-1">Identity Verification in Progress</h3>
                        <p className="text-xs text-blue-700/80 leading-relaxed">
                            Thanks for submitting your documents. Our compliance team will be reviewing your submitted KYC details. 
                            <span className="hidden sm:inline"> You will receive a notification once the process is complete.</span>
                        </p>
                    </div>
                    
                    <div className="z-10 bg-white/60 px-3 py-1 rounded-lg border border-blue-100/50">
                        <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                            Reviewing
                        </span>
                    </div>
                </div>
            )}

            {kycStatus === 'approved' && showApprovedBanner && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mb-8 flex items-center gap-4 shadow-sm animate-fade-in relative">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                        <i className="fas fa-shield-alt"></i>
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-emerald-900 text-sm mb-0.5">KYC Verified Successfully</h4>
                        <p className="text-xs text-emerald-700">
                            Your identity has been confirmed. You now have full access to withdrawals and earnings.
                        </p>
                    </div>
                    <button 
                        onClick={() => setShowApprovedBanner(false)}
                        className="text-emerald-400 hover:text-emerald-600 p-2"
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </div>
            )}

            {/* Persistent Challenge Tracker - MOVED TO TOP */}
            <FirstSaleChallenge />

            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Welcome, {userName}! 👋</h1>
                    <p className="text-sm text-slate-500 mt-1 font-medium">{today}</p>
                </div>
                <div className="hidden md:flex gap-3 w-full md:w-auto">
                    <button 
                        onClick={() => setView('leads')}
                        className="flex-1 md:flex-none bg-white border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <i className="fas fa-user-plus text-slate-400"></i> Add Lead
                    </button>
                    <button 
                        onClick={() => setView('businesses')}
                        className="flex-1 md:flex-none bg-[#02275A] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-[#02275A]/90 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <i className="fas fa-store"></i> Register Business
                    </button>
                </div>
            </div>

            {/* Insight */}
            <div className="mb-6 bg-gradient-to-r from-[#02275A]/5 via-white to-white border border-[#02275A]/10 rounded-2xl p-5 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#02275A]/10 to-blue-100/50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                
                <div className="relative z-10 flex items-start gap-4">
                    <div className="bg-white p-3 rounded-2xl text-[#02275A] shrink-0 shadow-sm border border-[#02275A]/10 flex items-center justify-center">
                        <i className="fas fa-lightbulb text-xl"></i>
                    </div>
                    <div className="flex-1 pt-0.5">
                        <h4 className="text-xs font-extrabold text-[#02275A] uppercase tracking-wider mb-1 flex items-center gap-2">
                            Insights <span className="w-1.5 h-1.5 rounded-full bg-[#02275A] animate-pulse"></span>
                        </h4>
                        <p className="text-sm text-slate-700 font-medium mb-3">
                            <span className="font-bold text-slate-900">3 Free Trial clients</span> are expiring this week. Reach out now to secure conversions.
                        </p>
                        <button 
                            onClick={() => setView('trials')}
                            className="text-xs font-bold text-white bg-[#02275A] hover:bg-[#02275A]/90 px-4 py-2 rounded-lg transition-all shadow-md shadow-[#02275A]/20 active:scale-95 flex items-center gap-2 w-fit"
                        >
                            View Clients <i className="fas fa-arrow-right"></i>
                        </button>
                    </div>
                    <button className="text-slate-300 hover:text-slate-500 transition-colors p-1"><i className="fas fa-times"></i></button>
                </div>
            </div>

            {/* Ranking Card */}
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm relative overflow-hidden mb-6 flex flex-col md:flex-row gap-6 md:items-center">
                
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                
                {/* Left Side: Rank Info */}
                <div className="relative z-10 flex-1">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-[#02275A]/5 flex items-center justify-center border border-[#02275A]/10">
                            <i className="fas fa-crown text-amber-500 text-lg"></i>
                        </div>
                        <div>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Current Rank</p>
                            <h2 className="text-3xl font-extrabold text-[#02275A] leading-tight">Rising Star</h2>
                        </div>
                    </div>
                    
                    <div className="inline-flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                        <span className="text-xs font-bold text-slate-700">Level 2</span>
                        <span className="text-xs text-slate-400 mx-1">•</span>
                        <span className="text-xs font-medium text-slate-500">Keep going!</span>
                    </div>
                </div>

                {/* Right Side: Progress Stats */}
                <div className="relative z-10 w-full md:w-1/2 bg-slate-50/50 rounded-xl p-5 border border-slate-100">
                    <div className="flex justify-between items-end mb-2">
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">XP Progress</p>
                            <p className="text-lg font-bold text-[#02275A]">700 <span className="text-sm text-slate-400 font-medium">/ 1000 XP</span></p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-0.5">Next Rank</p>
                            <p className="text-xs font-bold text-[#02275A] flex items-center justify-end gap-1">Elite <i className="fas fa-chevron-right text-[10px] text-slate-400"></i></p>
                        </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden mb-4">
                        <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 w-[70%] shadow-sm relative rounded-full">
                            <div className="absolute inset-0 bg-white/20"></div>
                        </div>
                    </div>

                    {/* Requirements */}
                    <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-200">
                         <span className="text-slate-500 font-medium">Unlock Requirement:</span>
                         <div className="flex items-center gap-2">
                             <span className="text-emerald-600 font-bold flex items-center gap-1"><i className="fas fa-check-circle"></i> Sales Volume</span>
                             <span className="font-bold text-slate-800">₦1.2M / 1.0M</span>
                         </div>
                    </div>
                </div>
            </div>

            {/* Commission & Balance Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Breakdown & Notices (Commission Status) */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between">
                    <div>
                        <h3 className="font-bold text-[#02275A] mb-4 text-xs uppercase tracking-wide">Commission Status</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg transition-colors">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                    <span className="text-sm text-slate-600">Paid Commissions</span>
                                </div>
                                <span className="font-bold text-[#02275A]">₦2,000,000</span>
                            </div>
                            <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg transition-colors">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                    <span className="text-sm text-slate-600">Unpaid / Pending</span>
                                </div>
                                <span className="font-bold text-[#02275A]">₦450,000</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Notice Area */}
                    <div className="mt-4 bg-[#02275A]/5 border border-[#02275A]/10 rounded-lg p-3 flex gap-3 items-start">
                        <i className="fas fa-info-circle text-[#02275A] mt-0.5"></i>
                        <div>
                            <p className="text-xs font-bold text-[#02275A]">Notice</p>
                            <p className="text-[10px] text-[#02275A]/80">Inability to withdraw due to low performance, improve your performance to change wallet status.</p>
                        </div>
                    </div>
                </div>

                {/* Balance Card - Blue Background */}
                <div className="bg-[#02275A] rounded-2xl p-6 text-white shadow-md relative overflow-hidden flex flex-col justify-between">
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-blue-200 text-xs font-bold uppercase tracking-wider mb-1">Withdrawable Balance</p>
                                <h3 className="text-3xl font-bold text-white">₦450,000</h3>
                            </div>
                            <button 
                                onClick={() => setShowWithdrawModal(true)} 
                                className="bg-amber-500 text-[#02275A] px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg hover:bg-amber-400 transition-colors transform active:scale-95"
                            >
                                Withdraw
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4 mt-2">
                            <div>
                                <p className="text-[10px] text-blue-200 uppercase font-bold">Total Earnings</p>
                                <p className="text-lg font-semibold text-white">₦2,450,000</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-blue-200 uppercase font-bold">Perf. Bonus</p>
                                <p className="text-lg font-semibold text-emerald-400">+₦50,000</p>
                            </div>
                        </div>
                    </div>
                    <div className="absolute right-0 bottom-0 p-4 opacity-10"><i className="fas fa-wallet text-9xl text-white"></i></div>
                </div>
            </div>

            {/* Key Metrics Grid - Removed Pending Onboardings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <MetricCard 
                    icon="fa-store" 
                    colorClass="bg-blue-50 text-blue-600" 
                    title="Total Businesses" 
                    value="142" 
                    subtext={<p className="text-xs text-emerald-600 font-semibold flex items-center gap-1"><i className="fas fa-arrow-up"></i> +12 this month</p>}
                    onClick={() => setView('businesses')}
                />
                <MetricCard 
                    icon="fa-user-plus" 
                    colorClass="bg-emerald-50 text-emerald-600" 
                    title="New Businesses" 
                    value="12" 
                    subtext={<p className="text-xs text-slate-400">Added this month</p>}
                />
                <MetricCard 
                    icon="fa-clock" 
                    colorClass="bg-blue-50 text-[#02275A]" 
                    title="Free Trials" 
                    value="8" 
                    subtext={<p className="text-xs text-indigo-600 font-semibold hover:underline">View details <i className="fas fa-arrow-right"></i></p>}
                    onClick={() => setView('trials')}
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Active vs Inactive Pie */}
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col items-center justify-center">
                    <h3 className="font-bold text-slate-800 mb-6 w-full text-left border-b border-slate-50 pb-2">Active vs Inactive</h3>
                    <div className="flex items-center gap-8">
                        <div className="w-40 h-40 rounded-full shadow-inner relative" style={{background: 'conic-gradient(#10b981 0% 75%, #f43f5e 75% 100%)'}}>
                            <div className="absolute inset-0 m-auto w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm">
                                <div className="text-center">
                                    <span className="text-xs text-slate-400">Total</span>
                                    <span className="text-slate-800 font-bold text-xl block">142</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                <div>
                                    <p className="text-xs text-slate-500">Active</p>
                                    <p className="text-sm font-bold text-slate-800">106 (75%)</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                                <div>
                                    <p className="text-xs text-slate-500">Inactive</p>
                                    <p className="text-sm font-bold text-slate-800">36 (25%)</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Radial Sales Chart */}
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col items-center justify-center">
                    <h3 className="font-bold text-slate-800 mb-6 w-full text-left border-b border-slate-50 pb-2">Target vs. Actual Sales</h3>
                    <div className="flex items-center gap-8">
                        <div className="w-40 h-40 rounded-full relative flex items-center justify-center" style={{background: 'conic-gradient(#02275A 0% 65%, #e2e8f0 65% 100%)'}}>
                            <div className="w-32 h-32 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
                                <span className="text-3xl font-bold text-[#02275A]">65%</span>
                                <span className="text-[10px] text-slate-400 uppercase tracking-wide">Achieved</span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Target Sales</p>
                                <p className="text-sm font-bold text-slate-800">₦2,000,000</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Actual Sales</p>
                                <p className="text-sm font-bold text-[#02275A]">₦1,300,000</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Rate Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-xl border border-slate-100 p-5">
                    <p className="text-xs text-slate-500 font-bold mb-3 uppercase">Lead Conversion Rate</p>
                    <div className="flex items-end justify-between">
                        <h3 className="text-3xl font-bold text-slate-800">24%</h3>
                        <div className="h-10 w-20 flex items-end gap-1">
                            <div className="bg-indigo-200 w-1/4 h-[40%] rounded-t"></div>
                            <div className="bg-indigo-300 w-1/4 h-[60%] rounded-t"></div>
                            <div className="bg-indigo-500 w-1/4 h-[80%] rounded-t"></div>
                            <div className="bg-indigo-600 w-1/4 h-full rounded-t"></div>
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2">Leads to Paid Customers</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-100 p-5">
                    <p className="text-xs text-slate-500 font-bold mb-3 uppercase">Customer Retention Rate</p>
                    <div className="flex items-end justify-between">
                        <h3 className="text-3xl font-bold text-emerald-600">92%</h3>
                        <div className="w-12 h-12 rounded-full border-4 border-emerald-100 border-t-emerald-600 flex items-center justify-center">
                            <i className="fas fa-check text-emerald-600"></i>
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2">Active customers &gt; 3 months</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-100 p-5">
                    <p className="text-xs text-slate-500 font-bold mb-3 uppercase">Churn Rate</p>
                    <div className="flex items-end justify-between">
                        <h3 className="text-3xl font-bold text-rose-600">3%</h3>
                        <div className="w-12 h-12 rounded-full border-4 border-rose-100 border-t-rose-600 flex items-center justify-center">
                            <i className="fas fa-arrow-down text-rose-600"></i>
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2">Target &lt; 5%</p>
                </div>
            </div>

            {/* Bottom Row - List & Trials */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Last Inactive Customers List */}
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-bold text-slate-800 text-sm">Last Inactive Customers</h3>
                        <button className="text-xs text-[#02275A] font-bold hover:underline" onClick={() => setView('businesses')}>View All</button>
                    </div>
                    <div className="divide-y divide-slate-50">
                        <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold">LL</div>
                                <div>
                                    <p className="text-sm font-bold text-slate-700">Lagos Logistics</p>
                                    <p className="text-[10px] text-rose-500 font-semibold"><i className="fas fa-clock"></i> Inactive: 32 days</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="w-8 h-8 rounded-full bg-[#02275A]/10 text-[#02275A] flex items-center justify-center hover:bg-[#02275A]/20"><i className="fas fa-phone"></i></button>
                                <button className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100"><i className="fas fa-comment-dots"></i></button>
                            </div>
                        </div>
                        <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold">TF</div>
                                <div>
                                    <p className="text-sm font-bold text-slate-700">Tantalizers Festac</p>
                                    <p className="text-[10px] text-rose-500 font-semibold"><i className="fas fa-clock"></i> Inactive: 45 days</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="w-8 h-8 rounded-full bg-[#02275A]/10 text-[#02275A] flex items-center justify-center hover:bg-[#02275A]/20"><i className="fas fa-phone"></i></button>
                                <button className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100"><i className="fas fa-comment-dots"></i></button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Free Trials Ending */}
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-bold text-slate-800 text-sm">Free Trials Ending</h3>
                        <button className="text-xs text-[#02275A] font-bold hover:underline" onClick={() => setView('trials')}>View All</button>
                    </div>
                    <div className="divide-y divide-slate-50">
                        <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#02275A] text-xs font-bold">TF</div>
                                <div>
                                    <p className="text-sm font-bold text-slate-700">Tantalizers Festac</p>
                                    <p className="text-[10px] text-rose-500 font-semibold"><i className="fas fa-clock"></i> Expires: 2 days</p>
                                </div>
                            </div>
                            <button className="px-3 py-1 bg-[#02275A] text-white text-[10px] font-bold rounded hover:opacity-90 shadow-sm">Convert</button>
                        </div>
                        <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold">KM</div>
                                <div>
                                    <p className="text-sm font-bold text-slate-700">K-Mart Stores</p>
                                    <p className="text-[10px] text-amber-500 font-semibold"><i className="fas fa-clock"></i> Expires: 9 days</p>
                                </div>
                            </div>
                            <button className="px-3 py-1 bg-white border border-[#02275A] text-[#02275A] text-[10px] font-bold rounded hover:bg-slate-50">Follow Up</button>
                        </div>
                    </div>
                </div>
            </div>

            <WithdrawalModal 
                isOpen={showWithdrawModal} 
                onClose={() => setShowWithdrawModal(false)} 
                availableBalance="450,000" 
            />

        </div>
    );
};

export default DashboardView;
