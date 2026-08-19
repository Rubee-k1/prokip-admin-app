import React, { useState, useEffect } from 'react';
import { Business } from '../types';

interface AddExtraModalProps {
    isOpen: boolean;
    onClose: () => void;
    business: Business | null;
}

const AddExtraModal: React.FC<AddExtraModalProps> = ({ isOpen, onClose, business }) => {
    const [counts, setCounts] = useState({
        users: 0,
        locations: 0,
        products: 0
    });

    // Reset counts when modal opens
    useEffect(() => {
        if (isOpen) {
            setCounts({ users: 0, locations: 0, products: 0 });
        }
    }, [isOpen]);

    if (!isOpen || !business) return null;

    const prices = {
        users: 5000,
        locations: 25000,
        products: 2000 // Per 1000 products
    };

    const updateCount = (type: keyof typeof counts, delta: number) => {
        setCounts(prev => ({
            ...prev,
            [type]: Math.max(0, prev[type] + delta)
        }));
    };

    const totalCost = (counts.users * prices.users) + (counts.locations * prices.locations) + (counts.products * prices.products);

    const handleConfirm = () => {
        alert(`Invoice generated for ₦${totalCost.toLocaleString()}. Sent to ${business.email}`);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">Add Extras</h3>
                        <p className="text-xs text-slate-500">Managing for <span className="font-bold text-[#02275A]">{business.name}</span></p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors">
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <div className="space-y-4">
                        {/* Extra User */}
                        <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-[#02275A]/30 transition-colors bg-white">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-[#02275A]/10 text-[#02275A] flex items-center justify-center text-xl">
                                    <i className="fas fa-user-plus"></i>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-sm">Extra User License</h4>
                                    <p className="text-xs text-slate-500">₦{prices.users.toLocaleString()} / user</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-1">
                                <button 
                                    onClick={() => updateCount('users', -1)}
                                    className="w-8 h-8 rounded bg-white shadow-sm border border-slate-200 text-slate-600 hover:text-[#02275A] disabled:opacity-50"
                                    disabled={counts.users === 0}
                                >-</button>
                                <span className="font-bold text-slate-800 w-4 text-center">{counts.users}</span>
                                <button 
                                    onClick={() => updateCount('users', 1)}
                                    className="w-8 h-8 rounded bg-[#02275A] text-white shadow-sm hover:bg-[#02275A]/90"
                                >+</button>
                            </div>
                        </div>

                        {/* Extra Location */}
                        <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-[#02275A]/30 transition-colors bg-white">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
                                    <i className="fas fa-store"></i>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-sm">Additional Location</h4>
                                    <p className="text-xs text-slate-500">₦{prices.locations.toLocaleString()} / location</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-1">
                                <button 
                                    onClick={() => updateCount('locations', -1)}
                                    className="w-8 h-8 rounded bg-white shadow-sm border border-slate-200 text-slate-600 hover:text-[#02275A] disabled:opacity-50"
                                    disabled={counts.locations === 0}
                                >-</button>
                                <span className="font-bold text-slate-800 w-4 text-center">{counts.locations}</span>
                                <button 
                                    onClick={() => updateCount('locations', 1)}
                                    className="w-8 h-8 rounded bg-[#02275A] text-white shadow-sm hover:bg-[#02275A]/90"
                                >+</button>
                            </div>
                        </div>

                        {/* Product Volume */}
                        <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-[#02275A]/30 transition-colors bg-white">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-xl">
                                    <i className="fas fa-boxes"></i>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-sm">Product Volume</h4>
                                    <p className="text-xs text-slate-500">₦{prices.products.toLocaleString()} / 1,000 items</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-1">
                                <button 
                                    onClick={() => updateCount('products', -1)}
                                    className="w-8 h-8 rounded bg-white shadow-sm border border-slate-200 text-slate-600 hover:text-[#02275A] disabled:opacity-50"
                                    disabled={counts.products === 0}
                                >-</button>
                                <span className="font-bold text-slate-800 w-4 text-center">{counts.products}</span>
                                <button 
                                    onClick={() => updateCount('products', 1)}
                                    className="w-8 h-8 rounded bg-[#02275A] text-white shadow-sm hover:bg-[#02275A]/90"
                                >+</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Summary */}
                <div className="bg-slate-50 p-6 border-t border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-bold text-slate-500 uppercase">Total Amount</span>
                        <span className="text-2xl font-bold text-slate-800">₦{totalCost.toLocaleString()}</span>
                    </div>
                    <button 
                        onClick={handleConfirm}
                        disabled={totalCost === 0}
                        className="w-full py-3 bg-[#02275A] text-white font-bold rounded-xl shadow-lg hover:bg-[#02275A]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <i className="fas fa-file-invoice-dollar"></i> Generate Invoice
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddExtraModal;