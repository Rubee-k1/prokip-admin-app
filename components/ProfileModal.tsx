import React, { useState } from 'react';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

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
        setIsEditing(false);
        // Simulate save logic here
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
             <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-white border-b border-slate-100 p-6 flex justify-between items-start sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                         <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-[#011530] rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md ring-4 ring-indigo-50">
                            JA
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">My Profile</h3>
                            <p className="text-xs text-slate-500 font-medium">Manage your personal details</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-500 flex items-center justify-center transition-colors">
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {/* Identity Section (Read Only mostly) */}
                    <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="flex justify-between items-start">
                             <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Full Name</p>
                                <p className="text-sm font-bold text-slate-800">{userData.name}</p>
                             </div>
                             <div className="text-right">
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Agent Rank</p>
                                <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                    <i className="fas fa-crown text-amber-500"></i> {userData.role}
                                </span>
                             </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mb-4 border-b border-slate-50 pb-2">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Editable Information</h4>
                         {!isEditing ? (
                            <button onClick={() => setIsEditing(true)} className="text-xs font-bold text-[#02275A] hover:underline flex items-center gap-1">
                                <i className="fas fa-pen"></i> Edit Details
                            </button>
                        ) : (
                             <div className="flex gap-2">
                                <button onClick={() => setIsEditing(false)} className="text-xs font-bold text-slate-500 hover:text-slate-700">Cancel</button>
                                <button onClick={handleSave} className="text-xs font-bold text-white bg-[#02275A] px-3 py-1 rounded-md shadow-sm">Save</button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-5">
                        {/* Contact Info */}
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1.5">Email Address</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-slate-400"><i className="fas fa-envelope"></i></span>
                                    <input 
                                        type="email" 
                                        value={userData.email}
                                        disabled={!isEditing}
                                        onChange={(e) => setUserData({...userData, email: e.target.value})}
                                        className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-sm font-medium border focus:outline-none transition-colors ${isEditing ? 'bg-white border-slate-300 focus:border-[#02275A]' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
                                    />
                                </div>
                            </div>
                             <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1.5">Phone Number</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-slate-400"><i className="fas fa-phone"></i></span>
                                    <input 
                                        type="tel" 
                                        value={userData.phone}
                                        disabled={!isEditing}
                                        onChange={(e) => setUserData({...userData, phone: e.target.value})}
                                        className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-sm font-medium border focus:outline-none transition-colors ${isEditing ? 'bg-white border-slate-300 focus:border-[#02275A]' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Bank Details */}
                        <div>
                             <label className="block text-xs font-bold text-slate-600 mb-3 flex items-center gap-2">
                                Bank Account Details 
                                {isEditing && <span className="text-[10px] font-normal text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Secure Edit Mode</span>}
                            </label>
                            <div className={`p-4 rounded-xl border transition-colors space-y-4 ${isEditing ? 'bg-indigo-50/50 border-indigo-100' : 'bg-slate-50 border-slate-100'}`}>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Bank Name</p>
                                    {isEditing ? (
                                         <select 
                                            value={userData.bankName}
                                            onChange={(e) => setUserData({...userData, bankName: e.target.value})}
                                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-800 focus:outline-none focus:border-[#02275A]"
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
                                        <div className="flex items-center gap-2">
                                            <i className="fas fa-university text-slate-400"></i>
                                            <span className="text-sm font-bold text-slate-800">{userData.bankName}</span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Account Number</p>
                                         {isEditing ? (
                                            <input 
                                                type="text" 
                                                value={userData.accountNumber}
                                                onChange={(e) => setUserData({...userData, accountNumber: e.target.value})}
                                                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-800 focus:outline-none focus:border-[#02275A] font-mono"
                                            />
                                        ) : (
                                            <p className="text-sm font-bold text-slate-800 font-mono tracking-wide">{userData.accountNumber}</p>
                                        )}
                                    </div>
                                    <div>
                                         <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Account Name</p>
                                         {isEditing ? (
                                            <input 
                                                type="text" 
                                                value={userData.accountName}
                                                onChange={(e) => setUserData({...userData, accountName: e.target.value})}
                                                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-800 focus:outline-none focus:border-[#02275A]"
                                            />
                                        ) : (
                                            <p className="text-sm font-bold text-slate-800 truncate" title={userData.accountName}>{userData.accountName}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Footer / Status */}
                <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Member since Jan 2023</span>
                    <span className="flex items-center gap-1"><i className="fas fa-shield-alt text-emerald-500"></i> Account Verified</span>
                </div>
             </div>
        </div>
    );
};

export default ProfileModal;