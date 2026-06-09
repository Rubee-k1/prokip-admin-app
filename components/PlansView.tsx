
import React, { useState } from 'react';
import MobileMoneyPaymentModal from './MobileMoneyPaymentModal';
import { Business } from '../types';

interface PlansViewProps {
    setView: (view: string) => void;
    targetBusinessName?: string | null;
    onPlanSelect: (planName: string, isTrial?: boolean) => void;
    userCountry?: string;
    pendingBusiness?: Business | null;
}

const PlansView: React.FC<PlansViewProps> = ({ setView, targetBusinessName, onPlanSelect, userCountry = 'Nigeria', pendingBusiness }) => {
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<string>('');
    const [isTrialMode, setIsTrialMode] = useState(false);
    const plans = [
        {
            name: 'Basic',
            price: 'Free',
            period: '/ month',
            features: ['1 User', '1 Location', '100 Products', 'Basic Reports'],
            color: 'from-slate-400 to-slate-500',
            buttonColor: 'bg-slate-500',
            popular: false
        },
        {
            name: 'Standard',
            price: '₦20,000',
            period: '/ year',
            features: ['2 Users', '1 Location', 'Unlimited Products', 'Basic Reports', 'Email Support'],
            color: 'from-amber-400 to-orange-500',
            buttonColor: 'bg-orange-500',
            popular: false
        },
        {
            name: 'Premium',
            price: '₦45,000',
            period: '/ year',
            features: ['5 Users', '3 Locations', 'Unlimited Products', 'Advanced Analytics', 'Priority Support'],
            color: 'from-indigo-500 to-purple-600',
            buttonColor: 'bg-indigo-600',
            popular: true
        },
        {
            name: 'Ultimate',
            price: '₦80,000',
            period: '/ year',
            features: ['Unlimited Users', 'Unlimited Locations', 'Custom Reports', 'Dedicated Account Manager', 'API Access'],
            color: 'from-slate-700 to-slate-900',
            buttonColor: 'bg-slate-900',
            popular: false
        }
    ];

    const handlePlanClick = (planName: string, isTrial: boolean) => {
        if (!isTrial && userCountry !== 'Nigeria' && pendingBusiness) {
            setSelectedPlan(planName);
            setIsTrialMode(isTrial);
            setPaymentModalOpen(true);
        } else {
            onPlanSelect(planName, isTrial);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-12 py-8 animate-fade-in">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-slate-800 mb-2">Choose a Subscription Plan</h2>
                <p className="text-slate-500">
                    {targetBusinessName 
                        ? <>Select the best plan for <span className="font-bold text-[#02275A]">{targetBusinessName}</span></>
                        : "Select the best plan to get started."}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {plans.map((plan) => (
                    <div key={plan.name} className={`relative bg-white rounded-2xl shadow-lg overflow-hidden border transition-transform hover:scale-105 ${plan.popular ? 'border-indigo-500 ring-4 ring-indigo-500/10' : 'border-slate-100'}`}>
                        {plan.popular && (
                            <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider z-10">
                                Popular
                            </div>
                        )}
                        <div className={`h-2 bg-gradient-to-r ${plan.color}`}></div>
                        <div className="p-6 flex flex-col h-full">
                            <h4 className="text-lg font-bold text-slate-800 mb-2">{plan.name}</h4>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-3xl font-bold text-slate-800">{plan.price}</span>
                                <span className="text-xs text-slate-500 font-medium">{plan.period}</span>
                            </div>
                            
                            <div className="space-y-3 mb-8 flex-1">
                                {plan.features.map((feat, i) => (
                                    <div key={i} className="flex items-start gap-3 text-sm text-slate-600">
                                        <i className="fas fa-check-circle text-emerald-500 mt-0.5"></i>
                                        <span>{feat}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3">
                                <button 
                                    onClick={() => handlePlanClick(plan.name, false)}
                                    className={`w-full py-3 rounded-xl font-bold text-sm text-white shadow-md transition-all active:scale-95 ${plan.buttonColor} hover:opacity-90`}
                                >
                                    Select {plan.name}
                                </button>
                                
                                {plan.name !== 'Basic' && (
                                    <button 
                                        onClick={() => handlePlanClick(plan.name, true)}
                                        className="w-full py-2.5 rounded-xl font-bold text-xs text-slate-500 border-2 border-slate-100 hover:border-[#02275A] hover:text-[#02275A] hover:bg-[#02275A]/5 transition-all"
                                    >
                                        Start 14-Day Free Trial
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="mt-8 text-center">
                <button onClick={() => setView('businesses')} className="text-slate-400 text-sm font-bold hover:text-slate-600 transition-colors">
                    Skip for now (Business will be pending)
                </button>
            </div>

            {pendingBusiness && (
                <MobileMoneyPaymentModal 
                    isOpen={paymentModalOpen}
                    onClose={() => setPaymentModalOpen(false)}
                    business={pendingBusiness}
                    country={userCountry}
                    onSuccess={() => {
                        setPaymentModalOpen(false);
                        onPlanSelect(selectedPlan, isTrialMode);
                    }}
                />
            )}
        </div>
    );
};

export default PlansView;
