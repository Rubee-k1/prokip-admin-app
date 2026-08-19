import React, { useState, useEffect } from 'react';
import { Invoice } from '../types';
import { useAlert } from '../contexts/AlertContext';

interface InvoicePaymentViewProps {
    invoiceId: string;
    invoices: Invoice[];
    onPaymentSuccess: (invoice: Invoice) => void;
    onClose: () => void;
    userCountry: string;
}

const InvoicePaymentView: React.FC<InvoicePaymentViewProps> = ({ invoiceId, invoices, onPaymentSuccess, onClose, userCountry }) => {
    const { showSuccess, showError, showInfo } = useAlert();
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [isPaying, setIsPaying] = useState(false);
    const [paymentStep, setPaymentStep] = useState<'details' | 'processing' | 'success'>('details');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [provider, setProvider] = useState('');

    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);

    useEffect(() => {
        const found = invoices.find(inv => inv.id === invoiceId);
        if (found) {
            setInvoice(found);
        }
    }, [invoiceId, invoices]);

    useEffect(() => {
        if (userCountry === 'Ghana') {
            setProvider('MTN Mobile Money');
        } else if (userCountry === 'Kenya') {
            setProvider('M-Pesa');
        } else if (userCountry === 'Rwanda') {
            setProvider('MTN Mobile Money');
        }
    }, [userCountry]);

    if (!invoice) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full">
                    <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto text-2xl mb-4">
                        <i className="fas fa-exclamation-triangle"></i>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Invoice Not Found</h2>
                    <p className="text-slate-500 mb-6">The invoice you are looking for does not exist or has been removed.</p>
                    <button onClick={onClose} className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-colors">
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const currency = userCountry === 'Ghana' ? 'GHS' : userCountry === 'Kenya' ? 'KES' : userCountry === 'Rwanda' ? 'RWF' : '₦';

    const handleDownloadPDF = () => {
        setIsDownloading(true);
        setDownloadProgress(0);
        
        const interval = setInterval(() => {
            setDownloadProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 20;
            });
        }, 300);

        setTimeout(() => {
            clearInterval(interval);
            setIsDownloading(false);
            setDownloadProgress(0);
            showSuccess('Invoice downloaded successfully!');
        }, 1800);
    };

    const handleMobileMoneyPayment = () => {
        if (!phoneNumber) {
            showError("Please enter your mobile money number.");
            return;
        }
        setIsPaying(true);
        setPaymentStep('processing');
        
        setTimeout(() => {
            setIsPaying(false);
            setPaymentStep('success');
            showSuccess('Payment successful!');
            onPaymentSuccess({ ...invoice, status: 'Paid' });
        }, 3000);
    };

    const handleBankTransferSimulation = () => {
        setIsPaying(true);
        setTimeout(() => {
            setIsPaying(false);
            showSuccess('Bank transfer payment detected!');
            onPaymentSuccess({ ...invoice, status: 'Paid' });
        }, 2000);
    };

    if (invoice.status === 'Paid' || paymentStep === 'success') {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 animate-fade-in">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center max-w-md w-full">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-3xl mb-5">
                        <i className="fas fa-check"></i>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful</h2>
                    <p className="text-gray-500 mb-6 text-sm">Thank you. Your payment for Invoice <span className="font-medium text-gray-700">#{invoice.id}</span> has been received.</p>
                    
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-left space-y-3 mb-8">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Amount Paid</span>
                            <span className="font-medium text-gray-900">{currency} {parseInt(invoice.totalAmount).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Date</span>
                            <span className="font-medium text-gray-900">{new Date().toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Billed To</span>
                            <span className="font-medium text-gray-900">{invoice.recipientName}</span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button 
                            onClick={handleDownloadPDF} 
                            disabled={isDownloading}
                            className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm relative overflow-hidden"
                        >
                            {isDownloading && (
                                <div 
                                    className="absolute left-0 top-0 bottom-0 bg-gray-100 transition-all duration-300" 
                                    style={{ width: `${downloadProgress}%` }}
                                />
                            )}
                            <span className="relative z-10 flex items-center gap-2">
                                {isDownloading ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-download"></i>}
                                {isDownloading ? `${downloadProgress}%` : 'Receipt'}
                            </span>
                        </button>
                        <button onClick={onClose} className="flex-1 py-2.5 bg-[#02275A] text-white rounded-xl font-medium hover:bg-[#02275A]/90 transition-colors text-sm">
                            Done
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-sans flex flex-col items-center">
            <div className="w-full max-w-4xl">
                
                {/* Header */}
                <div className="flex justify-center mb-8">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#02275A] rounded-lg flex items-center justify-center text-white shadow-sm">
                            <i className="fas fa-file-invoice text-sm"></i>
                        </div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Prokip</h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    
                    {/* Left Column: Invoice Summary */}
                    <div className="space-y-4">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                <p className="text-sm font-medium text-gray-500 mb-1">Amount Due</p>
                                <h2 className="text-4xl font-bold text-gray-900 tracking-tight">{currency} {parseInt(invoice.totalAmount).toLocaleString()}</h2>
                                <p className="text-sm text-gray-500 mt-2">Invoice <span className="font-medium text-gray-700">#{invoice.id}</span></p>
                            </div>
                            
                            <div className="p-6 space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Billed To</span>
                                    <span className="font-medium text-gray-900 text-right">{invoice.recipientName}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Due Date</span>
                                    <span className="font-medium text-gray-900 text-right">{invoice.dueDate}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">From</span>
                                    <span className="font-medium text-gray-900 text-right">{invoice.businessName || 'Your Vendor'}</span>
                                </div>
                            </div>
                            
                            <div className="p-6 border-t border-gray-100">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Items</p>
                                <div className="space-y-3">
                                    {invoice.items && invoice.items.length > 0 ? (
                                        invoice.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between text-sm">
                                                <span className="text-gray-600">{item.description}</span>
                                                <span className="font-medium text-gray-900">{currency} {item.amount.toLocaleString()}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">{invoice.description || 'Standard Charge'}</span>
                                            <span className="font-medium text-gray-900">{currency} {parseInt(invoice.totalAmount).toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={handleDownloadPDF} 
                            disabled={isDownloading}
                            className="w-full py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center justify-center gap-2 text-sm shadow-sm relative overflow-hidden"
                        >
                            {isDownloading && (
                                <div 
                                    className="absolute left-0 top-0 bottom-0 bg-gray-100 transition-all duration-300" 
                                    style={{ width: `${downloadProgress}%` }}
                                />
                            )}
                            <span className="relative z-10 flex items-center gap-2">
                                {isDownloading ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-download"></i>}
                                {isDownloading ? `Downloading ${downloadProgress}%` : 'Download PDF Receipt'}
                            </span>
                        </button>
                    </div>

                    {/* Right Column: Payment Section */}
                    <div>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden sticky top-8">
                            <div className="p-6">
                                {userCountry === 'Nigeria' ? (
                                    <div className="space-y-6">
                                        <div className="text-center">
                                            <p className="text-sm font-medium text-gray-500 mb-1">Pay via Bank Transfer</p>
                                            <p className="text-xs text-gray-400">Transfer the exact amount to the account below</p>
                                        </div>
                                        
                                        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-4">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Bank Name</p>
                                                <p className="font-medium text-gray-900">{invoice.bankName || 'Moniepoint MFB'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Account Number</p>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-2xl font-bold tracking-widest text-gray-900">{invoice.virtualAccount || '8901234567'}</p>
                                                    <button className="p-2 text-gray-400 hover:text-gray-700 transition-colors" onClick={() => {
                                                        navigator.clipboard.writeText(invoice.virtualAccount || '8901234567');
                                                        showSuccess("Account number copied!");
                                                    }}>
                                                        <i className="far fa-copy text-lg"></i>
                                                    </button>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Account Name</p>
                                                <p className="font-medium text-gray-900">{invoice.accountName || `Prokip - ${invoice.recipientName}`}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-start gap-3 text-xs text-gray-500 bg-blue-50/50 p-3 rounded-lg border border-blue-100/50">
                                            <i className="fas fa-info-circle text-blue-500 mt-0.5"></i>
                                            <p>This is a dedicated virtual account. Payment is confirmed automatically.</p>
                                        </div>

                                        <button 
                                            onClick={handleBankTransferSimulation}
                                            disabled={isPaying}
                                            className="w-full py-3.5 bg-[#02275A] text-white rounded-xl font-medium hover:bg-[#02275A]/90 transition-colors disabled:opacity-70 flex items-center justify-center gap-2 shadow-sm"
                                        >
                                            {isPaying ? <i className="fas fa-circle-notch fa-spin"></i> : 'I have made the transfer'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="text-center">
                                            <p className="text-sm font-medium text-gray-500 mb-1">Pay via Mobile Money</p>
                                        </div>
                                        
                                        {paymentStep === 'processing' ? (
                                            <div className="text-center py-8 space-y-4">
                                                <i className="fas fa-circle-notch fa-spin text-3xl text-[#02275A]"></i>
                                                <div>
                                                    <h3 className="font-medium text-gray-900">Check Your Phone</h3>
                                                    <p className="text-sm text-gray-500 mt-1">Enter your PIN to authorize {currency} {parseInt(invoice.totalAmount).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="text-xs font-medium text-gray-700 block mb-1.5">Provider</label>
                                                        <select 
                                                            value={provider}
                                                            onChange={(e) => setProvider(e.target.value)}
                                                            className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#02275A] focus:ring-1 focus:ring-[#02275A] bg-white"
                                                        >
                                                            {userCountry === 'Kenya' ? (
                                                                <>
                                                                    <option value="M-Pesa">M-Pesa</option>
                                                                    <option value="Airtel Money">Airtel Money</option>
                                                                </>
                                                            ) : userCountry === 'Ghana' ? (
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
                                                        <label className="text-xs font-medium text-gray-700 block mb-1.5">Mobile Number</label>
                                                        <input 
                                                            type="tel" 
                                                            value={phoneNumber}
                                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                                            placeholder="e.g. 024 123 4567"
                                                            className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#02275A] focus:ring-1 focus:ring-[#02275A] bg-white"
                                                        />
                                                    </div>
                                                </div>

                                                <button 
                                                    onClick={handleMobileMoneyPayment}
                                                    disabled={isPaying || !phoneNumber}
                                                    className="w-full py-3.5 bg-[#02275A] text-white rounded-xl font-medium hover:bg-[#02275A]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm mt-6"
                                                >
                                                    Pay {currency} {parseInt(invoice.totalAmount).toLocaleString()}
                                                </button>
                                                
                                                <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 mt-4">
                                                    <i className="fas fa-lock text-gray-400"></i> Secured by Prokip
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Footer */}
                <div className="mt-12 text-center pb-8">
                    <p className="text-gray-400 text-xs font-medium flex items-center justify-center gap-1.5">
                        Powered by <span className="font-bold text-gray-700">Prokip</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default InvoicePaymentView;
