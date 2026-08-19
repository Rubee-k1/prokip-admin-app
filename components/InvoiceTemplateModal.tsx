
import React, { useState } from 'react';
import { Invoice } from '../types';
import { useAlert } from '../contexts/AlertContext';
import InvoicePaymentView from './InvoicePaymentView';
import MobileMoneyPaymentModal from './MobileMoneyPaymentModal';

interface InvoiceTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoice: Invoice | null;
    onUpdateInvoice?: (invoice: Invoice) => void;
    userCountry?: string;
}

const InvoiceTemplateModal: React.FC<InvoiceTemplateModalProps> = ({ isOpen, onClose, invoice, onUpdateInvoice, userCountry = 'Nigeria' }) => {
    const { showSuccess, showInfo } = useAlert();
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [isSimulatingPayment, setIsSimulatingPayment] = useState(false);
    const [isCustomerPreview, setIsCustomerPreview] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    if (!isOpen || !invoice) return null;

    const isExpired = new Date(invoice.expiryDate) < new Date();
    const isPaid = invoice.status === 'Paid';
    const isNonNigerian = userCountry && userCountry !== 'Nigeria';

    const handleShare = async () => {
        const paymentUrl = invoice.paymentLink || `https://agents.prokip.africa/invoices/${invoice.id}`;
        const message = `Dear Customer,\n\nPlease find your invoice attached.\n\nKindly proceed with payment using the link below:\n${paymentUrl}\n\nAlternatively, payment can be made via bank transfer to the account below:\n\nBank: ${invoice.bankName || 'Moniepoint'}\nAccount Number: ${invoice.virtualAccount || '0282883833'}\nAccount Name: ${invoice.accountName || 'Prokip'}\n\nPlease note that payments made through the link or the account above are automatically confirmed instantly.\n\nThank you for your patronage.`;
        
        // Simulate downloading PDF before sharing
        setIsDownloading(true);
        setDownloadProgress(0);
        
        const interval = setInterval(() => {
            setDownloadProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 25;
            });
        }, 300);

        await new Promise(resolve => setTimeout(resolve, 1500));
        clearInterval(interval);
        setIsDownloading(false);
        setDownloadProgress(0);

        if (navigator.share) {
            try {
                // Create a dummy PDF file for simulation purposes
                const dummyPdfContent = new Blob(['Dummy PDF Content'], { type: 'application/pdf' });
                const pdfFile = new File([dummyPdfContent], `Invoice_${invoice.id}.pdf`, { type: 'application/pdf' });
                
                const shareData: ShareData = {
                    title: `Prokip Invoice #${invoice.id}`,
                    text: message,
                };

                // Check if the browser supports sharing files
                if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
                    shareData.files = [pdfFile];
                } else {
                    // Fallback to sharing the URL if file sharing is not supported
                    shareData.url = paymentUrl;
                }

                await navigator.share(shareData);
                showSuccess("Invoice shared successfully.");
            } catch (error) {
                console.error("Error sharing:", error);
            }
        } else {
            copyToClipboard(paymentUrl);
            showSuccess("Payment link copied to clipboard.");
        }
    };

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
            showSuccess("Invoice PDF downloaded successfully.");
        }, 1800);
    };

    const handleSimulatePayment = () => {
        setIsSimulatingPayment(true);
        setTimeout(() => {
            setIsSimulatingPayment(false);
            if (onUpdateInvoice) {
                onUpdateInvoice({ ...invoice, status: 'Paid' });
                // Notification is handled by parent on update
            } else {
                showSuccess("Payment simulated (No handler connected).");
            }
            onClose();
        }, 2000);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        showInfo("Copied to clipboard!");
    };

    if (isCustomerPreview) {
        return (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-50 animate-fade-in flex flex-col">
                {/* Minimal Header for Agent Toggle */}
                <div className="absolute top-4 right-4 z-50 flex gap-3">
                    <button 
                        onClick={() => setIsCustomerPreview(false)}
                        className="px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 bg-slate-800 text-white shadow-lg hover:bg-slate-700 hover:scale-105"
                    >
                        <i className="fas fa-user-tie"></i>
                        Switch to Agent Mode
                    </button>
                    <button onClick={onClose} className="w-10 h-10 rounded-xl bg-white shadow-lg text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all hover:scale-105">
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="flex-1 relative">
                    <InvoicePaymentView 
                        invoiceId={invoice.id}
                        invoices={[invoice]}
                        onPaymentSuccess={(inv) => {
                            if (onUpdateInvoice) {
                                onUpdateInvoice({ ...inv, status: 'Paid' });
                            }
                        }}
                        onClose={() => setIsCustomerPreview(false)}
                        userCountry={userCountry}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-100 animate-fade-in overflow-y-auto">
            {/* Header Actions */}
            <div className="bg-white px-6 py-4 border-b border-slate-200 flex flex-wrap justify-between items-center sticky top-0 z-20 gap-3 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors">
                        <i className="fas fa-arrow-left"></i>
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="bg-[#02275A]/10 p-2 rounded-lg text-[#02275A]">
                            <i className="fas fa-file-invoice text-xl"></i>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg">Invoice Details</h3>
                            <p className="text-xs text-slate-500">#{invoice.id}</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {/* Preview Toggle */}
                    <button 
                        onClick={() => setIsCustomerPreview(true)}
                        className="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                    >
                        <i className="fas fa-eye"></i>
                        Customer Preview
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 flex justify-center bg-slate-100">
                    
                    {/* INVOICE PAPER */}
                    <div id="invoice-content" className="bg-white shadow-xl w-full max-w-[800px] min-h-[1000px] p-8 md:p-12 relative text-slate-800 transition-all">
                        
                        {/* Watermark Logo */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
                            <svg width="400" height="400" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path 
                                    d="M13 30V12H21C25 12 28 15 28 19C28 23 25 26 21 26H18" 
                                    stroke="#000" 
                                    strokeWidth="5" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>

                        {/* Status Ribbon */}
                        <div className={`absolute top-0 right-10 px-6 py-3 rounded-b-xl font-bold text-sm text-white uppercase tracking-widest shadow-md z-10 ${
                            isPaid ? 'bg-emerald-600' :
                            isExpired ? 'bg-slate-500' :
                            invoice.status === 'Overdue' ? 'bg-rose-600' : 'bg-amber-500'
                        }`}>
                            {isExpired ? 'Expired' : invoice.status}
                        </div>

                        {/* Invoice Top Header */}
                        <div className="flex flex-col md:flex-row justify-between items-start mb-16 gap-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 flex items-center justify-center">
                                        <svg width="48" height="48" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <rect width="40" height="40" rx="12" fill="#02275A"/>
                                            <defs>
                                                <linearGradient id="invoice-gold-gradient" x1="13" y1="10" x2="28" y2="30" gradientUnits="userSpaceOnUse">
                                                    <stop stopColor="#FFD700" />
                                                    <stop offset="1" stopColor="#F59E0B" />
                                                </linearGradient>
                                            </defs>
                                            <path 
                                                d="M13 30V12H21C25 12 28 15 28 19C28 23 25 26 21 26H18" 
                                                stroke="url(#invoice-gold-gradient)" 
                                                strokeWidth="5" 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </div>
                                    <span className="text-3xl font-extrabold text-[#02275A] tracking-tighter">Prokip</span>
                                </div>
                                <div className="text-xs font-medium text-slate-500 space-y-1.5 pl-1">
                                    <p>123 Innovation Drive, Lekki Phase 1</p>
                                    <p>Lagos, Nigeria</p>
                                    <p>billing@prokip.com</p>
                                    <p>+234 800 PROKIP</p>
                                </div>
                            </div>
                            <div className="text-left md:text-right w-full md:w-auto bg-slate-50 md:bg-transparent p-4 md:p-0 rounded-xl">
                                <h1 className="text-4xl md:text-5xl font-light text-slate-300 uppercase tracking-[0.2em] mb-4 leading-none">Invoice</h1>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between md:justify-end gap-4">
                                        <span className="text-slate-400 font-medium">Invoice No:</span>
                                        <span className="font-bold text-slate-800">#{invoice.id}</span>
                                    </div>
                                    <div className="flex justify-between md:justify-end gap-4">
                                        <span className="text-slate-400 font-medium">Date Issued:</span>
                                        <span className="font-bold text-slate-800">{invoice.dateCreated}</span>
                                    </div>
                                    <div className="flex justify-between md:justify-end gap-4">
                                        <span className="text-slate-400 font-medium">Due Date:</span>
                                        <span className="font-bold text-rose-500">{invoice.dueDate}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bill To Section */}
                        <div className="mb-12 flex flex-col md:flex-row gap-12">
                            <div className="flex-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 border-b border-slate-100 pb-2">Bill To</p>
                                <h3 className="text-xl font-bold text-slate-800 mb-1">{invoice.recipientName}</h3>
                                {invoice.recipientType === 'Business' && <span className="inline-block text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-bold mb-2">Business Account</span>}
                                <div className="text-sm text-slate-500 space-y-1">
                                    {invoice.recipientEmail && <p>{invoice.recipientEmail}</p>}
                                    {invoice.recipientPhone && <p>{invoice.recipientPhone}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Line Items Table */}
                        <div className="mb-12 overflow-x-auto rounded-xl border border-slate-100">
                            <table className="w-full text-sm min-w-[500px]">
                                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                                    <tr>
                                        <th className="py-4 px-6 text-left w-1/2">Description</th>
                                        <th className="py-4 px-6 text-center">Type</th>
                                        <th className="py-4 px-6 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {invoice.items.map((item, index) => (
                                        <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-5 px-6 font-semibold text-slate-700">{item.description}</td>
                                            <td className="py-5 px-6 text-center">
                                                <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide ${
                                                    item.type === 'Subscription' 
                                                    ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' 
                                                    : item.type === 'Addon'
                                                    ? 'bg-blue-50 text-blue-600 border border-blue-100'
                                                    : 'bg-orange-50 text-orange-600 border border-orange-100'
                                                }`}>
                                                    {item.type}
                                                </span>
                                            </td>
                                            <td className="py-5 px-6 text-right font-bold text-slate-800">₦{item.amount.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals Section */}
                        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
                            <div className="w-full md:w-1/2">
                                {/* Note Area */}
                                {invoice.items.some(i => i.type === 'Service') && (
                                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-xs text-blue-800 leading-relaxed">
                                        <strong className="block mb-1 text-blue-900"><i className="fas fa-info-circle"></i> Service Note:</strong>
                                        Items marked as "Other Service" include a 10% processing fee. This fee is non-refundable upon payment completion.
                                    </div>
                                )}
                            </div>
                            <div className="w-full md:w-5/12">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-slate-500 text-sm">
                                        <span>Subtotal</span>
                                        <span>₦{parseInt(invoice.originalAmount || invoice.totalAmount).toLocaleString()}</span>
                                    </div>
                                    {invoice.discountPercent ? (
                                        <div className="flex justify-between text-emerald-600 text-sm font-bold">
                                            <span>Discount ({invoice.discountPercent}%)</span>
                                            <span>-₦{(parseInt(invoice.originalAmount || invoice.totalAmount) - parseInt(invoice.totalAmount)).toLocaleString()}</span>
                                        </div>
                                    ) : null}
                                    <div className="flex justify-between text-slate-500 text-sm">
                                        <span>Tax (0%)</span>
                                        <span>₦0.00</span>
                                    </div>
                                    <div className="border-t-2 border-slate-800 pt-3 flex justify-between items-center mt-3">
                                        <span className="font-bold text-slate-800 text-lg">Total Due</span>
                                        <span className="text-3xl font-extrabold text-[#02275A]">₦{parseInt(invoice.totalAmount).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Information - Prominent */}
                        {!isPaid && !isExpired && (
                            <div className="mb-12 bg-[#02275A] rounded-2xl p-8 text-white relative overflow-hidden shadow-lg print:border print:border-slate-300 print:text-black print:bg-white">
                                <div className="absolute top-0 right-0 p-6 opacity-10 print:hidden">
                                    <i className="fas fa-wallet text-9xl text-white"></i>
                                </div>
                                
                                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center justify-between">
                                    <div>
                                        <h4 className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-1 print:text-slate-500">Bank Transfer</h4>
                                        <p className="text-sm text-blue-100 mb-6 max-w-xs print:text-slate-600">Please pay exactly the amount shown above to the unique account details below. Payment is confirmed instantly.</p>
                                        
                                        <div className="space-y-1">
                                            <p className="text-xs text-blue-300 uppercase font-bold print:text-slate-400">Bank Name</p>
                                            <p className="font-bold text-lg">{invoice.bankName}</p>
                                        </div>
                                    </div>

                                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 text-center min-w-[280px] print:border-slate-300 print:bg-slate-50">
                                        <p className="text-xs text-blue-200 uppercase font-bold mb-2 print:text-slate-500">Virtual Account Number</p>
                                        <div className="flex items-center justify-center gap-3 mb-2">
                                            <span className="text-3xl font-mono font-bold tracking-widest print:text-slate-800">{invoice.virtualAccount}</span>
                                            <button 
                                                onClick={() => copyToClipboard(invoice.virtualAccount)}
                                                className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors print:hidden" 
                                                title="Copy"
                                            >
                                                <i className="far fa-copy"></i>
                                            </button>
                                        </div>
                                        <p className="text-[10px] text-blue-200 font-medium print:text-slate-500">{invoice.accountName}</p>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-blue-200 print:text-slate-500 print:border-slate-200">
                                    <div className="flex flex-col sm:flex-row items-center gap-4">
                                        <span className="flex items-center gap-2"><i className="fas fa-bolt text-amber-400"></i> Instant automated confirmation</span>
                                        <span className="flex items-center gap-2"><i className="fas fa-clock"></i> Expires: {new Date(invoice.expiryDate).toLocaleDateString()}</span>
                                    </div>
                                    <a href={invoice.paymentLink || `${window.location.origin}/#/invoice/${invoice.id}`} target="_blank" rel="noopener noreferrer" className="bg-white text-[#02275A] px-6 py-2 rounded-xl font-bold hover:bg-blue-50 transition-colors w-full sm:w-auto text-center print:bg-[#02275A] print:text-white print:border print:border-[#02275A]">
                                        Pay Now <i className="fas fa-external-link-alt ml-1"></i>
                                    </a>
                                </div>
                            </div>
                        )}

                        {isPaid && (
                            <div className="mb-12 bg-emerald-50 border border-emerald-100 rounded-2xl p-8 text-center">
                                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                                    <i className="fas fa-check-double"></i>
                                </div>
                                <h3 className="text-xl font-bold text-emerald-800">Payment Received</h3>
                                <p className="text-emerald-600 text-sm mt-1">This invoice has been fully paid. Thank you for your business.</p>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="text-center border-t border-slate-100 pt-8">
                            <p className="text-sm font-bold text-slate-800 mb-1">Thank you for choosing Prokip!</p>
                            <p className="text-xs text-slate-400">
                                This is a system-generated invoice. If you have any questions, please contact billing@prokip.com.
                                <br />Terms & Conditions apply.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Actions (Sticky) */}
                <div className="bg-white p-4 md:px-8 border-t border-slate-200 sticky bottom-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Share via:</span>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <button 
                                    onClick={handleShare} 
                                    disabled={isDownloading}
                                    className="flex-1 sm:flex-none py-2 px-6 bg-blue-50 text-blue-600 font-bold rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 text-sm border border-blue-100 relative overflow-hidden"
                                >
                                    {isDownloading && (
                                        <div 
                                            className="absolute left-0 top-0 bottom-0 bg-blue-200/50 transition-all duration-300" 
                                            style={{ width: `${downloadProgress}%` }}
                                        />
                                    )}
                                    <span className="relative z-10 flex items-center gap-2">
                                        {isDownloading ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-share-alt"></i>}
                                        {isDownloading ? `Preparing ${downloadProgress}%` : 'Share Invoice'}
                                    </span>
                                </button>
                                {isNonNigerian && !isPaid && !isExpired && (
                                    <button 
                                        onClick={() => setIsPaymentModalOpen(true)}
                                        className="flex-1 sm:flex-none py-2 px-6 bg-emerald-50 text-emerald-600 font-bold rounded-lg hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2 text-sm border border-emerald-100"
                                    >
                                        <i className="fas fa-paper-plane"></i> Request Payment
                                    </button>
                                )}
                            </div>
                        </div>

                        {!isPaid && !isExpired && (
                            <div className="flex gap-3 w-full sm:w-auto">
                                <button 
                                    onClick={handleDownloadPDF} 
                                    disabled={isDownloading}
                                    className="hidden sm:flex px-4 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors items-center gap-2 relative overflow-hidden"
                                >
                                    {isDownloading && (
                                        <div 
                                            className="absolute left-0 top-0 bottom-0 bg-blue-100/50 transition-all duration-300" 
                                            style={{ width: `${downloadProgress}%` }}
                                        />
                                    )}
                                    <span className="relative z-10 flex items-center gap-2">
                                        {isDownloading ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-download"></i>}
                                        {isDownloading ? `Downloading ${downloadProgress}%` : 'PDF'}
                                    </span>
                                </button>
                                <button 
                                    onClick={handleSimulatePayment} 
                                    disabled={isSimulatingPayment}
                                    className="w-full sm:w-auto px-6 py-3 bg-[#02275A] text-white font-bold rounded-xl shadow-lg hover:bg-[#02275A]/90 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70 disabled:transform-none"
                                >
                                    {isSimulatingPayment ? (
                                        <><i className="fas fa-circle-notch fa-spin"></i> Processing...</>
                                    ) : (
                                        <><i className="fas fa-credit-card"></i> Simulate Customer Payment</>
                                    )}
                                </button>
                            </div>
                        )}
                        {isPaid && (
                            <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100">
                                <i className="fas fa-check-circle"></i> Paid & Confirmed
                            </div>
                        )}
                    </div>
                </div>
            <MobileMoneyPaymentModal 
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                invoice={invoice}
                country={userCountry}
                onSuccess={() => {
                    setIsPaymentModalOpen(false);
                    if (onUpdateInvoice) {
                        onUpdateInvoice({ ...invoice, status: 'Paid' });
                    }
                }}
            />
        </div>
    );
};

export default InvoiceTemplateModal;
