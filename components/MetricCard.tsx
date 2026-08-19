import React from 'react';

interface MetricCardProps {
    icon: string;
    colorClass: string;
    title: string;
    value: string;
    subtext: React.ReactNode;
    onClick?: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({ icon, colorClass, title, value, subtext, onClick }) => {
    return (
        <div 
            onClick={onClick} 
            className={`bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col justify-between h-32 relative overflow-hidden transition-all hover:border-indigo-200 ${onClick ? 'cursor-pointer' : ''}`}
        >
            <div className={`absolute right-2 top-2 p-2 rounded-lg ${colorClass}`}>
                <i className={`fas ${icon}`}></i>
            </div>
            <div>
                <p className="text-xs text-slate-500 font-bold uppercase">{title}</p>
                <h3 className="text-3xl font-bold text-slate-800 mt-1">{value}</h3>
            </div>
            {subtext}
        </div>
    );
};

export default MetricCard;