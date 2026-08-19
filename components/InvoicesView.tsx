import React, { useState, useMemo } from 'react';
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
    callAgents?: any[];
    brmsList?: any[];
    restrictToLeads?: boolean;
    userCountry?: string;
    userRole?: string;
}

const InvoicesView: React.FC<InvoicesViewProps> = ({ 
    invoices, 
    leads = [], 
    businesses = [], 
    onAddInvoice, 
    onUpdateInvoice, 
    isEmbedded = false, 
    agents, 
    callAgents,
    brmsList,
    restrictToLeads, 
    userCountry = 'Nigeria',
    userRole = 'agent'
}) => {
    const { showInfo } = useAlert();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [filter, setFilter] = useState('All');

    // Check if the current user role is allowed to apply discount
    const isAllowedToApplyDiscount = ['sales-manager', 'call-agent', 'telesales'].includes(userRole || '');

    const handleApplyDiscount = (inv: Invoice, pct: number) => {
        if (!onUpdateInvoice) return;

        const baseAmount = inv.originalAmount || inv.totalAmount || '0';
        const parsedBase = parseInt(baseAmount) || 0;

        if (pct === 0) {
            // Reset discount
            const updatedInvoice: Invoice = {
                ...inv,
                totalAmount: baseAmount,
                discountPercent: undefined,
                originalAmount: undefined
            };
            onUpdateInvoice(updatedInvoice);
            showInfo(`Discount cleared for Invoice #${inv.id}`);
        } else {
            // Apply new discount
            const newTotal = Math.round(parsedBase * (1 - pct / 100));
            const updatedInvoice: Invoice = {
                ...inv,
                totalAmount: newTotal.toString(),
                discountPercent: pct,
                originalAmount: baseAmount
            };
            onUpdateInvoice(updatedInvoice);
            showInfo(`${pct}% discount applied to Invoice #${inv.id}`);
        }
    };
    
    // Telesales & Agent filtering states
    const [selectedTelesales, setSelectedTelesales] = useState('All');
    const [selectedFieldAgent, setSelectedFieldAgent] = useState('All');

    // Extract unique telesales options from props or data
    const telesalesOptions = useMemo(() => {
        const list: { id: string; name: string }[] = [];
        const seenIds = new Set<string>();

        // 1. From agents prop
        if (agents && agents.length > 0) {
            agents.forEach(a => {
                if (!seenIds.has(a.id)) {
                    seenIds.add(a.id);
                    list.push({ id: a.id, name: a.name });
                }
            });
        }

        // 2. From callAgents prop
        if (callAgents && callAgents.length > 0) {
            callAgents.forEach(ca => {
                if (!seenIds.has(ca.id)) {
                    seenIds.add(ca.id);
                    list.push({ id: ca.id, name: ca.name });
                }
            });
        }

        // 3. Fallback/Dynamic from leads data (assignedAgentId / assignedAgentName)
        leads.forEach(l => {
            if (l.assignedAgentId && !seenIds.has(l.assignedAgentId)) {
                seenIds.add(l.assignedAgentId);
                list.push({ id: l.assignedAgentId, name: l.assignedAgentName || l.assignedAgentId });
            }
        });

        return list;
    }, [agents, callAgents, leads]);

    // Extract unique field agents (BRM/manager) options from props or data
    const fieldAgentOptions = useMemo(() => {
        const list: { id: string; name: string }[] = [];
        const seenIds = new Set<string>();

        // 1. From brmsList prop
        if (brmsList && brmsList.length > 0) {
            brmsList.forEach(b => {
                if (!seenIds.has(b.id)) {
                    seenIds.add(b.id);
                    list.push({ id: b.id, name: b.name });
                }
            });
        }

        // 2. Fallback/Dynamic from leads (managerId / managerName, brmId / brmName)
        leads.forEach(l => {
            const mId = l.brmId || l.managerId;
            const mName = l.brmName || l.managerName;
            if (mId && !seenIds.has(mId)) {
                seenIds.add(mId);
                list.push({ id: mId, name: mName || mId });
            }
        });

        return list;
    }, [brmsList, leads]);

    // Filter invoices based on telesales and field agent filters
    const invoicesFilteredByAgents = useMemo(() => {
        return invoices.filter(inv => {
            const associatedLead = leads.find(l => l.id.toString() === inv.recipientId.toString());
            
            // Telesales matching
            const matchesTelesales = selectedTelesales === 'All' || 
                inv.assignedAgentId === selectedTelesales || 
                (associatedLead && associatedLead.assignedAgentId === selectedTelesales);

            // Field agent (BRM) matching
            const matchesFieldAgent = selectedFieldAgent === 'All' || 
                (associatedLead && (associatedLead.brmId === selectedFieldAgent || associatedLead.managerId === selectedFieldAgent));

            return matchesTelesales && matchesFieldAgent;
        });
    }, [invoices, leads, selectedTelesales, selectedFieldAgent]);

    // Apply the status tab filter on top of the agent/telesales filtered results
    const filteredInvoices = useMemo(() => {
        return invoicesFilteredByAgents.filter(inv => {
            if (filter === 'All') return true;
            return inv.status === filter;
        });
    }, [invoicesFilteredByAgents, filter]);

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
                        ₦{invoicesFilteredByAgents.filter(i => i.status === 'Unpaid').reduce((acc, curr) => acc + (parseInt(curr.totalAmount || curr.amount || '0') || 0), 0).toLocaleString()}
                    </h3>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-xs text-slate-500 font-bold uppercase mb-1">Paid this Month</p>
                    <h3 className="text-2xl font-bold text-emerald-600">
                        ₦{invoicesFilteredByAgents.filter(i => i.status === 'Paid').reduce((acc, curr) => acc + (parseInt(curr.totalAmount || curr.amount || '0') || 0), 0).toLocaleString()}
                    </h3>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-xs text-slate-500 font-bold uppercase mb-1">Active Invoices</p>
                    <h3 className="text-2xl font-bold text-[#02275A]">{invoicesFilteredByAgents.filter(i => i.status !== 'Paid').length}</h3>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                {/* Status Tab list */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
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

                {/* Telesales & Field Agent Dropdowns */}
                <div className="flex flex-wrap gap-2.5 items-center">
                    {/* Telesales Selector */}
                    <div className="relative pointer-events-auto">
                        <select
                            value={selectedTelesales}
                            onChange={(e) => setSelectedTelesales(e.target.value)}
                            className="appearance-none pl-3 pr-8 py-2 rounded-lg text-xs font-bold border border-slate-200 bg-white text-slate-600 hover:border-slate-300 transition-all cursor-pointer outline-none focus:ring-2 focus:ring-[#02275A]/20"
                        >
                            <option value="All">Telesales: All</option>
                            {telesalesOptions.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                        <i className="fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 pointer-events-none"></i>
                    </div>

                    {/* Field Agent (BRM) Selector */}
                    <div className="relative pointer-events-auto">
                        <select
                            value={selectedFieldAgent}
                            onChange={(e) => setSelectedFieldAgent(e.target.value)}
                            className="appearance-none pl-3 pr-8 py-2 rounded-lg text-xs font-bold border border-slate-200 bg-white text-slate-600 hover:border-slate-300 transition-all cursor-pointer outline-none focus:ring-2 focus:ring-[#02275A]/20"
                        >
                            <option value="All">Field Agent: All</option>
                            {fieldAgentOptions.map(fa => (
                                <option key={fa.id} value={fa.id}>{fa.name}</option>
                            ))}
                        </select>
                        <i className="fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 pointer-events-none"></i>
                    </div>
                </div>
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
                                <th className="p-4 font-bold">Assigned Roles</th>
                                <th className="p-4 font-bold">Status</th>
                                <th className="p-4 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredInvoices.map((inv) => {
                                const associatedLead = leads.find(l => l.id.toString() === inv.recipientId.toString());
                                return (
                                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4">
                                            <p className="font-bold text-slate-800">{inv.recipientName}</p>
                                            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{inv.recipientType}</span>
                                        </td>
                                        <td className="p-4">
                                            <p className="font-mono text-xs text-slate-500 mb-1">{inv.id}</p>
                                            <p className="text-xs text-slate-400">Due: {inv.dueDate}</p>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-slate-800">₦{parseInt(inv.totalAmount || inv.amount || '0').toLocaleString()}</div>
                                            {inv.discountPercent ? (
                                                <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1.5 mt-1">
                                                    <span className="bg-emerald-50 px-1.5 py-0.5 rounded">
                                                        {inv.discountPercent}% Discount
                                                    </span>
                                                    {inv.originalAmount && (
                                                        <span className="text-slate-400 line-through">
                                                            ₦{parseInt(inv.originalAmount).toLocaleString()}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : null}

                                            {/* Allow applying discount for sales manager and telesales on Company leads */}
                                            {isAllowedToApplyDiscount && (inv.leadCategory === 'Company' || (associatedLead && (associatedLead.type === 'Company' || associatedLead.leadCategory === 'Company'))) && inv.status !== 'Paid' && (
                                                <div className="mt-2 flex flex-col gap-1">
                                                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Apply Discount:</span>
                                                    <div className="flex gap-1 flex-wrap">
                                                        {[10, 20, 25].map(pct => {
                                                            const isSelected = inv.discountPercent === pct;
                                                            return (
                                                                <button
                                                                    key={pct}
                                                                    onClick={() => handleApplyDiscount(inv, pct)}
                                                                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold border transition-all ${
                                                                        isSelected 
                                                                            ? 'bg-[#02275A] text-white border-[#02275A] shadow-sm' 
                                                                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                                                    }`}
                                                                >
                                                                    {pct}%
                                                                </button>
                                                            );
                                                        })}
                                                        {inv.discountPercent ? (
                                                            <button
                                                                onClick={() => handleApplyDiscount(inv, 0)}
                                                                className="text-[9px] px-1.5 py-0.5 rounded font-bold border bg-slate-50 text-rose-500 border-slate-200 hover:bg-rose-50 hover:border-rose-200 transition-all"
                                                                title="Clear discount"
                                                            >
                                                                <i className="fas fa-times"></i>
                                                            </button>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            )}
                                        </td>
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
                                        
                                        {/* Telesales & Field Agent column */}
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1">
                                                {/* Telesales call agent badge */}
                                                {inv.assignedAgentName || (associatedLead && associatedLead.assignedAgentName) ? (
                                                    <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-bold w-fit flex items-center gap-1" title="Telesales Operator">
                                                        <i className="fas fa-headset text-[9px]"></i> {inv.assignedAgentName || (associatedLead && associatedLead.assignedAgentName)}
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] text-slate-400 italic">No Telesales</span>
                                                )}

                                                {/* Field agent badge */}
                                                {associatedLead && (associatedLead.brmName || associatedLead.managerName) ? (
                                                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold w-fit flex items-center gap-1" title="Field Agent / BRM">
                                                        <i className="fas fa-user-tie text-[9px]"></i> {associatedLead.brmName || associatedLead.managerName}
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] text-slate-400 italic">No Field Agent</span>
                                                )}
                                            </div>
                                        </td>

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
                                );
                            })}
                            {filteredInvoices.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-slate-500">No invoices found.</td>
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
