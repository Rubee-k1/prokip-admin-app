import React, { useState } from 'react';
import { useAlert } from '../contexts/AlertContext';

interface WithdrawalModalProps {
    isOpen: boolean;
    onClose: () => void;
    availableBalance: string;
    onWithdrawSuccess?: (amount: number) => void;
}

const WithdrawalModal: React.FC<WithdrawalModalProps> = ({ isOpen, onClose, availableBalance, onWithdrawSuccess }) => {
    const { showError, showSuccess } = useAlert();
    const [amount, setAmount] = useState('');
    const [password, setPassword] = useState('');
    const [step, setStep] = useState<'input' | 'success'>('input');
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const numericBalance = parseInt(availableBalance.replace(/[^0-9]/g, ''));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const withdrawAmount = parseInt(amount.replace(/[^0-9]/g, ''));
        if (!withdrawAmount || withdrawAmount <= 0) {
            showError("Please enter a valid amount greater than 0.");
            return;
        }
        if (withdrawAmount > numericBalance) {
            showError(`Insufficient funds. Your balance is ₦${availableBalance}`);
            return;
        }

        if (password.length < 6) {
             showError("Please enter your correct password to confirm.");
             return;
        }

        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            setStep('success');
            if (onWithdrawSuccess) {
                onWithdrawSuccess(withdrawAmount);
            }
            showSuccess("Withdrawal request initiated successfully.");
        }, 1500);
    };

    const handleClose = () => {
        setStep('input');
        setAmount('');
        setPassword('');
        onClose();
    };

    if (step === 'success') {
        return (
             <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                <div className="bg-white rounded-2xl w-full max-w-sm p-8 shadow-2xl flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center text-3xl mb-4">
                        <i className="fas fa-check"></i>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Withdrawal Initiated</h3>
                    <p className="text-sm text-slate-500 mb-6">Your request for ₦{parseInt(amount).toLocaleString()} has been sent for processing. You will receive funds shortly.</p>
                    <button onClick={handleClose} className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors">
                        Back to Earnings
                    </button>
                </div>
             </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">Withdraw Funds</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><i className="fas fa-times"></i></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Amount Input */}
                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Amount to Withdraw</label>
                            <span className="text-xs text-slate-500">Available: <span className="font-bold text-emerald-600">₦{availableBalance}</span></span>
                        </div>
                        <div className="relative">
                            <span className="absolute left-4 top-3.5 text-slate-400 font-bold">₦</span>
                            <input 
                                type="number" 
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full pl-10 pr-16 py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold text-slate-800 focus:outline-none focus:border-indigo-500 transition-colors"
                                placeholder="0.00"
                                required
                            />
                            <button 
                                type="button"
                                onClick={() => setAmount(numericBalance.toString())}
                                className="absolute right-2 top-2 px-3 py-1.5 bg-indigo-100 text-indigo-600 text-xs font-bold rounded-lg hover:bg-indigo-200"
                            >
                                MAX
                            </button>
                        </div>
                    </div>

                    {/* Password Confirm */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Enter Password to Confirm</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div className="pt-2">
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full py-3.5 bg-amber-500 text-indigo-900 font-bold rounded-xl shadow-lg hover:bg-amber-400 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <><i className="fas fa-circle-notch fa-spin"></i> Processing...</>
                            ) : (
                                <><i className="fas fa-money-bill-wave"></i> Confirm Withdrawal</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WithdrawalModal;