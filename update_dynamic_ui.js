const fs = require('fs');
let code = fs.readFileSync('components/AdminBroadcastsView.tsx', 'utf8');

const targetStr = `                                {selectedAudienceType === 'dynamic' && (
                                    <div className="space-y-4">
                                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                                            <i className="fas fa-info-circle text-blue-500 mt-0.5"></i>
                                            <div>
                                                <h4 className="font-bold text-sm text-blue-900">Dynamic Segment Builder</h4>
                                                <p className="text-xs text-blue-700 mt-1">Combine criteria to target specific sub-sections of your customers. The estimated audience size will update as you add rules.</p>
                                            </div>
                                        </div>

                                        <div className="border border-slate-200 rounded-xl bg-white overflow-hidden">
                                            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                                <span className="text-sm font-bold text-slate-700">Target customers matching <span className="text-[#02275A] underline underline-offset-2">ALL</span> of the following:</span>
                                            </div>`;

const replacement = `                                {selectedAudienceType === 'dynamic' && (
                                    <div className="space-y-6">
                                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                                            <i className="fas fa-info-circle text-blue-500 mt-0.5"></i>
                                            <div>
                                                <h4 className="font-bold text-sm text-blue-900">Dynamic Segments</h4>
                                                <p className="text-xs text-blue-700 mt-1">Select an existing dynamic segment or create custom rules to target specific sub-sections of your customers. The estimated audience size will update dynamically.</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <h4 className="font-bold text-slate-800 text-sm mb-2">Select Built Segment</h4>
                                            {[
                                                { id: 'recent_inactive', name: 'Recently Inactive (7 Days)', rulesText: 'Last Active Date > 7 Days ago', count: '~1,240' },
                                                { id: 'high_value', name: 'High Value Customers', rulesText: 'Total Sales Value > 1,000,000', count: '~850' },
                                                { id: 'custom', name: 'Custom Dynamic Segment', rulesText: 'Build your own criteria', count: 'Varies' }
                                            ].map(seg => (
                                                <label 
                                                    key={seg.id} 
                                                    className={\`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-all \${selectedDynamicPreset === seg.id ? 'border-[#02275A] bg-[#02275A]/5' : 'border-slate-200 bg-white hover:border-[#02275A]/50'}\`}
                                                    onClick={() => setSelectedDynamicPreset(seg.id)}
                                                >
                                                    <div className="mt-0.5">
                                                        <input 
                                                            type="radio" 
                                                            name="dynamic_preset" 
                                                            checked={selectedDynamicPreset === seg.id} 
                                                            onChange={() => setSelectedDynamicPreset(seg.id)}
                                                            className="w-4 h-4 text-[#02275A] focus:ring-[#02275A]" 
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between">
                                                            <h4 className="font-bold text-slate-800 text-sm">{seg.name}</h4>
                                                            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 rounded-full">{seg.count} recipients</span>
                                                        </div>
                                                        <p className="text-xs text-slate-500 mt-1">{seg.rulesText}</p>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>

                                        {selectedDynamicPreset === 'custom' && (
                                            <div className="border border-slate-200 rounded-xl bg-white overflow-hidden animate-fade-in">
                                                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                                    <span className="text-sm font-bold text-slate-700">Target customers matching <span className="text-[#02275A] underline underline-offset-2">ALL</span> of the following:</span>
                                                </div>`;

code = code.replace(targetStr, replacement);
fs.writeFileSync('components/AdminBroadcastsView.tsx', code);
