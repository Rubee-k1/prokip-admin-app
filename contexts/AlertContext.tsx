import React, { createContext, useContext, useState, useCallback } from 'react';
import { Alert } from '../types';
import ToastContainer from '../components/ToastContainer';

interface AlertContextType {
    showAlert: (type: Alert['type'], message: string, duration?: number) => void;
    showSuccess: (message: string) => void;
    showError: (message: string) => void;
    showWarning: (message: string) => void;
    showInfo: (message: string) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [alerts, setAlerts] = useState<Alert[]>([]);

    const removeAlert = useCallback((id: string) => {
        setAlerts(prev => prev.filter(a => a.id !== id));
    }, []);

    const showAlert = useCallback((type: Alert['type'], message: string, duration = 4000) => {
        const id = Date.now().toString() + Math.random().toString();
        setAlerts(prev => [...prev, { id, type, message, duration }]);
        
        if (duration > 0) {
            setTimeout(() => {
                removeAlert(id);
            }, duration);
        }
    }, [removeAlert]);

    const showSuccess = (msg: string) => showAlert('success', msg);
    const showError = (msg: string) => showAlert('error', msg);
    const showWarning = (msg: string) => showAlert('warning', msg);
    const showInfo = (msg: string) => showAlert('info', msg);

    return (
        <AlertContext.Provider value={{ showAlert, showSuccess, showError, showWarning, showInfo }}>
            {children}
            <ToastContainer alerts={alerts} onClose={removeAlert} />
        </AlertContext.Provider>
    );
};

export const useAlert = () => {
    const context = useContext(AlertContext);
    if (!context) throw new Error('useAlert must be used within AlertProvider');
    return context;
};