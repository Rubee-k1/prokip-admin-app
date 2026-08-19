
import React, { useState, useEffect } from 'react';
import { Business } from '../types';
import { useAlert } from '../contexts/AlertContext';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    business: Business | null;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, business }) => {
    const { showSuccess, showInfo } = useAlert();
    const [step, setStep] = useState<'invoice' | 'account' | 'success'>('invoice');
    const [isLoading, setIsLoading] = useState(false);
    const [virtualAccount, setVirtualAccount] = useState<string>('');
    const [amountDue, setAmountDue] = useState<string>('');

    useEffect(() => {
        if (isOpen && business) {
            setStep('invoice');
            setVirtualAccount('');
            // Determine mock amount based on plan
            const planPrices: Record<string, string> = {
                'Basic': '0',
                'Standard': '20,000',
                'Premium': '45,000',
                'Ultimate': '80,000'
            };
            // Strip (Trial) if present and match partial
            const cleanPlan = business.plan.split(' ')[0] || 'Standard';
            setAmountDue(planPrices[cleanPlan] || '20,000');
        }
    }, [isOpen, business]);

    if (!isOpen || !business) return null;

    const handleGenerateAccount = () => {
        setIsLoading(true);
        setTimeout(() => {
            // Generate a random 10-digit account number starting with '8' (Moniepoint style often)
            const randomAccount = '8' + Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
            setVirtualAccount(randomAccount);
            setIsLoading(false);
            setStep('account');
            showInfo("Virtual account generated successfully.");
        }, 1500);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(virtualAccount);
        showSuccess("Account number copied to clipboard.");
    };

    const handleSimulatePayment = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setStep('success');
            showSuccess(`Payment of ₦${amountDue} received successfully!`);
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">Payment Details</h3>
                        <p className="text-xs text-slate-500">For <span className="font-bold text-[#02275A]">{business.name}</span></p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="p-6">
                    {/* STEP 1: Invoice / Generate */}
                    {step === 'invoice' && (
                        <div className="text-center space-y-6">
                            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto text-2xl">
                                <i className="fas fa-file-invoice-dollar"></i>
                            </div>
                            <div>
                                <h4 className="text-slate-500 text-xs font-bold uppercase mb-1">Amount Due</h4>
                                <h2 className="text-3xl font-bold text-slate-800">₦{amountDue}</h2>
                                <p className="text-xs text-slate-400 mt-2">Plan: {business.plan}</p>
                            </div>
                            
                            <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg text-left flex gap-3">
                                <i className="fas fa-info-circle text-amber-500 mt-0.5"></i>
                                <p className="text-xs text-amber-800">
                                    Generate a unique virtual account for this transaction. The account is valid for one-time use only.
                                </p>
                            </div>

                            <button 
                                onClick={handleGenerateAccount} 
                                disabled={isLoading}
                                className="w-full py-3 bg-[#02275A] text-white font-bold rounded-xl shadow-lg hover:bg-[#02275A]/90 transition-all flex items-center justify-center gap-2 active:scale-95"
                            >
                                {isLoading ? <i className="fas fa-circle-notch fa-spin"></i> : 'Generate Account Details'}
                            </button>
                        </div>
                    )}

                    {/* STEP 2: Account Details */}
                    {step === 'account' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="text-center mb-4">
                                <p className="text-xs font-bold text-slate-500 uppercase">Pay exactly</p>
                                <h2 className="text-3xl font-bold text-[#02275A]">₦{amountDue}</h2>
                            </div>

                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 relative overflow-hidden">
                                {/* Watermark/Logo bg mock */}
                                <div className="absolute -right-4 -bottom-4 text-9xl text-slate-200 opacity-20 pointer-events-none">
                                    <i className="fas fa-university"></i>
                                </div>

                                <div className="relative z-10">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Bank Name</label>
                                    <p className="font-bold text-slate-800 text-sm">Moniepoint Microfinance Bank</p>
                                </div>

                                <div className="relative z-10">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Account Number</label>
                                    <div className="flex items-center justify-between">
                                        <p className="text-2xl font-mono font-bold text-[#02275A] tracking-wider">{virtualAccount}</p>
                                        <button onClick={handleCopy} className="text-indigo-600 hover:text-indigo-800 text-xs font-bold bg-indigo-50 px-2 py-1 rounded">
                                            COPY
                                        </button>
                                    </div>
                                </div>

                                <div className="relative z-10">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Account Name</label>
                                    <p className="font-bold text-slate-800 text-sm truncate uppercase">{business.name} - PROKIP</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-[10px] text-rose-500 bg-rose-50 p-2 rounded-lg justify-center font-bold">
                                <i className="fas fa-hourglass-half"></i> Expires in 30 minutes
                            </div>

                            <button 
                                onClick={handleSimulatePayment} 
                                disabled={isLoading}
                                className="w-full py-3 border border-emerald-500 text-emerald-600 font-bold rounded-xl hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 text-sm active:scale-95"
                            >
                                {isLoading ? <i className="fas fa-circle-notch fa-spin"></i> : 'Simulate Payment Received'}
                            </button>
                        </div>
                    )}

                    {/* STEP 3: Success */}
                    {step === 'success' && (
                        <div className="text-center space-y-6 animate-fade-in py-4">
                            <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto text-4xl shadow-lg shadow-emerald-200 animate-bounce">
                                <i className="fas fa-check"></i>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">Payment Successful!</h2>
                                <p className="text-slate-500 text-sm mt-2">The transaction has been confirmed.</p>
                            </div>
                            
                            <div className="bg-slate-50 p-4 rounded-xl text-sm border border-slate-200">
                                <div className="flex justify-between mb-2">
                                    <span className="text-slate-500">Amount Paid</span>
                                    <span className="font-bold text-slate-800">₦{amountDue}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Transaction ID</span>
                                    <span className="font-mono text-slate-800">TXN-{Math.floor(Math.random()*10000)}</span>
                                </div>
                            </div>

                            <button 
                                onClick={onClose}
                                className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all active:scale-95"
                            >
                                Close
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
        