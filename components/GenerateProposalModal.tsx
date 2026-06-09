
import React, { useState, useEffect } from 'react';
import { Lead, ProposalItem } from '../types';
import { useAlert } from '../contexts/AlertContext';

// --- Types & Defaults ---

interface ProposalSectionData {
    coverTitle: string;
    coverSubtitle: string;
    executiveSummary: string;
    aboutProkip: string;
    needs: string;
    solution: string;
    whyUs: string;
    roiText: string;
    timeline: string;
    nextSteps: string; // CTA
    terms: string;
}

const DEFAULT_CONTENT: ProposalSectionData = {
    coverTitle: "Digital Transformation Proposal",
    coverSubtitle: "Streamlining Operations & Boosting Profitability",
    executiveSummary: "Thank you for the opportunity to present this proposal. In today's fast-paced retail environment, efficiency is the cornerstone of growth. We understand that your business requires a robust system to manage inventory, track sales, and prevent revenue leakage—without being dependent on unreliable internet.\n\nThis proposal outlines a tailored solution using Prokip's hybrid-cloud technology to digitize your operations, giving you control and peace of mind.",
    aboutProkip: "Prokip is the leading hybrid-cloud business management solution built specifically for retail and wholesale businesses in emerging markets.",
    needs: "Based on our analysis, we have identified these core requirements:\n\n1. **Inventory Control:** Eliminate stock discrepancies and theft.\n2. **Offline Reliability:** Ability to sell continuously even without internet.\n3. **Remote Monitoring:** Real-time access to reports from anywhere.\n4. **Financial Accuracy:** Automated daily balancing and profit tracking.",
    solution: "We propose deploying the **Prokip Business Operating System**, a comprehensive suite designed to address your specific challenges:\n\n- **Smart POS Terminal:** Fast checkout that syncs automatically when online.\n- **Inventory Cloud:** Centralized stock management across all locations.\n- **Owner App:** Live dashboard on your phone to track sales instantly.\n- **CRM Module:** Customer loyalty tracking and debt management.",
    whyUs: "Prokip works the way your business operates:\n\n1. **Hybrid Offline/Online:** We are the only solution that guarantees 100% uptime. If the internet fails, you keep selling.\n2. **Local Context:** Built for the unique workflows of Nigerian businesses.\n3. **Omnichannel:** Manage walk-in customers and online orders in one view.",
    roiText: "Our clients typically experience:\n- **25% Reduction** in stock loss within the first 90 days.\n- **15% Increase** in revenue due to faster checkout and stock availability.\n- **10+ Hours** saved weekly on manual reconciliation.",
    timeline: "Week 1: System Setup & Product Import\nWeek 2: Staff Training & Hardware Installation\nWeek 3: Go-Live & On-site Support\nWeek 4: Post-Implementation Review",
    nextSteps: "To proceed with this transformation:\n1. Review the investment summary below.\n2. Sign the acceptance section.\n3. Make the initial deposit to schedule your onboarding.",
    terms: "Payment Terms: 70% upfront, 30% upon completion of training.\nValidity: This proposal is valid for 14 days from the date of issue."
};

const DEFAULT_ITEMS: ProposalItem[] = [
    { id: '1', description: 'Prokip Standard License (Annual)', quantity: 1, unitPrice: 20000, total: 20000, type: 'Plan' },
    { id: '2', description: 'Onboarding & Data Migration', quantity: 1, unitPrice: 15000, total: 15000, type: 'Service' },
    { id: '3', description: 'Hardware Setup & Training', quantity: 1, unitPrice: 10000, total: 10000, type: 'Service' }
];

// --- Sub-Components ---

