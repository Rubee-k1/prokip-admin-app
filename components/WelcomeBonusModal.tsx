
import React from 'react';

interface WelcomeBonusModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const WelcomeBonusModal: React.FC<WelcomeBonusModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden flex flex-col transform transition-all scale-100">
                
                {/* Header */}
                <div className="bg-[#02275A] p-6 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <i className="fas fa-gift text-8xl text-white"></i>
                    </div>
                    <div className="relative z-10">
                        <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm border border-white/20 text-2xl shadow-lg">
                            🎁
                        </div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Challenge Unlocked!</h2>
                        <p className="text-blue-200 text-xs mt-1 font-medium uppercase tracking-widest">Fast-Track Program</p>
                    </div>
                </div>

                <div className="p-6 md:p-8">
                    <div className="text-center mb-8">
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Welcome to Prokip! You have been selected for the <strong className="text-[#02275A]">New Agent Fast-Track</strong>. 
                            Complete your <strong className="text-[#02275A]">first sale within 14 days</strong> to unlock your exclusive welcome package.
                        </p>
                    </div>

                    {/* Reward Cards */}
                    <div className="grid grid-cols-1 gap-3 mb-8">
                        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-amber-50 to-white border border-amber-100 rounded-xl shadow-sm">
                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-lg shadow-sm shrink-0">
                                <i className="fas fa-coins"></i>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-800 text-sm">60% Commission + ₦20k</h4>
                                <p className="text-xs text-slate-500">Huge earnings on your first deal</p>
                            </div>
                            <i className="fas fa-check-circle text-amber-500 opacity-50"></i>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-50 to-white border border-indigo-100 rounded-xl shadow-sm">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-lg shadow-sm shrink-0">
                                <i className="fas fa-box-open"></i>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-800 text-sm">Official Starter Kit</h4>
                                <p className="text-xs text-slate-500">Branded T-Shirt & Staff ID Card</p>
                            </div>
                            <i className="fas fa-check-circle text-indigo-500 opacity-50"></i>
                        </div>
                    </div>

                    {/* Footer / Action */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 py-2 rounded-lg border border-slate-100">
                            <i className="fas fa-hourglass-half text-rose-500"></i>
                            <span>Time starts now: 14 Days Remaining</span>
                        </div>

                        <button 
                            onClick={onClose}
                            className="w-full py-3.5 bg-[#02275A] text-white font-bold rounded-xl shadow-lg hover:bg-[#02275A]/90 transition-all transform active:scale-95 flex items-center justify-center gap-2 text-sm"
                        >
                            <span>Accept Challenge</span>
                            <i className="fas fa-arrow-right"></i>
                        </button>
                        
                        <p className="text-center text-[10px] text-slate-400">
                            * Rewards are processed within 24 hours of sale verification.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomeBonusModal;
