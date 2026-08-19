import React, { useState } from 'react';
import { useAlert } from '../contexts/AlertContext';

interface ContentItem {
    id: string;
    title: string;
    description: string;
    type: 'video' | 'image' | 'text' | 'document';
    category: 'Videos' | 'Flyers & Print' | 'Social Media' | 'Ad Copies' | 'Cold Outreach' | 'Enterprise Prospecting';
    url: string;
    thumbnailUrl?: string;
    size?: string;
    duration?: string;
    textContent?: string;
}

const MOCK_CONTENT: ContentItem[] = [
    {
        id: '1',
        title: 'Prokip Overview & Pitch',
        description: 'A comprehensive 3-minute video explaining the core benefits of Prokip for retail businesses. Perfect for showing to prospective clients.',
        type: 'video',
        category: 'Videos',
        url: 'https://www.w3schools.com/html/mov_bbb.mp4',
        thumbnailUrl: 'https://picsum.photos/seed/prokip1/640/360',
        size: '15 MB',
        duration: '3:12'
    },
    {
        id: '2',
        title: 'How to Pitch to Supermarkets',
        description: 'Video on the best strategies and talking points when approaching supermarket owners.',
        type: 'video',
        category: 'Videos',
        url: 'https://www.w3schools.com/html/mov_bbb.mp4',
        thumbnailUrl: 'https://picsum.photos/seed/prokip2/640/360',
        size: '22 MB',
        duration: '5:45'
    },
    {
        id: '3',
        title: 'POS Setup Guide for Clients',
        description: 'Quick visual guide on how to set up the POS hardware with Prokip software.',
        type: 'video',
        category: 'Videos',
        url: 'https://www.w3schools.com/html/mov_bbb.mp4',
        thumbnailUrl: 'https://picsum.photos/seed/prokip3/640/360',
        size: '18 MB',
        duration: '4:20'
    },
    {
        id: '4',
        title: 'Ember Month Promo Flyer',
        description: 'High-resolution flyer for the upcoming Ember month discounts. Ready to print.',
        type: 'image',
        category: 'Flyers & Print',
        url: 'https://picsum.photos/seed/flyer1/800/1200',
        thumbnailUrl: 'https://picsum.photos/seed/flyer1/400/600',
        size: '4.2 MB'
    },
    {
        id: '5',
        title: 'Standard Pricing Sheet',
        description: 'A4 printable sheet containing all current Prokip subscription plans and hardware costs.',
        type: 'image',
        category: 'Flyers & Print',
        url: 'https://picsum.photos/seed/flyer2/800/1200',
        thumbnailUrl: 'https://picsum.photos/seed/flyer2/400/600',
        size: '2.1 MB'
    },
    {
        id: '6',
        title: 'Instagram Carousel - Inventory',
        description: 'A 5-slide carousel post highlighting the inventory management features of Prokip.',
        type: 'image',
        category: 'Social Media',
        url: 'https://picsum.photos/seed/social1/1080/1080',
        thumbnailUrl: 'https://picsum.photos/seed/social1/400/400',
        size: '1.5 MB'
    },
    {
        id: '7',
        title: 'Facebook Ad - General',
        description: 'Standard Facebook ad creative focusing on "Stop losing money to theft".',
        type: 'image',
        category: 'Social Media',
        url: 'https://picsum.photos/seed/social2/1200/628',
        thumbnailUrl: 'https://picsum.photos/seed/social2/600/314',
        size: '1.8 MB'
    },
    {
        id: '8',
        title: 'Short Form Text (WhatsApp)',
        description: 'A punchy, emoji-filled text template perfect for sending to prospects via WhatsApp.',
        type: 'text',
        category: 'Ad Copies',
        url: '',
        textContent: `🚀 Stop losing money to inventory theft and bad records!\n\nProkip is the #1 POS and Inventory Management software for smart business owners in Nigeria. 🇳🇬\n\n✅ Track sales from anywhere\n✅ Manage multiple shops\n✅ Prevent staff theft\n✅ Send professional receipts\n\nReply "YES" to this message to get a FREE 14-day trial and a free setup session! 📈👇`
    },
    {
        id: '9',
        title: 'Email Campaign - Follow Up',
        description: 'Professional email template for following up with a lead after an initial meeting.',
        type: 'text',
        category: 'Ad Copies',
        url: '',
        textContent: `Subject: Taking [Business Name] to the next level with Prokip\n\nHi [Name],\n\nIt was great speaking with you earlier today about how Prokip can help streamline your operations at [Business Name].\n\nAs discussed, our system will help you:\n- Automate your daily sales tracking\n- Keep a tight grip on your inventory\n- Generate instant profit/loss reports\n\nI've attached a quick overview brochure for your reference. Let me know when you're ready to activate your 14-day free trial.\n\nBest regards,\n[Your Name]\nProkip Authorized Agent`
    },
    {
        id: '10',
        title: 'Cold Email Template (Retail)',
        description: 'High-converting cold email template targeting retail store owners.',
        type: 'text',
        category: 'Cold Outreach',
        url: '',
        textContent: `Subject: Quick question about your inventory at [Business Name]\n\nHi [Name],\n\nI noticed [Business Name] is expanding, and I wanted to reach out. Many retail owners we work with struggle with tracking inventory accurately across multiple locations or preventing stock shrinkage.\n\nAt Prokip, we help businesses like yours automate sales tracking and inventory management, saving an average of 15 hours a week and reducing theft by up to 90%.\n\nAre you open to a brief 5-minute call next Tuesday to see if this could work for you?\n\nBest,\n[Your Name]`
    },
    {
        id: '11',
        title: 'Cold Call Script',
        description: 'Step-by-step cold calling script with objection handling for new prospects.',
        type: 'text',
        category: 'Cold Outreach',
        url: '',
        textContent: `[Intro]\n"Hi [Name], this is [Your Name] from Prokip. I know I caught you out of the blue, do you have 30 seconds for me to explain why I'm calling, and then you can decide if we should keep chatting?"\n\n[Value Prop]\n"Great. We help retail businesses like [Business Name] completely eliminate inventory theft and automate their daily sales records. We recently helped [Competitor/Similar Business] increase their profit margins by 20% just by plugging their inventory leaks."\n\n[Qualifying Question]\n"How are you currently tracking your daily sales and stock levels across your shop?"\n\n[Call to Action]\n"Based on what you're saying, I think our system could really help. Do you have 10 minutes tomorrow afternoon for a quick demo?"`
    },
    {
        id: '12',
        title: 'LinkedIn Connection Message',
        description: 'Short, effective connection request message for LinkedIn prospecting.',
        type: 'text',
        category: 'Cold Outreach',
        url: '',
        textContent: `Hi [Name],\n\nI've been following [Business Name]'s growth and love what you're doing in the retail space. I work with retail owners to streamline their POS and inventory systems. \n\nWould love to connect and share some insights!\n\nBest,\n[Your Name]`
    },
    {
        id: '13',
        title: 'Enterprise Pitch Deck',
        description: 'Comprehensive presentation deck for pitching to large supermarket chains and enterprise clients.',
        type: 'document',
        category: 'Enterprise Prospecting',
        url: '#',
        thumbnailUrl: 'https://picsum.photos/seed/pitchdeck/640/360',
        size: '8.5 MB'
    },
    {
        id: '14',
        title: 'Supermarket ROI Case Study',
        description: 'Detailed case study showing how a 5-branch supermarket chain achieved 300% ROI in 6 months using Prokip.',
        type: 'document',
        category: 'Enterprise Prospecting',
        url: '#',
        thumbnailUrl: 'https://picsum.photos/seed/casestudy/640/360',
        size: '3.2 MB'
    },
    {
        id: '15',
        title: 'Enterprise Proposal Template',
        description: 'Customizable proposal document for enterprise clients, including SLA terms and multi-branch pricing.',
        type: 'document',
        category: 'Enterprise Prospecting',
        url: '#',
        thumbnailUrl: 'https://picsum.photos/seed/proposal/640/360',
        size: '1.1 MB'
    }
];

