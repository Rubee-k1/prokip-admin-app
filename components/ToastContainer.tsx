import React from 'react';
import { Alert } from '../types';

interface ToastContainerProps {
    alerts: Alert[];
    onClose: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ alerts, onClose }) => {
    return (
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
            {alerts.map(alert => (
                <div 
                    key={alert.id} 
                    className={`pointer-events-auto min-w-[300px] max-w-md p-4 rounded-xl shadow-lg border-l-4 transform transition-all animate-fade-in flex items-start gap-3 bg-white
                        ${alert.type === 'success' ? 'border-emerald-500 shadow-emerald-100' : 
                          alert.type === 'error' ? 'border-rose-500 shadow-rose-100' : 
                          alert.type === 'warning' ? 'border-amber-500 shadow-amber-100' : 'border-blue-500 shadow-blue-100'}`}
                >
                    <div className={`mt-0.5 text-lg ${
                        alert.type === 'success' ? 'text-emerald-500' : 
                        alert.type === 'error' ? 'text-rose-500' : 
                        alert.type === 'warning' ? 'text-amber-500' : 'text-blue-500'
                    }`}>
                        <i className={`fas ${
                            alert.type === 'success' ? 'fa-check-circle' : 
                            alert.type === 'error' ? 'fa-times-circle' : 
                            alert.type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'
                        }`}></i>
                    </div>
                    <div className="flex-1">
                        <h4 className={`text-sm font-bold ${
                            alert.type === 'success' ? 'text-emerald-800' : 
                            alert.type === 'error' ? 'text-rose-800' : 
                            alert.type === 'warning' ? 'text-amber-800' : 'text-blue-800'
                        }`}>
                            {alert.type === 'success' ? 'Success' : 
                             alert.type === 'error' ? 'Error' : 
                             alert.type === 'warning' ? 'Warning' : 'Info'}
                        </h4>
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed font-medium">{alert.message}</p>
                    </div>
                    <button onClick={() => onClose(alert.id)} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <i className="fas fa-times"></i>
                    </button>
                </div>
            ))}
        </div>
    );
};
export default ToastContainer;