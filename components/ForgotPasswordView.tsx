import React, { useState } from 'react';
import { useAlert } from '../contexts/AlertContext';

interface ForgotPasswordViewProps {
    onBack: () => void;
    onPasswordResetSuccess: () => void;
}

const ForgotPasswordView: React.FC<ForgotPasswordViewProps> = ({ onBack, onPasswordResetSuccess }) => {
    const { showError, showSuccess, showInfo } = useAlert();
    const [step, setStep] = useState<'email' | 'otp' | 'newPassword' | 'success'>('email');
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [retryCount, setRetryCount] = useState(0);

    // Timer effect
    React.useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            showInfo(`Reset code sent to ${email}`);
            setStep('otp');
            setCountdown(60);
            setRetryCount(1);
        }, 1500);
    };

    const handleResend = () => {
        if (retryCount >= 3) {
            showError("Maximum resend attempts reached. Please try again later.");
            return;
        }
        if (countdown > 0) return;
        
        setRetryCount(prev => prev + 1);
        setCountdown(60);
        showInfo("Code resent.");
    };

    const handleOtpSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        if(otp.length < 4) {
            showError("Please enter a valid 4-digit code.");
            setIsLoading(false);
            return;
        }
        if (otp === '0000') {
             showError("Invalid code entered.");
             setIsLoading(false);
             return;
        }
        setTimeout(() => {
            setIsLoading(false);
            showSuccess("Code verified successfully.");
            setStep('newPassword');
        }, 1500);
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(newPassword !== confirmPassword) {
            showError("Passwords do not match.");
            return;
        }
        if(newPassword.length < 6) {
             showError("Password must be at least 6 characters.");
             return;
        }
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setStep('success');
            showSuccess("Your password has been reset!");
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100 relative">
                 {/* Back Button */}
                 {step !== 'success' && (
                    <button onClick={step === 'email' ? onBack : () => setStep(step === 'otp' ? 'email' : 'otp')} className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 transition-colors">
                        <i className="fas fa-arrow-left"></i>
                    </button>
                 )}

                 {/* Step 1: Email */}
                 {step === 'email' && (
                    <>
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4 border-4 border-blue-100">
                                <i className="fas fa-key"></i>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">Forgot Password?</h2>
                            <p className="text-slate-500 text-sm mt-3 leading-relaxed">
                                Enter your email address and we'll send you a code to reset your password.
                            </p>
                        </div>
                        <form onSubmit={handleEmailSubmit} className="space-y-6">
                             <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Email Address</label>
                                <input 
                                    type="email" 
                                    required 
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#02275A]" 
                                    placeholder="agent@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className="w-full py-3.5 bg-[#02275A] text-white font-bold rounded-xl shadow-lg hover:bg-[#02275A]/90 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {isLoading ? <i className="fas fa-circle-notch fa-spin"></i> : 'Send Reset Code'}
                            </button>
                        </form>
                    </>
                 )}

                 {/* Step 2: OTP */}
                 {step === 'otp' && (
                    <>
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-slate-900">Enter Code</h2>
                            <p className="text-slate-500 text-sm mt-3">
                                We sent a 4-digit code to <span className="font-bold text-slate-800">{email}</span>
                            </p>
                        </div>
                        <form onSubmit={handleOtpSubmit} className="space-y-6">
                            <div>
                                <input 
                                    type="text" 
                                    maxLength={4}
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-3xl font-bold tracking-[0.5em] text-slate-800 outline-none focus:border-[#02275A] focus:bg-white transition-all" 
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                                    required
                                    autoFocus
                                />
                                <div className="flex justify-end mt-2">
                                    <button 
                                        type="button" 
                                        onClick={handleResend} 
                                        disabled={countdown > 0}
                                        className="text-xs font-bold text-[#02275A] hover:underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
                                    >
                                        {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                                    </button>
                                </div>
                            </div>
                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className="w-full py-3.5 bg-[#02275A] text-white font-bold rounded-xl shadow-lg hover:bg-[#02275A]/90 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {isLoading ? <i className="fas fa-circle-notch fa-spin"></i> : 'Verify Code'}
                            </button>
                        </form>
                    </>
                 )}

                 {/* Step 3: New Password */}
                 {step === 'newPassword' && (
                    <>
                         <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-slate-900">Reset Password</h2>
                            <p className="text-slate-500 text-sm mt-3">
                                Create a new strong password for your account.
                            </p>
                        </div>
                        <form onSubmit={handlePasswordSubmit} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">New Password</label>
                                <div className="relative">
                                    <input 
                                        type={showPassword ? "text" : "password"}
                                        required 
                                        className="w-full p-3 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#02275A]" 
                                        placeholder="Min 8 characters"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                                    >
                                        <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Confirm Password</label>
                                <input 
                                    type="password"
                                    required 
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#02275A]" 
                                    placeholder="Re-enter password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className="w-full py-3.5 bg-[#02275A] text-white font-bold rounded-xl shadow-lg hover:bg-[#02275A]/90 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-70"
                            >
                                {isLoading ? <i className="fas fa-circle-notch fa-spin"></i> : 'Reset Password'}
                            </button>
                        </form>
                    </>
                 )}

                 {/* Step 4: Success */}
                 {step === 'success' && (
                    <div className="text-center py-4">
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-4xl text-emerald-600 mx-auto mb-6 shadow-lg shadow-emerald-200 animate-bounce">
                            <i className="fas fa-check"></i>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Password Reset!</h2>
                        <p className="text-slate-500 mb-8 max-w-xs mx-auto text-sm">
                            Your password has been successfully updated. You can now log in with your new credentials.
                        </p>
                        <button 
                            onClick={onPasswordResetSuccess}
                            className="w-full py-3.5 bg-[#02275A] text-white font-bold rounded-xl shadow-lg hover:bg-[#02275A]/90 transition-all"
                        >
                            Back to Login
                        </button>
                    </div>
                 )}
            </div>
        </div>
    );
};

export default ForgotPasswordView;