
import React, { useState } from 'react';
import { Invoice, Lead, Business, Agent } from '../types';
import CreateInvoiceModal from './CreateInvoiceModal';
import InvoiceTemplateModal from './InvoiceTemplateModal';
import { useAlert } from '../contexts/AlertContext';

interface InvoicesViewProps {
    invoices: Invoice[];
    leads: Lead[];
    businesses: Business[];
    onAddInvoice: (invoice: Invoice) => void;
    onUpdateInvoice?: (invoice: Invoice) => void;
    isEmbedded?: boolean;
    agents?: Agent[];
    restrictToLeads?: boolean;
    userCountry?: string;
}

const InvoicesView: React.FC<InvoicesViewProps> = ({ invoices, leads, businesses, onAddInvoice, onUpdateInvoice, isEmbedded = false, agents, restrictToLeads, userCountry = 'Nigeria' }) => {
    const { showInfo } = useAlert();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [filter, setFilter] = useState('All');

    const filteredInvoices = invoices.filter(inv => {
        if (filter === 'All') return true;
        return inv.status === filter;
    });

    const handleViewInvoice = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setIsTemplateModalOpen(true);
    };

    return (
        <div className={`w-full mx-auto ${isEmbedded ? '' : 'px-4 md:px-8 py-6'} animate-fade-in`}>
            
            {/* Header Section */}
            <div className={`flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 ${isEmbedded ? 'mt-4' : ''}`}>
                {/* If embedded, hide the title text as parent handles it, but keep layout for button */}
                {!isEmbedded ? (
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Invoicing</h2>
                        <p className="text-xs text-slate-500">Manage payment requests for leads and trials.</p>
                    </div>
                ) : (
                    <div></div> // Spacer if title is hidden
                )}
                
                <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-[#02275A] text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-[#02275A]/90 transition-all flex items-center gap-2 ml-auto"
                >
                    <i className="fas fa-plus"></i> Create Invoice
                </button>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-xs text-slate-500 font-bold uppercase mb-1">Total Outstanding</p>
                    <h3 className="text-2xl font-bold text-slate-800">
                        ₦{invoices.filter(i => i.status === 'Unpaid').reduce((acc, curr) => acc + parseInt(curr.totalAmount || curr.amount), 0).toLocaleString()}
                    </h3>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-xs text-slate-500 font-bold uppercase mb-1">Paid this Month</p>
                    <h3 className="text-2xl font-bold text-emerald-600">
                        ₦{invoices.filter(i => i.status === 'Paid').reduce((acc, curr) => acc + parseInt(curr.totalAmount || curr.amount), 0).toLocaleString()}
                    </h3>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-xs text-slate-500 font-bold uppercase mb-1">Active Invoices</p>
                    <h3 className="text-2xl font-bold text-[#02275A]">{invoices.filter(i => i.status !== 'Paid').length}</h3>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
                {['All', 'Unpaid', 'Paid', 'Overdue'].map(f => (
                    <button 
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${filter === f ? 'bg-[#02275A] text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Invoice List */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100 text-xs text-slate-500 uppercase">
                            <tr>
                                <th className="p-4 font-bold">Recipient</th>
                                <th className="p-4 font-bold">Details</th>
                                <th className="p-4 font-bold">Total</th>
                                <th className="p-4 font-bold">Items</th>
                                {agents && <th className="p-4 font-bold">Agent</th>}
                                <th className="p-4 font-bold">Status</th>
                                <th className="p-4 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredInvoices.map((inv) => (
                                <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4">
                                        <p className="font-bold text-slate-800">{inv.recipientName}</p>
                                        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{inv.recipientType}</span>
                                    </td>
                                    <td className="p-4">
                                        <p className="font-mono text-xs text-slate-500 mb-1">{inv.id}</p>
                                        <p className="text-xs text-slate-400">Due: {inv.dueDate}</p>
                                    </td>
                                    <td className="p-4 font-bold text-slate-800">₦{parseInt(inv.totalAmount || inv.amount).toLocaleString()}</td>
                                    <td className="p-4">
                                        {inv.items && inv.items.length > 0 ? (
                                            <div className="flex flex-col gap-1">
                                                {inv.items.slice(0, 2).map((item, idx) => (
                                                    <span key={idx} className="text-xs text-slate-600 bg-slate-50 px-2 py-0.5 rounded w-fit">
                                                        {item.description}
                                                    </span>
                                                ))}
                                                {inv.items.length > 2 && <span className="text-[10px] text-slate-400">+{inv.items.length - 2} more</span>}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-500">{inv.description}</span>
                                        )}
                                    </td>
                                    {agents && (
                                        <td className="p-4">
                                            {inv.assignedAgentName ? (
                                                <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded font-bold">
                                                    {inv.assignedAgentName}
                                                </span>
                                            ) : (
                                                <span className="text-[10px] text-slate-400 italic">Unassigned</span>
                                            )}
                                        </td>
                                    )}
                                    <td className="p-4">
                                        <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${
                                            inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                                            inv.status === 'Overdue' ? 'bg-rose-100 text-rose-700' :
                                            inv.status === 'Expired' ? 'bg-slate-200 text-slate-500' :
                                            'bg-amber-100 text-amber-700'
                                        }`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button 
                                            onClick={() => handleViewInvoice(inv)} 
                                            className="px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ml-auto"
                                        >
                                            View / Share <i className="fas fa-share-alt"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredInvoices.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-500">No invoices found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals */}
            <CreateInvoiceModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)} 
                leads={leads}
                businesses={businesses}
                onCreate={(inv) => { onAddInvoice(inv); setIsCreateModalOpen(false); handleViewInvoice(inv); }} // Auto open template after create
                agents={agents}
                restrictToLeads={restrictToLeads}
            />

            <InvoiceTemplateModal 
                isOpen={isTemplateModalOpen}
                onClose={() => setIsTemplateModalOpen(false)}
                invoice={selectedInvoice}
                onUpdateInvoice={onUpdateInvoice}
                userCountry={userCountry}
            />
        </div>
    );
};

export default InvoicesView;
