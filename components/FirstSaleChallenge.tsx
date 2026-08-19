
import React, { useState } from 'react';

const FirstSaleChallenge: React.FC = () => {
    // Mock Data
    const daysRemaining = 13;
    const isCritical = daysRemaining <= 3;
    
    // Earnings Calculator Scenarios
    const scenarios = [
        { sale: 100000, comm: 60000, total: 80000 },
        { sale: 150000, comm: 90000, total: 110000 },
        { sale: 180000, comm: 108000, total: 128000 },
    ];
    
    const [activeScenario, setActiveScenario] = useState(0);

    return (
        <div className="bg-gradient-to-br from-[#011530] to-black rounded-2xl p-6 text-white shadow-xl shadow-black/20 mb-8 relative overflow-hidden group animate-fade-in border border-[#02275A]/50">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-stretch">
                
                {/* Left: Challenge Status & Timer */}
                <div className="flex-1 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-yellow-400 text-[#011530] p-2 rounded-lg text-lg shadow-lg shadow-yellow-400/20">
                                <i className="fas fa-trophy"></i>
                            </div>
                            <div>
                                <h3 className="font-extrabold text-xl tracking-tight text-white">First Sale Challenge</h3>
                                <p className="text-blue-200 text-xs font-medium">Activate your account rewards</p>
                            </div>
                        </div>
                        
                        <p className="text-sm text-blue-100/80 mb-6 leading-relaxed max-w-md">
                            Complete your first sale within <span className="text-yellow-300 font-bold">14 days</span> to unlock the ₦20,000 Bonus, 60% Commission, and your Official Starter Kit.
                        </p>
                    </div>

                    {/* Timeline Tracker */}
                    <div className="bg-black/40 rounded-xl p-4 border border-white/5 backdrop-blur-sm">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                <i className="far fa-clock text-yellow-400"></i> Time Remaining
                            </span>
                            <span className={`text-xs font-bold px-2 py-1 rounded ${isCritical ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                                {daysRemaining} Days Left
                            </span>
                        </div>
                        <div className="relative h-2.5 bg-blue-900/30 rounded-full overflow-hidden">
                            <div 
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.4)] transition-all duration-1000"
                                style={{ width: `${(1 - (daysRemaining / 14)) * 100}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between mt-2 text-[10px] text-blue-400 font-medium">
                            <span>Day 1</span>
                            <span>Day 7</span>
                            <span>Day 14 (Deadline)</span>
                        </div>
                    </div>
                </div>

                {/* Right: Interactive Earnings Calculator */}
                <div className="lg:w-[400px] bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-1 flex flex-col">
                    <div className="p-3 border-b border-white/5">
                        <p className="text-xs font-bold text-center text-blue-200 uppercase tracking-widest">See What You Can Earn</p>
                    </div>
                    
                    <div className="flex-1 p-4 flex flex-col justify-center">
                        <div className="flex justify-between mb-4 bg-black/40 p-1 rounded-lg">
                            {scenarios.map((s, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveScenario(idx)}
                                    className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${activeScenario === idx ? 'bg-yellow-400 text-[#011530] shadow-sm' : 'text-blue-300 hover:text-white hover:bg-white/5'}`}
                                >
                                    Sell ₦{(s.sale/1000)}k
                                </button>
                            ))}
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-blue-200">60% Commission</span>
                                <span className="font-bold font-mono">₦{scenarios[activeScenario].comm.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-blue-200 flex items-center gap-1"><i className="fas fa-gift text-yellow-400"></i> Welcome Bonus</span>
                                <span className="font-bold font-mono text-yellow-300">+ ₦20,000</span>
                            </div>
                            <div className="h-px bg-white/10 my-1"></div>
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-white text-sm uppercase">Total Payout</span>
                                <span className="font-extrabold text-2xl text-emerald-400">₦{scenarios[activeScenario].total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-black/40 p-3 rounded-b-lg flex items-center justify-between gap-2 mt-auto">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-blue-300">Plus:</span>
                            <span className="text-[10px] font-bold text-white bg-white/10 px-2 py-0.5 rounded border border-white/10">👕 T-Shirt</span>
                            <span className="text-[10px] font-bold text-white bg-white/10 px-2 py-0.5 rounded border border-white/10">🆔 ID Card</span>
                        </div>
                        <button className="text-[10px] font-bold bg-white text-[#011530] px-3 py-1.5 rounded hover:bg-blue-50 transition-colors">
                            Start Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FirstSaleChallenge;
