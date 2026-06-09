
import React, { useState } from 'react';
import { useAlert } from '../contexts/AlertContext';
import { UserRole } from '../types';

interface LoginViewProps {
    onLoginSuccess: (role: UserRole, email: string) => void;
    onBack: () => void;
    onForgotPassword: () => void;
    onSignUpClick?: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, onBack, onForgotPassword, onSignUpClick }) => {
    const { showError, showSuccess } = useAlert();
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        // Admin Login Check
        if (email === 'admin@gmail.com' && password === '12345') {
            setTimeout(() => {
                setIsLoading(false);
                showSuccess("Welcome, Administrator!");
                onLoginSuccess('admin', email);
            }, 1500);
            return;
        }

        // Manager Login Check
        if (email === 'manager@gmail.com' && password === '12345') {
            setTimeout(() => {
                setIsLoading(false);
                showSuccess("Welcome, State Manager!");
                onLoginSuccess('manager', email);
            }, 1500);
            return;
        }

        // Team Lead Login Check
        if (email === 'teamlead@gmail.com' && password === '12345') {
            setTimeout(() => {
                setIsLoading(false);
                showSuccess("Welcome, Team Lead!");
                onLoginSuccess('team-lead', email);
            }, 1500);
            return;
        }

        // CX Head Login Check
        if (email === 'cx@gmail.com' && password === '12345') {
            setTimeout(() => {
                setIsLoading(false);
                showSuccess("Welcome, Head of CX!");
                onLoginSuccess('cx-head', email);
            }, 1500);
            return;
        }

        // Call Agent Login Check
        if (email === 'callagent@gmail.com' && password === '12345') {
            setTimeout(() => {
                setIsLoading(false);
                showSuccess("Welcome, Call Agent!");
                onLoginSuccess('call-agent', email);
            }, 1500);
            return;
        }

        // Sales Manager Login Check
        if (email === 'salesmanager@gmail.com' && password === '12345') {
            setTimeout(() => {
                setIsLoading(false);
                showSuccess("Welcome, Sales Manager!");
                onLoginSuccess('sales-manager', email);
            }, 1500);
            return;
        }

        // Support Staff Login Check
        if (email === 'support@gmail.com' && password === '12345') {
            setTimeout(() => {
                setIsLoading(false);
                showSuccess("Welcome, Support Team!");
                onLoginSuccess('support-staff', email);
            }, 1500);
            return;
        }

        // Finance Login Check
        if (email === 'finance@gmail.com' && password === '12345') {
            setTimeout(() => {
                setIsLoading(false);
                showSuccess("Welcome, Finance Team!");
                onLoginSuccess('finance', email);
            }, 1500);
            return;
        }

        // Marketing Manager Login Check
        if (email === 'marketing@gmail.com' && password === '12345') {
            setTimeout(() => {
                setIsLoading(false);
                showSuccess("Welcome, Marketing Manager!");
                onLoginSuccess('marketing-manager', email);
            }, 1500);
            return;
        }

        // Content Lead Login Check
        if (email === 'content@gmail.com' && password === '12345') {
            setTimeout(() => {
                setIsLoading(false);
                showSuccess("Welcome, Content Lead!");
                onLoginSuccess('content-lead', email);
            }, 1500);
            return;
        }

        // Customer Success Login Check
        if (email === 'customersuccess@gmail.com' && password === '12345') {
            setTimeout(() => {
                setIsLoading(false);
                showSuccess("Welcome, Customer Success Team!");
                onLoginSuccess('customer-success', email);
            }, 1500);
            return;
        }

        // Employee Login Check
        if (email === 'employee@gmail.com' && password === '12345') {
            setTimeout(() => {
                setIsLoading(false);
                showSuccess("Welcome, Employee!");
                onLoginSuccess('employee', email);
            }, 1500);
            return;
        }

        // Mock Agent Validation
        if (email.includes('error')) {
            setTimeout(() => {
                setIsLoading(false);
                showError("Invalid credentials. Please check your email and password.");
            }, 1000);
            return;
        }

        // Default Agent Login
        setTimeout(() => {
            setIsLoading(false);
            showSuccess(`Welcome back! Successfully logged in as ${email}`);
            onLoginSuccess('agent', email);
        }, 1500);
    };

    return (
        <div className="fixed inset-0 bg-slate-50 animate-fade-in overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-100/50 rounded-full blur-3xl"></div>
            </div>

            {/* Scrollable Content Container */}
            <div className="relative z-10 w-full h-full overflow-y-auto custom-scrollbar">
                <div className="min-h-full flex items-center justify-center p-4 py-12">
                    <div className="w-full max-w-lg md:max-w-3xl bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-9">
                        <div className="max-w-2xl mx-auto">
                            <div className="text-center mb-10">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl mb-2 shadow-sm border border-slate-50">
                                    <svg width="60" height="60" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect width="40" height="40" rx="12" fill="#02275A"/>
                                        <defs>
                                            <linearGradient id="login-gold-gradient" x1="13" y1="10" x2="28" y2="30" gradientUnits="userSpaceOnUse">
                                                <stop stopColor="#FFD700" />
                                                <stop offset="1" stopColor="#F59E0B" />
                                            </linearGradient>
                                        </defs>
                                        <path 
                                            d="M13 30V12H21C25 12 28 15 28 19C28 23 25 26 21 26H18" 
                                            stroke="url(#login-gold-gradient)" 
                                            strokeWidth="5" 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>
                                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Welcome Back</h2>
                                <p className="text-slate-500 text-sm md:text-base mt-2">Sign in to your dashboard</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Email Address</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                            <i className="fas fa-envelope"></i>
                                        </div>
                                        <input 
                                            type="email" 
                                            required
                                            className="block w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#02275A] focus:ring-1 focus:ring-[#02275A] transition-all"
                                            placeholder="agent@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                            <i className="fas fa-lock"></i>
                                        </div>
                                        <input 
                                            type={showPassword ? "text" : "password"}
                                            required
                                            className="block w-full pl-11 pr-11 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#02275A] focus:ring-1 focus:ring-[#02275A] transition-all"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <button 
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input 
                                            type="checkbox" 
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            className="w-4 h-4 rounded border-slate-300 text-[#02275A] focus:ring-[#02275A]"
                                        />
                                        <span className="text-sm font-bold text-slate-500 group-hover:text-slate-700 transition-colors">Remember me</span>
                                    </label>
                                    <button 
                                        type="button" 
                                        onClick={onForgotPassword}
                                        className="text-sm font-bold text-[#02275A] hover:text-[#02275A]/80 transition-colors"
                                    >
                                        Forgot password?
                                    </button>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={isLoading}
                                    className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-base font-bold text-white bg-[#02275A] hover:bg-[#02275A]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#02275A] transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mt-6"
                                >
                                    {isLoading ? <i className="fas fa-circle-notch fa-spin"></i> : 'Sign In'}
                                </button>
                            </form>

                            <div className="mt-10 text-center">
                                <p className="text-slate-500">
                                    Don't have an account?{' '}
                                    <button onClick={onSignUpClick} className="font-bold text-[#02275A] hover:underline ml-1">
                                        Create Account
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

export default LoginView;
