import React, { useState } from 'react';
import { Agent } from '../types';

interface ManagerAgentKycModalProps {
    agent: Agent;
    isOpen: boolean;
    onClose: () => void;
    onApprove: (agentId: string) => void;
    onReject: (agentId: string, reason: string) => void;
}

const ManagerAgentKycModal: React.FC<ManagerAgentKycModalProps> = ({ agent, isOpen, onClose, onApprove, onReject }) => {
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectInput, setShowRejectInput] = useState(false);

    if (!isOpen) return null;

    const handleReject = () => {
        if (showRejectInput) {
            if (rejectReason.trim()) {
                onReject(agent.id, rejectReason);
                setRejectReason('');
                setShowRejectInput(false);
            }
        } else {
            setShowRejectInput(true);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h3 className="font-bold text-lg text-slate-800">KYC Review: {agent.name}</h3>
                        <p className="text-xs text-slate-500">Submitted on {agent.kycSubmittedDate || 'N/A'}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase mb-1">Full Name</p>
                            <p className="font-bold text-slate-800">{agent.name}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase mb-1">Email Address</p>
                            <p className="font-bold text-slate-800">{agent.email}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase mb-1">Phone Number</p>
                            <p className="font-bold text-slate-800">{agent.phone}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase mb-1">State</p>
                            <p className="font-bold text-slate-800">{agent.state}</p>
                        </div>
                    </div>

                    <h4 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Submitted Documents</h4>
                    
                    {agent.documents ? (
                        <div className="space-y-6">
                            <div>
                                <p className="text-sm font-bold text-slate-700 mb-2">Government ID Card</p>
                                <div className="bg-slate-100 rounded-lg p-2 border border-slate-200">
                                    <img src={agent.documents.idCard} alt="ID Card" className="w-full h-auto rounded shadow-sm" />
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-700 mb-2">Utility Bill</p>
                                <div className="bg-slate-100 rounded-lg p-2 border border-slate-200">
                                    <img src={agent.documents.utilityBill} alt="Utility Bill" className="w-full h-auto rounded shadow-sm" />
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-700 mb-2">Passport Photograph</p>
                                <div className="bg-slate-100 rounded-lg p-2 border border-slate-200 w-48">
                                    <img src={agent.documents.photo} alt="Passport" className="w-full h-auto rounded shadow-sm" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                            <p className="text-slate-500">No documents available for review.</p>
                        </div>
                    )}

                    {showRejectInput && (
                        <div className="mt-6 animate-fade-in">
                            <label className="block text-xs font-bold text-rose-600 uppercase mb-2">Rejection Reason</label>
                            <textarea 
                                className="w-full p-3 bg-rose-50 border border-rose-200 rounded-xl text-sm focus:outline-none focus:border-rose-500 min-h-[80px]"
                                placeholder="Please explain why this KYC is being rejected..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                autoFocus
                            ></textarea>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-3">
                    <button 
                        onClick={onClose}
                        className="px-5 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-200 transition-colors"
                    >
                        Cancel
                    </button>
                    {!showRejectInput ? (
                        <>
                            <button 
                                onClick={handleReject}
                                className="px-5 py-2.5 bg-rose-50 text-rose-600 font-bold rounded-xl text-sm hover:bg-rose-100 border border-rose-200 transition-colors"
                            >
                                Reject KYC
                            </button>
                            <button 
                                onClick={() => onApprove(agent.id)}
                                className="px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-sm hover:bg-emerald-700 shadow-md transition-colors"
                            >
                                Approve Agent
                            </button>
                        </>
                    ) : (
                        <button 
                            onClick={handleReject}
                            disabled={!rejectReason.trim()}
                            className="px-5 py-2.5 bg-rose-600 text-white font-bold rounded-xl text-sm hover:bg-rose-700 shadow-md transition-colors disabled:opacity-50"
                        >
                            Confirm Rejection
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManagerAgentKycModal;
