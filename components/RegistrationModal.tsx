
import React, { useState } from 'react';
import { useAlert } from '../contexts/AlertContext';

interface RegistrationData {
    name?: string;
    business?: string;
    phone?: string;
    location?: string;
}

interface RegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (data: any) => void;
    initialData?: RegistrationData;
    userCountry?: string;
}

const RegistrationModal: React.FC<RegistrationModalProps> = ({ isOpen, onClose, onSuccess, initialData = {} as RegistrationData, userCountry = 'Nigeria' }) => {
    const { showSuccess, showError } = useAlert();
    const [isLoading, setIsLoading] = useState(false);
    
    // Determine default country code based on userCountry
    const defaultCountryCode = userCountry === 'Ghana' ? '+233' : 
                               userCountry === 'Kenya' ? '+254' : 
                               userCountry === 'Rwanda' ? '+250' : '+234';
                               
    const [countryCode, setCountryCode] = useState(defaultCountryCode);
    const [leadType, setLeadType] = useState('Company'); // Default to Company Lead

    React.useEffect(() => {
        if (isOpen) {
            setCountryCode(defaultCountryCode);
        }
    }, [isOpen, defaultCountryCode]);

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

    if (!isOpen) return null;

    const getNameParts = (fullName: string) => {
        if (!fullName) return { first: '', last: '' };
        const parts = fullName.trim().split(' ');
        return {
            first: parts[0] || '',
            last: parts.slice(1).join(' ') || ''
        };
    };

    const { first: initialFirst, last: initialLast } = getNameParts(initialData.name || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!navigator.onLine) {
            showError("Cannot register. No internet connection.");
            return;
        }

        setIsLoading(true);

        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        
        const registrationData = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            username: formData.get('username'),
            email: formData.get('email'),
            companyName: formData.get('companyName'),
            phone: countryCode + formData.get('phone'),
            industry: formData.get('industry'),
            address: formData.get('address'),
            city: formData.get('city'),
            country: formData.get('country'),
            leadType: leadType,
            leadSource: leadType === 'Personal' ? formData.get('leadSource') : 'Company Network',
            notes: formData.get('notes')
        };

        setTimeout(() => {
            setIsLoading(false);
            showSuccess("Business registered successfully!");
            onSuccess(registrationData); 
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
                <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-100 p-4 flex justify-between items-center z-10">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">{initialData.business ? 'Confirm Registration' : 'Register New Business'}</h3>
                        <p className="text-xs text-slate-500">Enter client details to create account</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center">
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* User Identity */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="text-xs font-bold text-slate-600 block mb-1">First Name</label><input required name="firstName" defaultValue={initialFirst} type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#02275A]" /></div>
                        <div><label className="text-xs font-bold text-slate-600 block mb-1">Last Name</label><input required name="lastName" defaultValue={initialLast} type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#02275A]" /></div>
                        <div><label className="text-xs font-bold text-slate-600 block mb-1">Username</label><input required name="username" type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#02275A]" /></div>
                        <div><label className="text-xs font-bold text-slate-600 block mb-1">Email</label><input required name="email" type="email" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#02275A]" /></div>
                        <div className="md:col-span-2"><label className="text-xs font-bold text-slate-600 block mb-1">Password</label><input required name="password" type="password" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#02275A]" /></div>
                    </div>
                    <div className="border-t border-slate-100"></div>
                    {/* Business Profile */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="text-xs font-bold text-slate-600 block mb-1">Business Name</label><input required name="companyName" defaultValue={initialData.business} type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#02275A]" /></div>
                        <div>
                            <label className="text-xs font-bold text-slate-600 block mb-1">Phone</label>
                            <div className="flex">
                                <div className="relative">
                                    <select
                                        value={countryCode}
                                        onChange={(e) => setCountryCode(e.target.value)}
                                        className="h-full pl-3 pr-6 bg-slate-50 border border-r-0 border-slate-200 rounded-l-lg text-sm font-bold text-slate-700 focus:bg-white focus:outline-none focus:border-[#02275A] appearance-none cursor-pointer"
                                    >
                                        {countryCodes.map((c, idx) => (
                                            <option key={`${c.code}-${c.country}-${idx}`} value={c.code}>{c.code}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <i className="fas fa-chevron-down text-[10px]"></i>
                                    </div>
                                </div>
                                <input 
                                    required 
                                    name="phone"
                                    defaultValue={initialData.phone} 
                                    type="tel" 
                                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-r-lg text-sm outline-none focus:border-[#02275A] -ml-[1px]" 
                                    placeholder="8012345678"
                                />
                            </div>
                        </div>
                        <div className="md:col-span-2"><label className="text-xs font-bold text-slate-600 block mb-1">Industry</label><select name="industry" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#02275A]"><option>Retail</option><option>Hospitality</option><option>Logistics</option><option>Fashion</option><option>Services</option></select></div>
                        {/* Address 2 per line on web */}
                        <div className="md:col-span-2"><label className="text-xs font-bold text-slate-600 block mb-1">Address</label><input required name="address" type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none mb-3 focus:border-[#02275A]" placeholder="Street Address" />
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <input required name="city" defaultValue={initialData.location} type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#02275A]" placeholder="City" />
                                <select name="state" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#02275A]">
                                    <option>State / Province</option>
                                    <option>Lagos</option>
                                    <option>Abuja</option>
                                    <option>Accra</option>
                                    <option>Nairobi</option>
                                    <option>Johannesburg</option>
                                </select>
                            </div>
                            <select name="country" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#02275A]">
                                <option>Nigeria</option>
                                <option>Ghana</option>
                                <option>Kenya</option>
                                <option>South Africa</option>
                                <option>United Kingdom</option>
                                <option>United States</option>
                                <option>Canada</option>
                                <option>India</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="border-t border-slate-100"></div>
                    {/* Lead Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2"><h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Lead Information</h4></div>
                        
                        <div>
                            <label className="text-xs font-bold text-slate-600 block mb-1">Lead Type</label>
                            <select 
                                name="leadType" 
                                value={leadType}
                                onChange={(e) => setLeadType(e.target.value)}
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#02275A]"
                            >
                                <option value="Company">Company Lead</option>
                                <option value="Personal">Personal Lead</option>
                            </select>
                        </div>

                        {leadType === 'Personal' && (
                            <div>
                                <label className="text-xs font-bold text-slate-600 block mb-1">Lead Source</label>
                                <select name="leadSource" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#02275A]">
                                    <option>Select Source</option>
                                    <option>Cold Call</option>
                                    <option>Referral</option>
                                    <option>Social Media</option>
                                    <option>Walk-In</option>
                                    <option>Website</option>
                                    <option>Other</option>
                                </select>
                            </div>
                        )}

                        <div className="md:col-span-2">
                            <label className="text-xs font-bold text-slate-600 block mb-1">Notes</label>
                            <textarea name="notes" rows={2} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#02275A] resize-none" placeholder="Any additional details..."></textarea>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} disabled={isLoading} className="px-5 py-2.5 rounded-xl text-slate-500 font-bold text-sm bg-slate-100 hover:bg-slate-200 disabled:opacity-50">Cancel</button>
                        <button type="submit" disabled={isLoading} className="px-6 py-2.5 rounded-xl bg-[#02275A] text-white font-bold text-sm shadow-md hover:bg-[#02275A]/90 transition-colors flex items-center gap-2 disabled:opacity-70">
                            {isLoading && <i className="fas fa-circle-notch fa-spin"></i>}
                            Complete Registration
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegistrationModal;
