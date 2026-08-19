
import React, { useState, useEffect } from 'react';
import { useAlert } from '../contexts/AlertContext';

interface SignUpViewProps {
    onSignUpSuccess: () => void;
    onLoginClick?: () => void;
}

const SignUpView: React.FC<SignUpViewProps> = ({ onSignUpSuccess, onLoginClick }) => {
    const { showError, showSuccess, showInfo } = useAlert();
    const [step, setStep] = useState<'details' | 'verify-email' | 'verify-phone'>('details');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState('Nigeria');
    const [countryCode, setCountryCode] = useState('+234');
    const [showPassword, setShowPassword] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: ''
    });

    // OTP State
    const [otpData, setOtpData] = useState({
        email: '',
        phone: ''
    });

    // Verification Throttling State
    const [retryCount, setRetryCount] = useState({ email: 0, sms: 0, whatsapp: 0 });
    const [countdowns, setCountdowns] = useState({ email: 0, sms: 0, whatsapp: 0 });
    const [activePhoneMethod, setActivePhoneMethod] = useState<'sms' | 'whatsapp'>('sms');
    const [isEditingPhone, setIsEditingPhone] = useState(false);
    const [tempPhone, setTempPhone] = useState('');

    const countries = ['Nigeria', 'Ghana', 'Kenya', 'Rwanda', 'Uganda', 'South Africa', 'United Kingdom', 'United States', 'Canada', 'India'];

    const countryCodes = [
        { code: '+234', country: 'NG' },
        { code: '+233', country: 'GH' },
        { code: '+254', country: 'KE' },
        { code: '+250', country: 'RW' },
        { code: '+256', country: 'UG' },
        { code: '+27', country: 'ZA' },
        { code: '+44', country: 'UK' },
        { code: '+1', country: 'US' },
        { code: '+1', country: 'CA' },
        { code: '+91', country: 'IN' }
    ];

    const codeMap: { [key: string]: string } = {
        'Nigeria': '+234',
        'Ghana': '+233',
        'Kenya': '+254',
        'Rwanda': '+250',
        'Uganda': '+256',
        'South Africa': '+27',
        'United Kingdom': '+44',
        'United States': '+1',
        'Canada': '+1',
        'India': '+91'
    };

    // Auto-update country code when country changes
    useEffect(() => {
        if (codeMap[selectedCountry]) {
            setCountryCode(codeMap[selectedCountry]);
        }
    }, [selectedCountry]);

    // Countdown Timer Effect
    useEffect(() => {
        const timer = setInterval(() => {
            setCountdowns(prev => ({
                email: prev.email > 0 ? prev.email - 1 : 0,
                sms: prev.sms > 0 ? prev.sms - 1 : 0,
                whatsapp: prev.whatsapp > 0 ? prev.whatsapp - 1 : 0
            }));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleDetailsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const password = formData.password;

        if (password.length < 6) {
            showError("Password must be at least 6 characters long.");
            return;
        }

        if (!/[A-Z]/.test(password)) {
            showError("Password must contain at least one uppercase letter.");
            return;
        }

        if (!/[0-9]/.test(password)) {
            showError("Password must contain at least one number.");
            return;
        }

        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            showError("Password must contain at least one special character.");
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setStep('verify-email');
            setCountdowns(prev => ({ ...prev, email: 60 })); // Start countdown
            setRetryCount(prev => ({ ...prev, email: 1 })); // Initial attempt
            showInfo("Verification code sent to your email.");
        }, 1500);
    };

    const handleEmailVerifySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        if (otpData.email.length < 4 || otpData.email === '0000') {
            showError("Invalid email verification code.");
            setIsLoading(false);
            return;
        }
        setTimeout(() => {
            setIsLoading(false);
            showSuccess("Email verified!");
            setStep('verify-phone');
            setCountdowns(prev => ({ ...prev, sms: 60 })); // Start countdown
            setRetryCount(prev => ({ ...prev, sms: 1 })); // Initial attempt
            showInfo("Verification code sent to your phone.");
        }, 1000);
    };

    const handlePhoneVerifySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        if (otpData.phone.length < 4 || otpData.phone === '0000') {
            showError(`Invalid ${activePhoneMethod === 'whatsapp' ? 'WhatsApp' : 'SMS'} verification code.`);
            setIsLoading(false);
            return;
        }
        setTimeout(() => {
            setIsLoading(false);
            showSuccess("Account verified successfully!");
            onSignUpSuccess();
        }, 1500);
    };

    const handleResend = (method: 'email' | 'sms' | 'whatsapp') => {
        if (retryCount[method] >= 3) {
            showError(`Maximum ${method === 'sms' ? 'SMS' : method === 'whatsapp' ? 'WhatsApp' : 'email'} verification attempts reached. Please contact support.`);
            return;
        }

        if (countdowns[method] > 0) {
            return; 
        }

        // Increment retry count
        setRetryCount(prev => ({ ...prev, [method]: prev[method] + 1 }));
        
        // Start countdown
        setCountdowns(prev => ({ ...prev, [method]: 60 }));

        if (method === 'whatsapp') {
             setActivePhoneMethod('whatsapp');
             showInfo(`Verification code sent via WhatsApp to ${countryCode} ${formData.phone}`);
        } else if (method === 'sms') {
             setActivePhoneMethod('sms');
             showInfo(`Verification code sent via SMS to ${countryCode} ${formData.phone}`);
        } else {
             showInfo(`Verification code sent to ${formData.email}`);
        }
    };

    const handleUpdatePhone = () => {
        if (tempPhone.length < 10) {
            showError("Please enter a valid phone number");
            return;
        }
        setFormData(prev => ({ ...prev, phone: tempPhone }));
        setIsEditingPhone(false);
        // Reset verification state for phone
        setRetryCount(prev => ({ ...prev, sms: 1, whatsapp: 0 }));
        setCountdowns(prev => ({ ...prev, sms: 60, whatsapp: 0 }));
        setActivePhoneMethod('sms');
        showSuccess("Phone number updated. Sending new code...");
    };

    const startEditingPhone = () => {
        setTempPhone(formData.phone);
        setIsEditingPhone(true);
    };

    return (
        <div className="fixed inset-0 bg-slate-50 animate-fade-in overflow-hidden">
             {/* Background Decorations */}
            <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/50 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-3xl"></div>
            </div>

            {/* Scrollable Content Container */}
            <div className="relative z-10 w-full h-full overflow-y-auto custom-scrollbar">
                <div className="min-h-full flex items-center justify-center p-4 py-12">
                    <div className="w-full max-w-lg md:max-w-3xl bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-9">
                        <div className="max-w-3xl mx-auto">
                            <div className="text-center mb-10">
                                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
                                    {step === 'details' ? 'Create Account' : 'Verification'}
                                </h2>
                                <p className="text-slate-500 text-sm md:text-base mt-2">
                                    {step === 'details' ? 'Join Prokip to start earning commissions' : 'Secure your account'}
                                </p>
                            </div>

                            {/* Progress Indicators */}
                            <div className="flex justify-center mb-10 gap-3">
                                <div className={`h-2 w-16 md:w-24 rounded-full transition-colors ${step === 'details' ? 'bg-[#02275A]' : 'bg-emerald-500'}`}></div>
                                <div className={`h-2 w-16 md:w-24 rounded-full transition-colors ${step === 'verify-email' ? 'bg-[#02275A]' : step === 'verify-phone' ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                                <div className={`h-2 w-16 md:w-24 rounded-full transition-colors ${step === 'verify-phone' ? 'bg-[#02275A]' : 'bg-slate-200'}`}></div>
                            </div>

                            {step === 'details' && (
                                <form onSubmit={handleDetailsSubmit} className="space-y-6 animate-fade-in">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-xs font-bold text-slate-700 uppercase mb-2 block">First Name</label>
                                            <input 
                                                type="text" 
                                                required 
                                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-[#02275A] focus:ring-1 focus:ring-[#02275A] transition-all" 
                                                placeholder="John"
                                                value={formData.firstName}
                                                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-700 uppercase mb-2 block">Last Name</label>
                                            <input 
                                                type="text" 
                                                required 
                                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-[#02275A] focus:ring-1 focus:ring-[#02275A] transition-all" 
                                                placeholder="Doe"
                                                value={formData.lastName}
                                                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-slate-700 uppercase mb-2 block">Email Address</label>
                                        <input 
                                            type="email" 
                                            required 
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-[#02275A] focus:ring-1 focus:ring-[#02275A] transition-all" 
                                            placeholder="agent@example.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="col-span-1">
                                            <label className="text-xs font-bold text-slate-700 uppercase mb-2 block">Country</label>
                                            <div className="relative">
                                                <select 
                                                    value={selectedCountry}
                                                    onChange={(e) => setSelectedCountry(e.target.value)}
                                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-[#02275A] focus:ring-1 focus:ring-[#02275A] appearance-none pr-8 truncate transition-all"
                                                >
                                                    {countries.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                    <i className="fas fa-chevron-down text-xs"></i>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="text-xs font-bold text-slate-700 uppercase mb-2 block">Phone Number</label>
                                            <div className="flex">
                                                <div className="relative">
                                                    <select
                                                        value={countryCode}
                                                        onChange={(e) => setCountryCode(e.target.value)}
                                                        className="h-full pl-4 pr-7 bg-slate-50 border border-r-0 border-slate-200 rounded-l-xl text-sm font-bold text-slate-700 focus:bg-white focus:outline-none focus:border-[#02275A] focus:ring-1 focus:ring-[#02275A] z-10 appearance-none transition-all cursor-pointer"
                                                    >
                                                        {countryCodes.map((c, idx) => (
                                                            <option key={`${c.code}-${c.country}-${idx}`} value={c.code}>{c.code}</option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 z-20">
                                                        <i className="fas fa-chevron-down text-[10px]"></i>
                                                    </div>
                                                </div>
                                                <input 
                                                    type="tel" 
                                                    required 
                                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-r-xl text-sm focus:bg-white focus:outline-none focus:border-[#02275A] focus:ring-1 focus:ring-[#02275A] transition-all -ml-[1px]" 
                                                    placeholder="8012345678"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-slate-700 uppercase mb-2 block">Password</label>
                                        <div className="relative">
                                            <input 
                                                type={showPassword ? "text" : "password"}
                                                required 
                                                className="w-full p-4 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-[#02275A] focus:ring-1 focus:ring-[#02275A] transition-all" 
                                                placeholder="Min 6 characters"
                                                value={formData.password}
                                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-4 text-slate-400 hover:text-slate-600 focus:outline-none"
                                            >
                                                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 pt-2">
                                        <input type="checkbox" required className="mt-1 w-4 h-4 rounded text-[#02275A] focus:ring-[#02275A]" />
                                        <p className="text-sm text-slate-500 leading-tight">
                                            I agree to the <a href="#" className="text-[#02275A] font-bold hover:underline">Terms of Service</a> and <a href="#" className="text-[#02275A] font-bold hover:underline">Privacy Policy</a>.
                                        </p>
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={isLoading}
                                        className="w-full py-4 bg-[#02275A] text-white font-bold rounded-xl shadow-lg hover:bg-[#02275A]/90 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none text-base"
                                    >
                                        {isLoading ? <i className="fas fa-circle-notch fa-spin"></i> : 'Create Account'}
                                    </button>
                                </form>
                            )}

                            {step !== 'details' && (
                                <div className="animate-fade-in space-y-8 max-w-md mx-auto">
                                    <div className={`p-5 rounded-2xl border flex gap-4 ${step === 'verify-email' ? 'bg-blue-50 border-blue-100 text-blue-800' : 'bg-emerald-50 border-emerald-100 text-emerald-800'}`}>
                                        <div className="bg-white/50 p-2 rounded-lg h-fit">
                                            <i className={`fas ${step === 'verify-email' ? 'fa-envelope' : activePhoneMethod === 'whatsapp' ? 'fa-brands fa-whatsapp' : 'fa-mobile-alt'} text-xl`}></i>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm leading-relaxed pt-1">
                                                {step === 'verify-email' 
                                                    ? `We've sent a 4-digit code to ${formData.email}. Please enter it below to verify your email address.` 
                                                    : isEditingPhone 
                                                        ? 'Update your phone number below.'
                                                        : `Almost there! Enter the 4-digit code sent to ${countryCode} ${formData.phone} via ${activePhoneMethod === 'whatsapp' ? 'WhatsApp' : 'SMS'}.`}
                                            </p>
                                            {step === 'verify-phone' && !isEditingPhone && (
                                                <button 
                                                    onClick={startEditingPhone}
                                                    className="text-xs font-bold underline mt-2 hover:text-emerald-900"
                                                >
                                                    Wrong number? Update here
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {isEditingPhone ? (
                                        <div className="animate-fade-in">
                                            <label className="text-xs font-bold text-slate-700 uppercase mb-2 block">Update Phone Number</label>
                                            <div className="flex gap-2">
                                                <input 
                                                    type="tel" 
                                                    className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-[#02275A] focus:ring-1 focus:ring-[#02275A] transition-all" 
                                                    value={tempPhone}
                                                    onChange={(e) => setTempPhone(e.target.value)}
                                                    placeholder="Enter new number"
                                                />
                                                <button 
                                                    onClick={handleUpdatePhone}
                                                    className="px-6 bg-[#02275A] text-white font-bold rounded-xl hover:bg-[#02275A]/90 transition-all"
                                                >
                                                    Save
                                                </button>
                                                <button 
                                                    onClick={() => setIsEditingPhone(false)}
                                                    className="px-4 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <form onSubmit={step === 'verify-email' ? handleEmailVerifySubmit : handlePhoneVerifySubmit}>
                                            <div className="mb-8">
                                                <div className="flex justify-between mb-3 items-center">
                                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                                        {step === 'verify-email' ? 'Email Code' : activePhoneMethod === 'whatsapp' ? 'WhatsApp Code' : 'SMS Code'}
                                                    </label>
                                                    <div className="flex flex-col items-end">
                                                        <button 
                                                            type="button" 
                                                            disabled={countdowns[step === 'verify-email' ? 'email' : activePhoneMethod] > 0}
                                                            onClick={() => handleResend(step === 'verify-email' ? 'email' : activePhoneMethod)} 
                                                            className="text-xs font-bold text-[#02275A] hover:underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
                                                        >
                                                            {countdowns[step === 'verify-email' ? 'email' : activePhoneMethod] > 0 
                                                                ? `Resend in ${countdowns[step === 'verify-email' ? 'email' : activePhoneMethod]}s` 
                                                                : 'Resend Code'}
                                                        </button>
                                                        
                                                        {step === 'verify-phone' && activePhoneMethod === 'sms' && (
                                                            <button 
                                                                type="button"
                                                                onClick={() => handleResend('whatsapp')}
                                                                disabled={countdowns.whatsapp > 0}
                                                                className="text-[10px] font-bold text-emerald-600 hover:underline mt-1 flex items-center gap-1 disabled:opacity-50"
                                                            >
                                                                <i className="fa-brands fa-whatsapp"></i> Didn't receive? Try WhatsApp
                                                            </button>
                                                        )}
                                                        
                                                        {step === 'verify-phone' && activePhoneMethod === 'whatsapp' && (
                                                            <button 
                                                                type="button"
                                                                onClick={() => handleResend('sms')}
                                                                disabled={countdowns.sms > 0}
                                                                className="text-[10px] font-bold text-slate-500 hover:underline mt-1 disabled:opacity-50"
                                                            >
                                                                Try SMS instead
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                <input 
                                                    type="text" 
                                                    maxLength={4}
                                                    className="w-full p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center text-4xl font-bold tracking-[0.5em] text-slate-800 focus:bg-white focus:outline-none focus:border-[#02275A] focus:ring-1 focus:ring-[#02275A] transition-all" 
                                                    value={step === 'verify-email' ? otpData.email : otpData.phone}
                                                    onChange={(e) => setOtpData({
                                                        ...otpData, 
                                                        [step === 'verify-email' ? 'email' : 'phone']: e.target.value.replace(/[^0-9]/g, '')
                                                    })}
                                                    required
                                                    placeholder="0000"
                                                    autoFocus
                                                />
                                                {step === 'verify-phone' && (
                                                    <p className="text-xs text-center mt-4 text-slate-400">
                                                        {retryCount.sms + retryCount.whatsapp}/3 attempts used
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex gap-4">
                                                <button 
                                                    type="button" 
                                                    onClick={() => setStep(step === 'verify-email' ? 'details' : 'verify-email')}
                                                    className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all"
                                                >
                                                    Back
                                                </button>
                                                <button 
                                                    type="submit" 
                                                    disabled={isLoading}
                                                    className="flex-[2] py-4 bg-[#02275A] text-white font-bold rounded-xl shadow-lg hover:bg-[#02275A]/90 transition-all disabled:opacity-70 text-base"
                                                >
                                                    {isLoading ? <i className="fas fa-circle-notch fa-spin"></i> : (step === 'verify-email' ? 'Verify Email' : 'Finish Setup')}
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            )}

                            <div className="mt-10 text-center">
                                <p className="text-slate-500">
                                    Already have an account?{' '}
                                    <button onClick={onLoginClick} className="font-bold text-[#02275A] hover:underline ml-1">
                                        Log in
                                    </button>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUpView;
