import React, { useState } from 'react';
import { useAlert } from '../contexts/AlertContext';

interface AddGradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (data: any) => void;
}

const AddGradeModal: React.FC<AddGradeModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { showSuccess, showError } = useAlert();
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!navigator.onLine) {
            showError("Cannot save grade. No internet connection.");
            return;
        }

        setIsLoading(true);

        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        
        const gradeData = {
            grade: formData.get('grade'),
            title: formData.get('title'),
            minPoints: formData.get('minPoints'),
            maxPoints: formData.get('maxPoints'),
            description: formData.get('description'),
            reward: formData.get('reward'),
            consequence: formData.get('consequence')
        };

        setTimeout(() => {
            setIsLoading(false);
            showSuccess("Grade defined successfully!");
            onSuccess(gradeData); 
        }, 1000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
                <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-100 p-4 flex justify-between items-center z-10">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Add Grade Definition</h3>
                        <p className="text-xs text-slate-500">Define a new performance grade tier</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center">
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-600 block mb-1">Grade *</label>
                            <input required name="grade" type="text" placeholder="A+" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#02275A]" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-600 block mb-1">Title *</label>
                            <input required name="title" type="text" placeholder="e.g. Platinum" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#02275A]" />
                        </div>
                        
                        <div>
                            <label className="text-xs font-bold text-slate-600 block mb-1">Min Points *</label>
                            <input required name="minPoints" type="number" placeholder="105" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#02275A]" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-600 block mb-1">Max Points (empty = no cap)</label>
                            <input name="maxPoints" type="text" placeholder="∞" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#02275A]" />
                        </div>
                        
                        <div className="md:col-span-2">
                            <label className="text-xs font-bold text-slate-600 block mb-1">Description *</label>
                            <input required name="description" type="text" placeholder="e.g. Elite Performance" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#02275A]" />
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-xs font-bold text-slate-600 block mb-1">Reward (what they earn at this grade)</label>
                            <textarea name="reward" rows={2} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#02275A] resize-none" placeholder="e.g. Quarterly bonus, extra PTO..."></textarea>
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-xs font-bold text-slate-600 block mb-1">Consequence (what happens at this grade)</label>
                            <textarea name="consequence" rows={2} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#02275A] resize-none" placeholder="e.g. Performance review, probation..."></textarea>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} disabled={isLoading} className="px-5 py-2.5 rounded-xl text-slate-500 font-bold text-sm bg-slate-100 hover:bg-slate-200 disabled:opacity-50">Cancel</button>
                        <button type="submit" disabled={isLoading} className="px-6 py-2.5 rounded-xl bg-[#02275A] text-white font-bold text-sm shadow-md hover:bg-[#02275A]/90 transition-colors flex items-center gap-2 disabled:opacity-70">
                            {isLoading && <i className="fas fa-circle-notch fa-spin"></i>}
                            Save Grade
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddGradeModal;
