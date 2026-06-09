import React, { useState } from 'react';
import { useAlert } from '../contexts/AlertContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar } from 'recharts';

interface AppDevice {
    id: string;
    businessName: string;
    platform: 'Web' | 'iOS' | 'Android' | 'Windows';
    osVersion: string;
    appVersion: string;
    lastActive: string;
    status: 'Active' | 'Inactive';
    installSource: 'App Store' | 'Play Store' | 'Direct Download' | 'Organic Web';
    location: string;
}

interface AppRelease {
    id: string;
    platform: 'iOS' | 'Android' | 'Windows';
    version: string;
    releaseDate: string;
    mandatory: boolean;
    status: 'Published' | 'Draft';
    notes: string;
}

const COLORS = ['#02275A', '#10B981', '#F59E0B', '#3B82F6', '#8B5CF6'];

export default function AdminAppManagementView() {
    const { showSuccess } = useAlert();
    const [activeTab, setActiveTab] = useState<'overview' | 'devices' | 'updates' | 'inactive'>('overview');

    // Mock Data Models
    const installsData = [
        { name: 'Web', value: 45000 },
        { name: 'Android', value: 13500 },
        { name: 'iOS', value: 8300 },
        { name: 'Windows', value: 5300 },
    ];

    const activityData = [
        { day: 'Mon', web: 12000, mobile: 5400, desktop: 1200 },
        { day: 'Tue', web: 13200, mobile: 5600, desktop: 1250 },
        { day: 'Wed', web: 14100, mobile: 6100, desktop: 1300 },
        { day: 'Thu', web: 13800, mobile: 5900, desktop: 1280 },
        { day: 'Fri', web: 15000, mobile: 6800, desktop: 1400 },
        { day: 'Sat', web: 8000, mobile: 8200, desktop: 600 },
        { day: 'Sun', web: 7500, mobile: 8500, desktop: 500 },
    ];

    const locationData = [
        { location: 'Lagos, NG', users: 32000 },
        { location: 'Abuja, NG', users: 18500 },
        { location: 'Nairobi, KE', users: 8400 },
        { location: 'Accra, GH', users: 7200 },
        { location: 'Port Har., NG', users: 5000 },
    ];

    const activeVsInactiveData = [
        { day: 'Mon', active: 18600, inactive: 1200, new: 145 },
        { day: 'Tue', active: 20050, inactive: 1150, new: 180 },
        { day: 'Wed', active: 21500, inactive: 1300, new: 210 },
        { day: 'Thu', active: 20980, inactive: 1250, new: 190 },
        { day: 'Fri', active: 23200, inactive: 1100, new: 250 },
        { day: 'Sat', active: 16800, inactive: 2100, new: 90 },
        { day: 'Sun', active: 16500, inactive: 2200, new: 115 },
    ];

    const mockDevices: AppDevice[] = [
        { id: 'dev-1', businessName: 'TechFlow Solutions', platform: 'Windows', osVersion: 'Win 11', appVersion: 'v2.4.1', lastActive: '2 mins ago', status: 'Active', installSource: 'Direct Download', location: 'Lagos, NG' },
        { id: 'dev-2', businessName: 'TechFlow Solutions', platform: 'iOS', osVersion: 'iOS 17.2', appVersion: 'v1.8.0', lastActive: '1 hr ago', status: 'Active', installSource: 'App Store', location: 'Lagos, NG' },
        { id: 'dev-3', businessName: 'GreenGrocers Ltd', platform: 'Android', osVersion: 'Android 14', appVersion: 'v1.7.9', lastActive: '3 days ago', status: 'Inactive', installSource: 'Play Store', location: 'Abuja, NG' },
        { id: 'dev-4', businessName: 'Apex Dynamics', platform: 'Windows', osVersion: 'Win 10', appVersion: 'v2.4.1', lastActive: 'Today', status: 'Active', installSource: 'Direct Download', location: 'Nairobi, KE' },
        { id: 'dev-5', businessName: 'Global Traders', platform: 'Web', osVersion: 'Chrome 120', appVersion: 'web', lastActive: '10 mins ago', status: 'Active', installSource: 'Organic Web', location: 'Accra, GH' },
        { id: 'dev-6', businessName: 'Island Cafe', platform: 'Android', osVersion: 'Android 13', appVersion: 'v1.5.0', lastActive: '14 days ago', status: 'Inactive', installSource: 'Play Store', location: 'Port Har., NG' },
    ];

    const [releases, setReleases] = useState<AppRelease[]>([
        { id: 'rel-1', platform: 'Windows', version: 'v2.4.2', releaseDate: 'Oct 24, 2024', mandatory: true, status: 'Published', notes: 'Security patch and UI performance improvements.' },
        { id: 'rel-3', platform: 'Android', version: 'v1.8.1', releaseDate: 'Oct 20, 2024', mandatory: false, status: 'Published', notes: 'New POS layout introduced.' },
    ]);

    const [isReleasing, setIsReleasing] = useState(false);
    const [newRelease, setNewRelease] = useState<Partial<AppRelease>>({
        platform: 'Android',
        mandatory: false
    });

    const handlePublishUpdate = () => {
        if (!newRelease.version || !newRelease.notes) return;
        const release: AppRelease = {
            id: `rel-${Date.now()}`,
            platform: newRelease.platform as any,
            version: newRelease.version,
            releaseDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            mandatory: newRelease.mandatory || false,
            status: 'Published',
            notes: newRelease.notes
        };
        setReleases([release, ...releases]);
        setIsReleasing(false);
        showSuccess(`${release.platform} Update ${release.version} pushed successfully.`);
        setNewRelease({ platform: 'Android', mandatory: false });
    };

    return (
        <div className="p-6 animate-fade-in space-y-6 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">App Tracking & Devices</h1>
                    <p className="text-sm text-slate-500">Monitor installs, active platforms, and push OTA software updates.</p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 overflow-x-auto hide-scrollbar">
                {[
                    { id: 'overview', label: 'Platform Analytics', icon: 'fa-chart-pie' },
                    { id: 'devices', label: 'Device & Install Ledger', icon: 'fa-laptop-mobile' },
                    { id: 'updates', label: 'Push App Updates', icon: 'fa-cloud-upload-alt' },
                    { id: 'inactive', label: 'Inactive Tracking', icon: 'fa-user-clock' }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                            activeTab === tab.id ? 'border-[#02275A] text-[#02275A]' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                        }`}
                    >
                        <i className={`fas ${tab.icon} mr-2`}></i> {tab.label}
                    </button>
                ))}
            </div>

            {/* Overview / Analytics */}
            {activeTab === 'overview' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Installs & Web</span>
                            <div className="flex items-end gap-3 justify-between">
                                <span className="text-3xl font-extrabold text-[#02275A]">72,100</span>
                                <span className="text-emerald-500 text-xs font-bold bg-emerald-50 px-2 py-1 rounded"><i className="fas fa-arrow-up"></i> 145 New Today</span>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mobile Activations</span>
                            <div className="flex items-end gap-3 justify-between">
                                <span className="text-3xl font-extrabold text-blue-600">21,800</span>
                                <div className="text-right">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase"><i className="fab fa-android text-emerald-500"></i> And: 13.5k</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase"><i className="fab fa-apple text-slate-800"></i> iOS: 8.3k</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Desktop Applications</span>
                            <div className="flex items-end gap-3 justify-between">
                                <span className="text-3xl font-extrabold text-indigo-600">5,300</span>
                                <div className="text-right">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase"><i className="fab fa-windows text-blue-500"></i> Windows</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Active vs Inactive</span>
                            <div className="flex items-end gap-3 justify-between">
                                <span className="text-3xl font-extrabold text-slate-800">89.4%</span>
                                <span className="text-rose-500 text-xs font-bold border border-rose-100 bg-rose-50 px-2 py-1 rounded">10.6% Inactive</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="font-bold text-slate-800 mb-6">Cross-Platform Daily Activity</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorWeb" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#02275A" stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor="#02275A" stopOpacity={0}/>
                                                </linearGradient>
                                                <linearGradient id="colorMobile" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                                            <Area type="monotone" name="Web Portal" dataKey="web" stroke="#02275A" strokeWidth={3} fillOpacity={1} fill="url(#colorWeb)" />
                                            <Area type="monotone" name="Mobile App" dataKey="mobile" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorMobile)" />
                                            <Area type="monotone" name="Desktop App" dataKey="desktop" stroke="#8B5CF6" strokeWidth={3} fill="transparent" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="font-bold text-slate-800 mb-6">Active vs Inactive Trends</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={activeVsInactiveData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} cursor={{fill: '#f8fafc'}} />
                                            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                                            <Bar dataKey="active" name="Active Users" stackId="a" fill="#3B82F6" radius={[0, 0, 4, 4]} />
                                            <Bar dataKey="inactive" name="Inactive Users" stackId="a" fill="#CBD5E1" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="new" name="New Installs/Reg" fill="#10B981" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
                                <h3 className="font-bold text-slate-800 self-start w-full mb-2">Installs by Platform</h3>
                                <div className="h-48 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={installsData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={40}
                                                outerRadius={60}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {installsData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip wrapperStyle={{ outline: 'none' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="font-bold text-slate-800 mb-6">Top User Locations</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart layout="vertical" data={locationData} margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                            <YAxis type="category" dataKey="location" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#475569', fontWeight: 'bold' }} width={80} />
                                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} cursor={{fill: '#f8fafc'}} />
                                            <Bar dataKey="users" name="Active Endpoint Users" fill="#8B5CF6" radius={[0, 4, 4, 0]}>
                                                {locationData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Device Ledger Tabs */}
            {activeTab === 'devices' && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
                    <div className="p-4 flex flex-col md:flex-row gap-4 justify-between bg-slate-50 border-b border-slate-100">
                        <div className="relative">
                            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
                            <input 
                                type="text" 
                                placeholder="Search by Business Name..." 
                                className="w-full md:w-80 pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#02275A] shadow-sm"
                            />
                        </div>
                        <select className="border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium outline-none focus:border-[#02275A] shadow-sm bg-white">
                            <option>All Platforms</option>
                            <option>Mobile Only</option>
                            <option>Desktop Only</option>
                            <option>Web Only</option>
                        </select>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                                    <th className="p-4">Business / Device ID</th>
                                    <th className="p-4">Platform & OS</th>
                                    <th className="p-4">App Version</th>
                                    <th className="p-4">Install Source</th>
                                    <th className="p-4">Location</th>
                                    <th className="p-4">Last Active</th>
                                    <th className="p-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {mockDevices.map(dev => (
                                    <tr key={dev.id} className="hover:bg-slate-50/50">
                                        <td className="p-4">
                                            <p className="font-bold text-slate-800">{dev.businessName}</p>
                                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{dev.id}</p>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <i className={`text-lg ${
                                                    dev.platform === 'iOS' ? 'fab fa-apple text-slate-800' :
                                                    dev.platform === 'Android' ? 'fab fa-android text-emerald-500' :
                                                    dev.platform === 'Windows' ? 'fab fa-windows text-blue-500' :
                                                    'fas fa-globe text-indigo-500'
                                                }`}></i>
                                                <div>
                                                    <p className="font-bold text-slate-700 text-xs">{dev.platform}</p>
                                                    <p className="text-[10px] text-slate-500">{dev.osVersion}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-700">{dev.appVersion}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-xs text-slate-600 font-medium">{dev.installSource}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-xs text-slate-600 font-bold bg-slate-50 border border-slate-100 px-2 py-0.5 rounded"><i className="fas fa-map-marker-alt text-rose-500 mr-1"></i> {dev.location}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-xs text-slate-700 font-semibold">{dev.lastActive}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${dev.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                                                {dev.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* App Updates & OTA Pushing */}
            {activeTab === 'updates' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">Application OTA Updates</h2>
                            <p className="text-sm text-slate-500">Push version upgrades automatically to Desktop & Mobile apps.</p>
                        </div>
                        <button 
                            onClick={() => setIsReleasing(!isReleasing)}
                            className="bg-[#02275A] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-[#03367A] transition-colors"
                        >
                            <i className={isReleasing ? "fas fa-times mr-2" : "fas fa-code-branch mr-2"}></i> 
                            {isReleasing ? "Cancel Release" : "Publish New Update"}
                        </button>
                    </div>

                    {isReleasing && (
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 shadow-inner animate-fade-in">
                            <h3 className="font-bold text-blue-900 mb-4 border-b border-blue-200 pb-2">Draft New Release</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <div>
                                    <label className="block text-xs font-bold text-blue-800 mb-2">Target Platform</label>
                                    <select 
                                        className="w-full bg-white border border-blue-200 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 text-sm shadow-sm"
                                        value={newRelease.platform}
                                        onChange={(e) => setNewRelease({...newRelease, platform: e.target.value as any})}
                                    >
                                        <option value="Android">Android App</option>
                                        <option value="iOS">iOS App</option>
                                        <option value="Windows">Desktop App (Windows)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-blue-800 mb-2">Version Number</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. v2.4.3" 
                                        className="w-full bg-white border border-blue-200 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 text-sm shadow-sm"
                                        value={newRelease.version || ''}
                                        onChange={(e) => setNewRelease({...newRelease, version: e.target.value})}
                                    />
                                </div>
                                <div className="flex items-center pt-8">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="w-5 h-5 accent-red-500 cursor-pointer"
                                            checked={newRelease.mandatory || false}
                                            onChange={(e) => setNewRelease({...newRelease, mandatory: e.target.checked})}
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-blue-900">Mandatory Update</span>
                                            <span className="text-[10px] text-blue-600">Forces user to update before using app</span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-xs font-bold text-blue-800 mb-2">Release Notes / Changelog</label>
                                <textarea 
                                    rows={4}
                                    placeholder="Describe what's new in this version..."
                                    className="w-full bg-white border border-blue-200 rounded-lg p-4 outline-none focus:border-blue-500 text-sm shadow-sm block resize-none"
                                    value={newRelease.notes || ''}
                                    onChange={(e) => setNewRelease({...newRelease, notes: e.target.value})}
                                ></textarea>
                            </div>

                            <div className="flex justify-end">
                                <button 
                                    onClick={handlePublishUpdate}
                                    disabled={!newRelease.version || !newRelease.notes}
                                    className="bg-blue-600 disabled:bg-blue-300 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-md hover:bg-blue-700 transition-colors"
                                >
                                    Push Release to Devices
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        {releases.map(release => (
                            <div key={release.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="flex items-start gap-4">
                                     <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl shrink-0 ${
                                         release.platform === 'iOS' ? 'bg-slate-100 text-slate-800' :
                                         release.platform === 'Android' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                                     }`}>
                                         <i className={`fab ${
                                            release.platform === 'iOS' ? 'fa-apple' :
                                            release.platform === 'Android' ? 'fa-android' : 'fa-windows'
                                         }`}></i>
                                     </div>
                                     <div>
                                         <div className="flex items-center gap-2 mb-1">
                                             <h3 className="font-bold text-slate-800">{release.platform} Update: {release.version}</h3>
                                             {release.mandatory ? (
                                                 <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded border border-red-200 uppercase tracking-wider">Mandatory</span>
                                             ) : (
                                                 <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200 uppercase tracking-wider">Optional</span>
                                             )}
                                         </div>
                                         <p className="text-sm text-slate-600 mb-2">{release.notes}</p>
                                         <span className="text-xs text-slate-400 font-bold">Published on {release.releaseDate}</span>
                                     </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0 w-full md:w-auto mt-4 md:mt-0">
                                    <div className="text-right mr-4 hidden md:block">
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Adoption Rate</p>
                                        <p className="font-bold text-slate-800">84%</p>
                                    </div>
                                    <button className="flex-1 md:flex-none border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-50">View Metrics</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Inactive Tracking */}
            {activeTab === 'inactive' && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
                    <div className="p-6 border-b border-rose-100 bg-rose-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h2 className="text-lg font-bold text-rose-900 border-l-4 border-rose-500 pl-3">Inactive Risk Tracking</h2>
                            <p className="text-sm text-rose-700 mt-2">Accounts that haven't launched ANY platform (Web, Desktop, Mobile) recently.</p>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                           <button className="bg-rose-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-rose-700 shadow-md flex-1 md:flex-none"><i className="fas fa-paper-plane mr-2"></i> Trigger Re-engagement</button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                                    <th className="p-4">Business</th>
                                    <th className="p-4">Inactive Duration</th>
                                    <th className="p-4">Last Platform Used</th>
                                    <th className="p-4">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {mockDevices.filter(d => d.status === 'Inactive').map(dev => (
                                    <tr key={dev.id} className="hover:bg-rose-50/30 transition-colors">
                                        <td className="p-4">
                                            <p className="font-bold text-slate-800">{dev.businessName}</p>
                                            <p className="text-xs text-slate-500 mt-1"><i className="fas fa-envelope mr-1 text-slate-400"></i> contact@{dev.businessName.toLowerCase().replace(/\s/g, '')}.com</p>
                                        </td>
                                        <td className="p-4">
                                            <span className="font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded border border-rose-100">{dev.lastActive}</span>
                                        </td>
                                         <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <i className={`text-lg text-slate-400 ${
                                                    dev.platform === 'iOS' ? 'fab fa-apple' :
                                                    dev.platform === 'Android' ? 'fab fa-android' : 'fab fa-windows'
                                                }`}></i>
                                                <span className="text-sm font-semibold text-slate-600">{dev.platform} App</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <button className="text-[#02275A] text-xs font-bold hover:underline"><i className="fas fa-magic mr-1"></i> Send Push Notification</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