const SoftwareMockup = () => {
    return (
        <div className="w-full my-8 transform transition-all hover:scale-[1.01] duration-500">
            <div className="bg-slate-800 rounded-t-lg p-2 flex gap-1.5 border border-slate-700">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
            </div>
            <div className="bg-slate-100 border border-t-0 border-slate-200 rounded-b-lg p-1 shadow-xl">
                <div className="flex bg-white h-48 md:h-64 rounded overflow-hidden">
                    <div className="w-16 bg-[#02275A] flex flex-col items-center pt-4 gap-3 hidden sm:flex">
                        <div className="w-8 h-8 bg-white/20 rounded mb-2"></div>
                        <div className="w-8 h-1.5 bg-white/10 rounded"></div>
                        <div className="w-8 h-1.5 bg-white/10 rounded"></div>
                        <div className="w-8 h-1.5 bg-white/10 rounded"></div>
                    </div>
                    <div className="flex-1 p-4 bg-slate-50 flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                            <div className="h-4 w-32 bg-slate-200 rounded"></div>
                            <div className="h-6 w-20 bg-blue-100 rounded-full"></div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-white p-3 rounded shadow-sm border border-slate-100">
                                <div className="w-6 h-6 rounded-full bg-emerald-100 mb-2"></div>
                                <div className="h-2 w-12 bg-slate-200 rounded"></div>
                            </div>
                            <div className="bg-white p-3 rounded shadow-sm border border-slate-100">
                                <div className="w-6 h-6 rounded-full bg-amber-100 mb-2"></div>
                                <div className="h-2 w-12 bg-slate-200 rounded"></div>
                            </div>
                            <div className="bg-white p-3 rounded shadow-sm border border-slate-100">
                                <div className="w-6 h-6 rounded-full bg-purple-100 mb-2"></div>
                                <div className="h-2 w-12 bg-slate-200 rounded"></div>
                            </div>
                        </div>
                        <div className="flex-1 bg-white rounded shadow-sm border border-slate-100 p-3 space-y-2">
                            <div className="h-2 w-full bg-slate-100 rounded"></div>
                            <div className="h-2 w-full bg-slate-100 rounded"></div>
                            <div className="h-2 w-3/4 bg-slate-100 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TimelineVisual = ({ text }: { text: string }) => {
    const steps = text.split('\n').filter(t => t.trim() !== '');
    return (
        <div className="relative pl-2 py-2">
            {steps.map((step, idx) => (
                <div key={idx} className="flex gap-4 pb-6 last:pb-0 relative">
                    {idx !== steps.length - 1 && (
                        <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-slate-200"></div>
                    )}
                    <div className="w-6 h-6 rounded-full bg-[#02275A] border-4 border-white shadow-sm shrink-0 z-10"></div>
                    <div>
                        <p className="text-sm font-bold text-slate-800 leading-tight">{step.split(':')[0]}</p>
                        <p className="text-xs text-slate-500 mt-1">{step.split(':')[1] || 'Implementation Phase'}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

// --- Proposal Preview Component ---
const ProposalPreview = ({ lead, content, items, total }: { lead: Lead, content: ProposalSectionData, items: ProposalItem[], total: number }) => {
    const formatText = (text: string) => {
        if (!text) return null;
        return text.split('\n').map((str, index) => {
            if (!str.trim()) return <br key={index} />;
            return (
                <p key={index} className="mb-2 leading-relaxed text-slate-600">
                    {str.split(/(\*\*.*?\*\*)/).map((part, i) => 
                        part.startsWith('**') && part.endsWith('**') 
                            ? <strong key={i} className="text-slate-800">{part.slice(2, -2)}</strong> 
                            : part
                    )}
                </p>
            );
        });
    };

    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div id="proposal-preview" className="bg-white text-slate-800 font-sans shadow-2xl mx-auto w-full max-w-[850px] min-h-[1000px] relative animate-fade-in print:shadow-none mb-20 pb-12">
            
            {/* --- HEADER / COVER --- */}
            <div className="bg-[#02275A] text-white p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10"><i className="fas fa-file-contract text-9xl"></i></div>
                <div className="relative z-10 flex justify-between items-start mb-16">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-[#02275A] font-bold text-2xl shadow-lg">P</div>
                        <span className="text-2xl font-bold tracking-tight">Prokip</span>
                    </div>
                    <div className="text-right text-blue-200 text-sm">
                        <p className="font-bold text-white uppercase tracking-widest mb-1">Proposal</p>
                        <p>#{new Date().getFullYear()}-{lead.id}</p>
                        <p>{today}</p>
                    </div>
                </div>
                
                <div className="relative z-10">
                    <div className="inline-block bg-amber-400 text-[#02275A] font-bold uppercase tracking-widest text-xs px-3 py-1 rounded mb-4">
                        Prepared For
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">{lead.business}</h1>
                    <div className="text-blue-100 text-lg border-l-4 border-amber-400 pl-6 py-2">
                        <p className="font-bold text-white text-2xl mb-1">{content.coverTitle}</p>
                        <p>{content.coverSubtitle}</p>
                    </div>
                </div>
            </div>

            <div className="p-12 space-y-12">
                
                {/* --- EXECUTIVE SUMMARY --- */}
                <section>
                    <h3 className="text-lg font-bold text-[#02275A] uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Executive Summary</h3>
                    <div className="text-sm leading-relaxed">{formatText(content.executiveSummary)}</div>
                </section>

                {/* --- CHALLENGE & SOLUTION --- */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                        <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2 uppercase text-xs tracking-wide">
                            <i className="fas fa-bullseye text-rose-500"></i> The Challenge
                        </h4>
                        <div className="text-xs text-slate-600">{formatText(content.needs)}</div>
                    </div>
                    <div className="bg-emerald-50/50 p-6 rounded-xl border border-emerald-100">
                        <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2 uppercase text-xs tracking-wide">
                            <i className="fas fa-check-circle text-emerald-500"></i> The Solution
                        </h4>
                        <div className="text-xs text-slate-600">{formatText(content.solution)}</div>
                    </div>
                </section>

                {/* --- SOFTWARE VISUAL --- */}
                <SoftwareMockup />

                {/* --- WHY PROKIP --- */}
                <section>
                    <h3 className="text-lg font-bold text-[#02275A] uppercase tracking-wider mb-6 border-b border-slate-100 pb-2">Why Prokip?</h3>
                    <div className="text-sm mb-6">{formatText(content.whyUs)}</div>
                    
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#02275A] shadow-sm mx-auto mb-2 text-lg">
                                <i className="fas fa-wifi"></i>
                            </div>
                            <p className="text-xs font-bold text-slate-700">Works Offline</p>
                        </div>
                        <div className="text-center p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#02275A] shadow-sm mx-auto mb-2 text-lg">
                                <i className="fas fa-sync-alt"></i>
                            </div>
                            <p className="text-xs font-bold text-slate-700">Auto Sync</p>
                        </div>
                        <div className="text-center p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#02275A] shadow-sm mx-auto mb-2 text-lg">
                                <i className="fas fa-mobile-alt"></i>
                            </div>
                            <p className="text-xs font-bold text-slate-700">Mobile App</p>
                        </div>
                    </div>
                </section>

                {/* --- INVESTMENT --- */}
                <section>
                    <h3 className="text-lg font-bold text-[#02275A] uppercase tracking-wider mb-6 border-b border-slate-100 pb-2">Investment Summary</h3>
                    <div className="border border-slate-200 rounded-lg overflow-hidden mb-4">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                                <tr>
                                    <th className="py-3 px-4 text-left">Description</th>
                                    <th className="py-3 px-4 text-center">Type</th>
                                    <th className="py-3 px-4 text-center">Qty</th>
                                    <th className="py-3 px-4 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {items.map((item) => (
                                    <tr key={item.id}>
                                        <td className="py-3 px-4 font-medium text-slate-700">{item.description}</td>
                                        <td className="py-3 px-4 text-center text-xs text-slate-500">{item.type}</td>
                                        <td className="py-3 px-4 text-center text-slate-600">{item.quantity}</td>
                                        <td className="py-3 px-4 text-right font-bold text-slate-800">₦{item.total.toLocaleString()}</td>
                                    </tr>
                                ))}
                                <tr className="bg-[#02275A] text-white">
                                    <td colSpan={3} className="py-4 px-4 text-right font-bold uppercase text-xs tracking-wider">Total Investment</td>
                                    <td className="py-4 px-4 text-right font-extrabold text-lg">₦{total.toLocaleString()}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg text-xs text-slate-500 italic border border-slate-100">
                        {content.terms}
                    </div>
                </section>

                {/* --- TIMELINE --- */}
                <section>
                    <h3 className="text-lg font-bold text-[#02275A] uppercase tracking-wider mb-6 border-b border-slate-100 pb-2">Implementation Plan</h3>
                    <TimelineVisual text={content.timeline} />
                </section>

                {/* --- CALL TO ACTION (CTA) --- */}
                <section className="bg-gradient-to-r from-slate-900 to-[#02275A] text-white p-8 rounded-2xl relative overflow-hidden print:bg-white print:text-black print:border print:border-black">
                    <div className="relative z-10">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <i className="fas fa-signature text-amber-400"></i> Next Steps & Acceptance
                        </h3>
                        <div className="text-sm text-blue-100 mb-8 leading-relaxed print:text-black">
                            {formatText(content.nextSteps)}
                        </div>

                        <div className="grid grid-cols-2 gap-8 mt-12">
                            <div>
                                <div className="border-b border-white/30 print:border-black h-12 mb-2"></div>
                                <p className="text-xs uppercase font-bold text-blue-300 print:text-black">Authorized Signature</p>
                                <p className="text-sm font-bold mt-1">{lead.business}</p>
                            </div>
                            <div>
                                <div className="border-b border-white/30 print:border-black h-12 mb-2"></div>
                                <p className="text-xs uppercase font-bold text-blue-300 print:text-black">Date</p>
                            </div>
                        </div>
                    </div>
                    {/* Decor */}
                    <div className="absolute top-0 right-0 p-8 opacity-10 print:hidden"><i className="fas fa-handshake text-9xl"></i></div>
                </section>

            </div>
        </div>
    );
};

// --- Proposal Builder Component ---
const ProposalBuilder = ({ 
    content, 
    setContent, 
    items, 
    onAddItem, 
    onRemoveItem, 
    onUpdateItem 
}: { 
    content: ProposalSectionData, 
    setContent: (c: ProposalSectionData) => void,
    items: ProposalItem[],
    onAddItem: (desc: string, price: number, type: any) => void,
    onRemoveItem: (id: string) => void,
    onUpdateItem: (id: string, field: keyof ProposalItem, value: any) => void
}) => {
    const [activeSection, setActiveSection] = useState<keyof ProposalSectionData | 'pricing'>('coverTitle');

    const sections: { id: keyof ProposalSectionData | 'pricing', label: string, icon: string }[] = [
        { id: 'coverTitle', label: 'Cover Page', icon: 'fa-book' },
        { id: 'executiveSummary', label: 'Executive Summary', icon: 'fa-align-left' },
        { id: 'needs', label: 'The Challenge', icon: 'fa-exclamation-circle' },
        { id: 'solution', label: 'The Solution', icon: 'fa-check-double' },
        { id: 'whyUs', label: 'Why Prokip', icon: 'fa-star' },
        { id: 'pricing', label: 'Investment & Pricing', icon: 'fa-tags' },
        { id: 'timeline', label: 'Implementation', icon: 'fa-clock' },
        { id: 'roiText', label: 'ROI & Value', icon: 'fa-chart-line' },
        { id: 'nextSteps', label: 'Call to Action', icon: 'fa-signature' },
        { id: 'terms', label: 'Terms & Conditions', icon: 'fa-file-contract' }
    ];

    const standardPlans = [
        { name: 'Standard Plan', price: 20000, type: 'Plan' },
        { name: 'Premium Plan', price: 45000, type: 'Plan' },
        { name: 'Ultimate Plan', price: 80000, type: 'Plan' }
    ];

    return (
        <div className="flex flex-col md:flex-row h-full overflow-hidden bg-white">
            {/* Sidebar */}
            <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 overflow-y-auto shrink-0 flex flex-row md:flex-col p-2 md:p-0 gap-1 md:gap-0 no-scrollbar">
                {sections.map(section => (
                    <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`text-left px-4 py-3 md:py-4 text-xs font-bold flex items-center gap-3 transition-colors shrink-0 md:shrink border-b border-transparent md:border-slate-100 w-full ${activeSection === section.id ? 'bg-white text-[#02275A] border-l-4 border-l-[#02275A] shadow-sm md:border-b-slate-100' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}
                    >
                        <i className={`fas ${section.icon} w-5 text-center`}></i>
                        <span className="whitespace-nowrap hidden md:inline">{section.label}</span>
                        <span className="whitespace-nowrap md:hidden">{section.label.split(' ')[0]}</span>
                    </button>
                ))}
            </div>

            {/* Editor Area */}
            <div className="flex-1 p-6 bg-slate-50/30 overflow-y-auto">
                {activeSection === 'pricing' ? (
                    <div className="space-y-6 max-w-3xl mx-auto">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-800">Investment & Pricing</h3>
                            <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg font-bold">
                                Total: ₦{items.reduce((acc, i) => acc + i.total, 0).toLocaleString()}
                            </span>
                        </div>

                        {/* List Items */}
                        <div className="space-y-3">
                            {items.map((item) => (
                                <div key={item.id} className="grid grid-cols-12 gap-2 items-center bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                    <div className="col-span-12 md:col-span-6">
                                        <input 
                                            type="text" 
                                            value={item.description}
                                            onChange={(e) => onUpdateItem(item.id, 'description', e.target.value)}
                                            className="w-full bg-white border border-slate-100 rounded px-2 py-1 text-sm font-bold text-slate-700 outline-none focus:border-[#02275A]"
                                            placeholder="Item Description"
                                        />
                                    </div>
                                    <div className="col-span-4 md:col-span-2">
                                        <input 
                                            type="number" 
                                            value={item.quantity}
                                            min="1"
                                            onChange={(e) => onUpdateItem(item.id, 'quantity', parseInt(e.target.value))}
                                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-center"
                                        />
                                    </div>
                                    <div className="col-span-6 md:col-span-3">
                                        <input 
                                            type="number" 
                                            value={item.unitPrice}
                                            onChange={(e) => onUpdateItem(item.id, 'unitPrice', parseFloat(e.target.value))}
                                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-right"
                                        />
                                    </div>
                                    <div className="col-span-2 md:col-span-1 text-right">
                                        <button onClick={() => onRemoveItem(item.id)} className="text-rose-400 hover:text-rose-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-rose-50">
                                            <i className="fas fa-times"></i>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Add Buttons */}
                        <div className="pt-4 border-t border-slate-200">
                            <p className="text-xs font-bold text-slate-400 mb-2 uppercase">Quick Add</p>
                            <div className="flex flex-wrap gap-2">
                                {standardPlans.map(plan => (
                                    <button 
                                        key={plan.name}
                                        onClick={() => onAddItem(plan.name, plan.price, plan.type)}
                                        className="px-3 py-2 bg-white border border-indigo-100 text-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-50 transition-colors shadow-sm"
                                    >
                                        + {plan.name}
                                    </button>
                                ))}
                                <button 
                                    onClick={() => onAddItem('Custom Service', 0, 'Service')}
                                    className="px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors shadow-sm"
                                >
                                    + Custom Item
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 max-w-3xl mx-auto">
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Edit {sections.find(s => s.id === activeSection)?.label}</h3>
                        
                        {activeSection === 'coverTitle' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Proposal Title</label>
                                    <input 
                                        type="text" 
                                        value={content.coverTitle}
                                        onChange={(e) => setContent({...content, coverTitle: e.target.value})}
                                        className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:border-[#02275A] outline-none font-bold bg-white shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Subtitle</label>
                                    <input 
                                        type="text" 
                                        value={content.coverSubtitle}
                                        onChange={(e) => setContent({...content, coverSubtitle: e.target.value})}
                                        className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:border-[#02275A] outline-none bg-white shadow-sm"
                                    />
                                </div>
                            </div>
                        )}

                        {activeSection !== 'coverTitle' && (
                            <div className="flex flex-col h-full">
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Content</label>
                                <textarea 
                                    value={content[activeSection as keyof ProposalSectionData]}
                                    onChange={(e) => setContent({...content, [activeSection]: e.target.value})}
                                    className="w-full flex-1 p-4 border border-slate-200 rounded-lg text-sm leading-relaxed focus:border-[#02275A] outline-none resize-none bg-white shadow-sm min-h-[400px]"
                                    placeholder="Enter content here..."
                                ></textarea>
                                <div className="text-xs text-slate-400 mt-2 flex justify-between">
                                    <span>Supports basic Markdown: **bold**</span>
                                    <span>{content[activeSection as keyof ProposalSectionData]?.length || 0} chars</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

interface GenerateProposalModalProps {
    isOpen: boolean;
    onClose: () => void;
    lead: Lead | null;
}

const GenerateProposalModal: React.FC<GenerateProposalModalProps> = ({ isOpen, onClose, lead }) => {
    const { showSuccess, showInfo } = useAlert();
    const [mode, setMode] = useState<'edit' | 'preview'>('edit');
    const [content, setContent] = useState<ProposalSectionData>(DEFAULT_CONTENT);
    const [items, setItems] = useState<ProposalItem[]>(DEFAULT_ITEMS);

    // Reset on Open
    useEffect(() => {
        if (isOpen && lead) {
            setMode('edit');
            // Customize default content with lead name
            setContent({
                ...DEFAULT_CONTENT,
                executiveSummary: DEFAULT_CONTENT.executiveSummary.replace('your business', lead.business),
                coverSubtitle: `Prepared exclusively for ${lead.business}`
            });
        }
    }, [isOpen, lead]);

    // Item Handlers
    const addItem = (desc: string, price: number, type: any) => {
        const newItem: ProposalItem = {
            id: Date.now().toString(),
            description: desc,
            quantity: 1,
            unitPrice: price,
            total: price,
            type: type
        };
        setItems([...items, newItem]);
    };

    const updateItem = (id: string, field: keyof ProposalItem, value: any) => {
        setItems(items.map(i => {
            if (i.id === id) {
                const updated = { ...i, [field]: value };
                if (field === 'quantity' || field === 'unitPrice') {
                    updated.total = updated.quantity * updated.unitPrice;
                }
                return updated;
            }
            return i;
        }));
    };

    const removeItem = (id: string) => {
        setItems(items.filter(i => i.id !== id));
    };

    const handleExportPDF = () => {
        // TODO: Generate PDF
        showSuccess("Generating PDF... Download will start shortly.");
        setTimeout(() => showInfo("Proposal PDF downloaded."), 1500);
    };

    const handleSend = () => {
        // TODO: Connect to backend
        if (!lead) return;
        const url = `https://wa.me/${lead.phone.replace('+', '')}?text=${encodeURIComponent(`Hello ${lead.name}, please find the attached proposal for ${lead.business}.`)}`;
        window.open(url, '_blank');
        onClose();
    };

    if (!isOpen || !lead) return null;

    return (
        <div className="fixed inset-0 z-[70] bg-slate-50 animate-fade-in flex flex-col h-screen w-screen overflow-hidden">
            {/* Top Bar - Full Width Fixed Header */}
            <div className="bg-white px-4 md:px-8 py-4 border-b border-slate-200 flex justify-between items-center shrink-0 z-20 shadow-sm h-16">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors">
                        <i className="fas fa-arrow-left"></i>
                    </button>
                    <div>
                        <h2 className="font-bold text-slate-800 text-base md:text-lg leading-tight">Proposal Builder</h2>
                        <p className="text-xs text-slate-500 hidden md:block">For: <span className="font-bold">{lead.business}</span></p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-slate-100 p-1 rounded-lg flex">
                        <button 
                            onClick={() => setMode('edit')}
                            className={`px-3 md:px-4 py-1.5 md:py-2 text-xs font-bold rounded-md transition-all ${mode === 'edit' ? 'bg-white text-[#02275A] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Editor
                        </button>
                        <button 
                            onClick={() => setMode('preview')}
                            className={`px-3 md:px-4 py-1.5 md:py-2 text-xs font-bold rounded-md transition-all ${mode === 'preview' ? 'bg-white text-[#02275A] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Preview
                        </button>
                    </div>
                    {/* Primary Actions (Desktop) */}
                    {mode === 'preview' && (
                        <div className="hidden md:flex gap-2">
                            <button 
                                onClick={handleExportPDF}
                                className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-lg text-xs hover:bg-slate-50 transition-colors flex items-center gap-2"
                            >
                                <i className="fas fa-file-pdf text-rose-500"></i> PDF
                            </button>
                            <button 
                                onClick={handleSend}
                                className="px-4 py-2 bg-[#02275A] text-white font-bold rounded-lg text-xs shadow-md hover:bg-[#02275A]/90 transition-colors flex items-center gap-2"
                            >
                                <i className="fas fa-paper-plane"></i> Send
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content Area - Scrollable */}
            <div className="flex-1 overflow-hidden relative bg-slate-100">
                {mode === 'edit' ? (
                    <ProposalBuilder 
                        content={content} 
                        setContent={setContent}
                        items={items}
                        onAddItem={addItem}
                        onRemoveItem={removeItem}
                        onUpdateItem={updateItem}
                    />
                ) : (
                    <div className="h-full w-full overflow-y-auto custom-scrollbar p-0 md:p-8 flex justify-center">
                        <ProposalPreview 
                            lead={lead} 
                            content={content} 
                            items={items} 
                            total={items.reduce((acc, i) => acc + i.total, 0)} 
                        />
                    </div>
                )}
            </div>

            {/* Bottom Bar Actions (Mobile Preview Only) */}
            {mode === 'preview' && (
                <div className="md:hidden bg-white p-4 border-t border-slate-200 flex justify-between items-center shrink-0 z-20 pb-8">
                    <div className="text-xs text-slate-500 font-medium">
                        Value: <span className="text-sm font-bold text-[#02275A]">₦{items.reduce((acc, i) => acc + i.total, 0).toLocaleString()}</span>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={handleExportPDF}
                            className="w-10 h-10 border border-slate-200 text-slate-600 font-bold rounded-lg hover:bg-slate-50 flex items-center justify-center"
                        >
                            <i className="fas fa-file-pdf text-rose-500"></i>
                        </button>
                        <button 
                            onClick={handleSend}
                            className="px-6 py-2.5 bg-[#02275A] text-white font-bold rounded-lg shadow-lg hover:bg-[#02275A]/90 flex items-center gap-2 text-xs"
                        >
                            <i className="fas fa-paper-plane"></i> Send
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GenerateProposalModal;
