import React, { useState } from 'react';
import { useAlert } from './contexts/AlertContext';

export interface FunnelConfig {
    templateId: string;
    themeColor: 'blue' | 'emerald' | 'violet' | 'crimson' | 'slate';
    whatsappNumber: string;
    whatsappMessage: string;
    facebookPixelId?: string;
    tiktokPixelId?: string;
}

export type FunnelType = 'book_call' | 'request_call' | 'free_consultation' | 'try_prokip';

export interface Funnel {
    id: string;
    title: string;
    type: FunnelType;
    status: 'active' | 'inactive';
    url: string;
    trackingId: string;
    metrics: {
        visits: number;
        leadsGenerated: number;
        appointmentsBooked: number;
        signups: number;
    };
    config: FunnelConfig;
    telesaleAgent?: string;
}

export const TELESALES_AGENTS = [
    { id: 'godwin', name: 'Godwin Benson' },
    { id: 'sarah', name: 'Sarah O.' },
    { id: 'emmanuel', name: 'Emmanuel K.' },
    { id: 'john', name: 'John Agent' },
    { id: 'fatima', name: 'Fatima A.' }
];

const LANDING_PAGE_TEMPLATES = [
    { id: 'tpl-theft', name: 'Stop Employee Theft', desc: 'Perfect for retail businesses struggling with inventory shrinkage.', image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=300' },
    { id: 'tpl-pos', name: 'Free POS System', desc: 'Promotes our core free POS offering to new merchants.', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=300' },
    { id: 'tpl-inventory', name: 'Master Inventory Management', desc: 'Targeted at wholesalers and large retailers.', image: 'https://images.unsplash.com/photo-1586528116311-ad8ed7c663c0?auto=format&fit=crop&q=80&w=300' },
];

const THEME_COLORS = [
    { id: 'blue', color: 'bg-[#02275A]', name: 'Prokip Blue' },
    { id: 'emerald', color: 'bg-emerald-600', name: 'Emerald' },
    { id: 'violet', color: 'bg-violet-600', name: 'Violet' },
    { id: 'crimson', color: 'bg-rose-600', name: 'Crimson' },
    { id: 'slate', color: 'bg-slate-800', name: 'Dark Slate' }
];

const INITIAL_FUNNELS: Funnel[] = [
    {
        id: 'f-1',
        title: 'Main Sales Demo',
        type: 'book_call',
        status: 'active',
        url: `${window.location.origin}/#/landing/book-call/godwin`,
        trackingId: 'camp-bk-01',
        metrics: { visits: 1250, leadsGenerated: 0, appointmentsBooked: 45, signups: 0 },
        config: {
            templateId: 'tpl-theft',
            themeColor: 'blue',
            whatsappNumber: '+2348000000000',
            whatsappMessage: 'Hi, I just booked a demo through your landing page!'
        },
        telesaleAgent: 'godwin'
    },
    {
        id: 'f-2',
        title: 'Free POS Trial Campaign',
        type: 'try_prokip',
        status: 'active',
        url: `${window.location.origin}/#/landing/try-prokip/sarah`,
        trackingId: 'camp-try-02',
        metrics: { visits: 3400, leadsGenerated: 0, appointmentsBooked: 0, signups: 120 },
        config: {
            templateId: 'tpl-pos',
            themeColor: 'emerald',
            whatsappNumber: '+2348000000000',
            whatsappMessage: 'Hi, I just signed up for the free POS trial.'
        },
        telesaleAgent: 'sarah'
    }
];

const FUNNEL_TYPES = [
    { id: 'book_call', name: 'Book a Call', desc: 'Directs to an appointment scheduling form.', icon: 'fa-calendar-check', color: 'text-blue-500' },
    { id: 'request_call', name: 'Request a Call', desc: 'Captures lead details for follow-up.', icon: 'fa-phone-volume', color: 'text-emerald-500' },
    { id: 'free_consultation', name: 'Free Consultation', desc: 'Schedules a high-value advisory session.', icon: 'fa-user-tie', color: 'text-indigo-500' },
    { id: 'try_prokip', name: 'Try Prokip for Free', desc: 'Redirects to signup with your tracking ID.', icon: 'fa-rocket', color: 'text-orange-500' }
];

interface LandingPagesViewProps {
    userRole?: string;
}

const LandingPagesView: React.FC<LandingPagesViewProps> = ({ userRole }) => {
    const { showSuccess } = useAlert();
    const [funnels, setFunnels] = useState<Funnel[]>(INITIAL_FUNNELS);
    const [isBuilderOpen, setIsBuilderOpen] = useState(false);
    const [editingFunnel, setEditingFunnel] = useState<Funnel | null>(null);
    const [filterTelesale, setFilterTelesale] = useState<string>('all');
    const [selectedTelesale, setSelectedTelesale] = useState<string>('godwin');

    // Form states
    const [step, setStep] = useState(1);
    const [selectedType, setSelectedType] = useState<FunnelType>('book_call');
    const [formData, setFormData] = useState<Partial<Funnel>>({
        title: '',
        config: {
            templateId: 'tpl-theft',
            themeColor: 'blue',
            whatsappNumber: '',
            whatsappMessage: ''
        }
    });

    const openBuilder = (funnel?: Funnel) => {
        if (funnel) {
            setEditingFunnel(funnel);
            setSelectedType(funnel.type);
            setFormData(funnel);
            setSelectedTelesale(funnel.telesaleAgent || 'godwin');
            setStep(2);
        } else {
            setEditingFunnel(null);
            setSelectedType('book_call');
            setFormData({
                title: '',
                config: {
                    templateId: 'tpl-theft',
                    themeColor: 'blue',
                    whatsappNumber: '',
                    whatsappMessage: ''
                }
            });
            setSelectedTelesale('godwin');
            setStep(1);
        }
        setIsBuilderOpen(true);
    };

    const handleSave = () => {
        if (editingFunnel) {
            setFunnels(funnels.map(f => f.id === editingFunnel.id ? { 
                ...editingFunnel, 
                ...formData, 
                type: selectedType, 
                telesaleAgent: selectedTelesale,
                url: `${window.location.origin}/#/landing/${selectedType.replace('_', '-')}/${selectedTelesale}`
            } as Funnel : f));
            showSuccess('Funnel updated successfully!');
        } else {
            const newFunnel: Funnel = {
                id: `f-${Date.now()}`,
                title: formData.title || 'New Campaign',
                type: selectedType,
                status: 'active',
                url: `${window.location.origin}/#/landing/${selectedType.replace('_', '-')}/${selectedTelesale}`,
                trackingId: `camp-${Date.now().toString().slice(-6)}`,
                metrics: { visits: 0, leadsGenerated: 0, appointmentsBooked: 0, signups: 0 },
                config: formData.config as FunnelConfig,
                telesaleAgent: selectedTelesale
            };
            setFunnels([...funnels, newFunnel]);
            showSuccess('New funnel created successfully!');
        }
        setIsBuilderOpen(false);
    };

    const toggleStatus = (id: string) => {
        setFunnels(funnels.map(f => f.id === id ? { ...f, status: f.status === 'active' ? 'inactive' : 'active' } : f));
        showSuccess('Status updated.');
    };

    const copyUrl = (url: string) => {
        navigator.clipboard.writeText(url);
        showSuccess('Link copied to clipboard!');
    };

    const getMetricsForType = (funnel: Funnel) => {
        if (funnel.type === 'try_prokip') {
            return { label: 'Signups', value: funnel.metrics.signups, color: 'text-orange-600' };
        }
        if (funnel.type === 'request_call') {
            return { label: 'Leads', value: funnel.metrics.leadsGenerated, color: 'text-emerald-600' };
        }
        return { label: 'Appts', value: funnel.metrics.appointmentsBooked, color: 'text-blue-600' };
    };

    const isAllowedToFilter = userRole === 'admin' || userRole === 'sales-manager';

    const filteredFunnels = funnels.filter(f => {
        if (!isAllowedToFilter || filterTelesale === 'all') return true;
        return f.telesaleAgent === filterTelesale;
    });

    const totalVisits = filteredFunnels.reduce((acc, f) => acc + f.metrics.visits, 0);
    const totalConversions = filteredFunnels.reduce((acc, f) => acc + f.metrics.leadsGenerated + f.metrics.appointmentsBooked + f.metrics.signups, 0);
    const avgConversionRate = totalVisits > 0 ? ((totalConversions / totalVisits) * 100).toFixed(1) : '0';

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Dashboard Header */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight mb-1">Conversion Funnels</h2>
                        <p className="text-sm font-medium text-slate-500">Create, manage, and track landing pages to generate leads and appointments.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        {isAllowedToFilter && (
                            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                                <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                                    <i className="fas fa-filter text-slate-400"></i> Agent:
                                </span>
                                <select
                                    value={filterTelesale}
                                    onChange={(e) => setFilterTelesale(e.target.value)}
                                    className="bg-transparent border-none text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                                    id="telesale-agent-filter"
                                >
                                    <option value="all">All Telesales</option>
                                    {TELESALES_AGENTS.map(agent => (
                                        <option key={agent.id} value={agent.id}>{agent.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <button 
                            onClick={() => openBuilder()}
                            className="bg-[#02275A] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#033b8a] hover:-translate-y-0.5 transition-all shadow-lg shadow-[#02275A]/20 flex items-center gap-2"
                            id="create-funnel-btn"
                        >
                            <i className="fas fa-magic"></i> Create New Funnel
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                        <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Total Visits</div>
                        <div className="text-2xl font-extrabold text-slate-800">{totalVisits.toLocaleString()}</div>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                        <div className="text-emerald-600 text-[10px] font-bold uppercase tracking-wider mb-1">Total Conversions</div>
                        <div className="text-2xl font-extrabold text-emerald-700">{totalConversions.toLocaleString()}</div>
                    </div>
                    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
                        <div className="text-indigo-600 text-[10px] font-bold uppercase tracking-wider mb-1">Avg. Conversion Rate</div>
                        <div className="text-2xl font-extrabold text-indigo-700">{avgConversionRate}%</div>
                    </div>
                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                        <div className="text-amber-600 text-[10px] font-bold uppercase tracking-wider mb-1">Active Funnels</div>
                        <div className="text-2xl font-extrabold text-amber-700">{filteredFunnels.filter(f => f.status === 'active').length}</div>
                    </div>
                </div>
            </div>

            {/* Funnels List */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredFunnels.map(funnel => {
                    const primaryMetric = getMetricsForType(funnel);
                    const typeInfo = FUNNEL_TYPES.find(t => t.id === funnel.type);
                    
                    return (
                        <div key={funnel.id} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all group flex flex-col relative overflow-hidden">
                            {/* Status Indicator */}
                            <div className="absolute top-5 right-5 flex items-center gap-3 z-10">
                                <div className="flex items-center gap-1.5">
                                    <div className={`w-2 h-2 rounded-full ${funnel.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{funnel.status}</span>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 mb-5 relative z-10">
                                <div className={`w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0 ${typeInfo?.color}`}>
                                    <i className={`fas ${typeInfo?.icon} text-lg`}></i>
                                </div>
                                <div className="pr-16 flex-1">
                                    <h3 className="font-bold text-slate-800 text-lg mb-1 leading-tight">{funnel.title}</h3>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-xs font-medium text-slate-500">{typeInfo?.name}</span>
                                        {funnel.telesaleAgent && (
                                            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200" id={`funnel-agent-badge-${funnel.id}`}>
                                                <i className="fas fa-user-tie text-[9px] text-slate-400"></i>
                                                {TELESALES_AGENTS.find(a => a.id === funnel.telesaleAgent)?.name || funnel.telesaleAgent}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 bg-slate-50 border border-slate-100 rounded-2xl p-3 mb-5">
                                <div>
                                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Visits</div>
                                    <div className="font-extrabold text-slate-800">{funnel.metrics.visits.toLocaleString()}</div>
                                </div>
                                <div className="border-l border-slate-200 pl-3">
                                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">{primaryMetric.label}</div>
                                    <div className={`font-extrabold ${primaryMetric.color}`}>{primaryMetric.value.toLocaleString()}</div>
                                </div>
                                <div className="border-l border-slate-200 pl-3">
                                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Conv. Rate</div>
                                    <div className="font-extrabold text-slate-800">
                                        {funnel.metrics.visits ? ((primaryMetric.value / funnel.metrics.visits) * 100).toFixed(1) : 0}%
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto space-y-3">
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="text" 
                                        readOnly 
                                        value={funnel.url}
                                        className="w-full bg-slate-50 border border-slate-200 text-[10px] font-mono text-slate-500 rounded-xl py-2 px-3 focus:outline-none"
                                    />
                                    <button 
                                        onClick={() => copyUrl(funnel.url)}
                                        className="bg-indigo-50 text-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-indigo-100 transition-colors shrink-0"
                                        title="Copy Link"
                                    >
                                        <i className="fas fa-copy text-xs"></i>
                                    </button>
                                </div>
                                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                                    <button 
                                        onClick={() => toggleStatus(funnel.id)}
                                        className={`text-xs font-bold ${funnel.status === 'active' ? 'text-rose-500 hover:text-rose-600' : 'text-emerald-500 hover:text-emerald-600'}`}
                                    >
                                        {funnel.status === 'active' ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => window.open(funnel.url, '_blank')}
                                            className="text-xs font-bold text-slate-500 hover:text-[#02275A]"
                                        >
                                            Preview
                                        </button>
                                        <button 
                                            onClick={() => openBuilder(funnel)}
                                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1 rounded-md"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Funnel Builder Modal */}
            {isBuilderOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-slide-up">
                        <div className="flex justify-between items-center p-5 md:p-6 border-b border-slate-100">
                            <div>
                                <h3 className="font-extrabold text-slate-800 text-xl">{editingFunnel ? 'Edit Funnel' : 'Create New Funnel'}</h3>
                                <p className="text-xs font-medium text-slate-500 mt-1">
                                    {step === 1 ? 'Step 1: Choose your funnel objective' : 'Step 2: Customize the page content'}
                                </p>
                            </div>
                            <button onClick={() => setIsBuilderOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <div className="p-5 md:p-8 overflow-y-auto">
                            {step === 1 ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {FUNNEL_TYPES.map(type => (
                                            <button 
                                                key={type.id}
                                                onClick={() => setSelectedType(type.id as FunnelType)}
                                                className={`text-left p-5 rounded-2xl border-2 transition-all ${selectedType === type.id ? 'border-[#02275A] bg-blue-50/30' : 'border-slate-100 hover:border-slate-200'}`}
                                            >
                                                <div className={`w-10 h-10 rounded-xl bg-white border ${selectedType === type.id ? 'border-[#02275A]/20 shadow-sm' : 'border-slate-100'} flex items-center justify-center mb-4 ${type.color}`}>
                                                    <i className={`fas ${type.icon}`}></i>
                                                </div>
                                                <h4 className="font-bold text-slate-800 mb-1">{type.name}</h4>
                                                <p className="text-xs text-slate-500 leading-relaxed">{type.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex justify-end pt-4">
                                        <button 
                                            onClick={() => setStep(2)}
                                            className="bg-[#02275A] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#033b8a] transition-all flex items-center gap-2"
                                        >
                                            Next Step <i className="fas fa-arrow-right text-xs"></i>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Campaign Internal Name</label>
                                            <input 
                                                type="text" 
                                                value={formData.title}
                                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                                placeholder="e.g. June Instagram Ad Campaign"
                                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 p-3 rounded-xl focus:outline-none focus:border-[#02275A] font-medium" 
                                                id="campaign-name-input"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Assign Telesales Agent</label>
                                            <select 
                                                value={selectedTelesale}
                                                onChange={(e) => setSelectedTelesale(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 p-3 rounded-xl focus:outline-none focus:border-[#02275A] font-medium cursor-pointer"
                                                id="campaign-telesale-select"
                                            >
                                                {TELESALES_AGENTS.map(agent => (
                                                    <option key={agent.id} value={agent.id}>{agent.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-6">
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-sm mb-3">1. Select Template</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {LANDING_PAGE_TEMPLATES.map(tpl => (
                                                    <div 
                                                        key={tpl.id}
                                                        onClick={() => setFormData({...formData, config: {...formData.config!, templateId: tpl.id}})}
                                                        className={`cursor-pointer rounded-xl border-2 overflow-hidden transition-all ${formData.config?.templateId === tpl.id ? 'border-[#02275A] shadow-md ring-2 ring-[#02275A]/20' : 'border-slate-200 hover:border-slate-300'}`}
                                                    >
                                                        <div className="h-24 bg-slate-200">
                                                            <img src={tpl.image} alt={tpl.name} className="w-full h-full object-cover" />
                                                        </div>
                                                        <div className="p-3 bg-white">
                                                            <h5 className="font-bold text-slate-800 text-xs mb-1">{tpl.name}</h5>
                                                            <p className="text-[10px] text-slate-500 leading-tight">{tpl.desc}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="border-t border-slate-200 pt-5">
                                            <h4 className="font-bold text-slate-800 text-sm mb-3">2. Theme Color</h4>
                                            <div className="flex flex-wrap gap-3">
                                                {THEME_COLORS.map(theme => (
                                                    <button
                                                        key={theme.id}
                                                        onClick={() => setFormData({...formData, config: {...formData.config!, themeColor: theme.id as any}})}
                                                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all ${
                                                            formData.config?.themeColor === theme.id 
                                                                ? 'border-indigo-500 bg-indigo-50' 
                                                                : 'border-slate-200 hover:border-slate-300 bg-white'
                                                        }`}
                                                    >
                                                        <div className={`w-4 h-4 rounded-full ${theme.color} shadow-sm`}></div>
                                                        <span className="text-xs font-bold text-slate-700">{theme.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="border-t border-slate-200 pt-5">
                                            <h4 className="font-bold text-slate-800 text-sm mb-1">3. Thank You Page Settings</h4>
                                            <p className="text-xs text-slate-500 mb-4">Add a WhatsApp button so leads can chat with you instantly after submitting.</p>
                                            
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Your WhatsApp Number</label>
                                                    <div className="flex relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500"><i className="fab fa-whatsapp"></i></span>
                                                        <input 
                                                            type="tel" 
                                                            value={formData.config?.whatsappNumber || ''}
                                                            onChange={(e) => setFormData({...formData, config: {...formData.config!, whatsappNumber: e.target.value}})}
                                                            placeholder="e.g. +2348000000000"
                                                            className="w-full bg-white border border-slate-200 text-slate-800 p-3 pl-9 rounded-xl focus:outline-none focus:border-emerald-500 text-sm" 
                                                        />
                                                    </div>
                                                </div>
                                                
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Pre-filled Message</label>
                                                    <textarea 
                                                        rows={2}
                                                        value={formData.config?.whatsappMessage || ''}
                                                        onChange={(e) => setFormData({...formData, config: {...formData.config!, whatsappMessage: e.target.value}})}
                                                        placeholder="e.g. Hi, I just signed up on your page and want to know more about Prokip."
                                                        className="w-full bg-white border border-slate-200 text-slate-800 p-3 rounded-xl focus:outline-none focus:border-emerald-500 text-sm" 
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t border-slate-200 pt-5">
                                            <h4 className="font-bold text-slate-800 text-sm mb-1">4. Pixel Tracking (Optional)</h4>
                                            <p className="text-xs text-slate-500 mb-4">Add your Facebook or TikTok Pixel ID to track conversions and page views.</p>
                                            
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Facebook Pixel ID</label>
                                                    <div className="flex relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600"><i className="fab fa-facebook"></i></span>
                                                        <input 
                                                            type="text" 
                                                            value={formData.config?.facebookPixelId || ''}
                                                            onChange={(e) => setFormData({...formData, config: {...formData.config!, facebookPixelId: e.target.value}})}
                                                            placeholder="e.g. 123456789012345"
                                                            className="w-full bg-white border border-slate-200 text-slate-800 p-3 pl-9 rounded-xl focus:outline-none focus:border-blue-600 text-sm" 
                                                        />
                                                    </div>
                                                </div>
                                                
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">TikTok Pixel ID</label>
                                                    <div className="flex relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-900"><i className="fab fa-tiktok"></i></span>
                                                        <input 
                                                            type="text" 
                                                            value={formData.config?.tiktokPixelId || ''}
                                                            onChange={(e) => setFormData({...formData, config: {...formData.config!, tiktokPixelId: e.target.value}})}
                                                            placeholder="e.g. C123456789012345678"
                                                            className="w-full bg-white border border-slate-200 text-slate-800 p-3 pl-9 rounded-xl focus:outline-none focus:border-slate-900 text-sm" 
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                                        <button 
                                            onClick={() => setStep(1)}
                                            className="text-slate-500 font-bold text-sm hover:text-slate-800 flex items-center gap-2"
                                        >
                                            <i className="fas fa-arrow-left text-xs"></i> Back
                                        </button>
                                        <button 
                                            onClick={handleSave}
                                            className="bg-[#02275A] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#033b8a] transition-all shadow-md flex items-center gap-2"
                                        >
                                            <i className="fas fa-check"></i> {editingFunnel ? 'Save Changes' : 'Publish Funnel'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LandingPagesView;

