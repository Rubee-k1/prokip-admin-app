
import React, { useState, useMemo, useEffect } from 'react';
import { useAlert } from '../contexts/AlertContext';

interface PlaceResult {
    id: string;
    name: string;
    category: string;
    address: string;
    phone: string;
    email?: string;
    rating: number;
    reviews: number;
    isOpen: boolean;
    image?: string;
    distance: number; // Distance in km
    claimedBy?: string; // If claimed by another agent
}

interface NearbyLeadsProps {
    onSave: (data: any | any[]) => void;
    savedPhoneNumbers: string[];
}

const MAX_DAILY_SEARCHES = 7;
const RESULTS_PER_PAGE = 20;

const NearbyLeads: React.FC<NearbyLeadsProps> = ({ onSave, savedPhoneNumbers }) => {
    const { showSuccess, showError, showInfo, showWarning } = useAlert();
    const [searchTerm, setSearchTerm] = useState('');
    const [locationState, setLocationState] = useState('Lagos');
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<PlaceResult[]>([]);
    
    // Bulk Action State
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    
    // Pagination State
    const [visibleCount, setVisibleCount] = useState(RESULTS_PER_PAGE);

    // Limit State
    const [searchCount, setSearchCount] = useState(0);
    const [lastSearchDate, setLastSearchDate] = useState('');

    // Filters
    const [filterStatus, setFilterStatus] = useState<'All' | 'New' | 'Saved' | 'Conflict'>('All');
    const [filterDistance, setFilterDistance] = useState<number>(50);
    const [filterRating, setFilterRating] = useState<number>(0);
    const [filterPhoneOnly, setFilterPhoneOnly] = useState<boolean>(true);

    // Modals
    const [callModalOpen, setCallModalOpen] = useState(false);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);
    const [callOutcome, setCallOutcome] = useState('No Answer');
    const [callNote, setCallNote] = useState('');

    // Smart Industries for Quick Search
    const smartIndustries = [
        { label: 'Pharmacies', icon: 'fa-prescription-bottle-alt', term: 'Pharmacy', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
        { label: 'Hotels', icon: 'fa-hotel', term: 'Hotel', color: 'bg-blue-50 text-blue-600 border-blue-100' },
        { label: 'Restaurants', icon: 'fa-utensils', term: 'Restaurant', color: 'bg-orange-50 text-orange-600 border-orange-100' },
        { label: 'Supermarkets', icon: 'fa-shopping-cart', term: 'Supermarket', color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
        { label: 'Electronics', icon: 'fa-laptop', term: 'Electronics Store', color: 'bg-slate-100 text-slate-600 border-slate-200' },
        { label: 'Salons', icon: 'fa-cut', term: 'Beauty Salon', color: 'bg-pink-50 text-pink-600 border-pink-100' },
        { label: 'Hospitals', icon: 'fa-hospital', term: 'Hospital', color: 'bg-red-50 text-red-600 border-red-100' },
    ];

    // Initialize Limit Logic on Load
    useEffect(() => {
        const storedDate = localStorage.getItem('lastSearchDate');
        const storedCount = localStorage.getItem('searchCount');
        const today = new Date().toLocaleDateString();

        if (storedDate !== today) {
            // Reset if new day
            setSearchCount(0);
            setLastSearchDate(today);
            localStorage.setItem('lastSearchDate', today);
            localStorage.setItem('searchCount', '0');
        } else if (storedCount) {
            setSearchCount(parseInt(storedCount));
        }
    }, []);

    const generateMockResults = (keyword: string, location: string): PlaceResult[] => {
        // Generate 40-100 mock results to simulate large data exploration
        const count = Math.floor(Math.random() * 60) + 40; 
        const categories = ['Restaurant', 'Retail', 'Fashion', 'Healthcare', 'Automotive', 'Services', 'Hospitality', 'Education'];
        const streets = ['Admiralty Way', 'Broad Street', 'Awolowo Way', 'Bourdillon Road', 'Adeola Odeku', 'Allen Avenue', 'Herbert Macaulay'];
        
        // Mock Conflict Database (Leads owned by other agents)
        const otherAgents = ['Sarah O.', 'Emmanuel K.', 'Chinedu B.', 'Fatima A.'];

        return Array.from({ length: count }).map((_, i) => {
            const isConflict = Math.random() < 0.15; // 15% chance of conflict
            const hasPhone = Math.random() > 0.1;
            const randomRating = Number((Math.random() * 2 + 3).toFixed(1));
            const randomReviews = Math.floor(Math.random() * 500);
            
            // Generate mock email if phone exists
            const cleanName = (keyword || 'business').replace(/\s+/g, '').toLowerCase();
            const hasEmail = Math.random() > 0.4;
            const mockEmail = hasEmail ? `info@${cleanName}${i}.com` : undefined;

            return {
                id: `g-${Date.now()}-${i}`,
                name: `${keyword || 'Business'} ${i + 1} ${isConflict ? 'Enterprises' : 'Ltd'}`,
                category: keyword ? keyword : categories[Math.floor(Math.random() * categories.length)],
                address: `${Math.floor(Math.random() * 100) + 1} ${streets[Math.floor(Math.random() * streets.length)]}, ${location}`,
                phone: hasPhone ? `080${Math.floor(Math.random() * 900000000 + 100000000)}` : '',
                email: mockEmail,
                rating: randomRating, // 3.0 to 5.0
                reviews: randomReviews,
                isOpen: Math.random() > 0.3,
                distance: Number((Math.random() * 25).toFixed(1)),
                claimedBy: isConflict ? otherAgents[Math.floor(Math.random() * otherAgents.length)] : undefined
            };
        });
    };

    const handleSearch = (e?: React.FormEvent, overrideTerm?: string) => {
        if (e) e.preventDefault();
        
        const termToUse = overrideTerm || searchTerm;

        if (searchCount >= MAX_DAILY_SEARCHES) {
            showError(`Daily search limit reached (${MAX_DAILY_SEARCHES}/${MAX_DAILY_SEARCHES}). Try again tomorrow.`);
            return;
        }

        if (!termToUse && !locationState) {
            showError('Please enter a keyword or select a state');
            return;
        }
        
        setIsLoading(true);
        setResults([]); // Clear previous
        setVisibleCount(RESULTS_PER_PAGE); // Reset pagination
        setSelectedIds(new Set()); // Reset selection

        // Increment Count
        const newCount = searchCount + 1;
        setSearchCount(newCount);
        localStorage.setItem('searchCount', newCount.toString());
        localStorage.setItem('lastSearchDate', new Date().toLocaleDateString());
        
        setTimeout(() => {
            setIsLoading(false);
            const largeDataSet = generateMockResults(termToUse, locationState);
            setResults(largeDataSet);
            showSuccess(`Found ${largeDataSet.length} businesses. (${MAX_DAILY_SEARCHES - newCount} searches left today)`);
        }, 1500);
    };

    // Filter Logic
    const displayedResults = useMemo(() => {
        return results.filter(place => {
            const isSavedLocally = savedPhoneNumbers.includes(place.phone);
            
            // 1. Status Filter
            if (filterStatus === 'New' && (isSavedLocally || place.claimedBy)) return false;
            if (filterStatus === 'Saved' && !isSavedLocally) return false;
            if (filterStatus === 'Conflict' && !place.claimedBy) return false;

            // 2. Distance Filter
            if (place.distance > filterDistance) return false;

            // 3. Rating Filter
            if (place.rating < filterRating) return false;

            // 4. Phone Filter
            if (filterPhoneOnly && (!place.phone || place.phone.trim() === '')) return false;

            return true;
        });
    }, [results, filterStatus, filterDistance, filterRating, filterPhoneOnly, savedPhoneNumbers]);

    // Pagination Logic
    const paginatedResults = displayedResults.slice(0, visibleCount);
    const hasMore = visibleCount < displayedResults.length;

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + RESULTS_PER_PAGE);
    };

    const handleMyLocation = () => {
        showInfo("Acquiring GPS location...");
        setTimeout(() => {
            setLocationState("Lagos");
            showSuccess("Location detected: Lagos, Nigeria");
        }, 1000);
    };

    const isSaved = (phone: string) => savedPhoneNumbers.includes(phone);

    const handleSaveClick = (place: PlaceResult) => {
        if (place.claimedBy) {
            showError(`This lead belongs to ${place.claimedBy}. You cannot add it.`);
            return;
        }
        if (!place.phone) {
            showError("Cannot save lead without a phone number.");
            return;
        }
        
        const leadData = {
            name: 'Manager',
            business: place.name,
            phone: place.phone,
            email: place.email,
            type: 'Company',
            location: place.address,
            leadSource: 'Google Business',
            status: 'New',
            notes: `Imported from Google Maps. Category: ${place.category}. Rating: ${place.rating}/5 (${place.reviews} reviews). Distance: ${place.distance}km.`
        };
        
        onSave(leadData);
    };

    const handleBulkSave = () => {
        const leadsToSave = results.filter(r => selectedIds.has(r.id)).map(place => ({
            name: 'Manager',
            business: place.name,
            phone: place.phone,
            email: place.email,
            type: 'Company',
            location: place.address,
            leadSource: 'Google Business',
            status: 'New',
            notes: `Bulk Import. Category: ${place.category}. Rating: ${place.rating}/5.`
        }));

        if (leadsToSave.length > 0) {
            onSave(leadsToSave);
            setSelectedIds(new Set());
        }
    };

    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedIds(newSet);
    };

    const selectAllVisible = () => {
        const newSet = new Set(selectedIds);
        paginatedResults.forEach(r => {
            if (!r.claimedBy && !isSaved(r.phone)) {
                newSet.add(r.id);
            }
        });
        setSelectedIds(newSet);
    };

    const handleCallClick = (place: PlaceResult) => {
        if (!place.phone) {
            showError("No phone number available.");
            return;
        }
        // Launch Phone Dialer
        window.open(`tel:${place.phone}`, '_self');
        
        // Open Modal to log the call outcome
        setSelectedPlace(place);
        setCallModalOpen(true);
    };

    const handleDirectionsClick = (place: PlaceResult) => {
        const query = encodeURIComponent(`${place.name} ${place.address}`);
        window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    };

    const submitCallLog = () => {
        if (!selectedPlace) return;
        
        onSave({
            name: 'Manager',
            business: selectedPlace.name,
            phone: selectedPlace.phone,
            email: selectedPlace.email,
            type: 'Company',
            location: selectedPlace.address,
            leadSource: 'Google Business',
            status: callOutcome === 'Interested' || callOutcome === 'Meeting Scheduled' ? callOutcome : 'New',
            lastAction: 'Call',
            notes: `Called via App. Outcome: ${callOutcome}. Note: ${callNote}`
        });
        
        setCallModalOpen(false);
        setCallOutcome('No Answer');
        setCallNote('');
        setSelectedPlace(null);
    };

    const handleViewDetails = (place: PlaceResult) => {
        setSelectedPlace(place);
        setDetailsModalOpen(true);
    };

    // Calculate limit progress width
    const limitPercentage = (searchCount / MAX_DAILY_SEARCHES) * 100;
    const limitColor = searchCount >= MAX_DAILY_SEARCHES ? 'bg-rose-500' : searchCount >= 5 ? 'bg-amber-500' : 'bg-emerald-500';

    return (
        <div className="animate-fade-in relative pb-16">
            {/* Search Controls & Limits */}
            <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm mb-4">
                
                {/* Daily Limit Bar */}
                <div className="mb-4 flex flex-col gap-1">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase">
                        <span>Daily Search Limit</span>
                        <span className={`${searchCount >= MAX_DAILY_SEARCHES ? 'text-rose-600' : 'text-[#02275A]'}`}>
                            {searchCount} / {MAX_DAILY_SEARCHES} Used
                        </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${limitColor} transition-all duration-500`} style={{ width: `${limitPercentage}%` }}></div>
                    </div>
                    {searchCount >= MAX_DAILY_SEARCHES && (
                        <p className="text-[10px] text-rose-500 font-bold mt-1 text-right">Limit reached. Please try again tomorrow.</p>
                    )}
                </div>

                <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <button 
                        onClick={handleMyLocation}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 font-bold rounded-xl text-sm hover:bg-blue-100 transition-colors border border-blue-100 md:w-auto w-full"
                    >
                        <i className="fas fa-location-arrow"></i> Use My Location
                    </button>
                    <div className="flex-1">
                        <select 
                            value={locationState}
                            onChange={(e) => setLocationState(e.target.value)}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-[#02275A]"
                        >
                            <option>Lagos</option>
                            <option>Abuja</option>
                            <option>Port Harcourt</option>
                            <option>Kano</option>
                            <option>Ibadan</option>
                        </select>
                    </div>
                </div>
                
                <form onSubmit={(e) => handleSearch(e)} className="flex gap-2">
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-3 text-slate-400"><i className="fas fa-search"></i></span>
                        <input 
                            type="text" 
                            placeholder="Search by keyword (e.g. Restaurant, Hotel, Pharmacy)..." 
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#02275A] transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button 
                        type="submit"
                        disabled={isLoading || searchCount >= MAX_DAILY_SEARCHES}
                        className="bg-[#02275A] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md hover:bg-[#02275A]/90 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <i className="fas fa-circle-notch fa-spin"></i> : <><i className="fas fa-search"></i> Find</>}
                    </button>
                </form>

                {/* Smart Industry Generators */}
                <div className="mt-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Target High-Value Industries</p>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        {smartIndustries.map((ind, idx) => (
                            <button 
                                key={idx}
                                onClick={() => { setSearchTerm(ind.term); handleSearch(undefined, ind.term); }}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-bold whitespace-nowrap transition-transform hover:scale-105 active:scale-95 ${ind.color}`}
                            >
                                <i className={`fas ${ind.icon}`}></i> {ind.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Filters Bar - Redesigned for UX/UI */}
            <div className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm mb-4 -mx-4 px-4 py-3 md:mx-0 md:rounded-xl md:border md:shadow-sm md:static">
                <div className="flex flex-col gap-3">
                    {/* Top Row: Info & Bulk Actions */}
                    <div className="flex justify-between items-center">
                        <div className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                            <div className="bg-slate-100 p-1.5 rounded-md"><i className="fas fa-filter text-slate-400"></i></div>
                            <span>Filters</span>
                            <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full text-[10px]">{displayedResults.length} Results</span>
                        </div>
                        
                        <div className="flex gap-2">
                            <button 
                                onClick={selectAllVisible}
                                className="text-[10px] font-bold text-slate-500 hover:text-[#02275A] bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors"
                            >
                                Select All
                            </button>
                        </div>
                    </div>

                    {/* Scrollable Filters Row - Pill Design */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar items-center pb-1">
                        
                        {/* Status Pill */}
                        <div className="relative shrink-0">
                            <select 
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value as any)}
                                className={`appearance-none pl-3 pr-8 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer outline-none focus:ring-2 focus:ring-[#02275A]/20 ${
                                    filterStatus !== 'All' 
                                    ? 'bg-[#02275A] text-white border-[#02275A]' 
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                }`}
                            >
                                <option value="All">Show: All</option>
                                <option value="New">Show: New</option>
                                <option value="Saved">Show: Saved</option>
                                <option value="Conflict">Show: Conflict</option>
                            </select>
                            <i className={`fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-[10px] pointer-events-none ${filterStatus !== 'All' ? 'text-white' : 'text-slate-400'}`}></i>
                        </div>

                        {/* Distance Pill */}
                        <div className="relative shrink-0">
                            <select 
                                value={filterDistance}
                                onChange={(e) => setFilterDistance(Number(e.target.value))}
                                className={`appearance-none pl-3 pr-8 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer outline-none focus:ring-2 focus:ring-[#02275A]/20 ${
                                    filterDistance !== 50 
                                    ? 'bg-indigo-600 text-white border-indigo-600' 
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                }`}
                            >
                                <option value={50}>Dist: Any</option>
                                <option value={1}>&lt; 1 km</option>
                                <option value={5}>&lt; 5 km</option>
                                <option value={10}>&lt; 10 km</option>
                                <option value={20}>&lt; 20 km</option>
                            </select>
                            <i className={`fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-[10px] pointer-events-none ${filterDistance !== 50 ? 'text-white' : 'text-slate-400'}`}></i>
                        </div>

                        {/* Rating Pill */}
                        <div className="relative shrink-0">
                            <select 
                                value={filterRating}
                                onChange={(e) => setFilterRating(Number(e.target.value))}
                                className={`appearance-none pl-3 pr-8 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer outline-none focus:ring-2 focus:ring-[#02275A]/20 ${
                                    filterRating !== 0 
                                    ? 'bg-amber-500 text-white border-amber-500' 
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                }`}
                            >
                                <option value={0}>Rate: Any</option>
                                <option value={3}>3+ Stars</option>
                                <option value={4}>4+ Stars</option>
                                <option value={4.5}>4.5+ Stars</option>
                            </select>
                            <i className={`fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-[10px] pointer-events-none ${filterRating !== 0 ? 'text-white' : 'text-slate-400'}`}></i>
                        </div>

                        {/* Phone Toggle Pill */}
                        <button 
                            onClick={() => setFilterPhoneOnly(!filterPhoneOnly)}
                            className={`shrink-0 px-3 py-2 rounded-full text-xs font-bold border flex items-center gap-2 transition-all ${
                                filterPhoneOnly 
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                            }`}
                        >
                            <i className={`fas ${filterPhoneOnly ? 'fa-phone' : 'fa-phone-slash'}`}></i>
                            Has Phone
                        </button>

                        {/* Clear Filters (Conditional) */}
                        {(filterStatus !== 'All' || filterDistance !== 50 || filterRating !== 0 || !filterPhoneOnly) && (
                            <button 
                                onClick={() => {
                                    setFilterStatus('All');
                                    setFilterDistance(50);
                                    setFilterRating(0);
                                    setFilterPhoneOnly(true);
                                }}
                                className="shrink-0 w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 flex items-center justify-center transition-colors"
                                title="Clear Filters"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Results Grid - Compact Layout */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 pb-6">
                {paginatedResults.map((place) => {
                    const alreadySaved = isSaved(place.phone);
                    const isConflict = !!place.claimedBy;
                    const isSelected = selectedIds.has(place.id);
                    const isHotLead = place.rating >= 4.5 && place.reviews > 50;

                    return (
                        <div 
                            key={place.id} 
                            className={`bg-white p-3 rounded-lg border shadow-sm transition-all group flex flex-col h-full relative ${
                                isConflict ? 'border-rose-100 bg-rose-50/10' : 
                                isSelected ? 'border-[#02275A] ring-1 ring-[#02275A] bg-blue-50/20' : 
                                'border-slate-100 hover:border-indigo-200'
                            }`}
                        >
                            {/* Selection Checkbox */}
                            {!isConflict && !alreadySaved && (
                                <div className="absolute top-3 left-3 z-10">
                                    <div 
                                        onClick={(e) => { e.stopPropagation(); toggleSelection(place.id); }}
                                        className={`w-5 h-5 rounded border cursor-pointer flex items-center justify-center transition-colors ${isSelected ? 'bg-[#02275A] border-[#02275A]' : 'bg-white border-slate-300 hover:border-[#02275A]'}`}
                                    >
                                        {isSelected && <i className="fas fa-check text-white text-[10px]"></i>}
                                    </div>
                                </div>
                            )}

                            {/* Status/Distance Badges */}
                            <div className="absolute top-3 right-3 flex flex-col items-end gap-1 pointer-events-none">
                                {isHotLead && (
                                    <span className="text-[8px] bg-gradient-to-r from-orange-500 to-rose-500 text-white px-1.5 py-0.5 rounded font-bold shadow-sm flex items-center gap-1">
                                        <i className="fas fa-fire"></i> Hot
                                    </span>
                                )}
                                <span className="text-[9px] font-bold text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                    <i className="fas fa-map-marker-alt text-[8px]"></i> {place.distance}km
                                </span>
                            </div>

                            <div className="flex items-start gap-2 mb-2 pr-14 mt-6">
                                <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center text-sm shrink-0">
                                    <i className="fab fa-google"></i>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-xs line-clamp-2 leading-tight">{place.name}</h3>
                                    <div className="flex items-center gap-1 text-[9px] text-amber-500 font-bold mt-0.5">
                                        <span>{place.rating}</span>
                                        <i className="fas fa-star text-[8px]"></i>
                                        <span className="text-slate-400 font-medium">({place.reviews})</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-3 flex-1">
                                <p className="text-[10px] text-[#02275A] font-bold mb-0.5 truncate">{place.category}</p>
                                <p className="text-[10px] text-slate-500 leading-tight mb-1.5 line-clamp-2 min-h-[2.5em]">{place.address}</p>
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-600 bg-slate-50 p-1.5 rounded">
                                    <i className="fas fa-phone text-slate-400 text-[9px]"></i> 
                                    <span className="truncate">{place.phone || <span className="italic text-slate-400">No phone</span>}</span>
                                </div>
                                {isConflict && (
                                    <div className="mt-1.5 text-[9px] bg-rose-100 text-rose-700 px-1.5 py-1 rounded border border-rose-200 font-bold truncate">
                                        <i className="fas fa-lock mr-1"></i> {place.claimedBy}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-4 gap-1 border-t border-slate-50 pt-2 mt-auto">
                                <button 
                                    onClick={() => handleCallClick(place)}
                                    disabled={!place.phone}
                                    className={`flex flex-col items-center justify-center p-1 rounded hover:bg-slate-50 transition-colors ${!place.phone ? 'opacity-30 cursor-not-allowed text-slate-400' : 'text-slate-500 hover:text-[#02275A]'}`}
                                    title="Call"
                                >
                                    <i className="fas fa-phone-alt text-xs mb-0.5"></i>
                                    <span className="text-[8px] font-bold">Call</span>
                                </button>
                                
                                <button 
                                    onClick={() => !alreadySaved && !isConflict && handleSaveClick(place)}
                                    disabled={alreadySaved || !place.phone || isConflict}
                                    className={`flex flex-col items-center justify-center p-1 rounded hover:bg-slate-50 transition-colors ${
                                        isConflict ? 'text-rose-300 cursor-not-allowed' : alreadySaved ? 'text-emerald-500 cursor-default' : !place.phone ? 'opacity-30 cursor-not-allowed text-slate-400' : 'text-slate-500 hover:text-[#02275A]'
                                    }`}
                                    title="Save"
                                >
                                    <i className={`fas ${isConflict ? 'fa-ban' : alreadySaved ? 'fa-check' : 'fa-save'} text-xs mb-0.5`}></i>
                                    <span className="text-[8px] font-bold">{isConflict ? 'Taken' : alreadySaved ? 'Saved' : 'Save'}</span>
                                </button>

                                <button 
                                    onClick={() => handleDirectionsClick(place)}
                                    className="flex flex-col items-center justify-center p-1 rounded hover:bg-slate-50 transition-colors text-slate-500 hover:text-blue-600"
                                    title="Directions"
                                >
                                    <i className="fas fa-directions text-xs mb-0.5"></i>
                                    <span className="text-[8px] font-bold">Map</span>
                                </button>

                                <button 
                                    onClick={() => handleViewDetails(place)}
                                    className="flex flex-col items-center justify-center p-1 rounded hover:bg-slate-50 transition-colors text-slate-500 hover:text-[#02275A]"
                                    title="Details"
                                >
                                    <i className="fas fa-info-circle text-xs mb-0.5"></i>
                                    <span className="text-[8px] font-bold">Info</span>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bulk Action Sticky Bar */}
            {selectedIds.size > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#02275A] text-white px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-4 animate-fade-in-up border border-blue-400/30">
                    <span className="font-bold text-sm">{selectedIds.size} Selected</span>
                    <div className="h-4 w-px bg-white/20"></div>
                    <button 
                        onClick={handleBulkSave}
                        className="font-bold text-sm text-emerald-300 hover:text-emerald-100 flex items-center gap-2"
                    >
                        <i className="fas fa-download"></i> Import Leads
                    </button>
                    <button 
                        onClick={() => setSelectedIds(new Set())}
                        className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 ml-2"
                    >
                        <i className="fas fa-times text-xs"></i>
                    </button>
                </div>
            )}

            {/* Load More Button */}
            {hasMore && (
                <div className="text-center py-4">
                    <button 
                        onClick={handleLoadMore}
                        className="bg-white border border-slate-200 text-slate-600 font-bold py-3 px-8 rounded-xl shadow-sm hover:bg-slate-50 hover:text-[#02275A] transition-all active:scale-95"
                    >
                        Load More Businesses ({displayedResults.length - visibleCount} remaining)
                    </button>
                </div>
            )}

            {displayedResults.length === 0 && !isLoading && (
                <div className="text-center py-12 bg-white rounded-xl border border-slate-100 border-dashed">
                    <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center text-2xl mx-auto mb-3">
                        <i className="fas fa-filter"></i>
                    </div>
                    <h3 className="text-slate-600 font-bold">No results found</h3>
                    <p className="text-slate-400 text-sm mt-1 max-w-xs mx-auto">Try adjusting your filters (Distance, Rating, etc.) or search keyword.</p>
                </div>
            )}

            {/* CALL MODAL */}
            {callModalOpen && selectedPlace && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800">Call {selectedPlace.name}</h3>
                            <button onClick={() => setCallModalOpen(false)} className="text-slate-400 hover:text-slate-600"><i className="fas fa-times"></i></button>
                        </div>
                        <div className="p-6">
                            <div className="bg-blue-50 p-3 rounded-lg flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue-600">
                                    <i className="fas fa-phone"></i>
                                </div>
                                <div>
                                    <p className="text-xs text-blue-800 font-bold uppercase">Dialing...</p>
                                    <p className="text-lg font-bold text-slate-800">{selectedPlace.phone}</p>
                                </div>
                            </div>

                            <form onSubmit={(e) => { e.preventDefault(); submitCallLog(); }} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Call Outcome</label>
                                    <select 
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#02275A]"
                                        value={callOutcome}
                                        onChange={(e) => setCallOutcome(e.target.value)}
                                    >
                                        <option>No Answer</option>
                                        <option>Interested</option>
                                        <option>Not Interested</option>
                                        <option>Call Back Later</option>
                                        <option>Wrong Number</option>
                                        <option>Meeting Scheduled</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Notes</label>
                                    <textarea 
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#02275A] resize-none h-24"
                                        placeholder="Add details about the conversation..."
                                        value={callNote}
                                        onChange={(e) => setCallNote(e.target.value)}
                                    ></textarea>
                                </div>
                                <button type="submit" className="w-full py-3 bg-[#02275A] text-white font-bold rounded-xl shadow-md hover:bg-[#02275A]/90 transition-all">
                                    Save Lead & Log Call
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* DETAILS MODAL */}
            {detailsModalOpen && selectedPlace && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="relative h-32 bg-slate-200">
                            {/* Placeholder for map or cover image */}
                            <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                                <i className="fas fa-map-marked-alt text-4xl opacity-50"></i>
                            </div>
                            <button 
                                onClick={() => setDetailsModalOpen(false)}
                                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 backdrop-blur-sm"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800">{selectedPlace.name}</h2>
                                    <p className="text-sm text-slate-500">{selectedPlace.category}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-1 rounded-lg border border-amber-100">
                                        <span className="font-bold">{selectedPlace.rating}</span>
                                        <i className="fas fa-star text-xs"></i>
                                    </div>
                                    <span className="text-[10px] text-slate-400">
                                        {selectedPlace.distance} km away
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="flex items-start gap-3">
                                    <i className="fas fa-map-marker-alt text-slate-400 mt-1 w-4 text-center"></i>
                                    <p className="text-sm text-slate-600 leading-relaxed">{selectedPlace.address}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <i className="fas fa-phone text-slate-400 w-4 text-center"></i>
                                    <p className="text-sm font-bold text-slate-800">
                                        {selectedPlace.phone || "Not available"}
                                    </p>
                                </div>
                                {selectedPlace.email && (
                                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.open(`mailto:${selectedPlace.email}`, '_self')}>
                                        <i className="fas fa-envelope text-slate-400 w-4 text-center"></i>
                                        <p className="text-sm text-blue-600 font-medium hover:underline">{selectedPlace.email}</p>
                                    </div>
                                )}
                                <div className="flex items-center gap-3">
                                    <i className="fas fa-clock text-slate-400 w-4 text-center"></i>
                                    <p className={`text-sm font-bold ${selectedPlace.isOpen ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {selectedPlace.isOpen ? 'Open Now' : 'Closed'}
                                    </p>
                                </div>
                                {selectedPlace.claimedBy && (
                                    <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg text-xs text-rose-700 font-bold flex items-center gap-2">
                                        <i className="fas fa-lock"></i>
                                        Lead already saved by {selectedPlace.claimedBy}
                                    </div>
                                )}
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs text-slate-500 mb-6">
                                <p className="mb-2 font-bold uppercase text-slate-400">Source: Google Business Profile</p>
                                <p>This information is retrieved from Google Maps. Verify details when contacting the business.</p>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <button 
                                    onClick={() => handleDirectionsClick(selectedPlace)}
                                    className="py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all flex flex-col items-center justify-center gap-1"
                                >
                                    <i className="fas fa-directions text-lg"></i>
                                    <span className="text-[10px]">Navigate</span>
                                </button>
                                <button 
                                    onClick={() => { setDetailsModalOpen(false); handleCallClick(selectedPlace); }}
                                    disabled={!selectedPlace.phone}
                                    className={`py-3 text-white font-bold rounded-xl shadow-md transition-all flex flex-col items-center justify-center gap-1 ${!selectedPlace.phone ? 'bg-slate-300 cursor-not-allowed' : 'bg-[#02275A] hover:bg-[#02275A]/90'}`}
                                >
                                    <i className="fas fa-phone text-lg"></i>
                                    <span className="text-[10px]">Call</span>
                                </button>
                                <button 
                                    onClick={() => { 
                                        if (!isSaved(selectedPlace.phone)) {
                                            handleSaveClick(selectedPlace); 
                                            setDetailsModalOpen(false);
                                        }
                                    }}
                                    disabled={isSaved(selectedPlace.phone) || !selectedPlace.phone || !!selectedPlace.claimedBy}
                                    className={`py-3 font-bold rounded-xl border transition-all flex flex-col items-center justify-center gap-1 ${
                                        isSaved(selectedPlace.phone) || !selectedPlace.phone || !!selectedPlace.claimedBy
                                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-default'
                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                    }`}
                                >
                                    <i className={`fas ${selectedPlace.claimedBy ? 'fa-ban' : isSaved(selectedPlace.phone) ? 'fa-check' : 'fa-save'} text-lg`}></i>
                                    <span className="text-[10px]">{selectedPlace.claimedBy ? 'Taken' : isSaved(selectedPlace.phone) ? 'Saved' : 'Save'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NearbyLeads;
