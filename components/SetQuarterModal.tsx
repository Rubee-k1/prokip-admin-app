import React, { useState } from 'react';
import { useAlert } from '../contexts/AlertContext';

interface SetQuarterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (data: any) => void;
}

const SetQuarterModal: React.FC<SetQuarterModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { showSuccess, showError } = useAlert();
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!navigator.onLine) {
            showError("Cannot save quarter. No internet connection.");
            return;
        }

        setIsLoading(true);

        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        
        const quarterData = {
            quarterName: formData.get('quarterName'),
            startDate: formData.get('startDate'),
            endDate: formData.get('endDate')
        };

        setTimeout(() => {
            setIsLoading(false);
            showSuccess("Quarter set successfully!");
            onSuccess(quarterData); 
        }, 1000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative">
                <div className="bg-white/95 backdrop-blur-sm border-b border-slate-100 p-4 flex justify-between items-center rounded-t-2xl">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Set Quarter Period</h3>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center">
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-600 block mb-1">Quarter Name *</label>
                        <input required name="quarterName" type="text" placeholder="e.g. Q2 2026" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#02275A]" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-600 block mb-1">Start Date *</label>
                        <input required name="startDate" type="date" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#02275A]" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-600 block mb-1">End Date *</label>
                        <input required name="endDate" type="date" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#02275A]" />
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                        <button type="button" onClick={onClose} disabled={isLoading} className="px-5 py-2.5 rounded-xl text-slate-500 font-bold text-sm bg-slate-100 hover:bg-slate-200 disabled:opacity-50">Cancel</button>
                        <button type="submit" disabled={isLoading} className="px-6 py-2.5 rounded-xl bg-[#02275A] text-white font-bold text-sm shadow-md hover:bg-[#02275A]/90 transition-colors flex items-center gap-2 disabled:opacity-70">
                            {isLoading && <i className="fas fa-circle-notch fa-spin"></i>}
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SetQuarterModal;
