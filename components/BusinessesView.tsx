
import React, { useState } from 'react';
import RegistrationModal from './RegistrationModal';
import ViewBusinessModal from './ViewBusinessModal';
import SubscriptionHistoryModal from './SubscriptionHistoryModal';
import AddExtraModal from './AddExtraModal';
import UpgradePlanModal from './UpgradePlanModal';
import LogComplaintModal from './LogComplaintModal';
import PaymentModal from './PaymentModal';
import MobileMoneyPaymentModal from './MobileMoneyPaymentModal';
import { Business, Complaint } from '../types';

interface BusinessesViewProps {
    setView: (view: string) => void;
    businesses: Business[];
    setBusinesses: React.Dispatch<React.SetStateAction<Business[]>>;
    complaints: Complaint[];
    onAddComplaint: (complaint: Complaint) => void;
    onUpdateComplaint: (complaint: Complaint) => void;
    onRegisterSuccess: (data: any) => void;
    userCountry?: string;
}

const BusinessesView: React.FC<BusinessesViewProps> = ({ setView, businesses, setBusinesses, complaints, onAddComplaint, onUpdateComplaint, onRegisterSuccess, userCountry = 'Nigeria' }) => {
    const [showModal, setShowModal] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [addExtraModalOpen, setAddExtraModalOpen] = useState(false);
    const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
    const [logComplaintModalOpen, setLogComplaintModalOpen] = useState(false);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null); 
    const [activeTab, setActiveTab] = useState('All');
    
    // Calculate counts
    const counts = {
        All: businesses.length,
        Active: businesses.filter(b => ['Completed', 'Engaged'].includes(b.status)).length,
        Inactive: businesses.filter(b => b.status === 'Dormant').length,
        Pending: businesses.filter(b => b.status === 'Pending').length,
    };

    const tabs = [
        { id: 'All', label: 'All Businesses', count: counts.All },
        { id: 'Active', label: 'Active', count: counts.Active },
        { id: 'Inactive', label: 'Inactive / Dormant', count: counts.Inactive },
        { id: 'Pending', label: 'Pending Onboarding', count: counts.Pending },
    ];

    // Filter logic
    const filteredData = businesses.filter(biz => {
        const term = searchTerm.toLowerCase();
        const matchesSearch = (
            biz.name.toLowerCase().includes(term) ||
            biz.owner.toLowerCase().includes(term) ||
            biz.id.toLowerCase().includes(term) || 
            biz.phone.includes(term)
        );

        let matchesTab = true;
        if (activeTab === 'Active') matchesTab = ['Completed', 'Engaged'].includes(biz.status);
        else if (activeTab === 'Inactive') matchesTab = biz.status === 'Dormant';
        else if (activeTab === 'Pending') matchesTab = biz.status === 'Pending';
        
        return matchesSearch && matchesTab;
    });

    const handleViewClick = (business: Business) => {
        setSelectedBusiness(business);
        setViewModalOpen(true);
    };

    const handleHistoryClick = (business: Business) => {
        setSelectedBusiness(business);
        setHistoryModalOpen(true);
    }

    const handleActionClick = (action: string, business: Business) => {
        setOpenActionMenuId(null);
        setSelectedBusiness(business);

        if (action === 'view') {
            setViewModalOpen(true);
        } else if (action === 'sub') {
            setHistoryModalOpen(true);
        } else if (action === 'extra') {
            setAddExtraModalOpen(true);
        } else if (action === 'upgrade') {
            setUpgradeModalOpen(true);
        } else if (action === 'complaint') {
            setLogComplaintModalOpen(true);
        } else if (action === 'payment') {
            setPaymentModalOpen(true);
        } else {
            // Placeholder for future features
            alert(`Action: ${action} for ${business.name}`);
        }
    };

    const handleSaveBusiness = (id: string, updatedData: Partial<Business>) => {
        const updatedList = businesses.map(b => b.id === id ? { ...b, ...updatedData } : b);
        setBusinesses(updatedList);
    };

    const handleRegistration = (data: any) => {
        setShowModal(false);
        onRegisterSuccess(data);
    };

    return (
        <div className="w-full mx-auto px-4 md:px-8 py-6 animate-fade-in" onClick={() => setOpenActionMenuId(null)}>
            {/* Header & Register Action */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 className="text-lg font-bold text-slate-800">Manage Businesses</h2>
                <button onClick={(e) => { e.stopPropagation(); setShowModal(true); }} className="w-full md:w-auto bg-[#02275A] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-[#02275A]/90 flex items-center justify-center gap-2 transition-all active:scale-95">
                    <i className="fas fa-plus"></i> Register New Business
                </button>
            </div>

            {/* Search Bar */}
            <div className="w-full relative mb-4">
                <span className="absolute left-3 top-3 text-slate-400"><i className="fas fa-search"></i></span>
                <input 
                    type="text" 
                    placeholder="Search businesses by name, owner, or ID..." 
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#02275A] shadow-sm transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Tabs - Pill Style */}
            <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
                {tabs.map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`whitespace-nowrap px-4 py-2 text-sm font-bold rounded-lg transition-all border flex items-center gap-2 ${
                            activeTab === tab.id 
                            ? 'bg-[#02275A] text-white border-[#02275A] shadow-md' 
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        <span>{tab.label}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                            activeTab === tab.id 
                            ? 'bg-white/20 text-white' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Dropdown Filters */}
            <div className="flex flex-col md:flex-row items-center gap-3 mb-6">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mr-auto w-full md:w-auto">
                    <i className="fas fa-filter"></i> Filters:
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 w-full md:w-auto">
                    <select className="bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg px-3 py-2 outline-none hover:border-[#02275A]/50 w-full">
                        <option>Status: All</option>
                        <option>Engaged</option>
                        <option>Dormant</option>
                        <option>Pending</option>
                    </select>
                    <select className="bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg px-3 py-2 outline-none hover:border-[#02275A]/50 w-full">
                        <option>Verification: All</option>
                        <option>Verified</option>
                        <option>Unverified</option>
                    </select>
                    <select className="bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg px-3 py-2 outline-none hover:border-[#02275A]/50 w-full col-span-2 md:col-span-1">
                        <option>Plan: All</option>
                        <option>Basic</option>
                        <option>Standard</option>
                        <option>Premium</option>
                        <option>Ultimate</option>
                    </select>
                </div>
            </div>

            {/* Desktop Table View (Hidden on Mobile) */}
            <div className="hidden md:block bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden min-h-[300px]">
                <div className="overflow-x-auto overflow-y-visible">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-xs text-slate-500 uppercase tracking-wider">
                                <th className="p-4 font-bold">Business</th>
                                <th className="p-4 font-bold">Owner</th>
                                <th className="p-4 font-bold">Phone</th>
                                <th className="p-4 font-bold">Plan</th>
                                <th className="p-4 font-bold text-center">Onboard Status</th>
                                <th className="p-4 font-bold text-center">Contact Verified</th>
                                <th className="p-4 font-bold text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-sm">
                            {filteredData.map((biz) => (
                                <tr key={biz.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-bold text-slate-800">{biz.name}</div>
                                        <div className="text-xs text-slate-500">ID: #{biz.id}</div>
                                        <div className="text-[10px] text-[#02275A] mt-1">{biz.category}</div>
                                    </td>
                                    <td className="p-4 text-slate-600">{biz.owner}</td>
                                    <td className="p-4 text-slate-600">{biz.phone}</td>
                                    <td className="p-4"><span className={`${biz.planClass} px-2 py-1 rounded text-xs font-bold`}>{biz.plan}</span></td>
                                    <td className="p-4 text-center"><span className={`${biz.statusClass} px-2 py-1 rounded-full text-xs font-bold`}>{biz.status}</span></td>
                                    <td className={`p-4 text-center ${biz.verified ? 'text-emerald-500' : 'text-slate-300'}`}>
                                        <i className={`fas ${biz.verified ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                                    </td>
                                    <td className="p-4 text-right relative">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setOpenActionMenuId(openActionMenuId === biz.id ? null : biz.id); }}
                                            className="text-slate-400 hover:text-[#02275A] p-2 rounded-full hover:bg-[#02275A]/5 transition-colors"
                                        >
                                            <i className="fas fa-ellipsis-v"></i>
                                        </button>
                                        {openActionMenuId === biz.id && (
                                            <div className="absolute right-8 top-8 mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-100 z-50 overflow-hidden text-left animate-fade-in">
                                                <button onClick={(e) => { e.stopPropagation(); handleActionClick('payment', biz); }} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2 border-b border-slate-50">
                                                    <i className="fas fa-credit-card text-emerald-500"></i> Payment
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); handleActionClick('view', biz); }} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-b border-slate-50">
                                                    <i className="fas fa-eye text-[#02275A]"></i> View Business
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); handleActionClick('sub', biz); }} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2 border-b border-slate-50">
                                                    <i className="fas fa-file-invoice"></i> Subscription
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); handleActionClick('extra', biz); }} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2 border-b border-slate-50">
                                                    <i className="fas fa-plus-circle"></i> Add Extra
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); handleActionClick('upgrade', biz); }} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2 border-b border-slate-50">
                                                    <i className="fas fa-arrow-up"></i> Upgrade Plan
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); handleActionClick('complaint', biz); }} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                                                    <i className="fas fa-exclamation-circle text-rose-500"></i> Log Complaint
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredData.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-slate-500">No businesses found matching your search.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile List View (Hidden on Desktop) */}
            <div className="md:hidden space-y-4">
                {filteredData.map((biz) => (
                    <div key={biz.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-3 relative">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-slate-800">{biz.name}</h3>
                                <span className="text-xs text-slate-500">ID: #{biz.id} • {biz.category}</span>
                            </div>
                            <div className="relative">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setOpenActionMenuId(openActionMenuId === biz.id ? null : biz.id); }}
                                    className="text-slate-400 p-2"
                                >
                                    <i className="fas fa-ellipsis-v"></i>
                                </button>
                                {openActionMenuId === biz.id && (
                                    <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden text-left">
                                        <button onClick={(e) => { e.stopPropagation(); handleActionClick('payment', biz); }} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2 border-b border-slate-50">
                                            <i className="fas fa-credit-card text-emerald-500"></i> Payment
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); handleActionClick('view', biz); }} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-b border-slate-50">
                                            <i className="fas fa-eye text-[#02275A]"></i> View Business
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); handleActionClick('sub', biz); }} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2 border-b border-slate-50">
                                            <i className="fas fa-file-invoice"></i> Subscription
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); handleActionClick('extra', biz); }} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2 border-b border-slate-50">
                                            <i className="fas fa-plus-circle"></i> Add Extra
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); handleActionClick('upgrade', biz); }} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2 border-b border-slate-50">
                                            <i className="fas fa-arrow-up"></i> Upgrade Plan
                                        </button>
                                         <button onClick={(e) => { e.stopPropagation(); handleActionClick('complaint', biz); }} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                                            <i className="fas fa-exclamation-circle text-rose-500"></i> Log Complaint
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-y-2 text-sm">
                            <div>
                                <p className="text-xs text-slate-400">Owner</p>
                                <p className="font-medium text-slate-700">{biz.owner}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-400">Phone</p>
                                <p className="font-medium text-slate-700">{biz.phone}</p>
                            </div>
                            <div className="flex items-center gap-1 mt-2">
                                <span className={`${biz.planClass} px-2 py-0.5 rounded text-[10px] font-bold uppercase`}>{biz.plan}</span>
                            </div>
                            <div className="text-right mt-2">
                                <span className={`${biz.statusClass} px-2 py-0.5 rounded-full text-[10px] font-bold uppercase`}>{biz.status}</span>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-slate-50 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <i className={`fas ${biz.verified ? 'fa-check-circle text-emerald-500' : 'fa-times-circle text-slate-300'}`}></i>
                                <span className="text-xs text-slate-500">{biz.verified ? 'Verified' : 'Unverified'}</span>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); handleActionClick('view', biz); }} className="text-xs font-bold text-[#02275A] bg-[#02275A]/10 px-3 py-1.5 rounded-lg">Manage</button>
                        </div>
                    </div>
                ))}
                    {filteredData.length === 0 && (
                        <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-100">No businesses found.</div>
                )}
            </div>

            {/* Pagination */}
            <div className="mt-4 p-4 md:bg-white md:rounded-xl md:border md:border-slate-100 flex justify-between items-center text-xs text-slate-500">
                <span>Showing {filteredData.length} of {businesses.length} businesses</span>
                <div className="flex gap-2">
                    <button className="px-3 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50">Prev</button>
                    <button className="px-3 py-1 bg-[#02275A] text-white rounded shadow">1</button>
                    <button className="px-3 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50">2</button>
                    <button className="px-3 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50">Next</button>
                </div>
            </div>

            {/* Registration Modal */}
            <RegistrationModal isOpen={showModal} onClose={() => setShowModal(false)} onSuccess={handleRegistration} userCountry={userCountry} />
            
            {/* View Business Modal */}
            <ViewBusinessModal 
                isOpen={viewModalOpen} 
                onClose={() => setViewModalOpen(false)} 
                business={selectedBusiness}
                onSave={handleSaveBusiness} 
            />

            {/* Subscription History Modal */}
            <SubscriptionHistoryModal 
                isOpen={historyModalOpen} 
                onClose={() => setHistoryModalOpen(false)} 
                business={selectedBusiness} 
            />

            {/* Add Extra Modal */}
            <AddExtraModal 
                isOpen={addExtraModalOpen} 
                onClose={() => setAddExtraModalOpen(false)} 
                business={selectedBusiness} 
            />

            {/* Upgrade Plan Modal */}
            <UpgradePlanModal 
                isOpen={upgradeModalOpen} 
                onClose={() => setUpgradeModalOpen(false)} 
                business={selectedBusiness} 
            />

            {/* LogComplaintModal */}
            <LogComplaintModal 
                isOpen={logComplaintModalOpen} 
                onClose={() => setLogComplaintModalOpen(false)} 
                business={selectedBusiness}
                complaints={complaints}
                onAddComplaint={onAddComplaint}
                onUpdateComplaint={onUpdateComplaint}
            />

            {/* Payment Modal */}
            {userCountry === 'Nigeria' ? (
                <PaymentModal 
                    isOpen={paymentModalOpen}
                    onClose={() => setPaymentModalOpen(false)}
                    business={selectedBusiness}
                />
            ) : (
                <MobileMoneyPaymentModal 
                    isOpen={paymentModalOpen}
                    onClose={() => setPaymentModalOpen(false)}
                    business={selectedBusiness}
                    country={userCountry}
                />
            )}
        </div>
    );
};

export default BusinessesView;
