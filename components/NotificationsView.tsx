import React, { useState } from 'react';
import { Notification } from '../types';

interface NotificationsViewProps {
    notifications: Notification[];
    markAsRead: (id: number) => void;
    markAllAsRead: () => void;
    setView: (view: string) => void;
}

const NotificationsView: React.FC<NotificationsViewProps> = ({ notifications, markAsRead, markAllAsRead, setView }) => {
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const selectedNotification = notifications.find(n => n.id === selectedId);

    const handleItemClick = (id: number) => {
        markAsRead(id);
        setSelectedId(id);
    };

    const handleActionClick = () => {
        if (selectedNotification && selectedNotification.actionLink) {
            setView(selectedNotification.actionLink);
        } else {
            alert("No specific action available for this notification.");
        }
    };

    if (selectedNotification) {
        return (
            <div className="max-w-4xl mx-auto px-4 md:px-12 py-6 animate-fade-in">
                <button 
                    onClick={() => setSelectedId(null)} 
                    className="mb-6 flex items-center gap-2 text-slate-500 hover:text-[#02275A] transition-colors font-bold text-sm bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm"
                >
                    <i className="fas fa-arrow-left"></i> Back to Notifications
                </button>
                
                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden relative">
                    {/* Status Bar */}
                    <div className={`h-1.5 w-full ${selectedNotification.type === 'success' ? 'bg-emerald-500' : selectedNotification.type === 'warning' ? 'bg-amber-500' : selectedNotification.type === 'alert' ? 'bg-rose-500' : 'bg-blue-500'}`}></div>
                    
                    <div className="p-6 md:p-10">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row items-start gap-5 mb-8">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-sm ${selectedNotification.type === 'success' ? 'bg-emerald-50 text-emerald-600' : selectedNotification.type === 'warning' ? 'bg-amber-50 text-amber-600' : selectedNotification.type === 'alert' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
                                <i className={`fas ${selectedNotification.type === 'success' ? 'fa-check-circle' : selectedNotification.type === 'warning' ? 'fa-exclamation-triangle' : selectedNotification.type === 'alert' ? 'fa-bell' : 'fa-info-circle'}`}></i>
                            </div>
                            <div className="flex-1">
                                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2 leading-tight">{selectedNotification.title}</h1>
                                <div className="flex items-center gap-3 text-sm text-slate-500">
                                    <span className="flex items-center gap-1"><i className="fas fa-clock"></i> {selectedNotification.time}</span>
                                    <span>•</span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${selectedNotification.type === 'success' ? 'bg-emerald-100 text-emerald-700' : selectedNotification.type === 'warning' ? 'bg-amber-100 text-amber-700' : selectedNotification.type === 'alert' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {selectedNotification.type}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-headings:text-slate-800">
                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 mb-6">
                                <p className="text-lg font-medium text-slate-700 leading-relaxed m-0">{selectedNotification.message}</p>
                            </div>
                            
                            <h3 className="text-lg font-bold mb-3">Additional Details</h3>
                            <p className="leading-relaxed">
                                {selectedNotification.details || "This notification requires your attention. Please review the details provided above and take necessary actions if applicable. System generated notifications are stored for 30 days."}
                            </p>
                            <p className="leading-relaxed mt-4">
                                If you believe this notification was sent in error, please contact support or ignore this message.
                            </p>
                        </div>
                    </div>

                    {/* Footer Actions */}
                     <div className="bg-slate-50 p-6 md:px-10 border-t border-slate-100 flex justify-end gap-3">
                        <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-100 text-sm transition-colors shadow-sm">
                            Mark as Unread
                        </button>
                        <button 
                            onClick={handleActionClick}
                            className="px-5 py-2.5 bg-[#02275A] text-white font-bold rounded-xl hover:bg-[#02275A]/90 text-sm transition-colors shadow-md flex items-center gap-2"
                        >
                            {selectedNotification.actionLink ? 'View Details' : 'Take Action'} <i className="fas fa-arrow-right"></i>
                        </button>
                     </div>
                </div>
            </div>
        );
    }

    // List View
    return (
        <div className="max-w-5xl mx-auto px-4 md:px-12 py-6 animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Notifications</h2>
                    <p className="text-sm text-slate-500">Stay updated with your latest activities</p>
                </div>
                <div className="flex gap-2">
                     <button onClick={markAllAsRead} className="text-xs font-bold text-[#02275A] hover:bg-[#02275A]/5 px-3 py-2 rounded-lg transition-colors">Mark all as read</button>
                     <button className="text-xs font-bold text-slate-500 hover:bg-slate-100 px-3 py-2 rounded-lg transition-colors"><i className="fas fa-cog"></i> Settings</button>
                </div>
            </div>
            
            <div className="space-y-3">
                {notifications.length > 0 ? (
                    notifications.map(note => (
                        <div 
                            key={note.id} 
                            onClick={() => handleItemClick(note.id)}
                            className={`bg-white p-5 rounded-xl border shadow-sm cursor-pointer hover:shadow-md transition-all group relative overflow-hidden flex items-start gap-4 ${!note.read ? 'border-l-4 border-l-[#02275A] border-y-slate-100 border-r-slate-100 bg-blue-50/20' : 'border-slate-100 hover:border-slate-200'}`}
                        >
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0 transition-colors ${note.type === 'success' ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100' : note.type === 'warning' ? 'bg-amber-50 text-amber-600 group-hover:bg-amber-100' : note.type === 'alert' ? 'bg-rose-50 text-rose-600 group-hover:bg-rose-100' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-100'}`}>
                                <i className={`fas ${note.type === 'success' ? 'fa-check-circle' : note.type === 'warning' ? 'fa-exclamation-circle' : note.type === 'alert' ? 'fa-bell' : 'fa-info-circle'}`}></i>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className={`font-bold text-base truncate pr-4 ${!note.read ? 'text-slate-900' : 'text-slate-600'}`}>{note.title}</h3>
                                    <span className="text-xs text-slate-400 whitespace-nowrap">{note.time}</span>
                                </div>
                                <p className={`text-sm line-clamp-2 ${!note.read ? 'text-slate-700 font-medium' : 'text-slate-500'}`}>{note.message}</p>
                            </div>

                            <div className="self-center opacity-0 group-hover:opacity-100 transition-opacity -mr-2">
                                <i className="fas fa-chevron-right text-slate-300"></i>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-slate-100 border-dashed">
                        <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center text-2xl mx-auto mb-3">
                            <i className="fas fa-bell-slash"></i>
                        </div>
                        <h3 className="text-slate-600 font-bold">No notifications yet</h3>
                        <p className="text-slate-400 text-sm">You're all caught up!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsView;