import React, { useState, useEffect } from 'react';
import { Business, Invoice } from '../types';
import { useAlert } from '../contexts/AlertContext';

interface MobileMoneyPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    business?: Business | null;
    invoice?: Invoice | null;
    country: string;
    onSuccess?: () => void;
}

const MobileMoneyPaymentModal: React.FC<MobileMoneyPaymentModalProps> = ({ isOpen, onClose, business, invoice, country, onSuccess }) => {
    const { showSuccess, showInfo, showError } = useAlert();
    const [step, setStep] = useState<'initiate' | 'waiting' | 'success'>('initiate');
    const [isLoading, setIsLoading] = useState(false);
    const [amountDue, setAmountDue] = useState<string>('');
    const [phoneNumber, setPhoneNumber] = useState<string>('');
    const [currency, setCurrency] = useState<string>('');
    const [provider, setProvider] = useState<string>('');

    useEffect(() => {
        if (isOpen && (business || invoice)) {
            setStep('initiate');
            
            // Set currency and default provider based on country
            if (country === 'Ghana') {
                setCurrency('GHS');
                setProvider('MTN Mobile Money');
            } else if (country === 'Kenya') {
                setCurrency('KES');
                setProvider('M-Pesa');
            } else if (country === 'Rwanda') {
                setCurrency('RWF');
                setProvider('MTN Mobile Money');
            }

            if (invoice) {
                setPhoneNumber(invoice.recipientPhone?.replace('+233', '0').replace('+254', '0').replace('+250', '0') || '');
                setAmountDue(invoice.totalAmount || invoice.amount || '0');
            } else if (business) {
                if (country === 'Ghana') {
                    setPhoneNumber(business.phone.replace('+233', '0') || '');
                } else if (country === 'Kenya') {
                    setPhoneNumber(business.phone.replace('+254', '0') || '');
                } else if (country === 'Rwanda') {
                    setPhoneNumber(business.phone.replace('+250', '0') || '');
                }

                // Determine mock amount based on plan
                const planPrices: Record<string, Record<string, string>> = {
                    'Ghana': { 'Basic': '0', 'Standard': '200', 'Premium': '450', 'Ultimate': '800' },
                    'Kenya': { 'Basic': '0', 'Standard': '2000', 'Premium': '4500', 'Ultimate': '8000' },
                    'Rwanda': { 'Basic': '0', 'Standard': '20000', 'Premium': '45000', 'Ultimate': '80000' }
                };
                
                const cleanPlan = business.plan.split(' ')[0] || 'Standard';
                const countryPrices = planPrices[country] || planPrices['Ghana'];
                setAmountDue(countryPrices[cleanPlan] || countryPrices['Standard']);
            }
        }
    }, [isOpen, business, invoice, country]);

    if (!isOpen || (!business && !invoice)) return null;

    const targetName = invoice ? invoice.recipientName : business?.name;
    const targetPlan = invoice ? 'Invoice Payment' : business?.plan;

    const handleInitiatePayment = () => {
        if (!phoneNumber) {
            showError("Please enter the customer's mobile money number.");
            return;
        }
        
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setStep('waiting');
            showInfo(`Payment request sent to ${phoneNumber}. Waiting for customer to authorize...`);
        }, 1500);
    };

    const handleSimulatePayment = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setStep('success');
            showSuccess(`Payment of ${currency} ${amountDue} received successfully!`);
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">Mobile Money Payment</h3>
                        <p className="text-xs text-slate-500">For <span className="font-bold text-[#02275A]">{targetName}</span></p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="p-6">
                    {/* STEP 1: Initiate Payment */}
                    {step === 'initiate' && (
                        <div className="text-center space-y-6">
                            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl">
                                <i className="fas fa-mobile-alt"></i>
                            </div>
                            <div>
                                <h4 className="text-slate-500 text-xs font-bold uppercase mb-1">Amount Due</h4>
                                <h2 className="text-3xl font-bold text-slate-800">{currency} {amountDue}</h2>
                                <p className="text-xs text-slate-400 mt-2">{invoice ? 'Payment for Invoice' : `Plan: ${targetPlan}`}</p>
                            </div>
                            
                            <div className="text-left space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Provider</label>
                                    <select 
                                        value={provider}
                                        onChange={(e) => setProvider(e.target.value)}
                                        className="w-full p-2.5 border border-slate-200 rounded-lg text-sm mt-1 focus:outline-none focus:border-[#02275A]"
                                    >
                                        {country === 'Kenya' ? (
                                            <>
                                                <option value="M-Pesa">M-Pesa</option>
                                                <option value="Airtel Money">Airtel Money</option>
                                            </>
                                        ) : country === 'Ghana' ? (
                                            <>
                                                <option value="MTN Mobile Money">MTN Mobile Money</option>
                                                <option value="Vodafone Cash">Telecel Cash</option>
                                                <option value="AirtelTigo Money">AT Money</option>
                                            </>
                                        ) : (
                                            <>
                                                <option value="MTN Mobile Money">MTN Mobile Money</option>
                                                <option value="Airtel Money">Airtel Money</option>
                                            </>
                                        )}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Customer Mobile Number</label>
                                    <input 
                                        type="tel" 
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        placeholder="Enter mobile money number"
                                        className="w-full p-2.5 border border-slate-200 rounded-lg text-sm mt-1 focus:outline-none focus:border-[#02275A]"
                                    />
                                </div>
                            </div>

                            <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg text-left flex gap-3">
                                <i className="fas fa-info-circle text-amber-500 mt-0.5"></i>
                                <p className="text-xs text-amber-800">
                                    Initiating this will send a prompt to the customer's phone to enter their PIN and authorize the payment.
                                </p>
                            </div>

                            <button 
                                onClick={handleInitiatePayment} 
                                disabled={isLoading}
                                className="w-full py-3 bg-[#02275A] text-white font-bold rounded-xl shadow-md hover:bg-[#02275A]/90 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {isLoading ? (
                                    <><i className="fas fa-spinner fa-spin"></i> Sending Request...</>
                                ) : (
                                    <><i className="fas fa-paper-plane"></i> Send Payment Request</>
                                )}
                            </button>
                        </div>
                    )}

                    {/* STEP 2: Waiting for Authorization */}
                    {step === 'waiting' && (
                        <div className="text-center space-y-6 py-4">
                            <div className="relative w-24 h-24 mx-auto">
                                <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-[#02275A] rounded-full border-t-transparent animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center text-[#02275A] text-2xl">
                                    <i className="fas fa-mobile-alt animate-pulse"></i>
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">Awaiting Authorization</h3>
                                <p className="text-sm text-slate-500">
                                    A payment prompt has been sent to <span className="font-bold text-slate-700">{phoneNumber}</span>. 
                                    Please ask the customer to check their phone and enter their PIN to complete the payment.
                                </p>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-left">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-slate-500">Amount:</span>
                                    <span className="font-bold text-slate-800">{currency} {amountDue}</span>
                                </div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-slate-500">Provider:</span>
                                    <span className="font-bold text-slate-800">{provider}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Status:</span>
                                    <span className="font-bold text-amber-600 flex items-center gap-1">
                                        <i className="fas fa-circle text-[8px] animate-pulse"></i> Pending
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button 
                                    onClick={() => setStep('initiate')}
                                    className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSimulatePayment} 
                                    disabled={isLoading}
                                    className="flex-1 py-3 bg-emerald-500 text-white font-bold rounded-xl text-sm shadow-md hover:bg-emerald-600 transition-colors disabled:opacity-70"
                                >
                                    {isLoading ? <i className="fas fa-spinner fa-spin"></i> : "Simulate Success"}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Success */}
                    {step === 'success' && (
                        <div className="text-center space-y-6 py-4">
                            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-4xl shadow-inner">
                                <i className="fas fa-check"></i>
                            </div>
                            
                            <div>
                                <h3 className="text-2xl font-bold text-slate-800 mb-2">Payment Successful!</h3>
                                <p className="text-sm text-slate-500">
                                    The mobile money payment of <span className="font-bold text-slate-800">{currency} {amountDue}</span> has been confirmed.
                                </p>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-left space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Transaction ID:</span>
                                    <span className="font-mono font-bold text-slate-700">MM{Math.floor(Math.random() * 100000000)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Date:</span>
                                    <span className="font-bold text-slate-700">{new Date().toLocaleString()}</span>
                                </div>
                            </div>

                            <button 
                                onClick={onSuccess || onClose}
                                className="w-full py-3 bg-emerald-500 text-white font-bold rounded-xl shadow-md hover:bg-emerald-600 transition-all"
                            >
                                Done
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MobileMoneyPaymentModal;
