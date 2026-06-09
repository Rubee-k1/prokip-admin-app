import React, { useState } from 'react';
import { useAlert } from '../contexts/AlertContext';

const AdminSettingsView: React.FC = () => {
    const { showSuccess } = useAlert();
    const [activeTab, setActiveTab] = useState<'general' | 'commissions' | 'gamification'>('general');

    // --- SETTINGS STATE ---
    
    // General
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [allowRegistrations, setAllowRegistrations] = useState(true);
    const [sendReports, setSendReports] = useState(true);

    // Commissions
    const [commissionSettings, setCommissionSettings] = useState({
        agentBase: 10,
        managerOverride: 5,
        planCommission: 10,
        addonCommission: 10,
        serviceCommission: 100
    });

    // Gamification - Agent Badges
    const [agentBadges, setAgentBadges] = useState({
        firstSaleXP: 500,
        fastStarterSales: 5,
        fastStarterDays: 7,
        millionaireClubRevenue: 1000000,
        retentionKingRate: 95,
        retentionKingMonths: 3,
        upsellGuruAmount: 500000,
        supportHeroRating: 4.8,
        streakMasterMonths: 3,
        referralProCount: 5
    });

    // Gamification - Agent Ranks
    const [agentRankRequirements, setAgentRankRequirements] = useState({
        newStarSales: 20000,
        risingStarSales: 500000,
        superStarSales: 1500000,
        proSales: 3000000,
        eliteSales: 5000000,
        masterSales: 10000000
    });

    // Gamification - Manager Badges
    const [managerBadges, setManagerBadges] = useState({
        stateLaunchXP: 5000,
        revenueTitanTarget: 50000000,
        teamBuilderCount: 20,
        retentionGuardianRate: 90,
        retentionGuardianMonths: 6,
        expansionMasterZones: 5,
        millionaireMakerCount: 5,
        centuryClubCount: 100,
        zeroChurnMonths: 3
    });

    // Gamification - Manager Ranks
    const [managerRankRequirements, setManagerRankRequirements] = useState({
        seniorStateManagerRevenue: 100000000,
        regionalManagerXP: 1000000,
        nationalDirectorXP: 2500000,
        internationalLeaderXP: 5000000
    });

    const handleSave = () => {
        // Simulate API call
        setTimeout(() => {
            showSuccess('Settings saved successfully.');
        }, 500);
    };

    return (
        <div className="p-6 animate-fade-in space-y-6 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Admin Settings</h1>
                    <p className="text-sm text-slate-500">Configure system-wide preferences, commissions, and rewards.</p>
                </div>
                <button 
                    onClick={handleSave}
                    className="bg-[#02275A] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#02275A]/90 transition-colors shadow-lg shadow-blue-900/20 flex items-center gap-2"
                >
                    <i className="fas fa-save"></i> Save Changes
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar">
                <button 
                    onClick={() => setActiveTab('general')}
                    className={`px-6 py-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === 'general' ? 'border-[#02275A] text-[#02275A]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    General
                </button>
                <button 
                    onClick={() => setActiveTab('commissions')}
                    className={`px-6 py-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === 'commissions' ? 'border-[#02275A] text-[#02275A]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    Commissions & Payouts
                </button>
                <button 
                    onClick={() => setActiveTab('gamification')}
                    className={`px-6 py-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === 'gamification' ? 'border-[#02275A] text-[#02275A]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    Gamification & Rewards
                </button>
            </div>
            
            {/* --- GENERAL TAB --- */}
            {activeTab === 'general' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <i className="fas fa-cogs text-slate-400"></i> System Preferences
                        </h3>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="block text-sm font-bold text-slate-700">Enable Maintenance Mode</span>
                                    <span className="text-xs text-slate-500">Prevents users from logging in during updates.</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer" 
                                        checked={maintenanceMode}
                                        onChange={(e) => setMaintenanceMode(e.target.checked)}
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#02275A]"></div>
                                </label>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="block text-sm font-bold text-slate-700">Allow New User Registrations</span>
                                    <span className="text-xs text-slate-500">If disabled, only admins can create accounts.</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer" 
                                        checked={allowRegistrations}
                                        onChange={(e) => setAllowRegistrations(e.target.checked)}
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#02275A]"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <i className="fas fa-bell text-slate-400"></i> Notifications
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="block text-sm font-bold text-slate-700">Send Weekly Reports</span>
                                    <span className="text-xs text-slate-500">Automatically email performance summaries to managers.</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer" 
                                        checked={sendReports}
                                        onChange={(e) => setSendReports(e.target.checked)}
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#02275A]"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- COMMISSIONS TAB --- */}
            {activeTab === 'commissions' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <i className="fas fa-percentage text-emerald-500"></i> Default Commission Rates
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Role Based */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">By Role</h4>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Agent Base Commission (%)</label>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#02275A] font-bold text-slate-800"
                                            value={commissionSettings.agentBase}
                                            onChange={(e) => setCommissionSettings({...commissionSettings, agentBase: parseFloat(e.target.value)})}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1">Standard rate for new sales.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Manager Override (%)</label>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#02275A] font-bold text-slate-800"
                                            value={commissionSettings.managerOverride}
                                            onChange={(e) => setCommissionSettings({...commissionSettings, managerOverride: parseFloat(e.target.value)})}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1">Override on team sales.</p>
                                </div>
                            </div>

                            {/* Product Based */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">By Product Type</h4>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Subscription Plans (%)</label>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#02275A] font-bold text-slate-800"
                                            value={commissionSettings.planCommission}
                                            onChange={(e) => setCommissionSettings({...commissionSettings, planCommission: parseFloat(e.target.value)})}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Add-ons (%)</label>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#02275A] font-bold text-slate-800"
                                            value={commissionSettings.addonCommission}
                                            onChange={(e) => setCommissionSettings({...commissionSettings, addonCommission: parseFloat(e.target.value)})}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Custom Services (%)</label>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#02275A] font-bold text-slate-800"
                                            value={commissionSettings.serviceCommission}
                                            onChange={(e) => setCommissionSettings({...commissionSettings, serviceCommission: parseFloat(e.target.value)})}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1">E.g. Setup fees, training (usually 100%).</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- GAMIFICATION TAB --- */}
            {activeTab === 'gamification' && (
                <div className="space-y-6 animate-fade-in">
                    
                    {/* Agent Badges Section */}
                    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                <i className="fas fa-user-tie"></i>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">Agent Badge Requirements</h3>
                                <p className="text-xs text-slate-500">Set milestones for agent achievements.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Fast Starter */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <i className="fas fa-bolt text-amber-500"></i>
                                    <h4 className="font-bold text-slate-700 text-sm">Fast Starter</h4>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Sales Required</label>
                                        <input type="number" className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold"
                                            value={agentBadges.fastStarterSales}
                                            onChange={(e) => setAgentBadges({...agentBadges, fastStarterSales: parseInt(e.target.value)})} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Timeframe (Days)</label>
                                        <input type="number" className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold"
                                            value={agentBadges.fastStarterDays}
                                            onChange={(e) => setAgentBadges({...agentBadges, fastStarterDays: parseInt(e.target.value)})} />
                                    </div>
                                </div>
                            </div>

                            {/* Millionaire Club */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <i className="fas fa-money-bill-wave text-emerald-500"></i>
                                    <h4 className="font-bold text-slate-700 text-sm">Millionaire Club</h4>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Revenue Target (₦)</label>
                                    <input type="number" className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold"
                                        value={agentBadges.millionaireClubRevenue}
                                        onChange={(e) => setAgentBadges({...agentBadges, millionaireClubRevenue: parseInt(e.target.value)})} />
                                </div>
                            </div>

                            {/* Retention King */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <i className="fas fa-crown text-purple-500"></i>
                                    <h4 className="font-bold text-slate-700 text-sm">Retention King</h4>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Min Retention Rate (%)</label>
                                        <input type="number" className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold"
                                            value={agentBadges.retentionKingRate}
                                            onChange={(e) => setAgentBadges({...agentBadges, retentionKingRate: parseInt(e.target.value)})} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Duration (Months)</label>
                                        <input type="number" className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold"
                                            value={agentBadges.retentionKingMonths}
                                            onChange={(e) => setAgentBadges({...agentBadges, retentionKingMonths: parseInt(e.target.value)})} />
                                    </div>
                                </div>
                            </div>

                            {/* Upsell Guru */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <i className="fas fa-level-up-alt text-pink-500"></i>
                                    <h4 className="font-bold text-slate-700 text-sm">Upsell Guru</h4>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Upsell Amount (₦)</label>
                                    <input type="number" className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold"
                                        value={agentBadges.upsellGuruAmount}
                                        onChange={(e) => setAgentBadges({...agentBadges, upsellGuruAmount: parseInt(e.target.value)})} />
                                </div>
                            </div>

                            {/* Support Hero */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <i className="fas fa-headset text-blue-400"></i>
                                    <h4 className="font-bold text-slate-700 text-sm">Support Hero</h4>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Min Rating (Stars)</label>
                                    <input type="number" step="0.1" max="5" className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold"
                                        value={agentBadges.supportHeroRating}
                                        onChange={(e) => setAgentBadges({...agentBadges, supportHeroRating: parseFloat(e.target.value)})} />
                                </div>
                            </div>

                            {/* Streak Master */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <i className="fas fa-fire text-orange-500"></i>
                                    <h4 className="font-bold text-slate-700 text-sm">Streak Master</h4>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Consecutive Months</label>
                                    <input type="number" className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold"
                                        value={agentBadges.streakMasterMonths}
                                        onChange={(e) => setAgentBadges({...agentBadges, streakMasterMonths: parseInt(e.target.value)})} />
                                </div>
                            </div>

                            {/* Referral Pro */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <i className="fas fa-users text-indigo-500"></i>
                                    <h4 className="font-bold text-slate-700 text-sm">Referral Pro</h4>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Referrals Count</label>
                                    <input type="number" className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold"
                                        value={agentBadges.referralProCount}
                                        onChange={(e) => setAgentBadges({...agentBadges, referralProCount: parseInt(e.target.value)})} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Agent Rank Progression */}
                    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                                <i className="fas fa-layer-group"></i>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">Agent Rank Progression</h3>
                                <p className="text-xs text-slate-500">Set sales milestones for rank advancement.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* New Star */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 relative overflow-hidden">
                                <h4 className="font-bold text-slate-700 text-sm mb-3">New Star</h4>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Sales Target (₦)</label>
                                    <input type="number" className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold"
                                        value={agentRankRequirements.newStarSales}
                                        onChange={(e) => setAgentRankRequirements({...agentRankRequirements, newStarSales: parseInt(e.target.value)})} />
                                </div>
                            </div>

                            {/* Rising Star */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 relative overflow-hidden">
                                <h4 className="font-bold text-slate-700 text-sm mb-3">Rising Star</h4>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Sales Target (₦)</label>
                                    <input type="number" className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold"
                                        value={agentRankRequirements.risingStarSales}
                                        onChange={(e) => setAgentRankRequirements({...agentRankRequirements, risingStarSales: parseInt(e.target.value)})} />
                                </div>
                            </div>

                            {/* Super Star */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 relative overflow-hidden">
                                <h4 className="font-bold text-slate-700 text-sm mb-3">Super Star</h4>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Sales Target (₦)</label>
                                    <input type="number" className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold"
                                        value={agentRankRequirements.superStarSales}
                                        onChange={(e) => setAgentRankRequirements({...agentRankRequirements, superStarSales: parseInt(e.target.value)})} />
                                </div>
                            </div>

                            {/* Pro */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 relative overflow-hidden">
                                <h4 className="font-bold text-slate-700 text-sm mb-3">Pro</h4>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Sales Target (₦)</label>
                                    <input type="number" className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold"
                                        value={agentRankRequirements.proSales}
                                        onChange={(e) => setAgentRankRequirements({...agentRankRequirements, proSales: parseInt(e.target.value)})} />
                                </div>
                            </div>

                            {/* Elite */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 relative overflow-hidden">
                                <h4 className="font-bold text-slate-700 text-sm mb-3">Elite</h4>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Sales Target (₦)</label>
                                    <input type="number" className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold"
                                        value={agentRankRequirements.eliteSales}
                                        onChange={(e) => setAgentRankRequirements({...agentRankRequirements, eliteSales: parseInt(e.target.value)})} />
                                </div>
                            </div>

                            {/* Master */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 relative overflow-hidden">
                                <h4 className="font-bold text-slate-700 text-sm mb-3">Master</h4>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Sales Target (₦)</label>
                                    <input type="number" className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold"
                                        value={agentRankRequirements.masterSales}
                                        onChange={(e) => setAgentRankRequirements({...agentRankRequirements, masterSales: parseInt(e.target.value)})} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Manager Badges Section */}
                    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                <i className="fas fa-briefcase"></i>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">Manager Badge Requirements</h3>
                                <p className="text-xs text-slate-500">Set milestones for state manager achievements.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Revenue Titan */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <i className="fas fa-money-bill-wave text-amber-500"></i>
                                    <h4 className="font-bold text-slate-700 text-sm">Revenue Titan</h4>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">State Revenue Target (₦)</label>
                                    <input type="number" className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold"
                                        value={managerBadges.revenueTitanTarget}
                                        onChange={(e) => setManagerBadges({...managerBadges, revenueTitanTarget: parseInt(e.target.value)})} />
                                </div>
                            </div>

                            {/* Team Builder */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <i className="fas fa-users text-blue-500"></i>
                                    <h4 className="font-bold text-slate-700 text-sm">Team Builder</h4>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Active Agents Count</label>
                                    <input type="number" className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold"
                                        value={managerBadges.teamBuilderCount}
                                        onChange={(e) => setManagerBadges({...managerBadges, teamBuilderCount: parseInt(e.target.value)})} />
                                </div>
                            </div>

                            {/* Expansion Master */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <i className="fas fa-map-marked-alt text-cyan-500"></i>
                                    <h4 className="font-bold text-slate-700 text-sm">Expansion Master</h4>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">New Zones Opened</label>
                                    <input type="number" className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold"
                                        value={managerBadges.expansionMasterZones}
                                        onChange={(e) => setManagerBadges({...managerBadges, expansionMasterZones: parseInt(e.target.value)})} />
                                </div>
                            </div>

                            {/* Retention Guardian */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <i className="fas fa-shield-alt text-purple-500"></i>
                                    <h4 className="font-bold text-slate-700 text-sm">Retention Guardian</h4>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Min Retention Rate (%)</label>
                                        <input type="number" className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold"
                                            value={managerBadges.retentionGuardianRate}
                                            onChange={(e) => setManagerBadges({...managerBadges, retentionGuardianRate: parseInt(e.target.value)})} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Duration (Months)</label>
                                        <input type="number" className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold"
                                            value={managerBadges.retentionGuardianMonths}
                                            onChange={(e) => setManagerBadges({...managerBadges, retentionGuardianMonths: parseInt(e.target.value)})} />
                                    </div>
                                </div>
                            </div>

                            {/* Millionaire Maker */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <i className="fas fa-hand-holding-usd text-rose-500"></i>
                                    <h4 className="font-bold text-slate-700 text-sm">Millionaire Maker</h4>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Agents w/ ₦1M+ Sales</label>
                                    <input type="number" className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold"
                                        value={managerBadges.millionaireMakerCount}
                                        onChange={(e) => setManagerBadges({...managerBadges, millionaireMakerCount: parseInt(e.target.value)})} />
                                </div>
                            </div>

                            {/* Century Club */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <i className="fas fa-building text-slate-500"></i>
                                    <h4 className="font-bold text-slate-700 text-sm">Century Club</h4>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Businesses Onboarded</label>
                                    <input type="number" className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold"
                                        value={managerBadges.centuryClubCount}
                                        onChange={(e) => setManagerBadges({...managerBadges, centuryClubCount: parseInt(e.target.value)})} />
                                </div>
                            </div>

                            {/* Zero Churn */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <i className="fas fa-infinity text-teal-500"></i>
                                    <h4 className="font-bold text-slate-700 text-sm">Zero Churn</h4>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Duration (Months)</label>
                                    <input type="number" className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold"
                                        value={managerBadges.zeroChurnMonths}
                                        onChange={(e) => setManagerBadges({...managerBadges, zeroChurnMonths: parseInt(e.target.value)})} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Manager Rank Progression */}
                    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                <i className="fas fa-chart-line"></i>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">Manager Rank Progression</h3>
                                <p className="text-xs text-slate-500">Set milestones for manager career advancement.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Senior State Manager */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 relative overflow-hidden">
                                <h4 className="font-bold text-slate-700 text-sm mb-3">Senior State Manager</h4>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">State Revenue Target (₦)</label>
                                    <input type="number" className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold"
                                        value={managerRankRequirements.seniorStateManagerRevenue}
                                        onChange={(e) => setManagerRankRequirements({...managerRankRequirements, seniorStateManagerRevenue: parseInt(e.target.value)})} />
                                </div>
                            </div>

                            {/* Regional Manager */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 relative overflow-hidden">
                                <h4 className="font-bold text-slate-700 text-sm mb-3">Regional Manager</h4>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">XP Required</label>
                                    <input type="number" className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold"
                                        value={managerRankRequirements.regionalManagerXP}
                                        onChange={(e) => setManagerRankRequirements({...managerRankRequirements, regionalManagerXP: parseInt(e.target.value)})} />
                                </div>
                            </div>

                            {/* National Director */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 relative overflow-hidden">
                                <h4 className="font-bold text-slate-700 text-sm mb-3">National Director</h4>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">XP Required</label>
                                    <input type="number" className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold"
                                        value={managerRankRequirements.nationalDirectorXP}
                                        onChange={(e) => setManagerRankRequirements({...managerRankRequirements, nationalDirectorXP: parseInt(e.target.value)})} />
                                </div>
                            </div>

                            {/* International Leader */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 relative overflow-hidden">
                                <h4 className="font-bold text-slate-700 text-sm mb-3">International Leader</h4>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">XP Required</label>
                                    <input type="number" className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold"
                                        value={managerRankRequirements.internationalLeaderXP}
                                        onChange={(e) => setManagerRankRequirements({...managerRankRequirements, internationalLeaderXP: parseInt(e.target.value)})} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSettingsView;
