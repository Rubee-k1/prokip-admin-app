import React, { useState } from 'react';
import { useAlert } from '../contexts/AlertContext';
import { ContentItem, KBModule, QuizQuestion } from '../types';
import { CATEGORIES } from './ContentHubView';
import LandingPagesView from '../LandingPagesView';

interface AdminResourceCenterViewProps {
    contentItems: ContentItem[];
    setContentItems: React.Dispatch<React.SetStateAction<ContentItem[]>>;
    kbModules: KBModule[];
    setKbModules: React.Dispatch<React.SetStateAction<KBModule[]>>;
    userRole?: string;
}

const AdminResourceCenterView: React.FC<AdminResourceCenterViewProps> = ({ contentItems, setContentItems, kbModules, setKbModules, userRole }) => {
    const { showSuccess, showError } = useAlert();
    const [viewTab, setViewTab] = useState<'content' | 'kb' | 'landing_pages'>(userRole === 'call-agent' ? 'landing_pages' : 'content');

    // Content Modal State
    const [isAddContentModalOpen, setIsAddContentModalOpen] = useState(false);
    const [editingContentItem, setEditingContentItem] = useState<ContentItem | null>(null);
    const [cTitle, setCTitle] = useState('');
    const [cDescription, setCDescription] = useState('');
    const [cType, setCType] = useState<ContentItem['type']>('video');
    const [cCategory, setCCategory] = useState<ContentItem['category']>('Videos');
    const [cUrl, setCUrl] = useState('');
    const [cThumbnailUrl, setCThumbnailUrl] = useState('');
    const [cSize, setCSize] = useState('');
    const [cDuration, setCDuration] = useState('');
    const [cTextContent, setCTextContent] = useState('');

    // KB Modal State
    const [isAddKbModalOpen, setIsAddKbModalOpen] = useState(false);
    const [editingKbItem, setEditingKbItem] = useState<KBModule | null>(null);
    const [kbTitle, setKbTitle] = useState('');
    const [kbDescription, setKbDescription] = useState('');
    const [kbType, setKbType] = useState<'Video' | 'Article'>('Video');
    const [kbUrl, setKbUrl] = useState('');
    const [kbDuration, setKbDuration] = useState('');
    const [kbTextContent, setKbTextContent] = useState('');
    const [kbQuiz, setKbQuiz] = useState<QuizQuestion[]>([]);

    // Content Handlers
    const openAddContentModal = () => {
        setEditingContentItem(null);
        setCTitle(''); setCDescription(''); setCType('video'); setCCategory('Videos'); setCUrl(''); 
        setCThumbnailUrl(''); setCSize(''); setCDuration(''); setCTextContent('');
        setIsAddContentModalOpen(true);
    };

    const openEditContentModal = (item: ContentItem) => {
        setEditingContentItem(item);
        setCTitle(item.title); setCDescription(item.description); setCType(item.type); setCCategory(item.category);
        setCUrl(item.url); setCThumbnailUrl(item.thumbnailUrl || ''); setCSize(item.size || ''); 
        setCDuration(item.duration || ''); setCTextContent(item.textContent || '');
        setIsAddContentModalOpen(true);
    };

    const handleDeleteContent = (id: string) => {
        if (window.confirm("Are you sure you want to delete this marketing content?")) {
            setContentItems(prev => prev.filter(c => c.id !== id));
            showSuccess("Content deleted successfully");
        }
    };

    const handleSaveContent = (e: React.FormEvent) => {
        e.preventDefault();
        if (cType !== 'text' && !cUrl) {
            showError("Cloudflare R2 URL is required for media types.");
            return;
        }
        if (cType === 'text' && !cTextContent) {
            showError("Text content is required for text types.");
            return;
        }

        const payload: ContentItem = {
            id: editingContentItem ? editingContentItem.id : Math.random().toString(36).substr(2, 9),
            title: cTitle, description: cDescription, type: cType, category: cCategory, url: cUrl,
            thumbnailUrl: cThumbnailUrl, size: cSize, duration: cDuration, textContent: cTextContent
        };

        if (editingContentItem) {
            setContentItems(prev => prev.map(c => c.id === editingContentItem.id ? payload : c));
            showSuccess("Content updated successfully");
        } else {
            setContentItems([payload, ...contentItems]);
            showSuccess("Content added successfully");
        }
        setIsAddContentModalOpen(false);
    };

    // KB Handlers
    const openAddKbModal = () => {
        setEditingKbItem(null);
        setKbTitle(''); setKbDescription(''); setKbType('Video'); setKbUrl(''); 
        setKbDuration(''); setKbTextContent(''); setKbQuiz([]);
        setIsAddKbModalOpen(true);
    };

    const openEditKbModal = (item: KBModule) => {
        setEditingKbItem(item);
        setKbTitle(item.title); setKbDescription(item.description); setKbType(item.type);
        setKbUrl(item.url || ''); setKbDuration(item.duration || ''); setKbTextContent(item.textContent || '');
        setKbQuiz(item.quiz || []);
        setIsAddKbModalOpen(true);
    };

    const handleDeleteKb = (id: string) => {
        if (window.confirm("Are you sure you want to delete this Knowledge Base module?")) {
            setKbModules(prev => prev.filter(k => k.id !== id));
            showSuccess("Module deleted successfully");
        }
    };

    const handleAddKbQuizQuestion = () => {
        setKbQuiz([...kbQuiz, {
            id: Math.random().toString(36).substr(2, 9),
            question: '',
            options: ['', '', '', ''],
            correctIndex: 0
        }]);
    };

    const handleRemoveKbQuizQuestion = (qId: string) => {
        setKbQuiz(kbQuiz.filter(q => q.id !== qId));
    };

    const handleKbQuizChange = (qId: string, field: 'question' | 'correctIndex', value: string | number) => {
        setKbQuiz(kbQuiz.map(q => q.id === qId ? { ...q, [field]: value } : q));
    };

    const handleKbQuizOptionChange = (qId: string, optIndex: number, value: string) => {
        setKbQuiz(kbQuiz.map(q => {
            if (q.id === qId) {
                const newOpts = [...q.options];
                newOpts[optIndex] = value;
                return { ...q, options: newOpts };
            }
            return q;
        }));
    };

    const handleSaveKb = (e: React.FormEvent) => {
        e.preventDefault();
        if (kbType === 'Video' && !kbUrl.includes('youtube')) {
            showError("YouTube URL is highly recommended for Video modules.");
        }
        if (kbType === 'Article' && !kbTextContent) {
            showError("Article content cannot be empty.");
            return;
        }

        const payload: KBModule = {
            id: editingKbItem ? editingKbItem.id : Math.random().toString(36).substr(2, 9),
            title: kbTitle, description: kbDescription, type: kbType, url: kbUrl, 
            duration: kbDuration, textContent: kbTextContent, quiz: kbQuiz, status: 'Locked' // Defaults to locked maybe? We don't render status in admin anyway
        };

        if (editingKbItem) {
            setKbModules(prev => prev.map(k => k.id === editingKbItem.id ? payload : k));
            showSuccess("Module updated successfully");
        } else {
            setKbModules([payload, ...kbModules]);
            showSuccess("Module added successfully");
        }
        setIsAddKbModalOpen(false);
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in pb-24">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Resource Center</h1>
                        <p className="text-sm text-slate-500 mt-1">Manage marketing materials and agent training modules.</p>
                    </div>
                </div>
                
                {/* Tabs */}
                <div className="flex gap-4 mt-6 border-b border-slate-200">
                    <button 
                        onClick={() => setViewTab('content')}
                        className={`py-3 px-4 text-sm font-bold border-b-2 transition-colors ${viewTab === 'content' ? 'border-[#02275A] text-[#02275A]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        <i className="fas fa-bullhorn mr-2"></i> Marketing Content
                    </button>
                    <button 
                        onClick={() => setViewTab('kb')}
                        className={`py-3 px-4 text-sm font-bold border-b-2 transition-colors ${viewTab === 'kb' ? 'border-[#02275A] text-[#02275A]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        <i className="fas fa-graduation-cap mr-2"></i> Knowledge Base
                    </button>
                    <button 
                        onClick={() => setViewTab('landing_pages')}
                        className={`py-3 px-4 text-sm font-bold border-b-2 transition-colors ${viewTab === 'landing_pages' ? 'border-[#02275A] text-[#02275A]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        <i className="fas fa-magic mr-2"></i> Landing Pages
                    </button>
                </div>
            </div>

            {/* TAB: CONTENT HUB */}
            {viewTab === 'content' && (
                <div className="space-y-4 animate-fade-in">
                    {userRole !== 'call-agent' && (
                        <div className="flex justify-end">
                            <button onClick={openAddContentModal} className="px-5 py-2.5 bg-[#02275A] text-white font-bold rounded-xl hover:bg-[#033b8a] transition-colors shadow-md shadow-blue-900/20 flex items-center gap-2">
                                <i className="fas fa-plus"></i> Add Marketing Content
                            </button>
                        </div>
                    )}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-medium">
                                <tr>
                                    <th className="px-6 py-4">Title</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {contentItems.map(item => (
                                    <tr key={item.id} className="hover:bg-slate-50/50">
                                        <td className="px-6 py-4 font-medium text-slate-800"><div className="line-clamp-1">{item.title}</div></td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">{item.category}</span>
                                        </td>
                                        <td className="px-6 py-4 capitalize">{item.type}</td>
                                        <td className="px-6 py-4 text-right space-x-3">
                                            {userRole === 'call-agent' ? (
                                                <button onClick={() => openEditContentModal(item)} className="text-[#02275A] hover:text-[#033b8a] font-medium"><i className="fas fa-eye mr-1"></i>View</button>
                                            ) : (
                                                <>
                                                    <button onClick={() => openEditContentModal(item)} className="text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                                                    <button onClick={() => handleDeleteContent(item.id)} className="text-rose-600 hover:text-rose-800 font-medium">Delete</button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB: KNOWLEDGE BASE */}
            {viewTab === 'kb' && (
                <div className="space-y-4 animate-fade-in">
                    {userRole !== 'call-agent' && (
                        <div className="flex justify-end">
                            <button onClick={openAddKbModal} className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-900/20 flex items-center gap-2">
                                <i className="fas fa-plus"></i> Add KB Module
                            </button>
                        </div>
                    )}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-medium">
                                <tr>
                                    <th className="px-6 py-4">Module Title</th>
                                    <th className="px-6 py-4">Format</th>
                                    <th className="px-6 py-4">Duration</th>
                                    <th className="px-6 py-4 text-center">Quiz Attached?</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {kbModules.map(item => (
                                    <tr key={item.id} className="hover:bg-slate-50/50">
                                        <td className="px-6 py-4 font-medium text-slate-800"><div className="line-clamp-1">{item.title}</div></td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.type === 'Video' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-700'}`}>
                                                <i className={`fas ${item.type === 'Video' ? 'fa-play' : 'fa-file-alt'} mr-1.5`}></i> {item.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{item.duration}</td>
                                        <td className="px-6 py-4 text-center">
                                            {item.quiz && item.quiz.length > 0 ? (
                                                <span className="text-emerald-500 font-bold"><i className="fas fa-check-circle mr-1"></i> {item.quiz.length} Qs</span>
                                            ) : (
                                                <span className="text-slate-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-3">
                                            {userRole === 'call-agent' ? (
                                                <button onClick={() => openEditKbModal(item)} className="text-[#02275A] hover:text-[#033b8a] font-medium"><i className="fas fa-eye mr-1"></i>View</button>
                                            ) : (
                                                <>
                                                    <button onClick={() => openEditKbModal(item)} className="text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                                                    <button onClick={() => handleDeleteKb(item.id)} className="text-rose-600 hover:text-rose-800 font-medium">Delete</button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {viewTab === 'landing_pages' && (
                <LandingPagesView userRole={userRole} />
            )}

            {/* --- MODALS BELOW --- */}

            {/* CONTENT MODAL */}
            {isAddContentModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm z-[100] animate-fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-2xl shadow-xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h2 className="text-xl font-bold text-slate-800">
                                {userRole === 'call-agent' ? 'Marketing Content Details' : (editingContentItem ? 'Edit Marketing Content' : 'Add New Content')}
                            </h2>
                            <button onClick={() => setIsAddContentModalOpen(false)} className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 hover:text-slate-700 shadow-sm"><i className="fas fa-times"></i></button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <form id="contentForm" onSubmit={handleSaveContent} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Title *</label>
                                        <input type="text" required disabled={userRole === 'call-agent'} value={cTitle} onChange={(e) => setCTitle(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#02275A] focus:ring-1 focus:ring-[#02275A]" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Description *</label>
                                        <textarea required disabled={userRole === 'call-agent'} value={cDescription} onChange={(e) => setCDescription(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#02275A] focus:ring-1 focus:ring-[#02275A] min-h-[80px]" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Content Type *</label>
                                        <select disabled={userRole === 'call-agent'} value={cType} onChange={(e) => setCType(e.target.value as any)} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#02275A] focus:ring-1 focus:ring-[#02275A]">
                                            <option value="video">Video</option>
                                            <option value="image">Image (Flyer/Ad)</option>
                                            <option value="text">Text / Copy</option>
                                            <option value="document">Document (PDF/Deck)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Category *</label>
                                        <select disabled={userRole === 'call-agent'} value={cCategory} onChange={(e) => setCCategory(e.target.value as any)} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#02275A] focus:ring-1 focus:ring-[#02275A]">
                                            {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    {cType !== 'text' && (
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Cloudflare R2 URL *</label>
                                            <input type="url" required={cType !== 'text'} disabled={userRole === 'call-agent'} value={cUrl} onChange={(e) => setCUrl(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#02275A] focus:ring-1 focus:ring-[#02275A]" />
                                        </div>
                                    )}
                                    {cType === 'text' && (
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Text Content *</label>
                                            <textarea required={cType === 'text'} disabled={userRole === 'call-agent'} value={cTextContent} onChange={(e) => setCTextContent(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#02275A] focus:ring-1 focus:ring-[#02275A] min-h-[150px]" />
                                        </div>
                                    )}
                                    {cType !== 'text' && (
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Thumbnail URL</label>
                                            <input type="url" disabled={userRole === 'call-agent'} value={cThumbnailUrl} onChange={(e) => setCThumbnailUrl(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#02275A] focus:ring-1 focus:ring-[#02275A]" />
                                        </div>
                                    )}
                                    {cType !== 'text' && (
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">File Size</label>
                                            <input type="text" disabled={userRole === 'call-agent'} value={cSize} onChange={(e) => setCSize(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#02275A] focus:ring-1 focus:ring-[#02275A]" />
                                        </div>
                                    )}
                                    {cType === 'video' && (
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Duration</label>
                                            <input type="text" disabled={userRole === 'call-agent'} value={cDuration} onChange={(e) => setCDuration(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#02275A] focus:ring-1 focus:ring-[#02275A]" />
                                        </div>
                                    )}
                                </div>
                            </form>
                        </div>
                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 mt-auto">
                            {userRole === 'call-agent' ? (
                                <div className="flex justify-end gap-3 w-full">
                                    {cType === 'text' ? (
                                        <button type="button" onClick={() => { navigator.clipboard.writeText(cTextContent); showSuccess('Text copied to clipboard!'); }} className="px-5 py-2.5 bg-[#02275A] text-white font-bold rounded-xl hover:bg-[#033b8a] shadow-md shadow-blue-900/10 flex items-center gap-2">
                                            <i className="fas fa-copy"></i> Copy Text
                                        </button>
                                    ) : (
                                        cUrl && cUrl !== '#' && (
                                            <button type="button" onClick={() => window.open(cUrl, '_blank')} className="px-5 py-2.5 bg-[#02275A] text-white font-bold rounded-xl hover:bg-[#033b8a] shadow-md shadow-blue-900/10 flex items-center gap-2">
                                                <i className="fas fa-external-link-alt"></i> Open Content
                                            </button>
                                        )
                                    )}
                                    <button type="button" onClick={() => setIsAddContentModalOpen(false)} className="px-5 py-2.5 bg-white text-slate-700 font-bold rounded-xl border border-slate-200 hover:bg-slate-50">Close</button>
                                </div>
                            ) : (
                                <>
                                    <button type="button" onClick={() => setIsAddContentModalOpen(false)} className="px-5 py-2.5 bg-white text-slate-700 font-bold rounded-xl border border-slate-200 hover:bg-slate-50">Cancel</button>
                                    <button type="submit" form="contentForm" className="px-5 py-2.5 bg-[#02275A] text-white font-bold rounded-xl hover:bg-[#033b8a] shadow-md shadow-blue-900/20">Save Content</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* KB MODAL */}
            {isAddKbModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm z-[100] animate-fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-3xl shadow-xl overflow-hidden animate-slide-up flex flex-col max-h-[95vh]">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h2 className="text-xl font-bold text-slate-800">
                                {userRole === 'call-agent' ? 'Knowledge Base Module Details' : (editingKbItem ? 'Edit KB Module' : 'Add New KB Module')}
                            </h2>
                            <button onClick={() => setIsAddKbModalOpen(false)} className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 hover:text-slate-700 shadow-sm"><i className="fas fa-times"></i></button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <form id="kbForm" onSubmit={handleSaveKb} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Module Title *</label>
                                        <input type="text" required disabled={userRole === 'call-agent'} value={kbTitle} onChange={(e) => setKbTitle(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Description *</label>
                                        <textarea required disabled={userRole === 'call-agent'} value={kbDescription} onChange={(e) => setKbDescription(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 min-h-[80px]" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Module Format *</label>
                                        <select disabled={userRole === 'call-agent'} value={kbType} onChange={(e) => setKbType(e.target.value as any)} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600">
                                            <option value="Video">Video (YouTube)</option>
                                            <option value="Article">Article (Text/Rich)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Estimated Duration</label>
                                        <input type="text" disabled={userRole === 'call-agent'} value={kbDuration} onChange={(e) => setKbDuration(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600" placeholder="e.g. 15 min" />
                                    </div>
                                    
                                    {kbType === 'Video' ? (
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold text-slate-700 mb-1">YouTube Embedded URL *</label>
                                            <input type="url" required disabled={userRole === 'call-agent'} value={kbUrl} onChange={(e) => setKbUrl(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600" placeholder="https://www.youtube.com/embed/..." />
                                            <p className="text-xs text-slate-500 mt-1">Must be an embeddable YouTube URL</p>
                                        </div>
                                    ) : (
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Article Content *</label>
                                            <textarea required disabled={userRole === 'call-agent'} value={kbTextContent} onChange={(e) => setKbTextContent(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 min-h-[150px]" />
                                        </div>
                                    )}
                                </div>

                                {/* Quiz Construction Area */}
                                <div className="mt-8 pt-6 border-t border-slate-200">
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-800">Module Quiz (Optional)</h3>
                                            <p className="text-xs text-slate-500">Add questions to test agent knowledge after learning.</p>
                                        </div>
                                        {userRole !== 'call-agent' && (
                                            <button type="button" onClick={handleAddKbQuizQuestion} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 text-sm flex items-center gap-2">
                                                <i className="fas fa-plus"></i> Add Question
                                            </button>
                                        )}
                                    </div>
                                    
                                    <div className="space-y-6">
                                        {kbQuiz.map((q, i) => (
                                            <div key={q.id} className="bg-slate-50 p-5 rounded-xl border border-slate-200 relative group">
                                                {userRole !== 'call-agent' && (
                                                    <button type="button" onClick={() => handleRemoveKbQuizQuestion(q.id)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors">
                                                        <i className="fas fa-trash text-sm"></i>
                                                    </button>
                                                )}
                                                <div className="mb-4 pr-10">
                                                    <label className="block text-sm font-bold text-slate-700 mb-1">Question {i + 1}</label>
                                                    <input type="text" required disabled={userRole === 'call-agent'} value={q.question} onChange={(e) => handleKbQuizChange(q.id, 'question', e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600" placeholder="Enter question..." />
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {q.options.map((opt, optIdx) => (
                                                        <div key={optIdx} className="flex relative items-center">
                                                            <div className="absolute left-3">
                                                                <input 
                                                                    type="radio" 
                                                                    name={`correct-${q.id}`}
                                                                    disabled={userRole === 'call-agent'}
                                                                    checked={q.correctIndex === optIdx}
                                                                    onChange={() => handleKbQuizChange(q.id, 'correctIndex', optIdx)}
                                                                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-600 border-slate-300"
                                                                />
                                                            </div>
                                                            <input 
                                                                type="text" 
                                                                required 
                                                                disabled={userRole === 'call-agent'}
                                                                value={opt} 
                                                                onChange={(e) => handleKbQuizOptionChange(q.id, optIdx, e.target.value)} 
                                                                className={`w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none ${q.correctIndex === optIdx ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200'}`} 
                                                                placeholder={`Option ${optIdx + 1}`} 
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                                {userRole !== 'call-agent' && (
                                                    <p className="text-[10px] text-slate-400 mt-2 italic">Select the radio button next to the correct option.</p>
                                                )}
                                            </div>
                                        ))}
                                        {kbQuiz.length === 0 && (
                                            <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                                <p className="text-slate-500 text-sm">No quiz questions added yet.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 mt-auto">
                            {userRole === 'call-agent' ? (
                                <button type="button" onClick={() => setIsAddKbModalOpen(false)} className="px-5 py-2.5 bg-white text-slate-700 font-bold rounded-xl border border-slate-200 hover:bg-slate-50">Close</button>
                            ) : (
                                <>
                                    <button type="button" onClick={() => setIsAddKbModalOpen(false)} className="px-5 py-2.5 bg-white text-slate-700 font-bold rounded-xl border border-slate-200 hover:bg-slate-50">Cancel</button>
                                    <button type="submit" form="kbForm" className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-900/20">Save Module</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminResourceCenterView;
