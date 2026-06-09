import React, { useState } from 'react';
import { useAlert } from '../contexts/AlertContext';

interface BroadcastCampaign {
    id: string;
    name: string;
    channels: string[];
    audience: string;
    sentCount: number;
    deliveredCount: number;
    status: 'Sent' | 'Scheduled' | 'Draft' | 'Sending';
    date: string;
}

interface Workflow {
    id: string;
    name: string;
    trigger: string;
    status: 'Active' | 'Paused';
    channels: string[];
    description: string;
}

const AdminBroadcastsView: React.FC = () => {
    const { showSuccess } = useAlert();
    const [activeTab, setActiveTab] = useState<'campaigns' | 'templates' | 'workflows' | 'settings'>('campaigns');
    const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);

    // Mock Data
    const campaigns: BroadcastCampaign[] = [
        { id: 'BC-101', name: 'Black Friday SaaS Offer', channels: ['Email', 'In-App'], audience: 'All Active Users', sentCount: 15420, deliveredCount: 15200, status: 'Sent', date: 'Nov 24, 2023' },
        { id: 'BC-102', name: 'System Maintenance Notice', channels: ['Email', 'SMS'], audience: 'Subscribed Users', sentCount: 1200, deliveredCount: 1195, status: 'Sent', date: 'Oct 12, 2023' },
        { id: 'BC-103', name: 'Q1 Partnership Update', channels: ['WhatsApp', 'Email'], audience: 'Agents & Managers', sentCount: 450, deliveredCount: 440, status: 'Scheduled', date: 'Nov 30, 2023' },
        { id: 'BC-104', name: 'New Feature Announcement', channels: ['In-App'], audience: 'All Users', sentCount: 0, deliveredCount: 0, status: 'Draft', date: '-' },
    ];

    const workflows: Workflow[] = [
        { id: 'WF-1', name: 'Welcome Sequence', trigger: 'User Signs Up', status: 'Active', channels: ['Email', 'In-App'], description: 'Series of 3 emails educating the user about the platform.' },
        { id: 'WF-2', name: 'Trial Expiry Reminder', trigger: '3 Days Before Trial Ends', status: 'Active', channels: ['Email', 'SMS'], description: 'Urgent reminder to upgrade to paid plan.' },
        { id: 'WF-3', name: 'Payment Failed', trigger: 'Card Charge Fails', status: 'Active', channels: ['Email', 'WhatsApp'], description: 'Prompt to update payment method immediately.' },
        { id: 'WF-4', name: 'KYC Approved', trigger: 'Agent KYC Verified', status: 'Paused', channels: ['Email', 'In-App'], description: 'Notification that they can now withdraw commissions.' },
        { id: 'WF-5', name: 'Inactive Customer', trigger: 'No Transactions in 7 Days', status: 'Active', channels: ['Email', 'In-App'], description: 'Customer retention message: "We miss you! Here is what you missed." to stimulate activity.' },
        { id: 'WF-6', name: 'End of Day Report', trigger: 'Daily at 8:00 PM', status: 'Active', channels: ['Email'], description: 'Summary of daily sales, invoices, and commissions delivered exclusively via email.' },
        { id: 'WF-7', name: 'Churn Risk Warning', trigger: 'App usage drops by 50%', status: 'Active', channels: ['WhatsApp', 'Email'], description: 'Proactive engagement for accounts exhibiting high churn risk behavior.' },
        { id: 'WF-8', name: 'Abandoned Upgrade', trigger: 'Upgrade page left without payment', status: 'Active', channels: ['Email', 'In-App'], description: 'Reminder to complete plan upgrade with a potential discount.' },
        { id: 'WF-9', name: 'Milestone Celebration', trigger: 'Crosses 1,000 transactions', status: 'Active', channels: ['Email', 'In-App'], description: 'Reward and congratulate users on achieving significant platform milestones.' },
        { id: 'WF-10', name: 'Low Wallet Balance', trigger: 'Wallet balance drops below 1,000 NGN', status: 'Active', channels: ['SMS', 'In-App'], description: 'Alert to remind users to top up.' },
        { id: 'WF-11', name: 'Invoice Overdue', trigger: 'Invoice 3 Days Past Due', status: 'Active', channels: ['WhatsApp', 'Email'], description: 'Urgent automatic reminder for unpaid overdue invoices to improve revenue recovery.' },
        { id: 'WF-12', name: 'Subscription Renewal', trigger: '14 Days Before Next Billing Cycle', status: 'Active', channels: ['Email', 'In-App'], description: 'Pre-notification alerting users that their plan will auto-renew or requires payment soon.' },
        { id: 'WF-13', name: 'First Commission Earned', trigger: 'Agent closes new deal', status: 'Active', channels: ['In-App', 'Email'], description: 'Celebrate new agents closing their first sale on the platform.' },
        { id: 'WF-14', name: 'Agent Inactivity', trigger: 'Agent hasn\'t logged in for 14 days', status: 'Active', channels: ['Email', 'SMS'], description: 'Proactive re-engagement letting agents know about new opportunities and leads.' },
        { id: 'WF-15', name: 'Team Performance SLA', trigger: 'Tickets exceed 50 OR Quota Missed', status: 'Active', channels: ['Email', 'WhatsApp'], description: 'Urgent intervention alert for Managers if team SLAs drop below acceptable levels.' }
    ];

    const [campaignStep, setCampaignStep] = useState(1);
    const [selectedChannels, setSelectedChannels] = useState<string[]>(['Email']);

    const toggleChannel = (channel: string) => {
        if (selectedChannels.includes(channel)) {
            setSelectedChannels(selectedChannels.filter(c => c !== channel));
        } else {
            setSelectedChannels([...selectedChannels, channel]);
        }
    };

    const handlePublish = () => {
        showSuccess('Broadcast Campaign successfully created & queued!');
        setIsCreatingCampaign(false);
        setCampaignStep(1);
    };

    return (
        <div className="p-6 animate-fade-in space-y-6 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Broadcasts & Notifications</h1>
                    <p className="text-sm text-slate-500">Manage multichannel campaigns, SaaS automation workflows, and templates.</p>
                </div>
                {!isCreatingCampaign && (
                    <button 
                        onClick={() => setIsCreatingCampaign(true)}
                        className="bg-[#02275A] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-[#03367A] transition-colors flex items-center gap-2"
                    >
                        <i className="fas fa-bullhorn"></i> New Broadcast
                    </button>
                )}
            </div>

            {isCreatingCampaign ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    {/* Stepper Header */}
                    <div className="bg-slate-50 border-b border-slate-100 p-4 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setIsCreatingCampaign(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors">
                                <i className="fas fa-arrow-left text-sm"></i>
                            </button>
                            <h2 className="font-bold text-slate-800 text-lg">Create New Broadcast</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            {[1, 2, 3].map(step => (
                                <div key={step} className="flex items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${campaignStep === step ? 'bg-[#02275A] text-white' : campaignStep > step ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                        {campaignStep > step ? <i className="fas fa-check"></i> : step}
                                    </div>
                                    {step < 3 && <div className={`w-10 h-1 ${campaignStep > step ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-8">
                        {campaignStep === 1 && (
                            <div className="space-y-8 animate-fade-in max-w-3xl mx-auto">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 mb-2">Campaign Details</h3>
                                    <p className="text-sm text-slate-500 mb-4">Set the name and target audience for this broadcast.</p>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 mb-1">Campaign Name</label>
                                            <input type="text" placeholder="e.g. End of Year Sale" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#02275A] text-sm shadow-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 mb-1">Select Audience Segment</label>
                                            <select className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#02275A] text-sm shadow-sm">
                                                <option>All Active Users</option>
                                                <option>Subscribed Users Only</option>
                                                <option>Trial Users</option>
                                                <option>All Agents</option>
                                                <option>All Managers</option>
                                                <option>Custom CSV Import...</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 mb-2">Select Channels</h3>
                                    <p className="text-sm text-slate-500 mb-4">Choose which platforms to broadcast this message on.</p>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                        {[
                                            { id: 'Email', icon: 'fa-envelope', color: 'text-blue-500', bg: 'bg-blue-50' },
                                            { id: 'SMS', icon: 'fa-comment-alt', color: 'text-emerald-500', bg: 'bg-emerald-50' },
                                            { id: 'WhatsApp', icon: 'fab fa-whatsapp', color: 'text-green-500', bg: 'bg-green-50' },
                                            { id: 'In-App', icon: 'fa-bell', color: 'text-indigo-500', bg: 'bg-indigo-50' }
                                        ].map(channel => (
                                            <div 
                                                key={channel.id} 
                                                onClick={() => toggleChannel(channel.id)}
                                                className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all ${selectedChannels.includes(channel.id) ? 'border-[#02275A] bg-blue-50/30' : 'border-slate-100 bg-white hover:border-slate-300'}`}
                                            >
                                                <div className={`w-12 h-12 rounded-full ${channel.bg} ${channel.color} flex items-center justify-center text-xl mb-3`}>
                                                    <i className={channel.icon}></i>
                                                </div>
                                                <span className="font-bold text-slate-800 text-sm">{channel.id}</span>
                                                {selectedChannels.includes(channel.id) && (
                                                    <div className="absolute top-2 right-2 text-[#02275A]">
                                                        <i className="fas fa-check-circle"></i>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4 border-t border-slate-100">
                                    <button 
                                        onClick={() => setCampaignStep(2)}
                                        disabled={selectedChannels.length === 0}
                                        className="bg-[#02275A] disabled:opacity-50 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-md hover:bg-[#03367A] transition-colors"
                                    >
                                        Next: Compose Content <i className="fas fa-arrow-right ml-2"></i>
                                    </button>
                                </div>
                            </div>
                        )}

                        {campaignStep === 2 && (
                            <div className="space-y-8 animate-fade-in">
                                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                    <div className="lg:col-span-1 space-y-2">
                                        <h3 className="font-bold text-slate-800 text-sm mb-4">Channel Contents</h3>
                                        {selectedChannels.map(channel => (
                                            <div key={channel} className="bg-slate-50 border border-slate-200 rounded-lg p-3 cursor-pointer border-l-4 border-l-[#02275A]">
                                                <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
                                                    <i className={`fas ${channel === 'Email' ? 'fa-envelope' : channel === 'SMS' ? 'fa-comment-alt' : channel === 'WhatsApp' ? 'fab fa-whatsapp' : 'fa-bell'} text-slate-500`}></i>
                                                    {channel} Editor
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="lg:col-span-3 bg-slate-50 p-6 rounded-xl border border-slate-200">
                                        {selectedChannels.includes('Email') && (
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center mb-2">
                                                    <h3 className="text-lg font-bold text-slate-800">Email HTML Designer</h3>
                                                    <button className="text-xs text-[#02275A] font-bold bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100">
                                                        <i className="fas fa-file-code mr-1"></i> Edit Raw HTML
                                                    </button>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Subject</label>
                                                    <input type="text" placeholder="Enter subject line..." className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:border-[#02275A] text-sm shadow-sm" />
                                                </div>
                                                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                                                    <div className="border-b border-slate-200 bg-slate-100 p-2 flex gap-2 overflow-x-auto text-slate-600">
                                                        <button className="w-8 h-8 rounded hover:bg-slate-200 bg-white"><i className="fas fa-bold"></i></button>
                                                        <button className="w-8 h-8 rounded hover:bg-slate-200 bg-white"><i className="fas fa-italic"></i></button>
                                                        <button className="w-8 h-8 rounded hover:bg-slate-200 bg-white"><i className="fas fa-underline"></i></button>
                                                        <div className="w-px h-8 bg-slate-300 mx-1"></div>
                                                        <button className="w-8 h-8 rounded hover:bg-slate-200 bg-white"><i className="fas fa-align-left"></i></button>
                                                        <button className="w-8 h-8 rounded hover:bg-slate-200 bg-white"><i className="fas fa-align-center"></i></button>
                                                        <div className="w-px h-8 bg-slate-300 mx-1"></div>
                                                        <button className="w-8 h-8 rounded hover:bg-slate-200 bg-white"><i className="fas fa-image"></i></button>
                                                        <button className="w-8 h-8 rounded hover:bg-slate-200 bg-white"><i className="fas fa-link"></i></button>
                                                        <button className="w-8 h-8 rounded hover:bg-slate-200 bg-white text-xs px-2 w-auto font-bold"><i className="fas fa-magic mr-1"></i> Insert Variable</button>
                                                    </div>
                                                    <textarea 
                                                        rows={12} 
                                                        className="w-full p-4 outline-none text-sm resize-y font-sans"
                                                        placeholder="Write your email content here. Support rich HTML, inline CSS, and variables like {{user.name}}..."
                                                        defaultValue={`<div style="font-family: Arial, sans-serif; p-4;">\n  <h1>Hi {{user.first_name}},</h1>\n  <p>We're excited to announce...</p>\n  <br/>\n  <a href="{{cta_link}}" style="background: #02275A; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">View Dashboard</a>\n</div>`}
                                                    ></textarea>
                                                </div>
                                            </div>
                                        )}
                                        {/* Simplified generic editors for SMS/WhatsApp logic if multiple selected */}
                                    </div>
                                </div>
                                <div className="flex justify-between pt-4 border-t border-slate-100">
                                    <button 
                                        onClick={() => setCampaignStep(1)}
                                        className="bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors"
                                    >
                                        <i className="fas fa-arrow-left mr-2"></i> Back
                                    </button>
                                    <button 
                                        onClick={() => setCampaignStep(3)}
                                        className="bg-[#02275A] text-white px-6 py-3 rounded-xl text-sm font-bold shadow-md hover:bg-[#03367A] transition-colors"
                                    >
                                        Next: Review & Schedule <i className="fas fa-arrow-right ml-2"></i>
                                    </button>
                                </div>
                            </div>
                        )}

                        {campaignStep === 3 && (
                            <div className="space-y-8 animate-fade-in max-w-3xl mx-auto">
                                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex justify-center items-center shrink-0">
                                        <i className="fas fa-check"></i>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-emerald-800">Ready for Launch</h3>
                                        <p className="text-sm text-emerald-600 mt-1">Your broadcast is configured and passes all compliance checks. Estimated delivery time to all recipients is ~4 minutes.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="border border-slate-200 rounded-xl p-4 bg-white">
                                        <p className="text-xs text-slate-500 font-bold uppercase">Audience Delivery</p>
                                        <p className="font-bold text-slate-800 text-lg mt-1">15,420 Users</p>
                                    </div>
                                    <div className="border border-slate-200 rounded-xl p-4 bg-white">
                                        <p className="text-xs text-slate-500 font-bold uppercase">Selected Channels</p>
                                        <div className="flex gap-2 mt-2">
                                            {selectedChannels.map(c => (
                                                <span key={c} className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">{c}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 mb-4">Scheduling Options</h3>
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-3 p-4 border border-[#02275A] bg-blue-50/50 rounded-xl cursor-pointer">
                                            <input type="radio" name="schedule" defaultChecked className="w-4 h-4 text-[#02275A]" />
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm">Send Immediately</p>
                                                <p className="text-xs text-slate-500">Dispatch this broadcast as soon as you hit publish.</p>
                                            </div>
                                        </label>
                                        <label className="flex items-center gap-3 p-4 border border-slate-200 bg-white rounded-xl cursor-pointer opacity-80">
                                            <input type="radio" name="schedule" className="w-4 h-4 text-[#02275A]" />
                                            <div className="flex-1 text-sm">
                                                <p className="font-bold text-slate-800">Schedule for Later</p>
                                                <p className="text-xs text-slate-500">Pick a specific date and timezone to send.</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div className="flex justify-between pt-4 border-t border-slate-100">
                                    <button 
                                        onClick={() => setCampaignStep(2)}
                                        className="bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors"
                                    >
                                        <i className="fas fa-arrow-left mr-2"></i> Back
                                    </button>
                                    <button 
                                        onClick={handlePublish}
                                        className="bg-emerald-600 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-md hover:bg-emerald-700 transition-colors transform hover:-translate-y-0.5"
                                    >
                                        <i className="fas fa-paper-plane mr-2"></i> Broadcast Now
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <>
                    {/* Navigation Tabs */}
                    <div className="flex border-b border-slate-200">
                        {['campaigns', 'templates', 'workflows'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${
                                    activeTab === tab ? 'border-[#02275A] text-[#02275A]' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                                }`}
                            >
                                {tab === 'campaigns' ? <><i className="fas fa-bullhorn mr-2"></i> Campaigns</> :
                                 tab === 'templates' ? <><i className="fas fa-layer-group mr-2"></i> HTML Templates</> :
                                 <><i className="fas fa-project-diagram mr-2"></i> Notifications & Automations</>}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'campaigns' && (
                        <div className="space-y-6 animate-fade-in">
                            {/* Analytics Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Broadcasts</p>
                                    <h3 className="text-2xl font-extrabold text-slate-800 mt-1">284</h3>
                                </div>
                                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Delivered</p>
                                    <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">1.2M+</h3>
                                </div>
                                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Avg. Open Rate</p>
                                    <h3 className="text-2xl font-extrabold text-[#02275A] mt-1">42.8%</h3>
                                </div>
                                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Avg. Click Rate</p>
                                    <h3 className="text-2xl font-extrabold text-[#02275A] mt-1">14.1%</h3>
                                </div>
                            </div>

                            {/* Campaigns Table */}
                            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                                <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
                                    <h3 className="font-bold text-slate-800">Recent Campaigns</h3>
                                    <div className="relative">
                                        <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                                        <input type="text" placeholder="Search broadcasts..." className="bg-white border border-slate-200 text-xs rounded-lg pl-8 pr-3 py-2 outline-none focus:border-[#02275A] shadow-sm w-64" />
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50/50 border-b border-slate-100 text-xs uppercase text-slate-500 font-bold tracking-wider">
                                                <th className="p-4">Campaign Details</th>
                                                <th className="p-4">Channels</th>
                                                <th className="p-4">Delivery Stats</th>
                                                <th className="p-4">Status & Date</th>
                                                <th className="p-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {campaigns.map(c => (
                                                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="p-4">
                                                        <div className="font-bold text-slate-800 text-sm">{c.name}</div>
                                                        <div className="text-xs text-slate-500 mt-1"><i className="fas fa-users mr-1"></i> {c.audience}</div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex gap-1.5 flex-wrap">
                                                            {c.channels.map(ch => (
                                                                <span key={ch} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold border border-slate-200">
                                                                    <i className={`fas ${ch === 'Email' ? 'fa-envelope' : ch === 'SMS' ? 'fa-comment-alt' : ch === 'WhatsApp' ? 'fab fa-whatsapp' : 'fa-bell'} mr-1`}></i> {ch}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        {c.sentCount > 0 ? (
                                                            <div className="flex flex-col gap-1">
                                                                <div className="flex justify-between text-xs mb-1">
                                                                    <span className="font-bold text-slate-700">{c.deliveredCount.toLocaleString()} / {c.sentCount.toLocaleString()}</span>
                                                                    <span className="text-emerald-500 font-bold">{Math.round((c.deliveredCount/c.sentCount)*100)}%</span>
                                                                </div>
                                                                <div className="w-full bg-slate-200 rounded-full h-1.5">
                                                                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${(c.deliveredCount/c.sentCount)*100}%` }}></div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-slate-400 font-medium">Not queued yet</span>
                                                        )}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex flex-col items-start gap-1">
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                                                c.status === 'Sent' ? 'bg-emerald-100 text-emerald-700' : 
                                                                c.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' : 
                                                                'bg-slate-100 text-slate-600'
                                                            }`}>
                                                                {c.status}
                                                            </span>
                                                            <span className="text-[10px] text-slate-500 font-bold">{c.date}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <button className="text-[#02275A] font-bold text-xs hover:underline"><i className="fas fa-chart-line mr-1"></i> View Report</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'workflows' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold text-slate-800">Automated Notification Workflows</h2>
                                <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-50 shadow-sm">
                                    <i className="fas fa-plus mr-2"></i> Create Workflow
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {workflows.map(wf => (
                                    <div key={wf.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all relative">
                                        <div className="absolute top-5 right-5">
                                            <div className="w-10 h-5 bg-slate-200 rounded-full flex items-center p-1 cursor-pointer">
                                                <div className={`w-3.5 h-3.5 rounded-full shadow-sm transform transition-transform ${wf.status === 'Active' ? 'bg-emerald-500 translate-x-5' : 'bg-slate-400 translate-x-0'}`}></div>
                                            </div>
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${wf.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'} mb-3 inline-block`}>{wf.status}</span>
                                        <h3 className="font-bold text-slate-800 text-base mb-1">{wf.name}</h3>
                                        <p className="text-xs text-slate-500 h-10 line-clamp-2 mb-4">{wf.description}</p>
                                        
                                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 mb-4">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Trigger Event</p>
                                            <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5"><i className="fas fa-bolt text-amber-500"></i> {wf.trigger}</p>
                                        </div>

                                        <div className="flex justify-between items-center border-t border-slate-100 pt-4">
                                            <div className="flex -space-x-1">
                                                {wf.channels.map(ch => (
                                                    <div key={ch} className="w-6 h-6 rounded-full border border-white flex items-center justify-center bg-slate-100 text-slate-600 text-[10px]" title={ch}>
                                                        <i className={`fas ${ch === 'Email' ? 'fa-envelope text-blue-500' : ch === 'SMS' ? 'fa-comment-alt text-emerald-500' : ch === 'WhatsApp' ? 'fab fa-whatsapp text-green-500' : 'fa-bell text-indigo-500'}`}></i>
                                                    </div>
                                                ))}
                                            </div>
                                            <button className="text-xs font-bold text-[#02275A] hover:underline">Edit Sequence</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'templates' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex justify-between items-center bg-white p-5 rounded-xl border border-slate-200">
                                <div>
                                    <h3 className="font-bold text-slate-800">Email & Message Templates</h3>
                                    <p className="text-xs text-slate-500 mt-1">Manage global templates available for all broadcasts.</p>
                                </div>
                                <button className="bg-[#02275A] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-[#03367A]">
                                    <i className="fas fa-code mr-2"></i> Import HTML Template
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                {/* Template Mock Cards */}
                                {[
                                    { title: 'Standard Newsletter', type: 'Email HTML', date: 'Oct 1' },
                                    { title: 'Promo - Black Friday', type: 'Email HTML', date: 'Oct 15' },
                                    { title: 'WhatsApp Alert Opt-in', type: 'WhatsApp Apprv.', date: 'Sep 20' },
                                ].map((tpl, i) => (
                                    <div key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-[#02275A] transition-colors cursor-pointer group">
                                        <div className="h-32 bg-slate-100 flex items-center justify-center border-b border-slate-200 group-hover:bg-blue-50 transition-colors">
                                            <i className={`text-4xl text-slate-300 group-hover:text-blue-300 transition-colors ${tpl.type.includes('WhatsApp') ? 'fab fa-whatsapp' : 'fas fa-newspaper'}`}></i>
                                        </div>
                                        <div className="p-4">
                                            <h4 className="font-bold text-slate-800 text-sm mb-1">{tpl.title}</h4>
                                            <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-wide">
                                                <span>{tpl.type}</span>
                                                <span>{tpl.date}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AdminBroadcastsView;
