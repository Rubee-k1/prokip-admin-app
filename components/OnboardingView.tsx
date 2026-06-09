
import React, { useState, useEffect } from 'react';

interface OnboardingViewProps {
    onComplete: () => void;
}

interface Manager {
    id: string;
    name: string;
    state: string;
    location: string;
    photo: string; // initials
    avatarColor: string;
}

const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete }) => {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [country, setCountry] = useState('Nigeria');
    const [selectedState, setSelectedState] = useState('Lagos'); // Default to Lagos for demo
    const [idType, setIdType] = useState('National ID');
    const [selectedManagerId, setSelectedManagerId] = useState<string | null>(null);

    const regions: Record<string, string[]> = {
        'Nigeria': ['Lagos', 'Abuja (FCT)', 'Kano', 'Rivers', 'Oyo', 'Enugu', 'Kaduna', 'Ogun'],
        'Ghana': ['Greater Accra', 'Ashanti', 'Northern', 'Western', 'Volta', 'Central'],
        'Kenya': ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'],
        'Rwanda': ['Kigali', 'Butare', 'Gitarama', 'Ruhengeri'],
        'Uganda': ['Kampala', 'Entebbe', 'Jinja', 'Gulu', 'Mbarara'],
        'South Africa': ['Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape'],
        'United Kingdom': ['London', 'Manchester', 'Birmingham', 'Scotland', 'Wales'],
        'United States': ['New York', 'California', 'Texas', 'Florida', 'Illinois'],
        'India': ['Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Telangana'],
        'Canada': ['Ontario', 'British Columbia', 'Quebec', 'Alberta']
    };

    const banks: Record<string, string[]> = {
        'Nigeria': ['Guaranty Trust Bank', 'Zenith Bank', 'First Bank', 'Access Bank', 'UBA', 'Kuda'],
        'Ghana': ['Ecobank Ghana', 'GCB Bank', 'Absa Bank Ghana', 'Standard Chartered', 'MTN Mobile Money', 'Vodafone Cash'],
        'Kenya': ['M-Pesa', 'Airtel Money', 'KCB Bank', 'Equity Bank', 'Co-operative Bank', 'NCBA'],
        'Rwanda': ['MTN Mobile Money', 'Airtel Money', 'Bank of Kigali', 'Equity Bank', 'I&M Bank'],
        'Uganda': ['MTN Mobile Money', 'Airtel Money', 'Stanbic Bank', 'Centenary Bank', 'Equity Bank'],
        'South Africa': ['Standard Bank', 'FirstRand', 'Absa Group', 'Nedbank'],
        'United Kingdom': ['HSBC', 'Barclays', 'Lloyds Banking Group', 'NatWest'],
        'United States': ['Chase', 'Bank of America', 'Wells Fargo', 'Citi'],
        'India': ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank'],
        'Canada': ['RBC', 'TD Bank', 'Scotiabank', 'BMO']
    };

    const mockManagers: Manager[] = [
        { id: 'm1', name: 'Chukwudi O.', state: 'Lagos', location: 'Lagos Mainland', photo: 'CO', avatarColor: 'bg-blue-600' },
        { id: 'm2', name: 'Bimbo A.', state: 'Lagos', location: 'Lagos Island', photo: 'BA', avatarColor: 'bg-indigo-600' },
        { id: 'm3', name: 'Fatima B.', state: 'Abuja (FCT)', location: 'Central Area', photo: 'FB', avatarColor: 'bg-emerald-600' },
        { id: 'm4', name: 'Emeka N.', state: 'Rivers', location: 'Port Harcourt', photo: 'EN', avatarColor: 'bg-amber-600' },
        { id: 'm5', name: 'Yusuf A.', state: 'Kano', location: 'Kano Municipal', photo: 'YA', avatarColor: 'bg-rose-600' },
    ];

    const mobileMoneyCountries = ['Kenya', 'Ghana', 'Rwanda', 'Uganda'];

    // Filter managers based on selected state
    const availableManagers = mockManagers.filter(m => m.state === selectedState);
    const hasManagers = availableManagers.length > 0;
    const isSingleManager = availableManagers.length === 1;

    // Auto-select manager if only one exists when entering step 3
    useEffect(() => {
        if (step === 3 && isSingleManager) {
            setSelectedManagerId(availableManagers[0].id);
        } else if (step === 3 && !hasManagers) {
            // No manager found, maybe assign a default HQ one logically, handled in render
            setSelectedManagerId('hq-default'); 
        }
    }, [step, isSingleManager, hasManagers, availableManagers]);

    const handleNext = () => {
        if (step < 4) {
            // Validation for step 3
            if (step === 3 && !selectedManagerId && availableManagers.length > 1) {
                return; // User must select
            }
            setStep(step + 1);
        } else {
            setIsLoading(true);
            setTimeout(() => {
                setIsLoading(false);
                onComplete();
            }, 2000);
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setCountry(val);
        // Reset or set default ID type based on country
        if (val === 'Ghana') setIdType('Ghana Card');
        else if (val === 'Kenya') setIdType('National ID');
        else setIdType('National ID');
        
        // Reset selected state to first available
        if (regions[val] && regions[val].length > 0) {
            setSelectedState(regions[val][0]);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-lg md:max-w-4xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Progress Bar */}
                <div className="bg-slate-50 px-8 py-6 border-b border-slate-100">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-slate-800">
                            {step === 1 && 'Agent Profile'}
                            {step === 2 && 'Payout Details'}
                            {step === 3 && 'Assign Manager'}
                            {step === 4 && 'All Set!'}
                        </h2>
                        <span className="text-xs font-bold text-slate-400">Step {step} of 4</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full w-full overflow-hidden">
                        <div 
                            className="h-full bg-emerald-500 transition-all duration-500 ease-out"
                            style={{ width: `${(step / 4) * 100}%` }}
                        ></div>
                    </div>
                </div>

                <div className="p-8 overflow-y-auto">
                    
                    {/* STEP 1: Profile & Region */}
                    {step === 1 && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="text-center mb-6">
                                <div className="w-24 h-24 bg-slate-100 rounded-full mx-auto mb-3 flex items-center justify-center border-2 border-dashed border-slate-300 cursor-pointer hover:bg-slate-200 transition-colors relative group">
                                    <i className="fas fa-camera text-slate-400 text-2xl group-hover:text-slate-600"></i>
                                    <div className="absolute bottom-0 right-0 bg-[#02275A] text-white w-8 h-8 rounded-full flex items-center justify-center text-xs shadow-md">
                                        <i className="fas fa-plus"></i>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 font-bold">Upload Profile Photo</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Country of Operation</label>
                                <select 
                                    value={country} 
                                    onChange={handleCountryChange} 
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#02275A]"
                                >
                                    {Object.keys(regions).map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Operating Region / State</label>
                                <select 
                                    value={selectedState}
                                    onChange={(e) => setSelectedState(e.target.value)}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#02275A]"
                                >
                                    {regions[country]?.map(region => (
                                        <option key={region} value={region}>{region}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">City / Area</label>
                                <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#02275A]" placeholder="e.g. Ikeja" />
                            </div>

                            {/* Nigerian KYC Fields */}
                            {country === 'Nigeria' && (
                                <div className="pt-4 border-t border-slate-100 space-y-4 animate-fade-in">
                                    <div className="flex items-center gap-2 mb-2">
                                        <i className="fas fa-shield-alt text-[#02275A]"></i>
                                        <h3 className="text-sm font-bold text-slate-800">Identity Verification (KYC)</h3>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">NIN Number</label>
                                            <input type="text" maxLength={11} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#02275A]" placeholder="11-digit NIN" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">BVN</label>
                                            <input type="text" maxLength={11} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#02275A]" placeholder="11-digit BVN" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Upload NIN Slip / Card</label>
                                        <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 hover:border-slate-400 transition-colors cursor-pointer relative group">
                                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                                <i className="fas fa-id-card text-xl text-slate-500"></i>
                                            </div>
                                            <p className="text-xs font-bold text-slate-600">Click to upload image</p>
                                            <p className="text-[10px] text-slate-400 mt-1">JPG or PNG (Max 5MB)</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Kenya/Rwanda/Uganda/Ghana KYC Fields */}
                            {['Kenya', 'Rwanda', 'Uganda', 'Ghana'].includes(country) && (
                                <div className="pt-4 border-t border-slate-100 space-y-4 animate-fade-in">
                                    <div className="flex items-center gap-2 mb-2">
                                        <i className="fas fa-shield-alt text-[#02275A]"></i>
                                        <h3 className="text-sm font-bold text-slate-800">Identity Verification (KYC)</h3>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">ID Type</label>
                                        <select 
                                            value={idType} 
                                            onChange={(e) => setIdType(e.target.value)} 
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#02275A]"
                                        >
                                            <option>National ID</option>
                                            <option>Passport</option>
                                            {country === 'Kenya' && <option>KRA PIN</option>}
                                            {country === 'Ghana' && <option>Ghana Card</option>}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                                            {idType === 'Ghana Card' ? 'Ghana Card ID' : 
                                             idType === 'KRA PIN' ? 'KRA PIN Number' : 'ID Number'}
                                        </label>
                                        <input 
                                            type="text" 
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#02275A]" 
                                            placeholder={idType === 'Ghana Card' ? "GHA-000000000-0" : "Enter ID Number"} 
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                                            Upload {idType} Image
                                        </label>
                                        <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 hover:border-slate-400 transition-colors cursor-pointer relative group">
                                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                                <i className="fas fa-id-card text-xl text-slate-500"></i>
                                            </div>
                                            <p className="text-xs font-bold text-slate-600">Click to upload document</p>
                                            <p className="text-[10px] text-slate-400 mt-1">JPG or PNG (Max 5MB)</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 2: Bank Details */}
                    {step === 2 && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3">
                                <i className="fas fa-info-circle text-blue-600 mt-0.5"></i>
                                <p className="text-xs text-blue-800 leading-relaxed">
                                    Please provide accurate details for <strong>{country}</strong>. This will be used to process your weekly commission payouts.
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                                    {mobileMoneyCountries.includes(country) ? 'Bank or Mobile Money Provider' : 'Bank Name'}
                                </label>
                                <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#02275A]">
                                    <option>Select Provider</option>
                                    {banks[country]?.map(bank => (
                                        <option key={bank} value={bank}>{bank}</option>
                                    )) || <option>Other Bank</option>}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                                    {mobileMoneyCountries.includes(country) ? 'Account / Mobile Money Number' : 'Account Number'}
                                </label>
                                <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold text-slate-800 outline-none focus:border-[#02275A] font-mono tracking-wider" placeholder={mobileMoneyCountries.includes(country) ? "07..." : "0123456789"} />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Account Name</label>
                                <input type="text" className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 outline-none cursor-not-allowed" placeholder="Auto-populated upon entry" disabled />
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Assign Manager */}
                    {step === 3 && (
                        <div className="space-y-6 animate-fade-in">
                            
                            {/* Scenario 1: Multiple Managers */}
                            {availableManagers.length > 1 && (
                                <>
                                    <div className="text-center mb-6">
                                        <h3 className="text-xl font-bold text-slate-800 mb-2">Select State Manager</h3>
                                        <p className="text-slate-500 text-sm">
                                            We found multiple managers in <span className="font-bold text-[#02275A]">{selectedState}</span>. Please select one to proceed.
                                        </p>
                                    </div>
                                    <div className="space-y-3">
                                        {availableManagers.map(manager => (
                                            <div 
                                                key={manager.id}
                                                onClick={() => setSelectedManagerId(manager.id)}
                                                className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedManagerId === manager.id ? 'border-[#02275A] bg-blue-50/50' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                                            >
                                                <div className={`w-12 h-12 rounded-full ${manager.avatarColor} flex items-center justify-center text-white font-bold text-lg mr-4`}>
                                                    {manager.photo}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-slate-800">{manager.name}</h4>
                                                    <p className="text-xs text-slate-500">{manager.location}</p>
                                                </div>
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedManagerId === manager.id ? 'border-[#02275A] bg-[#02275A]' : 'border-slate-300'}`}>
                                                    {selectedManagerId === manager.id && <i className="fas fa-check text-white text-[10px]"></i>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* Scenario 2: Single Manager (Auto Assigned) */}
                            {isSingleManager && (
                                <div className="text-center py-6">
                                    <div className="w-24 h-24 rounded-full bg-slate-100 mx-auto mb-4 p-1 border-2 border-[#02275A] shadow-lg">
                                        <div className={`w-full h-full rounded-full ${availableManagers[0].avatarColor} flex items-center justify-center text-white font-bold text-3xl`}>
                                            {availableManagers[0].photo}
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-1">Manager Assigned</h3>
                                    <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">
                                        You have been assigned to the State Manager for <span className="font-bold text-[#02275A]">{selectedState}</span>.
                                    </p>
                                    
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 inline-block w-full max-w-xs text-left">
                                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Manager Details</p>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1">
                                                <p className="font-bold text-slate-800 text-lg">{availableManagers[0].name}</p>
                                                <p className="text-xs text-slate-500">{availableManagers[0].location}</p>
                                            </div>
                                            <i className="fas fa-check-circle text-emerald-500 text-xl"></i>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Scenario 3: No Manager (Assigned to HQ) */}
                            {!hasManagers && (
                                <div className="text-center py-6">
                                    <div className="w-24 h-24 rounded-full bg-slate-100 mx-auto mb-4 p-1 border-2 border-slate-300 shadow-md">
                                        <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-white font-bold text-3xl">
                                            HQ
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-1">Assigned to HQ</h3>
                                    <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">
                                        No specific manager found for {selectedState}. You have been assigned to the National Coordinator.
                                    </p>
                                    
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 inline-block w-full max-w-xs text-left">
                                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Coordinator</p>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1">
                                                <p className="font-bold text-slate-800 text-lg">National HQ</p>
                                                <p className="text-xs text-slate-500">Lagos Head Office</p>
                                            </div>
                                            <i className="fas fa-check-circle text-emerald-500 text-xl"></i>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 4: Success */}
                    {step === 4 && (
                        <div className="text-center py-4 animate-fade-in">
                            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-5xl text-emerald-600 mx-auto mb-6 shadow-lg shadow-emerald-200 animate-bounce">
                                <i className="fas fa-check"></i>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">You're Ready to Go!</h2>
                            <p className="text-slate-500 mb-8 max-w-xs mx-auto">
                                Your agent account has been set up successfully. You can now start onboarding businesses and earning commissions.
                            </p>
                            
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6 text-left">
                                <h4 className="text-xs font-bold text-slate-700 uppercase mb-3">Your Next Steps:</h4>
                                <ul className="space-y-2 text-sm text-slate-600">
                                    <li className="flex items-center gap-2"><i className="fas fa-check-circle text-emerald-500"></i> Explore your Dashboard</li>
                                    <li className="flex items-center gap-2"><i className="fas fa-check-circle text-emerald-500"></i> Register your first Lead</li>
                                    <li className="flex items-center gap-2"><i className="fas fa-check-circle text-emerald-500"></i> Complete "Sales Mastery" training</li>
                                </ul>
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer Navigation */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between">
                    <button 
                        onClick={handleBack}
                        disabled={step === 1 || step === 4}
                        className={`px-6 py-3 rounded-xl font-bold text-sm transition-colors ${step === 1 || step === 4 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-200'}`}
                    >
                        Back
                    </button>
                    <button 
                        onClick={handleNext}
                        disabled={isLoading || (step === 3 && availableManagers.length > 1 && !selectedManagerId)}
                        className={`px-8 py-3 bg-[#02275A] text-white font-bold rounded-xl shadow-lg hover:bg-[#02275A]/90 transition-all active:scale-95 flex items-center gap-2 ${isLoading || (step === 3 && availableManagers.length > 1 && !selectedManagerId) ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? (
                            <>Setting up <i className="fas fa-circle-notch fa-spin"></i></>
                        ) : (
                            <>{step === 4 ? 'Go to Dashboard' : (step === 3 && availableManagers.length > 1 ? 'Confirm Manager' : 'Next Step')}</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OnboardingView;
