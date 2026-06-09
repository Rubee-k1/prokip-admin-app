import React, { useState, useEffect, useRef } from 'react';
import { Business, Complaint, Attachment, Comment } from '../types';
import { useAlert } from '../contexts/AlertContext';

interface LogComplaintModalProps {
    isOpen: boolean;
    onClose: () => void;
    business: Business | null;
    complaints: Complaint[];
    onAddComplaint: (complaint: Complaint) => void;
    onUpdateComplaint: (complaint: Complaint) => void;
}

const LogComplaintModal: React.FC<LogComplaintModalProps> = ({ isOpen, onClose, business, complaints, onAddComplaint, onUpdateComplaint }) => {
    const { showError, showSuccess } = useAlert();
    if (!isOpen || !business) return null;

    const [view, setView] = useState<'list' | 'create' | 'detail'>('list');
    const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
    
    // New Ticket State
    const [newComplaint, setNewComplaint] = useState<Partial<Complaint>>({
        priority: 'Medium',
        category: 'Technical',
        status: 'Open'
    });
    const [createAttachments, setCreateAttachments] = useState<Attachment[]>([]);

    // Reply/Comment State
    const [replyText, setReplyText] = useState('');
    const [replyAttachments, setReplyAttachments] = useState<Attachment[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const replyFileInputRef = useRef<HTMLInputElement>(null);

    const businessComplaints = complaints.filter(c => c.businessId === business.id).sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime());

    // Reset view when modal opens
    useEffect(() => {
        if (isOpen) {
            setView('list');
            setNewComplaint({ priority: 'Medium', category: 'Technical', status: 'Open' });
            setCreateAttachments([]);
            setReplyText('');
            setReplyAttachments([]);
        }
    }, [isOpen]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, isReply: boolean = false) => {
        if (e.target.files && e.target.files.length > 0) {
            const filesArray = Array.from(e.target.files) as File[];
            const newAtts: Attachment[] = filesArray.map(file => ({
                id: Math.random().toString(36).substr(2, 9),
                name: file.name,
                type: file.type.startsWith('video') ? 'video' : 'image',
                url: URL.createObjectURL(file)
            }));

            if (isReply) {
                setReplyAttachments(prev => [...prev, ...newAtts]);
            } else {
                setCreateAttachments(prev => [...prev, ...newAtts]);
            }
        }
    };

    const removeAttachment = (id: string, isReply: boolean = false) => {
        if (isReply) {
            setReplyAttachments(prev => prev.filter(a => a.id !== id));
        } else {
            setCreateAttachments(prev => prev.filter(a => a.id !== id));
        }
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!navigator.onLine) {
            showError("Cannot submit ticket. No internet connection.");
            return;
        }

        const complaint: Complaint = {
            id: `TKT-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
            businessId: business.id,
            subject: newComplaint.subject || 'No Subject',
            priority: newComplaint.priority as any || 'Medium',
            category: newComplaint.category || 'Other',
            description: newComplaint.description || '',
            status: 'Open',
            dateCreated: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
            lastUpdated: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
            attachments: createAttachments,
            comments: []
        };
        onAddComplaint(complaint);
        setCreateAttachments([]);
        setView('list');
    };

    const handleStatusUpdate = (status: 'Open' | 'In Progress' | 'Resolved') => {
        if (!navigator.onLine) {
            showError("Cannot update ticket. No internet connection.");
            return;
        }

        if (selectedComplaint) {
            const systemComment: Comment = {
                id: Date.now().toString(),
                author: 'System',
                role: 'System',
                text: `Status updated to ${status}`,
                date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
            };

            const updated = { 
                ...selectedComplaint, 
                status, 
                lastUpdated: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
                comments: [systemComment, ...(selectedComplaint.comments || [])]
            };
            onUpdateComplaint(updated);
            setSelectedComplaint(updated);
        }
    };

    const handleSendReply = () => {
        if (!replyText.trim() && replyAttachments.length === 0) return;
        if (!selectedComplaint) return;

        const newComment: Comment = {
            id: Date.now().toString(),
            author: 'John Agent', // Mock current user
            role: 'Agent',
            text: replyText,
            date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
            attachments: replyAttachments
        };

        const updated = {
            ...selectedComplaint,
            lastUpdated: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
            comments: [newComment, ...(selectedComplaint.comments || [])]
        };

        onUpdateComplaint(updated);
        setSelectedComplaint(updated);
        setReplyText('');
        setReplyAttachments([]);
        showSuccess("Reply added successfully.");
    };

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'Open': return 'bg-rose-100 text-rose-700';
            case 'In Progress': return 'bg-blue-100 text-blue-700';
            case 'Resolved': return 'bg-emerald-100 text-emerald-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch(priority) {
            case 'Critical': return 'text-rose-600 font-bold';
            case 'High': return 'text-orange-600 font-bold';
            case 'Medium': return 'text-blue-600';
            default: return 'text-slate-500';
        }
    };

    const renderAttachments = (attachments: Attachment[], isReply: boolean = false, isPreview: boolean = false) => {
        if (!attachments || attachments.length === 0) return null;
        return (
            <div className="flex flex-wrap gap-2 mt-2">
                {attachments.map(att => (
                    <div key={att.id} className="relative group w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                        {att.type === 'image' ? (
                            <img src={att.url} alt="attachment" className="w-full h-full object-cover" />
                        ) : (
                            <i className="fas fa-play-circle text-2xl text-slate-400"></i>
                        )}
                        {isPreview && (
                            <button 
                                type="button"
                                onClick={() => removeAttachment(att.id, isReply)}
                                className="absolute top-0 right-0 bg-red-500 text-white w-5 h-5 flex items-center justify-center rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <i className="fas fa-times text-xs"></i>
                            </button>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col">
                {/* Header */}
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">Support Tickets</h3>
                        <p className="text-xs text-slate-500">Manage complaints for <span className="font-bold text-[#02275A]">{business.name}</span></p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors">
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                    
                    {/* LIST VIEW */}
                    {view === 'list' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-2">
                                <div className="text-xs font-bold text-slate-500 uppercase">Ticket History ({businessComplaints.length})</div>
                                <button 
                                    onClick={() => setView('create')} 
                                    className="px-4 py-2 bg-[#02275A] text-white text-xs font-bold rounded-lg hover:bg-[#02275A]/90 transition-colors flex items-center gap-2"
                                >
                                    <i className="fas fa-plus"></i> Log New Complaint
                                </button>
                            </div>

                            {businessComplaints.length > 0 ? (
                                <div className="border border-slate-200 rounded-xl overflow-hidden">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 border-b border-slate-100">
                                            <tr>
                                                <th className="p-4 font-bold text-slate-600">ID / Subject</th>
                                                <th className="p-4 font-bold text-slate-600">Category</th>
                                                <th className="p-4 font-bold text-slate-600">Priority</th>
                                                <th className="p-4 font-bold text-slate-600">Status</th>
                                                <th className="p-4 font-bold text-slate-600">Date</th>
                                                <th className="p-4 font-bold text-right text-slate-600">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {businessComplaints.map(ticket => (
                                                <tr key={ticket.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="p-4">
                                                        <div className="font-bold text-slate-800">{ticket.subject}</div>
                                                        <div className="text-xs text-slate-400 font-mono">{ticket.id}</div>
                                                    </td>
                                                    <td className="p-4 text-slate-600">{ticket.category}</td>
                                                    <td className={`p-4 text-xs ${getPriorityColor(ticket.priority)}`}>{ticket.priority}</td>
                                                    <td className="p-4">
                                                        <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${getStatusColor(ticket.status)}`}>
                                                            {ticket.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-slate-500 text-xs">{ticket.dateCreated}</td>
                                                    <td className="p-4 text-right">
                                                        <button 
                                                            onClick={() => { setSelectedComplaint(ticket); setView('detail'); }}
                                                            className="text-[#02275A] hover:bg-[#02275A]/10 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                                                        >
                                                            View
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    <div className="w-12 h-12 bg-slate-200 text-slate-400 rounded-full flex items-center justify-center text-xl mx-auto mb-3">
                                        <i className="fas fa-clipboard-check"></i>
                                    </div>
                                    <p className="text-slate-500 font-medium">No complaints logged yet.</p>
                                    <p className="text-xs text-slate-400 mt-1">Start by logging a new issue for this customer.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* CREATE VIEW */}
                    {view === 'create' && (
                        <div>
                            <button onClick={() => setView('list')} className="text-xs font-bold text-slate-500 hover:text-slate-800 mb-4 flex items-center gap-1">
                                <i className="fas fa-arrow-left"></i> Back to List
                            </button>
                            
                            <h4 className="text-lg font-bold text-slate-800 mb-6">Log New Complaint</h4>
                            
                            <form onSubmit={handleCreateSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Subject</label>
                                        <input 
                                            required 
                                            type="text" 
                                            className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#02275A]"
                                            placeholder="e.g., Cannot access inventory module"
                                            value={newComplaint.subject || ''}
                                            onChange={e => setNewComplaint({...newComplaint, subject: e.target.value})}
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Category</label>
                                        <select 
                                            className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#02275A]"
                                            value={newComplaint.category}
                                            onChange={e => setNewComplaint({...newComplaint, category: e.target.value})}
                                        >
                                            <option>Technical</option>
                                            <option>Billing</option>
                                            <option>Feature Request</option>
                                            <option>Other</option>
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Priority</label>
                                        <select 
                                            className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#02275A]"
                                            value={newComplaint.priority}
                                            onChange={e => setNewComplaint({...newComplaint, priority: e.target.value as any})}
                                        >
                                            <option>Low</option>
                                            <option>Medium</option>
                                            <option>High</option>
                                            <option>Critical</option>
                                        </select>
                                    </div>
                                    
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Description</label>
                                        <textarea 
                                            required 
                                            className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#02275A] min-h-[120px] resize-none"
                                            placeholder="Describe the issue in detail..."
                                            value={newComplaint.description || ''}
                                            onChange={e => setNewComplaint({...newComplaint, description: e.target.value})}
                                        ></textarea>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Attachments (Images/Videos)</label>
                                        <input 
                                            type="file" 
                                            multiple 
                                            accept="image/*,video/*" 
                                            className="hidden" 
                                            ref={fileInputRef}
                                            onChange={(e) => handleFileSelect(e, false)} 
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-slate-50 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                                        >
                                            <i className="fas fa-paperclip"></i> Add Files
                                        </button>
                                        {renderAttachments(createAttachments, false, true)}
                                    </div>
                                </div>
                                
                                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                                    <button 
                                        type="button" 
                                        onClick={() => setView('list')} 
                                        className="px-6 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-200"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="px-6 py-2.5 bg-[#02275A] text-white font-bold rounded-xl text-sm hover:bg-[#02275A]/90 shadow-md"
                                    >
                                        Submit Ticket
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* DETAIL VIEW */}
                    {view === 'detail' && selectedComplaint && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center mb-2">
                                <button onClick={() => setView('list')} className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1">
                                    <i className="fas fa-arrow-left"></i> Back to List
                                </button>
                                <div className="flex gap-2">
                                    {selectedComplaint.status !== 'Resolved' && (
                                        <button 
                                            onClick={() => handleStatusUpdate('Resolved')}
                                            className="px-3 py-1.5 bg-emerald-100 text-emerald-700 font-bold rounded-lg text-xs hover:bg-emerald-200 transition-colors"
                                        >
                                            <i className="fas fa-check mr-1"></i> Mark Resolved
                                        </button>
                                    )}
                                    {selectedComplaint.status === 'Resolved' && (
                                        <button 
                                            onClick={() => handleStatusUpdate('Open')}
                                            className="px-3 py-1.5 bg-slate-100 text-slate-700 font-bold rounded-lg text-xs hover:bg-slate-200 transition-colors"
                                        >
                                            <i className="fas fa-redo mr-1"></i> Reopen
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-800 mb-1">{selectedComplaint.subject}</h2>
                                        <div className="flex items-center gap-3 text-xs text-slate-500">
                                            <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">{selectedComplaint.id}</span>
                                            <span>•</span>
                                            <span>{selectedComplaint.dateCreated}</span>
                                        </div>
                                    </div>
                                    <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${getStatusColor(selectedComplaint.status)}`}>
                                        {selectedComplaint.status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6 border-y border-slate-50 py-4">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Category</p>
                                        <p className="text-sm font-semibold text-slate-700">{selectedComplaint.category}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Priority</p>
                                        <p className={`text-sm ${getPriorityColor(selectedComplaint.priority)}`}>{selectedComplaint.priority}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Description</p>
                                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{selectedComplaint.description}</p>
                                    {selectedComplaint.attachments && selectedComplaint.attachments.length > 0 && (
                                        <div className="mt-4">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Attachments</p>
                                            {renderAttachments(selectedComplaint.attachments)}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Activity Log / Comments */}
                            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                                <h4 className="font-bold text-slate-800 text-sm mb-4">Activity Log</h4>
                                <div className="space-y-6">
                                    {/* Latest Activity First */}
                                    {selectedComplaint.comments && selectedComplaint.comments.length > 0 ? (
                                        selectedComplaint.comments.map((comment) => (
                                            <div key={comment.id} className="flex gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${comment.role === 'System' ? 'bg-slate-200 text-slate-500' : 'bg-[#02275A] text-white'}`}>
                                                    {comment.role === 'System' ? <i className="fas fa-info"></i> : comment.author.charAt(0)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-sm font-bold text-slate-700">{comment.author}</span>
                                                        <span className="text-[10px] text-slate-400">{comment.date}</span>
                                                    </div>
                                                    <p className="text-xs text-slate-600 mt-1 whitespace-pre-wrap">{comment.text}</p>
                                                    {comment.attachments && renderAttachments(comment.attachments)}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-slate-400 italic">No comments yet.</p>
                                    )}
                                    
                                    {/* Initial Ticket Creation Activity */}
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[#02275A] text-white flex items-center justify-center text-xs font-bold shrink-0">JA</div>
                                        <div>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-sm font-bold text-slate-700">John Agent</span>
                                                <span className="text-[10px] text-slate-400">{selectedComplaint.dateCreated}</span>
                                            </div>
                                            <p className="text-xs text-slate-600 mt-1">Ticket created.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Reply Input */}
                                {selectedComplaint.status !== 'Resolved' && (
                                    <div className="mt-6 pt-4 border-t border-slate-200">
                                        <textarea
                                            className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#02275A] min-h-[80px] resize-none"
                                            placeholder="Write a reply..."
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                        ></textarea>
                                        
                                        {/* Reply Attachments Preview */}
                                        {renderAttachments(replyAttachments, true, true)}

                                        <div className="flex justify-between items-center mt-3">
                                            <div>
                                                <input 
                                                    type="file" 
                                                    multiple 
                                                    accept="image/*,video/*" 
                                                    className="hidden" 
                                                    ref={replyFileInputRef}
                                                    onChange={(e) => handleFileSelect(e, true)} 
                                                />
                                                <button 
                                                    type="button" 
                                                    onClick={() => replyFileInputRef.current?.click()}
                                                    className="text-slate-500 hover:text-[#02275A] text-xs font-bold flex items-center gap-2 px-2 py-1 rounded hover:bg-slate-200 transition-colors"
                                                >
                                                    <i className="fas fa-paperclip"></i> Attach Files
                                                </button>
                                            </div>
                                            <button 
                                                onClick={handleSendReply}
                                                className="px-4 py-2 bg-[#02275A] text-white text-xs font-bold rounded-lg hover:bg-[#02275A]/90 transition-colors"
                                            >
                                                Send Reply
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LogComplaintModal;