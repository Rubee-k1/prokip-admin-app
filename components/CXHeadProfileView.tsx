import React, { useState } from 'react';
import { useAlert } from '../contexts/AlertContext';
import EmployeeGradesRewardsView from './EmployeeGradesRewardsView';
import EmployeeHistoryView from './EmployeeHistoryView';
import EmployeeLeaderboardView from './EmployeeLeaderboardView';

interface CXHeadProfileViewProps {
    setView?: (view: string) => void;
    userRole?: string;
    initialTab?: 'profile' | 'performance';
}

const CXHeadProfileView: React.FC<CXHeadProfileViewProps> = ({ setView, userRole, initialTab }) => {
    let deptName = 'Customer Experience';
    let titleName = 'CX Head';
    let initials = 'CX';
    let emailStr = 'cx@company.com';
    
    if (userRole === 'customer-success') {
        deptName = 'Customer Success';
        titleName = 'Customer success';
        initials = 'CS';
        emailStr = 'customersuccess@company.com';
    } else if (userRole === 'sales-manager') {
        deptName = 'Sales';
        titleName = 'Sales Manager';
        initials = 'SM';
        emailStr = 'salesmanager@company.com';
    } else if (userRole === 'marketing-manager') {
        deptName = 'Marketing';
        titleName = 'Marketing Manager';
        initials = 'MM';
        emailStr = 'marketing@company.com';
    } else if (userRole === 'support-staff') {
        deptName = 'Support';
        titleName = 'Support Lead';
        initials = 'SL';
        emailStr = 'support@company.com';
    } else if (userRole === 'call-agent') {
        deptName = 'Customer Experience';
        titleName = 'Call Agent';
        initials = 'CA';
        emailStr = 'callagent@company.com';
    } else if (userRole === 'finance') {
        deptName = 'Finance';
        titleName = 'Finance Manager';
        initials = 'FM';
        emailStr = 'finance@company.com';
    } else if (userRole === 'content-lead') {
        deptName = 'Content';
        titleName = 'Content Lead';
        initials = 'CL';
        emailStr = 'content@company.com';
    }
    
    const { showSuccess, showError } = useAlert();
    const isSpecialRole = ['call-agent', 'support-staff', 'customer-success'].includes(userRole || '');

    // Form fields state for Personal & Employment
    const [firstName, setFirstName] = useState(() => {
        try {
            return localStorage.getItem('cx_profile_first_name') || 'CX';
        } catch {
            return 'CX';
        }
    });
    const [lastName, setLastName] = useState(() => {
        try {
            return localStorage.getItem('cx_profile_last_name') || 'Head';
        } catch {
            return 'Head';
        }
    });
    const [phone, setPhone] = useState(() => {
        try {
            return localStorage.getItem('cx_profile_phone') || '+234 812 345 6789';
        } catch {
            return '+234 812 345 6789';
        }
    });
    const [dob, setDob] = useState(() => {
        try {
            return localStorage.getItem('cx_profile_dob') || '1995-05-15';
        } catch {
            return '1995-05-15';
        }
    });
    const [gender, setGender] = useState(() => {
        try {
            return localStorage.getItem('cx_profile_gender') || 'Male';
        } catch {
            return 'Male';
        }
    });
    const [maritalStatus, setMaritalStatus] = useState(() => {
        try {
            return localStorage.getItem('cx_profile_marital_status') || 'Single';
        } catch {
            return 'Single';
        }
    });
    const [country, setCountry] = useState(() => {
        try {
            return localStorage.getItem('cx_profile_country') || 'Nigeria';
        } catch {
            return 'Nigeria';
        }
    });
    const [stateVal, setStateVal] = useState(() => {
        try {
            return localStorage.getItem('cx_profile_state') || 'Lagos';
        } catch {
            return 'Lagos';
        }
    });
    const [city, setCity] = useState(() => {
        try {
            return localStorage.getItem('cx_profile_city') || 'Ikeja';
        } catch {
            return 'Ikeja';
        }
    });

    // Identity & Statutory
    const [nin, setNin] = useState(() => {
        try {
            return localStorage.getItem('cx_profile_nin') || '12345678901';
        } catch {
            return '12345678901';
        }
    });
    const [bvn, setBvn] = useState(() => {
        try {
            return localStorage.getItem('cx_profile_bvn') || '22223333444';
        } catch {
            return '22223333444';
        }
    });
    const [taxId, setTaxId] = useState(() => {
        try {
            return localStorage.getItem('cx_profile_tax_id') || 'TIN-99887711';
        } catch {
            return 'TIN-99887711';
        }
    });
    const [pfaName, setPfaName] = useState(() => {
        try {
            return localStorage.getItem('cx_profile_pfa_name') || 'Stanbic IBTC Pension';
        } catch {
            return 'Stanbic IBTC Pension';
        }
    });
    const [pensionNumber, setPensionNumber] = useState(() => {
        try {
            return localStorage.getItem('cx_profile_pension_number') || 'PEN-00998877';
        } catch {
            return 'PEN-00998877';
        }
    });

    // Emergency Contact
    const [emergencyName, setEmergencyName] = useState(() => {
        try {
            return localStorage.getItem('cx_profile_emergency_name') || 'Mrs. Sade Sola';
        } catch {
            return 'Mrs. Sade Sola';
        }
    });
    const [emergencyPhone, setEmergencyPhone] = useState(() => {
        try {
            return localStorage.getItem('cx_profile_emergency_phone') || '+234 803 111 2222';
        } catch {
            return '+234 803 111 2222';
        }
    });
    const [emergencyRelationship, setEmergencyRelationship] = useState(() => {
        try {
            return localStorage.getItem('cx_profile_emergency_relationship') || 'Mother';
        } catch {
            return 'Mother';
        }
    });

    const [isSubmitted, setIsSubmitted] = useState(() => {
        try {
            return localStorage.getItem('cx_profile_is_submitted') === 'true';
        } catch {
            return false;
        }
    });

    const handleSubmitProfile = (e: React.FormEvent) => {
        e.preventDefault();
        try {
            localStorage.setItem('cx_profile_first_name', firstName);
            localStorage.setItem('cx_profile_last_name', lastName);
            localStorage.setItem('cx_profile_phone', phone);
            localStorage.setItem('cx_profile_dob', dob);
            localStorage.setItem('cx_profile_gender', gender);
            localStorage.setItem('cx_profile_marital_status', maritalStatus);
            localStorage.setItem('cx_profile_country', country);
            localStorage.setItem('cx_profile_state', stateVal);
            localStorage.setItem('cx_profile_city', city);
            localStorage.setItem('cx_profile_nin', nin);
            localStorage.setItem('cx_profile_bvn', bvn);
            localStorage.setItem('cx_profile_tax_id', taxId);
            localStorage.setItem('cx_profile_pfa_name', pfaName);
            localStorage.setItem('cx_profile_pension_number', pensionNumber);
            localStorage.setItem('cx_profile_emergency_name', emergencyName);
            localStorage.setItem('cx_profile_emergency_phone', emergencyPhone);
            localStorage.setItem('cx_profile_emergency_relationship', emergencyRelationship);
            localStorage.setItem('cx_profile_is_submitted', 'true');
        } catch (err) {
            console.error(err);
        }
        setIsSubmitted(true);
        showSuccess('Personal and Employment profile saved successfully!');
    };

    const [activeTab, setActiveTab] = React.useState<'profile' | 'grades' | 'history' | 'leaderboard'>('profile');

    // Special sub-tabs for call agent, support, customer success
    const [activeSubTab, setActiveSubTab] = React.useState<string>('personal-employment');
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = React.useState<boolean>(false);

    React.useEffect(() => {
        if (initialTab === 'performance') {
            setActiveTab('grades');
            if (isSpecialRole) {
                setActiveSubTab('point-ledger');
            }
        } else if (initialTab === 'profile') {
            setActiveTab('profile');
            if (isSpecialRole) {
                setActiveSubTab('personal-employment');
            }
        }
    }, [initialTab, isSpecialRole]);

    // Dynamic bank values
    const [bankName, setBankName] = useState(() => {
        try {
            return localStorage.getItem('cx_profile_bank_name') || '';
        } catch {
            return '';
        }
    });
    const [accountNum, setAccountNum] = useState(() => {
        try {
            return localStorage.getItem('cx_profile_account_num') || '';
        } catch {
            return '';
        }
    });
    const [accountName, setAccountName] = useState(titleName);
    const [isEditingBank, setIsEditingBank] = useState(false);

    // Dynamic Guarantor states
    const [guarantors, setGuarantors] = useState<any[]>(() => {
        try {
            const saved = localStorage.getItem('cx_profile_guarantors');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
    const [newGuarName, setNewGuarName] = useState('');
    const [newGuarRel, setNewGuarRel] = useState('');
    const [newGuarPhone, setNewGuarPhone] = useState('');
    const [newGuarEmail, setNewGuarEmail] = useState('');
    const [newGuarAddr, setNewGuarAddr] = useState('');
    const [isAddingGuar, setIsAddingGuar] = useState(false);

    // Dynamic Document states
    const [documents, setDocuments] = useState<any[]>(() => {
        try {
            const saved = localStorage.getItem('cx_profile_documents');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
    const [uploadingDoc, setUploadingDoc] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [docType, setDocType] = useState('ID Card (National ID, Passport, Driver\'s License)');
    const [docDisplayName, setDocDisplayName] = useState('');

    // Dynamic password states for security sub-tab
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentPassword) {
            showError('Please enter your current password.');
            return;
        }
        if (newPassword.length < 8) {
            showError('New password must be at least 8 characters long.');
            return;
        }
        if (newPassword !== confirmPassword) {
            showError('Confirm password does not match new password.');
            return;
        }
        showSuccess('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    const subTabDetails: Record<string, { label: string; icon: string; category: string }> = {
        'personal-employment': { label: 'Personal & Employment', icon: 'fa-user-tie', category: 'My Profile' },
        'payroll-bank': { label: 'Payroll & Bank', icon: 'fa-money-bill-wave', category: 'My Profile' },
        'guarantors': { label: 'Guarantors', icon: 'fa-user-shield', category: 'My Profile' },
        'documents': { label: 'Documents', icon: 'fa-file-signature', category: 'My Profile' },
        'security': { label: 'Security', icon: 'fa-lock', category: 'My Profile' },
        'point-ledger': { label: 'Point Ledger', icon: 'fa-clipboard-list', category: 'Performance' },
        'grade-policy': { label: 'Grade and Policy', icon: 'fa-scroll', category: 'Performance' },
        'leaderboard': { label: 'Leaderboard for department', icon: 'fa-trophy', category: 'Performance' },
    };

    const handleSaveBank = () => {
        setIsEditingBank(false);
        showSuccess('Bank information updated successfully!');
    };

    const handleAddGuarantor = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGuarName || !newGuarRel || !newGuarPhone || !newGuarAddr) {
            showError('Please check and fill in all guarantor details.');
            return;
        }
        const updated = [...guarantors, {
            name: newGuarName,
            relationship: newGuarRel,
            phone: newGuarPhone,
            email: newGuarEmail,
            address: newGuarAddr,
            status: 'Under Review'
        }];
        setGuarantors(updated);
        try {
            localStorage.setItem('cx_profile_guarantors', JSON.stringify(updated));
        } catch (err) {
            console.error(err);
        }
        setNewGuarName('');
        setNewGuarRel('');
        setNewGuarPhone('');
        setNewGuarEmail('');
        setNewGuarAddr('');
        setIsAddingGuar(false);
        showSuccess('New guarantor added successfully for compliance review.');
    };

    const handleFileUploadSimulation = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingDoc(true);
        setUploadProgress(10);
        
        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        const newDoc = {
                            id: `DOC-${Math.floor(100 + Math.random() * 900)}`,
                            name: file.name,
                            size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                            type: docType,
                            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                            status: 'Under Review'
                        };
                        setDocuments(prevDocs => {
                            const updated = [newDoc, ...prevDocs];
                            try {
                                localStorage.setItem('cx_profile_documents', JSON.stringify(updated));
                            } catch {}
                            return updated;
                        });
                        setUploadingDoc(false);
                        showSuccess(`Document "${file.name}" uploaded. Sent for approval.`);
                    }, 500);
                    return 100;
                }
                return prev + 30;
            });
        }, 200);
    };

    const handleUploadClick = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) {
            showError('Please choose a file to upload.');
            return;
        }

        setUploadingDoc(true);
        setUploadProgress(10);
        
        const file = selectedFile;
        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        const newDoc = {
                            id: `DOC-${Math.floor(100 + Math.random() * 900)}`,
                            name: docDisplayName.trim() || file.name,
                            size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                            type: docType,
                            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                            status: 'Under Review'
                        };
                        setDocuments(prevDocs => {
                            const updated = [newDoc, ...prevDocs];
                            try {
                                localStorage.setItem('cx_profile_documents', JSON.stringify(updated));
                            } catch {}
                            return updated;
                        });
                        setUploadingDoc(false);
                        setSelectedFile(null);
                        setDocDisplayName('');
                        showSuccess(`Document "${newDoc.name}" uploaded. Sent for approval.`);
                    }, 500);
                    return 100;
                }
                return prev + 30;
            });
        }, 200);
    };

    return (
        <div className="w-full h-full overflow-y-auto custom-scrollbar bg-slate-50">
            <div className="p-8 max-w-7xl mx-auto space-y-6">
                
                {/* Standard header tab bar for other roles, or categorized dropdown for special roles */}
                {!isSpecialRole ? (
                    <div className="mb-6 flex flex-col gap-4 border-b border-slate-200">
                        <h2 className="text-2xl font-bold text-[#02275A]">My Workspace Profile</h2>
                        <div className="flex items-center gap-6 text-sm font-medium">
                            <button 
                                onClick={() => setActiveTab('profile')}
                                className={`pb-3 border-b-2 transition-colors ${activeTab === 'profile' ? 'border-[#02275A] text-[#02275A]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                            >
                                Profile details
                            </button>
                            <button 
                                onClick={() => setActiveTab('grades')}
                                className={`pb-3 border-b-2 transition-colors ${activeTab === 'grades' ? 'border-[#02275A] text-[#02275A]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                            >
                                Grade and Policy
                            </button>
                            <button 
                                onClick={() => setActiveTab('history')}
                                className={`pb-3 border-b-2 transition-colors ${activeTab === 'history' ? 'border-[#02275A] text-[#02275A]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                            >
                                Performance History
                            </button>
                            {['cx-head', 'sales-manager', 'content-lead', 'marketing-manager', 'call-agent', 'finance', 'customer-success', 'support-staff'].includes(userRole || '') && (
                                <button 
                                    onClick={() => setActiveTab('leaderboard')}
                                    className={`pb-3 border-b-2 transition-colors ${activeTab === 'leaderboard' ? 'border-[#02275A] text-[#02275A]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                >
                                    Leaderboard
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="mb-6 flex flex-col gap-5 border-b border-slate-200 pb-5">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div>
                                <h2 className="text-2xl font-bold text-[#02275A]">
                                    {initialTab === 'performance' ? 'My Performance & Metrics' : 'My Workspace Profile'}
                                </h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {initialTab === 'performance' 
                                        ? 'Track your points ledger, compliance grading, and department standings' 
                                        : 'View your personal details, payroll accounts, and compliance documents'}
                                </p>
                            </div>
                        </div>

                        {/* Flat quick-action horizontal tabs/buttons immediately visible so they are accessible with single-click and no scrolling */}
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:flex lg:flex-wrap gap-2.5">
                            {Object.entries(subTabDetails)
                                .filter(([_, details]) => {
                                    const expectedCategory = initialTab === 'performance' ? 'Performance' : 'My Profile';
                                    return details.category === expectedCategory;
                                })
                                .map(([id, details]) => {
                                    const isActive = activeSubTab === id;
                                    return (
                                        <button
                                            key={id}
                                            id={`profile-subtab-${id}`}
                                            onClick={() => {
                                                setActiveSubTab(id);
                                            }}
                                            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-semibold shadow-xs transition-all duration-200 text-left ${
                                                isActive
                                                    ? 'bg-[#02275A] border-[#02275A] text-white ring-2 ring-[#02275A]/10 scale-[1.01]'
                                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                                            }`}
                                        >
                                            <span className={`w-5.5 h-5.5 rounded-md flex items-center justify-center text-[10px] transition-colors ${
                                                isActive ? 'bg-white/20 text-white' : 'bg-[#02275A]/5 text-[#02275A]'
                                            }`}>
                                                <i className={`fas ${details.icon}`}></i>
                                            </span>
                                            <div>
                                                <p className={`text-[11px] font-bold transition-colors ${isActive ? 'text-white' : 'text-[#02275A]'}`}>
                                                    {details.label}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                        </div>
                    </div>
                )}

                {/* --- NORMAL PROFILE VIEW FOR OTHER ROLES --- */}
                {!isSpecialRole ? (
                    <>
                        {activeTab === 'profile' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                {/* Profile Information */}
                                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                                    <h3 className="font-bold text-[#02275A] text-lg mb-8">Profile Information</h3>
                                    
                                    <div className="flex justify-center mb-8">
                                        <div className="relative">
                                            <div className="w-24 h-24 rounded-full border border-slate-200 bg-[#02275A] flex items-center justify-center text-center leading-tight shadow-sm text-white font-medium text-xl">
                                                {initials}
                                            </div>
                                            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shadow-md border-2 border-white hover:bg-slate-200 transition-colors">
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
                                                <p className="font-bold text-[#02275A]">{titleName}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <div className="w-6 text-center text-slate-400">
                                                <i className="far fa-envelope text-lg"></i>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 mb-0.5">Email</p>
                                                <p className="font-bold text-[#02275A]">{emailStr}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <div className="w-6 text-center text-slate-400">
                                                <i className="far fa-building text-lg"></i>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 mb-0.5">Department</p>
                                                <p className="font-bold text-[#02275A]">{deptName}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <div className="w-6 text-center text-slate-400">
                                                <i className="far fa-shield-alt text-lg"></i>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs text-slate-500 mb-1">Role</p>
                                                <span className="px-3 py-1 bg-white text-slate-700 font-bold text-xs rounded-lg shadow-sm border border-slate-200 uppercase">
                                                    HEAD
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
                        )}
                        {activeTab === 'grades' && (
                            <div className="-mt-6">
                                <EmployeeGradesRewardsView hideRewards={true} />
                            </div>
                        )}
                        {activeTab === 'history' && (
                            <div className="-mt-6">
                                <EmployeeHistoryView setView={setView} />
                            </div>
                        )}
                        {activeTab === 'leaderboard' && (
                            <div className="-mt-6">
                                <EmployeeLeaderboardView />
                            </div>
                        )}
                    </>
                ) : (
                    /* --- SPECIAL USER/CALL AGENT DROPDOWN DETAILED SECTION RENDERERS --- */
                    <div className="animate-fade-in">
                        {activeSubTab === 'personal-employment' && (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                                {/* Left Column: Interactive Overlapping Avatar Profile Box */}
                                <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col">
                                    {/* Top solid brand-color/gradient box */}
                                    <div className="bg-gradient-to-tr from-[#02275A] to-blue-700 h-28 relative"></div>
                                    
                                    {/* Overlapping circular avatar box */}
                                    <div className="relative -mt-12 flex flex-col items-center pb-5 px-6">
                                        <div className="w-24 h-24 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center shadow-md font-bold text-[#02275A] text-xl relative mb-3">
                                            {initials}
                                            <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#02275A] hover:bg-[#011C42] border border-white text-white flex items-center justify-center shadow-xs transition-colors cursor-pointer">
                                                <i className="fas fa-camera text-[10px]"></i>
                                            </button>
                                        </div>
                                        
                                        {/* Name and Designation badges */}
                                        <h4 className="text-lg font-extrabold text-[#02275A] text-center">{firstName} {lastName}</h4>
                                        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2">
                                            <span className="px-2 py-0.5 bg-slate-50 border border-slate-100 text-slate-500 rounded-md text-[9px] font-bold uppercase tracking-wider">
                                                {userRole === 'customer-success' ? 'HEAD OF CS' : userRole === 'support-staff' ? 'SUPPORT STAFF' : userRole === 'call-agent' ? 'CALL AGENT' : 'HEAD OF CX'}
                                            </span>
                                            <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-md text-[9px] font-bold uppercase tracking-wider">
                                                ACTIVE
                                            </span>
                                        </div>

                                        {/* Profile Completion tracker calculated dynamically */}
                                        {(() => {
                                            const filledFieldsCount = [
                                                firstName, lastName, phone, dob, gender, maritalStatus, country, stateVal, city, 
                                                nin, bvn, taxId, pfaName, pensionNumber, 
                                                emergencyName, emergencyPhone, emergencyRelationship
                                            ].filter(Boolean).length;
                                            const completionPercentage = Math.round((filledFieldsCount / 17) * 100);
                                            
                                            return (
                                                <div className="w-full mt-6 border-t border-slate-100 pt-5">
                                                    <div className="flex justify-between items-center text-xs text-slate-500 font-bold mb-1.5">
                                                        <span>Profile completion</span>
                                                        <span>{completionPercentage}%</span>
                                                    </div>
                                                    <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                                                        <div className="bg-[#02275A] h-full transition-all duration-500" style={{ width: `${completionPercentage}%` }}></div>
                                                    </div>
                                                </div>
                                            );
                                        })()}

                                        {/* Standard dynamic labels */}
                                        <div className="w-full border-t border-slate-100 mt-5 pt-5 space-y-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center text-xs">
                                                    <i className="fas fa-building"></i>
                                                </div>
                                                <div>
                                                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">DEPARTMENT</span>
                                                    <span className="text-xs font-bold text-[#02275A]">{deptName}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 pb-1">
                                                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center text-xs">
                                                    <i className="fas fa-envelope"></i>
                                                </div>
                                                <div>
                                                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">EMAIL</span>
                                                    <span className="text-xs font-bold text-[#02275A] truncate max-w-[170px]" title={emailStr}>{emailStr}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Compliance form metrics card */}
                                <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col space-y-6">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                        <div className="flex items-center gap-2.5 text-base font-bold text-[#02275A]">
                                            <i className="far fa-id-card text-slate-400 text-lg"></i>
                                            <span>Personal & Employment</span>
                                        </div>
                                        <span className="px-2.5 py-1 bg-amber-50 text-amber-705 border border-amber-100 text-[10px] font-extrabold tracking-wider uppercase rounded-md">
                                            ONE-TIME EDIT
                                        </span>
                                    </div>

                                    {/* Warnings/Alert matching mockup exactly */}
                                    <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 flex gap-3 text-xs text-amber-800 leading-relaxed">
                                        <i className="fas fa-info-circle text-amber-600 mt-1 flex-shrink-0"></i>
                                        <span>
                                            You can fill these details once. After you submit, only HR can change them — so double-check before saving. Your bank details can be updated anytime.
                                        </span>
                                    </div>

                                    {/* Specifications Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="bg-slate-50/50 border border-slate-100 p-3.5 rounded-xl flex flex-col justify-center">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">EMPLOYEE ID</span>
                                            <span className="text-xs font-extrabold text-[#02275A] mt-1">EMP-XX-011</span>
                                        </div>

                                        <div className="bg-slate-50/50 border border-slate-100 p-3.5 rounded-xl flex flex-col justify-center">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ROLE</span>
                                            <span className="text-xs font-extrabold text-[#02275A] mt-1">{titleName}</span>
                                        </div>

                                        <div className="bg-slate-50/50 border border-slate-100 p-3.5 rounded-xl flex flex-col justify-center">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">DEPARTMENT</span>
                                            <span className="text-xs font-extrabold text-[#02275A] mt-1">{deptName}</span>
                                        </div>

                                        <div className="bg-slate-50/50 border border-slate-100 p-3.5 rounded-xl flex flex-col justify-center">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">HIRE DATE</span>
                                            <span className="text-xs font-extrabold text-[#02275A] mt-1">November 12, 2022</span>
                                        </div>
                                    </div>

                                    <form onSubmit={handleSubmitProfile} className="space-y-6">
                                        {/* SECTION 1: Personal Details */}
                                        <div className="border-t border-slate-100 pt-5">
                                            <h4 className="font-bold text-[#02275A] text-sm mb-4 flex items-center gap-2">
                                                <i className="far fa-user text-slate-400"></i> Personal Information
                                            </h4>
                                            
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">First Name</label>
                                                    <input 
                                                        type="text"
                                                        value={firstName}
                                                        onChange={e => setFirstName(e.target.value)}
                                                        disabled={isSubmitted}
                                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#02275A] focus:outline-none focus:bg-white focus:border-[#02275A] disabled:bg-slate-100 disabled:text-slate-400 transition-all"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Last Name</label>
                                                    <input 
                                                        type="text"
                                                        value={lastName}
                                                        onChange={e => setLastName(e.target.value)}
                                                        disabled={isSubmitted}
                                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#02275A] focus:outline-none focus:bg-white focus:border-[#02275A] disabled:bg-slate-100 disabled:text-slate-400 transition-all"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Phone</label>
                                                    <input 
                                                        type="text"
                                                        value={phone}
                                                        onChange={e => setPhone(e.target.value)}
                                                        placeholder="e.g. +234..."
                                                        disabled={isSubmitted}
                                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#02275A] focus:outline-none focus:bg-white focus:border-[#02275A] disabled:bg-slate-100 disabled:text-slate-400 transition-all"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Date of Birth</label>
                                                    <input 
                                                        type="date"
                                                        value={dob}
                                                        onChange={e => setDob(e.target.value)}
                                                        disabled={isSubmitted}
                                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#02275A] focus:outline-none focus:bg-white focus:border-[#02275A] disabled:bg-slate-100 disabled:text-slate-400 transition-all"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Gender</label>
                                                    <select 
                                                        value={gender}
                                                        onChange={e => setGender(e.target.value)}
                                                        disabled={isSubmitted}
                                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#02275A] focus:outline-none focus:bg-white focus:border-[#02275A] disabled:bg-slate-100 disabled:text-slate-400 transition-all"
                                                    >
                                                        <option value="">Select Gender</option>
                                                        <option value="Male">Male</option>
                                                        <option value="Female">Female</option>
                                                        <option value="Other">Other</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Marital Status</label>
                                                    <select 
                                                        value={maritalStatus}
                                                        onChange={e => setMaritalStatus(e.target.value)}
                                                        disabled={isSubmitted}
                                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#02275A] focus:outline-none focus:bg-white focus:border-[#02275A] disabled:bg-slate-100 disabled:text-slate-400 transition-all"
                                                    >
                                                        <option value="">Select Status</option>
                                                        <option value="Single">Single</option>
                                                        <option value="Married">Married</option>
                                                        <option value="Divorced">Divorced</option>
                                                        <option value="Widowed">Widowed</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Country</label>
                                                    <input 
                                                        type="text"
                                                        value={country}
                                                        onChange={e => setCountry(e.target.value)}
                                                        disabled={isSubmitted}
                                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#02275A] focus:outline-none focus:bg-white focus:border-[#02275A] disabled:bg-slate-100 disabled:text-slate-400 transition-all"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">State</label>
                                                    <input 
                                                        type="text"
                                                        value={stateVal}
                                                        onChange={e => setStateVal(e.target.value)}
                                                        disabled={isSubmitted}
                                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#02275A] focus:outline-none focus:bg-white focus:border-[#02275A] disabled:bg-slate-100 disabled:text-slate-400 transition-all"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">City</label>
                                                    <input 
                                                        type="text"
                                                        value={city}
                                                        onChange={e => setCity(e.target.value)}
                                                        disabled={isSubmitted}
                                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#02275A] focus:outline-none focus:bg-white focus:border-[#02275A] disabled:bg-slate-100 disabled:text-slate-400 transition-all"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* SECTION 2: Identity & Statutory */}
                                        <div className="border-t border-slate-100 pt-5">
                                            <h4 className="font-bold text-[#02275A] text-sm mb-4 flex items-center gap-2">
                                                <i className="far fa-id-card text-slate-400"></i> Identity & Statutory
                                            </h4>
                                            
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">NIN</label>
                                                    <input 
                                                        type="text"
                                                        value={nin}
                                                        onChange={e => setNin(e.target.value)}
                                                        disabled={isSubmitted}
                                                        maxLength={11}
                                                        placeholder="11 digits NIN"
                                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#02275A] focus:outline-none focus:bg-white focus:border-[#02275A] disabled:bg-slate-100 disabled:text-slate-400 transition-all"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">BVN</label>
                                                    <input 
                                                        type="text"
                                                        value={bvn}
                                                        onChange={e => setBvn(e.target.value)}
                                                        disabled={isSubmitted}
                                                        maxLength={11}
                                                        placeholder="11 digits BVN"
                                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#02275A] focus:outline-none focus:bg-white focus:border-[#02275A] disabled:bg-slate-100 disabled:text-slate-400 transition-all"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Tax ID (TIN)</label>
                                                    <input 
                                                        type="text"
                                                        value={taxId}
                                                        onChange={e => setTaxId(e.target.value)}
                                                        disabled={isSubmitted}
                                                        placeholder="TIN number"
                                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#02275A] focus:outline-none focus:bg-white focus:border-[#02275A] disabled:bg-slate-100 disabled:text-slate-400 transition-all"
                                                    />
                                                </div>

                                                <div className="sm:col-span-2">
                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">PFA Name</label>
                                                    <input 
                                                        type="text"
                                                        value={pfaName}
                                                        onChange={e => setPfaName(e.target.value)}
                                                        disabled={isSubmitted}
                                                        placeholder="Pension Fund Administrator name"
                                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#02275A] focus:outline-none focus:bg-white focus:border-[#02275A] disabled:bg-slate-100 disabled:text-slate-400 transition-all"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Pension Number</label>
                                                    <input 
                                                        type="text"
                                                        value={pensionNumber}
                                                        onChange={e => setPensionNumber(e.target.value)}
                                                        disabled={isSubmitted}
                                                        placeholder="PEN number"
                                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#02275A] focus:outline-none focus:bg-white focus:border-[#02275A] disabled:bg-slate-100 disabled:text-slate-400 transition-all"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* SECTION 3: Emergency Contact */}
                                        <div className="border-t border-slate-100 pt-5">
                                            <h4 className="font-bold text-[#02275A] text-sm mb-4 flex items-center gap-2">
                                                <i className="far fa-life-ring text-slate-400"></i> Emergency Contact
                                            </h4>
                                            
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Contact Name</label>
                                                    <input 
                                                        type="text"
                                                        value={emergencyName}
                                                        onChange={e => setEmergencyName(e.target.value)}
                                                        disabled={isSubmitted}
                                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#02275A] focus:outline-none focus:bg-white focus:border-[#02275A] disabled:bg-slate-100 disabled:text-slate-400 transition-all"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Contact Phone</label>
                                                    <input 
                                                        type="text"
                                                        value={emergencyPhone}
                                                        onChange={e => setEmergencyPhone(e.target.value)}
                                                        disabled={isSubmitted}
                                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#02275A] focus:outline-none focus:bg-white focus:border-[#02275A] disabled:bg-slate-100 disabled:text-slate-400 transition-all"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Relationship</label>
                                                    <input 
                                                        type="text"
                                                        value={emergencyRelationship}
                                                        onChange={e => setEmergencyRelationship(e.target.value)}
                                                        disabled={isSubmitted}
                                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#02275A] focus:outline-none focus:bg-white focus:border-[#02275A] disabled:bg-slate-100 disabled:text-slate-400 transition-all"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="border-t border-slate-100 pt-5 flex items-center justify-between gap-4">
                                            {isSubmitted ? (
                                                <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs bg-emerald-50 px-4 py-2.5 rounded-xl border border-emerald-100">
                                                    <i className="fas fa-check-circle"></i> Profile locked & submitted for compliance checks
                                                </div>
                                            ) : (
                                                <div className="text-[11px] text-slate-400">
                                                    * Please make sure details match your official documents.
                                                </div>
                                            )}

                                            <div className="flex gap-2">
                                                {isSubmitted && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setIsSubmitted(false);
                                                            try {
                                                                localStorage.removeItem('cx_profile_is_submitted');
                                                            } catch {}
                                                        }}
                                                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                                                    >
                                                        Unlock to Edit
                                                    </button>
                                                )}
                                                {!isSubmitted && (
                                                    <button
                                                        type="submit"
                                                        className="px-5 py-2.5 bg-[#02275A] hover:bg-blue-900 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                                                    >
                                                        <i className="fas fa-cloud-upload-alt"></i> Save & Lock Details
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {activeSubTab === 'payroll-bank' && (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
                                {/* Left Column: Interactive Overlapping Avatar Profile Box */}
                                <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col">
                                    {/* Top solid brand-color/gradient box */}
                                    <div className="bg-gradient-to-tr from-[#02275A] to-blue-700 h-28 relative"></div>
                                    
                                    {/* Overlapping circular avatar box */}
                                    <div className="relative -mt-12 flex flex-col items-center pb-5 px-6">
                                        <div className="w-24 h-24 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center shadow-md font-bold text-[#02275A] text-xl relative mb-3">
                                            {initials}
                                            <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#02275A] hover:bg-[#011C42] border border-white text-white flex items-center justify-center shadow-xs transition-colors cursor-pointer">
                                                <i className="fas fa-camera text-[10px]"></i>
                                            </button>
                                        </div>
                                        
                                        {/* Name and Designation badges */}
                                        <h4 className="text-lg font-extrabold text-[#02275A] text-center">{firstName} {lastName}</h4>
                                        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2">
                                            <span className="px-2 py-0.5 bg-slate-50 border border-slate-100 text-slate-500 rounded-md text-[9px] font-bold uppercase tracking-wider">
                                                {userRole === 'customer-success' ? 'HEAD OF CS' : userRole === 'support-staff' ? 'SUPPORT STAFF' : userRole === 'call-agent' ? 'CALL AGENT' : 'HEAD OF CX'}
                                            </span>
                                            <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-md text-[9px] font-bold uppercase tracking-wider">
                                                ACTIVE
                                            </span>
                                        </div>

                                        {/* Profile Completion tracker calculated dynamically */}
                                        {(() => {
                                            const filledFieldsCount = [
                                                firstName, lastName, phone, dob, gender, maritalStatus, country, stateVal, city, 
                                                nin, bvn, taxId, pfaName, pensionNumber, 
                                                emergencyName, emergencyPhone, emergencyRelationship
                                            ].filter(Boolean).length;
                                            const completionPercentage = Math.round((filledFieldsCount / 17) * 100);
                                            
                                            return (
                                                <div className="w-full mt-6 border-t border-slate-100 pt-5">
                                                    <div className="flex justify-between items-center text-xs text-slate-500 font-bold mb-1.5">
                                                        <span>Profile completion</span>
                                                        <span>{completionPercentage}%</span>
                                                    </div>
                                                    <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                                                        <div className="bg-[#02275A] h-full transition-all duration-500" style={{ width: `${completionPercentage}%` }}></div>
                                                    </div>
                                                </div>
                                            );
                                        })()}

                                        {/* Standard dynamic labels */}
                                        <div className="w-full border-t border-slate-100 mt-5 pt-5 space-y-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center text-xs">
                                                    <i className="fas fa-building"></i>
                                                </div>
                                                <div>
                                                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">DEPARTMENT</span>
                                                    <span className="text-xs font-bold text-[#02275A]">{deptName}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 pb-1">
                                                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center text-xs">
                                                    <i className="fas fa-envelope"></i>
                                                </div>
                                                <div>
                                                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">EMAIL</span>
                                                    <span className="text-xs font-bold text-[#02275A] truncate max-w-[170px]" title={emailStr}>{emailStr}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Payroll & Bank settings card */}
                                <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col space-y-6">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                        <div className="flex items-center gap-2.5 text-base font-bold text-[#02275A]">
                                            <span className="text-slate-400 text-lg select-none">☒</span>
                                            <span>Payroll & Bank Settings</span>
                                        </div>
                                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-extrabold tracking-wider uppercase rounded-md">
                                            EDITABLE ANYTIME
                                        </span>
                                    </div>

                                    {/* Specifications Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="bg-slate-50/50 border border-slate-100 p-3.5 rounded-xl flex flex-col justify-center">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">GROSS SALARY</span>
                                            <span className="text-xs font-extrabold text-[#02275A] mt-1">—</span>
                                        </div>

                                        <div className="bg-slate-50/50 border border-slate-100 p-3.5 rounded-xl flex flex-col justify-center">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CURRENCY</span>
                                            <span className="text-xs font-extrabold text-[#02275A] mt-1 font-sans">NGN</span>
                                        </div>
                                    </div>

                                    <form onSubmit={(e) => { e.preventDefault(); handleSaveBank(); }} className="space-y-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-bold text-[#02275A] uppercase tracking-wider mb-2">BANK NAME</label>
                                                <select 
                                                    value={bankName}
                                                    onChange={e => setBankName(e.target.value)}
                                                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#02275A] focus:outline-none focus:bg-white focus:border-[#02275A] transition-all cursor-pointer"
                                                >
                                                    <option value="">Select bank...</option>
                                                    <option>Guaranty Trust Bank</option>
                                                    <option>Zenith Bank</option>
                                                    <option>First Bank</option>
                                                    <option>Access Bank</option>
                                                    <option>United Bank for Africa</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-bold text-[#02275A] uppercase tracking-wider mb-2">ACCOUNT NUMBER</label>
                                                <input 
                                                    type="text"
                                                    value={accountNum}
                                                    onChange={e => {
                                                        const val = e.target.value.replace(/\D/g, '');
                                                        if (val.length <= 10) {
                                                            setAccountNum(val);
                                                        }
                                                    }}
                                                    placeholder="10-digit account number"
                                                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#02275A] placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#02275A] transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div className="border-t border-slate-100 pt-5 flex justify-end">
                                            <button
                                                type="submit"
                                                className="px-5 py-2.5 bg-[#02275A] hover:bg-[#011C42] text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                                            >
                                                Save Bank Details
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {activeSubTab === 'guarantors' && (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
                                {/* Left Column: Interactive Overlapping Avatar Profile Box */}
                                <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col">
                                    {/* Top solid brand-color/gradient box */}
                                    <div className="bg-gradient-to-tr from-[#02275A] to-blue-700 h-28 relative"></div>
                                    
                                    {/* Overlapping circular avatar box */}
                                    <div className="relative -mt-12 flex flex-col items-center pb-5 px-6">
                                        <div className="w-24 h-24 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center shadow-md font-bold text-[#02275A] text-xl relative mb-3">
                                            {initials}
                                            <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#02275A] hover:bg-[#011C42] border border-white text-white flex items-center justify-center shadow-xs transition-colors cursor-pointer">
                                                <i className="fas fa-camera text-[10px]"></i>
                                            </button>
                                        </div>
                                        
                                        {/* Name and Designation badges */}
                                        <h4 className="text-lg font-extrabold text-[#02275A] text-center">{firstName} {lastName}</h4>
                                        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2">
                                            <span className="px-2 py-0.5 bg-slate-50 border border-slate-100 text-slate-500 rounded-md text-[9px] font-bold uppercase tracking-wider">
                                                {userRole === 'customer-success' ? 'HEAD OF CS' : userRole === 'support-staff' ? 'SUPPORT STAFF' : userRole === 'call-agent' ? 'CALL AGENT' : 'HEAD OF CX'}
                                            </span>
                                            <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-md text-[9px] font-bold uppercase tracking-wider">
                                                ACTIVE
                                            </span>
                                        </div>

                                        {/* Profile Completion tracker calculated dynamically */}
                                        {(() => {
                                            const filledFieldsCount = [
                                                firstName, lastName, phone, dob, gender, maritalStatus, country, stateVal, city, 
                                                nin, bvn, taxId, pfaName, pensionNumber, 
                                                emergencyName, emergencyPhone, emergencyRelationship
                                            ].filter(Boolean).length;
                                            const completionPercentage = Math.round((filledFieldsCount / 17) * 100);
                                            
                                            return (
                                                <div className="w-full mt-6 border-t border-slate-100 pt-5">
                                                    <div className="flex justify-between items-center text-xs text-slate-500 font-bold mb-1.5">
                                                        <span>Profile completion</span>
                                                        <span>{completionPercentage}%</span>
                                                    </div>
                                                    <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                                                        <div className="bg-[#02275A] h-full transition-all duration-500" style={{ width: `${completionPercentage}%` }}></div>
                                                    </div>
                                                </div>
                                            );
                                        })()}

                                        {/* Standard dynamic labels */}
                                        <div className="w-full border-t border-slate-100 mt-5 pt-5 space-y-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center text-xs">
                                                    <i className="fas fa-building"></i>
                                                </div>
                                                <div>
                                                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">DEPARTMENT</span>
                                                    <span className="text-xs font-bold text-[#02275A]">{deptName}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 pb-1">
                                                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center text-xs">
                                                    <i className="fas fa-envelope"></i>
                                                </div>
                                                <div>
                                                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">EMAIL</span>
                                                    <span className="text-xs font-bold text-[#02275A] truncate max-w-[170px]" title={emailStr}>{emailStr}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Guarantors settings card */}
                                <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col space-y-6">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                        <div className="flex items-center gap-2.5 text-base font-bold text-[#02275A]">
                                            <span className="text-slate-400 text-lg select-none">☒</span>
                                            <span>Guarantors</span>
                                        </div>
                                    </div>

                                    {/* Subtitle / Guarantors Info */}
                                    {guarantors.length === 0 ? (
                                        <div className="text-xs font-medium text-slate-400 pb-1">
                                            No guarantors added yet.
                                        </div>
                                    ) : (
                                        <div className="space-y-4 pb-1">
                                            <h4 className="text-[10px] font-bold text-[#02275A] uppercase tracking-wider">ADDED GUARANTORS ({guarantors.length})</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {guarantors.map((guar, index) => (
                                                    <div key={index} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-2 relative">
                                                        <button 
                                                            type="button" 
                                                            onClick={() => {
                                                                const updated = guarantors.filter((_, i) => i !== index);
                                                                setGuarantors(updated);
                                                                try {
                                                                    localStorage.setItem('cx_profile_guarantors', JSON.stringify(updated));
                                                                } catch {}
                                                                showSuccess('Guarantor deleted.');
                                                            }}
                                                            className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 transition-colors text-xs"
                                                            title="Remove Guarantor"
                                                        >
                                                            <i className="fas fa-trash-alt"></i>
                                                        </button>
                                                        <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest">{guar.relationship}</span>
                                                        <h4 className="font-bold text-[#02275A] text-xs">{guar.name}</h4>
                                                        {guar.email && <div className="text-[11px] text-slate-500 truncate"><i className="far fa-envelope text-slate-400"></i> {guar.email}</div>}
                                                        <div className="text-[11px] text-slate-500"><i className="fas fa-phone text-slate-400"></i> {guar.phone}</div>
                                                        <div className="text-[11px] text-slate-500 truncate"><i className="fas fa-map-marker-alt text-slate-400"></i> {guar.address}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Interactive Add Guarantor Form */}
                                    <form onSubmit={handleAddGuarantor} className="space-y-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-[10px] font-bold text-[#02275A] uppercase tracking-wider mb-2">FULL NAME</label>
                                                <input 
                                                    type="text"
                                                    value={newGuarName}
                                                    onChange={e => setNewGuarName(e.target.value)}
                                                    required
                                                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#02275A] focus:outline-none focus:bg-white focus:border-[#02275A] transition-all"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-bold text-[#02275A] uppercase tracking-wider mb-2">PHONE</label>
                                                <input 
                                                    type="text"
                                                    value={newGuarPhone}
                                                    onChange={e => setNewGuarPhone(e.target.value)}
                                                    required
                                                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#02275A] focus:outline-none focus:bg-white focus:border-[#02275A] transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-[10px] font-bold text-[#02275A] uppercase tracking-wider mb-2">EMAIL (OPTIONAL)</label>
                                                <input 
                                                    type="email"
                                                    value={newGuarEmail}
                                                    onChange={e => setNewGuarEmail(e.target.value)}
                                                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#02275A] focus:outline-none focus:bg-white focus:border-[#02275A] transition-all"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-bold text-[#02275A] uppercase tracking-wider mb-2">RELATIONSHIP</label>
                                                <select 
                                                    value={newGuarRel}
                                                    onChange={e => setNewGuarRel(e.target.value)}
                                                    required
                                                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#02275A] focus:outline-none focus:bg-white focus:border-[#02275A] transition-all cursor-pointer"
                                                >
                                                    <option value="">Select...</option>
                                                    <option value="Uncle">Uncle</option>
                                                    <option value="Aunt">Aunt</option>
                                                    <option value="Parent / Guardian">Parent / Guardian</option>
                                                    <option value="Former Professional Supervisor">Former Professional Supervisor</option>
                                                    <option value="Religious Leader">Religious Leader</option>
                                                    <option value="Business Mentor">Business Mentor</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-bold text-[#02275A] uppercase tracking-wider mb-2">ADDRESS</label>
                                            <input 
                                                type="text"
                                                value={newGuarAddr}
                                                onChange={e => setNewGuarAddr(e.target.value)}
                                                required
                                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#02275A] focus:outline-none focus:bg-white focus:border-[#02275A] transition-all"
                                            />
                                        </div>

                                        <div className="border-t border-slate-100 pt-5 flex justify-end">
                                            <button
                                                type="submit"
                                                className="px-5 py-2.5 bg-[#02275A] hover:bg-[#011C42] text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                                            >
                                                Save Guarantor Details
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {activeSubTab === 'documents' && (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
                                {/* Left Column: Interactive Overlapping Avatar Profile Box */}
                                <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col">
                                    {/* Top solid brand-color/gradient box */}
                                    <div className="bg-gradient-to-tr from-[#02275A] to-blue-700 h-28 relative"></div>
                                    
                                    {/* Overlapping circular avatar box */}
                                    <div className="relative -mt-12 flex flex-col items-center pb-5 px-6">
                                        <div className="w-24 h-24 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center shadow-md font-bold text-[#02275A] text-xl relative mb-3">
                                            {initials}
                                            <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#02275A] hover:bg-[#011C42] border border-white text-white flex items-center justify-center shadow-xs transition-colors cursor-pointer">
                                                <i className="fas fa-camera text-[10px]"></i>
                                            </button>
                                        </div>
                                        
                                        {/* Name and Designation badges */}
                                        <h4 className="text-lg font-extrabold text-[#02275A] text-center">{firstName} {lastName}</h4>
                                        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2">
                                            <span className="px-2 py-0.5 bg-slate-50 border border-slate-100 text-slate-500 rounded-md text-[9px] font-bold uppercase tracking-wider">
                                                {userRole === 'customer-success' ? 'HEAD OF CS' : userRole === 'support-staff' ? 'SUPPORT STAFF' : userRole === 'call-agent' ? 'CALL AGENT' : 'HEAD OF CX'}
                                            </span>
                                            <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-md text-[9px] font-bold uppercase tracking-wider">
                                                ACTIVE
                                            </span>
                                        </div>

                                        {/* Profile Completion tracker calculated dynamically */}
                                        {(() => {
                                            const filledFieldsCount = [
                                                firstName, lastName, phone, dob, gender, maritalStatus, country, stateVal, city, 
                                                nin, bvn, taxId, pfaName, pensionNumber, 
                                                emergencyName, emergencyPhone, emergencyRelationship
                                            ].filter(Boolean).length;
                                            const completionPercentage = Math.round((filledFieldsCount / 17) * 100);
                                            
                                            return (
                                                <div className="w-full mt-6 border-t border-slate-100 pt-5">
                                                    <div className="flex justify-between items-center text-xs text-slate-500 font-bold mb-1.5">
                                                        <span>Profile completion</span>
                                                        <span>{completionPercentage}%</span>
                                                    </div>
                                                    <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                                                        <div className="bg-[#02275A] h-full transition-all duration-500" style={{ width: `${completionPercentage}%` }}></div>
                                                    </div>
                                                </div>
                                            );
                                        })()}

                                        {/* Standard dynamic labels */}
                                        <div className="w-full border-t border-slate-100 mt-5 pt-5 space-y-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center text-xs">
                                                    <i className="fas fa-building"></i>
                                                </div>
                                                <div>
                                                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">DEPARTMENT</span>
                                                    <span className="text-xs font-bold text-[#02275A]">{deptName}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center text-xs">
                                                    <i className="fas fa-envelope"></i>
                                                </div>
                                                <div>
                                                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">EMAIL</span>
                                                    <span className="text-xs font-bold text-[#02275A] truncate max-w-[170px]" title={emailStr}>{emailStr}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 pb-1">
                                                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center text-xs">
                                                    <i className="fas fa-phone"></i>
                                                </div>
                                                <div>
                                                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">PHONE</span>
                                                    <span className="text-xs font-bold text-[#02275A]">{phone || '—'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Documents settings card */}
                                <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col space-y-6">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                        <div className="flex items-center gap-2.5 text-base font-bold text-[#02275A]">
                                            <span className="text-slate-400 text-lg select-none">📁</span>
                                            <span>Documents</span>
                                        </div>
                                    </div>

                                    {/* Uploaded Documents List */}
                                    {documents.length === 0 ? (
                                        <div className="text-xs font-medium text-slate-400 pb-1">
                                            No documents uploaded yet.
                                        </div>
                                    ) : (
                                        <div className="space-y-4 pb-1">
                                            <h4 className="text-[10px] font-bold text-[#02275A] uppercase tracking-wider">UPLOADED DOCUMENTS ({documents.length})</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {documents.map((doc, index) => (
                                                    <div key={index} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-2 relative">
                                                        <button 
                                                            type="button" 
                                                            onClick={() => {
                                                                const updated = documents.filter((_, i) => i !== index);
                                                                setDocuments(updated);
                                                                try {
                                                                    localStorage.setItem('cx_profile_documents', JSON.stringify(updated));
                                                                } catch {}
                                                                showSuccess('Document deleted.');
                                                            }}
                                                            className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 transition-colors text-xs"
                                                            title="Remove Document"
                                                        >
                                                            <i className="fas fa-trash-alt"></i>
                                                        </button>
                                                        <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest">{doc.type}</span>
                                                        <h4 className="font-bold text-[#02275A] text-xs truncate" title={doc.name}>{doc.name}</h4>
                                                        <div className="text-[11px] text-slate-500"><i className="far fa-file-alt text-slate-400"></i> {doc.size}</div>
                                                        <div className="text-[11px] text-slate-500"><i className="far fa-calendar-alt text-slate-400"></i> {doc.date}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Upload form or progress section */}
                                    {uploadingDoc ? (
                                        <div className="p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center flex flex-col items-center justify-center min-h-[220px]">
                                            <div className="relative w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-blue-50">
                                                <i className="fas fa-arrow-up-from-bracket text-[#02275A] text-lg animate-bounce"></i>
                                            </div>
                                            <p className="text-xs font-bold text-slate-700">Uploading Document...</p>
                                            <div className="w-48 bg-slate-200 rounded-full h-1.5 mt-3 overflow-hidden">
                                                <div 
                                                    className="bg-[#02275A] h-1.5 rounded-full transition-all duration-150" 
                                                    style={{ width: `${uploadProgress}%` }}
                                                />
                                            </div>
                                            <p className="text-[10px] text-slate-400 mt-1">{uploadProgress}% Complete</p>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleUploadClick} className="space-y-6">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-[#02275A] uppercase tracking-wider mb-2">DOCUMENT TYPE</label>
                                                    <select 
                                                        value={docType}
                                                        onChange={e => setDocType(e.target.value)}
                                                        required
                                                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#02275A] focus:outline-none focus:bg-white focus:border-[#02275A] transition-all cursor-pointer"
                                                    >
                                                        <option value="ID Card (National ID, Passport, Driver's License)">ID Card (National ID, Passport, Driver's License)</option>
                                                        <option value="Employment Offer Letter & Agreement">Employment Offer Letter & Agreement</option>
                                                        <option value="Academic Degree Certificate / CV">Academic Degree Certificate / CV</option>
                                                        <option value="Utility Bill">Utility Bill</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-[10px] font-bold text-[#02275A] uppercase tracking-wider mb-2">DISPLAY NAME (OPTIONAL)</label>
                                                    <input 
                                                        type="text"
                                                        value={docDisplayName}
                                                        onChange={e => setDocDisplayName(e.target.value)}
                                                        placeholder="e.g. My NIN slip"
                                                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#02275A] focus:outline-none focus:bg-white focus:border-[#02275A] transition-all"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-bold text-[#02275A] uppercase tracking-wider mb-2">FILE (PDF, JPG, PNG, DOCX · MAX 10MB)</label>
                                                <div className="flex items-center gap-3">
                                                    <label className="px-4 py-2 bg-[#02275A] hover:bg-[#011C42] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-sm whitespace-nowrap">
                                                        Choose File
                                                        <input 
                                                            type="file" 
                                                            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" 
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0] || null;
                                                                setSelectedFile(file);
                                                            }}
                                                            className="hidden" 
                                                        />
                                                    </label>
                                                    <span className="text-xs text-slate-500 truncate max-w-xs">{selectedFile ? selectedFile.name : 'No file chosen'}</span>
                                                </div>
                                            </div>

                                            <div className="border-t border-slate-100 pt-5 flex justify-end">
                                                <button
                                                    type="submit"
                                                    className="px-5 py-2.5 bg-[#02275A] hover:bg-[#011C42] text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
                                                >
                                                    Upload Document
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeSubTab === 'security' && (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
                                {/* Left Column: Interactive Overlapping Avatar Profile Box */}
                                <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col">
                                    {/* Top solid brand-color/gradient box */}
                                    <div className="bg-gradient-to-tr from-[#02275A] to-blue-700 h-28 relative"></div>
                                    
                                    {/* Overlapping circular avatar box */}
                                    <div className="relative -mt-12 flex flex-col items-center pb-5 px-6">
                                        <div className="w-24 h-24 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center shadow-md font-bold text-[#02275A] text-xl relative mb-3">
                                            {initials}
                                            <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#02275A] hover:bg-[#011C42] border border-white text-white flex items-center justify-center shadow-xs transition-colors cursor-pointer">
                                                <i className="fas fa-camera text-[10px]"></i>
                                            </button>
                                        </div>
                                        
                                        {/* Name and Designation badges */}
                                        <h4 className="text-lg font-extrabold text-[#02275A] text-center">{firstName} {lastName}</h4>
                                        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2">
                                            <span className="px-2 py-0.5 bg-slate-50 border border-slate-100 text-slate-500 rounded-md text-[9px] font-bold uppercase tracking-wider">
                                                {userRole === 'customer-success' ? 'HEAD OF CS' : userRole === 'support-staff' ? 'SUPPORT STAFF' : userRole === 'call-agent' ? 'CALL AGENT' : 'HEAD OF CX'}
                                            </span>
                                            <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-md text-[9px] font-bold uppercase tracking-wider">
                                                ACTIVE
                                            </span>
                                        </div>

                                        {/* Profile Completion tracker calculated dynamically */}
                                        {(() => {
                                            const filledFieldsCount = [
                                                firstName, lastName, phone, dob, gender, maritalStatus, country, stateVal, city, 
                                                nin, bvn, taxId, pfaName, pensionNumber, 
                                                emergencyName, emergencyPhone, emergencyRelationship
                                            ].filter(Boolean).length;
                                            const completionPercentage = Math.round((filledFieldsCount / 17) * 100);
                                            
                                            return (
                                                <div className="w-full mt-6 border-t border-slate-100 pt-5">
                                                    <div className="flex justify-between items-center text-xs text-slate-500 font-bold mb-1.5">
                                                        <span>Profile completion</span>
                                                        <span>{completionPercentage}%</span>
                                                    </div>
                                                    <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                                                        <div className="bg-[#02275A] h-full transition-all duration-500" style={{ width: `${completionPercentage}%` }}></div>
                                                    </div>
                                                </div>
                                            );
                                        })()}

                                        {/* Standard dynamic labels */}
                                        <div className="w-full border-t border-slate-100 mt-5 pt-5 space-y-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center text-xs">
                                                    <i className="fas fa-building"></i>
                                                </div>
                                                <div>
                                                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">DEPARTMENT</span>
                                                    <span className="text-xs font-bold text-[#02275A]">{deptName}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center text-xs">
                                                    <i className="fas fa-envelope"></i>
                                                </div>
                                                <div>
                                                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">EMAIL</span>
                                                    <span className="text-xs font-bold text-[#02275A] truncate max-w-[170px]" title={emailStr}>{emailStr}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 pb-1">
                                                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center text-xs">
                                                    <i className="fas fa-phone"></i>
                                                </div>
                                                <div>
                                                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">PHONE</span>
                                                    <span className="text-xs font-bold text-[#02275A]">{phone || '—'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Change Password Card */}
                                <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col space-y-6">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                        <div className="flex items-center gap-2.5 text-base font-bold text-[#02275A]">
                                            <span className="text-slate-400 text-lg select-none">☒</span>
                                            <span>Change Password</span>
                                        </div>
                                    </div>
                                    
                                    <div className="text-xs font-medium text-slate-400 pb-1">
                                        Use a strong password you don't reuse elsewhere.
                                    </div>

                                    {/* Password Change Form */}
                                    <form onSubmit={handleChangePassword} className="space-y-6">
                                        <div>
                                            <label className="block text-[10px] font-bold text-[#02275A] uppercase tracking-wider mb-2">CURRENT PASSWORD *</label>
                                            <input 
                                                type="password"
                                                value={currentPassword}
                                                onChange={e => setCurrentPassword(e.target.value)}
                                                placeholder="Enter current password"
                                                required
                                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#02275A] focus:outline-none focus:bg-white focus:border-[#02275A] transition-all placeholder-slate-400"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-[10px] font-bold text-[#02275A] uppercase tracking-wider mb-2">NEW PASSWORD *</label>
                                                <input 
                                                    type="password"
                                                    value={newPassword}
                                                    onChange={e => setNewPassword(e.target.value)}
                                                    placeholder="Min 8 characters"
                                                    required
                                                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#02275A] focus:outline-none focus:bg-white focus:border-[#02275A] transition-all placeholder-slate-400"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-bold text-[#02275A] uppercase tracking-wider mb-2">CONFIRM NEW PASSWORD *</label>
                                                <input 
                                                    type="password"
                                                    value={confirmPassword}
                                                    onChange={e => setConfirmPassword(e.target.value)}
                                                    placeholder="Re-enter new password"
                                                    required
                                                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#02275A] focus:outline-none focus:bg-white focus:border-[#02275A] transition-all placeholder-slate-400"
                                                />
                                            </div>
                                        </div>

                                        <div className="border-t border-slate-100 pt-5 flex justify-end">
                                            <button
                                                type="submit"
                                                className="px-5 py-2.5 bg-[#02275A] hover:bg-[#011C42] text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
                                            >
                                                Change Password
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {activeSubTab === 'point-ledger' && (
                            <div className="-mt-6">
                                <EmployeeHistoryView setView={setView} />
                            </div>
                        )}

                        {activeSubTab === 'grade-policy' && (
                            <div className="-mt-6">
                                <EmployeeGradesRewardsView hideRewards={true} />
                            </div>
                        )}

                        {activeSubTab === 'leaderboard' && (
                            <div className="-mt-6">
                                <EmployeeLeaderboardView />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CXHeadProfileView;
