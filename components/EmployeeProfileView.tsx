import React from 'react';

const EmployeeProfileView: React.FC = () => {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#02275A] mb-1">My Profile</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Profile Information */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="font-bold text-[#02275A] text-lg mb-8">Profile Information</h3>
                    
                    <div className="flex justify-center mb-8">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full border border-slate-200 bg-white flex items-center justify-center text-center leading-tight shadow-sm text-[#02275A] font-medium text-sm">
                                Test<br/>Member
                            </div>
                            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#02275A] text-white flex items-center justify-center shadow-md border-2 border-white hover:bg-[#02275A]/90 transition-colors">
                                <i className="fas fa-camera text-sm"></i>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <div className="w-6 text-center text-slate-400">
                                <i className="far fa-user text-lg"></i>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-0.5">Name</p>
                                <p className="font-bold text-[#02275A]">Test Member</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <div className="w-6 text-center text-slate-400">
                                <i className="far fa-envelope text-lg"></i>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-0.5">Email</p>
                                <p className="font-bold text-[#02275A]">user@prokip.africa</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <div className="w-6 text-center text-slate-400">
                                <i className="far fa-building text-lg"></i>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-0.5">Department</p>
                                <p className="font-bold text-[#02275A]">Sales</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <div className="w-6 text-center text-slate-400">
                                <i className="far fa-shield-alt text-lg"></i>
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-slate-500 mb-1">Role</p>
                                <span className="px-3 py-1 bg-white text-slate-700 font-bold text-xs rounded-lg shadow-sm border border-slate-200 uppercase">
                                    MEMBER
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <div className="w-6 text-center">
                                <span className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                                    A
                                </span>
                            </div>
                            <div>
                                <p className="text-sm text-slate-600 font-medium">Current Grade</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Change Password */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="font-bold text-[#02275A] text-lg mb-8 flex items-center gap-2">
                        <i className="far fa-lock text-slate-400"></i> Change Password
                    </h3>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-[#02275A] uppercase mb-2">CURRENT PASSWORD *</label>
                            <input 
                                type="password" 
                                placeholder="Enter current password"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-colors text-slate-700 placeholder-slate-400"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#02275A] uppercase mb-2">NEW PASSWORD *</label>
                            <input 
                                type="password" 
                                placeholder="Enter new password (min 6 characters)"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-colors text-slate-700 placeholder-slate-400"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#02275A] uppercase mb-2">CONFIRM NEW PASSWORD *</label>
                            <input 
                                type="password" 
                                placeholder="Confirm new password"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-colors text-slate-700 placeholder-slate-400"
                            />
                        </div>

                        <button className="px-6 py-3 bg-slate-500 text-white font-bold rounded-lg text-sm hover:bg-slate-600 transition-colors cursor-not-allowed">
                            Change Password
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeProfileView;
