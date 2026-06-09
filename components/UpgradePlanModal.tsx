import React from 'react';
import { Business } from '../types';

interface UpgradePlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    business: Business | null;
}

const UpgradePlanModal: React.FC<UpgradePlanModalProps> = ({ isOpen, onClose, business }) => {
    if (!isOpen || !business) return null;

    // Simplified plan logic order
    const planOrder = ['Basic', 'Standard', 'Premium', 'Ultimate'];
    const currentPlanIndex = planOrder.indexOf(business.plan) !== -1 ? planOrder.indexOf(business.plan) : 0;
    
    const availablePlans = [
        {
            name: 'Standard',
            price: '₦20,000',
            period: '/ year',
            features: ['2 Users', '1 Location', 'Unlimited Products', 'Basic Reports'],
            color: 'from-amber-400 to-orange-500',
            rec: false
        },
        {
            name: 'Premium',
            price: '₦45,000',
            period: '/ year',
            features: ['5 Users', '3 Locations', 'Unlimited Products', 'Advanced Analytics', 'Priority Support'],
            color: 'from-indigo-500 to-purple-600',
            rec: true
        },
        {
            name: 'Ultimate',
            price: '₦80,000',
            period: '/ year',
            features: ['Unlimited Users', 'Unlimited Locations', 'Custom Reports', 'Dedicated Account Manager', 'API Access'],
            color: 'from-slate-700 to-slate-900',
            rec: false
        }
    ];

    // Filter to show only higher plans
    const upgrades = availablePlans.filter(p => planOrder.indexOf(p.name) > currentPlanIndex);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
                 {/* Header */}
                 <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-100 p-6 flex justify-between items-center z-10">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">Upgrade Plan</h3>
                        <p className="text-xs text-slate-500">Current Plan: <span className="font-bold text-indigo-600">{business.plan}</span></p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-500 flex items-center justify-center transition-colors">
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="p-6 md:p-8 bg-slate-50">
                    {upgrades.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                                <i className="fas fa-crown"></i>
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">Top Tier Reached!</h3>
                            <p className="text-slate-500 text-sm mt-2">{business.name} is already on the highest available plan.</p>
                            <button onClick={onClose} className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm">Close</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {upgrades.map((plan) => (
                                <div key={plan.name} className={`relative bg-white rounded-2xl shadow-lg overflow-hidden border transition-transform hover:scale-105 ${plan.rec ? 'border-indigo-500 ring-4 ring-indigo-500/10' : 'border-slate-100'}`}>
                                    {plan.rec && (
                                        <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider z-10">
                                            Recommended
                                        </div>
                                    )}
                                    <div className={`h-2 bg-gradient-to-r ${plan.color}`}></div>
                                    <div className="p-6">
                                        <h4 className="text-lg font-bold text-slate-800 mb-2">{plan.name}</h4>
                                        <div className="flex items-baseline gap-1 mb-6">
                                            <span className="text-3xl font-bold text-slate-800">{plan.price}</span>
                                            <span className="text-xs text-slate-500 font-medium">{plan.period}</span>
                                        </div>
                                        
                                        <div className="space-y-3 mb-8">
                                            {plan.features.map((feat, i) => (
                                                <div key={i} className="flex items-start gap-3 text-sm text-slate-600">
                                                    <i className="fas fa-check-circle text-emerald-500 mt-0.5"></i>
                                                    <span>{feat}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <button 
                                            onClick={() => { alert(`Upgrade request for ${plan.name} initiated!`); onClose(); }}
                                            className={`w-full py-3 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 ${plan.rec ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-800 text-white hover:bg-slate-900'}`}
                                        >
                                            Upgrade to {plan.name}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UpgradePlanModal;