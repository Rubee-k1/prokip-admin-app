
import React, { useState } from 'react';
import { UpsellOpportunity } from '../types';

const UpsellView: React.FC = () => {
    const [filter, setFilter] = useState('All');

    // SMART UPSELL DATA based on user scenarios
    const upsellOpportunities: UpsellOpportunity[] = [
        {
            id: 1,
            business: "Mama Cass",
            type: "Service Upgrade",
            trigger: "High Transaction Volume (Top 5%)",
            suggestion: "E-commerce Website Design",
            reason: "Processing >500 daily txns. Business is ready for online expansion to capture more sales.",
            revenue: "₦150,000",
            icon: "fa-globe",
            color: "bg-purple-100 text-purple-700",
            action: "Pitch Website"
        },
        {
            id: 2,
            business: "City Pharmacy",
            type: "Module Cross-sell",
            trigger: "Business Type: Pharmacy",
            suggestion: "Expiry Date Management Module",
            reason: "Active for 45 days without Expiry Module. Critical for reducing loss in pharmacies.",
            revenue: "₦25,000",
            icon: "fa-cubes",
            color: "bg-blue-100 text-blue-700",
            action: "Pitch Module"
        },
        {
            id: 3,
            business: "Okafor Hardware",
            type: "User License",
            trigger: "Staff Count Discrepancy",
            suggestion: "Add 3 Extra User Licenses",
            reason: "Registered 5 staff during onboarding but currently paying for only 2 users.",
            revenue: "₦45,000",
            icon: "fa-users",
            color: "bg-amber-100 text-amber-700",
            action: "Pitch Licenses"
        },
        {
            id: 4,
            business: "Bisi Cakes",
            type: "Referral",
            trigger: "High Rating (5 Stars)",
            suggestion: "Request Referral",
            reason: "Gave a 5-star rating yesterday. Happy customers are 3x more likely to refer others.",
            revenue: "₦10,000 (Bonus)",
            icon: "fa-heart",
            color: "bg-rose-100 text-rose-700",
            action: "Ask for Referral"
        },
        {
            id: 5,
            business: "Lagos Logistics",
            type: "Location Expansion",
            trigger: "Multiple Locations Detected",
            suggestion: "Multi-Location Sync Add-on",
            reason: "Operating from 3 distinct locations based on login IP, but on a single location plan.",
            revenue: "₦60,000",
            icon: "fa-map-marker-alt",
            color: "bg-emerald-100 text-emerald-700",
            action: "Pitch Sync"
        }
    ];

    const filteredOpp = filter === 'All' ? upsellOpportunities : upsellOpportunities.filter(o => o.type === filter);

    // Calculate Total Potential Revenue
    const totalRevenue = upsellOpportunities.reduce((acc, curr) => {
        const amount = parseInt(curr.revenue.replace(/[^0-9]/g, '')) || 0;
        return acc + amount;
    }, 0);

    return (
        <div className="w-full mx-auto px-4 md:px-8 py-6 animate-fade-in">
            
            {/* Header Summary */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-2xl mb-8 border border-amber-100 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left shadow-sm">
                <div>
                    <h3 className="font-bold text-amber-900 text-lg">Smart Upsell Opportunities</h3>
                    <p className="text-xs text-amber-700 mt-1">AI-generated suggestions based on client usage and data.</p>
                </div>
                <div className="bg-white/60 p-3 rounded-xl backdrop-blur-sm border border-white/50">
                    <p className="text-[10px] text-amber-800 font-bold uppercase tracking-wide">Total Potential Commission</p>
                    <p className="text-2xl font-bold text-amber-900">₦{totalRevenue.toLocaleString()}</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
                {['All', 'User License', 'Module Cross-sell', 'Service Upgrade', 'Referral'].map(f => (
                    <button 
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${filter === f ? 'bg-[#02275A] text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Opportunity Cards */}
            <div className="grid grid-cols-1 gap-4">
                {filteredOpp.map(opp => (
                    <div key={opp.id} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 p-2 rounded-bl-xl ${opp.color} opacity-10 group-hover:opacity-20 transition-opacity`}>
                            <i className={`fas ${opp.icon} text-4xl`}></i>
                        </div>
                        
                        <div className="flex flex-col md:flex-row justify-between gap-4 relative z-10">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${opp.color}`}>{opp.type}</span>
                                    <h4 className="font-bold text-slate-800 text-sm">{opp.business}</h4>
                                </div>
                                
                                <div className="mt-3">
                                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Trigger Detected</p>
                                    <p className="text-sm font-semibold text-slate-700">{opp.trigger}</p>
                                    <p className="text-xs text-slate-500 mt-1 italic">"{opp.reason}"</p>
                                </div>
                            </div>

                            <div className="flex flex-col justify-between items-start md:items-end gap-3 min-w-[140px]">
                                <div className="text-left md:text-right">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Potential Value</p>
                                    <p className="text-lg font-bold text-emerald-600">{opp.revenue}</p>
                                </div>
                                <button className="w-full md:w-auto px-4 py-2 bg-[#02275A] text-white text-xs font-bold rounded-lg shadow-sm hover:bg-[#02275A]/90 transition-colors flex items-center justify-center gap-2">
                                    <i className="fas fa-paper-plane"></i> {opp.action}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {filteredOpp.length === 0 && (
                    <div className="text-center p-8 text-slate-400 text-sm italic">No opportunities found for this category.</div>
                )}
            </div>
        </div>
    );
};

export default UpsellView;
