import React, { useState, useEffect } from 'react';
import { Business } from '../types';
import { useAlert } from '../contexts/AlertContext';

interface ViewBusinessModalProps {
    isOpen: boolean;
    onClose: () => void;
    business: Business | null;
    onSave: (id: string, data: Partial<Business>) => void;
}

const ViewBusinessModal: React.FC<ViewBusinessModalProps> = ({ isOpen, onClose, business, onSave }) => {
    const { showSuccess, showError } = useAlert();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        owner: '',
        category: '',
        email: '',
        username: '',
        phone: '',
        address: '',
        country: ''
    });

    useEffect(() => {
        if (business) {
            setFormData({
                owner: business.owner || '',
                category: business.category || '',
                email: business.email || '',
                username: business.username || '',
                phone: business.phone || '',
                address: business.address || '',
                country: business.country || ''
            });
            setIsEditing(false); 
        }
    }, [business, isOpen]);

    if (!isOpen || !business) return null;

    const handleSaveClick = () => {
        // Check for offline status
        if (!navigator.onLine) {
            showError("Unable to save. No internet connection detected.");
            return;
        }

        setIsSaving(true);

        // Simulate Async Save
        setTimeout(() => {
            // Simulate a random "Unable to Save" error (10% chance)
            const randomFailure = Math.random() < 0.1;

            if (randomFailure) {
                setIsSaving(false);
                showError("Unable to save changes. Please try again later.");
            } else {
                onSave(business.id, formData);
                setIsEditing(false);
                setIsSaving(false);
                showSuccess("Business details updated successfully.");
            }
        }, 1200);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
                {/* Header */}
                <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-100 p-6 flex justify-between items-start z-10">
                    <div>
                        <h3 className="text-2xl font-bold text-slate-800">{business.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-400 font-medium">• Joined {business.dateJoined}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-500 flex items-center justify-center transition-colors">
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                
                <div className="p-6 md:p-8 space-y-8">
                    {/* Information Section Header with Actions */}
                    <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">INFORMATION</h4>
                        
                        {!isEditing ? (
                            <button onClick={() => setIsEditing(true)} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                                Edit Details
                            </button>
                        ) : (
                            <div className="flex items-center gap-4">
                                <button onClick={() => setIsEditing(false)} className="text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors" disabled={isSaving}>Cancel</button>
                                <button 
                                    onClick={handleSaveClick} 
                                    disabled={isSaving}
                                    className="text-sm font-bold text-white bg-indigo-600 px-4 py-1.5 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-70"
                                >
                                    {isSaving && <i className="fas fa-circle-notch fa-spin"></i>}
                                    {isSaving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        )}
                    </div>
                        
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column: Contact & Address */}
                        <div className="space-y-6">
                            {/* Contact */}
                            <div>
                                <p className="text-[10px] text-slate-500 font-bold uppercase mb-3">CONTACT</p>
                                {isEditing ? (
                                    <input 
                                        type="text" 
                                        value={formData.owner}
                                        onChange={(e) => setFormData({...formData, owner: e.target.value})}
                                        className="w-full p-2 mb-3 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-800 outline-none focus:border-indigo-500 transition-all"
                                        placeholder="Owner Name"
                                    />
                                ) : (
                                    <p className="text-base font-bold text-slate-800 mb-3">{business.owner}</p>
                                )}
                                
                                <div className="space-y-3">
                                    <div className="relative">
                                        <input 
                                            type="tel" 
                                            value={formData.phone} 
                                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                            disabled={!isEditing || business.verified}
                                            className={`w-full p-3 rounded-lg text-sm font-medium outline-none transition-all ${
                                                (!isEditing || business.verified) 
                                                ? 'bg-slate-50 border border-slate-200 text-slate-500 cursor-not-allowed' 
                                                : 'bg-white border border-slate-300 text-slate-800 focus:border-indigo-500 ring-0'
                                            }`}
                                        />
                                        {business.verified && <i className="fas fa-lock absolute right-3 top-3.5 text-slate-400 text-xs"></i>}
                                    </div>
                                    <div className="relative">
                                        <input 
                                            type="email" 
                                            value={formData.email} 
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            disabled={!isEditing || business.verified}
                                            className={`w-full p-3 rounded-lg text-sm font-medium outline-none transition-all ${
                                                (!isEditing || business.verified) 
                                                ? 'bg-slate-50 border border-slate-200 text-slate-500 cursor-not-allowed' 
                                                : 'bg-white border border-slate-300 text-slate-800 focus:border-indigo-500 ring-0'
                                            }`}
                                        />
                                        {business.verified && <i className="fas fa-lock absolute right-3 top-3.5 text-slate-400 text-xs"></i>}
                                    </div>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            value={formData.username} 
                                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                                            disabled={!isEditing}
                                            placeholder="Username (e.g. jdoe123)"
                                            className={`w-full p-3 rounded-lg text-sm font-medium outline-none transition-all ${
                                                (!isEditing) 
                                                ? 'bg-slate-50 border border-slate-200 text-slate-500 cursor-not-allowed' 
                                                : 'bg-white border border-slate-300 text-slate-800 focus:border-indigo-500 ring-0'
                                            }`}
                                        />
                                        {!isEditing && !formData.username && <i className="fas fa-user-slash absolute right-3 top-3.5 text-slate-400 text-xs" title="No username set"></i>}
                                    </div>
                                    {business.verified && <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1.5 mt-2"><i className="fas fa-check-circle"></i> Contact info verified</p>}
                                </div>
                            </div>

                            {/* Address */}
                            <div>
                                <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">ADDRESS</p>
                                {isEditing ? (
                                    <textarea 
                                        rows={3}
                                        value={formData.address}
                                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                                        className="w-full p-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:border-indigo-500 outline-none resize-none"
                                    />
                                ) : (
                                    <p className="text-sm font-semibold text-slate-700 leading-relaxed">{business.address}</p>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Business Type & Country */}
                        <div className="space-y-6">
                            {/* Business Type */}
                            <div>
                                <p className="text-[10px] text-slate-500 font-bold uppercase mb-3">BUSINESS TYPE</p>
                                {isEditing ? (
                                    <input 
                                        type="text"
                                        value={formData.category} 
                                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                                        className="w-full p-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:border-indigo-500 outline-none"
                                    />
                                ) : (
                                    <div className="p-3 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700">
                                        {business.category}
                                    </div>
                                )}
                            </div>

                            {/* Country */}
                            <div>
                                <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">COUNTRY</p>
                                {isEditing ? (
                                    <input 
                                        type="text"
                                        value={formData.country} 
                                        onChange={(e) => setFormData({...formData, country: e.target.value})}
                                        className="w-full p-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:border-indigo-500 outline-none"
                                    />
                                ) : (
                                    <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
                                        <i className="fas fa-globe text-slate-400"></i>
                                        {business.country}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewBusinessModal;