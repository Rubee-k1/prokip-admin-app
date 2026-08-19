
import React, { useState, useEffect } from 'react';
import { Lead, Business, Invoice, InvoiceItem, Agent, Discount } from '../types';
import { useAlert } from '../contexts/AlertContext';

interface CreateInvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    leads: Lead[];
    businesses: Business[];
    onCreate: (invoice: Invoice) => void;
    agents?: Agent[];
    restrictToLeads?: boolean;
    initialRecipient?: { id: string, type: 'Lead' | 'Business' };
}

const PREDEFINED_PLANS = [
    { id: 'std', name: 'Standard Plan', price: 20000, color: 'bg-amber-50 border-amber-200 text-amber-700' },
    { id: 'prm', name: 'Premium Plan', price: 45000, color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
    { id: 'ult', name: 'Ultimate Plan', price: 80000, color: 'bg-slate-100 border-slate-200 text-slate-700' }
];

const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({ isOpen, onClose, leads, businesses, onCreate, agents, restrictToLeads, initialRecipient }) => {
    const { showSuccess, showError, showInfo } = useAlert();
    const [isLoading, setIsLoading] = useState(false);
    
    const eligibleBusinesses = businesses.filter(b => b.plan.toLowerCase().includes('trial') || b.status === 'Pending' || b.status === 'Engaged' || b.status === 'Completed');
    
    const [recipientType, setRecipientType] = useState<'Lead' | 'Business'>('Lead');
    const [selectedRecipientId, setSelectedRecipientId] = useState<string>('');
    const [invoiceType, setInvoiceType] = useState<'New Sale' | 'Renewal' | 'Upgrade' | 'Standalone Add-on'>('New Sale');
    const [selectedAgentId, setSelectedAgentId] = useState<string>('');
    const [items, setItems] = useState<InvoiceItem[]>([]);
    const [discountPercent, setDiscountPercent] = useState<number>(0);
    const [showDiscount, setShowDiscount] = useState<boolean>(false);
    const [isCustomDiscount, setIsCustomDiscount] = useState<boolean>(false);

    const selectedLeadObj = recipientType === 'Lead' ? leads.find(l => l.id.toString() === selectedRecipientId) : undefined;
    const isCompanyLead = selectedLeadObj?.type === 'Company';
    
    const getActiveDiscountForCompanyLead = (): Discount | null => {
        const stored = localStorage.getItem('prokip_discounts');
        if (!stored) return null;
        try {
            const parsed = JSON.parse(stored) as Discount[];
            const now = Date.now();
            return parsed.find(d => {
                if (d.status === 'Ended') return false;
                const start = new Date(d.validFrom).getTime();
                const end = new Date(d.validTo).getTime();
                return d.leadType === 'Company Lead' && now >= start && now <= end;
            }) || null;
        } catch (e) {
            return null;
        }
    };

    const activeCampaign = getActiveDiscountForCompanyLead();
    const isEligibleForDiscount = recipientType === 'Lead' && isCompanyLead && invoiceType === 'New Sale' && activeCampaign !== null;

    useEffect(() => {
        if (!isEligibleForDiscount) {
            setDiscountPercent(0);
            setShowDiscount(false);
        }
    }, [isEligibleForDiscount]);
    
    // Addon State
    const [showAddonsEntry, setShowAddonsEntry] = useState(false);
    const [addonQuantities, setAddonQuantities] = useState({
        user: 0,
        location: 0,
        product: 0
    });

    // Custom Item State
    const [showCustomEntry, setShowCustomEntry] = useState(false);
    const [newItemDesc, setNewItemDesc] = useState('');
    const [newItemAmount, setNewItemAmount] = useState('');
    const [newItemType, setNewItemType] = useState<'Subscription' | 'Service'>('Service');

    useEffect(() => {
        if (isOpen) {
            setItems([]);
            setShowCustomEntry(false);
            setShowAddonsEntry(false);
            setAddonQuantities({ user: 0, location: 0, product: 0 });
            setNewItemDesc('');
            setNewItemAmount('');
            setNewItemType('Service'); // Default to service for manual entry since plans handle sub
            setDiscountPercent(0);
            setShowDiscount(false);
            setIsCustomDiscount(false);
            setInvoiceType('New Sale');
            
            if (initialRecipient) {
                setRecipientType(initialRecipient.type);
                setSelectedRecipientId(initialRecipient.id);
            } else {
                setSelectedRecipientId('');
                if (restrictToLeads) {
                    setRecipientType('Lead');
                } else {
                    setRecipientType('Lead');
                }
            }
            setSelectedAgentId('');
        }
    }, [isOpen, restrictToLeads, initialRecipient]);

    const getRecipientDetails = () => {
        if (recipientType === 'Lead') {
            const l = leads.find(l => l.id.toString() === selectedRecipientId);
            return l ? { name: l.name, sub: l.business, email: l.email, phone: l.phone } : { name: '', sub: '', email: '', phone: '' };
        } else {
            const b = businesses.find(b => b.id === selectedRecipientId);
            return b ? { name: b.name, sub: b.owner, email: b.email, phone: b.phone } : { name: '', sub: '', email: '', phone: '' };
        }
    };

    const handleAddPlan = (plan: typeof PREDEFINED_PLANS[0]) => {
        // Check if a subscription already exists to avoid duplicates if needed, or just allow stacking
        const newItem: InvoiceItem = {
            id: Date.now().toString(),
            description: `${plan.name} Subscription`,
            amount: plan.price,
            type: 'Subscription'
        };
        setItems([...items, newItem]);
    };

    const updateAddonCount = (type: 'user' | 'location' | 'product', delta: number) => {
        setAddonQuantities(prev => ({
            ...prev,
            [type]: Math.max(0, prev[type] + delta)
        }));
    };

    const handleAddSpecificAddon = (type: 'user' | 'location' | 'product') => {
        const qty = addonQuantities[type];
        if (qty <= 0) return;

        let price = 0;
        let name = '';
        
        if (type === 'user') { price = 20000; name = 'Extra User License'; }
        if (type === 'location') { price = 40000; name = 'Additional Location'; }
        if (type === 'product') { price = 10000; name = 'Extra Products (1k)'; }

        const newItem: InvoiceItem = {
            id: Date.now().toString() + Math.random(),
            description: `${name} (x${qty})`,
            amount: price * qty,
            type: 'Addon'
        };
        
        setItems([...items, newItem]);
        setAddonQuantities(prev => ({ ...prev, [type]: 0 }));
    };

    const handleAddCustomItem = () => {
        if (!newItemDesc || !newItemAmount) {
            showError("Please enter description and amount");
            return;
        }
        const amount = parseFloat(newItemAmount);
        if (isNaN(amount) || amount <= 0) {
            showError("Invalid amount");
            return;
        }

        const newItem: InvoiceItem = {
            id: Date.now().toString(),
            description: newItemDesc,
            amount: amount,
            type: newItemType
        };

        setItems([...items, newItem]);
        setNewItemDesc('');
        setNewItemAmount('');
        setShowCustomEntry(false); // Close toggle after adding
    };

    const handleRemoveItem = (id: string) => {
        setItems(items.filter(i => i.id !== id));
    };

    const calculateTotal = () => {
        return items.reduce((acc, item) => acc + item.amount, 0);
    };

    const handleGenerate = () => {
        if (!selectedRecipientId) {
            showError("Please select a recipient.");
            return;
        }
        if (items.length === 0) {
            showError("Please select a plan or add an item.");
            return;
        }

        setIsLoading(true);
        // Simulate generating virtual account
        setTimeout(() => {
            const newInvoiceId = `INV-${Math.floor(Math.random() * 100000)}`;
            const newVirtualAccount = '8' + Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
            const details = getRecipientDetails();
            const baseTotal = calculateTotal();
            const discountPercentVal = discountPercent || 0;
            const discountableTotal = items.filter(i => i.type !== 'Service').reduce((sum, i) => sum + i.amount, 0);
            const discountAmountVal = Math.round(discountableTotal * (discountPercentVal / 100));
            const finalTotal = baseTotal - discountAmountVal;
            
            // Set expiry for 1 week from now
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 7);

            const leadObj = recipientType === 'Lead' ? leads.find(l => l.id.toString() === selectedRecipientId) : undefined;
            const leadCategory = leadObj ? leadObj.type : undefined;
            const leadCommissionPercent = leadObj ? leadObj.commissionPercent : undefined;

            const newInvoice: Invoice = {
                id: newInvoiceId,
                recipientId: selectedRecipientId,
                recipientName: recipientType === 'Lead' ? `${details.name} (${details.sub})` : details.name,
                recipientEmail: details.email,
                recipientPhone: details.phone,
                recipientType: recipientType,
                totalAmount: finalTotal.toString(),
                items: items,
                description: items.map(i => i.description).join(', '),
                dateCreated: new Date().toLocaleDateString(),
                dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString(), // Due in 3 days ideally
                expiryDate: expiryDate.toISOString(), // Expire account in 7 days
                status: 'Unpaid',
                virtualAccount: newVirtualAccount,
                bankName: 'Moniepoint MFB',
                accountName: `Prokip - ${details.name.substring(0, 10)}`,
                paymentLink: `${window.location.origin}/#/invoice/${newInvoiceId}`,
                assignedAgentId: selectedAgentId || undefined,
                assignedAgentName: selectedAgentId && agents ? agents.find(a => a.id === selectedAgentId)?.name : undefined,
                leadCategory: leadCategory,
                commissionPercent: leadCommissionPercent,
                discountPercent: discountPercentVal > 0 ? discountPercentVal : undefined,
                originalAmount: discountPercentVal > 0 ? baseTotal.toString() : undefined,
            };

            onCreate(newInvoice);
            setIsLoading(false);
            onClose();
        }, 1500);
    };

    if (!isOpen) return null;

    const baseTotal = calculateTotal();
    const discountableTotal = items.filter(i => i.type !== 'Service').reduce((sum, i) => sum + i.amount, 0);
    const discountAmount = Math.round(discountableTotal * ((discountPercent || 0) / 100));
    const finalTotal = baseTotal - discountAmount;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
                
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 text-lg">Create New Invoice</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><i className="fas fa-times"></i></button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <div className="space-y-6">
                        {/* 1. Recipient Selection */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">1. Select Recipient</label>
                            {!restrictToLeads && (
                                <div className="flex gap-2 mb-2">
                                    <button 
                                        onClick={() => { 
                                            setRecipientType('Lead'); 
                                            setSelectedRecipientId(''); 
                                            setDiscountPercent(0);
                                            setShowDiscount(false);
                                            setIsCustomDiscount(false);
                                        }}
                                        className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-colors ${recipientType === 'Lead' ? 'bg-[#02275A] text-white border-[#02275A]' : 'bg-white text-slate-500 border-slate-200'}`}
                                    >
                                        Lead
                                    </button>
                                    <button 
                                        onClick={() => { 
                                            setRecipientType('Business'); 
                                            setSelectedRecipientId(''); 
                                            setDiscountPercent(0);
                                            setShowDiscount(false);
                                            setIsCustomDiscount(false);
                                        }}
                                        className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-colors ${recipientType === 'Business' ? 'bg-[#02275A] text-white border-[#02275A]' : 'bg-white text-slate-500 border-slate-200'}`}
                                    >
                                        Business
                                    </button>
                                </div>
                            )}
                            <select 
                                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#02275A]"
                                value={selectedRecipientId}
                                onChange={(e) => {
                                    setSelectedRecipientId(e.target.value);
                                    setDiscountPercent(0);
                                    setShowDiscount(false);
                                    setIsCustomDiscount(false);
                                }}
                            >
                                <option value="">Select Customer...</option>
                                {recipientType === 'Lead' 
                                    ? leads.map(l => <option key={l.id} value={l.id}>{l.name} - {l.business}</option>)
                                    : eligibleBusinesses.map(b => <option key={b.id} value={b.id}>{b.name} ({b.plan})</option>)
                                }
                            </select>
                        </div>

                        {/* Invoice Type selection */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Invoice Type</label>
                            <select
                                value={invoiceType}
                                onChange={(e) => {
                                    setInvoiceType(e.target.value as any);
                                }}
                                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#02275A] text-slate-800"
                                id="invoice-type-select"
                            >
                                <option value="New Sale">New Sale (Eligible for promo discounts)</option>
                                <option value="Renewal">Renewal</option>
                                <option value="Upgrade">Upgrade</option>
                                <option value="Standalone Add-on">Standalone Add-on</option>
                            </select>
                        </div>

                        {/* Agent Selection (if agents are provided) */}
                        {agents && agents.length > 0 && (
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Assign Agent (Optional)</label>
                                <select 
                                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#02275A]"
                                    value={selectedAgentId}
                                    onChange={(e) => setSelectedAgentId(e.target.value)}
                                >
                                    <option value="">No Agent Assigned</option>
                                    {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                            </div>
                        )}

                        {/* 2. Priority: Subscription Plans */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-3">2. Choose Subscription Plan (Recommended)</label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {PREDEFINED_PLANS.map(plan => (
                                    <button 
                                        key={plan.id}
                                        onClick={() => handleAddPlan(plan)}
                                        className={`p-3 rounded-xl border text-center transition-all hover:scale-105 active:scale-95 ${plan.color} shadow-sm`}
                                    >
                                        <div className="font-bold text-xs uppercase mb-1">{plan.name.split(' ')[0]}</div>
                                        <div className="font-extrabold text-sm">₦{(plan.price / 1000)}k</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 3. Add-ons (Collapsible) */}
                        <div>
                            {!showAddonsEntry ? (
                                <button 
                                    onClick={() => setShowAddonsEntry(true)}
                                    className="text-xs text-indigo-500 font-bold hover:text-indigo-700 flex items-center gap-1 transition-colors ml-1"
                                >
                                    <i className="fas fa-layer-group"></i> Add Plan Extras (Users, Locations, Products)
                                </button>
                            ) : (
                                <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50 animate-fade-in">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="text-xs font-bold text-indigo-800 uppercase flex items-center gap-2">
                                            <i className="fas fa-layer-group"></i> Plan Extras
                                        </h4>
                                        <button onClick={() => setShowAddonsEntry(false)} className="text-indigo-400 hover:text-indigo-600"><i className="fas fa-times"></i></button>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        {/* User Row */}
                                        <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-indigo-100 shadow-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs"><i className="fas fa-user-plus"></i></div>
                                                <div>
                                                    <div className="font-bold text-xs text-slate-700">Extra User</div>
                                                    <div className="text-[10px] text-slate-500">₦20,000 / user</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center border border-slate-200 rounded-lg h-8">
                                                    <button onClick={() => updateAddonCount('user', -1)} className="px-2.5 h-full text-slate-500 hover:bg-slate-50 rounded-l-lg font-bold">-</button>
                                                    <input 
                                                        type="number" 
                                                        value={addonQuantities.user} 
                                                        onChange={(e) => setAddonQuantities({...addonQuantities, user: Math.max(0, parseInt(e.target.value) || 0)})}
                                                        className="w-10 text-center text-xs font-bold outline-none text-slate-800" 
                                                    />
                                                    <button onClick={() => updateAddonCount('user', 1)} className="px-2.5 h-full text-slate-500 hover:bg-slate-50 rounded-r-lg font-bold">+</button>
                                                </div>
                                                <button onClick={() => handleAddSpecificAddon('user')} className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:bg-slate-300" disabled={addonQuantities.user === 0}>Add</button>
                                            </div>
                                        </div>
                                        
                                        {/* Location Row */}
                                        <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-indigo-100 shadow-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs"><i className="fas fa-store"></i></div>
                                                <div>
                                                    <div className="font-bold text-xs text-slate-700">Extra Location</div>
                                                    <div className="text-[10px] text-slate-500">₦40,000 / loc</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center border border-slate-200 rounded-lg h-8">
                                                    <button onClick={() => updateAddonCount('location', -1)} className="px-2.5 h-full text-slate-500 hover:bg-slate-50 rounded-l-lg font-bold">-</button>
                                                    <input 
                                                        type="number" 
                                                        value={addonQuantities.location} 
                                                        onChange={(e) => setAddonQuantities({...addonQuantities, location: Math.max(0, parseInt(e.target.value) || 0)})}
                                                        className="w-10 text-center text-xs font-bold outline-none text-slate-800" 
                                                    />
                                                    <button onClick={() => updateAddonCount('location', 1)} className="px-2.5 h-full text-slate-500 hover:bg-slate-50 rounded-r-lg font-bold">+</button>
                                                </div>
                                                <button onClick={() => handleAddSpecificAddon('location')} className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-bold shadow-sm hover:bg-emerald-700 disabled:opacity-50 disabled:bg-slate-300" disabled={addonQuantities.location === 0}>Add</button>
                                            </div>
                                        </div>

                                        {/* Product Row */}
                                        <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-indigo-100 shadow-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs"><i className="fas fa-boxes"></i></div>
                                                <div>
                                                    <div className="font-bold text-xs text-slate-700">Products (1k)</div>
                                                    <div className="text-[10px] text-slate-500">₦10,000 / 1k</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center border border-slate-200 rounded-lg h-8">
                                                    <button onClick={() => updateAddonCount('product', -1)} className="px-2.5 h-full text-slate-500 hover:bg-slate-50 rounded-l-lg font-bold">-</button>
                                                    <input 
                                                        type="number" 
                                                        value={addonQuantities.product} 
                                                        onChange={(e) => setAddonQuantities({...addonQuantities, product: Math.max(0, parseInt(e.target.value) || 0)})}
                                                        className="w-10 text-center text-xs font-bold outline-none text-slate-800" 
                                                    />
                                                    <button onClick={() => updateAddonCount('product', 1)} className="px-2.5 h-full text-slate-500 hover:bg-slate-50 rounded-r-lg font-bold">+</button>
                                                </div>
                                                <button onClick={() => handleAddSpecificAddon('product')} className="text-xs bg-amber-600 text-white px-3 py-1.5 rounded-lg font-bold shadow-sm hover:bg-amber-700 disabled:opacity-50 disabled:bg-slate-300" disabled={addonQuantities.product === 0}>Add</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 6. Promotional Discount (Conditionally displayed) */}
                        {isEligibleForDiscount && activeCampaign && (
                            <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 space-y-3 animate-fade-in" id="invoice-discount-section">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="p-2 bg-emerald-100 text-emerald-700 rounded-lg text-xs"><i className="fas fa-tags"></i></span>
                                        <div>
                                            <h4 className="text-xs font-bold text-emerald-800">Eligible Promotional Discount</h4>
                                            <p className="text-[10px] text-emerald-600 font-semibold">Active Campaign: {activeCampaign.id} ({activeCampaign.percentage}% Off)</p>
                                        </div>
                                    </div>
                                    
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={showDiscount}
                                            onChange={(e) => {
                                                const checked = e.target.checked;
                                                setShowDiscount(checked);
                                                setDiscountPercent(checked ? activeCampaign.percentage : 0);
                                                if (checked) {
                                                    showInfo(`Applied ${activeCampaign.percentage}% Promotional Discount!`);
                                                }
                                            }}
                                            className="sr-only peer"
                                            id="apply-invoice-discount-toggle"
                                        />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                    </label>
                                </div>

                                {showDiscount && (
                                    <div className="bg-white p-3 rounded-lg border border-emerald-100 text-[11px] space-y-1.5 text-emerald-700 font-medium">
                                        <div className="flex justify-between">
                                            <span>Applicable Items:</span>
                                            <span className="font-bold">Packages & Add-ons only</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Non-discountable Services:</span>
                                            <span className="font-bold text-slate-500">
                                                ₦{items.filter(i => i.type === 'Service').reduce((sum, i) => sum + i.amount, 0).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between border-t border-emerald-100/50 pt-1.5 font-bold text-emerald-800">
                                            <span>Discount Rate:</span>
                                            <span>{activeCampaign.percentage}% Off</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 4. Items List Summary */}
                        {items.length > 0 && (
                            <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Invoice Summary</label>
                                {items.map(item => (
                                    <div key={item.id} className="flex justify-between items-center p-2 bg-white rounded-lg border border-slate-100 shadow-sm text-sm">
                                        <div>
                                            <p className="font-bold text-slate-800 text-xs">{item.description}</p>
                                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                                                item.type === 'Subscription' ? 'bg-indigo-100 text-indigo-700' : 
                                                item.type === 'Addon' ? 'bg-blue-100 text-blue-700' :
                                                'bg-orange-100 text-orange-700'
                                            }`}>
                                                {item.type}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-slate-700 text-xs">₦{item.amount.toLocaleString()}</span>
                                            <button onClick={() => handleRemoveItem(item.id)} className="text-slate-300 hover:text-rose-500">
                                                <i className="fas fa-times"></i>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <div className="space-y-1.5 pt-2 mt-2 border-t border-slate-200 text-xs">
                                    <div className="flex justify-between items-center text-slate-500">
                                        <span>Subtotal</span>
                                        <span>₦{baseTotal.toLocaleString()}</span>
                                    </div>
                                    {discountPercent > 0 ? (
                                        <div className="flex justify-between items-center text-emerald-600 font-semibold">
                                            <span>Discount ({discountPercent}%)</span>
                                            <span>-₦{(baseTotal - finalTotal).toLocaleString()}</span>
                                        </div>
                                    ) : null}
                                    <div className="flex justify-between items-center text-sm font-bold pt-1.5 border-t border-dashed border-slate-100">
                                        <span className="text-slate-700">Total Due</span>
                                        <span className="text-[#02275A] text-base">₦{finalTotal.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 5. Secondary: Custom Items */}
                        <div>
                            {!showCustomEntry ? (
                                <button 
                                    onClick={() => setShowCustomEntry(true)}
                                    className="text-xs text-slate-400 font-bold hover:text-[#02275A] flex items-center gap-1 transition-colors ml-1"
                               >
                                    <i className="fas fa-plus-circle"></i> Add other service or custom item
                                </button>
                            ) : (
                                <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100/50 animate-fade-in">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="text-xs font-bold text-orange-800 uppercase flex items-center gap-2">
                                            <i className="fas fa-tools"></i> Add Other Service
                                        </h4>
                                        <button onClick={() => setShowCustomEntry(false)} className="text-orange-400 hover:text-orange-600"><i className="fas fa-times"></i></button>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 gap-3 mb-3">
                                        <input 
                                            type="text" 
                                            placeholder="Description (e.g. Data Entry, Hardware Setup)"
                                            className="w-full p-2.5 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-orange-400"
                                            value={newItemDesc}
                                            onChange={(e) => setNewItemDesc(e.target.value)}
                                        />
                                        <div className="grid grid-cols-2 gap-3">
                                            <input 
                                                type="number" 
                                                placeholder="Amount (₦)"
                                                className="w-full p-2.5 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-orange-400"
                                                value={newItemAmount}
                                                onChange={(e) => setNewItemAmount(e.target.value)}
                                            />
                                            <button 
                                                onClick={handleAddCustomItem}
                                                className="w-full py-2.5 bg-orange-100 text-orange-700 font-bold text-xs rounded-lg hover:bg-orange-200 transition-colors"
                                            >
                                                Add Item
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-orange-600 italic">
                                        * Note: Other services incur a 10% processing fee. Prioritize subscriptions when possible.
                                    </p>
                                </div>
                            )}
                        </div>

                    </div>
                </div>

                <div className="p-6 bg-white border-t border-slate-100">
                    <button 
                        onClick={handleGenerate} 
                        disabled={isLoading}
                        className="w-full py-3 bg-[#02275A] text-white font-bold rounded-xl shadow-lg hover:bg-[#02275A]/90 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70"
                    >
                        {isLoading ? <i className="fas fa-circle-notch fa-spin"></i> : 'Generate Invoice & Payment Link'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateInvoiceModal;