export const CATEGORIES = ['All', 'Videos', 'Flyers & Print', 'Social Media', 'Ad Copies', 'Cold Outreach', 'Enterprise Prospecting'];

export { MOCK_CONTENT };

interface ContentHubViewProps {
    contentItems?: ContentItem[];
}

const ContentHubView: React.FC<ContentHubViewProps> = ({ contentItems = MOCK_CONTENT }) => {
    const { showSuccess } = useAlert();
    const [activeCategory, setActiveCategory] = useState<string>('Videos'); // Optimized for Videos by default
    const [activeType, setActiveType] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [previewItem, setPreviewItem] = useState<ContentItem | null>(null);

    const filteredContent = contentItems.filter(item => {
        const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
        const matchesType = activeType === 'All' || item.type === activeType;
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              item.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesType && matchesSearch;
    });

    const handleDownload = (item: ContentItem, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent opening preview if clicking download on the card
        
        // Simulate download
        showSuccess(`Downloading ${item.title}...`);
        
        // In a real app, this would be an actual download link/blob trigger
        setTimeout(() => {
            if (item.url) {
                window.open(item.url, '_blank');
            }
        }, 800);
    };

    const handleCopyText = (text: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        navigator.clipboard.writeText(text);
        showSuccess('Content copied to clipboard!');
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in pb-24">
            
            {/* Header Section */}
            <div className="bg-gradient-to-br from-[#02275A] to-[#033b8a] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#FFD700] opacity-10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="max-w-2xl">
                        <h1 className="text-3xl md:text-4xl font-extrabold mb-3 tracking-tight">Marketing Content Hub</h1>
                        <p className="text-blue-100 text-lg leading-relaxed">
                            Access powerful marketing materials to boost your sales. Download high-quality flyers, and copy proven ad templates to share with your prospects.
                        </p>
                    </div>
                    <div className="hidden md:flex items-center justify-center w-24 h-24 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner">
                        <i className="fas fa-photo-video text-4xl text-[#FFD700]"></i>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                {/* Categories */}
                <div className="flex overflow-x-auto custom-scrollbar w-full lg:w-auto gap-2 pb-2 lg:pb-0">
                    {CATEGORIES.map(category => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                                activeCategory === category
                                    ? 'bg-[#02275A] text-white shadow-md shadow-blue-900/20'
                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                            }`}
                        >
                            {category === 'Videos' && <i className="fas fa-play-circle mr-2"></i>}
                            {category === 'Flyers & Print' && <i className="fas fa-file-image mr-2"></i>}
                            {category === 'Social Media' && <i className="fas fa-hashtag mr-2"></i>}
                            {category === 'Ad Copies' && <i className="fas fa-copy mr-2"></i>}
                            {category === 'Cold Outreach' && <i className="fas fa-envelope-open-text mr-2"></i>}
                            {category === 'Enterprise Prospecting' && <i className="fas fa-building mr-2"></i>}
                            {category === 'All' && <i className="fas fa-layer-group mr-2"></i>}
                            {category}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3">
                    {/* Type Filter */}
                    <div className="relative w-full sm:w-40 lg:w-48">
                        <i className="fas fa-filter absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                        <select
                            value={activeType}
                            onChange={(e) => setActiveType(e.target.value)}
                            className="w-full pl-11 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#02275A] focus:ring-2 focus:ring-blue-900/10 transition-all font-medium appearance-none"
                        >
                            <option value="All">All Types</option>
                            <option value="video">Videos</option>
                            <option value="image">Images</option>
                            <option value="text">Text/Copy</option>
                            <option value="document">Documents</option>
                        </select>
                        <i className="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs"></i>
                    </div>

                    {/* Search */}
                    <div className="relative w-full sm:w-64 lg:w-72">
                        <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                        <input
                            type="text"
                            placeholder="Search content..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#02275A] focus:ring-2 focus:ring-blue-900/10 transition-all font-medium"
                        />
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            {filteredContent.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredContent.map(item => (
                        <div 
                            key={item.id} 
                            className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col cursor-pointer"
                            onClick={() => setPreviewItem(item)}
                        >
                            {/* Thumbnail Area */}
                            <div className="relative aspect-video bg-slate-100 overflow-hidden">
                                {item.type === 'video' || item.type === 'image' || item.type === 'document' ? (
                                    <>
                                        <img 
                                            src={item.thumbnailUrl || 'https://picsum.photos/seed/doc/640/360'} 
                                            alt={item.title} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            referrerPolicy="no-referrer"
                                        />
                                        <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/10 transition-colors"></div>
                                        
                                        {/* Video Play Overlay */}
                                        {item.type === 'video' && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform text-[#02275A]">
                                                    <i className="fas fa-play ml-1 text-lg"></i>
                                                </div>
                                            </div>
                                        )}

                                        {/* Document Overlay */}
                                        {item.type === 'document' && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform text-[#02275A]">
                                                    <i className="fas fa-file-pdf text-lg"></i>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Duration/Size Badge */}
                                        <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                                            {item.type === 'video' ? item.duration : item.size}
                                        </div>
                                    </>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200">
                                        <i className="fas fa-align-left text-4xl text-slate-300"></i>
                                    </div>
                                )}
                                
                                {/* Category Badge */}
                                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-slate-800 text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-sm">
                                    {item.category}
                                </div>
                            </div>

                            {/* Content Details */}
                            <div className="p-5 flex flex-col flex-1">
                                <h3 className="font-bold text-slate-800 text-base mb-2 line-clamp-1 group-hover:text-[#02275A] transition-colors">{item.title}</h3>
                                <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 mb-4 flex-1">
                                    {item.description}
                                </p>
                                
                                {/* Actions */}
                                <div className="flex items-center gap-2 mt-auto pt-4 border-t border-slate-100">
                                    <button 
                                        className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setPreviewItem(item);
                                        }}
                                    >
                                        <i className="fas fa-eye"></i> Preview
                                    </button>
                                    
                                    {item.type === 'text' ? (
                                        <button 
                                            className="flex-1 py-2 bg-[#02275A] hover:bg-[#033b8a] text-white text-xs font-bold rounded-xl transition-colors shadow-md shadow-blue-900/10 flex items-center justify-center gap-2"
                                            onClick={(e) => handleCopyText(item.textContent || '', e)}
                                        >
                                            <i className="fas fa-copy"></i> Copy Text
                                        </button>
                                    ) : (
                                        <button 
                                            className="flex-1 py-2 bg-[#02275A] hover:bg-[#033b8a] text-white text-xs font-bold rounded-xl transition-colors shadow-md shadow-blue-900/10 flex items-center justify-center gap-2"
                                            onClick={(e) => handleDownload(item, e)}
                                        >
                                            <i className="fas fa-download"></i> Download
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center flex flex-col items-center justify-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <i className="fas fa-search text-3xl text-slate-300"></i>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">No content found</h3>
                    <p className="text-slate-500 text-sm max-w-md mx-auto">
                        We couldn't find any content matching your search criteria. Try adjusting your filters or search term.
                    </p>
                    <button 
                        onClick={() => { setSearchQuery(''); setActiveCategory('All'); setActiveType('All'); }}
                        className="mt-6 px-6 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm"
                    >
                        Clear Filters
                    </button>
                </div>
            )}

            {/* Preview Modal */}
            {previewItem && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/90 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-slide-up">
                        
                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-slate-100 bg-white">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                                        {previewItem.category}
                                    </span>
                                    {previewItem.size && (
                                        <span className="text-slate-400 text-xs font-medium">• {previewItem.size}</span>
                                    )}
                                </div>
                                <h3 className="font-bold text-slate-800 text-lg sm:text-xl line-clamp-1">{previewItem.title}</h3>
                            </div>
                            <button 
                                onClick={() => setPreviewItem(null)} 
                                className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors flex-shrink-0"
                            >
                                <i className="fas fa-times text-lg"></i>
                            </button>
                        </div>

                        {/* Modal Content Area */}
                        <div className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 flex flex-col">
                            
                            {/* Media Viewer */}
                            <div className="bg-black rounded-2xl overflow-hidden shadow-inner flex items-center justify-center min-h-[300px] sm:min-h-[400px] relative">
                                {previewItem.type === 'video' && (
                                    <video 
                                        src={previewItem.url} 
                                        controls 
                                        autoPlay 
                                        className="w-full h-full max-h-[60vh] object-contain"
                                        poster={previewItem.thumbnailUrl}
                                    >
                                        Your browser does not support the video tag.
                                    </video>
                                )}
                                
                                {previewItem.type === 'image' && (
                                    <img 
                                        src={previewItem.url} 
                                        alt={previewItem.title} 
                                        className="w-full h-full max-h-[60vh] object-contain"
                                        referrerPolicy="no-referrer"
                                    />
                                )}

                                {previewItem.type === 'document' && (
                                    <div className="w-full h-full bg-slate-100 p-6 sm:p-10 flex flex-col items-center justify-center text-center">
                                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-md mb-6">
                                            <i className="fas fa-file-pdf text-5xl text-rose-500"></i>
                                        </div>
                                        <h4 className="text-xl font-bold text-slate-800 mb-2">{previewItem.title}</h4>
                                        <p className="text-slate-500 mb-6 max-w-md">This document is available for download. Click the download button below to save it to your device.</p>
                                        <button 
                                            onClick={(e) => handleDownload(previewItem, e)}
                                            className="px-8 py-3 bg-[#02275A] text-white font-bold rounded-xl hover:bg-[#033b8a] transition-colors shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
                                        >
                                            <i className="fas fa-download"></i> Download Document
                                        </button>
                                    </div>
                                )}

                                {previewItem.type === 'text' && (
                                    <div className="w-full h-full bg-white p-6 sm:p-10 overflow-y-auto">
                                        <div className="max-w-2xl mx-auto">
                                            <pre className="whitespace-pre-wrap font-sans text-slate-700 text-sm sm:text-base leading-relaxed">
                                                {previewItem.textContent}
                                            </pre>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            <div className="mt-6 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                <h4 className="text-sm font-bold text-slate-800 mb-2">About this content</h4>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    {previewItem.description}
                                </p>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 sm:p-6 bg-white border-t border-slate-100 flex flex-col sm:flex-row gap-3 justify-end items-center">
                            <button 
                                onClick={() => setPreviewItem(null)}
                                className="w-full sm:w-auto px-6 py-3 bg-slate-50 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-colors"
                            >
                                Close
                            </button>
                            
                            {previewItem.type === 'text' ? (
                                <button 
                                    onClick={() => handleCopyText(previewItem.textContent || '')}
                                    className="w-full sm:w-auto px-8 py-3 bg-[#02275A] text-white font-bold rounded-xl hover:bg-[#033b8a] transition-colors shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
                                >
                                    <i className="fas fa-copy"></i> Copy to Clipboard
                                </button>
                            ) : (
                                <button 
                                    onClick={(e) => handleDownload(previewItem, e)}
                                    className="w-full sm:w-auto px-8 py-3 bg-[#02275A] text-white font-bold rounded-xl hover:bg-[#033b8a] transition-colors shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
                                >
                                    <i className="fas fa-download"></i> Download {previewItem.type === 'video' ? 'Video' : previewItem.type === 'document' ? 'Document' : 'Image'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContentHubView;
