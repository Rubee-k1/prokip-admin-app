
import React, { useState } from 'react';
import { useAlert } from '../contexts/AlertContext';

const ProfileView: React.FC = () => {
    const { showSuccess, showError } = useAlert();
    const [isEditing, setIsEditing] = useState(false);
    const [userData, setUserData] = useState({
        name: 'John Agent',
        role: 'Prokip Elite',
        email: 'john.agent@prokip.com',
        phone: '08012345678',
        bankName: 'Guaranty Trust Bank',
        accountNumber: '0123456789',
        accountName: 'John Doe Agent'
    });

    const handleSave = () => {
        if (!navigator.onLine) {
            showError("Unable to update profile. No internet connection.");
            return;
        }

        setIsEditing(false);
        // Simulate save
        showSuccess("Profile updated successfully!");
    };

    return (
        <div className="w-full mx-auto px-4 md:px-8 py-6 animate-fade-in pb-24 md:pb-12">
            
            {/* Header / Identity Card */}
            <div className="bg-white rounded-2xl p-5 md:p-8 border border-slate-100 shadow-sm mb-6 flex flex-col md:flex-row items-center gap-6 md:gap-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-[#02275A] to-indigo-900 opacity-10"></div>
                
                <div className="relative z-10 w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-gradient-to-br from-indigo-600 to-[#011530] rounded-full flex items-center justify-center text-white text-3xl md:text-4xl font-bold shadow-xl ring-4 ring-white shrink-0">
                    JA
                    <div className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center text-[10px]" title="Online">
                        <i className="fas fa-check"></i>
                    </div>
                </div>
                
                <div className="text-center md:text-left flex-1 relative z-10 pt-2 md:pt-0 w-full">
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">{userData.name}</h2>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3 mt-3">
                        <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-xs px-3 py-1 rounded-full font-bold border border-indigo-100">
                            <i className="fas fa-crown text-amber-500"></i> {userData.role}
                        </span>
                        <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 text-xs px-3 py-1 rounded-full font-bold border border-emerald-100">
                             <i className="fas fa-shield-alt"></i> Verified Agent
                        </span>
                        <span className="text-xs text-slate-400 font-medium whitespace-nowrap">ID: #AG-8821</span>
                    </div>
                </div>
                
                <div className="relative z-10 w-full md:w-auto mt-2 md:mt-0">
                     {!isEditing ? (
                        <button onClick={() => setIsEditing(true)} className="w-full md:w-auto px-6 py-3 md:py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm flex items-center justify-center gap-2">
                            <i className="fas fa-pen"></i> Edit Profile
                        </button>
                    ) : (
                         <div className="flex flex-col-reverse sm:flex-row gap-3 w-full md:w-auto">
                            <button onClick={() => setIsEditing(false)} className="w-full sm:w-auto px-6 py-3 md:py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-50 transition-all">Cancel</button>
                            <button onClick={handleSave} className="w-full sm:w-auto px-6 py-3 md:py-2.5 bg-[#02275A] text-white font-bold rounded-xl text-sm shadow-md hover:bg-[#02275A]/90 transition-all">Save Changes</button>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Col: Editable Forms */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Contact Info */}
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 md:p-8">
                        <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-4">
                            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><i className="fas fa-address-card"></i></div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">Contact Information</h3>
                                <p className="text-xs text-slate-500">Manage your primary contact details</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email Address</label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-3 text-slate-400"><i className="fas fa-envelope"></i></span>
                                    <input 
                                        type="email" 
                                        value={userData.email}
                                        disabled={!isEditing}
                                        onChange={(e) => setUserData({...userData, email: e.target.value})}
                                        className={`w-full pl-10 pr-4 py-3 md:py-2.5 rounded-xl text-sm font-medium border focus:outline-none transition-all ${isEditing ? 'bg-white border-slate-300 focus:border-[#02275A] shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed'}`}
                                    />
                                </div>
                            </div>
                             <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Phone Number</label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-3 text-slate-400"><i className="fas fa-phone"></i></span>
                                    <input 
                                        type="tel" 
                                        value={userData.phone}
                                        disabled={!isEditing}
                                        onChange={(e) => setUserData({...userData, phone: e.target.value})}
                                        className={`w-full pl-10 pr-4 py-3 md:py-2.5 rounded-xl text-sm font-medium border focus:outline-none transition-all ${isEditing ? 'bg-white border-slate-300 focus:border-[#02275A] shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed'}`}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bank Details */}
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 md:p-8">
                         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 border-b border-slate-50 pb-4">
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0"><i className="fas fa-university"></i></div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">Bank Account Details</h3>
                                    <p className="text-xs text-slate-500">For commission withdrawals</p>
                                </div>
                             </div>
                             {isEditing && (
                                 <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100 flex items-center gap-1.5 animate-pulse w-full sm:w-auto justify-center sm:justify-start">
                                     <i className="fas fa-lock"></i> Secure Edit Mode
                                </span>
                            )}
                         </div>
                        
                        <div className={`p-4 md:p-6 rounded-2xl border transition-all duration-300 space-y-6 ${isEditing ? 'bg-white border-indigo-100 shadow-lg ring-1 ring-indigo-50' : 'bg-slate-50/50 border-slate-100'}`}>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Bank Name</label>
                                {isEditing ? (
                                        <select 
                                        value={userData.bankName}
                                        onChange={(e) => setUserData({...userData, bankName: e.target.value})}
                                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-[#02275A]"
                                        >
                                        <option>Guaranty Trust Bank</option>
                                        <option>Zenith Bank</option>
                                        <option>First Bank</option>
                                        <option>Access Bank</option>
                                        <option>United Bank for Africa</option>
                                        <option>Kuda Microfinance Bank</option>
                                        <option>Opay Digital Services</option>
                                        </select>
                                ) : (
                                    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0"><i className="fas fa-landmark"></i></div>
                                        <span className="text-sm font-bold text-slate-800">{userData.bankName}</span>
                                    </div>
                                )}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Account Number</label>
                                        {isEditing ? (
                                        <input 
                                            type="text" 
                                            value={userData.accountNumber}
                                            onChange={(e) => setUserData({...userData, accountNumber: e.target.value})}
                                            className="w-full p-3 bg-white border border-slate-200 rounded-xl text-lg font-bold text-slate-800 focus:outline-none focus:border-[#02275A] font-mono tracking-wider"
                                        />
                                    ) : (
                                        <div className="p-3 bg-white rounded-xl border border-slate-200">
                                            <p className="text-lg font-bold text-slate-800 font-mono tracking-wider">{userData.accountNumber}</p>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Account Name</label>
                                        {isEditing ? (
                                        <input 
                                            type="text" 
                                            value={userData.accountName}
                                            onChange={(e) => setUserData({...userData, accountName: e.target.value})}
                                            className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-[#02275A]"
                                        />
                                    ) : (
                                        <div className="p-3 bg-white rounded-xl border border-slate-200">
                                            <p className="text-sm font-bold text-slate-800 pt-1 truncate">{userData.accountName}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                         
                         <div className="mt-4 flex items-start gap-2 text-xs text-slate-400 bg-slate-50 p-3 rounded-lg">
                            <i className="fas fa-info-circle mt-0.5 text-slate-500 shrink-0"></i>
                            <p>This account information is used for all commission payouts. Please ensure the details match your registered identity to avoid payment delays.</p>
                         </div>
                    </div>
                </div>

                {/* Right Col: Info & Security - Responsive Grid for Tablet */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6 content-start">
                     <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <i className="fas fa-shield-alt text-slate-400"></i> Account Security
                        </h3>
                        <div className="space-y-3">
                            <button className="w-full py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-50 flex items-center justify-between px-4 transition-colors group">
                                <span className="flex items-center gap-2"><i className="fas fa-key text-slate-400 group-hover:text-slate-600"></i> Change Password</span>
                                <i className="fas fa-chevron-right text-slate-300"></i>
                            </button>
                            <button className="w-full py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-50 flex items-center justify-between px-4 transition-colors group">
                                <span className="flex items-center gap-2"><i className="fas fa-mobile-alt text-slate-400 group-hover:text-slate-600"></i> Two-Factor Auth</span>
                                <span className="text-[10px] text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded font-bold">Enabled</span>
                            </button>
                        </div>
                     </div>

                     <div className="bg-gradient-to-br from-[#02275A] to-slate-900 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-4 opacity-10"><i className="fas fa-medal text-8xl"></i></div>
                         <div className="relative z-10">
                            <h3 className="font-bold text-lg mb-1 flex items-center gap-2"><i className="fas fa-star text-amber-400"></i> Elite Benefits</h3>
                            <p className="text-indigo-200 text-xs mb-4 pb-4 border-b border-white/10">You are currently on the Elite tier.</p>
                            
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-center gap-2"><i className="fas fa-check-circle text-emerald-400"></i> <span>5% Bonus Commission</span></li>
                                <li className="flex items-center gap-2"><i className="fas fa-check-circle text-emerald-400"></i> <span>Priority Support (24/7)</span></li>
                                <li className="flex items-center gap-2"><i className="fas fa-check-circle text-emerald-400"></i> <span>Instant Withdrawals</span></li>
                                <li className="flex items-center gap-2"><i className="fas fa-check-circle text-emerald-400"></i> <span>Exclusive Webinars</span></li>
                            </ul>
                         </div>
                     </div>

                     <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 md:col-span-2 lg:col-span-1">
                        <h3 className="text-sm font-bold text-slate-800 mb-2">Need Help?</h3>
                        <p className="text-xs text-slate-500 mb-4">Contact our support team for any account related issues.</p>
                        <button className="w-full py-2.5 bg-slate-100 text-slate-600 font-bold rounded-lg text-xs hover:bg-slate-200 transition-colors">
                            Contact Support
                        </button>
                     </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileView;
